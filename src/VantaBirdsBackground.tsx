import { useEffect, useRef } from "react";
import "./vanta-birds.css";

declare global {
  interface Window {
    VANTA?: { BIRDS: (options: Record<string, unknown>) => { destroy: () => void } };
    THREE?: unknown;
  }
}

const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const VANTA_SRC = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded === "true") return resolve();
    const script = existing ?? document.createElement("script");
    const onLoad = () => { script.dataset.loaded = "true"; resolve(); };
    const onError = () => reject(new Error(`Could not load animation script: ${src}`));
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!existing) { script.src = src; script.async = true; document.head.appendChild(script); }
  });
}

export default function VantaBirdsBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: { destroy: () => void } | undefined;
    let cancelled = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    void (async () => {
      try {
        await loadScript(THREE_SRC);
        await loadScript(VANTA_SRC);
        if (cancelled || !hostRef.current || !window.VANTA?.BIRDS) return;
        effect = window.VANTA.BIRDS({
          el: hostRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 0.65,
          backgroundAlpha: 0,
          color1: 0x22f0c3,
          color2: 0xa78bfa,
          birdSize: 1.25,
          wingSpan: 18,
          speedLimit: 4,
          separation: 42,
          alignment: 32,
          cohesion: 28,
          quantity: window.innerWidth < 640 ? 3.5 : 6,
        });
      } catch {
        // Keep the existing background if the optional animation cannot load.
      }
    })();

    return () => { cancelled = true; effect?.destroy(); };
  }, []);

  return <div className="vanta-birds-background" ref={hostRef} aria-hidden="true" />;
}
