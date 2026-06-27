# AarcadeGh-t integration (Phase 8)

Copy these into `~/dev/AarcadeGh-t` when merging gotchi-lore.

## 1. Router (`src/router/index.js`)

```js
import GotchiLoreHub from '@/views/GotchiLoreHub.vue';
// ...
{ path: '/gotchi-lore', name: 'gotchi-lore', component: GotchiLoreHub },
{ path: '/gotchi-lore/lore/:worldId?', redirect: (to) => to.params.worldId ? `/gotchi-lore?tab=lore&id=${to.params.worldId}` : '/gotchi-lore?tab=lore' },
{ path: '/gotchi-lore/tome/:chronicleId?', redirect: (to) => to.params.chronicleId ? `/gotchi-lore?tab=tome&id=${to.params.chronicleId}` : '/gotchi-lore?tab=tome' },
```

## 2. API (`api/server.js`)

```js
const loreWorldsRouter = require('./routes/lore-worlds');
// mount after other routes:
app.use('/lore-worlds', loreWorldsRouter);
app.use('/lore-pages', require('./routes/lore-pages'));
app.use('/tome-chronicles', require('./routes/tome-chronicles'));
app.use('/story-nodes', require('./routes/story-nodes'));
app.use('/realm-maps', require('./routes/realm-maps'));
app.use('/suite-assets', require('./routes/suite-assets'));
app.use('/gotchi-import', require('./routes/gotchi-import'));
```

Copy route files from `gotchi-lore/api/routes/` and append getters to `lib/mongodb.cjs`.

## 3. Vercel (`vercel.json`)

Add rewrites (mirror journey-builder pattern):

```json
{ "source": "/api/lore-worlds/:path*", "destination": "/api/lore-worlds?path=:path*" },
{ "source": "/api/lore-pages/:path*", "destination": "/api/lore-pages?path=:path*" },
{ "source": "/api/tome-chronicles/:path*", "destination": "/api/tome-chronicles?path=:path*" },
{ "source": "/api/story-nodes/:path*", "destination": "/api/story-nodes?path=:path*" }
```

## 4. Nav

Add link in Games hub or Creative admin: **Gotchi-Lore** → `/gotchi-lore`

## 5. Shared Mongo

Use same `MONGODB_URI` / `MONGO_DB_NAME`; collections are namespaced (`lore_worlds`, etc.).

## 6. Sync script

Run from gotchi-lore root:

```bash
./scripts/sync-to-aarcadeghst.sh
```
