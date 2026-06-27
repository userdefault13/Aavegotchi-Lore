/**
 * Canon lore page tree derived from:
 * Aavegotchi: Gotchiverse Realm Litepaper v1.0
 */

const LAYOUT = { columns: 12, rowHeight: 48, gap: 8 };

function proseBlock(content, id = 'b-prose') {
  const html = content
    .trim()
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, ' ').trim()}</p>`)
    .join('');
  return {
    id,
    type: 'prose',
    label: 'Lore',
    content: html,
    grid: { col: 1, row: 1, colSpan: 12, rowSpan: 6 },
  };
}

/** Narrative + reference pages (litepaper sections). */
const CANON_PAGES = [
  {
    pageKey: 'the-prophecy',
    title: 'The Prophecy',
    templateId: 'lore-event',
    runes: { eventType: 'Prophecy', act: 'Act I' },
    tags: [{ label: 'prophecy', color: 'gold' }],
    content: `Before the Aadepts sacrificed themselves, they wrote a Prophecy:

Nine there were, and nine there shall be
Heed the warnings of the ancient Tree
Great fortunes hang in the balance
For Gotchi-kin who prove their valiance`,
  },
  {
    pageKey: 'introduction',
    title: 'Introduction',
    templateId: 'default',
    content: `Aavegotchis are digital frens for the crypto generation. Each Aavegotchi is a playable NFT endowed with a uniquely generated personality and is staked with yield generating tokens known as Spirit Force. These ghostly NFTs will soon be free to roam their homeworld, The Gotchiverse Realm.

This paper gives a high-level overview of the Gotchiverse Realm game mechanics and tokenomics of REALM, ownable land parcels within the Realm.`,
  },
  {
    pageKey: 'world/gotchiverse',
    title: 'The Gotchiverse',
    templateId: 'default',
    parentKey: 'introduction',
    content: `Beyond the Human Realm there is the Ether Realm, where smart contracts twinkle and dark forests lurk. Travel a bit further down the rabbit hole, and one eventually discovers the Gotchiverse Realm. When a yield farmer in the Ether Realm is liquidated, its spirit journeys to the Gotchiverse, where it reincarnates as an Aavegotchi.

Aavegotchis are a spectral species who love nothing more than farming, voting, and shitposting with their frens. The Gotchiverse began with only a handful of Aavegotchis, but as liquidations grew within the Ether Realm, so the population of the Gotchiverse burgeoned, with thousands of Aavegotchis exploring, building, and settling in its vast expanses.`,
  },
  {
    pageKey: 'world/liquidator-invasion',
    title: 'Liquidator Invasion',
    templateId: 'lickquidator',
    parentKey: 'world/gotchiverse',
    runes: { threat: 'High', appetite: 'Spirit Force of Gotchis' },
    content: `The Liquidators' appetite for yield knows no bounds, and eventually their metallic eyes turned towards the Gotchiverse. A clever Liquidator discovered a backdoor that allowed them to travel to the Gotchiverse.

