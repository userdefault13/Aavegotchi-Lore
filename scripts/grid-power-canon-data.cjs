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

Fabrication comes first. Without chips and buffers, Rackhollows are scenic coolers.

**CPU Makers (Coreforges)** — Fabrication halls that stamp **Pulsecores**, the logic dies for Haunthosts, Callspires, Lorelooms, and Proof Halls. Feed on ALPHA Flux for honest circuits and FOMO Plasma for clock speed. Starve Coreforges and every rack stays dark.

**Memory Makers (Remembrane Mills)** — Weave **MoteBanks**, spectral RAM and transmute staging buffers. Bind FUD Slag for dense persistence and KEK Vapor for refresh cycles that keep packets from desyncing into meme-static. Starve Remembranes and shipments arrive incomplete — Walkers' favorite "I told you so."

**Data Centers (Rackhollows)** — Cooled halls of spectral servers. Store transmute buffers, Guild ledgers, and parcel state snapshots. Hungry for FUD Slag baseload and KEK Vapor to keep operators sane. Stocked only after Pulsecores and MoteBanks arrive.

**Block Miners (Proof Halls)** — Machines that burn FOMO Plasma to seal Grid blocks / parcel attestations. More miners = faster local finality for transmute batches, more Spillover heat, more raid scent. Each miner head needs a Pulsecore.

**RPC Nodes (Callspires)** — Antennas with brains. Expose endpoints so Citaadel receivers (and Spirit-Bonded humans) can request balances, submit transmute jobs, and verify Portal tithe. ALPHA Flux keeps responses deterministic; starve them and RPCs lie — the worst sin on the Grid.

**Indexers (Lorelooms)** — Crawl parcel events into queryable history: who channeled, what spilled, which caravan died. Without indexers, the Netherlink still pings but nobody can prove a shipment. Baazaar disputes go feral. Memory-hungry; Lorelooms eat MoteBanks by the crate.

**Servers (Haunthosts)** — General compute for Lodges, dapps, Aadventure instances, and Guild rites. The unglamorous middle of the stack; when they die, chat dies, and caravans lose coordination.

Stack rule: **Power → Coreforges + Remembrane Mills → Servers → RPC → Indexer → Miner quorum → Transmute clearance.** Skip a layer and you ship ghosts.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/compute-stack/component-makers`,
    title: 'Component Makers — Coreforge & Remembrane',
    templateId: 'installation',
    parentKey: `${GRID_POWER_ROOT}/compute-stack`,
    runes: { type: 'Fabrication', utility: 'CPU Pulsecores + Memory MoteBanks' },
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'game-design', color: 'cyan' },
      { label: 'alchemica', color: 'gold' },
    ],
    content: `Component makers are the quiet bottleneck of Lighting the Grid. Power without Pulsecores is a warm ruin; power without MoteBanks is a liar's mesh.

**Coreforge (CPU maker)**  
Inputs: ALPHA Flux (logic purity) + FOMO Plasma (clock) + smol FUD Slag (die substrate).  
Outputs: **Pulsecores** graded by honesty — Guild stamps reject "jitter dies" that make Callspires lie.  
Bottleneck: ALPHA scarcity. Rush FOMO clocks without Flux and you mint fast, false brains.  
Raid scent: high — glowing presses draw Gloam almost as hard as Mega Plants.

**Remembrane Mill (memory maker)**  
Inputs: FUD Slag (dense persistence) + KEK Vapor (refresh / anti-desync) + trace ALPHA Flux (addressing).  
Outputs: **MoteBanks** — buffer modules for transmute staging, indexer caches, and Haunthost RAM.  
Bottleneck: FUD density and KEK supply. Thin Remembranes cause packet rain: Alchemica that "arrives" incomplete and must be walked as residue.  
Raid scent: medium — cooler than Coreforges, but Lickquidators learned empty MoteBanks force Walk Ledgers open.

