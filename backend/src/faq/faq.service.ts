import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TranslationService, SourceLang } from '../translation';
import { CreateFaqCategoryDto, UpdateFaqCategoryDto, CreateFaqDto, UpdateFaqDto } from './dto';

// Local type definitions (exported for controller)
export interface TiptapContent {
  type: string;
  content?: unknown[];
}

export interface I18nContent<T> {
  fr: T;
  en: T;
}

export interface IFaqCategory {
  id: string;
  name: I18nContent<string>;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFaq {
  id: string;
  categoryId: string;
  category?: IFaqCategory;
  question: I18nContent<string>;
  answer: I18nContent<TiptapContent>;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFaqGrouped {
  category: IFaqCategory;
  faqs: IFaq[];
}

@Injectable()
export class FaqService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
  ) {}

  // ============================================
  // FAQ Categories
  // ============================================

  /**
   * Get all active categories (public)
   */
  async getCategories(): Promise<IFaqCategory[]> {
    const categories = await this.prisma.faqCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return categories.map((cat) => this.formatCategory(cat));
  }

  /**
   * Get all categories including inactive (admin)
   */
  async getAllCategories(): Promise<IFaqCategory[]> {
    const categories = await this.prisma.faqCategory.findMany({
      orderBy: { order: 'asc' },
    });

    return categories.map((cat) => this.formatCategory(cat));
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<IFaqCategory> {
    const category = await this.prisma.faqCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Catégorie FAQ non trouvée');
    }

    return this.formatCategory(category);
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<IFaqCategory> {
    const category = await this.prisma.faqCategory.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('Catégorie FAQ non trouvée');
    }

    return this.formatCategory(category);
  }

  /**
   * Create a new FAQ category with auto-translation
   */
  async createCategory(dto: CreateFaqCategoryDto): Promise<IFaqCategory> {
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;
    const targetLang: SourceLang = sourceLang === 'fr' ? 'en' : 'fr';

    // Generate slug if not provided
    let slug = dto.slug || this.generateSlug(dto.name);

    // Ensure slug is unique
    slug = await this.ensureUniqueSlug(slug);

    // Auto-translate name
    const translatedName = await this.translationService.translateText(
      dto.name,
      sourceLang,
      targetLang,
    );

    const name = {
      [sourceLang]: dto.name,
      [targetLang]: translatedName || dto.name,
    };

    const category = await this.prisma.faqCategory.create({
      data: {
        name,
        slug,
        order: dto.order ?? 0,
      },
    });

    return this.formatCategory(category);
  }

  /**
   * Update a FAQ category (only source language)
   */
  async updateCategory(id: string, dto: UpdateFaqCategoryDto): Promise<IFaqCategory> {
    const existing = await this.getCategoryById(id);
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;

    const updateData: any = {};

    // Update name (only source language)
    if (dto.name !== undefined) {
      updateData.name = {
        ...existing.name,
        [sourceLang]: dto.name,
      };
    }

    // Update slug (ensure unique)
    if (dto.slug !== undefined && dto.slug !== existing.slug) {
      updateData.slug = await this.ensureUniqueSlug(dto.slug, id);
    }

    if (dto.order !== undefined) {
      updateData.order = dto.order;
    }

    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    const category = await this.prisma.faqCategory.update({
      where: { id },
      data: updateData,
    });

    return this.formatCategory(category);
  }

  /**
   * Delete a FAQ category (cascades to FAQs)
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    await this.getCategoryById(id); // Check existence

    await this.prisma.faqCategory.delete({
      where: { id },
    });

    return { message: 'Catégorie FAQ supprimée' };
  }

  // ============================================
  // FAQ Items
  // ============================================

  /**
   * Get all active FAQs grouped by category (public)
   */
  async getFaqsGrouped(): Promise<IFaqGrouped[]> {
    const categories = await this.prisma.faqCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return categories
      .filter((cat) => cat.faqs.length > 0) // Only categories with FAQs
      .map((cat) => ({
        category: this.formatCategory(cat),
        faqs: cat.faqs.map((faq) => this.formatFaq(faq)),
      }));
  }