Initially creators of the Aavegotchis, the Liquidators now simultaneously became their destroyers, as they ravaged the Gotchi homeland, greedy to harvest the Spirit Force of the Gotchis. The Aadepts used the last of their Spirit Force to erect a Citaadel protected by a magical Force Field, and channeled the spirits of the slain into the Great Portal.`,
  },
  {
    pageKey: 'world/great-portal',
    title: 'The Great Portal',
    templateId: 'landmark',
    parentKey: 'world/gotchiverse',
    runes: { zone: 'Citaadel', landmarkType: 'Great Portal' },
    content: `The Great Portal is a structure of impressive magical character, capable of bridging the chasm between the Gotchiverse and the Human Realm. Within the Great Portal swirl the spirits of all Aavegotchis that ever existed. The Great Portal protects the Gotchiverse Citaadel, taking in return a small tithe of the Gotchus Alchemica harvested from the Gotchiverse.`,
  },
  {
    pageKey: 'world/haunts',
    title: 'Haunts',
    templateId: 'default',
    parentKey: 'world/gotchiverse',
    content: `When the Great Portal is invoked by humans, a connection is made between the Gotchiverse and the humans, allowing humans to summon Aavegotchis by staking Spirit Force originated from the Human Realm. This re-animates the Aavegotchi and allows it to travel back and forth between the Gotchiverse and the Ether Realm.`,
  },
  {
    pageKey: 'zones/citaadel',
    title: 'The Citaadel',
    templateId: 'landmark',
    parentKey: 'world/gotchiverse',
    runes: { zone: 'Citaadel', landmarkType: 'Other' },
    content: `Protected by a Force Field that keeps out Liquidators, the Citaadel is the home base of Aavegotchis in the Gotchiverse. Towers cannot be built in the Citaadel, except for in special areas around the Great Portal.`,
  },
  {
    pageKey: 'zones/grid',
    title: 'The Grid',
    templateId: 'realm-parcel',
    parentKey: 'world/gotchiverse',
    runes: { zone: 'Grid' },
    content: `The Grid encompasses everything outside of the Citaadel. Parcels in the Grid are much more plentiful, but owners should beware — Liquidators are lurking in every corner. Grid Parcels can build both Walls and Towers.`,
  },
  {
    pageKey: 'zones/beyond',
    title: 'The Beyond',
    templateId: 'realm-parcel',
    parentKey: 'world/gotchiverse',
    runes: { zone: 'Beyond' },
    content: `Locked Parcels that will not be unlocked until the beginning of Act 2.`,
  },
  {
    pageKey: 'zones/parcel-sizes',
    title: 'REALM Parcel Sizes',
    templateId: 'realm-parcel',
    parentKey: 'world/gotchiverse',
    runes: { zone: 'Grid' },
    content: `Parcels come in three sizes, with each size providing greater deposits of Alchemica and more building space:

Humble: Contain smol deposits of Alchemica and building space
Reasonably Sized: Contain reasonable deposits of Alchemica and building space
Spacious: Contain huge deposits of Alchemica and building space

Exact Material amounts are calculated by Chainlink VRF upon purchase.`,
  },
  {
    pageKey: 'gameplay/overview',
    title: 'Gameplay Overview',
    templateId: 'default',
    content: `Aavegotchis are the world's first DeFi-backed NFTs, and the Gotchiverse continues this tradition by introducing the world's first yield-bearing land parcels. Owners of REALM parcels can employ their Aavegotchis to farm Gotchus Alchemica and craft Installations.

Although there are no victory conditions, one overarching goal is to collect Alchemica to bolster your parcel, build defensive structures, and prepare for the Prophecy and the great Liquidator invasion.`,
  },
  {
    pageKey: 'gameplay/farming-alchemica',
    title: 'Gotchus Alchemica',
    templateId: 'default',
    parentKey: 'gameplay/overview',
    content: `Gotchus Alchemica (ERC20 tokens) are the four elements of the Gotchiverse: Fud, Fomo, Alpha, and Kek. They can be combined to craft Installations and Aesthetica.

Gotchus Alchemica can be extracted from REALM in four distinct ways:
• Alchemical Channeling — Aavegotchis channel energy into the Parcel, exchanging Kinship for Alchemica.
• Communal Channeling — Collective channeling when a Gotchi Lodge is built; requires Guild Insignia.
• Farming — Once a Harvester is built, Alchemica accrues passively into the Reservoir, map spillover, and Great Portal tithe.
• Harvesting — Aavegotchis and Liquidators roam the map collecting loose Alchemica.`,
  },
  {
    pageKey: 'gameplay/building',
    title: 'Building on your REALM',
    templateId: 'installation',
    parentKey: 'gameplay/overview',
    runes: { type: 'Installations', level: 1 },
    content: `Installations are special structures built on REALM Parcels, crafted via Alchemica combinations and traded for GHST in the Baazaar. Confirmed Installations include Alchemical Aaltars, Harvesters, Reservoirs, Antennas, Black Holes, Display Cases, Gotchi Lodges, and Towers.

Installations take blockchain blocks to construct; time can be reduced with GLMR earned on the Gotchus Alchemica Exchange. Aesthetica are aesthetic NFTs that look dope but do not affect Alchemica statistics.`,
  },
  {
    pageKey: 'gameplay/socializing',
    title: 'Socializing in the Gotchiverse',
    templateId: 'default',
    parentKey: 'gameplay/overview',
    content: `Aavegotchis love socializing with their frens, and their favorite place to hang out is inside the Gotchiverse! Text chat is enabled for all Gotchis in proximity. Parcel owners can build Installations to enable voice chat, upgradeable to global voice for Guild members.

