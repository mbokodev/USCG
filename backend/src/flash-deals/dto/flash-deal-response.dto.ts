import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Category info for flash deal ad
export class FlashDealCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: { fr: 'Immobilier', en: 'Real Estate' } })
  name: Record<string, string>;

  @ApiProperty()
  slug: string;
}

// Ad info included in flash deal responses
export class FlashDealAdDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ description: 'Prix en FCFA (null = prix sur devis)' })
  price: number | null;

  @ApiProperty({ description: 'Prix réduit (non null pour flash deals)' })
  discountedPrice: number | null;

  @ApiPropertyOptional({ description: 'Image principale' })
  thumbnail: string | null;

  @ApiPropertyOptional()
  slug?: string;

  @ApiProperty()
  city: string;

  @ApiPropertyOptional({ type: FlashDealCategoryDto })
  category?: FlashDealCategoryDto;
}

// Full flash deal response
export class FlashDealResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  adId: string;

  @ApiProperty()
  startDate: Date;

  @ApiPropertyOptional()
  endDate: Date | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  order: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: FlashDealAdDto })
  ad: FlashDealAdDto;
}

// Flash deal list item (lighter version)
export class FlashDealListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  adId: string;

  @ApiProperty()
  startDate: Date;

  @ApiPropertyOptional()
  endDate: Date | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: FlashDealAdDto })
  ad: FlashDealAdDto;
}

// Paginated response
export class FlashDealsListResponseDto {
  @ApiProperty({ type: [FlashDealListItemDto] })
  data: FlashDealListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
