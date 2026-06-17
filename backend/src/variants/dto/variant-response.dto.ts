import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VariantType } from '@prisma/client';

// I18n type for bilingual fields
export interface I18nText {
  fr: string;
  en: string;
}

export class VariantResponseDto {
  @ApiProperty({ example: 'clxxx123' })
  id: string;

  @ApiPropertyOptional({ example: 'clxxx456' })
  categoryId: string | null;

  @ApiPropertyOptional({ example: 'clxxx789' })
  subCategoryId: string | null;

  @ApiProperty({ example: { fr: 'Couleur', en: 'Color' } })
  name: Record<string, string>;

  @ApiPropertyOptional({ example: { fr: 'Couleur du produit', en: 'Product color' } })
  description: Record<string, string> | null;

  @ApiProperty({ enum: VariantType, example: 'SELECT' })
  type: VariantType;

  @ApiProperty({
    example: [
      { value: 'noir', label: { fr: 'Noir', en: 'Black' }, hex: '#000000' },
    ],
  })
  options: unknown;

  @ApiPropertyOptional({ example: 'm²' })
  unit: string | null;

  @ApiProperty({ example: false })
  allowCustomValue: boolean;

  @ApiProperty({ example: false })
  isRequired: boolean;

  @ApiProperty({ example: true })
  isFilterable: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0 })
  displayOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Informations de la catégorie',
  })
  category?: {
    id: string;
    name: I18nText;
    slug: string;
  };

  @ApiPropertyOptional({
    description: 'Informations de la sous-catégorie',
  })
  subCategory?: {
    id: string;
    name: I18nText;
    slug: string;
  };
}

export class VariantsListResponseDto {
  @ApiProperty({ type: [VariantResponseDto] })
  data: VariantResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
