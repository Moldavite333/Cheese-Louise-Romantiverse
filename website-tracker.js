(() => {
  const host = {'cheeselouisepod.com':'website','www.cheeselouisepod.com':'website','bingo.cheeselouisepod.com':'bingo'}[location.hostname];
  if (!host) return;
  const endpoint = 'https://wgvsnmukiaobcbyqhkkt.supabase.co/rest/v1/rpc/';
  async function send(path, body) {
    const response = await fetch(endpoint + path, {
      method:'POST', credentials:'omit', keepalive:true,
      headers:{apikey:'sb_publishable_3xcqfNu-mJPuDWivmlBXug_3Tw60QoM','Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Request failed');
  }

  window.clSubmitTrope = (trope, movie) => send('submit_website_trope', {p_trope:trope,p_movie:movie});
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;

  function cookie(name) {
    return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.slice(name.length + 1);
  }
  function save(name, value, age) {
    document.cookie = name + '=' + value + '; Domain=cheeselouisepod.com; Path=/; Secure; SameSite=Lax; Max-Age=' + age;
  }
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  const visitor = uuid.test(cookie('cl_visit')) ? cookie('cl_visit') : crypto.randomUUID();
  const params = new URLSearchParams(location.search);
  const clean = (value, limit) => (value || '').trim().replace(/[^a-zA-Z0-9_. -]/g,'').slice(0, limit);
  let referrer = '';
  try {referrer = new URL(document.referrer).hostname;} catch {}
  if (referrer === 'cheeselouisepod.com' || referrer.endsWith('.cheeselouisepod.com')) referrer = '';
  const source = clean(params.get('utm_source'),80) || referrer.slice(0,80) || 'direct';
  const campaign = clean(params.get('utm_campaign'),100);
  let session = uuid.test(cookie('cl_session')) ? cookie('cl_session') : crypto.randomUUID();
  let lastEvent = Date.now();
  save('cl_visit', visitor, 90*86400);
  function track(event) {
    if (Date.now() - lastEvent >= 1800000) session = uuid.test(cookie('cl_session')) ? cookie('cl_session') : crypto.randomUUID();
    lastEvent = Date.now();
    save('cl_session', session, 1800);
    send('record_website_event', {
      p_id:crypto.randomUUID(),p_visitor:visitor,p_session:session,p_host:host,
      p_event:event,p_source:source,p_campaign:campaign
    }).catch(() => {});
  }
  window.clWebsiteTrack = track;
  track('page_view');
  for (const type of ['click','auxclick']) document.addEventListener(type, event => {
    if ((type==='click'||event.button===1) && event.target.closest?.('a[data-episode-link]')) track('episode_link_clicked');
  });
})();
