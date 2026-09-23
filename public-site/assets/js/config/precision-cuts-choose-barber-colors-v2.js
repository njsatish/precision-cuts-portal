(() => {
  "use strict";
  const norm = value => String(value || "").replace(/\s+/g," ").trim().toLowerCase();
  const important = (node, property, value) => node?.style?.setProperty(property,value,"important");

  function findExactCard(title) {
    let node=title;
    const matches=[];
    while(node && node!==document.body){
      if(node.matches?.("header,section,article,div")){
        const text=norm(node.textContent);
        if(text.includes("meet the precision cuts team") &&
           text.includes("choose your barber.") &&
           text.includes("five verified professionals")){
          matches.push(node);
        }
      }
      node=node.parentElement;
    }
    matches.sort((a,b)=>a.getBoundingClientRect().height-b.getBoundingClientRect().height);
    return matches.find(node=>node.getBoundingClientRect().height>=100) || matches[0];
  }

  function apply(){
    const title=[...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node=>norm(node.textContent)==="choose your barber.");
    if(!title) return false;
    const card=findExactCard(title);
    if(!card) return false;

    card.dataset.pcChooseBarberCard="cream";
    important(card,"background","#fbf7ee");
    important(card,"background-color","#fbf7ee");
    important(card,"background-image","none");
    important(card,"border","1px solid #ded4c4");
    important(card,"border-top","6px solid #d9ad24");
    important(card,"border-radius","20px");
    important(card,"box-shadow","0 18px 42px rgba(72,53,25,.12)");
    important(card,"color","#211712");

    title.dataset.pcChooseBarberTitle="true";
    important(title,"color","#211712");
    important(title,"-webkit-text-fill-color","#211712");

    const textNodes=[...card.querySelectorAll("p,span,small,div")];
    const kicker=textNodes.find(node=>norm(node.textContent)==="meet the precision cuts team");
    const description=textNodes.find(node=>norm(node.textContent).startsWith("five verified professionals"));
    if(kicker){
      kicker.dataset.pcChooseBarberKicker="true";
      important(kicker,"color","#986610");
      important(kicker,"-webkit-text-fill-color","#986610");
    }
    if(description){
      description.dataset.pcChooseBarberDescription="true";
      important(description,"color","#4b3c31");
      important(description,"-webkit-text-fill-color","#4b3c31");
    }
    document.documentElement.dataset.pcChooseBarberCreamApplied="true";
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
  [50,150,400,900,1800,3500].forEach(delay=>setTimeout(schedule,delay));
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),20000);
})();
