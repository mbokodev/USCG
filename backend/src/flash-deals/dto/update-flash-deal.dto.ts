import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsBoolean, IsNumber, Min } from 'class-validator';

export class UpdateFlashDealDto {
  @ApiPropertyOptional({
    description: 'Date de début',
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
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Ordre d'affichage",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
