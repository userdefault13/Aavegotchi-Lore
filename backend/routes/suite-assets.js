const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const { getSuiteAssetsCollection } = require('../lib/mongodb.cjs');
const { getOwnerWallet } = require('../middleware/owner');

const router = express.Router();
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'gotchi-lore-uploads')
  : path.join(__dirname, '..', '..', 'public', 'uploads');
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch {
  /* read-only or already exists */
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

function toAsset(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    filename: doc.filename,
    url: doc.url,
    mimeType: doc.mimeType,
    ownerWallet: doc.ownerWallet,
    createdAt: doc.createdAt?.toISOString?.(),
  };
}

router.get('/', async (req, res) => {
  try {
    const coll = await getSuiteAssetsCollection();
    const wallet = getOwnerWallet(req);
    const filter = wallet ? { ownerWallet: wallet } : {};
    const items = await coll.find(filter).sort({ createdAt: -1 }).limit(120).toArray();
    res.json(items.map(toAsset));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `/uploads/${req.file.filename}`;
    const coll = await getSuiteAssetsCollection();
    const now = new Date();
    const doc = {
      filename: req.file.filename,
      url,
      mimeType: req.file.mimetype,
      ownerWallet: getOwnerWallet(req),
      createdAt: now,
    };
    const result = await coll.insertOne(doc);
    res.status(201).json({ ...toAsset({ _id: result.insertedId, ...doc }), url, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getSuiteAssetsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const filePath = path.join(uploadDir, doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await coll.deleteOne({ _id: doc._id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/pdf/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-${id}.pdf"`);
  res.send(Buffer.from(`%PDF-1.4\n% gotchi-lore export stub\n% type=${type} id=${id}\n`));
});

module.exports = router;
