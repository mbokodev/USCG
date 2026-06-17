import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { VariantType, Prisma } from '@prisma/client';
import {
  CreateVariantDto,
  UpdateVariantDto,
  QueryVariantsDto,
  VariantResponseDto,
  VariantsListResponseDto,
} from './dto';
import { VariantMapper } from './mappers';
import { toPaginatedResult } from '../common/mappers';
import { getPaginationParams } from '../common/utils/query.utils';

const SELECT_TYPES: VariantType[] = [VariantType.SELECT, VariantType.MULTI_SELECT, VariantType.COLOR];

@Injectable()
export class VariantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVariantDto): Promise<VariantResponseDto> {
    if (!dto.categoryId && !dto.subCategoryId) {
      throw new BadRequestException(
        'Au moins une catégorie ou sous-catégorie doit être définie',
      );
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Catégorie non trouvée');
      }
    }

    if (dto.subCategoryId) {
      const subCategory = await this.prisma.subCategory.findUnique({
        where: { id: dto.subCategoryId },
      });
      if (!subCategory) {
        throw new NotFoundException('Sous-catégorie non trouvée');
      }
    }

    if (SELECT_TYPES.includes(dto.type) && (!dto.options || dto.options.length === 0)) {
      throw new BadRequestException(`Les options sont requises pour le type ${dto.type}`);
    }

    const variant = await this.prisma.variant.create({
      data: {
        categoryId: dto.categoryId,
        subCategoryId: dto.subCategoryId,
        name: dto.name as unknown as Prisma.InputJsonValue,
        description: dto.description as unknown as Prisma.InputJsonValue,
        type: dto.type,
        options: (dto.options || []) as unknown as Prisma.InputJsonValue,
        unit: dto.unit,
        allowCustomValue: dto.allowCustomValue ?? false,
        isRequired: dto.isRequired ?? false,
        isFilterable: dto.isFilterable ?? true,
        isActive: dto.isActive ?? true,
        displayOrder: dto.displayOrder ?? 0,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
      },
    });

    return VariantMapper.toResponse(variant);
  }

  async findAll(query: QueryVariantsDto): Promise<VariantsListResponseDto> {
    const { page, limit, skip } = getPaginationParams(query);
    const { categoryId, subCategoryId, type, isActive, isFilterable, search } = query;
    const where: Prisma.VariantWhereInput = {};

    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    if (isFilterable !== undefined) where.isFilterable = isFilterable;

    if (search) {
      where.OR = [
        { name: { path: ['fr'], string_contains: search } },
        { name: { path: ['en'], string_contains: search } },
      ];
    }

    const [variants, total] = await Promise.all([
      this.prisma.variant.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subCategory: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.variant.count({ where }),
    ]);

    return toPaginatedResult(VariantMapper.toResponseList(variants), total, page, limit);
  }

  async findOne(id: string): Promise<VariantResponseDto> {
    const variant = await this.prisma.variant.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!variant) throw new NotFoundException('Variante non trouvée');
    return VariantMapper.toResponse(variant);
  }

  async findByCategory(categoryId: string, subCategoryId?: string): Promise<VariantResponseDto[]> {
    const whereConditions: Prisma.VariantWhereInput[] = [
      { categoryId, subCategoryId: null, isActive: true },
    ];
    if (subCategoryId) {
      whereConditions.push({ subCategoryId, isActive: true });
    }

    const variants = await this.prisma.variant.findMany({
      where: { OR: whereConditions },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
      },
    });

    return VariantMapper.toResponseList(variants);
  }

  async findFilterableByCategory(categoryId: string, subCategoryId?: string): Promise<VariantResponseDto[]> {
    const whereConditions: Prisma.VariantWhereInput[] = [
      { categoryId, subCategoryId: null, isActive: true, isFilterable: true },
    ];
    if (subCategoryId) {
      whereConditions.push({ subCategoryId, isActive: true, isFilterable: true });
    }

    const variants = await this.prisma.variant.findMany({
      where: { OR: whereConditions },
      orderBy: [{ displayOrder: 'asc' }],
    });

    return VariantMapper.toResponseList(variants);
  }

  async update(id: string, dto: UpdateVariantDto): Promise<VariantResponseDto> {
    const variant = await this.prisma.variant.findUnique({ where: { id } });
    if (!variant) throw new NotFoundException('Variante non trouvée');

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Catégorie non trouvée');
    }

    if (dto.subCategoryId) {
      const subCategory = await this.prisma.subCategory.findUnique({ where: { id: dto.subCategoryId } });
      if (!subCategory) throw new NotFoundException('Sous-catégorie non trouvée');
    }

    const newType = dto.type || variant.type;
    if (SELECT_TYPES.includes(newType)) {
      const options = dto.options !== undefined ? dto.options : variant.options;
      if (!options || (Array.isArray(options) && options.length === 0)) {
        throw new BadRequestException(`Les options sont requises pour le type ${newType}`);
      }
    }

    const updateData: Prisma.VariantUpdateInput = {};
    if (dto.categoryId !== undefined) updateData.category = dto.categoryId ? { connect: { id: dto.categoryId } } : { disconnect: true };
    if (dto.subCategoryId !== undefined) updateData.subCategory = dto.subCategoryId ? { connect: { id: dto.subCategoryId } } : { disconnect: true };
    if (dto.name) updateData.name = dto.name as unknown as Prisma.InputJsonValue;
    if (dto.description !== undefined) updateData.description = dto.description as unknown as Prisma.InputJsonValue;
    if (dto.type) updateData.type = dto.type;
    if (dto.options !== undefined) updateData.options = dto.options as unknown as Prisma.InputJsonValue;
    if (dto.unit !== undefined) updateData.unit = dto.unit;
    if (dto.allowCustomValue !== undefined) updateData.allowCustomValue = dto.allowCustomValue;
    if (dto.isRequired !== undefined) updateData.isRequired = dto.isRequired;
    if (dto.isFilterable !== undefined) updateData.isFilterable = dto.isFilterable;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.displayOrder !== undefined) updateData.displayOrder = dto.displayOrder;

    const updatedVariant = await this.prisma.variant.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
      },
    });

    return VariantMapper.toResponse(updatedVariant);
  }

  async remove(id: string): Promise<{ message: string }> {
    const variant = await this.prisma.variant.findUnique({
      where: { id },
      include: { _count: { select: { adVariantValues: true } } },
    });

    if (!variant) throw new NotFoundException('Variante non trouvée');

    if (variant._count.adVariantValues > 0) {
      throw new BadRequestException(
        `Impossible de supprimer: ${variant._count.adVariantValues} annonce(s) utilisent cette variante`,
      );
    }

    await this.prisma.variant.delete({ where: { id } });
    return { message: 'Variante supprimée avec succès' };
  }
}
