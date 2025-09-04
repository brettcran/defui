// TurboSign: Mobile "Fill & Sign" behavior for stock PDF.js
// - Enables Signature editor
// - Forces vertical scroll + no spreads on mobile
// - Blocks Safari page-level double-tap/pinch zoom (PDF.js handles zoom itself)
(() => {
  const isMobile = matchMedia('(max-width: 768px)').matches;

  // 1) Block page-level zoom gestures on mobile (Safari)
  if (isMobile) {
    let last = 0;
    window.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - last < 300) e.preventDefault();
      last = now;
    }, { passive: false });

    ['gesturestart', 'gesturechange', 'gestureend', 'dblclick'].forEach(t => {
      window.addEventListener(t, e => e.preventDefault(), { passive: false });
    });

    try {
      document.documentElement.style.touchAction = 'manipulation';
      document.body.style.touchAction = 'manipulation';
    } catch {}
  }

  // 2) Before init: enable signature editor (UI still obeys PDF permissions)
  document.addEventListener('webviewerloaded', () => {
    const Opt = window.PDFViewerApplicationOptions;
    if (!Opt) return;
    try { Opt.set('enableSignatureEditor', true); } catch {}
  }, { once: true });

  // 3) After init: force vertical scroll + no spreads on mobile
  (async () => {
    const App = window.PDFViewerApplication;
    if (!App || !App.initializedPromise) return;
    await App.initializedPromise;

    if (!isMobile) return;

    try {
      const C = window.PDFViewerApplicationConstants;
      const v = App.pdfViewer;
      v.scrollMode = C.ScrollMode.VERTICAL; // 0
      v.spreadMode = C.SpreadMode.NONE;     // 0
    } catch {}
  })();
})();
