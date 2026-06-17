import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateBannerDto, UpdateBannerDto, BannerResponseDto } from './dto';

// Banner par défaut si aucun n'est configuré en DB
const DEFAULT_BANNER: BannerResponseDto = {
  id: 'default-welcome',
  title: 'Bienvenue sur USCG Marketplace',
  description: 'Trouvez les meilleures annonces au Congo',
  imageUrl: '/assets/images/banners/default-hero.jpg',
  buttonText: 'Parcourir les annonces',
  buttonLink: '/ads',
  isActive: true,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère les banners actifs triés par ordre.
   * Retourne le banner par défaut si aucun banner actif n'existe.
   */
  async findAllActive(): Promise<BannerResponseDto[]> {
    const banners = await this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Si aucun banner actif, retourner le banner par défaut
    if (banners.length === 0) {
      return [DEFAULT_BANNER];
    }

    return banners;
  }

  /**
   * Récupère tous les banners (pour admin).
   */
  async findAll(): Promise<BannerResponseDto[]> {
    return this.prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Récupère un banner par son ID.
   */
  async findOne(id: string): Promise<BannerResponseDto> {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException(`Banner avec l'ID "${id}" non trouvé`);
    }

    return banner;
  }

  /**
   * Crée un nouveau banner.
   */
  async create(dto: CreateBannerDto): Promise<BannerResponseDto> {
    return this.prisma.banner.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        buttonText: dto.buttonText,
        buttonLink: dto.buttonLink,
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      },
    });
  }

  /**
   * Modifie un banner existant.
   */
  async update(id: string, dto: UpdateBannerDto): Promise<BannerResponseDto> {
    // Vérifier que le banner existe
    await this.findOne(id);

    return this.prisma.banner.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprime un banner.
   */
  async remove(id: string): Promise<{ message: string }> {
    // Vérifier que le banner existe
    await this.findOne(id);

    await this.prisma.banner.delete({
      where: { id },
    });

    return { message: 'Banner supprimé avec succès' };
  }
}
