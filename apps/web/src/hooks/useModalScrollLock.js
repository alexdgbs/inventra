import { useEffect } from "react";

let lockCount = 0;
let scrollY = 0;
let previousStyles = null;

export default function useModalScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    lockCount += 1;
    if (lockCount === 1) {
      scrollY = window.scrollY;
      previousStyles = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight };
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      lockCount -= 1;
      if (lockCount !== 0 || !previousStyles) return;
      Object.assign(document.body.style, previousStyles);
      window.scrollTo(0, scrollY);
      previousStyles = null;
    };
  }, [locked]);
}
