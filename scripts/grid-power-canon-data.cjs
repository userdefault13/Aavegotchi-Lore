/**
 * Grid Power & Alchemica Transmute Logistics — canon expansion.
 *
 * Premise: Grid settlers refine Alchemica to fuel compute infrastructure
 * (data centers, block miners, RPC nodes, indexers, servers, power plants).
 * The objective is to light the Grid with Netherlink (internet), so Alchemica
 * can be transmuted and shipped digitally to the Citaadel. Without power/link,
 * caravans must walk it home under Lickquidator pressure.
 *
 * Nested under gameplay/farming-alchemica (world-power economy branch).
 * Marked canon-expansion / game-design — not litepaper text.
 */

const GRID_POWER_ROOT = 'gameplay/farming-alchemica/grid-power';
const ALCHEMICA_PARENT = 'gameplay/farming-alchemica';

/** Lore pages for gotchiverse-canon (lore_pages collection). */
const GRID_POWER_PAGES = [
  {
    pageKey: GRID_POWER_ROOT,
    title: 'Lighting the Grid',
    templateId: 'default',
    parentKey: ALCHEMICA_PARENT,
    tags: [
      { label: 'alchemica', color: 'gold' },
      { label: 'grid-power', color: 'cyan' },
      { label: 'canon-expansion', color: 'cyan' },
    ],
    content: `Beyond the Force Field, the Grid is not only wilderness — it is a power project.

Gotchis who farm the outer parcels face a brutal logistics truth: Alchemica harvested far from the Citaadel is useless to the Portal tithe and the Baazaar until it arrives home. For ages that meant **caravans** — Gotchis walking motes and Reservoir carts across Lickquidator country, spilling FOMO at every ambush.

The Alchemical Guild's answer is **Lighting the Grid**: refine Alchemica into fuel for power plants and compute, raise a **Netherlink** (internet mesh) across parcels, then **transmute** Alchemica into packet-form and ship it to Citaadel receivers in a blink.

No Netherlink, no transmute. No power, no Netherlink. Fail the chain and you walk.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/caravan-age`,
    title: 'The Caravan Age',
    templateId: 'lore-event',
    parentKey: GRID_POWER_ROOT,
    runes: { eventType: 'Logistics Era', act: 'Act I' },
    tags: [{ label: 'grid-power', color: 'cyan' }],
    content: `Before Lighting the Grid, every surplus mote traveled on foot.

Caravan routes stitched Yield Fields to Citaadel gates: Waall-guarded rest posts, ROFL scouts on the flanks, Tithe Wardens counting barrels at dusk. A good run paid the Portal. A bad run fed Lickquidators — Spillover trails were roadmaps for raids.

Caravan culture still survives as backup doctrine. Guild law requires every Foundry to keep a **Walk Ledger**: how many blocks of travel to the nearest Citaadel receiver if the Netherlink dies. Veterans say the Ledger keeps Foundry Wrights honest. Automation is sacred; contingency is sacred-er.

Story beat: the last great caravan before the first stable Netherlink — half the convoy lost in the Defi Desert so the other half could deliver enough ALPHA to boot the first RPC node.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/refine-for-power`,
    title: 'Refining Alchemica for Power',
    templateId: 'default',
    parentKey: GRID_POWER_ROOT,
    tags: [
      { label: 'alchemica', color: 'gold' },
      { label: 'grid-power', color: 'cyan' },
    ],
    content: `Not all refined Alchemica becomes Waalls and Towers. A growing share is burned as **feedstock** — graded fuels that spin turbines, cool racks, and keep clocks honest.

Fuel grades (Guild working names):
• **FUD Slag** — dense base load. Slow to ignite, hard to snuff. Feeds Alchemica Power Plants through blackouts.
• **FOMO Plasma** — peak-load burst fuel. Boots miners and antennas fast; overuse melts runnels and screams Spillover.
• **ALPHA Flux** — precision coolant and logic catalyst. Required for RPC finality circuits and indexer schema forges.
• **KEK Vapor** — morale and mesh lubricant. Stabilizes multi-parcel Netherlink handshakes; without it, packets desync into meme-static.

Refining happens in Guild Crucibles chained to Reservoirs. The Foundry loop gains a new branch: **STORE → REFINE → POWER → COMPUTE → LINK → TRANSMUTE → CITADEL**.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/power-plants`,
    title: 'From Alchemica Plants to Nuclear Scale',
    templateId: 'installation',
    parentKey: GRID_POWER_ROOT,
    runes: { type: 'Power Plant', utility: 'Grid baseload → mega-scale generation' },
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'game-design', color: 'cyan' },
    ],
    content: `Power infrastructure on the Grid escalates through plant tiers. Each tier is hungrier, louder, and a brighter Lickquidator beacon.

**Tier 1 — Alchemica Power Plant (Sparkworks)**  
Parcel-scale generators burning FUD Slag + FOMO Plasma. Enough for a Haarvester row, a Lodge, and a single Antenna. Failure mode: brownout; Channeling still works; transmute does not.

**Tier 2 — Cluster Plant (Foundry Dynamo)**  
Links several parcels via Antenna bus. Feeds a local data closet (servers + one RPC). Requires ALPHA Flux metering. Failure mode: mesh partition — neighbors go dark while your island survives.

**Tier 3 — Mega Plant (Netherforge)**  
Regional baseload. Supports full data centers, miner halls, and indexer farms. Spillover plume visible from the Citaadel walls. Tithe Wardens argue Mega Plants owe a higher Portal share.

**Tier 4 — Nuclear-Scale Alchemica Reactor (Corestack)**  
Experimental. Compresses multi-element fuel into a self-sustaining reaction — "nuclear" in yield and hazard, not Earth uranium. Can light an entire Grid district's Netherlink… or glass a Parcel if containment fails. Lickquidators treat Corestacks as legendary yield. Citaadel Isolationists want them banned; Grid freebooters call them freedom.

Doctrine: never build a Corestack without a Walk Ledger and a cold caravan path home.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/compute-stack`,
    title: 'The Compute Stack',
    templateId: 'default',
    parentKey: GRID_POWER_ROOT,
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'game-design', color: 'cyan' },
    ],
    content: `Once power flows, Gotchis raise a compute stack that mirrors Ether Realm infrastructure — rebuilt in Nether materials and Alchemica logic.

**Data Centers (Rackhollows)** — Cooled halls of spectral servers. Store transmute buffers, Guild ledgers, and parcel state snapshots. Hungry for FUD Slag baseload and KEK Vapor to keep operators sane.

**Block Miners (Proof Halls)** — Machines that burn FOMO Plasma to seal Grid blocks / parcel attestations. More miners = faster local finality for transmute batches, more Spillover heat, more raid scent.

**RPC Nodes (Callspires)** — Antennas with brains. Expose endpoints so Citaadel receivers (and Spirit-Bonded humans) can request balances, submit transmute jobs, and verify Portal tithe. ALPHA Flux keeps responses deterministic; starve them and RPCs lie — the worst sin on the Grid.

**Indexers (Lorelooms)** — Crawl parcel events into queryable history: who channeled, what spilled, which caravan died. Without indexers, the Netherlink still pings but nobody can prove a shipment. Baazaar disputes go feral.

**Servers (Haunthosts)** — General compute for Lodges, dapps, Aadventure instances, and Guild rites. The unglamorous middle of the stack; when they die, chat dies, and caravans lose coordination.

Stack rule: **Power → Servers → RPC → Indexer → Miner quorum → Transmute clearance.** Skip a layer and you ship ghosts.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/netherlink`,
    title: 'Netherlink — Internet on the Grid',
    templateId: 'default',
    parentKey: GRID_POWER_ROOT,
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'alchemica', color: 'gold' },
    ],
    content: `**Netherlink** is the Guild name for internet across the Grid: a mesh of powered Antennas, Callspires, and relay Lodges that stitches outer parcels to Citaadel receivers.

Lighting the Grid means more than lamps. It means:
• Persistent routes from Parcel → regional Rackhollow → Citaadel gateways
• Enough uptime for transmute handshakes to finalize
• Indexer freshness so shipments are auditable
• Redundant paths when Lickquidators chew a relay

Netherlink is powered, not wished. A dark Antenna is a scenic ruin. A brownout turns digital shipping into packet rain — Alchemica that "arrives" incomplete and must be walked as residue.

Cultural split:
• **Linkers** — Grid settlers who believe Netherlink is the only way to outpace Lickquidators.
• **Walkers** — Caravan traditionalists who trust boots over packets.
• **Citaadel Receivers** — Portal-adjacent operators who accept inbound transmute and skim the tithe automatically.

Prophecy joke among Tithe Wardens: the Tree of FUD once answered "How do we win?" with "Check the latency."`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/transmute-shipping`,
    title: 'Transmute and Ship to Citaadel',
    templateId: 'default',
    parentKey: GRID_POWER_ROOT,
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'alchemica', color: 'gold' },
    ],
    content: `**Transmutation** is the rite-tech that converts physical Alchemica (Reservoir stores, Spillover barrels, Crucible grades) into **packet-form** that Netherlink can route to Citaadel receivers.

