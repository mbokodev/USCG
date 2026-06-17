import { PrismaClient, Role, VariantType, AdType, AdStatus, RequestStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // =========================================================================
  // 1. SEED CATEGORIES
  // =========================================================================
  console.log('Seeding categories...');

  const categories = [
    {
      name: { fr: 'Foncier', en: 'Land' },
      slug: 'foncier',
      description: { fr: 'Terrains, parcelles et propriétés foncières', en: 'Land, plots and real estate properties' },
      icon: 'Mountain',
      sortOrder: 1,
    },
    {
      name: { fr: 'Immobilier', en: 'Real Estate' },
      slug: 'immobilier',
      description: { fr: 'Maisons, appartements et biens immobiliers', en: 'Houses, apartments and real estate' },
      icon: 'Home',
      sortOrder: 2,
    },
    {
      name: { fr: 'Electroménager', en: 'Home Appliances' },
      slug: 'electromenager',
      description: { fr: 'Appareils électroménagers et équipements', en: 'Home appliances and equipment' },
      icon: 'Refrigerator',
      sortOrder: 3,
    },
    {
      name: { fr: 'Divers', en: 'Miscellaneous' },
      slug: 'divers',
      description: { fr: 'Autres articles et services', en: 'Other items and services' },
      icon: 'Package',
      sortOrder: 4,
    },
  ];

  const createdCategories: Record<string, string> = {};

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories[category.slug] = created.id;
  }

  console.log(`Created ${categories.length} categories`);

  // =========================================================================
  // 1.5 SEED SUBCATEGORIES
  // =========================================================================
  console.log('Seeding subcategories...');

  const subCategories = [
    // Foncier
    {
      name: { fr: 'Terrains résidentiels', en: 'Residential Land' },
      slug: 'terrains-residentiels',
      description: { fr: 'Terrains pour construction de maisons', en: 'Land for house construction' },
      categorySlug: 'foncier',
      sortOrder: 1,
    },
    {
      name: { fr: 'Terrains commerciaux', en: 'Commercial Land' },
      slug: 'terrains-commerciaux',
      description: { fr: 'Terrains pour activités commerciales', en: 'Land for commercial activities' },
      categorySlug: 'foncier',
      sortOrder: 2,
    },
    {
      name: { fr: 'Terrains agricoles', en: 'Agricultural Land' },
      slug: 'terrains-agricoles',
      description: { fr: 'Terrains pour agriculture et élevage', en: 'Land for farming and livestock' },
      categorySlug: 'foncier',
      sortOrder: 3,
    },

    // Immobilier
    {
      name: { fr: 'Appartements', en: 'Apartments' },
      slug: 'appartements',
      description: { fr: 'Appartements à vendre ou à louer', en: 'Apartments for sale or rent' },
      categorySlug: 'immobilier',
      sortOrder: 1,
    },
    {
      name: { fr: 'Maisons', en: 'Houses' },
      slug: 'maisons',
      description: { fr: 'Maisons individuelles', en: 'Individual houses' },
      categorySlug: 'immobilier',
      sortOrder: 2,
    },
    {
      name: { fr: 'Villas', en: 'Villas' },
      slug: 'villas',
      description: { fr: 'Villas et propriétés de luxe', en: 'Villas and luxury properties' },
      categorySlug: 'immobilier',
      sortOrder: 3,
    },
    {
      name: { fr: 'Bureaux', en: 'Offices' },
      slug: 'bureaux',
      description: { fr: 'Espaces de bureaux et locaux professionnels', en: 'Office spaces and professional premises' },
      categorySlug: 'immobilier',
      sortOrder: 4,
    },
    {
      name: { fr: 'Locaux commerciaux', en: 'Commercial Premises' },
      slug: 'locaux-commerciaux',
      description: { fr: 'Boutiques et espaces commerciaux', en: 'Shops and commercial spaces' },
      categorySlug: 'immobilier',
      sortOrder: 5,
    },

    // Electroménager
    {
      name: { fr: 'Cuisine', en: 'Kitchen' },
      slug: 'cuisine',
      description: { fr: 'Réfrigérateurs, cuisinières, micro-ondes', en: 'Refrigerators, stoves, microwaves' },
      categorySlug: 'electromenager',
      sortOrder: 1,
    },
    {
      name: { fr: 'Lavage', en: 'Laundry' },
      slug: 'lavage',
      description: { fr: 'Machines à laver, sèche-linge', en: 'Washing machines, dryers' },
      categorySlug: 'electromenager',
      sortOrder: 2,
    },
    {
      name: { fr: 'Climatisation', en: 'Air Conditioning' },
      slug: 'climatisation',
      description: { fr: 'Climatiseurs et ventilateurs', en: 'Air conditioners and fans' },
      categorySlug: 'electromenager',
      sortOrder: 3,
    },
    {
      name: { fr: 'TV & Audio', en: 'TV & Audio' },
      slug: 'tv-audio',
      description: { fr: 'Télévisions, systèmes audio', en: 'Televisions, audio systems' },
      categorySlug: 'electromenager',
      sortOrder: 4,
    },

    // Divers
    {
      name: { fr: 'Meubles', en: 'Furniture' },
      slug: 'meubles',
      description: { fr: 'Mobilier de maison et bureau', en: 'Home and office furniture' },
      categorySlug: 'divers',
      sortOrder: 1,
    },
    {
      name: { fr: 'Véhicules', en: 'Vehicles' },
      slug: 'vehicules',
      description: { fr: 'Voitures, motos et autres véhicules', en: 'Cars, motorcycles and other vehicles' },
      categorySlug: 'divers',
      sortOrder: 2,
    },
    {
      name: { fr: 'Services', en: 'Services' },
      slug: 'services',
      description: { fr: 'Services divers', en: 'Various services' },
      categorySlug: 'divers',
      sortOrder: 3,
    },
  ];

  let subCategoryCount = 0;
  for (const subCategory of subCategories) {
    const categoryId = createdCategories[subCategory.categorySlug];
    if (!categoryId) {
      console.warn(`Category not found for subcategory: ${subCategory.name}`);
      continue;
    }

    await prisma.subCategory.upsert({
      where: {
        categoryId_slug: {
          categoryId,
          slug: subCategory.slug,
        },
      },
      update: {},
      create: {
        name: subCategory.name,
        slug: subCategory.slug,
        description: subCategory.description,
        categoryId,
        sortOrder: subCategory.sortOrder,
        isActive: true,
      },
    });
    subCategoryCount++;
  }

  console.log(`Created ${subCategoryCount} subcategories`);

  // =========================================================================
  // 1.6 SEED VARIANTS
  // =========================================================================
  console.log('Seeding variants...');

  const variants = [
    // Immobilier - Variantes générales
    {
      categorySlug: 'immobilier',
      name: { fr: 'Nombre de chambres', en: 'Number of bedrooms' },
      description: { fr: 'Nombre de chambres à coucher', en: 'Number of bedrooms' },
      type: VariantType.NUMBER,
      options: { min: 1, max: 20, step: 1 },
      unit: 'chambres',
      isRequired: true,
      isFilterable: true,
      displayOrder: 1,
    },
    {
      categorySlug: 'immobilier',
      name: { fr: 'Surface', en: 'Surface area' },
      description: { fr: 'Surface habitable en mètres carrés', en: 'Living area in square meters' },
      type: VariantType.NUMBER,
      options: { min: 10, max: 10000, step: 5 },
      unit: 'm²',
      isRequired: true,
      isFilterable: true,
      displayOrder: 2,
    },
    {
      categorySlug: 'immobilier',
      name: { fr: 'Nombre de salles de bain', en: 'Number of bathrooms' },
      type: VariantType.NUMBER,
      options: { min: 1, max: 10, step: 1 },
      unit: 'salles de bain',
      isRequired: false,
      isFilterable: true,
      displayOrder: 3,
    },
    {
      categorySlug: 'immobilier',
      name: { fr: 'Meublé', en: 'Furnished' },
      description: { fr: 'Le bien est-il meublé ?', en: 'Is the property furnished?' },
      type: VariantType.BOOLEAN,
      options: [],
      isRequired: false,
      isFilterable: true,
      displayOrder: 4,
    },

    // Foncier - Surface terrain
    {
      categorySlug: 'foncier',
      name: { fr: 'Superficie', en: 'Land area' },
      description: { fr: 'Superficie du terrain', en: 'Land area' },
      type: VariantType.NUMBER,
      options: { min: 100, max: 100000, step: 100 },
      unit: 'm²',
      isRequired: true,
      isFilterable: true,
      displayOrder: 1,
    },
    {
      categorySlug: 'foncier',
      name: { fr: 'Type de titre', en: 'Title type' },
      type: VariantType.SELECT,
      options: [
        { value: 'titre-foncier', label: { fr: 'Titre foncier', en: 'Land title' } },
        { value: 'certificat-enregistrement', label: { fr: 'Certificat d\'enregistrement', en: 'Registration certificate' } },
        { value: 'attestation-villageoise', label: { fr: 'Attestation villageoise', en: 'Village attestation' } },
        { value: 'autre', label: { fr: 'Autre', en: 'Other' } },
      ],
      isRequired: true,
      isFilterable: true,
      displayOrder: 2,
    },

    // Electroménager - TV & Audio
    {
      categorySlug: 'electromenager',
      name: { fr: 'Marque', en: 'Brand' },
      type: VariantType.SELECT,
      options: [
        { value: 'samsung', label: { fr: 'Samsung', en: 'Samsung' } },
        { value: 'lg', label: { fr: 'LG', en: 'LG' } },
        { value: 'sony', label: { fr: 'Sony', en: 'Sony' } },
        { value: 'philips', label: { fr: 'Philips', en: 'Philips' } },
        { value: 'hisense', label: { fr: 'Hisense', en: 'Hisense' } },
        { value: 'autre', label: { fr: 'Autre', en: 'Other' } },
      ],
      allowCustomValue: true,
      isRequired: false,
      isFilterable: true,
      displayOrder: 1,
    },
    {
      categorySlug: 'electromenager',
      name: { fr: 'État', en: 'Condition' },
      type: VariantType.SELECT,
      options: [
        { value: 'neuf', label: { fr: 'Neuf', en: 'New' } },
        { value: 'comme-neuf', label: { fr: 'Comme neuf', en: 'Like new' } },
        { value: 'bon-etat', label: { fr: 'Bon état', en: 'Good condition' } },
        { value: 'usage', label: { fr: 'Usagé', en: 'Used' } },
      ],
      isRequired: true,
      isFilterable: true,
      displayOrder: 2,
    },
    {
      categorySlug: 'electromenager',
      name: { fr: 'Couleur', en: 'Color' },
      type: VariantType.COLOR,
      options: [
        { value: 'noir', label: { fr: 'Noir', en: 'Black' }, hex: '#000000' },
        { value: 'blanc', label: { fr: 'Blanc', en: 'White' }, hex: '#FFFFFF' },
        { value: 'gris', label: { fr: 'Gris', en: 'Gray' }, hex: '#808080' },
        { value: 'argent', label: { fr: 'Argent', en: 'Silver' }, hex: '#C0C0C0' },
        { value: 'rouge', label: { fr: 'Rouge', en: 'Red' }, hex: '#FF0000' },
        { value: 'bleu', label: { fr: 'Bleu', en: 'Blue' }, hex: '#0000FF' },
      ],
      allowCustomValue: true,
      isRequired: false,
      isFilterable: true,
      displayOrder: 3,
    },

    // Divers - Véhicules
    {
      categorySlug: 'divers',
      name: { fr: 'Année', en: 'Year' },
      type: VariantType.NUMBER,
      options: { min: 1990, max: 2030, step: 1 },
      isRequired: false,
      isFilterable: true,
      displayOrder: 1,
    },
  ];

  let variantCount = 0;
  for (const variant of variants) {
    const categoryId = createdCategories[variant.categorySlug];
    if (!categoryId) {
      console.warn(`Category not found for variant: ${JSON.stringify(variant.name)}`);
      continue;
    }

    // Utiliser une combinaison unique pour identifier la variante
    const existingVariant = await prisma.variant.findFirst({
      where: {
        categoryId,
        name: { equals: variant.name },
      },
    });

    if (!existingVariant) {
      await prisma.variant.create({
        data: {
          categoryId,
          name: variant.name,
          description: variant.description,
          type: variant.type,
          options: variant.options,
          unit: variant.unit,
          allowCustomValue: variant.allowCustomValue ?? false,
          isRequired: variant.isRequired ?? false,
          isFilterable: variant.isFilterable ?? true,
          isActive: true,
          displayOrder: variant.displayOrder ?? 0,
        },
      });
      variantCount++;
    }
  }

  console.log(`Created ${variantCount} variants`);

  // =========================================================================
  // 2. SEED SUPER_ADMIN
  // =========================================================================
  console.log('Seeding SUPER_ADMIN user...');

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@uscg.com';
  const superAdminPassword =
    process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
  const superAdminFirstName = process.env.SUPER_ADMIN_FIRSTNAME || 'Admin';
  const superAdminLastName = process.env.SUPER_ADMIN_LASTNAME || 'USCG';

  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: hashedPassword,
      firstName: superAdminFirstName,
      lastName: superAdminLastName,
      role: Role.SUPER_ADMIN,
      isSeller: false,
      termsAcceptedAt: new Date(),
      isActive: true,
    },
  });

  console.log(`Created SUPER_ADMIN: ${superAdmin.email}`);

  // =========================================================================
  // 3. SEED OPERATOR (pour tests)
  // =========================================================================
  console.log('Seeding OPERATOR user (for testing)...');

  const operatorPassword = await bcrypt.hash('Operator@123456', 10);

  const operator = await prisma.user.upsert({
    where: { email: 'operator@uscg.com' },
    update: {},
    create: {
      email: 'operator@uscg.com',
      password: operatorPassword,
      firstName: 'Operator',
      lastName: 'Test',
      role: Role.OPERATOR,
      isSeller: false,
      termsAcceptedAt: new Date(),
      isActive: true,
    },
  });

  console.log(`Created OPERATOR: ${operator.email}`);

  // =========================================================================
  // 4. SEED BUYER/SELLER (pour tests)
  // =========================================================================
  console.log('Seeding test BUYER and SELLER users...');

  const buyerPassword = await bcrypt.hash('Buyer@123456', 10);

  // Simple BUYER
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      email: 'buyer@test.com',
      password: buyerPassword,
      firstName: 'Jean',
      lastName: 'Acheteur',
      phone: '+243 123 456 789',
      role: Role.BUYER,
      isSeller: false,
      termsAcceptedAt: new Date(),
      isActive: true,
    },
  });

  console.log(`Created BUYER: ${buyer.email}`);

  // BUYER with isSeller=true (approved seller)
  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      password: buyerPassword,
      firstName: 'Marie',
      lastName: 'Vendeuse',
      phone: '+243 987 654 321',
      role: Role.BUYER,
      isSeller: true,
      termsAcceptedAt: new Date(),
      isActive: true,
    },
  });

  console.log(`Created SELLER: ${seller.email}`);

  // Create SellerRequest for the seller (approved)
  await prisma.sellerRequest.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      businessName: 'Marie Commerce SARL',
      businessAddress: '123 Avenue de la Paix, Kinshasa',
      businessPhone: '+243 987 654 321',
      description:
        'Vente de produits électroménagers et accessoires pour la maison.',
      status: 'APPROVED',
      validatedAt: new Date(),
    },
  });

  console.log('Created SellerRequest for seller');

  // =========================================================================
  // 5. SEED PENDING SELLER REQUESTS (pour tests opérateur)
  // =========================================================================
  console.log('Seeding BUYER users with PENDING seller requests...');

  // BUYER 1 avec demande vendeur PENDING
  const pendingSeller1 = await prisma.user.upsert({
    where: { email: 'pending1@test.com' },
    update: {},
    create: {
      email: 'pending1@test.com',
      password: buyerPassword,
      firstName: 'Patrick',
      lastName: 'Mbala',
      phone: '+243 811 222 333',
      role: Role.BUYER,
      isSeller: false,
      termsAcceptedAt: new Date(),
      isActive: true,
    },
  });

  await prisma.sellerRequest.upsert({
    where: { userId: pendingSeller1.id },
    update: {},
    create: {
      userId: pendingSeller1.id,
      businessName: 'Mbala Electronics',
      businessAddress: '45 Boulevard du 30 Juin, Kinshasa',
      businessPhone: '+243 811 222 333',
      description:
        'Importation et vente de matériel électronique et informatique. Plus de 5 ans d\'expérience dans le secteur.',
      status: 'PENDING',
    },
  });

  console.log(`Created PENDING seller request: ${pendingSeller1.email}`);

  // BUYER 2 avec demande vendeur PENDING
  const pendingSeller2 = await prisma.user.upsert({
    where: { email: 'pending2@test.com' },
    update: {},
    create: {
      email: 'pending2@test.com',
      password: buyerPassword,
      firstName: 'Carine',
      lastName: 'Kabongo',
      phone: '+243 822 333 444',
      role: Role.BUYER,
      isSeller: false,
      termsAcceptedAt: new Date(),
      isActive: true,
    },
  });

  await prisma.sellerRequest.upsert({
    where: { userId: pendingSeller2.id },
    update: {},
    create: {
      userId: pendingSeller2.id,
      businessName: 'Immo Kinshasa Plus',
      businessAddress: '78 Avenue de la Libération, Gombe',
      businessPhone: '+243 822 333 444',
      description:
        'Agence immobilière spécialisée dans la vente et location de biens à Kinshasa et Lubumbashi.',
      status: 'PENDING',
    },
  });

  console.log(`Created PENDING seller request: ${pendingSeller2.email}`);

  // =========================================================================
  // 6. SEED 20 CONFIRMED SELLERS
  // =========================================================================
  console.log('Seeding 20 confirmed sellers...');

  const sellersData = [
    { email: 'vendeur1@uscg.cd', firstName: 'Jean-Pierre', lastName: 'Kabongo', phone: '+243 812 345 001', businessName: 'Kabongo Immobilier', businessAddress: '123 Avenue Kasavubu, Gombe, Kinshasa', businessPhone: '+243 812 345 001', description: 'Agence immobilière spécialisée dans la vente et location de biens résidentiels et commerciaux à Kinshasa depuis plus de 10 ans.' },
    { email: 'vendeur2@uscg.cd', firstName: 'Marie-Claire', lastName: 'Mutombo', phone: '+243 812 345 002', businessName: 'Mutombo & Fils Electronics', businessAddress: '45 Boulevard du 30 Juin, Lingwala, Kinshasa', businessPhone: '+243 812 345 002', description: 'Importateur et distributeur d\'appareils électroménagers de grandes marques. Service après-vente garanti.' },
    { email: 'vendeur3@uscg.cd', firstName: 'Patrick', lastName: 'Lukusa', phone: '+243 812 345 003', businessName: 'Lukusa Foncier SARL', businessAddress: '78 Avenue de la Paix, Lubumbashi', businessPhone: '+243 812 345 003', description: 'Expert en transactions foncières dans le Haut-Katanga. Terrains résidentiels et commerciaux disponibles.' },
    { email: 'vendeur4@uscg.cd', firstName: 'Françoise', lastName: 'Mbaya', phone: '+243 812 345 004', businessName: 'Mbaya Home Design', businessAddress: '12 Rue de la Gare, Goma', businessPhone: '+243 812 345 004', description: 'Vente de mobilier moderne et accessoires de décoration intérieure. Livraison dans tout le Nord-Kivu.' },
    { email: 'vendeur5@uscg.cd', firstName: 'André', lastName: 'Nzeza', phone: '+243 812 345 005', businessName: 'Nzeza Properties', businessAddress: '234 Avenue Lumumba, Matadi', businessPhone: '+243 812 345 005', description: 'Agence immobilière leader à Matadi. Appartements, maisons et locaux commerciaux à vendre et à louer.' },
    { email: 'vendeur6@uscg.cd', firstName: 'Cécile', lastName: 'Kalonji', phone: '+243 812 345 006', businessName: 'Kalonji Électroménager', businessAddress: '56 Avenue Mobutu, Mbuji-Mayi', businessPhone: '+243 812 345 006', description: 'Spécialiste des appareils de cuisine et de lavage. Produits neufs et occasion de qualité supérieure.' },
    { email: 'vendeur7@uscg.cd', firstName: 'Roger', lastName: 'Tshimanga', phone: '+243 812 345 007', businessName: 'Tshimanga Real Estate', businessAddress: '89 Boulevard Sendwe, Kananga', businessPhone: '+243 812 345 007', description: 'Votre partenaire immobilier de confiance au Kasaï-Central. Plus de 15 ans d\'expérience sur le marché local.' },
    { email: 'vendeur8@uscg.cd', firstName: 'Brigitte', lastName: 'Mbuyi', phone: '+243 812 345 008', businessName: 'Mbuyi Tech Store', businessAddress: '34 Avenue Kabinda, Kisangani', businessPhone: '+243 812 345 008', description: 'Vente d\'appareils électroniques, TV, systèmes audio et climatiseurs. Garantie constructeur sur tous les produits.' },
    { email: 'vendeur9@uscg.cd', firstName: 'Joseph', lastName: 'Kalala', phone: '+243 812 345 009', businessName: 'Kalala Terrains', businessAddress: '67 Rue Commerciale, Kolwezi', businessPhone: '+243 812 345 009', description: 'Acquisition et vente de terrains dans la ceinture minière du Lualaba. Titres fonciers vérifiés.' },
    { email: 'vendeur10@uscg.cd', firstName: 'Isabelle', lastName: 'Ngoy', phone: '+243 812 345 010', businessName: 'Ngoy Habitat', businessAddress: '123 Avenue du Commerce, Bukavu', businessPhone: '+243 812 345 010', description: 'Construction et vente de maisons modernes au Sud-Kivu. Plans architecturaux personnalisés disponibles.' },
    { email: 'vendeur11@uscg.cd', firstName: 'Emmanuel', lastName: 'Kasongo', phone: '+243 812 345 011', businessName: 'Kasongo Motors & More', businessAddress: '45 Boulevard Central, Likasi', businessPhone: '+243 812 345 011', description: 'Vente de véhicules d\'occasion et articles divers. Importation directe depuis l\'Afrique du Sud.' },
    { email: 'vendeur12@uscg.cd', firstName: 'Solange', lastName: 'Ilunga', phone: '+243 812 345 012', businessName: 'Ilunga Immobilier Premium', businessAddress: '78 Avenue de l\'Indépendance, Kinshasa', businessPhone: '+243 812 345 012', description: 'Agence haut de gamme spécialisée dans les villas et propriétés de luxe à Kinshasa et environs.' },
    { email: 'vendeur13@uscg.cd', firstName: 'David', lastName: 'Mukendi', phone: '+243 812 345 013', businessName: 'Mukendi Appliances', businessAddress: '90 Rue de la Mission, Lubumbashi', businessPhone: '+243 812 345 013', description: 'Distributeur agréé LG et Samsung pour le Haut-Katanga. Service installation et maintenance inclus.' },
    { email: 'vendeur14@uscg.cd', firstName: 'Christine', lastName: 'Kabila', phone: '+243 812 345 014', businessName: 'Kabila Land Agency', businessAddress: '23 Avenue Patrice Lumumba, Goma', businessPhone: '+243 812 345 014', description: 'Spécialiste des terrains à bâtir dans la région de Goma. Conseils juridiques pour sécuriser vos achats.' },
    { email: 'vendeur15@uscg.cd', firstName: 'Alain', lastName: 'Lunda', phone: '+243 812 345 015', businessName: 'Lunda Meubles & Déco', businessAddress: '56 Boulevard du Peuple, Kinshasa', businessPhone: '+243 812 345 015', description: 'Fabrication et vente de meubles sur mesure. Bois massif importé. Livraison et montage gratuits à Kinshasa.' },
    { email: 'vendeur16@uscg.cd', firstName: 'Pélagie', lastName: 'Tshisekedi', phone: '+243 812 345 016', businessName: 'Tshisekedi Home Services', businessAddress: '34 Rue des Écoles, Mbuji-Mayi', businessPhone: '+243 812 345 016', description: 'Vente d\'équipements pour la maison et services d\'entretien. Électroménager, plomberie, électricité.' },
    { email: 'vendeur17@uscg.cd', firstName: 'Simon', lastName: 'Katumba', phone: '+243 812 345 017', businessName: 'Katumba Investments', businessAddress: '67 Avenue de la Révolution, Lubumbashi', businessPhone: '+243 812 345 017', description: 'Investissements immobiliers et fonciers au Katanga. Opportunités de placement à haut rendement.' },
    { email: 'vendeur18@uscg.cd', firstName: 'Joséphine', lastName: 'Mulongo', phone: '+243 812 345 018', businessName: 'Mulongo Electronics Plus', businessAddress: '89 Rue Commerciale, Kisangani', businessPhone: '+243 812 345 018', description: 'Magasin d\'électronique et électroménager à Kisangani. Prix compétitifs et facilités de paiement.' },
    { email: 'vendeur19@uscg.cd', firstName: 'Pierre', lastName: 'Nkulu', phone: '+243 812 345 019', businessName: 'Nkulu Real Estate Group', businessAddress: '12 Avenue du Travail, Kananga', businessPhone: '+243 812 345 019', description: 'Groupe immobilier présent dans les principales villes du Kasaï. Vente, location et gestion de biens.' },
    { email: 'vendeur20@uscg.cd', firstName: 'Éléonore', lastName: 'Kabeya', phone: '+243 812 345 020', businessName: 'Kabeya Market', businessAddress: '45 Boulevard de la Liberté, Matadi', businessPhone: '+243 812 345 020', description: 'Commerce général : électroménager, mobilier, articles divers. Importation directe d\'Europe et d\'Asie.' },
  ];

  const sellerPassword = await bcrypt.hash('Seller@123456', 10);
  const createdSellers: Array<{ id: string; email: string }> = [];

  for (const sellerData of sellersData) {
    const user = await prisma.user.upsert({
      where: { email: sellerData.email },
      update: { isSeller: true },
      create: {
        email: sellerData.email,
        password: sellerPassword,
        firstName: sellerData.firstName,
        lastName: sellerData.lastName,
        phone: sellerData.phone,
        role: Role.BUYER,
        isSeller: true,
        isActive: true,
        termsAcceptedAt: new Date(),
      },
    });

    await prisma.sellerRequest.upsert({
      where: { userId: user.id },
      update: { status: RequestStatus.APPROVED },
      create: {
        userId: user.id,
        businessName: sellerData.businessName,
        businessAddress: sellerData.businessAddress,
        businessPhone: sellerData.businessPhone,
        description: sellerData.description,
        status: RequestStatus.APPROVED,
        validatedAt: new Date(),
        validatedBy: superAdmin.id,
      },
    });

    createdSellers.push({ id: user.id, email: user.email });
  }

  console.log(`Created ${createdSellers.length} confirmed sellers`);

  // =========================================================================
  // 7. SEED 100 ADS
  // =========================================================================
  console.log('Seeding 100 ads...');

  // Helper function for Tiptap description
  function createDescription(text: string): Prisma.InputJsonValue {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    };
  }

  // Get categories with subcategories
  const categoriesWithSubs = await prisma.category.findMany({
    include: { subCategories: true },
  });

  const getCategoryId = (slug: string) => categoriesWithSubs.find(c => c.slug === slug)?.id;
  const getSubCategoryId = (categorySlug: string, subSlug: string) => {
    const cat = categoriesWithSubs.find(c => c.slug === categorySlug);
    return cat?.subCategories.find(s => s.slug === subSlug)?.id;
  };

  const adsData = [
    // ========== IMMOBILIER - 35 annonces ==========
    // Appartements (12)
    { title: 'Appartement 3 chambres à Gombe avec vue sur le fleuve', description: 'Magnifique appartement de standing dans un immeuble sécurisé. Vue panoramique sur le fleuve Congo. Parking souterrain inclus.', price: 250000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '45 Avenue du Commerce, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Studio meublé à louer à Lingwala', description: 'Studio moderne entièrement meublé et équipé. Idéal pour célibataire ou couple. Eau et électricité inclus dans le loyer.', price: 800000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '12 Rue des Fleurs, Lingwala, Kinshasa', city: 'Kinshasa' },
    { title: 'Appartement 2 chambres Lubumbashi centre', description: 'Appartement lumineux au centre-ville de Lubumbashi. Proche des commerces et transports. Gardien 24h/24.', price: 150000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '78 Avenue Moïse Tshombe, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Penthouse de luxe à Gombe', description: 'Exceptionnel penthouse de 4 chambres avec terrasse panoramique. Finitions haut de gamme, piscine privée sur le toit.', price: 800000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '1 Boulevard du 30 Juin, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Appartement F4 à louer Ngaliema', description: 'Bel appartement familial de 4 pièces à Ngaliema. Quartier résidentiel calme. Disponible immédiatement.', price: 1500000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '34 Avenue de la Démocratie, Ngaliema, Kinshasa', city: 'Kinshasa' },
    { title: 'Appartement neuf 2 chambres Goma', description: 'Appartement neuf dans résidence moderne à Goma. Sécurité renforcée, parking privé. Proche du lac Kivu.', price: 120000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '56 Avenue du Lac, Goma', city: 'Goma' },
    { title: 'Grand appartement 5 pièces Kinshasa', description: 'Spacieux appartement de 5 pièces avec vue dégagée. Idéal pour grande famille. Ascenseur et gardiennage.', price: 350000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '89 Avenue Kasavubu, Kinshasa', city: 'Kinshasa' },
    { title: 'Appartement meublé courte durée Lubumbashi', description: 'Location courte durée pour professionnels. Appartement tout équipé, wifi inclus. Minimum 1 mois.', price: 2000000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '23 Rue de la Mine, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Duplex 3 chambres à Bandalungwa', description: 'Magnifique duplex sur deux niveaux. 3 chambres, 2 salles de bain, terrasse privative. Quartier sécurisé.', price: 200000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '67 Avenue Bumba, Bandalungwa, Kinshasa', city: 'Kinshasa' },
    { title: 'Appartement économique Matadi', description: 'Appartement 2 pièces à prix abordable. Idéal premier achat ou investissement locatif. Bon état général.', price: 45000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '45 Rue du Port, Matadi', city: 'Matadi' },
    { title: 'Loft moderne Gombe', description: 'Loft contemporain de 150m² dans ancien entrepôt rénové. Hauteur sous plafond 4m. Style industriel chic.', price: 400000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '12 Rue de l\'Industrie, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Appartement 1 chambre Bukavu centre', description: 'Petit appartement fonctionnel au centre de Bukavu. Parfait pour étudiant ou jeune professionnel. Loyer modéré.', price: 400000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'appartements', location: '34 Avenue Patrice Lumumba, Bukavu', city: 'Bukavu' },

    // Maisons (10)
    { title: 'Maison 4 chambres avec jardin Kinshasa', description: 'Belle maison familiale avec grand jardin arboré. 4 chambres, 3 salles de bain, garage double. Quartier résidentiel.', price: 450000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '78 Avenue des Palmiers, Ngaliema, Kinshasa', city: 'Kinshasa' },
    { title: 'Maison traditionnelle rénovée Lubumbashi', description: 'Charmante maison coloniale entièrement rénovée. 3 chambres, grand salon, terrasse ombragée. Cachet authentique.', price: 280000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '56 Avenue de la Victoire, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Maison à louer Mont Ngaliema', description: 'Grande maison à louer sur les hauteurs de Kinshasa. Vue imprenable, air pur. 5 chambres, piscine, personnel de maison.', price: 5000000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '12 Chemin des Crêtes, Mont Ngaliema, Kinshasa', city: 'Kinshasa' },
    { title: 'Maison moderne Goma quartier volcans', description: 'Construction récente aux normes antisismiques. 4 chambres, bureau, cave. Proche des organisations internationales.', price: 320000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '89 Avenue des Volcans, Goma', city: 'Goma' },
    { title: 'Petite maison Kisangani', description: 'Maison compacte idéale pour jeune couple. 2 chambres, petit jardin. Quartier calme et sécurisé.', price: 85000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '45 Rue de la Tshopo, Kisangani', city: 'Kisangani' },
    { title: 'Maison avec dépendances Matadi', description: 'Grande propriété avec maison principale et 2 dépendances. Idéal pour famille nombreuse ou activité commerciale.', price: 180000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '23 Boulevard du Fleuve, Matadi', city: 'Matadi' },
    { title: 'Maison R+1 Lemba Kinshasa', description: 'Maison sur deux niveaux dans quartier universitaire. 6 pièces, possibilité de division en 2 logements.', price: 220000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '67 Avenue de l\'Université, Lemba, Kinshasa', city: 'Kinshasa' },
    { title: 'Maison plain-pied Kolwezi', description: 'Maison de plain-pied dans cité minière. 3 chambres, garage, jardin. Propriété clôturée et sécurisée.', price: 150000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '34 Cité des Cadres, Kolwezi', city: 'Kolwezi' },
    { title: 'Maison à rénover Kinshasa opportunité', description: 'Maison à rénover dans excellent emplacement. Terrain de 800m², grande surface habitable. Prix négociable.', price: 120000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '90 Avenue de la Justice, Kinshasa', city: 'Kinshasa' },
    { title: 'Maison de charme Bukavu lac', description: 'Jolie maison avec vue sur le lac Kivu. 3 chambres, terrasse, accès direct au lac. Calme absolu.', price: 250000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'maisons', location: '12 Chemin du Lac, Bukavu', city: 'Bukavu' },

    // Villas (5)
    { title: 'Villa de luxe Gombe avec piscine', description: 'Somptueuse villa de 6 chambres dans le quartier diplomatique. Piscine, tennis, jardin paysager. Sécurité maximale.', price: 1500000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'villas', location: '1 Avenue des Ambassadeurs, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Villa contemporaine Lubumbashi', description: 'Villa d\'architecte de 5 chambres. Design moderne, matériaux nobles. Domotique intégrée, panneaux solaires.', price: 950000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'villas', location: '45 Avenue Golf, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Villa coloniale rénovée Kinshasa', description: 'Magnifique villa des années 50 entièrement restaurée. Charme d\'époque avec confort moderne. 4 chambres, dépendances.', price: 700000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'villas', location: '78 Avenue Tombalbaye, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Villa bord de lac Bukavu', description: 'Exceptionnelle villa les pieds dans l\'eau du lac Kivu. 5 chambres, ponton privé, vue spectaculaire.', price: 600000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'villas', location: '23 Presqu\'île de Nyawera, Bukavu', city: 'Bukavu' },
    { title: 'Villa sécurisée Ngaliema hauteurs', description: 'Villa haut standing sur terrain de 2000m². 6 chambres, quartier ambassades. Gardiennage 24h/24, générateur.', price: 1200000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'villas', location: '56 Avenue de la Colline, Ngaliema, Kinshasa', city: 'Kinshasa' },

    // Bureaux (4)
    { title: 'Bureau 100m² Gombe centre affaires', description: 'Espace de bureau moderne dans immeuble de standing. Open space, climatisation centrale, parking. Idéal PME.', price: 3000000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'bureaux', location: '89 Avenue du Commerce, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Plateau de bureaux 500m² Kinshasa', description: 'Grand plateau de bureaux à aménager. Immeuble récent, ascenseur, parking souterrain. Location longue durée.', price: 12000000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'bureaux', location: '12 Boulevard du 30 Juin, Kinshasa', city: 'Kinshasa' },
    { title: 'Bureau privatif Lubumbashi', description: 'Bureau équipé dans centre d\'affaires. Salle de réunion partagée, réception, wifi. Bail flexible.', price: 1500000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'bureaux', location: '34 Avenue Sendwe, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Immeuble de bureaux à vendre Kinshasa', description: 'Immeuble R+3 entièrement loué. Rendement locatif garanti 8%. Excellent investissement.', price: 2500000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'bureaux', location: '67 Avenue de la Paix, Kinshasa', city: 'Kinshasa' },

    // Locaux commerciaux (4)
    { title: 'Boutique 50m² Avenue du Commerce', description: 'Local commercial bien situé sur axe passant. Vitrine, réserve, sanitaires. Libre de suite.', price: 2500000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'locaux-commerciaux', location: '45 Avenue du Commerce, Kinshasa', city: 'Kinshasa' },
    { title: 'Magasin 200m² centre Lubumbashi', description: 'Grand magasin en centre-ville de Lubumbashi. Idéal commerce de détail ou showroom. Fort passage piéton.', price: 5000000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'locaux-commerciaux', location: '78 Avenue Kasavubu, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Restaurant équipé à reprendre', description: 'Fonds de commerce restaurant 80 couverts. Équipement cuisine professionnel inclus. Clientèle établie.', price: 150000000, quantity: null, type: AdType.SALE, categorySlug: 'immobilier', subCategorySlug: 'locaux-commerciaux', location: '23 Rue Gastronomique, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Entrepôt 1000m² zone industrielle', description: 'Entrepôt couvert avec quai de chargement. Accès poids lourds, bureau intégré. Gardiennage inclus.', price: 8000000, quantity: null, type: AdType.RENT, categorySlug: 'immobilier', subCategorySlug: 'locaux-commerciaux', location: '90 Zone Industrielle, Kinshasa', city: 'Kinshasa' },

    // ========== FONCIER - 20 annonces ==========
    // Terrains résidentiels (8)
    { title: 'Terrain 500m² Mont Ngaliema', description: 'Parcelle viabilisée sur les hauteurs de Kinshasa. Eau, électricité à proximité. Titre foncier disponible.', price: 80000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-residentiels', location: '12 Chemin des Collines, Mont Ngaliema, Kinshasa', city: 'Kinshasa' },
    { title: 'Terrain constructible Lubumbashi Golf', description: 'Belle parcelle de 1000m² dans quartier Golf. Environnement résidentiel haut de gamme. Certificat d\'enregistrement.', price: 150000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-residentiels', location: '45 Avenue Golf, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Lot terrain Goma quartier Himbi', description: 'Terrain de 600m² dans nouveau lotissement sécurisé. Routes bitumées, éclairage public. Titre foncier.', price: 45000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-residentiels', location: '78 Lotissement Himbi, Goma', city: 'Goma' },
    { title: 'Parcelle 400m² Lemba Kinshasa', description: 'Terrain à bâtir dans quartier universitaire animé. Proche transports et commerces. Prix négociable.', price: 35000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-residentiels', location: '56 Avenue de l\'Université, Lemba, Kinshasa', city: 'Kinshasa' },
    { title: 'Terrain vue lac Bukavu', description: 'Parcelle exceptionnelle de 800m² avec vue panoramique sur le lac Kivu. Accès route goudronnée.', price: 120000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-residentiels', location: '23 Colline Nyalukemba, Bukavu', city: 'Bukavu' },
    { title: 'Terrain 300m² Matadi ville', description: 'Petite parcelle en centre-ville de Matadi. Idéal maison ou petit immeuble. Documents en règle.', price: 25000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-residentiels', location: '89 Rue Centrale, Matadi', city: 'Matadi' },
    { title: 'Grande parcelle 2000m² Kinshasa', description: 'Terrain spacieux pouvant accueillir plusieurs constructions. Clôturé, gardé. Titre foncier authentique.', price: 300000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-residentiels', location: '34 Avenue de la Démocratie, Kinshasa', city: 'Kinshasa' },
    { title: 'Terrain plat Kisangani résidentiel', description: 'Parcelle de 700m² dans quartier résidentiel établi. Voisinage de qualité, environnement calme.', price: 40000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-residentiels', location: '67 Quartier des Cadres, Kisangani', city: 'Kisangani' },

    // Terrains commerciaux (6)
    { title: 'Terrain commercial bord de route Kinshasa', description: 'Parcelle de 1500m² sur axe principal très passant. Idéal station-service, supermarché ou showroom.', price: 500000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-commerciaux', location: '12 Boulevard Lumumba, Kinshasa', city: 'Kinshasa' },
    { title: 'Terrain zone industrielle Lubumbashi', description: 'Parcelle de 5000m² en zone industrielle. Accès voie ferrée à proximité. Idéal usine ou entrepôt logistique.', price: 200000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-commerciaux', location: '45 Zone Industrielle, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Terrain commercial centre Goma', description: 'Emplacement stratégique au cœur de Goma. 800m² pour développement commercial. Fort potentiel.', price: 180000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-commerciaux', location: '78 Avenue du Commerce, Goma', city: 'Goma' },
    { title: 'Terrain pour hôtel Bukavu lac', description: 'Parcelle de 3000m² en bord de lac. Idéal projet hôtelier ou resort. Vue exceptionnelle.', price: 400000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-commerciaux', location: '23 Rive du Lac, Bukavu', city: 'Bukavu' },
    { title: 'Terrain commercial Matadi port', description: 'Parcelle de 2000m² près du port de Matadi. Idéal activité import-export ou logistique.', price: 250000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-commerciaux', location: '56 Zone Portuaire, Matadi', city: 'Matadi' },
    { title: 'Terrain angle de rue Kinshasa', description: 'Terrain d\'angle de 600m² sur deux rues passantes. Excellente visibilité commerciale. Titre foncier.', price: 350000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-commerciaux', location: '89 Carrefour Central, Kinshasa', city: 'Kinshasa' },

    // Terrains agricoles (6)
    { title: 'Ferme 10 hectares Bas-Congo', description: 'Exploitation agricole avec maison de gardien. Terre fertile, source d\'eau naturelle. Cultures en place.', price: 80000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-agricoles', location: 'Village de Mbanza, Kongo Central', city: 'Matadi' },
    { title: 'Terrain agricole 5 hectares Katanga', description: 'Terre arable de qualité pour maraîchage ou élevage. Accès route, électrification possible.', price: 45000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-agricoles', location: 'Périphérie de Likasi', city: 'Likasi' },
    { title: 'Concession 50 hectares Équateur', description: 'Grande concession agricole pour projet d\'envergure. Palmiers, cacao possible. Attestation villageoise.', price: 150000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-agricoles', location: 'Région de Mbandaka', city: 'Kisangani' },
    { title: 'Terrain 2 hectares près de Kinshasa', description: 'Parcelle agricole à 30km de Kinshasa. Idéal ferme maraîchère ou avicole. Route praticable toute l\'année.', price: 25000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-agricoles', location: 'Commune de Maluku, Kinshasa', city: 'Kinshasa' },
    { title: 'Verger 3 hectares Kasaï', description: 'Verger de manguiers en production. 200 arbres matures. Rendement annuel prouvé. Gardien sur place.', price: 60000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-agricoles', location: 'Périphérie de Kananga', city: 'Kananga' },
    { title: 'Terrain élevage 8 hectares Sud-Kivu', description: 'Pâturage naturel clôturé pour élevage bovin. Point d\'eau, abri bétail existant. Titre coutumier.', price: 70000000, quantity: null, type: AdType.SALE, categorySlug: 'foncier', subCategorySlug: 'terrains-agricoles', location: 'Plaine de la Ruzizi, Bukavu', city: 'Bukavu' },

    // ========== ELECTROMENAGER - 30 annonces ==========
    // Cuisine (8)
    { title: 'Réfrigérateur Samsung 400L double porte', description: 'Réfrigérateur Samsung No Frost de 400 litres. Classe énergétique A++. État neuf, sous garantie.', price: 1200000, quantity: 3, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'cuisine', location: '45 Avenue du Commerce, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Cuisinière à gaz 5 feux avec four', description: 'Cuisinière professionnelle en inox. 5 brûleurs + four électrique. Marque Bosch, garantie 2 ans.', price: 850000, quantity: 5, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'cuisine', location: '78 Boulevard Lumumba, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Micro-ondes LG 30L avec grill', description: 'Micro-ondes combiné LG avec fonction grill et convection. Capacité 30 litres. Parfait état.', price: 180000, quantity: 8, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'cuisine', location: '12 Rue de la Gare, Goma', city: 'Goma' },
    { title: 'Congélateur coffre 300L', description: 'Congélateur horizontal grande capacité. Idéal commerce ou grande famille. Très économe en énergie.', price: 650000, quantity: 4, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'cuisine', location: '56 Avenue Sendwe, Kinshasa', city: 'Kinshasa' },
    { title: 'Robot cuisine multifonction', description: 'Robot ménager Moulinex avec accessoires complets. Mixeur, hachoir, pétrin. Neuf dans emballage.', price: 250000, quantity: 10, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'cuisine', location: '34 Rue Commerciale, Matadi', city: 'Matadi' },
    { title: 'Friteuse professionnelle double bac', description: 'Friteuse électrique 2x6L pour restauration. Thermostat réglable, vidange facile. Très bon état.', price: 350000, quantity: 2, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'cuisine', location: '89 Avenue Mobutu, Kisangani', city: 'Kisangani' },
    { title: 'Lave-vaisselle Whirlpool 12 couverts', description: 'Lave-vaisselle encastrable ou pose libre. Programmes multiples, silencieux. Peu utilisé.', price: 450000, quantity: 3, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'cuisine', location: '23 Avenue de la Paix, Bukavu', city: 'Bukavu' },
    { title: 'Machine à café expresso automatique', description: 'Cafetière Delonghi avec broyeur intégré. Prépare cappuccino, latte macchiato. Garantie fabricant.', price: 550000, quantity: 5, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'cuisine', location: '67 Boulevard Central, Kinshasa', city: 'Kinshasa' },

    // Lavage (8)
    { title: 'Machine à laver LG 8kg automatique', description: 'Lave-linge LG Direct Drive 8kg. 14 programmes, économe en eau et électricité. Garantie 10 ans moteur.', price: 750000, quantity: 6, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'lavage', location: '45 Avenue Kasavubu, Kinshasa', city: 'Kinshasa' },
    { title: 'Sèche-linge Bosch condensation', description: 'Sèche-linge à condensation 7kg. Séchage délicat textiles fragiles. Bac récupération eau.', price: 550000, quantity: 3, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'lavage', location: '78 Rue de la Mine, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Lave-linge séchant Samsung 10kg', description: 'Combo lave-linge séchant Samsung. Lave 10kg, sèche 6kg. Technologie EcoBubble. État impeccable.', price: 950000, quantity: 2, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'lavage', location: '12 Avenue du Commerce, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Machine à laver semi-automatique', description: 'Machine à laver économique avec essoreuse séparée. Capacité 7kg. Idéal petits budgets.', price: 180000, quantity: 15, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'lavage', location: '56 Boulevard Lumumba, Matadi', city: 'Matadi' },
    { title: 'Fer à repasser vapeur professionnel', description: 'Centrale vapeur Philips haute pression. Défroissage vertical, réservoir 2L. Neuf.', price: 120000, quantity: 20, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'lavage', location: '34 Rue Centrale, Goma', city: 'Goma' },
    { title: 'Aspirateur sans fil Dyson V11', description: 'Aspirateur balai Dyson dernière génération. Autonomie 60 min, puissance exceptionnelle. Comme neuf.', price: 650000, quantity: 4, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'lavage', location: '89 Avenue de la Démocratie, Kinshasa', city: 'Kinshasa' },
    { title: 'Nettoyeur vapeur multifonction', description: 'Nettoyeur vapeur Karcher pour sols, vitres, tissus. Accessoires complets. Hygiène parfaite.', price: 280000, quantity: 7, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'lavage', location: '23 Boulevard Sendwe, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Machine à laver industrielle 15kg', description: 'Lave-linge professionnel pour hôtel ou blanchisserie. Capacité 15kg, robuste et fiable.', price: 1800000, quantity: 2, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'lavage', location: '67 Zone Industrielle, Kinshasa', city: 'Kinshasa' },

    // Climatisation (7)
    { title: 'Climatiseur split Samsung 12000 BTU', description: 'Climatiseur Samsung Inverter silencieux et économique. Installation comprise dans la région de Kinshasa.', price: 650000, quantity: 10, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'climatisation', location: '45 Avenue du 30 Juin, Kinshasa', city: 'Kinshasa' },
    { title: 'Climatiseur mobile 9000 BTU', description: 'Climatiseur portable avec télécommande. Idéal location ou pièce sans possibilité d\'installation fixe.', price: 350000, quantity: 8, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'climatisation', location: '78 Rue Commerciale, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Ventilateur plafonnier grand diamètre', description: 'Ventilateur de plafond 150cm avec luminaire intégré. Télécommande, 3 vitesses. Design moderne.', price: 85000, quantity: 25, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'climatisation', location: '12 Avenue Patrice Lumumba, Goma', city: 'Goma' },
    { title: 'Climatiseur cassette bureau 24000 BTU', description: 'Climatiseur encastrable plafond pour grand espace. Installation professionnelle disponible.', price: 1200000, quantity: 5, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'climatisation', location: '56 Boulevard Central, Kinshasa', city: 'Kinshasa' },
    { title: 'Ventilateur sur pied télécommandé', description: 'Ventilateur oscillant avec télécommande et minuterie. Silencieux, 5 pales. Plusieurs coloris.', price: 45000, quantity: 50, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'climatisation', location: '34 Avenue Mobutu, Kisangani', city: 'Kisangani' },
    { title: 'Climatiseur gainable 36000 BTU', description: 'Système de climatisation centralisée pour villa ou bureau. Discret et performant. Sur devis.', price: 2500000, quantity: 3, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'climatisation', location: '89 Quartier Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Refroidisseur d\'air évaporatif', description: 'Alternative économique à la climatisation. Rafraîchit naturellement par évaporation. Grand réservoir.', price: 120000, quantity: 15, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'climatisation', location: '23 Rue de la Gare, Matadi', city: 'Matadi' },

    // TV & Audio (7)
    { title: 'TV Samsung 55 pouces 4K Smart TV', description: 'Téléviseur Samsung Crystal UHD 4K. Smart TV avec Netflix, YouTube intégrés. Garantie 2 ans.', price: 850000, quantity: 8, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'tv-audio', location: '45 Avenue Kasavubu, Kinshasa', city: 'Kinshasa' },
    { title: 'Home cinéma Sony 5.1 surround', description: 'Système audio 5.1 Sony avec Blu-ray. Son immersif, caisson de basse puissant. État neuf.', price: 450000, quantity: 5, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'tv-audio', location: '78 Boulevard Lumumba, Lubumbashi', city: 'Lubumbashi' },
    { title: 'TV LG 65 pouces OLED', description: 'Téléviseur LG OLED65 avec qualité d\'image exceptionnelle. Noirs parfaits, contraste infini.', price: 1500000, quantity: 3, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'tv-audio', location: '12 Avenue du Commerce, Gombe, Kinshasa', city: 'Kinshasa' },
    { title: 'Barre de son Samsung avec caisson', description: 'Barre de son Samsung 3.1 canaux. Son clair et basse profonde. Connexion Bluetooth et HDMI.', price: 280000, quantity: 12, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'tv-audio', location: '56 Rue Centrale, Goma', city: 'Goma' },
    { title: 'Enceinte Bluetooth JBL portable', description: 'Enceinte JBL PartyBox 100 avec lumières LED. Autonomie 12h, étanche. Parfait pour fêtes.', price: 350000, quantity: 10, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'tv-audio', location: '34 Avenue de la Paix, Bukavu', city: 'Bukavu' },
    { title: 'TV Hisense 43 pouces Full HD', description: 'Téléviseur Hisense 43 pouces LED Full HD. Smart TV basique, bon rapport qualité-prix.', price: 320000, quantity: 15, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'tv-audio', location: '89 Boulevard Sendwe, Kisangani', city: 'Kisangani' },
    { title: 'Vidéoprojecteur HD portable', description: 'Projecteur mini HD 1080p avec batterie intégrée. Idéal présentations ou cinéma maison.', price: 180000, quantity: 8, type: AdType.SALE, categorySlug: 'electromenager', subCategorySlug: 'tv-audio', location: '23 Rue Commerciale, Matadi', city: 'Matadi' },

    // ========== DIVERS - 15 annonces ==========
    // Meubles (5)
    { title: 'Salon cuir véritable 7 places', description: 'Ensemble salon en cuir pleine fleur. Canapé 3 places, 2 fauteuils. Coloris marron cognac.', price: 1800000, quantity: 2, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'meubles', location: '45 Avenue du Commerce, Kinshasa', city: 'Kinshasa' },
    { title: 'Table à manger 8 personnes avec chaises', description: 'Table en bois massif avec 8 chaises assorties. Style contemporain africain. Fabrication artisanale.', price: 650000, quantity: 3, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'meubles', location: '78 Boulevard Lumumba, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Lit king size avec matelas orthopédique', description: 'Lit 180x200 en bois de wengé avec tête de lit capitonnée. Matelas à ressorts ensachés inclus.', price: 850000, quantity: 4, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'meubles', location: '12 Rue de la Gare, Goma', city: 'Goma' },
    { title: 'Bureau direction avec fauteuil', description: 'Bureau direction en acajou avec rangements. Fauteuil cuir pivotant inclus. Très bon état.', price: 450000, quantity: 5, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'meubles', location: '56 Avenue Sendwe, Kinshasa', city: 'Kinshasa' },
    { title: 'Armoire dressing 4 portes', description: 'Grande armoire avec miroir central. Nombreux rangements, tiroirs intégrés. Montage inclus Kinshasa.', price: 380000, quantity: 6, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'meubles', location: '34 Rue Centrale, Bukavu', city: 'Bukavu' },

    // Véhicules (5)
    { title: 'Toyota Land Cruiser V8 2018', description: 'Land Cruiser VX diesel automatique. 85000 km, carnet d\'entretien complet. Excellent état.', price: 75000000, quantity: 1, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'vehicules', location: '45 Avenue de la Victoire, Kinshasa', city: 'Kinshasa' },
    { title: 'Mercedes Classe E 2020', description: 'Mercedes E300 essence, intérieur cuir beige. Toutes options, 45000 km. Première main.', price: 65000000, quantity: 1, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'vehicules', location: '78 Boulevard du 30 Juin, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Moto Honda CB125F neuve', description: 'Moto Honda CB125F 0 km. Garantie constructeur 2 ans. Idéal déplacements urbains.', price: 2500000, quantity: 5, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'vehicules', location: '12 Avenue Mobutu, Goma', city: 'Goma' },
    { title: 'Toyota Hilux double cabine 2019', description: 'Pick-up Hilux 2.4 diesel 4x4. 62000 km, usage professionnel. Capacité de charge importante.', price: 45000000, quantity: 1, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'vehicules', location: '56 Zone Industrielle, Kinshasa', city: 'Kinshasa' },
    { title: 'Bus Mercedes Sprinter 19 places', description: 'Minibus Sprinter 516 CDI. Idéal transport personnel ou activité commerciale. Climatisé.', price: 35000000, quantity: 1, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'vehicules', location: '34 Avenue Kasavubu, Matadi', city: 'Matadi' },

    // Services (5)
    { title: 'Service de déménagement professionnel', description: 'Entreprise de déménagement avec camions et personnel qualifié. Devis gratuit. Kinshasa et environs.', price: 150000, quantity: null, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'services', location: '45 Avenue du Travail, Kinshasa', city: 'Kinshasa' },
    { title: 'Service de nettoyage résidentiel', description: 'Équipe de nettoyage professionnelle pour maisons et appartements. Produits fournis. Tarif horaire.', price: 25000, quantity: null, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'services', location: '78 Boulevard Central, Lubumbashi', city: 'Lubumbashi' },
    { title: 'Cours particuliers mathématiques', description: 'Professeur certifié propose cours de maths. Primaire, secondaire, préparation examens. À domicile.', price: 30000, quantity: null, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'services', location: '12 Quartier Universitaire, Kinshasa', city: 'Kinshasa' },
    { title: 'Service traiteur événements', description: 'Traiteur professionnel pour mariages, anniversaires, séminaires. Menu personnalisé. 50 à 500 personnes.', price: 500000, quantity: null, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'services', location: '56 Avenue de la Gastronomie, Goma', city: 'Goma' },
    { title: 'Installation et maintenance informatique', description: 'Technicien informatique : installation réseaux, maintenance PC, récupération données. Intervention rapide.', price: 50000, quantity: null, type: AdType.SALE, categorySlug: 'divers', subCategorySlug: 'services', location: '34 Centre d\'Affaires, Kinshasa', city: 'Kinshasa' },
  ];

  let adCount = 0;
  let sellerIdx = 0;

  for (const adData of adsData) {
    const sellerUser = createdSellers[sellerIdx % createdSellers.length];
    const categoryId = getCategoryId(adData.categorySlug);
    const subCategoryId = adData.subCategorySlug ? getSubCategoryId(adData.categorySlug, adData.subCategorySlug) : undefined;

    if (!categoryId) {
      console.warn(`Category not found: ${adData.categorySlug}`);
      continue;
    }

    // Check if ad already exists for this seller with same title
    const existingAd = await prisma.ad.findFirst({
      where: {
        title: adData.title,
        userId: sellerUser.id,
      },
    });

    if (!existingAd) {
      await prisma.ad.create({
        data: {
          title: adData.title,
          description: createDescription(adData.description),
          price: adData.price,
          quantity: adData.quantity,
          type: adData.type,
          status: AdStatus.APPROVED,
          city: adData.city,
          location: adData.location,
          categoryId,
          subCategoryId,
          userId: sellerUser.id,
          validatedAt: new Date(),
          validatedById: superAdmin.id,
        },
      });
      adCount++;
    }

    sellerIdx++;
  }

  console.log(`Created ${adCount} ads`);

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n========================================');
  console.log('Seed completed successfully!');
  console.log('========================================');
  console.log('\nTest accounts:');
  console.log('- SUPER_ADMIN: admin@uscg.com / Admin@123456');
  console.log('- OPERATOR: operator@uscg.com / Operator@123456');
  console.log('- BUYER: buyer@test.com / Buyer@123456');
  console.log('- SELLER: seller@test.com / Buyer@123456');
  console.log('\nPending seller requests:');
  console.log('- pending1@test.com / Buyer@123456 (Mbala Electronics)');
  console.log('- pending2@test.com / Buyer@123456 (Immo Kinshasa Plus)');
  console.log('\nMarketplace data:');
  console.log(`- ${createdSellers.length} confirmed sellers (vendeur1@uscg.cd ... vendeur20@uscg.cd / Seller@123456)`);
  console.log(`- ${adCount} approved ads (Immobilier, Foncier, Electroménager, Divers)`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
