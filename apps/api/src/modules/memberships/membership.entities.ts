import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Location } from '../locations/location.entity';

// ─── Membership Product ───────────────────────────────────────────────────────

@Entity('membership_products')
export class MembershipProduct {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @ManyToOne(() => Location, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'location_id' }) location: Location;
  @Column({ type: 'text' }) name: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'text', default: 'COURSE' }) type: string;
  @Column({ type: 'text', default: 'DRAFT' }) status: string;
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 }) price: number;
  @Column({ default: 'ZAR' }) currency: string;
  @Column({ name: 'billing_type', default: 'ONE_TIME' }) billingType: string;
  @Column({ name: 'billing_interval', nullable: true, type: 'varchar' }) billingInterval: string | null;
  @Column({ name: 'stripe_price_id', nullable: true, type: 'varchar' }) stripePriceId: string | null;
  @Column({ name: 'thumbnail_url', nullable: true, type: 'varchar' }) thumbnailUrl: string | null;
  @Column({ name: 'welcome_message', type: 'text', nullable: true }) welcomeMessage: string | null;
  @Column({ name: 'access_duration_days', nullable: true, type: 'int' }) accessDurationDays: number | null;
  @Column({ name: 'created_by', nullable: true, type: 'varchar' }) createdBy: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ─── Course ───────────────────────────────────────────────────────────────────

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @ManyToOne(() => Location, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'location_id' }) location: Location;
  @Column({ name: 'product_id', nullable: true, type: 'varchar' }) productId: string | null;
  @Column({ type: 'text' }) title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'thumbnail_url', nullable: true, type: 'varchar' }) thumbnailUrl: string | null;
  @Column({ name: 'instructor_name', nullable: true, type: 'varchar' }) instructorName: string | null;
  @Column({ name: 'instructor_bio', type: 'text', nullable: true }) instructorBio: string | null;
  @Column({ type: 'text', default: 'DRAFT' }) status: string;
  @Column({ name: 'completion_certificate', default: false }) completionCertificate: boolean;
  @Column({ name: 'total_lessons', default: 0 }) totalLessons: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany('CourseSection', 'course') sections: unknown[];
}

// ─── Course Section ───────────────────────────────────────────────────────────

@Entity('course_sections')
export class CourseSection {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'course_id' }) courseId: string;
  @ManyToOne(() => Course, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'course_id' }) course: Course;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ type: 'text' }) title: string;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @OneToMany('CourseLesson', 'section') lessons: unknown[];
}

// ─── Course Lesson ────────────────────────────────────────────────────────────

@Entity('course_lessons')
export class CourseLesson {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'section_id' }) sectionId: string;
  @ManyToOne(() => CourseSection, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'section_id' }) section: CourseSection;
  @Column({ name: 'course_id' }) courseId: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ type: 'text' }) title: string;
  @Column({ type: 'text', default: 'VIDEO' }) type: string;
  @Column({ name: 'content_url', nullable: true, type: 'varchar' }) contentUrl: string | null;
  @Column({ name: 'body_html', type: 'text', nullable: true }) bodyHtml: string | null;
  @Column({ name: 'duration_mins', nullable: true, type: 'float' }) durationMins: number | null;
  @Column({ name: 'is_free_preview', default: false }) isFreePreview: boolean;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

// ─── Membership Enrollment ────────────────────────────────────────────────────

@Entity('membership_enrollments')
export class MembershipEnrollment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ name: 'product_id' }) productId: string;
  @ManyToOne(() => MembershipProduct, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'product_id' }) product: MembershipProduct;
  @Column({ name: 'contact_id' }) contactId: string;
  @Column({ type: 'text', default: 'ACTIVE' }) status: string;
  @Column({ name: 'started_at', default: () => 'NOW()' }) startedAt: Date;
  @Column({ name: 'expires_at', nullable: true, type: 'timestamp' }) expiresAt: Date | null;
  @Column({ name: 'stripe_subscription_id', nullable: true, type: 'varchar' }) stripeSubscriptionId: string | null;
  @Column({ name: 'completed_lessons', default: 0 }) completedLessons: number;
}

// ─── Lesson Progress ──────────────────────────────────────────────────────────

@Entity('lesson_progress')
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'lesson_id' }) lessonId: string;
  @Column({ name: 'contact_id' }) contactId: string;
  @Column({ name: 'location_id' }) locationId: string;
  @Column({ default: false }) completed: boolean;
  @Column({ name: 'completed_at', nullable: true, type: 'timestamp' }) completedAt: Date | null;
  @Column({ name: 'progress_pct', default: 0 }) progressPct: number;
}
