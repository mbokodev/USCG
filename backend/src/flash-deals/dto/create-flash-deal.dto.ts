import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateFlashDealDto {
  @ApiProperty({
    description: "ID de l'annonce (doit avoir discountedPrice défini)",
    example: 'clxyz123abc',
  })
  @IsString()
  adId: string;

  @ApiPropertyOptional({
    description: 'Date de début (défaut: maintenant)',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin (null = pas de fin)',
    example: '2024-01-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({
    description: 'Flash deal actif',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Ordre d'affichage",
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
