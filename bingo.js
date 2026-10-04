(() => {
  const config = window.CHEESE_BINGO_CONFIG;
  if (!config) return;

  const FREE_INDEX = 12;
  const STORAGE_KEY = `cheese-louise:bingo:${config.id}`;
  const WIN_LINES = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
  ];

  const boardEl = document.querySelector('[data-board]');
  const cardCodeEl = document.querySelector('[data-card-code]');
  const markedCountEl = document.querySelector('[data-marked-count]');
  const winEl = document.querySelector('[data-win]');

  document.querySelector('[data-week-label]').textContent = config.subtitle || 'This week in the Romantiverse';
  document.querySelector('[data-movie-title]').textContent = config.movie;
  document.querySelector('[data-season]').textContent = config.season || '';
  document.querySelector('[data-holiday]').textContent = config.holiday || '';
  document.querySelector('[data-description]').textContent = config.description || '';

  function randomCode() {
    const bytes = new Uint8Array(4);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else bytes.forEach((_, i) => bytes[i] = Math.floor(Math.random() * 256));
    return [...bytes].map(n => n.toString(36).padStart(2, '0')).join('').slice(0, 6).toUpperCase();
  }

  function weightedSample(items, count) {
    const weighted = new Set(config.weighted || []);
    return items
      .map(item => {
        const weight = weighted.has(item.id) ? 2.4 : 1;
        return { item, key: Math.pow(Math.random(), 1 / weight) };
      })
      .sort((a, b) => b.key - a.key)
      .slice(0, count)
      .map(row => row.item);
  }

  function shuffle(items) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function buildCard() {
    if (!Array.isArray(config.pool) || config.pool.length < 24) {
      throw new Error('Romantiverse Bingo needs at least 24 eligible traits.');
    }
    const picks = shuffle(weightedSample(config.pool, 24));
    const squares = [];
    let pickIndex = 0;
    for (let i = 0; i < 25; i++) {
      if (i === FREE_INDEX) squares.push({ id: 'free', label: config.freeSpace || 'CHEESE LOUISE!' });
      else squares.push(picks[pickIndex++]);
    }
    return {
      movieId: config.id,
      code: randomCode(),
      squares,
      marked: [FREE_INDEX],
      createdAt: new Date().toISOString()
    };
  }

  function loadCard() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.movieId === config.id && Array.isArray(saved.squares) && saved.squares.length === 25) {
        saved.marked = Array.isArray(saved.marked) ? saved.marked : [FREE_INDEX];
        if (!saved.marked.includes(FREE_INDEX)) saved.marked.push(FREE_INDEX);
        return saved;
      }
    } catch (err) {
      console.warn('Could not restore Bingo card', err);
    }
    const card = buildCard();
    saveCard(card);
    return card;
  }

  function saveCard(card) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
  }

  function winningLines(card) {
    const marked = new Set(card.marked);
    marked.add(FREE_INDEX);
    return WIN_LINES.filter(line => line.every(index => marked.has(index)));
  }

  function render() {
    const wins = winningLines(card);
    const winningIndexes = new Set(wins.flat());
    const marked = new Set(card.marked);

    boardEl.innerHTML = '';
    card.squares.forEach((square, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bingo-square';
      button.textContent = square.label;
      button.setAttribute('aria-label', index === FREE_INDEX ? `${square.label}, free space` : square.label);
      button.setAttribute('aria-pressed', marked.has(index) ? 'true' : 'false');
      if (marked.has(index)) button.classList.add('marked');
      if (index === FREE_INDEX) button.classList.add('free');
      if (winningIndexes.has(index)) button.classList.add('winner');
      if (index !== FREE_INDEX) button.addEventListener('click', () => toggleSquare(index));
      else button.disabled = true;
      boardEl.appendChild(button);
    });

    cardCodeEl.textContent = card.code;
    markedCountEl.textContent = new Set(card.marked).size;
  }

  function toggleSquare(index) {
    const beforeWin = winningLines(card).length > 0;
    const set = new Set(card.marked);
    if (set.has(index)) set.delete(index);
    else set.add(index);
    set.add(FREE_INDEX);
    card.marked = [...set].sort((a, b) => a - b);
    saveCard(card);
    render();
    const afterWin = winningLines(card).length > 0;
    if (!beforeWin && afterWin) winEl.hidden = false;
  }

  function newCard() {
    const meaningfulMarks = card.marked.filter(i => i !== FREE_INDEX).length;
    if (meaningfulMarks && !window.confirm('Generate a new randomized card? Your current marks will be cleared.')) return;
    card = buildCard();
    saveCard(card);
    render();
  }

  function clearMarks() {
    card.marked = [FREE_INDEX];
    saveCard(card);
    render();
  }

  document.querySelector('[data-new-card]')?.addEventListener('click', newCard);
  document.querySelector('[data-clear-marks]')?.addEventListener('click', clearMarks);
  document.querySelector('[data-close-win]')?.addEventListener('click', () => { winEl.hidden = true; });
  winEl?.addEventListener('click', event => {
    if (event.target === winEl) winEl.hidden = true;
  });

  let card = loadCard();
  render();
})();
