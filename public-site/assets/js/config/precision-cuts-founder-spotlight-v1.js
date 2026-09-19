(() => {
  "use strict";
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  function start(){
    if(!/about\.html$/i.test(location.pathname)) return;
    const config=window.BOOKSY_PORTAL_CONFIG;
    if(!config){document.addEventListener("booksy-portal-config-ready",start,{once:true});return;}
    const founder=config.founderSpotlight;
    const keith=(config.barbers||[]).find(b=>b.id===founder?.barberId);
    if(!founder||!keith) return;
    const main=document.querySelector("main");
    if(!main||main.querySelector("[data-pc-founder-spotlight]")) return;
    const section=document.createElement("section");
    section.className="pc-founder-spotlight-v1";
    section.setAttribute("data-pc-founder-spotlight","");
    section.setAttribute("aria-labelledby","pc-founder-title");
    section.innerHTML=`<div class="pc-founder-shell"><figure><img src="${esc(founder.photo)}" alt="Precision Cuts founder portrait" loading="eager" decoding="async"><figcaption>Founder & Master Barber</figcaption></figure><div class="pc-founder-copy"><p class="pc-founder-eyebrow">${esc(founder.eyebrow)}</p><h2 id="pc-founder-title">${esc(founder.headline)}</h2><h3>${esc(founder.name)}</h3><p class="pc-founder-role">${esc(founder.role)} · ${esc(founder.location)}</p><p class="pc-founder-summary">${esc(founder.summary)}</p><blockquote>“${esc(founder.quote)}”</blockquote><div class="pc-founder-services"><span>${keith.services.length} verified services</span>${keith.services.slice(0,3).map(service=>`<span>${esc(service.name)} · $${esc(service.price)}</span>`).join("")}</div><div class="pc-founder-actions"><a class="pc-founder-primary" href="/index.html?barber=keith-lemon#pc-barbers-title">View Keith's availability</a><a class="pc-founder-secondary" href="/services.html">Explore all services</a></div></div></div>`;
    const team=main.querySelector("[data-pc-about-barbers]");
    if(team) team.insertAdjacentElement("beforebegin",section);
    else main.appendChild(section);
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();
