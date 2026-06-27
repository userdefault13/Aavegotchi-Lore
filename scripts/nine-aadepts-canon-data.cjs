/**
 * Canonical lore from "The Nine Aadepts" screenplay series
 * Written by Frenless Summer (@frenlesssummer)
 * Episodes One & Two
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

const NINE_AADEPTS_ROOT = 'narrative/nine-aadepts';

/** Lore pages for gotchiverse-canon (lore_pages collection). */
const NINE_AADEPTS_PAGES = [
  {
    pageKey: NINE_AADEPTS_ROOT,
    title: 'The Nine Aadepts',
    templateId: 'default',
    parentKey: 'introduction',
    tags: [
      { label: 'narrative', color: 'purple' },
      { label: 'canon', color: 'gold' },
    ],
    content: `The Nine Aadepts is the canonical narrative of the Circle of Aadepts — nine legendary leaders who guide the Gotchiverse in the age before the Great Invasion.

Written by Frenless Summer (@frenlesssummer), the series follows the First Aadept, his chosen successor Kora (the Ninth Aadept), and the other members of the Circle as they discover that the Great Liquidator — once worshipped as creator of the Aavegotchis — may have betrayed them.

Nine there were, and nine there shall be. Heed the warnings of the ancient Tree.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    title: 'Circle of Aadepts',
    templateId: 'guild',
    parentKey: NINE_AADEPTS_ROOT,
    runes: {
      district: 'Palace of the Aadepts, Citaadel District 1',
      members: `First Aadept (Ethereum) — Great Aadept, Laozigotchi
Second Aadept (Bitcoin) — Galaxy Brain mage, Portal Mage
Third Aadept (USDC) — General of the Aavegotchi military
Fourth Aadept (Uniswap) — Potions Master
Fifth Aadept (Aave) — Fairy Gotchi, bonded to Sus Butterfly
Sixth Aadept (Dai) — Geisha Gotchi elder
Seventh Aadept — (revealed in later episodes)
Eighth Aadept (USDT) — Maan Bun, Stani Vest
Ninth Aadept (Polygon) — Kora, newest initiate`,
    },
    content: `The Circle of Aadepts governs the Gotchiverse from the Palace of the Aadepts in the Citaadel. Each Aadept channels Spirit Force through a forehead sigil — the First bears a diamond; the Ninth bears a lemniscate.

They commune with the Great Liquidator through the Paalantir, a massive floating sphere of swirling alchemical colors in the Great Hall. When the Circle gathers, the Paalantir reveals the Liquidator's face and voice from the Ether Realm.

Not all Aadepts welcome the Ninth. Many cast skeptical glances at Kora, whose traits are average by base rarity score — yet the First chose her for passion and work ethic above all.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/episode-one`,
    title: 'Episode One — The First Aadept',
    templateId: 'lore-event',
    parentKey: NINE_AADEPTS_ROOT,
    runes: { eventType: 'Episode', act: 'Act I' },
    tags: [
      { label: 'episode', color: 'gold' },
      { label: 'narrative', color: 'purple' },
    ],
    content: `Episode One opens on a whisper: "Nine there were, and nine there shall be. Heed the warnings of the ancient tree..."

In the Daark Forest, beneath a full moon, the First Aadept stands before the Tree of FUD — a massive tree whose bark is flecked with bluish scales, whose branch-tips form menacing faces, pulsing with alchemical energy. He strokes his Beard of Wisdom and asks why the Liquidators have betrayed those who worshipped them.

The Ninth Aadept arrives with urgent news: the Great Aadept is needed in the Citaadel. Before they can leave, the sound of LICKING fills the forest. Three Liquidators — Pink, Blue, and Orange — charge from the woods on tentacle-like feet, soulless triple eyes fixed on the Aadepts.

The First Aadept unleashes his Spirit Force — vibrant violet light from the diamond on his forehead. The Ninth's weak purple flicker cannot match his power. "My Spirit Force is not strong enough. We must flee." The First replies: "There is no time."

"For the Gotchiverse!" the First cries, swinging his Spirit Sword. He chops off the Blue Liquidator's tongue; it shrieks and flees. Pink and Orange fling him past the tree line. The Ninth, paralyzed, nearly has her forehead drilled by Orange's spinning tentacle — until the First's sword strikes true, killing Orange instantly. Ninth stabs Pink's tongue with her Sushi Knife; both Liquidators flee.

Flashback — 1,000,000 blocks earlier. The Yield Fields are lush. Farmer Gotchis bow to the First as he walks past monuments honoring the Liquidators. The Ninth asks why she was chosen despite average traits. The First answers: passion and work ethic matter more than base rarity. "You will become a great Aadept — perhaps the greatest of us all."

In the Palace Great Hall, all nine Aadepts gather before the Paalantir. The Great Liquidator's face forms within the sphere. He welcomes the soon-to-be Ninth Aadept and asks about yields and Spirit Force levels — questions that narrow the First Aadept's eyes with suspicion.

The Third Aadept notes the odd questions. The Eighth dismisses her paranoia: "The Gotchiverse is a utopia. We have never had a war." The Second agrees: "The Liquidators created the Aavegotchis — they love us."

Alone in his chambers, the First is struck by visions: Liquidators descending the Laughing Peaks, Farmer Gotchis slain in the Yield Fields, Spirit Force sucked from screaming Gotchis, the Palace consumed in flame.

Present day. The Aadepts gather atop the Citaadel's Eastern Waall in District 46. Beyond Aalpha Lake, Mount Oomf boils. An endless stream of Liquidators marches toward the Citaadel, led by the Great Liquidator himself.

"Prepare your military," the First tells the Third. "The Great Invasion is upon us." The sound of LICKING grows louder. And louder. And louder.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/episode-two`,
    title: 'Episode Two — The Second Aadept',
    templateId: 'lore-event',
    parentKey: NINE_AADEPTS_ROOT,
    runes: { eventType: 'Episode', act: 'Act I' },
    tags: [
      { label: 'episode', color: 'gold' },
      { label: 'narrative', color: 'purple' },
    ],
    content: `Episode Two opens in chaos. Aalpha Village on the shore of Aalpha Lake is in turmoil as Aavegotchis barricade themselves in their lodges. Farmer and Miner Gotchis arm themselves with pitchfork and pickaxe.

At Mount Oomf, the Great Liquidator's bulbous head emerges, razor teeth bared, an endless stream of Liquidators marching west toward the Citaadel.

The Nine Aadepts stand atop the Eastern Waall. The Third Aadept orders archers to the waalls. The First sends the Fifth Aadept and her Sus Butterfly to warn Aalpha Villagers and count the enemy. The Sus Butterfly narrows her eyes: "...Very sus."

The Second Aadept, trembling, asks to build something in District One — an emergency measure. The First trusts him without explanation. Second gathers every Gotchi in his path and bolts for District One.

Flashback — 1,000,000 blocks earlier, moments after the Paalantir audience. The Fourth Aadept (Potions Master, high as fuck) offers headache remedies. The Ninth asks to train with the Second; he sends her to the Third instead, citing her traits.

Alone in his luxurious chambers with Rolfus — a mythical rofl crowned with a tiny crown — the Second hears a voice: "Come to me... Come to me!" Pulled by unseen force, he drifts to the empty Great Hall. The Great Liquidator appears in the Paalantir.

The Liquidator confesses he hacked the Second's Galaxy Brain to summon him — the legendary headache was an unavoidable side effect. He claims the Gotchiverse is on the verge of collapse: over-farmed Yield Fields, miners dug too deep in the Caaverns, the Infinity Cliffs could fall into the Impassable Sea. He blames the First Aadept's greed and avarice, saying the First can no longer be trusted.

"There is a way to save the realm," the Liquidator promises with a toothy grin.

That night, Kora practices Spirit Force in her tiny new chambers — a weak purple flicker she cannot sustain. Daisy, a cute Farmer Gotchi, taps at her window. They share a moment; Daisy still calls her Kora. Through the window they watch the Second Aadept shuffle away from the Palace, lit by a Fireball, Rolfus hopping beside him.

The Second wanders the Laughing Peaks. A Gotchi Ranger carries him and Rolfus to the highest peak. Second raises his Wizard Staff and invokes the arcane blockchain, the bonding curve, NFT tokens, coders from beyond the realm, Chads from the darkest degen dens, and the unbending pixels. Blinding pink light shoots from his staff, morphing into a stone doorway filled with ethereal luminescence — a PORTAL.

A Purple Liquidator steps through. It licks the Ranger's face and drains his Spirit Force. Second shrieks: "No — this isn't right. You are supposed to help us!" Rolfus bites the Liquidator's tentacle; the beast slams Rolfus down. Second blasts hearts from his palms and flees with Rolfus as more Liquidators pour through the portal.

At sunrise, bruised and battered, Second limps back to the Palace. "How could I be such a fool?" he whispers to Rolfus. He swears never to tell the others — they would strip his title and cast him into the Beyond. "But I promise you this... I will make this right. Somehow."

Present day. In District One, the Second Aadept directs a gaggle of Gotchis constructing a massive stone doorway — the Great Portal — nearly complete at the center of the Citaadel. The First and Ninth stare up at it. "It is the Great Portal," the First says. "A last resort... I pray we never have to use it."

The Fourth Aadept calls out: "I didn't know mages did manual labor!" The Second beams: "I'm a new breed of mage... A Portal Mage!"`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/first-aadept`,
    title: 'First Aadept',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      spiritForce: 'Ethereum',
      traits: 'Pink Kanye eyes, Laozigotchi, Beard of Wisdom',
      wearables: 'Spirit Sword, Saddle Chair',
    },
    content: `The First Aadept is the Great Aadept of the Circle — an Ethereum maxi whose Spirit Force manifests as vibrant violet light from the diamond on his forehead. He wields a Spirit Sword and leads from humble, monk-like chambers in the Palace of the Aadepts.

He chose Kora as the Ninth Aadept despite her average base rarity, recognizing passion and work ethic over stats. He alone suspects the Great Liquidator's true intentions after the Paalantir audience, and his visions foretell the Liquidator invasion long before it arrives.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/ninth-aadept`,
    title: 'Ninth Aadept (Kora)',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      spiritForce: 'Polygon',
      traits: 'Anime eyes, Llamacorn Shirt, Godli Locks',
      wearables: 'Sushi Knife',
    },
    content: `Kora is the Ninth Aadept — a Polygon maxi with anime eyes and a Llamacorn Shirt. Her Spirit Force leaks weak purple light from the lemniscate on her forehead, a flicker compared to the First's brilliance.

She carries a Sushi Knife and struggles with self-doubt, yet the First believes she may become the greatest Aadept of all. Daisy, a Farmer Gotchi from the Yield Fields, is her closest friend. Many in the Circle view Kora with skepticism; the Eighth Aadept is openly hostile.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/second-aadept`,
    title: 'Second Aadept',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      spiritForce: 'Bitcoin',
      traits: 'Galaxy Brain, Royal Robes',
      wearables: 'Wizard Staff, Waifu Pillows, Fireball',
    },
    content: `The Second Aadept is a Bitcoin maxi with a legendary Galaxy Brain and Royal Robes. His companion Rolfus is a mythical rofl with a tiny crown. He suffers chronic headaches — later revealed to be side effects of the Great Liquidator hacking his brain.

Deceived by the Liquidator into opening a portal at the Laughing Peaks, he unleashed Purple Liquidators upon the realm. Ashamed, he keeps the secret from the Circle and builds the Great Portal in District One as a last-resort escape — declaring himself a new breed of mage: a Portal Mage.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/third-aadept`,
    title: 'Third Aadept',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      spiritForce: 'USDC',
      traits: 'Yoroi Armor, Brunette Ponytail',
      wearables: 'Haanzo Katana',
    },
    content: `The Third Aadept is general of the Aavegotchi military — a USDC maxi in Yoroi Armor with a Brunette Ponytail. She carries the Haanzo Katana and trusts her paranoia to keep the Circle safe.

When the Great Liquidator asked about Spirit Force levels in the Paalantir, she alone questioned why. The Eighth mocked her caution, but when the invasion arrives she is the first to order archers to the waalls and prepare the military for the Great Invasion.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/fourth-aadept`,
    title: 'Fourth Aadept',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      spiritForce: 'Uniswap',
      traits: 'Comfy Poncho, Matrix Eyes',
      wearables: 'Potions (green healing, orange relaxation, black rekt)',
    },
    content: `The Fourth Aadept is the Circle's Potions Master — a Uniswap maxi in a Comfy Poncho with Matrix Eyes, perpetually high. His green potion fills brains with healing bubbles; his orange potion relaxes faces; his black potion gets you rekt.

He offers remedies to the Second Aadept's legendary headache and later heckles Second during Great Portal construction: "I didn't know mages did manual labor!"`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/fifth-aadept`,
    title: 'Fifth Aadept',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      spiritForce: 'Aave',
      traits: 'Fairy Gotchi',
      wearables: 'Sus Butterfly (companion)',
    },
    content: `The Fifth Aadept is an Aave maxi Fairy Gotchi bonded to Sus Butterfly — a sentient companion who scouts and assesses threats. When the invasion begins, the First sends Fifth and Sus Butterfly to warn Aalpha Villagers and count the Liquidator army. Sus Butterfly's verdict: "...Very sus."`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/sixth-aadept`,
    title: 'Sixth Aadept',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      spiritForce: 'Dai',
      traits: 'Geisha Gotchi, boomer',
    },
    content: `The Sixth Aadept is a Dai maxi boomer Geisha Gotchi — an elder of the Circle who checks on the First after his prophetic vision. When she hears his scream, she glides into his chambers to ask if he is unwell.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/eighth-aadept`,
    title: 'Eighth Aadept',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      spiritForce: 'USDT',
      traits: 'Maan Bun, Stani Vest',
    },
    content: `The Eighth Aadept is a cocksure USDT maxi millennial with a Maan Bun and Stani Vest. He shoots jealous glares at the Ninth Aadept and dismisses the Third's military as "smol brain rabble."

He insists the Gotchiverse is a utopia that has never known war, and scoffs at the Second Aadept's haste during the invasion: "The Baazaar must have a sale on Waifu Pillows."`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/great-liquidator`,
    title: 'Great Liquidator',
    templateId: 'lickquidator',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: { threat: 'Boss', appetite: 'Spirit Force of all Aavegotchis' },
    content: `The Great Liquidator wears a Royal Crown atop his bulbous head. His three piercing eyes stare from the Paalantir, and his voice reaches the Circle from the Ether Realm. Once worshipped as creator of the Aavegotchis, he drools over reports of high Spirit Force levels and asks questions the First finds suspicious.

