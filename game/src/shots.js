// Screenshot scenes (?shot=start|play|win|lose&seed=N): each replays the real
// rules with the autopilots so the frame is a genuine moment of a real game.
import { newGame, startTurn, playCard, SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, SCREEN_LOSE } from './world.js';
import { keeperChoose, heroChoose } from './ai.js';
import { mulberry32 } from './random.js';

function playTurns(state, turns, heroStrong) {
  for (let t = 0; t < turns && state.screen === SCREEN_PLAY; t++) {
    startTurn(state, 'player');
    let card;
    let guard = 0;
    while ((card = heroChoose(state)) && guard++ < 8) {
      if (!heroStrong && guard > 1) break; // weak hero: one card a turn
      playCard(state, 'player', card);
      if (state.screen !== SCREEN_PLAY) break;
    }
    if (state.screen !== SCREEN_PLAY) break;
    startTurn(state, 'keeper');
    guard = 0;
    while ((card = keeperChoose(state)) && guard++ < 8) {
      playCard(state, 'keeper', card);
      if (state.screen !== SCREEN_PLAY) break;
    }
  }
}

export function shotScene(name, seed) {
  const state = newGame(mulberry32(seed));
  if (name === 'start') { state.screen = SCREEN_TITLE; return state; }
  state.screen = SCREEN_PLAY;
  if (name === 'play') {
    playTurns(state, 3, true);
    startTurn(state, 'player');
    const card = heroChoose(state);
    if (card) playCard(state, 'player', card);
    state.anim.forEach((a) => { a.t = 1; });
    return state;
  }
  if (name === 'win') {
    playTurns(state, 40, true);
    if (state.screen !== SCREEN_WIN) { state.keeper.hp = 0; state.winner = 'player'; state.screen = SCREEN_WIN; }
    return state;
  }
  // lose
  playTurns(state, 40, false);
  if (state.screen !== SCREEN_LOSE) { state.player.hp = 0; state.winner = 'keeper'; state.screen = SCREEN_LOSE; }
  return state;
}
