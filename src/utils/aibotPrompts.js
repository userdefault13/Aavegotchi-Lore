/** Build Aarcade AIBot pixel-art prompts for Gotchiverse lore. */

export function buildMapPinPrompt({ label, mapTitle, zone = 'Gotchiverse' }) {
  const subject = label || mapTitle || 'Gotchiverse location';
  return `pixel: Gotchiverse map icon — ${subject}, ${zone} zone, Aavegotchi pixel art style, top-down fantasy map marker, vibrant purple and cyan palette, clean readable silhouette on dark background`;
}

export function buildLandmarkPrompt({ label, zone = 'Gotchiverse' }) {
  return `pixel: Gotchiverse landmark — ${label}, ${zone}, Aavegotchi Gotchiverse pixel art, isometric cute fantasy, alchemica glow`;
}

export function buildPageIllustrationPrompt({ title, templateId, runes = {} }) {
  const zone = runes.zone || runes.landmarkType || '';
  const extra = zone ? `, ${zone}` : '';
  if (templateId === 'landmark') {
    return buildLandmarkPrompt({ label: title, zone: runes.zone || 'Gotchiverse' });
  }
  if (templateId === 'realm-parcel') {
    return `pixel: Gotchiverse REALM parcel scene — ${title}${extra}, humble pixel land tile, installations optional, purple realm aesthetic`;
  }
  if (templateId === 'aavegotchi') {
    return `pixel: Aavegotchi ghost character portrait — ${title}, cute haunted DeFi spirit, wearables, Gotchiverse background`;
  }
  return `pixel: Gotchiverse lore illustration — ${title}${extra}, Aavegotchi pixel art, purple and pink palette`;
}

export function buildMapBackgroundPrompt({ mapTitle, mapPreset }) {
  if (mapPreset === 'citaadel') {
    return 'pixel: Gotchiverse Citaadel district map texture overlay, top-down walled sanctuary, purple force field, parcel grid hints, Aavegotchi style';
  }
  return `pixel: Gotchiverse realm map region — ${mapTitle || 'Northern Grid'}, top-down fantasy cartography, cyan coast glow, pixel art`;
}
