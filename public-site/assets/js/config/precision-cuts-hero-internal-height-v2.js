(() => {
  "use strict";
  const norm = value => String(value || "").replace(/\s+/g," ").trim().toLowerCase();
  const important = (node, property, value) => node?.style?.setProperty(property,value,"important");

  function findHero(title) {
    let node=title;
    const candidates=[];
    while(node && node!==document.body){
      if(node.matches?.("section,article,main > div")){
        const text=norm(node.textContent);
        const hasHeroCopy=text.includes("precision") && text.includes("in every") && text.includes("cut");
        const hasActions=text.includes("book now") && text.includes("about precision cuts");
        const hasMedia=Boolean(node.querySelector("img,video,picture"));
        if(hasHeroCopy && hasActions && hasMedia) candidates.push(node);
      }
      node=node.parentElement;
    }
    candidates.sort((a,b)=>a.querySelectorAll("*").length-b.querySelectorAll("*").length);
    return candidates[0] || null;
  }

  function apply(){
    const title=[...document.querySelectorAll("h1,h2,h3")].find(node=>{
      const text=norm(node.textContent);
      return text.includes("precision") && text.includes("in every") && text.includes("cut");
    });
    if(!title) return false;

    const hero=findHero(title);
    if(!hero) return false;
    hero.dataset.pcHomeHeroInternal="compact";

    important(hero,"min-height","0");
    important(hero,"height","auto");
    important(hero,"block-size","auto");
    important(hero,"max-height","none");
    important(hero,"margin-bottom","0");
    important(hero,"padding-bottom",window.innerWidth<=640?"24px":"32px");
    important(hero,"align-content","start");

    // Clear only layout wrappers that contain both the hero copy and visual.
    for(const child of hero.children){
      const text=norm(child.textContent);
      const containsTitle=child.contains(title);
      const containsMedia=Boolean(child.querySelector("img,video,picture"));
      if((containsTitle && containsMedia) || (text.includes("book now") && containsMedia)){
        child.dataset.pcHomeHeroInner="compact";
        important(child,"min-height","0");
        important(child,"height","auto");
        important(child,"block-size","auto");
        important(child,"max-height","none");
        important(child,"margin-bottom","0");
        important(child,"padding-bottom","0");
      }
    }

    document.documentElement.dataset.pcHeroInternalHeightApplied="true";
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
  [80,250,700,1400,2800].forEach(delay=>setTimeout(schedule,delay));
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),15000);
})();
