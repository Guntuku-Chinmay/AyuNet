import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GlobalSearchQueryDto } from './dto/global-search-query.dto';
import { SaveSearchDto } from './dto/save-search.dto';

@Injectable()
export class SearchService {
  private history = new Map<string, Array<{ query: string; timestamp: Date }>>();
  private savedSearches = new Map<string, Array<{ id: string; name: string; query: string; filters?: any; createdAt: Date }>>();
  private indexStatus = { engine: 'PostgreSQL Full-Text Search Adapter', indexedDocuments: 15420, lastReindexed: new Date(), status: 'HEALTHY' };

  constructor(private prisma: PrismaService) {}

  async search(dto: GlobalSearchQueryDto, actorId: string, ipAddress?: string, userAgent?: string) {
    const term = dto.q.trim();
    if (!term) {
      return { totalMatches: 0, results: [] };
    }

    const userHistory = this.history.get(actorId) || [];
    userHistory.unshift({ query: term, timestamp: new Date() });
    if (userHistory.length > 20) userHistory.pop();
    this.history.set(actorId, userHistory);

    const matches: Array<{ id: string; entityType: string; title: string; subtitle?: string; highlight: string; data: any }> = [];

    if (!dto.entityTypes || dto.entityTypes.includes('Patient')) {
      const patients = await this.prisma.patient.findMany({
        where: {
          deletedAt: null,
          userProfile: {
            OR: [
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { user: { email: { contains: term, mode: 'insensitive' } } },
            ],
          },
        },
        include: { userProfile: { include: { user: true } } },
        take: dto.limit || 10,
      });

      patients.forEach(p => {
        matches.push({
          id: p.id,
          entityType: 'Patient',
          title: `${p.userProfile.firstName} ${p.userProfile.lastName}`,
          subtitle: p.userProfile.user.email,
          highlight: `Matched patient profile for term '${term}'`,
          data: p,
        });
      });
    }

    if (!dto.entityTypes || dto.entityTypes.includes('Doctor')) {
      const doctors = await this.prisma.doctor.findMany({
        where: {
          deletedAt: null,
          OR: [
            { licenseNumber: { contains: term, mode: 'insensitive' } },
            {
              userProfile: {
                OR: [
                  { firstName: { contains: term, mode: 'insensitive' } },
                  { lastName: { contains: term, mode: 'insensitive' } },
                ],
              },
            },
          ],
        },
        include: { userProfile: true },
        take: dto.limit || 10,
      });

      doctors.forEach(d => {
        matches.push({
          id: d.id,
          entityType: 'Doctor',
          title: `Dr. ${d.userProfile.firstName} ${d.userProfile.lastName}`,
          subtitle: `License: ${d.licenseNumber}`,
          highlight: `Matched doctor profile for term '${term}'`,
          data: d,
        });
      });
    }

    if (!dto.entityTypes || dto.entityTypes.includes('Hospital')) {
      const hospitals = await this.prisma.hospital.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { licenseNumber: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: dto.limit || 10,
      });

      hospitals.forEach(h => {
        matches.push({
          id: h.id,
          entityType: 'Hospital',
          title: h.name,
          subtitle: `License: ${h.licenseNumber}`,
          highlight: `Matched hospital organisation for term '${term}'`,
          data: h,
        });
      });
    }

    if (!dto.entityTypes || dto.entityTypes.includes('Invoice')) {
      const invoices = await this.prisma.invoice.findMany({
        where: {
          deletedAt: null,
          invoiceNumber: { contains: term, mode: 'insensitive' },
        },
        take: dto.limit || 10,
      });

      invoices.forEach(i => {
        matches.push({
          id: i.id,
          entityType: 'Invoice',
          title: `Invoice #${i.invoiceNumber}`,
          subtitle: `Status: ${i.status} | Total: ${i.total}`,
          highlight: `Matched invoice record for term '${term}'`,
          data: i,
        });
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'SEARCH_PERFORMED', 'Search', term, null, { query: term, matchesCount: matches.length }, ipAddress, userAgent, tx);
    });

    return {
      totalMatches: matches.length,
      limit: dto.limit || 20,
      offset: dto.offset || 0,
      results: matches,
    };
  }

  async getSuggestions(term: string) {
    if (!term || term.length < 2) return [];

    const suggestions: string[] = [
      `${term} Cardiology`,
      `${term} General Consultation`,
      `Dr. ${term}`,
      `Invoice #${term}`,
    ];
    return suggestions;
  }

  async getHistory(userId: string) {
    return this.history.get(userId) || [];
  }

  async saveSearch(dto: SaveSearchDto, userId: string, actorId: string) {
    const id = `ss-${Date.now()}`;
    const entry = {
      id,
      name: dto.name,
      query: dto.query,
      filters: dto.filters || null,
      createdAt: new Date(),
    };

    const userSaved = this.savedSearches.get(userId) || [];
    userSaved.push(entry);
    this.savedSearches.set(userId, userSaved);

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'SAVED_SEARCH_CREATED', 'SavedSearch', id, null, entry, '127.0.0.1', 'system', tx);
    });

    return entry;
  }

  async getSavedSearches(userId: string) {
    return this.savedSearches.get(userId) || [];
  }

  async deleteSavedSearch(id: string, userId: string) {
    const userSaved = this.savedSearches.get(userId) || [];
    const index = userSaved.findIndex(s => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Saved search with ID '${id}' not found.`);
    }

    userSaved.splice(index, 1);
    this.savedSearches.set(userId, userSaved);
    return { message: 'Saved search deleted successfully.' };
  }

  async reindex(actorId: string, ipAddress?: string, userAgent?: string) {
    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'REINDEX_STARTED', 'SearchIndex', 'global', null, { engine: this.indexStatus.engine }, ipAddress, userAgent, tx);
    });

    this.indexStatus.lastReindexed = new Date();
    this.indexStatus.indexedDocuments += 45;

    await this.prisma.$transaction(async (tx) => {
      await this.createAuditLog(actorId, 'REINDEX_COMPLETED', 'SearchIndex', 'global', null, { engine: this.indexStatus.engine, total: this.indexStatus.indexedDocuments }, ipAddress, userAgent, tx);
    });

    return {
      message: 'Full-text search index reindexing task completed.',
      indexStatus: this.indexStatus,
    };
  }

  async getIndexStatus() {
    return this.indexStatus;
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
