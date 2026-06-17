# Architecture Technique - USCG

Documentation de l'architecture de la plateforme Universal Services of Congo.

## Vue d'ensemble

USCG est une application monorepo full-stack construite avec une architecture moderne et scalable.

```
┌─────────────────────────────────────────────────────────┐
│                    USERS (Browser)                       │
│              Mobile / Tablet / Desktop                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────┐
│              FRONTENDS (Next.js 16)                      │
│  ┌─────────────┬──────────────┬─────────────────────┐  │
│  │ Marketplace │ Admin Panel  │   Cover Page        │  │
│  │  (Port 3001)│ (Port 3002)  │   (Port 3003)       │  │
│  └─────────────┴──────────────┴─────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (JSON)
┌────────────────────▼────────────────────────────────────┐
│                BACKEND API (NestJS 11)                   │
│                     Port 3000                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Controllers → Services → Repositories            │  │
│  │  Guards (JWT, Roles) → Interceptors → Pipes      │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ Prisma ORM
┌────────────────────▼────────────────────────────────────┐
│              DATABASE (PostgreSQL 14+)                   │
│  Users | Ads | Categories | Files | Logs | Terms        │
└──────────────────────────────────────────────────────────┘
```

## Stack technique détaillé

### Backend - NestJS

#### Framework & Core
- **NestJS** 11.0.1 - Framework Node.js progressif
- **TypeScript** 5.x - Typage statique strict
- **Node.js** 18+ - Runtime JavaScript

#### Base de données
- **PostgreSQL** 14+ - Base de données relationnelle
- **Prisma** 7.8.0 - ORM type-safe
- **Prisma Client** - Générateur de requêtes type-safe
- **Prisma Migrate** - Gestion des migrations

#### Authentification & Sécurité
- **Passport.js** 0.7.0 - Middleware d'authentification
- **passport-jwt** 4.0.1 - Stratégie JWT
- **@nestjs/jwt** - Module JWT pour NestJS
- **bcrypt** 6.0.0 - Hashage de mots de passe
- **class-validator** - Validation des DTOs
- **class-transformer** - Transformation des objets

#### Utilitaires
- **@nestjs/config** - Gestion des variables d'environnement
- **@nestjs/swagger** - Documentation API automatique (recommandé)

### Frontend - Next.js

#### Framework & UI
- **Next.js** 16.2.4 - React framework avec App Router
- **React** 19.2.4 - Bibliothèque UI
- **TypeScript** 5.x - Typage statique
- **Tailwind CSS** 4.x - Framework CSS utility-first
- **PostCSS** - Transformation CSS

#### Client HTTP
- **fetch API** - Natif (Next.js 16)
- Ou **axios** - Client HTTP (si nécessaire)

### Monorepo

- **npm workspaces** - Gestion du monorepo
- **Shared workspace** - Code partagé entre applications

## Architecture Backend (NestJS)

### Structure des modules

