// REPS — Road Power Plant. One continuous WebGL scene driven by scroll progress.
// Road runs along +X. The 12 m × 3 m REPS plate sits at the origin: 9 slabs × 3 trigger pairs.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const GREEN = new THREE.Color("#8DD270");
const HOT = new THREE.Color("#B6FF8E");
const PLATE_L = 12, PLATE_W = 3, SLABS = 9, ROWS = 3;
const TRACK_Z = 0.78; // wheel tracks
const CAB = new THREE.Vector3(0, 0, 7.2); // energy converter module
const BAT = new THREE.Vector3(4.6, 0, 7.6); // storage

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

export function createScene(canvas, { mapUrl, onEnergy, quality = 1, autoStart = true, preserve = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false, preserveDrawingBuffer: preserve });
  const dpr = Math.min(window.devicePixelRatio, quality > 0.7 ? 1.75 : 1.25);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const BG = new THREE.Color("#070807");
  scene.background = BG;
  scene.fog = new THREE.FogExp2(BG, 0.026);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1200);

  // ---------- lights ----------
  const key = new THREE.DirectionalLight("#fff6ea", 1.1); key.position.set(-6, 10, 4); scene.add(key);
  const rim = new THREE.DirectionalLight("#9fd6ff", 0.9); rim.position.set(8, 4, -8); scene.add(rim);
  const glow = new THREE.PointLight(GREEN, 0, 14, 1.6); glow.position.set(0, 1.2, 0); scene.add(glow);
  const cabGlow = new THREE.PointLight(GREEN, 0, 9, 1.8); cabGlow.position.copy(CAB).add(new THREE.Vector3(0, 1.4, 0)); scene.add(cabGlow);

  // ---------- asphalt ----------
  const asphaltTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
    g.fillStyle = "#121312"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 26000; i++) { const v = 14 + Math.random() * 22; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(Math.random() * 512, Math.random() * 512, 1.4, 1.4); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 18); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  })();
  const roadMat = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.92, metalness: 0.0, transparent: true });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), roadMat);
  road.rotation.x = -Math.PI / 2; road.position.y = -0.002; scene.add(road);

  // lane markings + kerb
  const marks = new THREE.Group(); scene.add(marks);
  const markMat = new THREE.MeshBasicMaterial({ color: "#c9cbc6", transparent: true, opacity: 0.55 });
  for (const z of [-1.75, 1.75]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.12), markMat); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.001, z); marks.add(m); }
  for (let x = -60; x < 60; x += 6) { if (Math.abs(x) < 8) continue; const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.12), markMat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.001, -5.25); marks.add(m); }
  const kerb = new THREE.Mesh(new THREE.BoxGeometry(120, 0.14, 0.3), new THREE.MeshStandardMaterial({ color: "#2a2c29", roughness: 0.7 }));
  kerb.position.set(0, 0.07, 3.55); scene.add(kerb);
  const pavement = new THREE.Mesh(new THREE.PlaneGeometry(120, 10), new THREE.MeshStandardMaterial({ color: "#222421", roughness: 0.85, transparent: true }));
  pavement.rotation.x = -Math.PI / 2; pavement.position.set(0, 0.14, 8.7); scene.add(pavement);

  // ---------- the plate ----------
  const plate = new THREE.Group(); scene.add(plate);
  const steel = new THREE.MeshStandardMaterial({ color: "#2b2e2b", metalness: 0.85, roughness: 0.38 });
  const slabL = PLATE_L / SLABS;
  const plateFrame = new THREE.Mesh(new RoundedBoxGeometry(PLATE_L + 0.24, 0.1, PLATE_W + 0.24, 2, 0.03), new THREE.MeshStandardMaterial({ color: "#3a3d39", metalness: 0.9, roughness: 0.3 }));
  plateFrame.position.y = -0.03; plate.add(plateFrame);
  const slabGeo = new RoundedBoxGeometry(slabL - 0.05, 0.06, PLATE_W, 2, 0.015);
  for (let s = 0; s < SLABS; s++) { const m = new THREE.Mesh(slabGeo, steel); m.position.set(-PLATE_L / 2 + slabL * (s + 0.5), 0.0, 0); plate.add(m); }

  // triggers — half cylinders along Z, two per row (one per wheel track)
  const trigGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.96, 28, 1, false, 0, Math.PI);
  trigGeo.rotateX(Math.PI / 2); trigGeo.rotateZ(Math.PI / 2); // axis along Z, dome up
  const trigMat = new THREE.MeshStandardMaterial({ color: "#8e938d", metalness: 1, roughness: 0.32 });
  const N = SLABS * ROWS * 2;
  const trig = new THREE.InstancedMesh(trigGeo, trigMat, N); plate.add(trig);
  const glowGeo = new THREE.PlaneGeometry(0.34, 1.06); glowGeo.rotateX(-Math.PI / 2);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const trigGlow = new THREE.InstancedMesh(glowGeo, glowMat, N); plate.add(trigGlow);
  const triggers = [];
  const dummy = new THREE.Object3D();
  for (let s = 0; s < SLABS; s++) for (let r = 0; r < ROWS; r++) for (const side of [-1, 1]) {
    const x = -PLATE_L / 2 + slabL * s + slabL * (r + 0.5) / ROWS;
    triggers.push({ x, z: side * TRACK_Z, slab: s, press: 0, armed: true, heat: 0 });
  }
  const black = new THREE.Color(0, 0, 0);
  function writeTriggers() {
    triggers.forEach((t, i) => {
      dummy.position.set(t.x, 0.03 - t.press * 0.07, t.z); dummy.scale.set(1, 1 - t.press * 0.55, 1); dummy.updateMatrix(); trig.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, 0.036, t.z); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); trigGlow.setMatrixAt(i, dummy.matrix);
      trigGlow.setColorAt(i, black.clone().lerp(HOT, 1).multiplyScalar(t.heat * 3.2));
    });
    trig.instanceMatrix.needsUpdate = true; trigGlow.instanceMatrix.needsUpdate = true; if (trigGlow.instanceColor) trigGlow.instanceColor.needsUpdate = true;
  }

  // ripple field over the plate
  const MAXR = 12;
  const rippleMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uHits: { value: Array.from({ length: MAXR }, () => new THREE.Vector3(0, 0, -99)) }, uTime: { value: 0 }, uCol: { value: HOT.clone() } },
    vertexShader: `varying vec2 vP; void main(){ vec4 w = modelMatrix*vec4(position,1.); vP = w.xz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 uHits[${MAXR}]; uniform float uTime; uniform vec3 uCol; varying vec2 vP;
      void main(){ float a=0.;
        for(int i=0;i<${MAXR};i++){ vec3 h=uHits[i]; float age=uTime-h.z; if(age<0.||age>1.6) continue;
          float d=length(vP-h.xy); float r=age*3.2; a+= smoothstep(.09,0.,abs(d-r))*(1.-age/1.6)*.9 + smoothstep(.5,0.,d)*max(0.,.35-age)*2.; }
        vec2 q=abs(vP)-vec2(${(PLATE_L / 2 + 0.6).toFixed(2)},${(PLATE_W / 2 + 0.6).toFixed(2)}); float inBox=1.-smoothstep(0.,.5,max(q.x,q.y));
        gl_FragColor=vec4(uCol*a*inBox*1.6, 1.); }`,
  });
  const ripple = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_L + 2, PLATE_W + 2), rippleMat);
  ripple.rotation.x = -Math.PI / 2; ripple.position.y = 0.06; scene.add(ripple);
  let hitIdx = 0;

  // ---------- hydraulic lines (one per slab) ----------
  const tubes = [];
  const tubeVS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
  const tubeFS = `uniform vec4 uP; uniform float uLen; uniform vec3 uCol; uniform float uBase; varying vec2 vUv;
    void main(){ float s=vUv.x; float a=uBase;
      for(int i=0;i<4;i++){ float p=uP[i]; if(p<0.) continue; float d=(p-s)*uLen; a+= smoothstep(0.,.08,d+.08)*smoothstep(1.4,0.,d)*step(-.08,d); }
      float rim = pow(1.-abs(vUv.y-.5)*2., .6);
      gl_FragColor=vec4(uCol*a*rim*2.4 + vec3(.05,.06,.05)*(1.-rim), 1.); }`;
  for (let s = 0; s < SLABS; s++) {
    const x0 = -PLATE_L / 2 + slabL * (s + 0.5);
    const pts = [
      new THREE.Vector3(x0, 0.03, PLATE_W / 2 + 0.05),
      new THREE.Vector3(x0, 0.03, PLATE_W / 2 + 0.9),
      new THREE.Vector3(lerp(x0, CAB.x, 0.55), 0.18, 4.4 + Math.abs(s - 4) * 0.06),
      new THREE.Vector3(lerp(x0, CAB.x, 0.92) + (s - 4) * 0.07, 0.25, CAB.z - 1.05),
      new THREE.Vector3(CAB.x + (s - 4) * 0.07, 0.55, CAB.z - 0.55),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const mat = new THREE.ShaderMaterial({ uniforms: { uP: { value: new THREE.Vector4(-1, -1, -1, -1) }, uLen: { value: curve.getLength() }, uCol: { value: GREEN.clone() }, uBase: { value: 0.05 } }, vertexShader: tubeVS, fragmentShader: tubeFS, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.036, 10, false), mat);
    scene.add(mesh);
    tubes.push({ mesh, mat, pulses: [] });
  }

  // ---------- energy converter module ----------
  const cab = new THREE.Group(); cab.position.copy(CAB); scene.add(cab);
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(2.6, 0.18, 1.5, 3, 0.05), new THREE.MeshStandardMaterial({ color: "#1e211e", metalness: 0.2, roughness: 0.8 }));
  plinth.position.y = 0.23; cab.add(plinth);
  const glass = new THREE.Mesh(new RoundedBoxGeometry(2.6, 1.9, 1.5, 4, 0.06), new THREE.MeshPhysicalMaterial({ color: "#cfe8d8", metalness: 0, roughness: 0.08, transparent: true, opacity: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false }));
  glass.position.y = 1.27; cab.add(glass);
  const cabEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.6, 1.9, 1.5)), new THREE.LineBasicMaterial({ color: "#8f9a8f", transparent: true, opacity: 0.35 }));
  cabEdges.position.y = 1.27; cab.add(cabEdges);
  const rotor = new THREE.Group(); rotor.position.y = 1.25; cab.add(rotor);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 24), new THREE.MeshStandardMaterial({ color: "#aab0a9", metalness: 1, roughness: 0.25, emissive: GREEN, emissiveIntensity: 0 }));
  shaft.rotation.z = Math.PI / 2; rotor.add(shaft);
  const ringMat = new THREE.MeshStandardMaterial({ color: "#7d837c", metalness: 1, roughness: 0.38, emissive: GREEN, emissiveIntensity: 0 });
  const rings = [];
  for (let i = 0; i < 5; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.42 - Math.abs(i - 2) * 0.06, 0.035, 16, 64), ringMat);
    r.rotation.y = Math.PI / 2; r.position.x = (i - 2) * 0.32; rotor.add(r); rings.push(r);
    const fins = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.62 - Math.abs(i - 2) * 0.1, 0.05), ringMat); fins.position.x = (i - 2) * 0.32; rotor.add(fins);
    const fins2 = fins.clone(); fins2.rotation.x = Math.PI / 2; rotor.add(fins2);
  }
  // magnetic bearings (levitation halos)
  const haloMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const halos = [-1.15, 1.15].map((x) => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 48), haloMat); h.rotation.y = Math.PI / 2; h.position.set(x, 1.25, 0); cab.add(h); return h; });
  [-1.15, 1.15].forEach((x) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 32), new THREE.MeshStandardMaterial({ color: "#1d201d", metalness: 0.8, roughness: 0.3 })); b.rotation.z = Math.PI / 2; b.position.set(x * 1.06, 1.25, 0); cab.add(b); });

  // ---------- storage ----------
  const bat = new THREE.Group(); bat.position.copy(BAT); scene.add(bat);
  const cells = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group(); g.position.set((i % 3 - 1) * 0.72, 0.15, Math.floor(i / 3) * 0.72 - 0.36); bat.add(g);
    const shell = new THREE.Mesh(new RoundedBoxGeometry(0.58, 1.3, 0.58, 3, 0.05), new THREE.MeshPhysicalMaterial({ color: "#d7dbd6", metalness: 0.2, roughness: 0.25, transparent: true, opacity: 0.18, depthWrite: false, clearcoat: 1 }));
    shell.position.y = 0.65; g.add(shell);
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.16, 0.46), new THREE.MeshBasicMaterial({ color: GREEN.clone().multiplyScalar(1.6), toneMapped: false }));
    core.geometry.translate(0, 0.58, 0); core.position.y = 0.07; core.scale.y = 0.02; g.add(core);
    cells.push(core);
  }
  // link converter → storage
  const linkCurve = new THREE.CatmullRomCurve3([CAB.clone().add(new THREE.Vector3(1.3, 0.6, 0.2)), new THREE.Vector3(2.8, 0.25, 7.5), BAT.clone().add(new THREE.Vector3(-1.1, 0.4, 0))]);
  const linkMat = new THREE.ShaderMaterial({ uniforms: { uP: { value: new THREE.Vector4(-1, -1, -1, -1) }, uLen: { value: linkCurve.getLength() }, uCol: { value: GREEN.clone() }, uBase: { value: 0.05 } }, vertexShader: tubeVS, fragmentShader: tubeFS, toneMapped: false });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(linkCurve, 40, 0.05, 10, false), linkMat));
  const link = { mat: linkMat, pulses: [] };

  // ---------- outputs: EV charger + street lights along the pavement ----------
  const outGroup = new THREE.Group(); scene.add(outGroup);
  const postMat = new THREE.MeshStandardMaterial({ color: "#e9ece8", metalness: 0.3, roughness: 0.35 });
  const lampMat = new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false });
  const lamps = [];
  for (let i = 0; i < 6; i++) {
    const x = 9 + i * 7;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 4.2, 12), new THREE.MeshStandardMaterial({ color: "#2d302d", metalness: 0.8, roughness: 0.4 })); pole.position.set(x, 2.25, 4.1); outGroup.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.2), pole.material); arm.position.set(x, 4.32, 3.55); outGroup.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.22), lampMat.clone()); head.position.set(x, 4.27, 3.0); outGroup.add(head); lamps.push(head);
  }
  const charger = new THREE.Mesh(new RoundedBoxGeometry(0.55, 1.7, 0.3, 4, 0.08), postMat); charger.position.set(BAT.x + 3.2, 1.0, 5.2); outGroup.add(charger);
  const chargerLight = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.5), lampMat.clone()); chargerLight.position.set(BAT.x + 3.2, 1.25, 5.04); chargerLight.rotation.y = Math.PI; outGroup.add(chargerLight);
  // energy strip along the kerb, like the film's green line
  const stripMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uT: { value: 0 }, uOn: { value: 0 }, uCol: { value: HOT.clone() } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uT,uOn; uniform vec3 uCol; varying vec2 vUv; void main(){ float x=vUv.x; float reach=smoothstep(uOn+.02,uOn-.02,x); float flow=.55+.45*sin((x*60.-uT*6.)); float core=pow(1.-abs(vUv.y-.5)*2.,3.); gl_FragColor=vec4(uCol*core*reach*flow*1.8,1.); }`,
  });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(56, 0.16), stripMat); strip.rotation.x = -Math.PI / 2; strip.position.set(30, 0.145, 3.82); scene.add(strip);

  // ---------- the truck (light-drawn body, physical wheels) ----------
  const truck = new THREE.Group(); scene.add(truck);
  const lineMat = new THREE.LineBasicMaterial({ color: "#e9f3e6", transparent: true, opacity: 0.42 });
  const addEdges = (w, h, d, x, y) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(new RoundedBoxGeometry(w, h, d, 2, 0.12), 25), lineMat); e.position.set(x, y, 0); truck.add(e); };
  addEdges(2.3, 2.7, 2.45, 0, 2.05);          // cab
  addEdges(10.2, 2.9, 2.5, -6.6, 2.35);       // trailer
  const bodyGlass = new THREE.Mesh(new THREE.BoxGeometry(10.2, 2.9, 2.5), new THREE.MeshBasicMaterial({ color: "#cfe6d4", transparent: true, opacity: 0.025, depthWrite: false }));
  bodyGlass.position.set(-6.6, 2.35, 0); truck.add(bodyGlass);
  const tyreMat = new THREE.MeshStandardMaterial({ color: "#121312", roughness: 0.75, metalness: 0.1 });
  const rimMat = new THREE.MeshStandardMaterial({ color: "#cfd3ce", roughness: 0.25, metalness: 1 });
  const tyreGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.34, 40); tyreGeo.rotateX(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.36, 24); rimGeo.rotateX(Math.PI / 2);
  const AXLES = [0.2, -4.6, -5.9, -9.6, -10.9];
  const wheels = [];
  for (const ax of AXLES) for (const side of [-1, 1]) {
    const w = new THREE.Group(); w.position.set(ax, 0.5, side * (TRACK_Z + 0.02)); truck.add(w);
    w.add(new THREE.Mesh(tyreGeo, tyreMat)); w.add(new THREE.Mesh(rimGeo, rimMat)); wheels.push(w);
  }
  const headL = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.35), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }));
  [-0.85, 0.85].forEach((z) => { const h = headL.clone(); h.position.set(1.16, 1.0, z); h.rotation.y = Math.PI / 2; truck.add(h); });
  const brakeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3b2f"), toneMapped: false });
  const brakeLights = [-1.05, 1.05].map((z) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.25), brakeMat); b.position.set(-11.72, 1.1, z); b.rotation.y = -Math.PI / 2; truck.add(b); return b; });

  // ---------- city road network (the finale) ----------
  const mapMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uMap: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uCol: { value: HOT.clone() }, uAsp: { value: 1.886 }, uOrigin: { value: new THREE.Vector2(0.4932, 0.4917) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D uMap; uniform float uT,uA,uAsp; uniform vec3 uCol; uniform vec2 uOrigin; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      void main(){
        float road = texture2D(uMap, vUv).r;
        vec2 p = (vUv-uOrigin)*vec2(uAsp,1.);
        float d = length(p);
        float R = 0.06 + uT*0.22; float reach = smoothstep(R+0.03, R-0.1, d);              // energy spreading from the plate
        float wave = pow(.5+.5*sin(d*70.-uT*5.),6.);                          // pulses travelling outwards
        float flick = n(vUv*vec2(240.,130.)+vec2(uT*1.5,0.));
        float lit = road*reach*(.45+.9*wave+.35*flick);
        float edge = 1.-smoothstep(.36,.5,max(abs(vUv.x-.5),abs(vUv.y-.5)*1.));
        vec3 col = vec3(.09,.1,.09)*road + uCol*lit*2.4 + uCol*smoothstep(.025,0.,d)*3.;
        gl_FragColor = vec4(col, uA*edge*(road*.95+.05)); }`,
  });
  const MAP_W = 360, MAP_H = MAP_W / 1.886;
  const mapPlane = new THREE.Mesh(new THREE.PlaneGeometry(MAP_W, MAP_H), mapMat);
  mapPlane.rotation.x = -Math.PI / 2; mapPlane.position.set(0, -0.02, 0); scene.add(mapPlane);
  let mapReady = Promise.resolve();
  if (mapUrl) mapReady = new Promise((res) => new THREE.TextureLoader().load(mapUrl, (t) => { t.anisotropy = 8; mapMat.uniforms.uMap.value = t; res(); }, undefined, () => res()));
  mapPlane.visible = false;

  // ---------- post ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.85, 0.6, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grain = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uV: { value: 0.32 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uT,uV; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec4 c=texture2D(tDiffuse,vUv); float g=h(vUv*1000.+uT)-.5; vec2 q=vUv-.5; float v=1.-dot(q,q)*uV*2.;
        gl_FragColor=vec4(c.rgb*v+g*.035,1.); }`,
  });
  composer.addPass(grain);

  // ---------- camera path ----------
  // progress 0..1 is mapped across these shots by the page (hero → 5 steps → city)
  const SHOTS = [
    { p: [-10.5, 1.25, 6.8], t: [0.5, 0.35, 0.2], fov: 30 },   // 0 hero, low and long
    { p: [-1.6, 6.4, 3.6], t: [0.2, 0.0, 0.1], fov: 34 },      // 1 impulse capture
    { p: [-5.2, 3.0, 10.4], t: [-0.4, 0.3, 4.2], fov: 34 },    // 2 hydraulic transmission
    { p: [1.9, 1.75, 10.1], t: [0, 1.15, CAB.z], fov: 30 },    // 3 frictionless conversion
    { p: [8.6, 2.6, 12.6], t: [BAT.x + 0.6, 0.7, BAT.z], fov: 32 }, // 4 storage
    { p: [5.5, 1.6, 1.2], t: [16, 1.8, 4.6], fov: 40 },        // 5 on demand: lights + charger
    { p: [6, 168, 58], t: [0, 0, 0], fov: 38 },                // 6 every road
  ].map((s) => ({ p: new THREE.Vector3(...s.p), t: new THREE.Vector3(...s.t), fov: s.fov }));
  const camP = new THREE.Vector3(), camT = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  let progress = 0, smoothProg = 0;
  function shotAt(pr) {
    const f = pr * (SHOTS.length - 1); const i = Math.min(SHOTS.length - 2, Math.floor(f)); let u = f - i; u = u * u * (3 - 2 * u);
    const a = SHOTS[i], b = SHOTS[i + 1];
    tmpP.copy(a.p).lerp(b.p, u); tmpT.copy(a.t).lerp(b.t, u);
    // arc the long rise to the city so it reads as a crane shot, not a zoom
    if (i === SHOTS.length - 2) { const k = u; tmpP.copy(a.p).lerp(b.p, k * k); tmpT.copy(a.t).lerp(b.t, Math.sqrt(k)); }
    return lerp(a.fov, b.fov, u);
  }

  // ---------- simulation ----------
  let truckX = -48, speed = 16, braking = 0, nextTruck = 0.6, energy = 0, convSpin = 0, storeLevel = 0.08, outOn = 0;
  const pointer = new THREE.Vector2(), pointerS = new THREE.Vector2();
  let manualBrake = false;
  const clock = new THREE.Clock();
  let t = 0, running = true, visible = true;

  function fireTrigger(tr) {
    const hp = rippleMat.uniforms.uHits.value[hitIdx++ % MAXR]; hp.set(tr.x, tr.z, t);
    const tube = tubes[tr.slab]; if (tube.pulses.length < 4) tube.pulses.push(0);
    tr.heat = 1; energy += 1;
    onEnergy?.(energy);
  }

  function step(dt) {
    t += dt;
    // truck: approaches at speed, brakes over the plate, rolls on
    nextTruck -= dt;
    if (truckX > 70 && nextTruck <= 0) { truckX = -48; speed = 16; braking = 0; }
    if (truckX > 70 && nextTruck > 0) { /* waiting */ } else {
      const nose = truckX + 1.2;
      const wantBrake = (nose > -16 && nose < PLATE_L / 2 + 10) ? 1 : 0;
      braking = lerp(braking, Math.max(wantBrake, manualBrake ? 1 : 0), 1 - Math.exp(-dt * 4));
      const target = manualBrake ? 3.2 : wantBrake ? 5.5 : 14;
      speed = lerp(speed, target, 1 - Math.exp(-dt * (wantBrake ? 1.2 : 0.6)));
      truckX += speed * dt;
      if (truckX > 70) nextTruck = 0.8 + Math.random() * 0.8;
    }
    truck.position.x = truckX;
    wheels.forEach((w) => { w.children[0].rotation.z -= (speed * dt) / 0.5; w.children[1].rotation.z = w.children[0].rotation.z; });
    brakeMat.color.setRGB(1, 0.22, 0.18).multiplyScalar(0.6 + braking * 4);

    // triggers respond to wheel contact
    for (const tr of triggers) {
      let p = 0;
      for (const ax of AXLES) { const d = Math.abs(truckX + ax - tr.x); p = Math.max(p, smooth(0.55, 0.05, d)); }
      tr.press = lerp(tr.press, p, 1 - Math.exp(-dt * 22));
      if (tr.press > 0.6 && tr.armed) { tr.armed = false; fireTrigger(tr); }
      if (tr.press < 0.2) tr.armed = true;
      tr.heat = Math.max(0, tr.heat - dt * 1.4);
    }
    writeTriggers();
    rippleMat.uniforms.uTime.value = t;

    // pulses along tubes → converter
    let arrived = 0;
    for (const tb of tubes) {
      tb.pulses = tb.pulses.map((p) => p + dt * 0.75).filter((p) => { if (p > 1.15) { arrived++; return false; } return true; });
      const v = tb.mat.uniforms.uP.value; v.set(tb.pulses[0] ?? -1, tb.pulses[1] ?? -1, tb.pulses[2] ?? -1, tb.pulses[3] ?? -1);
    }
    convSpin = Math.min(1.6, convSpin + arrived * 0.06) * Math.exp(-dt * 0.35);
    rotor.rotation.x += dt * (0.4 + convSpin * 9);
    ringMat.emissiveIntensity = convSpin * 2.2; shaft.material.emissiveIntensity = convSpin * 3;
    haloMat.opacity = 0.25 + convSpin * 0.6;
    rotor.position.y = 1.25 + Math.sin(t * 2.1) * 0.012;
    cabGlow.intensity = convSpin * 6;
    if (arrived && link.pulses.length < 4 && Math.random() < 0.35) link.pulses.push(0);
    link.pulses = link.pulses.map((p) => p + dt * 0.6).filter((p) => { if (p > 1.15) { storeLevel = Math.min(1, storeLevel + 0.035); return false; } return true; });
    link.mat.uniforms.uP.value.set(link.pulses[0] ?? -1, link.pulses[1] ?? -1, link.pulses[2] ?? -1, link.pulses[3] ?? -1);
    storeLevel = Math.max(0.08 + smooth(0.5, 0.68, smoothProg) * 0.75, storeLevel - dt * 0.012);
    cells.forEach((c, i) => { c.scale.y = lerp(c.scale.y, Math.max(0.02, Math.min(1, storeLevel * 1.15 - i * 0.03)), 1 - Math.exp(-dt * 3)); });
    glow.intensity = triggers.reduce((a, b) => a + b.heat, 0) * 0.5;

    // outputs come alive as storage fills
    outOn = lerp(outOn, smooth(0.15, 0.6, storeLevel), 1 - Math.exp(-dt * 2));
    lamps.forEach((l, i) => l.material.color.copy(GREEN).multiplyScalar(0.05 + smooth(i * 0.12, i * 0.12 + 0.3, outOn) * 3));
    chargerLight.material.color.copy(GREEN).multiplyScalar(0.1 + outOn * 2.5 * (0.7 + 0.3 * Math.sin(t * 3)));
    stripMat.uniforms.uT.value = t; stripMat.uniforms.uOn.value = outOn * 1.05;

    // camera
    smoothProg = lerp(smoothProg, progress, 1 - Math.exp(-dt * 5));
    const fov = shotAt(smoothProg);
    pointerS.lerp(pointer, 1 - Math.exp(-dt * 3));
    const par = 1 - smooth(0.75, 0.95, smoothProg);
    camP.copy(tmpP).add(new THREE.Vector3(pointerS.x * 0.6 * par, pointerS.y * 0.35 * par, 0));
    camera.position.copy(camP); camera.lookAt(tmpT);
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    // finale: dissolve the street into the city network
    const city = smooth(0.84, 0.97, smoothProg);
    mapPlane.visible = city > 0.001;
    mapMat.uniforms.uA.value = city; mapMat.uniforms.uT.value = city > 0 ? mapMat.uniforms.uT.value + dt : 0;
    roadMat.opacity = 1 - city * 0.92; pavement.material.opacity = 1 - city;
    marks.visible = city < 0.6;
    scene.fog.density = lerp(0.026, 0.0016, smooth(0.8, 0.95, smoothProg));
    bloom.strength = lerp(0.9, 1.25, city);
    grain.uniforms.uT.value = t;
  }

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    if (!visible) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 1 / 20);
    step(dt);
    composer.render();
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    bloom.resolution.set(w * 0.5, h * 0.5);
    camera.aspect = w / h;
    // keep the plate framed on portrait screens
    camera.zoom = w / h < 0.8 ? 0.62 : w / h < 1.2 ? 0.82 : 1;
    camera.updateProjectionMatrix();
  }
  resize();
  step(0.016);
  if (autoStart) frame();

  return {
    setProgress(p) { progress = Math.min(1, Math.max(0, p)); },
    ready: mapReady,
    /** deterministic stills: jump the camera to `p`, simulate `secs`, render once */
    snap(p, secs = 4, dt = 1 / 60) { progress = p; smoothProg = p; for (let i = 0; i < secs / dt; i++) step(dt); composer.render(); },
    setTruck(x, v = 6) { truckX = x; speed = v; },
    setPointer(x, y) { pointer.set(x, y); },
    setBrake(on) { manualBrake = on; if (on && truckX > 30) { truckX = -26; speed = 12; } },
    setVisible(v) { visible = v; },
    resize,
    get energy() { return energy; },
    dispose() {
      running = false;
      scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => { Object.values(mm).forEach((v) => v?.isTexture && v.dispose()); mm.dispose(); }); });
      env.dispose(); pmrem.dispose(); composer.dispose?.(); renderer.dispose();
    },
  };
}
