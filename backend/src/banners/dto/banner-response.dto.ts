import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BannerResponseDto {
  @ApiProperty({
    description: 'ID unique du banner',
    example: 'clxyz123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Titre du banner',
    example: 'Bienvenue sur USCG Marketplace',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Description du banner',
    example: 'Trouvez les meilleures annonces au Congo',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'URL de l\'image du banner',
    example: '/assets/images/banners/hero-1.jpg',
  })
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Texte du bouton',
    example: 'Parcourir les annonces',
    nullable: true,
  })
  buttonText: string | null;

  @ApiPropertyOptional({
    description: 'Lien du bouton',
    example: '/ads',
    nullable: true,
  })
  buttonLink: string | null;

  @ApiProperty({
    description: 'Banner actif ou non',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Ordre d\'affichage',
    example: 0,
  })
  order: number;

  @ApiProperty({
    description: 'Date de création',
    example: '2026-06-16T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2026-06-16T10:00:00.000Z',
  })
  updatedAt: Date;
}
