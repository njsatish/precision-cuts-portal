(() => {
  "use strict";
  const CONFIG_URL="/assets/config/portal.json";
  const API_BASE="https://nju3ryot9c.execute-api.us-east-1.amazonaws.com";
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const money=value=>`$${Number(value||0).toFixed(Number(value)%1?2:0)}`;
  const dateLabel=value=>new Date(`${value}T12:00:00`).toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"});
  let config,keith;

  function imageOf(barber){return barber.photoUrl||barber.photo||barber.profilePhoto||"/assets/images/precision-cuts-logo.png";}
  function business(){return config.business||config.businessInfo||{};}
  function bookingHref(service){return `/index.html#booking-workspace?barber=keith-lemon${service?`&service=${encodeURIComponent(service.slug)}`:""}`;}

  function renderProfile(){
    $("pcf-photo").src=imageOf(keith);
    $("pcf-service-count").textContent=`${keith.services.length} verified`;
    const biz=business();
    const phone=biz.phone||config.phone||"";
    if(phone){$("pcf-call").href=`tel:${phone.replace(/[^+\d]/g,"")}`;}
    const address=biz.address||config.address||keith.location||"Precision Cuts";
    $("pcf-location").textContent=typeof address==="string"?address:"Precision Cuts";
    $("pcf-address").textContent=typeof address==="string"?address:"Precision Cuts";
    $("pcf-directions").href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(typeof address==="string"?address:"Precision Cuts Roanoke VA")}`;
    const hours=biz.hours||config.hours||[];
    $("pcf-hours").innerHTML=Array.isArray(hours)&&hours.length?hours.map(item=>`<div><strong>${esc(item.day||item.label||"")}</strong> ${esc(item.hours||item.value||"")}</div>`).join(""):`<p>See the Contact page for current business hours.</p>`;
  }

  function renderServices(){
    $("pcf-service-grid").innerHTML=keith.services.map(service=>`<article class="pcf-service-card"><h3>${esc(service.name)}</h3><p class="pcf-service-meta">${Number(service.durationMinutes)} minutes · ${money(service.price)}</p><p>Live availability is provided through Keith’s verified Precision Cuts booking route.</p><div class="pcf-service-actions"><button type="button" data-preview="${esc(service.slug)}">Preview dates</button><a href="${esc(bookingHref(service))}">Open booking</a></div></article>`).join("");
  }

  async function preview(service){
    const target=$("pcf-date-preview");
    target.innerHTML="<p>Loading live dates…</p>";
    $("pcf-availability-service").textContent=`${service.name} · ${Number(service.durationMinutes)} minutes · ${money(service.price)}`;
    $("pcf-full-booking").href=bookingHref(service);
    try{
      const response=await fetch(`${API_BASE}/availability/keith-lemon/${encodeURIComponent(service.slug)}`);
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload=await response.json();
      const dates=[...new Set((payload.slots||[]).map(slot=>slot.date))].slice(0,3);
      target.innerHTML=dates.length?dates.map(date=>`<span class="pcf-date-chip">${esc(dateLabel(date))}</span>`).join(""):'<p>No current dates were returned.</p>';
    }catch(_error){target.innerHTML='<p>Live dates could not be loaded. Open the full booking workspace to try again.</p>';}
  }

  function renderTeam(){
    $("pcf-team-grid").innerHTML=config.barbers.filter(b=>b.id!=="keith-lemon").map(barber=>`<a class="pcf-team-card" href="/index.html#booking-workspace?barber=${encodeURIComponent(barber.id)}"><img src="${esc(imageOf(barber))}" alt=""><span><strong>${esc(barber.displayName||barber.name)}</strong><small>${barber.services.length} verified services</small></span></a>`).join("");
  }

  document.addEventListener("click",event=>{
    const button=event.target.closest("[data-preview]");
    if(!button)return;
    const service=keith.services.find(item=>item.slug===button.dataset.preview);
    if(service)preview(service);
  });

  fetch(CONFIG_URL,{cache:"no-store"}).then(response=>response.json()).then(data=>{
    config=data;
    keith=config.barbers.find(item=>item.id==="keith-lemon");
    if(!keith||keith.services.length!==5)throw new Error("Keith registry is unavailable.");
    renderProfile();renderServices();renderTeam();preview(keith.services[0]);
  }).catch(error=>{console.error(error);$("pcf-service-grid").innerHTML="<p>Keith’s profile data could not be loaded.</p>";});
})();
