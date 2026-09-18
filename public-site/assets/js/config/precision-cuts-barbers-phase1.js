(() => {
  "use strict";

  const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

  function getBarbers(config){
    return (config.barbers||[]).filter(barber=>barber.active!==false);
  }

  function selectBarber(barber){
    localStorage.setItem("precisionCutsSelectedBarber",barber.id);
    if(barber.liveAvailability){
      location.href=`/book.html?barber=${encodeURIComponent(barber.id)}`;
    }else{
      location.href=barber.profileUrl;
    }
  }

  function renderHome(config,barbers){
    if(!/(?:^|\/)index\.html$|\/$/.test(location.pathname)) return;
    const main=document.querySelector("main");
    if(!main) return;

    const existing=main.querySelector("[data-pc-barber-directory]");
    const section=existing||document.createElement("section");
    section.className="pc-barber-directory-phase1";
    section.setAttribute("data-pc-barber-directory","");
    section.setAttribute("aria-labelledby","pc-barbers-title");
    section.innerHTML=`
      <div class="pc-barbers-shell">
        <header class="pc-barbers-heading">
          <p class="pc-barbers-kicker">Meet the team</p>
          <h2 id="pc-barbers-title">Choose your barber.</h2>
          <p>Each specialist manages a separate Booksy profile. Keith currently supports live dates and times on this website. Christopher and Ron continue securely to their Booksy pages.</p>
        </header>
        <div class="pc-barbers-grid">
          ${barbers.map(barber=>`
            <article class="pc-barber-card" data-barber-id="${escapeHtml(barber.id)}">
              <img src="${escapeHtml(barber.photo)}" alt="Selected Precision Cuts work associated with ${escapeHtml(barber.name)}" loading="lazy" decoding="async">
              <div class="pc-barber-card-body">
                <p class="pc-barber-status">${barber.liveAvailability?"Live availability":"Booksy booking"}</p>
                <h3>${escapeHtml(barber.name)}</h3>
                <p class="pc-barber-title">${escapeHtml(barber.title)}</p>
                <ul>${barber.specialties.map(item=>`<li>${escapeHtml(item)}</li>`).join("")}</ul>
                <button type="button" class="pc-barber-cta" data-select-barber="${escapeHtml(barber.id)}">
                  ${barber.liveAvailability?`View ${escapeHtml(barber.name.split(" ")[0])}'s availability`:`Book with ${escapeHtml(barber.name.split(" ")[0])} on Booksy`}
                </button>
              </div>
            </article>`).join("")}
        </div>
      </div>`;

    if(!existing){
      const portfolio=[...main.querySelectorAll("h2")].find(h=>/detail you can see/i.test(h.textContent))?.closest("section");
      if(portfolio) portfolio.insertAdjacentElement("beforebegin",section);
      else main.appendChild(section);
    }

    section.addEventListener("click",event=>{
      const button=event.target.closest("[data-select-barber]");
      if(!button) return;
      const barber=barbers.find(item=>item.id===button.dataset.selectBarber);
      if(barber) selectBarber(barber);
    });
  }

  function renderBook(config,barbers){
    if(!/book\.html$/i.test(location.pathname)) return;
    const params=new URLSearchParams(location.search);
    const requested=params.get("barber")||localStorage.getItem("precisionCutsSelectedBarber")||barbers[0]?.id;
    const barber=barbers.find(item=>item.id===requested)||barbers[0];
    if(!barber) return;
    localStorage.setItem("precisionCutsSelectedBarber",barber.id);

    const main=document.querySelector("main");
    if(!main) return;
    let banner=main.querySelector("[data-selected-barber-banner]");
    if(!banner){
      banner=document.createElement("section");
      banner.className="pc-selected-barber-banner";
      banner.setAttribute("data-selected-barber-banner","");
      main.prepend(banner);
    }
    banner.innerHTML=`
      <div>
        <p>Booking with</p>
        <h2>${escapeHtml(barber.name)}</h2>
        <span>${escapeHtml(barber.title)}</span>
      </div>
      <a href="/index.html#pc-barbers-title">Change barber</a>`;

    document.querySelectorAll("[data-booksy-link],[data-booking-continue]").forEach(link=>{
      link.href=barber.profileUrl;
      link.setAttribute("aria-label",`Open ${barber.name} on Booksy`);
    });

    if(!barber.liveAvailability){
      document.querySelectorAll("[data-booking-date],[data-booking-refresh],[data-refresh-availability]").forEach(control=>{
        control.disabled=true;
      });
      const status=document.querySelector("[data-booking-status]");
      if(status) status.textContent=`Live website availability for ${barber.name} will be added after service and staffer IDs are verified.`;
      const slots=document.querySelector("[data-booking-slots],[data-availability-slots]");
      if(slots) slots.innerHTML=`<a class="pp-button pp-button-primary" href="${escapeHtml(barber.profileUrl)}">Book with ${escapeHtml(barber.name)} on Booksy</a>`;
    }
  }

  function start(){
    const config=window.BOOKSY_PORTAL_CONFIG;
    if(!config){
      document.addEventListener("booksy-portal-config-ready",start,{once:true});
      return;
    }
    const barbers=getBarbers(config);
    if(barbers.length!==3){
      console.error(`Expected 3 active Precision Cuts barbers, received ${barbers.length}.`);
      return;
    }
    renderHome(config,barbers);
    renderBook(config,barbers);
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",start,{once:true})
    : start();
})();
