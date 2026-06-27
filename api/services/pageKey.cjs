/** Stable page keys for fork diffing — unique within a world. */

function slugSegment(text) {
  return (text || 'page')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'page';
}

function generatePageKey(title, parentPageKey) {
  const seg = slugSegment(title);
  return parentPageKey ? `${parentPageKey}/${seg}` : seg;
}

function uniquifyPageKey(baseKey, used) {
  if (!used.has(baseKey)) return baseKey;
  let i = 2;
  while (used.has(`${baseKey}-${i}`)) i += 1;
  return `${baseKey}-${i}`;
}

module.exports = { slugSegment, generatePageKey, uniquifyPageKey };
