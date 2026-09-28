// Bandeau de consentement cookies. Google Analytics n'est chargé qu'après
// acceptation explicite ; en cas de refus, aucune requête vers Google n'est faite.
(function () {
  var STORAGE_KEY = "senechal_cookie_consent";
  var config = window.SENECHAL_CONFIG || {};
  var measurementId = config.GA_MEASUREMENT_ID;

  function getConsent() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }

  function loadAnalytics() {
    if (!measurementId || window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    document.head.appendChild(script);
  }

  function disableAnalytics() {
    if (measurementId) {
      window["ga-disable-" + measurementId] = true;
    }
  }

  function removeBanner(banner) {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
  }

  function showBanner() {
    if (document.querySelector(".cookie-banner")) return;

    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Consentement aux cookies");

    var text = document.createElement("p");
    text.className = "cookie-banner__text";
    text.innerHTML =
      "Nous utilisons Google Analytics pour mesurer la fréquentation de ce site. " +
      "Ces cookies ne sont déposés qu’avec votre accord. " +
      '<a href="/confidentialite.html">En savoir plus</a>.';

    var actions = document.createElement("div");
    actions.className = "cookie-banner__actions";

    var refuseBtn = document.createElement("button");
    refuseBtn.type = "button";
    refuseBtn.className = "btn btn--outline";
    refuseBtn.textContent = "Refuser";

    var acceptBtn = document.createElement("button");
    acceptBtn.type = "button";
    acceptBtn.className = "btn btn--gold";
    acceptBtn.textContent = "Accepter";

    refuseBtn.addEventListener("click", function () {
      setConsent("refused");
      disableAnalytics();
      removeBanner(banner);
    });

    acceptBtn.addEventListener("click", function () {
      setConsent("accepted");
      loadAnalytics();
      removeBanner(banner);
    });

    actions.appendChild(refuseBtn);
    actions.appendChild(acceptBtn);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  }

  function init() {
    var consent = getConsent();
    if (consent === "accepted") {
      loadAnalytics();
    } else if (consent === "refused") {
      disableAnalytics();
    } else {
      showBanner();
    }
  }

  // Permet au lien "Gérer les cookies" du pied de page de rouvrir le bandeau.
  window.SENECHAL_COOKIE_PREFS = {
    reopen: showBanner,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
