(() => {
  "use strict";
  const STORAGE_KEY = "booksy-portal-theme-v2";
  const defaults = {
    background: "#F4E9D3", surface: "#FFFDF7", surfaceAlt: "#EAD9BC",
    text: "#2C2118", mutedText: "#6B5A48", menuBackground: "#282019",
    menuText: "#F8EEDB", menuHighlightBackground: "#8BCF45",
    menuHighlightText: "#182015", primary: "#487A35", primaryText: "#FFFFFF",
    secondary: "#956B3E", accent: "#B77B22", border: "#CAB38E",
    success: "#487A35", bodyFont: "Arial, system-ui, sans-serif",
    headingFont: "Georgia, Times New Roman, serif", contentWidth: "1120px", radius: "8px"
  };
  const variables = {
    background:"--theme-background",surface:"--theme-surface",surfaceAlt:"--theme-surface-alt",
    text:"--theme-text",mutedText:"--theme-muted-text",menuBackground:"--theme-menu-background",
    menuText:"--theme-menu-text",menuHighlightBackground:"--theme-menu-highlight-background",
    menuHighlightText:"--theme-menu-highlight-text",primary:"--theme-primary",primaryText:"--theme-primary-text",
    secondary:"--theme-secondary",accent:"--theme-accent",border:"--theme-border",success:"--theme-success",
    bodyFont:"--theme-body-font",headingFont:"--theme-heading-font",contentWidth:"--theme-content-width",radius:"--theme-radius"
  };
  function sanitize(theme={}) { const clean={}; Object.keys(defaults).forEach(key=>clean[key]=theme[key]||defaults[key]); return clean; }
  function apply(theme) { const clean=sanitize(theme); Object.keys(variables).forEach(key=>document.documentElement.style.setProperty(variables[key],clean[key])); return clean; }
  function load() { try { return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")); } catch { return {...defaults}; } }
  function save(theme) { const clean=apply(theme); localStorage.setItem(STORAGE_KEY,JSON.stringify(clean)); return clean; }
  function reset() { localStorage.removeItem(STORAGE_KEY); return apply(defaults); }
  function css(theme) { const clean=sanitize(theme); return `:root {\n${Object.keys(variables).map(key=>`  ${variables[key]}: ${clean[key]};`).join("\n")}\n}\n`; }
  window.PortalTheme=Object.freeze({defaults,variables,load,apply,save,reset,css,storageKey:STORAGE_KEY});
  apply(load());
})();
