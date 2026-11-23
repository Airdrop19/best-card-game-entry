// Card definitions and deck building. Every card: cost (ember), kind, power, element.
import { ELEMENTS } from './config.js';

const KINDS = [
  { kind: 'strike', label: 'Strike', text: (p) => `Deal ${p} damage` },
  { kind: 'mend',   label: 'Mend',   text: (p) => `Restore ${p} light` },
  { kind: 'ward',   label: 'Ward',   text: (p) => `Gain ${p} shield` },
  { kind: 'draw',   label: 'Kindle', text: (p) => `Draw ${p} cards` },
];

const NAMES = {
  flame: ['Ember Jab', 'Cinder Arc', 'Lantern Flare', 'Ashen Rush'],
  tide:  ['Mist Cut', 'Undertow', 'Moonlit Surge', 'Deep Current'],
  leaf:  ['Thorn Flick', 'Vine Lash', 'Canopy Guard', 'Root Snare'],
  spark: ['Static Snap', 'Volt Dart', 'Storm Sigil', 'Bright Coil'],
};

let nextId = 1;

export function makeCard(element, kindIndex, tier) {
  const kind = KINDS[kindIndex];
  const cost = tier + 1;
  const power = kind.kind === 'draw' ? 1 + (tier > 1 ? 1 : 0) : 2 + tier * 2;
  return {
    id: nextId++,
    element,
    kind: kind.kind,
    kindLabel: kind.label,
    name: NAMES[element][tier],
    cost,
    power,
    text: kind.text(power),
    color: ELEMENTS[element].color,
    dark: ELEMENTS[element].dark,
    shape: ELEMENTS[element].shape,
  };
}

export function buildDeck(rng) {
  const deck = [];
  for (const element of Object.keys(ELEMENTS)) {
    for (let tier = 0; tier < 4; tier++) {
      deck.push(makeCard(element, tier % KINDS.length, tier));
      deck.push(makeCard(element, (tier + 1) % KINDS.length, tier));
    }
  }
  // Fisher–Yates with the seeded rng so ?shot scenes are reproducible.
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
