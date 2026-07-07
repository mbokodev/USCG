import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, ArrayMaxSize } from 'class-validator';

/**
 * Contact method enum
 */
export enum ContactMethod {
  PHONE = 'PHONE',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

/**
 * DTO for updating seller contact preferences
 */
export class UpdateContactPreferencesDto {
  @ApiProperty({
    description: 'Enabled contact methods',
    enum: ContactMethod,
    isArray: true,
    example: ['PHONE', 'WHATSAPP'],
  })
  @IsArray()
  @IsEnum(ContactMethod, { each: true })
  @ArrayMaxSize(10)
  enabledContactMethods: ContactMethod[];
}
