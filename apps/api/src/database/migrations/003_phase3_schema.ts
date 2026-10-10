import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase3Schema1750000003000 implements MigrationInterface {
  name = 'Phase3Schema1750000003000';

  async up(qr: QueryRunner): Promise<void> {
    // ─── pgvector extension ────────────────────────────────────────────────
    await qr.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // ─── AI Agents ────────────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS ai_agents (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id             UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name                    TEXT NOT NULL,
        system_prompt           TEXT NOT NULL,
        greeting                TEXT NOT NULL DEFAULT 'Hi! How can I help you today?',
        mode                    TEXT NOT NULL DEFAULT 'SUGGESTIVE'
                                CHECK (mode IN ('OFF','SUGGESTIVE','AUTOPILOT')),
        channels                TEXT[] NOT NULL DEFAULT '{}',
        calendar_id             UUID REFERENCES calendars(id) ON DELETE SET NULL,
        human_handoff_triggers  TEXT[] NOT NULL DEFAULT '{}',
        booking_intent_phrases  TEXT[] NOT NULL DEFAULT '{}',
        out_of_hours_message    TEXT,
        tone_profile            JSONB NOT NULL DEFAULT '{}',
        response_delay_ms       INTEGER NOT NULL DEFAULT 5000,
        max_messages_per_conv   INTEGER NOT NULL DEFAULT 20,
        is_auto_built           BOOLEAN NOT NULL DEFAULT FALSE,
        created_by              TEXT NOT NULL DEFAULT 'MANUAL',
        is_active               BOOLEAN NOT NULL DEFAULT TRUE,
        created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_ai_agents_location ON ai_agents(location_id) WHERE is_active = TRUE`);

    // ─── Knowledge Base Chunks (pgvector) ─────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS knowledge_base_chunks (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        agent_id        UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
        content         TEXT NOT NULL,
        embedding       vector(1536),
        source_type     TEXT NOT NULL DEFAULT 'MANUAL'
                        CHECK (source_type IN ('MANUAL','URL_SCRAPE','DOCUMENT','ONBOARDING_QA','FAQ','KB_BRIEFING')),
        category        TEXT NOT NULL DEFAULT 'general',
        priority        SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
        source_url      TEXT,
        source_filename TEXT,
        metadata        JSONB NOT NULL DEFAULT '{}',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    // HNSW index for fast cosine similarity search
    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding
        ON knowledge_base_chunks USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64)
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_kb_chunks_location ON knowledge_base_chunks(location_id, agent_id)`);

    // ─── KB Intake Drafts (auto-save onboarding briefing) ─────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS kb_intake_drafts (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE UNIQUE,
        section_data    JSONB NOT NULL DEFAULT '{}',
        completed_at    TIMESTAMPTZ,
        processed_at    TIMESTAMPTZ,
        total_words     INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ─── Voice Sessions ───────────────────────────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS voice_sessions (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        call_sid        TEXT NOT NULL UNIQUE,
        contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
        from_number     TEXT NOT NULL,
        to_number       TEXT NOT NULL,
        direction       TEXT NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound','outbound')),
        status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','transferred','completed','failed')),
        transcript      JSONB NOT NULL DEFAULT '[]',
        duration_sec    INTEGER,
        ended_at        TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_voice_sessions_location ON voice_sessions(location_id, created_at DESC)`);

    // ─── Workflow definitions (for AI builder) ─────────────────────────────
    await qr.query(`
      CREATE TABLE IF NOT EXISTS workflow_definitions (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        description     TEXT,
        status          TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','PAUSED','ARCHIVED')),
        trigger_type    TEXT NOT NULL DEFAULT 'MANUAL',
        trigger_config  JSONB NOT NULL DEFAULT '{}',
        nodes           JSONB NOT NULL DEFAULT '[]',
        edges           JSONB NOT NULL DEFAULT '[]',
        ai_generated    BOOLEAN NOT NULL DEFAULT FALSE,
        ai_prompt       TEXT,
        version         INTEGER NOT NULL DEFAULT 1,
        created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
        published_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_workflow_definitions_location ON workflow_definitions(location_id, status)`);

    // ─── Conversation AI mode override ─────────────────────────────────────
    await qr.query(`
      ALTER TABLE conversations
        ADD COLUMN IF NOT EXISTS ai_mode TEXT CHECK (ai_mode IN ('ON','PAUSED','OFF')) DEFAULT 'ON',
        ADD COLUMN IF NOT EXISTS ai_paused_reason TEXT,
        ADD COLUMN IF NOT EXISTS ai_paused_at TIMESTAMPTZ
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`ALTER TABLE conversations DROP COLUMN IF EXISTS ai_mode, DROP COLUMN IF EXISTS ai_paused_reason, DROP COLUMN IF EXISTS ai_paused_at`);
    await qr.query(`DROP TABLE IF EXISTS workflow_definitions`);
    await qr.query(`DROP TABLE IF EXISTS voice_sessions`);
    await qr.query(`DROP TABLE IF EXISTS kb_intake_drafts`);
    await qr.query(`DROP TABLE IF EXISTS knowledge_base_chunks`);
    await qr.query(`DROP TABLE IF EXISTS ai_agents`);
  }
}
