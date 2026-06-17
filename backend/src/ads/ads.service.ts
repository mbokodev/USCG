import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AdStatus, Role, Prisma } from '@prisma/client';
import {
  CreateAdDto,
  UpdateAdDto,
  ValidateAdDto,
  QueryAdsDto,
  AdPublicResponseDto,
  AdFullResponseDto,
  AdsListResponseDto,
} from './dto';
import { AdMapper } from './mappers';
import { toPaginatedResult } from '../common/mappers';
import { FilesService } from '../files/files.service';
import { getPaginationParams } from '../common/utils/query.utils';
import { checkOwnership, isAdminRole, canAccessResource } from '../common/utils/authorization.utils';

// Include pour les relations
const adInclude = {
  category: { select: { id: true, name: true, slug: true } },
  subCategory: { select: { id: true, name: true, slug: true } },
  files: {
    select: { id: true, filename: true, originalName: true, mimeType: true, path: true, type: true, isDefault: true },
    orderBy: [{ isDefault: 'desc' as const }, { createdAt: 'asc' as const }],
  },
  variantValues: {
    include: {
      variant: true,
    },
  },
  user: { select: { id: true, firstName: true, lastName: true, phone: true } },
};

@Injectable()
export class AdsService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  /**
   * Créer une annonce (SELLER uniquement)
   */
  async create(userId: string, dto: CreateAdDto): Promise<AdFullResponseDto> {
    // Vérifier que la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    // Vérifier la sous-catégorie si fournie
    if (dto.subCategoryId) {
      const subCategory = await this.prisma.subCategory.findUnique({
        where: { id: dto.subCategoryId },
      });
      if (!subCategory || subCategory.categoryId !== dto.categoryId) {
        throw new BadRequestException('Sous-catégorie invalide pour cette catégorie');
      }
    }

    // Créer l'annonce avec les variantes
    const ad = await this.prisma.ad.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price ?? null,
        discountedPrice: dto.discountedPrice ?? null,
        quantity: dto.quantity,
        type: dto.type,
        categoryId: dto.categoryId,
        subCategoryId: dto.subCategoryId,
        userId,
        location: dto.location,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: AdStatus.PENDING,
        // Créer les valeurs de variantes
        variantValues: dto.variantValues?.length
          ? {
              create: dto.variantValues.map((v) => ({
                variantId: v.variantId,
                value: v.value,
              })),
            }
          : undefined,
      },
      include: adInclude,
    });

    return AdMapper.toFull(ad as any);
  }

  /**
   * Liste publique des annonces (approved uniquement, sans location)
   */
  async findAllPublic(query: QueryAdsDto): Promise<AdsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const {
      categoryId,
      subCategoryId,
      type,
      city,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.AdWhereInput = {
      status: AdStatus.APPROVED,
    };

    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      // Search only on title (description is now JSON, cannot use contains)
      where.title = { contains: search, mode: 'insensitive' };
    }

    const orderBy: Prisma.AdOrderByWithRelationInput = {};
    if (sortBy === 'price') orderBy.price = sortOrder;
    else if (sortBy === 'viewCount') orderBy.viewCount = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: adInclude,
      }),
      this.prisma.ad.count({ where }),
    ]);

    return toPaginatedResult(AdMapper.toList(ads), total, page, limit);
  }

  /**
   * Détail d'une annonce publique (approved, sans location)
   */
  async findOnePublic(id: string): Promise<AdPublicResponseDto> {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: adInclude,
    });

    if (!ad || ad.status !== AdStatus.APPROVED) {
      throw new NotFoundException('Annonce non trouvée');
    }

    // Incrémenter le compteur de vues
    await this.prisma.ad.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return AdMapper.toPublic(ad);
  }

  /**
   * Mes annonces (SELLER)
   */
  async findMyAds(userId: string, query: QueryAdsDto): Promise<AdsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: Prisma.AdWhereInput = { userId };
    if (status) where.status = status;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const orderBy: Prisma.AdOrderByWithRelationInput = {};
    if (sortBy === 'price') orderBy.price = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: adInclude,
      }),
      this.prisma.ad.count({ where }),
    ]);

    return toPaginatedResult(AdMapper.toList(ads), total, page, limit);
  }

  /**
   * Détail d'une annonce (avec location si autorisé)
   */
  async findOne(
    id: string,
    userId?: string,
    userRole?: Role,
  ): Promise<AdFullResponseDto> {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: adInclude,
    });

    if (!ad) {
      throw new NotFoundException('Annonce non trouvée');
    }

    // Vérifier les droits d'accès - doit être owner, admin, ou annonce approuvée
    const hasAccess = userId && userRole
      ? canAccessResource(ad.userId, userId, userRole)
      : false;

    if (!hasAccess && ad.status !== AdStatus.APPROVED) {
      throw new NotFoundException('Annonce non trouvée');
    }

    return AdMapper.toFull(ad);
  }

  /**
   * Annonces en attente (OPERATOR/SUPER_ADMIN)
   */
  async findPending(query: QueryAdsDto): Promise<AdsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const { categoryId, sortOrder = 'asc' } = query;

    const where: Prisma.AdWhereInput = { status: AdStatus.PENDING };
    if (categoryId) where.categoryId = categoryId;

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: adInclude,
      }),
      this.prisma.ad.count({ where }),
    ]);

    return toPaginatedResult(AdMapper.toList(ads), total, page, limit);
  }

  /**
   * TOUTES les annonces (SUPER_ADMIN uniquement)
   * Permet de filtrer par status, catégorie, recherche
   */
  async findAll(query: QueryAdsDto): Promise<AdsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const {
      status,
      categoryId,
      subCategoryId,
      type,
      city,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.AdWhereInput = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    if (search) {
      // Search only on title (description is now JSON, cannot use contains)
      where.title = { contains: search, mode: 'insensitive' };
    }

    const orderBy: Prisma.AdOrderByWithRelationInput = {};
    if (sortBy === 'price') orderBy.price = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: adInclude,
      }),
      this.prisma.ad.count({ where }),
    ]);

    return toPaginatedResult(AdMapper.toList(ads), total, page, limit);
  }

  /**
   * Modifier une annonce (SELLER owner)
   */
  async update(id: string, userId: string, dto: UpdateAdDto): Promise<AdFullResponseDto> {
    const ad = await this.prisma.ad.findUnique({ where: { id } });

    if (!ad) {
      throw new NotFoundException('Annonce non trouvée');
    }

    // Seul le propriétaire peut modifier (pas les admins via cette méthode)
    if (ad.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres annonces');
    }

    // Vérifier la sous-catégorie si fournie
    if (dto.subCategoryId) {
      const subCategory = await this.prisma.subCategory.findUnique({
        where: { id: dto.subCategoryId },
      });
      if (!subCategory || subCategory.categoryId !== ad.categoryId) {
        throw new BadRequestException('Sous-catégorie invalide pour cette catégorie');
      }
    }

    // Si l'annonce était rejetée, la remettre en pending après modification
    const newStatus =
      ad.status === AdStatus.REJECTED || ad.status === AdStatus.MODIFICATION_REQUESTED
        ? AdStatus.PENDING
        : ad.status;

    // Mettre à jour les variantes si fournies
    if (dto.variantValues !== undefined) {
      // Supprimer les anciennes valeurs
      await this.prisma.adVariantValue.deleteMany({ where: { adId: id } });

      // Créer les nouvelles valeurs
      if (dto.variantValues.length > 0) {
        await this.prisma.adVariantValue.createMany({
          data: dto.variantValues.map((v) => ({
            adId: id,
            variantId: v.variantId,
            value: v.value,
          })),
        });
      }
    }

    // Build update data object
    const updateData: Prisma.AdUpdateInput = {
      status: newStatus,
      rejectionReason: newStatus === AdStatus.PENDING ? null : ad.rejectionReason,
    };
    if (dto.title) updateData.title = dto.title;
    if (dto.description) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.discountedPrice !== undefined) updateData.discountedPrice = dto.discountedPrice;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.type) updateData.type = dto.type;
    if (dto.subCategoryId !== undefined) updateData.subCategory = dto.subCategoryId ? { connect: { id: dto.subCategoryId } } : { disconnect: true };
    if (dto.location) updateData.location = dto.location;
    if (dto.city) updateData.city = dto.city;
    if (dto.latitude !== undefined) updateData.latitude = dto.latitude;
    if (dto.longitude !== undefined) updateData.longitude = dto.longitude;

    const updatedAd = await this.prisma.ad.update({
      where: { id },
      data: updateData,
      include: adInclude,
    });

    return AdMapper.toFull(updatedAd);
  }

  /**
   * Supprimer une annonce (SELLER owner ou OPERATOR/SUPER_ADMIN)
   */
  async remove(id: string, userId: string, userRole: Role): Promise<{ message: string }> {
    const ad = await this.prisma.ad.findUnique({ where: { id } });

    if (!ad) {
      throw new NotFoundException('Annonce non trouvée');
    }

    // Vérifier ownership (lance ForbiddenException si non autorisé)
    checkOwnership(
      ad.userId,
      userId,
      userRole,
      'Vous ne pouvez supprimer que vos propres annonces',
    );

    // Supprimer les fichiers physiques ET en base de données
    await this.filesService.removeByAdId(id);

    // Supprimer l'annonce (les variantes seront supprimées en cascade)
    await this.prisma.ad.delete({ where: { id } });

    return { message: 'Annonce supprimée avec succès' };
  }

  /**
   * Valider/Refuser une annonce (OPERATOR/SUPER_ADMIN)
   */
  async validate(
    id: string,
    validatorId: string,
    dto: ValidateAdDto,
  ): Promise<AdFullResponseDto> {
    const ad = await this.prisma.ad.findUnique({ where: { id } });

    if (!ad) {
      throw new NotFoundException('Annonce non trouvée');
    }

    // Vérifier qu'une raison est fournie si refusé
    if (
      (dto.status === AdStatus.REJECTED || dto.status === AdStatus.MODIFICATION_REQUESTED) &&
      !dto.rejectionReason
    ) {
      throw new BadRequestException('Une raison est requise pour le refus ou la demande de modification');
    }

    const updatedAd = await this.prisma.ad.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason || null,
        validatedAt: new Date(),
        validatedById: validatorId,
      },
      include: adInclude,
    });

    return AdMapper.toFull(updatedAd);
  }

  /**
   * Statistiques des annonces (pour dashboard seller)
   */
  async getStats(userId?: string) {
    const where: Prisma.AdWhereInput = userId ? { userId } : {};

    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.ad.count({ where }),
      this.prisma.ad.count({ where: { ...where, status: AdStatus.PENDING } }),
      this.prisma.ad.count({ where: { ...where, status: AdStatus.APPROVED } }),
      this.prisma.ad.count({ where: { ...where, status: AdStatus.REJECTED } }),
    ]);

    return { total, pending, approved, rejected };
  }

  /**
   * Statistiques dashboard pour OPERATOR/ADMIN
   */
  async getAdminStats() {
    const [
      totalAds,
      pendingAds,
      approvedAds,
      rejectedAds,
      totalBuyers,
      totalSellers,
      pendingSellerRequests,
      totalOperators,
      totalCategories,
    ] = await Promise.all([
      this.prisma.ad.count(),
      this.prisma.ad.count({ where: { status: AdStatus.PENDING } }),
      this.prisma.ad.count({ where: { status: AdStatus.APPROVED } }),
      this.prisma.ad.count({ where: { status: AdStatus.REJECTED } }),
      this.prisma.user.count({ where: { role: 'BUYER', isSeller: false } }),
      this.prisma.user.count({ where: { role: 'BUYER', isSeller: true } }),
      this.prisma.sellerRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { role: 'OPERATOR' } }),
      this.prisma.category.count(),
    ]);

    return {
      totalAds,
      pendingAds,
      approvedAds,
      rejectedAds,
      totalBuyers,
      totalSellers,
      pendingSellerRequests,
      totalOperators,
      totalCategories,
    };
  }
}
