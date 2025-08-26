//працює
// форма "Generate" використовується для генерації випадкових цитат.
const refs = {
  formEl: document.querySelector('.js-search-form[data-id="3"]'),
  containerQuotes: document.querySelector('.js-container-quotes'),
};

refs.formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  const count = Math.max(1, +event.currentTarget.elements.count.value || 1);

  getQuotes(count)
    .then(renderQuotes)
    .catch(err => {
      console.warn(err);
      refs.containerQuotes.innerHTML =
        '<p class="error">Не вдалося завантажити цитати.</p>';
    });
}

function renderQuotes(arr) {
  const markup = arr
    .map(
      el => `
    <div class="card quote">
      <h4 class="quote-name">${el.originator?.name || 'Unknown'}</h4>
      <p class="quote-body">${el.content || ''}</p>
    </div>
  `,
    )
    .join('');
  refs.containerQuotes.innerHTML = markup;
}

function getQuotes(count) {
  const promises = [];
  for (let i = 0; i < count; i += 1) {
    promises.push(delay(i * 1100).then(getQuote)); // рознесли в часі, щоб не впертись у ліміт
  }
  return Promise.all(promises);
}

function getQuote() {
  const url = 'https://quotes15.p.rapidapi.com/quotes/random/';
  const options = {
    headers: {
      'X-RapidAPI-Key': '418f4683ecmsh26e2b418590c9aep10d87bjsn22f7f643a95b', // підставиш свій
      'X-RapidAPI-Host': 'quotes15.p.rapidapi.com',
    },
  };
  return fetch(url, options).then(r => {
    if (!r.ok) throw new Error(`HTTP_${r.status}`);
    return r.json();
  });
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/*const refs = {
  formEl: document.querySelector('.js-search-form[data-id="3"]'),
  containerQuotes: document.querySelector('.js-container-quotes'),
};

refs.formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  const count = +event.target.elements.query.value;

  getQuotes(count)
    .then(data => {
      renderQuotes(data);
    })
    .catch(err => {});
}

function renderQuotes(arr) {
  const markup = arr
    .map(el => {
      return `<div class="card quote">
    <h4 class="quote-name">${el.originator.name}</h4>
    <p class="quote-body">
      ${el.content}
    </p>
  </div>`;
    })
    .join('');
  refs.containerQuotes.innerHTML = markup;
}

function getQuotes(count) {
  const promises = [];
  for (let i = 0; i < count; i += 1) {
    let savePromise = getPromise(i * 1100);
    promises.push(savePromise);
  }
  return Promise.all(promises);
}

function getQuote() {
  const url = 'https://quotes15.p.rapidapi.com/quotes/random/';
  const options = {
    headers: {
      'X-RapidAPI-Key': '418f4683ecmsh26e2b418590c9aep10d87bjsn22f7f643a95b',
      'X-RapidAPI-Host': 'quotes15.p.rapidapi.com',
    },
  };

  return fetch(url, options).then(res => res.json());
}

function getPromise(timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(getQuote());
    }, timeout);
  });
}
*/
