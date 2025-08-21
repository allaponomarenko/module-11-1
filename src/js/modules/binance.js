// Делегуємо submit на форму з data-id="2"
document.addEventListener('submit', async e => {
  const form = e.target.closest('.js-search-form[data-id="2"]');
  if (!form) return;
  e.preventDefault();

  const root = form.closest('.block') ?? document;
  const infoEl = root.querySelector('.js-binance-info');

  const symbol = form.elements.query.value.trim().toUpperCase();
  if (!symbol) {
    infoEl.textContent = 'Введи символ, напр. BTCUSDT';
    return;
  }

  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(
        symbol,
      )}`,
    );
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    infoEl.innerHTML = `<span>${data.symbol}</span><span>${data.price}</span>`;
  } catch (err) {
    infoEl.textContent = `Error: ${err.message}`;
  }

  form.reset();
});
