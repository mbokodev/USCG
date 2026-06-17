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
  @ApiPropertyOptional({ example: 'Appartements' })
  @IsOptional()
  @IsString()
  fr?: string;

  @ApiPropertyOptional({ example: 'Apartments' })
  @IsOptional()
  @IsString()
  en?: string;
}

export class UpdateSubCategoryDto {
  @ApiPropertyOptional({
    description: 'Nom de la sous-catégorie (bilingue)',
    type: I18nTextDto,
    example: { fr: 'Appartements', en: 'Apartments' },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => I18nTextDto)
  name?: I18nTextDto;

  @ApiPropertyOptional({
    description: 'Slug unique pour les URLs (lettres minuscules, chiffres et tirets)',
    example: 'appartements',
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
    description: 'ID de la catégorie parente (pour déplacer vers une autre catégorie)',
    example: 'clxxx123',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Description de la sous-catégorie (bilingue)',
    type: I18nTextDto,
    example: { fr: 'Appartements à vendre ou à louer', en: 'Apartments for sale or rent' },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => I18nTextDto)
  description?: I18nTextDto;

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
    description: 'Sous-catégorie active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