```
backend/
├── src/
│   ├── main.ts                    # Bootstrap application
│   ├── app.module.ts              # Module racine
│   │
│   ├── auth/                      # Module authentification
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts     # Login, register, refresh
│   │   ├── auth.service.ts        # Logique auth
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts    # Stratégie JWT Passport
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts  # Guard JWT
│   │   │   └── roles.guard.ts     # Guard RBAC
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts # Decorator @Roles()
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/                     # Module utilisateurs
│   │   ├── users.module.ts
│   │   ├── users.controller.ts    # CRUD users
│   │   ├── users.service.ts       # Logique métier users
│   │   ├── entities/
│   │   │   └── user.entity.ts     # Interface User
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── ads/                       # Module annonces
│   │   ├── ads.module.ts
│   │   ├── ads.controller.ts      # CRUD ads, validation
│   │   ├── ads.service.ts         # Logique métier ads
│   │   ├── entities/
│   │   │   └── ad.entity.ts       # Interface Ad
│   │   └── dto/
│   │       ├── create-ad.dto.ts
│   │       ├── update-ad.dto.ts
│   │       └── validate-ad.dto.ts # Pour Operator
│   │
│   ├── categories/                # Module catégories
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── dto/
│   │
│   ├── files/                     # Module upload fichiers
│   │   ├── files.module.ts
│   │   ├── files.controller.ts    # Upload photos/docs
│   │   ├── files.service.ts       # Validation, stockage
│   │   └── dto/
│   │
│   ├── terms/                     # Module CGU
│   │   ├── terms.module.ts
│   │   ├── terms.controller.ts
│   │   ├── terms.service.ts       # Acceptance CGU
│   │   └── dto/
│   │
│   ├── common/                    # Code commun
│   │   ├── filters/               # Exception filters
│   │   ├── interceptors/          # Interceptors
│   │   ├── pipes/                 # Validation pipes
│   │   └── constants/             # Constantes
│   │
│   └── prisma/                    # Module Prisma
│       ├── prisma.module.ts
│       └── prisma.service.ts      # Service Prisma
│
├── prisma/
│   ├── schema.prisma              # Schéma DB
│   ├── migrations/                # Migrations versionnées
│   └── seed.ts                    # Données de test
│
├── test/
│   ├── app.e2e-spec.ts           # Tests e2e
│   └── jest-e2e.json
│
├── .env                           # Variables d'environnement
├── .env.example                   # Template .env
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### Flux d'authentification

```
1. BUYER inscription (Marketplace) POST /auth/register
   → AuthController.register()
   → Validate CGU acceptance
   → AuthService.register()
   → UsersService.create()
   → bcrypt.hash(password)
   → Prisma.user.create({ role: BUYER, isSeller: false })
   → Return JWT token { sub, email, role: BUYER, isSeller: false }

2. Login (tous rôles) POST /auth/login
   → AuthController.login()
   → AuthService.validateUser()
   → bcrypt.compare(password, hash)
   → AuthService.login()
   → Return JWT token { sub, email, role, isSeller }
   → Frontend redirect selon role/isSeller:
      - isSeller=true → Admin Panel /seller/dashboard
      - OPERATOR → Admin Panel /operator/dashboard
      - SUPER_ADMIN → Admin Panel /admin/dashboard
      - BUYER (isSeller=false) → Marketplace /

3. Protected route (avec Authorization header)
   → JwtAuthGuard validates token
   → JWT Strategy extracts payload
   → Request.user = { id, email, role, isSeller }
   → RolesGuard checks permissions
   → Controller executes
```

### Flux "Devenir vendeur"

```
1. BUYER POST /seller-requests (Marketplace, authentifié)
   → Check user.role === BUYER
   → Check user.isSeller === false (pas déjà vendeur)
   → SellerRequestController.create()
   → Validate DTO (businessName, businessAddress, businessPhone)
   → SellerRequestService.create()
   → Prisma.sellerRequest.create({ status: PENDING, userId })
   → Return sellerRequest

2. OPERATOR/SUPER_ADMIN GET /seller-requests/pending (Admin Panel)
   → RolesGuard checks [OPERATOR, SUPER_ADMIN]
   → SellerRequestController.findPending()
   → SellerRequestService.findByStatus('PENDING')
   → Prisma.sellerRequest.findMany({ where: { status: PENDING }, include: { user } })
   → Return pending requests with user info

3. OPERATOR/SUPER_ADMIN PATCH /seller-requests/:id/validate (Admin Panel)
   → RolesGuard checks [OPERATOR, SUPER_ADMIN]
   → SellerRequestController.validate()
   → Validate DTO { status: APPROVED | REJECTED, rejectionReason? }
   → SellerRequestService.validate(id, validatorId, dto)
   → Transaction Prisma:
      a. Update sellerRequest { status, validatedBy, validatedAt, rejectionReason }
      b. If status === APPROVED:
         → Update user { isSeller: true }
      → (Phase 2: Send email notification)
   → Return updated sellerRequest

4. BUYER GET /seller-requests/me (Marketplace)
   → Check user.role === BUYER
   → SellerRequestService.findByUserId(userId)
   → Prisma.sellerRequest.findUnique({ where: { userId } })
   → Return my sellerRequest (status: PENDING | APPROVED | REJECTED)
```

### Flux de création et validation d'annonce

```
1. SELLER POST /ads (Admin Panel, isSeller=true requis)
   → Check user.isSeller === true
   → AdsController.create()
   → Validate DTO (title, description, price, type, categoryId, location)
   → AdsService.create(userId)
   → Prisma.ad.create({ ...data, userId, status: PENDING })
   → Return created ad

