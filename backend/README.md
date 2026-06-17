# Backend API - USCG

API REST pour la plateforme Universal Services of Congo.

## Stack technique

- **NestJS** 11.0.1 - Framework Node.js
- **Prisma** 7.8.0 - ORM TypeScript
- **PostgreSQL** 14+ - Base de données
- **Passport.js** + **JWT** - Authentification
- **bcrypt** - Hashage mots de passe
- **class-validator** - Validation DTOs

## Prérequis

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL >= 14.x

## Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env

# Éditer .env avec vos credentials
nano .env
```

## Configuration (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/uscg"

# JWT
JWT_SECRET="votre-secret-securise-minimum-32-caracteres"
JWT_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV=development

# Email (Phase 2+)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@universal-services-congo.com"
SMTP_PASSWORD="votre-mot-de-passe"
SMTP_FROM="Universal Services <noreply@universal-services-congo.com>"
```

## Base de données

### Initialisation

```bash
# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# Seed des données initiales (catégories)
npx prisma db seed
```

### Commandes utiles

```bash
# Prisma Studio (UI pour explorer la DB)
npx prisma studio

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Réinitialiser la DB (ATTENTION : supprime toutes les données)
npx prisma migrate reset

# Voir le statut des migrations
npx prisma migrate status
```

## Développement

```bash
# Mode développement avec hot-reload
npm run start:dev

# Mode production
npm run build
npm run start:prod

# Mode debug
npm run start:debug
```

L'API sera accessible sur `http://localhost:3000`

## Tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests e2e
npm run test:e2e
```

## Documentation API

Une fois l'API démarrée, la documentation Swagger est accessible sur :

**`http://localhost:3000/api`**

## Structure du projet

```
backend/
├── src/
│   ├── main.ts                    # Point d'entrée
│   ├── app.module.ts              # Module racine
│   │
│   ├── auth/                      # Module authentification
│   │   ├── auth.controller.ts     # Endpoints auth
│   │   ├── auth.service.ts        # Logique auth
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/                     # Module utilisateurs
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │
│   ├── categories/                # Module catégories
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── dto/
│   │
│   ├── ads/                       # Module annonces
│   │   ├── ads.controller.ts
│   │   ├── ads.service.ts
│   │   ├── entities/
│   │   │   └── ad.entity.ts
│   │   └── dto/
│   │
│   ├── files/                     # Module upload fichiers
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   └── dto/
│   │
│   ├── dashboard/                 # Module dashboard
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts
│   │
│   ├── prisma/                    # Module Prisma
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   └── common/                    # Code commun
│       ├── filters/
│       ├── interceptors/
│       ├── pipes/
│       └── constants/
│
├── prisma/
│   ├── schema.prisma              # Schéma de la DB
│   ├── migrations/                # Migrations
│   └── seed.ts                    # Seed script
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env                           # Variables d'environnement
├── .env.example                   # Template .env
├── nest-cli.json
├── tsconfig.json
└── package.json
```

## Endpoints API

### Authentification

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/auth/register` | Inscription BUYER (Marketplace) | Non | - |
| POST | `/auth/login` | Connexion (tous rôles) | Non | - |
| POST | `/auth/refresh` | Refresh token | Non | - |

**Note** : Le JWT retourné contient : `{ sub, email, role, isSeller }`

### Utilisateurs

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/users/me` | Mon profil | Oui | Tous |
| PATCH | `/users/me` | Modifier mon profil | Oui | Tous |
| GET | `/users` | Liste BUYER | Oui | Operator, SuperAdmin |
| GET | `/users/:id` | Détail utilisateur | Oui | Operator, SuperAdmin |
| POST | `/users/operator` | Créer compte OPERATOR | Oui | SuperAdmin |
| DELETE | `/users/:id` | Supprimer utilisateur | Oui | SuperAdmin |

