import { useEffect, useRef, useState } from 'react';

/**
 * Observes an element and flips to true (once) when it enters the viewport.
 * Pairs with the .reveal / .in-view CSS classes for scroll-triggered reveals.
 */
export function useInView<T extends HTMLElement>(rootMargin = '-60px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
