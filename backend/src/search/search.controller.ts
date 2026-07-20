import { Controller, Get, Post, Body, Query, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SearchService } from './search.service';
import { GlobalSearchQueryDto } from './dto/global-search-query.dto';
import { SaveSearchDto } from './dto/save-search.dto';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Unified global multi-entity full-text search' })
  @ApiResponse({ status: 200, description: 'Search results matching term.' })
  search(
    @Query() dto: GlobalSearchQueryDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.searchService.search(dto, user.id, ip, ua);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get autocomplete type-ahead suggestions' })
  @ApiQuery({ name: 'q', required: true, description: 'Prefix query string' })
  getSuggestions(@Query('q') q: string) {
    return this.searchService.getSuggestions(q);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user recent search history' })
  getHistory(@CurrentUser() user: any) {
    return this.searchService.getHistory(user.id);
  }

  @Post('saved')
  @ApiOperation({ summary: 'Save a custom search query configuration' })
  saveSearch(
    @Body() dto: SaveSearchDto,
    @CurrentUser() user: any
  ) {
    return this.searchService.saveSearch(dto, user.id, user.id);
  }

  @Get('saved')
  @ApiOperation({ summary: 'List user saved search queries' })
  getSavedSearches(@CurrentUser() user: any) {
    return this.searchService.getSavedSearches(user.id);
  }

  @Delete('saved/:id')
  @ApiOperation({ summary: 'Delete a saved search configuration' })
  deleteSavedSearch(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.searchService.deleteSavedSearch(id, user.id);
  }

  @Post('reindex')
  @ApiOperation({ summary: 'Trigger full-text search index reindexing' })
  reindex(
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.searchService.reindex(user.id, ip, ua);
  }

  @Get('index/status')
  @ApiOperation({ summary: 'Get search engine index health status' })
  getIndexStatus() {
    return this.searchService.getIndexStatus();
  }
}
