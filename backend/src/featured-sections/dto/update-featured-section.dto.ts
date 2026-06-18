import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FilterType } from '@prisma/client';

// Classe pour les textes i18n (mise à jour directe sans traduction auto)
class I18nTextDto {
  @ApiPropertyOptional({ example: 'Terrains à vendre' })
  @IsOptional()
  @IsString()
  fr?: string;

  @ApiPropertyOptional({ example: 'Land for sale' })
  @IsOptional()
  @IsString()
  en?: string;
}

export class UpdateFeaturedSectionDto {
  @ApiPropertyOptional({
    description: 'Titre de la section (bilingue)',
    type: I18nTextDto,
    example: { fr: 'Terrains à vendre', en: 'Land for sale' },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => I18nTextDto)
  title?: I18nTextDto;

  @ApiPropertyOptional({
    description: 'ID de la catégorie source (exclusif avec subCategoryId)',
  })
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiPropertyOptional({
    description: 'ID de la sous-catégorie source (exclusif avec categoryId)',
  })
  @IsOptional()
  @IsString()
  subCategoryId?: string | null;

  @ApiPropertyOptional({
    description: 'Type de filtre pour la sidebar',
    enum: FilterType,
  })
  @IsOptional()
  @IsEnum(FilterType)
  filterType?: FilterType;

  @ApiPropertyOptional({
    description: 'ID de la variante (si filterType = VARIANT)',
  })
  @IsOptional()
  @IsString()
  variantId?: string | null;

  @ApiPropertyOptional({
    description: "Nombre d'annonces à afficher",
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
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    description: 'Section active ou non',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
