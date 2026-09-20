(() => {
  "use strict";

  const VAR_ID = "levar-neal";
  const NATIVE_NAMES = ["keith lemon", "christopher meadows", "ron the barber"];
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[character]);
  const state = { active:false, selectedService:null, nativeServices:null, nativeDates:null };

  function config(){ return window.BOOKSY_PORTAL_CONFIG || null; }
  function varBarber(){ return (config()?.barbers || []).find(item => item.id === VAR_ID) || null; }

  function heading(text){
    return [...document.querySelectorAll("h1,h2,h3,h4,h5,strong")]
      .find(node => normalize(node.textContent).includes(text));
  }

  function panel(text){
    const marker=heading(text);
    return marker?.closest("section,article") || marker?.closest("div") || null;
  }

  function panelBody(container,title){
    if(!container) return null;
    const children=[...container.children];
    const header=children.find(child => normalize(child.textContent).includes(title));
    const later=header ? children.slice(children.indexOf(header)+1) : children;
    return later.find(child => child.matches("div,ul,ol")) || container;
  }

  function servicesBody(){ return panelBody(panel("1. services"),"1. services"); }
  function barbersBody(){ return panelBody(panel("2. barbers"),"2. barbers"); }
  function datesBody(){ return panelBody(panel("3. available dates"),"3. available dates"); }
  function imageOf(barber){ return barber.photoUrl || barber.photo || barber.profilePhoto || ""; }
  function durationOf(service){ return service.durationMinutes || service.duration || ""; }
  function priceOf(service){ const n=Number(service.price); return Number.isFinite(n) ? `$${n.toFixed(0)}` : ""; }

  function saveNativeState(){
    const left=servicesBody();
    const right=datesBody();
    if(left && state.nativeServices === null) state.nativeServices=left.innerHTML;
    if(right && state.nativeDates === null) state.nativeDates=right.innerHTML;
  }

  function restoreNativeState(){
    if(!state.active) return;
    const left=servicesBody();
    const right=datesBody();
    if(left && state.nativeServices !== null) left.innerHTML=state.nativeServices;
    if(right && state.nativeDates !== null) right.innerHTML=state.nativeDates;
    state.active=false;
    state.selectedService=null;
    document.querySelector("[data-pc-var-pilot-card]")?.classList.remove("is-selected");
    // Native app listeners may have been recreated by its own render. Trigger a
    // refresh event without selecting or navigating anywhere.
    document.dispatchEvent(new CustomEvent("pc-var-pilot-restored"));
  }

  function renderDates(barber,service){
    const right=datesBody();
    if(!right) return;
    right.innerHTML=`<div class="pc-var-pilot-result">
      <p>VERIFIED BOOKSY PROFILE</p>
      <h3>Var da Barber</h3>
      ${service ? `<section><strong>${escapeHtml(service.name)}</strong><span>${escapeHtml(durationOf(service))} min · ${priceOf(service)}</span></section>` : `<section><strong>Select a service from the first column.</strong></section>`}
      <small>Var da Barber's current available dates and times are displayed on the verified Booksy profile.</small>
      <a href="${escapeHtml(barber.booksyUrl)}" target="_blank" rel="noopener noreferrer">Continue to Booksy</a>
    </div>`;
  }

  function renderServices(barber){
    const left=servicesBody();
    if(!left) return;
    const services=barber.services || [];
    left.innerHTML=`<div class="pc-var-pilot-services">
      <header><p>SELECTED BARBER SERVICES</p><h3>Var da Barber</h3><span>${services.length} verified services</span></header>
      <div>${services.map((service,index)=>`<button type="button" data-pc-var-service="${index}"><span><strong>${escapeHtml(service.name)}</strong><small>${escapeHtml(durationOf(service))} min · ${priceOf(service)}</small></span><em>Select</em></button>`).join("")}</div>
    </div>`;
    left.querySelectorAll("[data-pc-var-service]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      left.querySelectorAll("button.is-selected").forEach(item => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      state.selectedService=services[Number(button.dataset.pcVarService)];
      renderDates(barber,state.selectedService);
    }));
  }

  function activateVar(){
    const barber=varBarber();
    if(!barber || !servicesBody() || !datesBody()) return false;
    saveNativeState();
    state.active=true;
    state.selectedService=null;
    document.querySelectorAll("[aria-pressed='true']").forEach(item => item.setAttribute("aria-pressed","false"));
    const card=document.querySelector("[data-pc-var-pilot-card]");
    card?.classList.add("is-selected");
    card?.setAttribute("aria-pressed","true");
    renderServices(barber);
    renderDates(barber,null);
    history.replaceState(null,"",`#booking-workspace?barber=${VAR_ID}`);
    setTimeout(() => panel("1. services")?.parentElement?.scrollIntoView({behavior:"smooth",block:"start"}),50);
    return true;
  }

  function ensureVarCard(){
    const host=barbersBody();
    const barber=varBarber();
    if(!host || !barber) return false;
    if(host.querySelector("[data-pc-var-pilot-card]")) return true;
    const card=document.createElement("button");
    card.type="button";
    card.className="pc-var-pilot-card";
    card.dataset.pcVarPilotCard="";
    card.setAttribute("aria-pressed","false");
    card.innerHTML=`<span class="pc-var-pilot-avatar">${imageOf(barber)?`<img src="${escapeHtml(imageOf(barber))}" alt="" loading="lazy">`:"V"}</span><span><strong>Var da Barber</strong><small>${escapeHtml(barber.title || "Haircut, Shave & Beard Specialist")}</small><em>Verified Booksy services</em></span>`;
    card.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      activateVar();
    });
    host.appendChild(card);
    return true;
  }

  function interceptNativeBarber(event){
    if(!state.active) return;
    const barbersPanel=panel("2. barbers");
    if(!barbersPanel || !barbersPanel.contains(event.target)) return;
    const candidate=event.target.closest("button,article,a,div");
    const text=normalize(candidate?.textContent);
    if(NATIVE_NAMES.some(name => text.includes(name))) restoreNativeState();
  }

  function initialize(attempt=0){
    if(!config() || !servicesBody() || !barbersBody() || !datesBody()){
      if(attempt<40) setTimeout(()=>initialize(attempt+1),100);
      return;
    }
    ensureVarCard();
    if(document.documentElement.dataset.pcVarPilot!=="true"){
      document.documentElement.dataset.pcVarPilot="true";
      document.addEventListener("click",interceptNativeBarber,true);
    }
    const hash=location.hash.replace(/^#/,"");
    if(hash.includes(`barber=${VAR_ID}`)) activateVar();
  }

  document.readyState==="loading" ? document.addEventListener("DOMContentLoaded",()=>initialize(),{once:true}) : initialize();
  document.addEventListener("booksy-portal-config-ready",()=>initialize());
  window.addEventListener("load",()=>initialize(),{once:true});
  let queued=false;
  const observer=new MutationObserver(()=>{ if(queued || state.active) return; queued=true; requestAnimationFrame(()=>{queued=false;ensureVarCard();}); });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),8000);
})();
