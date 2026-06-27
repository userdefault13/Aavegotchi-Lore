export const GOTCHI_TEMPLATES = [
  {
    id: 'default',
    name: 'Lore Page',
    icon: '📄',
    runeFields: [],
    blocks: [{ type: 'prose', label: 'Lore', grid: { col: 1, row: 1, colSpan: 12, rowSpan: 6 } }],
    layout: { columns: 12, rowHeight: 48, gap: 8 },
  },
  {
    id: 'aavegotchi',
    name: 'Aavegotchi',
    icon: '👻',
    runeFields: [
      { id: 'tokenId', label: 'Token ID', type: 'text' },
      { id: 'brs', label: 'BRS', type: 'number' },
      { id: 'spiritForce', label: 'Spirit Force', type: 'text' },
      { id: 'kinship', label: 'Kinship', type: 'number' },
      { id: 'traits', label: 'Traits', type: 'textarea' },
      { id: 'wearables', label: 'Wearables', type: 'textarea' },
    ],
    blocks: [
      { type: 'image', label: 'Portrait', grid: { col: 1, row: 1, colSpan: 4, rowSpan: 4 } },
      { type: 'prose', label: 'Description', grid: { col: 5, row: 1, colSpan: 8, rowSpan: 3 } },
      { type: 'rune', runeId: 'spiritForce', label: 'Spirit Force', grid: { col: 5, row: 4, colSpan: 4, rowSpan: 2 } },
      { type: 'rune', runeId: 'traits', label: 'Traits', grid: { col: 9, row: 4, colSpan: 4, rowSpan: 2 } },
    ],
    layout: { columns: 12, rowHeight: 72, gap: 8 },
  },
  {
    id: 'realm-parcel',
    name: 'REALM Parcel',
    icon: '🏝️',
    runeFields: [
      { id: 'tokenId', label: 'Token ID', type: 'text' },
      { id: 'zone', label: 'Zone', type: 'select', options: ['Citaadel', 'Grid', 'Beyond'] },
      { id: 'district', label: 'District', type: 'text' },
      { id: 'size', label: 'Size', type: 'select', options: ['Humble', 'Reasonably Sized', 'Spacious'] },
      { id: 'threeWordName', label: 'Three-word Name', type: 'text' },
      { id: 'alchemicaBoost', label: 'Alchemica Boost', type: 'text' },
    ],
    blocks: [
      { type: 'prose', label: 'Description', grid: { col: 1, row: 1, colSpan: 8, rowSpan: 3 } },
      { type: 'map-pin', label: 'Map', grid: { col: 9, row: 1, colSpan: 4, rowSpan: 3 } },
    ],
    layout: { columns: 12, rowHeight: 72, gap: 8 },
  },
  {
    id: 'installation',
    name: 'Installation',
    icon: '🏗️',
    runeFields: [
      { id: 'type', label: 'Type', type: 'text' },
      { id: 'level', label: 'Level', type: 'number' },
      { id: 'recipeFud', label: 'FUD Cost', type: 'number' },
      { id: 'recipeFomo', label: 'FOMO Cost', type: 'number' },
      { id: 'recipeAlpha', label: 'ALPHA Cost', type: 'number' },
      { id: 'recipeKek', label: 'KEK Cost', type: 'number' },
      { id: 'utility', label: 'Utility', type: 'textarea' },
    ],
    blocks: [{ type: 'prose' }, { type: 'image' }],
  },
  {
    id: 'landmark',
    name: 'Landmark',
    icon: '🌀',
    runeFields: [
      { id: 'landmarkType', label: 'Landmark', type: 'select', options: ['Great Portal', 'Aarena', 'Phantastic Grounds', 'Other'] },
      { id: 'zone', label: 'Zone', type: 'select', options: ['Citaadel', 'Grid', 'Beyond'] },
    ],
    blocks: [
      { type: 'prose', label: 'Description', grid: { col: 1, row: 1, colSpan: 12, rowSpan: 3 } },
      { type: 'diagram', label: 'Relations', grid: { col: 1, row: 4, colSpan: 12, rowSpan: 3 } },
    ],
    layout: { columns: 12, rowHeight: 72, gap: 8 },
  },
  {
    id: 'lickquidator',
    name: 'Lickquidator',
    icon: '👅',
    runeFields: [
      { id: 'threat', label: 'Threat Level', type: 'select', options: ['Low', 'Medium', 'High', 'Boss'] },
      { id: 'appetite', label: 'Yield Appetite', type: 'text' },
    ],
    blocks: [{ type: 'prose' }],
  },
  {
    id: 'guild',
    name: 'Guild',
    icon: '⚔️',
    runeFields: [
      { id: 'district', label: 'Home District', type: 'text' },
      { id: 'members', label: 'Notable Members', type: 'textarea' },
    ],
    blocks: [{ type: 'prose' }],
  },
  {
    id: 'lore-event',
    name: 'Lore Event',
    icon: '📜',
    runeFields: [
      { id: 'eventType', label: 'Event', type: 'select', options: ['Great Battle', 'Channeling', 'Spillover', 'Prophecy', 'DAO Vote'] },
      { id: 'act', label: 'Act', type: 'select', options: ['Act I', 'Act II', 'Act III'] },
    ],
    blocks: [{ type: 'prose' }, { type: 'timeline' }],
  },
];

export const TOME_MEMO_TYPES = [
  { id: 'gotchi-pc', name: 'Gotchi PC', icon: '👻' },
  { id: 'lick-npc', name: 'Lick NPC', icon: '👅' },
  { id: 'parcel-scene', name: 'Parcel Scene', icon: '🏝️' },
  { id: 'installation-encounter', name: 'Installation', icon: '🏗️' },
  { id: 'dao-vote', name: 'DAO Vote Arc', icon: '🗳️' },
  { id: 'community-call', name: 'Community Call', icon: '📢' },
];

export const STARTER_WORLDS = [
  {
    id: 'gotchiverse-act-1',
    title: 'Gotchiverse Act I',
    description: 'Canon-lite skeleton: Citaadel, Grid, Great Portal, and the Prophecy.',
    pages: [
      { title: 'The Citaadel', templateId: 'landmark', runes: { landmarkType: 'Great Portal', zone: 'Citaadel' } },
      { title: 'The Grid', templateId: 'realm-parcel', runes: { zone: 'Grid' } },
      { title: 'Great Portal', templateId: 'landmark', runes: { landmarkType: 'Great Portal', zone: 'Citaadel' } },
      { title: 'The Prophecy', templateId: 'lore-event', runes: { eventType: 'Prophecy', act: 'Act I' } },
    ],
  },
  {
    id: 'homebrew-realm',
    title: 'Homebrew Realm',
    description: 'Blank canvas for your fan campaign.',
    pages: [],
  },
];

export const TAG_COLORS = ['#651FFF', '#FF6B9D', '#06B6D4', '#FCD34D', '#3685E3', '#EB367F', '#7F28CA', '#FFA133'];
