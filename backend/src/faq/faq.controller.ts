import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { FaqService } from './faq.service';
import { CreateFaqCategoryDto, UpdateFaqCategoryDto, CreateFaqDto, UpdateFaqDto } from './dto';
import { Public, Roles, RolesGuard } from '../auth';
import { Role } from '@prisma/client';

@ApiTags('FAQ')
@Controller('faq')
@SkipThrottle({ short: true, medium: true, long: true })
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // ============================================
  // Public endpoints
  // ============================================

  /**
   * Get all active categories (public)
   */
  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all active FAQ categories (public)' })
  @ApiResponse({ status: 200, description: 'List of active FAQ categories' })
  async getCategories() {
    return this.faqService.getCategories();
  }

  /**
   * Get all active FAQs grouped by category (public)
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all FAQs grouped by category (public)' })
  @ApiResponse({ status: 200, description: 'FAQs grouped by category' })
  async getFaqsGrouped() {
    return this.faqService.getFaqsGrouped();
  }

  /**
   * Get FAQs by category slug (public)
   */
  @Get('category/:slug')
  @Public()
  @ApiOperation({ summary: 'Get FAQs by category slug (public)' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category with its FAQs' })
  async getFaqsByCategorySlug(@Param('slug') slug: string) {
    return this.faqService.getFaqsByCategorySlug(slug);
  }

  // ============================================
  // Admin endpoints - Categories
  // ============================================

  /**
   * Get all categories including inactive (admin)
   */
  @Get('admin/categories')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all FAQ categories (admin)' })
  @ApiResponse({ status: 200, description: 'List of all FAQ categories' })
  async getAllCategories() {
    return this.faqService.getAllCategories();
  }

  /**
   * Get category by ID (admin)
   */
  @Get('admin/categories/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get FAQ category by ID (admin)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'FAQ category details' })
  async getCategoryById(@Param('id') id: string) {
    return this.faqService.getCategoryById(id);
  }

  /**
   * Create a new FAQ category (admin)
   */
  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new FAQ category (admin)' })
  @ApiResponse({ status: 201, description: 'FAQ category created' })
  async createCategory(@Body() dto: CreateFaqCategoryDto) {
    return this.faqService.createCategory(dto);
  }

  /**
   * Update a FAQ category (admin)
   */
  @Patch('categories/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a FAQ category (admin)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'FAQ category updated' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateFaqCategoryDto) {
    return this.faqService.updateCategory(id, dto);
  }

  /**
   * Delete a FAQ category (admin)
   */
  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a FAQ category (admin)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'FAQ category deleted' })
  async deleteCategory(@Param('id') id: string) {
    return this.faqService.deleteCategory(id);
  }

  // ============================================
  // Admin endpoints - FAQs
  // ============================================

  /**
   * Get all FAQs including inactive (admin)
   */
  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all FAQs (admin)' })
  @ApiResponse({ status: 200, description: 'List of all FAQs' })
  async getAllFaqs() {
    return this.faqService.getAllFaqs();
  }

  /**
   * Get FAQ by ID (admin)
   */
  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get FAQ by ID (admin)' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiResponse({ status: 200, description: 'FAQ details' })
  async getFaqById(@Param('id') id: string) {
    return this.faqService.getFaqById(id);
  }

  /**
   * Create a new FAQ (admin)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new FAQ (admin)' })
  @ApiResponse({ status: 201, description: 'FAQ created' })
  async createFaq(@Body() dto: CreateFaqDto) {
    return this.faqService.createFaq(dto);
  }

  /**
   * Update a FAQ (admin)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a FAQ (admin)' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiResponse({ status: 200, description: 'FAQ updated' })
  async updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqService.updateFaq(id, dto);
  }

  /**
   * Delete a FAQ (admin)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a FAQ (admin)' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiResponse({ status: 200, description: 'FAQ deleted' })
  async deleteFaq(@Param('id') id: string) {
    return this.faqService.deleteFaq(id);
  }
}
