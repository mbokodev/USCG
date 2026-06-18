import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FilterType } from '@prisma/client';

export class CreateFeaturedSectionDto {
  @ApiProperty({
    description: 'Langue source du contenu',
    enum: ['fr', 'en'],
    example: 'fr',
  })
  @IsIn(['fr', 'en'])
  sourceLang: 'fr' | 'en';

  @ApiProperty({
    description: 'Titre de la section (sera traduit automatiquement)',
    example: 'Terrains à vendre',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @MinLength(2, { message: 'Le titre doit contenir au moins 2 caractères' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  title: string;

  @ApiPropertyOptional({
    description: 'ID de la catégorie source (exclusif avec subCategoryId)',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.subCategoryId)
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'ID de la sous-catégorie source (exclusif avec categoryId)',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.categoryId)
  subCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Type de filtre pour la sidebar',
    enum: FilterType,
    default: FilterType.NONE,
  })
  @IsOptional()
  @IsEnum(FilterType)
  filterType?: FilterType;

  @ApiPropertyOptional({
    description: 'ID de la variante (si filterType = VARIANT)',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    description: "Nombre d'annonces à afficher",
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: "Ordre d'affichage",
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    description: 'Section active ou non',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
