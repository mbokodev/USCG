import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsObject,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VariantType } from '@prisma/client';

// Type pour les labels multilingues
export class MultiLangText {
  @ApiProperty({ example: 'Couleur' })
  @IsString()
  fr: string;

  @ApiPropertyOptional({ example: 'Color' })
  @IsOptional()
  @IsString()
  en?: string;
}

// Type pour une option de variante
export class VariantOptionDto {
  @ApiProperty({ example: 'noir', description: 'Valeur technique (slug)' })
  @IsString()
  value: string;

  @ApiProperty({
    example: { fr: 'Noir', en: 'Black' },
    description: 'Label affiché multilingue',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangText)
  label: MultiLangText;

  @ApiPropertyOptional({
    example: '#000000',
    description: 'Code hex pour les couleurs',
  })
  @IsOptional()
  @IsString()
  hex?: string;
}

// Type pour les options NUMBER (validation range)
export class NumberOptionsDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  min?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsInt()
  max?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  step?: number;
}

export class CreateVariantDto {
  @ApiPropertyOptional({
    description: 'ID de la catégorie (si applicable à toute la catégorie)',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'ID de la sous-catégorie (si applicable à une sous-catégorie spécifique)',
  })
  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @ApiProperty({
    example: { fr: 'Couleur', en: 'Color' },
    description: 'Nom multilingue de la variante',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangText)
  name: MultiLangText;

  @ApiPropertyOptional({
    example: { fr: 'Couleur du produit', en: 'Product color' },
    description: 'Description multilingue',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangText)
  description?: MultiLangText;

  @ApiProperty({
    enum: VariantType,
    example: 'SELECT',
    description: 'Type de variante',
  })
  @IsEnum(VariantType)
  type: VariantType;

  @ApiPropertyOptional({
    type: [VariantOptionDto],
    description: 'Options pour SELECT, MULTI_SELECT, COLOR',
    example: [
      { value: 'noir', label: { fr: 'Noir', en: 'Black' }, hex: '#000000' },
      { value: 'blanc', label: { fr: 'Blanc', en: 'White' }, hex: '#FFFFFF' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantOptionDto)
  options?: VariantOptionDto[];

  @ApiPropertyOptional({
    example: 'm²',
    description: 'Unité de mesure pour NUMBER',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Permettre une valeur personnalisée hors options',
  })
  @IsOptional()
  @IsBoolean()
  allowCustomValue?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Champ obligatoire pour cette catégorie',
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Afficher dans les filtres de recherche',
  })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Variante active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    default: 0,
    description: "Ordre d'affichage",
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
