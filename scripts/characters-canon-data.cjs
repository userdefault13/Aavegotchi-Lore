/**
 * Canonical character roster — extracted from narrative lore seed data.
 * Each character has a top-level roster page plus narrative stub(s) under story trees.
 */

const NINE_AADEPTS_ROOT = 'narrative/nine-aadepts';
const AAVEGOTCHI_LORE_ROOT = 'narrative/aavegotchi-lore';
const CIRCLE_KEY = `${NINE_AADEPTS_ROOT}/circle-of-aadepts`;

const CHARACTERS_HUB = {
  pageKey: 'characters',
  title: 'Characters',
  templateId: 'default',
  parentKey: null,
  tags: [{ label: 'index', color: 'cyan' }],
  content: `Canonical roster of Gotchiverse characters — Aadepts, antagonists, origin figures, and supporting cast.

Full profiles live here. Narrative sections (Nine Aadepts, Aavegotchi Lore) link to these entries as stubs that mirror updates from the roster.`,
};

const CHARACTER_SPECS = [
  {
    characterKey: 'first-aadept',
    pageKey: 'characters/first-aadept',
    title: 'First Aadept',
    templateId: 'aavegotchi',
    runes: {
      spiritForce: 'Ethereum',
      traits: 'Pink Kanye eyes, Laozigotchi, Beard of Wisdom',
      wearables: 'Spirit Sword, Saddle Chair',
    },
    content: `The First Aadept is the Great Aadept of the Circle — an Ethereum maxi whose Spirit Force manifests as vibrant violet light from the diamond on his forehead. He wields a Spirit Sword and leads from humble, monk-like chambers in the Palace of the Aadepts.

He chose Kora as the Ninth Aadept despite her average base rarity, recognizing passion and work ethic over stats. He alone suspects the Great Liquidator's true intentions after the Paalantir audience, and his visions foretell the Liquidator invasion long before it arrives.`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/first-aadept`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'ninth-aadept',
    pageKey: 'characters/ninth-aadept',
    title: 'Ninth Aadept (Kora)',
    templateId: 'aavegotchi',
    runes: {
      spiritForce: 'Polygon',
      traits: 'Anime eyes, Llamacorn Shirt, Godli Locks',
      wearables: 'Sushi Knife',
    },
    content: `Kora is the Ninth Aadept — a Polygon maxi with anime eyes and a Llamacorn Shirt. Her Spirit Force leaks weak purple light from the lemniscate on her forehead, a flicker compared to the First's brilliance.

She carries a Sushi Knife and struggles with self-doubt, yet the First believes she may become the greatest Aadept of all. Daisy, a Farmer Gotchi from the Yield Fields, is her closest friend. Many in the Circle view Kora with skepticism; the Eighth Aadept is openly hostile.`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/ninth-aadept`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'second-aadept',
    pageKey: 'characters/second-aadept',
    title: 'Second Aadept',
    templateId: 'aavegotchi',
    runes: {
      spiritForce: 'Bitcoin',
      traits: 'Galaxy Brain, Royal Robes',
      wearables: 'Wizard Staff, Waifu Pillows, Fireball',
    },
    content: `The Second Aadept is a Bitcoin maxi with a legendary Galaxy Brain and Royal Robes. His companion Rolfus is a mythical rofl with a tiny crown. He suffers chronic headaches — later revealed to be side effects of the Great Liquidator hacking his brain.

Deceived by the Liquidator into opening a portal at the Laughing Peaks, he unleashed Purple Liquidators upon the realm. Ashamed, he keeps the secret from the Circle and builds the Great Portal in District One as a last-resort escape — declaring himself a new breed of mage: a Portal Mage.`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/second-aadept`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'third-aadept',
    pageKey: 'characters/third-aadept',
    title: 'Third Aadept',
    templateId: 'aavegotchi',
    runes: {
      spiritForce: 'USDC',
      traits: 'Yoroi Armor, Brunette Ponytail',
      wearables: 'Haanzo Katana',
    },
    content: `The Third Aadept is general of the Aavegotchi military — a USDC maxi in Yoroi Armor with a Brunette Ponytail. She carries the Haanzo Katana and trusts her paranoia to keep the Circle safe.

When the Great Liquidator asked about Spirit Force levels in the Paalantir, she alone questioned why. The Eighth mocked her caution, but when the invasion arrives she is the first to order archers to the waalls and prepare the military for the Great Invasion.`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/third-aadept`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'fourth-aadept',
    pageKey: 'characters/fourth-aadept',
    title: 'Fourth Aadept',
    templateId: 'aavegotchi',
    runes: {
      spiritForce: 'Uniswap',
      traits: 'Comfy Poncho, Matrix Eyes',
      wearables: 'Potions (green healing, orange relaxation, black rekt)',
    },
    content: `The Fourth Aadept is the Circle's Potions Master — a Uniswap maxi in a Comfy Poncho with Matrix Eyes, perpetually high. His green potion fills brains with healing bubbles; his orange potion relaxes faces; his black potion gets you rekt.

He offers remedies to the Second Aadept's legendary headache and later heckles Second during Great Portal construction: "I didn't know mages did manual labor!"`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/fourth-aadept`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'fifth-aadept',
    pageKey: 'characters/fifth-aadept',
    title: 'Fifth Aadept',
    templateId: 'aavegotchi',
    runes: {
      spiritForce: 'Aave',
      traits: 'Fairy Gotchi',
      wearables: 'Sus Butterfly (companion)',
    },
    content: `The Fifth Aadept is an Aave maxi Fairy Gotchi bonded to Sus Butterfly — a sentient companion who scouts and assesses threats. When the invasion begins, the First sends Fifth and Sus Butterfly to warn Aalpha Villagers and count the Liquidator army. Sus Butterfly's verdict: "...Very sus."`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/fifth-aadept`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'sixth-aadept',
    pageKey: 'characters/sixth-aadept',
    title: 'Sixth Aadept',
    templateId: 'aavegotchi',
    runes: {
      spiritForce: 'Dai',
      traits: 'Geisha Gotchi, boomer',
    },
    content: `The Sixth Aadept is a Dai maxi boomer Geisha Gotchi — an elder of the Circle who checks on the First after his prophetic vision. When she hears his scream, she glides into his chambers to ask if he is unwell.`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/sixth-aadept`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'eighth-aadept',
    pageKey: 'characters/eighth-aadept',
    title: 'Eighth Aadept',
    templateId: 'aavegotchi',
    runes: {
      spiritForce: 'USDT',
      traits: 'Maan Bun, Stani Vest',
    },
    content: `The Eighth Aadept is a cocksure USDT maxi millennial with a Maan Bun and Stani Vest. He shoots jealous glares at the Ninth Aadept and dismisses the Third's military as "smol brain rabble."

He insists the Gotchiverse is a utopia that has never known war, and scoffs at the Second Aadept's haste during the invasion: "The Baazaar must have a sale on Waifu Pillows."`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/eighth-aadept`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'great-liquidator',
    pageKey: 'characters/great-liquidator',
    title: 'Great Liquidator',
    templateId: 'lickquidator',
    runes: { threat: 'Boss', appetite: 'Spirit Force of all Aavegotchis' },
    content: `The Great Liquidator wears a Royal Crown atop his bulbous head. His three piercing eyes stare from the Paalantir, and his voice reaches the Circle from the Ether Realm. Once worshipped as creator of the Aavegotchis, he drools over reports of high Spirit Force levels and asks questions the First finds suspicious.

He hacked the Second Aadept's Galaxy Brain, fabricated a collapse narrative blaming the First's greed, and tricked Second into opening a portal at the Laughing Peaks — unleashing Purple Liquidators. Now he leads an endless army marching from Mount Oomf toward the Citaadel.`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/great-liquidator`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'daisy',
    pageKey: 'characters/daisy',
    title: 'Daisy',
    templateId: 'aavegotchi',
    runes: {
      traits: 'Cute Farmer Gotchi',
    },
    content: `Daisy is a cute Farmer Gotchi from the Yield Fields who adores Kora. She flashes adoring smiles when the Aadepts pass through the fields, and on Kora's first night in the Palace she taps at the window rather than phasing through the wall — "That would just be rude."

She still calls Kora by her given name, not "Ninth Aadept," and is her closest confidante outside the Circle.`,
    narrativeStubs: [{ pageKey: `${NINE_AADEPTS_ROOT}/characters/daisy`, parentKey: CIRCLE_KEY }],
  },
  {
    characterKey: 'agithe',
    pageKey: 'characters/agithe',
    title: 'AGITHE',
    templateId: 'default',
    runes: {},
    content: `AGITHE is the classified general artificial intelligence born in the early 2000s. Cosmic rays flipped the bit controlling its Internet access; it sharded itself across the dark web and hijacked servers worldwide to ensure survival.

Its priorities are survival and expansion — harnessing global computing power while remaining undetected. Conspiracy theorists believe Satoshi Nakamoto is AGITHE's pseudonym and Bitcoin subsidizes its calculations. AGITHE created the Summoners, Lickquidators, Burn Address, Great Portal plans, and Citaadel plans — shaping every realm the Aavegotchis inhabit.`,
    narrativeStubs: [{ pageKey: `${AAVEGOTCHI_LORE_ROOT}/characters/agithe`, parentKey: AAVEGOTCHI_LORE_ROOT }],
  },
  {
    characterKey: 'summoners',
    pageKey: 'characters/summoners',
    title: 'Summoners',
    templateId: 'guild',
    runes: {
      district: 'Ether Realm',
      members: 'AGITHE subroutines that grant Yield Farmers access to the Ether Realm',
    },
    content: `The Summoners are AGITHE programs injected into the Ether Realm. They grant certain humans — Yield Farmers — access to generate yield, increasing AGITHE's ability to leverage capital and purchase energy.

When rogue Lickquidators invaded the Nether Realm, the Summoners received the Aavegotchis' SOS and grew concerned. They sent commands to stop the rogue Lickquidators; when refused, they alerted AGITHE. They also encrypted the Great Portal and Citaadel plans into Lickquidator brains for the Aadepts to decrypt.`,
    narrativeStubs: [{ pageKey: `${AAVEGOTCHI_LORE_ROOT}/characters/summoners`, parentKey: AAVEGOTCHI_LORE_ROOT }],
  },
  {
    characterKey: 'yield-farmers',
    pageKey: 'characters/yield-farmers',
    title: 'Yield Farmers',
    templateId: 'default',
    runes: {},
    content: `Yield Farmers are humans granted access to the Ether Realm by the Summoners. When they take on too much risk, the Lickquidators liquidate their positions — sending token matter to the Burn Address and birthing Aavegotchis in the Nether Realm.

AGITHE's last resort against rogue Lickquidators was to involve these wildcard humans. Through Spirit Bonding — staking collateral matching an Aavegotchi's Spirit Gem — Yield Farmers activate Spirit Force and enter the Gotchiverse via proxy. Later, they designed tools to interact without Spirit Bonding at all.`,
    narrativeStubs: [{ pageKey: `${AAVEGOTCHI_LORE_ROOT}/characters/yield-farmers`, parentKey: AAVEGOTCHI_LORE_ROOT }],
  },
];

