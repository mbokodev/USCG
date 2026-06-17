import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';

export class BusinessLogoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  originalName: string;
}

export class SellerRequestUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  phone: string | null;
}

export class SellerRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  businessAddress: string;

  @ApiProperty()
  businessPhone: string;

  @ApiPropertyOptional()
  taxId: string | null;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  businessLogoId: string | null;

  @ApiPropertyOptional({ type: BusinessLogoDto })
  businessLogo?: BusinessLogoDto | null;

  @ApiProperty({ enum: RequestStatus })
  status: RequestStatus;

  @ApiPropertyOptional()
  rejectionReason: string | null;

  @ApiPropertyOptional()
  validatedAt: Date | null;

  @ApiPropertyOptional()
  validatedBy: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: SellerRequestUserDto })
  user?: SellerRequestUserDto;
}

export class SellerRequestsListResponseDto {
  @ApiProperty({ type: [SellerRequestResponseDto] })
  data: SellerRequestResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
