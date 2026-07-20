import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('FilesService', () => {
  let service: FilesService;

  const mockPrismaService = {
    attachment: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('MIME Type Validations', () => {
    it('should throw BadRequestException for unsupported file formats', () => {
      expect(() => service.validateMimeType('application/x-msdownload')).toThrow(BadRequestException);
    });

    it('should accept valid medical and document MIME types', () => {
      expect(() => service.validateMimeType('application/dicom')).not.toThrow();
      expect(() => service.validateMimeType('application/pdf')).not.toThrow();
    });
  });
});