Requirements (all must be green):
1. Local power above transmute threshold (plant tier vs. batch size)
2. RPC quorum reachable (Callspires answering with ALPHA-honest proofs)
3. Indexer caught up (no orphan events in the batch window)
4. Miner finality for the parcel block containing the burn-in
5. Citaadel receiver online and accepting (Force Field politics can close gates)
6. Tithe bit set — Portal share is carved at transmute, not on arrival

Success: motes vanish from Grid Reservoirs and credit Citaadel coffers / Portal stores in one ritual pulse.  
Failure: partial mint, stuck mempool, or full revert — leftover slag may still require a caravan.

The main objective of Lighting the Grid is not vanity compute. It is this: **ship Alchemica home without walking it through the warpath.** Every Corestack, every indexer, every joke about latency serves that haul.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/blackout-walk`,
    title: 'Blackout Doctrine — When You Walk',
    templateId: 'lore-event',
    parentKey: GRID_POWER_ROOT,
    runes: { eventType: 'Contingency', act: 'Act I–II' },
    tags: [{ label: 'grid-power', color: 'cyan' }],
    content: `When the Netherlink dies, the Walk Ledger opens.

Blackouts happen because:
• Lickquidators eat a Mega Plant's Spillover plume
• FOMO Plasma spikes melt a Crucible bus
• Isolationists in the Citaadel shutter receivers during political storms
• A Corestack scram dumps the district into silence
• Great Battle eve — power diverted to Towers, transmute deferred by law

