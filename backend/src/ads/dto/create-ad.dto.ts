import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  Min,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdType, Prisma } from '@prisma/client';

// DTO pour les valeurs de variantes
export class AdVariantValueDto {
  @ApiProperty({ description: 'ID de la variante' })
  @IsString()
  variantId: string;

  @ApiProperty({
    description: 'Valeur sélectionnée',
    example: 'noir',
  })
  @IsString()
  value: string;
}

export class CreateAdDto {
  @ApiProperty({
    description: "Titre de l'annonce",
    example: 'Belle maison à Kinshasa',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @MinLength(10, { message: 'Le titre doit contenir au moins 10 caractères' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  title: string;

  @ApiProperty({
    description: "Description détaillée de l'annonce (TiptapEditor JSON)",
    example: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Description...' }] }] },
  })
  @IsObject({ message: 'La description doit être un objet JSON valide' })
  @IsNotEmpty({ message: 'La description est requise' })
  description: Prisma.InputJsonValue;

  @ApiPropertyOptional({
    description: 'Prix en FCFA (Franc CFA). Null = prix sur devis/variable',
    example: 50000000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Le prix doit être positif' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Prix réduit en FCFA (pour les promotions/Flash Deals)',
    example: 45000000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Le prix réduit doit être positif' })
  discountedPrice?: number;

  @ApiPropertyOptional({
    description: 'Quantité disponible (null = pas de notion de stock, ex: immobilier)',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantity?: number;

  @ApiProperty({
    enum: AdType,
    example: 'SALE',
    description: "Type d'annonce: SALE (vente) ou RENT (location)",
  })
  @IsEnum(AdType)
  type: AdType;

  @ApiProperty({
    description: 'ID de la catégorie',
  })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'ID de la sous-catégorie',
  })
  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @ApiProperty({
    description: 'Adresse complète (confidentielle)',
    example: '123 Avenue de la Paix, Gombe, Kinshasa',
  })
  @IsString()
  @MinLength(10)
  location: string;

  @ApiProperty({
    description: 'Ville (visible publiquement)',
    example: 'Kinshasa',
  })
  @IsString()
  @MinLength(2)
  city: string;

  @ApiPropertyOptional({
    description: 'Latitude GPS',
    example: -4.3276,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude GPS',
    example: 15.3136,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Valeurs des variantes',
    type: [AdVariantValueDto],
    example: [
      { variantId: 'xxx', value: '3' },
      { variantId: 'yyy', value: 'noir' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdVariantValueDto)
  variantValues?: AdVariantValueDto[];
}
