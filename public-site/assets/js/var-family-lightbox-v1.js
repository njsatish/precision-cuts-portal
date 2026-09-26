(() => {
  "use strict";
  let items=[];
  let activeIndex=0;
  let activeTrigger=null;

  const createModal=()=>{
    const modal=document.createElement("div");
    modal.className="pc-var-family-modal";
    modal.id="pc-var-family-modal-v1";
    modal.setAttribute("role","dialog");
    modal.setAttribute("aria-modal","true");
    modal.setAttribute("aria-label","Var and wife photo preview");
    modal.innerHTML=`<button class="pc-var-family-close" type="button" aria-label="Close photo preview">×</button><button class="pc-var-family-nav pc-var-family-prev" type="button" aria-label="Previous photo">‹</button><figure><img alt="Expanded personal photo"><figcaption><span>Var &amp; His Wife</span><strong></strong><small></small></figcaption></figure><button class="pc-var-family-nav pc-var-family-next" type="button" aria-label="Next photo">›</button>`;
    document.body.appendChild(modal);
    return modal;
  };

  const init=()=>{
    const cards=[...document.querySelectorAll("[data-family-src]")];
    if(cards.length!==3)return false;
    if(document.getElementById("pc-var-family-modal-v1"))return true;
    items=cards.map(card=>({source:card.dataset.familySrc,alt:card.querySelector("img")?.alt||"Expanded personal photo",title:card.querySelector(".pc-family-copy strong")?.textContent||"Personal Photo",trigger:card}));
    const modal=createModal(),image=modal.querySelector("img"),title=modal.querySelector("figcaption strong"),count=modal.querySelector("figcaption small"),closeButton=modal.querySelector(".pc-var-family-close");
    const show=index=>{activeIndex=(index+items.length)%items.length;const item=items[activeIndex];image.src=item.source;image.alt=item.alt;title.textContent=item.title;count.textContent=`${activeIndex+1} of ${items.length}`};
    const open=(index,trigger)=>{activeTrigger=trigger;show(index);modal.classList.add("is-open");document.body.classList.add("pc-var-family-open");closeButton.focus()};
    const close=()=>{modal.classList.remove("is-open");document.body.classList.remove("pc-var-family-open");activeTrigger?.focus()};
    cards.forEach((card,index)=>card.addEventListener("click",event=>{event.preventDefault();event.stopImmediatePropagation();open(index,card)},true));
    modal.querySelector(".pc-var-family-prev").addEventListener("click",event=>{event.stopPropagation();show(activeIndex-1)});
    modal.querySelector(".pc-var-family-next").addEventListener("click",event=>{event.stopPropagation();show(activeIndex+1)});
    closeButton.addEventListener("click",close);
    modal.querySelector("figure").addEventListener("click",event=>event.stopPropagation());
    modal.addEventListener("click",event=>{if(event.target===modal)close()});
    document.addEventListener("keydown",event=>{if(!modal.classList.contains("is-open"))return;if(event.key==="Escape")close();if(event.key==="ArrowLeft")show(activeIndex-1);if(event.key==="ArrowRight")show(activeIndex+1)});
    return true;
  };

  if(!init()){
    const observer=new MutationObserver(()=>{if(init())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),15000);
  }
})();
