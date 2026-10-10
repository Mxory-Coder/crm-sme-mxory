import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VoiceSession } from './voice-session.entity';
import { VoiceAIGateway } from './voice-ai.gateway';
import { VoiceController } from './voice.controller';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceSession]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.get<string>('JWT_ACCESS_SECRET') ?? 'dev-secret',
      }),
    }),
    ContactsModule,
  ],
  controllers: [VoiceController],
  providers: [VoiceAIGateway],
  exports: [VoiceAIGateway],
})
export class VoiceModule {}
