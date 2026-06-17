import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TranslationService, SourceLang } from '../translation';
import {
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
  QuerySubCategoriesDto,
  SubCategoryResponseDto,
  SubCategoriesListResponseDto,
} from './dto';
import { SubCategoryMapper } from './mappers';
import { toPaginatedResult } from '../common/mappers';

@Injectable()
export class SubCategoriesService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

  async create(dto: CreateSubCategoryDto): Promise<SubCategoryResponseDto> {
    const { sourceLang, name, description, ...rest } = dto;

    // Vérifier que la catégorie parente existe
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Catégorie parente non trouvée');
    }

    // Vérifier si le slug existe déjà dans cette catégorie
    const existingBySlug = await this.prisma.subCategory.findUnique({
      where: {
        categoryId_slug: {
          categoryId: dto.categoryId,
          slug: dto.slug,
        },
      },
    });

    if (existingBySlug) {
      throw new ConflictException(
        'Une sous-catégorie avec ce slug existe déjà dans cette catégorie',
      );
    }

    // Translate name and description
    const nameI18n = await this.translationService.createI18nText(
      name,
      sourceLang as SourceLang,
    );
    const descriptionI18n = description
      ? await this.translationService.createI18nText(description, sourceLang as SourceLang)
      : undefined;

    const subCategory = await this.prisma.subCategory.create({
      data: {
        name: nameI18n,
        slug: rest.slug,
        description: descriptionI18n,
        categoryId: rest.categoryId,
        sortOrder: rest.sortOrder ?? 0,
        isActive: rest.isActive ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    return SubCategoryMapper.toResponse(subCategory);
  }

  async findAll(query: QuerySubCategoriesDto): Promise<SubCategoriesListResponseDto> {
    const { page = 1, limit = 20, categoryId, isActive, search, includeCategory } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Search in JSON fields (fr and en)
    if (search) {
      where.OR = [
        { name: { path: ['fr'], string_contains: search } },
        { name: { path: ['en'], string_contains: search } },
        { description: { path: ['fr'], string_contains: search } },
        { description: { path: ['en'], string_contains: search } },
      ];
    }

    const [subCategories, total] = await Promise.all([
      this.prisma.subCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }],
        include: {
          category: includeCategory
            ? {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              }
            : false,
          _count: {
            select: {
              ads: true,
            },
          },
        },
      }),
      this.prisma.subCategory.count({ where }),
    ]);

    return toPaginatedResult(
      SubCategoryMapper.toResponseList(subCategories),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string, includeCategory = false): Promise<SubCategoryResponseDto> {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: includeCategory
          ? {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            }
          : false,
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    if (!subCategory) {
      throw new NotFoundException('Sous-catégorie non trouvée');
    }

    return SubCategoryMapper.toResponse(subCategory);
  }

  async findBySlug(
    categorySlug: string,
    subCategorySlug: string,
  ): Promise<SubCategoryResponseDto> {
    // D'abord trouver la catégorie
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    const subCategory = await this.prisma.subCategory.findUnique({
      where: {
        categoryId_slug: {
          categoryId: category.id,
          slug: subCategorySlug,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    if (!subCategory) {
      throw new NotFoundException('Sous-catégorie non trouvée');
    }

    return SubCategoryMapper.toResponse(subCategory);
  }

  async findByCategory(categoryId: string): Promise<SubCategoryResponseDto[]> {
    // Vérifier que la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    const subCategories = await this.prisma.subCategory.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }],
      include: {
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    return SubCategoryMapper.toResponseList(subCategories);
  }

  async update(id: string, dto: UpdateSubCategoryDto): Promise<SubCategoryResponseDto> {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id },
    });

    if (!subCategory) {
      throw new NotFoundException('Sous-catégorie non trouvée');
    }

    // Si on change de catégorie, vérifier qu'elle existe
    if (dto.categoryId && dto.categoryId !== subCategory.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Catégorie parente non trouvée');
      }
    }

    // Vérifier les conflits de slug dans la catégorie cible
    const targetCategoryId = dto.categoryId ?? subCategory.categoryId;
    const targetSlug = dto.slug ?? subCategory.slug;

    if (dto.slug || dto.categoryId) {
      const existingBySlug = await this.prisma.subCategory.findUnique({
        where: {
          categoryId_slug: {
            categoryId: targetCategoryId,
            slug: targetSlug,
          },
        },
      });

      if (existingBySlug && existingBySlug.id !== id) {
        throw new ConflictException(
          'Une sous-catégorie avec ce slug existe déjà dans cette catégorie',
        );
      }
    }

    // Build update data - no auto-translation on update (allows manual correction)
    const { name, description, ...rest } = dto;
    const updateData: Record<string, unknown> = { ...rest };

    if (name) {
      updateData.name = { fr: name.fr, en: name.en };
    }
    if (description) {
      updateData.description = { fr: description.fr, en: description.en };
    }

    const updatedSubCategory = await this.prisma.subCategory.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    return SubCategoryMapper.toResponse(updatedSubCategory);
  }

  async remove(id: string): Promise<{ message: string }> {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });

    if (!subCategory) {
      throw new NotFoundException('Sous-catégorie non trouvée');
    }

    // Empêcher la suppression si des annonces sont liées
    if (subCategory._count.ads > 0) {
      throw new BadRequestException(
        `Impossible de supprimer cette sous-catégorie car ${subCategory._count.ads} annonce(s) y sont liée(s)`,
      );
    }

    await this.prisma.subCategory.delete({
      where: { id },
    });

    return { message: 'Sous-catégorie supprimée avec succès' };
  }
}