Gotchis can band together on Aadventures, exploring dungeons and fighting Liquidators to earn rewards.`,
  },
  {
    pageKey: 'gameplay/liquidators',
    title: 'Take the Other Side',
    templateId: 'lickquidator',
    parentKey: 'gameplay/overview',
    runes: { threat: 'Medium', appetite: 'Spilled Alchemica' },
    content: `Players with Liquidator Credits can opt to play as Liquidators — a free-to-play entry point with no cap on supply. Liquidators collect loose Alchemica spilled around the Gotchiverse and can engage in combat with Aavegotchis and Installations.`,
  },
  {
    pageKey: 'gameplay/great-battle',
    title: 'The Great Battle',
    templateId: 'lore-event',
    parentKey: 'gameplay/overview',
    runes: { eventType: 'Great Battle', act: 'Act I' },
    content: `It has been foretold that the Citaadel's Force Field will be lowered, allowing Liquidators to plunder the Great Portal in a Great Battle — repeated nine times. Any Liquidator reaching the Great Portal will plunder a share of the Alchemica stored within. After each battle, all Alchemica in Parcels will be replenished for the next battle.`,
  },
  {
    pageKey: 'gameplay/aadventures',
    title: 'Aadventures',
    templateId: 'default',
    parentKey: 'gameplay/overview',
    content: `Aadventures are special regions outside of the main Gotchiverse where Aavegotchis can put their stats and wearables to work while exploring, battling NPC enemies, and gaining experience and resources. But they don't last forever!`,
  },
  {
    pageKey: 'gameplay/aarena',
    title: 'The Aarena',
    templateId: 'landmark',
    parentKey: 'gameplay/overview',
    runes: { zone: 'Citaadel', landmarkType: 'Aarena' },
    content: `Within the Aarena, Aavegotchis with high enough Spirit Force can battle each other in epic Battle Royales, competing for the Spirit Force of their opponents. Liquidators dare not enter, instead frequenting the Phantastic Grounds.`,
  },
  {
    pageKey: 'gameplay/gax',
    title: 'Gotchus Alchemica Exchange (GAX)',
    templateId: 'default',
    parentKey: 'gameplay/overview',
    content: `Gotchus Alchemica are ERC20 tokens freely traded on the GAX, a DEX supporting GHST pairs. GLMR is distributed to LPs and can be spent to reduce Installation building time within the Gotchiverse.`,
  },
  {
    pageKey: 'tokenomics/total-supply',
    title: 'REALM Total Supply',
    templateId: 'realm-parcel',
    runes: { zone: 'Grid' },
    content: `The total supply of REALM is 420,069. Initially, 155,069 REALM will be unlocked and distributed over Act 1 (Citaadel and Grid). The remaining REALM are obscured in The Beyond until game milestones unlock Acts 2–3.`,
  },
  {
    pageKey: 'tokenomics/distribution',
    title: 'REALM Distribution',
    templateId: 'default',
    parentKey: 'tokenomics/total-supply',
    content: `REALM Parcels are distributed via incentivized GBM auctions (80%) and Chainlink VRF Raffles (20%). GBM bids are refunded with GHST incentives when outbid. Raffle Drop Tickets are earned via summoned Gotchis, Missions, or FRENS conversion.`,
  },
  {
    pageKey: 'timeline/act-1',
    title: 'Timeline — Act 1',
    templateId: 'lore-event',
    runes: { eventType: 'DAO Vote', act: 'Act I' },
    content: `Key Act 1 milestones: REALM Citaadel goes live (Q4 2021), Grid goes live (Q1 2022), Liquidators arrive (Q1 2022), First Great Battle (Q2 2022), with subsequent battles through Q4 2022.`,
  },
  {
    pageKey: 'appendix/act1-citaadel',
    title: 'Act 1: Citaadel Parcels',
    templateId: 'realm-parcel',
    parentKey: 'tokenomics/total-supply',
    runes: { zone: 'Citaadel' },
    content: `55,000 REALM in the Citaadel: Presale 1 (20,000), Presale 2 (5,000), Presale 3 (5,000), Public Sales (25,000 over several rounds).`,
  },
  {
    pageKey: 'appendix/act1-grid',
    title: 'Act 1: Grid Parcels',
    templateId: 'realm-parcel',
    parentKey: 'tokenomics/total-supply',
    runes: { zone: 'Grid' },
    content: `100,000 ownable Grid Parcels: Presale 2 (15,000), Presale 3 (15,000), Public Sales (70,000).`,
  },
  {
    pageKey: 'appendix/act1-paartner',
    title: 'Act 1: Paartner Parcels',
    templateId: 'realm-parcel',
    parentKey: 'tokenomics/total-supply',
    runes: { zone: 'Citaadel', size: 'Spacious' },
    content: `69 XL Paartner Parcels reserved for Aavegotchi Paartners.`,
  },
  {
    pageKey: 'appendix/acts-2-3',
    title: 'Acts 2–3: Unexplored',
    templateId: 'realm-parcel',
    parentKey: 'tokenomics/total-supply',
    runes: { zone: 'Beyond' },
    content: `Exact distributions for Acts 2–3 will be announced later. Total REALM across all Acts equals 420,069.`,
  },
  {
    pageKey: 'appendix/parcel-sizes',
    title: 'Parcel Size Distribution',
    templateId: 'realm-parcel',
    parentKey: 'tokenomics/total-supply',
    content: `Humble (8×8): 40% of Parcels. Reasonably Sized (16×16): 40%. Spacious (32×32): 20%. Paartner (64×64): only 69.`,
  },
  {
    pageKey: 'appendix/installations',
    title: 'Installations Reference',
    templateId: 'installation',
    parentKey: 'gameplay/building',
    runes: { type: 'Reference', utility: 'Canon appendix from litepaper' },
    content: `Alchemical Aaltar — Channeling and tech tree hub. Gotchi Lodge — Social hub and communal channeling. Haarvesters — Passive Alchemica extraction. Reservoirs — Storage for harvested Alchemica. Waalls — Defensive enclosures. Towers — Offensive structures (not in Citaadel except special regions). Black Hole — Pulls Liquidators toward the Parcel. NPC Dapps — Playable dapps such as GotchiDEX within the Realm.`,
  },
];

