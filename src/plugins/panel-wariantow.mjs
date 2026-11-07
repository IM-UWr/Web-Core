// Panel testowy skali (zlecenie 17, punkt 2): tylko przy `astro dev`. Przy `astro build` integracja nic nie dołącza, więc
// panelu, jego skryptu ani src/styles/test-warianty.css nie ma w dist. Panel: src/dev/panel-wariantow.ts (klucz i grupy tam).
// Wczesny skrypt ustawia atrybuty data-t-* na <html> w <head>, przed narysowaniem strony, więc wariant nie miga.
const WCZESNY = `(function(){try{var w=JSON.parse(localStorage.getItem('warianty-skali')||'{}'),d=document.documentElement;['tekst','nagl','odst','baner','akt'].forEach(function(k){if(typeof w[k]==='string'&&w[k])d.setAttribute('data-t-'+k,w[k])})}catch(e){}})();`;

export default function panelWariantow() {
  return {
    name: 'panel-wariantow',
    hooks: {
      'astro:config:setup': ({ command, injectScript }) => {
        if (command !== 'dev') return;
        injectScript('head-inline', WCZESNY);
        injectScript('page-ssr', "import '/src/styles/test-warianty.css';");
        injectScript('page', "import '/src/dev/panel-wariantow.ts';");
      },
    },
  };
}
