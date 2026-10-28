import { useEffect, useRef } from "react";

declare global {
  interface Window {
    VANTA?: { BIRDS: (options: Record<string, unknown>) => { destroy: () => void } };
    THREE?: unknown;
  }
}

const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const VANTA_BIRDS_SRC = "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.birds.min.js";

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

export default function VantaBirdsBreakBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: { destroy: () => void } | undefined;
    let cancelled = false;
    void (async () => {
      try {
        await loadScript(THREE_SRC);
        await loadScript(VANTA_BIRDS_SRC);
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
          scaleMobile: 1,
          birdSize: 2.5,
          wingSpan: 17,
          separation: 64,
          alignment: 25,
          cohesion: 49,
          backgroundColor: 0x071312,
          color1: 0x55e6b0,
          color2: 0xf2c94c,
          colorMode: "lerpGradient",
        });
      } catch (error) {
        console.error("Bio Break Vanta BIRDS background failed to initialize:", error);
      }
    })();

    return () => { cancelled = true; effect?.destroy(); };
  }, []);

  return <div className="vanta-birds-break-background" ref={hostRef} aria-hidden="true" />;
}
