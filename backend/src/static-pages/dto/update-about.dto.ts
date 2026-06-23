import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsArray, IsOptional, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class TiptapContentDto {
  @ApiProperty({ example: 'doc' })
  type: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  content?: unknown[];
}

class AboutValueDto {
  @ApiProperty({ description: 'Nom de l\'icône Lucide', example: 'Shield' })
  @IsString()
  icon: string;

  @ApiProperty({ description: 'Titre (langue source)', example: 'Confiance' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description (langue source)' })
  @IsString()
  description: string;
}

class AboutTeamMemberDto {
  @ApiProperty({ description: 'Nom du membre', example: 'Jean Dupont' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Rôle du membre', example: 'CEO' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ description: 'URL de la photo' })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}

export class UpdateAboutDto {
  @ApiPropertyOptional({
    description: 'Langue source pour la traduction automatique (CREATE seulement)',
    enum: ['fr', 'en'],
    default: 'fr',
  })
  @IsOptional()
  @IsEnum(['fr', 'en'])
  sourceLang?: 'fr' | 'en';

  @ApiPropertyOptional({
    description: 'Introduction (TipTap content)',
    type: TiptapContentDto,
  })
  @IsOptional()
  @IsObject()
  introduction?: TiptapContentDto;

  @ApiPropertyOptional({
    description: 'Mission (TipTap content)',
    type: TiptapContentDto,
  })
  @IsOptional()
  @IsObject()
  mission?: TiptapContentDto;

  @ApiPropertyOptional({
    description: 'Vision (TipTap content)',
    type: TiptapContentDto,
  })
  @IsOptional()
  @IsObject()
  vision?: TiptapContentDto;

  @ApiPropertyOptional({
    description: 'Valeurs (titre et description en langue source, traduits automatiquement)',
    type: [AboutValueDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutValueDto)
  values?: AboutValueDto[];

  @ApiPropertyOptional({
    description: 'Membres de l\'équipe',
    type: [AboutTeamMemberDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutTeamMemberDto)
  team?: AboutTeamMemberDto[];
}
