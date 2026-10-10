import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase6Schema1700000006 implements MigrationInterface {
  public async up(qr: QueryRunner): Promise<void> {
    // ─── Agency Branding (White Label) ────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS agency_branding (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id             UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        platform_name         TEXT NOT NULL DEFAULT 'SME Connect',
        logo_url              TEXT,
        favicon_url           TEXT,
        primary_color         TEXT NOT NULL DEFAULT '#009B87',
        accent_color          TEXT NOT NULL DEFAULT '#39B54A',
        custom_domain         TEXT,
        support_email         TEXT,
        support_phone         TEXT,
        hide_powered_by       BOOLEAN NOT NULL DEFAULT FALSE,
        custom_login_bg_url   TEXT,
        mobile_app_name       TEXT,
        mobile_app_icon_url   TEXT,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(agency_id)
      )
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_agency_branding_agency
        ON agency_branding(agency_id)
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_agency_branding_domain
        ON agency_branding(custom_domain)
        WHERE custom_domain IS NOT NULL
    `);

    // ─── Subscription Plans ────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id                UUID REFERENCES agencies(id) ON DELETE CASCADE,
        name                     TEXT NOT NULL,
        description              TEXT,
        stripe_price_id          TEXT,
        monthly_price            NUMERIC(10,2) NOT NULL DEFAULT 0,
        annual_price             NUMERIC(10,2),
        trial_days               INTEGER NOT NULL DEFAULT 14,
        sms_credits_included     INTEGER NOT NULL DEFAULT 0,
        feature_gates            JSONB NOT NULL DEFAULT '{}',
        is_public                BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order               INTEGER NOT NULL DEFAULT 0,
        created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_plans_agency
        ON subscription_plans(agency_id)
    `);

    // ─── Location Subscriptions ────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS location_subscriptions (
        id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id            UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        plan_id                UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
        stripe_customer_id     TEXT,
        stripe_subscription_id TEXT,
        status                 TEXT NOT NULL DEFAULT 'trialing'
                               CHECK (status IN ('trialing','active','past_due','canceled','paused')),
        trial_ends_at          TIMESTAMPTZ,
        current_period_end     TIMESTAMPTZ,
        sms_credits_remaining  INTEGER NOT NULL DEFAULT 0,
        created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(location_id)
      )
    `);

    // ─── SMS Credit Ledger ─────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS sms_credit_ledger (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        delta        INTEGER NOT NULL,
        reason       TEXT NOT NULL,
        balance      INTEGER NOT NULL,
        reference_id TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_sms_ledger_location
        ON sms_credit_ledger(location_id, created_at DESC)
    `);

    // ─── Snapshots ────────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS snapshots (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id    UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        description  TEXT,
        payload      JSONB NOT NULL DEFAULT '{}',
        is_public    BOOLEAN NOT NULL DEFAULT FALSE,
        created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_snapshots_agency
        ON snapshots(agency_id, created_at DESC)
    `);

    // ─── Snapshot Deployments ─────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS snapshot_deployments (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        snapshot_id     UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','running','completed','failed')),
        error_message   TEXT,
        deployed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
        started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at    TIMESTAMPTZ
      )
    `);

    // ─── Prospecting Leads ────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS prospecting_leads (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        business_name   TEXT NOT NULL,
        industry        TEXT,
        website         TEXT,
        phone           TEXT,
        email           TEXT,
        address         TEXT,
        city            TEXT,
        country         TEXT,
        rating          NUMERIC(3,1),
        review_count    INTEGER,
        source          TEXT NOT NULL DEFAULT 'MANUAL',
        ai_audit_report TEXT,
        ai_score        INTEGER,
        status          TEXT NOT NULL DEFAULT 'NEW'
                        CHECK (status IN ('NEW','CONTACTED','QUALIFIED','CONVERTED','LOST')),
        assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
        notes           TEXT,
        converted_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_prospecting_agency
        ON prospecting_leads(agency_id, status, created_at DESC)
    `);

    // ─── Audit Logs ───────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id    UUID REFERENCES agencies(id) ON DELETE CASCADE,
        location_id  UUID REFERENCES locations(id) ON DELETE CASCADE,
        user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
        action       TEXT NOT NULL,
        resource     TEXT NOT NULL,
        resource_id  TEXT,
        old_value    JSONB,
        new_value    JSONB,
        ip_address   TEXT,
        user_agent   TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_agency
        ON audit_logs(agency_id, created_at DESC)
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_location
        ON audit_logs(location_id, created_at DESC)
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user
        ON audit_logs(user_id, created_at DESC)
    `);

    // ─── Reports ──────────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS saved_reports (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        report_type  TEXT NOT NULL,
        config       JSONB NOT NULL DEFAULT '{}',
        schedule     TEXT,
        last_run_at  TIMESTAMPTZ,
        created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_saved_reports_location
        ON saved_reports(location_id, report_type)
    `);

    // ─── Agency Wallet ────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS agency_wallet_transactions (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id      UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        type           TEXT NOT NULL CHECK (type IN ('CREDIT','DEBIT')),
        amount         NUMERIC(10,2) NOT NULL,
        currency       TEXT NOT NULL DEFAULT 'USD',
        description    TEXT NOT NULL,
        reference_id   TEXT,
        balance_after  NUMERIC(10,2) NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_wallet_agency
        ON agency_wallet_transactions(agency_id, created_at DESC)
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS agency_wallet_transactions CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS saved_reports CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS audit_logs CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS prospecting_leads CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS snapshot_deployments CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS snapshots CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS sms_credit_ledger CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS location_subscriptions CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS subscription_plans CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS agency_branding CASCADE`);
  }
}
