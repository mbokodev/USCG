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
     - Gestion utilisateurs BUYER (bloquer/débloquer)
     - Dashboard global
   - Rôle : `ADMIN` - Administrateur
     - Toutes les permissions OPERATOR +
     - Gestion catégories, variantes, bannières, etc.
     - Création comptes OPERATOR
     - Gestion staff (OPERATOR seulement)
   - Rôle : `SUPER_ADMIN` - Super Administrateur
     - Toutes les permissions ADMIN +
     - Création comptes ADMIN
     - Suppression staff (OPERATOR et ADMIN)
     - Historique des connexions

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

### Rôles utilisateurs (4 rôles système + 1 statut)

**Rôle système (champ `role` dans DB)** :
1. **BUYER** (par défaut)
2. **OPERATOR**
3. **ADMIN**
4. **SUPER_ADMIN**

**Statut vendeur (champ `isSeller` boolean)** :
- `false` : Simple acheteur
- `true` : Acheteur ET vendeur (accès Admin Panel)

**Statut compte (champ `isActive` boolean)** :
- `true` : Compte actif (peut se connecter)
- `false` : Compte bloqué (ne peut plus se connecter)

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
- Créés par ADMIN ou SUPER_ADMIN
- Reçoit email avec credentials + obligation de changer le mot de passe
- Validation/refus annonces de tous les SELLER
- Validation/refus SellerRequest (devenir vendeur)
- Bloquer/débloquer utilisateurs BUYER
- Dashboard statistiques globales
- **Accès** : Admin Panel uniquement

#### 4. ADMIN
- Créés par SUPER_ADMIN uniquement
- Toutes les permissions OPERATOR +
- Gestion catégories, sous-catégories, variantes
- Gestion bannières, flash deals, featured sections
- Gestion pages statiques
- Création comptes OPERATOR
- Bloquer/débloquer OPERATOR
- **Accès** : Admin Panel uniquement

#### 5. SUPER_ADMIN
- Créé lors du setup initial (seed)
- Toutes les permissions ADMIN +
- Création comptes ADMIN
- Suppression staff (OPERATOR et ADMIN)
- Historique des connexions
- **Accès** : Admin Panel uniquement

### Hiérarchie des permissions Staff

| Action | OPERATOR | ADMIN | SUPER_ADMIN |
|--------|----------|-------|-------------|
| Voir OPERATOR | ❌ | ✅ | ✅ |
| Voir ADMIN | ❌ | ❌ | ✅ |
| Créer OPERATOR | ❌ | ✅ | ✅ |
| Créer ADMIN | ❌ | ❌ | ✅ |
| Bloquer OPERATOR | ❌ | ✅ | ✅ |
| Bloquer ADMIN | ❌ | ❌ | ✅ |
| Supprimer staff | ❌ | ❌ | ✅ |

### Blocage utilisateurs

Quand un utilisateur est bloqué (`isActive = false`) :
- Ne peut plus se connecter (erreur "Compte désactivé")
- Si déjà connecté, sera déconnecté au prochain refresh token (max 15 min)

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

**Auth & Users** ✅ TERMINÉ
- [x] Auth JWT (register, login, refresh, logout)
- [x] POST /auth/register (Marketplace - inscription BUYER libre)
  - Crée User avec role=BUYER, isSeller=false
  - Retourne JWT token
- [x] POST /auth/login (tous rôles)
  - Vérifie credentials
  - Retourne JWT avec role et isSeller