2. OPERATOR/SUPER_ADMIN GET /ads/pending (Admin Panel)
   → RolesGuard checks [OPERATOR, SUPER_ADMIN]
   → AdsController.findPending()
   → AdsService.findByStatus('PENDING')
   → Prisma.ad.findMany({ where: { status: PENDING }, include: { user, category } })
   → Return pending ads (avec localisation complète)

3. OPERATOR/SUPER_ADMIN PATCH /ads/:id/validate (Admin Panel)
   → RolesGuard checks [OPERATOR, SUPER_ADMIN]
   → AdsController.validate()
   → Validate DTO { status: APPROVED | REJECTED | MODIFICATION_REQUESTED, rejectionReason? }
   → AdsService.validate(id, validatorId, dto)
   → Prisma.ad.update({ status, validatedBy, validatedAt, rejectionReason })
   → (Phase 2: Send email notification to SELLER)
   → Return validated ad

4. PUBLIC GET /ads (Marketplace, sans auth)
   → AdsController.findPublic()
   → AdsService.findPublic()
   → Prisma.ad.findMany({
       where: { status: APPROVED },
       select: { // Exclude location fields for PUBLIC
         id, title, description, price, type, categoryId, files
         // location, latitude, longitude EXCLUDED
       }
     })
   → Return only approved ads (location masquée)

5. SELLER GET /ads/my-ads (Admin Panel, isSeller=true)
   → Check user.isSeller === true
   → AdsController.findMyAds()
   → AdsService.findByUserId(userId)
   → Prisma.ad.findMany({ where: { userId } })
   → Return all my ads (avec localisation complète)
```

## Modèle de données (Prisma Schema)

### Users

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String    // bcrypt hashed
  firstName     String
  lastName      String
  phone         String?
  role          Role      @default(BUYER)

  // Statut vendeur
  isSeller      Boolean   @default(false)

  // CGU acceptance (BUYER uniquement)
  termsAccepted Boolean   @default(false)
  termsAcceptedAt DateTime?

  // Relations
  ads           Ad[]         // Annonces (seulement si isSeller = true)
  sellerRequest SellerRequest?
  logins        LoginHistory[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([role])
  @@index([isSeller])
  @@map("users")
}

enum Role {
  BUYER        // Acheteurs sur Marketplace (par défaut)
  OPERATOR     // Validateurs d'annonces et demandes vendeur
  SUPER_ADMIN  // Administrateur système
}
```

### SellerRequest (Demandes "Devenir vendeur")

```prisma
model SellerRequest {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Informations business
  businessName    String
  businessAddress String
  businessPhone   String
  taxId           String?   // Numéro fiscal (optionnel)
  description     String?   @db.Text

  // Validation
  status          RequestStatus @default(PENDING)
  validatedBy     String?       // User ID de l'OPERATOR/SUPER_ADMIN
  validatedAt     DateTime?
  rejectionReason String?       @db.Text

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([status])
  @@index([userId])
  @@map("seller_requests")
}

enum RequestStatus {
  PENDING    // Demande en attente de validation
  APPROVED   // Demande approuvée (User.isSeller → true)
  REJECTED   // Demande refusée
}
```

### Ads (Annonces)

```prisma
model Ad {
  id          String    @id @default(uuid())
  title       String
  description String    @db.Text
  price       Decimal   @db.Decimal(12, 2)
  type        AdType    // SALE or RENT
  status      AdStatus  @default(PENDING)

  // Location (confidentielle)
  location    String    // Visible uniquement Operator/SuperAdmin
  latitude    Decimal?  @db.Decimal(10, 8)
  longitude   Decimal?  @db.Decimal(11, 8)

  // Relations
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  files       File[]

  // Validation info
  validatedBy String?
  validatedAt DateTime?
  rejectionReason String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([status])
  @@index([categoryId])
  @@index([userId])
  @@index([type])
}

enum AdType {
  SALE
  RENT
}

enum AdStatus {
  PENDING
  APPROVED
  REJECTED
  MODIFICATION_REQUESTED
}
```

### Categories

