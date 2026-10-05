(() => {
  const art = {
    pumpkins:'🎃','pumpkin-patch':'🎃','pumpkin-carving':'🎃','pumpkin-food':'🧁',
    'fall-festival':'🎪','town-event':'🎪',hayride:'🛻','corn-maze':'🌽','apple-picking':'🍎','candy-apples':'🍎','apple-cider':'🍺',
    'cozy-drink':'☕','coffee-shop':'☕',bakery:'🥧','plaid-flannel':'👕','cozy-sweater':'🧶','scarf-weather':'🧣',boots:'🥾',
    'scenic-leaves':'🍂','leaf-pile':'🍁','fall-decor':'🍂',wreath:'🍁','string-lights':'✨',
    'small-town':'🏘️','hometown-return':'🧳','big-city-job':'🏙️','city-vs-home':'↔️','family-business':'🏪','save-business':'🏪','family-farm':'🌾','inn-bnb':'🏡','main-street':'🏘️',
    'old-flame':'❤️','childhood-sweetheart':'💘','rivals-to-lovers':'⚔️','friends-to-lovers':'💕','competitive-flirting':'🏆','forced-together':'🤝','town-matchmaking':'💞','family-matchmaking':'💞','shared-blanket':'🧣',
    'almost-kiss':'💋','interrupted-kiss':'💋',misunderstanding:'💬','career-or-love':'↔️','grand-gesture':'🎁','community-saves-day':'🤝','family-legacy':'🌳','town-knows':'👀','wholesome-work':'🧹',
    'empty-coffee-cup':'🥤','perfect-weather':'☀️','outdoor-date':'🧺','bonfire-firepit':'🔥',barn:'🛖',dog:'🐕','farmers-market':'🧺','pie-contest':'🥧','friendly-competition':'🏆','festival-crisis':'🚨'
  };

  function fallback(label='') {
    const s = String(label).toLowerCase();
    if (s.includes('pumpkin')) return '🎃';
    if (s.includes('apple')) return '🍎';
    if (s.includes('coffee') || s.includes('drink')) return '☕';
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

  window.romantiverseTraitIconDataUri = function(trait) {
    const symbol = art[String(trait?.id || '')] || fallback(trait?.label || trait?.name || '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="18" fill="#f4ead1"/><rect x="4" y="4" width="120" height="120" rx="15" fill="none" stroke="#173f36" stroke-width="4"/><text x="64" y="78" text-anchor="middle" font-size="58" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${symbol}</text><path d="M12 113c28 6 76 6 104 0" fill="none" stroke="#c43e46" stroke-width="3" opacity=".25"/></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };
})();