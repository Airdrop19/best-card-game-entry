// Game state and rules: turns, energy, damage with shields and the element wheel.
import { START_HP, HAND_SIZE, MAX_ENERGY, BEATS } from './config.js';
import { buildDeck } from './deck.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSE = 'lose';

function side(name) {
  return { name, hp: START_HP, shield: 0, energy: 0, hand: [], deck: [], discard: [], lastWardElement: null };
}

export function newGame(rng) {
  const state = {
    screen: SCREEN_TITLE,
    turn: 0,
    active: 'player',
    player: side('You'),
    keeper: side('The Keeper'),
    log: ['Two lanterns. One table. Keep yours lit.'],
    played: [], // cards shown face-up in the middle this turn
    anim: [],   // {card, from, t} simple slide/flip animations
    winner: null,
  };
  state.player.deck = buildDeck(rng);
  state.keeper.deck = buildDeck(rng);
  draw(state.player, HAND_SIZE);
  draw(state.keeper, HAND_SIZE);
  return state;
}

export function draw(s, n) {
  for (let i = 0; i < n; i++) {
    if (!s.deck.length) { s.deck = s.discard; s.discard = []; }
    if (s.deck.length) s.hand.push(s.deck.pop());
  }
}

export function startTurn(state, who) {
  state.active = who;
  const s = state[who];
  state.turn += who === 'player' ? 1 : 0;
  s.energy = Math.min(MAX_ENERGY, 2 + state.turn);
  draw(s, 1);
  state.played = [];
}

export function playCard(state, who, card) {
  const me = state[who];
  const foe = state[who === 'player' ? 'keeper' : 'player'];
  if (card.cost > me.energy) return false;
  me.energy -= card.cost;
  me.hand = me.hand.filter((c) => c.id !== card.id);
  me.discard.push(card);
  state.played.push({ card, by: who });
  state.anim.push({ card, by: who, t: 0 });

  if (card.kind === 'strike') {
    let dmg = card.power;
    if (foe.lastWardElement && BEATS[card.element] === foe.lastWardElement) dmg += 2;
    const blocked = Math.min(foe.shield, dmg);
    foe.shield -= blocked;
    foe.hp -= dmg - blocked;
    state.log.push(`${me.name} plays ${card.name}: ${dmg} damage${blocked ? ` (${blocked} warded)` : ''}.`);
  } else if (card.kind === 'mend') {
    me.hp = Math.min(START_HP, me.hp + card.power);
    state.log.push(`${me.name} plays ${card.name}: +${card.power} light.`);
  } else if (card.kind === 'ward') {
    me.shield += card.power;
    me.lastWardElement = card.element;
    state.log.push(`${me.name} plays ${card.name}: +${card.power} shield.`);
  } else if (card.kind === 'draw') {
    draw(me, card.power);
    state.log.push(`${me.name} plays ${card.name}: draws ${card.power}.`);
  }

  if (foe.hp <= 0) { state.winner = who; state.screen = who === 'player' ? SCREEN_WIN : SCREEN_LOSE; }
  if (me.hp <= 0) { state.winner = who === 'player' ? 'keeper' : 'player'; state.screen = state.winner === 'player' ? SCREEN_WIN : SCREEN_LOSE; }
  return true;
}
