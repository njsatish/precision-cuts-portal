(() => {
  "use strict";

  const normalize=value=>String(value||"").replace(/\s+/g," ").trim().toLowerCase();
  const weekdayNames=["tuesday","wednesday","thursday","friday"];

  function rowDay(row){
    const cells=[...row.querySelectorAll("th,td")];
    return normalize(cells[0]?.textContent);
  }

  function compactTable(table){
    const rows=[...table.querySelectorAll("tr")];
    const weekdayRows=rows.filter(row=>weekdayNames.includes(rowDay(row)));
    if(weekdayRows.length!==4) return false;

    const first=weekdayRows[0];
    const cells=[...first.querySelectorAll("th,td")];
    if(cells.length<2) return false;
    cells[0].textContent="Tuesday-Friday";
    cells[1].textContent="10:00 AM-6:00 PM";
    weekdayRows.slice(1).forEach(row=>row.remove());
    return true;
  }

  function compactList(container){
    const children=[...container.children];
    const weekdayItems=children.filter(item=>weekdayNames.some(day=>normalize(item.textContent).startsWith(day)));
    if(weekdayItems.length!==4) return false;
    const first=weekdayItems[0];
    first.innerHTML="<span>Tuesday-Friday</span><strong>10:00 AM-6:00 PM</strong>";
    weekdayItems.slice(1).forEach(item=>item.remove());
    return true;
  }

  function apply(){
    const headings=[...document.querySelectorAll("h1,h2,h3,h4,h5,strong")]
      .filter(node=>/business hours|hours of operation/i.test(node.textContent));

    for(const heading of headings){
      const section=heading.closest("section,article,div")||heading.parentElement;
      if(!section) continue;
      const table=section.querySelector("table");
      if(table && compactTable(table)) continue;
      const candidate=[...section.querySelectorAll("ul,ol,div")]
        .find(node=>weekdayNames.every(day=>normalize(node.textContent).includes(day)));
      if(candidate) compactList(candidate);
    }
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",apply,{once:true})
    : apply();
  window.addEventListener("load",apply,{once:true});
  setTimeout(apply,250);
})();
