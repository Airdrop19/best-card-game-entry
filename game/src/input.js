// Keyboard and mouse: click a card to play it, Enter ends the turn / starts the game.
import { handLayout } from './render.js';

export function attachInput(canvas, handlers) {
  let hover = null;
  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * canvas.width, y: ((e.clientY - r.top) / r.height) * canvas.height };
  };
  canvas.addEventListener('mousemove', (e) => {
    const { x, y } = pos(e);
    const hit = handlers.layout().find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
    hover = hit ? hit.card.id : null;
    handlers.onHover(hover);
  });
  canvas.addEventListener('click', (e) => {
    const { x, y } = pos(e);
    const hit = handlers.layout().find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
    handlers.onClick(hit ? hit.card : null);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handlers.onEnter();
    const n = Number(e.key);
    if (n >= 1 && n <= 9) {
      const box = handlers.layout()[n - 1];
      if (box) handlers.onClick(box.card);
    }
  });
  return { getHover: () => hover };
}

export { handLayout };
