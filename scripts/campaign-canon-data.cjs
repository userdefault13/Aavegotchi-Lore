/**
 * Full Act I campaign tree for gotchiverse-campaign-canon
 * Derived from Gotchiverse Realm Litepaper v1.0
 */

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

const ACT_I = 'act-1';

const CAMPAIGN_NODES = [
  { nodeKey: ACT_I, parentKey: null, type: 'arc', title: 'Act I — The Gotchiverse', content: 'Canonical Act I campaign arc covering prophecy through the Great Battle.', choices: [], roles: [], order: 0, branchIndex: 0 },

  chapter('prophecy', ACT_I, 'The Prophecy', 0),
  scene('verse', `${ACT_I}/prophecy`, 'The Ancient Verse', `Before the Aadepts sacrificed themselves, they wrote a Prophecy:

Nine there were, and nine there shall be
Heed the warnings of the ancient Tree
Great fortunes hang in the balance
For Gotchi-kin who prove their valiance`, {
    choices: [{ label: 'Meditate on the verse', outcome: 'Kinship +1' }],
    roles: [{ player: 'Loremaster', action: 'Recite the prophecy' }],
    order: 0,
  }),
  scene('tree-of-fud', `${ACT_I}/prophecy`, 'Tree of FUD', 'The ancient Tree whispers warnings to those who channel near the Grid. Gotchis who heed its counsel may avoid ruin when Liquidators strike.', {
    choices: [{ label: 'Channel at the Tree', outcome: 'Gain FUD insight' }, { label: 'Press onward', outcome: 'Skip channeling' }],
    roles: [{ player: 'Channeler', action: 'Commune with the Tree' }],
    order: 1,
  }),

  chapter('arrival', ACT_I, 'Arrival in the Gotchiverse', 1),
  scene('ether-realm', `${ACT_I}/arrival`, 'Through the Ether Realm', 'Beyond the Human Realm lies the Ether Realm. Liquidated yield farmers reincarnate here as Aavegotchis — spectral frens who farm, vote, and shitpost.', {
    choices: [{ label: 'Summon a Gotchi', outcome: 'Stake Spirit Force' }],
    roles: [{ player: 'Summoner', action: 'Invoke the Great Portal' }],
    order: 0,
  }),
  scene('great-portal', `${ACT_I}/arrival`, 'The Great Portal', 'Spirits of all Aavegotchis swirl within the Great Portal. It bridges the Gotchiverse and Human Realm, tithed by harvested Alchemica.', {
    choices: [{ label: 'Enter the Citaadel', outcome: 'Safe zone' }, { label: 'Scout the Grid', outcome: 'Risk Liquidators' }],
    roles: [{ player: 'Guide', action: 'Explain Portal tithe' }],
    order: 1,
  }),
  scene('haunts', `${ACT_I}/arrival`, 'Haunts & Summoning', 'Humans stake Spirit Force to re-animate Aavegotchis, allowing travel between Gotchiverse and Ether Realm.', {
    choices: [{ label: 'Open Haunt I', outcome: 'Classic Gotchi' }, { label: 'Wait for next Haunt', outcome: 'Hold' }],
    roles: [],
    order: 2,
  }),

  chapter('citaadel', ACT_I, 'Life in the Citaadel', 2),
  scene('force-field', `${ACT_I}/citaadel`, 'The Force Field', 'The Citaadel is protected by a Force Field that keeps Liquidators out. Towers cannot be built here except near the Great Portal.', {
    choices: [{ label: 'Tour the Citaadel', outcome: 'Learn safe zones' }],
    roles: [{ player: 'Citizen', action: 'Welcome newcomers' }],
    order: 0,
  }),
  scene('aarena', `${ACT_I}/citaadel`, 'The Aarena', 'Gotchis with high Spirit Force battle in epic Battle Royales for opponents\' Spirit Force. Liquidators dare not enter.', {
    choices: [{ label: 'Enter the Aarena', outcome: 'Battle Royale' }, { label: 'Spectate', outcome: 'Gain lore' }],
    roles: [{ player: 'Champion', action: 'Fight for Spirit Force' }, { player: 'Spectator', action: 'Cheer' }],
    order: 1,
  }),
  scene('social-hub', `${ACT_I}/citaadel`, 'Gotchi Lodge Social', 'Text chat flows freely; Lodges enable voice for nearby Gotchis. Guild members may unlock global voice.', {
    choices: [{ label: 'Start a guild meeting', outcome: 'Communal channel' }],
    roles: [{ player: 'Guild Leader', action: 'Call the meeting' }],
    order: 2,
  }),

  chapter('grid-realm', ACT_I, 'The Grid', 3),
  scene('parcel-claim', `${ACT_I}/grid-realm`, 'Claim your REALM', 'Grid Parcels are plentiful but Liquidators lurk. Parcels come in Humble, Reasonably Sized, and Spacious tiers.', {
    choices: [{ label: 'Bid at GBM auction', outcome: 'Spend GHST' }, { label: 'Enter raffle', outcome: 'Use Drop Ticket' }],
    roles: [{ player: 'Landlord', action: 'Claim parcel' }],
    order: 0,
  }),
  scene('build-walls', `${ACT_I}/grid-realm`, 'Walls & Towers', 'Grid parcels may build Walls and Towers — defenses the Citaadel restricts elsewhere.', {
    choices: [{ label: 'Build Waall', outcome: 'Defense +1' }, { label: 'Build Tower', outcome: 'Offense +1' }],
    roles: [{ player: 'Builder', action: 'Spend Alchemica' }],
    order: 1,
  }),
  scene('defi-desert', `${ACT_I}/grid-realm`, 'Defi Desert', 'Arid Grid region where yield-hungry tensions run high. Harvesters work overtime here.', {
    choices: [{ label: 'Deploy Harvester', outcome: 'Passive Fud' }],
    roles: [],
    order: 2,
  }),

  chapter('alchemica', ACT_I, 'Gotchus Alchemica', 4),
  scene('four-elements', `${ACT_I}/alchemica`, 'Fud, Fomo, Alpha, Kek', 'The four elements combine into Installations and Aesthetica. Channel, farm, harvest — or spill Alchemica for Liquidators to scoop.', {
    choices: [{ label: 'Channel Kinship', outcome: 'Spend Kinship for Fud' }, { label: 'Communal channel', outcome: 'Guild bonus' }],
    roles: [{ player: 'Alchemist', action: 'Lead channeling' }],
    order: 0,
  }),
  scene('gax', `${ACT_I}/alchemica`, 'Gotchus Alchemica Exchange', 'Trade pairs on the GAX; LPs earn GLMR to speed Installation builds.', {
    choices: [{ label: 'Provide liquidity', outcome: 'Earn GLMR' }],
    roles: [{ player: 'Trader', action: 'Swap on GAX' }],
    order: 1,
  }),
  scene('installations', `${ACT_I}/alchemica`, 'Craft Installations', 'Aaltars, Harvesters, Reservoirs, Lodges, Black Holes — each crafted from Alchemica combinations traded for GHST.', {
    choices: [{ label: 'Build Aaltar', outcome: 'Unlock tech tree' }, { label: 'Build Harvester', outcome: 'Passive yield' }],
    roles: [{ player: 'Artisan', action: 'Craft installation' }],
    order: 2,
  }),

  chapter('liquidators', ACT_I, 'Liquidator Threat', 5),
  scene('invasion', `${ACT_I}/liquidators`, 'Liquidator Invasion', 'Liquidators discovered a backdoor to the Gotchiverse. They ravaged the homeland until the Aadepts erected the Force Field.', {
    choices: [{ label: 'Fight Liquidators', outcome: 'Defend parcel' }, { label: 'Play as Liquidator', outcome: 'Free-to-play raid' }],
    roles: [{ player: 'Defender', action: 'Protect Alchemica' }, { player: 'Liquidator', action: 'Harvest spillover' }],
    order: 0,
  }),
  scene('phaantastic-grounds', `${ACT_I}/liquidators`, 'Phaantastic Grounds', 'A zone where Liquidators and Gotchis may both enter — friendly fire enabled.', {
    choices: [{ label: 'Enter grounds', outcome: 'High risk PvP' }],
    roles: [],
    order: 1,
  }),

  chapter('great-battle', ACT_I, 'The Great Battle', 6),
  scene('prophecy-battle', `${ACT_I}/great-battle`, 'Nine Battles Foretold', 'The Force Field will lower nine times. Liquidators reaching the Great Portal plunder stored Alchemica; parcels replenish after each battle.', {
    choices: [{ label: 'Prepare defenses', outcome: 'Fortify parcel' }, { label: 'Rally the DAO', outcome: 'Coordinate merge' }],
    roles: [{ player: 'Commander', action: 'Strategize defense' }, { player: 'DAO', action: 'Vote on tactics' }],
    order: 0,
  }),
  scene('battle-one', `${ACT_I}/great-battle`, 'First Great Battle', 'Act I climax: Liquidators breach the Grid. Gotchis must prove their valiance or lose Portal tithe.', {
    choices: [{ label: 'Hold the line', outcome: 'Save Alchemica' }, { label: 'Evacuate to Citaadel', outcome: 'Lose Grid yield' }],
    roles: [{ player: 'Hero', action: 'Lead the defense' }],
    order: 1,
    branchIndex: 0,
  }),
  scene('battle-one-alt', `${ACT_I}/great-battle`, 'First Great Battle (Liquidator path)', 'Liquidators surge toward the Portal tithe. Can they break through before the Field resets?', {
    choices: [{ label: 'Rush the Portal', outcome: 'Plunder tithe' }],
    roles: [{ player: 'Liquidator Captain', action: 'Lead the raid' }],
    order: 1,
    branchIndex: 1,
  }),

  chapter('aadventures', ACT_I, 'Aadventures & Beyond', 7),
  scene('aadventure-gate', `${ACT_I}/aadventures`, 'Leave the Citaadel', 'Aadventures are special regions where Gotchis test stats and wearables against NPC enemies — but they do not last forever.', {
    choices: [{ label: 'Enter Aadventure', outcome: 'Earn XP' }, { label: 'Stay in Realm', outcome: 'Farm parcels' }],
    roles: [{ player: 'Adventurer', action: 'Lead the party' }],
    order: 0,
  }),
  scene('beyond-tease', `${ACT_I}/aadventures`, 'The Beyond', 'Locked parcels await Act 2. The DAO watches the horizon as Grid parcels fill and battles repeat.', {
    choices: [{ label: 'End Act I session', outcome: 'Credits roll' }],
    roles: [{ player: 'Loremaster', action: 'Close the session' }],
    order: 1,
  }),
];

module.exports = { ACT_I, CAMPAIGN_NODES };
