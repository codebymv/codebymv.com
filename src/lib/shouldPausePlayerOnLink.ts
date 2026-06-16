/** Whether clicking this anchor should pause the in-page SoundCloud player. */
export function shouldPausePlayerOnLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#')) return false;

  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return true;

  if (/^(mailto:|tel:)/i.test(href)) return true;

  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}
