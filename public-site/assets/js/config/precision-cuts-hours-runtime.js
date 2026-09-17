(() => {
  "use strict";

  function start() {
    const config=window.BOOKSY_PORTAL_CONFIG;
    if(!config){
      document.addEventListener("booksy-portal-config-ready",start,{once:true});
      return;
    }

    const business=config.business;
    const rows=config.hours || [];
    const hoursHtml=rows.map(row=>`
      <div class="pc-hours-row">
        <span>${row.day}</span>
        <strong>${row.closed ? "Closed" : `${row.open}–${row.close}`}</strong>
      </div>`).join("");

    function nearestBlock(headingText) {
      const heading=[...document.querySelectorAll("h1,h2,h3,h4")]
        .find(element=>element.textContent.trim().toLowerCase()===headingText.toLowerCase());
      return heading?.closest("article,aside,section,[class*='card'],[class*='panel']") || heading?.parentElement;
    }

    const hoursBlock=nearestBlock("Business Hours");
    if(hoursBlock){
      hoursBlock.setAttribute("data-pc-hours-block","");
      const heading=[...hoursBlock.querySelectorAll("h1,h2,h3,h4")]
        .find(element=>/business hours/i.test(element.textContent));
      hoursBlock.querySelectorAll(".pc-hours-list").forEach(element=>element.remove());
      const list=document.createElement("div");
      list.className="pc-hours-list";
      list.innerHTML=hoursHtml;
      heading?.insertAdjacentElement("afterend",list);

      // Remove inherited static hour rows while preserving the heading and new list.
      [...hoursBlock.children].forEach(child=>{
        if(child===heading || child===list || child.contains(list)) return;
        if(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Closed|AM|PM/i.test(child.textContent)) child.remove();
      });
    }

    const addressText=business.addressLines.join(", ");
    document.querySelectorAll("main address, main p, main span, main a, footer address, footer p, footer span, footer a").forEach(element=>{
      if(element.children.length) return;
      const value=element.textContent || "";
      if(/2501 Hollins|6423 Williamson|Roanoke, VA 24019/i.test(value)) element.textContent=addressText;
    });

    document.querySelectorAll("a[href]").forEach(link=>{
      const value=(link.textContent||"").trim();
      if(/directions/i.test(value) || /google\.com\/maps/.test(link.href)) link.href=business.mapsUrl;
    });
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",start,{once:true})
    : start();
})();
