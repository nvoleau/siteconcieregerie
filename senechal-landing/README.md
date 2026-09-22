# Conciergerie Le Sénéchal — site statique

Landing page de collecte de contacts (liste d'attente propriétaires) pour la future
Conciergerie Le Sénéchal, dans le Bocage vendéen.

Site 100 % statique : HTML + CSS + JS vanilla, sans framework, sans dépendance npm
nécessaire à l'exécution. `build-assets.js` et `package.json` ne servent qu'à
régénérer les images (voir plus bas) ; ils ne sont pas requis en production et
peuvent être supprimés une fois les fichiers de `img/` générés.

## Arborescence

```
/index.html
/mentions-legales.html
/confidentialite.html
/merci.html                 (fallback si JavaScript désactivé)
/css/style.css
/js/form.js
/js/config.js                (FORM_ENDPOINT)
/fonts/…                     (Cinzel, Cormorant Garamond, Karla — woff2, sous-ensemble latin)
/img/…                       (blason WebP/JPG, favicons, image Open Graph)
/robots.txt
/sitemap.xml
/n8n/workflow-formulaire.json
```

## Déploiement

Le site n'a besoin d'aucune étape de build. Pour Vercel :

1. Pousser ce dossier sur un dépôt Git (GitHub/GitLab/Bitbucket).
2. Sur [vercel.com](https://vercel.com), « Add New… → Project » puis importer le dépôt.
3. Framework preset : **Other** (aucun build command, aucun output directory à
   changer — Vercel sert les fichiers statiques à la racine tels quels).
4. Déployer.

Fonctionne également chez n'importe quel hébergeur statique (Netlify, GitHub Pages,
serveur mutualisé classique) : il suffit de copier tous les fichiers.

## Configuration du formulaire

Le formulaire de contact envoie un `POST` JSON vers l'URL définie dans
`js/config.js` (`FORM_ENDPOINT`). Sans JavaScript, il utilise l'attribut
`action`/`method="post"` du `<form>` dans `index.html` (même URL à synchroniser
manuellement).

1. Importer `n8n/workflow-formulaire.json` dans une instance n8n.
2. Configurer les credentials SMTP (et, en option, Google Sheets — le nœud
   correspondant est désactivé par défaut).
3. Restreindre les origines autorisées du nœud Webhook (`allowedOrigins`) et la
   configuration CORS au domaine réel du site.
4. Activer le workflow, copier l'URL **de production** du Webhook.
5. Remplacer `FORM_ENDPOINT` dans `js/config.js` **et** l'attribut `action` du
   `<form>` dans `index.html` par cette URL.
6. Configurer le webhook pour rediriger (303) vers `/merci.html` lorsque la
   requête n'est pas au format JSON (cas du formulaire sans JS).

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

- `js/config.js` → `FORM_ENDPOINT`
- `index.html` → attribut `action` du `<form>`
- `robots.txt`, `sitemap.xml` → domaine réel du site
- `index.html`, `mentions-legales.html`, `confidentialite.html`, `merci.html`
  → `https://REMPLACER-PAR-DOMAINE` dans `<link rel="canonical">` et, sur
  `index.html`, dans `og:url`, `og:image` et `twitter:image` (ces deux
  dernières balises doivent être des URL absolues pour que l'aperçu
  fonctionne sur les réseaux sociaux)
- `mentions-legales.html` → `[ADRESSE_EMAIL_DEDIEE]`, `[NOM_HEBERGEUR]`,
  `[ADRESSE_HEBERGEUR]`, `[TELEPHONE_HEBERGEUR]`
- `confidentialite.html` → `[ADRESSE_EMAIL_DEDIEE]`, `[OUTIL_FORMULAIRE]`,
  `[DUREE_CONSERVATION]`
- `n8n/workflow-formulaire.json` → `[ADRESSE_EMAIL_EXPEDITEUR]`,
  `[ADRESSE_EMAIL_DEDIEE]`, identifiants de credentials, ID de Google Sheet,
  domaine dans `allowedOrigins`

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
