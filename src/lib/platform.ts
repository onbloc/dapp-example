export const isMobileDevice = (): boolean =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

export const hasAdenaExtension = (): boolean => typeof window !== 'undefined' && Boolean(window.adena);
