(function () {
  "use strict";

  /* --- Menu mobile ------------------------------------------------------ */

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("menu-principal");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --- Formulaire de contact --------------------------------------------- */

  var form = document.getElementById("contact-form");
  if (!form) return;

  var fieldsWrap = document.getElementById("form-fields");
  var successWrap = document.getElementById("form-success");
  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("form-submit");

  var ERROR_MESSAGES = {
    valueMissing: "Ce champ est obligatoire.",
    typeMismatch: "Merci de vérifier le format saisi.",
    badInput: "Merci de vérifier le format saisi.",
  };

  function messageFor(input) {
    var validity = input.validity;
    if (validity.valid) return "";
    if (validity.valueMissing) return ERROR_MESSAGES.valueMissing;
    if (validity.typeMismatch || validity.badInput) return ERROR_MESSAGES.typeMismatch;
    return "Merci de corriger ce champ.";
  }

  function fieldIds() {
    return ["nom", "commune", "situation", "statut", "email"];
  }

  function validateField(input) {
    var errorEl = document.getElementById("err-" + input.id);
    var msg = messageFor(input);
    if (errorEl) errorEl.textContent = msg;
    return msg === "";
  }

  function validateConsent() {
    var consent = document.getElementById("consentement");
    var errorEl = document.getElementById("err-consentement");
    var ok = consent.checked;
    if (errorEl) errorEl.textContent = ok ? "" : "Merci de cocher cette case pour que nous puissions vous recontacter.";
    return ok;
  }

  fieldIds().forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("blur", function () { validateField(input); });
    input.addEventListener("input", function () {
      if (input.validity.valid) validateField(input);
    });
  });

  var consentInput = document.getElementById("consentement");
  if (consentInput) consentInput.addEventListener("change", validateConsent);

  function setStatus(message, state) {
    statusEl.textContent = message;
    if (state) {
      statusEl.setAttribute("data-state", state);
    } else {
      statusEl.removeAttribute("data-state");
    }
  }

  function showSuccess() {
    fieldsWrap.hidden = true;
    successWrap.hidden = false;
    successWrap.setAttribute("tabindex", "-1");
    successWrap.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var honeypot = document.getElementById("website");
    var isBot = honeypot && honeypot.value.trim() !== "";

    var validFields = fieldIds()
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean)
      .map(validateField)
      .every(Boolean);
    var validConsent = validateConsent();

    if (!validFields || !validConsent) {
      setStatus("Merci de corriger les champs signalés ci-dessus.", "error");
      return;
    }

    if (isBot) {
      // Formulaire probablement rempli par un robot : on affiche le succès
      // sans rien envoyer, pour ne pas le renseigner sur l'échec du piège.
      showSuccess();
      return;
    }

    var endpoint = (window.SENECHAL_CONFIG && window.SENECHAL_CONFIG.FORM_ENDPOINT) || form.getAttribute("action");

    var payload = {
      nom: document.getElementById("nom").value.trim(),
      commune: document.getElementById("commune").value.trim(),
      situation: document.getElementById("situation").value,
      statut: document.getElementById("statut").value,
      email: document.getElementById("email").value.trim(),
      telephone: document.getElementById("telephone").value.trim(),
      consentement: true,
      source: "landing",
      date: new Date().toISOString(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours…";
    setStatus("Envoi en cours…", null);

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Réponse serveur invalide (" + response.status + ")");
        setStatus("", null);
        showSuccess();
      })
      .catch(function () {
        setStatus("Une erreur est survenue lors de l'envoi. Merci de réessayer, ou de nous écrire directement.", "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Je souhaite échanger";
      });
  });
})();
