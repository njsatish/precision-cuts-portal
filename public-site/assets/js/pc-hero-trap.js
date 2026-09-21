/* pc-hero-trap.js  --  TEMPORARY DEBUG ONLY. Do not commit.
 *
 * Load as the FIRST <script> in <head> (no defer/async). It watches
 * #pch-transition and prints a stack trace to the console at the exact moment
 * the hero is removed, emptied, moved out of view, or hidden by JavaScript.
 * After load it also prints a snapshot and lists any CSS rules that hide it.
 */
(() => {
  "use strict";
  const TAG = "[HERO-TRAP]";
  const HERO_ID = "pch-transition";
  const hero = () => document.getElementById(HERO_ID);
  let lastBad = null;

  const ancestors = el => {
    const out = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) out.push(n);
    return out;
  };

  const touchesHero = node => {
    const h = hero();
    return !!(h && node && node.nodeType === 1 && (node === h || node.contains(h)));
  };

  // Returns null if the hero looks visible, otherwise a reason string.
  function badReason() {
    const h = hero();
    if (!h) return "no #" + HERO_ID + " element in the document";
    if (!h.isConnected) return "hero is detached from the document";
    for (const el of ancestors(h)) {
      const cs = getComputedStyle(el);
      const name = el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
        (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "");
      if (cs.display === "none") return "display:none on " + name;
      if (cs.visibility === "hidden") return "visibility:hidden on " + name;
      if (parseFloat(cs.opacity) === 0) return "opacity:0 on " + name;
      if (el.hidden) return "hidden attribute on " + name;
    }
    const r = h.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return "hero has zero size (" + Math.round(r.width) + "x" + Math.round(r.height) + ")";
    return null;
  }

  function probe(label) {
    let reason;
    try { reason = badReason(); } catch (e) { return; }
    if (reason && reason !== lastBad) {
      console.error(TAG + " HERO BECAME HIDDEN via " + label + " -> " + reason + "\n" + new Error().stack);
    } else if (!reason && lastBad) {
      console.info(TAG + " hero visible again after " + label);
    }
    lastBad = reason;
  }

  function wrap(proto, name, kind) {
    const orig = proto && proto[name];
    if (typeof orig !== "function") return;
    proto[name] = function (...args) {
      const affects = kind === "any" || touchesHero(this) || (kind === "child" && touchesHero(args[0]));
      if (affects && (kind === "child" || kind === "self") && (touchesHero(this) || touchesHero(args[0]))) {
        console.warn(TAG + " " + name + "() called on/with hero or its ancestor\n" + new Error().stack);
      }
      const result = orig.apply(this, args);
      if (affects) probe(name + "()");
      return result;
    };
  }

  function wrapSetter(proto, prop) {
    const desc = proto && Object.getOwnPropertyDescriptor(proto, prop);
    if (!desc || !desc.set) return;
    Object.defineProperty(proto, prop, {
      configurable: true,
      enumerable: desc.enumerable,
      get: desc.get,
      set(value) {
        const hit = touchesHero(this);
        if (hit) console.warn(TAG + " " + prop + " assigned on hero or its ancestor\n" + new Error().stack);
        desc.set.call(this, value);
        if (hit) probe(prop + " = ...");
      }
    });
  }

  // Removal / replacement / wiping
  wrap(Element.prototype, "remove", "self");
  wrap(Node.prototype, "removeChild", "child");
  wrap(Node.prototype, "replaceChild", "child");
  wrap(Element.prototype, "replaceWith", "self");
  wrap(Element.prototype, "replaceChildren", "self");
  wrapSetter(Element.prototype, "innerHTML");
  wrapSetter(Element.prototype, "outerHTML");
  wrapSetter(Node.prototype, "textContent");

  // Hiding via attributes / inline style / classes
  ["setAttribute", "removeAttribute", "toggleAttribute"].forEach(n => wrap(Element.prototype, n, "self-probe"));
  wrapSetter(HTMLElement.prototype, "hidden");
  ["add", "remove", "toggle", "replace"].forEach(n => wrap(DOMTokenList.prototype, n, "any"));

  if (window.CSSStyleDeclaration) {
    const sp = CSSStyleDeclaration.prototype;
    const origSet = sp.setProperty;
    sp.setProperty = function (...args) {
      const r = origSet.apply(this, args);
      if (ancestors(hero()).some(el => el.style === this)) probe("style.setProperty(" + args[0] + ", " + args[1] + ")");
      return r;
    };
    ["display", "visibility", "opacity", "height", "maxHeight", "cssText", "transform", "clipPath"].forEach(prop => {
      const desc = Object.getOwnPropertyDescriptor(sp, prop);
      if (!desc || !desc.set) return;
      Object.defineProperty(sp, prop, {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set(v) {
          desc.set.call(this, v);
          if (ancestors(hero()).some(el => el.style === this)) probe("style." + prop + " = " + v);
        }
      });
    });
  }

  // Catch anything the patches above miss (Range APIs, framework internals...)
  new MutationObserver(records => {
    for (const rec of records) {
      for (const n of rec.removedNodes) {
        if (n.nodeType === 1 && (n.id === HERO_ID || n.querySelector(":scope #" + HERO_ID))) {
          console.error(TAG + " hero subtree removed by an unpatched API. Target: " +
            rec.target.nodeName + (rec.target.id ? "#" + rec.target.id : ""));
        }
      }
    }
    probe("mutation");
  }).observe(document, { childList: true, subtree: true, attributes: true });

  function describe(el) {
    return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
      (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).join(".") : "");
  }

  function hidingRules(el) {
    const found = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { continue; }
      const walk = list => {
        for (const rule of list) {
          if (rule.cssRules && !rule.selectorText) { walk(rule.cssRules); continue; }
          if (!rule.selectorText) continue;
          let match = false;
          try { match = el.matches(rule.selectorText); } catch (e) { /* skip */ }
          if (!match) continue;
          const s = rule.style;
          if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0" ||
              s.height === "0px" || s.height === "0" || s.maxHeight === "0px" || s.clipPath) {
            found.push((sheet.href || "inline <style>") + "  =>  " + rule.selectorText + " { " + rule.style.cssText + " }");
          }
        }
      };
      walk(rules);
    }
    return found;
  }

  function snapshot(label) {
    const h = hero();
    console.group(TAG + " SNAPSHOT (" + label + ")");
    console.log("#" + HERO_ID + " elements in document:", document.querySelectorAll("#" + HERO_ID).length);
    if (!h) {
      const main = document.querySelector("main");
      console.log("hero missing. Sections now in <main>:",
        main ? [...main.children].map(describe) : "no <main>");
    } else {
      const img = document.getElementById("pch-transition-image");
      console.log("image:", img ? { src: img.getAttribute("src"), complete: img.complete, naturalWidth: img.naturalWidth } : "no #pch-transition-image");
      console.table(ancestors(h).map(el => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { element: describe(el), display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
          height: Math.round(r.height), width: Math.round(r.width), overflow: cs.overflow, position: cs.position };
      }));
      ancestors(h).forEach(el => {
        const rules = hidingRules(el);
        if (rules.length) console.log("CSS rules that could hide " + describe(el) + ":", rules);
      });
      console.log("verdict:", badReason() || "hero looks visible");
    }
    console.groupEnd();
  }

  window.addEventListener("DOMContentLoaded", () => snapshot("DOMContentLoaded"));
  window.addEventListener("load", () => {
    snapshot("load");
    setTimeout(() => snapshot("load + 3s"), 3000);
    setTimeout(() => snapshot("load + 8s"), 8000);
  });
  window.__pcHeroSnapshot = snapshot;
  console.info(TAG + " armed. Call __pcHeroSnapshot('manual') any time.");
})();
