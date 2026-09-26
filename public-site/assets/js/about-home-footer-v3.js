(() => {
  "use strict";

  const footerMarkup = `
    <footer class="pc-about-home-footer-v3" aria-label="Precision Cuts footer">
      <div class="pc-about-home-footer-top">
        <a class="pc-about-home-footer-brand" href="/index.html" aria-label="Precision Cuts home">
          <img src="/assets/images/precision-cuts-logo-approved.png" alt="Precision Cuts">
        </a>
        <nav class="pc-about-home-footer-links" aria-label="Footer links">
          <a href="tel:+15405562871">(540) 556-2871</a>
          <a href="https://www.facebook.com/precisioncutsvip/" target="_blank" rel="noopener">Facebook</a>
          <a href="/services.html">Services</a>
          <a href="/book.html">Booking</a>
        </nav>
      </div>
      <div class="pc-about-home-footer-bottom">
        <span>© 2026 Precision Cuts</span>
        <address>6423 Williamson Rd, Roanoke, VA 24019</address>
      </div>
    </footer>`;

  const removeExistingFooters = () => {
    document.querySelectorAll(
      "footer, #shared-footer, [data-site-footer], .pc-about-home-footer-v3"
    ).forEach(element => element.remove());
  };

  const render = () => {
    if (!document.body) return false;
    removeExistingFooters();
    document.body.insertAdjacentHTML("beforeend", footerMarkup);
    return true;
  };

  render();
})();