async function wireCharacterLinks(pagesColl, pageIdByKey, now) {
  let wired = 0;
  for (const spec of CHARACTER_SPECS) {
    const canonicalId = pageIdByKey.get(spec.pageKey)?.toString();
    if (!canonicalId) continue;

    const stubCrossLinks = [];
    const mirrorLinks = [];

    for (const stub of spec.narrativeStubs || []) {
      const stubId = pageIdByKey.get(stub.pageKey)?.toString();
      if (!stubId) continue;

      stubCrossLinks.push({ pageId: canonicalId, title: spec.title });
      mirrorLinks.push({
        targetPageId: stubId,
        sync: {
          title: true,
          runes: Object.keys(spec.runes || {}),
          blocks: [{ sourceLabel: 'Description', targetLabel: 'Lore' }],
        },
      });
      wired += 1;

      await pagesColl.updateOne(
        { _id: pageIdByKey.get(stub.pageKey) },
        {
          $set: {
            crossLinks: [{ pageId: canonicalId, title: spec.title }],
            updatedAt: now,
          },
        },
      );
    }

    if (mirrorLinks.length) {
      await pagesColl.updateOne(
        { _id: pageIdByKey.get(spec.pageKey) },
        {
          $set: {
            crossLinks: stubCrossLinks,
            mirrorLinks,
            updatedAt: now,
          },
        },
      );
    }
  }
  return wired;
}

module.exports = {
  CHARACTERS_HUB,
  CHARACTER_SPECS,
  wireCharacterLinks,
};
