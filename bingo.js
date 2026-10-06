(() => {
  const config = window.CHEESE_BINGO_CONFIG;
  if (!config) return;

  const FREE_INDEX = 12;
  const TRAITS_PER_CARD = 24;
  const STORAGE_KEY = `cheese-louise:bingo:${config.id}`;
  const WIN_LINES = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
  ];

  const FALL_SYMBOLS = {
    pumpkins:'🎃','pumpkin-patch':'🎃','pumpkin-carving':'🎃','pumpkin-food':'🧁',
    'fall-festival':'🎪','town-event':'🎪',hayride:'🚜','corn-maze':'🌽','apple-picking':'🍎','candy-apples':'🍎','apple-cider':'🍎',
    'cozy-drink':'☕','coffee-shop':'☕',bakery:'🥧','cozy-sweater':'🧶','scarf-weather':'🧣',
    'scenic-leaves':'🍂','leaf-pile':'🍁','fall-decor':'🍂',wreath:'🍁','string-lights':'✨',
    'small-town':'🏘️','hometown-return':'🧳','big-city-job':'🏙️','city-vs-home':'↔️','family-business':'🏪','save-business':'🏪','family-farm':'🌾','inn-bnb':'🏡','main-street':'🏘️',
    'old-flame':'❤️','childhood-sweetheart':'💘','rivals-to-lovers':'⚔️','friends-to-lovers':'💕','competitive-flirting':'🏆','forced-together':'🤝','town-matchmaking':'💞','family-matchmaking':'💞','shared-blanket':'🧣',
    'almost-kiss':'💋','interrupted-kiss':'💋',misunderstanding:'💬','career-or-love':'↔️','grand-gesture':'🎁','community-saves-day':'🤝','family-legacy':'🌳','town-knows':'👀','wholesome-work':'🧹',
    'empty-coffee-cup':'🥤','perfect-weather':'☀️','outdoor-date':'🧺','bonfire-firepit':'🔥',barn:'🛖',dog:'🐕','farmers-market':'🧺','pie-contest':'🥧','friendly-competition':'🏆','festival-crisis':'🚨'
  };

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
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return [...bytes].map(n => n.toString(36).padStart(2, '0')).join('').slice(0, 6).toUpperCase();
  }

  function shuffle(items) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function uniquePool() {
    const seen = new Set();
    return (Array.isArray(config.pool) ? config.pool : []).filter(item => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  function weightedSample(items, count) {
    if (count <= 0) return [];
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

  function cardTraitIds(card) {
    return new Set(
      (card?.squares || [])
        .filter(square => square?.id && square.id !== 'free')
        .map(square => square.id)
    );
  }

  function chooseTraits(previousCard = null) {
    const pool = uniquePool();
    if (pool.length < TRAITS_PER_CARD) {
      throw new Error(`Romantiverse Bingo needs at least ${TRAITS_PER_CARD} unique eligible traits.`);
    }

    const byId = new Map(pool.map(item => [item.id, item]));
    const requiredIds = [...new Set(config.required || [])]
      .filter(id => byId.has(id))
      .slice(0, TRAITS_PER_CARD);
    const requiredTraits = requiredIds.map(id => byId.get(id));
    const requiredSet = new Set(requiredIds);
    const candidates = pool.filter(item => !requiredSet.has(item.id));
    const randomSlots = TRAITS_PER_CARD - requiredTraits.length;

    if (candidates.length < randomSlots) {
      throw new Error('The weekly Bingo pool does not contain enough non-required traits.');
    }

    if (!previousCard) {
      return shuffle([
        ...requiredTraits,
        ...weightedSample(candidates, randomSlots)
      ]);
    }

    const previousIds = cardTraitIds(previousCard);
    const neverOnPreviousCard = candidates.filter(item => !previousIds.has(item.id));
    const requestedChanges = Math.max(1, Number(config.minTraitChanges || 6));
    const guaranteedChanges = Math.min(requestedChanges, randomSlots, neverOnPreviousCard.length);

    const forcedNewTraits = weightedSample(neverOnPreviousCard, guaranteedChanges);
    const forcedNewIds = new Set(forcedNewTraits.map(item => item.id));
    const remainingCandidates = candidates.filter(item => !forcedNewIds.has(item.id));
    const remainingSlots = randomSlots - forcedNewTraits.length;
    const rest = weightedSample(remainingCandidates, remainingSlots);

    return shuffle([
      ...requiredTraits,
      ...forcedNewTraits,
      ...rest
    ]);
  }

  function buildCard(previousCard = null) {
    const picks = chooseTraits(previousCard);
    const squares = [];
    let pickIndex = 0;

    for (let i = 0; i < 25; i++) {
      if (i === FREE_INDEX) {
        squares.push({ id: 'free', label: config.freeSpace || 'CHEESE LOUISE!' });
      } else {
        squares.push(picks[pickIndex++]);
      }
    }

    return {
      movieId: config.id,
      code: randomCode(),
      squares,
      marked: [FREE_INDEX],
      createdAt: new Date().toISOString(),
      generatorVersion: 4
    };
  }

  function savedCardUsesCurrentPool(saved) {
    const allowed = new Set(uniquePool().map(item => item.id));
    return saved.squares.every((square, index) => {
      if (index === FREE_INDEX) return square?.id === 'free';
      return allowed.has(square?.id);
    });
  }

  function loadCard() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (
        saved?.movieId === config.id &&
        Array.isArray(saved.squares) &&
        saved.squares.length === 25 &&
        savedCardUsesCurrentPool(saved)
      ) {
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

  function symbolFor(square) {
    if (square?.id === 'free') return '🧀';
    if (FALL_SYMBOLS[square?.id]) return FALL_SYMBOLS[square.id];
    const s = String(square?.label || '').toLowerCase();
    if (s.includes('pumpkin')) return '🎃';
    if (s.includes('apple')) return '🍎';
    if (s.includes('coffee') || s.includes('drink') || s.includes('cider')) return '☕';
    if (s.includes('leaf') || s.includes('fall') || s.includes('autumn')) return '🍂';
    if (s.includes('festival') || s.includes('event')) return '🎪';
    if (s.includes('farm') || s.includes('barn') || s.includes('orchard')) return '🌾';
    if (s.includes('town') || s.includes('street')) return '🏘️';
    if (s.includes('kiss')) return '💋';
    if (s.includes('love') || s.includes('romance') || s.includes('flirt')) return '❤️';
    if (s.includes('dog')) return '🐕';
    if (s.includes('fire')) return '🔥';
    return '🧀';
  }

  function flannelShirtSvg() {
    return `<svg viewBox="0 0 64 64" width="86%" height="86%" aria-hidden="true" focusable="false">
      <path d="M22 9 28 6 32 11 36 6 42 9 54 16 48 27 43 24 43 56 21 56 21 24 16 27 10 16Z" fill="#b62d2d" stroke="#5f211d" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M21 20h22M21 31h22M21 42h22M21 51h22M27 11v45M37 11v45" stroke="#f2d1a0" stroke-width="2" opacity=".95"/>
      <path d="M21 25h22M21 46h22M24 11v45M40 11v45" stroke="#263e38" stroke-width="1.8" opacity=".9"/>
      <path d="m27 8 5 7 5-7M32 15v41" fill="none" stroke="#fff2d9" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="24" r="1.15" fill="#fff2d9"/><circle cx="32" cy="34" r="1.15" fill="#fff2d9"/><circle cx="32" cy="44" r="1.15" fill="#fff2d9"/>
    </svg>`;
  }

  function traitIcon(square) {
    if (square?.id === 'plaid-flannel') {
      return `<span class="bingo-trait-symbol" aria-hidden="true">${flannelShirtSvg()}</span>`;
    }
    return `<span class="bingo-trait-symbol" aria-hidden="true">${symbolFor(square)}</span>`;
  }

  function render() {
    const wins = winningLines(card);
    const winningIndexes = new Set(wins.flat());
    const marked = new Set(card.marked);

    boardEl.innerHTML = '';
    card.squares.forEach((square, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bingo-square bingo-square-illustrated';
      button.innerHTML = `${traitIcon(square)}<span class="bingo-trait-label">${escapeHtml(square.label)}</span>`;
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

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
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
    const previousCard = card;
    card = buildCard(previousCard);
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