### Demandes vendeur (SellerRequest)

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/seller-requests` | Demander à devenir vendeur | Oui | BUYER (isSeller=false) |
| GET | `/seller-requests/me` | Ma demande | Oui | BUYER |
| GET | `/seller-requests` | Toutes les demandes | Oui | Operator, SuperAdmin |
| GET | `/seller-requests/pending` | Demandes pending | Oui | Operator, SuperAdmin |
| GET | `/seller-requests/stats` | Statistiques demandes | Oui | Operator, SuperAdmin |
| GET | `/seller-requests/:id` | Détail demande | Oui | Operator, SuperAdmin |
| PATCH | `/seller-requests/:id/validate` | Valider/Refuser demande | Oui | Operator, SuperAdmin |

**Body POST /seller-requests** :
```json
{
  "businessName": "Mon Entreprise",
  "businessAddress": "123 Rue Example, Kinshasa",
  "businessPhone": "+243 XXX XXX XXX",
  "taxId": "A12345678" (optionnel),
  "description": "Description de l'activité"
}
```

**Body PATCH /seller-requests/:id/validate** :
```json
{
  "status": "APPROVED" | "REJECTED",
  "rejectionReason": "Raison du refus" (si REJECTED)
}
```

### Catégories

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/categories` | Liste catégories paginée | Non | - |
| GET | `/categories/active` | Catégories actives avec sous-catégories | Non | - |
| GET | `/categories/slug/:slug` | Catégorie par slug | Non | - |
| GET | `/categories/:id` | Détail catégorie | Non | - |
| POST | `/categories` | Créer catégorie | Oui | SuperAdmin |
| PATCH | `/categories/:id` | Modifier catégorie | Oui | SuperAdmin |
| DELETE | `/categories/:id` | Supprimer catégorie | Oui | SuperAdmin |

### Sous-catégories

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/subcategories` | Liste sous-catégories | Non | - |
| GET | `/subcategories/by-category/:categoryId` | Par catégorie | Non | - |
| GET | `/subcategories/slug/:catSlug/:subSlug` | Par slugs | Non | - |
| GET | `/subcategories/:id` | Détail | Non | - |
| POST | `/subcategories` | Créer | Oui | SuperAdmin |
| PATCH | `/subcategories/:id` | Modifier | Oui | SuperAdmin |
| DELETE | `/subcategories/:id` | Supprimer | Oui | SuperAdmin |

### Variantes (attributs dynamiques)

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/variants` | Liste variantes | Non | - |
| GET | `/variants/by-category/:categoryId` | Pour formulaire annonce | Non | - |
| GET | `/variants/filterable/:categoryId` | Pour filtres recherche | Non | - |
| GET | `/variants/:id` | Détail | Non | - |
| POST | `/variants` | Créer | Oui | SuperAdmin |
| PATCH | `/variants/:id` | Modifier | Oui | SuperAdmin |
| DELETE | `/variants/:id` | Supprimer | Oui | SuperAdmin |

**Types de variantes** : `TEXT`, `NUMBER`, `SELECT`, `MULTI_SELECT`, `COLOR`, `BOOLEAN`

**Body POST /variants** :
```json
{
  "categoryId": "xxx",
  "name": { "fr": "Couleur", "en": "Color" },
  "type": "COLOR",
  "options": [
    { "value": "noir", "label": { "fr": "Noir", "en": "Black" }, "hex": "#000000" }
  ],
  "isRequired": false,
  "isFilterable": true
}
```

### Annonces

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/ads` | Liste publique (approved, location masquée) | Non | - |
| GET | `/ads/detail/:id` | Détail annonce publique | Non | - |
| POST | `/ads` | Créer annonce | Oui | SELLER |
| GET | `/ads/my-ads` | Mes annonces | Oui | SELLER |
| GET | `/ads/my-ads/:id` | Détail mon annonce (avec location) | Oui | SELLER |
| PATCH | `/ads/:id` | Modifier annonce | Oui | SELLER (owner) |
| DELETE | `/ads/:id` | Supprimer annonce | Oui | SELLER/Operator |
| GET | `/ads/pending` | Annonces en attente | Oui | Operator+ |
| GET | `/ads/admin/:id` | Détail admin (avec location) | Oui | Operator+ |
| PATCH | `/ads/:id/validate` | Valider/Refuser | Oui | Operator+ |
| GET | `/ads/stats` | Stats globales | Oui | Operator+ |
| GET | `/ads/my-stats` | Mes stats vendeur | Oui | SELLER |

**Note confidentialité** :
- PUBLIC : `location`, `latitude`, `longitude` masqués
- SELLER owner : location visible
- OPERATOR/SUPER_ADMIN : location visible

**Body POST /ads** :
```json
{
  "title": "Belle maison à Kinshasa",
  "description": "Description détaillée...",
  "price": 50000000,
  "quantity": null,
  "type": "SALE",
  "categoryId": "uuid",
  "subCategoryId": "uuid",
  "location": "123 Rue Example, Kinshasa",
  "city": "Kinshasa",
  "latitude": -4.3276,
  "longitude": 15.3136,
  "variantValues": [
    { "variantId": "xxx", "value": "3" }
  ]
}
```

**Notes** :
- `price` : en **FCFA** (Franc CFA)
- `quantity` : `null` = pas de stock (immobilier), nombre = stock disponible

**Body PATCH /ads/:id/validate** :
```json
{
  "status": "APPROVED" | "REJECTED" | "MODIFICATION_REQUESTED",
  "rejectionReason": "Raison" (si REJECTED ou MODIFICATION_REQUESTED)
}
```

### Fichiers

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/files/upload/image` | Upload image (max 5 Mo) | Oui | SELLER |
| POST | `/files/upload/document` | Upload PDF (max 10 Mo) | Oui | SELLER |
| POST | `/files/:id/link` | Associer fichier à annonce | Oui | SELLER |
| GET | `/files/:folder/:filename` | Récupérer fichier | Non | - |
| GET | `/files/ad/:adId` | Fichiers d'une annonce | Non | - |
| GET | `/files/my-files` | Mes fichiers non associés | Oui | SELLER |
| GET | `/files/:id` | Détail fichier | Non | - |
| DELETE | `/files/:id` | Supprimer fichier | Oui | SELLER (owner), Operator |

