"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface IntersectionOptions extends IntersectionObserverInit {
  once?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionOptions = {}
): {
  ref: React.RefObject<T | null>;
  isVisible: boolean;
  entry: IntersectionObserverEntry | null;
  ratio: number;
} {
  const { once = true, threshold = 0.1, rootMargin = "0px", ...rest } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [ratio, setRatio] = useState(0);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const callbackRef = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [e] = entries;
      if (e) {
        setEntry(e);
        setRatio(e.intersectionRatio);
        if (e.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current && observerRef.current) {
            observerRef.current.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      }
    },
    [once]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(callbackRef, {
      threshold,
      rootMargin,
      ...rest,
    });
    observerRef.current = observer;
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [callbackRef, threshold, rootMargin]);

  return { ref, isVisible, entry, ratio };
}
