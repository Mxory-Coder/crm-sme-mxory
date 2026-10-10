import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewRequest, Review } from './reputation.entities';
import { ReputationService } from './reputation.service';
import { ReputationController } from './reputation.controller';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewRequest, Review]),
    ContactsModule,
  ],
  controllers: [ReputationController],
  providers: [ReputationService],
  exports: [ReputationService],
})
export class ReputationModule {}
