import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TranslationService, SourceLang } from '../translation';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoriesDto,
  CategoryResponseDto,
  CategoriesListResponseDto,
} from './dto';
import { CategoryMapper } from './mappers';
import { toPaginatedResult } from '../common/mappers';
import { getPaginationParams } from '../common/utils/query.utils';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const { sourceLang, name, description, ...rest } = dto;

    // Vérifier si le slug existe déjà
    const existingBySlug = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existingBySlug) {
      throw new ConflictException('Une catégorie avec ce slug existe déjà');
    }

    // Translate name and description
    const nameI18n = await this.translationService.createI18nText(
      name,
      sourceLang as SourceLang,
    );
    const descriptionI18n = description
      ? await this.translationService.createI18nText(description, sourceLang as SourceLang)
      : undefined;

    const category = await this.prisma.category.create({
      data: {
        name: nameI18n,
        slug: rest.slug,
        description: descriptionI18n,
        icon: rest.icon,
        sortOrder: rest.sortOrder ?? 0,
        isActive: rest.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            subCategories: true,
          },
        },
      },
    });

    return CategoryMapper.toResponse(category);
  }

  async findAll(query: QueryCategoriesDto): Promise<CategoriesListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const { isActive, search } = query;

    const where: Record<string, unknown> = {};

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

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }],
        include: {
          subCategories: {
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }],
          },
          _count: {
            select: {
              subCategories: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return toPaginatedResult(
      CategoryMapper.toResponseList(categories),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string, includeSubCategories = false): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: includeSubCategories
          ? {
              where: { isActive: true },
              orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            }
          : false,
        _count: {
          select: {
            subCategories: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    return CategoryMapper.toResponse(category);
  }

  async findBySlug(slug: string, includeSubCategories = false): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        subCategories: includeSubCategories
          ? {
              where: { isActive: true },
              orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            }
          : false,
        _count: {
          select: {
            subCategories: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    return CategoryMapper.toResponse(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    // Vérifier les conflits de slug
    if (dto.slug && dto.slug !== category.slug) {
      const existingBySlug = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });

      if (existingBySlug) {
        throw new ConflictException('Une catégorie avec ce slug existe déjà');
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

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            subCategories: true,
          },
        },
      },
    });

    return CategoryMapper.toResponse(updatedCategory);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subCategories: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    // Supprimer la catégorie (les sous-catégories seront supprimées en cascade)
    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Catégorie supprimée avec succès' };
  }

  /**
   * Récupérer toutes les catégories actives avec leurs sous-catégories (pour le public)
   */
  async findAllActive(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }],
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }],
        },
        _count: {
          select: {
            subCategories: true,
          },
        },
      },
    });

    return CategoryMapper.toResponseList(categories);
  }
}
