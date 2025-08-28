// ===== 0) Утиліти DOM =====
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const refs = sel => ({
  form: $(sel.form),
  output: $(sel.output),
  status: $(sel.status),
});

function bindFormSubmit(formEl, handler) {
  if (!formEl) return;
  formEl.addEventListener('submit', e => {
    e.preventDefault();
    const value = e.target.elements.query?.value?.trim();
    if (!value) return;
    handler(value, e).finally(() => e.target.reset());
  });
}

function setStatus(el, msg) {
  if (el) el.textContent = msg || '';
}
function showLoading(el) {
  setStatus(el, 'Завантаження…');
}
function showError(el, err) {
  setStatus(el, `Помилка: ${err?.message || err}`);
}

function render(el, html) {
  if (el) el.innerHTML = html;
}
function append(el, html) {
  if (el) el.insertAdjacentHTML('beforeend', html);
}

function escapeHTML(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ===== 1) Кеш і відміна запитів =====
const cache = new Map();
let lastController = null;
function abortLast() {
  if (lastController) lastController.abort();
  lastController = new AbortController();
  return lastController.signal;
}

// ===== 2) Універсальний клієнт fetch =====
function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.set(k, v);
  });
  const q = usp.toString();
  return q ? `?${q}` : '';
}

function withTimeout(ms = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, cancel: () => clearTimeout(id) };
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJSON = contentType.includes('application/json');
  const data = isJSON ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = isJSON ? data.message || JSON.stringify(data) : data;
    const err = new Error(msg || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

function createApiClient({
  baseURL = '',
  defaultHeaders = {},
  timeout = 10000,
  beforeRequest,
} = {}) {
  return {
    async request(
      path,
      { method = 'GET', params, body, headers = {}, signal } = {},
    ) {
      const url = baseURL + path + buildQuery(params);
      const { signal: tSignal, cancel } = withTimeout(timeout);
      const mergedSignal = signal || tSignal;

      const init = {
        method,
        headers: { Accept: 'application/json', ...defaultHeaders, ...headers },
      };
      if (body !== undefined) {
        init.headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(body);
      }
      if (typeof beforeRequest === 'function') beforeRequest({ url, init });
      try {
        const res = await fetch(url, { ...init, signal: mergedSignal });
        return await handleResponse(res);
      } finally {
        cancel();
      }
    },
    get(path, opts) {
      return this.request(path, { ...opts, method: 'GET' });
    },
    post(path, body, opts) {
      return this.request(path, { ...opts, method: 'POST', body });
    },
  };
}

// ===== 3) API клієнти =====
// ⚠️ НЕ зберігай справжній RapidAPI ключ у фронтенді!
const binance = createApiClient({
  baseURL: 'https://binance43.p.rapidapi.com',
  defaultHeaders: {
    'X-RapidAPI-Key': 'YOUR_KEY_HERE',
    'X-RapidAPI-Host': 'binance43.p.rapidapi.com',
  },
});

const superhero = createApiClient({
  baseURL: 'https://superhero-search.p.rapidapi.com/api/',
  defaultHeaders: {
    'X-RapidAPI-Key': 'YOUR_KEY_HERE',
    'X-RapidAPI-Host': 'superhero-search.p.rapidapi.com',
  },
});

const poke = createApiClient({ baseURL: 'https://pokeapi.co/api/v2' });

// ===== 4) Функції даних =====
async function getPrice(symbol) {
  const key = `binance:${symbol}`;
  if (cache.has(key)) return cache.get(key);
  const data = await binance.get('/ticker/price', { params: { symbol } });
  cache.set(key, data);
  return data;
}

async function searchHero(name) {
  const key = `hero:${name.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key);
  const data = await superhero.get('', { params: { hero: name } });
  cache.set(key, data);
  return data;
}

async function getPokemon(nameOrId) {
  const key = `pokemon:${String(nameOrId).toLowerCase()}`;
  if (cache.has(key)) return cache.get(key);
  const data = await poke.get(`/pokemon/${String(nameOrId).toLowerCase()}`);
  cache.set(key, data);
  return data;
}

// ===== 5) Шаблони =====
function symbolTemplate({ price, symbol }) {
  return `<div class="price-row"><span>${escapeHTML(
    symbol,
  )}</span><span>${escapeHTML(String(price))}</span></div>`;
}

function heroTemplate(hero) {
  return `<div class="card hero-card">
    <div class="image-container">
      <img src="${escapeHTML(hero.images?.lg || '')}" alt="${escapeHTML(
    hero.name || '',
  )}" class="hero-image" />
    </div>
    <div class="hero-body">
      <h4 class="hero-name">${escapeHTML(hero.name || '')}</h4>
      <p class="hero-bio">${escapeHTML(
        hero.biography?.fullName || '',
      )} — ${escapeHTML(hero.biography?.placeOfBirth || '')}, ${escapeHTML(
    hero.work?.base || '',
  )}</p>
    </div>
  </div>`;
}

function pokemonTemplate({
  height,
  weight,
  id,
  name,
  base_experience,
  sprites: { front_default, back_default } = {},
}) {
  return `<div class="card pokemon-card">
    <h3 class="pokemon-name">${escapeHTML(name)} — Pokemon Details</h3>
    <div class="image-container">
      <img data-back="${escapeHTML(
        back_default || '',
      )}" data-front="${escapeHTML(
    front_default || '',
  )}" class="pokemon-image js-pocimage" src="${escapeHTML(
    front_default || '',
  )}" alt="${escapeHTML(name)}" />
    </div>
    <ul class="info-list">
      <li><b>ID:</b> ${escapeHTML(String(id))}</li>
      <li><b>Height:</b> ${escapeHTML(String(height))} decimetres</li>
      <li><b>Weight:</b> ${escapeHTML(String(weight))} grams</li>
      <li><b>Base Experience:</b> ${escapeHTML(String(base_experience))}</li>
    </ul>
  </div>`;
}

// ===== 6) Обробники сабмітів =====
async function handleBinanceSubmit(value) {
  const { output, status } = refs({
    form: '.js-search-form[data-id="2"]',
    output: '.js-binance-info',
    status: '.js-status',
  });
  showLoading(status);
  try {
    const signal = abortLast();
    const data = await getPrice(value, { signal });
    render(output, symbolTemplate(data));
    output.classList.remove('empty');
    setStatus(status, '');
  } catch (err) {
    showError(status, err);
  }
}

async function handleHeroSubmit(value) {
  const { output, status } = refs({
    form: '.js-search-form[data-id="1"]',
    output: '.js-hero-container',
    status: '.js-status',
  });
  showLoading(status);
  try {
    const signal = abortLast();
    const data = await searchHero(value, { signal });
    append(output, heroTemplate(data));
    setStatus(status, '');
  } catch (err) {
    showError(status, err);
  }
}

async function handlePokemonSubmit(value) {
  const { output, status } = refs({
    form: '.js-search-form[data-id="5"]',
    output: '.js-pokemon-list',
    status: '.js-status',
  });
  showLoading(status);
  try {
    const signal = abortLast();
    const data = await getPokemon(value, { signal });
    append(output, pokemonTemplate(data));
    setStatus(status, '');
  } catch (err) {
    showError(status, err);
  }
}

// ===== 7) Прив'язка форм =====
bindFormSubmit($('.js-search-form[data-id="2"]'), handleBinanceSubmit);
bindFormSubmit($('.js-search-form[data-id="1"]'), handleHeroSubmit);
bindFormSubmit($('.js-search-form[data-id="5"]'), handlePokemonSubmit);

// ===== 8) Глобальний catcher на час розробки =====
window.addEventListener('unhandledrejection', e =>
  console.warn('Unhandled:', e.reason),
);
//===================================================================================================================
/*
//TODO:🧭 Універсальна СХЕМА роботи з сервером (шпаргалка на майбутнє)

//*Нижче — нейтральний шаблон-алгоритм, який підходить під будь-який REST/HTTP API. 
//*Це не «конкретні файли», а схема рішень + мінімальні заготовки (псевдокод), 
// *які ти швидко підставиш під будь-який бекенд.

//! 0) Ментальна модель (flow) ===============================================================

//? 1. Подія від користувача → (натиснув, ввів, прокрутив, відкрив сторінку)

//? 2. Перевірка/нормалізація вводу → (трим, валідація формату, приведение регістру)

//? 3. Підготовка запиту → URL, params, headers, body, signal(AbortController), timeout

//? 4. Відобразити loading

//? 5. Виконати запит → fetch|axios (з ретраями для 429/5xx)

//? 6. Обробити відповідь → ok? → parse(JSON|text|blob) → мапінг до моделі UI

//? 7. Оновити UI → success або empty або error

//? 8. Кеш / мемоізація (опціонально)

// Думай як про стани: idle → loading → success|empty|error.

//! 1) Рішення-перемикачі (коли що вмикати) ===============================

//AbortController — якщо поле вводу «живе» (debounce) або можливі швидкі повторні запити.

//Debounce — для live-пошуку/автокомпліту.

//Retry + backoff — тільки для тимчасових збоїв (429, 5xx).

//Кеш — якщо однаковий запит імовірний повторно, або мережа дорога.

//Пагінація — коли список елементів довгий або сервер віддає next/prev курсори.

//Проксі/сервер — коли є секрети (API keys), або CORS.

//! 2) Базовий клієнт (псевдокод) ===============================

client = createClient({ baseURL, defaultHeaders, timeout })

request(path, { method='GET', params, body, signal }) {
  url = baseURL + path + qs(params)
  with timeoutSignal
  res = fetch(url, { method, headers, body, signal })
  data = parse(res)
  if !res.ok -> throw {status, message, data}
  return data
}

//! 3) Стан машини UI (псевдокод) ===============================

state = 'idle' | 'loading' | 'success' | 'empty' | 'error'

async function run(query) {
  set(state, 'loading')
  try {
    data = await api.get(query)
    set(state, data.isEmpty ? 'empty' : 'success')
    render(data)
  } catch (e) {
    set(state, 'error')
    showError(e)
  }
}

//! 4) Універсальна форма взаємодії ===============================

onSubmit(e) {
  e.preventDefault()
  q = normalize(e.target.query.value)
  if (!valid(q)) return showHint('Перевір значення')
  abortPrevious()
  run(q)
}

//! 5) Патерни запитів ===============================

GET //(пошук/деталі)

api.get('/resource', { params: { q, page, limit } })

POST/PUT/PATCH //(зміни)

api.post('/resource', payload) // body: JSON; заголовок Content-Type

// Завантаження файлу

res = await fetch(url)
blob = await res.blob()
URL.createObjectURL(blob)

// Завантаження на сервер (multipart)

fd = new FormData()
fd.append('file', file)
fetch(url, { method: 'POST', body: fd })

//! 6) Помилки: класифікація та дії ===============================

// 400/404: підсвітити поле, дати інструкцію («перевір формат/ідентифікатор»).

// 401/403: показати «потрібна авторизація»; запропонувати логін/оновити токен.

// 429: повідомлення «надто часто», retry with backoff, кеш/дебаунс.

// 5xx: «технічна помилка» + можливість повтору.

// AbortError: ігнор — це керована відміна.

//*Псевдокод ретраю:

retry(fn, attempts=2) {
  for i in 0..attempts {
    try { return await fn() }
    catch (e) {
      if (![429,500,502,503,504].includes(e.status)) throw e
      await sleep(300 * 2**i)
    }
  }
  throw e
}

//! 7) Пагінація (offset/limit vs cursor) ===============================

// offset/limit
page=1; do {
  data = await api.get('/items', { params:{ page, limit } })
  render(data.items)
  page++
} while (data.items.length === limit)

// cursor/next
cursor=null; do {
  data = await api.get('/items', { params:{ cursor } })
  render(data.items)
  cursor = data.nextCursor
} while (cursor)

//! 8) Кешування (ключ = метод + url + params) ===============================

key = hash(method, path, params)
if (cache.has(key)) return cache.get(key)
res = await api.get(path, { params })
cache.set(key, res)

// Опціонально додавай TTL: зберігати час і перевіряти «протухання».

//! 9) Дебаунс/Тайм‑аут/Відміна ===============================
/*
debounce(fn, wait) => (...args) => { clearTimeout(t); t=setTimeout(()=>fn(...args),wait) }
withTimeout(ms) => AbortController + setTimeout(abort, ms)
abortPrevious() => зберігай lastController і abort()
*/
//! 10) Безпека та продакшн‑гігієна ===============================
/**
 * Секрети тільки на сервері (proxy), фронт отримує лише сесію/токен безпеки.
 * Валідація і на фронті, і на бекенді.
 * Логи помилок (консоль під час dev, окремий збирач у проді).
 * Порожні стани й лоадери — завжди.
 * Аксесибіліті: aria-live для статусів, фокус-менеджмент після відповіді.
 */

//! 11) «Матричка» швидких рішень ===============================

//? Задача: Live‑пошук                          Інструмент: debounce + AbortController

//? Задача: Великі списки                       Інструмент: пагінація (cursor бажано)

//? Задача: Сплески трафіку                     Інструмент: кеш + дебаунс + 429 retry

//? Задача: Повільний бекенд                    Інструмент: спінер + «скелетони», оптимізувати запит

//? Задача: Конфіденційні API                   Інструмент: бекенд‑проксі, не світити ключ

//? Задача: Нестабільна мережа                  Інструмент: ретраї + офлайн‑індикатор

//! 12) Міні-шаблон під будь-який виклик (drop‑in) ===============================
/*
async function call({ path, params, onData, onEmpty, onError }) {
  setStatus(statusEl, 'Завантаження…')
  try {
    abortPrevious()
    const data = await client.get(path, { params })
    if (!data || isEmpty(data)) { onEmpty?.(); setStatus(statusEl, 'Нічого не знайдено') }
    else { onData?.(data); setStatus(statusEl, '') }
  } catch (e) {
    if (e.name === 'AbortError') return
    onError?.(e)
    setStatus(statusEl, `Помилка: ${e.message || 'невідома'}`)
  }
}
*/
//Зберігай цю «схему‑шаблон» як орієнтир: спершу визначаєш стан/подію, потім збираєш запит,
//  далі — контроль якості (abort/retry/cache), на фініші — рендер стану.
