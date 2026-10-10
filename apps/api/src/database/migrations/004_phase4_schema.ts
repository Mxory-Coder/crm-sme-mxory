import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 4 — Social Planner, Email Marketing, Funnels & Sites
 */
export class Phase4Schema1700000004 implements MigrationInterface {
  name = 'Phase4Schema1700000004';

  async up(qr: QueryRunner): Promise<void> {
    // ─── Social Posts ─────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id         UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        caption             TEXT NOT NULL,
        media_urls          TEXT[] NOT NULL DEFAULT '{}',
        platforms           TEXT[] NOT NULL DEFAULT '{}',
        status              TEXT NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT','SCHEDULED','PUBLISHED','FAILED')),
        scheduled_at        TIMESTAMPTZ,
        published_at        TIMESTAMPTZ,
        facebook_post_id    TEXT,
        instagram_post_id   TEXT,
        error_message       TEXT,
        created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled
        ON social_posts(location_id, scheduled_at)
        WHERE status = 'SCHEDULED'
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_social_posts_location
        ON social_posts(location_id, created_at DESC)
    `);

    // ─── Email Campaigns ──────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id       UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name              TEXT NOT NULL,
        subject           TEXT NOT NULL,
        preview_text      TEXT,
        from_name         TEXT NOT NULL,
        from_email        TEXT NOT NULL,
        reply_to          TEXT,
        body_html         TEXT NOT NULL DEFAULT '',
        body_text         TEXT,
        status            TEXT NOT NULL DEFAULT 'DRAFT'
                          CHECK (status IN ('DRAFT','SCHEDULED','SENDING','SENT','PAUSED','CANCELLED')),
        type              TEXT NOT NULL DEFAULT 'ONE_TIME'
                          CHECK (type IN ('ONE_TIME','AUTOMATED','AB_TEST')),
        -- Audience
        segment_filters   JSONB NOT NULL DEFAULT '{}',
        -- Scheduling
        scheduled_at      TIMESTAMPTZ,
        sent_at           TIMESTAMPTZ,
        -- Stats (denormalized for fast dashboard)
        total_recipients  INTEGER NOT NULL DEFAULT 0,
        delivered         INTEGER NOT NULL DEFAULT 0,
        opens             INTEGER NOT NULL DEFAULT 0,
        unique_opens      INTEGER NOT NULL DEFAULT 0,
        clicks            INTEGER NOT NULL DEFAULT 0,
        unique_clicks     INTEGER NOT NULL DEFAULT 0,
        unsubscribes      INTEGER NOT NULL DEFAULT 0,
        bounces           INTEGER NOT NULL DEFAULT 0,
        spam_reports      INTEGER NOT NULL DEFAULT 0,
        created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_email_campaigns_location
        ON email_campaigns(location_id, created_at DESC)
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled
        ON email_campaigns(location_id, scheduled_at)
        WHERE status = 'SCHEDULED'
    `);

