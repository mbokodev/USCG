avant de -moi# Guide de contribution - USCG

Guide des conventions de code et bonnes pratiques pour le projet Universal Services of Congo.

## Table des matières

- [Conventions de nommage](#conventions-de-nommage)
- [Structure du code](#structure-du-code)
- [TypeScript](#typescript)
- [Backend (NestJS)](#backend-nestjs)
- [Frontend (Next.js)](#frontend-nextjs)
- [Base de données (Prisma)](#base-de-données-prisma)
- [Git](#git)
- [Tests](#tests)
- [Documentation](#documentation)

---

## Conventions de nommage

### Fichiers et dossiers

| Type | Convention | Exemple |
|------|-----------|---------|
| Fichiers | kebab-case | `user.service.ts`, `ad-validation.dto.ts` |
| Dossiers | kebab-case | `src/auth`, `components/ui` |
| Composants React | PascalCase | `AdCard.tsx`, `UserProfile.tsx` |
| Tests | `.spec.ts` ou `.test.tsx` | `user.service.spec.ts`, `Button.test.tsx` |

### Code

| Type | Convention | Exemple |
|------|-----------|---------|
| Classes | PascalCase | `UserService`, `AdValidationDto` |
| Interfaces | PascalCase avec `I` optionnel | `User`, `IAuthPayload` |
| Types | PascalCase | `AdType`, `UserRole` |
| Enums | PascalCase | `Role`, `AdStatus` |
| Variables | camelCase | `userId`, `isValidated` |
| Fonctions | camelCase | `getUserById`, `validateAd` |
| Constantes | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `JWT_SECRET` |
| Composants React | PascalCase | `AdCard`, `UserProfile` |
| Hooks React | camelCase avec `use` | `useAuth`, `useAds` |

### Exemples

```typescript
// ✅ Bon
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 Mo
const userId = user.id;

function validateAdData(ad: Ad): boolean {
  // ...
}

class UserService {
  // ...
}

enum Role {
  PUBLIC = 'PUBLIC',
  OPERATOR = 'OPERATOR',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// ❌ Mauvais
const max_upload_size = 5242880;
const UserId = user.id;

function ValidateAdData(ad: Ad): boolean {
  // ...
}

class userService {
  // ...
}
```

---

## Structure du code

### Backend - Modules NestJS

Un module = un domaine métier (auth, users, ads, etc.)

```
src/
├── auth/
│   ├── auth.module.ts          # Module
│   ├── auth.controller.ts      # Endpoints
│   ├── auth.service.ts         # Logique métier
│   ├── strategies/             # Stratégies Passport
│   ├── guards/                 # Guards (JWT, Roles)
│   ├── decorators/             # Decorators custom
│   └── dto/                    # DTOs validation
│       ├── login.dto.ts
│       └── register.dto.ts
```

### Frontend - Composants Next.js

```
app/
├── (auth)/                     # Route group
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   └── page.tsx
└── layout.tsx

components/
├── ui/                         # Composants UI génériques
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── ads/                        # Composants métier
│   ├── AdCard.tsx
│   ├── AdForm.tsx
│   └── AdFilters.tsx
└── layout/
    ├── Navbar.tsx
    └── Footer.tsx
```

---

## TypeScript

### Mode strict activé

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Pas de `any`

```typescript
// ❌ Mauvais
function processData(data: any) {
  return data.value;
}

// ✅ Bon
interface DataInput {
  value: string;
}

function processData(data: DataInput) {
  return data.value;
}

// ✅ Acceptable si vraiment inconnu
function processUnknown(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
}
```

### Typage des retours de fonction

```typescript
// ✅ Bon - Type explicite
function getUser(id: string): Promise<User> {
  return this.prisma.user.findUnique({ where: { id } });
}

// ⚠️ Acceptable - Type inféré (mais moins clair)
function getUser(id: string) {
  return this.prisma.user.findUnique({ where: { id } });
}
```

### Interfaces vs Types

- **Interfaces** : Pour objets et classes
- **Types** : Pour unions, intersections, utilitaires

```typescript
// ✅ Interface pour objets
interface User {
  id: string;
  email: string;
  role: Role;
}

// ✅ Type pour unions
type AdStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ✅ Type pour intersections
type AuthenticatedUser = User & { token: string };
```

---

## Backend (NestJS)

### Controllers

```typescript
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // ✅ Bon - Décorateurs clairs, DTOs, guards
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAdDto: CreateAdDto,
    @Request() req: RequestWithUser,
  ): Promise<Ad> {
    return this.adsService.create(createAdDto, req.user.id);
  }

  // ✅ Bon - Paramètres route typés
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ad> {
    return this.adsService.findOne(id);
  }

  // ✅ Bon - Query params avec DTO
  @Get()
  async findAll(@Query() queryDto: AdQueryDto): Promise<Ad[]> {
    return this.adsService.findAll(queryDto);
  }
}
```

### Services

```typescript
@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Bon - Logique métier claire
  async create(createAdDto: CreateAdDto, userId: string): Promise<Ad> {
    // Validation métier
    await this.validateCategory(createAdDto.categoryId);

    // Création
    return this.prisma.ad.create({
      data: {
        ...createAdDto,
        userId,
        status: AdStatus.PENDING,
      },
    });
  }

  // ✅ Bon - Méthodes privées pour logique interne
  private async validateCategory(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }
}
```

### DTOs

Toujours utiliser `class-validator` :

```typescript
import { IsString, IsNumber, IsEnum, Min, MinLength, MaxLength } from 'class-validator';

export class CreateAdDto {
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString()
  @MinLength(50)
  description: string;

  @IsNumber()
  @Min(0, { message: 'Price must be positive' })
  price: number;

  @IsEnum(AdType)
  type: AdType;

  @IsUUID('4', { message: 'Invalid category ID' })
  categoryId: string;
}
```

### Gestion des erreurs

Utiliser les exceptions NestJS :

```typescript
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

// ✅ Bon
async findOne(id: string): Promise<Ad> {
  const ad = await this.prisma.ad.findUnique({ where: { id } });

  if (!ad) {
    throw new NotFoundException(`Ad with ID ${id} not found`);
  }

  return ad;
}

// ❌ Mauvais - Ne pas retourner null
async findOne(id: string): Promise<Ad | null> {
  return this.prisma.ad.findUnique({ where: { id } });
}
```

---

## Frontend (Next.js)

### Composants

#### Server Components par défaut

```typescript
// ✅ Bon - Server Component par défaut (Next.js 16)
export default async function AdsPage() {
  const ads = await getAds(); // Fetch côté serveur

  return (
    <div>
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
```

#### Client Components seulement si nécessaire

```typescript
'use client'; // Directive obligatoire

import { useState } from 'react';

// ✅ Bon - Client Component pour interactivité
export function AdFilters() {
  const [category, setCategory] = useState('');

  return (
    <select value={category} onChange={(e) => setCategory(e.target.value)}>
      {/* ... */}
    </select>
  );
}
```

### Styles - Tailwind uniquement

```typescript
// ✅ Bon
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
      {children}
    </button>
  );
}

// ❌ Mauvais - Pas de CSS inline
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button style={{ backgroundColor: 'blue', color: 'white' }}>
      {children}
    </button>
  );
}

// ❌ Mauvais - Pas de CSS modules (sauf cas exceptionnel)
import styles from './Button.module.css';
```

### API Calls

Centraliser dans `shared/services` :

```typescript
// shared/services/api.service.ts
export class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}

// Utilisation
const apiService = new ApiService();
const ads = await apiService.get<Ad[]>('/ads');
```

---

## Base de données (Prisma)

### Schéma

```prisma
// ✅ Bon - Commentaires, relations claires, indexes
/// Utilisateur de la plateforme
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  firstName String
  lastName  String
  role      Role     @default(PUBLIC)

  // Relations
  ads       Ad[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([role])
  @@map("users") // Nom de table en snake_case
}

/// Annonce publiée par un utilisateur
model Ad {
  id          String   @id @default(uuid())
  title       String
  status      AdStatus @default(PENDING)

  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([userId])
  @@index([categoryId])
  @@map("ads")
}
```

### Migrations

Toujours nommer les migrations explicitement :

```bash
# ✅ Bon
npx prisma migrate dev --name add_user_terms_acceptance
npx prisma migrate dev --name create_ads_table

# ❌ Mauvais - Nom auto-généré
npx prisma migrate dev
```

---

## Git

### Branches

```bash
# Format : <type>/<description-courte>
feature/user-authentication
feature/ad-validation
fix/login-bug
refactor/ads-service
docs/update-readme
```

### Commits - Conventional Commits

```bash
# Format : <type>(<scope>): <description>

# Types :
# - feat: Nouvelle fonctionnalité
# - fix: Correction de bug
# - docs: Documentation
# - style: Formatage (pas de changement de code)
# - refactor: Refactoring
# - test: Ajout/modification tests
# - chore: Maintenance (deps, config, etc.)

# ✅ Exemples bons
feat(auth): add JWT authentication
fix(ads): correct validation status update
docs(readme): update installation steps
refactor(users): simplify user service logic
test(ads): add unit tests for ad creation

# ❌ Exemples mauvais
update code
fix bug
changes
WIP
```

### Pull Requests

1. **Créer une branche** depuis `main`
2. **Faire les changements** avec commits clairs
3. **Tester** localement
4. **Push** et ouvrir PR
5. **Description claire** : ce qui a été fait et pourquoi
6. **Review** : Attendre validation avant merge

Template PR :

```markdown
## Description
[Décrire les changements]

## Type de changement
- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Refactoring
- [ ] Documentation

## Checklist
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Code lint passé (`npm run lint`)
- [ ] Tests passés (`npm run test`)

## Lien ROADMAP
Phase 1 - Backend Auth
```

---

## Tests

### Backend - Jest

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Frontend - React Testing Library

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Documentation

### Code

#### Commentaires JSDoc pour fonctions publiques

```typescript
/**
 * Crée une nouvelle annonce avec validation
 * @param createAdDto - Données de l'annonce à créer
 * @param userId - ID de l'utilisateur créateur
 * @returns L'annonce créée avec statut PENDING
 * @throws NotFoundException si la catégorie n'existe pas
 */
async create(createAdDto: CreateAdDto, userId: string): Promise<Ad> {
  // ...
}
```

#### Commentaires inline pour logique complexe

```typescript
// ✅ Bon - Explique le "pourquoi"
// Masquer la localisation pour les utilisateurs publics (confidentialité métier)
if (user.role === Role.PUBLIC) {
  delete ad.location;
  delete ad.latitude;
  delete ad.longitude;
}

// ❌ Mauvais - Explique le "quoi" (évident)
// Supprimer la location
delete ad.location;
```

### README

Chaque module/composant important devrait avoir un README si nécessaire.

---

## Bonnes pratiques générales

### DRY (Don't Repeat Yourself)

```typescript
// ❌ Mauvais - Code dupliqué
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function checkEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Bon - Une seule fonction
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### KISS (Keep It Simple, Stupid)

```typescript
// ❌ Mauvais - Trop complexe
function isAdApproved(ad: Ad): boolean {
  return ad.status === AdStatus.APPROVED ? true : false;
}

// ✅ Bon - Simple et clair
function isAdApproved(ad: Ad): boolean {
  return ad.status === AdStatus.APPROVED;
}
```

### YAGNI (You Aren't Gonna Need It)

Ne pas implémenter de fonctionnalités des phases futures sans instruction explicite.

```typescript
// ❌ Mauvais - Fonctionnalité Phase 3 en Phase 1
async addToCart(adId: string, userId: string) {
  // Panier = Phase 3 uniquement !
}

// ✅ Bon - Seulement Phase 1
async createAd(createAdDto: CreateAdDto, userId: string) {
  // Fonctionnalité Phase 1
}
```

---

## Checklist avant commit

- [ ] Code lint passé (`npm run lint`)
- [ ] Prettier formaté (`npm run format`)
- [ ] Tests passés (`npm run test`)
- [ ] Pas de `console.log` oublié
- [ ] Pas de `any` TypeScript
- [ ] Commentaires clairs si logique complexe
- [ ] Variables/fonctions nommées clairement
- [ ] DTOs avec validation pour backend
- [ ] Pas de secrets en dur (utiliser .env)

---

**Version** : 1.0
**Dernière mise à jour** : Mai 2026
