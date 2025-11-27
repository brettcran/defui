export class UIButton extends HTMLElement{
connectedCallback(){
 this.render();
 this.addEventListener('click',()=>{});
}
render(){
 const variant=this.getAttribute('variant')||'default';
 this.innerHTML=`<button part="btn" class="ui-btn ${variant}"><slot></slot></button>`;
}
}
customElements.define('ui-button',UIButton);