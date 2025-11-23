import {
  Clock,
  Color,
  GLSL3,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';
import vertexSrc from '/src/assets/vertex.glsl';
import fragmentSrc from '/src/assets/fragment.glsl';

// Source: https://tympanus.net/Tutorials/BayerDithering/

const bg = document.getElementById('header');
const shapeAttr = bg?.getAttribute('data-shape') ?? 'square';
const pixelSizeAttr = bg?.getAttribute('data-pixel-size') ?? '4';
const inkAttr = bg?.getAttribute('data-ink') ?? 'rgba(228, 0, 160, 1)';

const SHAPE_MAP = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3,
};

/* ---------- renderer ------------------------------------- */
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');
const renderer = new WebGLRenderer({
  canvas,
  context: gl,
  antialias: true,
});
canvas.style.width = '100%';
canvas.style.height = '100%';
bg?.appendChild(canvas);

/* ---------- uniforms ------------------------------------- */
const MAX_CLICKS = 10;
const uniforms = {
  uResolution: { value: new Vector2() },
  uTime: { value: 0 },
  uColor: { value: new Color(inkAttr) },
  uClickPos: {
    value: Array.from({ length: MAX_CLICKS }, () => new Vector2(-1, -1)),
  },
  uClickTimes: { value: new Float32Array(MAX_CLICKS) },
  uShapeType: { value: SHAPE_MAP[shapeAttr] ?? 0 },
  uPixelSize: { value: parseFloat(pixelSizeAttr) || 4 },
};

/* ---------- scene / camera / quad ------------------------ */
const scene = new Scene();
const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
const material = new ShaderMaterial({
  vertexShader: vertexSrc,
  fragmentShader: fragmentSrc,
  uniforms,
  glslVersion: GLSL3,
  transparent: true,
});
scene.add(new Mesh(new PlaneGeometry(2, 2), material));

/* ---------- resize helper -------------------------------- */
const resize = () => {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  uniforms.uResolution.value.set(w, h);
};
window.addEventListener('resize', resize);
resize();

/* ---------- click ripple --------------------------------- */
let clickIx = 0;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const fx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const fy =
    (rect.height - (e.clientY - rect.top)) * (canvas.height / rect.height);

  uniforms.uClickPos.value[clickIx].set(fx, fy);
  uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value;
  clickIx = (clickIx + 1) % MAX_CLICKS;
});

/* ---------- main loop ------------------------------------ */
const clock = new Clock();
(function animate() {
  uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
})();
