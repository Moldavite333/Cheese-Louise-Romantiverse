# Cheese Louise — Visit the Romantiverse

Public audience-facing website for the **Cheese Louise** podcast.

## v0.1 goal

Build the Romantiverse homepage first: a responsive illustrated-town experience with clear navigation to Episodes, Romantiverse Bingo, The Rules, Upcoming Movies, the Cocktail Lounge, Shop, and About.

The public website will stay separate from Cheese Louise HQ. HQ remains the private production workspace; this site will eventually read only explicitly published content from Supabase.

## Publish an episode

Upload and schedule the episode in Buzzsprout. Once it is public, edit its entry in `podcast-promo.json` on the website's main branch.

- Set `listen` to the public episode page URL. This makes the episode and its paired drink visible.
- Set `audio` to the direct HTTPS episode audio URL from the podcast feed if you want an inline player.
- Set `bingo` to the movie's public Bingo link when available. Otherwise the link opens the main Bingo site.
- Add a `drink` with a name, ingredients, directions, and optional prep. The site creates the recipe link and the link back to the episode.
- Keep entries in release order. The first episode stays first, and the last published episode is featured on the homepage. Leave `listen` null until the episode should appear.

The draft Birder directions should be checked against the on air recipe before enabling episode one. Keep private material out of this public repository.