- [x] POST /auth/login/admin (Admin Panel - rejette BUYER non-seller)
- [x] POST /auth/refresh (refresh token)
- [x] POST /auth/logout
- [x] GET /users/me (tous - mon profil)
- [x] PATCH /users/me (tous - modifier mon profil)
- [x] GET /users (OPERATOR/SUPER_ADMIN - liste BUYER)
- [x] GET /users/:id (OPERATOR/SUPER_ADMIN - détail)
- [x] POST /users/operator (SUPER_ADMIN - créer OPERATOR) @deprecated
- [x] DELETE /users/:id (SUPER_ADMIN - supprimer)
- [x] CGU acceptance BUYER avec horodatage (termsAcceptedAt)
- [x] GET /users/staff (ADMIN/SUPER_ADMIN - liste staff)
- [x] POST /users/staff (ADMIN/SUPER_ADMIN - créer OPERATOR ou ADMIN)
- [x] DELETE /users/staff/:id (SUPER_ADMIN - supprimer staff)
- [x] PATCH /users/:id/block (bloquer utilisateur)
- [x] PATCH /users/:id/unblock (débloquer utilisateur)
- [x] POST /auth/change-password (changer mot de passe, obligatoire pour OPERATOR)

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
  - Si APPROVED → User.isSeller = true (transaction) + email notification
  - Si REJECTED → SellerRequest.status = REJECTED + email notification avec raison

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

**Pages Statiques (Static Pages)** ✅ TERMINÉ
- [x] GET /static-pages/terms (public - CGU pour marketplace)
- [x] PATCH /static-pages/terms (ADMIN/SUPER_ADMIN - modifier CGU)
- [x] GET /static-pages/privacy (public - Politique de confidentialité)
- [x] PATCH /static-pages/privacy (ADMIN/SUPER_ADMIN - modifier Privacy)
- [x] GET /static-pages/about (public - À propos)
- [x] PATCH /static-pages/about (ADMIN/SUPER_ADMIN - modifier About)
- [x] GET /static-pages/seller-terms (public - CGU vendeur)
- [x] PATCH /static-pages/seller-terms (ADMIN/SUPER_ADMIN - modifier CGU vendeur)
- [x] GET /static-pages/seller-privacy (public - Politique vendeur)
- [x] PATCH /static-pages/seller-privacy (ADMIN/SUPER_ADMIN - modifier Politique vendeur)
- [x] **Modèles Prisma** : TermsPage, PrivacyPage, AboutPage, SellerTermsPage, SellerPrivacyPage
- [x] **Contenu i18n** : `{ fr: TiptapContent, en: TiptapContent }`
- [x] **Traduction automatique** : CREATE traduit via TranslationService, UPDATE ne modifie que la langue source
- [x] **About structuré** : introduction, mission, vision, values (avec icônes), team (optionnel)

**Historique connexions** ⚠️ PARTIEL
- [x] Enregistrement automatique à chaque login (OPERATOR/SUPER_ADMIN)
  - userId, ipAddress, userAgent, timestamp
  - Modèle LoginHistory dans Prisma
- [ ] GET /login-history (SUPER_ADMIN - tout) - API manquante
- [ ] GET /login-history/me (tous - ses connexions) - API manquante

#### Admin Panel ✅ TERMINÉ

**Authentification** ✅ TERMINÉ
- [x] Page Login (`/login`)
  - Formulaire email + password
  - Appel API POST /auth/login/admin
  - Stockage JWT token (cookies)
  - Redirection selon rôle/isSeller
- [x] Middleware proxy.ts avec refresh token automatique
- [x] Protection routes par rôle

**Espace SELLER (isSeller=true)** ✅ TERMINÉ

- [x] Dashboard SELLER (`/dashboard`)
  - Widget : Mes annonces (total, pending, approved, rejected)
  - StatCards avec icônes
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

- [x] Mon profil (`/user/profile`)
  - Affichage infos personnelles et business
  - Vue lecture seule

- [ ] Mes ventes (`/seller/sales`) - Phase 3
- [ ] Mes clients (`/seller/customers`) - Phase 3

**Espace OPERATOR** ✅ TERMINÉ

- [x] Dashboard OPERATOR (`/dashboard`)
  - Stats : Annonces pending, Demandes pending, Total buyers, Total sellers
  - StatCards avec icônes

- [x] Liste annonces (`/ads`)
  - Liste TOUTES annonces (tous SELLER)
  - Tableau avec filtres et pagination
  - Actions : Voir détail

