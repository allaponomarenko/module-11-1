import { BooksApi } from './modules/booksAPI';

const refs = {
  createFormElem: document.querySelector('.js-create-form'),
  updateFormElem: document.querySelector('.js-update-form'),
  resetFormElem: document.querySelector('.js-reset-form'),
  deleteFormElem: document.querySelector('.js-delete-form'),
  bookListElem: document.querySelector('.js-article-list'),
};

const booksApi = new BooksApi();
// =============================================

refs.createFormElem.addEventListener('submit', onBookCreate);
refs.updateFormElem.addEventListener('submit', onBookUpdate);
refs.resetFormElem.addEventListener('submit', onBookReset);
refs.deleteFormElem.addEventListener('submit', onBookDelete);
//коли корисувач клікає по книзі то виходить з функції
refs.bookListElem.addEventListener('click', onBookClick);
//перевіряємо чи клікнув користувач саме по кнопці (button)
refs.bookListElem.addEventListener('click', onBookDeleteClick);

//! formData прописується коли у формі багато полів ===================================================
function onBookCreate(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const book = {};

  formData.forEach((value, key) => {
    key = key.toLowerCase().slice(4);
    book[key] = value;
  });

  booksApi.createBook(book).then(newBook => {
    const markup = bookTemplate(newBook);
    refs.bookListElem.insertAdjacentHTML('afterbegin', markup);
  });

  e.target.reset();
}
function onBookUpdate(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const book = {};

  formData.forEach((value, key) => {
    key = key.toLowerCase().slice(4);
    if (value) book[key] = value;
  });

  booksApi.updateBook(book).then(updatedBook => {
    const oldElem = document.querySelector(`[data-id="${book.id}"]`);
    const markup = bookTemplate(updatedBook);
    oldElem.insertAdjacentHTML('afterend', markup);
    oldElem.remove();
  });

  e.target.reset();
}
function onBookReset(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const book = {};

  formData.forEach((value, key) => {
    key = key.toLowerCase().slice(4);
    book[key] = value;
  });

  booksApi.resetBook(book).then(updatedBook => {
    const oldElem = document.querySelector(`[data-id="${book.id}"]`);
    const markup = bookTemplate(updatedBook);
    oldElem.insertAdjacentHTML('afterend', markup);
    oldElem.remove();
  });

  e.target.reset();
}
function onBookDelete(e) {
  e.preventDefault();
  const id = e.target.elements.bookId.value;
  booksApi.deleteBook(id).then(() => {
    const oldBookElem = document.querySelector(`[data-id="${id}"]`);
    oldBookElem.remove();
  });
  e.target.reset();
}
function onBookClick(e) {
  if (e.target === e.currentTarget) return;
  const liElem = e.target.closest('li');
  const id = liElem.dataset.id;

  refs.updateFormElem.elements.bookId.value = id;
  refs.resetFormElem.elements.bookId.value = id;
  refs.deleteFormElem.elements.bookId.value = id;

  if (e.shiftKey) {
    booksApi.deleteBook(id);
    liElem.remove();
  }
}
function onBookDeleteClick(e) {
  if (e.target.nodeName !== 'BUTTON') return;

  const liElem = e.target.closest('li');
  const id = liElem.dataset.id;

  booksApi.deleteBook(id);
  liElem.remove();
}

// =============================================
function bookTemplate({ id, title, author, desc }) {
  return `<li class="card book-item" data-id="${id}">
  <h4>${id} - ${title}</h4>
  <p>${desc}</p>
  <p>${author}</p>
  <button>delete</button>
</li>`;
}

function booksTemplate(books) {
  return books.map(bookTemplate).join('');
}

function renderBooks(books) {
  const markup = booksTemplate(books.reverse());
  refs.bookListElem.innerHTML = markup;
}

//! ФУНКЦІЯ ДЛЯ ОПРАЦЮВАННЯ ПОМИЛОК ===================================================
booksApi.getBooks().then(renderBooks).catch(onError);

function onError(err) {
  console.log(err.message);
  switch (err.message) {
    case '404':
      console.log('Ahahahaha');
      break;
    case '401':
      console.log('Your Password - 123123');
      break;
    default:
      console.log('Я такого не знаю');
  }
}

// функція для створення якогось елементу (в даному випадку книги) на сервері
/*function createBook(book) {
  const BASE_URL = 'http://localhost:3000';
  const END_POINT = '/books';
  const url = BASE_URL + END_POINT;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  };
  fetch(url, options);
}
*/
//=============================
/*const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');

const raw = JSON.stringify({
  title: 'et cum molestiae',
  author: 'Eloise Davis',
  desc: 'deleniti dolorum inrerum vitae doloribuspossimus blanditiis faceremolestiae enim quibusdam',
});

const requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow',
};

fetch('http://localhost:3000/books', requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.error(error));
*/
