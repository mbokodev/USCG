import { IsString, IsOptional, IsNumber, IsBoolean, IsObject, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFaqDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Question (single language)' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ description: 'Answer in TipTap format (single language)' })
  @IsOptional()
  @IsObject()
  answer?: any; // TiptapContent

  @ApiPropertyOptional({ description: 'Display order within category' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Source language for translation', enum: ['fr', 'en'] })
  @IsOptional()
  @IsIn(['fr', 'en'])
  sourceLang?: 'fr' | 'en';
}
