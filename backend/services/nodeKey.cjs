const { slugSegment, generatePageKey, uniquifyPageKey } = require('./pageKey.cjs');

function generateNodeKey(title, parentNodeKey) {
  return generatePageKey(title, parentNodeKey);
}

module.exports = { slugSegment, generateNodeKey, uniquifyNodeKey: uniquifyPageKey };
