import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MembershipsService } from './memberships.service';
import { MembershipProduct, Course, CourseLesson } from './membership.entities';

@UseGuards(JwtAuthGuard)
@Controller('v1/memberships')
export class MembershipsController {
  constructor(private readonly svc: MembershipsService) {}

  // ─── Products ─────────────────────────────────────────────────────────────

  @Get('products')
  findProducts(@CurrentUser() user: { locationId: string }) {
    return this.svc.findAllProducts(user.locationId);
  }

  @Post('products')
  createProduct(
    @CurrentUser() user: { locationId: string; id: string },
    @Body() dto: Partial<MembershipProduct>,
  ) {
    return this.svc.createProduct(user.locationId, dto, user.id);
  }

  @Patch('products/:id')
  updateProduct(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() dto: Partial<MembershipProduct>,
  ) {
    return this.svc.updateProduct(user.locationId, id, dto);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.deleteProduct(user.locationId, id);
  }

  // ─── Courses ──────────────────────────────────────────────────────────────

  @Get('courses')
  findCourses(@CurrentUser() user: { locationId: string }) {
    return this.svc.findAllCourses(user.locationId);
  }

  @Get('courses/:id')
  findCourse(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.findCourseWithContent(user.locationId, id);
  }

  @Post('courses')
  createCourse(
    @CurrentUser() user: { locationId: string },
    @Body() dto: Partial<Course>,
  ) {
    return this.svc.createCourse(user.locationId, dto);
  }

  @Patch('courses/:id')
  updateCourse(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() dto: Partial<Course>,
  ) {
    return this.svc.updateCourse(user.locationId, id, dto);
  }

  @Delete('courses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCourse(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.deleteCourse(user.locationId, id);
  }

  // ─── Sections ─────────────────────────────────────────────────────────────

  @Post('courses/:id/sections')
  createSection(
    @CurrentUser() user: { locationId: string },
    @Param('id') courseId: string,
    @Body() body: { title: string },
  ) {
    return this.svc.createSection(user.locationId, courseId, body.title);
  }

  @Patch('sections/:sectionId')
  updateSection(
    @CurrentUser() user: { locationId: string },
    @Param('sectionId') sectionId: string,
    @Body() body: { title: string },
  ) {
    return this.svc.updateSection(user.locationId, sectionId, body.title);
  }

  @Delete('sections/:sectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSection(@CurrentUser() user: { locationId: string }, @Param('sectionId') sectionId: string) {
    return this.svc.deleteSection(user.locationId, sectionId);
  }

  // ─── Lessons ──────────────────────────────────────────────────────────────

  @Post('sections/:sectionId/lessons')
  createLesson(
    @CurrentUser() user: { locationId: string },
    @Param('sectionId') sectionId: string,
    @Body() dto: Partial<CourseLesson>,
  ) {
    return this.svc.createLesson(user.locationId, sectionId, dto);
  }

  @Patch('lessons/:lessonId')
  updateLesson(
    @CurrentUser() user: { locationId: string },
    @Param('lessonId') lessonId: string,
    @Body() dto: Partial<CourseLesson>,
  ) {
    return this.svc.updateLesson(user.locationId, lessonId, dto);
  }

  @Delete('lessons/:lessonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLesson(@CurrentUser() user: { locationId: string }, @Param('lessonId') lessonId: string) {
    return this.svc.deleteLesson(user.locationId, lessonId);
  }

  // ─── Enrollments ──────────────────────────────────────────────────────────

  @Post('enroll')
  enroll(
    @CurrentUser() user: { locationId: string },
    @Body() body: { productId: string; contactId: string },
  ) {
    return this.svc.enroll(user.locationId, body.productId, body.contactId);
  }

  @Get('contacts/:contactId/enrollments')
  findEnrollments(
    @CurrentUser() user: { locationId: string },
    @Param('contactId') contactId: string,
  ) {
    return this.svc.findEnrollments(user.locationId, contactId);
  }

  // ─── Progress ─────────────────────────────────────────────────────────────

  @Post('lessons/:lessonId/complete')
  markComplete(
    @CurrentUser() user: { locationId: string },
    @Param('lessonId') lessonId: string,
    @Body() body: { contactId: string },
  ) {
    return this.svc.markLessonComplete(user.locationId, lessonId, body.contactId);
  }

  @Get('courses/:id/progress/:contactId')
  getProgress(
    @CurrentUser() user: { locationId: string },
    @Param('id') courseId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.svc.getProgress(user.locationId, courseId, contactId);
  }

  // ─── AI ───────────────────────────────────────────────────────────────────

  @Post('ai/course-outline')
  aiOutline(@Body() body: { topic: string; targetAudience: string; lessonCount: number }) {
    return this.svc.aiGenerateOutline(body.topic, body.targetAudience, body.lessonCount ?? 12);
  }
}
