import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form, FormSubmission } from './form.entity';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Form, FormSubmission]), ContactsModule],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
