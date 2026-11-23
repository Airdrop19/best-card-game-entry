// Lantern Duel entry point: game loop, turn flow, Keeper turns with a beat of delay.
import { VIEW } from './config.js';
import { newGame, startTurn, playCard, SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, SCREEN_LOSE } from './world.js';
import { render, handLayout } from './render.js';
import { attachInput } from './input.js';
import { keeperChoose } from './ai.js';
import { mulberry32 } from './random.js';
import { shotScene } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || 1);

let state;
let hover = null;
let keeperTimer = 0;

function announce() {
  status.textContent = `Lantern Duel. You: ${state.player.hp} light. The Keeper: ${state.keeper.hp} light.`;
}

function freshGame() {
  state = newGame(mulberry32((Math.random() * 1e9) | 0));
  state.screen = SCREEN_TITLE;
  announce();
}

function begin() {
  state.screen = SCREEN_PLAY;
  startTurn(state, 'player');
  announce();
}

function endPlayerTurn() {
  if (state.screen !== SCREEN_PLAY || state.active !== 'player') return;
  startTurn(state, 'keeper');
  keeperTimer = 0.9;
  announce();
}

function keeperStep(dt) {
  if (state.active !== 'keeper' || state.screen !== SCREEN_PLAY) return;
  keeperTimer -= dt;
  if (keeperTimer > 0) return;
  const card = keeperChoose(state);
  if (card) { playCard(state, 'keeper', card); keeperTimer = 0.8; announce(); }
  else { startTurn(state, 'player'); announce(); }
}

if (shot) {
  state = shotScene(shot, seed);
  render(ctx, state, null);
} else {
  freshGame();
  attachInput(canvas, {
    layout: () => (state.screen === SCREEN_PLAY && state.active === 'player' ? handLayout(state) : []),
    onHover: (id) => { hover = id; },
    onClick: (card) => {
      if (state.screen === SCREEN_TITLE) return begin();
      if (state.screen === SCREEN_WIN || state.screen === SCREEN_LOSE) return freshGame();
      if (card && state.active === 'player') { playCard(state, 'player', card); announce(); }
    },
    onEnter: () => {
      if (state.screen === SCREEN_TITLE) return begin();
      if (state.screen === SCREEN_WIN || state.screen === SCREEN_LOSE) return freshGame();
      endPlayerTurn();
    },
  });

  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.anim.forEach((a) => { a.t = Math.min(1, a.t + dt * 2.2); });
    state.floaters.forEach((f) => { f.t += dt; });
    state.floaters = state.floaters.filter((f) => f.t < 1.4);
    keeperStep(dt);
    render(ctx, state, hover);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
