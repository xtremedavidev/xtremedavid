// REPS — Road Power Plant. One continuous Three.js scene driven by scroll progress.
// Road runs along +X. The 12 m × 3 m REPS plate sits at the origin: 9 slabs × 3 trigger pairs.
// Shared by both REPS concepts: theme "dark" (Option A) and theme "light" (Option B).
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
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

/** Camera shots. Progress 0..1 is spread evenly across them by the page. */
const SHOTS = {
  dark: [
    { p: [11.5, 0.95, 2.5], t: [-4, 1.05, -0.5], fov: 30 },      // 0 hero: low, the truck comes at you
    { p: [-1.6, 6.4, 3.6], t: [0.2, 0.0, 0.1], fov: 34 },        // 1 impulse capture
    { p: [-5.2, 3.0, 10.4], t: [-0.4, 0.3, 4.2], fov: 34 },      // 2 hydraulic transmission
    { p: [1.9, 1.75, 10.1], t: [0, 1.15, CAB.z], fov: 30 },      // 3 frictionless conversion
    { p: [8.6, 2.6, 12.6], t: [BAT.x + 0.6, 0.7, BAT.z], fov: 32 }, // 4 storage
    { p: [2.5, 2.4, -4.5], t: [13, 1.3, 5.2], fov: 36 },         // 5 on demand: lights + charger
    { p: [0, 72, 66], t: [0, 0, -15], fov: 36 },                  // 6 zoom out: the plates spell REPS
  ],
  light: [
    { p: [11.5, 0.95, 2.5], t: [-4, 1.05, -0.5], fov: 30 },
    { p: [11.5, 8.5, 15.5], t: [0.8, 0.2, 3.4], fov: 26 },       // 1 product view of the whole system
    { p: [-5.2, 3.0, 10.4], t: [-0.4, 0.3, 4.2], fov: 34 },
    { p: [1.9, 1.75, 10.1], t: [0, 1.15, CAB.z], fov: 30 },
    { p: [8.6, 2.6, 12.6], t: [BAT.x + 0.6, 0.7, BAT.z], fov: 32 },
    { p: [2.5, 2.4, -4.5], t: [13, 1.3, 5.2], fov: 36 },
    { p: [30, 62, 118], t: [-4, 0, -6], fov: 34 },               // 6 perspective city map
  ],
};

const THEMES = {
  dark: {
    bg: "#070807", fog: [0.026, 0.0016], env: 0.35, exposure: 1.05, asphalt: ["#121312", 14, 22], mark: ["#c9cbc6", 0.55],
    kerb: "#2a2c29", pavement: "#222421", steel: "#2b2e2b", frame: "#3a3d39", trig: "#8e938d",
    plinth: "#1e211e", glass: ["#cfe8d8", 0.05], edges: ["#8f9a8f", 0.35], shell: 0.18,
    bloom: [0.55, 0.35, 1.0], bloomCity: 0.62, vignette: 0.32, shadows: false,
    emissive: { ring: 1.1, shaft: 1.6, halo: [0.35, 0.6], glow: 0.35, base: 0.35 },
  },
  light: {
    bg: "#EDEFEB", fog: [0.0045, 0.0042], env: 0.55, exposure: 1.0, asphalt: ["#C9CCC6", 185, 30], mark: ["#FFFFFF", 0.9],
    kerb: "#B9BCB5", pavement: "#DCDFD9", steel: "#8A8E87", frame: "#6E726B", trig: "#5E625B",
    plinth: "#E6E8E3", glass: ["#FFFFFF", 0.25], edges: ["#6E726B", 0.55], shell: 0.32,
    bloom: [0.22, 0.3, 1.15], bloomCity: 0.12, vignette: 0, shadows: true,
    emissive: { ring: 0.55, shaft: 0.9, halo: [0.2, 0.4], glow: 0.18, base: 0.12 },
  },
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ theme?: "dark"|"light", mapUrl?: string, logoUrl?: string, finale?: { p: number[], t: number[], fov: number }, onEnergy?: (n:number)=>void, quality?: number, truck?: boolean, progress?: number, drift?: number }} [opts]
 */
