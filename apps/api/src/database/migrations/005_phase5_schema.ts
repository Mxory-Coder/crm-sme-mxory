import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 5 — Memberships, Courses, Communities, Reputation & Listings
 */
export class Phase5Schema1700000005 implements MigrationInterface {
  name = 'Phase5Schema1700000005';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE IF NOT EXISTS membership_products (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        description     TEXT,
        type            TEXT NOT NULL DEFAULT 'COURSE'
                        CHECK (type IN ('COURSE','COMMUNITY','BUNDLE','SUBSCRIPTION')),
        status          TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
        price           NUMERIC(10,2) NOT NULL DEFAULT 0,
        currency        TEXT NOT NULL DEFAULT 'ZAR',
        billing_type    TEXT NOT NULL DEFAULT 'ONE_TIME'
                        CHECK (billing_type IN ('FREE','ONE_TIME','RECURRING','PAYMENT_PLAN')),
        billing_interval TEXT CHECK (billing_interval IN ('monthly','yearly','weekly')),
        stripe_price_id TEXT,
        thumbnail_url   TEXT,
        welcome_message TEXT,
        access_duration_days INTEGER,
        created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        product_id      UUID REFERENCES membership_products(id) ON DELETE SET NULL,
        title           TEXT NOT NULL,
        description     TEXT,
        thumbnail_url   TEXT,
        instructor_name TEXT,
        instructor_bio  TEXT,
        status          TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
        completion_certificate BOOLEAN NOT NULL DEFAULT FALSE,
        total_lessons   INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS course_sections (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS course_lessons (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_id      UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
        course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        title           TEXT NOT NULL,
        type            TEXT NOT NULL DEFAULT 'VIDEO'
                        CHECK (type IN ('VIDEO','TEXT','AUDIO','PDF','QUIZ','ASSIGNMENT')),
        content_url     TEXT,
        body_html       TEXT,
        duration_mins   INTEGER,
        is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_lessons_section
        ON course_lessons(section_id, sort_order)
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS membership_enrollments (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        product_id      UUID NOT NULL REFERENCES membership_products(id) ON DELETE CASCADE,
        contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        status          TEXT NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE','EXPIRED','CANCELLED','PAUSED')),
        started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at      TIMESTAMPTZ,
        stripe_subscription_id TEXT,
        completed_lessons INTEGER NOT NULL DEFAULT 0,
        UNIQUE(product_id, contact_id)
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollments_contact
        ON membership_enrollments(contact_id, status)
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lesson_id    UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
        contact_id   UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        completed    BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at TIMESTAMPTZ,
        progress_pct INTEGER NOT NULL DEFAULT 0,
        UNIQUE(lesson_id, contact_id)
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS communities (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        product_id      UUID REFERENCES membership_products(id) ON DELETE SET NULL,
        name            TEXT NOT NULL,
        description     TEXT,
        cover_image_url TEXT,
        status          TEXT NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE','ARCHIVED')),
        member_count    INTEGER NOT NULL DEFAULT 0,
        post_count      INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL,
        user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
        body         TEXT NOT NULL,
        media_urls   TEXT[] NOT NULL DEFAULT '{}',
        is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
        like_count   INTEGER NOT NULL DEFAULT 0,
        comment_count INTEGER NOT NULL DEFAULT 0,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_community_posts_community
        ON community_posts(community_id, is_pinned DESC, created_at DESC)
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS community_post_comments (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id     UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
        user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
        body        TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS review_requests (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        contact_id   UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        channel      TEXT NOT NULL DEFAULT 'SMS'
                     CHECK (channel IN ('SMS','EMAIL','WHATSAPP')),
        status       TEXT NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','SENT','CLICKED','REVIEWED','FAILED')),
        message_body TEXT NOT NULL,
        review_link  TEXT,
        sent_at      TIMESTAMPTZ,
        clicked_at   TIMESTAMPTZ,
        reviewed_at  TIMESTAMPTZ,
        platform     TEXT CHECK (platform IN ('GOOGLE','FACEBOOK','TRUSTPILOT','CUSTOM')),
        rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
        review_text  TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_review_requests_location
        ON review_requests(location_id, created_at DESC)
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id    UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        contact_id     UUID REFERENCES contacts(id) ON DELETE SET NULL,
        platform       TEXT NOT NULL DEFAULT 'GOOGLE',
        reviewer_name  TEXT NOT NULL,
        rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text    TEXT,
        response_text  TEXT,
        response_at    TIMESTAMPTZ,
        external_id    TEXT,
        is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
        reviewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_location
        ON reviews(location_id, rating DESC, reviewed_at DESC)
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    const tables = [
      'reviews', 'review_requests', 'community_post_comments',
      'community_posts', 'communities', 'lesson_progress',
      'membership_enrollments', 'course_lessons', 'course_sections',
      'courses', 'membership_products',
    ];
    for (const t of tables) {
      await qr.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
    }
  }
}
