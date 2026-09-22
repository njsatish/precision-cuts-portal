(() => {
  "use strict";
  const CONFIG_URL="/assets/config/portal.json";
  const API_BASE="https://nju3ryot9c.execute-api.us-east-1.amazonaws.com";
  let config=null,modal=null,barber=null,service=null,slots=[];
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const nameOf=item=>item?.displayName||item?.name||"";
  const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:Number(value)%1?2:0}).format(Number(value||0));
  const dateOf=slot=>slot.date||String(slot.start||slot.startTime||slot.datetime||"").slice(0,10);
  const timeOf=slot=>slot.time||String(slot.start||slot.startTime||slot.datetime||"").slice(11,16);
  const dateLabel=value=>new Date(`${value}T12:00:00`).toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"});
  const timeLabel=value=>{const match=String(value).match(/^(\d{1,2}):(\d{2})/);if(!match)return value;return new Date(2000,0,1,Number(match[1]),Number(match[2])).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});};

  function buildModal(){
    if(modal)return modal;
    modal=document.createElement("div");
    modal.id="pc-home-booking-modal";
    modal.hidden=true;
    modal.innerHTML=`<div class="pchbm-backdrop" data-pchbm-close></div><section class="pchbm-dialog" role="dialog" aria-modal="true" aria-labelledby="pchbm-title"><button class="pchbm-close" type="button" data-pchbm-close aria-label="Close booking">×</button><header><p>PRECISION CUTS ROANOKE</p><h2 id="pchbm-title">Book Your Chair</h2><span>Select your barber, service, and a live appointment time.</span></header><form id="pchbm-form"><label class="pchbm-wide"><span>Barber</span><select id="pchbm-barber" required></select></label><label class="pchbm-wide"><span>Service</span><select id="pchbm-service" required disabled><option>Choose a barber first</option></select></label><label><span>Date</span><select id="pchbm-date" required disabled><option>Choose a service first</option></select></label><label><span>Time</span><select id="pchbm-time" required disabled><option>Choose a date first</option></select></label><p id="pchbm-status" class="pchbm-status" aria-live="polite"></p><a id="pchbm-submit" class="pchbm-submit pchbm-wide is-disabled" href="#" target="_blank" rel="noopener noreferrer" aria-disabled="true">Select a date and time</a></form></section>`;
    document.body.appendChild(modal);
    modal.addEventListener("click",event=>{if(event.target.closest("[data-pchbm-close]"))close();});
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!modal.hidden)close();});
    modal.querySelector("#pchbm-barber").addEventListener("change",onBarber);
    modal.querySelector("#pchbm-service").addEventListener("change",onService);
    modal.querySelector("#pchbm-date").addEventListener("change",onDate);
    modal.querySelector("#pchbm-time").addEventListener("change",updateSubmit);
    return modal;
  }

  function setStatus(message,error=false){const node=buildModal().querySelector("#pchbm-status");node.textContent=message;node.classList.toggle("is-error",error);}
  function populateBarbers(selectedId=""){
    const select=buildModal().querySelector("#pchbm-barber");
    const barbers=(config?.barbers||[]).filter(item=>item.active!==false);
    select.innerHTML=`<option value="">Choose a barber</option>${barbers.map(item=>`<option value="${esc(item.id)}" ${item.id===selectedId?'selected':''}>${esc(nameOf(item))} · ${item.services.length} services</option>`).join("")}`;
    if(selectedId)select.dispatchEvent(new Event("change"));
  }
  function onBarber(){
    const id=modal.querySelector("#pchbm-barber").value;
    barber=(config.barbers||[]).find(item=>item.id===id)||null;service=null;slots=[];
    const select=modal.querySelector("#pchbm-service");
    select.disabled=!barber;
    select.innerHTML=barber?`<option value="">Choose a service</option>${barber.services.map(item=>`<option value="${esc(item.slug)}">${esc(item.name)} (${money(item.price)} · ${Number(item.durationMinutes||0)}m)</option>`).join("")}`:'<option>Choose a barber first</option>';
    resetAvailability("Choose a service to load live dates and times.");
  }
  function resetAvailability(message=""){
    const date=modal.querySelector("#pchbm-date"),time=modal.querySelector("#pchbm-time");
    date.disabled=true;time.disabled=true;date.innerHTML='<option value="">Choose a service first</option>';time.innerHTML='<option value="">Choose a date first</option>';setStatus(message);updateSubmit();
  }
  async function onService(){
    const slug=modal.querySelector("#pchbm-service").value;
    service=barber?.services?.find(item=>item.slug===slug)||null;slots=[];resetAvailability("");
    if(!service)return;
    setStatus("Loading live availability…");
    try{
      const response=await fetch(`${API_BASE}/availability/${encodeURIComponent(barber.id)}/${encodeURIComponent(service.slug)}`,{cache:"no-store"});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const payload=await response.json();
      if(payload.success!==true||!Array.isArray(payload.slots))throw new Error("Invalid availability response");
      slots=payload.slots;
      const dates=[...new Set(slots.map(dateOf).filter(Boolean))];
      const date=modal.querySelector("#pchbm-date");date.disabled=!dates.length;date.innerHTML=`<option value="">Choose a date</option>${dates.map(value=>`<option value="${value}">${dateLabel(value)}</option>`).join("")}`;
      setStatus(dates.length?`${dates.length} live dates available.`:"No current openings were returned.",!dates.length);
    }catch(error){console.error(error);setStatus("Live availability could not be loaded. Please try another service.",true);}
    updateSubmit();
  }
  function onDate(){
    const value=modal.querySelector("#pchbm-date").value;
    const times=[...new Set(slots.filter(item=>dateOf(item)===value).map(timeOf).filter(Boolean))];
    const select=modal.querySelector("#pchbm-time");select.disabled=!times.length;select.innerHTML=`<option value="">Choose a time</option>${times.map(time=>`<option value="${time}">${timeLabel(time)}</option>`).join("")}`;setStatus(times.length?`${times.length} live times available on ${dateLabel(value)}.`:"No times are available on that date.",!times.length);updateSubmit();
  }
  function updateSubmit(){
    const root=buildModal();
    const link=root.querySelector("#pchbm-submit");
    const date=root.querySelector("#pchbm-date").value;
    const time=root.querySelector("#pchbm-time").value;
    const ready=Boolean(barber&&service&&date&&time);
    link.classList.toggle("is-disabled",!ready);
    link.setAttribute("aria-disabled",String(!ready));
    link.href=ready?bookingUrl():"#";
    link.textContent=ready?`Continue with Booksy · ${dateLabel(date)} at ${timeLabel(time)}`:"Select a date and time";
    link.dataset.selectedDate=date||"";
    link.dataset.selectedTime=time||"";
  }
  function bookingUrl(){
    const root=buildModal();
    const date=root.querySelector("#pchbm-date").value;
    const time=root.querySelector("#pchbm-time").value;
    if(!barber||!service||!date||!time)return "#";

    const business=barber.booksyBusinessId||barber.businessId||config.booksyBusinessId||config.booksy?.businessId||97909;
    const widget=barber.booksyWidgetId||barber.widgetId||config.booksyWidgetId||config.booksy?.widgetId;
    const variant=service.variantId||service.booksyVariantId;
    const serviceId=service.serviceId||service.booksyServiceId;
    const staff=service.stafferId||service.booksyStafferId||barber.stafferId||barber.booksyStafferId;

    // Use only absolute Booksy URLs. Relative values such as
    // "christopher-meadows" are profile slugs and must never resolve against
    // localhost or the Precision Cuts domain.
    const candidates=[
      service.bookingUrl,
      service.instantExperienceUrl,
      barber.bookingUrl,
      barber.instantExperienceUrl,
      barber.booksyUrl,
      config.bookingProvider?.profileUrl,
      config.booksy?.bookingUrl,
      config.booksy?.instantExperienceUrl
    ].filter(value=>typeof value==="string"&&/^https:\/\/(?:www\.)?booksy\.com\//i.test(value));

    const base=candidates[0]||(
      widget
        ?`https://booksy.com/widget/instant-experiences/${encodeURIComponent(widget)}`
        :`https://booksy.com/en-us/dl/show-business/${encodeURIComponent(business)}`
    );

    const url=new URL(base);
    if(business)url.searchParams.set("businessId",String(business));
    if(staff)url.searchParams.set("stafferId",String(staff));
    if(serviceId)url.searchParams.set("serviceId",String(serviceId));
    if(variant)url.searchParams.set("variantId",String(variant));
    url.searchParams.set("date",date);
    url.searchParams.set("time",time);
    url.searchParams.set("start",`${date}T${time}`);
    return url.toString();
  }
  function close(){if(!modal)return;modal.hidden=true;document.documentElement.classList.remove("pchbm-open");}

  buildModal().querySelector("#pchbm-submit").addEventListener("click",event=>{
    const link=event.currentTarget;
    if(link.getAttribute("aria-disabled")==="true"){
      event.preventDefault();
      setStatus("Select a barber, service, date, and time first.",true);
      return;
    }
    setStatus(`Opening Booksy for ${dateLabel(link.dataset.selectedDate)} at ${timeLabel(link.dataset.selectedTime)}…`);
  });

  window.openPrecisionCutsHomeBooking=open;
  document.addEventListener("click",event=>{
    const barberLink=event.target.closest("[data-pick-barber]");
    if(barberLink){event.preventDefault();event.stopImmediatePropagation();open(barberLink.dataset.pickBarber);return;}
    const book=event.target.closest("a.pcx-book,button.pcx-book,[href='#booking']");
    if(book&&!book.closest("#pc-home-booking-modal")){event.preventDefault();open(book.dataset.barber||"");}
  },true);
})();
