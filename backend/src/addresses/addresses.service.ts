import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateAddress(dto: CreateAddressDto, userId?: string): Promise<string> {
    // Normalize and search for existing address to avoid duplication
    const existing = await this.prisma.address.findFirst({
      where: {
        addressLine1: { equals: dto.addressLine1.trim(), mode: 'insensitive' },
        addressLine2: dto.addressLine2 ? { equals: dto.addressLine2.trim(), mode: 'insensitive' } : null,
        city: { equals: dto.city.trim(), mode: 'insensitive' },
        state: { equals: dto.state.trim(), mode: 'insensitive' },
        postalCode: dto.postalCode.trim(),
        country: { equals: dto.country.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (existing) {
      return existing.id;
    }

    // Create new address if no match is found
    const newAddress = await this.prisma.address.create({
      data: {
        addressLine1: dto.addressLine1.trim(),
        addressLine2: dto.addressLine2 ? dto.addressLine2.trim() : null,
        city: dto.city.trim(),
        state: dto.state.trim(),
        postalCode: dto.postalCode.trim(),
        country: dto.country.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        createdBy: userId,
      },
    });

    return newAddress.id;
  }
}
