(() => {
  "use strict";
  const CHRISTOPHER="christopher-meadows";
  const HIDE=new Set([
    "christopher-mens-haircut",
    "christopher-buzz-cut",
    "christopher-beard-trim",
    "christopher-edge-up",
    "christopher-hair-wash",
    "christopher-facial"
  ]);
  const LABELS={
    "christopher-beard-shaping":"Beard Trim / Beard Shaping",
    "christopher-line-up":"Line Up / Edge Up",
    "christopher-eyebrow-shaping":"Eyebrow Shaping / Hair Wash"
  };
  const norm=value=>String(value||"").replace(/&/g," and ").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase();
  const outsidePopup=node=>!node.closest("#pc-home-booking-modal");

  function selectedChristopher(){
    const selected=[...document.querySelectorAll("[aria-selected='true'],.is-selected,.selected,[data-selected='true']")]
      .filter(outsidePopup)
      .some(node=>norm(node.textContent).includes("christopher-meadows")||node.dataset.barberId===CHRISTOPHER||node.dataset.barber===CHRISTOPHER);
    const selects=[...document.querySelectorAll("select")].filter(outsidePopup);
    return selected||selects.some(select=>select.value===CHRISTOPHER);
  }

  function slugOf(node){
    const candidates=[
      node.dataset.serviceSlug,node.dataset.slug,node.dataset.service,
      node.getAttribute("value"),node.getAttribute("data-value"),node.id
    ].filter(Boolean).map(norm);
    for(const slug of [...HIDE,...Object.keys(LABELS)]){
      if(candidates.some(value=>value===slug||value.includes(slug))) return slug;
    }
    const text=norm(node.textContent);
    const names={
      "mens-haircut":"christopher-mens-haircut","buzz-cut":"christopher-buzz-cut",
      "beard-trim":"christopher-beard-trim","edge-up":"christopher-edge-up",
      "hair-wash":"christopher-hair-wash","facial":"christopher-facial",
      "beard-shaping":"christopher-beard-shaping","line-up":"christopher-line-up",
      "eyebrow-shaping":"christopher-eyebrow-shaping"
    };
    for(const [name,slug] of Object.entries(names)) if(text.includes(name)) return slug;
    return "";
  }

  function serviceRows(){
    return [...document.querySelectorAll("button,[role='button'],option,li,article,[data-service-slug],[data-service]")]
      .filter(outsidePopup)
      .filter(node=>Boolean(slugOf(node)));
  }

  function apply(){
    if(!selectedChristopher()) return false;
    let hidden=0,grouped=0;
    for(const row of serviceRows()){
      const slug=slugOf(row);
      if(HIDE.has(slug)){
        row.hidden=true;
        row.style.setProperty("display","none","important");
        row.dataset.pcChristopherGeneralHidden="true";
        hidden+=1;
      }else if(LABELS[slug]){
        const title=row.querySelector("h1,h2,h3,h4,strong,b,[data-service-name]")||row;
        if(title===row && row.children.length) continue;
        title.textContent=LABELS[slug];
        row.dataset.pcChristopherGeneralCanonical=slug;
        grouped+=1;
      }
    }
    document.documentElement.dataset.pcChristopherGeneralHiddenCount=String(hidden);
    document.documentElement.dataset.pcChristopherGeneralTarget="12";
    return hidden>=6;
  }

  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
  document.addEventListener("click",schedule,true);
  document.addEventListener("change",schedule,true);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
  window.addEventListener("load",schedule,{once:true});
  [100,300,700,1500,3000].forEach(delay=>setTimeout(schedule,delay));
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class","aria-selected","data-selected"]});
  setTimeout(()=>observer.disconnect(),20000);
})();
