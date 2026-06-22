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

### Admin Panel ✅ TERMINÉ

#### Authentification ✅
- [x] Page Login (`/login`)
- [x] Stockage JWT token (cookies)
- [x] Redirection selon role/isSeller

#### Espace SELLER (isSeller=true) ✅
- [x] Dashboard SELLER avec stats
- [x] Mes annonces avec CRUD complet
- [x] Créer/Modifier annonce (formulaire multi-step)
- [x] Mon profil

#### Espace OPERATOR ✅
- [x] Dashboard OPERATOR avec stats
- [x] Validation annonces (liste + détail + approve/reject)
- [x] Validation demandes vendeur
- [x] Gestion BUYER

#### Espace SUPER_ADMIN ✅
- [x] Dashboard SUPER_ADMIN
- [x] Gestion catégories, sous-catégories, variantes
- [x] Gestion OPERATOR (CRUD)
- [x] Gestion bannières et flash deals
- [x] Gestion featured sections

#### Layout & Navigation ✅
- [x] Sidebar dynamique selon rôle
- [x] Header avec user dropdown
- [x] Protection routes (middleware proxy.ts)

### Marketplace ⚠️ ~85% TERMINÉ

**Note** : Intégration des templates bonik-react
**IMPORTANT** : i18n (next-intl) configuré - FR et EN

#### Authentification ⚠️ PARTIEL
- [x] Page Login (`/signin`) - Formulaire fonctionnel
- [x] Auth hooks (useAuth) - gestion JWT côté client
- [x] Protection routes (middleware)
- [ ] Page Register (`/signup`) - À faire

#### Navigation & Recherche annonces ✅ TERMINÉ
- [x] Homepage avec bannières, catégories, flash deals, sections
- [x] Page recherche avec filtres (catégorie, type, prix)
- [x] Page détail annonce avec galerie
- [x] Autocomplete dans la recherche

#### Devenir vendeur ✅ TERMINÉ
- [x] Page `/become-seller`
  - Protection : redirect `/signin?redirect=/become-seller`
  - Formulaire complet avec validation Yup
  - États : PENDING (formulaire grisé), APPROVED, REJECTED (resoumission)
  - Lien "Devenir vendeur" dans navbar avec logique auth

#### Mon compte BUYER ✅ TERMINÉ
- [x] Page profil (`/profile`) avec dashboard layout
- [x] Page édition profil (`/profile/edit`)
- [x] Sidebar navigation (orders, wishlist, addresses préparés)
- [ ] Mes commandes (`/profile/orders`) - Phase 3
- [ ] Mes favoris (`/profile/wishlist`) - Phase 2

#### Header/Footer ✅ TERMINÉ
- [x] Header avec UserButton (login/profile selon auth)
- [x] Lien "Devenir vendeur" avec logique conditionnelle
- [x] Footer avec i18n

#### Pages statiques - À FAIRE
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

**Version** : 1.2
**Dernière mise à jour** : 22 Juin 2026
**Phase actuelle** : Phase 1 (MVP Basique) - ~95% complet
**Statut** :
- Backend API : ✅ 100%
- Admin Panel : ✅ 100%
- Marketplace : ⚠️ ~85% (Register et pages statiques manquantes)
