(() => {
  "use strict";

  const ids = ["keith-lemon","christopher-meadows","ron-the-barber","levar-neal","lamar-the-barber"];
  const directIds = new Set(["levar-neal","lamar-the-barber"]);
  const liveIds = new Set(["keith-lemon","christopher-meadows","ron-the-barber"]);
  const names = {
    "keith-lemon":"Keith Lemon",
    "christopher-meadows":"Christopher Meadows",
    "ron-the-barber":"Ron The Barber",
    "levar-neal":"Var da Barber",
    "lamar-the-barber":"Lamar the barber"
  };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const norm = value => String(value || "").replace(/\s+/g," ").trim().toLowerCase();
  let activeId = null;
  let initialized = false;

  function config(){ return window.BOOKSY_PORTAL_CONFIG || null; }
  function registry(){ return new Map((config()?.barbers || []).map(item => [item.id,item])); }

  function panel(title){
    const marker=[...document.querySelectorAll("h1,h2,h3,h4,h5,strong")]
      .find(node => norm(node.textContent).includes(title));
    return marker?.closest("section,article") || marker?.closest("div") || null;
  }

  function panelBody(container,title){
    if(!container) return null;
    const children=[...container.children];
    const header=children.find(child => norm(child.textContent).includes(title));
    const after=header ? children.slice(children.indexOf(header)+1) : children;
    return after.find(child => child.matches("div,ul,ol")) || container;
  }

  function photo(barber){ return barber.photoUrl || barber.photo || barber.profilePhoto || ""; }
  function price(value){ const n=Number(value); return Number.isFinite(n)?`$${n.toFixed(0)}`:""; }

  function ensureDirectCards(){
    const barbersPanel=panel("2. barbers");
    const body=panelBody(barbersPanel,"2. barbers");
    if(!body) return false;
    let host=body.querySelector("[data-pc-v3-direct-barbers]");
    if(!host){
      host=document.createElement("div");
      host.className="pc-v3-direct-barbers";
      host.dataset.pcV3DirectBarbers="";
      body.appendChild(host);
    }
    const reg=registry();
    for(const id of directIds){
      const barber=reg.get(id);
      if(!barber || host.querySelector(`[data-pc-v3-barber="${id}"]`)) continue;
      const card=document.createElement("button");
      card.type="button";
      card.className="pc-v3-barber-card";
      card.dataset.pcV3Barber=id;
      card.innerHTML=`
        <span class="pc-v3-avatar">${photo(barber)?`<img src="${esc(photo(barber))}" alt="" loading="lazy">`:esc(names[id][0])}</span>
        <span><strong>${esc(names[id])}</strong><small>${esc(barber.title)}</small><em>Verified Booksy services</em></span>`;
      card.addEventListener("click",()=>selectBarber(id,true));
      host.appendChild(card);
    }
    return true;
  }

  function liveCard(id){
    const barbersPanel=panel("2. barbers");
    if(!barbersPanel) return null;
    const target=norm(names[id]);
    return [...barbersPanel.querySelectorAll("button,article,a,div")]
      .filter(node => !node.closest("[data-pc-v3-direct-barbers]"))
      .find(node => norm(node.textContent).includes(target) && (node.matches("button,a,article") || node.querySelector("button,a"))) || null;
  }

  function servicesHost(){
    const servicesPanel=panel("1. services");
    if(!servicesPanel) return null;
    let host=servicesPanel.querySelector("[data-pc-v3-services]");
    if(!host){
      host=document.createElement("section");
      host.className="pc-v3-services";
      host.dataset.pcV3Services="";
      const body=panelBody(servicesPanel,"1. services");
      if(body && body!==servicesPanel) body.prepend(host); else servicesPanel.appendChild(host);
    }
    return host;
  }

  function resultHost(){
    const datesPanel=panel("3. available dates");
    if(!datesPanel) return null;
    let host=datesPanel.querySelector("[data-pc-v3-result]");
    if(!host){ host=document.createElement("div"); host.dataset.pcV3Result=""; datesPanel.appendChild(host); }
    return host;
  }

  function renderDirectServices(barber){
    const host=servicesHost();
    if(!host) return false;
    const services=barber.services || [];
    host.innerHTML=`
      <header><p>SELECTED BARBER SERVICES</p><h3>${esc(names[barber.id])}</h3><span>${services.length} verified services</span></header>
      <div>${services.map((service,index)=>`<button type="button" data-index="${index}"><span><strong>${esc(service.name)}</strong><small>${esc(service.durationMinutes || service.duration)} min · ${price(service.price)}</small></span><em>Select</em></button>`).join("")}</div>`;
    host.classList.add("is-visible");
    host.querySelectorAll("[data-index]").forEach(button=>button.addEventListener("click",()=>{
      host.querySelectorAll("button.is-selected").forEach(item=>item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      renderDirectResult(barber,services[Number(button.dataset.index)]);
    }));
    renderDirectResult(barber,null);
    return true;
  }

  function renderDirectResult(barber,service){
    const host=resultHost(); if(!host) return;
    host.innerHTML=`<div class="pc-v3-result"><p>VERIFIED BOOKSY PROFILE</p><h3>${esc(names[barber.id])}</h3>${service?`<section><strong>${esc(service.name)}</strong><span>${esc(service.durationMinutes || service.duration)} min · ${price(service.price)}</span></section>`:`<section><strong>Select a service from the Services column.</strong></section>`}<small>Review the service here, then continue to the verified Booksy profile for available dates and times.</small><a href="${esc(barber.booksyUrl)}" target="_blank" rel="noopener noreferrer">Continue to Booksy</a></div>`;
  }

  function hideDirectUI(){
    const host=servicesHost();
    if(host){ host.classList.remove("is-visible"); host.innerHTML=""; }
    const result=resultHost();
    if(result) result.innerHTML="";
  }

  function selectLive(id){
    hideDirectUI();
    const card=liveCard(id);
    if(!card) return false;
    const clickable=card.matches("button")?card:card.querySelector("button") || card;
    clickable.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window}));
    return true;
  }

  function selectBarber(id,scroll=true,attempt=0){
    if(!ids.includes(id)) return;
    const reg=registry();
    const barber=reg.get(id);
    if(!barber || !ensureDirectCards() || !panel("1. services") || !panel("2. barbers")){
      if(attempt<30) setTimeout(()=>selectBarber(id,scroll,attempt+1),100);
      return;
    }
    activeId=id;
    document.querySelectorAll(".pc-v3-barber-card.is-selected").forEach(item=>item.classList.remove("is-selected"));
    if(directIds.has(id)){
      document.querySelector(`[data-pc-v3-barber="${id}"]`)?.classList.add("is-selected");
      renderDirectServices(barber);
    } else if(liveIds.has(id)){
      selectLive(id);
    }
    const target=panel("1. services")?.parentElement || panel("1. services");
    if(scroll && target) setTimeout(()=>target.scrollIntoView({behavior:"smooth",block:"start"}),60);
  }

  function idFromHomepageLink(link){
    const href=link.getAttribute("href") || "";
    const query=href.includes("?")?href.split("?",2)[1]:"";
    const id=new URLSearchParams(query).get("barber");
    if(ids.includes(id)) return id;
    const text=norm(link.closest("article")?.textContent || link.textContent);
    return ids.find(candidate=>text.includes(norm(names[candidate]))) || null;
  }

  function handleHomepageCard(event){
    const link=event.target.closest(".pc-home-barber-action");
    if(!link) return;
    const id=idFromHomepageLink(link);
    if(!id) return;
    event.preventDefault();
    history.replaceState(null,"",`#booking-workspace?barber=${encodeURIComponent(id)}`);
    selectBarber(id,true);
  }

  function initialize(){
    if(!config()) return;
    ensureDirectCards();
    if(!initialized){ document.addEventListener("click",handleHomepageCard,true); initialized=true; }
    const hash=location.hash.replace(/^#/,"");
    if(hash.startsWith("booking-workspace")){
      const id=new URLSearchParams(hash.split("?",2)[1] || "").get("barber");
      if(ids.includes(id)) selectBarber(id,true);
    }
  }

  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",initialize,{once:true}):initialize();
  document.addEventListener("booksy-portal-config-ready",initialize);
  window.addEventListener("load",initialize,{once:true});
  window.addEventListener("hashchange",initialize);
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureDirectCards();});});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),8000);
})();
