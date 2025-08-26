// ====== REFS ======
const refs = {
  searchForm: document.querySelector('.js-formsearch'),
  ulList: document.querySelector('.js-list'),
  divFood: document.querySelector('.js-right'),
  ulLocalStor: document.querySelector('.js-save-elem'),
};

// ====== STATE ======
let dataFood = []; // останні результати пошуку
let saveList = loadSaved(); // збережені рецепти з localStorage

// ====== EVENTS ======
refs.searchForm.addEventListener('submit', onFormSubmit);
// Делегування кліків по списках (результати та збережені)
refs.ulList.addEventListener('click', onItemClick);
refs.ulLocalStor.addEventListener('click', onItemClick);

// ====== HANDLERS ======
async function onFormSubmit(evt) {
  evt.preventDefault();
  const query = evt.currentTarget.elements.name.value.trim();
  if (!query) return;

  refs.ulList.innerHTML = '<li>Loading…</li>';
  refs.divFood.innerHTML = '';

  try {
    const json = await searchRecipe(query);
    const recipes = Array.isArray(json.hits)
      ? json.hits.map(h => h.recipe)
      : [];
    dataFood = recipes;
    renderList(recipes, refs.ulList);
    if (!recipes.length) refs.ulList.innerHTML = '<li>Нічого не знайдено</li>';
  } catch (e) {
    console.warn(e);
    refs.ulList.innerHTML = '<li>Помилка запиту</li>';
  }
}

function onItemClick(evt) {
  const li = evt.target.closest('li[data-id]');
  if (!li) return;

  const id = li.dataset.id;
  const source = dataFood && dataFood.length ? dataFood : saveList;
  const recipe = source.find(r => r.uri === id);
  if (!recipe) return;

  refs.divFood.innerHTML = generateRecipeHTML(recipe);

  const btnSave = refs.divFood.querySelector('.js-button-save');
  btnSave.addEventListener('click', onSaveClick);
}

function onSaveClick(evt) {
  const id = evt.currentTarget.dataset.id;
  // шукаємо рецепт у поточних результатах або вже збережених
  const recipe =
    dataFood.find(r => r.uri === id) || saveList.find(r => r.uri === id);
  if (!recipe) return;

  if (!saveList.some(r => r.uri === recipe.uri)) {
    saveList.push(recipe);
    persistSaved();
    renderList(saveList, refs.ulLocalStor);
  }
}

// ====== RENDER ======
function renderList(array, container) {
  const markup = array
    .map(
      r => `
    <li data-id="${r.uri}">${escapeHTML(r.label)}</li>
  `,
    )
    .join('');
  container.innerHTML = markup;
}

function generateRecipeHTML(r) {
  const ingredients = (r.ingredients || [])
    .map(i => `<li>${escapeHTML(i.text || '')}</li>`)
    .join('');

  const fat = r.totalNutrients?.FAT;
  const fatText = fat ? `${fat.quantity.toFixed(2)} ${fat.unit}` : '—';
  const calories = Number(r.calories || 0).toFixed(2);

  return `
    <h1>${escapeHTML(r.label || 'No title')}</h1>
    ${
      r.image ? `<img src="${r.image}" alt="${escapeAttr(r.label || '')}">` : ''
    }

    <h2>Ingredients:</h2>
    <ul class="ingridient-list">${ingredients}</ul>

    <h2>Nutritional Information:</h2>
    <p>Total Calories: ${calories} kcal</p>
    <p>Total Fat: ${fatText}</p>

    <footer>
      <button type="button" class="js-button-save" data-id="${
        r.uri
      }">SAVE</button>
    </footer>
  `;
}

