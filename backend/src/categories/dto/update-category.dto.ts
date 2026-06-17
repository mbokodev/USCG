import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsObject,
  Min,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Classe pour les textes i18n (mise à jour directe sans traduction auto)
export class I18nTextDto {
  @ApiPropertyOptional({ example: 'Immobilier' })
  @IsOptional()
  @IsString()
  fr?: string;

  @ApiPropertyOptional({ example: 'Real Estate' })
  @IsOptional()
  @IsString()
  en?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Nom de la catégorie (bilingue)',
    type: I18nTextDto,
    example: { fr: 'Immobilier', en: 'Real Estate' },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => I18nTextDto)
  name?: I18nTextDto;

  @ApiPropertyOptional({
    description: 'Slug unique pour les URLs (lettres minuscules, chiffres et tirets)',
    example: 'immobilier',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Description de la catégorie (bilingue)',
    type: I18nTextDto,
    example: { fr: 'Annonces immobilières', en: 'Real estate ads' },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => I18nTextDto)
  description?: I18nTextDto;

  @ApiPropertyOptional({
    description: "Nom de l'icône ou URL",
    example: 'home',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon?: string;

  @ApiPropertyOptional({
    description: "Ordre d'affichage",
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Catégorie active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
