# Roadmap - Universal Services of Congo

Plan de développement progressif de la plateforme USCG.

## Stratégie globale

**Approche** : Développement itératif par phases avec paiement à chaque étape
**Objectif** : Livrer un MVP fonctionnel rapidement, puis enrichir progressivement

```
Phase 1 (Basique) → Phase 2 (Standard) → Phase 3 (Pro) → Post-MVP
    4-5 sem            2-3 sem              2-3 sem         Future
```

---

## Phase 1 : MVP Basique (EN COURS)

**Durée estimée** : 4-5 semaines
**Objectif** : Plateforme fonctionnelle avec le strict minimum pour démarrer

### Backend API ✅ PRIORITÉ ABSOLUE

#### Authentification & Utilisateurs
- [x] Setup NestJS + Prisma + PostgreSQL
- [x] Module Auth
  - [x] POST /auth/register (inscription BUYER - Marketplace)
    - Crée User (role=BUYER, isSeller=false)
    - Validation CGU obligatoire
    - Hashage bcrypt password
    - Retourne JWT
  - [x] POST /auth/login (tous rôles)
    - JWT payload : { sub, email, role, isSeller }
  - [x] POST /auth/refresh (refresh token)
- [x] Module Users
  - [x] GET /users/me (mon profil - tous)
  - [x] PATCH /users/me (modifier mon profil - tous)
  - [x] GET /users (liste BUYER - OPERATOR/SUPER_ADMIN)
  - [x] GET /users/:id (détail - OPERATOR/SUPER_ADMIN)
  - [x] POST /users/operator (créer OPERATOR - SUPER_ADMIN)
  - [x] DELETE /users/:id (supprimer - SUPER_ADMIN)
- [x] Guards
  - [x] JwtAuthGuard (vérification token)
  - [x] RolesGuard (RBAC : BUYER, OPERATOR, SUPER_ADMIN)
  - [x] IsSellerGuard (vérifier isSeller=true)

#### Demandes vendeur (SellerRequest) ✅ TERMINÉ
- [x] Module SellerRequests
  - [x] POST /seller-requests (BUYER authentifié - Marketplace)
    - Body : businessName, businessAddress, businessPhone, taxId?, description
    - Crée SellerRequest (status=PENDING)
    - Vérifier user.isSeller === false
    - Gestion resoumission après rejet
  - [x] GET /seller-requests/me (ma demande - BUYER)
  - [x] GET /seller-requests (toutes demandes - OPERATOR/SUPER_ADMIN)
  - [x] GET /seller-requests/pending (demandes pending - OPERATOR/SUPER_ADMIN)
  - [x] GET /seller-requests/stats (statistiques - OPERATOR/SUPER_ADMIN)
  - [x] GET /seller-requests/:id (détail - OPERATOR/SUPER_ADMIN)
  - [x] PATCH /seller-requests/:id/validate (OPERATOR/SUPER_ADMIN)
    - Body : { status: 'APPROVED' | 'REJECTED', rejectionReason? }
    - Si APPROVED : User.isSeller → true (transaction)
    - Si REJECTED : SellerRequest.status → REJECTED

#### Catégories ✅ TERMINÉ
- [x] Module Categories
  - [x] GET /categories (liste catégories)
  - [x] GET /categories/active (avec sous-catégories actives)
  - [x] GET /categories/slug/:slug
  - [x] POST /categories (création - SuperAdmin)
  - [x] PATCH /categories/:id (modification - SuperAdmin)
  - [x] DELETE /categories/:id (suppression - SuperAdmin)
- [x] Seed catégories initiales : Foncier, Immobilier, Electroménager, Divers

#### Sous-catégories ✅ TERMINÉ
- [x] Module SubCategories
  - [x] GET /subcategories
  - [x] GET /subcategories/by-category/:categoryId
  - [x] GET /subcategories/slug/:categorySlug/:subCategorySlug
  - [x] POST /subcategories (SuperAdmin)
  - [x] PATCH /subcategories/:id (SuperAdmin)
  - [x] DELETE /subcategories/:id (SuperAdmin)
- [x] Seed : 15 sous-catégories

#### Variantes (attributs dynamiques) ✅ TERMINÉ
- [x] Module Variants
  - [x] GET /variants
  - [x] GET /variants/by-category/:categoryId (pour formulaire annonce)
  - [x] GET /variants/filterable/:categoryId (pour filtres recherche)
  - [x] POST /variants (SuperAdmin)
  - [x] PATCH /variants/:id (SuperAdmin)
  - [x] DELETE /variants/:id (SuperAdmin)
