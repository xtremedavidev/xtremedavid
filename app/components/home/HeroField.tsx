"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Hero: thousands of particles fly in and assemble the name.
 * The cursor pushes them away in a swirl, they spring back home.
 * Click anywhere on the hero to send a shockwave.
 */
const LINES = ["DAVID", "ADEBAYO"];

export default function HeroField() {
  const lines = LINES;
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);

    let W = 0;
    let H = 0;
    let count = 0;
    let home = new Float32Array(0);
    let pos = new Float32Array(0);
    let vel = new Float32Array(0);
    let seed = new Float32Array(0);
    let geo: THREE.BufferGeometry | null = null;
    let points: THREE.Points | null = null;

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uSize: { value: 2 * renderer.getPixelRatio() }, uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aHeat;
        uniform float uSize;
        uniform float uTime;
        varying float vSeed;
        varying float vHeat;
        void main(){
          vSeed = aSeed; vHeat = aHeat;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * (0.8 + aSeed * 0.5 + aHeat * 1.6);
        }`,
      fragmentShader: /* glsl */ `
        varying float vSeed;
        varying float vHeat;
        uniform float uTime;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          vec3 bone = vec3(0.94, 0.93, 0.90);
          vec3 lime = vec3(0.78, 1.0, 0.0);
          float accent = step(0.975, vSeed);
          float tw = 0.75 + 0.25 * sin(uTime * 2.0 + vSeed * 40.0);
          vec3 col = mix(bone, lime, clamp(accent + vHeat * 1.6, 0.0, 1.0));
          gl_FragColor = vec4(col, (1.0 - d * 1.6) * tw);
        }`,
    });

    const sampleText = () => {
      const c = document.createElement("canvas");
      const ctx = c.getContext("2d")!;
      const mobile = W < 720;
      const step = mobile ? 3 : W > 1700 ? 4 : 3;
      c.width = W;
      c.height = H;
      // Fit lines to width
      const maxW = W * (mobile ? 0.9 : 0.86);
      let fs = 400;
      ctx.font = `800 ${fs}px Geist, "Helvetica Neue", Arial, sans-serif`;
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      fs = Math.min(fs * (maxW / widest), mobile ? 120 : H * 0.24);
      ctx.font = `800 ${fs}px Geist, "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      const lh = fs * 0.86;
      const blockH = lh * lines.length;
      const top = mobile ? 92 : H * 0.11;
      const left = mobile ? W * 0.05 : W * 0.07;
      lines.forEach((l, i) => {
        // letter-spacing via manual draw
        let x = left;
        for (const ch of l) {
          ctx.fillText(ch, x, top + lh * (i + 1) - fs * 0.1);
          x += ctx.measureText(ch).width - fs * 0.04;
        }
      });
      void blockH;
      const data = ctx.getImageData(0, 0, W, H).data;
      const pts: number[] = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 128) pts.push(x + (Math.random() - 0.5) * step * 0.6, y + (Math.random() - 0.5) * step * 0.6);
        }
      }
      return pts;
    };

    const build = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      renderer.setSize(W, H, false);
      camera.left = 0;
      camera.right = W;
      camera.top = 0;
      camera.bottom = H;
      camera.updateProjectionMatrix();

      const pts = sampleText();
      const dust = Math.round(pts.length * 0.05);
      count = pts.length / 2 + dust;
      home = new Float32Array(count * 3);
      pos = new Float32Array(count * 3);
      vel = new Float32Array(count * 3);
      seed = new Float32Array(count);
      const heat = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        let hx: number, hy: number;
        if (i < pts.length / 2) {
          hx = pts[i * 2];
          hy = pts[i * 2 + 1];
        } else {
          hx = Math.random() * W;
          hy = Math.random() * H;
        }
        home[i * 3] = hx;
        home[i * 3 + 1] = hy;
        // start scattered in a ring outside view
        const a = Math.random() * Math.PI * 2;
        const r = Math.max(W, H) * (0.6 + Math.random() * 0.6);
        pos[i * 3] = reduce ? hx : W / 2 + Math.cos(a) * r;
        pos[i * 3 + 1] = reduce ? hy : H / 2 + Math.sin(a) * r;
        seed[i] = Math.random();
      }
      if (points) scene.remove(points);
      geo?.dispose();
      geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      geo.setAttribute("aHeat", new THREE.BufferAttribute(heat, 1));
      points = new THREE.Points(geo, mat);
      scene.add(points);
    };

    // Wait for the Geist font so sampling uses it
    let built = false;
    const doBuild = () => {
      build();
      built = true;
    };
    (document.fonts?.load('800 100px "Geist"') ?? Promise.resolve()).finally(doBuild);

    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999 };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    let shock = { x: 0, y: 0, t: -1 };
    const onDown = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      shock = { x: e.clientX - r.left, y: e.clientY - r.top, t: 0 };
    };
    const section = wrap.parentElement!;
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    section.addEventListener("pointerdown", onDown);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap);

    let resizeT: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        if (Math.abs(wrap.clientWidth - W) > 40 || Math.abs(wrap.clientHeight - H) > 120) build();
      }, 200);
    };
    addEventListener("resize", onResize);

    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || !built || !geo) return;
      const t = (now - t0) / 1000;
      mat.uniforms.uTime.value = t;
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      const R = Math.min(W, 1400) * 0.11;
      const heatAttr = geo.getAttribute("aHeat") as THREE.BufferAttribute;
      const heat = heatAttr.array as Float32Array;
      if (shock.t >= 0) shock.t += 1 / 60;
      const shockR = shock.t * 1400;
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const x = pos[ix];
        const y = pos[ix + 1];
        // spring home (with gentle idle drift)
        const hx = home[ix] + Math.sin(t * 0.8 + seed[i] * 20) * 1.2;
        const hy = home[ix + 1] + Math.cos(t * 0.7 + seed[i] * 30) * 1.2;
        let ax = (hx - x) * 0.03;
        let ay = (hy - y) * 0.03;
        // cursor: swirl + repel
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const d2 = dx * dx + dy * dy;
        let h = heat[i] * 0.94;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) + 0.001;
          const f = (1 - d / R) ** 2;
          ax += (dx / d) * f * 6 + (-dy / d) * f * 3.5 + mouse.vx * f * 0.25;
          ay += (dy / d) * f * 6 + (dx / d) * f * 3.5 + mouse.vy * f * 0.25;
          h = Math.max(h, f);
        }
        if (shock.t >= 0 && shock.t < 1.2) {
          const sx = x - shock.x;
          const sy = y - shock.y;
          const sd = Math.sqrt(sx * sx + sy * sy) + 0.001;
          const band = Math.abs(sd - shockR);
          if (band < 60) {
            const f = (1 - band / 60) * 9 * (1 - shock.t / 1.2);
            ax += (sx / sd) * f;
            ay += (sy / sd) * f;
            h = Math.max(h, 0.8);
          }
        }
        heat[i] = h;
        vel[ix] = (vel[ix] + ax) * 0.84;
        vel[ix + 1] = (vel[ix + 1] + ay) * 0.84;
        pos[ix] = x + vel[ix];
        pos[ix + 1] = y + vel[ix + 1];
      }
      (geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
      heatAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", onResize);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("pointerdown", onDown);
      geo?.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [lines]);

  return <div ref={wrapRef} style={{ position: "absolute", inset: 0 }} aria-hidden="true" />;
}
