import { useEffect } from 'react';

/**
 * Moves focus to in-page hash targets (#work, #contact, skip link, etc.).
 * Sets tabIndex=-1 when needed so non-interactive targets are focusable.
 * Retries briefly for lazy-mounted sections so deep links still land correctly.
 */
export function useHashTargetFocus() {
  useEffect(() => {
    let cancelled = false;
    let retryObserver: MutationObserver | null = null;

    const clearRetry = () => {
      retryObserver?.disconnect();
      retryObserver = null;
    };

    const focusTarget = (id: string, scroll: boolean) => {
      const el = document.getElementById(id);
      if (!el) return false;

      if (!el.hasAttribute('tabindex')) {
        el.tabIndex = -1;
      }

      el.focus({ preventScroll: true });
      if (scroll) {
        el.scrollIntoView();
      }
      return true;
    };

    const activate = (opts?: { forceScroll?: boolean }) => {
      if (cancelled) return;
      clearRetry();

      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
      if (!id) return;

      // Native hash navigation already scrolled when the target existed.
      if (focusTarget(id, Boolean(opts?.forceScroll))) return;

      // Lazy sections (Work/Contact/…) may not be in the DOM yet.
      retryObserver = new MutationObserver(() => {
        if (focusTarget(id, true)) clearRetry();
      });
      retryObserver.observe(document.body, { childList: true, subtree: true });
    };

    const onHashChange = () => activate();

    // SPA shell: browser often can't scroll to lazy targets on first paint.
    activate({ forceScroll: Boolean(window.location.hash) });
    window.addEventListener('hashchange', onHashChange);

    // Same-hash re-clicks don't fire hashchange; re-focus + scroll manually.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute('href');
      if (!href || href.length < 2 || href === '#') return;

      if (href === window.location.hash) {
        requestAnimationFrame(() => activate({ forceScroll: true }));
      }
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelled = true;
      clearRetry();
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onClick);
    };
  }, []);
}
