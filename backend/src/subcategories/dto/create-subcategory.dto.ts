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

export class CreateSubCategoryDto {
  @ApiProperty({
    description: 'Langue source du contenu',
    enum: ['fr', 'en'],
    example: 'fr',
  })
  @IsIn(['fr', 'en'])
  sourceLang: 'fr' | 'en';

  @ApiProperty({
    description: 'Nom de la sous-catégorie (sera traduit automatiquement)',
    example: 'Appartements',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name: string;

  @ApiProperty({
    description: 'Slug unique pour les URLs (lettres minuscules, chiffres et tirets)',
    example: 'appartements',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets',
  })
  slug: string;

  @ApiProperty({
    description: 'ID de la catégorie parente',
    example: 'clxxx123',
  })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Description de la sous-catégorie (sera traduite automatiquement)',
    example: 'Appartements à vendre ou à louer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

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
