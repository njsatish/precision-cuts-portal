(() => {
  "use strict";

  const clean=value=>String(value||"").replace(/\s+/g," ").trim().toLowerCase();

  function start(){
    const config=window.BOOKSY_PORTAL_CONFIG;
    if(!config){
      document.addEventListener("booksy-portal-config-ready",start,{once:true});
      return;
    }

    const footer=document.querySelector("footer");
    if(!footer) return;

    const heading=[...footer.querySelectorAll("h2,h3,h4,strong")]
      .find(element=>clean(element.textContent)==="business hours");
    if(!heading) return;

    // Use the smallest practical footer column that contains the heading.
    let column=heading.closest("section,article,aside,[class*='column'],[class*='col'],[class*='hours']") || heading.parentElement;
    if(!column) return;

    const rows=(config.hours||[]).map(row=>`
      <div class="pc-footer-hours-row">
        <span>${row.day}</span>
        <strong>${row.closed ? "Closed" : `${row.open}–${row.close}`}</strong>
      </div>`).join("");

    // Replace the full contents so grouped legacy rows cannot survive.
    column.setAttribute("data-pc-footer-hours","");
    column.innerHTML=`
      <h3>Business Hours</h3>
      <div class="pc-footer-hours-list">${rows}</div>`;
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",start,{once:true})
    : start();
})();
