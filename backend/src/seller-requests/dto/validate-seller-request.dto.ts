import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, ValidateIf } from 'class-validator';
import { RequestStatus } from '@prisma/client';

// Statuts valides pour la validation (exclut PENDING)
const VALIDATION_STATUSES = [
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
] as const;
type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

export class ValidateSellerRequestDto {
  @ApiProperty({
    enum: VALIDATION_STATUSES,
    description: 'Nouveau statut de la demande',
    example: RequestStatus.APPROVED,
  })
  @IsEnum(VALIDATION_STATUSES, {
    message: 'Le statut doit être APPROVED ou REJECTED',
  })
  status: ValidationStatus;

  @ApiPropertyOptional({
    description: 'Raison du refus (obligatoire si REJECTED)',
    example: 'Documents incomplets',
  })
  @ValidateIf((o) => o.status === RequestStatus.REJECTED)
  @IsString()
  rejectionReason?: string;
}
