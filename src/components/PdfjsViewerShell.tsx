// PdfjsViewerShell.tsx
import React, {useEffect, useMemo, useRef, useImperativeHandle, forwardRef} from "react";

type PdfjsApp = any; // PDFViewerApplication type (avoid importing internals)
export type PdfjsViewerRef = {
  openFile: (file: File) => void;
  openUrl: (url: string) => void;
  setZoom: (value: "auto"|"page-width"|"page-fit"|`${number}`) => void;
  toggleThumbs: () => void;
  next: () => void;
  prev: () => void;
  print: () => void;
  download: () => void;
};

function waitForApp(iframe: HTMLIFrameElement): Promise<PdfjsApp> {
  return new Promise(resolve => {
    const poll = () => {
      try {
        const app = (iframe.contentWindow as any)?.PDFViewerApplication;
        if (app?.initializedPromise) { app.initializedPromise.then(() => resolve(app)); return; }
      } catch {}
      setTimeout(poll, 50);
    };
    poll();
  });
}

const MOBILE_STYLE = `
@media (max-width: 900px) {
  #toolbarContainer { padding: 6px 8px; }
  .toolbarButton, .dropdownToolbarButton, .secondaryToolbarButton, .overlayButton,
  #scaleSelectContainer select { min-height:44px; min-width:44px; padding:10px 12px; font-size:16px; }
  .toolbarButton::before, .secondaryToolbarButton::before, .overlayButton::before {
    width:22px;height:22px;background-size:22px 22px;-webkit-mask-size:22px 22px;mask-size:22px 22px;margin-right:8px;
  }
  #findInput { font-size:16px; height:44px; }
  #sidebarContainer { width:min(85vw, 340px); }
  @media (max-width:420px) {
    #viewBookmark,#presentationMode,#openFile,#secondaryToolbarToggle{ display:none!important; }
    #scaleSelectContainer{ display:none!important; }
  }
}
`;

export const PdfjsViewerShell = forwardRef<PdfjsViewerRef, {className?: string, initialUrl?: string}>(
  ({className, initialUrl}, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => ({
      openFile: (file: File) => {
        const url = URL.createObjectURL(file);
        if (iframeRef.current) iframeRef.current.src = `/web/viewer.html?file=${encodeURIComponent(url)}#zoom=page-width`;
      },
      openUrl: (url: string) => {
        if (iframeRef.current) iframeRef.current.src = `/web/viewer.html?file=${encodeURIComponent(url)}#zoom=page-width`;
      },
      setZoom: async (value) => {
        const app = await waitForApp(iframeRef.current!);
        app.pdfViewer.currentScaleValue = value;
      },
      toggleThumbs: async () => {
        const app = await waitForApp(iframeRef.current!);
        const s = app.pdfSidebar; s.isOpen ? s.close() : (s.open(), s.switchView(1));
      },
      next: async () => { const app = await waitForApp(iframeRef.current!); app.page = Math.min(app.pagesCount, app.page + 1); },
      prev: async () => { const app = await waitForApp(iframeRef.current!); app.page = Math.max(1, app.page - 1); },
      print: async () => { await waitForApp(iframeRef.current!); iframeRef.current!.contentDocument!.getElementById("print")!.dispatchEvent(new Event("click")); },
      download: async () => { await waitForApp(iframeRef.current!); iframeRef.current!.contentDocument!.getElementById("download")!.dispatchEvent(new Event("click")); },
    }), []);

    // Load initial URL or default viewer
    useEffect(() => {
      if (!iframeRef.current) return;
      const base = "/web/viewer.html";
      iframeRef.current.src = initialUrl
        ? `${base}?file=${encodeURIComponent(initialUrl)}#zoom=page-width`
        : `${base}#zoom=page-width`;
    }, [initialUrl]);

    // Inject mobile scaling CSS into the iframe once the viewer is ready
    useEffect(() => {
      let cancelled = false;
      (async () => {
        if (!iframeRef.current) return;
        const app = await waitForApp(iframeRef.current);
        if (cancelled) return;
        try {
          const doc = iframeRef.current!.contentDocument!;
          const style = doc.createElement("style");
          style.id = "turbosign-mobile-style";
          style.textContent = MOBILE_STYLE;
          doc.head.appendChild(style);

          // Mobile niceties
          if (matchMedia("(max-width: 900px)").matches) {
            try { app.pdfSidebar.close(); } catch {}
            app.pdfViewer.currentScaleValue = "page-width";
          }
        } catch {}
      })();
      return () => { cancelled = true; };
    }, []);

    return (
      <div className={className} style={{position:"relative", width:"100%", height:"100%"}}>
        <iframe
          ref={iframeRef}
          title="PDF.js Viewer"
          src="about:blank"
          allow="fullscreen"
          style={{position:"absolute", inset:0, width:"100%", height:"100%", border:0, background:"#121418"}}
        />
      </div>
    );
  }
);
