export class UITabs extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "tablist");
    this._upgrade();
    this.addEventListener("click", (ev) => {
      const tab = ev.target.closest("ui-tab");
      if (!tab) return;
      this._activate(tab);
    });
  }

  _upgrade() {
    const tabs = this._tabs;
    const active = tabs.find(t => t.hasAttribute("active")) || tabs[0];
    if (active) this._activate(active, false);
  }

  get _tabs() {
    return Array.from(this.querySelectorAll("ui-tab"));
  }

  _activate(target, emit = true) {
    this._tabs.forEach(tab => {
      const isActive = tab === target;
      tab.toggleAttribute("active", isActive);
      const panelId = tab.getAttribute("panel");
      if (panelId) {
        const panel = this.ownerDocument.getElementById(panelId);
        if (panel) {
          panel.hidden = !isActive;
        }
      }
    });
    if (emit) {
      this.dispatchEvent(new CustomEvent("change", {
        detail: { value: target.getAttribute("value") || "" }
      }));
    }
  }
}

export class UITab extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "tab");
  }
}

customElements.define("ui-tabs", UITabs);
customElements.define("ui-tab", UITab);
