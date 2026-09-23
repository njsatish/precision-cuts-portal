(() => {
  "use strict";
  const norm = value => String(value || "").replace(/\s+/g," ").trim().toLowerCase();
  const setImportant = (node, property, value) => node?.style?.setProperty(property,value,"important");

  function sectionAncestor(node) {
    let current=node;
    while(current && current!==document.body){
      if(current.matches?.("section,main > div,main > article")) return current;
      current=current.parentElement;
    }
    return null;
  }

  function apply() {
    const title=[...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node=>norm(node.textContent)==="choose your barber.");
    if(!title) return false;

    const barberSection=sectionAncestor(title) || title.parentElement?.parentElement;
    if(!barberSection) return false;

    let hero=barberSection.previousElementSibling;
    while(hero && hero.matches?.("script,style,link")) hero=hero.previousElementSibling;
    if(!hero) return false;

    hero.dataset.pcHomeHeroGap="compact";
    barberSection.dataset.pcBarberSectionGap="compact";

    setImportant(hero,"min-height","auto");
    setImportant(hero,"height","auto");
    setImportant(hero,"margin-bottom","0");
    setImportant(hero,"padding-bottom",window.innerWidth<=640?"24px":"40px");

    setImportant(barberSection,"margin-top","0");
    setImportant(barberSection,"padding-top",window.innerWidth<=640?"28px":"44px");

    document.documentElement.dataset.pcHeroBarberGapApplied="true";
    return true;
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();
  window.addEventListener("load",schedule,{once:true});
  window.addEventListener("resize",schedule,{passive:true});
  [100,350,900,1800].forEach(delay=>setTimeout(schedule,delay));
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),15000);
})();