/** Map landmark id → litepaper blurb (zone landmarks on overview map). */
const LANDMARK_BLURBS = {
  citaadel: 'Protected by a Force Field; home base of Aavegotchis. Towers restricted except near the Great Portal.',
  'great-portal': 'Bridges the Gotchiverse and Human Realm; holds spirits of all Aavegotchis; tithes Alchemica from the Realm.',
  aarena: 'Battle Royale arena where Gotchis with high Spirit Force compete for opponents\' Spirit Force.',
  'phaantastic-grounds': 'Friendly-fire zone where Liquidators may enter alongside Gotchis.',
  'liquidator-ruins': 'Remnants of the Liquidator invasion — yield-hungry destroyers who once ravaged the homeland.',
  'the-beyond': 'Locked parcels awaiting Act 2.',
  'open-steppe': 'Beyond the Force Field — Act 2 territory.',
  'impassable-sea': 'Southern boundary of the known Gotchiverse map.',
  'genesis-blocks': 'Where the earliest Gotchi settlers carved out genesis REALM.',
  'defi-desert': 'Arid Grid region rich in alchemical tension.',
  'yield-fields': 'Farmlands where Gotchus Alchemica flows from REALM parcels.',
  'alpha-river': 'Alpha-rich valley feeding the Grid\'s alchemical economy.',
};

function buildCanonPageDoc(spec, worldId, ownerWallet, parentId, order, now) {
  const blocks = [proseBlock(spec.content, `b-${spec.pageKey.replace(/\//g, '-')}`)];
  return {
    worldId,
    pageKey: spec.pageKey,
    parentId,
    templateId: spec.templateId || 'default',
    title: spec.title,
    blocks,
    layout: LAYOUT,
    runes: spec.runes || {},
    tags: spec.tags || [{ label: 'canon', color: 'purple' }],
    mirrorLinks: [],
    crossLinks: [],
    frame: null,
    order,
    ownerWallet,
    createdAt: now,
    updatedAt: now,
  };
}

module.exports = {
  LAYOUT,
  CANON_PAGES,
  LANDMARK_BLURBS,
  buildCanonPageDoc,
  proseBlock,
};