    // ─── Email Campaign Recipients (send log) ─────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS email_campaign_recipients (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id   UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
        contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        email         TEXT NOT NULL,
        status        TEXT NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','SENT','DELIVERED','OPENED','CLICKED','BOUNCED','UNSUBSCRIBED','SPAM')),
        sendgrid_message_id TEXT,
        sent_at       TIMESTAMPTZ,
        opened_at     TIMESTAMPTZ,
        clicked_at    TIMESTAMPTZ,
        UNIQUE(campaign_id, contact_id)
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_ecr_campaign
        ON email_campaign_recipients(campaign_id, status)
    `);

    // ─── Email Templates ──────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name          TEXT NOT NULL,
        subject       TEXT NOT NULL,
        body_html     TEXT NOT NULL,
        body_text     TEXT,
        category      TEXT,
        is_global     BOOLEAN NOT NULL DEFAULT FALSE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Funnels ──────────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS funnels (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        description     TEXT,
        status          TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
        domain          TEXT,
        path_prefix     TEXT,
        favicon_url     TEXT,
        -- Stats
        total_visits    INTEGER NOT NULL DEFAULT 0,
        total_optins    INTEGER NOT NULL DEFAULT 0,
        created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Funnel Steps ─────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS funnel_steps (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        funnel_id       UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        type            TEXT NOT NULL DEFAULT 'OPTIN'
                        CHECK (type IN (
                          'OPTIN','SALES_PAGE','ORDER_BUMP','UPSELL','DOWNSELL',
                          'CONFIRMATION','WEBINAR_REGISTRATION','APPOINTMENT_BOOKING',
                          'SURVEY','VIDEO_PAGE','SQUEEZE_PAGE'
                        )),
        sort_order      INTEGER NOT NULL DEFAULT 0,
        slug            TEXT NOT NULL,
        page_content    JSONB NOT NULL DEFAULT '{}',
        -- Product for purchase steps
        product_id      UUID,
        price           NUMERIC(10,2),
        currency        TEXT NOT NULL DEFAULT 'ZAR',
        is_one_click    BOOLEAN NOT NULL DEFAULT FALSE,
        -- Navigation
        on_accept       TEXT,   -- next step ID
        on_decline      TEXT,   -- next step ID (for downsell)
        -- Stats
        visits          INTEGER NOT NULL DEFAULT 0,
        conversions     INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_funnel_steps_funnel
        ON funnel_steps(funnel_id, sort_order)
    `);

    // ─── Sites (Websites) ─────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        type            TEXT NOT NULL DEFAULT 'WEBSITE'
                        CHECK (type IN ('WEBSITE','BLOG','LANDING_PAGE')),
        status          TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
        domain          TEXT,
        subdomain       TEXT,
        favicon_url     TEXT,
        meta_title      TEXT,
        meta_description TEXT,
        header_code     TEXT,   -- custom <head> scripts/styles
        footer_code     TEXT,
        global_css      TEXT,
        published_at    TIMESTAMPTZ,
        created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Site Pages ───────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS site_pages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id         UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        title           TEXT NOT NULL,
        slug            TEXT NOT NULL,
        is_home         BOOLEAN NOT NULL DEFAULT FALSE,
        status          TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED')),
        page_content    JSONB NOT NULL DEFAULT '{}',
        meta_title      TEXT,
        meta_description TEXT,
        og_image        TEXT,
        -- Stats
        visits          INTEGER NOT NULL DEFAULT 0,
        published_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(site_id, slug)
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_site_pages_site
        ON site_pages(site_id, slug)
    `);

    // ─── Blog Posts ───────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id         UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        title           TEXT NOT NULL,
        slug            TEXT NOT NULL,
        excerpt         TEXT,
        body_html       TEXT NOT NULL DEFAULT '',
        featured_image  TEXT,
        author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
        status          TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','SCHEDULED','ARCHIVED')),
        tags            TEXT[] NOT NULL DEFAULT '{}',
        categories      TEXT[] NOT NULL DEFAULT '{}',
        meta_title      TEXT,
        meta_description TEXT,
        og_image        TEXT,
        read_time_mins  INTEGER,
        views           INTEGER NOT NULL DEFAULT 0,
        published_at    TIMESTAMPTZ,
        scheduled_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(site_id, slug)
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_site
        ON blog_posts(site_id, published_at DESC)
        WHERE status = 'PUBLISHED'
    `);

    // ─── Forms ────────────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS forms (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        description     TEXT,
        fields          JSONB NOT NULL DEFAULT '[]',
        settings        JSONB NOT NULL DEFAULT '{}',
        -- { redirectUrl, thankYouMessage, sendEmailTo, notifyOnSubmit, honeypot }
        style           JSONB NOT NULL DEFAULT '{}',
        status          TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
        submissions     INTEGER NOT NULL DEFAULT 0,
        created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Form Submissions ─────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        form_id       UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,
        data          JSONB NOT NULL DEFAULT '{}',
        ip_address    TEXT,
        user_agent    TEXT,
        page_url      TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_form_submissions_form
        ON form_submissions(form_id, created_at DESC)
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS form_submissions CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS forms CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS blog_posts CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS site_pages CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS sites CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS funnel_steps CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS funnels CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS email_templates CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS email_campaign_recipients CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS email_campaigns CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS social_posts CASCADE`);
  }
}
