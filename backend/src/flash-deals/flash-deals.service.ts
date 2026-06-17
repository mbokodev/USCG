import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AdStatus, FileType, Prisma } from '@prisma/client';
import {
  CreateFlashDealDto,
  UpdateFlashDealDto,
  QueryFlashDealsDto,
  FlashDealResponseDto,
  FlashDealsListResponseDto,
} from './dto';
import { FlashDealMapper } from './mappers';
import { toPaginatedResult } from '../common/mappers';
import { AdMapper } from '../ads/mappers/ad.mapper';
import { getPaginationParams } from '../common/utils/query.utils';

// Include pour les relations
const flashDealInclude = {
  ad: {
    select: {
      id: true,
      title: true,
      price: true,
      discountedPrice: true,
      city: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
      files: {
        select: { id: true, path: true, isDefault: true },
        where: { type: FileType.IMAGE },
        orderBy: [{ isDefault: 'desc' as const }, { createdAt: 'asc' as const }],
        take: 1,
      },
    },
  },
};

@Injectable()
export class FlashDealsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un flash deal (SUPER_ADMIN)
   */
  async create(dto: CreateFlashDealDto): Promise<FlashDealResponseDto> {
    // Vérifier que l'annonce existe et est approuvée
    const ad = await this.prisma.ad.findUnique({
      where: { id: dto.adId },
    });

    if (!ad) {
      throw new NotFoundException('Annonce non trouvée');
    }

    if (ad.status !== AdStatus.APPROVED) {
      throw new BadRequestException('Seules les annonces approuvées peuvent devenir Flash Deals');
    }

    if (ad.discountedPrice === null) {
      throw new BadRequestException('L\'annonce doit avoir un prix réduit (discountedPrice) défini');
    }

    // Vérifier qu'il n'y a pas déjà un flash deal pour cette annonce
    const existingFlashDeal = await this.prisma.flashDeal.findUnique({
      where: { adId: dto.adId },
    });

    if (existingFlashDeal) {
      throw new ConflictException('Un Flash Deal existe déjà pour cette annonce');
    }

    // Créer le flash deal
    const flashDeal = await this.prisma.flashDeal.create({
      data: {
        adId: dto.adId,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      },
      include: flashDealInclude,
    });

    return FlashDealMapper.toResponse(flashDeal);
  }

  /**
   * Liste publique des flash deals (actifs et en cours)
   */
  async findAllPublic(query: QueryFlashDealsDto): Promise<FlashDealsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const now = new Date();

    const where: Prisma.FlashDealWhereInput = {
      isActive: true,
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
      // Seulement les annonces approuvées
      ad: {
        status: AdStatus.APPROVED,
        discountedPrice: { not: null },
      },
    };

    const [flashDeals, total] = await Promise.all([
      this.prisma.flashDeal.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: flashDealInclude,
      }),
      this.prisma.flashDeal.count({ where }),
    ]);

    return toPaginatedResult(FlashDealMapper.toList(flashDeals), total, page, limit);
  }

  /**
   * Liste admin des flash deals (toutes, avec filtres)
   */
  async findAllAdmin(query: QueryFlashDealsDto): Promise<FlashDealsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const { isActive, includeExpired = false } = query;
    const now = new Date();

    const where: Prisma.FlashDealWhereInput = {};

    // Filtre par statut actif
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Exclure les expirés par défaut
    if (!includeExpired) {
      where.OR = [
        { endDate: null },
        { endDate: { gte: now } },
      ];
    }

    const [flashDeals, total] = await Promise.all([
      this.prisma.flashDeal.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: flashDealInclude,
      }),
      this.prisma.flashDeal.count({ where }),
    ]);

    return toPaginatedResult(FlashDealMapper.toList(flashDeals), total, page, limit);
  }

  /**
   * Détail d'un flash deal
   */
  async findOne(id: string): Promise<FlashDealResponseDto> {
    const flashDeal = await this.prisma.flashDeal.findUnique({
      where: { id },
      include: flashDealInclude,
    });

    if (!flashDeal) {
      throw new NotFoundException('Flash Deal non trouvé');
    }

    return FlashDealMapper.toResponse(flashDeal);
  }

  /**
   * Modifier un flash deal (SUPER_ADMIN)
   */
  async update(id: string, dto: UpdateFlashDealDto): Promise<FlashDealResponseDto> {
    const flashDeal = await this.prisma.flashDeal.findUnique({
      where: { id },
    });

    if (!flashDeal) {
      throw new NotFoundException('Flash Deal non trouvé');
    }

    const updateData: Prisma.FlashDealUpdateInput = {};

    if (dto.startDate !== undefined) {
      updateData.startDate = new Date(dto.startDate);
    }
    if (dto.endDate !== undefined) {
      updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }
    if (dto.order !== undefined) {
      updateData.order = dto.order;
    }

    const updatedFlashDeal = await this.prisma.flashDeal.update({
      where: { id },
      data: updateData,
      include: flashDealInclude,
    });

    return FlashDealMapper.toResponse(updatedFlashDeal);
  }

  /**
   * Supprimer un flash deal (SUPER_ADMIN)
   */
  async remove(id: string): Promise<{ message: string }> {
    const flashDeal = await this.prisma.flashDeal.findUnique({
      where: { id },
    });

    if (!flashDeal) {
      throw new NotFoundException('Flash Deal non trouvé');
    }

    await this.prisma.flashDeal.delete({ where: { id } });

    return { message: 'Flash Deal supprimé avec succès' };
  }

  /**
   * Obtenir les annonces éligibles pour devenir Flash Deals
   * (approuvées, avec discountedPrice, sans flash deal existant)
   */
  async getEligibleAds(search?: string, limit = 20) {
    const where: Prisma.AdWhereInput = {
      status: AdStatus.APPROVED,
      discountedPrice: { not: null },
      flashDeal: null, // Pas de flash deal existant
    };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const ads = await this.prisma.ad.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subCategory: {
          select: { id: true, name: true, slug: true },
        },
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            path: true,
            type: true,
            isDefault: true,
          },
          where: { type: FileType.IMAGE },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        },
        user: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });

    return AdMapper.toList(ads);
  }
}
