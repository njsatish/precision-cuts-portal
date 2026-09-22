(() => {
  "use strict";
  const CONFIG_URL="/assets/config/portal.json";
  const API_BASE="https://nju3ryot9c.execute-api.us-east-1.amazonaws.com";
  const ORDER=["keith-lemon","christopher-meadows","ron-the-barber","levar-neal","lamar-the-barber"];
  const state={barber:null,service:null,date:null,time:null,slots:[],datesVisible:6,timesVisible:9,loading:false,error:""};
  let config=null,root=null;
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:Number(value)%1?2:0}).format(Number(value||0));
  const imageOf=b=>b.photoUrl||b.photo||b.profilePhoto||"/assets/images/precision-cuts-logo.png";
  const nameOf=b=>b.displayName||b.name;
  const dateValue=s=>s.date||String(s.start||s.startTime||s.datetime||"").slice(0,10);
  const timeValue=s=>s.time||String(s.start||s.startTime||s.datetime||"").slice(11,16);
  const dateLabel=value=>new Date(`${value}T12:00:00`).toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"});
  const timeLabel=value=>{const [h,m]=String(value).split(":").map(Number);if(Number.isNaN(h))return value;return new Date(2000,0,1,h,m||0).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});};
  const barbers=()=>ORDER.map(id=>(config.barbers||[]).find(item=>item.id===id)).filter(Boolean);
  const service=()=>state.barber?.services?.find(item=>item.slug===state.service)||null;
  const dates=()=>[...new Set(state.slots.map(dateValue).filter(Boolean))];
  const times=()=>state.date?[...new Set(state.slots.filter(slot=>dateValue(slot)===state.date).map(timeValue).filter(Boolean))]:[];

  function bookingUrl(){
    const b=state.barber,s=service();
    if(!b||!s||!state.date||!state.time)return "#";
    const base=s.bookingUrl||b.bookingUrl||b.profileUrl||config.bookingProvider?.profileUrl||config.booksy?.profileUrl||"https://booksy.com/en-us/97909_precision-cuts_barber-shop_134579_roanoke";
    try{
      const url=new URL(base,location.href);
      const variant=s.variantId||s.booksyVariantId;
      const staff=s.stafferId||s.booksyStafferId||b.stafferId||b.booksyStafferId;
      const business=b.booksyBusinessId||b.businessId||97909;
      if(variant)url.searchParams.set("variantId",variant);
      if(staff)url.searchParams.set("stafferId",staff);
      if(business)url.searchParams.set("businessId",business);
      url.searchParams.set("date",`${state.date}T${state.time}`);
      return url.toString();
    }catch(_){return base;}
  }

  async function loadAvailability(){
    const s=service();
    if(!state.barber||!s)return;
    state.loading=true;state.error="";state.slots=[];state.date=null;state.time=null;state.datesVisible=6;state.timesVisible=9;render();
    try{
      const response=await fetch(`${API_BASE}/availability/${encodeURIComponent(state.barber.id)}/${encodeURIComponent(s.slug)}`,{cache:"no-store"});
      if(!response.ok)throw new Error(`Availability HTTP ${response.status}`);
      const payload=await response.json();
      if(payload.success!==true||!Array.isArray(payload.slots))throw new Error("Invalid availability response");
      state.slots=payload.slots;
    }catch(error){state.error="Live availability could not be loaded. Please choose another service or try again.";console.error(error);}
    finally{state.loading=false;render();}
  }

  function render(){
    if(!root)return;
    const s=service(),dateList=dates(),timeList=times();
    root.innerHTML=`
      <div class="pcbf-heading"><p>OPTION 2 · START WITH A BARBER</p><h2>Book by barber</h2><span>Choose a professional first, then select one of that barber’s verified services and a live appointment time.</span></div>
      <div class="pcbf-grid">
        <section class="pcbf-column" aria-labelledby="pcbf-barbers-title"><h3 id="pcbf-barbers-title"><b>1.</b> Barbers</h3><div class="pcbf-barbers">${barbers().map(b=>`<button type="button" data-pcbf-barber="${esc(b.id)}" class="${state.barber?.id===b.id?'is-selected':''}"><img src="${esc(imageOf(b))}" alt=""><span><strong>${esc(nameOf(b))}</strong><small>${b.services.length} verified services</small></span></button>`).join("")}</div></section>
        <section class="pcbf-column" aria-labelledby="pcbf-services-title"><h3 id="pcbf-services-title"><b>2.</b> Services</h3>${!state.barber?'<p class="pcbf-empty">Choose a barber to see services.</p>':`<div class="pcbf-services">${state.barber.services.map(item=>`<button type="button" data-pcbf-service="${esc(item.slug)}" class="${state.service===item.slug?'is-selected':''}"><strong>${esc(item.name)}</strong><small>${Number(item.durationMinutes||item.duration||0)} min · ${money(item.price)}</small></button>`).join("")}</div>`}</section>
        <section class="pcbf-column pcbf-availability" aria-labelledby="pcbf-times-title"><h3 id="pcbf-times-title"><b>3.</b> Available dates &amp; times</h3>${!s?'<p class="pcbf-empty">Choose a service to load live availability.</p>':state.loading?'<p class="pcbf-status">Loading live availability…</p>':state.error?`<p class="pcbf-error">${esc(state.error)}</p>`:!state.slots.length?'<p class="pcbf-empty">No current openings were returned.</p>':`${state.date?`<div class="pcbf-selected-date"><span><small>Selected date</small><strong>${dateLabel(state.date)}</strong></span><button type="button" data-pcbf-action="change-date">Change date</button></div>`:`<div class="pcbf-dates">${dateList.slice(0,state.datesVisible).map(date=>`<button type="button" data-pcbf-date="${date}">${dateLabel(date)}</button>`).join("")}</div>${dateList.length>state.datesVisible?'<button class="pcbf-more" type="button" data-pcbf-action="more-dates">Show more dates</button>':''}`}${state.date?`<h4>Available times</h4><div class="pcbf-times">${timeList.slice(0,state.timesVisible).map(time=>`<button type="button" data-pcbf-time="${time}" class="${state.time===time?'is-selected':''}">${timeLabel(time)}</button>`).join("")}</div>${timeList.length>state.timesVisible?'<button class="pcbf-more" type="button" data-pcbf-action="more-times">Show more times</button>':''}`:''}${state.time?`<a class="pcbf-confirm" href="${esc(bookingUrl())}" target="_blank" rel="noopener noreferrer">Continue with Booksy · ${dateLabel(state.date)} at ${timeLabel(state.time)}</a>`:''}`}</section>
      </div>`;
  }

  function insert(){
    if(document.querySelector("#pc-barber-first-comparison"))return;
    const headings=[...document.querySelectorAll("main h1,main h2,main h3,h4")];
    const dateHeading=headings.find(node=>/^3\.?\s*(available\s+)?dates?/i.test(node.textContent.trim()));
    const workspace=dateHeading?.closest("section")||dateHeading?.parentElement?.parentElement;
    if(!workspace)return;
    root=document.createElement("section");root.id="pc-barber-first-comparison";root.className="pcbf-workspace";root.setAttribute("aria-label","Option 2 barber-first booking workspace");
    workspace.insertAdjacentElement("afterend",root);render();
  }

  document.addEventListener("click",event=>{
    const barberButton=event.target.closest("[data-pcbf-barber]");
    if(barberButton){state.barber=barbers().find(item=>item.id===barberButton.dataset.pcbfBarber)||null;state.service=null;state.date=null;state.time=null;state.slots=[];render();return;}
    const serviceButton=event.target.closest("[data-pcbf-service]");
    if(serviceButton){state.service=serviceButton.dataset.pcbfService;loadAvailability();return;}
    const dateButton=event.target.closest("[data-pcbf-date]");
    if(dateButton){state.date=dateButton.dataset.pcbfDate;state.time=null;state.timesVisible=9;render();return;}
    const timeButton=event.target.closest("[data-pcbf-time]");
    if(timeButton){state.time=timeButton.dataset.pcbfTime;render();return;}
    const action=event.target.closest("[data-pcbf-action]")?.dataset.pcbfAction;
    if(action==="more-dates"){state.datesVisible+=6;render();}
    if(action==="more-times"){state.timesVisible+=9;render();}
    if(action==="change-date"){state.date=null;state.time=null;state.timesVisible=9;render();}
  });

  fetch(CONFIG_URL,{cache:"no-store"}).then(response=>response.json()).then(data=>{config=data;insert();window.addEventListener("load",insert,{once:true});setTimeout(insert,700);}).catch(console.error);
})();
