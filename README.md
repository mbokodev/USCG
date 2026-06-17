# Universal Services of Congo (USCG)

Plateforme marketplace pour la République Démocratique du Congo - Développement MVP par phases

## Vue d'ensemble

Marketplace e-commerce permettant la publication et la gestion d'annonces immobilières et commerciales avec validation par agents. Développement progressif : **Basique → Standard → Pro**.

**Priorité actuelle** : Backend API + Admin Panel

## Stack technique

- **Frontend** : Next.js 16 + React 19 + Tailwind CSS 4
- **Backend** : NestJS 11 + Prisma 7 + PostgreSQL
- **Auth** : Passport.js + JWT + bcrypt
- **Monorepo** : npm workspaces

## Structure du projet

```
USCG/
├── backend/              # API NestJS (EN COURS)
├── admin-panel/          # Interface admin (EN COURS)
├── marketplace/          # App utilisateur (Templates fournis)
├── cover-page/           # Landing page (TERMINÉ)
├── shared/               # Code partagé
└── docs/                 # Documentation
```

## Installation rapide

```bash
# Installation des dépendances
npm run install:all

# Configuration .env
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos credentials

# Initialiser la base de données
cd backend
npx prisma migrate dev
npx prisma generate

# Démarrer le backend
npm run dev:backend
```

## Scripts disponibles

```bash
# Développement
npm run dev:backend          # Backend (port 3000)
npm run dev:marketplace      # Marketplace (port 3001)
npm run dev:admin            # Admin Panel (port 3002)

# Build
npm run build:all            # Build tous les workspaces
npm run build:backend        # Backend uniquement
npm run build:admin          # Admin Panel uniquement

# Autres
npm run install:all          # Installer dépendances
npm run lint                 # Linter tout le code
npm run test                 # Tests
```

## Phases de développement

### Phase 1 : MVP Basique (4-5 semaines) - EN COURS

**Backend**
- Authentification JWT
- CRUD annonces avec validation
- Upload photos
- Gestion utilisateurs (3 rôles)
- API endpoints de base

**Admin Panel** - 3 espaces distincts
- **Espace SELLER** (isSeller=true)
  - CRUD mes annonces
  - Stats mes ventes
  - Mon profil business
- **Espace OPERATOR**
  - Validation annonces
  - Validation demandes vendeur
  - Gestion BUYER
- **Espace SUPER_ADMIN**
  - Création OPERATOR
  - Gestion catégories
  - Historique connexions

**Marketplace** (templates fournis)
- Inscription BUYER
- Navigation/Recherche annonces
- Détail annonce
- **Formulaire "Devenir vendeur"** (nouveau)
- Mon compte BUYER

### Phase 2 : Standard (2-3 semaines additionnelles)

- Upload documents PDF/Word (10 Mo)
- Filtres avancés
- Notifications email automatiques
- Dashboard statistiques visuelles
- Attribution automatique validations

### Phase 3 : Pro (2-3 semaines additionnelles)

- Panier d'achat
- Modes de paiement (MoMo/Cash)
- Interface bilingue FR/EN
- Import Excel annonces
- Statistiques avancées + export
- Gestion rôles avancée

## Fonctionnalités clés

### Sécurité
- JWT avec expiration configurable
- bcrypt pour mots de passe
- HTTPS obligatoire
- Validation class-validator
- Historique connexions
- CGU horodatées

### Spécificités métier
- **3 rôles système** : BUYER (par défaut), OPERATOR, SUPER_ADMIN
- **Statut vendeur** : `isSeller` (boolean) - BUYER peut devenir vendeur via validation
- **Workflow vendeur** : Formulaire Marketplace → Validation OPERATOR → Accès Admin Panel
- **Lieu confidentiel** : Visible uniquement par SELLER owner + OPERATOR/SUPER_ADMIN
- **Validation obligatoire** : Toute annonce passe par OPERATOR avant publication
- **Catégories** : Foncier, Immobilier, Electroménager, Divers
- **2 interfaces** : Marketplace (achat) + Admin Panel (vente + admin)

## URLs de développement

- Backend API : `http://localhost:3000`
- API Docs : `http://localhost:3000/api` (Swagger)
- Marketplace : `http://localhost:3001`
- Admin Panel : `http://localhost:3002`
- Cover Page : `http://localhost:3003`

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique détaillée
- [ROADMAP.md](./ROADMAP.md) - Plan de développement par phases
- [CLAUDE.md](./CLAUDE.md) - Instructions pour agents IA
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Conventions de code
- [backend/README.md](./backend/README.md) - Documentation backend

## Prérequis

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL >= 14.x

## Variables d'environnement

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/uscg"
JWT_SECRET="votre-secret-securise"
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Tests

```bash
# Backend
cd backend
npm run test              # Tests unitaires
npm run test:watch        # Mode watch
npm run test:cov          # Avec couverture
npm run test:e2e          # Tests e2e
```

## Déploiement

**Hébergement prévu** : VPS 200 Go avec SSL

```bash
# Build production
npm run build:all

# Démarrer backend
cd backend
npm run start:prod

# Démarrer frontends (PM2 recommandé)
pm2 start ecosystem.config.js
```

## Licence

Propriété de Universal Services of Congo. Tous droits réservés.

---

**Version** : 1.1.0-beta
**Dernière mise à jour** : Juin 2026
**Statut** : Phase 1 (MVP Basique) en développement
