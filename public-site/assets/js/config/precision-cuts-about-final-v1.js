(() => {
 "use strict";
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 function findSection(main,re){const n=[...main.querySelectorAll("h1,h2,h3,h4,p,strong,span")].find(x=>re.test(x.textContent));return n?.closest("section,article")||n?.closest("div")||null;}
 function start(){
  if(!/about\.html$/i.test(location.pathname))return;
  const cfg=window.BOOKSY_PORTAL_CONFIG;if(!cfg){document.addEventListener("booksy-portal-config-ready",start,{once:true});return;}
  const main=document.querySelector("main");if(!main)return;
  const founder=cfg.founderSpotlight;const keith=(cfg.barbers||[]).find(b=>b.id==="keith-lemon");if(!founder||!keith)return;
  const intros=[...main.querySelectorAll("section")].filter(s=>/A focused barbering experience/i.test(s.textContent));intros.slice(1).forEach(s=>s.remove());
  [...main.querySelectorAll("section,article")].forEach(s=>{if(/What Clients Say About Precision Cuts/i.test(s.textContent)&&/Ryan/i.test(s.textContent))s.remove();});
  let hero=findSection(main,/Ryan\s+Van\s*Dyke|Ryan\s+Vandyke/i)||main.querySelector("[data-pc-founder-spotlight]");if(!hero){hero=document.createElement("section");main.prepend(hero);}
  hero.className="pc-final-founder-3col";hero.setAttribute("data-pc-final-founder","");
  hero.innerHTML=`<div class="pc-final-founder-shell"><figure><img src="${esc(founder.photo)}" alt="Precision Cuts founder portrait"><figcaption>Founder & Master Barber</figcaption></figure><article><p>Founder spotlight</p><h2>${esc(founder.name)}</h2><h3>${esc(founder.headline)}</h3><p>${esc(founder.summary)}</p><blockquote>“${esc(founder.quote)}”</blockquote><a href="/index.html?barber=keith-lemon#pc-barbers-title">View Keith's availability</a></article><aside class="pc-founder-highlights"><div class="pc-founder-highlight-grid"><div><strong>480+</strong><span>Client reviews</span></div><div><strong>5.0</strong><span>Booksy rating</span></div><div><strong>${keith.services.length}</strong><span>Verified services</span></div><div><strong>Adults + Kids</strong><span>Precision cuts</span></div></div><small>${esc(founder.location)}</small><a href="/services.html">Explore services</a></aside></div>`;
  main.querySelectorAll("[data-pc-founder-spotlight]").forEach(s=>{if(s!==hero)s.remove();});
  const profiles=(cfg.teamProfiles||[]).filter(p=>p.id!=="keith-lemon");let team=main.querySelector("[data-pc-about-barbers]");if(!team){team=document.createElement("section");hero.after(team);}
  team.className="pc-final-team";team.setAttribute("data-pc-about-barbers","");
  team.innerHTML=`<div class="pc-final-team-shell"><header><p>Meet the team</p><h2>About Our Barbers</h2><span>Temporary AI-generated images will be replaced with approved portraits.</span></header><div class="pc-final-team-grid">${profiles.map(p=>`<article><div class="photo"><img src="${esc(p.photo)}" alt="${esc(p.photoAlt)}"><span>AI placeholder</span></div><div class="copy"><h3>${esc(p.name)}</h3><p class="role">${esc(p.title)}</p><p>${esc(p.overview)}</p><small>${esc(p.location)}</small>${p.bookingStatus==="verified-live"?`<a href="/index.html?barber=${encodeURIComponent(p.bookingBarberId)}#pc-barbers-title">View services and availability</a>`:`<em>Profile preview. Live booking will be enabled after Booksy records are verified.</em>`}</div></article>`).join("")}</div></div>`;
  [...main.querySelectorAll("section")].forEach(s=>{if(s!==team&&s!==hero&&/About Our Barbers/i.test(s.textContent))s.remove();});
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(walker.nextNode())walker.currentNode.nodeValue=walker.currentNode.nodeValue.replace(/2501 Hollins Rd NE,?\s*/gi,"").replace(/4211 Plantation Rd NE,?\s*Roanoke,?\s*(VA)?\s*24012/gi,"6423 Williamson Rd, Roanoke, VA 24019").replace(/Plantation (Rd|Road)/gi,"Williamson Road");
 }
 document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();