Failure modes:
• **CPU starve** — racks dark; Sparkworks hum while chat and transmute consoles stay dead.
• **Memory starve** — nodes boot, handshakes flicker, disputed hauls bloom; Brii's Loreloom cannot prove truth it never held.
• **Skewed fab** — too many Pulsecores, too few MoteBanks (or reverse) creates Single-Thread compute: looks online, fails under batch load.

Guild doctrine: every Foundry Dynamo must site at least one Coreforge press and one Remembrane loom on separate fuel buses so a single FOMO spike cannot kill both fab lines.`,
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
2. **Coreforges (CPU fab)** — glowing presses; kill Pulsecores and racks stay dark
3. **Remembrane Mills (memory fab)** — cooler, but empty MoteBanks force Walk Ledgers
4. **Proof Halls (miners)** — FOMO heat signature
5. **Callspires (RPC)** — killing RPCs freezes transmute without a full blackout
6. **Lorelooms (indexers)** — destroy auditability; force Walkers into disputes
7. **Caravans mid-blackout** — classic prey

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
3. **Callspire Rising** — Component run (Pulsecores + MoteBanks); stand up servers + RPC; ship a smol batch; celebrate; get raided
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
  {
    pageKey: `${GRID_POWER_ROOT}/roles`,
    title: 'Roles of the Haul',
    templateId: 'default',
    parentKey: GRID_POWER_ROOT,
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'character', color: 'purple' },
    ],
    content: `Lighting the Grid is a crew sport. Named role archetypes for stories and Tome play:

**Pip the Barrel-Walker** — Caravan lead who still marks every route in chalk. Distrusts packets; will escort a Walk Ledger run through the Defi Desert without complaint. Secret: once lost a whole ALPHA cart to a "friendly" mesh pirate who promised a shortcut Callspire.

**Wattz the Foundry Wright** — Installation engineer obsessed with fuel ratios. Speaks in Crucible temperatures. Believes a Corestack is inevitable; argues with Tithe Wardens about Portal share on Mega Plant burn.

**Nettle the Tithe Warden** — Counts what the Portal is owed. Neutral between Linkers and Walkers so long as tithe clears. Can freeze a transmute batch mid-rite if the tithe bit is unset — the most hated power on the Grid.

**Echo-9 the Callspire Tender** — RPC operator. Lives on ALPHA Flux tea. Motto: "If the node lies, the haul dies." First Gotchi to complete a Citaadel receiver handshake from the Open Steppe.

**Loommother Brii** — Indexer guild elder. Treats Lorelooms like sacred libraries. Will halt a celebration over a successful transmute until the event log is queryable.

**Rex Spill** — Miner hall foreman. Burns FOMO Plasma like festival fireworks. Draws raids; claims the glow is free advertising for Tower killboxes.

**Chipz of the Coreforge** — Pulsecore artisan. Speaks in clock rates and Guild honesty stamps. Will scrap an entire FOMO-rushed die batch rather than let Echo-9 install a lying brain. Secret: once bootlegged a Coreforge press for Open Steppe freebooters and still owes Nettle a tithe on the scrap.

**Mnem of the Remembrane** — MoteBank miller. Measures FUD density by ear; hums KEK Vapor refresh rites that sound like bad stand-up. Argues that memory, not CPU, is the true haul — "Empty buffers make Walkers right."

**Keeper Vael** — Citaadel Receiver. Controls inbound gate permissions. Isolationist pressure sits on their shoulders every Great Battle eve.

**Gloam** — Beta Lickquidator scout that learned power-plant heat signatures — and now fabrication glow. Not a hero — the recurring raid pressure with a name.`,
  },
  {
    pageKey: `${GRID_POWER_ROOT}/linkers-vs-walkers`,
    title: 'Linkers vs Walkers',
    templateId: 'default',
    parentKey: GRID_POWER_ROOT,
    tags: [
      { label: 'grid-power', color: 'cyan' },
      { label: 'faction', color: 'purple' },
    ],
    content: `Two creeds split every Grid settlement that tries to Light the Haul.

**Linkers** argue that caravans are a dead end — Lickquidators read Spillover roads better than maps. Only Netherlink scale can feed the Portal before the next Force Field drop. They push plant tiers, miner quorums, and Corestack licenses.

