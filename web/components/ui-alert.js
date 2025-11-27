export class UIAlert extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ["variant"];
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const variant = this.getAttribute("variant") || "info";
    const icon = ({
      success: "✓",
      danger: "!",
      warning: "!",
      info: "i",
    }[variant] || "i");

    this.innerHTML = `
      <div class="ui-alert ui-alert-${variant}">
        <div class="ui-alert-icon">${icon}</div>
        <div class="ui-alert-content">
          <div class="ui-alert-title"><slot name="title"></slot></div>
          <div class="ui-alert-body"><slot></slot></div>
        </div>
      </div>
    `;
  }
}

customElements.define("ui-alert", UIAlert);
