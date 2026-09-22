# Conciergerie Le Sénéchal — site statique

Landing page de collecte de contacts (liste d'attente propriétaires) pour la future
Conciergerie Le Sénéchal, dans le Bocage vendéen.

Frontend 100 % statique : HTML + CSS + JS vanilla, sans framework. Le seul code
serveur est une fonction serverless Vercel (`api/contact.js`) qui envoie l'e-mail
du formulaire via [Resend](https://resend.com) — nécessaire pour que la clé API
Resend reste côté serveur et ne soit jamais exposée dans le navigateur.
`build-assets.js` et `package.json` ne servent qu'à régénérer les images (voir
plus bas) et ne sont pas requis en production.

## Arborescence

```
/index.html
/mentions-legales.html
/confidentialite.html
/merci.html                 (fallback si JavaScript désactivé)
/css/style.css
/js/form.js
/js/config.js                (FORM_ENDPOINT)
/api/contact.js              (fonction serverless Vercel : envoi de l'e-mail via Resend)
/fonts/…                     (Cinzel, Cormorant Garamond, Karla — woff2, sous-ensemble latin)
/img/…                       (blason WebP/JPG, favicons, image Open Graph)
/robots.txt
/sitemap.xml
```

## Déploiement

Pour Vercel :

1. Pousser ce dossier sur un dépôt Git (GitHub/GitLab/Bitbucket).
2. Sur [vercel.com](https://vercel.com), « Add New… → Project » puis importer le dépôt.
3. Framework preset : **Other** (aucun build command, aucun output directory à
   changer — Vercel sert les fichiers statiques à la racine et détecte
   automatiquement `api/contact.js` comme fonction serverless).
4. Dans Project Settings → Environment Variables, ajouter `RESEND_API_KEY`
   (voir ci-dessous).
5. Déployer.

Le frontend (hors formulaire) fonctionne aussi chez n'importe quel hébergeur
statique, mais `api/contact.js` est écrit pour le runtime Node.js de Vercel :
sur un autre hébergeur, il faudrait porter cette fonction vers l'équivalent
local (ou vers une fonction Netlify, par exemple).

## Configuration du formulaire (Resend)

Le formulaire de contact envoie un `POST` JSON vers l'URL définie dans
`js/config.js` (`FORM_ENDPOINT`, actuellement `/api/contact`). Sans JavaScript,
il utilise l'attribut `action`/`method="post"` du `<form>` dans `index.html`
(déjà synchronisé sur la même route). Dans les deux cas, c'est
`api/contact.js` qui reçoit la requête et appelle l'API Resend.

1. Créer un compte sur [resend.com](https://resend.com) et vérifier un domaine
   d'envoi (DNS SPF/DKIM) — Resend ne permet pas d'envoyer depuis une adresse
   sur un domaine non vérifié.
2. Créer une clé API Resend, puis la renseigner dans Vercel → Project Settings
   → Environment Variables sous le nom `RESEND_API_KEY` (Production **et**
   Preview).
3. Dans `api/contact.js`, remplacer `FROM_ADDRESS` (adresse d'expédition, sur
   le domaine vérifié) et `TO_ADDRESS` (adresse qui reçoit les demandes de
   contact).
4. Redéployer pour que la nouvelle variable d'environnement soit prise en
   compte.

`api/contact.js` valide aussi côté serveur le pot de miel et les champs
requis (défense en profondeur : la validation JavaScript côté client peut être
contournée), et redirige vers `/merci.html` pour les soumissions sans
JavaScript.

## Régénérer les images

Les fichiers de `img/` et `fonts/` sont déjà générés et committés. Pour les
regénérer (par exemple avec un nouveau blason) :

```bash
npm install sharp --no-save
node build-assets.js
```

Cela régénère `img/blason-*.webp/jpg`, `img/og-image.jpg` et les favicons
(`img/favicon*.png`, `img/favicon.svg`).

Les polices (`fonts/*.woff2`) sont un sous-ensemble latin de Cinzel, Cormorant
Garamond et Karla, téléchargées une fois depuis Google Fonts puis auto-hébergées
ici : le site ne fait plus aucun appel à `fonts.googleapis.com` ou
`fonts.gstatic.com` au chargement.

## Checklist avant mise en ligne

### Placeholders à remplacer (recherche `REMPLACER` ou `[` dans le dépôt)

- `api/contact.js` → `FROM_ADDRESS` (domaine vérifié dans Resend),
  `TO_ADDRESS` (adresse qui reçoit les demandes)
- Variable d'environnement Vercel `RESEND_API_KEY` (voir ci-dessus)
- `robots.txt`, `sitemap.xml` → domaine réel du site
- `index.html`, `mentions-legales.html`, `confidentialite.html`, `merci.html`
  → `https://REMPLACER-PAR-DOMAINE` dans `<link rel="canonical">` et, sur
  `index.html`, dans `og:url`, `og:image` et `twitter:image` (ces deux
  dernières balises doivent être des URL absolues pour que l'aperçu
  fonctionne sur les réseaux sociaux)
- `mentions-legales.html` → `[ADRESSE_EMAIL_DEDIEE]`, `[NOM_HEBERGEUR]`,
  `[ADRESSE_HEBERGEUR]`, `[TELEPHONE_HEBERGEUR]`
- `confidentialite.html` → `[ADRESSE_EMAIL_DEDIEE]`, `[DUREE_CONSERVATION]`

### Contrôles qualité

- [ ] Lighthouse mobile ≥ 95 en Performance, Accessibilité, Bonnes pratiques, SEO.
- [ ] Contraste WCAG AA vérifié, notamment texte or sur fond clair (`#7C6136`).
- [ ] Navigation clavier complète, focus visible, lien d'évitement fonctionnel.
- [ ] Onglet Réseau du navigateur : aucune requête vers un domaine tiers au
      chargement de la page.
- [ ] Test du formulaire avec JavaScript désactivé (fallback `/merci.html`).
- [ ] Test du honeypot (champ `website` rempli → aucun e-mail envoyé, succès
      affiché quand même).
- [ ] Photo réelle du Bocage vendéen à la place du bloc `[Photo…]` dans la
      section « Ancrage local » (`index.html`, commentaire `TODO: photo`).
- [ ] Favicon provisoire (lettre « S ») à remplacer par une version simplifiée
      du blason (`img/favicon.svg` + PNG associés).
- [ ] Recherche dans tout le dépôt : aucun nom propre de personne ni de société
      autre que « Le Sénéchal ».
