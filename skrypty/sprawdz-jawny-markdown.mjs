// Sprawdza formularz i powiązania, zanim Pages CMS zapisze dane według nowego układu.
// Uruchom po pobraniu treści: node skrypty/sprawdz-jawny-markdown.mjs [ścieżka Web-Studia]
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';

const target = path.resolve(process.argv[2] ?? '../Web-Studia');
const config = YAML.parse(await fs.readFile(path.join(target, '.pages.yml'), 'utf8'));
const readMd = async (file) => {
  const source = await fs.readFile(file, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  assert.ok(match, `Brak nagłówka YAML: ${file}`);
  return YAML.parse(match[1]);
};
function coverage(data, fields, label) {
  for (const key of Object.keys(data)) {
    const field = fields.find((f) => f.name === key);
    assert.ok(field, `${label}: pole ${key} nie jest obsługiwane przez CMS — zapis mógłby je usunąć.`);
    if (field.fields && data[key] != null) {
      for (const item of Array.isArray(data[key]) ? data[key] : [data[key]]) coverage(item, field.fields, `${label}.${key}`);
    }
  }
}
const employees = new Map();
for (const file of await fs.readdir('src/content/pracownicy')) {
  if (!/\.ya?ml$/.test(file)) continue;
  const data = YAML.parse(await fs.readFile(path.join('src/content/pracownicy', file), 'utf8'));
  if (data.opublikowany !== false) employees.set(file.replace(/\.ya?ml$/, ''), data);
}
let entries = 0, coordinators = 0;
const choices = new Set();
for (const file of await fs.readdir(path.join(target, '_cms/pracownicy'))) {
  if (!/\.ya?ml$/.test(file)) continue;
  const data = YAML.parse(await fs.readFile(path.join(target, '_cms/pracownicy', file), 'utf8'));
  assert.ok(data.etykieta && !choices.has(data.etykieta), `Niejednoznaczna pozycja listy opiekunów: ${file}`);
  choices.add(data.etykieta);
}
async function markdownFiles(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await markdownFiles(file));
    else if (entry.name.endsWith('.md')) result.push(file);
  }
  return result;
}
function codeFields(collection) {
  for (const name of ['body', 'tresc_en', 'dalej', 'dalej_en']) {
    const field = collection.fields.find((f) => f.name === name);
    if (!field) continue;
    assert.equal(field.type, 'code', `${collection.name}.${name}: brak kolorowanego edytora`);
    assert.equal(field.options?.format, 'markdown');
  }
}
for (const name of ['kierunki', 'specjalnosci', 'strony']) {
  const collection = config.content.find((c) => c.name === name);
  assert.ok(collection && collection.type === 'collection', `Brak formularza ${name}`);
  const names = collection.fields.map((f) => f.name);
  if (name !== 'strony') assert.ok(names.indexOf('body') < names.indexOf('baner') && names.at(-1) === 'baner', `${name}: baner powinien być ostatni.`);
  codeFields(collection);
  for (const file of await markdownFiles(path.join(target, collection.path))) {
    const data = await readMd(file);
    coverage(data, collection.fields, file);
    assert.equal(data.format_tresci, 'jawne', `${file}: brak jawnego formatu`);
    if (name !== 'strony') assert.ok(data.baner, `${file}: brak scalonego banera`);
    for (const coordinator of data.opiekunowie ?? []) {
      const id = path.posix.basename(coordinator.osoba ?? '').replace(/\.ya?ml$/, '');
      assert.ok(id && employees.has(id), `${file}: nieistniejący opiekun ${coordinator.osoba}`);
      const catalog = YAML.parse(await fs.readFile(path.join(target, coordinator.osoba), 'utf8'));
      assert.equal(catalog.id, id);
      assert.equal(catalog.imie_nazwisko, employees.get(id).imie_nazwisko, `${id}: odśwież katalog wyboru opiekunów`);
      coordinators++;
    }
    if (name === 'specjalnosci') await fs.access(path.join(target, data.kierunek));
    entries++;
  }
}
for (const name of ['strona-dzialu', 'rok-akademicki']) {
  const collection = config.content.find((c) => c.name === name);
  assert.ok(collection, `Brak formularza ${name}`);
  codeFields(collection);
  const data = await readMd(path.join(target, collection.path));
  coverage(data, collection.fields, collection.path);
  assert.equal(data.format_tresci, 'jawne');
  entries++;
}
console.log(`OK: ${entries} wpisów, ${coordinators} powiązań opiekunów; formularze zachowują wszystkie pola.`);
