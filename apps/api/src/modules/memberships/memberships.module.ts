import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MembershipProduct, Course, CourseSection, CourseLesson,
  MembershipEnrollment, LessonProgress,
} from './membership.entities';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    MembershipProduct, Course, CourseSection, CourseLesson,
    MembershipEnrollment, LessonProgress,
  ])],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
