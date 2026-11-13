// REPS · Option B hero: a lightning bolt made of particles, hovering over the city road map.
// It assembles on load, turns slowly, leans toward the cursor and its particles part around the pointer.
// Click or tap sends an energy burst through it and down into the streets.
import * as THREE from "three";

const GREEN = new THREE.Color("#5DBB3A");
const LIME = new THREE.Color("#8DD270");
const DEEP = new THREE.Color("#2E6B17");

// the REPS bolt outline (same as the battery icon), in local units
const BOLT = [[0.06, 0.3], [-0.1, -0.02], [0.0, -0.02], [-0.06, -0.3], [0.11, 0.05], [0.01, 0.05], [0.08, 0.3]].map(([x, y]) => [x * 34, y * 34]);

function inside(px, py) {
  let c = false;
  for (let i = 0, j = BOLT.length - 1; i < BOLT.length; j = i++) {
    const [xi, yi] = BOLT[i], [xj, yj] = BOLT[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ mapUrl?: string, quality?: number, onBurst?: () => void }} [opts]
 */
export function createBoltScene(canvas, { mapUrl, quality = 1 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality > 0.7 ? 2 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const BG = new THREE.Color("#EDEFEB");
  const scene = new THREE.Scene();
  scene.background = BG;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);

  // ---------- the map below ----------
  const mapMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uMap: { value: null }, uT: { value: 0 }, uBg: { value: BG }, uBurst: { value: 0 }, uAsp: { value: 1.886 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D uMap; uniform float uT, uBurst, uAsp; uniform vec3 uBg; varying vec2 vUv;
      void main(){
        float road = smoothstep(.45,.9,texture2D(uMap, vUv).r);
        vec2 p = (vUv - vec2(.5,.5)) * vec2(uAsp, 1.);
        float d = length(p);
        float rings = pow(.5 + .5*sin(d*60. - uT*2.2), 8.) * smoothstep(.45, .02, d);
        float burst = smoothstep(.05, 0., abs(d - uBurst*.6)) * (1. - uBurst);
        vec3 roadCol = mix(vec3(.80,.82,.78), vec3(.36,.73,.23), clamp(rings*1.4 + burst*2. + smoothstep(.12,.0,d)*.6, 0., 1.));
        float glowPool = smoothstep(.16, 0., d) * .35;
        vec3 col = mix(uBg, roadCol, road*.85);
        col = mix(col, vec3(.55,.82,.42), glowPool);
        float fade = smoothstep(.5, .18, d);
        gl_FragColor = vec4(col, fade);
      }`,
  });
  const MAP_W = 150;
  const map = new THREE.Mesh(new THREE.PlaneGeometry(MAP_W, MAP_W / 1.886), mapMat);
  map.rotation.x = -Math.PI / 2; scene.add(map);
  let ready = Promise.resolve();
  if (mapUrl) ready = new Promise((res) => new THREE.TextureLoader().load(mapUrl, (t) => { t.anisotropy = 8; mapMat.uniforms.uMap.value = t; res(); }, undefined, () => res()));

  // ---------- the bolt ----------
  const N = quality > 0.7 ? 16000 : 7000;
  const target = new Float32Array(N * 3), start = new Float32Array(N * 3), seed = new Float32Array(N), kind = new Float32Array(N);
  const per = [];
  for (let i = 0; i < BOLT.length; i++) { const [ax, ay] = BOLT[i], [bx, by] = BOLT[(i + 1) % BOLT.length]; per.push([ax, ay, bx, by, Math.hypot(bx - ax, by - ay)]); }
  const perLen = per.reduce((a, s) => a + s[4], 0);
  for (let i = 0; i < N; i++) {
    let x, y, z, k;
    const r = Math.random();
    if (r < 0.45) {
      // silhouette: along the outline, front and back faces and the depth in between
      let d = Math.random() * perLen, s = per[0];
      for (const seg of per) { if (d <= seg[4]) { s = seg; break; } d -= seg[4]; }
      const u = d / s[4]; x = s[0] + (s[2] - s[0]) * u; y = s[1] + (s[3] - s[1]) * u;
      z = (Math.random() - 0.5) * 2.2; k = 1;
    } else if (r < 0.88) {
      // body
      do { x = -3.8 + Math.random() * 7.8; y = -10.4 + Math.random() * 20.8; } while (!inside(x, y));
      z = Math.random() < 0.6 ? (Math.random() < 0.5 ? -1.1 : 1.1) : (Math.random() - 0.5) * 2.2; k = 0.6;
    } else {
      // dust orbiting the bolt
      const a = Math.random() * Math.PI * 2, rr = 6 + Math.random() * 8;
      x = Math.cos(a) * rr; y = (Math.random() - 0.5) * 22; z = Math.sin(a) * rr; k = 0;
    }
    target.set([x, y, z], i * 3);
    const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1), R = 22 + Math.random() * 30;
    start.set([Math.sin(b) * Math.cos(a) * R, Math.cos(b) * R * 0.6 - 4, Math.sin(b) * Math.sin(a) * R], i * 3);
    seed[i] = Math.random(); kind[i] = k;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(target, 3));
  geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));
  const ptsMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uT: { value: 0 }, uAsm: { value: 0 }, uMouse: { value: new THREE.Vector3(0, 0, 99) }, uPush: { value: 0 }, uBurst: { value: 0 },
      uDpr: { value: renderer.getPixelRatio() }, uA: { value: GREEN }, uB: { value: LIME }, uC: { value: DEEP },
    },
    vertexShader: `uniform float uT, uAsm, uPush, uBurst, uDpr; uniform vec3 uMouse; attribute vec3 aStart; attribute float aSeed, aKind;
      varying float vGlow; varying float vKind; varying float vSeed;
      void main(){
        float a = smoothstep(0., 1., clamp(uAsm*1.25 - aSeed*.25, 0., 1.));
        vec3 p = mix(aStart, position, a);
        // breathing + shimmer
        p += vec3(sin(uT*1.3 + aSeed*40.), cos(uT*1.1 + aSeed*31.), sin(uT*.9 + aSeed*17.)) * (.06 + (1.-aKind)*.5);
        if (aKind < .5) { float ang = uT*.12*(1.+aSeed); float c = cos(ang), s = sin(ang); p.xz = mat2(c,-s,s,c)*p.xz; }
        // the pointer parts the particles
        vec3 dm = p - uMouse; float dl = length(dm.xy);
        p.xy += normalize(dm.xy + 1e-4) * (1. - smoothstep(0., 4.2, dl)) * 2.2 * uPush;
        p.z += (1. - smoothstep(0., 4.2, dl)) * 1.5 * uPush * (aSeed - .5);
        // burst: blow outward, then settle back
        p += normalize(p + vec3(0.,0.,.01)) * uBurst * (3. + aSeed*6.);
        // energy runs down the bolt
        float wave = pow(.5 + .5*sin(p.y*.55 + uT*4.), 6.);
        vGlow = wave * aKind + uBurst; vKind = aKind; vSeed = aSeed;
        vec4 mv = modelViewMatrix*vec4(p,1.);
        gl_PointSize = (aKind > .5 ? 3.4 : aKind > .2 ? 2.8 : 1.8) * (1. + wave*.9*aKind) * uDpr * (40. / -mv.z);
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `uniform vec3 uA, uB, uC; varying float vGlow; varying float vKind; varying float vSeed;
      void main(){
        vec2 q = gl_PointCoord - .5; float r = length(q); if (r > .5) discard;
        float core = smoothstep(.5, .0, r);
        vec3 col = mix(uC, uA, vKind);
        col = mix(col, uB, clamp(vGlow, 0., 1.));
        col = mix(col, vec3(1.), pow(core, 6.) * vGlow * .6);
        float alpha = smoothstep(.5,.15,r) * (vKind < .2 ? .4 : 1.);
        gl_FragColor = vec4(col, alpha);
      }`,
  });
  const bolt = new THREE.Points(geo, ptsMat);
  const holder = new THREE.Group(); holder.position.set(0, 9.5, 0); holder.add(bolt); scene.add(holder);
  const haloMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uB: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uT, uB; varying vec2 vUv; void main(){ vec2 q=(vUv-.5)*vec2(1.,.62); float d=length(q)*2.; float a=smoothstep(1.,0.,d); gl_FragColor=vec4(.55,.85,.4, a*a*(.28+.06*sin(uT*1.7)+uB*.35)); }`,
  });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(26, 34), haloMat); halo.position.set(0, 9.5, -2); halo.renderOrder = -1; scene.add(halo);

  // a soft glow pool on the map under the bolt
  const poolMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uT: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uT; varying vec2 vUv; void main(){ float d = length(vUv-.5)*2.; float a = smoothstep(1., 0., d)*(.32 + .08*sin(uT*2.)); gl_FragColor = vec4(.36,.73,.23, a*a); }`,
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.02; scene.add(pool);

  // ---------- interaction ----------
  const pointer = new THREE.Vector2(0, 0), pointerS = new THREE.Vector2(0, 0);
  let hovering = false, burst = 0, assemble = 0;
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(), hit = new THREE.Vector3(), normal = new THREE.Vector3();
  const local = new THREE.Vector3();
  let baseX = 0, baseY = 9, targetY = 6, camZ = 46;

  const clock = new THREE.Clock();
  let running = true, visible = true, raf = 0, t = 0;
  function step(dt) {
    t += dt;
    assemble = Math.min(1, assemble + dt / 2.6);
    pointerS.lerp(pointer, 1 - Math.exp(-dt * 4));
    holder.rotation.y = Math.sin(t * 0.45) * 0.35 + pointerS.x * 0.45;
    holder.rotation.x = -pointerS.y * 0.18;
    holder.position.y = 9.5 + Math.sin(t * 1.2) * 0.35;
    // pointer → bolt-local point on a plane through the bolt, facing the camera
    camera.getWorldDirection(normal);
    plane.setFromNormalAndCoplanarPoint(normal.negate(), holder.position);
    ray.setFromCamera(pointerS, camera);
    if (ray.ray.intersectPlane(plane, hit)) { local.copy(hit); holder.worldToLocal(local); ptsMat.uniforms.uMouse.value.copy(local); }
    ptsMat.uniforms.uPush.value += ((hovering ? 1 : 0) - ptsMat.uniforms.uPush.value) * (1 - Math.exp(-dt * 5));
    burst = Math.max(0, burst - dt * 0.9);
    const b = burst > 0 ? Math.sin((1 - burst) * Math.PI) * burst : 0;
    ptsMat.uniforms.uBurst.value = b;
    ptsMat.uniforms.uT.value = t; ptsMat.uniforms.uAsm.value = assemble;
    mapMat.uniforms.uT.value = t; mapMat.uniforms.uBurst.value = burst > 0 ? 1 - burst : 0;
    poolMat.uniforms.uT.value = t; haloMat.uniforms.uT.value = t; haloMat.uniforms.uB.value = b;
    halo.position.y = holder.position.y; halo.quaternion.copy(camera.quaternion);
    camera.position.set(baseX + pointerS.x * 1.2, baseY + pointerS.y * 0.8, camZ);
    camera.lookAt(baseX, targetY, 0);
  }
  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (!visible) { clock.getDelta(); return; }
    step(Math.min(clock.getDelta(), 1 / 20));
    renderer.render(scene, camera);
  }
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // wide screens: the bolt sits right of the copy; narrow screens: centred, lower down
    const wide = w / h > 1.1;
    baseX = wide ? -12.5 * Math.min(1.4, w / h / 1.6) : 0;
    baseY = wide ? 12 : 6;
    targetY = wide ? 9.5 : 15;
    camZ = wide ? 68 : 58;
    camera.fov = wide ? 30 : 40;
    camera.updateProjectionMatrix();
    ptsMat.uniforms.uDpr.value = renderer.getPixelRatio() * (h / 900);
  }
  resize();
  frame();

  return {
    ready,
    setPointer(x, y, over = true) { pointer.set(x, y); hovering = over; },
    leave() { hovering = false; },
    burst() { burst = 1; },
    setVisible(v) { visible = v; },
    resize,
    dispose() {
      running = false; cancelAnimationFrame(raf);
      geo.dispose(); ptsMat.dispose(); haloMat.dispose(); halo.geometry.dispose(); mapMat.dispose(); poolMat.dispose(); map.geometry.dispose(); pool.geometry.dispose();
      mapMat.uniforms.uMap.value?.dispose(); renderer.dispose();
    },
  };
}
