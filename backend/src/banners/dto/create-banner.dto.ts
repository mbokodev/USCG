import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({
    description: 'Titre du banner',
    example: 'Bienvenue sur USCG Marketplace',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Description du banner',
    example: 'Trouvez les meilleures annonces au Congo',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'URL de l\'image du banner',
    example: '/assets/images/banners/hero-1.jpg',
  })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Texte du bouton',
    example: 'Parcourir les annonces',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  buttonText?: string;

  @ApiPropertyOptional({
    description: 'Lien du bouton',
    example: '/ads',
  })
  @IsOptional()
  @IsString()
  buttonLink?: string;

  @ApiPropertyOptional({
    description: 'Banner actif ou non',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Ordre d\'affichage',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
