import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { MailService } from '../mail/mail.service';
import { RequestStatus, Prisma } from '@prisma/client';
import {
  CreateSellerRequestDto,
  ValidateSellerRequestDto,
  QuerySellerRequestsDto,
  SellerRequestResponseDto,
  SellerRequestsListResponseDto,
} from './dto';
import { SellerRequestMapper } from './mappers';
import { toPaginatedResult } from '../common/mappers';
import { getPaginationParams } from '../common/utils/query.utils';

// Include pour les relations
const sellerRequestInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  },
  businessLogo: {
    select: {
      id: true,
      url: true,
      path: true,
      originalName: true,
    },
  },
};

@Injectable()
export class SellerRequestsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Créer une demande vendeur (BUYER uniquement)
   */
  async create(
    userId: string,
    dto: CreateSellerRequestDto,
  ): Promise<SellerRequestResponseDto> {
    // Vérifier que l'utilisateur n'est pas déjà vendeur
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    if (user.isSeller) {
      throw new BadRequestException('Vous êtes déjà vendeur');
    }

    // Vérifier qu'il n'y a pas déjà une demande en cours
    const existingRequest = await this.prisma.sellerRequest.findUnique({
      where: { userId },
    });
    if (existingRequest) {
      if (existingRequest.status === RequestStatus.PENDING) {
        throw new ConflictException('Vous avez déjà une demande en cours');
      }
      if (existingRequest.status === RequestStatus.APPROVED) {
        throw new BadRequestException('Votre demande a déjà été approuvée');
      }
      // Si REJECTED, on permet de refaire une demande en mettant à jour l'existante
      const updatedRequest = await this.prisma.sellerRequest.update({
        where: { userId },
        data: {
          businessName: dto.businessName,
          businessAddress: dto.businessAddress,
          businessPhone: dto.businessPhone,
          taxId: dto.taxId,
          description: dto.description,
          businessLogoId: dto.businessLogoId || null,
          status: RequestStatus.PENDING,
          rejectionReason: null,
          validatedAt: null,
          validatedBy: null,
        },
        include: sellerRequestInclude,
      });
      return SellerRequestMapper.toResponse(updatedRequest);
    }

    // Créer la nouvelle demande
    const sellerRequest = await this.prisma.sellerRequest.create({
      data: {
        userId,
        businessName: dto.businessName,
        businessAddress: dto.businessAddress,
        businessPhone: dto.businessPhone,
        taxId: dto.taxId,
        description: dto.description,
        businessLogoId: dto.businessLogoId || null,
        status: RequestStatus.PENDING,
      },
      include: sellerRequestInclude,
    });

    return SellerRequestMapper.toResponse(sellerRequest);
  }

  /**
   * Ma demande vendeur (BUYER)
   */
  async findMyRequest(userId: string): Promise<SellerRequestResponseDto | null> {
    const request = await this.prisma.sellerRequest.findUnique({
      where: { userId },
      include: sellerRequestInclude,
    });

    return request ? SellerRequestMapper.toResponse(request) : null;
  }

  /**
   * Demande vendeur par userId (OPERATOR/SUPER_ADMIN)
   */
  async findByUserId(userId: string): Promise<SellerRequestResponseDto> {
    const request = await this.prisma.sellerRequest.findUnique({
      where: { userId },
      include: sellerRequestInclude,
    });

    if (!request) {
      throw new NotFoundException('Demande vendeur non trouvée pour cet utilisateur');
    }

    return SellerRequestMapper.toResponse(request);
  }

  /**
   * Liste toutes les demandes (OPERATOR/SUPER_ADMIN)
   */
  async findAll(query: QuerySellerRequestsDto): Promise<SellerRequestsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const { status, sortOrder = 'desc' } = query;

    const where: Prisma.SellerRequestWhereInput = {};
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      this.prisma.sellerRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: sellerRequestInclude,
      }),
      this.prisma.sellerRequest.count({ where }),
    ]);

    return toPaginatedResult(
      SellerRequestMapper.toResponseList(requests),
      total,
      page,
      limit,
    );
  }

  /**
   * Demandes en attente (OPERATOR/SUPER_ADMIN)
   */
  async findPending(query: QuerySellerRequestsDto): Promise<SellerRequestsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const { sortOrder = 'asc' } = query;

    const where: Prisma.SellerRequestWhereInput = { status: RequestStatus.PENDING };

    const [requests, total] = await Promise.all([
      this.prisma.sellerRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: sellerRequestInclude,
      }),
      this.prisma.sellerRequest.count({ where }),
    ]);

    return toPaginatedResult(
      SellerRequestMapper.toResponseList(requests),
      total,
      page,
      limit,
    );
  }

  /**
   * Détail d'une demande (OPERATOR/SUPER_ADMIN)
   */
  async findOne(id: string): Promise<SellerRequestResponseDto> {
    const request = await this.prisma.sellerRequest.findUnique({
      where: { id },
      include: sellerRequestInclude,
    });

    if (!request) {
      throw new NotFoundException('Demande non trouvée');
    }

    return SellerRequestMapper.toResponse(request);
  }

  /**
   * Valider/Refuser une demande (OPERATOR/SUPER_ADMIN)
   */
  async validate(
    id: string,
    validatorId: string,
    dto: ValidateSellerRequestDto,
  ): Promise<SellerRequestResponseDto> {
    const request = await this.prisma.sellerRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Demande non trouvée');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    // Vérifier qu'une raison est fournie si refusé
    if (dto.status === RequestStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('Une raison est requise pour le refus');
    }

    // Transaction pour mettre à jour la demande ET l'utilisateur si approuvé
    const result = await this.prisma.$transaction(async (tx) => {
      // Mettre à jour la demande
      const updatedRequest = await tx.sellerRequest.update({
        where: { id },
        data: {
          status: dto.status,
          rejectionReason: dto.rejectionReason || null,
          validatedAt: new Date(),
          validatedBy: validatorId,
        },
        include: sellerRequestInclude,
      });

      // Si approuvé, mettre à jour l'utilisateur
      if (dto.status === RequestStatus.APPROVED) {
        await tx.user.update({
          where: { id: request.userId },
          data: { isSeller: true },
        });
      }

      return updatedRequest;
    });

    // Envoyer l'email de notification (après la transaction)
    const user = result.user;
    if (user) {
      if (dto.status === RequestStatus.APPROVED) {
        await this.mailService.sendSellerApprovalEmail(
          user.email,
          user.firstName,
          result.businessName,
        );
      } else if (dto.status === RequestStatus.REJECTED && dto.rejectionReason) {
        await this.mailService.sendSellerRejectionEmail(
          user.email,
          user.firstName,
          result.businessName,
          dto.rejectionReason,
        );
      }
    }

    return SellerRequestMapper.toResponse(result);
  }

  /**
   * Statistiques des demandes
   */
  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.sellerRequest.count(),
      this.prisma.sellerRequest.count({ where: { status: RequestStatus.PENDING } }),
      this.prisma.sellerRequest.count({ where: { status: RequestStatus.APPROVED } }),
      this.prisma.sellerRequest.count({ where: { status: RequestStatus.REJECTED } }),
    ]);

    return { total, pending, approved, rejected };
  }
}
