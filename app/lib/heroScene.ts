/* Three.js Hero Particle Field — Enhanced cursor interaction */
export function initHeroScene() {
  const THREE = (window as any).THREE;
  if (!THREE) return;

  const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const count = 1500;
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const isAccent = new Uint8Array(count);
  const drifts = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 14;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 8;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    basePositions[i * 3] = x;
    basePositions[i * 3 + 1] = y;
    basePositions[i * 3 + 2] = z;

    const accent = Math.random() < 0.05;
    isAccent[i] = accent ? 1 : 0;
    if (accent) {
      colors[i * 3] = 200 / 255;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 0;
    } else {
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }
    phases[i] = Math.random() * Math.PI * 2;
    drifts[i * 3] = (Math.random() - 0.5) * 0.002;
    drifts[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
    drifts[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 2,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Mouse tracking in NDC
  let mouseNDC = new THREE.Vector2(9999, 9999);
  let mouseWorld = new THREE.Vector3(0, 0, 0);
  const raycaster = new THREE.Raycaster();
  const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  window.addEventListener("mousemove", (e) => {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    // Project mouse to world space on z=0 plane
    raycaster.setFromCamera(mouseNDC, camera);
    raycaster.ray.intersectPlane(mousePlane, mouseWorld);
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let frame = 0;
  const repulsionRadius = 2.5;
  const repulsionStrength = 0.08;

  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Natural drift
      basePositions[i * 3] += drifts[i * 3];
      basePositions[i * 3 + 1] += drifts[i * 3 + 1];
      basePositions[i * 3 + 2] += drifts[i * 3 + 2];

      if (Math.abs(basePositions[i * 3]) > 7) drifts[i * 3] *= -1;
      if (Math.abs(basePositions[i * 3 + 1]) > 5) drifts[i * 3 + 1] *= -1;
      if (Math.abs(basePositions[i * 3 + 2]) > 4) drifts[i * 3 + 2] *= -1;

      // Mouse repulsion — project-based
      const dx = basePositions[i * 3] - mouseWorld.x;
      const dy = basePositions[i * 3 + 1] - mouseWorld.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < repulsionRadius && dist > 0.01) {
        const force = (1 - dist / repulsionRadius) * repulsionStrength;
        pos[i * 3] = basePositions[i * 3] + (dx / dist) * force * 3;
        pos[i * 3 + 1] = basePositions[i * 3 + 1] + (dy / dist) * force * 3;
      } else {
        // Lerp back smoothly
        pos[i * 3] += (basePositions[i * 3] - pos[i * 3]) * 0.08;
        pos[i * 3 + 1] += (basePositions[i * 3 + 1] - pos[i * 3 + 1]) * 0.08;
      }
      pos[i * 3 + 2] = basePositions[i * 3 + 2];

      // Accent pulse
      if (isAccent[i]) {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.02 + phases[i]);
        col[i * 3 + 1] = pulse;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    points.rotation.y += 0.00015;
    renderer.render(scene, camera);
  }
  animate();

  return { camera, renderer };
}
