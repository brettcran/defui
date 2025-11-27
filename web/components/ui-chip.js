export class UIChip extends HTMLElement {
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
    const variant = this.getAttribute("variant") || "default";
    this.innerHTML = `
      <span class="ui-chip ui-chip-${variant}">
        <span class="ui-chip-dot"></span>
        <slot></slot>
      </span>
    `;
  }
}

customElements.define("ui-chip", UIChip);
