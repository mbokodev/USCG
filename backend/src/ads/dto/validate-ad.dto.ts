import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AdStatus } from '@prisma/client';

export class ValidateAdDto {
  @ApiProperty({
    enum: [AdStatus.APPROVED, AdStatus.REJECTED, AdStatus.MODIFICATION_REQUESTED],
    description: 'Nouveau statut de validation',
    example: 'APPROVED',
  })
  @IsEnum([AdStatus.APPROVED, AdStatus.REJECTED, AdStatus.MODIFICATION_REQUESTED], {
    message: 'Le statut doit être APPROVED, REJECTED ou MODIFICATION_REQUESTED',
  })
  status: AdStatus;

  @ApiPropertyOptional({
    description: 'Raison du refus ou de la demande de modification',
    example: 'Les photos ne sont pas assez claires',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;
}
