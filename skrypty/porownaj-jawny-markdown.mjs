import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';
const root=process.cwd();
function snapshot(html){
 const tree=parse(html);const walk=(n,fn)=>{fn(n);n.childNodes?.forEach(c=>walk(c,fn));};
 const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
 let main;walk(tree,n=>{if(n.tagName==='main'&&!main)main=n;if(attr(n,'class')?.split(' ').includes('z-pd-tresc'))main=n;});
 if(!main)return null;
 let text='',links=[],ids=[],classes={};
 walk(main,n=>{if(n.nodeName==='#text')text+=n.value+' ';if(n.tagName==='a')links.push(attr(n,'href'));if(n.tagName==='section')ids.push(attr(n,'id'));for(const c of (attr(n,'class')??'').split(' '))if(['dwa','etapy','kontakty','linki','pliki','faq','uwaga','tab','kier-prog','tresc-taby','kreski'].includes(c))classes[c]=(classes[c]??0)+1;});
 return {text:text.replace(/\s+/g,' ').trim(),links,ids,classes};
}
const files=[];
async function list(dir,prefix=''){for(const d of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,d.name),rel=path.join(prefix,d.name);if(d.isDirectory())await list(f,rel);else if(d.name==='index.html'&&(process.argv.includes('--wszystkie')||/(^|[\\/])studia[\\/](matematyka|isim|siad|szkola-doktorska)([\\/]|$)/.test(rel)))files.push(rel);}}
await list(path.join(root,'.test-jawne/baseline'));
const differences=[];
for(const f of files){const a=snapshot(await fs.readFile(path.join(root,'.test-jawne/baseline',f),'utf8')),b=snapshot(await fs.readFile(path.join(root,'dist',f),'utf8'));if(!a||!b)continue;
 const diff={file:f};for(const k of ['text','links','ids','classes'])if(JSON.stringify(a[k])!==JSON.stringify(b[k])){
  if(k==='text'){const i=[...a.text].findIndex((c,i)=>c!==b.text[i]);diff.text={at:i,before:a.text.slice(Math.max(0,i-80),i+250),after:b.text.slice(Math.max(0,i-80),i+250)};}
  else diff[k]={before:a[k],after:b[k]};
 }if(Object.keys(diff).length>1)differences.push(diff);
}
await fs.writeFile(process.argv.includes('--wszystkie')?'.test-jawne/porownanie-wszystkie.json':'.test-jawne/porownanie.json',JSON.stringify(differences,null,2));
console.log(JSON.stringify({pages:files.length,differences},null,2));
