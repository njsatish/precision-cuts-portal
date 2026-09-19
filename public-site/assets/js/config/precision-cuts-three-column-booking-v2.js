(() => {
  "use strict";
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const state={category:null,barber:null,service:null,date:null,time:null,slots:[],dateLimit:6,timeLimit:9};
  const label={
    "haircut":"Haircut","haircut-beard":"Haircut & Beard","kids-haircut":"Kid's Haircut","teen-haircut":"Teen Haircut",
    "skin-fade":"Skin Fade","buzz-cut":"Buzz Cut","beard":"Beard Service","line-up":"Line Up / Edge Up",
    "head-shave":"Head Shave","head-shave-beard":"Head Shave & Beard Trim","hot-towel-shave":"Hot Towel Shave",
    "straight-razor-shave":"Straight Razor Shave","eyebrows":"Eyebrows","hair-wash":"Hair Wash","facial":"Facial","full-service":"Full Service"
  };
  const config=()=>window.BOOKSY_PORTAL_CONFIG;
  const barbers=()=>config().barbers.filter(b=>b.active!==false&&b.liveAvailability);
  const apiBase=()=>String(config().booking?.availabilityApiBase||config().bookingProvider?.availabilityApiBase||"").replace(/\/$/,"");
  const preferredServiceSlugs={
    "christopher-meadows":{
      "haircut":"christopher-haircut"
    }
  };
  const servicesFor=(barber,category)=>{
    const matches=(barber.services||[]).filter(service=>service.category===category);
    if(matches.length<=1) return matches;
    const preferredSlug=preferredServiceSlugs[barber.id]?.[category];
    const preferred=matches.find(service=>service.slug===preferredSlug);
    return [preferred||matches[0]];
  };

  function categories(){
    const map=new Map();
    for(const barber of barbers()){
      const barberCategories=[...new Set((barber.services||[]).map(service=>service.category))];
      for(const category of barberCategories){
        const service=servicesFor(barber,category)[0];
        if(!service) continue;
        if(!map.has(category)) map.set(category,{category,name:label[category]||service.name,offers:[]});
        map.get(category).offers.push({barber,service});
      }
    }
    return [...map.values()];
  }

  function workspace(){return document.querySelector("[data-pc-booking-v2]");}
  function selectCategory(category){
    state.category=category; state.barber=null; state.service=null; state.date=null; state.time=null; state.slots=[]; state.dateLimit=6; state.timeLimit=9;
    render(); workspace()?.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function selectBarber(slug){
    const b=barbers().find(x=>x.id===slug); if(!b) return;
    const options=servicesFor(b,state.category); if(!options.length) return;
    state.barber=b; state.service=options[0]; state.date=null; state.time=null; state.slots=[]; state.dateLimit=6; state.timeLimit=9;
    render(); loadAvailability();
  }
  async function loadAvailability(){
    const status=workspace().querySelector("[data-pc-status]");
    status.textContent="Loading verified Booksy availability...";
    try{
      const url=`${apiBase()}/availability/${encodeURIComponent(state.barber.id)}/${encodeURIComponent(state.service.slug)}`;
      const response=await fetch(url,{headers:{Accept:"application/json"},cache:"no-store"});
      const data=await response.json();
      if(!response.ok||data.success!==true||!Array.isArray(data.slots)) throw new Error(data.error||`HTTP ${response.status}`);
      state.slots=data.slots; status.textContent=data.slots.length?"Choose an available date.":"No openings were returned for the next 30 days."; renderDates();
    }catch(error){
      console.error(error); status.textContent="Availability could not be loaded. You can continue to the barber's Booksy profile."; renderDates();
    }
  }
  function renderDates(){
    const root=workspace();
    if(!root) return;

    const allDates=[...new Set(state.slots.map(slot=>slot.date))];
    const dateRoot=root.querySelector("[data-pc-dates]");
    const timeRoot=root.querySelector("[data-pc-times]");
    const bookButton=root.querySelector("[data-pc-open-booksy]");
    const directUrl=buildInstantExperienceUrl();
    if(directUrl){
      bookButton.href=directUrl;
      bookButton.classList.remove("pc-v2-book-disabled");
      bookButton.setAttribute("aria-disabled","false");
      const dateLabel=new Date(`${state.date}T12:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric"});
      bookButton.textContent=`Open selected time in Booksy · ${dateLabel} at ${state.time}`;
    }else{
      bookButton.href="#";
      bookButton.classList.add("pc-v2-book-disabled");
      bookButton.setAttribute("aria-disabled","true");
      bookButton.textContent="Select a date and time to continue";
    }
  }
  function selectedVariantId(){
    return state.service?.variantId || state.service?.booksyVariantId || state.service?.serviceVariantId || null;
  }
  function normalizeBooksyTime(value){
    const raw=String(value||"").trim();
    if(/^\d{2}:\d{2}$/.test(raw)) return raw;
    if(/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw.slice(0,5);
    const match=raw.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if(!match) return null;
    let hour=Number(match[1]);
    if(match[3].toUpperCase()==="AM" && hour===12) hour=0;
    if(match[3].toUpperCase()==="PM" && hour!==12) hour+=12;
    return `${String(hour).padStart(2,"0")}:${match[2]}`;
  }
  function buildInstantExperienceUrl(){
    if(!state.barber||!state.service||!state.date||!state.time) return null;
    const businessId=state.barber.booksyWidgetId||state.barber.booksyBusinessId;
    const variantId=selectedVariantId();
    const time=normalizeBooksyTime(state.time);
    if(!businessId||!variantId||!time) return null;
    const url=new URL(`https://booksy.com/en-us/instant-experiences/widget/${encodeURIComponent(businessId)}`);
    url.searchParams.set("variantId",String(variantId));
    url.searchParams.set("date",`${state.date}T${time}`);
    url.searchParams.set("attribution_source","precision_cuts_portal");
    url.searchParams.set("utm_medium","timeslots");
    url.hash="ba_s=seo";
    return url.toString();
  }
  function openBooksy(){
    const link=document.querySelector("[data-pc-open-booksy]");
    const url=buildInstantExperienceUrl();
    if(link && url){ link.href=url; }
  }
  function render(){
    const root=workspace(); if(!root) return;
    const cats=categories(); if(!state.category) state.category=cats[0]?.category;
    root.querySelector("[data-pc-services]").innerHTML=cats.map(c=>`<button data-category="${esc(c.category)}" class="pc-v2-option ${c.category===state.category?'selected':''}"><strong>${esc(c.name)}</strong><span>${c.offers.length} barber option${c.offers.length===1?'':'s'}</span></button>`).join("");
    const compatible=barbers().filter(b=>servicesFor(b,state.category).length);
    root.querySelector("[data-pc-barbers]").innerHTML=compatible.map(b=>{
      const s=servicesFor(b,state.category)[0];
      return `<button data-barber="${esc(b.id)}" class="pc-v2-barber ${state.barber?.id===b.id?'selected':''}"><img src="${esc(b.photo)}" alt=""><span><strong>${esc(b.name)}</strong><small>${esc(s.name)} · $${esc(s.price)} · ${esc(s.durationMinutes)} min</small></span></button>`;
    }).join("")||"<p>No verified barber mapping is available.</p>";
    root.querySelector("[data-pc-selection]").textContent=state.barber?`${state.barber.name} · ${state.service.name}`:"Select a compatible barber.";
    renderDates();
  }
  // data-pc-direct-link-guard
  document.addEventListener("click",event=>{
    const link=event.target.closest("[data-pc-open-booksy]");
    if(!link) return;
    event.stopImmediatePropagation();
    const href=link.getAttribute("href")||"";
    if(link.getAttribute("aria-disabled")==="true" || !href.includes("/instant-experiences/widget/")){
      event.preventDefault();
    }
  },true);

  function build(){
    const main=document.querySelector("main"); if(!main||workspace()) return;
    const section=document.createElement("section"); section.className="pc-booking-v2"; section.setAttribute("data-pc-booking-v2","");
    section.innerHTML=`<div class="pc-v2-shell"><header><p>Live Booksy availability</p><h2>Choose a service, barber, and time.</h2></header><div class="pc-v2-grid">
      <section><h3>1. Services</h3><div data-pc-services></div></section>
      <section><h3>2. Barbers</h3><div data-pc-barbers></div></section>
      <section><h3>3. Available dates</h3><p data-pc-selection>Select a barber.</p><p data-pc-status>Choose a service and barber to load availability.</p><div class="pc-v2-dates" data-pc-dates></div><div class="pc-v2-times" data-pc-times></div><a class="pc-v2-book pc-v2-book-disabled" data-pc-open-booksy href="#" target="_blank" rel="noopener noreferrer" aria-disabled="true">Select a date and time to continue</a></section>
    </div><section class="pc-v2-catalog"><h2>All Precision Cuts services</h2><div data-pc-catalog></div></section></div>`;
    const barberDirectory=main.querySelector("[data-pc-barber-directory]");
    barberDirectory?barberDirectory.insertAdjacentElement("afterend",section):main.appendChild(section);
    section.querySelector("[data-pc-catalog]").innerHTML=categories().map(c=>`<article><h3>${esc(c.name)}</h3><p>${c.offers.map(o=>`${esc(o.barber.name)}: $${esc(o.service.price)}, ${esc(o.service.durationMinutes)} min`).join("<br>")}</p><button data-category="${esc(c.category)}">Select service</button></article>`).join("");
    section.addEventListener("click",e=>{
      const cat=e.target.closest("[data-category]"); if(cat){selectCategory(cat.dataset.category);return;}
      const barber=e.target.closest("[data-barber]"); if(barber){selectBarber(barber.dataset.barber);return;}
      const moreDates=e.target.closest("[data-more-dates]"); if(moreDates){state.dateLimit+=6;renderDates();return;}
      const changeDate=e.target.closest("[data-change-date]"); if(changeDate){state.date=null;state.time=null;state.timeLimit=9;renderDates();return;}
      const date=e.target.closest("[data-date]"); if(date){state.date=date.dataset.date;state.time=null;state.timeLimit=9;renderDates();return;}
      const moreTimes=e.target.closest("[data-more-times]"); if(moreTimes){state.timeLimit+=9;renderDates();return;}
      const time=e.target.closest("[data-time]"); if(time){state.time=time.dataset.time;renderDates();return;}

    });
    document.addEventListener("click",e=>{
      const top=e.target.closest("[data-select-barber]"); if(!top) return;
      const b=barbers().find(x=>x.id===top.dataset.selectBarber); if(!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const first=b.services?.[0]; if(first){state.category=first.category;render();selectBarber(b.id);workspace().scrollIntoView({behavior:"smooth"});}
    },true);
    render();
  }
  function start(){if(!config()){document.addEventListener("booksy-portal-config-ready",start,{once:true});return;}build();}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();
