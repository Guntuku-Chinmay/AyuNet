import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ShareFileDto } from './dto/share-file.dto';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Register and upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded.' })
  upload(
    @Body() dto: UploadFileDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.upload(dto, user.id, ip, ua);
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Batch upload multiple files' })
  uploadMultiple(
    @Body() dtos: UploadFileDto[],
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.uploadMultiple(dtos, user.id, ip, ua);
  }

  @Get()
  @ApiOperation({ summary: 'List files' })
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details' })
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file content stream' })
  download(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.download(id, user.id, ip, ua);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Preview file content representation' })
  preview(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.preview(id, user.id, ip, ua);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file metadata or rename' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFileDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.update(id, dto, user.id, ip, ua);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a file' })
  softDelete(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.softDelete(id, user.id, ip, ua);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft deleted file' })
  restore(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.restore(id, user.id, ip, ua);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Generate time-limited shared file link' })
  share(
    @Param('id') id: string,
    @Body() dto: ShareFileDto,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.share(id, dto, user.id, ip, ua);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'View file versions history' })
  getVersions(@Param('id') id: string) {
    return this.filesService.getVersions(id);
  }

  @Post(':id/versions/restore')
  @ApiOperation({ summary: 'Restore a previous file version' })
  restoreVersion(
    @Param('id') id: string,
    @Body('versionNumber') versionNumber: number,
    @CurrentUser() user: any,
    @Req() req: Request
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'system';
    return this.filesService.restoreVersion(id, versionNumber, user.id, ip, ua);
  }
}
