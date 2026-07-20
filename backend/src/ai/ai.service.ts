import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiSummarizeDto } from './dto/ai-summarize.dto';
import { AiGenerateDto } from './dto/ai-generate.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

@Injectable()
export class AiService {
  private providers = ['openai', 'azure-openai', 'anthropic', 'google-gemini', 'ollama', 'custom-rest'];
  private prompts = new Map<string, { id: string; name: string; category: string; content: string; temperature: number; isActive: boolean; version: number }>();
  private usage = { totalRequests: 1420, totalTokens: 384500, averageLatencyMs: 420, estimatedCostUsd: 1.92 };
  private feedback: Array<{ id: string; requestId: string; rating: number; comment?: string; createdAt: Date }> = [];

  constructor(private prisma: PrismaService) {
    this.prompts.set('prt-clinical-note', {
      id: 'prt-clinical-note',
      name: 'Clinical Note Draft Assistant',
      category: 'CLINICAL',
      content: 'You are an AI clinical assistant aiding a licensed physician in drafting SOAP notes.',
      temperature: 0.2,
      isActive: true,
      version: 1,
    });
    this.prompts.set('prt-patient-bot', {
      id: 'prt-patient-bot',
      name: 'Patient Health Assistant',
      category: 'PATIENT',
      content: 'You are an empathetic healthcare assistant helping patients navigate hospital services.',
      temperature: 0.5,
      isActive: true,
      version: 1,
    });
  }

  redactPii(text: string): string {
    return text
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
      .replace(/(\+\d{1,3}[- ]?)?\d{10}/g, '[REDACTED_PHONE]');
  }

  appendDisclaimer(text: string): string {
    const disclaimer = '\n\n[NOTICE: AI-generated assistance. Clinical decisions remain the sole responsibility of licensed healthcare professionals. Always consult a qualified medical doctor for diagnosis and treatment.]';
    return text.endsWith(disclaimer) ? text : `${text}${disclaimer}`;
  }

  async chat(dto: AiChatDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const sanitizedInput = this.redactPii(dto.message);
    const provider = dto.provider || 'openai';

    const rawResponse = `Based on clinical guidelines for '${sanitizedInput}', ensure patient hydration, monitor vital signs, and adhere to prescribed dosage instructions.`;
    const responseWithDisclaimer = this.appendDisclaimer(rawResponse);

    this.usage.totalRequests += 1;
    this.usage.totalTokens += 180;

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'AI_CHAT_REQUEST', 'AiService', provider, null, { input: sanitizedInput, tokens: 180 }, ipAddress, userAgent, tx);
    });

    return {
      conversationId: dto.conversationId || `conv-${Date.now()}`,
      provider,
      modelUsed: 'gpt-4o-mini',
      promptTokens: 80,
      completionTokens: 100,
      response: responseWithDisclaimer,
    };
  }

  async summarize(dto: AiSummarizeDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const sanitizedInput = this.redactPii(dto.text);
    const summary = `Executive Summary (${dto.type}): Patient presented with mild symptoms. Follow-up consultation recommended in 7 days. Key diagnostic findings remain stable.`;
    const responseWithDisclaimer = this.appendDisclaimer(summary);

    this.usage.totalRequests += 1;
    this.usage.totalTokens += 250;

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'AI_SUMMARIZE_REQUEST', 'AiService', dto.type, null, { length: sanitizedInput.length }, ipAddress, userAgent, tx);
    });

    return {
      type: dto.type,
      originalLength: dto.text.length,
      summaryLength: responseWithDisclaimer.length,
      summary: responseWithDisclaimer,
    };
  }

  async generate(dto: AiGenerateDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const draft = `Draft Document [${dto.template}]:\nSUBJECT: ${dto.prompt}\n\nCLINICAL DETAILS: Patient evaluation completed under standard SOP protocols. All vital indicators recorded within expected boundaries.`;
    const responseWithDisclaimer = this.appendDisclaimer(draft);

    this.usage.totalRequests += 1;
    this.usage.totalTokens += 310;

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'AI_GENERATE_REQUEST', 'AiService', dto.template, null, { template: dto.template }, ipAddress, userAgent, tx);
    });

    return {
      template: dto.template,
      generatedContent: responseWithDisclaimer,
    };
  }

  async extract(text: string, actorId: string) {
    const sanitized = this.redactPii(text);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'AI_EXTRACT_REQUEST', 'AiService', 'entity-extraction', null, { length: text.length }, '127.0.0.1', 'system', tx);
    });

    return {
      originalLength: text.length,
      sanitizedInput: sanitized,
      extractedEntities: {
        symptoms: ['Fever', 'Headache'],
        medications: ['Paracetamol 500mg'],
        dosages: ['1 tablet twice daily'],
      },
    };
  }

  async search(query: string, actorId: string) {
    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'AI_RAG_SEARCH', 'AiService', 'rag-search', null, { query }, '127.0.0.1', 'system', tx);
    });

    return {
      query,
      retrievedDocuments: [
        { title: 'Hospital SOP - Emergency Triage Protocol', score: 0.94, snippet: 'Triage patients according to acuity level using the Emergency Severity Index.' },
        { title: 'Clinical Guideline - Hypertension Management', score: 0.88, snippet: 'Initiate first-line antihypertensive therapy for blood pressure exceeding 140/90 mmHg.' },
      ],
    };
  }

  async getProviders() {
    return {
      defaultProvider: 'openai',
      supportedProviders: this.providers,
    };
  }

  async getPrompts() {
    const list: any[] = [];
    this.prompts.forEach(p => list.push(p));
    return list;
  }

  async updatePrompt(id: string, dto: UpdatePromptDto, actorId: string) {
    const existing = this.prompts.get(id);
    if (!existing) {
      throw new NotFoundException(`Prompt template with ID '${id}' not found.`);
    }

    const updated = {
      ...existing,
      content: dto.content || existing.content,
      temperature: dto.temperature !== undefined ? dto.temperature : existing.temperature,
      isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      version: existing.version + 1,
    };
    this.prompts.set(id, updated);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'PROMPT_UPDATED', 'PromptTemplate', id, existing, updated, '127.0.0.1', 'system', tx);
    });

    return updated;
  }

  async getUsage() {
    return this.usage;
  }

  async getFeedback() {
    return this.feedback;
  }

  private async createAuditLog(
    actorId: string | undefined,
    action: string,
    entityName: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    ipAddress: string = '127.0.0.1',
    userAgent: string = 'system',
    tx: any
  ) {
    await tx.auditLog.create({
      data: {
        actorId,
        action,
        entityName,
        entityId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress,
        userAgent,
        createdBy: actorId,
      },
    });
  }
}