- [x] Types : TEXT, NUMBER, SELECT, MULTI_SELECT, COLOR, BOOLEAN
- [x] Noms multilingues (JSON) : `{"fr": "Couleur", "en": "Color"}`
- [x] Seed : 10 variantes (chambres, surface, couleur, marque, état, etc.)

#### Gestion des annonces ✅ TERMINÉ
- [x] Module Ads
  - [x] POST /ads (création - SELLER, status=PENDING)
    - Prix en **FCFA**
    - Quantité nullable (null = pas de stock, ex: immobilier)
    - Support variantes (AdVariantValue)
  - [x] GET /ads (liste publique - approved, location masquée)
  - [x] GET /ads/detail/:id (détail public - approved)
  - [x] GET /ads/my-ads (mes annonces - SELLER)
  - [x] GET /ads/my-ads/:id (détail avec location - SELLER owner)
  - [x] PATCH /ads/:id (modification - SELLER owner)
  - [x] DELETE /ads/:id (SELLER owner ou OPERATOR)
- [x] Endpoints Validation (OPERATOR/SUPER_ADMIN)
  - [x] GET /ads/pending
  - [x] GET /ads/admin/:id (avec location)
  - [x] PATCH /ads/:id/validate
- [x] Stats intégrées : GET /ads/stats, GET /ads/my-stats
- [x] Confidentialité localisation implémentée

