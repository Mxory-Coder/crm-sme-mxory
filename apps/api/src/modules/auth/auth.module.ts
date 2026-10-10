import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { TokenFamily, RevokedToken } from './token-family.entity';
import { User } from '../users/user.entity';
import { Agency } from '../agencies/agency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Agency, TokenFamily, RevokedToken]),
    PassportModule,
    JwtModule.register({}), // secrets passed per .sign() call
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
