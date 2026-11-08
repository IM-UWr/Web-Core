// Uruchom po pobraniu treści: node skrypty/synchronizuj-katalog-opiekunow.mjs [ścieżka Web-Studia]
// Zapisuje wyłącznie identyfikatory i nazwiska. Kontakt zawsze pochodzi z żywego spisu pracowników.
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
const target=path.resolve(process.argv[2]??'../Web-Studia');
const dir=path.join(target,'_cms/pracownicy');await fs.mkdir(dir,{recursive:true});
const names=new Set();
for(const file of await fs.readdir('src/content/pracownicy')){
 if(!/\.ya?ml$/.test(file))continue;
 const data=YAML.parse(await fs.readFile(path.join('src/content/pracownicy',file),'utf8'));
 if(data.opublikowany===false)continue;
 names.add(file);await fs.writeFile(path.join(dir,file),YAML.stringify({imie_nazwisko:data.imie_nazwisko,id:file.replace(/\.ya?ml$/,'')}));
}
for(const file of await fs.readdir(dir))if(/\.ya?ml$/.test(file)&&!names.has(file))await fs.unlink(path.join(dir,file));
console.log(`Katalog opiekunów: ${names.size} osób. Zmiany katalogu zapisz na tym samym branchu Web-Studia.`);
