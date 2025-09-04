// TurboSign: Mobile "Fill & Sign" behavior for the STOCK PDF.js viewer.
// - Enables the Signature editor.
// - Forces vertical scroll + no spreads on mobile.
// - Blocks iOS Safari page-level double-tap/pinch zoom (PDF.js handles zoom itself).
// No edits to /build or viewer logic beyond public APIs.

(() => {
  const isMobile = matchMedia('(max-width: 768px)').matches;

  // 1) Kill page-level zoom gestures on mobile (keeps zoom inside PDF.js only)
  if (isMobile) {
    // Double-tap blocker
    let last = 0;
    window.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - last < 300) e.preventDefault();
      last = now;
    }, { passive: false });

    // Pinch / dblclick zoom disable
    ['gesturestart', 'gesturechange', 'gestureend', 'dblclick'].forEach(t => {
      window.addEventListener(t, e => e.preventDefault(), { passive: false });
    });

    try {
      document.documentElement.style.touchAction = 'manipulation';
      document.body.style.touchAction = 'manipulation';
    } catch {}
  }

  // 2) Hook before the viewer initializes to set options
  document.addEventListener('webviewerloaded', () => {
    const Opt = window.PDFViewerApplicationOptions;
    if (!Opt) return;

    // Ensure Signature editor is allowed (UI still obeys permissions in the PDF)
    try { Opt.set('enableSignatureEditor', true); } catch {}

    // We hide UI for search/sidebar/print/etc. via CSS only (upgrade-safe).
  }, { once: true });

  // 3) After the viewer initializes, force modes on mobile
  (async () => {
    const App = window.PDFViewerApplication;
    if (!App || !App.initializedPromise) return;
    await App.initializedPromise;

    if (!isMobile) return;

    // Force vertical scroll and no spreads
    try {
      const C = window.PDFViewerApplicationConstants;
      const v = App.pdfViewer;
      v.scrollMode = C.ScrollMode.VERTICAL; // 0
      v.spreadMode = C.SpreadMode.NONE;     // 0
    } catch {}

    // Optional: hide the secondary toolbar toggle at runtime too (belt & suspenders).
    // If you prefer to keep it, comment this out.
    const sec = document.getElementById('secondaryToolbarToggle');
    if (sec) sec.style.display = 'none';
  })();
})();