- [x] Détail annonce (`/operator/ads/:id`) ✅ TERMINÉ
  - Layout 2 colonnes: Galerie (gauche) + Infos (droite)
  - Galerie avec miniatures verticales + image principale
  - Description avec TiptapViewer (rendu JSON)
  - Tableau d'infos avec icônes (prix, type, catégorie, vendeur, dates)
  - Localisation confidentielle (fond ambre)
  - Actions:
    - Bouton Approuver → ConfirmModal
    - Bouton Refuser → RejectModal (avec raison)

- [x] Validation demandes vendeur (`/seller-requests`)
  - Liste TOUTES demandes pending
  - Tableau avec pagination
  - Page détail (`/seller-requests/[id]`)
  - Boutons Approuver/Refuser avec modal

- [x] Gestion BUYER (`/users/buyers`)
  - Liste tous BUYER avec pagination
  - Tableau : Nom, Email, isSeller, Date inscription

**Espace SUPER_ADMIN** ✅ TERMINÉ

- [x] Dashboard SUPER_ADMIN (`/dashboard`)
  - Stats : Total users, Total operators, Total categories, Demandes pending

- [x] Validation demandes vendeur (`/seller-requests`)
  - Identique à OPERATOR

- [x] Gestion BUYER (`/users/buyers`)
  - Identique à OPERATOR

- [x] Gestion OPERATOR (`/users/operators`)
  - Liste OPERATOR avec pagination
  - Créer nouveau OPERATOR (drawer)
  - Supprimer OPERATOR

- [x] Gestion catégories (`/categories`)
  - Liste catégories avec CRUD
  - IconPicker pour icônes Lucide

- [x] Gestion sous-catégories (`/subcategories`)
  - CRUD complet

- [x] Gestion variantes (`/variants`)
  - CRUD complet

- [x] Gestion bannières (`/banners`)
  - CRUD complet avec LinkSelector

- [x] Gestion flash deals (`/flash-deals`)
  - CRUD complet avec sélection annonces éligibles

- [x] Gestion featured sections (`/featured-sections`)
  - CRUD complet avec filtres dynamiques

- [x] Gestion pages statiques (`/static-pages`)
  - Liste avec cartes : Terms, Privacy, About, Seller Terms, Seller Privacy
  - Page Terms (`/static-pages/terms`) : TiptapEditor, édition locale-aware
  - Page Privacy (`/static-pages/privacy`) : TiptapEditor, édition locale-aware
  - Page About (`/static-pages/about`) : Formulaire structuré (intro, mission, vision, values, team)
  - Page Seller Terms (`/static-pages/seller-terms`) : TiptapEditor, traduction auto sur CREATE
  - Page Seller Privacy (`/static-pages/seller-privacy`) : TiptapEditor, traduction auto sur CREATE
  - Indicateur de langue en cours d'édition
  - Sauvegarde indépendante FR/EN

- [ ] Historique connexions (`/login-history`)
  - Page créée mais affiche "Coming soon"
  - Nécessite API GET /login-history

**Layout & Navigation** ✅ TERMINÉ

- [x] Sidebar dynamique selon rôle
  - Menus différents pour SELLER, OPERATOR, SUPER_ADMIN
  - Icônes et labels i18n

- [x] Header
  - Logo + Nom appli
  - User dropdown avec déconnexion

- [x] Protection routes (middleware proxy.ts)
  - Vérification JWT token
  - Refresh token automatique
  - Protection par rôle (requireSeller, requireAdmin)

#### Marketplace (templates fournis par client) ⚠️ PARTIEL

**Authentification** ✅ TERMINÉ
- [x] Page Login (`/signin`)
  - Formulaire email + password
  - Submit → API POST /auth/login
  - Stockage JWT dans cookies (accessToken, refreshToken)
  - Redirection homepage (ou page précédente via ?redirect=)

- [x] Auth context/hooks (gestion JWT côté client)
  - `useAuth` hook : user, isAuthenticated, isLoading, isSeller, logout
  - Server actions pour API calls avec token
  - Protection routes via middleware

- [ ] Page Register (`/signup`) - À implémenter
  - Formulaire : email, password, firstName, lastName, phone
  - Checkbox CGU (obligatoire)
  - Submit → API POST /auth/register

