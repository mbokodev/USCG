import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface I18nText {
  fr: string;
  en: string;
  [key: string]: string;
}

export type SourceLang = 'fr' | 'en';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'LIBRETRANSLATE_URL',
      'http://localhost:5000',
    );
  }

  /**
   * Translate text from source language to target language
   */
  async translateText(
    text: string,
    source: SourceLang,
    target: SourceLang,
  ): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/translate`, {
          q: text,
          source,
          target,
        }),
      );
      return response.data.translatedText;
    } catch (error) {
      this.logger.error(
        `Translation failed: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Create bilingual text from source text
   * Returns { fr: "...", en: "..." }
   */
  async createI18nText(
    text: string,
    sourceLang: SourceLang,
  ): Promise<I18nText> {
    const targetLang: SourceLang = sourceLang === 'fr' ? 'en' : 'fr';
    const translatedText = await this.translateText(text, sourceLang, targetLang);

    return {
      [sourceLang]: text,
      [targetLang]: translatedText ?? text, // Fallback to source if translation fails
    } as I18nText;
  }

  /**
   * Create bilingual text for optional field (returns null if text is null/undefined)
   */
  async createI18nTextOptional(
    text: string | null | undefined,
    sourceLang: SourceLang,
  ): Promise<I18nText | null> {
    if (!text) return null;
    return this.createI18nText(text, sourceLang);
  }

  /**
   * Check if LibreTranslate is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/languages`),
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Extract text for a specific language from I18nText
   */
  extractLang(i18nText: I18nText | null | undefined, lang: SourceLang): string | null {
    if (!i18nText) return null;
    return i18nText[lang] || i18nText.fr || null;
  }
}
