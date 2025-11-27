export class UIToolbar extends HTMLElement{
connectedCallback(){this.innerHTML=`<div class="ui-toolbar"><slot></slot></div>`;}
}
customElements.define('ui-toolbar',UIToolbar);