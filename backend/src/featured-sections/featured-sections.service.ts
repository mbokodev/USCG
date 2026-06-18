import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TranslationService, SourceLang } from '../translation';
import { AdStatus, FilterType, FileType, Prisma } from '@prisma/client';
import { CreateFeaturedSectionDto, UpdateFeaturedSectionDto } from './dto';
import { getPaginationParams } from '../common/utils/query.utils';

// Include pour les relations de section
const sectionInclude = {
  category: {
    select: { id: true, name: true, slug: true, icon: true },
  },
  subCategory: {
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
  variant: {
    select: { id: true, name: true, type: true, options: true },
  },
};

// Include pour les annonces
const adInclude = {
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
      path: true,
      isDefault: true,
    },
    where: { type: FileType.IMAGE },
    orderBy: [
      { isDefault: 'desc' as const },
      { createdAt: 'asc' as const },
    ],
  },
  user: {
    select: { id: true, firstName: true, lastName: true },
  },
};

@Injectable()
export class FeaturedSectionsService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

  /**
   * Créer une section (SUPER_ADMIN)
   */
  async create(dto: CreateFeaturedSectionDto) {
    const { sourceLang, title, ...rest } = dto;

    // Validation : categoryId ou subCategoryId, pas les deux
    if (rest.categoryId && rest.subCategoryId) {
      throw new BadRequestException(
        'Une section doit avoir soit une catégorie, soit une sous-catégorie, pas les deux',
      );
    }

    if (!rest.categoryId && !rest.subCategoryId) {
      throw new BadRequestException(
        'Une section doit avoir une catégorie ou une sous-catégorie',
      );
    }

    // Validation : SUBCATEGORY filter seulement si source = catégorie
    if (rest.filterType === FilterType.SUBCATEGORY && rest.subCategoryId) {
      throw new BadRequestException(
        'Le filtre SUBCATEGORY ne peut être utilisé que si la source est une catégorie',
      );
    }

    // Validation : variantId requis si filterType = VARIANT
    if (rest.filterType === FilterType.VARIANT && !rest.variantId) {
      throw new BadRequestException(
        'Un variantId est requis si filterType = VARIANT',
      );
    }

    // Vérifier que la catégorie/sous-catégorie existe
    if (rest.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: rest.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Catégorie non trouvée');
      }
    }

    if (rest.subCategoryId) {
      const subCategory = await this.prisma.subCategory.findUnique({
        where: { id: rest.subCategoryId },
      });
      if (!subCategory) {
        throw new NotFoundException('Sous-catégorie non trouvée');
      }
    }

    // Vérifier que la variante existe si spécifiée
    if (rest.variantId) {
      const variant = await this.prisma.variant.findUnique({
        where: { id: rest.variantId },
      });
      if (!variant) {
        throw new NotFoundException('Variante non trouvée');
      }
    }

    // Traduire le titre
    const titleI18n = await this.translationService.createI18nText(
      title,
      sourceLang as SourceLang,
    );

    const section = await this.prisma.featuredSection.create({
      data: {
        title: titleI18n,
        categoryId: rest.categoryId,
        subCategoryId: rest.subCategoryId,
        filterType: rest.filterType || FilterType.NONE,
        variantId: rest.variantId,
        limit: rest.limit || 20,
        order: rest.order || 0,
        isActive: rest.isActive ?? true,
      },
      include: sectionInclude,
    });

    return section;
  }

  /**
   * Liste publique des sections actives (pour marketplace)
   */
  async findAllPublic() {
    const sections = await this.prisma.featuredSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: sectionInclude,
    });

    return sections;
  }

  /**
   * Liste admin de toutes les sections
   */
  async findAllAdmin(query: { page?: number; limit?: number }) {
    const { page, limit, skip } = getPaginationParams(query);

    const [sections, total] = await Promise.all([
      this.prisma.featuredSection.findMany({
        skip,
        take: limit,
        orderBy: { order: 'asc' },
        include: sectionInclude,
      }),
      this.prisma.featuredSection.count(),
    ]);

    return {
      data: sections,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Détail d'une section
   */
  async findOne(id: string) {
    const section = await this.prisma.featuredSection.findUnique({
      where: { id },
      include: sectionInclude,
    });

    if (!section) {
      throw new NotFoundException('Section non trouvée');
    }

    return section;
  }

  /**
   * Modifier une section (SUPER_ADMIN)
   */
  async update(id: string, dto: UpdateFeaturedSectionDto) {
    const section = await this.prisma.featuredSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Section non trouvée');
    }

    // Mêmes validations que create
    const newCategoryId = dto.categoryId ?? section.categoryId;
    const newSubCategoryId = dto.subCategoryId ?? section.subCategoryId;
    const newFilterType = dto.filterType ?? section.filterType;

    if (newCategoryId && newSubCategoryId) {
      throw new BadRequestException(
        'Une section doit avoir soit une catégorie, soit une sous-catégorie, pas les deux',
      );
    }

    if (newFilterType === FilterType.SUBCATEGORY && newSubCategoryId) {
      throw new BadRequestException(
        'Le filtre SUBCATEGORY ne peut être utilisé que si la source est une catégorie',
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (dto.title !== undefined) {
      updateData.title = { fr: dto.title.fr, en: dto.title.en };
    }
    if (dto.categoryId !== undefined) {
      updateData.categoryId = dto.categoryId;
    }
    if (dto.subCategoryId !== undefined) {
      updateData.subCategoryId = dto.subCategoryId;
    }
    if (dto.filterType !== undefined) {
      updateData.filterType = dto.filterType;
    }
    if (dto.variantId !== undefined) {
      updateData.variantId = dto.variantId;
    }
    if (dto.limit !== undefined) {
      updateData.limit = dto.limit;
    }
    if (dto.order !== undefined) {
      updateData.order = dto.order;
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    const updated = await this.prisma.featuredSection.update({
      where: { id },
      data: updateData,
      include: sectionInclude,
    });

    return updated;
  }

  /**
   * Supprimer une section (SUPER_ADMIN)
   */
  async remove(id: string) {
    const section = await this.prisma.featuredSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Section non trouvée');
    }

    await this.prisma.featuredSection.delete({ where: { id } });

    return { message: 'Section supprimée avec succès' };
  }

  /**
   * Obtenir les annonces d'une section avec les filtres
   */
  async getSectionAds(
    id: string,
    filterValue?: string,
  ): Promise<{
    section: any;
    filters: Array<{ value: string; label: string; count: number }>;
    ads: any[];
  }> {
    const section = await this.findOne(id);

    // Construire le where pour les annonces
    const where: Prisma.AdWhereInput = {
      status: AdStatus.APPROVED,
    };

    // Filtrer par catégorie ou sous-catégorie
    if (section.categoryId) {
      where.categoryId = section.categoryId;
    } else if (section.subCategoryId) {
      where.subCategoryId = section.subCategoryId;
    }

    // Appliquer le filtre si fourni
    if (filterValue) {
      switch (section.filterType) {
        case FilterType.CITY:
          where.city = filterValue;
          break;
        case FilterType.SUBCATEGORY:
          where.subCategoryId = filterValue;
          break;
        case FilterType.VARIANT:
          if (section.variantId) {
            where.variantValues = {
              some: {
                variantId: section.variantId,
                value: filterValue,
              },
            };
          }
          break;
      }
    }

    // Récupérer les annonces
    const ads = await this.prisma.ad.findMany({
      where,
      take: section.limit,
      orderBy: { createdAt: 'desc' },
      include: adInclude,
    });

    // Construire les filtres disponibles
    const filters = await this.buildFilters(section, where);

    return {
      section: {
        id: section.id,
        title: section.title,
        filterType: section.filterType,
        limit: section.limit,
        category: section.category,
        subCategory: section.subCategory,
        variant: section.variant,
      },
      filters,
      ads,
    };
  }

  /**
   * Construire la liste des filtres disponibles pour une section
   */
  private async buildFilters(
    section: any,
    baseWhere: Prisma.AdWhereInput,
  ): Promise<Array<{ value: string; label: string; count: number }>> {
    // Enlever le filtre actuel pour compter tous les éléments
    const whereWithoutFilter = { ...baseWhere };

    switch (section.filterType) {
      case FilterType.CITY:
        // Récupérer les villes distinctes avec count
        const cities = await this.prisma.ad.groupBy({
          by: ['city'],
          where: whereWithoutFilter,
          _count: { city: true },
          orderBy: { _count: { city: 'desc' } },
        });
        return cities
          .filter((c) => c.city)
          .map((c) => ({
            value: c.city!,
            label: c.city!,
            count: c._count.city,
          }));

      case FilterType.SUBCATEGORY:
        // Récupérer les sous-catégories de cette catégorie avec count
        if (!section.categoryId) return [];
        const subCategories = await this.prisma.subCategory.findMany({
          where: {
            categoryId: section.categoryId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                ads: {
                  where: { status: AdStatus.APPROVED },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        });
        return subCategories
          .filter((sc) => sc._count.ads > 0)
          .map((sc) => ({
            value: sc.id,
            label: (sc.name as any)?.fr || sc.id,
            count: sc._count.ads,
          }));

      case FilterType.VARIANT:
        // Récupérer les options de la variante avec count
        if (!section.variantId || !section.variant) return [];
        const options = section.variant.options as any[];
        if (!Array.isArray(options)) return [];

        // Compter les annonces pour chaque option
        const variantCounts = await this.prisma.adVariantValue.groupBy({
          by: ['value'],
          where: {
            variantId: section.variantId,
            ad: whereWithoutFilter,
          },
          _count: { value: true },
        });

        const countMap = new Map(
          variantCounts.map((vc) => [vc.value, vc._count.value]),
        );

        return options
          .filter((opt) => countMap.get(opt.value))
          .map((opt) => ({
            value: opt.value,
            label: opt.label?.fr || opt.value,
            count: countMap.get(opt.value) || 0,
          }));

      default:
        return [];
    }
  }

  /**
   * Obtenir toutes les sections avec leurs annonces (pour la homepage)
   */
  async getAllSectionsWithAds(): Promise<
    Array<{
      section: any;
      filters: Array<{ value: string; label: string; count: number }>;
      ads: any[];
    }>
  > {
    const sections = await this.findAllPublic();

    const results = await Promise.all(
      sections.map((section) => this.getSectionAds(section.id)),
    );

    return results;
  }
}
