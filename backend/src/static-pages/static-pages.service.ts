import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TranslationService, SourceLang } from '../translation';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { UpdateSellerTermsDto } from './dto/update-seller-terms.dto';
import { UpdateSellerPrivacyDto } from './dto/update-seller-privacy.dto';

// Local type definitions (matching shared types)
export interface TiptapContent {
  type: string;
  content?: unknown[];
}

export interface I18nContent<T = TiptapContent> {
  fr: T;
  en: T;
}

export interface ITermsPage {
  id: string;
  content: I18nContent<TiptapContent>;
  updatedAt: string;
}

export interface IPrivacyPage {
  id: string;
  content: I18nContent<TiptapContent>;
  updatedAt: string;
}

export interface IAboutValue {
  icon: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
}

export interface IAboutTeamMember {
  name: string;
  role: string;
  photoUrl?: string;
}

export interface IAboutPage {
  id: string;
  introduction: I18nContent<TiptapContent>;
  mission: I18nContent<TiptapContent>;
  vision: I18nContent<TiptapContent>;
  values: IAboutValue[];
  team?: IAboutTeamMember[];
  updatedAt: string;
}

export interface ISellerTermsPage {
  id: string;
  content: I18nContent<TiptapContent>;
  updatedAt: string;
}

export interface ISellerPrivacyPage {
  id: string;
  content: I18nContent<TiptapContent>;
  updatedAt: string;
}

// Default TipTap content structure
const createEmptyTiptapContent = (text: string): TiptapContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text }],
    },
  ],
});

// Default Terms page content
const DEFAULT_TERMS: ITermsPage = {
  id: 'default-terms',
  content: {
    fr: createEmptyTiptapContent('Contenu des CGU à définir...'),
    en: createEmptyTiptapContent('Terms of service content to be defined...'),
  },
  updatedAt: new Date().toISOString(),
};

// Default Privacy page content
const DEFAULT_PRIVACY: IPrivacyPage = {
  id: 'default-privacy',
  content: {
    fr: createEmptyTiptapContent("Contenu des conditions d'utilisation à définir..."),
    en: createEmptyTiptapContent('Privacy policy content to be defined...'),
  },
  updatedAt: new Date().toISOString(),
};

// Default Seller Terms page content
const DEFAULT_SELLER_TERMS: ISellerTermsPage = {
  id: 'default-seller-terms',
  content: {
    fr: createEmptyTiptapContent("Conditions générales d'utilisation pour les vendeurs à définir..."),
    en: createEmptyTiptapContent('Terms of service for sellers to be defined...'),
  },
  updatedAt: new Date().toISOString(),
};

// Default Seller Privacy page content
const DEFAULT_SELLER_PRIVACY: ISellerPrivacyPage = {
  id: 'default-seller-privacy',
  content: {
    fr: createEmptyTiptapContent('Politique de confidentialité pour les vendeurs à définir...'),
    en: createEmptyTiptapContent('Privacy policy for sellers to be defined...'),
  },
  updatedAt: new Date().toISOString(),
};

// Default About page content
const DEFAULT_ABOUT: IAboutPage = {
  id: 'default-about',
  introduction: {
    fr: createEmptyTiptapContent('Universal Services of Congo (USCG) est une marketplace dédiée au marché congolais.'),
    en: createEmptyTiptapContent('Universal Services of Congo (USCG) is a marketplace dedicated to the Congolese market.'),
  },
  mission: {
    fr: createEmptyTiptapContent('Notre mission est de connecter acheteurs et vendeurs à travers le Congo.'),
    en: createEmptyTiptapContent('Our mission is to connect buyers and sellers across Congo.'),
  },
  vision: {
    fr: createEmptyTiptapContent('Devenir la référence du commerce en ligne au Congo.'),
    en: createEmptyTiptapContent('To become the reference for online commerce in Congo.'),
  },
  values: [
    {
      icon: 'Shield',
      titleFr: 'Confiance',
      titleEn: 'Trust',
      descFr: 'Nous garantissons des transactions sécurisées et transparentes.',
      descEn: 'We guarantee secure and transparent transactions.',
    },
    {
      icon: 'Award',
      titleFr: 'Qualité',
      titleEn: 'Quality',
      descFr: 'Chaque annonce est vérifiée par notre équipe.',
      descEn: 'Each listing is verified by our team.',
    },
    {
      icon: 'Lightbulb',
      titleFr: 'Innovation',
      titleEn: 'Innovation',
      descFr: 'Nous innovons constamment pour améliorer votre expérience.',
      descEn: 'We constantly innovate to improve your experience.',
    },
  ],
  team: [],
  updatedAt: new Date().toISOString(),
};

