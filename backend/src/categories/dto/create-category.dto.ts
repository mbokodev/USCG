import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  Min,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Langue source du contenu',
    enum: ['fr', 'en'],
    example: 'fr',
  })
  @IsIn(['fr', 'en'])
  sourceLang: 'fr' | 'en';

  @ApiProperty({
    description: 'Nom de la catégorie (sera traduit automatiquement)',
    example: 'Immobilier',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name: string;

  @ApiProperty({
    description: 'Slug unique pour les URLs (lettres minuscules, chiffres et tirets)',
    example: 'immobilier',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Description de la catégorie (sera traduite automatiquement)',
    example: 'Annonces immobilières : maisons, appartements, terrains',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

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
