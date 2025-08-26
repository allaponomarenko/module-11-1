//працює
const refs = {
  formEl: document.querySelector('.js-search-form[data-id="2"]'),
  infoEl: document.querySelector('.js-binance-info'),
};

refs.formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();
  const query = e.target.elements.query.value;

  getPrice(query).then(data => {
    renderSymbol(data);
  });

  e.target.reset();
}

function getPrice(symbol) {
  const BASE_URL = 'https://binance43.p.rapidapi.com';
  const END_POINT = '/ticker/price';
  const PARAMS = `?symbol=${symbol}`;
  const url = BASE_URL + END_POINT + PARAMS;

  const options = {
    headers: {
      'x-rapidapi-key': '418f4683ecmsh26e2b418590c9aep10d87bjsn22f7f643a95b',
      'x-rapidapi-host': 'binance43.p.rapidapi.com',
    },
  };

  return fetch(url, options).then(res => res.json());
}

function symbolTemplate({ price, symbol }) {
  return `
    <span>${symbol}</span>
    <span>${price}</span>
  `;
}

function renderSymbol(symbol) {
  const markup = symbolTemplate(symbol);
  refs.infoEl.innerHTML = markup;
}
