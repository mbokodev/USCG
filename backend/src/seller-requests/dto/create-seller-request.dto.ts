import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, IsPhoneNumber } from 'class-validator';

export class CreateSellerRequestDto {
  @ApiProperty({
    description: 'Nom de l\'entreprise',
    example: 'Ma Boutique Congo',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3, { message: 'Le nom de l\'entreprise doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères' })
  businessName: string;

  @ApiProperty({
    description: 'Adresse de l\'entreprise',
    example: '123 Avenue de la Paix, Gombe, Kinshasa',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'L\'adresse doit contenir au moins 10 caractères' })
  businessAddress: string;

  @ApiProperty({
    description: 'Téléphone professionnel',
    example: '+243812345678',
  })
  @IsString()
  @MinLength(8, { message: 'Le numéro de téléphone est invalide' })
  businessPhone: string;

  @ApiPropertyOptional({
    description: 'Numéro fiscal (optionnel)',
    example: 'NIF-12345678',
  })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({
    description: 'Description de l\'activité',
    example: 'Vente de produits électroniques et appareils électroménagers importés...',
    minLength: 50,
  })
  @IsString()
  @MinLength(50, { message: 'La description doit contenir au moins 50 caractères' })
  description: string;

  @ApiPropertyOptional({
    description: 'ID du fichier logo (optionnel)',
    example: 'clxyz123...',
  })
  @IsOptional()
  @IsString()
  businessLogoId?: string;
}