**Upload images** : multipart/form-data, max 5 Mo, types : jpeg/png/webp/gif
**Upload documents** : multipart/form-data, max 10 Mo, types : pdf

**Stockage** : Local avec abstraction (interface StorageProvider pour migration S3 facile)

### Dashboard

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/dashboard/stats` | Stats globales | Oui | Operator, SuperAdmin |
| GET | `/dashboard/my-stats` | Mes stats vendeur | Oui | SELLER |

**Response GET /dashboard/stats** (Operator/SuperAdmin) :
```json
{
  "totalAds": 150,
  "pendingAds": 12,
  "approvedAds": 130,
  "rejectedAds": 8,
  "totalBuyers": 450,
  "totalSellers": 35,
  "pendingSellerRequests": 5
}
```

**Response GET /dashboard/my-stats** (SELLER) :
```json
{
  "myAds": {
    "total": 15,
    "pending": 2,
    "approved": 12,
    "rejected": 1
  },
  "totalViews": 234 (Phase 2)
}
```

### Historique connexions

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/login-history` | Historique connexions | Oui | SuperAdmin |
| GET | `/login-history/me` | Mes connexions | Oui | Tous |

## Modèles de données

### User

```typescript
{
  id: string (UUID)
  email: string (unique)
  password: string (bcrypt hashed)
  firstName: string
  lastName: string
  phone?: string
  role: 'BUYER' | 'OPERATOR' | 'SUPER_ADMIN' (default: BUYER)

  // Statut vendeur
  isSeller: boolean (default: false)

  // CGU (BUYER uniquement)
  termsAccepted: boolean (default: false)
  termsAcceptedAt?: DateTime

  createdAt: DateTime
  updatedAt: DateTime
}
```

**Note** : Un User avec `isSeller=true` peut accéder au Marketplace (achat) ET Admin Panel (vente)

### SellerRequest (Demande "Devenir vendeur")

```typescript
{
  id: string (UUID)
  userId: string (FK → User, unique)

  // Informations business
  businessName: string
  businessAddress: string
  businessPhone: string
  taxId?: string
  description?: string

  // Validation
  status: 'PENDING' | 'APPROVED' | 'REJECTED' (default: PENDING)
  validatedBy?: string (User ID de l'OPERATOR/SUPER_ADMIN)
  validatedAt?: DateTime
  rejectionReason?: string

  createdAt: DateTime
  updatedAt: DateTime
}
```

### Category

