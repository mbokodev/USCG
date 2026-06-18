# Instructions pour Agents IA - Universal Services of Congo

Ce document contient des instructions pour les agents IA (Claude, etc.) travaillant sur ce projet.

## Contexte du projet

**Projet** : Marketplace USCG (Universal Services of Congo)
**Type** : Plateforme e-commerce avec validation d'annonces par agents
**Stack** : NestJS + Next.js + PostgreSQL + Prisma
**Monorepo** : npm workspaces

### Architecture Utilisateurs

**2 applications distinctes** :

1. **Marketplace** (Frontend public) - Pour ACHETEURS et inscription SELLER
   - Tous les utilisateurs s'inscrivent ici comme `BUYER`
   - Inscription libre (email, password, nom, prénom)
   - Navigation/recherche annonces
   - Panier et commandes (Phase 3)
   - **Formulaire "Devenir vendeur"** (nécessite d'être connecté)
     - BUYER connecté peut remplir formulaire
     - Infos business demandées
     - Crée une `SellerRequest` (PENDING)

2. **Admin Panel** - Pour VENDEURS APPROUVÉS et ADMINISTRATEURS
   - Rôle : `BUYER avec isSeller=true` - Vendeurs avec espace dédié
     - Accès après validation de leur SellerRequest
     - CRUD de leurs annonces
     - Statistiques de leurs ventes
     - Liste de leurs clients
     - Peuvent aussi accéder au Marketplace pour acheter
   - Rôle : `OPERATOR` - Validateurs
     - Validation/refus annonces
     - Validation/refus demandes vendeur (SellerRequest)
     - Gestion utilisateurs BUYER
     - Dashboard global
   - Rôle : `SUPER_ADMIN` - Administrateur système
     - Validation demandes vendeur (SellerRequest)
     - Gestion catégories
     - Gestion complète plateforme
     - Création comptes OPERATOR

### Workflow "Devenir vendeur"

```
1. Visiteur Marketplace
   ↓
2. S'inscrit → User créé (role=BUYER, isSeller=false)
   ↓
3. Se connecte → Accès Marketplace
   ↓
4. Clique "Devenir vendeur"
   ↓ (Si non connecté → redirect login)
5. Remplit formulaire business
   → businessName, businessAddress, businessPhone, description
   ↓
6. Submit → SellerRequest créée (status=PENDING)
   ↓
7. OPERATOR/SUPER_ADMIN voit demande dans Admin Panel
   ↓
8a. APPROUVE → User.isSeller = true
    → User peut accéder Admin Panel (espace SELLER)
    → Email confirmation envoyé (Phase 2+)

8b. REFUSE → SellerRequest.status = REJECTED
    → Email avec raison (Phase 2+)
```

**Important** : Un utilisateur avec `isSeller=true` peut accéder aux DEUX interfaces :
- **Marketplace** : Pour acheter (en tant que BUYER)
- **Admin Panel** : Pour vendre (en tant que SELLER)

## Stratégie de développement

### Approche par phases (IMPORTANT)

Le projet se développe en **3 phases progressives** avec paiement à chaque étape :

1. **Phase 1 - MVP Basique** (EN COURS) : Fonctionnalités essentielles
2. **Phase 2 - Standard** : Fonctionnalités avancées
3. **Phase 3 - Pro** : Fonctionnalités complètes

### Distinction critique : Initialiser vs Implémenter

**❌ NE PAS implémenter la LOGIQUE des phases futures**
- Pas de code pour panier d'achat (Phase 3)
- Pas de notifications email (Phase 2)
- Pas de paiements MoMo (Phase 3)

**✅ MAIS initialiser les STRUCTURES dès Phase 1**

Certaines architectures doivent être mises en place **dès maintenant** pour éviter de tout refactoriser plus tard :

#### Exemples d'initialisations à faire en Phase 1 :

1. **Multilingue (i18n)** - Pour Phase 3
   ```typescript
   // ✅ Initialiser dès Phase 1
   // shared/i18n/fr.json
   {
     "common.welcome": "Bienvenue",
     "ads.title": "Titre de l'annonce"
   }

   // Components utilisent t() dès le début
   <h1>{t('common.welcome')}</h1>

   // Phase 3 : On ajoutera juste en.json, pas de refactoring !
   ```

2. **Enum extensibles**
   ```typescript
   // ✅ Prévoir dès Phase 1
   enum FileType {
     IMAGE = 'IMAGE',
     DOCUMENT = 'DOCUMENT'  // Même si pas utilisé en Phase 1
   }
   ```

3. **Structure de dossiers**
   ```
   uploads/
   ├── images/      # Phase 1
   └── documents/   # Phase 2, mais dossier créé dès Phase 1
   ```

4. **Champs DB pour futures fonctionnalités**
   ```prisma
   model User {
     // Phase 1
     id       String @id
     email    String @unique

     // Phase 3 - Mais ajouter dès Phase 1 (nullable)
     preferredLanguage String? @default("fr")
     cartId            String?
   }
   ```

**Règle d'or** : Si une future fonctionnalité nécessite une architecture de base (i18n, structure fichiers, enums), l'initialiser dès Phase 1. Mais ne pas implémenter la logique métier.

### Priorités actuelles

1. **Backend API** (priorité absolue)
2. **Admin Panel** (priorité haute)
3. Marketplace et Cover Page (templates fournis par le client)

## Architecture

### Workspaces

```
USCG/
├── backend/          # NestJS API - FOCUS PRINCIPAL
├── admin-panel/      # Next.js - FOCUS SECONDAIRE
├── marketplace/      # Next.js - Templates client fournis
├── cover-page/       # Next.js - Déjà terminé
└── shared/           # Utilitaires partagés
```

### Rôles utilisateurs (3 rôles système + 1 statut)

**Rôle système (champ `role` dans DB)** :
1. **BUYER** (par défaut)
2. **OPERATOR**
3. **SUPER_ADMIN**

**Statut vendeur (champ `isSeller` boolean)** :
- `false` : Simple acheteur
- `true` : Acheteur ET vendeur (accès Admin Panel)

#### 1. BUYER (isSeller = false)
- Inscription libre sur Marketplace
- Navigation et recherche d'annonces
- Panier et commandes (Phase 3)
- Contact vendeurs
- Peut demander à devenir SELLER via formulaire
- **Accès** : Marketplace uniquement

#### 2. BUYER (isSeller = true) - VENDEUR
- Toutes les permissions BUYER +
- Accès Admin Panel dans espace SELLER
- CRUD de LEURS annonces uniquement
- Statistiques de LEURS ventes
- Liste de LEURS clients
- Gestion profil business
- **Accès** : Marketplace (achat) ET Admin Panel (vente)

#### 3. OPERATOR
- Créés manuellement par SUPER_ADMIN
- Validation/refus annonces de tous les SELLER
- Validation/refus SellerRequest (devenir vendeur)
- Gestion des utilisateurs BUYER
- Dashboard statistiques globales
- **Accès** : Admin Panel uniquement

#### 4. SUPER_ADMIN
- Créé lors du setup initial
- Toutes les permissions
- Validation SellerRequest
- Création des comptes OPERATOR
- Gestion des catégories
- Gestion complète de la plateforme
- **Accès** : Admin Panel uniquement

## Technologies

### Backend (NestJS)

- **Version** : NestJS 11.0.1
- **ORM** : Prisma 7.8.0 avec PostgreSQL
- **Auth** : Passport.js + JWT + bcrypt
- **Validation** : class-validator + class-transformer
- **API** : REST (Swagger docs recommandé)

### Frontend (Next.js)

- **Version** : Next.js 16.2.4 + React 19.2.4
- **TypeScript** : Strict mode activé
- **Styling** : Tailwind CSS 4
- **Conventions** : App Router (pas Pages Router)

### Database (Prisma + PostgreSQL)

- **Migrations** : Toujours versionner avec `prisma migrate dev`
- **Seed** : Créer des données de test si nécessaire
- **Schema** : Documenter les relations importantes

## Règles de développement

### Backend

1. **Structure modulaire** : Un module par domaine (users, ads, categories, etc.)
2. **DTOs obligatoires** : Toujours créer des DTOs pour validation
3. **Guards JWT** : Protéger toutes les routes sauf login/register
4. **Role Guards** : Implémenter RBAC (Public, Operator, SuperAdmin)
5. **Error handling** : Utiliser les exceptions NestJS appropriées
6. **Logging** : Logger les actions importantes (validation annonces, etc.)

### Frontend

1. **Server Components** : Par défaut (Next.js 16)
2. **Client Components** : Uniquement si interactivité nécessaire
3. **Tailwind uniquement** : Pas de CSS modules ou styled-components
4. **Types partagés** : Utiliser le workspace `shared/types`
5. **API calls** : Centraliser dans `shared/services`

### Database

1. **Prisma Schema** : Documenter chaque modèle
2. **Relations** : Toujours définir onDelete et onUpdate
3. **Indexes** : Ajouter sur champs de recherche fréquents
4. **Timestamps** : createdAt et updatedAt sur chaque modèle

## Fonctionnalités par phase

### Phase 1 - MVP Basique (EN COURS)

#### Initialisations pour phases futures (À FAIRE DÈS PHASE 1)

**IMPORTANT** : Initialiser ces structures dès Phase 1, même si logique implémentée plus tard

- [x] **i18n (Multilingue)** ✅ TERMINÉ
  - [x] Installer et configurer next-intl
  - [x] Créer `messages/fr.json` et `messages/en.json` avec traductions
  - [x] Utiliser `t('key')` partout au lieu de texte en dur
  - [x] Modules traduits : login, dashboard, ads, categories, etc.

- [x] **Structure fichiers extensible** ✅ TERMINÉ
  - [x] Enum `FileType { IMAGE, DOCUMENT }`
  - [x] Dossiers `uploads/images/` et `uploads/documents/`
  - [x] Colonne `type` dans table File

- [ ] **Champs DB pour futures phases**
  - [ ] `User.preferredLanguage` (nullable, défaut 'fr')
  - [ ] Tables avec timestamps `createdAt`, `updatedAt` partout
  - [ ] Prévoir champs pour statistiques (vues, etc.) si pertinent

- [ ] **Backend API responses standardisées**
  - [ ] Format uniforme : `{ success, data, message, errors? }`
  - [ ] Facilitera ajout pagination, tri, filtres en Phase 2

#### Backend (Fonctionnalités Phase 1)

**Auth & Users**
- [ ] Auth JWT (register, login, refresh)
- [ ] POST /auth/register (Marketplace - inscription BUYER libre)
  - Crée User avec role=BUYER, isSeller=false
  - Retourne JWT token
- [ ] POST /auth/login (tous rôles)
  - Vérifie credentials
  - Retourne JWT avec role et isSeller
- [ ] GET /users/me (tous - mon profil)
- [ ] PATCH /users/me (tous - modifier mon profil)
- [ ] GET /users (OPERATOR/SUPER_ADMIN - liste BUYER)
- [ ] POST /users/operator (SUPER_ADMIN - créer OPERATOR)
- [ ] CGU acceptance BUYER avec horodatage

**Demandes vendeur (SellerRequest)** ✅ TERMINÉ
- [x] POST /seller-requests (BUYER authentifié)
  - Nécessite user.isSeller = false
  - Crée SellerRequest avec status=PENDING
  - Gestion resoumission après rejet
- [x] GET /seller-requests/me (BUYER - ma demande)
- [x] GET /seller-requests (OPERATOR/SUPER_ADMIN - toutes demandes)
- [x] GET /seller-requests/pending (OPERATOR/SUPER_ADMIN - pending uniquement)
- [x] GET /seller-requests/stats (OPERATOR/SUPER_ADMIN - statistiques)
- [x] GET /seller-requests/:id (OPERATOR/SUPER_ADMIN - détail)
- [x] PATCH /seller-requests/:id/validate (OPERATOR/SUPER_ADMIN)
  - Body : { status: 'APPROVED' | 'REJECTED', rejectionReason? }
  - Si APPROVED → User.isSeller = true (transaction)
  - Si REJECTED → SellerRequest.status = REJECTED

**Catégories** ✅ TERMINÉ
- [x] GET /categories (public - inclut sous-catégories)
- [x] GET /categories/active (avec sous-catégories)
- [x] GET /categories/slug/:slug
- [x] POST /categories (SUPER_ADMIN)
- [x] PATCH /categories/:id (SUPER_ADMIN)
- [x] DELETE /categories/:id (SUPER_ADMIN)
- [x] Seed : Foncier, Immobilier, Electroménager, Divers
- [x] **Icônes Lucide** : Champ `icon` stocke le nom de l'icône Lucide (ex: "Home", "Mountain")
- [x] **Marketplace** : Catégories fetchées depuis l'API avec sous-catégories

**Sous-catégories** ✅ TERMINÉ
- [x] GET /subcategories
- [x] GET /subcategories/by-category/:categoryId
- [x] GET /subcategories/slug/:categorySlug/:subCategorySlug
- [x] POST /subcategories (SUPER_ADMIN)
- [x] PATCH /subcategories/:id (SUPER_ADMIN)
- [x] DELETE /subcategories/:id (SUPER_ADMIN)
- [x] Seed : 15 sous-catégories

**Variantes (attributs dynamiques)** ✅ TERMINÉ
- [x] GET /variants (liste)
- [x] GET /variants/by-category/:categoryId (pour formulaire annonce)
- [x] GET /variants/filterable/:categoryId (pour filtres recherche)
- [x] POST /variants (SUPER_ADMIN)
- [x] PATCH /variants/:id (SUPER_ADMIN)
- [x] DELETE /variants/:id (SUPER_ADMIN)
- [x] Types supportés : TEXT, NUMBER, SELECT, MULTI_SELECT, COLOR, BOOLEAN
- [x] Noms multilingues (JSON) : `{"fr": "Couleur", "en": "Color"}`
- [x] Seed : 10 variantes (chambres, surface, couleur, marque, etc.)

**Annonces** ✅ TERMINÉ
- [x] POST /ads (SELLER) - status=PENDING
- [x] GET /ads (public - approved, location masquée)
- [x] GET /ads/detail/:id (public - approved)
- [x] GET /ads/my-ads (SELLER)
- [x] GET /ads/my-ads/:id (SELLER - avec location)
- [x] PATCH /ads/:id (SELLER owner)
- [x] DELETE /ads/:id (SELLER owner ou OPERATOR)
- [x] GET /ads/pending (OPERATOR/SUPER_ADMIN)
- [x] GET /ads/admin/:id (OPERATOR/SUPER_ADMIN - avec location)
- [x] PATCH /ads/:id/validate (OPERATOR/SUPER_ADMIN)
- [x] GET /ads/stats (OPERATOR/SUPER_ADMIN)
- [x] GET /ads/my-stats (SELLER)
- [x] **Prix en FCFA** (Franc CFA)
- [x] **Quantité nullable** : null = pas de stock (immobilier), nombre = stock disponible
- [x] Confidentialité location implémentée

**Upload fichiers** ✅ TERMINÉ
- [x] POST /files/upload/image (SELLER - max 5 Mo)
- [x] POST /files/upload/document (SELLER - max 10 Mo, PDF)
- [x] POST /files/:id/link (associer fichier à annonce)
- [x] GET /files/:folder/:filename (public)
- [x] GET /files/ad/:adId (fichiers d'une annonce)
- [x] GET /files/my-files (mes fichiers non associés)
- [x] GET /files/:id (détail fichier)
- [x] PATCH /files/:id/set-default (définir image principale)
- [x] PATCH /files/:id/unset-default (retirer image principale)
- [x] DELETE /files/:id (SELLER owner ou OPERATOR)
- [x] **Stockage local avec abstraction** (interface StorageProvider)
- [x] Structure : `uploads/images/` et `uploads/documents/`
- [x] Types MIME : jpeg, png, webp, gif (images), pdf (documents)
- [x] **Image par défaut** : champ `isDefault` sur File, tri automatique

**Dashboard & Stats** ✅ INTÉGRÉ DANS ADS ET SELLER-REQUESTS
- [x] GET /ads/stats (OPERATOR/SUPER_ADMIN - stats annonces)
- [x] GET /ads/my-stats (SELLER - mes stats annonces)
- [x] GET /seller-requests/stats (OPERATOR/SUPER_ADMIN - stats demandes)

**Bannières (Carousel)** ✅ TERMINÉ
- [x] GET /banners (public - bannières actives)
- [x] GET /banners/:id (SUPER_ADMIN)
- [x] POST /banners (SUPER_ADMIN)
- [x] PATCH /banners/:id (SUPER_ADMIN)
- [x] DELETE /banners/:id (SUPER_ADMIN)
- [x] **Champs** : title, description, imageUrl, buttonText, buttonLink, isActive, order
- [x] **Lien dynamique** : vers une annonce (`/ads/:id`) ou page fixe (`/categories`, `/about`, etc.)

**Flash Deals** ✅ TERMINÉ
- [x] GET /flash-deals (public - flash deals actifs avec annonces approuvées)
- [x] GET /flash-deals/admin (SUPER_ADMIN - tous les flash deals)
- [x] GET /flash-deals/:id (détail d'un flash deal)
- [x] GET /flash-deals/eligible-ads (SUPER_ADMIN - annonces éligibles)
- [x] POST /flash-deals (SUPER_ADMIN - créer flash deal)
- [x] PATCH /flash-deals/:id (SUPER_ADMIN - modifier)
- [x] DELETE /flash-deals/:id (SUPER_ADMIN - supprimer)
- [x] **Champs** : adId, startDate, endDate, isActive, order
- [x] **Conditions** : Annonce doit être APPROVED avec discountedPrice défini

**Featured Sections (Sections Homepage)** ✅ TERMINÉ
- [x] GET /featured-sections (public - sections actives avec annonces pour homepage)
- [x] GET /featured-sections/admin (SUPER_ADMIN - toutes les sections)
- [x] GET /featured-sections/:id (SUPER_ADMIN - détail section)
- [x] POST /featured-sections (SUPER_ADMIN - créer section)
- [x] PATCH /featured-sections/:id (SUPER_ADMIN - modifier)
- [x] DELETE /featured-sections/:id (SUPER_ADMIN - supprimer)
- [x] GET /featured-sections/:id/ads (public - annonces d'une section avec filtres)
- [x] **Champs** : title (i18n), categoryId, subCategoryId, filterType, limit, order, isActive
- [x] **FilterType** : NONE, CITY, SUBCATEGORY, VARIANT
- [x] **Marketplace** : Section6 dynamique avec sidebar filtres (max 7), premier filtre présélectionné
- [x] **Lien "Voir tout"** : Redirige vers /search avec paramètres de filtre

**Historique connexions**
- [ ] Enregistrement automatique à chaque login
  - userId, ipAddress, userAgent, timestamp
- [ ] GET /login-history (SUPER_ADMIN - tout)
- [ ] GET /login-history/me (tous - ses connexions)

#### Admin Panel

**Authentification**
- [ ] Page Login (`/login`)
  - Formulaire email + password
  - Appel API POST /auth/login
  - Stockage JWT token
  - Redirection selon rôle/isSeller :
    - isSeller=true → `/seller/dashboard`
    - OPERATOR → `/operator/dashboard`
    - SUPER_ADMIN → `/admin/dashboard`

**Espace SELLER (isSeller=true)**

- [ ] Dashboard SELLER (`/seller/dashboard`)
  - Widget : Mes annonces (total, pending, approved, rejected)
  - Widget : Mes dernières annonces
  - Widget : Vues totales (Phase 2+)
  - Graphique annonces par status (Phase 2)

- [x] Mes annonces (`/my-ads`) ✅ TERMINÉ
  - Liste de MES annonces uniquement
  - Tableau avec : Image, Titre, Prix, Status, Catégorie, Date
  - Recherche avec debounce
  - Pagination
  - Actions : Modifier, Supprimer
  - Bouton : Créer nouvelle annonce
  - Modal raison de rejet/modification

- [x] Créer annonce (`/seller/ads/new`) ✅ TERMINÉ
  - Formulaire multi-step avec Formik + Yup
    - Step 1: Catégorie + Localisation
    - Step 2: Titre, Description (TiptapEditor), Prix, Type, Quantité
    - Step 3: Upload photos (MultiImageUpload, max 10, drag & drop)
  - Composants: `AdForm`, `AdFormStepper`, `StepCategory`, `StepInformation`, `StepImages`
  - Submit → Upload images → POST /ads → Link files → Redirection `/ads`

- [x] Modifier annonce (`/seller/ads/:id/edit`) ✅ TERMINÉ
  - Formulaire pré-rempli avec images existantes
  - Seulement MES annonces
  - Submit → API PATCH /ads/:id
  - Remet en PENDING si REJECTED ou MODIFICATION_REQUESTED

- [ ] Mon profil business (`/seller/profile`)
  - Affichage infos business (SellerRequest approuvée)
  - Modification : businessName, businessAddress, businessPhone, description
  - Paramètres (Phase 2+ : notifications, etc.)

- [ ] Mes ventes (`/seller/sales`) - Phase 3
  - Liste de mes commandes
  - Tableau : Client, Annonce, Montant, Date, Status

- [ ] Mes clients (`/seller/customers`) - Phase 3
  - Liste BUYER ayant commandé chez moi

**Espace OPERATOR**

- [ ] Dashboard OPERATOR (`/operator/dashboard`)
  - Stats globales
    - Total annonces (toutes, pending, approved)
    - Total BUYER, Total SELLER
    - Demandes vendeur pending
  - Liste dernières annonces pending
  - Liste dernières demandes vendeur pending

- [ ] Validation annonces (`/operator/ads/pending`)
  - Liste TOUTES annonces pending (tous SELLER)
  - Tableau : SELLER, Image, Titre, Prix, Catégorie, Date
  - Filtres : Catégorie, SELLER
  - Actions rapides : Approuver, Refuser, Voir détail

- [x] Détail annonce (`/operator/ads/:id`) ✅ TERMINÉ
  - Layout 2 colonnes: Galerie (gauche) + Infos (droite)
  - Galerie avec miniatures verticales + image principale
  - Description avec TiptapViewer (rendu JSON)
  - Tableau d'infos avec icônes (prix, type, catégorie, vendeur, dates)
  - Localisation confidentielle (fond ambre)
  - Actions:
    - Bouton Approuver → ConfirmModal
    - Bouton Refuser → RejectModal (avec raison)

- [ ] Validation demandes vendeur (`/operator/seller-requests`)
  - Liste TOUTES demandes pending
  - Tableau : BUYER (nom, email), Business, Téléphone, Date demande
  - Actions : Approuver, Refuser, Voir détail
  - Détail : Toutes infos du formulaire
  - Formulaire validation :
    - Bouton : Approuver (User.isSeller → true)
    - Bouton : Refuser (+ champ raison)

- [ ] Gestion BUYER (`/operator/buyers`)
  - Liste tous BUYER
  - Filtres : isSeller (true/false)
  - Tableau : Nom, Email, isSeller, Date inscription
  - Actions : Voir détail
  - Bloquer/Débloquer (Phase 2)

**Espace SUPER_ADMIN**

- [ ] Dashboard SUPER_ADMIN (`/admin/dashboard`)
  - Stats complètes (similaire OPERATOR + plus)
  - Total OPERATOR
  - Logs système

- [ ] Validation demandes vendeur (`/admin/seller-requests`)
  - Identique à OPERATOR

- [ ] Gestion BUYER (`/admin/buyers`)
  - Identique à OPERATOR + actions supplémentaires
  - Supprimer BUYER

- [ ] Gestion OPERATOR (`/admin/operators`)
  - Liste OPERATOR
  - Créer nouveau OPERATOR
    - Formulaire : email, password, firstName, lastName
    - Submit → API POST /users/operator
  - Modifier OPERATOR
  - Supprimer OPERATOR

- [ ] Gestion catégories (`/admin/categories`)
  - Liste catégories
  - CRUD complet
  - Créer : nom, slug, description, icon
  - Modifier
  - Supprimer (si aucune annonce liée)

- [ ] Historique connexions (`/admin/login-history`)
  - Liste TOUTES connexions
  - Filtres : Rôle, Date, User
  - Tableau : User, Rôle, IP, Date, User Agent

**Layout & Navigation**

- [ ] Sidebar dynamique selon rôle
  - **SELLER** :
    - Dashboard
    - Mes annonces
    - Mon profil
    - (Phase 3 : Mes ventes, Mes clients)
  - **OPERATOR** :
    - Dashboard
    - Validation annonces
    - Demandes vendeur
    - Gestion BUYER
  - **SUPER_ADMIN** :
    - Dashboard
    - Demandes vendeur
    - Gestion BUYER
    - Gestion OPERATOR
    - Catégories
    - Historique connexions

- [ ] Header
  - Logo + Nom appli
  - User dropdown (nom, rôle)
    - Mon profil
    - (Si isSeller : "Voir Marketplace")
    - Déconnexion

- [ ] Protection routes (middleware Next.js)
  - Vérifier JWT token
  - Vérifier rôle approprié pour chaque route
  - Redirect si non autorisé

#### Marketplace (templates fournis par client)

**Authentification**
- [ ] Page Register (`/register`)
  - Formulaire : email, password, firstName, lastName, phone
  - Checkbox CGU (obligatoire)
  - Submit → API POST /auth/register → User créé (role=BUYER, isSeller=false)
  - Auto-login → Redirection homepage

- [ ] Page Login (`/login`)
  - Formulaire email + password
  - Submit → API POST /auth/login
  - Redirection homepage (ou page précédente)

**Navigation & Recherche**
- [x] Homepage (`/`)
  - Hero section (bannières carousel)
  - Barre de recherche avec filtre catégorie
  - **Catégories dynamiques** : Fetchées depuis API avec sous-catégories et icônes Lucide
  - Annonces à la une (Phase 2)

**Composants Marketplace intégrés**
- [x] `CategoryDropdown` : Menu catégories avec sous-catégories (hover)
- [x] `LucideIcon` : Affichage icônes Lucide par nom
- [x] `SearchInputWithCategory` : Barre recherche avec filtre catégorie
- [x] `categoriesService` : Service fetch catégories depuis API

- [ ] Liste annonces (`/ads`)
  - Grille/liste d'annonces (status=APPROVED uniquement)
  - Filtres sidebar :
    - Catégorie (multi-select)
    - Type (vente/location)
    - Prix (min/max - Phase 2)
  - Tri : Date, Prix (Phase 2)
  - Pagination
  - Chaque carte annonce : Image, Titre, Prix, Catégorie, Ville (pas adresse exacte)

- [ ] Page détail annonce (`/ads/:id`)
  - Galerie photos (carrousel)
  - Titre, Prix, Type (vente/location)
  - Description complète
  - Catégorie
  - Localisation approximative (ville, pas adresse exacte)
  - Infos vendeur (nom business, pas contact direct)
  - Bouton : Contacter vendeur (nécessite login - Phase 1)
  - Bouton : Ajouter au panier (Phase 3)

**Devenir vendeur (IMPORTANT - Phase 1)**
- [ ] Page Devenir vendeur (`/become-seller`)
  - **Protection** : Nécessite d'être connecté
    - Si non connecté → Redirect `/login?redirect=/become-seller`
  - **Vérification** : Si déjà isSeller=true → Message "Vous êtes déjà vendeur"
  - **Formulaire** :
    - Email (pré-rempli, disabled)
    - Nom/Prénom (pré-remplis, disabled)
    - Nom de l'entreprise (businessName)
    - Adresse de l'entreprise (businessAddress)
    - Téléphone professionnel (businessPhone)
    - Numéro fiscal (taxId - optionnel)
    - Description de l'activité (description - textarea)
  - Submit → API POST /seller-requests
  - Success → Message "Demande envoyée, en attente de validation"
  - Redirection → `/seller-requests/status`

- [ ] Page Statut demande vendeur (`/seller-requests/status`)
  - Affiche status de MA demande
  - PENDING : "En attente de validation"
  - APPROVED : "Approuvé ! Vous pouvez accéder à l'Admin Panel" + lien
  - REJECTED : "Refusé" + raison

**Mon compte BUYER**
- [ ] Page Mon profil (`/profile`)
  - Affichage infos : email, nom, prénom, téléphone
  - Modifier profil
  - Si isSeller=false : Bouton "Devenir vendeur" → `/become-seller`
  - Si isSeller=true : Lien "Accéder à mon espace vendeur" → Admin Panel

- [ ] Mes commandes (`/profile/orders`) - Phase 3
  - Liste mes commandes
  - Status paiement

- [ ] Mes favoris (`/profile/favorites`) - Phase 2
  - Liste annonces sauvegardées

**Contact vendeur**
- [ ] Formulaire contact vendeur (sur page détail annonce)
  - Nécessite d'être connecté (BUYER)
  - Message (textarea)
  - Submit → API POST /contacts (Phase 2)
  - Email envoyé au SELLER (Phase 2)

**Panier (Phase 3)**
- [ ] Page Panier (`/cart`)
- [ ] Page Checkout (`/checkout`)
- [ ] Choix paiement (MoMo/Cash)

**Pages statiques**
- [ ] Page CGU (`/terms`)
- [ ] Page À propos (`/about`)
- [ ] Page Contact (`/contact`)

**Header/Footer**
- [ ] Header
  - Logo
  - Barre recherche
  - Navigation : Accueil, Catégories, Annonces
  - Bouton "Devenir vendeur" (visible pour tous)
  - User dropdown (si connecté) :
    - Mon profil
    - Mes commandes (Phase 3)
    - (Si isSeller : "Mon espace vendeur" → Admin Panel)
    - Déconnexion
  - Login/Register (si non connecté)
  - Panier (Phase 3)

- [ ] Footer
  - Liens : À propos, Contact, CGU
  - Réseaux sociaux
  - Copyright

**IMPORTANT lors de l'intégration des templates** :
- Remplacer TOUS les textes en dur par `t('key')` (i18n)
- Exemple : `<h1>Bienvenue</h1>` → `<h1>{t('common.welcome')}</h1>`
- Créer les clés dans `shared/i18n/fr.json` au fur et à mesure

### Phase 2 - Standard (LOGIQUE À NE PAS IMPLÉMENTER)

**❌ Ne pas implémenter la logique complète maintenant :**
- Upload documents PDF/Word (10 Mo)
- Filtres avancés
- Notifications email
- Dashboard statistiques visuelles
- Attribution automatique validations

**✅ Mais initialiser dès Phase 1 si nécessaire :**
- Enum `FileType` avec `IMAGE` et `DOCUMENT` (même si seulement images en Phase 1)
- Dossier `uploads/documents/` en plus de `uploads/images/`
- Champs DB pour notifications (nullable, non utilisés)

### Phase 3 - Pro (LOGIQUE À NE PAS IMPLÉMENTER)

**❌ Ne pas implémenter la logique complète maintenant :**
- Panier d'achat
- Paiement MoMo/Cash
- Import Excel
- Export comptabilité
- Statistiques avancées

**✅ MAIS initialiser dès Phase 1 (IMPORTANT) :**
- **i18n/Multilingue** : Configurer next-intl ou react-i18next dès maintenant
  - Créer `shared/i18n/fr.json` avec toutes les traductions françaises
  - En Phase 3, on ajoutera juste `shared/i18n/en.json`
  - Utiliser `t('key')` partout au lieu de texte en dur
- Tables DB avec champs pour futures phases (nullable)
  - Ex: `User.preferredLanguage` (optionnel, pour Phase 3)

## Spécificités métier importantes

### Confidentialité des lieux

**CRITIQUE** : La localisation exacte des annonces doit être :
- Visible uniquement par les rôles Operator et SuperAdmin
- Masquée pour le rôle Public
- Implémentation : Champ `location` avec guard côté backend

### Validation obligatoire

Toute annonce publiée passe par un Operator avant d'être visible :
- Statut initial : `pending`
- Operator peut : `approve`, `reject`, ou `request_modification`
- Seules les annonces `approved` sont visibles au public

### Acceptation CGU

- CGU doivent être acceptées à l'inscription
- Horodatage obligatoire (timestamp)
- Sauvegarder dans la DB (table Users ou table séparée)

## Composants UI réutilisables (Admin Panel)

### Modals

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `DeleteModal` | `components/ui/modal/DeleteModal.tsx` | Confirmation suppression |
| `ValidationModal` | `components/ui/modal/ValidationModal.tsx` | Ancienne modal validation (deprecated) |
| `RejectModal` | `components/ui/modal/RejectModal.tsx` | Refus avec raison obligatoire |
| `ConfirmModal` | `components/ui/modal/ConfirmModal.tsx` | Confirmation générique (success/warning/danger) |

### Éditeur de texte

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `TiptapEditor` | `components/ui/editor/TiptapEditor.tsx` | Éditeur rich text (édition) |
| `TiptapViewer` | `components/ui/editor/TiptapViewer.tsx` | Affichage read-only du contenu JSON |

### Sélecteur d'icônes

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `IconPicker` | `components/ui/icon-picker/IconPicker.tsx` | Autocomplete pour sélectionner une icône Lucide |
| `lucide-icons` | `components/ui/icon-picker/lucide-icons.ts` | Liste et recherche des icônes Lucide |
| `getIconByName` | `components/ui/icon-picker/lucide-icons.ts` | Récupère un composant icône par son nom |

### Upload d'images

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `SingleImageUpload` | `components/ui/upload/SingleImageUpload.tsx` | Upload d'une seule image avec preview |
| `MultiImageUpload` | `components/ui/upload/MultiImageUpload.tsx` | Upload multi-images drag & drop |

### Formulaire Bannières

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `BannerForm` | `features/banners/components/BannerForm.tsx` | Formulaire création/édition bannière |
| `BannerTable` | `features/banners/components/BannerTable.tsx` | Liste des bannières |
| `LinkSelector` | `features/banners/components/LinkSelector.tsx` | Sélection lien (annonce ou page) |
| `AdAutocomplete` | `features/banners/components/AdAutocomplete.tsx` | Autocomplete recherche d'annonces |

### Formulaire Annonces

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `AdForm` | `features/ads/components/AdForm/AdForm.tsx` | Formulaire multi-step avec Formik + i18n |
| `AdFormStepper` | `features/ads/components/AdForm/AdFormStepper.tsx` | Stepper (mobile/desktop) + i18n |
| `StepCategory` | `features/ads/components/AdForm/StepCategory.tsx` | Step 1: Catégorie + Localisation + i18n |
| `StepInformation` | `features/ads/components/AdForm/StepInformation.tsx` | Step 2: Infos + Description + i18n |
| `StepImages` | `features/ads/components/AdForm/StepImages.tsx` | Step 3: Upload images + i18n |
| `MultiImageUpload` | `features/ads/components/MultiImageUpload/` | Upload drag & drop multi-images |

### Traductions (i18n)

| Fichier | Description |
|---------|-------------|
| `messages/fr.json` | Traductions françaises (complètes) |
| `messages/en.json` | Traductions anglaises (complètes) |

**Clés principales :**
- `ads.form.*` : Formulaire d'annonce
- `ads.stepper.*` : Stepper multi-step
- `ads.images.*` : Upload d'images
- `ads.validation.*` : Validation (approve/reject/modify)
- `ads.detail.*` : Page de détail
- `ads.status.*` : Statuts (PENDING, APPROVED, etc.)
- `banners.*` : Gestion bannières (table, form, status)
- `categories.form.*` : Formulaire catégorie (avec iconPicker)
- `common.*` : Boutons et messages communs

### Services

| Service | Fichier | Description |
|---------|---------|-------------|
| `filesService` | `features/files/services/files.service.ts` | Upload/gestion fichiers + image par défaut |
| `adsService` | `features/ads/services/ads.service.ts` | CRUD annonces |
| `bannersService` | `features/banners/services/banners.service.ts` | CRUD bannières |
| `flashDealsService` | `features/flash-deals/services/flash-deals.service.ts` | CRUD flash deals |
| `categoriesService` | `features/categories/services/categories.service.ts` | CRUD catégories |

### Utilitaires Backend (common/utils)

| Utilitaire | Fichier | Description |
|------------|---------|-------------|
| `getPaginationParams` | `common/utils/query.utils.ts` | Extrait page, limit, skip avec validation (max 100) |
| `buildSearchFilter` | `common/utils/query.utils.ts` | Construit filtre OR pour recherche multi-champs |
| `buildWhereClause` | `common/utils/query.utils.ts` | Filtre les valeurs undefined/null d'un objet |
| `checkOwnership` | `common/utils/authorization.utils.ts` | Vérifie owner ou admin, lance ForbiddenException |
| `isAdminRole` | `common/utils/authorization.utils.ts` | Vérifie si OPERATOR ou SUPER_ADMIN |
| `canAccessResource` | `common/utils/authorization.utils.ts` | Retourne boolean (owner ou admin) |

**Utilisation :**
```typescript
// Pagination - remplace le calcul manuel
import { getPaginationParams } from '../common/utils/query.utils';

const { page, limit, skip } = getPaginationParams(query);

// Authorization - remplace les checks manuels
import { checkOwnership, canAccessResource } from '../common/utils/authorization.utils';

// Lance ForbiddenException si non autorisé
checkOwnership(ad.userId, currentUserId, userRole, 'Message erreur');

// Retourne boolean sans exception
if (canAccessResource(ad.userId, currentUserId, userRole)) { ... }
```

### Intercepteurs Backend

| Intercepteur | Fichier | Description |
|--------------|---------|-------------|
| `LoggingInterceptor` | `common/interceptors/logging.interceptor.ts` | Log HTTP: method, url, status, duration, userId |

### Types partagés (`@uscg/shared/types`)

Structure optimisée pour admin-panel ET marketplace :

```
shared/src/types/
├── index.ts              # Export centralisé
├── user.types.ts         # IUser, IAuthUser, IUserProfile, DTOs
├── auth.types.ts         # ILoginDto, IRegisterDto, ILoginResponse
├── category.types.ts     # I18nText, ICategory, ISubCategory, DTOs
├── variant.types.ts      # VariantType enum, IVariant, IVariantOption
├── ad.types.ts           # AdStatus, AdType, IAd, IAdListItem, IAdFull
├── seller-request.types.ts # SellerRequestStatus, ISellerRequest, DTOs
├── file.types.ts         # FileType enum, IFile (avec isDefault)
├── banner.types.ts       # IBanner, ICreateBannerDto, IUpdateBannerDto
├── flash-deal.types.ts   # IFlashDeal, ICreateFlashDealDto, IUpdateFlashDealDto
├── featured-section.types.ts # FilterType, IFeaturedSection, IFilter
└── api.types.ts          # ApiResponse, PaginatedResponse, PaginationMeta
```

**Utilisation côté frontend :**
```typescript
// Import depuis shared
import { IAdListItem, AdStatus, I18nText } from "@uscg/shared/types";

// Ou via les features (avec alias)
import { Ad, AdListItem } from "@/features/ads";
```

### Types Marketplace

**Product model** (`marketplace/src/models/product.model.ts`)

Le type `Product` étend `IAdListItem` avec des champs supplémentaires pour la compatibilité avec les fake data (templates). **À conserver tant que les fake data sont utilisées.**

```typescript
interface Product extends IAdListItem {
  slug?: string;        // Pour routing URL (défaut: id)
  rating?: number;      // Note produit
  discount?: number;    // Pourcentage de réduction calculé
  // Legacy fields pour fake data
  thumbnail?: string;   // URL image principale (string)
  images?: string[];    // URLs images (strings)
  salePrice?: number;   // Prix réduit
}
```

**Construction des URLs d'images (côté serveur)**

Les URLs d'images doivent être construites **côté serveur** (dans les services) car `process.env` n'est pas disponible côté client.

```typescript
// featured-sections.service.ts
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function buildFileUrl(file: IAdFile): string {
  let folder = "images";
  if (file.path?.startsWith("documents") || file.type === "DOCUMENT") {
    folder = "documents";
  }
  return `${API_URL}/api/files/${folder}/${file.filename}`;
}
```

**Pattern pour les composants :**
- Service (serveur) : transforme `files[]` → `thumbnail` string
- Composant (client) : reçoit `imgUrl: string` prêt à l'emploi

## Conventions de code

### Nommage

- **Fichiers** : kebab-case (`user.service.ts`, `ad-validation.dto.ts`)
- **Classes** : PascalCase (`UserService`, `AdValidationDto`)
- **Variables/fonctions** : camelCase (`getUserById`, `isValidated`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `JWT_SECRET`)

### TypeScript

- **Strict mode** : Activé partout
- **Pas de `any`** : Utiliser `unknown` si nécessaire
- **Interfaces** : Pour les objets de données
- **Types** : Pour les unions, intersections, etc.

### Git

- **Branches** : `feature/nom-feature`, `fix/nom-bug`
- **Commits** : Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Pull Requests** : Obligatoires, code review avant merge

## Tests

### Backend

- **Unit tests** : Pour services et utilitaires
- **E2E tests** : Pour endpoints critiques (auth, validation annonces)
- **Coverage minimum** : 70% pour merger

### Frontend

- **Tests unitaires** : Pour composants complexes
- **Tests d'intégration** : Pour flux critiques (création annonce, validation)

## Performance

- **Pagination** : Obligatoire sur toutes les listes (annonces, users)
- **Limite par défaut** : 20 items par page
- **Indexes DB** : Sur champs de recherche (category, status, userId)
- **Images** : Next.js Image component obligatoire

## Sécurité

### Backend ✅ Implémenté

- **Validation** : class-validator sur tous les DTOs ✅
- **Password fort** : Regex exigeant majuscule, minuscule, chiffre, caractère spécial ✅
- **Rate limiting** : `@nestjs/throttler` sur login/register (5 req/min) ✅
- **Helmet** : Headers de sécurité HTTP activés ✅
- **Password non fetché** : `userSelectWithoutPassword` dans users.service.ts ✅
- **Path traversal** : Validation folder + filename dans files.controller.ts ✅
- **CORS** : Configurer correctement pour production

### Frontend

- **XSS** : React escape automatiquement, mais attention aux dangerouslySetInnerHTML
- **CSRF** : Tokens CSRF sur formulaires sensibles
- **Secrets** : Jamais dans le code, uniquement .env

## Fichiers à ne jamais commit

```
.env
.env.local
.env.production
*.log
node_modules/
.next/
dist/
build/
coverage/
```

## Commandes utiles

```bash
# Backend
cd backend
npm run start:dev          # Dev avec hot-reload
npx prisma studio          # UI pour explorer DB
npx prisma migrate dev     # Créer migration
npm run test:watch         # Tests en mode watch

# Frontend
cd admin-panel
npm run dev                # Dev mode
npm run build              # Build prod
npm run lint               # Linter

# Monorepo
npm run install:all        # Installer tout
npm run build:all          # Build tout
```

## Déploiement (Production)

### Infrastructure

- **Plateforme** : Dokploy (PaaS) sur VPS Contabo
- **Domaine** : `universal-services-cg.com`

### URLs Production

| Service | URL | Port interne |
|---------|-----|--------------|
| Backend API | `https://api.universal-services-cg.com` | 3001 |
| Admin Panel | `https://admin.universal-services-cg.com` | 3000 |
| Marketplace | `https://universal-services-cg.com` | 3003 |

### Dockerfiles

Trois Dockerfiles à la racine du monorepo :

| Fichier | Service | Base image |
|---------|---------|------------|
| `Dockerfile.backend` | NestJS API | node:20-alpine |
| `Dockerfile.admin` | Admin Panel | node:20-alpine |
| `Dockerfile.marketplace` | Marketplace | node:20-alpine |

**Points clés des Dockerfiles :**
- Multi-stage builds (deps → builder → production)
- Prisma schema multi-fichiers : `--schema prisma/schema`
- Next.js standalone output avec `turbopack.root: ".."`
- Binding `0.0.0.0` pour accessibilité container
- Healthchecks IPv4 (`127.0.0.1` au lieu de `localhost`)
- `dumb-init` comme init system

### Variables d'environnement

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:pass@host:5432/uscg
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=https://admin.universal-services-cg.com,https://universal-services-cg.com
PORT=3001
HOST=0.0.0.0
```

**Admin Panel / Marketplace**
- Build-time : `NEXT_PUBLIC_API_URL` (passé via `--build-arg`)
- Runtime : `API_URL` (pour middleware/SSR)
- Runtime : `COOKIE_DOMAIN` (pour cookies cross-subdomain)

**Exemple Dokploy env vars :**
```
NEXT_PUBLIC_API_URL=https://api.universal-services-cg.com  # build-arg
API_URL=https://api.universal-services-cg.com              # runtime SSR
COOKIE_DOMAIN=.universal-services-cg.com                   # cookies cross-subdomain
```

**IMPORTANT** : Le `.` devant `COOKIE_DOMAIN` est obligatoire pour partager les cookies entre sous-domaines.

### Commandes Dokploy utiles

```bash
# Seed database (dans terminal Dokploy du backend)
npx prisma db seed

# Migrations
npx prisma migrate deploy

# Logs
# Via interface Dokploy
```

### Configuration spécifique Next.js 16

Dans `next.config.ts` :
```typescript
turbopack: {
  root: "..",  // Nécessaire pour monorepo
},
output: "standalone",
```

Dans pages dynamiques (SSR avec API) :
```typescript
export const dynamic = "force-dynamic";
```

### Middleware Auth (proxy.ts)

Le middleware `proxy.ts` gère le refresh token côté serveur :
```typescript
// Utilise API_URL en runtime, fallback sur NEXT_PUBLIC_API_URL
const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
```

**IMPORTANT** : Configurer `API_URL` dans les variables d'environnement Dokploy pour le SSR.

## En cas de problème

1. **Prisma issues** : `npx prisma generate` puis redémarrer
2. **Port déjà utilisé** : Changer PORT dans .env
3. **Types non trouvés** : Vérifier imports depuis `shared/types`
4. **Build errors** : Nettoyer `rm -rf node_modules .next dist` puis réinstaller
5. **Container 502 Bad Gateway** : Vérifier `HOSTNAME="0.0.0.0"` et standalone path
6. **Healthcheck fail** : Utiliser `127.0.0.1` au lieu de `localhost` (IPv6 issue)
7. **Login puis logout immédiat** : Ajouter `COOKIE_DOMAIN=.universal-services-cg.com` pour partage cookies cross-subdomain

## Questions fréquentes

### Puis-je utiliser une lib externe ?

Oui, mais :
- Vérifier qu'elle est maintenue (dernière mise à jour < 6 mois)
- Privilégier les libs avec bonne réputation
- Documenter pourquoi elle est nécessaire

### Dois-je créer des tests ?

Oui pour :
- Auth (critique)
- Validation annonces (logique métier importante)
- Upload de fichiers (sécurité)

Facultatif pour :
- CRUD basique
- Endpoints simples

### Templates fournis par le client ?

Le client fournit les templates HTML/CSS pour :
- Marketplace (interface utilisateur)
- Admin Panel (peut-être)

**Ne pas créer de design from scratch**, attendre les templates.

**IMPORTANT lors de l'intégration des templates** :
- Remplacer TOUS les textes en dur par `t('key')` (i18n)
- Exemple : `<h1>Bienvenue</h1>` → `<h1>{t('common.welcome')}</h1>`
- Créer les clés dans `shared/i18n/fr.json` au fur et à mesure
- Cela évitera de tout refactoriser en Phase 3 pour ajouter l'anglais

## Contact

Si un agent IA a besoin de clarifications :
- Marquer clairement les assumptions faites
- Documenter les choix techniques importants
- Suggérer des alternatives si pertinent

---

**Version** : 1.5
**Dernière mise à jour** : 18 Juin 2026
**Changelog** :
- v1.5 : FeaturedSections (sections homepage configurables), Product model étend IAdListItem, documentation URLs images
- v1.4 : Fix cookies cross-subdomain (COOKIE_DOMAIN), documentation mise à jour
- v1.3 : Ajout section Déploiement (Dokploy, Docker, variables env), problèmes connus
- v1.2 : Ajout utilitaires backend (query.utils, authorization.utils), sécurité implémentée
- v1.1 : Documentation initiale
**Phase actuelle** : MVP Basique (Phase 1)
**Statut déploiement** : En production
