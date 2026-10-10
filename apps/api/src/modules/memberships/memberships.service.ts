import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MembershipProduct, Course, CourseSection, CourseLesson,
  MembershipEnrollment, LessonProgress,
} from './membership.entities';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(MembershipProduct) private readonly productRepo: Repository<MembershipProduct>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(CourseSection) private readonly sectionRepo: Repository<CourseSection>,
    @InjectRepository(CourseLesson) private readonly lessonRepo: Repository<CourseLesson>,
    @InjectRepository(MembershipEnrollment) private readonly enrollRepo: Repository<MembershipEnrollment>,
    @InjectRepository(LessonProgress) private readonly progressRepo: Repository<LessonProgress>,
  ) {}

  // ─── Products ─────────────────────────────────────────────────────────────

  async findAllProducts(locationId: string): Promise<MembershipProduct[]> {
    return this.productRepo.find({ where: { locationId }, order: { createdAt: 'DESC' } });
  }

  async findProductById(locationId: string, id: string): Promise<MembershipProduct> {
    const p = await this.productRepo.findOne({ where: { id, locationId } });
    if (!p) throw new NotFoundException('Membership product not found');
    return p;
  }

  async createProduct(locationId: string, dto: Partial<MembershipProduct>, userId: string): Promise<MembershipProduct> {
    const p = this.productRepo.create({ ...dto, locationId, createdBy: userId });
    return this.productRepo.save(p);
  }

  async updateProduct(locationId: string, id: string, dto: Partial<MembershipProduct>): Promise<MembershipProduct> {
    const p = await this.findProductById(locationId, id);
    Object.assign(p, dto);
    return this.productRepo.save(p);
  }

  async deleteProduct(locationId: string, id: string): Promise<void> {
    const p = await this.findProductById(locationId, id);
    await this.productRepo.remove(p);
  }

  // ─── Courses ──────────────────────────────────────────────────────────────

  async findAllCourses(locationId: string): Promise<Course[]> {
    return this.courseRepo.find({ where: { locationId }, order: { createdAt: 'DESC' } });
  }

  async findCourseById(locationId: string, id: string): Promise<Course> {
    const c = await this.courseRepo.findOne({ where: { id, locationId } });
    if (!c) throw new NotFoundException('Course not found');
    return c;
  }

  async findCourseWithContent(locationId: string, id: string): Promise<Course & { sections: (CourseSection & { lessons: CourseLesson[] })[] }> {
    const course = await this.findCourseById(locationId, id);
    const sections = await this.sectionRepo.find({ where: { courseId: id, locationId }, order: { sortOrder: 'ASC' } });
    const sectionsWithLessons = await Promise.all(
      sections.map(async (s) => {
        const lessons = await this.lessonRepo.find({ where: { sectionId: s.id, locationId }, order: { sortOrder: 'ASC' } });
        return { ...s, lessons };
      }),
    );
    return { ...course, sections: sectionsWithLessons };
  }

  async createCourse(locationId: string, dto: Partial<Course>): Promise<Course> {
    const c = this.courseRepo.create({ ...dto, locationId });
    return this.courseRepo.save(c);
  }

  async updateCourse(locationId: string, id: string, dto: Partial<Course>): Promise<Course> {
    const c = await this.findCourseById(locationId, id);
    Object.assign(c, dto);
    return this.courseRepo.save(c);
  }

  async deleteCourse(locationId: string, id: string): Promise<void> {
    const c = await this.findCourseById(locationId, id);
    await this.courseRepo.remove(c);
  }

  // ─── Sections ─────────────────────────────────────────────────────────────

  async createSection(locationId: string, courseId: string, title: string): Promise<CourseSection> {
    await this.findCourseById(locationId, courseId);
    const count = await this.sectionRepo.count({ where: { courseId } });
    return this.sectionRepo.save(this.sectionRepo.create({ courseId, locationId, title, sortOrder: count }));
  }

  async updateSection(locationId: string, sectionId: string, title: string): Promise<CourseSection> {
    const s = await this.sectionRepo.findOne({ where: { id: sectionId, locationId } });
    if (!s) throw new NotFoundException('Section not found');
    s.title = title;
    return this.sectionRepo.save(s);
  }

  async deleteSection(locationId: string, sectionId: string): Promise<void> {
    const s = await this.sectionRepo.findOne({ where: { id: sectionId, locationId } });
    if (!s) throw new NotFoundException('Section not found');
    await this.sectionRepo.remove(s);
  }

  // ─── Lessons ──────────────────────────────────────────────────────────────

  async createLesson(locationId: string, sectionId: string, dto: Partial<CourseLesson>): Promise<CourseLesson> {
    const section = await this.sectionRepo.findOne({ where: { id: sectionId, locationId } });
    if (!section) throw new NotFoundException('Section not found');
    const count = await this.lessonRepo.count({ where: { sectionId } });
    const lesson = this.lessonRepo.create({
      ...dto,
      sectionId,
      courseId: section.courseId,
      locationId,
      sortOrder: count,
    });
    const saved = await this.lessonRepo.save(lesson);
    await this.courseRepo.increment({ id: section.courseId }, 'totalLessons', 1);
    return saved;
  }

  async updateLesson(locationId: string, lessonId: string, dto: Partial<CourseLesson>): Promise<CourseLesson> {
    const l = await this.lessonRepo.findOne({ where: { id: lessonId, locationId } });
    if (!l) throw new NotFoundException('Lesson not found');
    Object.assign(l, dto);
    return this.lessonRepo.save(l);
  }

  async deleteLesson(locationId: string, lessonId: string): Promise<void> {
    const l = await this.lessonRepo.findOne({ where: { id: lessonId, locationId } });
    if (!l) throw new NotFoundException('Lesson not found');
    await this.lessonRepo.remove(l);
    await this.courseRepo.decrement({ id: l.courseId }, 'totalLessons', 1);
  }

  // ─── Enrollments ──────────────────────────────────────────────────────────

  async enroll(locationId: string, productId: string, contactId: string): Promise<MembershipEnrollment> {
    const product = await this.findProductById(locationId, productId);
    const existing = await this.enrollRepo.findOne({ where: { productId, contactId } });
    if (existing) {
      if (existing.status === 'CANCELLED' || existing.status === 'EXPIRED') {
        existing.status = 'ACTIVE';
        existing.startedAt = new Date();
        existing.expiresAt = product.accessDurationDays
          ? new Date(Date.now() + product.accessDurationDays * 86400000)
          : null;
        return this.enrollRepo.save(existing);
      }
      return existing;
    }
    return this.enrollRepo.save(
      this.enrollRepo.create({
        locationId,
        productId,
        contactId,
        status: 'ACTIVE',
        startedAt: new Date(),
        expiresAt: product.accessDurationDays
          ? new Date(Date.now() + product.accessDurationDays * 86400000)
          : null,
      }),
    );
  }

  async findEnrollments(locationId: string, contactId: string): Promise<MembershipEnrollment[]> {
    return this.enrollRepo.find({ where: { locationId, contactId }, relations: ['product'] });
  }

  // ─── Lesson Progress ──────────────────────────────────────────────────────

  async markLessonComplete(locationId: string, lessonId: string, contactId: string): Promise<LessonProgress> {
    let progress = await this.progressRepo.findOne({ where: { lessonId, contactId } });
    if (!progress) {
      progress = this.progressRepo.create({ lessonId, contactId, locationId });
    }
    progress.completed = true;
    progress.completedAt = new Date();
    progress.progressPct = 100;
    return this.progressRepo.save(progress);
  }

  async getProgress(locationId: string, courseId: string, contactId: string): Promise<{ total: number; completed: number; pct: number }> {
    const lessons = await this.lessonRepo.find({ where: { courseId, locationId } });
    const total = lessons.length;
    if (total === 0) return { total: 0, completed: 0, pct: 0 };
    const completed = await this.progressRepo.count({
      where: lessons.map((l) => ({ lessonId: l.id, contactId, completed: true })),
    });
    return { total, completed, pct: Math.round((completed / total) * 100) };
  }

  // ─── AI Course Outline Generator ──────────────────────────────────────────

  async aiGenerateOutline(topic: string, targetAudience: string, lessonCount: number): Promise<{
    title: string;
    description: string;
    sections: Array<{ title: string; lessons: Array<{ title: string; type: string; durationMins: number }> }>;
  }> {
    const anthropic = getAnthropic();
    const TOOL = {
      name: 'create_course_outline',
      description: 'Generate a course outline with sections and lessons',
      input_schema: {
        type: 'object' as const,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                lessons: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      type: { type: 'string', enum: ['VIDEO', 'TEXT', 'PDF', 'QUIZ'] },
                      durationMins: { type: 'number' },
                    },
                    required: ['title', 'type', 'durationMins'],
                  },
                },
              },
              required: ['title', 'lessons'],
            },
          },
        },
        required: ['title', 'description', 'sections'],
      },
    };

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'create_course_outline' },
      messages: [{
        role: 'user',
        content: `Create a course outline for: "${topic}".
Target audience: ${targetAudience}.
Total lessons: approximately ${lessonCount}.
Organise into logical sections. Mix video, text, and quiz lesson types.`,
      }],
    });

    const toolBlock = res.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new BadRequestException('AI failed to generate outline');
    }
    return toolBlock.input as ReturnType<MembershipsService['aiGenerateOutline']> extends Promise<infer T> ? T : never;
  }
}
