(() => {
  "use strict";
  const slides = [
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_01.jpg",href:"#booking-workspace",title:"Book at Precision Cuts",caption:"View live services, barbers, dates, and times"},
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_02.jpg",href:"/barbers/keith-lemon.html",title:"Meet the Founder",caption:"Explore Keith Lemon’s founder profile"},
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_03.jpg",href:"/gallery.html",title:"View the Gallery",caption:"Explore more Precision Cuts work"},
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_04.jpg",href:"/services.html",title:"Browse Services",caption:"Review the Precision Cuts service catalog"},
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_05.jpg",href:"/contact.html",title:"Visit Precision Cuts",caption:"View location, hours, and contact details"}
  ];
  let index=0;
  let timer=null;
  const $=id=>document.getElementById(id);

  function show(next, immediate=false){
    const image=$("pch-transition-image");
    const link=$("pch-transition-link");
    if(!image||!link)return;
    index=(next+slides.length)%slides.length;
    const slide=slides[index];
    const apply=()=>{
      image.src=slide.src;
      image.alt=`Precision Cuts gallery photo ${index+1} of ${slides.length}`;
      link.href=slide.href;
      $("pch-transition-title").textContent=slide.title;
      $("pch-transition-caption").textContent=slide.caption;
      [...$("pch-transition-dots").children].forEach((dot,i)=>dot.setAttribute("aria-current",i===index?"true":"false"));
      image.classList.remove("is-changing");
    };
    if(immediate){apply();return;}
    image.classList.add("is-changing");
    setTimeout(apply,140);
  }

  function start(){
    const dots=$("pch-transition-dots");
    if(!dots)return;
    dots.innerHTML=slides.map((_,i)=>`<button type="button" data-home-slide="${i}" aria-label="Show photo ${i+1}" aria-current="${i===0}"></button>`).join("");
    show(0,true);
    if(!matchMedia("(prefers-reduced-motion: reduce)").matches){timer=setInterval(()=>show(index+1),5000);}
  }

  document.addEventListener("click",event=>{
    const arrow=event.target.closest("[data-home-transition]");
    if(arrow){event.preventDefault();show(index+(arrow.dataset.homeTransition==="next"?1:-1));return;}
    const dot=event.target.closest("[data-home-slide]");
    if(dot){event.preventDefault();show(Number(dot.dataset.homeSlide));}
  });
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();