```typescript
{
  id: string (UUID)
  name: string (unique)
  slug: string (unique)
  description?: string
  icon?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Ad (Annonce)

```typescript
{
  id: string (UUID)
  title: string
  description: string
  price: Decimal
  type: 'SALE' | 'RENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUESTED'
  location: string (confidentiel)
  latitude?: Decimal
  longitude?: Decimal
  categoryId: string
  userId: string
  validatedBy?: string
  validatedAt?: DateTime
  rejectionReason?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### File

```typescript
{
  id: string (UUID)
  filename: string
  originalName: string
  mimeType: string
  size: number (bytes)
  path: string
  type: 'IMAGE' | 'DOCUMENT'
  adId: string
  createdAt: DateTime
}
```

### LoginHistory

```typescript
{
  id: string (UUID)
  userId: string
  ipAddress: string
  userAgent?: string
  success: boolean
  createdAt: DateTime
}
```

## Validation & Sécurité

### DTOs

Tous les endpoints utilisent des DTOs avec `class-validator` :

```typescript
// Exemple : CreateAdDto
export class CreateAdDto {
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(50)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(AdType)
  type: AdType;

  @IsUUID()
  categoryId: string;

  @IsString()
  location: string;
}
```

### Guards

#### JwtAuthGuard

Vérifie la présence et la validité du token JWT.

```typescript
@UseGuards(JwtAuthGuard)
@Get('my-ads')
async getMyAds(@Request() req) {
  return this.adsService.findByUserId(req.user.id);
}
```

#### RolesGuard

Vérifie le rôle de l'utilisateur.

```typescript
@Roles(Role.OPERATOR, Role.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('pending')
async getPendingAds() {
  return this.adsService.findByStatus('PENDING');
}
```

### Upload de fichiers

Phase 1 :
- **Types MIME** : `image/jpeg`, `image/png`, `image/webp`
- **Taille max** : 5 Mo
- **Stockage** : Système de fichiers local

Phase 2+ :
- Types MIME additionnels : `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Taille max : 10 Mo

## Confidentialité des lieux

**IMPORTANT** : La localisation des annonces est confidentielle.

```typescript
// Dans AdsService
async findPublicAds() {
  const ads = await this.prisma.ad.findMany({
    where: { status: 'APPROVED' },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      // location, latitude, longitude EXCLUS pour Public
    }
  });
  return ads;
}

async findAdForOperator(id: string) {
  // Operator/SuperAdmin peuvent voir location
  return this.prisma.ad.findUnique({
    where: { id },
    // Tous les champs, y compris location
  });
}
```

## Scripts npm

```bash
# Développement
npm run start              # Démarrer sans watch
npm run start:dev          # Mode développement avec hot-reload
npm run start:debug        # Mode debug (port 9229)

# Build
npm run build              # Compiler TypeScript → dist/
npm run start:prod         # Démarrer build production

# Tests
npm run test               # Tests unitaires
npm run test:watch         # Tests en mode watch
npm run test:cov           # Tests avec couverture
npm run test:e2e           # Tests end-to-end

# Code quality
npm run lint               # ESLint
npm run format             # Prettier

# Database
npm run prisma:generate    # Générer client Prisma
npm run prisma:migrate     # Exécuter migrations
npm run prisma:studio      # Ouvrir Prisma Studio
npm run prisma:seed        # Seed données initiales
```

## Variables d'environnement

### Obligatoires

- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Secret pour signer les tokens JWT (min 32 caractères)

### Optionnelles

- `PORT` : Port du serveur (défaut : 3000)
- `NODE_ENV` : Environnement (development, production)
- `JWT_EXPIRATION` : Durée de validité du token (défaut : 7d)

### Phase 2+ (Email)

- `SMTP_HOST` : Serveur SMTP
- `SMTP_PORT` : Port SMTP
- `SMTP_USER` : Utilisateur SMTP
- `SMTP_PASSWORD` : Mot de passe SMTP
- `SMTP_FROM` : Email expéditeur

## Déploiement

### Build production

```bash
npm run build
```

Les fichiers compilés seront dans `dist/`.

### Démarrer en production

```bash
NODE_ENV=production npm run start:prod
```

### Avec PM2

```bash
# Installer PM2
npm install -g pm2

# Démarrer
pm2 start dist/main.js --name uscg-api

# Monitorer
pm2 monit

# Logs
pm2 logs uscg-api

# Redémarrer
pm2 restart uscg-api
```

## Troubleshooting

### Erreur Prisma Client

```bash
# Régénérer le client Prisma
npx prisma generate

# Redémarrer le serveur
npm run start:dev
```

### Port déjà utilisé

Changer le `PORT` dans `.env` ou :

```bash
PORT=3001 npm run start:dev
```

### Base de données inaccessible

Vérifier :
1. PostgreSQL est démarré : `sudo systemctl status postgresql`
2. `DATABASE_URL` dans `.env` est correcte
3. Base de données existe : `psql -l`

### Migrations échouées

```bash
# Voir le statut
npx prisma migrate status

# Réinitialiser (ATTENTION : supprime données)
npx prisma migrate reset

# Réappliquer
npx prisma migrate dev
```

## Ressources

- [Documentation NestJS](https://docs.nestjs.com)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Passport.js](http://www.passportjs.org)
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture complète
- [ROADMAP.md](../ROADMAP.md) - Plan de développement

---

**Version** : 1.1.0-beta
**Phase actuelle** : Phase 1 (MVP Basique) - Backend API quasi-complet
**Dernière mise à jour** : 12 Juin 2026
