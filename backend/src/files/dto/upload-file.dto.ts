import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'ID de l\'annonce à laquelle associer le fichier',
    example: 'clxxx...',
  })
  @IsOptional()
  @IsString()
  adId?: string;
}

export class LinkFileToAdDto {
  @ApiProperty({
    description: 'ID de l\'annonce à laquelle associer le fichier',
    example: 'clxxx...',
  })
  @IsString()
  adId: string;
}
