"use client";

import { RefObject, useEffect } from "react";

export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    function listener(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!ref.current || !(target instanceof Node) || ref.current.contains(target)) {
        return;
      }

      callback();
    }

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback, enabled]);
}
