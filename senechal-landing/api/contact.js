// Fonction serverless Vercel (runtime Node.js).
// Reçoit le formulaire de contact et envoie un e-mail via l'API Resend.
// La clé API (variable d'environnement RESEND_API_KEY, configurée dans
// Vercel → Settings → Environment Variables) ne quitte jamais le serveur :
// le navigateur n'appelle que cette route, jamais l'API Resend directement.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Adresse de test fournie par Resend : fonctionne sans configuration DNS,
// mais Resend limite alors l'envoi à l'adresse e-mail du compte Resend
// (voir README). À remplacer par une adresse sur un domaine vérifié
// (ex. "Le Sénéchal <contact@tondomaine.fr>") dès qu'un domaine est ajouté
// dans Resend → Domains.
const FROM_ADDRESS = "Le Sénéchal <onboarding@resend.dev>";
const TO_ADDRESS = "voleau@gmail.com";

const REQUIRED_FIELDS = ["nom", "commune", "situation", "statut", "email"];

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  const body = req.body || {};
  const isJsonRequest = (req.headers["content-type"] || "").includes("application/json");

  const respond = (status, payload) => {
    if (isJsonRequest) {
      res.status(status).json(payload);
      return;
    }
    // Soumission sans JavaScript (formulaire natif) : on redirige plutôt
    // que de renvoyer du JSON.
    res.writeHead(303, { Location: payload.ok ? "/merci.html" : "/?erreur=1" });
    res.end();
  };

  // Pot de miel anti-spam : ce champ n'est rempli que par des robots.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    respond(200, { ok: true });
    return;
  }

  const missing = REQUIRED_FIELDS.filter((field) => {
    const value = body[field];
    return typeof value !== "string" || value.trim() === "";
  });
  const consentOk = body.consentement === true || body.consentement === "true" || body.consentement === "on";

  if (missing.length > 0 || !consentOk || !isValidEmail(body.email)) {
    respond(400, { ok: false, error: "invalid_submission", missing });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY n'est pas configurée sur ce déploiement.");
    respond(500, { ok: false, error: "server_misconfigured" });
    return;
  }

  const subject = `Nouveau contact Le Sénéchal — ${body.commune} — ${body.situation}`;
  const text = [
    `Nom : ${body.nom}`,
    `Commune du bien : ${body.commune}`,
    `Situation : ${body.situation}`,
    `Déjà en location : ${body.statut}`,
    `E-mail : ${body.email}`,
    `Téléphone : ${body.telephone || "(non renseigné)"}`,
    `Date : ${body.date || new Date().toISOString()}`,
    `Source : ${body.source || "landing"}`,
  ].join("\n");

  try {
    const resendResponse = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        reply_to: body.email,
        subject,
        text,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error("Resend a refusé l'envoi :", resendResponse.status, errorBody);
      respond(502, { ok: false, error: "email_send_failed" });
      return;
    }

    respond(200, { ok: true });
  } catch (error) {
    console.error("Erreur lors de l'appel à Resend :", error);
    respond(502, { ok: false, error: "email_send_failed" });
  }
};
