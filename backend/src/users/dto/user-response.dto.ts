import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'cuid123456789' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Jean' })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  lastName: string;

  @ApiPropertyOptional({ example: '+243 123 456 789' })
  phone: string | null;

  @ApiProperty({ enum: Role, example: 'BUYER' })
  role: Role;

  @ApiProperty({ example: false })
  isSeller: boolean;

  @ApiPropertyOptional({ example: '2026-05-18T10:00:00.000Z' })
  termsAcceptedAt: Date | null;

  @ApiProperty({ example: 'fr' })
  preferredLanguage: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-05-18T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-18T10:00:00.000Z' })
  updatedAt: Date;
}

export class UserListItemDto {
  @ApiProperty({ example: 'cuid123456789' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Jean' })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  lastName: string;

  @ApiProperty({ enum: Role, example: 'BUYER' })
  role: Role;

  @ApiProperty({ example: false })
  isSeller: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-05-18T10:00:00.000Z' })
  createdAt: Date;
}

export class UsersListResponseDto {
  @ApiProperty({ type: [UserListItemDto] })
  data: UserListItemDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}