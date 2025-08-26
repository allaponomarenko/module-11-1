//працює, але з ключем rapidapi.com
const refs = {
  wrapperInstagram: document.querySelector('.js-inst-wrap'), // контейнер для картки
  searchInstagramEl: document.querySelector('.js-search-form[data-id="6"]'), // форма пошуку
};

// Один слухач на форму
refs.searchInstagramEl.addEventListener('submit', onInstagramSubmit);

function onInstagramSubmit(event) {
  event.preventDefault();
  const user = event.currentTarget.elements.query.value.trim();
  if (!user) return; // нічого не шлемо, якщо порожньо

  searchInstagram(user)
    .then(data => {
      // очікувана структура з RapidAPI
      renderInstagramCard(data.data.user);
    })
    .catch(err => {
      console.warn(err);
      refs.wrapperInstagram.innerHTML =
        '<p class="error">Помилка або користувача не знайдено.</p>';
    });
}

function searchInstagram(userName) {
  const baseUrl =
    'https://instagram191.p.rapidapi.com/user/details-by-username/';
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'PASTE_YOUR_KEY_HERE', // <-- підставиш свій ключ
      'X-RapidAPI-Host': 'instagram191.p.rapidapi.com',
    },
  };

  const params = new URLSearchParams({ username: userName });
  const url = `${baseUrl}?${params.toString()}`;

  return fetch(url, options).then(response => {
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return response.json();
  });
}

function renderInstagramCard({ biography, full_name, profile_pic_url }) {
  const markup = `
    <img
      class="profile-pic"
      src="${
        profile_pic_url || 'https://source.unsplash.com/500x500/?user,avatar'
      }"
      alt="Profile Picture"
    />
    <div class="username">${full_name || ''}</div>
    <div class="biography">${biography || ''}</div>
  `;
  refs.wrapperInstagram.innerHTML = markup;
}

//код вчителя з моїми ключами з rapidapi.com [Instagram User Info](https://rapidapi.com/Glavier/api/instagram191/)
/*const refs = {
  wrapperInstagram: document.querySelector('.js-inst-wrap'),
  searchInstagramEl: document.querySelector('.js-search-form[data-id="6"]'),
};

refs.wrapperInstagram.addEventListener('submit', onWrapperInstagramSubmit);
function onWrapperInstagramSubmit(event) {
  event.preventDefault();
  const value = refs.wrapperInstagram.elements.query.value;
  getSearchInstagram(value).then(renderPokemon);
}

function searchInstagram(userName) {
  const baseUrl = `https://instagram191.p.rapidapi.com/user/details-by-username/`;
  const options = {
    headers: {
      'X-RapidAPI-Key': '418f4683ecmsh26e2b418590c9aep10d87bjsn22f7f643a95b',
      'X-RapidAPI-Host': 'instagram191.p.rapidapi.com',
    },
  };
  const newParam = new URLSearchParams({
    username: userName,
  });
  const url = `${baseUrl}?${newParam}`;

  return fetch(url, options).then(response => response.json());
}

function renderIstagramCard({ biography, full_name }) {
  const markup = `<img
    class="profile-pic"
    src="https://source.unsplash.com/500x500/?random=1&user,userprofile,profile,avatar"
    alt="Profile Picture"
  />
  <div class="username">${full_name}</div>
  <div class="biography">${biography}</div>`;

  refs.wrapperInstagram.innerHTML = markup;
}

refs.searchInstagramEl.addEventListener('submit', event => {
  event.preventDefault();
  const user = event.target.elements.query.value.trim();

  searchInstagram(user)
    .then(data => {
      renderIstagramCard(data.data.user);
    })
    .catch(err => 'error');
});
*/
