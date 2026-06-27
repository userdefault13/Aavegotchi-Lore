const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const { ensureIndexes } = require('../lib/mongodb.cjs');

const { attachAuth } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const loreWorldsRouter = require('./routes/lore-worlds');
const lorePagesRouter = require('./routes/lore-pages');
const tomeChroniclesRouter = require('./routes/tome-chronicles');
const storyNodesRouter = require('./routes/story-nodes');
const realmMapsRouter = require('./routes/realm-maps');
const suiteAssetsRouter = require('./routes/suite-assets');
const gotchiImportRouter = require('./routes/gotchi-import');
const loreInventoryRouter = require('./routes/lore-inventory');
const loreDiagramsRouter = require('./routes/lore-diagrams');
const loreProposalsRouter = require('./routes/lore-proposals');
const aibotRouter = require('./routes/aibot');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(attachAuth);
  app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
  app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'gotchi-lore-api' }));

  app.use('/auth', authRouter);
  app.use('/lore-worlds', loreWorldsRouter);
  app.use('/lore-pages', lorePagesRouter);
  app.use('/tome-chronicles', tomeChroniclesRouter);
  app.use('/story-nodes', storyNodesRouter);
  app.use('/realm-maps', realmMapsRouter);
  app.use('/suite-assets', suiteAssetsRouter);
  app.use('/lore-inventory', loreInventoryRouter);
  app.use('/lore-diagrams', loreDiagramsRouter);
  app.use('/lore-proposals', loreProposalsRouter);
  app.use('/gotchi-import', gotchiImportRouter);
  app.use('/aibot', aibotRouter);

  return app;
}

module.exports = { createApp, ensureIndexes };

if (require.main === module) {
  const PORT = process.env.PORT || 3004;
  ensureIndexes()
    .then(() => createApp().listen(PORT, () => console.log(`gotchi-lore API on http://localhost:${PORT}`)))
    .catch((err) => {
      console.error('MongoDB:', err.message);
      createApp().listen(PORT, () => console.log(`gotchi-lore API on http://localhost:${PORT} (degraded)`));
    });
}
