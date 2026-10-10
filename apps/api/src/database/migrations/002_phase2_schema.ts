import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase2Schema1700000002 implements MigrationInterface {
  name = 'Phase2Schema1700000002';

  async up(qr: QueryRunner): Promise<void> {
    // ─── Pipelines ────────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS pipelines (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        is_default   BOOLEAN NOT NULL DEFAULT FALSE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at   TIMESTAMPTZ
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_pipelines_location ON pipelines(location_id) WHERE deleted_at IS NULL`);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS pipeline_stages (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pipeline_id  UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        sort_order   INTEGER NOT NULL DEFAULT 0,
        color        TEXT NOT NULL DEFAULT '#6B7280',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_stages_pipeline ON pipeline_stages(pipeline_id, sort_order)`);

    // ─── Opportunities ────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id           UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name                  TEXT NOT NULL,
        pipeline_id           UUID NOT NULL REFERENCES pipelines(id) ON DELETE RESTRICT,
        pipeline_stage_id     UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
        primary_contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,
        monetary_value        NUMERIC(15,2) NOT NULL DEFAULT 0,
        currency              TEXT NOT NULL DEFAULT 'ZAR',
        monetary_value_usd    NUMERIC(15,2),
        status                TEXT NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open','won','lost','abandoned')),
        assigned_to           UUID REFERENCES users(id) ON DELETE SET NULL,
        custom_fields         JSONB NOT NULL DEFAULT '{}',
        ai_score              INTEGER CHECK (ai_score BETWEEN 0 AND 100),
        ai_score_reason       TEXT,
        ai_next_action        TEXT,
        ai_risk_flags         TEXT[] NOT NULL DEFAULT '{}',
        ai_scored_at          TIMESTAMPTZ,
        last_stage_changed_at TIMESTAMPTZ,
        last_activity_at      TIMESTAMPTZ,
        close_date            DATE,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at            TIMESTAMPTZ
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_opps_kanban ON opportunities(location_id, pipeline_id, pipeline_stage_id, updated_at DESC) WHERE deleted_at IS NULL`);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_opps_contact ON opportunities(primary_contact_id) WHERE deleted_at IS NULL`);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_opps_assigned ON opportunities(assigned_to, status) WHERE deleted_at IS NULL`);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS opportunity_contacts (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        role            TEXT,
        is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
        added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(opportunity_id, contact_id)
      )
    `);
    await qr.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_opp_primary_contact ON opportunity_contacts(opportunity_id) WHERE is_primary = TRUE`);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_opp_contacts_contact ON opportunity_contacts(contact_id)`);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS opportunity_notes (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
        body            TEXT NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_opp_notes ON opportunity_notes(opportunity_id, created_at DESC)`);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS opportunity_tasks (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        title           TEXT NOT NULL,
        description     TEXT,
        assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
        due_date        TIMESTAMPTZ,
        completed       BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at    TIMESTAMPTZ,
        created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_opp_tasks ON opportunity_tasks(opportunity_id, completed, due_date)`);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON opportunity_tasks(assigned_to, completed, due_date) WHERE completed = FALSE`);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS opportunity_stage_history (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        opportunity_id   UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        from_stage_id    UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
        to_stage_id      UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
        changed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
        time_in_stage_ms BIGINT,
        changed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_stage_history ON opportunity_stage_history(opportunity_id, changed_at DESC)`);

    // ─── Calendars ────────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS calendars (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        description  TEXT,
        type         TEXT NOT NULL DEFAULT 'event'
                     CHECK (type IN ('event','round_robin','class','collective')),
        timezone     TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
        slug         TEXT NOT NULL,
        availability JSONB NOT NULL DEFAULT '{}',
        settings     JSONB NOT NULL DEFAULT '{}',
        is_active    BOOLEAN NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(location_id, slug)
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        calendar_id     UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
        assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
        title           TEXT NOT NULL,
        description     TEXT,
        starts_at       TIMESTAMPTZ NOT NULL,
        ends_at         TIMESTAMPTZ NOT NULL,
        status          TEXT NOT NULL DEFAULT 'confirmed'
                        CHECK (status IN ('confirmed','cancelled','no_show','rescheduled')),
        meeting_link    TEXT,
        location_notes  TEXT,
        notes           TEXT,
        custom_fields   JSONB NOT NULL DEFAULT '{}',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_appointments_calendar ON appointments(calendar_id, starts_at)`);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_appointments_contact ON appointments(contact_id, starts_at)`);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS opportunity_appointments (
        opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
        PRIMARY KEY(opportunity_id, appointment_id)
      )
    `);

    // ─── Documents & e-signatures ─────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
        opportunity_id  UUID REFERENCES opportunities(id) ON DELETE SET NULL,
        created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
        title           TEXT NOT NULL,
        type            TEXT NOT NULL DEFAULT 'PROPOSAL'
                        CHECK (type IN ('PROPOSAL','CONTRACT','QUOTE','INVOICE','NDA')),
        status          TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','SENT','VIEWED','SIGNED','DECLINED','EXPIRED')),
        body_json       JSONB NOT NULL DEFAULT '{}',
        merge_fields    JSONB NOT NULL DEFAULT '{}',
        sent_at         TIMESTAMPTZ,
        first_viewed_at TIMESTAMPTZ,
        view_count      INTEGER NOT NULL DEFAULT 0,
        signed_at       TIMESTAMPTZ,
        expires_at      TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_docs_location ON documents(location_id, status, created_at DESC)`);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_docs_contact ON documents(contact_id)`);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS document_audit_events (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        event_type   TEXT NOT NULL,
        metadata     JSONB NOT NULL DEFAULT '{}',
        occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_doc_audit ON document_audit_events(document_id, occurred_at DESC)`);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS document_signatures (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        signer_name       TEXT NOT NULL,
        signer_email      TEXT NOT NULL,
        ip_address        TEXT NOT NULL,
        user_agent        TEXT NOT NULL,
        signature_png_key TEXT NOT NULL,
        document_hash     TEXT NOT NULL,
        certificate_id    TEXT NOT NULL UNIQUE,
        signed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_doc_signatures ON document_signatures(document_id)`);

    // ─── Stripe subscriptions ─────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name                  TEXT NOT NULL,
        stripe_price_id       TEXT NOT NULL UNIQUE,
        monthly_price         NUMERIC(10,2) NOT NULL,
        sms_credits_included  INTEGER NOT NULL DEFAULT 0,
        feature_gates         JSONB NOT NULL DEFAULT '{}',
        is_active             BOOLEAN NOT NULL DEFAULT TRUE,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS location_subscriptions (
        id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id              UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE UNIQUE,
        stripe_customer_id       TEXT NOT NULL,
        stripe_subscription_id   TEXT NOT NULL,
        plan_id                  UUID NOT NULL REFERENCES subscription_plans(id),
        status                   TEXT NOT NULL
                                 CHECK (status IN ('trialing','active','past_due','canceled','paused')),
        trial_ends_at            TIMESTAMPTZ,
        current_period_end       TIMESTAMPTZ NOT NULL,
        sms_credits_remaining    INTEGER NOT NULL DEFAULT 0,
        created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS sms_credit_ledger (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        delta        INTEGER NOT NULL,
        reason       TEXT NOT NULL,
        balance      INTEGER NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_sms_ledger ON sms_credit_ledger(location_id, created_at DESC)`);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS sms_credit_ledger CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS location_subscriptions CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS subscription_plans CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS document_signatures CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS document_audit_events CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS documents CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS opportunity_appointments CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS appointments CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS calendars CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS opportunity_stage_history CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS opportunity_tasks CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS opportunity_notes CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS opportunity_contacts CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS opportunities CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS pipeline_stages CASCADE`);
    await qr.query(`DROP TABLE IF EXISTS pipelines CASCADE`);
  }
}
