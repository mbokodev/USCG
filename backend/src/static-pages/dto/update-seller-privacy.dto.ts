import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsEnum } from 'class-validator';

class TiptapContentDto {
  @ApiProperty({ example: 'doc' })
  type: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  content?: unknown[];
}

export class UpdateSellerPrivacyDto {
  @ApiPropertyOptional({
    description: 'Langue source pour la traduction automatique (CREATE seulement)',
    enum: ['fr', 'en'],
    default: 'fr',
  })
  @IsOptional()
  @IsEnum(['fr', 'en'])
  sourceLang?: 'fr' | 'en';

  @ApiProperty({
    description: 'Contenu TipTap (langue source)',
    type: TiptapContentDto,
  })
  @IsObject()
  content: TiptapContentDto;
}