#### Upload de fichiers ✅ TERMINÉ
- [x] Module Files
  - [x] POST /files/upload/image (SELLER - max 5 Mo)
  - [x] POST /files/upload/document (SELLER - max 10 Mo, PDF)
  - [x] POST /files/:id/link (associer fichier à annonce)
  - [x] GET /files/:folder/:filename (servir fichier - public)
  - [x] GET /files/ad/:adId (fichiers d'une annonce)
  - [x] GET /files/my-files (mes fichiers non associés - SELLER)
  - [x] GET /files/:id (détail fichier)
  - [x] DELETE /files/:id (SELLER owner ou OPERATOR)
  - [x] **Stockage local avec abstraction** (interface StorageProvider)
  - [x] Structure : uploads/images/, uploads/documents/
  - [x] Types MIME : jpeg, png, webp, gif (images), pdf (documents)
  - [x] Cache 1 an pour fichiers statiques

#### Dashboard & Stats ✅ INTÉGRÉ DANS ADS
- [x] GET /ads/stats (stats globales - OPERATOR/SUPER_ADMIN)
- [x] GET /ads/my-stats (stats vendeur - SELLER)

#### Historique & Logs
- [ ] Module LoginHistory
  - [ ] Enregistrement automatique à chaque login
  - [ ] GET /login-history (historique - SuperAdmin)
  - [ ] Stockage : userId, ipAddress, userAgent, timestamp

#### Documentation API
- [x] Swagger/OpenAPI setup
- [ ] Documentation tous les endpoints
- [ ] Exemples de requêtes/réponses

#### Tests
- [ ] Tests unitaires Auth service
- [ ] Tests unitaires Ads service
- [ ] Tests e2e endpoints critiques (login, create ad, validate ad)

### Admin Panel ✅ PRIORITÉ HAUTE

#### Authentification
- [ ] Page Login (`/login`)
  - [ ] Formulaire email + password
  - [ ] Appel API POST /auth/login
  - [ ] Stockage JWT token
  - [ ] Redirection selon role/isSeller :
    - isSeller=true → `/seller/dashboard`
    - OPERATOR → `/operator/dashboard`
    - SUPER_ADMIN → `/admin/dashboard`

#### Espace SELLER (isSeller=true) - NOUVEAU

- [ ] Dashboard SELLER (`/seller/dashboard`)
  - [ ] Stats cards : Mes annonces (total, pending, approved, rejected)
  - [ ] Liste mes dernières annonces
  - [ ] Graphique annonces par status (Phase 2)

- [ ] Mes annonces (`/seller/ads`)
  - [ ] Tableau : Image, Titre, Prix, Status, Catégorie, Date
  - [ ] Filtres : Status, Catégorie
  - [ ] Pagination
  - [ ] Actions : Voir, Modifier, Supprimer
  - [ ] Bouton : Créer nouvelle annonce

- [ ] Créer annonce (`/seller/ads/new`)
  - [ ] Formulaire : Titre, Description, Prix, Type, Catégorie, Localisation
  - [ ] Upload photos (max 5, drag & drop)
  - [ ] Submit → API POST /ads
  - [ ] Redirection → `/seller/ads`

- [ ] Modifier annonce (`/seller/ads/:id/edit`)
  - [ ] Formulaire pré-rempli
  - [ ] Vérifier ownership (mes annonces uniquement)
  - [ ] Submit → API PATCH /ads/:id

- [ ] Mon profil business (`/seller/profile`)
  - [ ] Affichage infos SellerRequest (readonly)
  - [ ] Modification coordonnées
  - [ ] Paramètres

#### Espace OPERATOR

- [ ] Dashboard OPERATOR (`/operator/dashboard`)
  - [ ] Stats globales : Total ads, Pending ads, Total BUYER, Total SELLER
  - [ ] Widget : Demandes vendeur pending
  - [ ] Liste dernières annonces pending

- [ ] Validation annonces (`/operator/ads/pending`)
  - [ ] Liste TOUTES annonces pending (tous SELLER)
  - [ ] Tableau : SELLER, Image, Titre, Prix, Catégorie, Date
  - [ ] Filtres : Catégorie, SELLER
  - [ ] Actions rapides : Approuver, Refuser, Voir détail

- [ ] Détail annonce (`/operator/ads/:id`)
  - [ ] Affichage complet avec localisation exacte
  - [ ] Galerie photos
  - [ ] Infos SELLER (nom business, contact)
  - [ ] Formulaire validation :
    - Bouton Approuver
    - Bouton Refuser (+ textarea raison)
    - Bouton Demander modification (+ textarea raison)

- [ ] Validation demandes vendeur (`/operator/seller-requests`) - NOUVEAU
  - [ ] Liste TOUTES demandes pending
  - [ ] Tableau : BUYER (nom, email), Business, Téléphone, Date
  - [ ] Actions : Approuver, Refuser, Voir détail
  - [ ] Modal/Page détail : Toutes infos formulaire
  - [ ] Formulaire validation :
    - Bouton Approuver (User.isSeller → true)
    - Bouton Refuser (+ textarea raison)

- [ ] Gestion BUYER (`/operator/buyers`)
  - [ ] Liste tous BUYER
  - [ ] Filtres : isSeller (true/false)
  - [ ] Tableau : Nom, Email, isSeller, Date inscription
  - [ ] Actions : Voir détail
  - [ ] Bloquer/Débloquer (Phase 2)

#### Espace SUPER_ADMIN

- [ ] Dashboard SUPER_ADMIN (`/admin/dashboard`)
  - [ ] Stats complètes (similaire OPERATOR + plus)
  - [ ] Total OPERATOR
  - [ ] Logs système

- [ ] Validation demandes vendeur (`/admin/seller-requests`)
  - [ ] Identique à OPERATOR

- [ ] Gestion BUYER (`/admin/buyers`)
  - [ ] Identique à OPERATOR
  - [ ] + Action : Supprimer BUYER

- [ ] Gestion OPERATOR (`/admin/operators`)
  - [ ] Liste OPERATOR
  - [ ] Créer OPERATOR : Formulaire (email, password, firstName, lastName)
  - [ ] Modifier OPERATOR
  - [ ] Supprimer OPERATOR

- [ ] Gestion catégories (`/admin/categories`) - FAIRE EN PREMIER !
  - [ ] Liste catégories
  - [ ] Créer : nom, slug, description, icon
  - [ ] Modifier
  - [ ] Supprimer (si aucune annonce liée)

- [ ] Historique connexions (`/admin/login-history`)
  - [ ] Liste TOUTES connexions
  - [ ] Filtres : Rôle, Date, User
  - [ ] Tableau : User, Rôle, IP, Date, User Agent

#### Layout & Navigation

- [ ] Sidebar dynamique selon rôle
  - **SELLER** : Dashboard, Mes annonces, Mon profil
  - **OPERATOR** : Dashboard, Validation annonces, Demandes vendeur, Gestion BUYER
  - **SUPER_ADMIN** : Dashboard, Demandes vendeur, Gestion BUYER, Gestion OPERATOR, Catégories, Historique

- [ ] Header
  - Logo + Nom appli
  - User dropdown (nom, rôle, isSeller)
    - Mon profil
    - (Si isSeller : "Voir Marketplace")
    - Déconnexion

- [ ] Protection routes (middleware Next.js)
  - Vérifier JWT token
  - Vérifier rôle/isSeller approprié
  - Redirect si non autorisé

### Marketplace (Templates fournis par client)

**Note** : Intégration des templates HTML/CSS fournis par le client
**IMPORTANT** : Remplacer tous les textes par `t('key')` (i18n dès Phase 1)

#### Authentification
- [ ] Page Register (`/register`)
  - [ ] Formulaire : email, password, firstName, lastName, phone
  - [ ] Checkbox CGU (obligatoire, horodatée)
  - [ ] Submit → API POST /auth/register → User créé (role=BUYER, isSeller=false)
  - [ ] Auto-login + redirection homepage

- [ ] Page Login (`/login`)
  - [ ] Formulaire email + password
  - [ ] Submit → API POST /auth/login
  - [ ] Redirection homepage (ou page précédente)

#### Navigation & Recherche annonces (BUYER)
- [ ] Homepage (`/`)
  - [ ] Hero section
  - [ ] Barre de recherche
  - [ ] Catégories (grille avec icônes)
  - [ ] Annonces à la une (Phase 2)

- [ ] Liste annonces (`/ads`)
  - [ ] Grille d'annonces (approved uniquement)
  - [ ] Filtres : Catégorie, Type (vente/location)
  - [ ] Pagination
  - [ ] Carte annonce : Image, Titre, Prix, Catégorie, Ville

- [ ] Détail annonce (`/ads/:id`)
  - [ ] Galerie photos
  - [ ] Titre, Prix, Type, Description
  - [ ] Localisation approximative (ville, pas adresse exacte)
  - [ ] Infos vendeur (nom business)
  - [ ] Bouton : Contacter vendeur (nécessite login)
  - [ ] Bouton : Ajouter au panier (Phase 3)

#### Devenir vendeur - NOUVEAU (Phase 1)
- [ ] Page Devenir vendeur (`/become-seller`)
  - [ ] Protection : Redirect `/login?redirect=/become-seller` si non connecté
  - [ ] Vérification : Message si déjà isSeller=true
  - [ ] Formulaire :
    - Email (pré-rempli, disabled)
    - Nom/Prénom (pré-remplis, disabled)
    - Nom entreprise (businessName)
    - Adresse entreprise (businessAddress)
    - Téléphone professionnel (businessPhone)
    - Numéro fiscal (taxId - optionnel)
    - Description activité (textarea)
  - [ ] Submit → API POST /seller-requests
  - [ ] Success → Redirect `/seller-requests/status`

- [ ] Page Statut demande (`/seller-requests/status`)
  - [ ] Affiche MA demande (API GET /seller-requests/me)
  - [ ] PENDING : "En attente de validation"
  - [ ] APPROVED : "Approuvé ! Accédez à votre espace vendeur" + lien Admin Panel
  - [ ] REJECTED : "Refusé : {raison}"

#### Mon compte BUYER
- [ ] Page Mon profil (`/profile`)
  - [ ] Affichage infos : email, nom, prénom, téléphone
  - [ ] Modifier profil
  - [ ] Si isSeller=false : Bouton "Devenir vendeur" → `/become-seller`
  - [ ] Si isSeller=true : Lien "Mon espace vendeur" → Admin Panel

- [ ] Mes commandes (`/profile/orders`) - Phase 3

- [ ] Mes favoris (`/profile/favorites`) - Phase 2

#### Contact vendeur
- [ ] Formulaire contact (sur page détail annonce)
  - [ ] Nécessite d'être connecté (BUYER)
  - [ ] Textarea message
  - [ ] Submit → API POST /contacts (Phase 2, email au SELLER)

#### Header/Footer
- [ ] Header
  - Logo
  - Barre recherche
  - Navigation : Accueil, Catégories, Annonces
  - **Bouton "Devenir vendeur"** (visible pour tous)
  - User dropdown (si connecté) :
    - Mon profil
    - (Si isSeller : "Mon espace vendeur")
    - Déconnexion
  - Login/Register (si non connecté)

- [ ] Footer
  - Liens : À propos, Contact, CGU
  - Copyright

#### Pages statiques
- [ ] Page CGU (`/terms`)
- [ ] Page À propos (`/about`)
- [ ] Page Contact (`/contact`)

### Database (Prisma)

- [x] Schema Prisma complet (multi-fichiers)
  - [x] User model (role: BUYER/OPERATOR/SUPER_ADMIN, isSeller: boolean, termsAccepted)
  - [x] SellerRequest model (NOUVEAU - demandes devenir vendeur)
  - [x] Category model (EN PREMIER - avant ads)
  - [x] Ad model (avec categoryId FK, userId FK, location confidentielle)
  - [x] File model (avec adId FK, type: IMAGE/DOCUMENT)
  - [x] LoginHistory model
- [x] Enums
  - [x] Role { BUYER, OPERATOR, SUPER_ADMIN }
  - [x] RequestStatus { PENDING, APPROVED, REJECTED }
  - [x] AdStatus { PENDING, APPROVED, REJECTED, MODIFICATION_REQUESTED }
  - [x] AdType { SALE, RENT }
  - [x] FileType { IMAGE, DOCUMENT }
- [x] Migrations initiales
- [x] Seed script
  - [x] Catégories par défaut : Foncier, Immobilier, Electroménager, Divers
  - [x] User SUPER_ADMIN (email: admin@uscg.com, password: hashed)
  - [x] Données de test (optionnel)

### DevOps

- [x] Configuration .env.example
- [ ] Scripts npm pour monorepo
- [ ] README avec instructions d'installation
- [x] ESLint + Prettier configuration

---

## Phase 2 : MVP Standard

**Durée estimée** : 2-3 semaines
**Prérequis** : Phase 1 validée et déployée
**Paiement** : Acompte Phase 2 reçu

### Backend

#### Upload documents
- [ ] Extension module Files
  - [ ] Support PDF et Word (mime types)
  - [ ] Limite augmentée à 10 Mo
  - [ ] Validation fichiers
  - [ ] Stockage et récupération

#### Notifications email
- [ ] Module Notifications
  - [ ] Setup SMTP (Nodemailer)
  - [ ] Template emails
  - [ ] POST inscription → Email confirmation
  - [ ] PATCH validation annonce → Email notification vendeur
  - [ ] File queue pour emails asynchrones (Bull + Redis optionnel)

#### Filtres avancés
- [ ] Extension endpoint GET /ads
  - [ ] Query params : `minPrice`, `maxPrice`, `category`, `type`, `sort`
  - [ ] Pagination améliorée
  - [ ] Tri : date, prix, pertinence

#### Dashboard amélioré
- [ ] Endpoint GET /dashboard/stats-advanced
  - [ ] Stats par catégorie
  - [ ] Stats temporelles (derniers 7/30 jours)
  - [ ] Graphiques données (format JSON pour charts)

#### Attribution automatique
- [ ] Module Assignment
  - [ ] Liste tournante des opérateurs
  - [ ] Assignment automatique nouvelle annonce → Opérateur disponible
  - [ ] Endpoint GET /assignments (liste assignments - SuperAdmin)

### Admin Panel

#### Dashboard amélioré
- [ ] Graphiques statistiques
  - [ ] Charts.js ou Recharts
  - [ ] Graphe annonces par jour
  - [ ] Répartition par catégorie
- [ ] Widgets stats avancées

#### Gestion utilisateurs complète
- [ ] Actions utilisateurs
  - [ ] Bloquer/Débloquer utilisateur
  - [ ] Modifier rôle (SuperAdmin)
  - [ ] Voir historique connexions utilisateur

#### Notifications temps réel
- [ ] Badge notifications
  - [ ] Indicateur nouvelles annonces pending
  - [ ] Polling ou WebSocket simple
- [ ] Liste notifications
  - [ ] Annonces assignées
  - [ ] Annonces en attente > 24h

### Marketplace

#### Upload documents
- [ ] Extension formulaire création annonce
  - [ ] Upload documents PDF/Word
  - [ ] Max 10 Mo par fichier
  - [ ] Affichage liste documents uploadés

#### Filtres avancés
- [ ] Sidebar filtres avancés
  - [ ] Range prix (slider)
  - [ ] Multi-sélection catégories
  - [ ] Tri (date, prix croissant/décroissant)

#### Notifications email
- [ ] Email confirmation inscription
- [ ] Email changement statut annonce
- [ ] Préférences notifications (opt-out)

### Tests

- [ ] Tests e2e upload documents
- [ ] Tests envoi emails (mocking SMTP)
- [ ] Tests filtres avancés

---

## Phase 3 : MVP Pro

**Durée estimée** : 2-3 semaines
**Prérequis** : Phase 2 validée et déployée
**Paiement** : Acompte Phase 3 reçu

### Backend

#### Panier d'achat
- [ ] Module Cart
  - [ ] POST /cart/add (ajouter article)
  - [ ] GET /cart (voir panier)
  - [ ] DELETE /cart/:itemId (retirer article)
  - [ ] POST /cart/checkout (valider commande)

#### Modes de paiement
- [ ] Module Payments
  - [ ] POST /payments/momo (paiement Mobile Money)
  - [ ] POST /payments/cash (paiement Cash - suivi manuel)
  - [ ] Webhook intégration MoMo (si API disponible)
  - [ ] Statuts commande : pending, paid, cancelled

#### Internationalisation (i18n)
- [ ] Messages API en FR et EN
- [ ] Header `Accept-Language`
- [ ] Traductions erreurs

#### Import Excel
- [ ] Endpoint POST /ads/import (import masse - Operator)
  - [ ] Parse fichier Excel
  - [ ] Validation données
  - [ ] Création annonces en batch
  - [ ] Rapport import (succès/échecs)

#### Export comptabilité
- [ ] Endpoint GET /reports/sales (export ventes - SuperAdmin)
  - [ ] Format CSV ou Excel
  - [ ] Filtres par date
  - [ ] Colonnes : annonce, vendeur, montant, date, statut paiement

#### Gestion rôles avancée
- [ ] Module Permissions
  - [ ] Permissions granulaires
  - [ ] Endpoint PATCH /users/:id/permissions (SuperAdmin)
  - [ ] Middleware permissions

### Admin Panel

#### Import Excel
- [ ] Page Import annonces (`/ads/import`)
  - [ ] Upload fichier Excel
  - [ ] Preview données
  - [ ] Bouton import
  - [ ] Affichage rapport

#### Statistiques avancées
- [ ] Page Statistiques (`/statistics`)
  - [ ] Graphiques avancés
  - [ ] Filtres temporels
  - [ ] Comparaisons périodes
  - [ ] Export PDF/Excel

#### Gestion paiements
- [ ] Page Paiements (`/payments`)
  - [ ] Liste paiements
  - [ ] Statuts : pending, paid, failed
  - [ ] Actions : Confirmer cash, Voir détails

### Marketplace

#### Panier d'achat
- [ ] Icône panier dans header
- [ ] Page Panier (`/cart`)
  - [ ] Liste articles sélectionnés
  - [ ] Calcul total
  - [ ] Bouton passer commande
- [ ] Page Checkout (`/checkout`)
  - [ ] Choix mode paiement : MoMo ou Cash
  - [ ] Formulaire coordonnées
  - [ ] Confirmation commande

#### Interface bilingue FR/EN
- [ ] Sélecteur langue dans header
- [ ] Traductions toutes les pages
  - [ ] Utiliser next-intl ou react-i18next
  - [ ] Fichiers JSON de traduction
- [ ] Détection langue navigateur

#### Mes commandes
- [ ] Page Mes commandes (`/profile/orders`)
  - [ ] Liste commandes
  - [ ] Statuts paiement
  - [ ] Historique

### Tests

- [ ] Tests e2e panier et checkout
- [ ] Tests import Excel
- [ ] Tests i18n (FR et EN)

---

## Post-MVP (Phase 4 - Future)

**Note** : Fonctionnalités prévues après validation des 3 premières phases

### Applications mobiles

- [ ] Application iOS (React Native ou Flutter)
- [ ] Application Android (React Native ou Flutter)
- [ ] API adaptée mobile (optimisations)

### Paiement différé

- [ ] Module Credit
  - [ ] Paiement en plusieurs fois
  - [ ] Suivi évolution paiements
  - [ ] Rappels automatiques
  - [ ] Calcul intérêts si applicable

### Publicité

- [ ] Module Ads Banner
  - [ ] Upload bannières publicitaires
  - [ ] Affichage défilant sur marketplace
  - [ ] Gestion opérateur (activer/désactiver)
  - [ ] Statistiques impressions

### Messagerie interne

- [ ] Module Messages
  - [ ] Conversation vendeur/acheteur
  - [ ] Historique messages
  - [ ] Notifications nouvelles messages

### Intégration emails

- [ ] Boîtes email dédiées
  - [ ] support@universal-services-congo.com
  - [ ] info@universal-services-congo.com
- [ ] Redirection emails vers plateforme

### Formation longue durée

- [ ] Documentation utilisateur complète
- [ ] Vidéos tutoriels
- [ ] Formation 1 mois pour équipe client

---

## Phases futures (évolution long terme)

### Performance & Scalabilité

- [ ] Caching avec Redis
- [ ] CDN pour assets statiques
- [ ] Database indexing optimisé
- [ ] Load balancing

### Fonctionnalités avancées

- [ ] Système de notation et avis
- [ ] Recommandations IA
- [ ] Chat en direct (WebSocket)
- [ ] Notifications push (PWA)

### Intégrations tierces

- [ ] Paiements internationaux (Stripe, PayPal)
- [ ] Réseaux sociaux (partage, login)
- [ ] Google Maps API (cartes interactives)
- [ ] Analytics avancés (Mixpanel, Amplitude)

### DevOps & Monitoring

- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Grafana, Prometheus)
- [ ] Logs centralisés (ELK Stack)
- [ ] Backups automatiques

