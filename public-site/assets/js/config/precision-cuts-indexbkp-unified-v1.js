(() => {
  "use strict";
  const norm = value => String(value || "").replace(/\s+/g," ").trim().toLowerCase();
  const textOf = node => norm(node?.textContent);
  const heading = exact => [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
    .find(node => textOf(node) === exact);

  function sectionOf(node) {
    let current=node;
    while(current && current!==document.body){
      if(current.matches?.("section,footer,header,main > div,main > article")) return current;
      current=current.parentElement;
    }
    return node?.parentElement || null;
  }

  function smallestContainer(node, required) {
    const matches=[];
    let current=node;
    while(current && current!==document.body){
      if(current.matches?.("header,section,article,div")){
        const text=textOf(current);
        if(required.every(token=>text.includes(token))) matches.push(current);
      }
      current=current.parentElement;
    }
    matches.sort((a,b)=>a.querySelectorAll("*").length-b.querySelectorAll("*").length);
    return matches[0] || node?.parentElement || null;
  }

  function apply() {
    const header=document.querySelector("body > header, header.site-header, header[role='banner']");
    if(header) header.dataset.pcBkpRole="header";

    const heroTitle=[...document.querySelectorAll("h1,h2,h3")].find(node=>{
      const t=textOf(node);
      return t.includes("precision") && t.includes("in every") && t.includes("cut");
    });
    const hero=sectionOf(heroTitle);
    if(hero){ hero.dataset.pcBkpRole="hero"; hero.dataset.pcBkpSection="true"; }

    const teamTitle=heading("choose your barber.");
    const teamIntro=smallestContainer(teamTitle,["meet the precision cuts team","choose your barber.","five verified professionals"]);
    if(teamIntro) teamIntro.dataset.pcBkpRole="team-intro";
    const team=sectionOf(teamIntro);
    if(team){ team.dataset.pcBkpRole="team"; team.dataset.pcBkpSection="true"; }

    document.querySelectorAll("[data-index-profile-booking], [class*='barber-card'], [class*='profile-card']")
      .forEach(button=>{
        const card=button.closest("article,li,[class*='card'],div");
        if(card && card!==team) card.dataset.pcBkpRole="barber-card";
      });

    const bookingTitle=heading("choose a service, barber, and time.");
    const bookingIntro=smallestContainer(bookingTitle,["live booksy availability","choose a service, barber, and time."]);
    if(bookingIntro) bookingIntro.dataset.pcBkpRole="booking-intro";
    const booking=sectionOf(bookingIntro);
    if(booking){ booking.dataset.pcBkpRole="booking"; booking.dataset.pcBkpSection="true"; }

    const footer=document.querySelector("body > footer, footer");
    if(footer){ footer.dataset.pcBkpRole="footer"; footer.dataset.pcBkpSection="true"; }

    // Remove only empty, non-functional direct section siblings with large computed height.
    document.querySelectorAll("main > div:empty, main > section:empty").forEach(node=>{
      if(node.id || node.className || node.hasAttribute("data-booking")) return;
      if(node.getBoundingClientRect().height > 80) node.dataset.pcBkpSpacer="remove";
    });

    document.documentElement.dataset.pcIndexBkpUnified="true";
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
  [100,350,900,1800].forEach(delay=>setTimeout(schedule,delay));
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),15000);
})();
