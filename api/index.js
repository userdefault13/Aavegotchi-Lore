/**
 * Vercel serverless entry — forwards /api/* to the Express app.
 * Rewrites in vercel.json set ?path=lore-worlds/canon etc.
 */
let boot;

function getApp() {
  if (!boot) {
    boot = (async () => {
      const { createApp, ensureIndexes } = require('../backend/server.js');
      await ensureIndexes().catch((err) => {
        console.error('MongoDB indexes:', err.message);
      });
      return createApp();
    })();
  }
  return boot;
}

module.exports = async (req, res) => {
  try {
    const app = await getApp();
    const url = new URL(req.url || '/', 'http://localhost');

    let pathParam = url.searchParams.get('path') ?? '';
    url.searchParams.delete('path');
    const restQs = url.searchParams.toString();

    let expressPath;
    if (pathParam) {
      expressPath = `/${pathParam}`.replace(/\/+/g, '/');
    } else {
      // Direct Express path (local tests) or /api with no path param
      expressPath = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
      expressPath = expressPath.replace(/\/+/g, '/') || '/';
    }
    if (restQs) expressPath += `?${restQs}`;

    req.url = expressPath;
    return app(req, res);
  } catch (err) {
    console.error('API bootstrap failed:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: err.message,
        code: err.code,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      }));
    }
  }
};
