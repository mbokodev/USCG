import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'ID de l\'annonce à laquelle associer le fichier',
    example: 'clxxx...',
  })
  @IsOptional()
  @IsString()
  adId?: string;

  @ApiPropertyOptional({
    description: 'Définir comme image principale de l\'annonce',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isDefault?: boolean;
}

export class LinkFileToAdDto {
  @ApiProperty({
    description: 'ID de l\'annonce à laquelle associer le fichier',
    example: 'clxxx...',
  })
  @IsString()
  adId: string;
}
