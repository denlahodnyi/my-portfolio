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

const SHAPE_MAP = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3,
};

let renderer;
let uniforms;
let camera;
let scene;
let clock;
let clickIx = 0;

onmessage = (evt) => {
  const type = evt.data.type;
  const MAX_CLICKS = 10;

  if (type === 'init') {
    const { canvas, width, height, shapeAttr, pixelSizeAttr, inkAttr } =
      evt.data;
    canvas.style = { width, height };
    canvas.width = width;
    canvas.height = height;
    const gl = canvas.getContext('webgl2');
    /* ---------- renderer ------------------------------------- */
    renderer = new WebGLRenderer({
      canvas,
      context: gl,
      antialias: true,
    });
    /* ---------- uniforms ------------------------------------- */
    uniforms = {
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
    scene = new Scene();
    camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new ShaderMaterial({
      vertexShader: vertexSrc,
      fragmentShader: fragmentSrc,
      uniforms,
      glslVersion: GLSL3,
      transparent: true,
    });
    scene.add(new Mesh(new PlaneGeometry(2, 2), material));
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(width, height);
    /* ---------- main loop ------------------------------------ */
    clock = new Clock();
    (function animate() {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    })();
  } else if (type === 'pointerdown') {
    const { fx, fy } = evt.data;
    uniforms.uClickPos.value[clickIx].set(fx, fy);
    uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value;
    clickIx = (clickIx + 1) % MAX_CLICKS;
  } else if (type === 'resize') {
    const { width: w, height: h } = evt.data;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }
};
