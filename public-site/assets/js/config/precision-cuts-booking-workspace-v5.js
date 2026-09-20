(() => {
  "use strict";

  const barberOrder = [
    "keith-lemon",
    "christopher-meadows",
    "ron-the-barber",
    "levar-neal",
    "lamar-the-barber"
  ];
  const directIds = new Set(["levar-neal", "lamar-the-barber"]);
  const displayNames = {
    "keith-lemon":"Keith Lemon",
    "christopher-meadows":"Christopher Meadows",
    "ron-the-barber":"Ron The Barber",
    "levar-neal":"Var da Barber",
    "lamar-the-barber":"Lamar the barber"
  };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[character]);
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  let selectedBarberId = null;
  let selectedServiceIndex = null;

  function config(){ return window.BOOKSY_PORTAL_CONFIG || null; }
  function registry(){ return new Map((config()?.barbers || []).map(item => [item.id,item])); }
  function imageOf(barber){ return barber.photoUrl || barber.photo || barber.profilePhoto || ""; }
  function durationOf(service){ return service.durationMinutes || service.duration || ""; }
  function priceOf(service){ const number=Number(service.price); return Number.isFinite(number) ? `$${number.toFixed(0)}` : ""; }

  function legacyWorkspace(){
    const headings=[...document.querySelectorAll("h1,h2,h3,h4,strong")];
    const marker=headings.find(node => /1\.\s*services/i.test(node.textContent || ""));
    if(!marker) return null;
    let node=marker;
    while(node && node!==document.body){
      const text=normalize(node.textContent);
      if(text.includes("1. services") && text.includes("2. barbers") && text.includes("3. available dates")) return node;
      node=node.parentElement;
    }
    return null;
  }

  function workspace(){ return document.querySelector("[data-pc-workspace-v5]"); }

  function renderBarbers(){
    const host=workspace()?.querySelector("[data-v5-barbers]");
    if(!host) return;
    const reg=registry();
    host.innerHTML=barberOrder.map(id => {
      const barber=reg.get(id);
      if(!barber) return "";
      const selected=id===selectedBarberId ? " is-selected" : "";
      const bookingLabel=directIds.has(id) ? "Verified Booksy services" : "Live availability";
      const image=imageOf(barber);
      return `<button type="button" class="pc-v5-barber${selected}" data-v5-barber="${id}" aria-pressed="${id===selectedBarberId}">
        <span class="pc-v5-avatar">${image?`<img src="${escapeHtml(image)}" alt="" loading="lazy">`:escapeHtml(displayNames[id][0])}</span>
        <span><strong>${escapeHtml(displayNames[id])}</strong><small>${escapeHtml(barber.title || "Precision Cuts Barber")}</small><em>${bookingLabel}</em></span>
      </button>`;
    }).join("");
    host.querySelectorAll("[data-v5-barber]").forEach(button => button.addEventListener("click", () => selectBarber(button.dataset.v5Barber, false)));
  }

  function renderServices(){
    const host=workspace()?.querySelector("[data-v5-services]");
    if(!host) return;
    if(!selectedBarberId){
      host.innerHTML='<div class="pc-v5-empty"><strong>Select a barber.</strong><span>The matching services will appear here.</span></div>';
      return;
    }
    const barber=registry().get(selectedBarberId);
    const services=barber?.services || [];
    host.innerHTML=`<div class="pc-v5-selected-heading"><p>SELECTED BARBER</p><h3>${escapeHtml(displayNames[selectedBarberId])}</h3><span>${services.length} verified services</span></div>
      <div class="pc-v5-service-list">${services.map((service,index)=>`<button type="button" data-v5-service="${index}" class="${index===selectedServiceIndex?'is-selected':''}"><span><strong>${escapeHtml(service.name)}</strong><small>${escapeHtml(durationOf(service))} min · ${priceOf(service)}</small></span><em>Select</em></button>`).join("")}</div>`;
    host.querySelectorAll("[data-v5-service]").forEach(button => button.addEventListener("click", () => {
      selectedServiceIndex=Number(button.dataset.v5Service);
      renderServices();
      renderAction();
    }));
  }

  function liveUrl(barber, service){
    const serviceSlug=service.slug || service.id || "";
    return `/book.html?barber=${encodeURIComponent(barber.id)}&service=${encodeURIComponent(serviceSlug)}`;
  }

  function renderAction(){
    const host=workspace()?.querySelector("[data-v5-action]");
    if(!host) return;
    if(!selectedBarberId){
      host.innerHTML='<div class="pc-v5-empty"><strong>Select a barber.</strong><span>Then choose a service to continue.</span></div>';
      return;
    }
    const barber=registry().get(selectedBarberId);
    const service=(barber.services || [])[selectedServiceIndex];
    if(!service){
      host.innerHTML=`<div class="pc-v5-action-card"><p>${directIds.has(selectedBarberId)?'VERIFIED BOOKSY PROFILE':'LIVE AVAILABILITY'}</p><h3>${escapeHtml(displayNames[selectedBarberId])}</h3><section><strong>Select a service from the first column.</strong></section></div>`;
      return;
    }
    const direct=directIds.has(selectedBarberId);
    const url=direct ? barber.booksyUrl : liveUrl(barber,service);
    const label=direct ? "Continue to Booksy" : "View live dates and times";
    const target=direct ? ' target="_blank" rel="noopener noreferrer"' : "";
    host.innerHTML=`<div class="pc-v5-action-card"><p>${direct?'VERIFIED BOOKSY PROFILE':'LIVE APPOINTMENT AVAILABILITY'}</p><h3>${escapeHtml(displayNames[selectedBarberId])}</h3><section><strong>${escapeHtml(service.name)}</strong><span>${escapeHtml(durationOf(service))} min · ${priceOf(service)}</span></section><small>${direct?'Booksy will show current available dates and times for this verified profile.':'Continue to the live calendar with this barber and service preselected.'}</small><a href="${escapeHtml(url)}"${target}>${label}</a></div>`;
  }

  function selectBarber(id, scroll=true){
    if(!barberOrder.includes(id) || !registry().has(id)) return;
    selectedBarberId=id;
    selectedServiceIndex=null;
    history.replaceState(null,"",`#booking-workspace?barber=${encodeURIComponent(id)}`);
    renderBarbers();
    renderServices();
    renderAction();
    if(scroll) setTimeout(()=>workspace()?.scrollIntoView({behavior:"smooth",block:"start"}),50);
  }

  function createWorkspace(){
    if(workspace()) return workspace();
    const legacy=legacyWorkspace();
    if(!legacy) return null;
    legacy.classList.add("pc-v5-legacy-hidden");
    legacy.setAttribute("aria-hidden","true");
    const section=document.createElement("section");
    section.className="pc-v5-workspace";
    section.dataset.pcWorkspaceV5="";
    section.id="booking-workspace";
    section.innerHTML=`<header class="pc-v5-workspace-header"><p>PRECISION CUTS BOOKING</p><h2>Choose a barber and service.</h2><span>All five verified barber profiles are available below.</span></header><div class="pc-v5-columns"><section><h3>1. SERVICES</h3><div class="pc-v5-panel-body" data-v5-services></div></section><section><h3>2. BARBERS</h3><div class="pc-v5-panel-body" data-v5-barbers></div></section><section><h3>3. CONTINUE</h3><div class="pc-v5-panel-body" data-v5-action></div></section></div>`;
    legacy.insertAdjacentElement("beforebegin",section);
    return section;
  }

  function homepageCardId(link){
    const href=link.getAttribute("href") || "";
    const query=href.includes("?") ? href.split("?",2)[1] : "";
    const fromHref=new URLSearchParams(query).get("barber");
    if(barberOrder.includes(fromHref)) return fromHref;
    const text=normalize(link.closest("article")?.textContent || link.textContent);
    return barberOrder.find(id => text.includes(normalize(displayNames[id]))) || null;
  }

  function interceptHomepageCard(event){
    const link=event.target.closest(".pc-home-barber-action");
    if(!link) return;
    const id=homepageCardId(link);
    if(!id) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    selectBarber(id,true);
  }

  function initialize(attempt=0){
    if(!config() || !createWorkspace()){
      if(attempt<40) setTimeout(()=>initialize(attempt+1),100);
      return;
    }
    renderBarbers();
    renderServices();
    renderAction();
    if(document.documentElement.dataset.pcWorkspaceV5!=="true"){
      document.documentElement.dataset.pcWorkspaceV5="true";
      document.addEventListener("click",interceptHomepageCard,true);
    }
    const hash=location.hash.replace(/^#/,"");
    if(hash.startsWith("booking-workspace")){
      const id=new URLSearchParams(hash.split("?",2)[1] || "").get("barber");
      if(barberOrder.includes(id)) selectBarber(id,false);
    }
  }

  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>initialize(),{once:true}):initialize();
  document.addEventListener("booksy-portal-config-ready",()=>initialize());
  window.addEventListener("load",()=>initialize(),{once:true});
  window.addEventListener("hashchange",()=>initialize());
})();
