// Jawna składnia układu; remark-directive odpowiada za standardową gramatykę.
const BLOKI = new Set(['proza', 'kafelki', 'etapy', 'kontakty', 'linki', 'pliki', 'pytania', 'ramka', 'zakladki', 'tabela', 'kreski', 'tematy', 'specjalnosci']);
const WSTAWKI = new Set(['opiekun', 'seminaria', 'wybor']);

export default function remarkJawneBloki() {
  return (tree, file) => {
    const fences = []; let codeFence;
    for (const [i, line] of String(file.value).split('\n').entries()) {
      const code = /^\s*(`{3,}|~{3,})/.exec(line);
      if (code) { if (!codeFence) codeFence = code[1][0]; else if (codeFence === code[1][0]) codeFence = undefined; continue; }
      if (codeFence) continue;
      const start = /^(:::{1,})([a-z][a-z0-9-]*)/.exec(line);
      const end = /^(:::{1,})\s*$/.exec(line);
      if (start) fences.push({ length: start[1].length, name: start[2], line: i + 1 });
      else if (end) {
        const open = fences.pop();
        if (!open || open.length !== end[1].length) file.fail('Niedopasowany koniec bloku. Użyj tylu dwukropków, ile na początku.', { line: i + 1, column: 1 });
      }
    }
    if (fences.length) file.fail(`Niezamknięty blok ${fences.at(-1).name}. Dodaj końcowe dwukropki.`, { line: fences.at(-1).line, column: 1 });

    const visit = (node) => {
      // Dwukropki w godzinach i zwykłej prozie nie są składnią naszego układu.
      if (node.type === 'textDirective') {
        const value = String(file.value).slice(node.position.start.offset, node.position.end.offset);
        Object.assign(node, { type: 'text', value });
        delete node.children; delete node.name; delete node.attributes;
        return;
      }
      if (node.type === 'heading' && node.depth === 2) {
        const tail = node.children.at(-1);
        const match = tail?.type === 'text' && /\s+\{#([\p{L}\p{N}][\p{L}\p{N}\p{M}_-]*)\}\s*$/u.exec(tail.value);
        if (match) {
          tail.value = tail.value.slice(0, match.index);
          node.data = { ...node.data, hProperties: { ...node.data?.hProperties, dataSekcjaId: match[1] } };
        }
      }
      if (['containerDirective', 'leafDirective', 'textDirective'].includes(node.type)) {
        const block = node.type === 'containerDirective' && BLOKI.has(node.name);
        const insert = node.type === 'leafDirective' && WSTAWKI.has(node.name);
        if (!block && !insert) file.fail(`Nieznany lub nieprawidłowy znacznik „${node.name}”. Użyj :::blok albo ::wstawka zgodnie z instrukcją.`, node);
        node.data = { ...node.data, hName: 'div', hProperties: {
          ...(block ? { dataBlok: node.name } : { dataWstawka: node.name }),
          ...(node.attributes?.tytul ? { dataTytul: node.attributes.tytul } : {}),
        } };
      }
      // Instrukcje redakcyjne nie są zawartością strony (także przy sprawdzaniu pustego tekstu).
      if (node.children) node.children = node.children.filter((child) => !(child.type === 'html' && /^\s*<!--[\s\S]*?-->\s*$/.test(child.value)));
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
