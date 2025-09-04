// TurboSign UX overlay for stock PDF.js viewer (no upstream edits)
// - Adds "Open" to main toolbar (calls built-in secondaryOpenFile)
// - Enables Signature editor
// - Forces vertical scroll & no spreads
// - Prevents iOS Safari page zoom/double-tap
// - Cleans up disabled attrs so tools work once a doc is loaded

(function () {
  // Wait until PDF.js bootstraps the DOM and global objects.
  function onReady(cb) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(cb, 0);
    } else {
      document.addEventListener("DOMContentLoaded", cb, { once: true });
    }
  }

  onReady(() => {
    // 1) Add "Open" button to the main toolbar (right side) that reuses PDF.js’ own handler.
    try {
      const right = document.getElementById("toolbarViewerRight");
      const secondaryOpen = document.getElementById("secondaryOpenFile"); // stock ID in secondary menu
      if (right && secondaryOpen) {
        // Create button consistent with stock viewer
        const openBtn = document.createElement("button");
        openBtn.id = "tsOpenButton";
        openBtn.className = "toolbarButton";
        openBtn.type = "button";
        openBtn.tabIndex = 0;
        openBtn.setAttribute("data-l10n-id", "pdfjs-open-file-button");
        // Let PDF.js l10n fill text; fallback label for non-l10n
        openBtn.innerHTML = '<span>Open</span>';
        openBtn.addEventListener("click", () => secondaryOpen.click());
        // Put Open first on right; keep Save (downloadButton) after it.
        right.insertBefore(openBtn, right.firstChild);
      }
    } catch (e) {
      console.error("Add Open button failed:", e);
    }

    // 2) Enable Signature tool (stock markup ships hidden+disabled by default).
    try {
      const sigGroup = document.getElementById("editorSignature");
      const sigBtn = document.getElementById("editorSignatureButton");
      if (sigGroup) sigGroup.hidden = false;
      if (sigBtn) sigBtn.disabled = false;
      // Some builds gate features via AppOptions; set if available.
      const Opt = window.PDFViewerApplicationOptions;
      if (Opt?.set) {
        // In current builds this flag is auto; setting won’t hurt.
        Opt.set("enableSignatureEditor", true);
      }
    } catch (e) {
      console.error("Enable signature failed:", e);
    }

    // 3) Force vertical scroll + no spreads (after viewer is running).
    const applyViewerModes = () => {
      try {
        const App = window.PDFViewerApplication;
        const C = window.PDFViewerApplicationConstants;
        if (App?.pdfViewer && C?.ScrollMode && C?.SpreadMode) {
          App.pdfViewer.scrollMode = C.ScrollMode.VERTICAL;
          App.pdfViewer.spreadMode = C.SpreadMode.NONE;
        }
      } catch (e) {
        console.error("Apply modes failed:", e);
      }
    };

    // PDF.js fires a custom event once it finishes bootstrapping.
    const onLoaded = () => {
      applyViewerModes();
      // Remove disabled on tools so they’ll activate once a PDF is open.
      ["editorFreeTextButton", "editorInkButton"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
      });
    };

    // If already running, apply immediately; else wait for event.
    if (window.PDFViewerApplication?.eventBus) {
      window.PDFViewerApplication.eventBus._on("initialized", onLoaded, { once: true });
    } else {
      // Fallback: try a bit later
      setTimeout(onLoaded, 800);
    }

    // 4) Kill iOS Safari page zoom/double-tap (PDF.js handles zoom internally).
    (function blockPageZoom() {
      // Harden viewport meta for iOS if present.
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        const c = meta.getAttribute("content") || "";
        if (!/user-scalable=no/i.test(c)) {
          meta.setAttribute("content", c.replace(/\s+/g, " ") + ", user-scalable=no");
        }
      }
      // Block double-tap and pinch on the page; allow viewer controls to work.
      let last = 0;
      window.addEventListener("touchend", e => {
        const now = Date.now();
        if (now - last < 300) e.preventDefault();
        last = now;
      }, { passive: false });
      ["gesturestart","gesturechange","gestureend","dblclick"].forEach(t => {
        window.addEventListener(t, e => e.preventDefault(), { passive: false });
      });
    })();
  });
})();
