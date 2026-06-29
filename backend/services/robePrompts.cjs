/** Server-side storyboard prompt builder (mirrors frontend aibotPrompts). */

function buildStoryboardFramePrompt({ sceneTitle, sceneContent, loreTitles = [], zone = '' }) {
  const loreBit = loreTitles.length ? `, referencing ${loreTitles.slice(0, 3).join(', ')}` : '';
  const zoneBit = zone ? `, ${zone} zone` : '';
  const snippet = (sceneContent || '').slice(0, 120).replace(/\s+/g, ' ').trim();
  const context = snippet ? ` — ${snippet}` : '';
  return `pixel: Gotchiverse storyboard panel — ${sceneTitle || 'scene'}${zoneBit}${loreBit}${context}, cinematic 16:9 composition, Aavegotchi pixel art, purple and cyan palette, readable silhouettes`;
}

module.exports = { buildStoryboardFramePrompt };
