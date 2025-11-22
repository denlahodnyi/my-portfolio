const bg = document.getElementById('header');
const canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '100%';
bg?.appendChild(canvas);
const width = canvas.clientWidth || window.innerWidth;
const height = canvas.clientHeight || window.innerHeight;
const shapeAttr = bg?.getAttribute('data-shape') ?? 'square';
const pixelSizeAttr = bg?.getAttribute('data-pixel-size') ?? '4';
const inkAttr = bg?.getAttribute('data-ink') ?? 'rgba(228, 0, 160, 1)';

const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker(new URL('canvas-worker.js', import.meta.url), {
  type: 'module',
});
worker.postMessage(
  {
    type: 'init',
    canvas: offscreen,
    width,
    height,
    shapeAttr,
    pixelSizeAttr,
    inkAttr,
  },
  [offscreen]
);

const resize = () => {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;

  worker.postMessage({ type: 'resize', width, height });
};
window.addEventListener('resize', resize);
resize();

canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const fx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const fy =
    (rect.height - (e.clientY - rect.top)) * (canvas.height / rect.height);

  worker.postMessage({ type: 'pointerdown', fx, fy });
});
