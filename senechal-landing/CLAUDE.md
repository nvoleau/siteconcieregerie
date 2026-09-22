# Landing page — Conciergerie Le Sénéchal

## Contexte

Conciergerie de location courte durée (Airbnb, Booking) en cours de création dans le Bocage vendéen, autour du Puy du Fou. Le service n'est pas encore ouvert : cette page sert à **recueillir des contacts de propriétaires** (liste d'attente, prise de rendez-vous de 30 min) et à tester le positionnement.

Différenciateur à mettre en avant partout : **le propriétaire garde ses annonces et ses comptes à son nom** ; la conciergerie intervient comme co-hôte.

- Nom : **Conciergerie Le Sénéchal**
- Slogan : **Vous restez maître chez vous.**

## Contraintes impératives

1. **Discrétion totale sur le porteur du projet.** Aucune mention, nulle part (textes, balises meta, commentaires HTML, noms de fichiers, alt, données structurées, messages de commit), d'un nom de personne, d'une autre société ou d'une commune précise de résidence. Le site parle au « nous » et se situe seulement dans le « Bocage vendéen » / « autour du Puy du Fou ».
2. **Site statique, sans framework** : HTML + CSS + JS vanilla. Aucune dépendance npm nécessaire pour l'exécution. Doit être déployable tel quel chez n'importe quel hébergeur statique.
3. **Aucun cookie, aucun traceur, aucune ressource tierce chargée au runtime.** Conséquences :
   - **polices auto-hébergées** (woff2 dans `/fonts`), pas d'appel à Google Fonts (transfert d'IP à Google = problème RGPD) ;
   - pas de Google Analytics ; pas de bandeau cookies nécessaire. Si une mesure d'audience est ajoutée plus tard, ce sera un outil sans cookie (Plausible, Umami…), hors périmètre ici.
4. **Le formulaire envoie « juste » un e-mail** (voir section Formulaire). Pas de base de données.

## Livrables attendus

```
/index.html
/mentions-legales.html
/confidentialite.html
/merci.html                 (fallback si JS désactivé)
/css/style.css
/js/form.js
/js/config.js               (FORM_ENDPOINT et autres constantes)
/fonts/…                    (Cinzel, Cormorant Garamond, Karla — woff2, sous-ensembles latin)
/img/…                      (blason optimisé en WebP + JPG de repli, image OG 1200×630, favicons)
/robots.txt, /sitemap.xml
/README.md                  (déploiement, configuration du formulaire, checklist mise en ligne)
/n8n/workflow-formulaire.json  (workflow n8n importable, voir plus bas)
```

## Référence visuelle

`reference/maquette-bureau.dc.html` est la maquette validée (version bureau, 1440 px). **Ce n'est pas du HTML standard** : c'est un format d'éditeur de design (`<x-dc>`, `<helmet>`, script `DCLogic`). Ne pas le réutiliser tel quel : s'en servir comme **référence de contenu, de mise en page et de styles**, puis réécrire proprement en HTML sémantique + CSS dans une feuille de style (pas de styles inline).

Les textes de la maquette sont **validés** : les reprendre à l'identique, sauf mention contraire ci-dessous.