// ====== STORAGE ======
function loadSaved() {
  try {
    const raw = localStorage.getItem('food');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistSaved() {
  localStorage.setItem('food', JSON.stringify(saveList));
}

// Початковий рендер збережених
renderList(saveList, refs.ulLocalStor);

// ====== API ======
async function searchRecipe(q) {
  const BASE_URL = 'https://edamam-recipe-search.p.rapidapi.com/api/recipes/v2';
  const url = `${BASE_URL}?${new URLSearchParams({ q, type: 'public' })}`;
  const options = {
    headers: {
      'X-RapidAPI-Key': 'PASTE_YOUR_KEY_HERE', // <-- встав свій ключ
      'X-RapidAPI-Host': 'edamam-recipe-search.p.rapidapi.com',
    },
  };
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json();
}

// ====== UTILS (безпека рендеру) ======
function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function escapeAttr(str) {
  // те саме, але без пробілів у кінці
  return escapeHTML(str).replace(/\s+/g, ' ').trim();
}

//пошук рецептів
/*const refs = {
  searchForm: document.querySelector('.js-formsearch'),
  ulList: document.querySelector('.js-list'),
  divFood: document.querySelector('.js-right'),
  ulLocalStor: document.querySelector('.js-save-elem'),
};

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.ulList.addEventListener('click', onPizzaClick);

let dataFood;

function onPizzaClick(evt) {
  if (evt.target === evt.currentTarget) {
    return;
  } else {
    const label = evt.target.dataset.label;
    const obj = (dataFood || saveList).find(el => {
      return label === el.label;
    });
    const markup = generateRecipeHTML(obj);
    refs.divFood.innerHTML = markup;
    const btnSave = document.querySelector('.js-button');
    btnSave.addEventListener('click', onBtnClick);
  }
}

function onFormSubmit(evt) {
  evt.preventDefault();
  const query = evt.target.elements.name.value;
  searchRecipe(query).then(recipe => {
    console.log(recipe);
    recipe = recipe.hits.map(el => {
      return el.recipe;
    });
    dataFood = recipe;
    renderPizza(recipe);
  });
}
function renderPizza(array) {
  const markup = array
    .map(el => {
      return `
  <li data-label='${el.label}'>
  ${el.label}
  </li>`;
    })
    .join('');
  refs.ulList.innerHTML = markup;
}

function generateRecipeHTML(recipeData) {
  console.log(recipeData.ingredients);
  const ingredientsList = recipeData.ingredients
    ?.map(ingredient => `<li>${ingredient.text}</li>`)
    .join('');

  return `

          <h1>${recipeData.label}</h1>
          <img src="${recipeData.image}" alt="${recipeData.label}">
          
          <h2>Ingredients:</h2>
          <ul class="ingridient-list">
              ${ingredientsList}
          </ul>
    
          <h2>Nutritional Information:</h2>
          <p>Total Calories: ${recipeData.calories.toFixed(2)} kcal</p>
          <p>Total Fat: ${recipeData.totalNutrients.FAT.quantity.toFixed(2)} ${
    recipeData.totalNutrients.FAT.unit
  }</p>
          <!-- Add more nutritional information... -->
          
          <footer>
          <button type="submit" class="js-button" data-label="${
            recipeData.label
          }">SAVE</button>
          </footer>
  `;
}

let saveList = JSON.parse(localStorage.getItem('food')) || [];

function onBtnClick(evt) {
  const save = evt.target.dataset.label;
  const obj = dataFood.find(el => {
    return save === el.label;
  });
  if (
    !saveList.find(el => {
      return save === el.label;
    })
  ) {
    saveList.push(obj);
    localStorage.setItem('food', JSON.stringify(saveList));
  }
  renderLikeList();
}

function renderLikeList() {
  const markup = saveList
    .map(el => {
      return `
<li data-label='${el.label}'>
${el.label}
</li>`;
    })
    .join('');
  refs.ulLocalStor.innerHTML = markup;
}
renderLikeList();

refs.ulLocalStor.addEventListener('click', onPizzaClick);

function searchRecipe(q) {
  const BASE_URL = 'https://edamam-recipe-search.p.rapidapi.com/api/recipes/v2';
  const END_POINT = '?';
  const PARAMS = new URLSearchParams({ q, type: 'public' });
  const url = BASE_URL + END_POINT + PARAMS;
  const options = {
    headers: {
      'X-RapidAPI-Key': '418f4683ecmsh26e2b418590c9aep10d87bjsn22f7f643a95b',
      'X-RapidAPI-Host': 'edamam-recipe-search.p.rapidapi.com',
    },
  };
  return fetch(url, options).then(res => res.json());
}
*/
