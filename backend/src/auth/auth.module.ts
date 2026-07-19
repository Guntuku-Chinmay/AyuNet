import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ayunet_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    PassportModule,
    JwtModule,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
