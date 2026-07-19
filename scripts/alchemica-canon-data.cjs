/**
 * Gotchus Alchemica lore expansion + Factorio-style Foundry gameplay framing.
 * Nested under gameplay/farming-alchemica in the canon tree.
 *
 * Canon anchors (litepaper / wiki):
 * - Four Alchemica: FUD, FOMO, ALPHA, KEK
 * - Extraction: Channeling, Communal Channeling, Farming, Harvesting
 * - Installations: Aaltar, Harvester, Reservoir, etc.
 * - Great Portal tithe + spillover
 *
 * Expansion (marked as design lore for factory loop):
 * - Elemental ecology and temperament of each Alchemica
 * - Alchemical Guild & Foundry doctrine
 * - Conveyor / refining / defense loops inspired by factory games
 */

const ALCHEMICA_ROOT = 'gameplay/farming-alchemica';

/** Lore pages for gotchiverse-canon (lore_pages collection). */
const ALCHEMICA_PAGES = [
  {
    pageKey: `${ALCHEMICA_ROOT}/ecology`,
    title: 'Alchemica Ecology',
    templateId: 'default',
    parentKey: ALCHEMICA_ROOT,
    tags: [
      { label: 'alchemica', color: 'gold' },
      { label: 'canon-expansion', color: 'cyan' },
    ],
    content: `Gotchus Alchemica are not inert ores. They are living residues of the Ether Realm — burned tokens that decomposed in the Burn Address until they became the building blocks of the Nether Realm itself.

Where Spirit Force animates a Gotchi, Alchemica animates the land. Every REALM Parcel is a thin crust over deeper veins. Surveying reveals deposits; Channeling wakes them; Farming draws them into Reservoirs; Spillover flings loose motes across the map for scavengers and Lickquidators alike.

The Great Portal takes a tithe of harvested Alchemica. That tribute is not theft — it is the price of the Force Field. Without the flow of Alchemica through Portal and Parcel, the Gotchiverse's infrastructure starves and the Citaadel's defenses thin.`,
  },
  {
    pageKey: `${ALCHEMICA_ROOT}/four-elements`,
    title: 'The Four Elements',
    templateId: 'default',
    parentKey: ALCHEMICA_ROOT,
    tags: [{ label: 'alchemica', color: 'gold' }],
    content: `Four Alchemica compose the Gotchiverse. Each carries a temperament that shapes how Gotchis farm, craft, and defend.

FUD (Fear, Uncertainty, Doubt) — Dense, stubborn, and hard to ignite. Excellent for Waalls, foundations, and anything that must hold under pressure. Veins of FUD settle in shadowed Caaverns and Defi Desert basins. Channelers say FUD resists greed; rush it and the yield collapses.

FOMO (Fear Of Missing Out) — Volatile and quick to spill. Powers Harvesters, Antennas, and anything that accelerates production. FOMO deposits chase Spillover events; nomads who follow the glow often find fortune — or Lickquidators waiting at the edge of the spill.

ALPHA (Inside knowledge, advantage) — Rare, sharp, and pattern-seeking. Favored for Aaltars, research Installations, and tech-tree breakthroughs. ALPHA veins pulse near ancient landmarks and Portal-adjacent parcels. Misused ALPHA breeds brittle machines that look clever until they fail in a Great Battle.

KEK (Laughter, meme magic) — Light, contagious, and socially catalytic. Strengthens Lodges, communal Channeling, and morale tech. KEK thrives where Gotchis gather — Rofl Reefs, festivals, and joke-war camps. Without KEK in the mix, Foundries run cold and Kinship withers.`,
  },
  {
    pageKey: `${ALCHEMICA_ROOT}/extraction`,
    title: 'Extraction Paths',
    templateId: 'default',
    parentKey: ALCHEMICA_ROOT,
    tags: [{ label: 'alchemica', color: 'gold' }],
    content: `Canon names four ways Alchemica leaves the land:

Alchemical Channeling — A Gotchi pours Kinship into a Parcel through an Alchemical Aaltar, coaxing deposits to surface. It is ritual and labor: timing, trait affinity, and Parcel richness all matter.

Communal Channeling — A Gotchi Lodge turns private ritual into a guild rite. Guild Insignia unlock shared pulses that wake wider veins, at the cost of coordination and spill risk.

Farming — Haarvesters pull Alchemica passively into Reservoirs. A fraction spills onto the map; another fraction travels as tithe toward the Great Portal. Farming is the backbone of any long-running Foundry.

Harvesting — Loose Alchemica on the ground can be scooped by roaming Gotchis — and by Lickquidators. Every efficient factory creates scavenger opportunities for the enemy.`,
  },
  {
    pageKey: `${ALCHEMICA_ROOT}/guild`,
    title: 'The Alchemical Guild',
    templateId: 'default',
    parentKey: ALCHEMICA_ROOT,
    tags: [
      { label: 'alchemica', color: 'gold' },
      { label: 'faction', color: 'purple' },
    ],
    content: `After the Aadepts fell, Parcel owners who refused to treat Alchemica as mere loot formed the Alchemical Guild. They keep Moona the Channeler's rites, survey ledgers, and the doctrine of balanced ratios: no Foundry should run on a single element.

Guild ranks (working titles):
• Vein-Seers — Survey specialists who map deposits without stripping them barren.
• Channel-Keepers — Aaltar ritualists who pace Kinship so parcels recover between pulses.
• Foundry Wrights — Installation engineers who chain Haarvesters, Reservoirs, and craft nodes into closed loops.
• Tithe Wardens — Accountants of the Portal share; they argue that skimping on tithe invites Force Field flicker.

Guild conflict with Grid freebooters is constant. Freebooters maximize short-term Spillover harvests; the Guild prefers sustainable loops that still feed the Portal before the next Great Battle.`,
  },
  {
    pageKey: `${ALCHEMICA_ROOT}/foundry-doctrine`,
    title: 'Foundry Doctrine',
    templateId: 'default',
    parentKey: ALCHEMICA_ROOT,
    tags: [
      { label: 'alchemica', color: 'gold' },
      { label: 'game-design', color: 'cyan' },
    ],
    content: `Foundry Doctrine is how the Guild describes a Factorio-like loop inside Gotchiverse lore: the Parcel is a factory floor, Alchemica is the feedstock, Installations are machines, and Lickquidators are the biters at the edge of the spill.

A healthy Foundry answers five questions:
1. Source — Which veins are awake (Channeling) vs. passively drained (Haarvesters)?
2. Buffer — Where does surplus sit (Reservoirs) before craft or trade?
3. Ratio — Are FUD/FOMO/ALPHA/KEK balanced for the recipe tree, or is one element bottlenecking?
4. Tithe — Is the Portal share flowing, or is the Force Field being starved?
5. Perimeter — Does Spillover feed defenders' traps — or the enemy's belly?

The Doctrine treats automation as sacred logistics, not cold industry. Every belt of motes is a prayer that the Citaadel still stands when the Force Field drops.`,
  },
  {
    pageKey: `${ALCHEMICA_ROOT}/factory-loop`,
    title: 'The Alchemical Factory Loop',
    templateId: 'default',
    parentKey: ALCHEMICA_ROOT,
    tags: [
      { label: 'alchemica', color: 'gold' },
      { label: 'game-design', color: 'cyan' },
    ],
    content: `A Factorio-like Gotchiverse mode can be framed entirely in existing lore language:

SURVEY → CHANNEL → EXTRACT → STORE → REFINE → CRAFT → DEFEND → TITHE → REPLENISH

Survey — Reveal deposit richness on a Parcel (Chainlink VRF / surveying fantasy).
Channel — Spend Kinship at an Aaltar to wake veins (manual kickstart).
Extract — Place Haarvesters on belts of yield; each type prefers matching Alchemica temperament.
Store — Reservoirs as chests/tanks; overflow becomes map Spillover (the "pollution" tell that attracts Lickquidators).
Refine — Intermediate craft nodes combine pairs (e.g. FUD+FOMO slurry, ALPHA catalysts) before full Installations — and fuel grades for power plants.
Craft — Spend refined Alchemica (+ GHST on the Baazaar fantasy) to build Waalls, Towers, Lodges, Black Holes.
Defend — Lickquidators path toward spilled motes and Portal-rich targets; Towers and Black Holes reshape threat.
Tithe — A cut of throughput feeds the Great Portal; starving tithe weakens the Force Field or triggers raids.
Replenish — After Great Battles, parcels refill — the campaign reset that keeps the factory forever unfinished.

Extended logistics branch (see Grid Power pages): REFINE → POWER → COMPUTE → NETHERLINK → TRANSMUTE → CITADEL — or else WALK the caravan home.

Victory is not "launch a rocket." Victory is surviving nine Force Field drops with your Foundry still feeding the Portal — digitally when the Grid is lit, on foot when it is not.`,
  },
  {
    pageKey: `${ALCHEMICA_ROOT}/machines`,
    title: 'Foundry Machines (Installations as Factory Parts)',
    templateId: 'installation',
    parentKey: ALCHEMICA_ROOT,
    runes: { type: 'Foundry', utility: 'Factory mapping for Alchemica loops' },
    tags: [
      { label: 'alchemica', color: 'gold' },
      { label: 'game-design', color: 'cyan' },
    ],
    content: `Map canon Installations to factory-game roles without inventing a second tech tree:

Alchemical Aaltar — The research lab / manual inserter hub. Unlocks Channeling cadence and the Installation tech tree. Place early; upgrade to unlock multi-input recipes.

Haarvester — The miner/drill. Type-tuned Haarvesters pull one Alchemica flavor faster. Chain them toward Reservoirs; overbuild and you flood the map with Spillover.

Reservoir — Chest / fluid tank. Caps buffer size; overflow spills. Higher tiers reduce waste but increase the juicy target Lickquidators smell.

Gotchi Lodge — The social assembler. Enables Communal Channeling (multiplayer productivity pulse) and Kinship recovery stations for workers.

Waalls — Physical perimeter. Funnel biters (Lickquidators) into killboxes.

Towers — Turrets. Restricted inside most of the Citaadel; free on the Grid — lore reason for "build out, then fortify."

Black Hole — Attraction beacon. Pulls Lickquidators toward a Parcel (offense/defense hybrid; high-risk factory bait).

Antenna — Signal / logistics tower fantasy. Improves coordination radius for guild Channeling and raid warnings.

GLMR (from GAX LPs) — Speed modules. Spend to shorten Installation construction time — the lore-native haste currency.`,
  },
  {
    pageKey: `${ALCHEMICA_ROOT}/threat-spillover`,
    title: 'Spillover as Pollution',
    templateId: 'lickquidator',
    parentKey: ALCHEMICA_ROOT,
    runes: { threat: 'Scales with Spillover', appetite: 'Loose Alchemica + Portal stores' },
    tags: [
      { label: 'alchemica', color: 'gold' },
      { label: 'game-design', color: 'cyan' },
    ],
    content: `In factory games, pollution draws biters. In the Gotchiverse, Spillover draws Lickquidators.

Every Haarvester and Channeling pulse that exceeds Reservoir capacity flings motes onto the map. Those motes are free harvest for anyone — including the enemy. Efficient Foundries minimize waste; greedy Foundries paint a glowing trail from the Grid to the Portal.

Design levers that stay lore-true:
• Spillover rate rises with FOMO-heavy setups (speed without buffers).
• FUD-heavy Waall rings reduce pathing options but do not delete scent.
• KEK-rich Lodges can "laugh down" small raids (morale soft-defense) but fail against Omega-scale assaults.
• Portal tithe debt increases raid priority — the Force Field remembers who shorted it.

Great Battles are scheduled pollution crises: the Force Field lowers, Portal stores become raid bosses' loot table, and every Parcel's veins replenish afterward so the factory loop never truly ends.`,
  },
  {
    pageKey: `${ALCHEMICA_ROOT}/design-pillars`,
    title: 'Factory Mode Design Pillars',
    templateId: 'default',
    parentKey: ALCHEMICA_ROOT,
    tags: [
      { label: 'game-design', color: 'cyan' },
      { label: 'alchemica', color: 'gold' },
    ],
    content: `When building a Factorio-like experience on Alchemica lore, keep these pillars:

1. Four-resource tension — Recipes should force multi-element logistics, not a single mega-ore.
2. Kinship as stamina — Channeling is a player verb with cooldowns tied to Gotchi care, not infinite click-mining.
3. Spillover is the tell — Visible waste creates PvE pressure and PvP opportunity without a separate "pollution" UI metaphor.
4. Tithe is the rocket — Long-term sink is Portal defense readiness, not a one-time win screen.
5. Citaadel vs Grid — Safe zone limits (no free Towers) push expansion into dangerous automation territory.
6. Great Battle cadence — Nine escalating raids are campaign chapters; each resets parcel richness to keep optimization fresh.
7. On-chain honesty — Alchemica, Installations, and GAX/GLMR remain the economic spine; factory UX is a skin over REALM truth.
8. Frenly tone — Automation should feel mischievous and meme-bright (KEK in the loop), not grimdark industry.`,
  },
];

/** Optional landmark flavor tied to Alchemica factory framing. */
const ALCHEMICA_LANDMARK_BLURBS = {
  'yield-fields':
    'Farmlands where Gotchus Alchemica flows from REALM parcels — the open-air Foundry floor of the Grid, striped with Haarvester rows and Spillover shimmer.',
  caaverns:
    'Deep mines where dense FUD veins sleep. Vein-Seers of the Alchemical Guild map shafts carefully; over-extraction here collapses tunnels and floods Spillover into the Defi Desert.',
};

module.exports = {
  ALCHEMICA_ROOT,
  ALCHEMICA_PAGES,
  ALCHEMICA_LANDMARK_BLURBS,
};
