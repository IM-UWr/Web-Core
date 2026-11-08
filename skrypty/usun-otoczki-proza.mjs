// Migracja samej składni, bez zmian tekstu. Domyślnie tylko raportuje;
// zapis wymaga --zapisz. Podaj checkout Web-Studia, nie katalog Web-Core.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import YAML from 'yaml';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';

const parser=unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkDirective);
export function usunProze(source) {
  source=source.replace(/\r\n/g,'\n');
  const edits=[];let blocks=0;
  function visit(node) {
    if(node.type==='containerDirective'&&node.name==='proza') {
      const start=node.position.start.offset,end=node.position.end.offset;
      const openingEnd=source.indexOf('\n',start)+1;
      const closingStart=source.lastIndexOf('\n',end-1)+1;
      if(openingEnd<=start||closingStart<=start||!/^:{3,}\s*$/.test(source.slice(closingStart,end)))throw Error('Niezamknięty blok proza: migracja przerwana.');
      const from=closingStart>1&&source.slice(closingStart-2,closingStart)==='\n\n'?closingStart-1:closingStart;
      edits.push([start,openingEnd+(source[openingEnd]==='\n'?1:0)],[from,end+(source[end]==='\n'?1:0)]);blocks++;
    }
    node.children?.forEach(visit);
  }
  visit(parser.parse(source));
  const merged=[];
  for(const range of edits.sort((a,b)=>a[0]-b[0])) {
    const last=merged.at(-1);
    if(last&&range[0]<=last[1])last[1]=Math.max(last[1],range[1]);else merged.push([...range]);
  }
  for(const [start,end] of merged.reverse())source=source.slice(0,start)+source.slice(end);
  if(blocks)source=source.replace(/<!--\s*PROZA:[\s\S]*?-->/g,'<!-- TEKST: Zwykły Markdown. Specjalny układ wymaga jawnego znacznika bloku. -->');
  return {source:source.replace(/^\n+/,'').replace(/\n*$/,'\n'),blocks};
}

async function filesIn(directory) {
  const files=[];
  for(const item of await fs.readdir(directory,{withFileTypes:true})) {
    const file=path.join(directory,item.name);
    if(item.isDirectory())files.push(...await filesIn(file));
    else if(item.name.endsWith('.md'))files.push(file);
  }
  return files;
}
export async function migrate(target,write=false) {
  const files=[];
  for(const dir of ['src/content/kierunki','src/content/specjalnosci','src/content/strony/studia'])files.push(...await filesIn(path.join(target,dir)));
  files.push(...['studia','rok-akademicki'].map(n=>path.join(target,'src/data',n+'.md')));
  let entries=0,blocks=0;
  for(const file of files) {
    const original=(await fs.readFile(file,'utf8')).replace(/\r\n/g,'\n');
    const match=/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(original);
    if(!match)throw Error(`Brak nagłówka YAML: ${file}`);
    const data=YAML.parse(match[1]);if(data.format_tresci!=='jawne')continue;
    let count=0;
    const body=usunProze(match[2]);count+=body.blocks;
    for(const key of ['tresc_en','dalej','dalej_en'])if(typeof data[key]==='string') {
      const value=usunProze(data[key]);count+=value.blocks;if(value.blocks)data[key]=value.source;
    }
    if(!count)continue;
    entries++;blocks+=count;
    if(write)await fs.writeFile(file,'---\n'+YAML.stringify(data,{lineWidth:0})+'---\n'+body.source);
    console.log(`${path.relative(target,file)}: ${count}`);
  }
  if(write) {
    const file=path.join(target,'.pages.yml');const config=YAML.parse(await fs.readFile(file,'utf8'));
    function help(fields) {for(const field of fields??[]) {
      if(field.type==='code'&&field.options?.format==='markdown'&&field.description)field.description=field.description.replace('Zwykły tekst umieść w :::proza … :::.','Zwykły tekst jest prozą domyślnie; nie wymaga otaczających znaczników.');
      help(field.fields);
    }}
    for(const collection of config.content)help(collection.fields);
    await fs.writeFile(file,YAML.stringify(config,{lineWidth:0,aliasDuplicateObjects:false}));
  }
  console.log(`${write?'Zapisano':'Do zmiany'}: ${entries} wpisów, ${blocks} bloków proza.`);
  return {entries,blocks};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  if(!process.argv[2])throw Error('Podaj ścieżkę checkoutu Web-Studia; --zapisz zapisuje migrację.');
  await migrate(path.resolve(process.argv[2]),process.argv.includes('--zapisz'));
}