export function createScene(canvas, { theme = "dark", mapUrl, logoUrl, finale, onEnergy, quality = 1, truck: showTruck = true, progress: startProgress = 0, drift = 0 } = {}) {
  const T = THEMES[theme];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality > 0.7 ? 1.75 : 1.25));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = T.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const BG = new THREE.Color(T.bg);
  scene.background = BG;
  scene.fog = new THREE.FogExp2(BG, T.fog[0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = T.env;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1200);

  // ---------- lights ----------
  const key = new THREE.DirectionalLight("#fff6ea", 1.1); key.position.set(-6, 10, 4); scene.add(key);
  const rim = new THREE.DirectionalLight("#9fd6ff", 0.9); rim.position.set(8, 4, -8); scene.add(rim);
  const glow = new THREE.PointLight(GREEN, 0, 14, 1.6); glow.position.set(0, 1.2, 0); scene.add(glow);
  const cabGlow = new THREE.PointLight(GREEN, 0, 9, 1.8); cabGlow.position.copy(CAB).add(new THREE.Vector3(0, 1.4, 0)); scene.add(cabGlow);

  // ---------- asphalt ----------
  const asphaltTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
    const [base, lo, span] = T.asphalt;
    g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 26000; i++) { const v = lo + Math.random() * span; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(Math.random() * 512, Math.random() * 512, 1.4, 1.4); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 18); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  })();
  const roadMat = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.92, metalness: 0.0, transparent: true });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), roadMat);
  road.rotation.x = -Math.PI / 2; road.position.y = -0.002; scene.add(road);

  // lane markings + kerb
  const marks = new THREE.Group(); scene.add(marks);
  const markMat = new THREE.MeshBasicMaterial({ color: T.mark[0], transparent: true, opacity: T.mark[1] });
  for (const z of [-1.75, 1.75]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.12), markMat); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.001, z); marks.add(m); }
  for (let x = -60; x < 60; x += 6) { if (Math.abs(x) < 8) continue; const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.12), markMat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.001, -5.25); marks.add(m); }
  const kerb = new THREE.Mesh(new THREE.BoxGeometry(120, 0.14, 0.3), new THREE.MeshStandardMaterial({ color: T.kerb, roughness: 0.7 }));
  kerb.position.set(0, 0.07, 3.55); scene.add(kerb);
  const pavement = new THREE.Mesh(new THREE.PlaneGeometry(120, 10), new THREE.MeshStandardMaterial({ color: T.pavement, roughness: 0.85, transparent: true }));
  pavement.rotation.x = -Math.PI / 2; pavement.position.set(0, 0.14, 8.7); scene.add(pavement);

  // ---------- the plate ----------
  const plate = new THREE.Group(); scene.add(plate);
  const steel = new THREE.MeshStandardMaterial({ color: T.steel, metalness: theme === "dark" ? 0.85 : 0.55, roughness: theme === "dark" ? 0.38 : 0.45 });
  const slabL = PLATE_L / SLABS;
  const plateFrame = new THREE.Mesh(new RoundedBoxGeometry(PLATE_L + 0.24, 0.1, PLATE_W + 0.24, 2, 0.03), new THREE.MeshStandardMaterial({ color: T.frame, metalness: theme === "dark" ? 0.9 : 0.8, roughness: theme === "dark" ? 0.3 : 0.35 }));
  plateFrame.position.y = -0.03; plate.add(plateFrame);
  const slabGeo = new RoundedBoxGeometry(slabL - 0.05, 0.06, PLATE_W, 2, 0.015);
  for (let s = 0; s < SLABS; s++) { const m = new THREE.Mesh(slabGeo, steel); m.position.set(-PLATE_L / 2 + slabL * (s + 0.5), 0.0, 0); plate.add(m); }

  // triggers — half cylinders along Z, two per row (one per wheel track)
  const trigGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.96, 28, 1, false, 0, Math.PI);
  trigGeo.rotateX(Math.PI / 2); trigGeo.rotateZ(Math.PI / 2);
  const trigMat = new THREE.MeshStandardMaterial({ color: T.trig, metalness: 1, roughness: theme === "dark" ? 0.32 : 0.3 });
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
  const tmpCol = new THREE.Color();
  function writeTriggers() {
    triggers.forEach((t, i) => {
      dummy.position.set(t.x, 0.03 - t.press * 0.07, t.z); dummy.scale.set(1, 1 - t.press * 0.55, 1); dummy.updateMatrix(); trig.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, 0.036, t.z); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); trigGlow.setMatrixAt(i, dummy.matrix);
      trigGlow.setColorAt(i, tmpCol.copy(HOT).multiplyScalar(t.heat * 3.2));
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
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(2.6, 0.18, 1.5, 3, 0.05), new THREE.MeshStandardMaterial({ color: T.plinth, metalness: theme === "dark" ? 0.2 : 0.1, roughness: theme === "dark" ? 0.8 : 0.6 }));
  plinth.position.y = 0.23; cab.add(plinth);
  const glass = new THREE.Mesh(new RoundedBoxGeometry(2.6, 1.9, 1.5, 4, 0.06), new THREE.MeshPhysicalMaterial({ color: T.glass[0], metalness: 0, roughness: 0.06, transparent: true, opacity: T.glass[1], clearcoat: 1, clearcoatRoughness: 0.06, depthWrite: false }));
  glass.position.y = 1.27; cab.add(glass);
  const cabEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.6, 1.9, 1.5)), new THREE.LineBasicMaterial({ color: T.edges[0], transparent: true, opacity: T.edges[1] }));
  cabEdges.position.y = 1.27; cab.add(cabEdges);
  const rotor = new THREE.Group(); rotor.position.y = 1.25; cab.add(rotor);
  glass.renderOrder = 2;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 24), new THREE.MeshStandardMaterial({ color: "#dfe4dd", metalness: 1, roughness: 0.16, emissive: GREEN, emissiveIntensity: 0, envMapIntensity: 2.4 }));
  shaft.rotation.z = Math.PI / 2; rotor.add(shaft);
  const ringMat = new THREE.MeshStandardMaterial({ color: "#b9c2b8", metalness: 1, roughness: 0.22, emissive: GREEN, emissiveIntensity: 0, envMapIntensity: 2.2 });
  for (let i = 0; i < 5; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.42 - Math.abs(i - 2) * 0.06, 0.035, 16, 64), ringMat);
    r.rotation.y = Math.PI / 2; r.position.x = (i - 2) * 0.32; rotor.add(r);
    const fins = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.62 - Math.abs(i - 2) * 0.1, 0.05), ringMat); fins.position.x = (i - 2) * 0.32; rotor.add(fins);
    const fins2 = fins.clone(); fins2.rotation.x = Math.PI / 2; rotor.add(fins2);
  }
  // stator: copper windings around the rotor, plus two end frames
  const copper = new THREE.MeshStandardMaterial({ color: "#c47a3c", metalness: 1, roughness: 0.3, envMapIntensity: 2, emissive: new THREE.Color("#ff8a3d"), emissiveIntensity: 0 });
  const frameMat = new THREE.MeshStandardMaterial({ color: theme === "dark" ? "#3a3f3a" : "#9ca19a", metalness: 0.9, roughness: 0.3, envMapIntensity: 1.6 });
  const stator = new THREE.Group(); stator.position.y = 1.25; cab.add(stator);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.36, 16), copper);
    coil.rotation.z = Math.PI / 2; coil.position.set(0, Math.cos(a) * 0.6, Math.sin(a) * 0.6); stator.add(coil);
    for (let w = -3; w <= 3; w++) { const wind = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.012, 6, 18), copper); wind.rotation.y = Math.PI / 2; wind.position.set(w * 0.18, Math.cos(a) * 0.6, Math.sin(a) * 0.6); stator.add(wind); }
  }
  [-0.78, 0.78].forEach((x) => { const f = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 12, 64), frameMat); f.rotation.y = Math.PI / 2; f.position.x = x; stator.add(f); });
  [-1.05, 1.05].forEach((x) => { const leg = new THREE.Mesh(new RoundedBoxGeometry(0.18, 1.0, 0.9, 2, 0.03), frameMat); leg.position.set(x, -0.62, 0); stator.add(leg); });
  const innerGlow = new THREE.PointLight(GREEN, 0, 3.2, 1.6); innerGlow.position.set(0, 1.25, 0.2); cab.add(innerGlow);
  // magnetic bearings (levitation halos)
  const haloMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  [-1.15, 1.15].forEach((x) => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 48), haloMat); h.rotation.y = Math.PI / 2; h.position.set(x, 1.25, 0); cab.add(h); });
  [-1.15, 1.15].forEach((x) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 32), new THREE.MeshStandardMaterial({ color: "#1d201d", metalness: 0.8, roughness: 0.3 })); b.rotation.z = Math.PI / 2; b.position.set(x * 1.06, 1.25, 0); cab.add(b); });

  // ---------- storage ----------
  const bat = new THREE.Group(); bat.position.copy(BAT); scene.add(bat);
  // glass battery cells: turned chrome caps, double-wall glass with a fresnel rim, stacked charge bands, glowing liquid and a bevelled bolt
  const capMat = new THREE.MeshStandardMaterial({ color: "#c9cec8", metalness: 1, roughness: 0.14, envMap: env, envMapIntensity: theme === "dark" ? 0.95 : 1.1 });
  const capDark = new THREE.MeshStandardMaterial({ color: "#2a2e2a", metalness: 0.8, roughness: 0.35 });
  const sheenMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: theme === "dark" ? 0.1 : 0.25, blending: THREE.AdditiveBlending, depthWrite: false });
  const batKey = new THREE.PointLight("#ffffff", theme === "dark" ? 1.4 : 0.8, 6, 1.8); batKey.position.set(1.4, 2.6, 2.2); bat.add(batKey);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: "#7fd85f", metalness: 0, roughness: 0.06, transparent: true, opacity: theme === "dark" ? 0.2 : 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 3, depthWrite: false, side: THREE.DoubleSide });
  // fresnel rim: the glass edges catch light like real thick glass
  const fresnelMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
    uniforms: { uTint: { value: new THREE.Color("#8fe36a") }, uK: { value: theme === "dark" ? 1 : 0.7 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uTint; uniform float uK; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.-abs(dot(normalize(vN), normalize(vV))), 2.6); gl_FragColor = vec4(mix(uTint*.5, uTint*1.15 + .12, f), (.03 + f*.42)*uK); }`,
  });
  const liquidMat = new THREE.MeshStandardMaterial({ color: "#4fb52f", emissive: GREEN, emissiveIntensity: 0.75, transparent: true, opacity: 0.52, depthWrite: false, roughness: 0.15 });
  const surfMat = new THREE.MeshBasicMaterial({ color: GREEN.clone().multiplyScalar(1.5), transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false });
  const boltMat = new THREE.MeshPhysicalMaterial({ color: "#c4f59c", metalness: 0.2, roughness: 0.18, clearcoat: 1, emissive: GREEN, emissiveIntensity: 0.4 });
  const LED_OFF = new THREE.Color(theme === "dark" ? "#1a2a17" : "#BFD0B5");
  const N_SEG = 7;
  const segs = [], liquids = [], surfaces = [];
  // turned profiles (radius, height) for the caps and terminal
  const lathe = (pts, seg = 96) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const baseGeo = lathe([[0, 0], [0.43, 0], [0.455, 0.012], [0.462, 0.04], [0.462, 0.1], [0.452, 0.13], [0.43, 0.145], [0.395, 0.15], [0.39, 0.175], [0.372, 0.18], [0, 0.18]]);
  const topGeo = lathe([[0, 0], [0.372, 0], [0.39, 0.006], [0.395, 0.03], [0.43, 0.036], [0.452, 0.05], [0.462, 0.08], [0.462, 0.13], [0.452, 0.152], [0.42, 0.162], [0.2, 0.164], [0, 0.164]]);
  const nubGeo = lathe([[0, 0], [0.17, 0], [0.175, 0.01], [0.165, 0.06], [0.15, 0.085], [0.12, 0.095], [0, 0.097]], 64);
  const grooveGeo = new THREE.TorusGeometry(0.463, 0.006, 8, 96);
  const boltShape = new THREE.Shape();
  [[0.06, 0.3], [-0.1, -0.02], [0.0, -0.02], [-0.06, -0.3], [0.11, 0.05], [0.01, 0.05], [0.08, 0.3]].forEach(([x, y], i) => (i ? boltShape.lineTo(x, y) : boltShape.moveTo(x, y)));
  const boltGeo = new THREE.ExtrudeGeometry(boltShape, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.014, bevelSegments: 5 }); boltGeo.center();
  const bandGeo = new THREE.CylinderGeometry(0.275, 0.275, 0.055, 96, 1, true);
  const bandEdge = new THREE.TorusGeometry(0.275, 0.006, 6, 96);
  const glassGeo = new THREE.CylinderGeometry(0.372, 0.372, 1.3, 96, 1, true);
  const innerGlassGeo = new THREE.CylinderGeometry(0.352, 0.352, 1.3, 96, 1, true);
  const liquidGeo = new THREE.CylinderGeometry(0.348, 0.348, 1, 96); liquidGeo.translate(0, 0.5, 0);
  const surfGeo = new THREE.CircleGeometry(0.346, 96); surfGeo.rotateX(-Math.PI / 2);
  const dotGeo = new THREE.SphereGeometry(0.016, 12, 12);
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); g.position.set((i - 1.5) * 0.92, 0, 0); bat.add(g);
    const base = new THREE.Mesh(baseGeo, capMat); g.add(base);
    [0.05, 0.085].forEach((y) => { const gr = new THREE.Mesh(grooveGeo, capDark); gr.rotation.x = Math.PI / 2; gr.position.y = y; g.add(gr); });
    const glass = new THREE.Mesh(glassGeo, glassMat); glass.position.y = 0.83; glass.renderOrder = 3; g.add(glass);
    const inner = new THREE.Mesh(innerGlassGeo, glassMat); inner.position.y = 0.83; inner.renderOrder = 3; g.add(inner);
    const rim = new THREE.Mesh(glassGeo, fresnelMat); rim.position.y = 0.83; rim.scale.set(1.004, 1, 1.004); rim.renderOrder = 4; g.add(rim);
    const liquid = new THREE.Mesh(liquidGeo, liquidMat); liquid.position.y = 0.18; liquid.scale.y = 0.1; liquid.renderOrder = 2; g.add(liquid); liquids.push(liquid);
    const surf = new THREE.Mesh(surfGeo, surfMat); surf.position.y = 0.2; surf.renderOrder = 2; g.add(surf); surfaces.push(surf);
    const top = new THREE.Mesh(topGeo, capMat); top.position.y = 1.48; g.add(top);
    [1.55, 1.585].forEach((y) => { const gr = new THREE.Mesh(grooveGeo, capDark); gr.rotation.x = Math.PI / 2; gr.position.y = y; g.add(gr); });
    const nub = new THREE.Mesh(nubGeo, capMat); nub.position.y = 1.642; g.add(nub);
    [[-0.22, 0.05], [-0.15, 0.014], [0.25, 0.026]].forEach(([x, w]) => { const sh = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.24), sheenMat); sh.position.set(x, 0.83, 0.37 - Math.abs(x) * 0.2); sh.renderOrder = 5; g.add(sh); });
    const bolt = new THREE.Mesh(boltGeo, boltMat); bolt.position.set(0, 0.86, 0.05); bolt.scale.setScalar(1.25); g.add(bolt);
    const col = [];
    for (let k = 0; k < N_SEG; k++) {
      const m = new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({ color: LED_OFF.clone(), toneMapped: false, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
      const y = 0.37 + k * 0.155; m.position.y = y; g.add(m);
      [-0.0275, 0.0275].forEach((dy) => { const e = new THREE.Mesh(bandEdge, m.material); e.rotation.x = Math.PI / 2; e.position.y = y + dy; g.add(e); });
      [-0.17, 0.17].forEach((x) => { const d = new THREE.Mesh(dotGeo, m.material); d.position.set(x, y, 0.21); g.add(d); });
      col.push(m);
    }
    segs.push(col);
  }
  // link converter → storage
  const linkCurve = new THREE.CatmullRomCurve3([CAB.clone().add(new THREE.Vector3(1.3, 0.6, 0.2)), new THREE.Vector3(2.8, 0.25, 7.5), BAT.clone().add(new THREE.Vector3(-1.85, 0.4, 0))]);
  const linkMat = new THREE.ShaderMaterial({ uniforms: { uP: { value: new THREE.Vector4(-1, -1, -1, -1) }, uLen: { value: linkCurve.getLength() }, uCol: { value: GREEN.clone() }, uBase: { value: 0.05 } }, vertexShader: tubeVS, fragmentShader: tubeFS, toneMapped: false });
  const linkMesh = new THREE.Mesh(new THREE.TubeGeometry(linkCurve, 40, 0.05, 10, false), linkMat); scene.add(linkMesh);
  const link = { mat: linkMat, pulses: [] };

  // ---------- outputs: EV charger + street lights along the pavement ----------
  const outGroup = new THREE.Group(); scene.add(outGroup);
  const postMat = new THREE.MeshStandardMaterial({ color: "#e9ece8", metalness: 0.3, roughness: 0.35 });
  const lampMat = new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false });
  const poleMat = new THREE.MeshStandardMaterial({ color: "#2d302d", metalness: 0.8, roughness: 0.4 });
  const lamps = [];
  for (let i = 0; i < 6; i++) {
    const x = 9 + i * 7;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 4.2, 12), poleMat); pole.position.set(x, 2.25, 4.1); outGroup.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.2), poleMat); arm.position.set(x, 4.32, 3.55); outGroup.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.22), lampMat.clone()); head.position.set(x, 4.27, 3.0); outGroup.add(head); lamps.push(head);
  }
  const charger = new THREE.Mesh(new RoundedBoxGeometry(0.55, 1.7, 0.3, 4, 0.08), postMat); charger.position.set(BAT.x + 3.2, 1.0, 5.2); outGroup.add(charger);
  const chargerLight = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.5), lampMat.clone()); chargerLight.position.set(BAT.x + 3.2, 1.25, 5.04); chargerLight.rotation.y = Math.PI; outGroup.add(chargerLight);
  // energy strip along the kerb, like the brand film's green line
  const stripMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uT: { value: 0 }, uOn: { value: 0 }, uCol: { value: HOT.clone() } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uT,uOn; uniform vec3 uCol; varying vec2 vUv; void main(){ float x=vUv.x; float reach=smoothstep(uOn+.02,uOn-.02,x); float flow=.55+.45*sin((x*60.-uT*6.)); float core=pow(1.-abs(vUv.y-.5)*2.,3.); gl_FragColor=vec4(uCol*core*reach*flow*1.8,1.); }`,
  });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(56, 0.16), stripMat); strip.rotation.x = -Math.PI / 2; strip.position.set(30, 0.145, 3.82); scene.add(strip);

  // ---------- the truck: dark glossy cab, white trailer, green accent line ----------
  const truck = new THREE.Group(); truck.visible = showTruck; scene.add(truck);
  let truckOn = showTruck;
  const cabMat = new THREE.MeshPhysicalMaterial({ color: "#1b1d1b", metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
  const trailerMat = new THREE.MeshPhysicalMaterial({ color: "#d9dcd5", metalness: 0.05, roughness: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.3 });
  const windowMat = new THREE.MeshPhysicalMaterial({ color: "#050606", metalness: 0.9, roughness: 0.08 });
  const cabBody = new THREE.Mesh(new RoundedBoxGeometry(2.3, 2.6, 2.45, 4, 0.22), cabMat); cabBody.position.set(0, 2.05, 0); truck.add(cabBody);
  const windscreen = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 1.05), windowMat); windscreen.position.set(1.162, 2.65, 0); windscreen.rotation.y = Math.PI / 2; truck.add(windscreen);
  const trailer = new THREE.Mesh(new RoundedBoxGeometry(10.2, 2.8, 2.5, 3, 0.06), trailerMat); trailer.position.set(-6.6, 2.42, 0); truck.add(trailer);
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.32, 1.3), new THREE.MeshStandardMaterial({ color: "#0d0e0d", roughness: 0.6 })); chassis.position.set(-5.4, 0.82, 0); truck.add(chassis);
  const accent = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.035, 2.52), new THREE.MeshBasicMaterial({ color: GREEN.clone().multiplyScalar(2.2), toneMapped: false })); accent.position.set(-6.6, 1.06, 0); truck.add(accent);
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
  const headL = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffffff").multiplyScalar(3), toneMapped: false }));
  [-0.85, 0.85].forEach((z) => { const h = headL.clone(); h.position.set(1.16, 1.0, z); h.rotation.y = Math.PI / 2; truck.add(h); });
  const brakeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3b2f"), toneMapped: false });
  const brakeGlow = new THREE.PointLight("#ff3b2f", 0, 9, 1.6); brakeGlow.position.set(-12.4, 1.1, 0); truck.add(brakeGlow);
  [-1.05, 1.05].forEach((z) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.25), brakeMat); b.position.set(-11.72, 1.1, z); b.rotation.y = -Math.PI / 2; truck.add(b); });

  // ---------- city road network (the finale) ----------
  const cityCol = theme === "dark"
    ? `vec3 col = vec3(.055,.07,.055)*road + uCol*lit*.32;`
    : `vec3 col = mix(vec3(.3,.32,.29), vec3(.22,.58,.1), clamp(lit*1.8,0.,1.)); col = mix(col, vec3(.2,.5,.12), smoothstep(.02,0.,d));`;
  const cityLit = theme === "dark" ? `(.45+.9*wave+.35*flick)` : `(.18+1.1*wave+.25*flick)`;
  const mapMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uMap: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uCol: { value: HOT.clone() }, uAsp: { value: 1.886 }, uOrigin: { value: new THREE.Vector2(0.4932, 0.4917) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D uMap; uniform float uT,uA,uAsp; uniform vec3 uCol; uniform vec2 uOrigin; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      void main(){
        float road = texture2D(uMap, vUv).r;${theme === "dark" ? " road = smoothstep(.5,.9,road);" : ""}
        vec2 p = (vUv-uOrigin)*vec2(uAsp,1.);
        float d = length(p);
        float R = 0.06 + uT*0.22; float reach = smoothstep(R+0.03, R-0.1, d);
        float wave = pow(.5+.5*sin(d*70.-uT*5.),6.);
        float flick = n(vUv*vec2(240.,130.)+vec2(uT*1.5,0.));
        float lit = road*reach*${cityLit};
        float edge = 1.-smoothstep(.36,.5,max(abs(vUv.x-.5),abs(vUv.y-.5)*1.));
        ${cityCol}
        gl_FragColor = vec4(col, uA*edge*${theme === "dark" ? "smoothstep(.5,.06,d)*(road*.3+.015)" : "(road*.95+.03)"}); }`,
  });
  const MAP_W = 360, MAP_H = MAP_W / 1.886;
  const mapPlane = new THREE.Mesh(new THREE.PlaneGeometry(MAP_W, MAP_H), mapMat);
  mapPlane.rotation.x = -Math.PI / 2; mapPlane.position.set(0, -0.02, 0); scene.add(mapPlane);
  let mapReady = Promise.resolve();
  if (mapUrl) mapReady = new Promise((res) => new THREE.TextureLoader().load(mapUrl, (t) => { t.anisotropy = 8; mapMat.uniforms.uMap.value = t; res(); }, undefined, () => res()));
  mapPlane.visible = false;

  // ---------- finale: the camera pulls back and hundreds of plates fly out to spell REPS ----------
  const LOGO_W = 92, PITCH = 0.62;
  const logoGroup = new THREE.Group(); logoGroup.visible = false; scene.add(logoGroup);
  let tiles = null;
  const street = [road, marks, kerb, pavement, plate, ripple, cab, bat, linkMesh, outGroup, strip, ...tubes.map((tb) => tb.mesh)];
  if (logoUrl) {
    const img = new Image();
    img.onload = () => {
      const W = 600, H = Math.round((W * 416) / 1856);
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const g = c.getContext("2d"); g.drawImage(img, 0, 0, W, H);
      const data = g.getImageData(0, 0, W, H).data;
      const sc = LOGO_W / W, stepPx = PITCH / sc, pts = [];
      for (let y = stepPx / 2; y < H; y += stepPx) for (let x = stepPx / 2; x < W; x += stepPx) {
        if (data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 140) pts.push([(x - W / 2) * sc, (y - H / 2) * sc]);
      }
      const n = pts.length;
      const tileMat = theme === "dark"
        ? new THREE.MeshStandardMaterial({ color: "#2a2e2a", metalness: 0.85, roughness: 0.32, envMapIntensity: 1.8 })
        : new THREE.MeshStandardMaterial({ color: "#3a3f3a", metalness: 0.6, roughness: 0.35, envMapIntensity: 1.2 });
      const tileGeo = new RoundedBoxGeometry(PITCH * 0.86, 0.12, PITCH * 0.86, 1, 0.03);
      const lightGeo = new THREE.PlaneGeometry(PITCH * 0.66, PITCH * 0.66); lightGeo.rotateX(-Math.PI / 2);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
      const mesh = new THREE.InstancedMesh(tileGeo, tileMat, n), glowM = new THREE.InstancedMesh(lightGeo, lightMat, n);
      const maxD = Math.hypot(LOGO_W / 2, (H * sc) / 2);
      const start = [], end = [], delay = [];
      pts.forEach(([x, z]) => {
        start.push([(Math.random() - 0.5) * PLATE_L, (Math.random() - 0.5) * PLATE_W]);
        end.push([x, z]);
        delay.push((Math.hypot(x, z) / maxD) * 0.55 + Math.random() * 0.12);
      });
      logoGroup.add(mesh, glowM);
      tiles = { n, mesh, glowM, start, end, delay };
    };
    img.src = logoUrl;
  }
  const tDummy = new THREE.Object3D();
  function writeTiles(form) {
    if (!tiles) return;
    const { n, mesh, glowM, start, end, delay } = tiles;
    for (let i = 0; i < n; i++) {
      const local = Math.min(1, Math.max(0, (form * 1.7 - delay[i]) / 1.0));
      const e = 1 - Math.pow(1 - local, 3);
      const [sx, sz] = start[i], [ex, ez] = end[i];
      const lift = Math.sin(local * Math.PI) * (4 + delay[i] * 6);
      const s = 0.25 + 0.75 * e;
      tDummy.position.set(lerp(sx, ex, e), 0.06 + lift, lerp(sz, ez, e));
      tDummy.rotation.set(0, (1 - e) * (delay[i] * 9), 0);
      tDummy.scale.set(s, s, s); tDummy.updateMatrix(); mesh.setMatrixAt(i, tDummy.matrix);
      tDummy.position.y += 0.065; tDummy.updateMatrix(); glowM.setMatrixAt(i, tDummy.matrix);
      const wave = Math.pow(0.5 + 0.5 * Math.sin(ex * 0.16 - ez * 0.08 - t * 2.2), 5);
      const land = local > 0.92 ? (1 - local) * 12 : 0;
      tmpCol.copy(GREEN).multiplyScalar((0.75 + 1.8 * wave + land) * (0.15 + 0.85 * e));
      glowM.setColorAt(i, tmpCol);
    }
    mesh.instanceMatrix.needsUpdate = true; glowM.instanceMatrix.needsUpdate = true; if (glowM.instanceColor) glowM.instanceColor.needsUpdate = true;
  }

  // ---------- soft daylight shadows (light theme) ----------
  if (T.shadows) {
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    key.castShadow = true; key.shadow.mapSize.set(quality > 0.7 ? 2048 : 1024, quality > 0.7 ? 2048 : 1024);
    Object.assign(key.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, far: 60 });
    key.shadow.bias = -0.0004; key.shadow.radius = 6; key.position.set(-10, 18, 12); key.intensity = 1.6;
    scene.traverse((o) => { if (o.isMesh && o.material && !o.material.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; } });
  }

  // ---------- post ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // guard: a single NaN/inf pixel (tiny specular on some GPUs) gets smeared by the bloom mip chain into a black square
  composer.addPass(new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
      void main(){ vec4 c = texture2D(tDiffuse, vUv);
        if (any(isnan(c)) || any(isinf(c))) c = vec4(0., 0., 0., 1.);
        gl_FragColor = vec4(clamp(c.rgb, 0., 64.), c.a); }`,
  }));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), ...T.bloom);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grain = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uV: { value: T.vignette }, uG: { value: theme === "dark" ? 0.035 : 0.018 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uT,uV,uG; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec4 c=texture2D(tDiffuse,vUv); float g=h(vUv*1000.+uT)-.5; vec2 q=vUv-.5; float v=1.-dot(q,q)*uV*2.;
        gl_FragColor=vec4(c.rgb*v+g*uG,1.); }`,
  });
  composer.addPass(grain);
  // smooth edges (the bloom chain bypasses the canvas antialiasing)
  if (quality > 0.7) composer.addPass(new SMAAPass(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight));

  // ---------- camera path ----------
  const shots = (finale ? [...SHOTS[theme].slice(0, 6), finale] : SHOTS[theme]).map((s) => ({ p: new THREE.Vector3(...s.p), t: new THREE.Vector3(...s.t), fov: s.fov }));
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3(), off = new THREE.Vector3();
  let progress = startProgress, smoothProg = startProgress;
  function shotAt(pr) {
    const f = pr * (shots.length - 1); const i = Math.min(shots.length - 2, Math.floor(f)); let u = f - i; u = u * u * (3 - 2 * u);
    const a = shots[i], b = shots[i + 1];
    tmpP.copy(a.p).lerp(b.p, u); tmpT.copy(a.t).lerp(b.t, u);
    // the long rise to the city reads as a crane shot, not a zoom
    if (i === shots.length - 2) { tmpP.copy(a.p).lerp(b.p, u * u); tmpT.copy(a.t).lerp(b.t, Math.sqrt(u)); }
    return lerp(a.fov, b.fov, u);
  }

  // ---------- simulation ----------
  let truckX = -48, speed = 16, braking = 0, nextTruck = 0.6, energy = 0, convSpin = 0, storeLevel = 0.08, outOn = 0;
  const pointer = new THREE.Vector2(), pointerS = new THREE.Vector2();
  let manualBrake = false, surge = 0;
  const clock = new THREE.Clock();
  let t = 0, running = true, visible = true, raf = 0;
  const E = T.emissive;

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
    if (!(truckX > 70 && nextTruck > 0)) {
      const nose = truckX + 1.2;
      const wantBrake = (nose > -16 && nose < PLATE_L / 2 + 10) ? 1 : 0;
      braking = lerp(braking, Math.max(wantBrake, manualBrake ? 1 : 0), 1 - Math.exp(-dt * 4));
      // holding the brake: the truck rolls slowly across the plate and almost stops on it
      const target = manualBrake ? (nose < PLATE_L / 2 + 3 ? 2.4 : 0.35) : wantBrake ? 5.5 : 14;
      speed = lerp(speed, target, 1 - Math.exp(-dt * (manualBrake ? 2.4 : wantBrake ? 1.2 : 0.6)));
      truckX += speed * dt;
      if (truckX > 70) nextTruck = 0.8 + Math.random() * 0.8;
    }
    truck.position.x = truckX;
    wheels.forEach((w) => { w.children[0].rotation.z -= (speed * dt) / 0.5; w.children[1].rotation.z = w.children[0].rotation.z; });
    brakeMat.color.setRGB(1, 0.22, 0.18).multiplyScalar(0.6 + braking * (manualBrake ? 7 : 4));
    brakeGlow.intensity = braking * (manualBrake ? 5 : 1.5);

    // triggers respond to wheel contact (only when the truck is in the scene)
    for (const tr of triggers) {
      let p = 0;
      if (truck.visible) for (const ax of AXLES) { const d = Math.abs(truckX + ax - tr.x); p = Math.max(p, smooth(0.55, 0.05, d)); }
      tr.press = lerp(tr.press, p, 1 - Math.exp(-dt * 22));
      if (tr.press > 0.6 && tr.armed) { tr.armed = false; fireTrigger(tr); }
      if (tr.press < 0.2) tr.armed = true;
      if (tr.burstAt && t >= tr.burstAt) { tr.burstAt = 0; tr.kick = 1; fireTrigger(tr); }
      tr.kick = Math.max(0, (tr.kick || 0) - dt * 3); tr.press = Math.max(tr.press, tr.kick * 0.8);
      tr.heat = Math.max(0, tr.heat - dt * 1.4);
    }
    surge = Math.max(0, surge - dt * 0.5);
    writeTriggers();
    rippleMat.uniforms.uTime.value = t;

    // pulses along tubes → converter
    let arrived = 0;
    for (const tb of tubes) {
      tb.pulses = tb.pulses.map((p) => p + dt * 0.75).filter((p) => { if (p > 1.15) { arrived++; return false; } return true; });
      tb.mat.uniforms.uP.value.set(tb.pulses[0] ?? -1, tb.pulses[1] ?? -1, tb.pulses[2] ?? -1, tb.pulses[3] ?? -1);
    }
    convSpin = Math.min(1.6, convSpin + arrived * 0.06) * Math.exp(-dt * 0.35);
    rotor.rotation.x += dt * (0.4 + convSpin * 9);
    ringMat.emissiveIntensity = E.base + convSpin * E.ring; shaft.material.emissiveIntensity = E.base + convSpin * E.shaft;
    copper.emissiveIntensity = convSpin * 0.35; innerGlow.intensity = (theme === "dark" ? 1.6 : 0.6) + convSpin * 4;
    haloMat.opacity = E.halo[0] + convSpin * E.halo[1];
    rotor.position.y = 1.25 + Math.sin(t * 2.1) * 0.012;
    cabGlow.intensity = convSpin * 6;
    if (arrived && link.pulses.length < 4 && Math.random() < 0.35) link.pulses.push(0);
    link.pulses = link.pulses.map((p) => p + dt * 0.6).filter((p) => { if (p > 1.15) { storeLevel = Math.min(1, storeLevel + 0.035); return false; } return true; });
    link.mat.uniforms.uP.value.set(link.pulses[0] ?? -1, link.pulses[1] ?? -1, link.pulses[2] ?? -1, link.pulses[3] ?? -1);
    storeLevel = Math.max(0.08 + smooth(0.5, 0.68, smoothProg) * 0.6, storeLevel - dt * 0.012);
    segs.forEach((col, c) => {
      const f = Math.min(1, Math.max(0.06, storeLevel * 1.25 - c * 0.05)), lvl = f * N_SEG;
      liquids[c].scale.y = lerp(liquids[c].scale.y, f * 1.26, 1 - Math.exp(-dt * 3));
      surfaces[c].position.y = 0.185 + liquids[c].scale.y + Math.sin(t * 2 + c) * 0.004;
      col.forEach((m, k) => {
        if (k < lvl - 1) m.material.color.copy(GREEN).multiplyScalar((theme === "dark" ? 1.25 : 1) * (0.8 + 0.2 * Math.sin(t * 2.4 - k * 0.7)));
        else if (k < lvl) m.material.color.copy(GREEN).multiplyScalar((theme === "dark" ? 1.7 : 1.2) * (0.5 + 0.5 * Math.sin(t * 5 + c)));
        else m.material.color.copy(LED_OFF);
      });
    });
    boltMat.emissiveIntensity = 0.3 + storeLevel * 1.6 + convSpin * 0.3;
    glow.intensity = triggers.reduce((a, b) => a + b.heat, 0) * E.glow;

    // outputs come alive as storage fills
    outOn = lerp(outOn, Math.max(smooth(0.15, 0.6, storeLevel), surge), 1 - Math.exp(-dt * 2));
    lamps.forEach((l, i) => l.material.color.copy(GREEN).multiplyScalar(0.05 + smooth(i * 0.12, i * 0.12 + 0.3, outOn) * 3));
    chargerLight.material.color.copy(GREEN).multiplyScalar(0.1 + outOn * 2.5 * (0.7 + 0.3 * Math.sin(t * 3)));
    stripMat.uniforms.uT.value = t; stripMat.uniforms.uOn.value = outOn * 1.05;

    // camera
    smoothProg = lerp(smoothProg, progress, 1 - Math.exp(-dt * 3.2));
    const fov = shotAt(smoothProg);
    pointerS.lerp(pointer, 1 - Math.exp(-dt * 3));
    const city = smooth(0.84, 0.97, smoothProg);
    const par = 1 - smooth(0.75, 0.95, smoothProg);
    const amp = 0.6 * par + drift * city;
    off.set(pointerS.x * amp, pointerS.y * amp * 0.6, 0);
    camera.position.copy(tmpP).add(off); camera.lookAt(tmpT);
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    // finale: the street falls away, the plates spell REPS over the city network
    const form = tiles ? smooth(0.86, 0.995, smoothProg) : 0;
    logoGroup.visible = form > 0.001;
    if (form > 0.001) writeTiles(form);
    const streetOn = form < 0.2;
    if (tiles) { street.forEach((o) => { o.visible = streetOn; }); truck.visible = truckOn && streetOn; }
    // portrait screens: pull the lens back until the whole word fits
    if (tiles) {
      const dist = camera.position.length();
      const fit = (2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect) / (LOGO_W * 1.15);
      const z = lerp(baseZoom, Math.min(baseZoom, fit), city);
      if (Math.abs(camera.zoom - z) > 0.002) { camera.zoom = z; camera.updateProjectionMatrix(); }
    }
    mapPlane.visible = city > 0.001;
    mapMat.uniforms.uA.value = city; mapMat.uniforms.uT.value = city > 0 ? mapMat.uniforms.uT.value + dt : 0;
    roadMat.opacity = 1 - city * 0.92; pavement.material.opacity = 1 - city;
    marks.visible = city < 0.6;
    scene.fog.density = lerp(T.fog[0], T.fog[1], smooth(0.8, 0.95, smoothProg));
    bloom.strength = lerp(T.bloom[0], T.bloomCity, city);
    grain.uniforms.uT.value = t;
  }

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (!visible) { clock.getDelta(); return; }
    step(Math.min(clock.getDelta(), 1 / 20));
    composer.render();
  }

  let baseZoom = 1;
  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    bloom.resolution.set(w * 0.5, h * 0.5);
    camera.aspect = w / h;
    // keep the plate framed on portrait screens
    baseZoom = w / h < 0.8 ? 0.62 : w / h < 1.2 ? 0.82 : 1;
    camera.zoom = baseZoom;
    camera.updateProjectionMatrix();
  }
  resize();
  // settle the simulation a little so the first frame isn't empty
  for (let i = 0; i < 90; i++) step(1 / 60);
  frame();

  return {
    ready: mapReady,
    setProgress(p) { progress = Math.min(1, Math.max(0, p)); },
    /** jump straight to a shot without the smoothing (e.g. on first layout) */
    jump(p) { progress = smoothProg = Math.min(1, Math.max(0, p)); },
    setPointer(x, y) { pointer.set(x, y); },
    setBrake(on) {
      manualBrake = on;
      // no truck near the plate? send one in so the brake always does something
      if (on && (truckX > PLATE_L / 2 || truckX < -34)) { truckX = -24; speed = 9; nextTruck = 0; }
    },
    /** a full brake: every trigger pair fires in a wave down the plate and the outputs surge */
    burst() {
      triggers.forEach((tr) => { tr.burstAt = t + ((tr.x + PLATE_L / 2) / PLATE_L) * 0.7 + (tr.z > 0 ? 0.04 : 0); });
      surge = 1; convSpin = Math.min(1.6, convSpin + 0.8);
    },
    setTruck(on) { truckOn = on; truck.visible = on; },
    setVisible(v) { visible = v; },
    resize,
    get energy() { return energy; },
    dispose() {
      running = false; cancelAnimationFrame(raf);
      scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => { Object.values(mm).forEach((v) => v?.isTexture && v.dispose()); mm.dispose(); }); });
      env.dispose(); pmrem.dispose(); composer.dispose?.(); renderer.dispose();
    },
  };
}
