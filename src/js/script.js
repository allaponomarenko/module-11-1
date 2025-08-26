/*import './modules/binance';
import './modules/hero';
import './modules/quotes';
import './modules/ipfinder';
import './modules/pokemon';
import './modules/instagram';
import './modules/user';
*/
// Підтягування <load src="..."> без плагінів
async function hydrateLoads() {
  const nodes = [...document.querySelectorAll('load[src]')];
  for (const node of nodes) {
    const url = node.getAttribute('src');
    const res = await fetch(url);
    const html = await res.text();
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    node.replaceWith(tpl.content); // вставляємо вміст partial
  }
}

(async () => {
  await hydrateLoads(); // 1) вставляємо partial-и в DOM
  // 2) підключаємо модулі (разом, щоб швидше)
  await Promise.all([
    import('./modules/binance.js'),
    import('./modules/hero.js'),
    import('./modules/quotes.js'),
    import('./modules/ipfinder.js'),
    import('./modules/pokemon.js'),
    import('./modules/instagram.js'),
  ]);
})().catch(console.error);

//============================

/* function getCommentsByPostID(postId) {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';
  const END_POINT = '/comments';
  const PARAMS = `?postId=${postId}`;
  const url = BASE_URL + END_POINT + PARAMS;

  const options = {
    headers: {
      test: 'Hello world',
      test_123: 'test_123',
    },
  };

  return fetch(url, options).then(res => res.json());
}

getCommentsByPostID(1).then(data=>{log})
getCommentsByPostID(2);
getCommentsByPostID(3);
getCommentsByPostID(4); */

// ====================================

// ====== демо з jsonplaceholder (чисто і без зайвих викликів) ======
/*const { log } = console;

function getCommentsByPostID(postId) {
  const url = `https://jsonplaceholder.typicode.com/comments?postId=${postId}`;
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  });
}

getCommentsByPostID(2).then(log).catch(console.error);
*/