@Injectable()
export class StaticPagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
  ) {}

  // ============================================
  // Terms Page
  // ============================================

  async getTerms(): Promise<ITermsPage> {
    const terms = await this.prisma.termsPage.findFirst();

    if (!terms) {
      return DEFAULT_TERMS;
    }

    return {
      id: terms.id,
      content: terms.content as unknown as ITermsPage['content'],
      updatedAt: terms.updatedAt.toISOString(),
    };
  }

  /**
   * Update Terms page content
   * - CREATE (no existing data): Auto-translate via TranslationService
   * - UPDATE (existing data): Update only source language, keep other
   */
  async updateTerms(dto: UpdateTermsDto): Promise<ITermsPage> {
    const existingTerms = await this.prisma.termsPage.findFirst();
    const isCreate = !existingTerms;
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;
    const targetLang: SourceLang = sourceLang === 'fr' ? 'en' : 'fr';

    let content: any;

    if (isCreate) {
      // CREATE: auto-translate content
      const translatedContent = await this.translateTiptapContent(
        dto.content as TiptapContent,
        sourceLang,
        targetLang,
      );
      content = {
        [sourceLang]: dto.content,
        [targetLang]: translatedContent,
      };
    } else {
      // UPDATE: update only source language, keep other
      const existing = await this.getTerms();
      content = {
        ...existing.content,
        [sourceLang]: dto.content,
      };
    }

    let terms;
    if (existingTerms) {
      terms = await this.prisma.termsPage.update({
        where: { id: existingTerms.id },
        data: { content },
      });
    } else {
      terms = await this.prisma.termsPage.create({
        data: { content },
      });
    }

    return {
      id: terms.id,
      content: terms.content as unknown as ITermsPage['content'],
      updatedAt: terms.updatedAt.toISOString(),
    };
  }

  // ============================================
  // Privacy Page
  // ============================================

  async getPrivacy(): Promise<IPrivacyPage> {
    const privacy = await this.prisma.privacyPage.findFirst();

    if (!privacy) {
      return DEFAULT_PRIVACY;
    }

    return {
      id: privacy.id,
      content: privacy.content as unknown as IPrivacyPage['content'],
      updatedAt: privacy.updatedAt.toISOString(),
    };
  }

  /**
   * Update Privacy page content
   * - CREATE (no existing data): Auto-translate via TranslationService
   * - UPDATE (existing data): Update only source language, keep other
   */
  async updatePrivacy(dto: UpdatePrivacyDto): Promise<IPrivacyPage> {
    const existingPrivacy = await this.prisma.privacyPage.findFirst();
    const isCreate = !existingPrivacy;
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;
    const targetLang: SourceLang = sourceLang === 'fr' ? 'en' : 'fr';

    let content: any;

    if (isCreate) {
      // CREATE: auto-translate content
      const translatedContent = await this.translateTiptapContent(
        dto.content as TiptapContent,
        sourceLang,
        targetLang,
      );
      content = {
        [sourceLang]: dto.content,
        [targetLang]: translatedContent,
      };
    } else {
      // UPDATE: update only source language, keep other
      const existing = await this.getPrivacy();
      content = {
        ...existing.content,
        [sourceLang]: dto.content,
      };
    }

    let privacy;
    if (existingPrivacy) {
      privacy = await this.prisma.privacyPage.update({
        where: { id: existingPrivacy.id },
        data: { content },
      });
    } else {
      privacy = await this.prisma.privacyPage.create({
        data: { content },
      });
    }

    return {
      id: privacy.id,
      content: privacy.content as unknown as IPrivacyPage['content'],
      updatedAt: privacy.updatedAt.toISOString(),
    };
  }

  // ============================================
  // About Page
  // ============================================

  async getAbout(): Promise<IAboutPage> {
    const about = await this.prisma.aboutPage.findFirst();

    if (!about) {
      return DEFAULT_ABOUT;
    }

    return {
      id: about.id,
      introduction: about.introduction as unknown as IAboutPage['introduction'],
      mission: about.mission as unknown as IAboutPage['mission'],
      vision: about.vision as unknown as IAboutPage['vision'],
      values: about.values as unknown as IAboutPage['values'],
      team: (about.team as unknown as IAboutPage['team']) || [],
      updatedAt: about.updatedAt.toISOString(),
    };
  }

  /**
   * Update About page content
   * - CREATE (no existing data): Auto-translate via TranslationService
   * - UPDATE (existing data): Update only source language, keep other
   */
  async updateAbout(dto: UpdateAboutDto): Promise<IAboutPage> {
    const existingAbout = await this.prisma.aboutPage.findFirst();
    const isCreate = !existingAbout;
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;
    const targetLang: SourceLang = sourceLang === 'fr' ? 'en' : 'fr';

    // Build update data
    const updateData: any = {};

    // Handle TipTap content fields (introduction, mission, vision)
    // Auto-translate on CREATE, update only source lang on UPDATE
    if (dto.introduction) {
      if (isCreate) {
        // CREATE: auto-translate content
        const translatedContent = await this.translateTiptapContent(
          dto.introduction as TiptapContent,
          sourceLang,
          targetLang,
        );
        updateData.introduction = {
          [sourceLang]: dto.introduction,
          [targetLang]: translatedContent,
        };
      } else {
        // UPDATE: update only source language, keep other
        const existing = await this.getAbout();
        updateData.introduction = {
          ...existing.introduction,
          [sourceLang]: dto.introduction,
        };
      }
    }

    if (dto.mission) {
      if (isCreate) {
        // CREATE: auto-translate content
        const translatedContent = await this.translateTiptapContent(
          dto.mission as TiptapContent,
          sourceLang,
          targetLang,
        );
        updateData.mission = {
          [sourceLang]: dto.mission,
          [targetLang]: translatedContent,
        };
      } else {
        const existing = await this.getAbout();
        updateData.mission = {
          ...existing.mission,
          [sourceLang]: dto.mission,
        };
      }
    }

    if (dto.vision) {
      if (isCreate) {
        // CREATE: auto-translate content
        const translatedContent = await this.translateTiptapContent(
          dto.vision as TiptapContent,
          sourceLang,
          targetLang,
        );
        updateData.vision = {
          [sourceLang]: dto.vision,
          [targetLang]: translatedContent,
        };
      } else {
        const existing = await this.getAbout();
        updateData.vision = {
          ...existing.vision,
          [sourceLang]: dto.vision,
        };
      }
    }

    // Handle values (translate title and description on CREATE)
    if (dto.values !== undefined) {
      if (isCreate && dto.values.length > 0) {
        // CREATE: auto-translate values
        const translatedValues: IAboutValue[] = await Promise.all(
          dto.values.map(async (value) => {
            const titleTranslated = await this.translationService.translateText(
              value.title,
              sourceLang,
              targetLang as SourceLang,
            );
            const descTranslated = await this.translationService.translateText(
              value.description,
              sourceLang,
              targetLang as SourceLang,
            );

            return {
              icon: value.icon,
              titleFr: sourceLang === 'fr' ? value.title : (titleTranslated || value.title),
              titleEn: sourceLang === 'en' ? value.title : (titleTranslated || value.title),
              descFr: sourceLang === 'fr' ? value.description : (descTranslated || value.description),
              descEn: sourceLang === 'en' ? value.description : (descTranslated || value.description),
            };
          }),
        );
        updateData.values = translatedValues;
      } else {
        // UPDATE: just update source language values
        const existing = await this.getAbout();
        const updatedValues = dto.values.map((value, index) => {
          const existingValue = existing.values[index] || {
            icon: value.icon,
            titleFr: '',
            titleEn: '',
            descFr: '',
            descEn: '',
          };
          return {
            icon: value.icon,
            titleFr: sourceLang === 'fr' ? value.title : existingValue.titleFr,
            titleEn: sourceLang === 'en' ? value.title : existingValue.titleEn,
            descFr: sourceLang === 'fr' ? value.description : existingValue.descFr,
            descEn: sourceLang === 'en' ? value.description : existingValue.descEn,
          };
        });
        updateData.values = updatedValues;
      }
    }

    // Handle team (no translation needed)
    if (dto.team !== undefined) {
      updateData.team = dto.team;
    }

    // Save to database
    let about;
    if (existingAbout) {
      const existingData = await this.getAbout();
      about = await this.prisma.aboutPage.update({
        where: { id: existingAbout.id },
        data: {
          introduction: updateData.introduction || existingData.introduction,
          mission: updateData.mission || existingData.mission,
          vision: updateData.vision || existingData.vision,
          values: updateData.values !== undefined ? updateData.values : existingData.values,
          team: updateData.team !== undefined ? updateData.team : existingData.team,
        },
      });
    } else {
      about = await this.prisma.aboutPage.create({
        data: {
          introduction: updateData.introduction || DEFAULT_ABOUT.introduction,
          mission: updateData.mission || DEFAULT_ABOUT.mission,
          vision: updateData.vision || DEFAULT_ABOUT.vision,
          values: updateData.values !== undefined ? updateData.values : DEFAULT_ABOUT.values,
          team: updateData.team !== undefined ? updateData.team : DEFAULT_ABOUT.team,
        },
      });
    }

    return {
      id: about.id,
      introduction: about.introduction as unknown as IAboutPage['introduction'],
      mission: about.mission as unknown as IAboutPage['mission'],
      vision: about.vision as unknown as IAboutPage['vision'],
      values: about.values as unknown as IAboutPage['values'],
      team: (about.team as unknown as IAboutPage['team']) || [],
      updatedAt: about.updatedAt.toISOString(),
    };
  }

  // ============================================
  // Seller Terms Page
  // ============================================

  async getSellerTerms(): Promise<ISellerTermsPage> {
    const sellerTerms = await this.prisma.sellerTermsPage.findFirst();

    if (!sellerTerms) {
      return DEFAULT_SELLER_TERMS;
    }

    return {
      id: sellerTerms.id,
      content: sellerTerms.content as unknown as ISellerTermsPage['content'],
      updatedAt: sellerTerms.updatedAt.toISOString(),
    };
  }

  /**
   * Update Seller Terms page content
   * - CREATE (no existing data): Auto-translate via TranslationService
   * - UPDATE (existing data): Update only source language, keep other
   */
  async updateSellerTerms(dto: UpdateSellerTermsDto): Promise<ISellerTermsPage> {
    const existingSellerTerms = await this.prisma.sellerTermsPage.findFirst();
    const isCreate = !existingSellerTerms;
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;
    const targetLang: SourceLang = sourceLang === 'fr' ? 'en' : 'fr';

    let content: any;

    if (isCreate) {
      // CREATE: auto-translate content
      const translatedContent = await this.translateTiptapContent(
        dto.content as TiptapContent,
        sourceLang,
        targetLang,
      );
      content = {
        [sourceLang]: dto.content,
        [targetLang]: translatedContent,
      };
    } else {
      // UPDATE: update only source language, keep other
      const existing = await this.getSellerTerms();
      content = {
        ...existing.content,
        [sourceLang]: dto.content,
      };
    }

    let sellerTerms;
    if (existingSellerTerms) {
      sellerTerms = await this.prisma.sellerTermsPage.update({
        where: { id: existingSellerTerms.id },
        data: { content },
      });
    } else {
      sellerTerms = await this.prisma.sellerTermsPage.create({
        data: { content },
      });
    }

    return {
      id: sellerTerms.id,
      content: sellerTerms.content as unknown as ISellerTermsPage['content'],
      updatedAt: sellerTerms.updatedAt.toISOString(),
    };
  }

  // ============================================
  // Seller Privacy Page
  // ============================================

  async getSellerPrivacy(): Promise<ISellerPrivacyPage> {
    const sellerPrivacy = await this.prisma.sellerPrivacyPage.findFirst();

    if (!sellerPrivacy) {
      return DEFAULT_SELLER_PRIVACY;
    }

    return {
      id: sellerPrivacy.id,
      content: sellerPrivacy.content as unknown as ISellerPrivacyPage['content'],
      updatedAt: sellerPrivacy.updatedAt.toISOString(),
    };
  }

  /**
   * Update Seller Privacy page content
   * - CREATE (no existing data): Auto-translate via TranslationService
   * - UPDATE (existing data): Update only source language, keep other
   */
  async updateSellerPrivacy(dto: UpdateSellerPrivacyDto): Promise<ISellerPrivacyPage> {
    const existingSellerPrivacy = await this.prisma.sellerPrivacyPage.findFirst();
    const isCreate = !existingSellerPrivacy;
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;
    const targetLang: SourceLang = sourceLang === 'fr' ? 'en' : 'fr';

    let content: any;

    if (isCreate) {
      // CREATE: auto-translate content
      const translatedContent = await this.translateTiptapContent(
        dto.content as TiptapContent,
        sourceLang,
        targetLang,
      );
      content = {
        [sourceLang]: dto.content,
        [targetLang]: translatedContent,
      };
    } else {
      // UPDATE: update only source language, keep other
      const existing = await this.getSellerPrivacy();
      content = {
        ...existing.content,
        [sourceLang]: dto.content,
      };
    }

    let sellerPrivacy;
    if (existingSellerPrivacy) {
      sellerPrivacy = await this.prisma.sellerPrivacyPage.update({
        where: { id: existingSellerPrivacy.id },
        data: { content },
      });
    } else {
      sellerPrivacy = await this.prisma.sellerPrivacyPage.create({
        data: { content },
      });
    }

    return {
      id: sellerPrivacy.id,
      content: sellerPrivacy.content as unknown as ISellerPrivacyPage['content'],
      updatedAt: sellerPrivacy.updatedAt.toISOString(),
    };
  }

  // ============================================
  // Helper: Translate TipTap Content
  // ============================================

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
