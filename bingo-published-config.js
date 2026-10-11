// Load the latest Bingo card published from Cheese Louise HQ before the game boots.
window.CHEESE_BINGO_CONFIG_READY = (async () => {
  const url='https://wgvsnmukiaobcbyqhkkt.supabase.co/rest/v1/published_bingo_cards?select=id,movie_title,season,holiday,description,pool,published_at&order=published_at.desc&limit=1';
  const key='sb_publishable_3xcqfNu-mJPuDWivmlBXug_3Tw60QoM';
  try{
    const response=await fetch(url,{headers:{apikey:key}});
    if(!response.ok) throw new Error(`Published Bingo request failed: ${response.status}`);
    const rows=await response.json();
    const row=rows?.[0];
    if(!row || !Array.isArray(row.pool) || row.pool.length<24) return;

    window.CHEESE_BINGO_CONFIG = {
      id:`published-${row.id}`,
      movie:row.movie_title || 'Romantiverse Bingo',
      network:'Cheese Louise',
      season:row.season || '',
      holiday:row.holiday || '',
      subtitle:'This week in the Romantiverse',
      description:row.description || `A published Cheese Louise Bingo card for ${row.movie_title || 'this week'}.`,
      freeSpace:'CHEESE LOUISE!',
      required:[],
      weighted:[],
      minTraitChanges:8,
      pool:row.pool
    };
  }catch(error){
    console.warn('Could not load published Bingo card; using the built-in fallback.',error);
  }
})();
