import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1000000000000 implements MigrationInterface {
  name = 'InitialSchema1000000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enable extensions ──────────────────────────────────────────────────
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // ── 001: agencies ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE agencies (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name         TEXT NOT NULL,
        owner_email  TEXT NOT NULL,
        branding     JSONB NOT NULL DEFAULT '{}',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── 002: locations ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE locations (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id    UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        phone        TEXT,
        website      TEXT,
        email        TEXT,
        address      TEXT,
        city         TEXT,
        country      TEXT,
        timezone     TEXT,
        settings     JSONB NOT NULL DEFAULT '{}',
        meta_config  JSONB NOT NULL DEFAULT '{}',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_locations_agency ON locations(agency_id)`,
    );

    // ── 003: users ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE users (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id            UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        email                TEXT NOT NULL,
        email_lower          TEXT NOT NULL,
        password_hash        TEXT NOT NULL,
        first_name           TEXT,
        last_name            TEXT,
        avatar_url           TEXT,
        phone                TEXT,
        user_type            TEXT NOT NULL CHECK (user_type IN (
                               'AGENCY_OWNER','AGENCY_ADMIN','AGENCY_USER',
                               'LOCATION_ADMIN','LOCATION_USER'
                             )),
        system_role          TEXT NOT NULL DEFAULT 'USER' CHECK (system_role IN ('ADMIN','USER')),
        primary_location_id  UUID REFERENCES locations(id) ON DELETE SET NULL,
        only_assigned_data   BOOLEAN NOT NULL DEFAULT FALSE,
        feature_permissions  JSONB NOT NULL DEFAULT '{}',
        is_owner             BOOLEAN NOT NULL DEFAULT FALSE,
        totp_secret          TEXT,
        totp_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
        last_login_at        TIMESTAMPTZ,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at           TIMESTAMPTZ,
        UNIQUE(agency_id, email_lower)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_users_agency ON users(agency_id) WHERE deleted_at IS NULL`,
    );

    // Multi-location access for agency users
    await queryRunner.query(`
      CREATE TABLE user_location_access (
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        granted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        granted_by   UUID REFERENCES users(id) ON DELETE SET NULL,
        PRIMARY KEY(user_id, location_id)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_ula_location ON user_location_access(location_id)`,
    );

    // ── 004: token families (JWT refresh rotation) ─────────────────────────
    await queryRunner.query(`
      CREATE TABLE token_families (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_version  INTEGER NOT NULL DEFAULT 1,
        revoked          BOOLEAN NOT NULL DEFAULT FALSE,
        revoked_reason   TEXT,
        last_used_at     TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_token_families_user ON token_families(user_id)`,
    );

    await queryRunner.query(`
      CREATE TABLE revoked_tokens (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        jti         TEXT NOT NULL UNIQUE,
        revoked_at  TIMESTAMPTZ NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL
      )
    `);

    // ── 005: contacts ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE contacts (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id       UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        first_name        TEXT,
        last_name         TEXT,
        email             TEXT,
        email_lower       TEXT,
        phone             TEXT,
        phone_normalized  TEXT,
        company_name      TEXT,
        address           TEXT,
        city              TEXT,
        country           TEXT,
        timezone          TEXT,
        avatar_url        TEXT,
        tags              TEXT[] NOT NULL DEFAULT '{}',
        custom_fields     JSONB NOT NULL DEFAULT '{}',
        assigned_to       UUID REFERENCES users(id) ON DELETE SET NULL,
        facebook_psid     TEXT,
        instagram_igsid   TEXT,
        source            TEXT,
        source_meta       JSONB,
        dnd_settings      JSONB NOT NULL DEFAULT '{}',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at        TIMESTAMPTZ
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_contacts_phone ON contacts(location_id, phone_normalized) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_contacts_email ON contacts(location_id, email_lower) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_contacts_fb_psid ON contacts(location_id, facebook_psid) WHERE facebook_psid IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_contacts_ig_igsid ON contacts(location_id, instagram_igsid) WHERE instagram_igsid IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_contacts_location ON contacts(location_id, created_at DESC) WHERE deleted_at IS NULL`,
    );

    // ── 006: entity_followers ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE entity_followers (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type  TEXT NOT NULL CHECK (entity_type IN ('contact','opportunity')),
        entity_id    UUID NOT NULL,
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(entity_type, entity_id, user_id)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_followers_entity ON entity_followers(entity_type, entity_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_followers_user ON entity_followers(user_id, location_id)`,
    );

    // ── 007: pipelines + stages ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE pipelines (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE pipeline_stages (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pipeline_id  UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
        location_id  UUID NOT NULL,
        name         TEXT NOT NULL,
        sort_order   INTEGER NOT NULL DEFAULT 0,
        color        TEXT NOT NULL DEFAULT '#009B87',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_stages_pipeline ON pipeline_stages(pipeline_id, sort_order)`,
    );

    // ── 008: opportunities ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE opportunities (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id         UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name                TEXT NOT NULL,
        pipeline_id         UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
        pipeline_stage_id   UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
        primary_contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
        monetary_value      NUMERIC(15,2),
        currency            TEXT NOT NULL DEFAULT 'ZAR',
        monetary_value_usd  NUMERIC(15,2),
        status              TEXT NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open','won','lost','abandoned')),
        assigned_to         UUID REFERENCES users(id) ON DELETE SET NULL,
        custom_fields       JSONB NOT NULL DEFAULT '{}',
        ai_score            SMALLINT,
        ai_score_reason     TEXT,
        ai_next_action      TEXT,
        ai_risk_flags       TEXT[] NOT NULL DEFAULT '{}',
        ai_scored_at        TIMESTAMPTZ,
        last_stage_changed_at TIMESTAMPTZ,
        last_activity_at    TIMESTAMPTZ,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at          TIMESTAMPTZ
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_opps_kanban ON opportunities(location_id, pipeline_id, pipeline_stage_id, updated_at DESC)
        WHERE deleted_at IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE opportunity_contacts (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        location_id     UUID NOT NULL,
        role            TEXT,
        is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
        added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(opportunity_id, contact_id)
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_opp_primary_contact
        ON opportunity_contacts(opportunity_id) WHERE is_primary = TRUE
    `);

    // ── 009: conversations + messages ──────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE conversations (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id       UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        contact_id        UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        type              TEXT NOT NULL,
        status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
        assigned_to       UUID REFERENCES users(id) ON DELETE SET NULL,
        last_message_at   TIMESTAMPTZ,
        last_message_body TEXT,
        last_message_type TEXT,
        unread_count      INTEGER NOT NULL DEFAULT 0,
        ai_mode           TEXT NOT NULL DEFAULT 'ON' CHECK (ai_mode IN ('ON','PAUSED','OFF')),
        ai_paused_reason  TEXT,
        ai_paused_at      TIMESTAMPTZ,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at        TIMESTAMPTZ
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_conversations_inbox
        ON conversations(location_id, last_message_at DESC NULLS LAST)
        INCLUDE (contact_id, type, unread_count, assigned_to)
        WHERE deleted_at IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE conversation_messages (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        contact_id       UUID REFERENCES contacts(id) ON DELETE SET NULL,
        location_id      UUID NOT NULL,
        user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
        direction        TEXT NOT NULL CHECK (direction IN ('inbound','outbound','internal')),
        channel          TEXT NOT NULL,
        body             TEXT,
        message_type     TEXT NOT NULL DEFAULT 'TEXT',
        attachments      JSONB NOT NULL DEFAULT '[]',
        external_id      TEXT,
        status           TEXT NOT NULL DEFAULT 'SENT',
        ai_generated     BOOLEAN NOT NULL DEFAULT FALSE,
        sent_at          TIMESTAMPTZ,
        delivered_at     TIMESTAMPTZ,
        read_at          TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_messages_conv ON conversation_messages(conversation_id, created_at DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE conversation_ai_drafts (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        message_id       UUID REFERENCES conversation_messages(id) ON DELETE CASCADE,
        location_id      UUID NOT NULL,
        body             TEXT NOT NULL,
        status           TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','sent','edited_and_sent','dismissed')),
        model_used       TEXT,
        confidence       NUMERIC(4,3),
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_ai_drafts_conv ON conversation_ai_drafts(conversation_id, status)
        WHERE status = 'pending'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS conversation_ai_drafts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversation_messages CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS opportunity_contacts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS opportunities CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS pipeline_stages CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS pipelines CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS entity_followers CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS contacts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS revoked_tokens CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS token_families CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_location_access CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS locations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS agencies CASCADE`);
  }
}
