(() => {
  "use strict";
  const norm=n=>(n?.textContent||"").replace(/\s+/g," ").trim().toLowerCase();
  const shown=n=>!!(n&&(n.offsetWidth||n.offsetHeight||n.getClientRects().length));
  const titleMatch=(n,kind)=>{
    const t=norm(n);
    if(kind==="services")return /^(1\.?\s*)?services$/.test(t);
    if(kind==="barbers")return /^(2\.?\s*)?barbers$/.test(t);
    return /^(3\.?\s*)?(available dates|availability)$/.test(t);
  };
  const nearestColumn=title=>title?.closest("section,article,[class*='column'],[class*='panel'],[class*='step'],[class*='booking-card']")||title?.parentElement;
  const decorate=()=>{
    const all=[...document.querySelectorAll("h1,h2,h3,h4")].filter(shown);
    const titles=[all.find(n=>titleMatch(n,"services")),all.find(n=>titleMatch(n,"barbers")),all.find(n=>titleMatch(n,"dates"))];
    if(titles.filter(Boolean).length<3)return false;
    const columns=titles.map(nearestColumn);
    if(new Set(columns).size<3)return false;
    const grid=columns[0].parentElement;
    let shell=grid;
    while(shell&&shell!==document.body){const t=norm(shell);if(/live booksy availability/.test(t)&&t.includes("services")&&t.includes("barbers"))break;shell=shell.parentElement}
    if(!shell||shell===document.body)shell=grid.parentElement||grid;
    const headingNode=[...shell.querySelectorAll("h1,h2,h3,p,span")].find(n=>/live booksy availability|choose a service, barber, and time/.test(norm(n)));
    const heading=headingNode?.closest("section,header,div")||headingNode?.parentElement;
    shell.classList.add("pc-dslc-shell-v2");grid.classList.add("pc-dslc-grid-v2");heading?.classList.add("pc-dslc-heading-v2");
    titles.forEach((title,i)=>{title.classList.add("pc-dslc-title-v2");const col=columns[i];col.classList.add("pc-dslc-column-v2");[...col.querySelectorAll("button,a,label,li,[role='button'],[class*='option'],[class*='service'],[class*='barber']")].filter(n=>n!==col&&!n.contains(title)).forEach(n=>n.classList.add("pc-dslc-row-v2"))});
    shell.dataset.darkShellLightCards="v2";return true;
  };
  if(!decorate()){const observer=new MutationObserver(()=>{if(decorate())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),30000)}
})();
