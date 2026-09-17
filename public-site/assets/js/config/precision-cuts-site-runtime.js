(() => {
  "use strict";

  const clean=value=>String(value||"").replace(/\s+/g," ").trim();
  const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(value||0));

  function start(){
    const config=window.BOOKSY_PORTAL_CONFIG;
    if(!config){ document.addEventListener("booksy-portal-config-ready",start,{once:true}); return; }
    const business=config.business;
    const provider=config.bookingProvider;
    const services=config.services.filter(service=>service.active!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));

    document.title=document.title.replace(/Headlines/gi,business.name).replace(/Proud Pops/gi,business.name);

    document.querySelectorAll("img").forEach(image=>{
      const src=image.getAttribute("src")||"";
      if(/headlines-logo|proud-pops|favicon\.png/i.test(src)) image.src=business.logo || config.brand.logo;
      if(/Headlines logo|Proud Pops/i.test(image.alt||"")) image.alt=`${business.name} logo`;
    });

    document.querySelectorAll("a[href]").forEach(link=>{
      const href=link.getAttribute("href")||"";
      const text=clean(link.textContent).toLowerCase();
      if(href.startsWith("tel:") || /call( now| precision cuts)?/.test(text)) link.href=`tel:${business.phoneHref}`;
      if(/maps\.google|google\.com\/maps/.test(href) || /directions/.test(text)) link.href=business.mapsUrl;
      if(/facebook\.com/.test(href)) link.href=business.facebookUrl;
      if(/booksy\.com/.test(href) && !/instant-experiences/.test(href)) link.href=provider.profileUrl;
      if(/about headlines/i.test(link.textContent)) link.textContent="About Precision Cuts";
    });

    document.querySelectorAll("body *:not(script):not(style)").forEach(element=>{
      if(element.children.length) return;
      const value=element.textContent;
      if(!value) return;
      element.textContent=value
        .replace(/Headlines/g,"Precision Cuts")
        .replace(/HEADLINES/g,"PRECISION CUTS")
        .replace(/Ryan's Services/gi,"Precision Cuts Services")
        .replace(/Ryan’s Services/gi,"Precision Cuts Services");
    });

    document.querySelectorAll("a[href^='mailto:']").forEach(link=>link.href=`mailto:${business.email}`);

    const phonePattern=/\(540\)\s*\d{3}-\d{4}/g;
    const addressPattern=/\d{3,5}\s+[^<\n]+(?:Rd|Road|St|Street|Ave|Avenue)[^<\n]*/gi;
    document.querySelectorAll("footer, main").forEach(root=>{
      root.querySelectorAll("p,address,span,li,a").forEach(element=>{
        if(element.children.length) return;
        let value=element.textContent||"";
        value=value.replace(phonePattern,business.phoneDisplay);
        if(/Salem|Roanoke.*VA|Williamson/i.test(value) && /\d{3,5}/.test(value)) {
          value=business.addressLines.join(", ");
        }
        element.textContent=value;
      });
    });

    // Populate every booking service select from portal.json.
    document.querySelectorAll("select[data-booking-service], select[data-service-select], select[name='service']").forEach(select=>{
      const requested=new URLSearchParams(location.search).get("service") || select.value || services[0]?.slug;
      select.innerHTML="";
      services.forEach(service=>select.add(new Option(`${service.displayName} · ${service.durationMinutes} min · ${money(service.price)}`,service.slug)));
      select.value=services.some(service=>service.slug===requested)?requested:services[0]?.slug;
      select.dispatchEvent(new Event("change",{bubbles:true}));
    });

    // Replace static service cards on Book page when present.
    const bookMain=document.querySelector("main");
    if(/book\.html$/i.test(location.pathname) && bookMain){
      const cards=[...bookMain.querySelectorAll("article,[class*='service-card'],[data-service-slug]")]
        .filter(card=>/Haircut|Beard|Kid|Mask/i.test(card.textContent));
      const seen=new Set();
      cards.forEach(card=>{
        const container=card.parentElement;
        if(!container || seen.has(container)) return;
        seen.add(container);
        container.innerHTML=services.map(service=>`
          <a class="pc-book-service-option" href="/book.html?service=${encodeURIComponent(service.slug)}" data-service-slug="${service.slug}">
            <strong>${service.displayName}</strong>
            <span>${service.durationMinutes} min · ${money(service.price)}</span>
          </a>`).join("");
        container.classList.add("pc-book-service-options");
      });
    }

    // Contact page content from config.
    if(/contact\.html$/i.test(location.pathname)){
      const pairs=[
        ["phone",business.phoneDisplay],
        ["email",business.email],
        ["address",business.addressLines.join(", ")]
      ];
      document.querySelectorAll("main p,main address,main a,main li").forEach(element=>{
        if(element.children.length) return;
        let value=element.textContent||"";
        if(/\(540\)|phone|call/i.test(value)) value=value.replace(phonePattern,business.phoneDisplay);
        if(/@/.test(value)) value=business.email;
        if(/Williamson|Salem|Roanoke.*VA/i.test(value) && /\d{3,5}/.test(value)) value=business.addressLines.join(", ");
        element.textContent=value;
      });
    }
  }

  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();
