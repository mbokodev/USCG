import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdStatus, AdType } from '@prisma/client';

// I18n type for bilingual fields
export interface I18nText {
  fr: string;
  en: string;
}

export class AdCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: { fr: 'Immobilier', en: 'Real Estate' } })
  name: I18nText;

  @ApiProperty()
  slug: string;
}

export class AdSubCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: { fr: 'Appartements', en: 'Apartments' } })
  name: I18nText;

  @ApiProperty()
  slug: string;
}

export class AdSellerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  phone?: string;
}

export class AdFileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  path: string;

  @ApiProperty({ enum: ['IMAGE', 'DOCUMENT'] })
  type: string;

  @ApiProperty({ description: 'Image par défaut de l\'annonce' })
  isDefault: boolean;
}

export class AdVariantValueResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  variantId: string;

  @ApiProperty()
  value: string;

  @ApiPropertyOptional()
  variant?: {
    id: string;
    name: Record<string, string>;
    type: string;
    options: unknown;
    unit: string | null;
  };
}

// Réponse pour les listes (sans description pour alléger l'API)
export class AdListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ description: 'Prix en FCFA (null = prix sur devis/variable)' })
  price: number | null;

  @ApiPropertyOptional({ description: 'Prix réduit pour promotions/Flash Deals' })
  discountedPrice?: number | null;

  @ApiPropertyOptional({ description: 'Quantité disponible (null = pas de stock)' })
  quantity: number | null;

  @ApiProperty({ enum: AdType })
  type: AdType;

  @ApiProperty({ enum: AdStatus })
  status: AdStatus;

  @ApiProperty({ description: 'Ville (location masquée)' })
  city: string;

  @ApiProperty()
  viewCount: number;

  @ApiPropertyOptional({ description: 'Raison du refus ou de la demande de modification' })
  rejectionReason?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: AdCategoryDto })
  category: AdCategoryDto;

  @ApiPropertyOptional({ type: AdSubCategoryDto })
  subCategory?: AdSubCategoryDto | null;

  @ApiPropertyOptional({ type: [AdFileDto] })
  files?: AdFileDto[];

  // Infos vendeur limitées (pour les listes)
  @ApiPropertyOptional()
  seller?: {
    firstName: string;
    lastName: string;
  };
}

// Réponse publique détaillée (avec description, sans location exacte)
export class AdPublicResponseDto extends AdListItemDto {
  @ApiProperty({ description: 'Description JSON (TiptapEditor format)' })
  description: unknown;

  @ApiPropertyOptional({ type: [AdVariantValueResponseDto] })
  variantValues?: AdVariantValueResponseDto[];
}

// Réponse complète (avec location - pour owner, operator, admin)
export class AdFullResponseDto extends AdPublicResponseDto {
  @ApiProperty({ description: 'Adresse complète (confidentielle)' })
  location: string;

  @ApiPropertyOptional()
  latitude: number | null;

  @ApiPropertyOptional()
  longitude: number | null;

  @ApiPropertyOptional()
  validatedAt: Date | null;

  @ApiPropertyOptional()
  validatedById: string | null;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  categoryId: string;

  @ApiPropertyOptional()
  subCategoryId: string | null;

  @ApiPropertyOptional({ type: AdSellerDto })
  user?: AdSellerDto;
}

export class AdsListResponseDto {
  @ApiProperty({ type: [AdListItemDto] })
  data: AdListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
