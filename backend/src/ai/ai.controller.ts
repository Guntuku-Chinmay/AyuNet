import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiSummarizeDto } from './dto/ai-summarize.dto';
import { AiGenerateDto } from './dto/ai-generate.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Interactive clinical & patient AI assistant chat' })
  @ApiResponse({ status: 200, description: 'AI chat response with clinical disclaimer.' })
  chat(
    @Body() dto: AiChatDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.aiService.chat(dto, user.id, ip, ua);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize clinical records, EMR notes, or consultations' })
  summarize(
    @Body() dto: AiSummarizeDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.aiService.summarize(dto, user.id, ip, ua);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Draft clinical notes, referral letters, or discharge summaries' })
  generate(
    @Body() dto: AiGenerateDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.aiService.generate(dto, user.id, ip, ua);
  }

  @Post('extract')
  @ApiOperation({ summary: 'Extract structured medical entities from clinical text' })
  extract(
    @Body('text') text: string,
    @CurrentUser() user: any
  ) {
    return this.aiService.extract(text, user.id);
  }

  @Post('search')
  @ApiOperation({ summary: 'RAG knowledge base document search' })
  search(
    @Body('query') query: string,
    @CurrentUser() user: any
  ) {
    return this.aiService.search(query, user.id);
  }

  @Get('providers')
  @ApiOperation({ summary: 'List supported LLM provider adapters' })
  getProviders() {
    return this.aiService.getProviders();
  }

  @Get('prompts')
  @ApiOperation({ summary: 'List system prompt templates' })
  getPrompts() {
    return this.aiService.getPrompts();
  }

  @Patch('prompts/:id')
  @ApiOperation({ summary: 'Update system prompt template content or sampling parameters' })
  updatePrompt(
    @Param('id') id: string,
    @Body() dto: UpdatePromptDto,
    @CurrentUser() user: any
  ) {
    return this.aiService.updatePrompt(id, dto, user.id);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get AI request, token usage, and latency statistics' })
  getUsage() {
    return this.aiService.getUsage();
  }

  @Get('feedback')
  @ApiOperation({ summary: 'List user feedback logs on AI outputs' })
  getFeedback() {
    return this.aiService.getFeedback();
  }
}
