import { useEffect, useRef } from "react";
import "./vanta-birds.css";

type VantaEffect = { destroy?: () => void };
type VantaWindow = Window & {
  THREE?: unknown;
  VANTA?: {
    BIRDS?: (options: Record<string, unknown>) => VantaEffect;
  };
};

const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const BIRDS_SRC = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-vanta-src="${src}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Could not load ${src}`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.vantaSrc = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      script.remove();
      reject(new Error(`Could not load ${src}`));
    };
    document.head.appendChild(script);
  });
}

export default function VantaBirdsBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let effect: VantaEffect | undefined;

    const initialise = async () => {
      try {
        const scope = window as VantaWindow;
        if (!scope.THREE) await loadScript(THREE_SRC);
        if (!scope.VANTA?.BIRDS) await loadScript(BIRDS_SRC);
        if (disposed || !hostRef.current || !scope.VANTA?.BIRDS) return;

        effect = scope.VANTA.BIRDS({
          el: hostRef.current,
          THREE: scope.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 0.65,
          backgroundAlpha: 0,
          color1: 0x0f766e,
          color2: 0x7c3aed,
          colorMode: "lerp",
          birdSize: 0.8,
          wingSpan: 18,
          speedLimit: 3,
          separation: 55,
          alignment: 45,
          cohesion: 35,
          quantity: 2,
        });
      } catch {
        // The existing background remains in place if a third-party CDN is unavailable.
      }
    };

    void initialise();
    return () => {
      disposed = true;
      effect?.destroy?.();
    };
  }, []);

  return <div ref={hostRef} className="vanta-birds-background" aria-hidden="true" />;
}
