(() => {
  "use strict";
  const config=window.BOOKSY_PORTAL_CONFIG;
  if(!config){ console.error("BOOKSY_PORTAL_CONFIG is missing"); return; }
  const get=path=>String(path||"").split(".").reduce((value,key)=>value?.[key],config);
  Object.entries(config.brand?.colors||{}).forEach(([key,value])=>document.documentElement.style.setProperty(`--portal-${key}`,value));
  document.querySelectorAll("[data-portal-text]").forEach(el=>{ const v=get(el.dataset.portalText); if(v!=null) el.textContent=String(v); });
  document.querySelectorAll("[data-portal-href]").forEach(el=>{ const v=get(el.dataset.portalHref); if(v) el.href=String(v); });
  document.querySelectorAll("[data-portal-src]").forEach(el=>{ const v=get(el.dataset.portalSrc); if(v) el.src=String(v); });
  window.BOOKSY_PORTAL=Object.freeze({
    config,
    get,
    getService:slug=>config.getService(slug),
    buildInstantUrl(service,date,time){
      if(!service||!date||!time) return config.bookingProvider.profileUrl;
      const q=new URLSearchParams({variantId:String(service.variantId),date:`${date}T${time}`});
      return `${config.bookingProvider.instantExperienceBase}/${config.bookingProvider.widgetId}?${q}`;
    },
    buildWidgetScriptUrl(){
      const p=config.bookingProvider; const q=new URLSearchParams({id:String(p.widgetId),country:p.country,lang:p.language});
      return `https://booksy.com/widget/code.js?${q}`;
    }
  });
  document.documentElement.classList.add("portal-config-ready");
})();