```prisma
model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  icon        String?  // Nom de l'icône ou URL

  ads         Ad[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
}

// Catégories initiales : Foncier, Immobilier, Electroménager, Divers
```

### Files

```prisma
model File {
  id          String   @id @default(uuid())
  filename    String
  originalName String
  mimeType    String
  size        Int      // En bytes
  path        String   // Chemin de stockage
  type        FileType // IMAGE, DOCUMENT
  isDefault   Boolean  @default(false) // Image principale de l'annonce

  adId        String?
  ad          Ad?      @relation(fields: [adId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([adId])
  @@index([userId])
}

enum FileType {
  IMAGE
  DOCUMENT
}
```

### LoginHistory

```prisma
model LoginHistory {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  ipAddress String
  userAgent String?
  success   Boolean  @default(true)

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

## Architecture Frontend (Next.js)

### Structure Admin Panel

```
admin-panel/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Dashboard
│   │
│   ├── login/
│   │   └── page.tsx               # Login page
│   │
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard stats
│   │
│   ├── ads/
│   │   ├── page.tsx               # Liste annonces
│   │   ├── pending/
│   │   │   └── page.tsx           # Annonces en attente
│   │   └── [id]/
│   │       └── page.tsx           # Détail annonce + validation
│   │
│   ├── users/
│   │   ├── page.tsx               # Liste utilisateurs
│   │   └── [id]/
│   │       └── page.tsx           # Détail utilisateur
│   │
│   └── categories/
│       └── page.tsx               # Gestion catégories (SuperAdmin)
│
├── components/
│   ├── ui/                        # Composants UI réutilisables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── ads/
│   │   ├── AdCard.tsx
│   │   ├── AdValidationForm.tsx
│   │   └── AdFilters.tsx
│   └── dashboard/
│       ├── StatsCard.tsx
│       └── RecentAds.tsx
│
├── lib/
│   ├── api.ts                     # API client (fetch wrapper)
│   ├── auth.ts                    # Auth helpers
│   └── utils.ts                   # Utilitaires
│
├── styles/
│   └── globals.css                # Styles globaux + Tailwind
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

### Structure Marketplace

```
marketplace/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # Homepage + recherche
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── register/
│   │   └── page.tsx
│   │
│   ├── ads/
│   │   ├── page.tsx               # Liste annonces
│   │   ├── new/
│   │   │   └── page.tsx           # Créer annonce
│   │   └── [id]/
│   │       └── page.tsx           # Détail annonce
│   │
│   ├── profile/
│   │   ├── page.tsx               # Profil utilisateur
│   │   └── my-ads/
│   │       └── page.tsx           # Mes annonces
│   │
│   └── terms/
│       └── page.tsx               # CGU
│
├── components/
│   ├── ui/                        # Templates fournis par client
│   ├── ads/
│   │   ├── AdCard.tsx
│   │   ├── AdForm.tsx
│   │   ├── AdSearch.tsx
│   │   └── AdFilters.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
│
└── ... (similaire à admin-panel)
```

## Shared Workspace

Code partagé entre admin-panel, marketplace et backend.

```
shared/
├── src/
│   └── types/
│       ├── index.ts              # Export centralisé de tous les types
│       ├── user.types.ts         # IUser, IAuthUser, IUserProfile, DTOs
│       ├── auth.types.ts         # ILoginDto, IRegisterDto, ILoginResponse
│       ├── category.types.ts     # I18nText, ICategory, ISubCategory, DTOs
│       ├── variant.types.ts      # VariantType enum, IVariant, IVariantOption
│       ├── ad.types.ts           # AdStatus, AdType, IAd, IAdListItem, IAdFull
│       ├── seller-request.types.ts # SellerRequestStatus, ISellerRequest, DTOs
│       ├── file.types.ts         # FileType enum, IFile (avec isDefault)
│       └── api.types.ts          # ApiResponse, PaginatedResponse, PaginationMeta
│
├── package.json                  # Package @uscg/shared
└── tsconfig.json
```

### Utilisation des types partagés

```typescript
// Import direct depuis le package shared
import { IAdListItem, AdStatus, I18nText, UserRole } from "@uscg/shared/types";

// Dans admin-panel : via les features (avec alias pour rétrocompatibilité)
import { Ad, AdListItem, AdStatus } from "@/features/ads";
import { User, UserRole } from "@/features/users";
import { Category, SubCategory } from "@/features/categories";
```

