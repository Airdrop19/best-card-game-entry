// The Keeper's AI: readable, counterable choices.
// - Low on light: mends first. - Player warded: prefers strikes that beat the ward's element.
// - Otherwise plays the biggest affordable strike, else wards, else kindles.
import { BEATS } from './config.js';

export function keeperChoose(state) {
  const me = state.keeper;
  const affordable = me.hand.filter((c) => c.cost <= me.energy);
  if (!affordable.length) return null;

  const byKind = (k) => affordable.filter((c) => c.kind === k).sort((a, b) => b.power - a.power);

  if (me.hp <= 7) {
    const mend = byKind('mend')[0];
    if (mend) return mend;
  }
  const strikes = byKind('strike');
  if (strikes.length) {
    const playerWardEl = state.player.lastWardElement;
    const counter = playerWardEl && strikes.find((c) => BEATS[c.element] === playerWardEl);
    return counter || strikes[0];
  }
  return byKind('ward')[0] || byKind('mend')[0] || byKind('draw')[0] || affordable[0];
}

// A simple autopilot for the human side, used by the screenshot scenes.
export function heroChoose(state) {
  const me = state.player;
  const affordable = me.hand.filter((c) => c.cost <= me.energy);
  if (!affordable.length) return null;
  if (me.hp <= 6) {
    const mend = affordable.find((c) => c.kind === 'mend');
    if (mend) return mend;
  }
  return affordable.sort((a, b) => b.power - a.power)[0];
}