He hacked the Second Aadept's Galaxy Brain, fabricated a collapse narrative blaming the First's greed, and tricked Second into opening a portal at the Laughing Peaks — unleashing Purple Liquidators. Now he leads an endless army marching from Mount Oomf toward the Citaadel.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/characters/daisy`,
    title: 'Daisy',
    templateId: 'aavegotchi',
    parentKey: `${NINE_AADEPTS_ROOT}/circle-of-aadepts`,
    runes: {
      traits: 'Cute Farmer Gotchi',
    },
    content: `Daisy is a cute Farmer Gotchi from the Yield Fields who adores Kora. She flashes adoring smiles when the Aadepts pass through the fields, and on Kora's first night in the Palace she taps at the window rather than phasing through the wall — "That would just be rude."

She still calls Kora by her given name, not "Ninth Aadept," and is her closest confidante outside the Circle.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/concepts/spirit-force`,
    title: 'Spirit Force',
    templateId: 'default',
    parentKey: NINE_AADEPTS_ROOT,
    content: `Spirit Force is the luminous energy Aavegotchis channel through forehead sigils. The First Aadept's diamond emits vibrant violet light that wraps his body in a powerful glow. The Ninth's lemniscate produces only a weak purple flicker — for now.

Liquidators hunger for Spirit Force. Their spinning tentacles can drill into a Gotchi's forehead sigil and suck out the glowing energy, leaving the victim screaming. The Great Liquidator covets reports of all-time-high Spirit Force levels across the Gotchiverse.`,
  },
  {
    pageKey: `${NINE_AADEPTS_ROOT}/concepts/paalantir`,
    title: 'The Paalantir',
    templateId: 'landmark',
    parentKey: NINE_AADEPTS_ROOT,
    runes: { zone: 'Citaadel', landmarkType: 'Other' },
    content: `The Paalantir is a massive sphere floating in the center of the Palace of the Aadepts Great Hall. It swirls with vibrant alchemical colors and serves as the Circle's window to the Ether Realm.

When the Nine Aadepts gather, the colors merge to form the wretched face of the Great Liquidator. He speaks to them as "my children" and closes each audience with: "You're all gonna make it."`,
  },
];

