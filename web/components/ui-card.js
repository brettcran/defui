export class UICard extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ["headline", "subhead"];
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const headline = this.getAttribute("headline") || "";
    const subhead = this.getAttribute("subhead") || "";
    this.innerHTML = `
      <section class="ui-card">
        ${headline ? `<h3 class="ui-card-title">${headline}</h3>` : ""}
        ${subhead ? `<p class="ui-card-sub">${subhead}</p>` : ""}
        <div class="ui-card-body">
          <slot></slot>
        </div>
      </section>
    `;
  }
}

customElements.define("ui-card", UICard);
