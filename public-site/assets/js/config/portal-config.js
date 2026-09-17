(() => {
  "use strict";

  const CONFIG_URL = "/assets/config/portal.json";

  function setText(root, selector, value) {
    root.querySelectorAll(selector).forEach(element => {
      element.textContent = value ?? "";
    });
  }

  function setHref(root, selector, value) {
    root.querySelectorAll(selector).forEach(element => {
      if (value) element.href = value;
    });
  }

  function applyTheme(theme) {
    const values = theme?.variables || {};
    const mapping = {
      background: "--portal-background",
      surface: "--portal-surface",
      surfaceAlt: "--portal-surface-alt",
      text: "--portal-text",
      mutedText: "--portal-muted-text",
      primary: "--portal-primary",
      secondary: "--portal-secondary",
      accent: "--portal-accent",
      success: "--portal-success",
      border: "--portal-border",
      bodyFont: "--portal-body-font",
      headingFont: "--portal-heading-font",
      contentWidth: "--portal-content-width",
      borderRadius: "--portal-radius"
    };
    Object.entries(mapping).forEach(([key, cssVariable]) => {
      if (values[key]) document.documentElement.style.setProperty(cssVariable, values[key]);
    });
  }

  function bindBusiness(config, root = document) {
    const business = config.business;
    setText(root, "[data-config-business-name]", business.name);
    setText(root, "[data-config-tagline]", business.tagline);
    setText(root, "[data-config-phone]", business.phoneDisplay);
    setText(root, "[data-config-email]", business.email);
    setHref(root, "[data-config-phone-link]", `tel:${business.phoneHref}`);
    setHref(root, "[data-config-email-link]", `mailto:${business.email}`);
    setHref(root, "[data-config-maps-link]", business.mapsUrl);
    setHref(root, "[data-config-facebook-link]", business.facebookUrl);
    setHref(root, "[data-config-booksy-link]", business.booksyUrl);
    root.querySelectorAll("[data-config-logo]").forEach(image => {
      image.src = business.logo;
      image.alt = `${business.name} logo`;
    });
  }

  async function load() {
    const response = await fetch(CONFIG_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load portal config: HTTP ${response.status}`);
    const config = await response.json();
    window.PORTAL_CONFIG = Object.freeze(config);
    applyTheme(config.theme);
    bindBusiness(config);
    document.dispatchEvent(new CustomEvent("portal-config-ready", { detail: config }));
    return config;
  }

  window.PortalConfig = Object.freeze({ load, bindBusiness, applyTheme });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => load().catch(console.error), { once: true });
  } else {
    load().catch(console.error);
  }
})();
