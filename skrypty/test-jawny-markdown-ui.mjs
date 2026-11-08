import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'};
function serve(dir,port){const base=path.resolve(dir);const server=createServer(async(req,res)=>{try{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/Web-Core/,'');let file=path.resolve(base,'.'+rel);if(!file.startsWith(base+path.sep)&&file!==base)throw Error();const stat=await fs.stat(file);if(stat.isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});return new Promise(resolve=>server.listen(port,'127.0.0.1',()=>resolve(server)));}
const server=await serve('dist',4182);
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const report=[];await fs.mkdir('.test-jawne/screenshots',{recursive:true});
try{
 for(const [width,height]of [[1440,1000],[390,844]])for(const lang of ['pl','en']){
  const ctx=await browser.newContext({viewport:{width,height}});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const suffix of ['matematyka','isim','siad','szkola-doktorska','matematyka/analiza-danych','matematyka/matematyka-aktuarialno-finansowa','matematyka/matematyka-nauczycielska','matematyka/matematyka-stosowana','matematyka/matematyka-teoretyczna']){
   await page.goto(`http://127.0.0.1:4182/Web-Core/${lang==='en'?'en/':''}studia/${suffix}/`,{waitUntil:'networkidle'});
   const body=page.locator('.z-pd-tresc');assert.ok((await body.innerText()).length>50,suffix+' empty');
   assert.equal(await body.locator('[data-blok],[data-wstawka]').count(),0,'unrendered directive');
   const tabs=body.locator('[role=tab]');
   for (const group of await body.locator('.tresc-taby[role=tablist]').all()) {
    const buttons=group.locator('[role=tab]'); const last=buttons.last();
    await last.click();assert.equal(await last.getAttribute('aria-selected'),'true');
    assert.equal(await page.locator('#'+await last.getAttribute('aria-controls')).isVisible(),true);
    await last.press('Home');assert.equal(await buttons.first().getAttribute('aria-selected'),'true');
    assert.equal(await page.locator('#'+await last.getAttribute('aria-controls')).isVisible(),false);
   }
   const faq=body.locator('details summary').first();if(await faq.count()){await faq.click();assert.equal(await faq.locator('..').getAttribute('open'),'');}
   const contacts=body.locator('.kontakty');if(suffix.includes('matematyka/'))assert.ok(await contacts.count()>0,'coordinator missing');
   if(suffix==='matematyka'||suffix==='matematyka/analiza-danych'){
    if (suffix === 'matematyka') { for (const id of ['przebieg','specjalnosci']) await body.locator('#'+id).screenshot({path:`.test-jawne/screenshots/${lang}-${width}-${id}.png`,style:'header { visibility: hidden !important; }'}); }
    await page.screenshot({path:`.test-jawne/screenshots/${lang}-${width}-${suffix.replaceAll('/','-')}.png`,fullPage:true});
   }
   report.push({lang,width,page:suffix,tabs:await tabs.count(),ok:true});
  }
  assert.deepEqual(errors,[]);await ctx.close();
 }
 await fs.writeFile('.test-jawne/ui.json',JSON.stringify(report,null,2));console.log(`OK: ${report.length} widoków PL/EN, komputer/telefon; zakładki, pytania, wstawki i brak błędów JS.`);
}finally{await browser.close();server.close();}
