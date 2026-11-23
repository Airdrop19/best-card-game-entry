// Canvas rendering: lantern-lit table, readable cards, life totals, title/win/lose screens.
import { VIEW, START_HP } from './config.js';
import { SCREEN_TITLE, SCREEN_WIN, SCREEN_LOSE } from './world.js';

export const CARD = { w: 150, h: 210 };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function shape(ctx, kind, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (kind === 'triangle') { ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s); ctx.lineTo(x - s, y + s); }
  else if (kind === 'circle') { ctx.arc(x, y, s, 0, Math.PI * 2); }
  else if (kind === 'diamond') { ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); }
  else { // star
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? s * 0.45 : s;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
  }
  ctx.closePath(); ctx.fill();
}

export function drawCard(ctx, card, x, y, opts = {}) {
  const { w, h } = CARD;
  const lift = opts.lift || 0;
  y -= lift;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
  rr(ctx, x, y, w, h, 12);
  ctx.fillStyle = opts.faceDown ? '#2b2340' : '#f7f1e3';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = opts.selected ? 4 : 2;
  ctx.strokeStyle = opts.selected ? '#ffd166' : card.dark;
  ctx.stroke();
  if (opts.faceDown) {
    shape(ctx, 'star', x + w / 2, y + h / 2, 26, '#e8b93b');
    ctx.restore(); return;
  }
  // Element band
  rr(ctx, x, y, w, 44, 12); ctx.fillStyle = card.color; ctx.fill();
  ctx.fillRect(x, y + 32, w, 12);
  shape(ctx, card.shape, x + 22, y + 22, 11, '#fff');
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'left';
  ctx.fillText(card.kindLabel, x + 40, y + 27);
  // Cost orb
  ctx.beginPath(); ctx.arc(x + w - 20, y + 22, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#1d1a2e'; ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(String(card.cost), x + w - 20, y + 27);
  // Name + big art shape + text
  ctx.fillStyle = '#241f31'; ctx.font = 'bold 17px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(card.name, x + w / 2, y + 72);
  shape(ctx, card.shape, x + w / 2, y + 112, 30, card.color);
  ctx.font = '14px Georgia, serif'; ctx.fillStyle = '#4a4358';
  ctx.fillText(card.text, x + w / 2, y + 158);
  ctx.font = 'bold 20px Georgia, serif'; ctx.fillStyle = card.dark;
  ctx.fillText(String(card.power), x + w / 2, y + 188);
  if (opts.dim) { rr(ctx, x, y, w, h, 12); ctx.fillStyle = 'rgba(20,16,32,.45)'; ctx.fill(); }
  ctx.restore();
}

function lantern(ctx, x, y, hp, label, shield) {
  const glow = Math.max(0, hp) / START_HP;
  const g = ctx.createRadialGradient(x, y, 4, x, y, 90);
  g.addColorStop(0, `rgba(255,190,80,${0.55 * glow + 0.05})`);
  g.addColorStop(1, 'rgba(255,190,80,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 90, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9a35c'; ctx.lineWidth = 3;
  rr(ctx, x - 22, y - 34, 44, 62, 8); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y - 2, 9, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = hp > 0 ? '#ffb84d' : '#555'; ctx.fill();
  ctx.fillStyle = '#f7f1e3'; ctx.font = 'bold 17px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 52);
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`${Math.max(0, hp)} ♥`, x, y + 82);
  if (shield > 0) { ctx.font = 'bold 15px Georgia, serif'; ctx.fillStyle = '#9fd0ff'; ctx.fillText(`🛡 ${shield}`, x, y + 104); }
}

function energyPips(ctx, x, y, energy, max) {
  for (let i = 0; i < max; i++) {
    ctx.beginPath(); ctx.arc(x + i * 26, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < energy ? '#ffd166' : 'rgba(247,241,227,.18)';
    ctx.fill();
  }
}

export function render(ctx, state, hover) {
  const { width: W, height: H } = VIEW;
  // Table
  const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 760);
  bg.addColorStop(0, '#3a2c50'); bg.addColorStop(1, '#17122a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(201,163,92,.35)'; ctx.lineWidth = 2;
  rr(ctx, 60, 60, W - 120, H - 120, 28); ctx.stroke();

  if (state.screen === SCREEN_TITLE) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd166'; ctx.font = 'bold 84px Georgia, serif';
    ctx.fillText('LANTERN DUEL', W / 2, 250);
    ctx.fillStyle = '#f7f1e3'; ctx.font = '26px Georgia, serif';
    ctx.fillText('A card duel of light and ember', W / 2, 300);
    lantern(ctx, W / 2 - 160, 430, START_HP, 'You', 0);
    lantern(ctx, W / 2 + 160, 430, START_HP, 'The Keeper', 0);
    ctx.font = '21px Georgia, serif'; ctx.fillStyle = '#cfc6e8';
    ctx.fillText('Click a card to play it · Enter ends your turn · Snuff the Keeper’s lantern', W / 2, 580);
    ctx.font = 'bold 30px Georgia, serif'; ctx.fillStyle = '#ffd166';
    ctx.fillText('Click or press Enter to begin', W / 2, 650);
    return;
  }

  // Opponent hand (face down) + lanterns
  const k = state.keeper, p = state.player;
  k.hand.forEach((c, i) => drawCard(ctx, c, W / 2 - (k.hand.length * 92) / 2 + i * 92, 84, { faceDown: true }));
  lantern(ctx, 150, 190, k.hp, 'The Keeper', k.shield);
  lantern(ctx, 150, 560, p.hp, 'You', p.shield);
  energyPips(ctx, 96, 700, p.energy, 6);
  ctx.fillStyle = '#f7f1e3'; ctx.font = '15px Georgia, serif'; ctx.textAlign = 'left';
  ctx.fillText('ember', 96, 726);

  // Played cards in the middle
  state.played.forEach((entry, i) => {
    const anim = state.anim.find((a) => a.card.id === entry.card.id);
    const t = anim ? Math.min(1, anim.t) : 1;
    const targetY = entry.by === 'player' ? 470 : 330;
    const startY = entry.by === 'player' ? 620 : 84;
    const y = startY + (targetY - startY) * t;
    drawCard(ctx, entry.card, W / 2 - 75 + (i - (state.played.length - 1) / 2) * 170, y, {});
  });

  // Log
  ctx.fillStyle = 'rgba(247,241,227,.85)'; ctx.font = '16px Georgia, serif'; ctx.textAlign = 'left';
  state.log.slice(-4).forEach((line, i) => ctx.fillText(line, W - 470, 360 + i * 24));

  // Turn banner
  ctx.textAlign = 'center'; ctx.font = 'bold 24px Georgia, serif';
  ctx.fillStyle = state.active === 'player' ? '#ffd166' : '#9fd0ff';
  ctx.fillText(state.active === 'player' ? `Turn ${state.turn} — your move` : 'The Keeper is thinking…', W / 2, 330);

  // Player hand
  p.hand.forEach((c, i) => {
    const x = W / 2 - (p.hand.length * 160) / 2 + i * 160;
    drawCard(ctx, c, x, 560, { lift: hover === c.id ? 18 : 0, dim: c.cost > p.energy, selected: hover === c.id });
  });

  if (state.screen === SCREEN_WIN || state.screen === SCREEN_LOSE) {
    ctx.fillStyle = 'rgba(10,8,20,.72)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillStyle = state.screen === SCREEN_WIN ? '#ffd166' : '#8d86a8';
    ctx.fillText(state.screen === SCREEN_WIN ? 'YOUR LANTERN BURNS BRIGHT' : 'YOUR LANTERN IS SNUFFED', W / 2, 340);
    ctx.font = '26px Georgia, serif'; ctx.fillStyle = '#f7f1e3';
    ctx.fillText(state.screen === SCREEN_WIN ? 'The Keeper bows. The table is yours.' : 'The Keeper keeps the table… this time.', W / 2, 400);
    ctx.font = 'bold 26px Georgia, serif'; ctx.fillStyle = '#ffd166';
    ctx.fillText('Click or press Enter to play again', W / 2, 480);
  }
}

// Hit-testing for the player's hand, shared with input.js.
export function handLayout(state) {
  const { width: W } = VIEW;
  return state.player.hand.map((c, i) => ({
    card: c,
    x: W / 2 - (state.player.hand.length * 160) / 2 + i * 160,
    y: 560, w: CARD.w, h: CARD.h,
  }));
}
