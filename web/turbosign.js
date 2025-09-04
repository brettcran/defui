// TurboSign: Mobile Fill & Sign behavior for stock PDF.js
// - Enable Signature editor
// - Force vertical scroll + no spreads on mobile
// - Block Safari page-level double-tap/pinch zoom
(() => {
  const isMobile = matchMedia("(max-width: 768px)").matches;

  // 1) Kill page-level zoom gestures on iOS (keep zoom inside PDF.js)
  if (isMobile) {
    let last = 0;
    window.addEventListener("touchend", e => {
      const now = Date.now();
      if (now - last < 300) e.preventDefault();
      last = now;
    }, { passive: false });

    ["gesturestart","gesturechange","gestureend","dblclick"].forEach(t => {
      window.addEventListener(t, e => e.preventDefault(), { passive: false });
    });

    try {
      document.documentElement.style.touchAction = "manipulation";
      document.body.style.touchAction = "manipulation";
    } catch {}
  }

  // 2) Before init: allow Signature editor
  document.addEventListener("webviewerloaded", () => {
    const Opt = window.PDFViewerApplicationOptions;
    if (!Opt) return;
    try { Opt.set("enableSignatureEditor", true); } catch {}
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