`assets/senechal-blason.jpg` : le blason recadré (utilisé dans le bandeau d'ouverture).
`assets/senechal-logo-complet.jpg` : le logo complet avec le nom, fond bleu nuit (sert de base pour l'image Open Graph).

## Design tokens

| Rôle | Valeur |
|---|---|
| Bleu nuit (fond identité) | `#17243B` |
| Bleu nuit profond (pied de page) | `#111B2D` |
| Or (accent, boutons) | `#C7A274` |
| Or foncé (textes/petits titres sur fond clair) | `#7C6136` |
| Filet or | `#A8854F` |
| Ivoire (fond principal) | `#F7F3EA` |
| Sable (bandeau tarif) | `#EFE6D4` |
| Bordure cartes | `#E4DCC9` |
| Texte courant sur clair | `#3E4A60` |
| Texte courant sur bleu | `#D2D7E0` |

- Boutons or : **texte bleu nuit** (jamais blanc sur or, contraste insuffisant).
- Typographies : **Cinzel** (nom de marque, surtitres en capitales espacées), **Cormorant Garamond 600** (titres), **Karla** (texte courant, formulaires).
- Rayons : cartes 18 px, grands blocs 24 px, boutons en pilule.
- Pas d'emoji, pas de dégradés décoratifs. Icônes en SVG inline, trait fin.

## Structure de la page (ordre)

1. **En-tête** (bleu nuit) : logotype texte « Le Sénéchal / CONCIERGERIE » en Cinzel or ; navigation par ancres (Le principe, Pour qui, Comment ça marche) ; bouton « Être recontacté ». Sur mobile : menu burger accessible (bouton avec `aria-expanded`).
2. **Bandeau d'ouverture** (bleu nuit) : pastille « Bientôt autour du Puy du Fou », H1 « Vous restez maître chez vous. », paragraphe, 2 boutons, blason à droite (dessous sur mobile).
3. **Le principe** (`#principe`) : 3 cartes (comptes à votre nom / avis / liberté).
4. **Pour qui** (`#pourqui`) : 3 cartes bleu nuit numérotées I, II, III (un segment chacune).
5. **Comment ça marche** (`#fonctionnement`) : 3 étapes.
6. **Tarif** : bandeau sable. **Aucun chiffre de commission affiché.**
7. **Ancrage local** : emplacement photo (paysage du Bocage). Mettre une image de remplacement neutre et un commentaire `TODO: photo` dans le code.
8. **Contact** (`#contact`, bleu nuit) : texte + formulaire.
9. **Pied de page** : « Conciergerie Le Sénéchal · Service en cours de création · Bocage vendéen » + liens Mentions légales / Confidentialité.

## Responsive

Mobile first. Points de rupture indicatifs : 640 px et 1024 px. Grilles de 3 colonnes → 1 colonne sur mobile. H1 ~44 px mobile / 80 px bureau (utiliser `clamp()`). Cibles tactiles ≥ 44 px. Prévoir que la version mobile sera la plus consultée (diffusion via groupes Facebook).

## Formulaire

Champs (attribut `name` entre parenthèses) :

- Nom (`nom`) — requis
- Commune du bien (`commune`) — requis, placeholder « Ex. Mortagne-sur-Sèvre »
- Votre situation (`situation`) — requis, `<select>` :
  - `residence_secondaire` : « Résidence secondaire, j'habite loin »
  - `local_manque_temps` : « J'habite sur place mais je manque de temps »
  - `primo_investisseur` : « Je prépare un premier investissement »
  - `autre` : « Autre »
- Déjà en location ? (`statut`) — requis : `deja_en_location` / `en_projet`
- E-mail (`email`) — requis, validation format
- Téléphone (`telephone`) — facultatif
- Consentement (`consentement`) — case **obligatoire**, texte de la maquette
- **Pot de miel anti-spam** : champ `website` masqué visuellement (pas `display:none`), `tabindex="-1"`, `autocomplete="off"` ; si rempli, ne rien envoyer et afficher quand même le succès.

Comportement :

- `js/form.js` envoie un `POST` JSON vers `FORM_ENDPOINT` (défini dans `js/config.js`, valeur par défaut `"https://REMPLACER-PAR-URL-WEBHOOK"`), avec en plus `source: "landing"` et `date` ISO.
- États : envoi en cours (bouton désactivé), succès (message remplaçant le formulaire : « Merci ! Nous revenons vers vous sous 48 h. »), erreur (message + invitation à réessayer). Messages annoncés via `aria-live`.
- Sans JS : le `<form>` a `action` = `FORM_ENDPOINT` et `method="post"`, et le webhook redirige vers `/merci.html`.
- Validation HTML5 native + messages d'erreur en français associés aux champs (`aria-describedby`).

### Workflow n8n (`/n8n/workflow-formulaire.json`)

Webhook POST → vérification du pot de miel et des champs requis → envoi d'un e-mail vers l'adresse dédiée `[ADRESSE_EMAIL_DEDIEE]` (sujet : « Nouveau contact Le Sénéchal — {commune} — {situation} ») → **optionnel, nœud désactivé par défaut** : ajout d'une ligne dans un Google Sheet (date, commune, situation, statut) pour compter les demandes par segment → réponse 200 JSON (ou redirection 303 vers `/merci.html` si la requête n'est pas en JSON). Laisser les identifiants (credentials) vides, à configurer manuellement. Configurer le CORS du webhook pour n'autoriser que le domaine du site.

## Pages légales

### mentions-legales.html

- Éditeur : « Ce site est édité par un particulier ayant choisi de rester anonyme, conformément à l'article 6-III-2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique. Ses coordonnées ont été communiquées à l'hébergeur. »
- Contact : `[ADRESSE_EMAIL_DEDIEE]`
- Hébergeur : `[NOM_HEBERGEUR]`, `[ADRESSE_HEBERGEUR]`, `[TELEPHONE_HEBERGEUR]`
- Propriété intellectuelle : textes et visuels non réutilisables sans autorisation.

### confidentialite.html

Court et clair :
- données collectées : celles du formulaire, uniquement ;
- finalité : recontacter la personne au sujet du futur service ; aucune revente, aucune prospection tierce ;
- base légale : consentement ;
- destinataire : le porteur du projet uniquement ; transmission par e-mail via `[OUTIL_FORMULAIRE, ex. n8n]` ;
- durée de conservation : `[DUREE_CONSERVATION, proposer 12 mois après le dernier échange]` ;
- droits (accès, rectification, suppression, retrait du consentement) : écrire à `[ADRESSE_EMAIL_DEDIEE]` ; possibilité de réclamation auprès de la CNIL ;
- pas de cookies ni de traceurs.

Regrouper tous les `[PLACEHOLDERS]` dans le README pour que rien ne soit oublié avant la mise en ligne.

## SEO et partage

- `<html lang="fr">`, `<title>` : « Conciergerie Le Sénéchal — Location courte durée autour du Puy du Fou »
- Meta description (~155 caractères) reprenant le différenciateur « vos annonces restent à vous ».
- Open Graph + Twitter Card, image 1200×630 dérivée de `senechal-logo-complet.jpg`.
- Favicon : le logo est trop détaillé ; générer provisoirement un favicon simple (« S » en Cinzel or sur fond bleu nuit) en SVG + PNG 180/192/512, et laisser un `TODO` pour le remplacer par une version simplifiée du blason.
- Données structurées : **ne pas** ajouter de `LocalBusiness` pour l'instant (pas d'adresse publique).

## Qualité / critères d'acceptation

- Lighthouse mobile ≥ 95 en Performance, Accessibilité, Bonnes pratiques et SEO.
- Contrastes WCAG AA respectés (vérifier notamment les textes or sur fond clair : utiliser `#7C6136`).
- Navigation au clavier complète, focus visible, lien d'évitement « Aller au contenu ».
- Images en `loading="lazy"` sauf le blason du bandeau ; dimensions explicites (pas de CLS).
- `prefers-reduced-motion` respecté si des animations sont ajoutées (rester sobre).
- Aucune requête réseau vers un domaine tiers au chargement de la page (vérifier dans l'onglet Réseau).
- Recherche dans tout le dépôt : aucun nom propre de personne ni de société autre que « Le Sénéchal ».

## Hors périmètre (ne pas faire)

- Pas de prix ni de pourcentage de commission.
- Pas de faux avis, faux chiffres ou logos de partenaires.
- Pas de blog, pas de multilingue.
