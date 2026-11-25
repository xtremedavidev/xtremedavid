"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { concepts, posterOf } from "@/app/lib/concepts";
import s from "./home.module.css";

/**
 * A WebGL ring of every concept homepage. It turns on its own, can be
 * dragged/flicked, and the front-most concept is described underneath,
 * so a visitor sees all of them without clicking anything.
 */
const ITEMS = [...concepts].sort((a, b) => b.showcase.order - a.showcase.order);

export default function ConceptRing() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const api = useRef<{ go: (dir: number) => void } | null>(null);
  const items = ITEMS;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    wrap.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.3, 9);
    camera.lookAt(0, 0, 0);

    const n = items.length;
    const PW = 2.6;
    const PH = PW * (900 / 1440);
    const R = (n * PW * 1.12) / (Math.PI * 2);
    const ring = new THREE.Group();
    ring.rotation.x = 0.05;
    scene.add(ring);

    const loader = new THREE.TextureLoader();
    const geo = new THREE.PlaneGeometry(PW, PH, 24, 1);
    // bend each plane to follow the ring's curvature
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const a = x / R;
      p.setX(i, Math.sin(a) * R);
      p.setZ(i, Math.cos(a) * R - R);
    }
    p.needsUpdate = true;

    const posters: THREE.Texture[] = [];
    const meshes: THREE.Mesh[] = items.map((c, i) => {
      const tex = loader.load(posterOf(c));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      posters.push(tex);
      const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true });
      const m = new THREE.Mesh(geo, mat);
      const a = (i / n) * Math.PI * 2;
      m.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
      m.rotation.y = a;
      m.userData.i = i;
      ring.add(m);
      return m;
    });

    // The concept in front plays its scroll-through clip as a live texture
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    const vtex = new THREE.VideoTexture(video);
    vtex.colorSpace = THREE.SRGBColorSpace;
    let playing = -1;
    const playFront = (i: number) => {
      if (playing === i) return;
      if (playing >= 0) (meshes[playing].material as THREE.MeshBasicMaterial).map = posters[playing];
      playing = i;
      const src = items[i].showcase.video;
      if (!src || reduce) return;
      video.src = src;
      const onReady = () => {
        if (playing !== i) return;
        const m = meshes[i].material as THREE.MeshBasicMaterial;
        m.map = vtex;
        m.needsUpdate = true;
      };
      video.addEventListener("playing", onReady, { once: true });
      video.play().catch(() => {});
    };

    let W = 0;
    let H = 0;
    const resize = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.position.z = R + (W < 720 ? 5.2 : W < 1100 ? 5 : 4.4);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };
    resize();
    addEventListener("resize", resize);

    // rotation state
    let rot = 0;
    let target = 0;
    let vel = 0;
    let dragging = false;
    let lastX = 0;
    let downX = 0;
    let idle = 0;
    const step = (Math.PI * 2) / n;

    const go = (dir: number) => {
      target = Math.round(target / step) * step - dir * step;
      idle = 0;
    };
    api.current = { go };

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hover = -1;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = downX = e.clientX;
      vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      target += dx * 0.006;
      vel = dx * 0.006;
      idle = 0;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(e.clientX - downX) < 5 && hover >= 0) {
        window.open(`/concept/${items[hover].id}`, "_blank", "noopener");
        return;
      }
      target += vel * 12;
      target = Math.round(target / step) * step;
    };
    const onLeave = () => {
      ndc.set(9, 9);
      dragging = false;
    };
    const el = renderer.domElement;
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible) video.pause();
      else if (playing >= 0 && video.src) video.play().catch(() => {});
    });
    io.observe(wrap);

    let raf = 0;
    let lastActive = -1;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      idle += dt;
      if (!dragging && !reduce && hover < 0 && idle > 7) {
        target -= step;
        idle = 0;
      }
      rot += (target - rot) * (dragging ? 0.35 : 0.06);
      ring.rotation.y = rot;

      // front-most index
      const norm = ((-rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const idx = Math.round(norm / step) % n;
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
        playFront(idx);
      }

      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(meshes, false)[0];
      hover = hit ? (hit.object.userData.i as number) : -1;
      el.style.cursor = hover >= 0 ? "pointer" : dragging ? "grabbing" : "grab";

      meshes.forEach((m, i) => {
        const world = new THREE.Vector3();
        m.getWorldPosition(world);
        const facing = (world.z + R) / (2 * R); // 0 back .. 1 front
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.18 + facing * 0.82;
        const sc = i === idx ? 1.06 : i === hover ? 1.03 : 1;
        m.scale.lerp(new THREE.Vector3(sc, sc, sc), 0.12);
      });
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", resize);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onLeave);
      video.pause();
      video.removeAttribute("src");
      vtex.dispose();
      posters.forEach((t) => t.dispose());
      meshes.forEach((m) => (m.material as THREE.MeshBasicMaterial).dispose());
      geo.dispose();
      renderer.dispose();
      el.remove();
    };
  }, [items]);

  const c = items[active];

  return (
    <div className={s.ring}>
      <div ref={wrapRef} className={s.ringStage} />
      <div className={s.ringInfo}>
        <div className={s.ringCount}>
          <strong>{String(active + 1).padStart(2, "0")}</strong>
          <span>/ {String(items.length).padStart(2, "0")}</span>
        </div>
        <div className={s.ringText} key={c.id}>
          <p className={s.ringMeta}>
            {c.showcase.industry} · {c.variant ? `${c.variant} version` : "Homepage concept"} · {c.showcase.year}
          </p>
          <h3>{c.showcase.brand}</h3>
          <p>{c.showcase.pitch}</p>
          <ul>
            {c.showcase.techniques.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className={s.ringCtas}>
          <button onClick={() => api.current?.go(-1)} aria-label="Previous concept" data-cursor="hover">
            ←
          </button>
          <button onClick={() => api.current?.go(1)} aria-label="Next concept" data-cursor="hover">
            →
          </button>
          <a href={`/concept/${c.id}`} target="_blank" rel="noopener" className={s.btnLime} data-cursor="hover">
            Open live site ↗
          </a>
        </div>
      </div>
    </div>
  );
}