## Sécurité

### Backend

#### Authentification JWT

```typescript
// Configuration JWT
{
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRATION || '7d'
  }
}

// Token payload
interface JwtPayload {
  sub: string;      // User ID
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
```

#### RBAC (Role-Based Access Control)

```typescript
// Decorator @Roles()
@Roles(Role.OPERATOR, Role.SUPER_ADMIN)
@Get('pending')
async getPendingAds() {
  // Seulement accessible par Operator et SuperAdmin
}

// Guard implementation
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### Validation des données

```typescript
// DTO avec class-validator
export class CreateAdDto {
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(AdType)
  type: AdType;

  @IsUUID()
  categoryId: string;
}
```

#### Upload de fichiers

- **Validation types MIME** : images (jpeg, png, webp), documents (pdf, docx)
- **Limite de taille** : Phase 1 = 5 Mo, Phase 2+ = 10 Mo
- **Stockage** : Système de fichiers local ou cloud (S3, etc.)
- **Noms sécurisés** : UUID + extension

### Frontend

#### Gestion des tokens

```typescript
// Stockage sécurisé
localStorage.setItem('access_token', token);

// Header Authorization
headers: {
  'Authorization': `Bearer ${token}`
}

// Refresh automatique avant expiration
```

#### Protection des routes

```typescript
// Middleware Next.js
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Vérifier rôle pour routes admin
}
```

## Performance

### Backend

- **Pagination** : `skip` et `take` avec Prisma
- **Indexes** : Sur colonnes de recherche fréquentes
- **Caching** : Redis (Phase 2+) pour requêtes fréquentes
- **Lazy loading** : Relations Prisma chargées à la demande

### Frontend

- **Server Components** : Par défaut avec Next.js 16
- **Streaming SSR** : Pour pages complexes
- **Image optimization** : Next.js `<Image>`composant
- **Code splitting** : Automatique avec Next.js
- **Prefetching** : `<Link prefetch>` pour navigation rapide

## Monitoring & Logs

### Backend

- **Winston** : Logger structuré
- **Logs importants** :
  - Connexions/déconnexions
  - Validations d'annonces
  - Erreurs critiques
  - Tentatives de connexion échouées

### Frontend

- **Console logs** : Seulement en dev
- **Error boundaries** : Capturer erreurs React
- **Analytics** : Google Analytics ou Matomo (Phase 2+)

## Déploiement

### Infrastructure cible

- **VPS** : 200 Go, SSL inclus
- **OS** : Ubuntu 22.04 LTS recommandé
- **Reverse proxy** : Nginx
- **Process manager** : PM2 pour Node.js
- **Database** : PostgreSQL 14+

### Architecture de déploiement

```
Internet
   │
   ▼
[Nginx Reverse Proxy] - Port 80/443 (SSL)
   │
   ├─► [Backend NestJS] - Port 3000
   │
   ├─► [Marketplace Next.js] - Port 3001
   │
   ├─► [Admin Panel Next.js] - Port 3002
   │
   └─► [Cover Page Next.js] - Port 3003

[PostgreSQL] - Port 5432 (localhost only)
```

### Variables d'environnement production

```env
# Backend
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-secret>
PORT=3000

# Frontend
NEXT_PUBLIC_API_URL=https://api.universal-services-congo.com
NODE_ENV=production
```

## Évolutivité future

### Phase 2+ envisagée

- **Microservices** : Séparer Auth, Ads, Files en services distincts
- **Message Queue** : RabbitMQ ou Bull pour jobs asynchrones (emails, etc.)
- **CDN** : CloudFlare ou AWS CloudFront pour static assets
- **Storage cloud** : AWS S3 ou compatible pour fichiers
- **Redis** : Caching et sessions

### Phase 3+ envisagée

- **GraphQL** : Alternative/complément à REST API
- **WebSockets** : Notifications temps réel
- **Mobile apps** : React Native ou Flutter
- **Elasticsearch** : Recherche avancée full-text

---

**Version** : 1.1
**Dernière mise à jour** : Juin 2026
