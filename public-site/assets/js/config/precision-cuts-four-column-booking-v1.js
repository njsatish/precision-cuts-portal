(() => {
  "use strict";

  const CONFIG_URL = "/assets/config/portal.json";
  const API_BASE = "https://nju3ryot9c.execute-api.us-east-1.amazonaws.com";
  const CATEGORY_ORDER = [
    "haircuts", "kids-teens", "beard-services", "combination-services",
    "lineups-detailing", "shaves", "add-ons", "skin-facial", "other-services"
  ];
  const state = { config:null, category:null, canonical:null, barber:null, service:null, slots:[], date:null, time:null, loading:false, error:"" };
  let root;
  let requestController;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const money = value => `$${Number(value || 0).toFixed(Number(value)%1 ? 2 : 0)}`;
  const timeLabel = value => new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
  const dateLabel = value => new Date(`${value}T12:00:00`).toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"});
  const services = () => state.config.barbers.flatMap(barber => (barber.services || []).map(service => ({...service, barber})));
  const categories = () => [...new Map(services().map(s => [s.canonicalCategory,{id:s.canonicalCategory,name:s.canonicalCategoryName}])).values()]
    .sort((a,b) => CATEGORY_ORDER.indexOf(a.id)-CATEGORY_ORDER.indexOf(b.id));
  const canonicalServices = () => [...new Map(services().filter(s => s.canonicalCategory===state.category).map(s => [s.canonicalService,{id:s.canonicalService,name:s.canonicalServiceName}])).values()];
  const providers = () => services().filter(s => s.canonicalService===state.canonical);
  const chosenProvider = () => providers().find(s => s.barber.id===state.barber) || null;

  function oldWorkspace(){
    return [...document.querySelectorAll("section,main,div")].find(node => {
      const text=(node.textContent||"").replace(/\s+/g," ").toLowerCase();
      return text.includes("1. services") && text.includes("2. barbers") && text.includes("available dates");
    });
  }

  function mount(){
    if(document.getElementById("pc-four-column-booking")) return false;
    const old=oldWorkspace();
    if(!old) return false;
    root=document.createElement("section");
    root.id="pc-four-column-booking";
    root.className="pc4-shell";
    old.before(root);
    old.hidden=true;
    old.dataset.pcFourColumnReplaced="true";
    render();
    return true;
  }

  function resetAfter(level){
    if(level<=1){state.canonical=null;}
    if(level<=2){state.barber=null;state.service=null;state.slots=[];}
    if(level<=3){state.date=null;state.time=null;state.error="";}
  }

  async function loadSlots(){
    if(!state.barber || !state.service) return;
    requestController?.abort();
    requestController=new AbortController();
    state.loading=true; state.error=""; state.slots=[]; state.date=null; state.time=null; render();
    try{
      const response=await fetch(`${API_BASE}/availability/${encodeURIComponent(state.barber)}/${encodeURIComponent(state.service.slug)}`,{signal:requestController.signal});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload=await response.json();
      if(payload.success!==true || !Array.isArray(payload.slots)) throw new Error("Invalid availability response");
      state.slots=payload.slots;
    }catch(error){
      if(error.name!=="AbortError") state.error="Availability could not be loaded. Please choose another service or try again.";
    }finally{
      if(!requestController.signal.aborted){state.loading=false;render();}
    }
  }

  function bookingUrl(){
    const provider=chosenProvider();
    if(!provider || !state.date || !state.time) return "#";
    const base=provider.instantExperienceUrl || provider.bookingUrl || provider.barber.instantExperienceUrl || provider.barber.booksyUrl || provider.barber.bookingUrl;
    if(!base) return "#";
    const url=new URL(base,location.origin);
    url.searchParams.set("variantId",String(provider.variantId));
    url.searchParams.set("date",`${state.date}T${state.time}`);
    return url.toString();
  }

  function render(){
    if(!root) return;
    const categoryCards=categories().map(c => `<button class="pc4-card ${state.category===c.id?'is-selected':''}" data-action="category" data-id="${esc(c.id)}" aria-pressed="${state.category===c.id}"><strong>${esc(c.name)}</strong><small>${services().filter(s=>s.canonicalCategory===c.id).length} provider options</small></button>`).join("");
    const serviceCards=state.category ? canonicalServices().map(s => `<button class="pc4-card ${state.canonical===s.id?'is-selected':''}" data-action="service" data-id="${esc(s.id)}" aria-pressed="${state.canonical===s.id}"><strong>${esc(s.name)}</strong><small>${providersFor(s.id)} barber${providersFor(s.id)===1?'':'s'}</small></button>`).join("") : `<p class="pc4-empty">Choose a category first.</p>`;
    const barberCards=state.canonical ? providers().map(s => `<button class="pc4-card pc4-barber ${state.barber===s.barber.id?'is-selected':''}" data-action="barber" data-id="${esc(s.barber.id)}" aria-pressed="${state.barber===s.barber.id}"><img src="${esc(s.barber.photoUrl||s.barber.photo||s.barber.profilePhoto||'/assets/images/precision-cuts-logo.png')}" alt=""><span><strong>${esc(s.barber.name||s.barber.displayName)}</strong><small>${esc(s.name)} · ${Number(s.durationMinutes)} min · ${money(s.price)}</small></span></button>`).join("") : `<p class="pc4-empty">Choose a service first.</p>`;
    const dates=[...new Set(state.slots.map(x=>x.date))];
    const times=state.date ? state.slots.filter(x=>x.date===state.date).map(x=>x.time) : [];
    const availability=!state.barber ? `<p class="pc4-empty">Choose a barber first.</p>` : state.loading ? `<p class="pc4-status">Loading live availability…</p>` : state.error ? `<p class="pc4-error">${esc(state.error)}</p>` : !state.slots.length ? `<p class="pc4-empty">No current openings were returned.</p>` : `<div class="pc4-dates">${dates.map(d=>`<button data-action="date" data-id="${d}" class="${state.date===d?'is-selected':''}">${dateLabel(d)}</button>`).join("")}</div>${state.date?`<h4>Available times</h4><div class="pc4-times">${times.map(t=>`<button data-action="time" data-id="${t}" class="${state.time===t?'is-selected':''}">${timeLabel(t)}</button>`).join("")}</div>`:""}${state.time?`<a class="pc4-book" href="${esc(bookingUrl())}" target="_blank" rel="noopener noreferrer">Continue with Booksy · ${dateLabel(state.date)} at ${timeLabel(state.time)}</a>`:""}`;

    root.innerHTML=`<div class="pc4-intro"><p>Live booking</p><h2>Choose a category, service, barber, date, and time.</h2><span>Equivalent services are grouped by customer intent. Each barber’s exact price, duration, variant, and live availability remain provider-specific.</span></div><div class="pc4-grid"><section><h3>1. Main Category</h3><div class="pc4-list">${categoryCards}</div></section><section><h3>2. Service</h3><div class="pc4-list">${serviceCards}</div></section><section><h3>3. Barber</h3><div class="pc4-list">${barberCards}</div></section><section><h3>4. Date &amp; Time</h3><div class="pc4-availability">${availability}</div></section></div>`;
  }

  function providersFor(id){ return new Set(services().filter(s=>s.canonicalService===id).map(s=>s.barber.id)).size; }

  document.addEventListener("click", event => {
    const button=event.target.closest("#pc-four-column-booking [data-action]");
    if(!button) return;
    const action=button.dataset.action, id=button.dataset.id;
    if(action==="category"){state.category=id;resetAfter(1);render();}
    if(action==="service"){state.canonical=id;resetAfter(2);render();}
    if(action==="barber"){state.barber=id;state.service=chosenProvider();resetAfter(3);loadSlots();}
    if(action==="date"){state.date=id;state.time=null;render();}
    if(action==="time"){state.time=id;render();}
  });

  async function init(){
    const response=await fetch(CONFIG_URL,{cache:"no-store"});
    state.config=await response.json();
    const attempt=()=>mount() || setTimeout(attempt,100);
    attempt();
  }
  init().catch(console.error);
})();