**Navigation & Recherche**
- [x] Homepage (`/`)
  - Hero section (bannières carousel)
  - Barre de recherche avec filtre catégorie
  - **Catégories dynamiques** : Fetchées depuis API avec sous-catégories et icônes Lucide
  - Annonces à la une (Phase 2)

**Composants Marketplace intégrés**
- [x] `CategoryDropdown` : Menu catégories avec sous-catégories (hover)
- [x] `LucideIcon` : Affichage icônes Lucide par nom
- [x] `SearchInputWithCategory` : Barre recherche avec filtre catégorie + autocomplete API
- [x] `SearchInput` : Barre recherche simple + autocomplete API
- [x] `categoriesService` : Service fetch catégories depuis API
- [x] `adsService` : Service fetch annonces (getAds, searchAds, getLatestAds)
- [x] `QueryProvider` : React Query provider pour cache et fetching

- [x] Page de recherche (`/search`) ✅ TERMINÉ
  - Vue grille/liste toggle (ProductCard1 / ProductCard9)
  - Filtres sidebar (ProductFilterCard) :
    - Catégories avec sous-catégories (accordion)
    - Type (Vente/Location checkboxes)
    - Prix min/max
  - Tri : Date (récent/ancien), Prix (croissant/décroissant)
  - Pagination
  - Autocomplete dans SearchInput avec React Query
  - i18n complet (fr/en)
  - Sidenav mobile pour filtres
  - Reset recherche quand clic sur catégorie

- [x] Page détail annonce (`/product/[id]`) ✅ TERMINÉ
  - Galerie photos avec miniatures
  - Titre, Prix, Type (vente/location)
  - Description avec TiptapViewer
  - Catégorie et sous-catégorie
  - Localisation (ville uniquement)
  - Infos vendeur (nom)
  - Onglets Description/Caractéristiques
  - Produits similaires
  - [ ] Bouton : Contacter vendeur (nécessite login - Phase 1)
  - [ ] Bouton : Ajouter au panier (Phase 3)

**Devenir vendeur** ✅ TERMINÉ
- [x] Page Devenir vendeur (`/become-seller`)
  - **Protection** : Nécessite d'être connecté
    - Si non connecté → Redirect `/signin?redirect=/become-seller`
  - **Vérification** : Si déjà isSeller=true → Formulaire grisé + message "Vous êtes déjà vendeur"
  - **Formulaire** :
    - Email (pré-rempli, disabled)
    - Nom/Prénom (pré-remplis, disabled)
    - Nom de l'entreprise (businessName)
    - Adresse de l'entreprise (businessAddress)
    - Téléphone professionnel (businessPhone)
    - Numéro fiscal (taxId - optionnel)
    - Description de l'activité (description - textarea)
    - Logo entreprise (optionnel, upload image via SingleImageUpload)
    - **Checkbox CGU vendeur** : Acceptation obligatoire des CGU et Politique vendeur
      - Liens vers `/seller-terms` et `/seller-privacy`
      - Validation bloquante si non coché
  - Submit → API POST /seller-requests
  - **États affichés sur la même page** (formulaire grisé + banner) :
    - PENDING : "Demande en attente" + formulaire soumis en lecture seule
    - APPROVED : "Demande approuvée !" + lien vers Admin Panel
    - REJECTED : "Demande refusée" + raison + formulaire éditable pour resoumission
  - **Resoumission** : Backend gère automatiquement (POST crée ou met à jour si REJECTED)

**Mon compte BUYER** ✅ TERMINÉ
- [x] Page Mon profil (`/profile`)
  - Layout dashboard avec sidebar navigation
  - Affichage infos : email, nom, prénom, téléphone, rôle
  - Stats commandes (All orders, Pending, Cancelled) - valeurs à 0 (Phase 3)
  - Navigation sidebar :
    - Dashboard : Orders, Wishlist, Addresses (liens préparés)
    - Account : My Profile
    - Seller : Devenir vendeur ou Espace vendeur (selon isSeller)
    - Logout
  - Si isSeller=true : Lien "Espace vendeur" → Admin Panel

