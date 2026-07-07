import { IsString, IsOptional, IsNumber, IsEnum, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqCategoryDto {
  @ApiProperty({ description: 'Category name (single language, auto-translated)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'URL slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Source language for translation', enum: ['fr', 'en'] })
  @IsOptional()
  @IsIn(['fr', 'en'])
  sourceLang?: 'fr' | 'en';
}
