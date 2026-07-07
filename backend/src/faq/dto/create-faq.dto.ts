import { IsString, IsOptional, IsNumber, IsObject, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ description: 'Category ID' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Question (single language, auto-translated)' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Answer in TipTap format (single language, auto-translated)' })
  @IsObject()
  answer: any; // TiptapContent

  @ApiPropertyOptional({ description: 'Display order within category' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Source language for translation', enum: ['fr', 'en'] })
  @IsOptional()
  @IsIn(['fr', 'en'])
  sourceLang?: 'fr' | 'en';
}