Blackout Doctrine:
1. Freeze new Channeling that would overflow dark Reservoirs
2. Seal barrels; mark caravan lots by element ratio
3. Scout with ROFLs; never follow yesterday's Spillover road
4. Pay escort Towers in ALPHA if Grid freebooters demand toll
5. On arrival, reconcile Walk Ledger against what the indexers last swore was true

Heroic campaigns often start here: a Foundry Wright and a Tithe Warden racing a caravan while a repair crew tries to re-light a single Callspire in time to save half the load.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/threats`,
    title: 'Threats to the Power Grid',
    templateId: 'lickquidator',
    parentKey: GRID_POWER_ROOT,
    runes: { threat: 'High — targets plants & nodes', appetite: 'Spillover heat + Corestack yield' },
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'game-design', color: 'cyan' },
    ],
    content: `Lickquidators learned that glowing plants taste like concentrated yield.

Priority targets (raid AI fantasy):
1. **Corestacks / Mega Plants** — densest Alchemica burn
2. **Proof Halls (miners)** — FOMO heat signature
3. **Callspires (RPC)** — killing RPCs freezes transmute without a full blackout
4. **Lorelooms (indexers)** — destroy auditability; force Walkers into disputes
5. **Caravans mid-blackout** — classic prey

Other threats:
• **Mesh pirates** — Gotchi freebooters who tap Netherlink to skim packet Alchemica
• **Receiver politics** — Citaadel factions throttling inbound transmute to control Grid independence
• **AGITHE curiosity** — some Linkers whisper the Netherlink rhymes with AGITHE's old internet hunger; lighting the Grid may be ringing a dinner bell upstairs