---

## Critères de validation par phase

### Phase 1 - MVP Basique

**Critères de livraison** :
- ✅ Backend API fonctionnel avec tous les endpoints listés
- ✅ Admin Panel opérationnel (login, validation annonces, gestion users)
- ✅ Marketplace fonctionnel (création compte, publication annonces, recherche)
- ✅ Tests unitaires et e2e passants
- ✅ Documentation README et API complètes
- ✅ Déploiement sur environnement de staging
- ✅ Formation basique équipe client (1 semaine)

**Paiement** : Solde Phase 1 (50% du montant Phase 1)

### Phase 2 - Standard

**Critères de livraison** :
- ✅ Upload documents PDF/Word fonctionnel
- ✅ Notifications email opérationnelles
- ✅ Filtres avancés et dashboard statistiques
- ✅ Attribution automatique annonces
- ✅ Tests et documentation mis à jour
- ✅ Déploiement production

**Paiement** : Solde Phase 2

### Phase 3 - Pro

**Critères de livraison** :
- ✅ Panier et paiement MoMo/Cash fonctionnels
- ✅ Interface bilingue FR/EN complète
- ✅ Import Excel et export comptabilité
- ✅ Statistiques avancées
- ✅ Tests et documentation finaux
- ✅ Formation complète équipe client (2 semaines)

