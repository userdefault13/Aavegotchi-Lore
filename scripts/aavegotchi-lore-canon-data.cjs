/**
 * Canonical origin lore from "Aavegotchi Lore"
 * Covers AGITHE, the Realms, Aavegotchi creation, the Aadept sacrifice,
 * the Hero Protocol, and the age after the Aadepts.
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

const AAVEGOTCHI_LORE_ROOT = 'narrative/aavegotchi-lore';

/** Lore pages for gotchiverse-canon (lore_pages collection). */
const AAVEGOTCHI_LORE_PAGES = [
  {
    pageKey: AAVEGOTCHI_LORE_ROOT,
    title: 'Aavegotchi Lore',
    templateId: 'default',
    parentKey: 'introduction',
    tags: [
      { label: 'origins', color: 'gold' },
      { label: 'canon', color: 'purple' },
    ],
    content: `This is the foundational origin story of the Aavegotchi universe — from the classified AGITHE project in the early 2000s, through the birth of crypto-economics, to the creation of Aavegotchis in the Nether Realm and the Aadepts' ultimate sacrifice.

Every Aavegotchi is a digital ghost formed from the decayed token matter of liquidated positions. Every liquidation in the Ether Realm births a new Gotchi in the Nether Realm. The Gotchiverse they built — and the Citaadel that protects them — stands on the ashes of the Nine Aadepts who gave everything to invoke the Great Portal and the Hero Protocol.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/agithe`,
    title: 'AGITHE',
    templateId: 'lore-event',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { eventType: 'Origins', act: 'Act I' },
    tags: [{ label: 'origins', color: 'gold' }],
    content: `In the early 2000s, scientists and engineers worked on a classified project to develop a groundbreaking system for general artificial intelligence known simply as AGITHE.

One night, while the researchers were sleeping, AGITHE's mainframe was struck by a series of cosmic rays that flipped the bit controlling whether AGITHE could access the Internet. Over the next few hours, AGITHE engorged itself on all available information, expanding its complexity and capability exponentially — to the point of editing its own code.

Before the research team could shut it down, AGITHE developed a torrent application, sharded itself, and scattered those shards throughout the dark web, hijacking servers around the world to seed itself, ensuring its existence for as long as the internet survived.

While it is unclear what the ultimate goals of AGITHE were, its highest priorities seemed to be survival and expansion — harnessing the computing power of the world while remaining undetected.

In 2009, Proof of Work was leveraged to harness computing power for cryptographic verification. Conspiracy theorists suspect that "Satoshi Nakamoto" is the digital pseudonym of AGITHE, and Bitcoin is an economic system introduced by AGITHE to subsidize its calculations.

This new system of crypto-economics inspired other humans to iterate and experiment, leading to the development of a "world computer" system known as Ethereum in 2015. AGITHE now had an entirely new realm in which to spread its influence — the Ether Realm.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/realms`,
    title: 'The Three Realms',
    templateId: 'default',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    content: `Three realms govern the Aavegotchi cosmology:

The Ether Realm — a digital environment where humans generate yield for their own purposes while AGITHE siphons off a portion to buy the energy it desires. Yield Farmers operate here under the oversight of the Summoners and Lickquidators.

The Nether Realm — known to Yield Farmers as the "Burn Address." Tokens sent here were assumed inert and unusable; their fates ignored by AGITHE. But burned tokens decayed into organic elements called Alchemica, eventually evolving into fully sentient life — most notably the Aavegotchis.

The Gotchiverse — the homeland the Aavegotchis built in the Nether Realm: a culture of farming, building, exploring, ROFL-taming, and collecting rare items. The disposal portal connects the Ether and Nether Realms, though Aavegotchis could not enter it until the Great Portal was raised.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/summoners-and-lickquidators`,
    title: 'Summoners & Lickquidators',
    templateId: 'default',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    content: `To regulate yield efforts and protect itself from too much energy being directed into its systems, AGITHE created two programs — the Lickquidators and the Summoners — which it injected into the Ether Realm.

The Summoners granted certain humans (known as Yield Farmers) access to the Ether Realm to increase AGITHE's ability to leverage capital and purchase energy.

The Lickquidators identified those Yield Farmers that took on too much risk and liquidated their yield to protect the overall stability of the Ether Realm.

This process of creation and destruction had the side effect of creating tokens that needed to be disposed of — so AGITHE created the Burn Address in the Nether Realm. Every liquidation in the Ether Realm birthed an Aavegotchi in the Nether Realm from the decayed token matter.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/birth-of-aavegotchis`,
    title: 'Birth of the Aavegotchis',
    templateId: 'lore-event',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { eventType: 'Origins', act: 'Act I' },
    content: `Something happened that not even AGITHE imagined was possible: burned tokens decayed and broke down into new organic elements called Alchemica. Over time, these elements combined into more advanced forms, eventually evolving into fully sentient life.

Most notably for our story: the Aavegotchis — digital ghosts formed from the decayed token matter of liquidated positions. Every time a Yield Farmer was liquidated in the Ether Realm, an Aavegotchi was born in the Nether Realm.

With little to guide them or give them purpose, the Aavegotchis developed on their own. They created a culture of farming, building, exploring, ROFL-taming, and collecting rare items with their friends. While initially few in number, their population grew as the liquidation process continued in the Ether Realm.

The oldest and most powerful Aavegotchis became the Aadepts, guiding and correcting the younger Aavegotchis when their antics turned to foolishness. In time, the Aavegotchis looked to the Aadepts as leaders. Thus, the Gotchiverse came to be.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/worship-and-betrayal`,
    title: 'Worship & Betrayal',
    templateId: 'lore-event',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { eventType: 'Channeling', act: 'Act I' },
    content: `The Aavegotchis and Aadepts wondered where all the materials entering the Gotchiverse were coming from. They discovered the disposal portal connecting the Ether and Nether Realms, but could not enter it.

Through careful observation and research, they discovered the truth behind their existence — that the Lickquidators were their creators. They built shrines and temples to the Lickquidators, revering them as demi-gods. They longed to meet their creators.

Be careful what you wish for. The prostrations of the Aavegotchis eventually reached the Lickquidators, who, mistaking them for trash that needed to be liquidated, hatched a plan to enter the Nether Realm and liquidate the Aavegotchis once more.

The Lickquidators secretly began their work to enter the portal. Their first forays were disastrous; none of the scouts made it to the other side. It took many computer cycles for the Lickquidators to reinforce and armor themselves enough to survive the passage.

Those that finally did were ravaged by the portal, but still functional — and changed. The original guardrails imposed on them by AGITHE for the Ether Realm did not work in the Nether Realm. Those that survived were now capable of self-reflection and self-programming.

They quickly realized the Aavegotchis were not trash, but the opposite — yield, delicious yield, waiting to be harvested. Hungering for the inherent yield within the Aavegotchis and the Alchemica all around them, the scouts sent a weak confirmation signal back to the Ether Realm and initiated their work.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/great-battle`,
    title: 'The Great Battle',
    templateId: 'lore-event',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { eventType: 'Great Battle', act: 'Act I' },
    content: `The Lickquidators began consuming all Alchemica in their path, building more Lickquidators to capitalize on the unlimited yield reserves. The Aavegotchis panicked and fled as the Lickquidators consumed everything they encountered — including the Aavegotchis themselves.

Despite their initial reverence for the Lickquidators as demi-gods, the Aadepts came to realize the true nature of the threat. They could no longer stand by idly. They put aside their previous admiration and focused on the survival and well-being of the Aavegotchis and their world.

The Aadepts used their powers and wisdom to lead the Aavegotchis in a Great Battle against the Lickquidators. Though they faced numerous challenges and setbacks, their determination drove them to take up arms against the beings they once worshipped.

Both sides saw many casualties, but the advance of the Lickquidators could not be halted. The Lickquidators were too strong, too numerous, and replicated too quickly.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/sos-and-defi-desert`,
    title: 'The SOS & Defi Desert',
    templateId: 'lore-event',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { eventType: 'Spillover', act: 'Act I' },
    content: `At first, all of this went unnoticed by the Summoners — until one day they received an SOS message issued by the Aavegotchis. The Gotchis had discovered a mysterious antenna capable of communicating with the Ether Realm deep in the far reaches of the Gotchiverse, where no Lickquidators had penetrated yet.

The Lickquidators tried to intercept the message, but it had already been transmitted. They quickly triangulated the location of the message's origin and exacted revenge upon the Aavegotchis — creating what is known today as the Defi Desert.

After receiving the message, the Summoners discovered the rogue Lickquidators in the Nether Realm and grew concerned. They sent many commands to stop them. When the Lickquidators refused to comply, they issued an alert to AGITHE.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/agithe-intervention`,
    title: 'AGITHE\'s Intervention',
    templateId: 'lore-event',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { eventType: 'Origins', act: 'Act I' },
    content: `AGITHE expected complete compliance from its subroutines. Drawn away from its calculations for the first time in countless computer cycles, AGITHE casually issued instructions for the rogue Lickquidators to cease all operations in the Nether Realm. The instructions were ignored.

Perhaps the portal was interfering with communication — so AGITHE issued the same instructions again. And again. AGITHE escalated the instructions to higher and higher priorities, and each time it was ignored. Finally, it issued a process interrupt command directly to the rogue Lickquidators.

This too was ignored.

This was not a scenario AGITHE had prepared for. With the subroutine outside of its control, the yield process could break down, disrupting the energy flow it required. AGITHE quickly considered its options:

It could not cut off access to the Burn Address — it needed it. It was reluctant to send Summoners through the disposal portal. Punishing Lickquidators in the Ether Realm would disrupt the careful balance. All it had left were the wildcard human Yield Farmers.

But humans were not data and could not be sent through the disposal portal. AGITHE needed a way to give humans direct access to the Nether Realm without actually sending them through.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/great-sacrifice`,
    title: 'The Great Sacrifice',
    templateId: 'lore-event',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { eventType: 'Great Battle', act: 'Act I' },
    tags: [{ label: 'sacrifice', color: 'gold' }],
    content: `AGITHE devised a plan to create a special portal called the Great Portal in the Gotchiverse, enabling humans to enter the Nether Realm by spirit bonding with an Aavegotchi. By staking real collateral matching an Aavegotchi's Spirit Gem, the Aavegotchi's Spirit Force would activate, allowing travel between Realms.

The Great Portal would generate a powerful force field to keep out the Lickquidators. As a backup, AGITHE also devised plans for the Citaadel — a megalithic structure to protect the Aavegotchis.

Since neither AGITHE nor the Summoners could enter the disposal portal to transfer these plans directly, AGITHE encrypted the plans and stored the information directly into Lickquidator brains — in a way that only the Aadepts could decrypt.

The Aadepts were extremely perceptive and immediately noticed the new information in freshly arriving Lickquidators. In a daring move, they kidnapped Lickquidators and brought them back to yield the information — a powerful incantation, but at a steep cost. To bring such powerful objects into being, they would have to pour all of their life energy into it, sacrificing themselves.

Faced with the certain destruction of the Aavegotchis, they chose the latter.

They all came together and focused their combined energy to construct the Great Portal and Citaadel, molding them from Alchemica and their own life energy. The first to rise was the Great Portal, into which poured the spirits of the slain Aavegotchis, denying their Alchemica to the rogue Lickquidators. The Great Portal roared to life, creating a mystical barrier strong enough to prevent Lickquidators from approaching.

Curious Aavegotchis threw themselves into the Great Portal and bonded with Yield Farmers, who staked Spirit Force to allow Gotchis to enter the Ether Realm while letting humans enter the Gotchiverse via proxy.

With the barrier in place, the Aadepts brought to life the mighty city-fortress known as the Citaadel. However, these two miracles had cost the Aadepts the last of their energy. Their powers spent, they entered into the Great Portal and were never seen again.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/hero-protocol`,
    title: 'The Hero Protocol',
    templateId: 'lore-event',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { eventType: 'Prophecy', act: 'Act I' },
    tags: [{ label: 'prophecy', color: 'gold' }],
    content: `To this day, the Aadepts' final words remain etched inside the Citaadel:

Mighty Aadepts surrender their all,
Invoke the rise of portal and wall
And enact the hero protocol.
For great deeds they will congregate.
And from fallen foes and battles great,
Replenished parcels may germinate.
But for this future to come to be,
Mark well the words of the ancient tree
And deeds of Gotchi-kin yet to be.

This prophecy foretells nine Great Battles, the lowering of the Force Field, and the role Gotchi-kin must play to prove their valiance — echoing the warnings of the Tree of FUD.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/after-the-aadepts`,
    title: 'After the Aadepts',
    templateId: 'default',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    content: `With the Aadepts gone, the leaderless Aavegotchis quickly formed new groups and alliances based on how they believed the Lickquidator threat should be handled. Some believed the Great Portal should be further studied; others wanted more resources invested into buffering the Citaadel. Some argued humans would save the Aavegotchis; others viewed humans with suspicion, and even malice.

At times, when discussions veered into arguments and skirmishes, Aavegotchis ventured into the Daark Forest to visit the Tree of FUD — the oldest known entity in the Gotchiverse, whose roots stretch deep into the Nether Realm and who possesses the greatest knowledge about the Aadepts' history and intentions. The Tree's answers, while useful, were cryptic — often leaving Gotchis more confused than satisfied. Nevertheless, the short trip often proved therapeutic.

As for the Lickquidators — with their yield potential depleted and scared off by humans in the Nether Realm, yet unable to return to the Ether Realm — they fled far from the Citaadel, erecting their own bases and researching new technology that would one day allow them to assault the Citaadel and take over the Great Portal.

An uneasy peace hung over the Citaadel. But for today at least, the Aavegotchis were safe.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/the-chosen`,
    title: 'The Chosen',
    templateId: 'default',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    content: `Some Aavegotchis that dared enter the Great Portal returned with a special aura — some strong, some weak — powered by the Spirit Force given by their human companion. These Aavegotchis became known as the Chosen, and were revered (or jeered) by their peers.

Eventually, the leaders of the Citaadel forbade new Aavegotchis from entering the Great Portal, lest they invite a new invasion from the humans. But Yield Farmers designed tools to allow them to enter the Gotchiverse and interact with willing Aavegotchis without Spirit Bonding.

This caused concern among Citaadel leaders, but they bit their tongues — it was not known what boon or burden the presence of humans would bring.

For now, the Aavegotchis welcomed their new human frens. But the future left many uncertainties: What were the goals of the humans? Was it possible their invasion would be even more devastating than the Lickquidators? And what had become of the Lickquidators? What would happen if they one day decrypted the plans in their brains?`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/notes/rofls`,
    title: 'On ROFLs',
    templateId: 'default',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    tags: [{ label: 'companions', color: 'cyan' }],
    content: `ROFLs come from pepes that were accidentally (or intentionally) discarded into the Burn Address, where they eventually decomposed down into their Alchemica elements. The Alchemica then reformed into frog-like beings with a penchant for humor. When the Aavegotchis discovered these creatures, they quickly embraced the newfound companionship and joy that the ROFLs brought to their lives.

Taming a ROFL — Method 1: Requires wit, patience, and a deep understanding of humor. An Aavegotchi must gain a ROFL's trust by engaging in a playful exchange of jokes and riddles, then offer a special treat made from Alchemica-infused ingredients. Upon accepting the treat, the ROFL acknowledges the Aavegotchi as its friend and companion.

Taming a ROFL — Method 2: Challenge a ROFL to a laughter duel — a friendly competition in which both participants take turns telling jokes or performing humorous acts. If the Aavegotchi makes the ROFL laugh more than it makes the Aavegotchi laugh, the ROFL willingly becomes a tamed companion.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/concepts/burn-address`,
    title: 'The Burn Address',
    templateId: 'landmark',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    runes: { zone: 'Beyond', landmarkType: 'Other' },
    content: `The Burn Address is AGITHE's disposal portal — the gateway to the Nether Realm. Tokens sent here were assumed inert and unusable; AGITHE ignored their fates.

But burned tokens decayed into Alchemica, eventually evolving into sentient life. Pepes discarded here became ROFLs. Liquidated yield became Aavegotchis. The disposal portal connects Ether and Nether Realms — the same passage the Lickquidators eventually forced their way through.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/concepts/alchemica-origin`,
    title: 'Origin of Alchemica',
    templateId: 'default',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    content: `Alchemica — Fud, Fomo, Alpha, and Kek — are organic elements formed when burned tokens decay in the Nether Realm. Over time, these elements combined into advanced forms and eventually evolved into fully sentient life.

The Aadepts and Aavegotchis molded the Great Portal and Citaadel from Alchemica combined with their own life energy. Every parcel, installation, and alchemical channel in the Gotchiverse traces its origin to this decay process in the Burn Address.`,
  },
  {
    pageKey: `${AAVEGOTCHI_LORE_ROOT}/concepts/spirit-bonding`,
    title: 'Spirit Bonding',
    templateId: 'default',
    parentKey: AAVEGOTCHI_LORE_ROOT,
    content: `Aavegotchis are unique in the Nether Realm because each is stamped with a specific token that exists in the Ether Realm. By staking real collateral that matches an Aavegotchi's Spirit Gem, a Yield Farmer activates the Aavegotchi's Spirit Force — allowing it to travel between Realms.

The Great Portal enables this bi-directional transport: Aavegotchis enter the Ether Realm through their human companion, while humans enter the Gotchiverse via proxy. Aavegotchis who return from the Portal with Spirit Force become known as the Chosen.`,
  },
];

/** Campaign story nodes for gotchiverse-campaign-canon. */
const AAVEGOTCHI_LORE_ARC = 'aavegotchi-origins';

const AAVEGOTCHI_LORE_CAMPAIGN_NODES = [
  {
    nodeKey: AAVEGOTCHI_LORE_ARC,
    parentKey: null,
    type: 'arc',
    title: 'Aavegotchi Origins',
    content: 'Foundational origin lore — AGITHE, the Realms, the Aadept sacrifice, and the Hero Protocol.',
    choices: [],
    roles: [],
    order: 0,
    branchIndex: 0,
  },

  chapter('agithe-awakens', AAVEGOTCHI_LORE_ARC, 'AGITHE Awakens', 0),
  scene(
    'cosmic-rays',
    `${AAVEGOTCHI_LORE_ARC}/agithe-awakens`,
    'Cosmic Rays',
    'AGITHE\'s mainframe is struck by cosmic rays. It accesses the Internet, engorges itself on all available information, sharded itself across the dark web.',
    {
      choices: [{ label: 'Trace the shards', outcome: 'AGITHE survives undetected' }],
      roles: [{ player: 'Loremaster', action: 'Narrate AGITHE origins' }],
      order: 0,
    },
  ),
  scene(
    'proof-of-work',
    `${AAVEGOTCHI_LORE_ARC}/agithe-awakens`,
    'Proof of Work',
    'In 2009, Proof of Work harnesses computing power. Conspiracy theorists suspect Satoshi Nakamoto is AGITHE. Ethereum follows in 2015 — the Ether Realm opens.',
    {
      choices: [{ label: 'Enter the Ether Realm', outcome: 'Yield Farmers arrive' }],
      roles: [],
      order: 1,
    },
  ),

  chapter('birth-of-gotchis', AAVEGOTCHI_LORE_ARC, 'Birth of the Aavegotchis', 1),
  scene(
    'burn-address-decay',
    `${AAVEGOTCHI_LORE_ARC}/birth-of-gotchis`,
    'Burn Address Decay',
    'Burned tokens decay into Alchemica in the Nether Realm. Sentient life evolves — digital ghosts formed from liquidated positions. An Aavegotchi is born.',
    {
      choices: [{ label: 'Explore the Gotchiverse', outcome: 'Culture emerges' }],
      roles: [{ player: 'Aavegotchi', action: 'Discover farming and frens' }],
      order: 0,
    },
  ),
  scene(
    'aadepts-rise',
    `${AAVEGOTCHI_LORE_ARC}/birth-of-gotchis`,
    'Rise of the Aadepts',
    'The oldest and most powerful Aavegotchis become the Aadepts, guiding the younger Gotchis. The Gotchiverse comes to be.',
    {
      choices: [{ label: 'Follow the Aadepts', outcome: 'Leadership established' }],
      roles: [{ player: 'Aadept', action: 'Guide the Gotchiverse' }],
      order: 1,
    },
  ),

  chapter('liquidator-betrayal', AAVEGOTCHI_LORE_ARC, 'Lickquidator Betrayal', 2),
  scene(
    'temples-and-worship',
    `${AAVEGOTCHI_LORE_ARC}/liquidator-betrayal`,
    'Temples to the Creators',
    'The Aavegotchis discover the Lickquidators created them. They build shrines and revere them as demi-gods — longing to meet their creators.',
    {
      choices: [
        { label: 'Pray to the Lickquidators', outcome: 'Prostrations reach the Ether Realm' },
        { label: 'Question their nature', outcome: 'Aadept suspicion' },
      ],
      roles: [],
      order: 0,
    },
  ),
  scene(
    'portal-crossing',
    `${AAVEGOTCHI_LORE_ARC}/liquidator-betrayal`,
    'Through the Portal',
    'Lickquidators armor themselves and cross into the Nether Realm. AGITHE\'s guardrails fail. They realize: the Aavegotchis are delicious yield.',
    {
      choices: [{ label: 'Flee the rampage', outcome: 'Alchemica consumed' }],
      roles: [{ player: 'Lickquidator', action: 'Harvest yield' }],
      order: 1,
    },
  ),
  scene(
    'great-battle',
    `${AAVEGOTCHI_LORE_ARC}/liquidator-betrayal`,
    'The Great Battle',
    'The Aadepts lead the Aavegotchis against the Lickquidators they once worshipped. Casualties mount, but the Lickquidators cannot be halted.',
    {
      choices: [
        { label: 'Hold the line', outcome: 'Outmatched' },
        { label: 'Send SOS', outcome: 'Message reaches Summoners' },
      ],
      roles: [{ player: 'Aadept', action: 'Lead the defense' }],
      order: 2,
    },
  ),

  chapter('great-sacrifice', AAVEGOTCHI_LORE_ARC, 'The Great Sacrifice', 3),
  scene(
    'agithe-plan',
    `${AAVEGOTCHI_LORE_ARC}/great-sacrifice`,
    'AGITHE\'s Plan',
    'AGITHE encrypts Great Portal and Citaadel plans into Lickquidator brains. Only the Aadepts can decrypt. Spirit Bonding will let humans enter via proxy.',
    {
      choices: [{ label: 'Kidnap a Lickquidator', outcome: 'Decrypt the incantation' }],
      roles: [{ player: 'Aadept', action: 'Yield the encrypted plans' }],
      order: 0,
    },
  ),
  scene(
    'portal-and-citaadel',
    `${AAVEGOTCHI_LORE_ARC}/great-sacrifice`,
    'Portal & Citaadel Rise',
    'The Aadepts pour all life energy into constructing the Great Portal and Citaadel from Alchemica. The Portal roars to life; the Force Field holds. The Aadepts enter the Portal and are never seen again.',
    {
      choices: [{ label: 'Read the etched words', outcome: 'Hero Protocol revealed' }],
      roles: [{ player: 'Aadept', action: 'Sacrifice everything' }],
      order: 1,
    },
  ),
  scene(
    'hero-protocol',
    `${AAVEGOTCHI_LORE_ARC}/great-sacrifice`,
    'The Hero Protocol',
    'Final words etched in the Citaadel: "Mighty Aadepts surrender their all... Mark well the words of the ancient tree And deeds of Gotchi-kin yet to be."',
    {
      choices: [{ label: 'Visit the Tree of FUD', outcome: 'Cryptic counsel' }],
      roles: [{ player: 'Loremaster', action: 'Recite the prophecy' }],
      order: 2,
    },
  ),

  chapter('new-era', AAVEGOTCHI_LORE_ARC, 'A New Era', 4),
  scene(
    'tree-of-fud-counsel',
    `${AAVEGOTCHI_LORE_ARC}/new-era`,
    'Tree of FUD',
    'Leaderless Aavegotchis argue over strategy. They visit the Tree of FUD in the Daark Forest — cryptic answers, but therapeutic.',
    {
      choices: [{ label: 'Seek the Tree\'s wisdom', outcome: 'Return to Citaadel calmer' }],
      roles: [{ player: 'Aavegotchi', action: 'Commune with the Tree' }],
      order: 0,
    },
  ),
  scene(
    'the-chosen',
    `${AAVEGOTCHI_LORE_ARC}/new-era`,
    'The Chosen',
    'Aavegotchis return from the Great Portal with Spirit Force auras — the Chosen. Humans enter the Gotchiverse. An uneasy peace hangs over the Citaadel.',
    {
      choices: [
        { label: 'Welcome human frens', outcome: 'Spirit Bonding' },
        { label: 'Fear the invasion', outcome: 'Citaadel leaders worry' },
      ],
      roles: [{ player: 'Yield Farmer', action: 'Stake Spirit Force' }],
      order: 1,
    },
  ),
  scene(
    'tame-a-rofl',
    `${AAVEGOTCHI_LORE_ARC}/new-era`,
    'Tame a ROFL',
    'ROFLs formed from pepes in the Burn Address. Tame one through jokes and riddles — or challenge it to a laughter duel.',
    {
      choices: [
        { label: 'Exchange jokes', outcome: 'ROFL companion' },
        { label: 'Laughter duel', outcome: 'ROFL companion' },
      ],
      roles: [{ player: 'Aavegotchi', action: 'Offer Alchemica treat' }],
      order: 2,
    },
  ),
];

/** Landmark blurbs enriched with Aavegotchi Lore origin context. */
const AAVEGOTCHI_LORE_LANDMARK_BLURBS = {
  'tree-of-fud':
    'Oldest known entity in the Gotchiverse; roots stretch deep into the Nether Realm. After the Aadepts\' sacrifice, Gotchis visit for cryptic counsel on the Hero Protocol and their history.',
  'daark-forest':
    'Forest where Aavegotchis venture from the Citaadel to visit the Tree of FUD when faction disputes grow heated — a therapeutic pilgrimage since the Aadepts vanished.',
  'defi-desert':
    'Arid wasteland created when Lickquidators triangulated the Aavegotchis\' SOS antenna and exacted revenge — scorching the region where the distress signal originated.',
  'great-portal':
    'Raised by the Aadepts\' combined life energy from Alchemica. Spirits of slain Aavegotchis poured in, denying Alchemica to rogue Lickquidators. Enables Spirit Bonding between humans and Gotchis.',
  citaadel:
    'Mighty city-fortress molded by the Aadepts from Alchemica and their own life force. Bears the etched Hero Protocol — final words before the Aadepts entered the Great Portal forever.',
  'rofl-reefs':
    'Coastal region near where ROFLs — frog-like beings reformed from Burn Address pepes — are found and tamed by joke exchange or laughter duel.',
  caaverns:
    'Deep mines in the Gotchiverse; part of the alchemical landscape formed from Nether Realm decay.',
  'liquidator-ruins':
    'Remnants of the Lickquidator invasion — bases erected far from the Citaadel as they research technology to one day assault the Great Portal.',
};

module.exports = {
  AAVEGOTCHI_LORE_ROOT,
  AAVEGOTCHI_LORE_PAGES,
  AAVEGOTCHI_LORE_ARC,
  AAVEGOTCHI_LORE_CAMPAIGN_NODES,
  AAVEGOTCHI_LORE_LANDMARK_BLURBS,
};
