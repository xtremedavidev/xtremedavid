/* Three.js Fluid Overlay — lightweight, subtle, nearly transparent */
export function initLiquidOverlay() {
  const THREE = (window as any).THREE;
  if (!THREE) return;

  const canvas = document.getElementById("liquid-canvas") as HTMLCanvasElement;
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1); // Force 1x for performance

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const TRAIL = 5;
  const trailPos = new Float32Array(TRAIL * 2);
  const trailStr = new Float32Array(TRAIL);
  for (let i = 0; i < TRAIL; i++) {
    trailPos[i * 2] = -5;
    trailPos[i * 2 + 1] = -5;
    trailStr[i] = 0;
  }

  const fragmentShader = `
    precision mediump float;
    uniform float uTime;
    uniform vec2 uRes;
    uniform float uAct;
    uniform vec2 uTP[${TRAIL}];
    uniform float uTS[${TRAIL}];
    varying vec2 vUv;

    void main() {
      float asp = uRes.x / uRes.y;
      vec2 p = vec2(vUv.x * asp, vUv.y);
      float distort = 0.0;

      for (int i = 0; i < ${TRAIL}; i++) {
        vec2 tp = vec2(uTP[i].x * asp, uTP[i].y);
        float d = length(p - tp);
        float blob = exp(-d * d * 18.0) * uTS[i];
        distort += blob;
      }

      distort *= uAct;

      // Very subtle white highlight — like light refracting on glass
      float alpha = distort * 0.045;
      alpha = clamp(alpha, 0.0, 0.06);

      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `;

  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uAct: { value: 0 },
    uTP: { value: trailPos },
    uTS: { value: trailStr },
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
    fragmentShader,
    uniforms,
    transparent: true,
    depthTest: false,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  let targetAct = 0, act = 0;
  let mx = -5, my = -5, pmx = -5, pmy = -5;
  let ti = 0, lastDrop = 0;
  let idle: ReturnType<typeof setTimeout> | null = null;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX / window.innerWidth;
    my = 1 - e.clientY / window.innerHeight;
    const sp = Math.sqrt((mx - pmx) ** 2 + (my - pmy) ** 2);
    pmx = mx; pmy = my;
    targetAct = Math.min(1, sp * 12);

    const now = performance.now();
    if (now - lastDrop > 50) {
      trailPos[ti * 2] = mx;
      trailPos[ti * 2 + 1] = my;
      trailStr[ti] = Math.min(1, sp * 15 + 0.2);
      ti = (ti + 1) % TRAIL;
      lastDrop = now;
    }
    if (idle) clearTimeout(idle);
    idle = setTimeout(() => { targetAct = 0; }, 400);
  });

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
  });

  function loop() {
    requestAnimationFrame(loop);
    act += (targetAct - act) * 0.06;
    uniforms.uAct.value = act;
    for (let i = 0; i < TRAIL; i++) trailStr[i] *= 0.97;
    mat.uniformsNeedUpdate = true;
    renderer.render(scene, camera);
  }
  loop();
}