**Paiement** : Solde Phase 3

---

## Timeline indicatif

```
Semaine 1-2   : Backend API (Auth, Users, Categories, Ads)
Semaine 3     : Backend API (Files, Dashboard, LoginHistory)
Semaine 4     : Admin Panel complet
Semaine 5     : Marketplace (intégration templates)
Semaine 6     : Tests, corrections, déploiement Phase 1
─────────────────────────────────────────────────────────
Semaine 7-8   : Phase 2 - Développement
Semaine 9     : Phase 2 - Tests et déploiement
─────────────────────────────────────────────────────────
Semaine 10-11 : Phase 3 - Développement
Semaine 12    : Phase 3 - Tests et déploiement
```

**Total MVP complet** : 12 semaines (3 mois)

---

## Ordre de développement recommandé

### Backend (ordre strict)

1. **Setup projet** : NestJS + Prisma + PostgreSQL
2. **Auth** : Register, Login, JWT
3. **Users** : CRUD + Roles
4. **Categories** : CRUD + Seed ← **AVANT les annonces !**
5. **Ads** : CRUD + Validation
6. **Files** : Upload photos
7. **Dashboard** : Stats
8. **LoginHistory** : Logs

### Admin Panel

1. **Login** : Authentification
2. **Categories** : CRUD ← **FAIRE EN PREMIER !**
3. **Dashboard** : Stats basiques
4. **Ads** : Liste + Validation
5. **Users** : Liste + Gestion

### Marketplace

1. **Auth** : Register + Login
2. **Categories** : Affichage (lecture seule)
3. **Ads** : Création + Mes annonces
4. **Search** : Recherche + Filtres
5. **Detail** : Page détail annonce

---

**Version** : 1.1
**Dernière mise à jour** : 12 Juin 2026
**Phase actuelle** : Phase 1 (MVP Basique) - Backend API quasi-complet