  /**
   * Get FAQs by category slug (public)
   */
  async getFaqsByCategorySlug(slug: string): Promise<IFaqGrouped> {
    const category = await this.prisma.faqCategory.findUnique({
      where: { slug, isActive: true },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Catégorie FAQ non trouvée');
    }

    return {
      category: this.formatCategory(category),
      faqs: category.faqs.map((faq) => this.formatFaq(faq)),
    };
  }

  /**
   * Get all FAQs including inactive (admin)
   */
  async getAllFaqs(): Promise<IFaq[]> {
    const faqs = await this.prisma.faq.findMany({
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
      include: { category: true },
    });

    return faqs.map((faq) => this.formatFaq(faq, true));
  }

  /**
   * Get FAQ by ID
   */
  async getFaqById(id: string): Promise<IFaq> {
    const faq = await this.prisma.faq.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!faq) {
      throw new NotFoundException('FAQ non trouvée');
    }

    return this.formatFaq(faq, true);
  }

  /**
   * Create a new FAQ with auto-translation
   */
  async createFaq(dto: CreateFaqDto): Promise<IFaq> {
    // Verify category exists
    await this.getCategoryById(dto.categoryId);

    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;
    const targetLang: SourceLang = sourceLang === 'fr' ? 'en' : 'fr';

    // Auto-translate question
    const translatedQuestion = await this.translationService.translateText(
      dto.question,
      sourceLang,
      targetLang,
    );

    const question = {
      [sourceLang]: dto.question,
      [targetLang]: translatedQuestion || dto.question,
    };

    // Auto-translate answer (TipTap content)
    const translatedAnswer = await this.translateTiptapContent(
      dto.answer,
      sourceLang,
      targetLang,
    );

    const answer = {
      [sourceLang]: dto.answer,
      [targetLang]: translatedAnswer,
    };

    const faq = await this.prisma.faq.create({
      data: {
        categoryId: dto.categoryId,
        question,
        answer,
        order: dto.order ?? 0,
      },
      include: { category: true },
    });

    return this.formatFaq(faq, true);
  }

  /**
   * Update a FAQ (only source language)
   */
  async updateFaq(id: string, dto: UpdateFaqDto): Promise<IFaq> {
    const existing = await this.getFaqById(id);
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;

    const updateData: any = {};

    // Update category
    if (dto.categoryId !== undefined) {
      await this.getCategoryById(dto.categoryId); // Verify exists
      updateData.categoryId = dto.categoryId;
    }

    // Update question (only source language)
    if (dto.question !== undefined) {
      updateData.question = {
        ...existing.question,
        [sourceLang]: dto.question,
      };
    }

    // Update answer (only source language)
    if (dto.answer !== undefined) {
      updateData.answer = {
        ...existing.answer,
        [sourceLang]: dto.answer,
      };
    }

    if (dto.order !== undefined) {
      updateData.order = dto.order;
    }

    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    const faq = await this.prisma.faq.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return this.formatFaq(faq, true);
  }

  /**
   * Delete a FAQ
   */
  async deleteFaq(id: string): Promise<{ message: string }> {
    await this.getFaqById(id); // Check existence

    await this.prisma.faq.delete({
      where: { id },
    });

    return { message: 'FAQ supprimée' };
  }

  // ============================================
  // Helpers
  // ============================================

  private formatCategory(category: any): IFaqCategory {
    return {
      id: category.id,
      name: category.name as I18nContent<string>,
      slug: category.slug,
      order: category.order,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  private formatFaq(faq: any, includeCategory = false): IFaq {
    const formatted: IFaq = {
      id: faq.id,
      categoryId: faq.categoryId,
      question: faq.question as I18nContent<string>,
      answer: faq.answer as I18nContent<TiptapContent>,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    };

    if (includeCategory && faq.category) {
      formatted.category = this.formatCategory(faq.category);
    }

    return formatted;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.faqCategory.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  /**
   * Recursively translate all text nodes in TipTap content
   */
  private async translateTiptapContent(
    content: TiptapContent,
    sourceLang: SourceLang,
    targetLang: SourceLang,
  ): Promise<TiptapContent> {
    const translateNode = async (node: any): Promise<any> => {
      if (!node) return node;

      // If it's a text node, translate it
      if (node.type === 'text' && node.text) {
        const translatedText = await this.translationService.translateText(
          node.text,
          sourceLang,
          targetLang,
        );
        return {
          ...node,
          text: translatedText || node.text,
        };
      }

      // If it has content array, recursively translate
      if (node.content && Array.isArray(node.content)) {
        const translatedContent = await Promise.all(
          node.content.map((child: any) => translateNode(child)),
        );
        return {
          ...node,
          content: translatedContent,
        };
      }

      return node;
    };

    return translateNode(content);
  }
}
