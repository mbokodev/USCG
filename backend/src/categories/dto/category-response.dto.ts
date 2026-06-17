import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Type I18n pour les champs bilingues
export interface I18nText {
  fr: string;
  en: string;
}

export class SubCategoryResponseDto {
  @ApiProperty({ example: 'clxxx123' })
  id: string;

  @ApiProperty({
    example: { fr: 'Appartements', en: 'Apartments' },
    description: 'Nom bilingue',
  })
  name: I18nText;

  @ApiProperty({ example: 'appartements' })
  slug: string;

  @ApiPropertyOptional({
    example: { fr: 'Appartements à vendre ou à louer', en: 'Apartments for sale or rent' },
    nullable: true,
    description: 'Description bilingue',
  })
  description: I18nText | null;

  @ApiProperty({ example: 'clxxx456' })
  categoryId: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CategoryResponseDto {
  @ApiProperty({ example: 'clxxx123' })
  id: string;

  @ApiProperty({
    example: { fr: 'Immobilier', en: 'Real Estate' },
    description: 'Nom bilingue',
  })
  name: I18nText;

  @ApiProperty({ example: 'immobilier' })
  slug: string;

  @ApiPropertyOptional({
    example: { fr: 'Annonces immobilières', en: 'Real estate ads' },
    nullable: true,
    description: 'Description bilingue',
  })
  description: I18nText | null;

  @ApiPropertyOptional({ example: 'home', nullable: true })
  icon: string | null;

  @ApiProperty({ example: 1 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [SubCategoryResponseDto] })
  subCategories?: SubCategoryResponseDto[];

  @ApiPropertyOptional({ example: 5, description: 'Nombre de sous-catégories' })
  _count?: {
    subCategories?: number;
  };
}

export class CategoriesListResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
