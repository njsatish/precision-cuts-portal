(() => {
  "use strict";

  const VAR_ID = "levar-neal";
  const NATIVE_NAMES = ["keith lemon", "christopher meadows", "ron the barber"];
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[character]);
  let active = false;

  function config(){ return window.BOOKSY_PORTAL_CONFIG || null; }
  function barber(){ return (config()?.barbers || []).find(item => item.id === VAR_ID) || null; }

  function heading(text){
    return [...document.querySelectorAll("h1,h2,h3,h4,h5,strong")]
      .find(node => normalize(node.textContent).includes(text));
  }

  function panel(text){
    const marker=heading(text);
    return marker?.closest("section,article") || marker?.closest("div") || null;
  }

  function body(container,title){
    if(!container) return null;
    const children=[...container.children];
    const header=children.find(child => normalize(child.textContent).includes(title));
    const later=header ? children.slice(children.indexOf(header)+1) : children;
    return later.find(child => child.matches("div,ul,ol")) || container;
  }

  function servicesPanel(){ return panel("1. services"); }
  function barbersPanel(){ return panel("2. barbers"); }
  function datesPanel(){ return panel("3. available dates"); }
  function servicesBody(){ return body(servicesPanel(),"1. services"); }
  function barbersBody(){ return body(barbersPanel(),"2. barbers"); }
  function datesBody(){ return body(datesPanel(),"3. available dates"); }
  function imageOf(item){ return item.photoUrl || item.photo || item.profilePhoto || ""; }
  function durationOf(item){ return item.durationMinutes || item.duration || ""; }
  function priceOf(item){ const n=Number(item.price); return Number.isFinite(n) ? `$${n.toFixed(0)}` : ""; }

  function ensureOverlay(panelNode, marker){
    let overlay=panelNode?.querySelector(`[data-${marker}]`);
    if(!overlay && panelNode){
      overlay=document.createElement("div");
      overlay.setAttribute(`data-${marker}`,"");
      overlay.className="pc-var-v2-overlay";
      panelNode.appendChild(overlay);
    }
    return overlay;
  }

  function setNativeHidden(hidden){
    const left=servicesBody();
    const right=datesBody();
    if(left) left.classList.toggle("pc-var-v2-native-hidden",hidden);
    if(right) right.classList.toggle("pc-var-v2-native-hidden",hidden);
  }

  function markCard(selected){
    document.querySelectorAll("[data-pc-var-pilot-card]").forEach(card => {
      card.classList.toggle("is-selected",selected);
      card.setAttribute("aria-pressed",selected ? "true" : "false");
    });
  }

  function renderResult(service){
    const item=barber();
    const overlay=ensureOverlay(datesPanel(),"pc-var-v2-dates");
    if(!item || !overlay) return;
    overlay.innerHTML=`<div class="pc-var-v2-result"><p>VERIFIED BOOKSY PROFILE</p><h3>Var da Barber</h3>${service?`<section><strong>${escapeHtml(service.name)}</strong><span>${escapeHtml(durationOf(service))} min · ${priceOf(service)}</span></section>`:`<section><strong>Select one of Var da Barber's services.</strong></section>`}<small>Current dates and times are shown on the verified Booksy profile.</small><a href="${escapeHtml(item.booksyUrl)}" target="_blank" rel="noopener noreferrer">Continue to Booksy</a></div>`;
    overlay.classList.add("is-visible");
  }

  function renderServices(){
    const item=barber();
    const overlay=ensureOverlay(servicesPanel(),"pc-var-v2-services");
    if(!item || !overlay) return;
    const services=item.services || [];
    overlay.innerHTML=`<div class="pc-var-v2-services"><header><p>SELECTED BARBER SERVICES</p><h3>Var da Barber</h3><span>${services.length} verified services</span></header><div>${services.map((service,index)=>`<button type="button" data-pc-var-v2-service="${index}"><span><strong>${escapeHtml(service.name)}</strong><small>${escapeHtml(durationOf(service))} min · ${priceOf(service)}</small></span><em>Select</em></button>`).join("")}</div></div>`;
    overlay.classList.add("is-visible");
  }

  function activate(){
    if(!barber() || !servicesPanel() || !datesPanel()) return false;
    active=true;
    setNativeHidden(true);
    markCard(true);
    renderServices();
    renderResult(null);
    history.replaceState(null,"",`#booking-workspace?barber=${VAR_ID}`);
    setTimeout(()=>servicesPanel()?.parentElement?.scrollIntoView({behavior:"smooth",block:"start"}),50);
    return true;
  }

  function deactivate(){
    if(!active) return;
    active=false;
    setNativeHidden(false);
    markCard(false);
    document.querySelectorAll("[data-pc-var-v2-services],[data-pc-var-v2-dates]").forEach(node => {
      node.classList.remove("is-visible");
      node.innerHTML="";
    });
  }

  function ensureCard(){
    const host=barbersBody();
    const item=barber();
    if(!host || !item) return false;
    if(host.querySelector("[data-pc-var-pilot-card]")) return true;
    const card=document.createElement("button");
    card.type="button";
    card.className="pc-var-v2-card";
    card.dataset.pcVarPilotCard="";
    card.setAttribute("aria-pressed","false");
    card.innerHTML=`<span class="pc-var-v2-avatar">${imageOf(item)?`<img src="${escapeHtml(imageOf(item))}" alt="" loading="lazy">`:"V"}</span><span><strong>Var da Barber</strong><small>${escapeHtml(item.title || "Haircut, Shave & Beard Specialist")}</small><em>Verified Booksy services</em></span>`;
    host.appendChild(card);
    return true;
  }

  function cardIdFromTarget(target){
    if(target.closest("[data-pc-var-pilot-card]")) return VAR_ID;
    const text=normalize(target.closest("button,article,a,div")?.textContent);
    if(text.includes("var da barber")) return VAR_ID;
    return null;
  }

  function captureClick(event){
    const barberArea=barbersPanel();
    if(barberArea?.contains(event.target)){
      const id=cardIdFromTarget(event.target);
      if(id===VAR_ID){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        activate();
        return;
      }
      if(active){
        const text=normalize(event.target.closest("button,article,a,div")?.textContent);
        if(NATIVE_NAMES.some(name=>text.includes(name))) deactivate();
      }
    }

    if(active){
      const serviceButton=event.target.closest("[data-pc-var-v2-service]");
      if(serviceButton){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const item=barber();
        const service=(item?.services || [])[Number(serviceButton.dataset.pcVarV2Service)];
        document.querySelectorAll("[data-pc-var-v2-service].is-selected").forEach(node=>node.classList.remove("is-selected"));
        serviceButton.classList.add("is-selected");
        renderResult(service);
      }
    }
  }

  function initialize(attempt=0){
    if(!config() || !servicesPanel() || !barbersPanel() || !datesPanel()){
      if(attempt<40) setTimeout(()=>initialize(attempt+1),100);
      return;
    }
    ensureCard();
    ensureOverlay(servicesPanel(),"pc-var-v2-services");
    ensureOverlay(datesPanel(),"pc-var-v2-dates");
    if(document.documentElement.dataset.pcVarPilotV2!=="true"){
      document.documentElement.dataset.pcVarPilotV2="true";
      document.addEventListener("click",captureClick,true);
    }
    if(location.hash.includes(`barber=${VAR_ID}`)) activate();
  }

  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>initialize(),{once:true}):initialize();
  document.addEventListener("booksy-portal-config-ready",()=>initialize());
  window.addEventListener("load",()=>initialize(),{once:true});
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued||active)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureCard();});});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
})();
