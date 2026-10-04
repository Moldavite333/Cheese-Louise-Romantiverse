window.CHEESE_BINGO_CONFIG = {
  id: 'pumpkin-regatta-romance-2026',
  movie: 'Pumpkin Regatta Romance',
  network: 'Hallmark+ Amazon Channel',
  season: 'Fall',
  holiday: 'Halloween',
  subtitle: 'This week in the Romantiverse',
  description: 'Nadine, daughter of a boat shop owner, and Ethan, a pumpkin farmer, team up to heal a family feud and revive the town’s Pumpkin Regatta.',
  freeSpace: 'CHEESE LOUISE!',

  // These movie-defining traits appear on every card.
  required: [
    'family-farm-or-ranch',
    'family-feud',
    'festival',
    'contest-or-competition'
  ],

  // These are more likely to appear, but are NOT guaranteed.
  weighted: [
    'wholesome-labor-montage',
    'town-knows-before-they-do',
    'save-family-business',
    'small-town-return',
    'grand-romantic-gesture'
  ],

  // When someone taps New Card, replace at least this many non-free traits
  // whenever the weekly pool is large enough to allow it.
  minTraitChanges: 8,

  pool: [
    { id:'big-promotion-vs-hometown', label:'Big promotion vs hometown' },
    { id:'career-or-love-ultimatum', label:'Career-or-love ultimatum' },
    { id:'boss-sends-them-home', label:'Boss sends them home' },
    { id:'work-assignment-creates-romance', label:'Work assignment creates romance' },
    { id:'dead-parent-grandparent', label:'Dead parent / grandparent' },
    { id:'estranged-family', label:'Estranged family' },
    { id:'sick-parent-grandparent', label:'Sick parent or grandparent' },
    { id:'inherited-family-business', label:'Inherited family business' },
    { id:'bakery', label:'Bakery' },
    { id:'inn-or-bnb', label:'Inn or B&B' },
    { id:'coffee-shop', label:'Coffee shop' },
    { id:'bookstore', label:'Bookstore' },
    { id:'family-restaurant', label:'Family restaurant' },
    { id:'flower-shop', label:'Flower shop' },
    { id:'small-town-newspaper', label:'Small-town newspaper' },
    { id:'event-planner', label:'Event planner' },
    { id:'big-city-corporate-job', label:'Big-city corporate job' },
    { id:'small-town-return', label:'Small-town return' },
    { id:'family-farm-or-ranch', label:'Family farm or ranch' },
    { id:'saved-town-fundraiser', label:'Saved-the-town fundraiser' },
    { id:'save-family-business', label:'Save the family business' },
    { id:'inheritance-with-conditions', label:'Inheritance with conditions' },
    { id:'mistaken-identity', label:'Mistaken identity' },
    { id:'contest-or-competition', label:'Contest or competition' },
    { id:'property-developer-villain', label:'Property developer villain' },
    { id:'convenient-storm-road-closure', label:'Convenient storm or road closure' },
    { id:'one-sentence-misunderstanding', label:'Misunderstanding one sentence could fix' },
    { id:'festival', label:'Festival' },
    { id:'family-feud', label:'Family feud' },
    { id:'childhood-sweetheart', label:'Childhood sweetheart' },
    { id:'old-flame', label:'Old flame' },
    { id:'fake-dating', label:'Fake dating' },
    { id:'friends-to-lovers', label:'Friends to lovers' },
    { id:'rivals-to-lovers', label:'Rivals to lovers' },
    { id:'accidental-roommates', label:'Accidental roommates' },
    { id:'single-parent-romance', label:'Single-parent romance' },
    { id:'matchmaking-scheme', label:'Matchmaking scheme' },
    { id:'interrupted-kiss', label:'Interrupted kiss' },
    { id:'ex-worst-time', label:'Ex appears at worst time' },
    { id:'child-plays-matchmaker', label:'Child plays matchmaker' },
    { id:'town-knows-before-they-do', label:'Town knows before they do' },
    { id:'only-one-bed', label:'Only one bed' },
    { id:'wholesome-labor-montage', label:'Wholesome labor montage' },
    { id:'third-act-breakup', label:'Third-act breakup' },
    { id:'grand-romantic-gesture', label:'Grand romantic gesture' }
  ]
};