- [x] Page Modifier profil (`/profile/edit`)
  - Formulaire édition : firstName, lastName, phone
  - Submit → API PATCH /users/me

- [ ] Mes commandes (`/profile/orders`) - Phase 3
- [ ] Mes favoris (`/profile/wishlist`) - Phase 2
- [ ] Mes adresses (`/profile/addresses`) - Phase 2

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

**Pages statiques** ✅ TERMINÉ
- [x] Page CGU (`/terms`)
  - Contenu depuis API /static-pages/terms
  - TiptapViewer pour rendu rich text
  - i18n complet (titre, sous-titre, date mise à jour)
- [x] Page Confidentialité (`/privacy`)
  - Contenu depuis API /static-pages/privacy
  - TiptapViewer pour rendu rich text
  - i18n complet
- [x] Page À propos (`/about`)
  - Contenu structuré depuis API /static-pages/about
  - Sections : Introduction, Mission, Vision, Valeurs, Équipe
  - Icônes Lucide pour les valeurs
  - i18n complet
- [x] Page Contact (`/contact`)
  - Contenu statique (adresse, email, téléphone)
  - Formulaire placeholder "bientôt disponible"
  - i18n complet
- [x] Page CGU Vendeur (`/seller-terms`)
  - Contenu depuis API /static-pages/seller-terms
  - TiptapViewer pour rendu rich text
  - i18n complet
- [x] Page Politique Vendeur (`/seller-privacy`)
  - Contenu depuis API /static-pages/seller-privacy
  - TiptapViewer pour rendu rich text
  - i18n complet

**Header/Footer** ✅ TERMINÉ
- [x] Header (structure complète)
  - Logo
  - Barre recherche avec autocomplete
  - Navigation : Accueil, Catégories, Devenir vendeur, Contact
  - **UserButton** : Icône utilisateur
    - Si non connecté → `/signin`
    - Si connecté → `/profile`
  - **Lien "Devenir vendeur"** dans navbar :
    - Si non connecté → `/signin?redirect=/become-seller`
    - Si isSeller=true → Ouvre Admin Panel (nouvel onglet)
    - Sinon → `/become-seller`
  - [ ] Panier (Phase 3)

- [x] Topbar (barre supérieure)
  - Desktop : téléphone + email
  - Mobile : logo-white.png + "USCG" en blanc (remplace phone/email)

- [x] Footer (structure complète)
  - Logo : logo-white-full.png (responsive 180px → 120px mobile)
  - Liens vers pages statiques (À propos, CGU, Privacy, Contact)
  - Réseaux sociaux
  - Copyright
  - i18n complet

**Composants responsive (mobile)** ✅ TERMINÉ
- [x] `CarouselCard1` : layout column-reverse, texte centré, bouton centré
- [x] `ProductCard1` : hauteur images ajustée (220px → 180px → 220px selon breakpoints)
- [x] `Section2` (Flash Deals) : Grid 1 colonne mobile (xs={12}) au lieu de carousel

**Résumé Marketplace Phase 1 - Ce qui reste à faire** :
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Auth Login | HAUTE | ✅ Terminé |
| Auth Register | HAUTE | ✅ Terminé |
| Page Devenir vendeur | HAUTE | ✅ Terminé |
| Page Profil utilisateur | HAUTE | ✅ Terminé |
| Pages statiques (CGU, Privacy, About, Contact) | BASSE | ✅ Terminé |
| Contact vendeur (sur page produit) | MOYENNE | ❌ À faire |

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

### Services Marketplace

| Service | Fichier | Description |
|---------|---------|-------------|
| `adsService` | `marketplace/src/services/ads.service.ts` | getAds, searchAds, getLatestAds |
| `categoriesService` | `marketplace/src/services/categories.service.ts` | getCategories |
| `api` | `marketplace/src/lib/api.ts` | Instance Axios configurée |

### Hooks Marketplace

