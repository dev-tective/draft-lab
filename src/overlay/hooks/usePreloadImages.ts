// hooks/useImagesLoaded.ts
import { useEffect, useState, useRef } from "react";

export function useImagesLoaded(deps: unknown[]) {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(false);

    // Espera un tick para que React renderice las imágenes en el DOM
    const timeout = setTimeout(() => {
      const imgs = containerRef.current?.querySelectorAll("img") ?? [];
      if (imgs.length === 0) {
        setReady(true);
        return;
      }

      let pending = imgs.length;
      const done = () => {
        pending--;
        if (pending === 0) setReady(true);
      };

      imgs.forEach((img) => {
        if (img.complete) {
          done();
        } else {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }
      });
    }, 50); // pequeño tick para que React pinte

    return () => clearTimeout(timeout);
  }, deps);

  return { ready, containerRef };
}