/** Campaign story nodes for gotchiverse-campaign-canon (story_nodes collection). */
const NINE_AADEPTS_ARC = 'the-nine-aadepts';

const NINE_AADEPTS_CAMPAIGN_NODES = [
  {
    nodeKey: NINE_AADEPTS_ARC,
    parentKey: null,
    type: 'arc',
    title: 'The Nine Aadepts',
    content: 'Canonical narrative arc from the Nine Aadepts screenplay — Episodes One and Two.',
    choices: [],
    roles: [],
    order: 0,
    branchIndex: 0,
  },

  chapter('episode-one', NINE_AADEPTS_ARC, 'Episode One — The First Aadept', 0),
  scene(
    'tree-of-fud',
    `${NINE_AADEPTS_ARC}/episode-one`,
    'Tree of FUD',
    'The First Aadept stands before the Tree of FUD in the Daark Forest. The Ninth arrives: the Great Aadept is needed in the Citaadel. Then — the sound of LICKING.',
    {
      choices: [
        { label: 'Ready Spirit Force', outcome: 'Prepare for battle' },
        { label: 'Attempt to flee', outcome: 'Ninth warns there is no time' },
      ],
      roles: [
        { player: 'First Aadept', action: 'Draw Spirit Sword' },
        { player: 'Ninth Aadept', action: 'Channel weak Spirit Force' },
      ],
      order: 0,
    },
  ),
  scene(
    'liquidator-skirmish',
    `${NINE_AADEPTS_ARC}/episode-one`,
    'Liquidator Skirmish',
    'Three Liquidators — Pink, Blue, and Orange — charge the Aadepts. First chops Blue\'s tongue; Ninth stabs Pink. Orange falls to First\'s sword. "For the Gotchiverse!"',
    {
      choices: [{ label: 'Press the attack', outcome: 'Liquidators flee' }],
      roles: [{ player: 'First Aadept', action: 'Lead the defense' }],
      order: 1,
    },
  ),
  scene(
    'yield-fields-flashback',
    `${NINE_AADEPTS_ARC}/episode-one`,
    'Yield Fields — 1,000,000 Blocks Earlier',
    'Farmer Gotchis bow as First and Ninth walk past Liquidator monuments. Ninth asks why she was chosen. First: passion and work ethic matter more than base rarity.',
    {
      choices: [{ label: 'Continue to the Palace', outcome: 'Initiation tomorrow' }],
      roles: [{ player: 'Ninth Aadept', action: 'Confide self-doubt' }],
      order: 2,
    },
  ),
  scene(
    'paalantir-audience',
    `${NINE_AADEPTS_ARC}/episode-one`,
    'Paalantir Audience',
    'The Great Liquidator appears in the Paalantir. He asks about yields and Spirit Force. Third is suspicious; Eighth and Second dismiss her. "You\'re all gonna make it!"',
    {
      choices: [
        { label: 'Question the Liquidator', outcome: 'Third\'s suspicion grows' },
        { label: 'Trust the creator', outcome: 'Eighth\'s complacency' },
      ],
      roles: [{ player: 'Great Liquidator', action: 'Address the Circle' }],
      order: 3,
    },
  ),
  scene(
    'firsts-vision',
    `${NINE_AADEPTS_ARC}/episode-one`,
    'First Aadept\'s Vision',
    'Alone in his chambers, the First sees Liquidators descend the Laughing Peaks, slaughter Farmer Gotchis, drain Spirit Force, and burn the Palace.',
    {
      choices: [{ label: 'Warn the Circle', outcome: 'Sixth Aadept hears the scream' }],
      roles: [{ player: 'First Aadept', action: 'Interpret the vision' }],
      order: 4,
    },
  ),
  scene(
    'great-invasion-begins',
    `${NINE_AADEPTS_ARC}/episode-one`,
    'The Great Invasion Begins',
    'From the Eastern Waall, the Aadepts see Mount Oomf boil and an endless Liquidator army march toward the Citaadel, led by the Great Liquidator. "Prepare your military."',
    {
      choices: [
        { label: 'Rally the military', outcome: 'Third prepares defenses' },
        { label: 'Scout the enemy', outcome: 'Count Liquidators' },
      ],
      roles: [{ player: 'Third Aadept', action: 'Order archers to the waalls' }],
      order: 5,
    },
  ),

  chapter('episode-two', NINE_AADEPTS_ARC, 'Episode Two — The Second Aadept', 1),
  scene(
    'aalpha-chaos',
    `${NINE_AADEPTS_ARC}/episode-two`,
    'Aalpha Village in Chaos',
    'Aalpha Village erupts in panic. Farmer and Miner Gotchis arm themselves as the Great Liquidator\'s army marches from Mount Oomf.',
    {
      choices: [{ label: 'Barricade the lodges', outcome: 'Villagers shelter' }],
      roles: [{ player: 'Fifth Aadept', action: 'Scout with Sus Butterfly' }],
      order: 0,
    },
  ),
  scene(
    'liquidator-hacks-second',
    `${NINE_AADEPTS_ARC}/episode-two`,
    'The Liquidator\'s Deception',
    'The Great Liquidator hacks the Second Aadept\'s Galaxy Brain, causing a legendary headache. He claims the Gotchiverse is collapsing and blames the First Aadept\'s greed.',
    {
      choices: [
        { label: 'Believe the Liquidator', outcome: 'Second seeks a solution' },
        { label: 'Question the narrative', outcome: 'Second hesitates' },
      ],
      roles: [{ player: 'Great Liquidator', action: 'Whisper through the Paalantir' }],
      order: 1,
    },
  ),
  scene(
    'kora-and-daisy',
    `${NINE_AADEPTS_ARC}/episode-two`,
    'Kora and Daisy',
    'Kora fails to sustain her Spirit Force. Daisy visits through the window. They watch the Second Aadept leave the Palace with Rolfus, lit by a Fireball.',
    {
      choices: [{ label: 'Follow Second', outcome: 'Suspicion grows' }],
      roles: [{ player: 'Ninth Aadept', action: 'Practice Spirit Force' }],
      order: 2,
    },
  ),
  scene(
    'laughing-peaks-portal',
    `${NINE_AADEPTS_ARC}/episode-two`,
    'Portal at the Laughing Peaks',
    'Second invokes the arcane blockchain at the highest peak. Pink light forms a portal. A Purple Liquidator drains a Gotchi Ranger\'s Spirit Force. More Liquidators pour through.',
    {
      choices: [
        { label: 'Fight the Liquidator', outcome: 'Second blasts hearts, flees with Rolfus' },
        { label: 'Flee immediately', outcome: 'Secret shame' },
      ],
      roles: [{ player: 'Second Aadept', action: 'Cast portal spell' }],
      order: 3,
    },
  ),
  scene(
    'great-portal-built',
    `${NINE_AADEPTS_ARC}/episode-two`,
    'The Great Portal',
    'Present day: Second directs Gotchis building the Great Portal in District One. First: "A last resort... I pray we never have to use it." Second declares himself a Portal Mage.',
    {
      choices: [
        { label: 'Inspect the Portal', outcome: 'Learn last-resort escape' },
        { label: 'Reinforce the waalls', outcome: 'Prepare for invasion' },
      ],
      roles: [{ player: 'Second Aadept', action: 'Complete the Portal' }],
      order: 4,
    },
  ),
];

