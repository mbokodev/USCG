import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateStaffDto {
  @ApiProperty({
    description: 'Adresse email unique',
    example: 'staff@uscg.com',
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    description: 'Mot de passe (minimum 8 caractères)',
    example: 'Staff@123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password: string;

  @ApiProperty({
    description: 'Prénom',
    example: 'Jean',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille',
    example: 'Dupont',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+243 123 456 789',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Rôle du membre du staff (OPERATOR ou ADMIN)',
    enum: ['OPERATOR', 'ADMIN'],
    example: 'OPERATOR',
  })
  @IsEnum(Role, { message: 'Rôle invalide' })
  @IsIn(['OPERATOR', 'ADMIN'], {
    message: 'Le rôle doit être OPERATOR ou ADMIN',
  })
  role: 'OPERATOR' | 'ADMIN';
}
