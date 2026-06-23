import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TranslationService, SourceLang } from '../translation';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateAboutDto } from './dto/update-about.dto';

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
   * - CREATE (no existing data): Duplicate content for both languages
   * - UPDATE (existing data): Update only source language, keep other
   */
  async updateTerms(dto: UpdateTermsDto): Promise<ITermsPage> {
    const existingTerms = await this.prisma.termsPage.findFirst();
    const isCreate = !existingTerms;
    const sourceLang = dto.sourceLang || 'fr';

    let content: any;

    if (isCreate) {
      // CREATE: duplicate content for both languages
      content = {
        fr: dto.content,
        en: dto.content,
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
   * - CREATE (no existing data): Duplicate content for both languages
   * - UPDATE (existing data): Update only source language, keep other
   */
  async updatePrivacy(dto: UpdatePrivacyDto): Promise<IPrivacyPage> {
    const existingPrivacy = await this.prisma.privacyPage.findFirst();
    const isCreate = !existingPrivacy;
    const sourceLang = dto.sourceLang || 'fr';

    let content: any;

    if (isCreate) {
      // CREATE: duplicate content for both languages
      content = {
        fr: dto.content,
        en: dto.content,
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
   * - CREATE (no existing data): Auto-translate values from sourceLang
   * - UPDATE (existing data): Just update, no translation
   */
  async updateAbout(dto: UpdateAboutDto): Promise<IAboutPage> {
    const existingAbout = await this.prisma.aboutPage.findFirst();
    const isCreate = !existingAbout;
    const sourceLang = (dto.sourceLang || 'fr') as SourceLang;
    const targetLang = sourceLang === 'fr' ? 'en' : 'fr';

    // Build update data
    const updateData: any = {};

    // Handle TipTap content fields (introduction, mission, vision)
    // For TipTap, we duplicate content for both languages (no translation for rich text)
    if (dto.introduction) {
      if (isCreate) {
        // CREATE: duplicate content for both languages
        updateData.introduction = {
          fr: dto.introduction,
          en: dto.introduction,
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
        updateData.mission = {
          fr: dto.mission,
          en: dto.mission,
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
        updateData.vision = {
          fr: dto.vision,
          en: dto.vision,
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
}