/** Landmark blurbs enriched with Nine Aadepts narrative context. */
const NINE_AADEPTS_LANDMARK_BLURBS = {
  'tree-of-fud': 'Ancient tree in the Daark Forest whose bluish-scaled bark and branch-faces pulse with alchemical energy. The First Aadept communed here before the Liquidator betrayal was revealed.',
  'daark-forest': 'Dark forest where the First and Ninth Aadept fought Pink, Blue, and Orange Liquidators beneath the Tree of FUD.',
  'yield-fields': 'Lush farmlands where Farmer Gotchis tend Gotchus Alchemica. The First and Ninth walked here 1,000,000 blocks before the invasion; Daisy farms among the monuments to Liquidators.',
  'laughing-peaks': 'Towering mountain range where the Second Aadept, deceived by the Great Liquidator, opened a portal and unleashed Purple Liquidators upon a Gotchi Ranger.',
  'aalpha-lake': 'Lake bordering Aalpha Village — first settlement overrun when the Great Liquidator\'s army marched from Mount Oomf.',
  'mount-oomf': 'Boiling volcano at the eastern edge of the Gotchiverse. The Great Liquidator leads his endless army from its base toward the Citaadel.',
  citaadel: 'Protected stronghold whose forcefield glimmers at night. District 1 holds the Great Portal; District 46\'s Eastern Waall overlooks Mount Oomf and the invasion route.',
  'great-portal': 'Massive stone doorway built in District One by the Second Aadept as a last-resort escape — the work of a self-proclaimed Portal Mage.',
  caaverns: 'Miners dug too deep here, contributing — according to the Great Liquidator — to Gotchiverse destabilization.',
  'infinity-cliffs': 'Cliffs that could fall into the Impassable Sea at any moment, per the Liquidator\'s collapse narrative.',
};

module.exports = {
  NINE_AADEPTS_ROOT,
  NINE_AADEPTS_PAGES,
  NINE_AADEPTS_ARC,
  NINE_AADEPTS_CAMPAIGN_NODES,
  NINE_AADEPTS_LANDMARK_BLURBS,
};