| Hook | Fichier | Description |
|------|---------|-------------|
| `useDebouncedValue` | `marketplace/src/hooks/useDebouncedValue.ts` | Debounce une valeur |
| `useWindowSize` | `marketplace/src/hooks/useWindowSize.ts` | Retourne largeur fenêtre |
| `useScroll` | `marketplace/src/hooks/useScroll.ts` | Détecte scroll |

### Providers Marketplace

| Provider | Fichier | Description |
|----------|---------|-------------|
| `QueryProvider` | `marketplace/src/components/providers/QueryProvider.tsx` | React Query provider |

**Configuration React Query (Marketplace)** :
```typescript
{
  staleTime: 30 * 1000,      // 30 secondes
  refetchOnWindowFocus: true, // Rafraîchit au focus
  retry: 1,
}
```

### Cache Invalidation (Admin-Panel)

Lors de la validation d'une annonce, invalider :
```typescript
queryClient.invalidateQueries({ queryKey: ["ads-admin"] });
queryClient.invalidateQueries({ queryKey: ["pending-ads"] });
queryClient.invalidateQueries({ queryKey: ["my-ads"] });
queryClient.invalidateQueries({ queryKey: ["admin-ad", adId] });
```

**Query Keys utilisées** :
| Query Key | Utilisation |
|-----------|-------------|
| `["ads-admin"]` | Liste admin toutes annonces |
| `["pending-ads"]` | Liste annonces en attente |
| `["my-ads"]` | Liste annonces du vendeur |
| `["admin-ad", id]` | Détail annonce admin |
| `["ads", {...filters}]` | Recherche marketplace |
| `["search-autocomplete", query]` | Autocomplete recherche |

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
- **Rate limiting** : `@nestjs/throttler` (3 req/sec global) ✅
  - Exclusions via `@SkipThrottle()` : upload image, upload document, link file, serve file
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

**Version** : 1.15
**Dernière mise à jour** : 24 Juin 2026
**Changelog** :
- v1.15 : Pages statiques vendeur (SellerTerms, SellerPrivacy), Checkbox CGU dans /become-seller, Traduction auto TipTap pour toutes les pages statiques, Fix URL logo dynamique
- v1.14 : Rôle ADMIN ajouté, Staff management (/staff), Blocage utilisateurs (block/unblock), mustChangePassword pour OPERATOR, Hiérarchie des permissions
- v1.13 : Pages statiques (Terms, Privacy, About, Contact) - API backend, Admin Panel avec édition locale-aware, Marketplace avec i18n complet
- v1.12 : Fix upload image pour BUYER (formulaire devenir vendeur), Container padding écrans larges
- v1.11 : Password reset (forgot/reset password), Resend verification email sur login, Fix icônes stroke dans boutons
- v1.10 : Email notifications pour validation demandes vendeur (approbation + refus)
- v1.9 : Mobile responsive (Topbar logo, CarouselCard1, Section2 Grid, Footer logo), Logo upload dans formulaire devenir vendeur
- v1.8 : Marketplace auth (Login, useAuth hook), Page Profil avec dashboard layout, Page Devenir vendeur complète avec tous les états
- v1.7 : Mise à jour statut Phase 1 - Backend et Admin Panel 100% terminés, Marketplace ~60%
- v1.6 : Rate limiting exclusions (file uploads), cache invalidation patterns, React Query config marketplace
- v1.5 : FeaturedSections (sections homepage configurables), Product model étend IAdListItem, documentation URLs images
- v1.4 : Fix cookies cross-subdomain (COOKIE_DOMAIN), documentation mise à jour
- v1.3 : Ajout section Déploiement (Dokploy, Docker, variables env), problèmes connus
- v1.2 : Ajout utilitaires backend (query.utils, authorization.utils), sécurité implémentée
- v1.1 : Documentation initiale
**Phase actuelle** : MVP Basique (Phase 1)
**Statut** :
- Backend API : ✅ 100% Phase 1
- Admin Panel : ✅ 100% Phase 1
- Marketplace : ✅ ~95% Phase 1 (Contact vendeur manquant)
**Statut déploiement** : En production