Defense patterns: Waall killboxes around plants, Black Holes as decoy plumes, KEK-rich Lodges as operator bunkers, redundant RPCs on separate fuel buses.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/campaign-arc`,
    title: 'Campaign Arc — Light the Haul',
    templateId: 'lore-event',
    parentKey: GRID_POWER_ROOT,
    runes: { eventType: 'Campaign', act: 'Act I–II' },
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'game-design', color: 'cyan' },
    ],
    content: `Suggested Tome / gameplay arc: **Light the Haul**.

Act beats:
1. **Barrel Road** — Run a caravan; feel the tax of walking
2. **First Sparkworks** — Build Tier-1 plant; power one Antenna; fail a transmute (no RPC)
3. **Callspire Rising** — Stand up servers + RPC; ship a smol batch; celebrate; get raided
4. **Indexer Truth** — After a disputed shipment, build a Loreloom; learn why proofs matter
5. **Miner Quorum** — Proof Halls unlock larger batches; Spillover draws a serious Lickquidator
6. **District Dynamo** — Tier-2/3 plants link parcels; Citaadel notices Grid independence
7. **Corestack Gambit** — Optional nuclear-scale reactor; triumph or scramble
8. **Blackout March** — Enemy kills the mesh on Great Battle eve; Walk Ledger time
9. **Receiver Gate** — Politics: open Citaadel receivers or force Grid to stay self-sufficient
10. **Stable Haul** — Sustained transmute paying Portal tithe without caravans — victory condition for the arc

Win condition: **Citaadel receives Grid Alchemica via Netherlink at tithe-sustain rate for N consecutive cycles.**  
Lose condition: **Chronic blackout + caravan attrition empties Portal stores before the next Great Battle.**`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/design-hooks`,
    title: 'Grid Power Design Hooks',
    templateId: 'default',
    parentKey: GRID_POWER_ROOT,
    tags: [
      { label: 'game-design', color: 'cyan' },
      { label: 'grid-power', color: 'cyan' },
    ],
    content: `Factory + logistics design pillars for Lighting the Grid:

1. **Dual victory pressure** — Optimize Foundry throughput AND uptime of the compute stack.
2. **Walk vs Link** — Always offer a worse-but-viable caravan path; never soft-lock on transmute.
3. **Layered outages** — Killing RPC ≠ killing power ≠ killing indexers; each failure feels different.
4. **Fuel personality** — FUD baseload, FOMO spikes, ALPHA precision, KEK mesh glue — recipes teach the four elements again.
5. **Tithe at transmute** — Portal share is unavoidable on digital shipping; caravans can try to cheat and get eaten.
6. **Raid scent** — Plant tier and miner count raise Lickquidator aggro more than Haarvesters alone.
7. **Politics as content** — Citaadel receiver permissions are a social/DAO lever, not only a PvE switch.
8. **Frenly hazard** — Corestacks are ridiculous and dangerous; tone stays mischievous, stakes stay real.

Vertical slice order: caravan tutorial → Sparkworks + failed transmute → RPC success → first raid on the plant → blackout caravan encore.`,
  },
];

const GRID_POWER_LANDMARK_BLURBS = {
  'open-steppe':
    'Act 2 frontier where Netherlink relays are thinnest — Sparkworks flicker at parcel edges and caravans still outnumber Callspires.',
  'defi-desert':
    'Arid Grid region scarred by old raids; preferred blackout caravan route and graveyard of overbuilt FOMO Plasma buses.',
  'liquidator-ruins':
    'Forward bases that now target Mega Plants and Corestacks — Lickquidators learned glowing power tastes like concentrated yield.',
};

module.exports = {
  GRID_POWER_ROOT,
  GRID_POWER_PAGES,
  GRID_POWER_LANDMARK_BLURBS,
};