**Walkers** argue that packets lie, receivers close for politics, and a barrel on a ROFL-scouted path is honest yield. They keep Waall roads, rest posts, and Walk Ledgers current. Many are caravan veterans who watched the first Callspires desync a shipment into meme-static.

**Tithe Wardens** referee. Guild law: every Foundry must fund both a transmute bus AND a caravan reserve. Settlements that abandon one path are marked **Single-Thread** — high efficiency, high extinction risk.

Story fuel: romance, rival crews, and DAO votes over whether Corestacks are freedom or a dinner bell for AGITHE.`,
  },
];

/** Optional landmark flavor tied to Grid Power framing. */
const GRID_POWER_LANDMARK_BLURBS = {
  'open-steppe':
    'Act 2 frontier where Netherlink relays are thinnest — Sparkworks flicker at parcel edges and caravans still outnumber Callspires.',
  'defi-desert':
    'Arid Grid region scarred by old raids; preferred blackout caravan route and graveyard of overbuilt FOMO Plasma buses.',
  'liquidator-ruins':
    'Forward bases that now target Mega Plants and Corestacks — Lickquidators learned glowing power tastes like concentrated yield.',
};

/* -------------------------------------------------------------------------- */
/* Light the Haul — Tome campaign nodes                                       */
/* -------------------------------------------------------------------------- */

function scene(id, parentKey, title, content, extras = {}) {
  return {
    nodeKey: parentKey ? `${parentKey}/${id}` : id,
    parentKey: parentKey || null,
    type: extras.type || 'scene',
    title,
    content,
    choices: extras.choices || [],
    roles: extras.roles || [],
    order: extras.order ?? 0,
    branchIndex: extras.branchIndex ?? 0,
  };
}

function chapter(id, parentKey, title, order) {
  return {
    nodeKey: parentKey ? `${parentKey}/${id}` : id,
    parentKey: parentKey || null,
    type: 'chapter',
    title,
    content: '',
    choices: [],
    roles: [],
    order,
    branchIndex: 0,
  };
}

const LIGHT_THE_HAUL_ARC = 'light-the-haul';

const LIGHT_THE_HAUL_CAMPAIGN_NODES = [
  {
    nodeKey: LIGHT_THE_HAUL_ARC,
    parentKey: null,
    type: 'arc',
    title: 'Light the Haul',
    content:
      'Grid Power campaign — refine Alchemica into plants and compute, light the Netherlink, transmute yield to the Citaadel, or walk it home when the mesh dies.',
    choices: [],
    roles: [],
    order: 0,
    branchIndex: 0,
  },

  chapter('barrel-road', LIGHT_THE_HAUL_ARC, 'Chapter 1 — Barrel Road', 0),
  scene(
    'claim-the-edge',
    `${LIGHT_THE_HAUL_ARC}/barrel-road`,
    'Claim the Edge Parcel',
    'Your crew holds a Grid parcel far from Citaadel gates. Reservoirs fill. The Walk Ledger says six hard watches to the nearest receiver — through Defi Desert scent trails Gloam already knows.',
    {
      choices: [
        { label: 'Load the caravan', outcome: 'Begin Barrel Road' },
        { label: 'Hoard and wait for a plant plan', outcome: 'Wattz drafts Sparkworks' },
      ],
      roles: [
        { player: 'Pip the Barrel-Walker', action: 'Mark the chalk route' },
        { player: 'Nettle the Tithe Warden', action: 'Weigh Portal share on barrels' },
      ],
      order: 0,
    },
  ),
  scene(
    'desert-toll',
    `${LIGHT_THE_HAUL_ARC}/barrel-road`,
    'Defi Desert Toll',
    'Spillover from a rushed FOMO haul paints the sand. Freebooters demand ALPHA toll for Waall-road access. Distant licking — Gloam is near.',
    {
      choices: [
        { label: 'Pay the ALPHA toll', outcome: 'Road opens; tithe margin thins' },
        { label: 'Detour with ROFL scouts', outcome: 'Slower; avoid freebooters; risk Gloam' },
        { label: 'Fight for the road', outcome: 'Win path or lose barrels' },
      ],
      roles: [
        { player: 'Pip the Barrel-Walker', action: 'Negotiate or fight' },
        { player: 'ROFL Scout', action: 'Sniff alternate washes' },
      ],
      order: 1,
    },
  ),
  scene(
    'gate-delivery',
    `${LIGHT_THE_HAUL_ARC}/barrel-road`,
    'Citaadel Gate Delivery',
    'Half a cart short, you reach Keeper Vael\'s receiver post on foot. Tithe is carved by hand. Vael notes: "Walkers feed us. Linkers promise us. Bring either — just bring it."',
    {
      choices: [
        { label: 'Swear to light a Sparkworks', outcome: 'Chapter 2 unlocks' },
        { label: 'Double down on caravan routes', outcome: 'Walker ending branch stays open' },
      ],
      roles: [
        { player: 'Keeper Vael', action: 'Accept inbound Alchemica' },
        { player: 'Nettle the Tithe Warden', action: 'Reconcile Walk Ledger' },
      ],
      order: 2,
    },
  ),

  chapter('first-spark', LIGHT_THE_HAUL_ARC, 'Chapter 2 — First Sparkworks', 1),
  scene(
    'fuel-grades',
    `${LIGHT_THE_HAUL_ARC}/first-spark`,
    'Crucible Lessons',
    'Wattz teaches fuel grades over a hot Crucible: FUD Slag for baseload, FOMO Plasma for spikes, ALPHA Flux for honest nodes, KEK Vapor so the mesh does not laugh itself apart.',
    {
      choices: [
        { label: 'Prioritize FUD Slag stockpile', outcome: 'Stable brownout resistance' },
        { label: 'Prioritize FOMO Plasma', outcome: 'Fast boot; higher Spillover scent' },
      ],
      roles: [{ player: 'Wattz the Foundry Wright', action: 'Tune the Crucible' }],
      order: 0,
    },
  ),
  scene(
    'sparkworks-online',
    `${LIGHT_THE_HAUL_ARC}/first-spark`,
    'Sparkworks Online',
    'Tier-1 Alchemica Power Plant hums. One Antenna lights. Chat works. Transmute console glows — then rejects the batch. Echo-9 shrugs: "No Callspire, no truth."',
    {
      choices: [
        { label: 'Build servers and an RPC next', outcome: 'Chapter 3' },
        { label: 'Overclock the Antenna anyway', outcome: 'Packet rain; learn the hard way' },
      ],
      roles: [
        { player: 'Wattz the Foundry Wright', action: 'Bring Sparkworks online' },
        { player: 'Echo-9', action: 'Explain RPC requirement' },
      ],
      order: 1,
    },
  ),

  chapter('callspire', LIGHT_THE_HAUL_ARC, 'Chapter 3 — Callspire Rising', 2),
  scene(
    'component-run',
    `${LIGHT_THE_HAUL_ARC}/callspire`,
    'Component Run',
    'Empty Rackhollow frames wait like cool tombs. Chipz refuses to install Haunthosts without Guild-stamped Pulsecores; Mnem will not ship MoteBanks until FUD density and KEK refresh pass the hum test. Wattz splits the fuel bus: ALPHA to the Coreforge, FUD to the Remembrane Mill.',
    {
      choices: [
        { label: 'Prioritize Pulsecores', outcome: 'CPUs first; risk memory starve later' },
        { label: 'Prioritize MoteBanks', outcome: 'Buffers first; racks boot slower' },
        { label: 'Balance both fab lines', outcome: 'Slower; Dual-Thread compute ready' },
      ],
      roles: [
        { player: 'Chipz of the Coreforge', action: 'Stamp Pulsecores' },
        { player: 'Mnem of the Remembrane', action: 'Weave MoteBanks' },
        { player: 'Wattz the Foundry Wright', action: 'Split fuel buses' },
      ],
      order: 0,
    },
  ),
  scene(
    'rackhollow',
    `${LIGHT_THE_HAUL_ARC}/callspire`,
    'Raise the Rackhollow',
    'Pulsecores seat. MoteBanks click into transmute staging trays. Haunthost servers fill a cooled lodge wing. KEK Vapor vents smell like festival fog. Brii refuses to celebrate until an indexer exists — but Echo-9 needs the racks first.',
    {
      choices: [
        { label: 'Stand up Callspire RPC now', outcome: 'Attempt first transmute' },
        { label: 'Wait for Loommother Brii\'s Loreloom', outcome: 'Slower; audit-ready' },
      ],
      roles: [
        { player: 'Echo-9', action: 'Install Callspire' },
        { player: 'Loommother Brii', action: 'Demand indexer path' },
        { player: 'Chipz of the Coreforge', action: 'Certify Pulsecore honesty stamps' },
      ],
      order: 1,
    },
  ),
  scene(
    'first-transmute',
    `${LIGHT_THE_HAUL_ARC}/callspire`,
    'First Transmute Pulse',
    'ALPHA-honest proofs clear. A smol Reservoir batch vanishes into Netherlink. Citaadel credits ping. Tithe bit flips automatically. Pip stares at empty barrels like someone stole a religion. Mnem watches MoteBank watermarks — if buffers had been thin, this would already be a dispute.',
    {
      choices: [
        { label: 'Throw a Lodge party', outcome: 'Morale up; Spillover scent up' },
        { label: 'Immediately fortify the plant', outcome: 'Prepare for Gloam' },
        { label: 'Fortify Coreforge and Remembrane first', outcome: 'Protect fab bottleneck' },
      ],
      roles: [
        { player: 'Echo-9', action: 'Finalize transmute handshake' },
        { player: 'Nettle the Tithe Warden', action: 'Verify Portal share' },
        { player: 'Pip the Barrel-Walker', action: 'Question the empty barrels' },
        { player: 'Mnem of the Remembrane', action: 'Check buffer watermarks' },
      ],
      order: 2,
    },
  ),

  chapter('raid-scent', LIGHT_THE_HAUL_ARC, 'Chapter 4 — Raid Scent', 3),
  scene(
    'gloam-arrives',
    `${LIGHT_THE_HAUL_ARC}/raid-scent`,
    'Gloam at the Plume',
    'Gloam leads a lick-pack toward Sparkworks Spillover. Rex Spill wants more miners "to finish bigger batches." Wattz wants Waalls. Someone will be wrong in public.',
    {
      choices: [
        { label: 'Build Waall killbox', outcome: 'Defense first' },
        { label: 'Drop a Black Hole decoy plume', outcome: 'Bait Gloam off-parcel' },
        { label: 'Add miners during the raid', outcome: 'Greedy; high risk reward' },
      ],
      roles: [
        { player: 'Gloam', action: 'Raid the plant heat' },
        { player: 'Rex Spill', action: 'Argue for Proof Halls' },
        { player: 'Wattz the Foundry Wright', action: 'Hold the Crucible line' },
      ],
      order: 0,
    },
  ),
  scene(
    'aftermath-audit',
    `${LIGHT_THE_HAUL_ARC}/raid-scent`,
    'Aftermath Audit',
    'A disputed shipment surfaces — Citaadel says short; Grid says full. Without a Loreloom, nobody can prove which Reservoir lied. Brii\'s silence is louder than Gloam.',
    {
      choices: [
        { label: 'Build the Loreloom indexer', outcome: 'Chapter 5' },
        { label: 'Send a caravan to reconcile by foot', outcome: 'Walker pride; slow truth' },
      ],
      roles: [{ player: 'Loommother Brii', action: 'Explain orphan events' }],
      order: 1,
    },
  ),

  chapter('quorum', LIGHT_THE_HAUL_ARC, 'Chapter 5 — Miner Quorum & Dynamo', 4),
  scene(
    'proof-halls',
    `${LIGHT_THE_HAUL_ARC}/quorum`,
    'Proof Halls Online',
    'Rex Spill\'s miners seal parcel blocks fast enough for larger transmute batches. FOMO Plasma burn paints the night. Antenna bus links a neighbor parcel — Foundry Dynamo tier.',
    {
      choices: [
        { label: 'Link parcels into a Dynamo', outcome: 'Regional power; shared raid scent' },
        { label: 'Stay islanded on Sparkworks', outcome: 'Safer; smaller haul cap' },
      ],
      roles: [
        { player: 'Rex Spill', action: 'Spin up Proof Halls' },
        { player: 'Wattz the Foundry Wright', action: 'Balance fuel buses' },
      ],
      order: 0,
    },
  ),
  scene(
    'citaadel-notices',
    `${LIGHT_THE_HAUL_ARC}/quorum`,
    'Citaadel Notices',
    'Keeper Vael reports Grid independence chatter. Isolationists want receiver throttles. Integrationists want more Linkers. Nettle only asks whether tithe charts bend up.',
    {
      choices: [
        { label: 'Lobby to keep receivers open', outcome: 'Political quest' },
        { label: 'Stockpile for blackout caravans', outcome: 'Walker insurance' },
        { label: 'Propose a Netherforge Mega Plant', outcome: 'Chapter 6 pressure' },
      ],
      roles: [
        { player: 'Keeper Vael', action: 'Present faction pressures' },
        { player: 'Nettle the Tithe Warden', action: 'Show tithe charts' },
      ],
      order: 1,
    },
  ),

  chapter('corestack', LIGHT_THE_HAUL_ARC, 'Chapter 6 — Corestack Gambit', 5),
  scene(
    'license-or-freeboot',
    `${LIGHT_THE_HAUL_ARC}/corestack`,
    'License or Freeboot',
    'A Corestack blueprint circulates — nuclear-scale Alchemica reactor. Guild wants a license and higher Portal share. Freebooters say build it dark in the Open Steppe.',
    {
      choices: [
        { label: 'Seek Guild license', outcome: 'Slower; legitimized; tithe hike' },
        { label: 'Freeboot the Corestack', outcome: 'Fast; illegal; AGITHE-dinner-bell rumors' },
        { label: 'Refuse Corestack; stay Netherforge', outcome: 'Skip to blackout with lower power' },
      ],
      roles: [
        { player: 'Wattz the Foundry Wright', action: 'Argue engineering' },
        { player: 'Nettle the Tithe Warden', action: 'Price the tithe hike' },
        { player: 'Pip the Barrel-Walker', action: 'Demand a Walk Ledger for the Corestack' },
      ],
      order: 0,
    },
  ),
  scene(
    'containment',
    `${LIGHT_THE_HAUL_ARC}/corestack`,
    'Containment Night',
    'If built: the Corestack lights a district Netherlink — or scrams into silence. Neighbor Lodges cheer or evacuate. Gloam\'s pack changes course toward the new sun.',
    {
      choices: [
        { label: 'Hold containment', outcome: 'District mesh stable' },
        { label: 'Scram and dump to caravans', outcome: 'Survive; lose face' },
      ],
      roles: [
        { player: 'Wattz the Foundry Wright', action: 'Ride the reaction' },
        { player: 'Gloam', action: 'Retarget the glow' },
      ],
      order: 1,
      branchIndex: 0,
    },
  ),

  chapter('blackout', LIGHT_THE_HAUL_ARC, 'Chapter 7 — Blackout March', 6),
  scene(
    'mesh-dies',
    `${LIGHT_THE_HAUL_ARC}/blackout`,
    'The Mesh Dies',
    'Great Battle eve. Power diverts to Towers. Isolationists shutter receivers. Gloam chews a relay. Netherlink goes dark mid-batch. Packet rain. Walk Ledger opens itself.',
    {
      choices: [
        { label: 'March the caravan tonight', outcome: 'Classic haul under fire' },
        { label: 'Repair one Callspire first', outcome: 'Race the clock; split the crew' },
      ],
      roles: [
        { player: 'Pip the Barrel-Walker', action: 'Open Walk Ledger' },
        { player: 'Echo-9', action: 'Attempt emergency RPC repair' },
        { player: 'Keeper Vael', action: 'Report receiver shutter' },
      ],
      order: 0,
    },
  ),
  scene(
    'march-or-mend',
    `${LIGHT_THE_HAUL_ARC}/blackout`,
    'March or Mend',
    'Two crews: barrels toward Citaadel, tools toward the broken Callspire. Success is partial by nature — some motes walk, some rematerialize if Echo-9 lands a handshake before dawn.',
    {
      choices: [
        { label: 'Prioritize barrels', outcome: 'Walker victory flavor' },
        { label: 'Prioritize repair', outcome: 'Linker victory flavor' },
        { label: 'Split evenly', outcome: 'Bittersweet both-path ending setup' },
      ],
      roles: [
        { player: 'Pip the Barrel-Walker', action: 'Lead the march' },
        { player: 'Echo-9', action: 'Re-light Callspire' },
        { player: 'Nettle the Tithe Warden', action: 'Track both ledgers' },
      ],
      order: 1,
    },
  ),

  chapter('receiver-gate', LIGHT_THE_HAUL_ARC, 'Chapter 8 — Receiver Gate', 7),
  scene(
    'citaadel-vote',
    `${LIGHT_THE_HAUL_ARC}/receiver-gate`,
    'Citaadel Receiver Vote',
    'DAO-flavored council: keep Grid transmute open, throttle it, or demand Corestack bans. Linkers and Walkers lobby. Tithe charts are the only bilingual slides in the room.',
    {
      choices: [
        { label: 'Open receivers wide', outcome: 'Grid boom; raid pressure rises' },
        { label: 'Throttle to tithe-only bursts', outcome: 'Stable but capped' },
        { label: 'Close digital; mandate caravans', outcome: 'Walker doctrine wins politically' },
      ],
      roles: [
        { player: 'Keeper Vael', action: 'Chair the gate vote' },
        { player: 'Nettle the Tithe Warden', action: 'Present tithe evidence' },
        { player: 'Wattz the Foundry Wright', action: 'Lobby for Linkers' },
        { player: 'Pip the Barrel-Walker', action: 'Lobby for Walkers' },
      ],
      order: 0,
    },
  ),

  chapter('stable-haul', LIGHT_THE_HAUL_ARC, 'Chapter 9 — Stable Haul', 8),
  scene(
    'tithe-sustain',
    `${LIGHT_THE_HAUL_ARC}/stable-haul`,
    'Tithe-Sustain Cycles',
    'Victory check: N consecutive cycles of Citaadel credits via Netherlink at Portal-sustain rate — Walk Ledger unused except as drill. Or: chronic blackout and empty Portal stores before battle.',
    {
      choices: [
        { label: 'Declare Stable Haul', outcome: 'Arc victory — Linkers vindicated' },
        { label: 'Admit Single-Thread failure', outcome: 'Rebuild with dual-path Guild law' },
        { label: 'Embrace caravan primacy', outcome: 'Walker ending — mesh as backup only' },
      ],
      roles: [
        { player: 'Nettle the Tithe Warden', action: 'Certify the charts' },
        { player: 'Keeper Vael', action: 'Accept or refuse the declaration' },
      ],
      order: 0,
    },
  ),
  scene(
    'epilogue-glow',
    `${LIGHT_THE_HAUL_ARC}/stable-haul`,
    'Epilogue — Glow on the Grid',
    'From Citaadel walls, Sparkworks and Dynamos look like a second starfield. Pip still chalks a road. Echo-9 still hates lying nodes. Gloam still hungers. The Haul is never finished — only lit well enough for tonight.',
    {
      choices: [
        { label: 'Plan Act II Open Steppe relays', outcome: 'Sequel hook' },
        { label: 'Prepare the next Great Battle', outcome: 'Return to Hero Protocol pressure' },
      ],
      roles: [{ player: 'Loremaster', action: 'Close the arc' }],
      order: 1,
    },
  ),
];

module.exports = {
  GRID_POWER_ROOT,
  GRID_POWER_PAGES,
  GRID_POWER_LANDMARK_BLURBS,
  LIGHT_THE_HAUL_ARC,
  LIGHT_THE_HAUL_CAMPAIGN_NODES,
};
