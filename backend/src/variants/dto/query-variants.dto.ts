import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { VariantType } from '@prisma/client';

export class QueryVariantsDto {
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
    description: "Nombre d'éléments par page",
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
    description: 'Filtrer par catégorie',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par sous-catégorie',
  })
  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par type de variante',
    enum: VariantType,
  })
  @IsOptional()
  @IsEnum(VariantType)
  type?: VariantType;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer par variantes filtrables',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({
    description: 'Recherche par nom',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
