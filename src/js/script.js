import './modules/binance';
import './modules/hero';
import './modules/quotes';
import './modules/ipfinder';
import './modules/pokemon';
import './modules/instagram';
import './modules/user';
/*async function hydrateLoads() {
  const nodes = [...document.querySelectorAll('load[src]')];
  for (const node of nodes) {
    const url = node.getAttribute('src');
    const res = await fetch(url);
    const html = await res.text();
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    node.replaceWith(tpl.content);
  }
}

(async () => {
  await hydrateLoads(); // 1) вставляємо partial-и в DOM
  await import('./modules/binance.js'); // 2) лише тепер підключаємо модулі
  await import('./modules/hero.js');
  await import('./modules/quotes.js');
  await import('./modules/ipfinder.js');
  await import('./modules/pokemon.js');
  await import('./modules/instagram.js');
  await import('./modules/user.js');
})();
*/
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
