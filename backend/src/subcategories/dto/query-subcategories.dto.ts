import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsInt, Min, Max, IsString, IsIn } from 'class-validator';

export class QuerySubCategoriesDto {
  @ApiPropertyOptional({
    description: 'Numéro de page',
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrer par catégorie parente',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Recherche par nom',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Inclure les informations de la catégorie parente',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeCategory?: boolean = false;

  @ApiPropertyOptional({
    description: 'Langue pour filtrer les réponses (retourne texte simple au lieu de i18n)',
    enum: ['fr', 'en'],
  })
  @IsOptional()
  @IsIn(['fr', 'en'])
  lang?: 'fr' | 'en';
}
