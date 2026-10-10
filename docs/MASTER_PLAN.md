# Plan: Full GoHighLevel Clone with Anthropic + OpenAI Integration

## Context
You are building a full replica of GoHighLevel (GHL) — a white-label CRM/marketing automation SaaS — but with native AI capabilities powered by Anthropic (Claude) and OpenAI (GPT). The GHL API docs in this repo serve as the authoritative spec for every endpoint, data model, and webhook contract. Your platform (already branded as "SME Connect") has the GHL UI as a visual reference. The goal is a production-grade, multi-tenant SaaS that replaces GHL's manual workflows with AI-native ones.

---

## UI/UX Design System Plan

> Built using the **ui-ux-pro-max skill** (`C:\Users\siphe\Downloads\Useful Gits\ui-ux-pro-max-skill-main`)
> Workflow: `/ckm:brand` → `/ckm:design-system` → `/ckm:ui-styling` → `/ckm:design`

### Brand Identity (SME Connect)

Extracted from official SME Connect marketing material (flyer, logo, website):

| Token | Value |
|-------|-------|
| Primary (Teal) | `#009B87` — logo, sidebar active, primary buttons |
| Accent (Green) | `#39B54A` — "OPPORTUNITIES OPEN" banner, bullet points, CTA buttons |
| Dark surface | `#1A1A2E` — dark section overlays, footer bar |
| Light surface | `#FFFFFF` / `#F4F9F9` — card backgrounds, main content |
| Text primary | `#1A1A1A` — bold headlines |
| Text muted | `#6B7280` — subtext, labels |
| Border | `#E5E7EB` — card borders, dividers |
| Logo | Circular gear/network icon in teal + "sme connect" bold wordmark + "Online Directory" tagline |
| Font | **Montserrat** (bold headlines) + **Inter** (body) — matches the flyer's bold typographic style |
| Style vibe | High contrast, bold typography, photo-forward, green/teal accents on white — NOT dark/purple |

Generate assets:
```bash
python3 scripts/logo/generate.py --brand "SME Connect" --style "bold-teal-tech"
python3 scripts/cip/generate.py --brand "SMEConnect" --logo logo.png --industry online-directory-crm
```

---

### Design Token Architecture (3-Layer)

**Layer 1 — Primitive tokens** (raw values, in `assets/design-tokens.json`):
- Colors: purple-50 → purple-950, blue-50 → blue-950, grays, status colors
- Spacing: 4px base unit (0 → 96px scale)
- Typography: Inter, 12px–48px scale
- Radius: 4px (inputs/badges) → 12px (cards) → 9999px (pills)

**Layer 2 — Semantic tokens** (mapped to purpose):
```json
{
  "background": "#F4F9F9",
  "sidebar-bg": "#FFFFFF",
  "sidebar-text": "#4B5563",
  "sidebar-active-bg": "#E6F7F5",
  "sidebar-active-text": "#009B87",
  "sidebar-active-border": "#009B87",
  "primary": "#009B87",
  "primary-hover": "#007A6C",
  "accent": "#39B54A",
  "accent-hover": "#2E9B3E",
  "card-bg": "#FFFFFF",
  "card-border": "#E5E7EB",
  "border": "#E5E7EB",
  "muted": "#6B7280",
  "heading-font": "Montserrat",
  "body-font": "Inter"
}
```

**Layer 3 — Component tokens**: button, input, card, badge, dialog (see component specs below).

Generate CSS variables:
```bash
node scripts/generate-tokens.cjs
```

---

### Tailwind + shadcn/ui Setup

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog badge alert table input form select dropdown-menu sheet tabs avatar tooltip
python3 scripts/shadcn_add.py command-palette data-table calendar
```

`tailwind.config.ts` — extend with brand tokens:
```ts
theme: {
  extend: {
    colors: {
      primary: { DEFAULT: "#009B87", hover: "#007A6C", light: "#E6F7F5" },
      accent:  { DEFAULT: "#39B54A", hover: "#2E9B3E" },
      sidebar: { bg: "#FFFFFF", border: "#E5E7EB", active: "#E6F7F5" },
      surface: "#F4F9F9",
    },
    fontFamily: {
      heading: ["Montserrat", "Inter", "system-ui"],
      sans: ["Inter", "system-ui"],
    },
  }
}
```

---

### Core Layout Patterns

#### 1. App Shell (SME Connect brand — light sidebar)
```
┌──────────────────────────────────────────────────────┐
│  Top Bar: white bg | SME logo | search | Ask AI | notifs│
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│  White   │   Main Content (bg-surface #F4F9F9)       │
│  Sidebar │   Bold teal headings, white cards,        │
│  240px   │   green accent CTAs                       │
│  teal    │                                           │
│  accents │                                           │
└──────────┴───────────────────────────────────────────┘
```
- Sidebar: `bg-white` with `border-r border-gray-200`, collapsible
- Logo: SME Connect gear icon + wordmark at top of sidebar
- Nav items: icon + label, active = teal left border + `bg-[#E6F7F5]` + teal text
- Sub-items: indented, gray-500 text
- Bottom of sidebar: user avatar + name + settings link

#### 2. Page Header Pattern
```
Page Title (H1, 28px bold)                [Secondary Btn] [Primary Btn + icon]
Tabs: Tab1 | Tab2 | Tab3 (beta badge)
─────────────────────────────────────────────────────
```

#### 3. Data Table Pattern (Workflows list, Contacts, Opportunities)
- shadcn `<DataTable>` with: checkbox column, sortable headers, status badge, action menu (`⋮`)
- Row hover: `bg-gray-50`
- Pagination: Previous / page numbers / Next / rows-per-page select

#### 4. Kanban Board (Opportunities Pipeline)
- Column headers: stage name + count + total value
- Draggable cards: React DnD Kit
- Add card button per column
- Color-coded stage indicators

#### 5. Workflow Canvas (Automation Builder)
- **React Flow** for node-based visual builder
- Trigger nodes (green), Action nodes (blue), Condition nodes (purple), AI nodes (gradient purple→blue)
- Right panel: node config sidebar (400px) — matches GHL's "CHOOSE A WORKFLOW TRIGGER" panel
- Top bar: Standard builder dropdown | Builder / Settings / Enrollment / Logs tabs | Test | Draft toggle | Publish

---

### Component Specs

#### Sidebar Nav Item
```tsx
// Active state — teal left border + light teal bg (light sidebar, NOT dark)
<div className="flex items-center gap-3 px-3 py-2 rounded-lg
  bg-[#E6F7F5] border-l-2 border-[#009B87] text-[#009B87]">
  <Icon className="w-5 h-5 text-[#009B87]" />
  <span className="text-sm font-semibold font-heading">Automation</span>
</div>

// Default state
<div className="flex items-center gap-3 px-3 py-2 rounded-lg
  text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
```

#### Status Badge (matches GHL Draft/Published)
```tsx
// Published — SME green accent
<Badge className="bg-green-100 text-green-700 border-green-200">Published</Badge>
// Draft
<Badge variant="outline" className="text-gray-500">Draft</Badge>
```

#### Primary CTA Button (teal — matches SME Connect brand)
```tsx
<Button className="bg-[#009B87] hover:bg-[#007A6C] text-white gap-2 font-heading font-bold">
  + Create workflow
</Button>
```

#### AI Action Button (green accent — matches "APPLY NOW" / AI features)
```tsx
<Button className="bg-[#39B54A] hover:bg-[#2E9B3E] text-white gap-2">
  <Sparkles className="w-4 h-4" />
  Build using AI
</Button>
```

#### Dashboard Hero Card (bold, photo-forward — inspired by flyer style)
```tsx
<div className="rounded-2xl overflow-hidden relative bg-[#009B87] text-white p-6">
  <h2 className="font-heading font-black text-3xl uppercase tracking-tight">
    Welcome back, Siphelele
  </h2>
  <p className="text-teal-100 mt-1">Here's what's happening today</p>
  {/* KPI chips row */}
</div>
```

#### Ask AI Command Palette (global `⌘K`)
- Full-width modal, dark bg
- Input: "Ask AI anything..." placeholder
- Suggestions: recent contacts, recent workflows, quick actions
- Powered by Claude streaming (Server-Sent Events)

---

### Page-by-Page UI Plan

| Page | Key Components | AI Integration |
|------|---------------|---------------|
| Dashboard | KPI cards, Chart.js line/bar, activity feed | GPT narrative summary widget |
| Conversations | Split pane: thread list + message view + AI reply suggestions | Claude streaming suggestions |
| Contacts | DataTable + filters sidebar + contact detail drawer | Auto-enrich panel |
| Opportunities | Kanban board + list toggle + filter bar | Lead score badge (color coded) |
| Workflows list | DataTable with folder tree on left | — |
| Workflow Builder | React Flow canvas + right config panel | AI Build modal (Claude) |
| Calendars | FullCalendar.js grid + booking page builder | AI scheduling modal |
| Payments | Tabs: Orders/Subscriptions/Transactions/Products | GPT invoice drafter |
| Sites/Funnels | Drag-drop page builder (GrapesJS or Craft.js) | Claude section generator |
| AI Agents | Card grid of agents + Agent Studio builder | — |
| Social Planner | Calendar grid view + post composer | GPT caption generator |
| Reporting | Chart.js dashboards + date range picker | Claude narrative reports |
| Settings | Tabbed sidebar layout | — |

---

### Opacity & Transparency Effects

The UI should use opacity intentionally — layering teal/green at different transparencies creates depth without heaviness. Think **glassmorphism meets bold brand**.

#### Opacity Scale (add to design tokens)
```json
{
  "opacity-glass": "0.12",
  "opacity-hover": "0.08",
  "opacity-active": "0.16",
  "opacity-overlay": "0.60",
  "opacity-scrim": "0.80"
}
```

#### Glassmorphism Cards (hero sections, AI panels)
```tsx
// Frosted teal glass card — use over photo backgrounds or gradient surfaces
<div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md
  shadow-lg shadow-teal-900/10 p-6 text-white">
  {/* content */}
</div>
```

#### Teal Glow / Soft Overlay Panels
```tsx
// Stat card with teal tint — sits on #F4F9F9 surface
<div className="rounded-xl bg-[#009B87]/8 border border-[#009B87]/20 p-5">
  <p className="text-[#009B87] font-heading font-bold text-2xl">1,240</p>
  <p className="text-gray-500 text-sm">Active Contacts</p>
</div>

// Green accent variant
<div className="rounded-xl bg-[#39B54A]/8 border border-[#39B54A]/20 p-5">
```

#### Sidebar Active Item — layered opacity
```tsx
// Instead of flat bg, use teal at opacity so it feels alive
<div className="bg-[#009B87]/12 border-l-[3px] border-[#009B87]
  text-[#009B87] rounded-r-lg">
```

#### Hover States — ghost teal
```tsx
// Nav item hover — barely-there teal wash
className="hover:bg-[#009B87]/6 hover:text-[#009B87] transition-all duration-150"

// Button ghost variant
className="bg-transparent border border-[#009B87]/40 text-[#009B87]
  hover:bg-[#009B87]/10 hover:border-[#009B87]"
```

#### Hero / Banner Sections — photo + teal scrim
```tsx
// Matches the flyer: photo behind + brand color overlay
<div className="relative rounded-2xl overflow-hidden h-48">
  <img src={photo} className="absolute inset-0 w-full h-full object-cover" />
  {/* Teal gradient scrim — left 60% teal, right fades to transparent */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#009B87]/90 via-[#009B87]/60 to-transparent" />
  <div className="relative z-10 p-6 text-white">
    <h2 className="font-heading font-black text-2xl uppercase">Dashboard</h2>
  </div>
</div>
```

#### Modal / Dialog Scrim
```tsx
// Dark overlay behind modals — not pure black, teal-tinted
<div className="fixed inset-0 bg-[#007A6C]/60 backdrop-blur-sm" />
```

#### AI Streaming Panel — animated glass
```tsx
// Ask AI panel — glassy surface with animated teal border glow
<div className="rounded-2xl bg-white/80 backdrop-blur-xl
  border border-[#009B87]/30
  shadow-[0_0_30px_rgba(0,155,135,0.12)]
  ring-1 ring-[#009B87]/10">
```

#### Notification / Toast — tinted glass
```tsx
// Success toast — green glass
<div className="rounded-lg bg-[#39B54A]/90 backdrop-blur-sm text-white
  border border-white/20 shadow-lg px-4 py-3 flex gap-3">
  <CheckCircle className="w-5 h-5 text-white/90" />
  <span className="text-sm font-medium">Workflow published</span>
</div>
```

#### Opacity Usage Rules
| Opacity | Use case |
|---------|----------|
| `/6` – `/8` | Subtle tint backgrounds (stat cards, hover states) |
| `/12` – `/16` | Active nav items, selected rows, focus rings |
| `/20` – `/30` | Card borders, dividers, glass edges |
| `/40` – `/60` | Ghost buttons, badge borders |
| `/60` – `/80` | Photo scrims, overlay panels |
| `/80` – `/90` | Toasts, tooltips with blur |
| Solid | Primary buttons, headings, icons in active state |

---

### Dark Mode
- `next-themes` provider wrapping app
- All semantic tokens have `dark:` variants in Tailwind
- Sidebar is already dark; main content flips `bg-white` ↔ `bg-gray-900`

---

### Responsive Breakpoints
- **Mobile** (<768px): sidebar collapses to bottom nav bar, tables become cards
- **Tablet** (768–1024px): sidebar icon-only mode
- **Desktop** (>1024px): full sidebar + content

---

### Verification for UI
1. Run `npx shadcn@latest init` → confirm tokens generate correctly
2. Load Storybook with all 6 core components in all variants
3. Screenshot workflow canvas with React Flow — compare against GHL builder screenshot
4. Run `/ckm:brand review` to validate all pages against brand guidelines
5. Lighthouse score ≥ 90 on dashboard page (performance + accessibility)

---

## All 99 Features → Grouped into Build Modules

### Module 1 — Agency Layer (Multi-tenant Admin)
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 1 | Ask AI | Claude as command interpreter — create contacts, posts, automations via natural language |
| 2 | Launchpad | AI-guided onboarding checklist |
| 3 | Agency Dashboard | GPT-summarized KPIs and anomaly alerts |
| 4 | SaaS Configurator | AI plan builder — describe your offer, AI generates the sub-account config |
| 5 | Sub-Accounts Management | — |
| 6 | Account Snapshots | — |
| 7 | Prospecting Tool | Claude searches web/LinkedIn for local business leads, generates audit reports |
| 8 | Reselling Config | — |
| 9 | White Label Branding | — |
| 10 | Team Management | — |
| 11 | Wallet & Transactions | GPT spend summarizer |
| 12 | Affiliate Portal | — |
| 13 | Template Library | AI-generated templates on demand |
| 14 | App Marketplace | — |
| 15 | University / SaaS Education | AI tutor over your own docs (RAG) |
| 16 | Ideas Board | — |
| 17 | Audit Logs | AI anomaly detection |
| 18 | API Keys / Private Integrations | — |
| 19 | Compliance / Labs | — |

### Module 2 — CRM (Contacts, Companies, Pipelines)
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 20 | Contacts CRM | Claude auto-enriches contacts from conversation history |
| 21 | Bulk Actions | AI-assisted segment builder ("find all leads who haven't replied in 7 days") |
| 22 | Task Actions | AI auto-assigns tasks based on pipeline stage |
| 23 | Companies | — |
| 24 | Opportunities | GPT lead scoring on create/update |
| 25 | Pipelines | AI suggests next pipeline stage based on conversation tone |
| 26 | Custom Fields | — |
| 27 | Custom Objects | — |
| 28 | Custom Values | — |
| 29 | Lead Scoring (Manage Scoring) | Claude sentiment + intent scoring |
| 30 | Tags | AI auto-tagging from conversation content |

### Module 3 — Conversations & Messaging
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 31 | Conversations Inbox | — |
| 32 | Manual Actions (Calls/SMS) | AI-suggested reply drafts |
| 33 | Snippets | AI-generated snippet library |
| 34 | Trigger Links | — |
| 35 | Chat Widgets | Claude/GPT as the chatbot engine |
| 36 | WhatsApp Integration | AI auto-replies via WhatsApp |
| 37 | Email Marketing | GPT writes subject lines, body, A/B variants |
| 38 | Countdown Timers | — |

### Module 4 — AI Agents (Core Differentiator)
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 39 | AI Studio | Claude builds websites/apps from prompts (Artifacts-style) |
| 40 | Agent Studio | Claude SDK agents with tools: CRM read/write, calendar, email |
| 41 | Voice AI | OpenAI Realtime API (GPT-4o audio) for inbound/outbound calls |
| 42 | Conversation AI | Claude for SMS/email/chat auto-reply with human handoff |
| 43 | Knowledge Base (RAG) | Vector DB (pgvector) + Claude retrieval |
| 44 | Agent Templates | Pre-built Claude agent configs |
| 45 | Content AI | GPT-4o / Claude for text + DALL·E for images |
| 46 | Agent Logs | — |

### Module 5 — Automation (Workflows)
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 47 | Workflow Builder (visual) | Drag-and-drop node canvas (React Flow) |
| 48 | AI Workflow Builder | Describe automation in plain English → Claude generates the JSON workflow config |
| 49 | Triggers (all 58 webhook event types from docs) | — |
| 50 | Trigger Links | — |

### Module 6 — Calendar & Appointments
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 51 | Calendar View | — |
| 52 | Booking Pages (create calendars) | AI scheduling assistant via chat |

### Module 7 — Payments & E-Commerce
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 53 | Documents & Contracts | Claude drafts contracts from templates |
| 54 | Orders | — |
| 55 | Subscriptions | — |
| 56 | Payment Links | — |
| 57 | Transactions | GPT spend summaries |
| 58 | Products | — |
| 59 | Coupons | — |
| 60 | Gift Cards | — |
| 61 | E-Commerce Store | AI product descriptions |
| 62 | Invoices | Claude auto-generates invoice line items |

### Module 8 — Marketing
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 63 | Social Planner | GPT writes captions, Claude schedules optimal times |
| 64 | Affiliate Manager | — |
| 65 | Brand Boards | AI brand kit generator from logo |
| 66 | Ad Manager | GPT writes ad copy variants |

### Module 9 — Sites & Funnels
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 67 | Funnel Builder | AI funnel generator from niche description |
| 68 | Website Builder | Claude generates full page sections from prompts |
| 69 | Webinars | — |
| 70 | Site Analytics | GPT-generated insights |
| 71 | Blogs | Claude SEO blog writer |
| 72 | WordPress Integration | — |
| 73 | Form Builder | AI form field suggester |
| 74 | Survey Builder | — |
| 75 | Quiz Builder | — |
| 76 | QR Codes | — |

### Module 10 — Memberships & Community
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 77 | Courses | AI course outline generator |
| 78 | Communities | Claude community moderator |
| 79 | Credentials / Certificates | — |
| 80 | Client Portal | — |
| 81 | Media Storage | — |

### Module 11 — Reputation & Listings
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 82 | Review Collection | Claude writes personalised review request messages |
| 83 | Review Widgets | — |
| 84 | Listings / Citations | — |

### Module 12 — Reporting
| # | Feature | AI Enhancement |
|---|---------|---------------|
| 85-99 | All Report Types | Claude generates narrative reports from raw metrics |

---

## Recommended Tech Stack

### Backend
- **Runtime**: Node.js (TypeScript) with NestJS — mirrors GHL's modular API structure
- **Database**: PostgreSQL (primary) + pgvector (embeddings for RAG Knowledge Base)
- **Cache / Queue**: Redis + BullMQ (workflow execution, AI job queues)
- **File Storage**: S3-compatible (Cloudflare R2 or MinIO)

### AI Layer
- **Anthropic SDK** (`@anthropic-ai/sdk`) — primary agent engine
  - Claude 3.5 Sonnet: conversation AI, content generation, workflow builder
  - Claude tool use: Agent Studio actions (CRM read/write, calendar, email send)
  - Claude streaming: real-time chat widget responses
- **OpenAI SDK** (`openai`) — secondary / Voice
  - GPT-4o: ad copy, A/B variants, email subject lines
  - GPT-4o Realtime API (WebSocket): Voice AI phone agent
  - `text-embedding-3-small`: Knowledge Base vector embeddings
  - DALL·E 3: Content AI image generation

### Frontend
- **Framework**: Next.js 14 (App Router) — SSR for dashboards, client for canvas/builders
- **Workflow Canvas**: React Flow (same visual style as GHL builder you see in screenshot)
- **UI Kit**: shadcn/ui + Tailwind CSS (dark sidebar, card-based layout matching your screenshots)
- **Real-time**: Socket.io (live conversation inbox, agent logs)

### Infrastructure
- **Auth**: JWT + OAuth 2.0 (matching the GHL scopes in `docs/oauth/Scopes.md`)
- **Multi-tenancy**: Agency → Location (sub-account) hierarchy, row-level security in Postgres
- **Webhooks**: Outgoing webhook engine matching all 58 event types in `docs/webhook events/`
- **Phone**: Twilio (calls/SMS), with GPT-4o Realtime for Voice AI calls

---

## API Layer Strategy

Use the GHL OpenAPI specs in `apps/*.json` and `apps/v3/*.json` as your **internal API contract**. Each module maps 1:1:

```
apps/contacts.json        → /api/contacts (NestJS ContactsModule)
apps/opportunities.json   → /api/opportunities
apps/conversations.json   → /api/conversations
apps/workflows.json       → /api/workflows
apps/calendars.json       → /api/calendars
... (41 modules total)
```

This means existing GHL integrations (Zapier, Make.com, third-party tools) can connect to your platform with minimal changes.

---

---

## Core GHL Feature Parity — Coded to the T

Each section below maps the exact GHL capability to a concrete implementation spec.

---

### 1. Missed Call Text Back

**How it works:** Twilio detects a missed call → fires webhook → NestJS handler sends SMS immediately.

```
Twilio Number → Call not answered (statusCallback: no-answer/busy/failed)
→ POST /webhooks/twilio/call-status
→ MissedCallHandler:
    1. Lookup contact by caller's From number
    2. If not found → create contact automatically
    3. Fire SMS via Twilio: "Hi {firstName}, sorry we missed your call! How can we help?"
    4. Log as Conversation message (channel: SMS)
    5. Enroll contact in "Missed Call" workflow if configured
```

**Backend (NestJS):**
```ts
// src/modules/phone/handlers/missed-call.handler.ts
@Injectable()
export class MissedCallHandler {
  async handle(payload: TwilioCallStatusDto) {
    if (!['no-answer','busy','failed'].includes(payload.CallStatus)) return;
    const contact = await this.contactsService.findOrCreateByPhone(payload.From, payload.locationId);
    await this.smsService.send({
      to: payload.From,
      body: this.templateEngine.render(location.missedCallTemplate, contact),
      locationId: payload.locationId,
    });
    await this.workflowEngine.enroll(contact.id, TriggerType.MISSED_CALL);
  }
}
```

**Config per location:** `missed_call_text_back_enabled: boolean`, `missed_call_template: string`

---

### 2. Omnichannel Unified Inbox

**Channels supported:** SMS (Twilio), Email (SendGrid inbound parse), Instagram DM (Meta Graph API), Facebook Messenger (Meta Graph API), Google Business Messages (Google APIs), Web Chat (Socket.io widget).

**Architecture:**
```
Channel Adapters (normalize to ConversationMessage schema)
        ↓
Message Router (locationId + contactId resolution)
        ↓
conversations table (PostgreSQL)
        ↓                    ↓
WebSocket broadcast     Workflow Trigger
(inbox real-time)       (INBOUND_MESSAGE event)
```

**Unified message schema:**
```ts
interface ConversationMessage {
  id: string;
  conversationId: string;
  contactId: string;
  locationId: string;
  channel: 'SMS' | 'EMAIL' | 'INSTAGRAM' | 'FACEBOOK' | 'GMB' | 'WEBCHAT' | 'WHATSAPP';
  direction: 'INBOUND' | 'OUTBOUND';
  body: string;
  attachments?: Attachment[];
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  aiGenerated: boolean;
  createdAt: Date;
}
```

**Inbound webhook routes:**
```
POST /webhooks/twilio/sms          → TwilioSmsAdapter
POST /webhooks/sendgrid/inbound    → SendGridEmailAdapter
POST /webhooks/meta/messenger      → MetaMessengerAdapter
POST /webhooks/meta/instagram      → MetaInstagramAdapter
POST /webhooks/gmb/messages        → GoogleBusinessAdapter
WS  /chat-widget/:locationId       → WebChatAdapter
```

**Frontend (Conversations Inbox):**
- Left pane: conversation list, filterable by channel (chip filters: All / SMS / Email / FB / IG / Chat)
- Right pane: message thread + composer with channel-aware send button
- Real-time updates via Socket.io room: `location:{locationId}:conversations`

---

### 3. Conversation AI (Text & Chat)

**How it works:** Inbound message → check if AI is active for this channel → stream Claude response → send reply → log.

```
Inbound Message (any channel)
  → ConversationAIService.shouldHandle(message) // checks location AI settings
  → Build system prompt:
      - Business info (name, hours, services)
      - Knowledge Base chunks (RAG via pgvector similarity search)
      - Conversation history (last 20 messages)
      - Tone/persona config
  → anthropic.messages.stream({ model: 'claude-3-5-sonnet-20241022', ... })
  → On tool_use: "book_appointment" → CalendarService.createBooking()
  → On tool_use: "update_contact" → ContactsService.update()
  → Send final text via original channel adapter
  → Set message.aiGenerated = true
  → If confidence < threshold → flag for human review (Human Handoff)
```

**Claude tools defined for Conversation AI:**
```ts
const CONVERSATION_AI_TOOLS = [
  {
    name: 'book_appointment',
    description: 'Book a calendar appointment for the contact',
    input_schema: { type: 'object', properties: {
      calendarId: { type: 'string' },
      datetime: { type: 'string', format: 'date-time' },
      notes: { type: 'string' }
    }}
  },
  {
    name: 'update_contact',
    description: 'Update contact fields (name, email, tags, pipeline stage)',
    input_schema: { type: 'object', properties: {
      fields: { type: 'object' },
      tags: { type: 'array', items: { type: 'string' } }
    }}
  },
  {
    name: 'transfer_to_human',
    description: 'Hand off conversation to a human agent',
    input_schema: { type: 'object', properties: {
      reason: { type: 'string' },
      urgency: { type: 'string', enum: ['low','medium','high'] }
    }}
  },
  {
    name: 'send_payment_link',
    description: 'Send a Stripe payment link to the contact',
    input_schema: { type: 'object', properties: {
      productId: { type: 'string' },
      amount: { type: 'number' }
    }}
  }
]
```

**Human Handoff:** When `transfer_to_human` tool is called → conversation marked `status: NEEDS_HUMAN` → real-time notification to assigned user → AI paused until agent marks `status: RESOLVED`.

---

### 4. Voice AI

**Stack:** Twilio Media Streams (WebSocket) + OpenAI Realtime API (GPT-4o audio).

```
Inbound Call → Twilio
  → TwiML: <Connect><Stream url="wss://api.smeconnect.co.za/voice-ai/{locationId}" /></Connect>
  → VoiceAIGateway (NestJS WebSocket Gateway)
      ↔ Twilio audio stream (μ-law 8kHz PCM)
      ↔ OpenAI Realtime API (WebSocket)
          - System prompt: business info + knowledge base
          - Tools: book_appointment, transfer_to_human, collect_info
          - Voice: "alloy" or custom
  → On session.end:
      - Transcribe full call
      - Create/update contact
      - Log call in conversation thread
      - Enroll in post-call workflow
```

**VoiceAI config per location:**
```ts
interface VoiceAIConfig {
  enabled: boolean;
  greeting: string;           // "Thanks for calling {businessName}, how can I help?"
  voice: 'alloy'|'echo'|'nova'|'shimmer';
  knowledgeBaseId: string;
  fallbackPhone: string;      // transfer to human if AI can't handle
  maxCallDuration: number;    // seconds before auto-transfer
  postCallWorkflowId: string;
}
```

---

### 5. Wait Conditions & Conditional Logic in Workflows

**Workflow node types (stored as JSON graph in DB):**

```ts
type WorkflowNodeType =
  | 'TRIGGER'           // entry point
  | 'SEND_SMS'
  | 'SEND_EMAIL'
  | 'SEND_VOICEMAIL_DROP'
  | 'WAIT_DELAY'        // wait X minutes/hours/days
  | 'WAIT_CONDITION'    // wait until event OR timeout
  | 'IF_ELSE'           // conditional branch
  | 'AI_DECISION'       // Claude decides which branch
  | 'UPDATE_CONTACT'
  | 'UPDATE_OPPORTUNITY'
  | 'ADD_TAG' | 'REMOVE_TAG'
  | 'ASSIGN_USER'
  | 'CREATE_TASK'
  | 'SEND_WEBHOOK'
  | 'TRIGGER_LINK_CLICK' // wait for specific link click
  | 'AI_REPLY'           // Claude generates and sends message
  | 'BOOK_APPOINTMENT'
  | 'SEND_PAYMENT_LINK'
  | 'GO_TO'             // jump to another node
  | 'END'
```

**WAIT_CONDITION node example:**
```json
{
  "type": "WAIT_CONDITION",
  "config": {
    "timeout": { "value": 24, "unit": "hours" },
    "condition": {
      "event": "EMAIL_OPENED",
      "emailStepId": "step_abc123"
    },
    "branches": {
      "condition_met": "node_priority_path",
      "timeout": "node_sms_followup"
    }
  }
}
```

**IF_ELSE node — evaluates contact data:**
```json
{
  "type": "IF_ELSE",
  "config": {
    "conditions": [
      { "field": "contact.tags", "operator": "contains", "value": "High Intent" },
      { "field": "opportunity.stage", "operator": "equals", "value": "Qualified" }
    ],
    "logic": "AND",
    "branches": { "true": "node_hot_lead", "false": "node_nurture" }
  }
}
```

**Workflow Execution Engine (BullMQ):**
```
WorkflowQueue → WorkflowWorker
  - Loads enrollment (contactId + workflowId + currentNodeId)
  - Executes node action
  - For WAIT_DELAY: schedules delayed job in BullMQ
  - For WAIT_CONDITION: registers event listener, sets timeout fallback job
  - On condition fired: cancels timeout, advances to condition_met branch
  - Logs each step to workflow_executions table
```

---

### 6. Voicemail Drops

**How it works:** No ringing — Twilio's `answering_machine_detection` + pre-recorded MP3 dropped silently.

```ts
// src/modules/phone/services/voicemail-drop.service.ts
async dropVoicemail(contactId: string, audioFileUrl: string) {
  const contact = await this.contactsService.findById(contactId);
  await this.twilioClient.calls.create({
    to: contact.phone,
    from: location.twilioNumber,
    machineDetection: 'DetectMessageEnd',  // wait for beep
    asyncAmdStatusCallback: `${BASE_URL}/webhooks/twilio/amd-status`,
    url: `${BASE_URL}/twiml/voicemail-drop?audioUrl=${audioFileUrl}`,
  });
}

// TwiML served at /twiml/voicemail-drop
// <Response><Play>{audioUrl}</Play><Hangup/></Response>
// Only plays AFTER AMD detects answering machine
```

---

### 7. Trigger Links

**How it works:** Unique short link → contact clicks → redirect + fire workflow trigger.

```
POST /api/trigger-links          → create link (locationId, destinationUrl, workflowId, tag)
GET  /t/:shortCode               → TriggerLinkController:
  1. Decode shortCode → triggerLink record
  2. Resolve contact from query param token (or cookie/session)
  3. Log click event: trigger_link_clicks table
  4. Fire workflow: WorkflowEngine.enroll(contactId, TriggerType.TRIGGER_LINK_CLICKED, { linkId })
  5. Apply tags if configured
  6. 302 redirect to destinationUrl
```

**Embed in emails/SMS:**
```ts
// Template variable: {{triggerLink.name}}
// Renders as: https://app.smeconnect.co.za/t/abc123?cid={{contact.id}}
```

---

### 8. Sub-Accounts & Snapshots

**Sub-account (Location) isolation:**
- Every DB table has `location_id` foreign key
- Row-level security in PostgreSQL enforces isolation
- Each location has its own: phone numbers, users, contacts, workflows, pipelines, calendars

**Snapshot system:**
```ts
interface Snapshot {
  id: string;
  name: string;
  agencyId: string;
  payload: {
    workflows: WorkflowDefinition[];
    pipelines: Pipeline[];
    calendars: Calendar[];
    funnels: Funnel[];
    emailTemplates: EmailTemplate[];
    customFields: CustomField[];
    tags: Tag[];
    // contacts NOT included — snapshot is config only
  }
}

// Deploy snapshot to new sub-account:
POST /api/snapshots/:id/deploy
body: { targetLocationId: string }
→ SnapshotService.deploy():
    1. Deep-clone all entities with new IDs
    2. Remap internal references (e.g. workflowId → new workflow IDs)
    3. Create in target location atomically (transaction)
    4. Return deployment report
```

---

### 9. White-Labeling

**What gets white-labeled per agency:**
```ts
interface AgencyBranding {
  agencyId: string;
  platformName: string;        // "SME Connect"
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;        // injected as CSS variable
  customDomain: string;        // "app.smeconnect.co.za"
  supportEmail: string;
  supportPhone: string;
  mobileAppName: string;       // for white-label PWA manifest
  mobileAppIcon: string;
  hideGHLBranding: boolean;
  customLoginBackground: string;
}
```

**Domain routing (Next.js middleware):**
```ts
// middleware.ts
export function middleware(req: NextRequest) {
  const host = req.headers.get('host');
  const agency = await AgencyService.findByDomain(host);
  // Inject agency branding into request headers
  // CSS variables served from /api/theme/:agencyId
  // → `--color-primary: #009B87; --platform-name: "SME Connect";`
}
```

**PWA Manifest per agency:** `/api/manifest/:agencyId` → dynamic `manifest.json` with agency name, icons, colors.

---

### 11. Unified Conversations Inbox — Full Build Plan

**Feasibility: High.** Every channel (SMS, Email, Facebook, Instagram, WhatsApp, Web Chat) already has a webhook spec in this repo and a normalized `ConversationMessage` schema in the plan. The inbox is essentially a real-time UI layered on top of that data.

---

#### What the Inbox Does (Feature Parity with GHL + AI)

```
┌─────────────────────────────────────────────────────────────────┐
│  Conversations                                    🔍 Search      │
│  ─────────────────────────────────────────────────────────────  │
│  [All] [Unread] [Mine] [Unassigned]  ┊  [SMS] [Email] [FB] [IG]│
├─────────────────────┬───────────────────────────────────────────┤
│                     │                                           │
│  Contact Name   2m  │   John Smith  +27 61 524 5923            │
│  Hey I wanted...    │   SMS · Assigned to: You  [⋯ Actions]    │
│  ● SMS              │ ─────────────────────────────────────────│
│                     │   Today 10:32 AM                         │
│  Sarah Jones  15m   │   John: Hey I wanted to ask about pricing│
│  Thanks for the...  │                                           │
│  ✉ Email            │   10:33 AM — AI Draft (not sent)         │
│                     │   "Hi John! Happy to help with pricing..." │
│  AR Boards  1h      │   [Send] [Edit] [Dismiss]                │
│  Invoice ques...    │                                           │
│  💬 WhatsApp        │   ─────────────────────────────────────  │
│                     │   📎  Message...         [Send ↑]        │
└─────────────────────┴───────────────────────────────────────────┘
```

---

#### Database Schema (conversations + messages)

Already defined in the main schema section. Key points:
- `conversations` table: one row per contact per channel-thread. `last_message_at` is the sort key.
- `conversation_messages` table: every individual message across all channels.
- Both have `location_id` for RLS isolation.
- `unread_count` is a counter column updated on every inbound message (fast — no subquery).

**One extra table needed — AI reply drafts:**
```sql
CREATE TABLE conversation_ai_drafts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id        UUID REFERENCES conversation_messages(id) ON DELETE CASCADE,
  location_id       UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','sent','edited_and_sent','dismissed')),
  model_used        TEXT,           -- 'claude-opus-4-5' or 'gpt-4o'
  confidence        NUMERIC(4,3),   -- 0.000–1.000
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_drafts_conv ON conversation_ai_drafts(conversation_id, status)
  WHERE status = 'pending';
```

---

#### Backend — NestJS Implementation

**ConversationsService core methods:**
```ts
// Find or create conversation (called by every channel adapter on inbound)
async findOrCreate(locationId: string, contactId: string, channel: ChannelType): Promise<Conversation>

// Get inbox list — paginated, sorted by last_message_at DESC
async getInbox(locationId: string, filters: InboxFiltersDto): Promise<PaginatedConversations>

// Mark as read — resets unread_count = 0
async markRead(conversationId: string, userId: string): Promise<void>

// Assign to user
async assign(conversationId: string, assignedTo: string, actorId: string): Promise<void>
```

**MessagesService core methods:**
```ts
// Save inbound message + update conversation last_message_at + increment unread_count
async saveInbound(normalized: NormalizedMessage): Promise<ConversationMessage>

// Send outbound — routes to correct channel adapter by conversation.type
async sendOutbound(conversationId: string, dto: SendMessageDto, userId: string): Promise<ConversationMessage>

// Get message thread — paginated, cursor-based
async getThread(conversationId: string, cursor?: string, limit = 50): Promise<ConversationMessage[]>
```

**Inbound message flow (every channel follows this path):**
```
Channel Webhook (Twilio/SendGrid/Meta/Socket.io)
  ↓
ChannelAdapter.normalizeInbound() → NormalizedMessage
  ↓
ContactsService.findOrCreateByChannelId(phone/email/psid)
  ↓
ConversationsService.findOrCreate(locationId, contactId, channel)
  ↓
MessagesService.saveInbound(normalized) → updates last_message_at, unread_count++
  ↓
[parallel]
  → Socket.io broadcast to room `location:{locationId}:conversations`
    (all agents with inbox open see it in real time)
  → BullMQ job: ConversationAI.generateDraft(conversationId, messageId)
    (AI generates a suggested reply — shown as draft, not auto-sent)
  → WorkflowEngine.trigger(INBOUND_MESSAGE, contactId, locationId)
    (workflows can auto-reply if configured)
```

**Outbound send flow:**
```ts
async sendOutbound(conversationId: string, dto: SendMessageDto, userId: string) {
  const conv = await this.convRepo.findOne({ where: { id: conversationId } });

  // Route to correct adapter based on conversation channel
  const externalId = await this.channelRouter.send(conv.type, {
    locationId: conv.locationId,
    contactId: conv.contactId,
    body: dto.body,
    attachments: dto.attachments,
  });

  // Save as outbound message
  const msg = await this.msgRepo.save({
    conversationId,
    locationId: conv.locationId,
    contactId: conv.contactId,
    userId,
    direction: 'outbound',
    channel: conv.type,
    body: dto.body,
    externalId,
    status: 'sent',
    sentAt: new Date(),
  });

  // Update conversation metadata
  await this.convRepo.update(conversationId, {
    lastMessageBody: dto.body,
    lastMessageAt: new Date(),
    lastMessageType: conv.type,
  });

  // Broadcast to inbox room
  this.socketServer.to(`location:${conv.locationId}:conversations`)
    .emit('message:new', { conversationId, message: msg });

  return msg;
}
```

**ChannelRouter** — single switch that dispatches to the right adapter:
```ts
// channels/channel-router.service.ts
async send(channel: ChannelType, dto: OutboundDto): Promise<string> {
  switch (channel) {
    case 'SMS':
    case 'MMS':      return this.twilioService.sendOutbound(dto);
    case 'EMAIL':    return this.sendgridService.sendOutbound(dto);
    case 'FACEBOOK': return this.facebookService.sendOutbound(dto);
    case 'INSTAGRAM':return this.instagramService.sendOutbound(dto);
    case 'WHATSAPP': return this.whatsappService.sendOutbound(dto);
    case 'WEBCHAT':  return this.webchatGateway.sendToSocket(dto);
    default: throw new UnsupportedChannelException(channel);
  }
}
```

---

#### Real-Time (Socket.io)

```
Authenticated agent connects to Socket.io
  → joins room: location:{locationId}:conversations
  → joins room: conversation:{conversationId} (when thread is open)

Events emitted by server:
  conversation:updated  { conversationId, lastMessageBody, lastMessageAt, unreadCount }
  message:new           { conversationId, message: ConversationMessage }
  ai:draft              { conversationId, draft: ConversationAiDraft }
  typing:start          { conversationId, channel }  (for web chat only)
  typing:stop           { conversationId }
```

---

#### Frontend — Next.js Inbox UI

**Route:** `app/(dashboard)/inbox/page.tsx` + `app/(dashboard)/inbox/[conversationId]/page.tsx`

**Left panel — ConversationList:**
- TanStack Query: `useInfiniteQuery` on `GET /api/conversations?cursor=...`
- Socket.io `conversation:updated` event → `queryClient.invalidateQueries(['conversations'])` for instant re-sort
- Filter chips: All / Unread / Mine / Unassigned
- Channel filter: SMS / Email / FB / IG / WhatsApp / Chat
- Each row: avatar + name + channel icon + last message preview + timestamp + unread badge

**Right panel — MessageThread:**
- TanStack Query: `useInfiniteQuery` on `GET /api/conversations/:id/messages`
- Socket.io `message:new` → append to thread immediately (optimistic + confirmed)
- Message bubbles: inbound (left, gray) / outbound (right, teal)
- Channel badge on each message (📱 SMS, ✉️ Email, etc.)
- Scroll-to-bottom on new message

**AI Draft Banner** (appears above composer when draft exists):
```tsx
<div className="mx-4 mb-2 rounded-xl bg-[#009B87]/8 border border-[#009B87]/20 p-3">
  <div className="flex items-center gap-2 mb-2">
    <Sparkles className="w-4 h-4 text-[#009B87]" />
    <span className="text-sm font-semibold text-[#009B87]">AI Draft</span>
    <Badge className="text-xs bg-[#009B87]/10 text-[#009B87]">Not sent</Badge>
  </div>
  <p className="text-sm text-gray-700">{draft.body}</p>
  <div className="flex gap-2 mt-2">
    <Button size="sm" onClick={sendDraft}>Send</Button>
    <Button size="sm" variant="outline" onClick={editDraft}>Edit</Button>
    <Button size="sm" variant="ghost" onClick={dismissDraft}>Dismiss</Button>
  </div>
</div>
```

**Composer:**
- Textarea with `Ctrl+Enter` to send
- Attachment button (file upload → MinIO → attach URL)
- Channel indicator (shows which channel the reply will go out on)
- Character counter for SMS (160 char segments)
- WhatsApp: shows "Session window open / closed" indicator

---

#### AI Draft Generation (non-blocking, suggestion only)

```ts
// ai/conversation-ai.processor.ts (BullMQ worker)
async generateDraft(conversationId: string, messageId: string) {
  const [conv, recentMessages, knowledgeChunks] = await Promise.all([
    this.convRepo.findOne({ where: { id: conversationId }, relations: ['contact'] }),
    this.msgRepo.findLast10(conversationId),
    this.knowledgeBase.search(locationId, lastMessageBody, 3),
  ]);

  const response = await this.anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 300,
    system: buildSystemPrompt(location, knowledgeChunks),
    messages: recentMessages.map(m => ({
      role: m.direction === 'inbound' ? 'user' : 'assistant',
      content: m.body,
    })),
  });

  const draft = await this.draftRepo.save({
    conversationId,
    messageId,
    locationId: conv.locationId,
    body: response.content[0].text,
    modelUsed: 'claude-opus-4-5',
    status: 'pending',
  });

  // Push to UI in real time
  this.socketServer
    .to(`conversation:${conversationId}`)
    .emit('ai:draft', draft);
}
```

**Key design decision:** AI draft is a **suggestion**, not an auto-send. The agent reads it, clicks Send or edits it. This keeps humans in the loop while massively speeding up response time.

---

#### Inbox Filters API

```
GET /api/conversations
  ?status=open|closed|all        default: open
  &assignedTo=me|unassigned|:userId
  &channel=SMS|EMAIL|FACEBOOK|...
  &unreadOnly=true
  &search=:query                 searches contact name + last message
  &cursor=:lastMessageAt         for pagination
  &limit=25
```

---

#### 4. Internal Comments (Team-Only Notes in Thread)

Internal comments appear inline in the conversation timeline but are **never sent to the contact**. The composer turns yellow when in "Internal Comment" mode.

```sql
-- conversation_messages.message_type column already exists
-- Add 'INTERNAL_COMMENT' as a valid message_type
-- These are filtered out when building the channel-send payload
-- They ARE included when fetching thread for agents (with a visual flag)

-- No new table needed — just a new message_type value:
-- message_type = 'INTERNAL_COMMENT'
-- direction = 'internal'  (new direction value alongside 'inbound'/'outbound')
-- user_id = the agent who wrote it
-- body = the note text
-- contact NEVER sees these
```

**Backend:** `MessagesService.addInternalComment(conversationId, body, userId)` — saves message with `direction='internal'`, `messageType='INTERNAL_COMMENT'`. No channel adapter called. Broadcasts to `conversation:{id}` room so all agents on the thread see it live.

**Frontend:**
```tsx
// Composer mode toggle
const [mode, setMode] = useState<'reply' | 'internal'>('reply')

// When mode === 'internal':
// - textarea background: bg-yellow-50 border-yellow-300
// - Send button label: "Add Note"
// - Placeholder: "Leave an internal note... (only your team sees this)"

// Internal comment bubble in thread:
<div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 mx-8 my-1">
  <div className="flex items-center gap-2 mb-1">
    <Lock className="w-3 h-3 text-yellow-600" />
    <span className="text-xs text-yellow-700 font-medium">Internal Note · {agentName}</span>
  </div>
  <p className="text-sm text-gray-700">{comment.body}</p>
</div>
```

---

#### 5. Channel-Switching Composer + Speech Bubble Differentiators

**Composer channel dropdown** — defaults to last channel used by the contact:

```ts
// Determine default reply channel
function getDefaultReplyChannel(conversation: Conversation, messages: ConversationMessage[]) {
  // Find the most recent INBOUND message
  const lastInbound = messages.filter(m => m.direction === 'inbound').at(-1);
  return lastInbound?.channel ?? conversation.type;
}
```

```tsx
// Channel selector above composer
<ChannelDropdown
  available={contact.availableChannels}  // ['SMS','WHATSAPP','EMAIL'] based on what contact fields exist
  selected={selectedChannel}
  onChange={setSelectedChannel}
/>

// Available channels logic:
// SMS — if contact.phone exists + location has Twilio number
// EMAIL — if contact.email exists + location has SendGrid config
// WHATSAPP — if contact.phone exists + location has WhatsApp enabled
// FACEBOOK — if contact has linked PSID (has messaged via FB before)
// INSTAGRAM — if contact has linked IGSID
// WEBCHAT — only if conversation.type === 'WEBCHAT' (can't initiate)
```

**Speech bubble channel icons** — each `ConversationMessage` bubble shows a small channel icon:

```tsx
const CHANNEL_ICONS = {
  SMS:       { icon: MessageSquare, color: '#2563EB', bg: '#EFF6FF' },   // blue
  MMS:       { icon: Image,         color: '#7C3AED', bg: '#F5F3FF' },   // purple
  EMAIL:     { icon: Mail,          color: '#D97706', bg: '#FFFBEB' },   // amber
  FACEBOOK:  { icon: Facebook,      color: '#1877F2', bg: '#EFF6FF' },   // FB blue
  INSTAGRAM: { icon: Instagram,     color: '#E1306C', bg: '#FDF2F8' },   // pink
  WHATSAPP:  { icon: MessageCircle, color: '#25D366', bg: '#F0FDF4' },   // green
  WEBCHAT:   { icon: Globe,         color: '#009B87', bg: '#E6F7F5' },   // teal
  AI:        { icon: Sparkles,      color: '#8B5CF6', bg: '#F5F3FF' },   // violet (AI-sent)
  INTERNAL:  { icon: Lock,          color: '#D97706', bg: '#FFFBEB' },   // yellow
}

// Small icon badge on each bubble:
<div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
  bg-${channel.bg} border border-white`}>
  <channel.icon className="w-3 h-3" style={{ color: channel.color }} />
</div>
```

**AI-sent messages** get the `Sparkles` icon + subtle violet tint so agents can instantly spot automated replies.

---

#### 6. Contact Deduplication

```ts
// contacts.service.ts — called on EVERY lead capture point
async findOrCreateByIdentifier(locationId: string, data: CreateContactDto) {
  // Step 1: try match by email (normalized to lowercase)
  if (data.email) {
    const byEmail = await this.contactRepo.findOne({
      where: { locationId, emailLower: data.email.toLowerCase(), deletedAt: IsNull() }
    });
    if (byEmail) return this.mergeFields(byEmail, data); // update fields, don't create
  }

  // Step 2: try match by phone (normalized to digits only)
  if (data.phone) {
    const normalized = data.phone.replace(/\D/g, '');
    const byPhone = await this.contactRepo.findOne({
      where: { locationId, phoneNormalized: normalized, deletedAt: IsNull() }
    });
    if (byPhone) return this.mergeFields(byPhone, data);
  }

  // Step 3: no match → create new contact
  return this.contactRepo.save({
    ...data,
    locationId,
    emailLower: data.email?.toLowerCase(),
    phoneNormalized: data.phone?.replace(/\D/g, ''),
    createdAt: new Date(),
  });
}

// mergeFields: only overwrites blank fields — never overwrites existing data
// e.g. if contact already has a name, don't overwrite it with a form submission
private mergeFields(existing: Contact, incoming: CreateContactDto) {
  const updates: Partial<Contact> = {};
  if (!existing.firstName && incoming.firstName) updates.firstName = incoming.firstName;
  if (!existing.email && incoming.email) {
    updates.email = incoming.email;
    updates.emailLower = incoming.email.toLowerCase();
  }
  // merge tags (union, not replace)
  if (incoming.tags?.length) {
    updates.tags = [...new Set([...existing.tags, ...incoming.tags])];
  }
  // merge custom fields (incoming fills in blanks only)
  if (incoming.customFields) {
    updates.customFields = { ...incoming.customFields, ...existing.customFields };
  }
  if (Object.keys(updates).length > 0) {
    return this.contactRepo.save({ ...existing, ...updates });
  }
  return existing;
}
```

---

#### 7. Assigned Users + Followers System

```sql
-- Already have: contacts.assigned_to (single owner)
-- Already have: opportunities.assigned_to (single owner)

-- Add followers table (for both contacts AND opportunities)
CREATE TABLE entity_followers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('contact','opportunity')),
  entity_id     UUID NOT NULL,
  location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, user_id)
);
-- Max 10 followers enforced at service layer (not DB constraint)
CREATE INDEX idx_followers_entity ON entity_followers(entity_type, entity_id);
CREATE INDEX idx_followers_user ON entity_followers(user_id, location_id);
```

**Assignment routing for inbound messages:**
```ts
// When inbound message arrives for a contact:
async routeInboundMessage(contactId: string, message: ConversationMessage) {
  const contact = await this.contactRepo.findOne({ where: { id: contactId } });

  // 1. If contact has assigned_to user AND location.routeToAssignedUser = true
  //    → create notification for assigned user
  if (contact.assignedTo && location.settings.routeToAssignedUser) {
    await this.notificationService.push(contact.assignedTo, {
      type: 'INBOUND_MESSAGE',
      title: `New ${message.channel} from ${contact.firstName}`,
      conversationId: message.conversationId,
      locationId: message.locationId,
    });
  }

  // 2. Notify all followers
  const followers = await this.followersService.getFollowers('contact', contactId);
  for (const follower of followers) {
    await this.notificationService.push(follower.userId, {
      type: 'FOLLOWER_INBOUND_MESSAGE',
      title: `Message on followed contact: ${contact.firstName}`,
      conversationId: message.conversationId,
    });
  }
}
```

---

#### Feasibility Summary

| Component | Complexity | Blocker? |
|-----------|-----------|---------|
| SMS inbound/outbound | Low — Twilio webhooks are simple | None |
| Email inbound/outbound | Medium — multipart parsing, threading | None |
| Facebook/Instagram | Medium — Meta webhook setup | Requires Meta App approval (~1-3 days) |
| WhatsApp | Medium — template requirement outside 24h window | Requires Twilio WhatsApp sender approval |
| Web Chat | Medium — Socket.io widget bundle | None |
| Real-time inbox updates | Low — Socket.io rooms | None |
| AI draft suggestions | Low — async BullMQ job | None |
| Full unified inbox UI | Medium — split-pane layout, infinite scroll | None |

**Realistic timeline for full inbox: 2-3 weeks** (Phase 1 of the build plan).

---

### 12. Opportunity Job Card — Full Panel Implementation

When an agent clicks a card on the Kanban board, a side panel slides open with 5 sections:

#### Panel Anatomy
```
┌─────────────────────────────────────────────────┐
│  ← Back    John Smith — Bathroom Renovation     │
│  ─────────────────────────────────────────────  │
│  [Open ▾]  [Won]  [Lost]  [Abandoned]           │  ← Status toggles
│  Value: R2,950    Owner: You  [Change]           │
│  Pipeline: Direct Sales  >  Qualified           │
│  ─────────────────────────────────────────────  │
│  Primary Contact: John Smith  [View]             │
│  + Add Contact (up to 10 total)                  │
│    └── Sarah Smith  [Spouse]  [Remove]           │
│  ─────────────────────────────────────────────  │
│  [Notes]  [Tasks]  [Appointments]  [Activity]   │
│                                                  │
│  Notes tab:                                      │
│  ┌─────────────────────────────────────────┐    │
│  │ Add a note...                      [Add]│    │
│  └─────────────────────────────────────────┘    │
│  • Jun 19 — "Client wants revised quote"  [You] │
└─────────────────────────────────────────────────┘
```

#### Database Tables

```sql
-- Opportunity Notes
CREATE TABLE opportunity_notes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body             TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_opp_notes ON opportunity_notes(opportunity_id, created_at DESC);

-- Opportunity Tasks
CREATE TABLE opportunity_tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  contact_id       UUID REFERENCES contacts(id) ON DELETE SET NULL,
  location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  assigned_to      UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date         TIMESTAMPTZ,
  completed        BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at     TIMESTAMPTZ,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_opp_tasks ON opportunity_tasks(opportunity_id, completed, due_date);
CREATE INDEX idx_tasks_assigned ON opportunity_tasks(assigned_to, completed, due_date)
  WHERE completed = FALSE;  -- "my open tasks" query

-- Opportunity Appointments (link calendar bookings to a deal)
CREATE TABLE opportunity_appointments (
  opportunity_id   UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  appointment_id   UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  PRIMARY KEY(opportunity_id, appointment_id)
);
```

#### Frontend — Job Card Slide Panel

```tsx
// Slides in from right, 480px wide, over the kanban board
<Sheet open={!!selectedOppId} onOpenChange={() => setSelectedOppId(null)}>
  <SheetContent side="right" className="w-[480px] p-0 overflow-y-auto">

    {/* Status bar */}
    <div className="flex gap-2 p-4 border-b">
      {['open','won','lost','abandoned'].map(s => (
        <Button
          key={s}
          size="sm"
          variant={opp.status === s ? 'default' : 'outline'}
          className={opp.status === s ? 'bg-[#009B87]' : ''}
          onClick={() => updateStatus(s)}
        >
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </Button>
      ))}
    </div>

    {/* Deal meta */}
    <div className="p-4 border-b space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">Value</span>
        <span className="font-semibold">R{opp.monetaryValue?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">AI Score</span>
        <ScoreRing score={opp.aiScore} />  {/* colored ring: green/amber/red */}
      </div>
      <div className="text-xs text-gray-400 italic">{opp.aiNextAction}</div>
    </div>

    {/* Contacts section */}
    <div className="p-4 border-b">
      <h3 className="text-sm font-semibold mb-2">Contacts</h3>
      <ContactChip contact={opp.primaryContact} isPrimary />
      {opp.additionalContacts.map(c => (
        <ContactChip key={c.id} contact={c.contact} role={c.role}
          onRemove={() => removeContact(c.id)} />
      ))}
      {opp.additionalContacts.length < 10 && (
        <Button variant="ghost" size="sm" onClick={openAddContact}>
          + Add Contact
        </Button>
      )}
    </div>

    {/* Tabs: Notes / Tasks / Appointments / Activity */}
    <Tabs defaultValue="notes" className="p-4">
      <TabsList className="w-full">
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="tasks">Tasks {openTaskCount > 0 && <Badge>{openTaskCount}</Badge>}</TabsTrigger>
        <TabsTrigger value="appointments">Appointments</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="notes">
        <NotesList opportunityId={opp.id} />
        <NoteComposer opportunityId={opp.id} />
      </TabsContent>

      <TabsContent value="tasks">
        <TaskChecklist opportunityId={opp.id} />
        <CreateTaskForm opportunityId={opp.id} />
      </TabsContent>

      <TabsContent value="appointments">
        <AppointmentsList opportunityId={opp.id} />
        <BookAppointmentButton opportunityId={opp.id} contactId={opp.primaryContactId} />
      </TabsContent>

      <TabsContent value="activity">
        {/* Stage history + workflow executions + user actions in timeline */}
        <ActivityTimeline opportunityId={opp.id} />
      </TabsContent>
    </Tabs>
  </SheetContent>
</Sheet>
```

---

### 13. Form → Auto-Create Opportunity (Workflow Bridge)

```
User fills form on website
  ↓ POST /webhooks/forms/:formId
  ↓ FormSubmissionService:
      1. ContactsService.findOrCreateByIdentifier(locationId, formData)
         → dedup by email/phone → returns contact (new or existing)
      2. Emit FORM_SUBMITTED event with { contactId, formId, formData }
      3. WorkflowEngine.trigger('FORM_SUBMITTED', contactId, locationId, { formId, formData })
  ↓ WorkflowEngine finds workflows with trigger=FORM_SUBMITTED, filter formId matches
  ↓ Executes workflow nodes:
      Node: CREATE_OPPORTUNITY
        → name: formData['project_name'] ?? `${contact.firstName}'s Deal`
        → monetaryValue: formData['budget'] ?? 0
        → pipelineId: node.config.pipelineId
        → stageId: pipeline.stages[0].id  (first stage)
        → assignedTo: node.config.assignedTo ?? location.defaultAssignee
        → primary_contact_id: contact.id
      Node: SEND_WHATSAPP
        → "Hi {{contact.firstName}}, thanks for your enquiry! We'll be in touch."
      Node: INTERNAL_NOTIFICATION
        → notifies assigned sales rep
```

**CREATE_OPPORTUNITY workflow node config:**
```ts
interface CreateOpportunityNodeConfig {
  pipelineId: string;
  stageId?: string;           // defaults to first stage if omitted
  nameTemplate: string;       // e.g. "{{contact.firstName}}'s {{form.service}}"
  monetaryValueField?: string; // form field key to read value from
  assignedTo?: string;        // userId or 'round_robin' or 'contact_assigned_user'
  addTags?: string[];
}
```

---

### 15. Contacts — Full 3-Panel Layout + Custom Fields System

---

#### Contact Profile — 3-Panel Layout

```
┌──────────────────┬────────────────────────────────┬─────────────────────┐
│  LEFT PANEL      │  CENTER PANEL                  │  RIGHT PANEL        │
│  (Static Data)   │  (Activity Timeline / Inbox)   │  (Contextual Tools) │
│  240px fixed     │  flex-grow                     │  320px fixed        │
├──────────────────┼────────────────────────────────┼─────────────────────┤
│ Avatar + Name    │ [All] [SMS] [Email] [Calls]... │ Opportunities (3)   │
│ Email            │                                │ ┌──────────────────┐│
│ Phone            │  Jun 19 10:32 AM               │ │ Bathroom Reno    ││
│ Company          │  John: "Can u send prices?"    │ │ R2,950 · Qualif. ││
│ Address          │  ● WhatsApp                    │ └──────────────────┘│
│ ─────────────── │                                │                     │
│ Assigned: You    │  Jun 19 10:33 AM               │ Tasks (2 open)      │
│ Followers: +2    │  AI Draft: "Hi John, here      │ ☐ Send quote        │
│ ─────────────── │   are our prices..."           │ ☐ Follow up Fri     │
│ Tags:            │  ● AI · Not sent               │                     │
│ [hot-lead]       │                                │ Appointments (1)    │
│ [whatsapp]       │  Jun 18 3:00 PM                │ Discovery Call      │
│ ─────────────── │  📋 Form Submitted             │ Jun 22 @ 10:00 AM   │
│ CUSTOM FIELDS    │  Bathroom Renovation Form      │                     │
│ ─────────────── │                                │ Memberships (0)     │
│ Budget: R5,000   │  Jun 17 2:15 PM                │                     │
│ Project Type:    │  ✉ Email opened                │ DND Settings        │
│ Bathroom Reno    │  "Welcome to SME Connect"      │ [SMS ✓][Email ✓]   │
│ Move-in Date:    │                                │                     │
│ 2026-08-01       │  [Message composer here]       │                     │
└──────────────────┴────────────────────────────────┴─────────────────────┘
```

**Center panel** = full `ConversationInbox` + system timeline events mixed chronologically:
- Form submissions, email opens, link clicks, page visits (tracking pixel)
- Tag additions/removals, pipeline stage changes, workflow enrollments, call recordings

**Right panel** — live queries on contact open:
```ts
const [opportunities, tasks, appointments] = await Promise.all([
  oppRepo.find({ where: { primaryContactId: contactId, status: 'open' } }),
  taskRepo.find({ where: { contactId, completed: false }, order: { dueDate: 'ASC' } }),
  appointmentRepo.find({ where: { contactId, startsAt: MoreThan(new Date()) } }),
])
```

---

#### Custom Fields — Database Schema

```sql
CREATE TABLE custom_field_folders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,        -- "Real Estate Criteria"
  is_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE custom_field_definitions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  folder_id    UUID REFERENCES custom_field_folders(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,        -- display: "Budget"
  key          TEXT NOT NULL,        -- slug: "budget" → {{contact.budget}}
  data_type    TEXT NOT NULL CHECK (data_type IN (
                 'TEXT','LARGE_TEXT','NUMBER','MONETARY','DATE','DATETIME',
                 'DROPDOWN','CHECKBOX','MULTISELECT','RADIO','FILE','SIGNATURE','PHONE'
               )),
  options      JSONB,                -- [{label, value}] for DROPDOWN/MULTISELECT/RADIO
  placeholder  TEXT,
  required     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  entity_type  TEXT NOT NULL DEFAULT 'contact'
               CHECK (entity_type IN ('contact','opportunity','company')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(location_id, key, entity_type)
);
-- Values stored on contacts.custom_fields JSONB: { "budget": "5000", "project_type": "bathroom" }
-- Same pattern for opportunities.custom_fields
```

**All 13 data types — validation + UI component:**

| Type | Validation | Component | JSONB storage |
|------|-----------|-----------|--------------|
| `TEXT` | max 255 chars | `<Input>` | `"string"` |
| `LARGE_TEXT` | max 10k chars | `<Textarea>` | `"long string"` |
| `NUMBER` | numeric | `<Input type="number">` | `123` |
| `MONETARY` | numeric + currency | Currency input | `"5000.00"` |
| `DATE` | ISO date | `<DatePicker>` | `"2026-08-01"` |
| `DATETIME` | ISO datetime | `<DateTimePicker>` | `"2026-08-01T10:00:00"` |
| `DROPDOWN` | one of options[] | `<Select>` | `"option_value"` |
| `CHECKBOX` | boolean | `<Checkbox>` | `true` |
| `MULTISELECT` | subset of options[] | `<MultiSelect>` | `["val1","val2"]` |
| `RADIO` | one of options[] | `<RadioGroup>` | `"option_value"` |
| `FILE` | URL after MinIO upload | `<FileUpload>` | `"https://cdn.../file.pdf"` |
| `SIGNATURE` | base64 PNG → MinIO | `<SignaturePad>` | `"https://cdn.../sig.png"` |
| `PHONE` | E.164 format | `<PhoneInput>` | `"+27615245923"` |

---

#### Merge Tags Engine — `{{contact.field_key}}`

Every SMS, email, WhatsApp template passes through `TemplateEngine.render()` before send:

```ts
// packages/shared/src/template-engine.ts
export class TemplateEngine {
  async render(template: string, contactId: string, locationId: string): Promise<string> {
    const [contact, location] = await Promise.all([
      this.contactRepo.findOne({ where: { id: contactId } }),
      this.locationRepo.findOne({ where: { id: locationId } }),
    ]);
    const vars = this.buildVarMap(contact, location);
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => vars[key.trim()] ?? match);
  }

  private buildVarMap(contact: Contact, location: Location): Record<string, string> {
    return {
      // Standard
      'contact.first_name': contact.firstName ?? '',
      'contact.last_name':  contact.lastName ?? '',
      'contact.full_name':  `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim(),
      'contact.email':      contact.email ?? '',
      'contact.phone':      contact.phone ?? '',
      'contact.company':    contact.companyName ?? '',
      // All custom fields from JSONB — auto-exposed as {{contact.<key>}}
      ...Object.entries(contact.customFields ?? {}).reduce((acc, [k, v]) => {
        acc[`contact.${k}`] = String(v ?? '');
        return acc;
      }, {} as Record<string, string>),
      // Location
      'location.name':      location.name,
      'location.phone':     location.phone ?? '',
      'location.website':   location.website ?? '',
      // Date
      'date.today':         new Date().toLocaleDateString('en-ZA'),
    };
  }
}
```

**Live preview in UI:** as the user types a template, the composer shows a rendered preview using a real contact record fetched on demand. Unknown tags highlighted in amber.

---

#### Custom Fields in Workflow IF/ELSE Conditions

```ts
// workflow/evaluators/condition-evaluator.ts
resolveField(contact: Contact, fieldPath: string): unknown {
  const [, key] = fieldPath.split('.');  // "contact.budget" → key="budget"
  const standard = { email, phone, first_name, last_name, tags, assigned_to };
  if (key in standard) return standard[key];
  return contact.customFields?.[key] ?? null;  // falls through to custom JSONB
}

// Operators: eq, neq, gt, lt, gte, lte, contains, not_contains,
//            is_empty, is_not_empty, in, not_in, contains_any (for MULTISELECT)
```

**Budget routing example from your description:**
```json
{ "type": "IF_ELSE",
  "config": {
    "conditions": [{ "field": "contact.budget", "operator": "gt", "value": "5000" }],
    "branches": {
      "true":  "node_create_high_priority_opp_assign_followers_send_scheduling_link",
      "false": "node_send_digital_course_link"
    }
  }
}
```

---

#### Custom Fields in Form Builder

```ts
interface FormField {
  type: 'STANDARD' | 'CUSTOM';
  standardField?: 'first_name'|'last_name'|'email'|'phone'|'company';
  customFieldId?: string;   // → custom_field_definitions.id
}

// On form submit: standard fields → contactDto, custom fields → customFieldUpdates{}
// Both passed to ContactsService.findOrCreateByIdentifier() → writes to contact
```

---

#### Where We Exceed GHL

| Feature | GHL | Our CRM |
|---------|-----|---------|
| 13 data types | ✅ | ✅ |
| Folder organization | ✅ | ✅ |
| Merge tags in SMS/email | ✅ | ✅ |
| IF/ELSE on custom fields | ✅ | ✅ |
| **AI auto-fill custom fields from conversation** | ❌ | ✅ Claude reads conversation → suggests values for blank fields |
| **Merge tag live preview** | Basic | ✅ Renders with real contact data as you type |
| **Custom field analytics** | ❌ | ✅ "What % of leads have Budget > R5000?" → Claude answers |

---

### 16. File Upload Custom Field — Complete End-to-End Flow

---

#### How It All Connects

```
Contact visits form → uploads file → browser sends to API
  → API uploads to MinIO (private bucket)
  → API generates signed URL (expires 7 days, renewable)
  → URL written to contact.custom_fields["id_document_upload"]
  → FORM_SUBMITTED workflow fires
      → Internal SMS to team: "New doc from John: {{contact.id_document_upload}}"
      → Opportunity stage updated to "Documents Received"
  → Contact left panel shows: "ID Document Upload → [View File]"
```

---

#### Step 1 — Custom Field Definition (Extended for FILE type)

The `custom_field_definitions` table already handles FILE type. Add these extra columns for file-specific config:

```sql
-- Add to custom_field_definitions table (migration):
ALTER TABLE custom_field_definitions
  ADD COLUMN file_allowed_types  TEXT[],      -- ['pdf','jpg','png'] — null = all allowed
  ADD COLUMN file_allow_multiple BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN file_max_size_mb    INTEGER NOT NULL DEFAULT 10;

-- Example row for "ID Document Upload":
-- data_type = 'FILE'
-- key = 'id_document_upload'
-- file_allowed_types = ['pdf','jpg','jpeg','png']
-- file_allow_multiple = false
-- file_max_size_mb = 10
```

---

#### Step 2 — Secure File Upload API

Files are uploaded to a **private MinIO bucket** (`documents`). They are NEVER publicly accessible. Access is only via time-limited presigned URLs generated per request.

**Upload flow:**

```
Browser (form page)
  → POST /api/uploads/presign  { fieldKey, fileName, mimeType, locationId }
  ← { uploadUrl, objectKey }   (presigned PUT URL, expires in 5 minutes)

Browser
  → PUT {uploadUrl}  (direct browser-to-MinIO upload — API never touches the bytes)
  ← 200 OK from MinIO

Browser
  → POST /api/uploads/confirm  { objectKey, fieldKey, formSubmissionId }
  ← { fileUrl }  (permanent signed URL written to contact profile)
```

**Why presigned upload (not multipart to API):** files go directly browser → MinIO. Your API server never buffers the file bytes — no memory pressure, no timeout risk on large files.

**Backend — UploadService:**

```ts
// uploads/upload.service.ts
export class UploadService {

  async getPresignedUploadUrl(dto: PresignUploadDto): Promise<PresignedUploadResponse> {
    const field = await this.fieldDefRepo.findOne({
      where: { key: dto.fieldKey, locationId: dto.locationId }
    });

    // Validate file type against allowed types
    const ext = dto.fileName.split('.').pop()?.toLowerCase();
    if (field.fileAllowedTypes?.length && !field.fileAllowedTypes.includes(ext)) {
      throw new BadRequestException(
        `File type .${ext} not allowed. Accepted: ${field.fileAllowedTypes.join(', ')}`
      );
    }

    // Build object key: documents/{locationId}/{contactId}/{fieldKey}/{uuid}.{ext}
    const objectKey = `documents/${dto.locationId}/${dto.contactId}/${dto.fieldKey}/${crypto.randomUUID()}.${ext}`;

    // Generate presigned PUT URL (5 min expiry)
    const uploadUrl = await this.minioClient.presignedPutObject(
      'documents',      // private bucket
      objectKey,
      5 * 60,           // 5 minutes
    );

    return { uploadUrl, objectKey };
  }

  async confirmUpload(dto: ConfirmUploadDto): Promise<{ fileUrl: string }> {
    // Verify the object actually exists in MinIO
    await this.minioClient.statObject('documents', dto.objectKey);

    // Store file record
    await this.fileRepo.save({
      objectKey: dto.objectKey,
      locationId: dto.locationId,
      contactId: dto.contactId,
      fieldKey: dto.fieldKey,
      originalName: dto.fileName,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      uploadedAt: new Date(),
    });

    // Generate a 7-day signed access URL
    const fileUrl = await this.generateSignedUrl(dto.objectKey);

    // Write to contact custom field
    await this.contactsService.setCustomField(dto.contactId, dto.fieldKey, fileUrl);

    return { fileUrl };
  }

  async generateSignedUrl(objectKey: string, expirySeconds = 7 * 24 * 60 * 60): Promise<string> {
    return this.minioClient.presignedGetObject('documents', objectKey, expirySeconds);
  }
}
```

**File records table:**
```sql
CREATE TABLE contact_file_uploads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id    UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  contact_id     UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  field_key      TEXT NOT NULL,          -- matches custom_field_definitions.key
  object_key     TEXT NOT NULL UNIQUE,   -- MinIO path
  original_name  TEXT NOT NULL,
  mime_type      TEXT NOT NULL,
  size_bytes     INTEGER,
  signed_url     TEXT,                   -- cached URL — refreshed before expiry
  signed_url_expires_at TIMESTAMPTZ,
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_file_uploads_contact ON contact_file_uploads(contact_id, field_key);
```

**URL refresh strategy:** Signed URLs expire after 7 days. A BullMQ cron job (`file-url-refresh`) runs daily:
```ts
// Find all signed URLs expiring within 24 hours, regenerate them, update contact.custom_fields
const expiring = await fileRepo.find({
  where: { signedUrlExpiresAt: LessThan(addDays(new Date(), 1)) }
});
for (const file of expiring) {
  const newUrl = await uploadService.generateSignedUrl(file.objectKey);
  await fileRepo.update(file.id, {
    signedUrl: newUrl,
    signedUrlExpiresAt: addDays(new Date(), 7),
  });
  await contactsService.setCustomField(file.contactId, file.fieldKey, newUrl);
}
```

---

#### Step 3 — Multiple Files Support

When `file_allow_multiple = true`, the JSONB value is an array of URLs:

```ts
// contacts.custom_fields["proof_of_address"] = [
//   "https://minio/.../doc1.pdf?X-Amz-Signature=...",
//   "https://minio/.../doc2.pdf?X-Amz-Signature=..."
// ]

async addFileToMultiField(contactId: string, fieldKey: string, newUrl: string) {
  await this.contactRepo.query(`
    UPDATE contacts
    SET custom_fields = jsonb_set(
      custom_fields,
      $1,
      COALESCE(custom_fields->$2, '[]'::jsonb) || $3::jsonb
    ),
    updated_at = NOW()
    WHERE id = $4
  `, [`{${fieldKey}}`, fieldKey, JSON.stringify(newUrl), contactId]);
}
```

---

#### Step 4 — Merge Tag Renders as Download Link

When `{{contact.id_document_upload}}` appears in an SMS/email/notification:

```ts
// In TemplateEngine.buildVarMap():
// FILE fields: the stored value IS the signed URL → renders directly as a clickable link
// e.g.: "New doc from John Smith: https://api.yourdomain.com/files/download/abc123"

// For SMS (no HTML): render as plain URL
// For Email (HTML): render as <a href="...">View Document</a>
// For internal notifications: render as URL
```

The merge tag `{{contact.id_document_upload}}` = the signed download URL. Team member receives it on their phone and taps to open the document directly.

**Secure download proxy** (hides raw MinIO URL from external exposure):
```ts
// GET /api/files/download/:fileId
// Validates agent is authenticated + belongs to the same locationId as the file
// Then redirects to a fresh MinIO presigned URL (10 min expiry)
@Get('download/:fileId')
@UseGuards(JwtAuthGuard)
async download(@Param('fileId') fileId: string, @Req() req, @Res() res: Response) {
  const file = await this.fileRepo.findOne({ where: { id: fileId } });
  if (file.locationId !== req.user.locationId) throw new ForbiddenException();
  const url = await this.uploadService.generateSignedUrl(file.objectKey, 10 * 60);
  res.redirect(302, url);
}
```

---

#### Step 5 — Form Builder UI (File Upload Field)

```tsx
// Form canvas — FILE field renders as:
<div className="border-2 border-dashed border-[#009B87]/30 rounded-xl p-6 text-center
  hover:border-[#009B87] hover:bg-[#009B87]/4 transition-all cursor-pointer"
  onClick={triggerFileInput}>
  <Upload className="w-8 h-8 text-[#009B87]/60 mx-auto mb-2" />
  <p className="text-sm font-medium text-gray-700">
    Click to upload or drag & drop
  </p>
  <p className="text-xs text-gray-400 mt-1">
    {field.fileAllowedTypes?.join(', ').toUpperCase() ?? 'Any file type'}
    {' · '}Max {field.fileMaxSizeMb}MB
    {field.fileAllowMultiple && ' · Multiple files allowed'}
  </p>
  <input type="file" ref={fileInputRef} className="hidden"
    accept={field.fileAllowedTypes?.map(t => `.${t}`).join(',')}
    multiple={field.fileAllowMultiple}
    onChange={handleFileSelect} />
</div>

{/* Upload progress */}
{uploading && (
  <div className="mt-2 flex items-center gap-2">
    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
      <div className="bg-[#009B87] h-1.5 rounded-full transition-all"
        style={{ width: `${uploadProgress}%` }} />
    </div>
    <span className="text-xs text-gray-500">{uploadProgress}%</span>
  </div>
)}

{/* Uploaded file chips */}
{uploadedFiles.map(f => (
  <div key={f.objectKey} className="flex items-center gap-2 mt-2 p-2
    bg-[#009B87]/8 border border-[#009B87]/20 rounded-lg">
    <FileText className="w-4 h-4 text-[#009B87]" />
    <span className="text-sm text-gray-700 flex-1 truncate">{f.originalName}</span>
    <Check className="w-4 h-4 text-[#39B54A]" />
  </div>
))}
```

---

#### Contact Left Panel — File Field Display

```tsx
// In contact profile left panel, FILE custom fields render as:
<div className="flex items-center justify-between py-2 border-b border-gray-100">
  <span className="text-xs text-gray-500">{field.name}</span>
  {value ? (
    <a href={`/api/files/download/${fileRecord.id}`}
      target="_blank"
      className="flex items-center gap-1.5 text-[#009B87] hover:underline text-xs font-medium">
      <FileText className="w-3.5 h-3.5" />
      View File
    </a>
  ) : (
    <span className="text-xs text-gray-300 italic">Not uploaded</span>
  )}
</div>

// Multiple files:
{files.map((f, i) => (
  <a key={i} href={`/api/files/download/${f.id}`} target="_blank"
    className="flex items-center gap-1.5 text-[#009B87] hover:underline text-xs block mt-1">
    <Paperclip className="w-3 h-3" /> {f.originalName}
  </a>
))}
```

---

#### Where We Exceed GHL on File Uploads

| Feature | GHL | Our CRM |
|---------|-----|---------|
| File upload custom field | ✅ | ✅ |
| Multiple files per field | ✅ | ✅ |
| File type restrictions | ✅ | ✅ |
| Merge tag = download link | ✅ | ✅ |
| Workflow trigger on upload | ✅ via Form Submitted | ✅ |
| **Presigned direct upload (no server buffering)** | ❌ (server upload) | ✅ Browser → MinIO direct |
| **Secure download proxy** (hides storage URL) | ❌ | ✅ `/api/files/download/:id` with auth check |
| **URL auto-refresh** before expiry | ❌ | ✅ Daily cron job |
| **AI document analysis on upload** | ❌ | ✅ Claude reads PDF/image → extracts data into other custom fields |

**AI document analysis bonus:**
```ts
// After file confirm, if field config has ai_extract: true:
// → Claude Vision reads the uploaded ID/contract
// → Extracts: full name, ID number, expiry date, address
// → Auto-fills matching custom fields on the contact
// → Agent sees: "AI extracted 4 fields from ID document — [Review & Confirm]"
```

---

### 17. User Hierarchy, Roles & Permission System — Complete Implementation

---

#### The Two-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENCY LEVEL  (global master engine)                           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Agency Owner   │  │  Agency Admin    │  │  Agency User  │  │
│  │  (root — never  │  │  (near-full      │  │  (cross-acct  │  │
│  │   deletable)    │  │   global access) │  │   worker)     │  │
│  └─────────────────┘  └──────────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  SUB-ACCOUNT LEVEL  (individual client workspace)               │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐  │
│  │  Account Admin              │  │  Account User            │  │
│  │  (full control inside one   │  │  (daily tasks only,      │  │
│  │   sub-account, zero cross-  │  │  granular toggles,       │  │
│  │   visibility)               │  │  "Only Assigned Data")   │  │
│  └─────────────────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

#### User Types — Exact Database Representation

```sql
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

  -- TIER 1: where does this user log in?
  user_type            TEXT NOT NULL CHECK (user_type IN (
                         'AGENCY_OWNER',   -- root, indestructible
                         'AGENCY_ADMIN',   -- near-full global
                         'AGENCY_USER',    -- cross-account worker
                         'LOCATION_ADMIN', -- one sub-account, full control
                         'LOCATION_USER'   -- one sub-account, restricted
                       )),

  -- TIER 2: admin or user role within their tier
  system_role          TEXT NOT NULL DEFAULT 'USER' CHECK (system_role IN ('ADMIN','USER')),

  -- Location-level users pinned to one location; agency users can access many via user_location_access
  primary_location_id  UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- "Only Assigned Data" — the nuclear data restrictor
  only_assigned_data   BOOLEAN NOT NULL DEFAULT FALSE,

  -- Granular feature toggles (JSONB overrides on top of role defaults)
  feature_permissions  JSONB NOT NULL DEFAULT '{}',

  -- indestructible flag — only Agency Owner = true
  is_owner             BOOLEAN NOT NULL DEFAULT FALSE,

  totp_secret          TEXT,
  totp_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at           TIMESTAMPTZ,
  UNIQUE(agency_id, email_lower)
);

-- Agency-level users can be granted access to multiple sub-accounts
CREATE TABLE user_location_access (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY(user_id, location_id)
);
CREATE INDEX idx_ula_location ON user_location_access(location_id);
CREATE INDEX idx_ula_user ON user_location_access(user_id);
```

---

#### Full Feature Permission Toggle Matrix (~50 toggles)

`feature_permissions` JSONB stores per-user overrides. Defaults come from `user_type + system_role`; JSONB keys win on top:

```ts
// packages/shared/src/types/feature-permissions.ts
export interface FeaturePermissions {
  // Users & Staff
  users_invite: boolean;          users_delete: boolean;
  users_edit_permissions: boolean;

  // Contacts
  contacts_view: boolean;         contacts_create: boolean;
  contacts_edit: boolean;         contacts_delete: boolean;
  contacts_export: boolean;       contacts_import: boolean;
  contacts_merge: boolean;

  // Custom Fields
  custom_fields_create: boolean;  custom_fields_edit: boolean;
  custom_fields_delete: boolean;

  // Conversations
  conversations_view: boolean;    conversations_send: boolean;
  conversations_delete: boolean;  conversations_assign: boolean;

  // Pipelines & Opportunities
  pipelines_view: boolean;        pipelines_create: boolean;
  pipelines_edit: boolean;        pipelines_delete: boolean;
  opportunities_create: boolean;  opportunities_edit: boolean;
  opportunities_delete: boolean;  opportunities_value_edit: boolean;

  // Workflows / Automation
  workflows_view: boolean;        workflows_create: boolean;
  workflows_edit: boolean;        workflows_publish: boolean;
  workflows_delete: boolean;

  // Forms & Funnels
  forms_view: boolean;            forms_create: boolean;
  forms_edit: boolean;            forms_delete: boolean;
  funnels_view: boolean;          funnels_create: boolean;
  funnels_edit: boolean;          funnels_delete: boolean;

  // Calendars, Reports, Billing (agency-level)
  calendars_view: boolean;        calendars_manage: boolean;
  reports_view: boolean;          reports_export: boolean;
  billing_view: boolean;          billing_manage: boolean;
  sub_accounts_create: boolean;   sub_accounts_delete: boolean;
  snapshots_deploy: boolean;

  // Settings
  location_settings_edit: boolean; integrations_manage: boolean;
  phone_numbers_manage: boolean;   email_config_manage: boolean;
}
```

**Default permissions matrix (key differences):**

| Toggle | AGENCY_OWNER | AGENCY_ADMIN | AGENCY_USER | LOCATION_ADMIN | LOCATION_USER |
|--------|:---:|:---:|:---:|:---:|:---:|
| users_delete | ✅ | ✅ | ❌ | ✅ (loc only) | ❌ |
| contacts_export | ✅ | ✅ | ✅ | ✅ | ❌ |
| contacts_delete | ✅ | ✅ | ✅ | ✅ | ❌ |
| custom_fields_delete | ✅ | ✅ | ❌ | ✅ | ❌ |
| workflows_edit | ✅ | ✅ | ❌ | ✅ | ❌ |
| workflows_view | ✅ | ✅ | ✅ | ✅ | ❌ (toggle) |
| opportunities_value_edit | ✅ | ✅ | ❌ | ✅ | ❌ |
| billing_view | ✅ | ✅ | ❌ | ❌ | ❌ |
| sub_accounts_create | ✅ | ✅ | ❌ | ❌ | ❌ |

```ts
// Effective permissions = role defaults merged with JSONB overrides
getEffectivePermissions(user: User): FeaturePermissions {
  const defaults = DEFAULT_PERMISSIONS[user.userType];
  return { ...defaults, ...user.featurePermissions }; // user-specific overrides win
}
```

---

#### Permission Bitmask in JWT (No DB Hit Per Request)

All 50 feature flags encoded as two BigInt bitmasks in the JWT — decoded instantly at the guard layer:

```ts
// packages/shared/src/auth/scope-bits.ts
export const SCOPE_BITS: Record<keyof FeaturePermissions, number> = {
  users_invite: 0,    users_delete: 1,    users_edit_permissions: 2,
  contacts_view: 3,   contacts_create: 4, contacts_edit: 5,
  contacts_delete: 6, contacts_export: 7, contacts_import: 8,
  contacts_merge: 9,  custom_fields_create: 10, /* ... */
  billing_view: 42,   billing_manage: 43, sub_accounts_create: 44,
  // ... all 50 keys mapped to bits 0–49
};

export function encodePermissions(perms: FeaturePermissions): { mask1: bigint; mask2: bigint } {
  let mask1 = 0n, mask2 = 0n;
  for (const [key, bit] of Object.entries(SCOPE_BITS)) {
    if (perms[key as keyof FeaturePermissions]) {
      if (bit < 64) mask1 |= (1n << BigInt(bit));
      else          mask2 |= (1n << BigInt(bit - 64));
    }
  }
  return { mask1, mask2 };
}

export function hasPermission(token: AccessTokenPayload, perm: keyof FeaturePermissions): boolean {
  const bit = SCOPE_BITS[perm];
  const mask = bit < 64 ? BigInt(token.scopeMask1) : BigInt(token.scopeMask2);
  const pos  = bit < 64 ? bit : bit - 64;
  return (mask & (1n << BigInt(pos))) !== 0n;
}
```

**JWT payload** (extended from auth section):
```ts
interface AccessTokenPayload {
  sub: string;            // userId
  jti: string;            // for revocation
  agencyId: string;
  locationId: string | null;
  userType: 'AGENCY_OWNER'|'AGENCY_ADMIN'|'AGENCY_USER'|'LOCATION_ADMIN'|'LOCATION_USER';
  systemRole: 'ADMIN'|'USER';
  isOwner: boolean;
  onlyAssignedData: boolean;   // ← baked into token so every query knows
  scopeMask1: string;          // BigInt as decimal string (bits 0–63)
  scopeMask2: string;          // bits 64–127
  exp: number; iat: number;
}
```

---

#### NestJS Permission Guard

```ts
// auth/guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<keyof FeaturePermissions>(
      'required_permission', context.getHandler()
    );
    if (!required) return true;
    const user: AccessTokenPayload = context.switchToHttp().getRequest().user;
    if (user.isOwner) return true;  // Agency Owner always passes
    return hasPermission(user, required);
  }
}

// Decorator:
export const RequirePermission = (perm: keyof FeaturePermissions) =>
  SetMetadata('required_permission', perm);

// Usage on controllers:
@RequirePermission('workflows_edit')
@Patch(':id')
async updateWorkflow(@Param('id') id: string, ...) { ... }

@RequirePermission('contacts_export')
@Get('export')
async exportContacts(...) { ... }
```

---

#### "Only Assigned Data" — Enforced at Service Layer

When `user.onlyAssignedData = true`, every list query adds a filter:

```ts
// Shared helper — used by ContactsService, ConversationsService, OpportunitiesService
function applyOnlyAssignedFilter(
  qb: SelectQueryBuilder<any>,
  user: AccessTokenPayload,
  entityAlias: string,
  entityType: 'contact'|'opportunity'
) {
  if (!user.onlyAssignedData) return;  // no-op for unrestricted users
  qb.andWhere(`(
    ${entityAlias}.assigned_to = :userId
    OR EXISTS (
      SELECT 1 FROM entity_followers ef
      WHERE ef.entity_type = :entityType
        AND ef.entity_id = ${entityAlias}.id
        AND ef.user_id = :userId
    )
  )`, { userId: user.sub, entityType });
}

// In ContactsService.findAll():
applyOnlyAssignedFilter(qb, requestingUser, 'c', 'contact');

// In OpportunitiesService.findByPipeline():
applyOnlyAssignedFilter(qb, requestingUser, 'opp', 'opportunity');

// In ConversationsService.getInbox():
// Conversations link via contact — join through contact assignment:
if (requestingUser.onlyAssignedData) {
  qb.andWhere(`(
    conv.assigned_to = :userId
    OR EXISTS (
      SELECT 1 FROM entity_followers ef
      WHERE ef.entity_type = 'contact'
        AND ef.entity_id = conv.contact_id
        AND ef.user_id = :userId
    )
  )`, { userId: requestingUser.sub });
}
```

**The Followers Override** is automatic — the `OR EXISTS (entity_followers...)` clause in every query means adding someone as a follower instantly grants them targeted visibility through the OAD wall, exactly as GHL describes.

---

#### Agency Owner — Indestructible Enforcement

```ts
// users.service.ts
async deleteUser(actorId: string, targetUserId: string) {
  const [actor, target] = await Promise.all([
    this.userRepo.findOneOrFail({ where: { id: actorId } }),
    this.userRepo.findOneOrFail({ where: { id: targetUserId } }),
  ]);

  if (target.isOwner)
    throw new ForbiddenException('Agency Owner cannot be deleted');

  const RANK = { AGENCY_OWNER:5, AGENCY_ADMIN:4, AGENCY_USER:3, LOCATION_ADMIN:2, LOCATION_USER:1 };
  if (RANK[target.userType] >= RANK[actor.userType])
    throw new ForbiddenException('Cannot delete users at or above your level');

  if (actor.userType === 'LOCATION_ADMIN') {
    const inLocation = await this.ulaRepo.findOne({
      where: { userId: targetUserId, locationId: actor.primaryLocationId }
    });
    if (!inLocation) throw new ForbiddenException('User not in your sub-account');
  }

  await this.userRepo.update(targetUserId, { deletedAt: new Date() });
}

async editPermissions(actorId: string, targetUserId: string, updates: Partial<FeaturePermissions>) {
  const [actor, target] = await Promise.all([...]);
  if (target.isOwner)
    throw new ForbiddenException('Agency Owner permissions cannot be modified');
  const RANK = { ... };
  if (RANK[target.userType] >= RANK[actor.userType])
    throw new ForbiddenException('Cannot modify users at or above your level');
  // Merge updates into target.featurePermissions JSONB
  await this.userRepo.update(targetUserId, {
    featurePermissions: { ...target.featurePermissions, ...updates }
  });
  // Audit log
  await this.auditLog.record(actorId, 'PERMISSIONS_CHANGED', { targetUserId, updates });
}
```

---

#### Agency User — Context Switching Into Sub-Account

```
POST /api/auth/switch-context { locationId }
  → verify user has user_location_access row (or is AGENCY_OWNER/ADMIN — always allowed)
  → issue new 15-min access token with locationId set + location-scoped permissions
  → original agency session untouched — user returns via "← Back to Agency" button
```

```ts
// Sidebar indicator when in sub-account context:
{user.userType.startsWith('AGENCY') && user.activeLocationId && (
  <div className="mx-3 mb-2 px-3 py-2 bg-[#009B87]/10 border border-[#009B87]/20 rounded-lg">
    <p className="text-xs text-[#009B87] font-medium">Working inside:</p>
    <p className="text-sm font-bold text-gray-800">{activeLocation.name}</p>
    <button onClick={backToAgency}
      className="text-xs text-[#009B87] hover:underline mt-1">
      ← Back to Agency
    </button>
  </div>
)}
```

---

#### My Staff UI — Permission Toggle Panel

```tsx
// Edit User slide panel — 480px
<Sheet>
  <SheetContent>
    {/* Only Assigned Data — the amber warning toggle */}
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-amber-900 text-sm">Only Assigned Data</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Limits visibility to assigned + followed contacts, conversations & deals only.
          </p>
        </div>
        <Switch checked={user.onlyAssignedData}
          onCheckedChange={v => update({ onlyAssignedData: v })}
          className="data-[state=checked]:bg-amber-500" />
      </div>
    </div>

    {/* Permission groups */}
    {PERMISSION_GROUPS.map(group => (
      <div key={group.label} className="mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          {group.label}
        </p>
        {group.perms.map(perm => (
          <div key={perm.key} className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-700">{perm.label}</span>
            <Switch
              checked={effectivePerms[perm.key]}
              onCheckedChange={v => updatePerm(perm.key, v)}
              disabled={!canEdit || user.isOwner}
              className="data-[state=checked]:bg-[#009B87]"
            />
          </div>
        ))}
      </div>
    ))}

    {/* AI Preset Suggester */}
    <div className="mt-4 p-3 bg-[#009B87]/6 border border-[#009B87]/20 rounded-xl">
      <p className="text-xs font-semibold text-[#009B87] mb-2 flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> AI Permission Templates
      </p>
      <div className="flex gap-2 flex-wrap">
        {['Sales Rep','Virtual Assistant','Manager','View Only'].map(preset => (
          <button key={preset}
            onClick={() => applyPreset(preset)}
            className="text-xs px-2 py-1 bg-white border border-[#009B87]/30
              text-[#009B87] rounded-full hover:bg-[#009B87]/10">
            {preset}
          </button>
        ))}
      </div>
    </div>
  </SheetContent>
</Sheet>
```

---

#### Separation of Concerns Summary

| Layer | What it enforces |
|-------|-----------------|
| PostgreSQL RLS | Location isolation — no cross-location data leakage |
| Service `applyOnlyAssignedFilter()` | User-within-location visibility (OAD toggle) |
| `PermissionGuard` + JWT bitmask | Feature access — can user trigger this action |
| Frontend `usePermission()` hook | Hide tabs/buttons the user can't use |

```ts
// Frontend hook — used throughout the app:
export function usePermission(perm: keyof FeaturePermissions): boolean {
  const { user } = useAuth();
  if (user.isOwner) return true;
  return hasPermission(user.tokenPayload, perm);
}

// Example usage:
const canExport = usePermission('contacts_export');
{canExport && <Button onClick={exportCSV}>Export CSV</Button>}
// → button is completely absent from DOM for Location Users
```

---

#### Where We Match + Exceed GHL

| Feature | GHL | Our CRM |
|---------|-----|---------|
| 5-tier user hierarchy | ✅ | ✅ |
| Admin vs User system role | ✅ | ✅ |
| ~30 granular feature toggles | ✅ | ✅ 50 toggles |
| "Only Assigned Data" toggle | ✅ | ✅ |
| Followers bypass OAD | ✅ | ✅ |
| Agency Owner indestructible | ✅ | ✅ |
| Cannot elevate above own level | Limited | ✅ rank comparison |
| **JWT bitmask — no DB hit per request** | ❌ | ✅ |
| **Audit log for every permission change** | ❌ | ✅ |
| **AI permission preset templates** | ❌ | ✅ Claude suggests best-fit preset |
| **Sub-account context switch with back-button** | ✅ | ✅ |

---

### 18. AI Agent & Conversational Agent System — Auto-Build on Signup

---

#### The Core Idea: Zero-Configuration AI for Every Sub-Account

Instead of requiring each sub-account to manually build, train, and configure their own bot (which most small business owners will never do correctly), SME Connect auto-builds a production-ready conversational agent during the **mandatory onboarding questionnaire** that runs immediately after sub-account creation.

```
Sub-account created
  ↓
Mandatory Onboarding Wizard fires (blocking — can't skip)
  ↓ (5-step questionnaire, ~3 minutes)
Claude reads all answers + generates:
  → System prompt (persona + objective + guardrails)
  → Knowledge base chunks (structured Q&A from their answers)
  → Channel config (which channels to activate)
  → Calendar integration (if they do appointments)
  → Human handoff rules (frustration triggers)
  ↓
Agent published in Suggestive Mode (draft replies, human approves)
  ↓ (after 7 days of team approval or manual switch)
Agent promoted to Autopilot Mode
```

The sub-account owner never writes a prompt. Never configures a model. Never uploads a document. They answer plain English questions and get a sharp, business-specific AI agent that sounds like their best employee.

---

#### The Onboarding Questionnaire — 5 Steps, All Mandatory

**Step 1 — Business Identity**
```
Questions:
1. What is your business name?
2. What industry are you in?  [dropdown: Real Estate, Dental, Legal, Contracting,
   Retail, Coaching, Beauty, Automotive, Insurance, Other]
3. Describe what you do in 2–3 sentences (free text)
4. What city/region do you serve?
5. What is your primary goal for this AI agent?
   [Book Appointments | Capture Leads | Answer FAQs | Qualify Prospects | All of the above]
```

**Step 2 — Services & Pricing**
```
Questions:
6. List your main services or products (one per line)
7. For each: what is the price or price range?
8. Do you offer free consultations? [Yes / No]
9. What is your response to "how much does it cost?" if you don't quote on the spot?
   (e.g., "It depends on the project scope — let's book a call to discuss")
10. Are there any services you do NOT offer that people commonly ask about?
    (helps the bot say "no" correctly)
```

**Step 3 — Operating Hours & Booking**
```
Questions:
11. What are your operating hours? [time picker per day]
12. Do you take bookings/appointments? [Yes / No]
    If yes: which calendar should bookings go to? [dropdown from location's calendars]
13. What is your booking confirmation message?
    (e.g., "Perfect! I've booked you for [date] at [time]. See you then!")
14. What should the bot say outside business hours?
    (e.g., "We're currently closed but I've noted your enquiry — the team will call you first thing tomorrow")
```

**Step 4 — Persona & Tone**
```
Questions:
15. What should we call your AI assistant? (e.g., "Sam", "Alex", or leave blank for generic)
16. What tone should it use? [Friendly & casual | Professional & formal | Warm & empathetic | Energetic & direct]
17. Is there anything the bot should NEVER say or do?
    (e.g., "Never mention competitor names", "Never discuss refunds — always transfer to human")
18. If a customer seems frustrated or angry, what should the bot do?
    [Stop replying and alert the team | Continue but flag for review | Ask to call them back]
```

**Step 5 — Channels & Handoff**
```
Questions:
19. Which channels should the AI handle? [multi-select: SMS, WhatsApp, Web Chat, Facebook, Instagram, Email]
20. Who should be alerted when human help is needed? [user selector from team]
21. How should the bot introduce itself?
    (e.g., "Hi! I'm Sam from [business name]. How can I help you today?")
22. What languages does your team serve? [multi-select — affects bot language capability]
```

---

#### Claude Auto-Builds the Agent From Answers

After the questionnaire submits, a single Claude call synthesizes all 22 answers into a structured agent config:

```ts
// ai/agent-builder.service.ts
async buildAgentFromOnboarding(locationId: string, answers: OnboardingAnswers): Promise<AgentConfig> {

  const response = await this.anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    tools: [{
      name: 'create_agent_config',
      description: 'Generate a complete AI agent configuration from business onboarding answers',
      input_schema: {
        type: 'object',
        properties: {
          agentName: { type: 'string' },
          systemPrompt: { type: 'string',
            description: 'Full system prompt with persona, objective, guardrails. 400–600 words.' },
          greeting: { type: 'string',
            description: 'First message the bot sends when a conversation opens' },
          knowledgeBaseEntries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                answer: { type: 'string' }
              }
            },
            description: 'Pre-formatted Q&A pairs extracted from the answers. Min 15 entries.'
          },
          humanHandoffTriggers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Keywords/phrases that trigger human takeover (e.g., "manager", "cancel", "refund")'
          },
          outOfHoursMessage: { type: 'string' },
          bookingIntentPhrases: {
            type: 'array',
            items: { type: 'string' },
            description: 'Phrases that indicate the contact wants to book (triggers calendar flow)'
          },
          toneProfile: {
            type: 'object',
            properties: {
              temperature: { type: 'number', description: '0.3=formal, 0.7=friendly, 0.9=casual' },
              responseLength: { type: 'string', enum: ['concise','moderate','detailed'] },
              useEmoji: { type: 'boolean' }
            }
          }
        },
        required: ['agentName','systemPrompt','greeting','knowledgeBaseEntries',
                   'humanHandoffTriggers','outOfHoursMessage','toneProfile']
      }
    }],
    tool_choice: { type: 'tool', name: 'create_agent_config' },
    messages: [{
      role: 'user',
      content: buildOnboardingPrompt(answers)  // formats all 22 answers into a clean briefing
    }]
  });

  const config = response.content.find(b => b.type === 'tool_use').input;

  // Save agent
  const agent = await this.agentRepo.save({
    locationId,
    name: config.agentName,
    systemPrompt: config.systemPrompt,
    greeting: config.greeting,
    humanHandoffTriggers: config.humanHandoffTriggers,
    outOfHoursMessage: config.outOfHoursMessage,
    toneProfile: config.toneProfile,
    mode: 'SUGGESTIVE',       // safe default — human approves for 7 days first
    channels: answers.activeChannels,
    calendarId: answers.calendarId ?? null,
    bookingIntentPhrases: config.bookingIntentPhrases,
    createdBy: 'ONBOARDING_AUTO',
    isAutoBuilt: true,
  });

  // Seed Knowledge Base
  for (const entry of config.knowledgeBaseEntries) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${entry.question}\n${entry.answer}`,
    });
    await this.kbChunkRepo.save({
      locationId,
      agentId: agent.id,
      content: `Q: ${entry.question}\nA: ${entry.answer}`,
      embedding: embedding.data[0].embedding,
      sourceType: 'ONBOARDING_QA',
    });
  }

  return agent;
}
```

**What Claude generates automatically** from 22 plain-English answers:
- A 400–600 word system prompt with the business's name, persona, prime directive, and guardrails
- 15–25 structured Q&A knowledge base entries (services, pricing, hours, FAQs)
- Exact human handoff trigger words calibrated to the business type
- Booking intent phrase list for calendar integration
- Temperature and response length tuned to the chosen tone
- Out-of-hours auto-reply message in the business's voice

---

#### The System Prompt Architecture (3 Pillars, Auto-Generated)

The auto-built system prompt always follows this structure:

```
PILLAR 1 — PERSONA & CONTEXT
"You are [agentName], the [role] assistant for [businessName], a [industry] business
 based in [location]. You speak [tone description]. Always be [tone adjectives]."

PILLAR 2 — PRIME DIRECTIVE
"Your single most important goal is to [primary_goal]. Every response should move
 the conversation toward this outcome. If the user goes off-topic, answer briefly
 and redirect: 'Happy to help with that! By the way, [redirect to goal]...'"

PILLAR 3 — GUARDRAILS (auto-populated from answers)
"NEVER do the following:
 - Invent pricing not explicitly listed in your knowledge base
 - Claim to be a human if directly asked
 - Discuss [never_mention_list from answer 17]
 - Give legal, medical, or financial advice
 - Mention competitor names
 
 ALWAYS do the following:
 - If you don't know the answer, say: 'That's a great question — let me connect you
   with someone who can give you a precise answer'
 - If the contact seems frustrated (uses words: [handoff_triggers]), immediately
   say: 'I completely understand your frustration. Let me get [human_name] to
   assist you right away' and trigger human handoff"
```

---

#### The 6 Pillars of a Perfect Conversational Agent (Implemented)

**Pillar 1 — Masterfully Engineered Prompt Architecture**
Auto-generated from onboarding (above). Editable by Location Admin post-setup in the Agent Studio.

**Pillar 2 — Clean, Documented Knowledge Base**
Onboarding answers seed the initial KB. Location Admin can add more via:
- URL scrape (crawls their website, extracts text, chunks it, embeds it)
- Document upload (PDF/DOCX → text extraction → chunking → embedding)
- Manual Q&A pairs (type question + answer, immediately vectorized)
- Feedback loop: when a team member dismisses an AI draft, they're prompted: "What should the bot have said?" → their correction becomes a new KB entry

```ts
// Knowledge base RAG query — always filter by locationId before vector distance
const chunks = await this.kbRepo.query(`
  SELECT content, 1 - (embedding <=> $1) AS similarity
  FROM knowledge_base_chunks
  WHERE location_id = $2
    AND agent_id = $3
  ORDER BY embedding <=> $1
  LIMIT 5
`, [JSON.stringify(queryEmbedding), locationId, agentId]);
// Inject top chunks into Claude's system prompt for each conversation
```

**Pillar 3 — Native CRM Tool Integration**
The agent has direct tool-use access to the sub-account's data:

```ts
const AGENT_TOOLS = [
  {
    name: 'check_calendar_availability',
    description: 'Check available booking slots for the next 7 days',
    input_schema: { type: 'object', properties: {
      calendarId: { type: 'string' },
      preferredDate: { type: 'string', format: 'date' }
    }}
  },
  {
    name: 'book_appointment',
    description: 'Book a confirmed appointment slot for the contact',
    input_schema: { type: 'object', properties: {
      calendarId: { type: 'string' },
      datetime: { type: 'string', format: 'date-time' },
      notes: { type: 'string' }
    }}
  },
  {
    name: 'update_contact_field',
    description: 'Update a custom field on the contact record mid-conversation',
    input_schema: { type: 'object', properties: {
      fieldKey: { type: 'string' },
      value: { type: 'string' }
    }}
  },
  {
    name: 'transfer_to_human',
    description: 'Pause AI and alert a human agent to take over',
    input_schema: { type: 'object', properties: {
      reason: { type: 'string' },
      urgency: { type: 'string', enum: ['low','medium','high','critical'] }
    }}
  },
  {
    name: 'get_contact_context',
    description: 'Retrieve relevant context about the contact (name, past purchases, open opportunities)',
    input_schema: { type: 'object', properties: {} }
  }
]
```

When `update_contact_field` is called mid-conversation (e.g., user says "my budget is R15,000"), the agent silently writes `{ budget: "15000" }` to `contacts.custom_fields` — no human needed.

**Pillar 4 — Contextual Memory**
Every Claude call for an ongoing conversation receives the last 20 messages as the message history:

```ts
const messages = recentMessages.map(m => ({
  role: m.direction === 'inbound' ? 'user' : 'assistant',
  content: m.body,
}));
// Claude maintains full context — "the smaller one" refers to what was said 3 turns ago
```

**Pillar 5 — Invisible Natural Delays**
```ts
// agent_configs.response_delay_ms — set from onboarding tone answer
// Friendly: 8000ms (8 seconds — feels natural)
// Professional: 3000ms
// Concise/Energetic: 1500ms

// Message grouping: wait for delay window, batch multiple consecutive inbounds
// into one Claude call so "two sentence" follow-ups are answered together
```

**Pillar 6 — Bulletproof Human Handoff**
```ts
// Triggered by:
// 1. Keyword match against humanHandoffTriggers[] (e.g., "manager", "frustrated", "cancel")
// 2. Claude calling transfer_to_human tool
// 3. Confidence score < 0.4 on KB retrieval (bot doesn't know the answer)
// 4. Message limit reached (configurable, default 20)

async triggerHumanHandoff(conversationId: string, reason: string, urgency: string) {
  // 1. Set agent mode to PAUSED for this conversation
  await this.convRepo.update(conversationId, { aiMode: 'PAUSED', aiPausedReason: reason });

  // 2. Notify the assigned human via push + SMS
  const humanToNotify = conversation.assignedTo ?? location.defaultHandoffUserId;
  await this.notificationService.push(humanToNotify, {
    type: 'HUMAN_HANDOFF_REQUIRED',
    title: `⚠️ AI stepped down — ${contact.firstName} needs human help`,
    body: reason,
    urgency,
    conversationId,
    action: 'OPEN_CONVERSATION',
  });

  // 3. Bot sends final message to contact
  await this.sendBotMessage(conversationId,
    agent.config.outOfHoursMessage ?? 
    "I'm connecting you with a team member right now who can assist further. Please bear with us!"
  );
}
```

---

#### Three Agent Modes

| Mode | What it does | When to use |
|------|-------------|-------------|
| **OFF** | Bot completely passive | Maintenance, after hours override |
| **SUGGESTIVE** | Drafts a reply, human clicks Send | First 7 days after auto-build, new staff training |
| **AUTOPILOT** | Replies autonomously 24/7 | After team has reviewed/approved bot's behavior |

**Auto-graduation:** After 7 days in Suggestive mode with ≥ 80% of drafts sent without edits, the system surfaces a notification: *"Your AI agent has been performing well — ready to switch to Autopilot?"* One click.

---

#### Agent Studio UI — For Power Users Who Want to Edit

Even though the bot is auto-built, Location Admins can open the Agent Studio to customize:

```
┌──────────────────────────────────────────────────────────────────┐
│  AI Agent: Sam                          [Suggestive ▾]  [Test]  │
│  ─────────────────────────────────────────────────────────────── │
│  [System Prompt]  [Knowledge Base]  [Channels]  [Behavior]      │
│                                                                  │
│  System Prompt                                          [Edit]   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ You are Sam, the friendly assistant for Apex Dental...    │  │
│  │ Your primary goal is to book appointments...              │  │
│  │ NEVER: invent pricing, claim to be human...               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Knowledge Base  (23 entries)                        [+ Add]    │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ Q: What are your hours?                                  │   │
│  │ A: Monday–Friday 9AM–5PM, closed weekends               │   │
│  │ [Edit] [Delete]                        source: onboarding│   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [+ Scrape URL]  [+ Upload Doc]  [+ Add Q&A]                    │
│                                                                  │
│  Behavior Settings                                               │
│  Response delay:  [●────────] 8s     Human handoff: [Edit]      │
│  Message limit:   20 msgs            Booking intent: [Edit]     │
└──────────────────────────────────────────────────────────────────┘
```

---

#### Agent Playground — Test Before Going Live

```
POST /api/agents/:id/test
body: { message: string, simulatedContactId?: string }

→ Runs the full pipeline:
   1. RAG: embed query → fetch top 5 KB chunks
   2. Build Claude messages array from simulated history
   3. Call Claude with tools enabled
   4. Return { reply, toolCallsMade, kbChunksUsed, confidenceScore }

→ UI shows:
   - The reply the bot would send
   - Which KB entries it used (highlighted)
   - Which tools it called (if any)
   - Thumbs up / thumbs down → negative creates draft FAQ correction
```

---

#### Onboarding Wizard UI (Blocking — Must Complete)

```tsx
// Renders as a full-screen modal that cannot be closed until all 5 steps complete
// Uses a stepper component at the top

<OnboardingWizard steps={5} currentStep={step}>
  {/* Step indicator */}
  <StepProgress steps={STEPS} current={step}
    completedColor="#39B54A" activeColor="#009B87" />

  {/* Each step is a card with teal header */}
  <div className="bg-white rounded-2xl shadow-xl max-w-2xl mx-auto">
    <div className="bg-gradient-to-r from-[#009B87] to-[#007A6C] p-6 rounded-t-2xl text-white">
      <h2 className="font-heading font-black text-2xl">{STEPS[step].title}</h2>
      <p className="text-teal-100 text-sm mt-1">{STEPS[step].subtitle}</p>
    </div>
    <div className="p-6 space-y-4">
      {/* Dynamic form fields for current step */}
      <StepFields step={step} form={form} />
    </div>
    <div className="p-6 pt-0 flex justify-between">
      {step > 0 && <Button variant="outline" onClick={prevStep}>← Back</Button>}
      <Button className="bg-[#009B87] ml-auto" onClick={nextStep}>
        {step === 4 ? 'Build My AI Agent →' : 'Next →'}
      </Button>
    </div>
  </div>
</OnboardingWizard>

{/* After step 5: full-screen loading state */}
{building && (
  <div className="fixed inset-0 bg-[#007A6C]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6" />
    <h2 className="font-heading font-black text-3xl mb-2">Building Your AI Agent</h2>
    <p className="text-teal-100 text-center max-w-sm">
      Claude is reading your answers and crafting a personalized assistant for {businessName}...
    </p>
    <div className="mt-8 space-y-2 text-sm text-teal-200">
      {buildSteps.map((s, i) => (
        <div key={i} className={`flex items-center gap-2 ${i <= buildStep ? 'opacity-100' : 'opacity-30'}`}>
          {i < buildStep ? <Check className="w-4 h-4 text-[#39B54A]" /> : <Loader className="w-4 h-4 animate-spin" />}
          {s}
        </div>
      ))}
    </div>
    {/* Steps: "Generating system prompt..." / "Building knowledge base..." / "Configuring channels..." / "Agent ready!" */}
  </div>
)}
```

---

#### Database Tables for Agent System

```sql
CREATE TABLE ai_agents (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,              -- "Sam"
  system_prompt           TEXT NOT NULL,
  greeting                TEXT NOT NULL,
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
  created_by              TEXT NOT NULL DEFAULT 'MANUAL', -- 'ONBOARDING_AUTO' or 'MANUAL'
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge base already exists (knowledge_base_chunks + pgvector)
-- Add agent_id column to scope chunks to specific agents:
ALTER TABLE knowledge_base_chunks ADD COLUMN agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE;
CREATE INDEX idx_kb_agent ON knowledge_base_chunks(agent_id, location_id);

-- Conversation-level AI mode override (e.g., paused for human handoff on this specific convo)
ALTER TABLE conversations
  ADD COLUMN ai_mode TEXT CHECK (ai_mode IN ('ON','PAUSED','OFF')) DEFAULT 'ON',
  ADD COLUMN ai_paused_reason TEXT,
  ADD COLUMN ai_paused_at TIMESTAMPTZ;
```

---

#### Where We Exceed GHL on AI Agents

| Feature | GHL | Our CRM |
|---------|-----|---------|
| Guided bot setup form | ✅ | ✅ + mandatory onboarding auto-build |
| Prompt-based manual setup | ✅ | ✅ (Agent Studio) |
| Visual flow builder | ✅ | ✅ (React Flow canvas) |
| URL scraping for KB | ✅ | ✅ |
| Document upload for KB | ✅ | ✅ |
| Manual Q&A pairs | ✅ | ✅ |
| Suggestive / Autopilot modes | ✅ | ✅ |
| Human handoff | ✅ | ✅ |
| **Auto-build from 22-question onboarding** | ❌ | ✅ Zero configuration needed |
| **Auto-graduation to Autopilot** (80% approval rate) | ❌ | ✅ |
| **Mid-conversation CRM field updates** (budget extracted silently) | Limited | ✅ via tool_use |
| **Feedback loop → auto-KB correction** | Limited | ✅ dismissed draft → correction prompt |
| **Response delay per tone profile** | Manual | ✅ auto-set from onboarding tone answer |
| **Confidence-based handoff** (KB score < 0.4) | ❌ | ✅ |
| **Full onboarding loading animation** | ❌ | ✅ |

---

### 19. Structured Knowledge Base Intake — Mandatory Welcome Briefing

---

#### The Concept

When a client signs up, they go through two onboarding steps in sequence:

```
Step A — Agent Questionnaire (22 questions, ~3 min)   ← already in Section 18
  ↓
Step B — Knowledge Base Briefing (structured long-form, ~15–30 min)
  ↓
Claude reads BOTH documents together → builds the most complete agent possible
```

The Knowledge Base Briefing is presented as a **Welcome to SME Connect** document — framed not as a chore but as the most important thing they'll ever fill out. The UI makes it feel premium, like onboarding with an elite agency. Each section has a **minimum word count enforced in real time**, with a progress bar and quality score so clients see exactly why the detail matters.

The framing copy on the welcome screen:

> *"Your AI agent will be your best employee — but only if it knows your business as well as you do. The next 20 minutes will determine how sharp, helpful, and on-brand your agent sounds from day one. Be specific. The more detail you give, the better your agent performs."*

---

#### The 8-Section Structured Briefing

Each section has a title, an explanation of why it matters, pre-written guiding sub-questions inside the textarea, and a minimum word count enforced before they can advance.

---

**Section 1 — Business Overview** *(min 80 words)*

> *"Write as if you're explaining your business to a brand new employee on their first day."*

Guiding prompts inside the text area (shown as placeholder text, fade out as they type):
```
- What does your business do, in plain language?
- How long have you been operating?
- What problem do you solve for your customers?
- What makes you different from competitors in your area?
- What is the feeling you want customers to leave with?
```

Example of excellent input → what Claude builds from it:
```
Input: "We're Apex Dental, a family dental practice in Cape Town CBD. We've been 
running for 12 years. We focus on making dental care comfortable for anxious patients — 
we have a no-judgment approach and we explain every procedure before we do it. Most 
dentists rush you through. We take time. Patients say they finally don't dread the dentist."

→ Claude KB entry: 
Q: What makes Apex Dental different from other dentists?
A: Apex Dental specialises in comfortable, no-judgment dental care for anxious patients. 
   Unlike most practices that rush appointments, we take time to explain every procedure 
   before starting. Patients consistently say it's the first time they've enjoyed going 
   to the dentist. We've been serving Cape Town CBD for 12 years.
```

---

**Section 2 — Services & Pricing** *(min 120 words)*

> *"List every service you offer. Include pricing where possible — even a range. If you don't quote on the spot, write exactly what you say to customers who ask."*

Guiding prompts:
```
- List each service with a short description
- What does it cost, or what is the price range?
- How long does each service take?
- Are there any conditions or requirements? (e.g., "consultation required first")
- What is your policy if someone asks for a price and you can't give one?
- Do you offer packages, bundles, or memberships?
```

This section directly powers the most-asked question any bot receives. Clients who skip pricing details get bots that say "I'm not sure of the price" — clients who fill this out get bots that say *"A standard cleaning is R650 and takes about 45 minutes — shall I book you in?"*

---

**Section 3 — Target Customer Profile** *(min 80 words)*

> *"Describe your ideal customer. The bot needs to recognise who it's talking to so it can adjust its tone and recommendations."*

Guiding prompts:
```
- Who is your typical customer? (age range, profession, lifestyle)
- What are they usually worried about when they first contact you?
- What questions do they ask most often?
- What objections do they raise most often? (e.g., "it's too expensive", "I need to think")
- What do they care about most — speed, price, quality, trust?
```

Claude uses this to personalise responses. A bot serving corporate lawyers speaks differently to one serving first-time homebuyers.

---

**Section 4 — Frequently Asked Questions** *(min 150 words — highest minimum)*

> *"Write out the 10 questions customers ask you most, with your exact preferred answer. These go directly into the brain of your AI."*

UI format: **10 pre-built Q&A input pairs** (not a single textarea). Each pair has:
- Question field (placeholder: "What question do customers always ask?")
- Answer field (placeholder: "Write your exact preferred answer — as if you're typing it to a customer right now", min 20 words per answer)

This is the highest-leverage section. It directly seeds the vector KB as structured Q&A pairs — no Claude interpretation needed, pure signal.

---

**Section 5 — Booking & Availability** *(min 60 words — if they take appointments)*

> *"Tell the AI exactly how your booking process works so it never gives a customer wrong information about availability."*

Guiding prompts:
```
- What types of appointments do you offer? (in-person, virtual, phone call)
- How far in advance do customers need to book?
- What happens after a booking is confirmed? (e.g., "we send a confirmation SMS")
- Is there a deposit or cancellation policy?
- What should the bot say if a customer's preferred time is unavailable?
- What is the fastest way to get an urgent appointment?
```

---

**Section 6 — Brand Voice & Communication Style** *(min 60 words)*

> *"Your AI will speak to customers on your behalf. Tell it how you sound."*

Guiding prompts:
```
- How do you greet customers? (formal "Good morning" vs casual "Hey!")
- Do you use humour? Or is your tone always professional?
- Are there words or phrases you always use? ("no worries", "absolutely", "let's do it")
- Are there words you hate? ("utilize", "leverage", "synergy" — or swear words)
- How do you close a conversation? What's your sign-off?
- What should the bot NEVER say to a customer?
```

This is what separates a generic bot from one that sounds exactly like the business owner. The bot picks up their language patterns.

---

**Section 7 — Escalation & Edge Cases** *(min 80 words)*

> *"Tell the AI how to handle the difficult moments — complaints, confused customers, and situations it wasn't trained for."*

Guiding prompts:
```
- What should the bot do if a customer is angry or uses aggressive language?
- Who should the bot transfer to for urgent matters? (name + contact)
- What should it say if it doesn't know the answer?
- Are there any topics that are completely off-limits? (competitors, legal disputes, refunds)
- What is your refund or complaint policy in plain language?
- What should happen after-hours? (e.g., "Take their number and we'll call back by 9AM")
```

---

**Section 8 — About Your Team** *(min 40 words — optional but recommended)*

> *"If customers ask to speak to a specific person, the bot should know who's who."*

Guiding prompts:
```
- Who are the key team members a customer might ask for?
- What does each person handle? (e.g., "Sarah handles all bookings, Mike handles complaints")
- Are there any team members the bot should NEVER route to directly?
```

---

#### Word Count Enforcement — UI Mechanics

Each section has a live word counter and a colour-coded quality indicator:

```tsx
// Word count progress bar under each textarea
<div className="mt-2 flex items-center gap-3">
  <div className="flex-1 bg-gray-200 rounded-full h-2">
    <div
      className={`h-2 rounded-full transition-all ${
        pct >= 100 ? 'bg-[#39B54A]' :   // green — minimum met
        pct >= 60  ? 'bg-amber-400' :    // amber — getting there
                     'bg-red-400'        // red — needs more
      }`}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
  </div>
  <span className={`text-xs font-medium tabular-nums ${
    pct >= 100 ? 'text-[#39B54A]' : 'text-gray-400'
  }`}>
    {wordCount}/{minWords} words
  </span>
  {pct >= 100 && <Check className="w-4 h-4 text-[#39B54A]" />}
</div>

// Quality score badge — appears once section hits minimum
{pct >= 100 && (
  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#009B87] font-medium">
    <Sparkles className="w-3.5 h-3.5" />
    This section will generate ~{estimatedKbEntries} knowledge base entries
  </div>
)}
```

**Section navigation:** The "Next Section →" button is disabled and grayed out until the minimum word count is met. There is no way to skip. The section tab turns green with a checkmark once the minimum is satisfied.

**Save progress:** Every keystroke auto-saves to `kb_intake_drafts` table (PostgreSQL). If they close the browser and come back, everything is restored. A banner shows: *"You're 4/8 sections complete — pick up where you left off."*

---

#### Overall Briefing Progress Dashboard

At the top of every section, a sticky progress bar shows global completion:

```tsx
<div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
  <div className="flex items-center justify-between mb-1">
    <span className="text-sm font-semibold text-gray-700">
      Knowledge Base Briefing — {completedSections}/8 sections complete
    </span>
    <span className="text-sm text-gray-400">
      Total words: {totalWords} / {totalMinWords} required
    </span>
  </div>
  <div className="flex gap-1.5">
    {SECTIONS.map((s, i) => (
      <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
        sectionComplete[i] ? 'bg-[#39B54A]' :
        i === currentSection ? 'bg-[#009B87]' : 'bg-gray-200'
      }`} />
    ))}
  </div>
</div>
```

**Estimated time remaining:** shown as *"~12 min left"* — calculated from average words per minute (80 wpm) vs words still needed.

---

#### What Claude Does With the Briefing

After all 8 sections are submitted, a second Claude call processes the entire briefing document alongside the 22 onboarding answers:

```ts
// ai/kb-builder.service.ts
async processBriefing(locationId: string, agentId: string, briefing: KbBriefing) {

  // 1. Explicit Q&A from Section 4 → straight to vector KB (no Claude needed)
  for (const qa of briefing.explicitFAQs) {
    await this.vectorizeAndSave(agentId, locationId, `Q: ${qa.q}\nA: ${qa.a}`, 'FAQ');
  }

  // 2. Long-form sections → Claude extracts structured KB entries
  const response = await this.anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 8192,
    tools: [{
      name: 'extract_knowledge_entries',
      description: 'Extract clean, structured Q&A knowledge base entries from free-form business briefing',
      input_schema: {
        type: 'object',
        properties: {
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string',
                  enum: ['services','pricing','booking','team','policy','brand_voice',
                         'differentiators','objection_handling','escalation','general'] },
                question: { type: 'string' },
                answer: { type: 'string' },
                priority: { type: 'number', minimum: 1, maximum: 5,
                  description: '5=most critical (pricing, hours), 1=nice to know' },
              },
              required: ['category','question','answer','priority']
            }
          },
          system_prompt_additions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Extra lines to append to the system prompt from brand voice and guardrail sections'
          },
          tone_notes: {
            type: 'string',
            description: 'A 2-sentence description of the brand voice extracted from Section 6'
          }
        }
      }
    }],
    tool_choice: { type: 'tool', name: 'extract_knowledge_entries' },
    messages: [{
      role: 'user',
      content: buildBriefingExtractionPrompt(briefing)
      // Passes all 8 sections as a structured document
    }]
  });

  const { entries, system_prompt_additions, tone_notes } = result.input;

  // 3. Vectorize all extracted entries
  for (const entry of entries) {
    const text = `Q: ${entry.question}\nA: ${entry.answer}`;
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    await this.kbChunkRepo.save({
      agentId, locationId,
      content: text,
      embedding: embedding.data[0].embedding,
      category: entry.category,
      priority: entry.priority,
      sourceType: 'KB_BRIEFING',
    });
  }

  // 4. Append brand voice + extra guardrails to agent system prompt
  await this.agentRepo.update(agentId, {
    systemPrompt: basePrompt + '\n\n' + system_prompt_additions.join('\n'),
    toneProfile: { ...agent.toneProfile, toneNotes: tone_notes },
  });
}
```

**Priority-weighted RAG:** When the agent retrieves KB chunks at conversation time, `priority` score is used as a tiebreaker — pricing and hours (priority 5) are always retrieved over general info (priority 1) when the embedding similarity is close.

---

#### The Result — What a Fully Briefed Agent Looks Like

After a client completes the 22-question onboarding + 8-section briefing, their agent has:

| Source | KB entries generated |
|--------|---------------------|
| Section 4 explicit FAQs (10 pairs) | 10 entries |
| Claude extraction from Sections 1–3, 5–8 | ~35–60 entries |
| URL scrape (optional, can do later) | variable |
| **Total before any live conversations** | **~45–70 structured entries** |

That's enough for the agent to handle **90%+ of inbound questions** on day one — before it has ever spoken to a single customer.

---

#### `kb_intake_drafts` — Resumable Drafts Table

```sql
CREATE TABLE kb_intake_drafts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE UNIQUE,
  section_data    JSONB NOT NULL DEFAULT '{}',
  -- { "1": { "text": "...", "wordCount": 95, "complete": true }, ... }
  completed_at    TIMESTAMPTZ,        -- null until all 8 sections done
  processed_at    TIMESTAMPTZ,        -- null until Claude has vectorized it
  total_words     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Auto-save every 3 seconds via debounced `PATCH /api/kb-intake/draft`.

---

#### Where We Exceed GHL

| Feature | GHL | Our CRM |
|---------|-----|---------|
| URL scrape for KB | ✅ | ✅ |
| Document upload | ✅ | ✅ |
| Manual Q&A pairs | ✅ | ✅ |
| **Structured mandatory briefing wizard** | ❌ | ✅ 8 sections, ~45–70 KB entries |
| **Minimum word count enforcement** | ❌ | ✅ Real-time counter, button locked |
| **Pre-written guiding prompts per section** | ❌ | ✅ Placeholder text teaches them how to answer |
| **Priority-weighted KB entries** | ❌ | ✅ Pricing/hours always retrieved first |
| **Auto-save drafts, resume anytime** | ❌ | ✅ |
| **Estimated KB entries preview** | ❌ | ✅ "This section will generate ~8 KB entries" |
| **Claude extracts structured Q&A from long-form text** | ❌ | ✅ |
| **Brand voice appended to system prompt** | ❌ | ✅ Tone notes auto-added from Section 6 |

---

### 20. Competitive Destruction Plan — Filling Every Gap GHL, HubSpot & Salesforce Left Open

---

#### The Strategy

Every major CRM chose a philosophy and became great at it — then became blind to everything outside it. GHL is an automation engine that sacrificed database depth. HubSpot is a polished UI that locked SMS/WhatsApp behind paywalls. Salesforce is an enterprise fortress that locked out everyone who isn't a certified admin.

SME Connect enters the gaps between all three with one principle: **no artificial ceilings**. Every feature that frustrated users log on competitor request boards becomes a native, day-one capability in this platform — implemented technically to the standard those users were asking for.

---

#### Gap 1 — GHL Has No True Relational Database (Many-to-Many)

**The complaint:** GHL is flat and contact-centric. Linking one Company → 15 Properties → 4 Vendors requires cluttered custom fields and tag hacks. It breaks under real B2B complexity.

**What we build: Custom Objects with true relational links**

```sql
-- custom_objects: define any entity type the business needs
CREATE TABLE custom_object_definitions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,           -- "Property", "Vendor", "Vehicle", "Case"
  name_plural  TEXT NOT NULL,           -- "Properties", "Vendors"
  icon         TEXT NOT NULL DEFAULT 'box',
  color        TEXT NOT NULL DEFAULT '#009B87',
  fields       JSONB NOT NULL DEFAULT '[]',
  -- [{key, name, data_type, required, options}] — same 13 types as custom fields
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(location_id, name)
);

-- custom_object_records: rows of those objects
CREATE TABLE custom_object_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  object_id    UUID NOT NULL REFERENCES custom_object_definitions(id) ON DELETE CASCADE,
  data         JSONB NOT NULL DEFAULT '{}',  -- field values
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- custom_object_relationships: the Many-to-Many linker
-- "Property belongs to Company" + "Property has 4 Vendors"
CREATE TABLE custom_object_relationships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

  -- left side of the relationship
  from_type       TEXT NOT NULL CHECK (from_type IN ('contact','opportunity','company','custom_object')),
  from_id         UUID NOT NULL,
  from_object_id  UUID REFERENCES custom_object_definitions(id) ON DELETE CASCADE,

  -- right side
  to_type         TEXT NOT NULL CHECK (to_type IN ('contact','opportunity','company','custom_object')),
  to_id           UUID NOT NULL,
  to_object_id    UUID REFERENCES custom_object_definitions(id) ON DELETE CASCADE,

  relationship_label TEXT,  -- "Owns", "Manages", "Supplies", "Lives At"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_obj_rel_from ON custom_object_relationships(from_type, from_id);
CREATE INDEX idx_obj_rel_to   ON custom_object_relationships(to_type, to_id);
```

**Real example — Real Estate Agency:**
```
Company: "Skyline Developments"
  └── Property: "14 Sea Point Ave" (linked via relationship: "Owns")
  └── Property: "8 Green Point Rd"
  └── Property: "22 Buitenkant St"
       └── Vendor: "Cape Plumbing Co" (linked: "Supplies to")
       └── Vendor: "Green Electrical"
  
Contact: "John Smith" linked to "14 Sea Point Ave" as "Tenant"
Contact: "Sarah Jones" linked to "14 Sea Point Ave" as "Landlord"
```

All of this is natively modelled in the relational table. No custom field hacks. No tags. Drag open a Property record and see every Contact, Vendor, and Company it's linked to in a clean panel — with links you can click to navigate the graph.

**AI query layer on top:** *"Show me all properties in the Western Cape where the plumber vendor hasn't been assigned yet"* — Claude translates this to a SQL query over `custom_object_records` + `custom_object_relationships` and returns the result as a table.

---

#### Gap 2 — GHL Shared Inbox Permissions Are Binary (All or Nothing)

**The complaint:** The only options are "sees everything" or "sees only assigned data." Teams need a middle ground — a Support manager should see only Support conversations, not Sales conversations, without getting full database access.

**What we build: Inbox Teams with scoped channel access**

```sql
-- inbox_teams: named groups that filter the inbox view
CREATE TABLE inbox_teams (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,              -- "Support Team", "Sales Team"
  channels     TEXT[] NOT NULL DEFAULT '{}', -- ['SMS','WHATSAPP'] — only these channels
  tag_filters  TEXT[] NOT NULL DEFAULT '{}', -- contacts with these tags only
  pipeline_ids UUID[] NOT NULL DEFAULT '{}', -- conversations linked to these pipelines only
  color        TEXT NOT NULL DEFAULT '#009B87',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- inbox_team_members: who is in each team
CREATE TABLE inbox_team_members (
  team_id     UUID NOT NULL REFERENCES inbox_teams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_manage  BOOLEAN NOT NULL DEFAULT FALSE,  -- team manager sees all team convos
  PRIMARY KEY(team_id, user_id)
);
```

**How it works:**
- A Support Team is configured: channels = `[SMS, WHATSAPP]`, tag_filters = `[support]`
- When a Support manager logs in, their inbox is scoped to that team config automatically
- They see every SMS and WhatsApp from contacts tagged "support" — across all team members
- They do NOT see Sales team's email threads or the full contact database
- Full database access is never granted — the filter is applied at query time

```ts
// In ConversationsService.getInbox() — after the OAD filter:
if (user.inboxTeamId) {
  const team = await inboxTeamRepo.findOne({ where: { id: user.inboxTeamId } });
  if (team.channels.length) qb.andWhere('conv.type = ANY(:channels)', { channels: team.channels });
  if (team.tagFilters.length) {
    qb.andWhere(`EXISTS (
      SELECT 1 FROM contacts c2 WHERE c2.id = conv.contact_id
      AND c2.tags && :tags
    )`, { tags: team.tagFilters });
  }
}
```

This is the GHL "Only Assigned Data" problem solved — without restricting users to only their own records.

---

#### Gap 3 — GHL Has No Native Multi-Currency Pipeline

**The complaint:** International agencies and e-commerce brands dealing in USD, EUR, GBP, and ZAR in the same pipeline get corrupted dashboard totals. GHL expects one currency per sub-account.

**What we build: Per-opportunity currency with live exchange rate conversion**

```sql
-- Store currency on every opportunity
ALTER TABLE opportunities
  ADD COLUMN currency         TEXT NOT NULL DEFAULT 'ZAR',  -- ISO 4217
  ADD COLUMN monetary_value_usd NUMERIC(15,2);  -- always stored in USD equivalent too

-- Exchange rates cache (refreshed every 4 hours via BullMQ cron)
CREATE TABLE exchange_rates (
  base_currency  TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate           NUMERIC(15,6) NOT NULL,
  fetched_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(base_currency, target_currency)
);
```

**Pipeline dashboard — multi-currency totals:**
```ts
// When rendering pipeline value totals, convert all to the location's display currency:
const totalInDisplayCurrency = opportunities.reduce((sum, opp) => {
  const rate = exchangeRates[`${opp.currency}_${displayCurrency}`] ?? 1;
  return sum + (opp.monetaryValue * rate);
}, 0);

// Shown as: "Total Pipeline Value: R 2,450,000 (ZAR equivalent)"
// Individual cards still show their native currency: "$5,000 USD"
```

**Exchange rates sourced from:** Open Exchange Rates API (free tier) — refreshed every 4 hours by a BullMQ cron job. Stored in `exchange_rates` table so the dashboard never makes a live API call.

**AI-powered FX insight:** *"Which of our open deals have the highest ZAR exposure risk if the dollar strengthens?"* — Claude queries `opportunities` with `currency != 'ZAR'` and calculates FX sensitivity.

---

#### Gap 4 — GHL Documents & Contracts Lack Design Depth & Legal Tracking

**The complaint:** GHL's proposal builder is basic. Users want PandaDoc/DocuSign-level design, calculated fields, legally-robust audit trails, and real e-signatures — not just a text template.

**What we build: Native Proposal & Contract Studio with binding e-signatures**

```sql
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
  opportunity_id  UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('PROPOSAL','CONTRACT','QUOTE','INVOICE','NDA')),
  status          TEXT NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT','SENT','VIEWED','SIGNED','DECLINED','EXPIRED')),
  body_json       JSONB NOT NULL DEFAULT '{}',   -- block-based document content
  merge_fields    JSONB NOT NULL DEFAULT '{}',   -- resolved at send time from contact
  sent_at         TIMESTAMPTZ,
  first_viewed_at TIMESTAMPTZ,
  view_count      INTEGER NOT NULL DEFAULT 0,
  signed_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legal audit trail: every view, scroll depth, signature event
CREATE TABLE document_audit_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL,   -- 'OPENED','SCROLLED_TO_PAGE','SIGNED','IP_CAPTURED'
  metadata     JSONB NOT NULL DEFAULT '{}',  -- { page, scrollPct, ip, userAgent, timestamp }
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-signature storage
CREATE TABLE document_signatures (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  signer_name  TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  ip_address   TEXT NOT NULL,
  user_agent   TEXT NOT NULL,
  signature_png_key TEXT NOT NULL,   -- MinIO path to signature image
  signed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Cryptographic proof
  document_hash TEXT NOT NULL,       -- SHA-256 of document body at signing moment
  certificate_id TEXT NOT NULL UNIQUE  -- UUID stamped on the signed PDF
);
```

**Document builder:** Block-based editor (similar to Notion blocks):
- Text, Heading, Image, Table, Divider, Signature Field, Calculated Field blocks
- **Calculated fields:** `=SUM(items[*].price) * 1.15` — VAT calculated live
- **Merge tag blocks:** `{{contact.first_name}}`, `{{opportunity.monetary_value}}` — resolved at send time
- **AI Proposal Generator:** describe the project → Claude drafts a complete structured proposal with scope, pricing table, terms, and payment schedule

**Legal audit trail:** When the contact opens the signing link:
- IP address captured on open
- Scroll depth tracked (we can prove they read to page 3)
- Signature drawn on canvas → PNG stored in MinIO → SHA-256 hash of document body stored
- Final signed PDF generated server-side with certificate stamp
- Audit certificate downloadable as PDF (shows IP, timestamp, document hash, signature image)

This matches DocuSign's legal standing — not just a "I clicked agree" checkbox.

---

#### Gap 5 — HubSpot Locks SMS & WhatsApp Behind Expensive Tiers

**The complaint:** HubSpot's SMS requires the Marketing Hub Professional tier at $800+/month. WhatsApp is third-party only. Most SMBs can't afford it.

**What we have from day one:** Twilio-powered SMS, MMS, and WhatsApp are baked into the base plan. Every sub-account gets:
- A dedicated Twilio phone number included in their subscription
- Two-way SMS and MMS (text + media) natively in the unified inbox
- WhatsApp Business API via Twilio (approved templates + 24h session window)
- Voice AI on that same number (GPT-4o Realtime)
- Missed call text back on by default

This is GHL parity but surfaced as a **direct comparison point** in onboarding: *"You'd pay $800/month just for SMS on HubSpot. It's included here."*

---

#### Gap 6 — HubSpot Has No Multi-Step Funnel Builder with Upsells

**The complaint:** HubSpot can build landing pages but not conversion funnels with order bumps, one-click upsells, and downsells — you need ClickFunnels or Shopify for that.

**What we build: Native funnel engine with conversion logic**

```ts
interface FunnelStep {
  id: string;
  type: 'OPTIN' | 'SALES_PAGE' | 'ORDER_BUMP' | 'UPSELL' | 'DOWNSELL'
       | 'CONFIRMATION' | 'WEBINAR_REGISTRATION' | 'APPOINTMENT_BOOKING';
  pageContent: PageBuilderContent;  // drag-drop page builder blocks
  product?: {
    productId: string;
    price: number;
    currency: string;
    isOneClick: boolean;   // true = charged instantly on accept, no re-entry
  };
  onAccept: string;  // next step ID
  onDecline: string; // next step ID (for upsell declines → downsell)
}
```

The funnel builder uses the same drag-drop page builder (GrapesJS) as the website builder — but adds conversion-specific blocks: Order Bump checkbox, One-Click Upsell button (charges stored card), countdown timer, progress bar, video sales letter embed.

---

#### Gap 7 — HubSpot Cannot Be White-Labeled

**The complaint:** You cannot resell HubSpot as your own product. This is GHL's biggest lock-in — and it's already in our plan (Section 9). But we go further:

**Our white-label advantages over GHL:**
- GHL white-label still has traces of GHL in API responses and URLs. Ours: zero GHL references anywhere — we built it from scratch
- **Mobile PWA** with custom app icon + name per agency (installable to homescreen as their brand)
- **Custom onboarding emails** from agency's domain (not noreply@smeconnect.co.za)
- **Agency-specific AI persona** — the "Ask AI" assistant in the sidebar can be renamed and given a custom avatar (e.g., "Ask Aria" for a white-label agency)
- **Reseller pricing tiers** — the agency sets their own pricing for sub-accounts, and the platform handles the billing split automatically

---

#### Gap 8 — Salesforce Is Inaccessible Without a Certified Admin

**The complaint:** Small business owners cannot use Salesforce without hiring a specialist. Making a schema change requires submitting a change request to an admin.

**What we build: AI-powered no-code platform operations**

Every structural change a Salesforce admin would do is achievable in plain English:

```
"Add a custom field called 'Property Type' as a dropdown with options:
 Residential, Commercial, Industrial, Mixed Use"
→ Claude calls POST /api/custom-fields with the correct payload
→ Field appears on every contact form and left panel immediately

"Create a new pipeline called 'Property Sales' with stages:
 Viewing Scheduled → Offer Made → Offer Accepted → Transfer → Completed"
→ Pipeline created, Kanban board live in 10 seconds

"Build a workflow that texts every contact tagged 'VIP' on their birthday"
→ Claude generates the workflow JSON → displays in the builder for review → one-click publish
```

This is the **"Ask AI" command palette** (`⌘K`) that's already in the sidebar — but positioned in marketing as *"The platform that any business owner can operate without an IT department."*

---

#### The Unified Competitive Moat: 5 Things No Competitor Has Simultaneously

| Feature | GHL | HubSpot | Salesforce | **SME Connect** |
|---------|:---:|:-------:|:----------:|:---------------:|
| White-label reselling | ✅ | ❌ | ❌ | ✅ |
| Native SMS + WhatsApp (base plan) | ✅ | ❌ | ❌ | ✅ |
| Multi-step funnels with upsells | ✅ | ❌ | ❌ | ✅ |
| True relational custom objects | ❌ | Partial | ✅ (complex) | ✅ |
| Department-scoped inbox teams | ❌ | ❌ | Partial | ✅ |
| Multi-currency pipeline with FX | ❌ | ❌ | ✅ (expensive) | ✅ |
| DocuSign-grade e-signatures | ❌ | ❌ | Via AppExchange | ✅ |
| AI auto-builds agent on signup | ❌ | ❌ | ❌ | ✅ |
| Mandatory KB briefing wizard | ❌ | ❌ | ❌ | ✅ |
| No-code schema changes via AI | ❌ | ❌ | ❌ | ✅ |
| Voice AI on every number | ❌ | ❌ | ❌ | ✅ |
| Accessible to non-technical SMBs | Partial | ✅ | ❌ | ✅ |
| Enterprise relational data depth | ❌ | ❌ | ✅ | ✅ |

**The positioning statement:**
> *SME Connect is the only platform where a small business owner can sign up on Monday, have a fully configured AI agent answering customers by Tuesday, manage complex multi-entity relationships without a developer, close deals with legally-binding e-signatures, and resell the entire platform under their own brand — all without touching a single line of code.*

That sentence cannot be said about GHL, HubSpot, or Salesforce individually. It can only be said about this platform.

---

#### Technical Implementation Priorities for Competitive Features

| Feature | New tables needed | Complexity | Phase |
|---------|-----------------|-----------|-------|
| Custom Objects + Relationships | `custom_object_definitions`, `custom_object_records`, `custom_object_relationships` | High | Phase 2 |
| Inbox Teams | `inbox_teams`, `inbox_team_members` | Low | Phase 1 |
| Multi-currency + FX | `exchange_rates` + columns on `opportunities` | Medium | Phase 2 |
| Document Studio + e-signatures | `documents`, `document_audit_events`, `document_signatures` | High | Phase 2 |
| Funnel upsell engine | `funnel_steps` + payment intent capture | Medium | Phase 4 |
| AI no-code platform ops | Extension of Ask AI (⌘K) + API action tools | Medium | Phase 3 |
| Agency AI persona renaming | Column on `agency_branding` | Low | Phase 6 |

---

### 21. Meta Integration — Facebook, Instagram, Lead Ads, CAPI & Social Planner

---

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  META SERVERS                                                       │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────────┐ │
│  │  Messenger   │  │  Instagram DM │  │  Lead Ads Form Submit    │ │
│  └──────┬───────┘  └───────┬───────┘  └────────────┬─────────────┘ │
│         │ Webhook           │ Webhook               │ Webhook        │
└─────────┼───────────────────┼───────────────────────┼───────────────┘
          │                   │                       │
          ▼                   ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NestJS — POST /webhooks/meta/messenger                             │
│           POST /webhooks/meta/instagram                             │
│           POST /webhooks/meta/lead-ads                              │
│                                                                     │
│  MetaWebhookGuard: HMAC-SHA256 X-Hub-Signature-256 validation       │
│  RawBodyMiddleware: raw bytes preserved for signature check         │
│                                                                     │
│  MetaMessengerAdapter  →  ConversationsService.saveInbound()        │
│  MetaInstagramAdapter  →  ConversationsService.saveInbound()        │
│  MetaLeadAdsAdapter    →  ContactsService.findOrCreate()            │
│                        →  WorkflowEngine.trigger(FORM_SUBMITTED)    │
└─────────────────────────────────────────────────────────────────────┘
          │ Outbound reply
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Meta Graph API (v20.0)                                             │
│  POST /{page-id}/messages  →  Messenger reply                      │
│  POST /{ig-user-id}/messages → Instagram reply                     │
│  POST /{pixel-id}/events   → CAPI server-side events               │
│  POST /{ig-user-id}/media + /{ig-user-id}/media_publish → Social   │
└─────────────────────────────────────────────────────────────────────┘
```

---

#### Step 1 — Meta App Setup (Per Sub-Account)

Each sub-account that connects Facebook/Instagram stores its own credentials — no shared tokens across locations.

```sql
-- Already in location_channel_configs, extended here for clarity
-- config JSONB structure for Meta channel:
-- {
--   "pageId": "123456789",
--   "pageAccessToken": "<encrypted>",    -- AES-256-GCM encrypted at rest
--   "igUserId": "987654321",
--   "igAccessToken": "<encrypted>",
--   "pixelId": "111222333",
--   "leadAdsForms": [
--     { "formId": "444555666", "formName": "Contact Request", "fieldMappings": {...} }
--   ],
--   "tokenExpiresAt": "2027-01-15T00:00:00Z"
-- }
```

**OAuth connect flow:**
```
1. User clicks "Connect Facebook" in Settings > Integrations
2. Opens Meta OAuth popup → user grants permissions:
   pages_messaging, instagram_basic, instagram_manage_messages,
   leads_retrieval, pages_read_engagement, ads_management,
   business_management, pages_manage_posts, instagram_content_publish
3. Exchange code for long-lived page token (60 days)
4. Store encrypted in location_channel_configs
5. Register webhooks on the page:
   POST /{page-id}/subscribed_apps with subscribed_fields:
     messages, messaging_postbacks, feed, leadgen
6. Store igUserId by calling GET /me/accounts → GET /{page-id}?fields=instagram_business_account
```

**Token refresh cron (BullMQ, daily):**
```ts
// Find tokens expiring within 7 days
// GET /oauth/access_token?grant_type=fb_exchange_token&access_token={current}
// Update encrypted token + new expiry in DB
// If refresh fails → notify location admin via in-app alert
```

---

#### Step 2 — Inbound Webhooks (Messenger & Instagram DM)

**Webhook verification (GET — Meta sends this once on subscription):**
```ts
// GET /webhooks/meta/messenger?hub.mode=subscribe&hub.verify_token=X&hub.challenge=Y
// Verify hub.verify_token matches location's stored verify_token → return hub.challenge
@Get('verify')
verifyWebhook(@Query() q: MetaVerifyQuery, @Res() res: Response) {
  if (q['hub.mode'] === 'subscribe' && q['hub.verify_token'] === VERIFY_TOKEN) {
    return res.send(q['hub.challenge']);
  }
  return res.status(403).send('Forbidden');
}
```

**Webhook signature validation (POST — every inbound event):**
```ts
// MetaWebhookGuard — runs before controller
// Requires raw body bytes (registered via RawBodyMiddleware on /webhooks/* prefix)
const signature = req.headers['x-hub-signature-256']?.replace('sha256=', '');
const expected = crypto
  .createHmac('sha256', META_APP_SECRET)
  .update(req.rawBody)
  .digest('hex');
if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
  throw new UnauthorizedException('Invalid Meta signature');
}
```

**Messenger inbound message payload → normalized:**
```ts
// MetaMessengerAdapter.normalize(payload)
// payload.entry[0].messaging[0]:
// {
//   sender: { id: "USER_PSID" },
//   recipient: { id: "PAGE_ID" },
//   timestamp: 1234567890,
//   message: { mid: "m_abc123", text: "Hi, I need pricing" }
//            OR attachments: [{ type: "image", payload: { url: "..." } }]
// }

return {
  externalId:  message.mid,
  channel:     'FACEBOOK',
  direction:   'inbound',
  body:        message.text ?? '',
  attachments: (message.attachments ?? []).map(a => ({
    url:      a.payload.url,
    mimeType: a.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
  })),
  senderId:    sender.id,     // PSID — used to find/create contact
  pageId:      recipient.id,  // used to find which location this belongs to
  sentAt:      new Date(timestamp * 1000),
};
```

**Contact resolution by PSID:**
```ts
// PSIDs are page-scoped — unique per user per page
// Store on contact record: contacts.facebook_psid TEXT
async findOrCreateByPSID(psid: string, locationId: string, pageId: string) {
  let contact = await contactRepo.findOne({ where: { locationId, facebookPsid: psid } });
  if (!contact) {
    // Fetch their name from Graph API
    const profile = await graphApi.get(`/${psid}?fields=name,profile_pic&access_token=${pageToken}`);
    contact = await contactsService.findOrCreate(locationId, {
      firstName: profile.name.split(' ')[0],
      lastName:  profile.name.split(' ').slice(1).join(' '),
      facebookPsid: psid,
      avatarUrl: profile.profile_pic,
    });
  }
  return contact;
}
```

**Instagram DM:** identical flow — uses `igUserId` instead of PSID, stores `instagram_igsid` on contact.

---

#### Step 3 — Outbound Replies via Graph API

When an agent types a reply in the inbox and the conversation channel is FACEBOOK or INSTAGRAM:

```ts
// channels/facebook.service.ts
async sendOutbound(dto: OutboundDto): Promise<string> {
  const config = await this.getLocationMeta(dto.locationId);

  const body: any = { recipient: { id: dto.contact.facebookPsid } };

  if (dto.attachments?.length) {
    // Send attachment first via /me/messages with attachment_upload API
    body.message = { attachment: { type: 'image', payload: { url: dto.attachments[0].url } } };
  } else {
    body.message = { text: dto.body };
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/me/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${decrypt(config.pageAccessToken)}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error) throw new ExternalServiceException('Meta', data.error.message);
  return data.message_id;  // external message ID stored on conversation_messages
}
```

**24-hour session window check (Messenger policy):**
```ts
// Messenger only allows free-form messages within 24h of last customer message
// Outside window: must use Message Tags or one-time notification opt-in
const lastInbound = await msgRepo.findLastInbound(conversationId, 'FACEBOOK');
const windowOpen = lastInbound && (Date.now() - lastInbound.sentAt.getTime()) < 86_400_000;
if (!windowOpen && !dto.messageTag) {
  throw new MessengerWindowClosedException(
    'Cannot send free-form message outside 24-hour window. Use a message tag or notification.'
  );
}
if (dto.messageTag) body.messaging_type = 'MESSAGE_TAG'; body.tag = dto.messageTag;
```

---

#### Step 4 — Facebook Lead Ads (Instant Form Capture)

When a Facebook ad runs and a user submits a Lead Ad form, Meta fires a `leadgen` webhook immediately:

```ts
// POST /webhooks/meta/lead-ads
// payload.entry[0].changes[0]:
// {
//   field: "leadgen",
//   value: {
//     form_id: "444555666",
//     leadgen_id: "777888999",
//     page_id: "123456789",
//     ad_id: "...", ad_name: "...", campaign_id: "..."
//   }
// }

async handleLeadAd(payload: MetaLeadAdWebhookDto) {
  const { formId, leadgenId, pageId } = payload.value;

  // 1. Find location by pageId
  const location = await locationRepo.findByMetaPageId(pageId);

  // 2. Fetch full lead data from Graph API (webhook only contains IDs)
  const leadData = await graphApi.get(
    `/${leadgenId}?fields=field_data,created_time,ad_id,campaign_id`,
    location.metaPageAccessToken
  );
  // leadData.field_data = [{ name: "email", values: ["john@example.com"] }, ...]

  // 3. Apply field mappings from location config
  const fieldMappings = location.metaConfig.leadAdsForms
    .find(f => f.formId === formId)?.fieldMappings ?? {};
  // fieldMappings = { "email": "email", "phone_number": "phone",
  //                   "when_do_you_want_to_start": "custom:project_start_date" }

  const contactDto: CreateContactDto = { locationId: location.id };
  const customFields: Record<string, string> = {};

  for (const field of leadData.fieldData) {
    const mapping = fieldMappings[field.name];
    if (!mapping) continue;
    if (mapping.startsWith('custom:')) {
      customFields[mapping.replace('custom:', '')] = field.values[0];
    } else {
      contactDto[mapping] = field.values[0];  // standard field
    }
  }
  contactDto.customFields = customFields;
  contactDto.source = 'FACEBOOK_LEAD_AD';
  contactDto.tags = ['facebook-lead', `ad:${leadData.adId}`];

  // 4. Dedup + create/update contact
  const contact = await contactsService.findOrCreateByIdentifier(location.id, contactDto);

  // 5. Fire FORM_SUBMITTED workflow trigger immediately
  await workflowEngine.trigger('FORM_SUBMITTED', contact.id, location.id, {
    formId,
    formName: location.metaConfig.leadAdsForms.find(f => f.formId === formId)?.formName,
    adId: leadData.adId,
    campaignId: leadData.campaignId,
    source: 'FACEBOOK_LEAD_AD',
  });
}
```

**Field Mapping UI** (in Settings > Integrations > Facebook > Lead Ads):
```tsx
// For each Lead Ad form connected, show a mapping table:
<table>
  <thead>
    <tr>
      <th>Facebook Form Field</th>
      <th>→ Maps to CRM Field</th>
    </tr>
  </thead>
  <tbody>
    {form.fields.map(f => (
      <tr key={f.name}>
        <td className="text-sm text-gray-600">{f.label}</td>
        <td>
          <Select value={mapping[f.name]} onChange={v => setMapping(f.name, v)}>
            <option value="first_name">First Name</option>
            <option value="last_name">Last Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            {customFields.map(cf => (
              <option key={cf.key} value={`custom:${cf.key}`}>{cf.name} (Custom)</option>
            ))}
          </Select>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

#### Step 5 — Meta Conversions API (CAPI) — Server-Side Tracking

Browser pixels get blocked by iOS 14+, ad blockers, and Safari ITP. CAPI sends the same events server-to-server, bypassing all of that — ensuring ad attribution is accurate.

**What we track via CAPI:**

| Event | Trigger | Data sent to Meta |
|-------|---------|------------------|
| `Lead` | Contact created via form | email hash, phone hash, client IP, browser |
| `CompleteRegistration` | Sub-account signup | email hash |
| `Purchase` | Payment captured | value, currency, order ID |
| `Schedule` | Appointment booked | — |
| `ViewContent` | Funnel page loaded | page URL, content name |
| `InitiateCheckout` | Checkout page opened | value, currency |

```ts
// meta/capi.service.ts
async sendEvent(locationId: string, eventName: string, dto: CAPIEventDto) {
  const config = await this.getLocationMeta(locationId);
  if (!config.pixelId) return;  // CAPI not configured for this location

  // Hash PII fields (SHA-256 lowercase, required by Meta)
  const userData: Record<string, string> = {};
  if (dto.email)  userData.em = sha256(dto.email.toLowerCase().trim());
  if (dto.phone)  userData.ph = sha256(dto.phone.replace(/\D/g, ''));
  if (dto.ip)     userData.client_ip_address = dto.ip;
  if (dto.ua)     userData.client_user_agent = dto.ua;
  if (dto.fbp)    userData.fbp = dto.fbp;   // _fbp cookie value from browser
  if (dto.fbc)    userData.fbc = dto.fbc;   // _fbc cookie (fb click ID)

  await fetch(`https://graph.facebook.com/v20.0/${config.pixelId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: dto.pageUrl,
        user_data: userData,
        custom_data: dto.customData,
        event_id: dto.eventId,  // dedup ID — prevents double-counting with pixel
      }],
      access_token: decrypt(config.pageAccessToken),
    }),
  });
}
```

**Event deduplication:** CAPI and browser pixel can both fire for the same event. Meta deduplicates using `event_id`. We generate a UUID per event, embed it in the funnel page's pixel call (`fbq('track', 'Lead', {}, { eventID: uuid })`), and send the same UUID in the CAPI call.

**CAPI fires automatically from:**
- `ContactsService.findOrCreate()` → sends `Lead` event when new contact created
- `PaymentsService.capturePayment()` → sends `Purchase` event
- `AppointmentsService.create()` → sends `Schedule` event
- Funnel page server-side rendering → sends `ViewContent` event

---

#### Step 6 — Social Planner (Content Publishing API)

```ts
// social/facebook-publisher.service.ts
async publishPost(dto: SocialPostDto): Promise<string> {
  const config = await this.getLocationMeta(dto.locationId);

  if (dto.mediaUrls?.length) {
    // Step 1: Upload photo to Facebook (returns photo IDs)
    const photoIds = await Promise.all(dto.mediaUrls.map(url =>
      this.uploadPhotoToFacebook(config.pageId, config.pageAccessToken, url)
    ));

    // Step 2: Publish post with attached photos
    const res = await graphApi.post(`/${config.pageId}/feed`, {
      message: dto.caption,
      attached_media: photoIds.map(id => ({ media_fbid: id })),
      published: !dto.scheduledAt,
      scheduled_publish_time: dto.scheduledAt
        ? Math.floor(dto.scheduledAt.getTime() / 1000)
        : undefined,
    }, config.pageAccessToken);
    return res.id;

  } else {
    // Text-only post
    const res = await graphApi.post(`/${config.pageId}/feed`, {
      message: dto.caption,
      published: !dto.scheduledAt,
      scheduled_publish_time: dto.scheduledAt
        ? Math.floor(dto.scheduledAt.getTime() / 1000)
        : undefined,
    }, config.pageAccessToken);
    return res.id;
  }
}

// Instagram publishing (two-step: create container → publish)
async publishInstagramPost(dto: SocialPostDto): Promise<string> {
  const config = await this.getLocationMeta(dto.locationId);

  // Step 1: Create media container
  const container = await graphApi.post(`/${config.igUserId}/media`, {
    image_url: dto.mediaUrls[0],  // must be publicly accessible URL
    caption: dto.caption,
  }, config.igAccessToken);

  // Wait for container to be ready (poll status)
  await this.waitForContainerReady(config.igUserId, container.id, config.igAccessToken);

  // Step 2: Publish container
  const res = await graphApi.post(`/${config.igUserId}/media_publish`, {
    creation_id: container.id,
  }, config.igAccessToken);
  return res.id;
}
```

**Social Planner database:**
```sql
CREATE TABLE social_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id    UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  caption        TEXT NOT NULL,
  media_urls     TEXT[] NOT NULL DEFAULT '{}',
  platforms      TEXT[] NOT NULL,   -- ['FACEBOOK','INSTAGRAM']
  status         TEXT NOT NULL DEFAULT 'SCHEDULED'
                 CHECK (status IN ('DRAFT','SCHEDULED','PUBLISHED','FAILED')),
  scheduled_at   TIMESTAMPTZ,
  published_at   TIMESTAMPTZ,
  facebook_post_id  TEXT,
  instagram_post_id TEXT,
  error_message  TEXT,
  created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_social_posts_scheduled ON social_posts(location_id, scheduled_at)
  WHERE status = 'SCHEDULED';
```

**BullMQ scheduler:** A `social-publish` queue processes posts at their `scheduled_at` time. Failed posts are retried 3 times with exponential backoff, then marked FAILED with `error_message` stored.

---

#### Step 7 — AI Integration on Top of Meta

**AI-assisted social posts:**
```ts
// POST /api/social/ai-generate
// body: { topic, tone, platforms, includeHashtags, mediaDescription }
// → Claude generates caption optimized for each platform:
//   Facebook: longer, storytelling, CTA at end
//   Instagram: punchy opener, hashtag block at end
// Returns { facebookCaption, instagramCaption, suggestedHashtags[] }
```

**AI Messenger/Instagram bot:** Already covered in Section 18 — the `ConversationAIService` treats FACEBOOK and INSTAGRAM channels identically to SMS. When an inbound Meta message arrives, the same BullMQ job fires to generate a Claude draft or autopilot reply.

**Lead Ad AI enrichment:** When a Lead Ad contact is created, Claude reads their form responses and auto-fills additional custom fields it can infer (e.g., if they answered "What type of property?" → "3-bedroom house", Claude can infer `property_type = residential` and `bedroom_count = 3` from the answer text).

---

#### Database Additions for Meta Integration

```sql
-- Add Meta identifiers to contacts
ALTER TABLE contacts
  ADD COLUMN facebook_psid  TEXT,  -- Messenger Page-Scoped ID
  ADD COLUMN instagram_igsid TEXT; -- Instagram-Scoped ID
CREATE INDEX idx_contacts_fb_psid ON contacts(location_id, facebook_psid)
  WHERE facebook_psid IS NOT NULL;
CREATE INDEX idx_contacts_ig_igsid ON contacts(location_id, instagram_igsid)
  WHERE instagram_igsid IS NOT NULL;

-- Track lead ad source on contacts
ALTER TABLE contacts
  ADD COLUMN source         TEXT,  -- 'FACEBOOK_LEAD_AD', 'INSTAGRAM_DM', 'FORM', 'MANUAL', etc.
  ADD COLUMN source_meta    JSONB; -- { adId, campaignId, formId, formName }
```

---

#### Where We Match + Exceed GHL on Meta

| Feature | GHL | Our CRM |
|---------|-----|---------|
| Messenger inbound webhook | ✅ | ✅ |
| Instagram DM inbound | ✅ | ✅ |
| Graph API outbound replies | ✅ | ✅ |
| 24-hour session window enforcement | ✅ | ✅ |
| Facebook Lead Ads capture | ✅ | ✅ |
| Lead Ad field mapping | ✅ | ✅ |
| Social Planner (FB + IG publish) | ✅ | ✅ |
| Scheduled posts | ✅ | ✅ |
| Meta Pixel (browser) | ✅ | ✅ |
| **CAPI server-side events** | ✅ | ✅ with auto event dedup UUID |
| **AI caption generator per platform** | ❌ | ✅ Claude writes FB vs IG-optimised |
| **Lead Ad AI field inference** | ❌ | ✅ Claude fills extra fields from answers |
| **Token expiry alerts** | ❌ | ✅ In-app notification 7 days before expiry |
| **Unified PSID + IGSID dedup** | Limited | ✅ Contact dedup by PSID/IGSID alongside email/phone |

---

### 22. Database Management — Supabase vs Raw PostgreSQL

**Short answer:** You do NOT need Supabase. The plan uses raw PostgreSQL with TypeORM migrations — you control exactly when tables are created and updated. Here's why that's better for this project:

| | Supabase | Raw PostgreSQL + TypeORM |
|---|---|---|
| Auto table creation | Yes (via dashboard/GUI) | Via migration files (versioned, repeatable) |
| Schema changes | Manual in dashboard or SQL editor | `pnpm migration:generate` → `pnpm migration:run` |
| Multi-tenant RLS | Built-in but opinionated | Full control — our custom `set_tenant_context` pattern |
| Realtime subscriptions | Built-in (Postgres LISTEN/NOTIFY) | Socket.io + BullMQ events (already in plan) |
| Cost at scale | Expensive per project/org | Pay only for compute |
| White-label | You'd expose Supabase branding | Zero third-party branding |

**How schema changes work in this project:**
```bash
# When you add a new column or table:
pnpm --filter=api migration:generate -- src/database/migrations/AddOpportunityContacts
# Generates: 009_add_opportunity_contacts.ts with exact UP/DOWN SQL
pnpm --filter=api migration:run
# Applies it to the DB — idempotent, tracked in migrations table
```

No manual table creation. No clicking in a dashboard. Git-tracked schema history.

---

### 12. Contacts vs Opportunities — Full Relationship Model

**This is where we outdo GHL.** GHL's model is correct but we go further with AI enrichment.

#### The Exact Data Model

```
contacts (people)          opportunities (deals)
──────────────────         ──────────────────────────
id                         id
location_id                location_id
first_name                 name
last_name                  pipeline_id → pipelines
email                      pipeline_stage_id → pipeline_stages
phone                      primary_contact_id → contacts  ← MANDATORY
tags[]                     monetary_value
custom_fields{}            status: open|won|lost|abandoned
assigned_to → users        assigned_to → users
                           custom_fields{}
                           ai_score (0-100)        ← OUR ADDITION
                           ai_score_reason         ← OUR ADDITION
                           ai_next_action          ← OUR ADDITION
                           last_stage_changed_at
                           last_activity_at

opportunity_contacts (the "up to 10 additional contacts" feature)
──────────────────────────────────────────────────────────────────
opportunity_id → opportunities
contact_id     → contacts
role           TEXT   -- e.g. "Decision Maker", "Spouse", "Guarantor"
is_primary     BOOLEAN
added_at       TIMESTAMPTZ
UNIQUE(opportunity_id, contact_id)
```

**SQL — opportunity_contacts junction table:**
```sql
CREATE TABLE opportunity_contacts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  contact_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  role             TEXT,            -- "Primary", "Spouse", "Business Partner", custom
  is_primary       BOOLEAN NOT NULL DEFAULT FALSE,
  added_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(opportunity_id, contact_id)
);
-- Enforce max 10 contacts per opportunity via app-layer check (not DB constraint)
-- Enforce exactly 1 is_primary=true per opportunity via partial unique index:
CREATE UNIQUE INDEX idx_opp_primary_contact
  ON opportunity_contacts(opportunity_id) WHERE is_primary = TRUE;

CREATE INDEX idx_opp_contacts_contact ON opportunity_contacts(contact_id);
CREATE INDEX idx_opp_contacts_opportunity ON opportunity_contacts(opportunity_id);
```

#### How Leads Are Captured and Flow Through

```
Lead Source (any of these)
├── Web form submission     → FormSubmitTrigger
├── Facebook Lead Ad        → Meta Leads webhook → contact created
├── Inbound SMS             → Twilio webhook → contact upserted by phone
├── Inbound call            → VoiceAI → contact upserted by phone
├── Manual import (CSV)     → BulkImportService
├── API POST /contacts      → direct creation
└── Web chat widget         → WebChatService.identifyVisitor()
        ↓
ContactCreatedEvent fired
        ↓
WorkflowEngine checks: any workflow with trigger=CONTACT_CREATED for this locationId?
        ↓
If yes → enroll contact → workflow executes (send welcome SMS, assign to pipeline, etc.)
        ↓
OpportunityService.createFromContact() — if workflow node type = CREATE_OPPORTUNITY:
  1. Creates opportunity record with primary_contact_id = contact.id
  2. Assigns to default pipeline + first stage
  3. Sets monetary_value from lead source metadata (e.g. form field "budget")
  4. Fires OpportunityCreatedEvent → triggers any OPPORTUNITY_CREATED workflows
```

#### Pipeline Stage Change → Workflow Trigger (exact bridge)

This is the automation bridge GHL describes — dragging a card → triggers actions:

```ts
// opportunity.service.ts
async updateStage(opportunityId: string, newStageId: string, userId: string) {
  const opp = await this.oppRepo.findOne({ where: { id: opportunityId } });
  const oldStageId = opp.pipelineStageId;

  // 1. Update DB
  await this.oppRepo.update(opportunityId, {
    pipelineStageId: newStageId,
    lastStageChangedAt: new Date(),
    lastActivityAt: new Date(),
  });

  // 2. Log stage change history
  await this.stageHistoryRepo.insert({
    opportunityId,
    fromStageId: oldStageId,
    toStageId: newStageId,
    changedBy: userId,
    changedAt: new Date(),
  });

  // 3. Fire workflow trigger for ALL contacts on this opportunity
  const contacts = await this.oppContactsRepo.find({ where: { opportunityId } });
  for (const oc of contacts) {
    await this.workflowQueue.add('trigger', {
      trigger: 'OPPORTUNITY_STAGE_CHANGED',
      contactId: oc.contactId,
      locationId: opp.locationId,
      payload: {
        opportunityId,
        fromStageId: oldStageId,
        toStageId: newStageId,
        isPrimaryContact: oc.isPrimary,
      },
    });
  }

  // 4. AI re-score the opportunity (async, non-blocking)
  await this.aiScoringQueue.add('score', { opportunityId });
}
```

```sql
-- Stage change history table (audit trail — GHL doesn't have this natively)
CREATE TABLE opportunity_stage_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  from_stage_id    UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id      UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  changed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_in_stage_ms BIGINT   -- computed: changed_at - previous row's changed_at
);
CREATE INDEX idx_stage_history_opp ON opportunity_stage_history(opportunity_id, changed_at DESC);
```

#### Where We OUTDO GHL

| Feature | GHL | Our CRM |
|---------|-----|---------|
| Max additional contacts per deal | 10 | 10 + custom role labels |
| Lead scoring | Manual tags only | **Claude AI scores 0-100 on every stage change** |
| Stage change history | None | Full audit trail with time-in-stage |
| AI next action | None | **Claude suggests next best action per opportunity** |
| Workflow trigger | Primary contact only | **Fires for ALL linked contacts on the deal** |
| Opportunity enrichment | Manual | **Auto-enriched from conversation history** |
| Lost reason analysis | Free text | **Claude clusters lost reasons, surfaces patterns** |

#### AI Lead Scoring (the differentiator)

```ts
// ai/opportunity-scorer.service.ts
async scoreOpportunity(opportunityId: string) {
  const opp = await this.oppRepo.findOne({
    where: { id: opportunityId },
    relations: ['primaryContact', 'stage', 'pipeline'],
  });

  const recentMessages = await this.messagesRepo.findLast20(opp.primaryContactId);
  const stageHistory = await this.stageHistoryRepo.findByOpp(opportunityId);

  const response = await this.anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    tools: [{
      name: 'score_opportunity',
      description: 'Score a sales opportunity and suggest next action',
      input_schema: {
        type: 'object',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100,
            description: 'Lead score — 100 = certain close, 0 = dead' },
          reason: { type: 'string', description: 'One sentence explaining the score' },
          next_action: { type: 'string',
            description: 'Most important next action the sales rep should take TODAY' },
          risk_flags: { type: 'array', items: { type: 'string' },
            description: 'Any red flags (e.g. "no response in 5 days", "price objection raised")' },
        },
        required: ['score', 'reason', 'next_action'],
      },
    }],
    tool_choice: { type: 'tool', name: 'score_opportunity' },
    messages: [{
      role: 'user',
      content: `Score this sales opportunity:
Pipeline: ${opp.pipeline.name}
Current Stage: ${opp.stage.name}
Value: ${opp.monetaryValue}
Days in current stage: ${daysSince(opp.lastStageChangedAt)}
Recent conversation:
${recentMessages.map(m => `${m.direction}: ${m.body}`).join('\n')}
Stage history: ${stageHistory.map(h => h.toStage.name).join(' → ')}`
    }],
  });

  const tool = response.content.find(b => b.type === 'tool_use');
  const { score, reason, next_action, risk_flags } = tool.input;

  await this.oppRepo.update(opportunityId, {
    aiScore: score,
    aiScoreReason: reason,
    aiNextAction: next_action,
    aiRiskFlags: risk_flags ?? [],
    aiScoredAt: new Date(),
  });
}
```

**UI:** Kanban cards show a colored score ring (green 70-100, amber 40-69, red 0-39) + next action tooltip. Replaces GHL's static kanban with an intelligent one.

---

### 10. Workflow AI Builder (Plain English → Workflow JSON)

```ts
// User types: "When a lead misses a call, text them immediately,
//  wait 1 hour, if no reply send an email, wait 24h, if still no reply
//  drop a voicemail and assign to sales team"

POST /api/workflows/ai-generate
body: { prompt: string, locationId: string }

→ Claude prompt:
  system: "You are a workflow builder. Output valid WorkflowDefinition JSON only.
           Available node types: [TRIGGER, SEND_SMS, SEND_EMAIL, WAIT_DELAY,
           WAIT_CONDITION, IF_ELSE, SEND_VOICEMAIL_DROP, ASSIGN_USER, ...]
           Available triggers: [MISSED_CALL, CONTACT_CREATED, TAG_ADDED, ...]"
  user: {prompt}

→ Parse JSON response → validate schema → return to frontend canvas
→ React Flow renders nodes automatically
→ User can edit before saving
```

---

## Precise Technical Specs — Deep Implementation

### Auth System

**JWT payload** — use bitfield permissions (not string arrays, which blow up token size with 130+ scopes):
```ts
interface LocationAccessTokenPayload {
  sub: string;           // userId
  jti: string;           // unique per token (for revocation)
  iss: string;           // 'https://app.smeconnect.co.za' OR white-label domain
  aud: string[];         // ['https://api.smeconnect.co.za', <white-label-domain>]
  userType: 'Location' | 'Company';
  companyId: string;     // agencyId — always present
  locationId: string | null;
  role: 'SUPER_ADMIN'|'AGENCY_OWNER'|'AGENCY_ADMIN'|'LOCATION_OWNER'|'LOCATION_USER'|'AI_AGENT';
  scopeMask1: string;    // BigInt serialized — bits 0-63 of permission scopes
  scopeMask2: string;    // bits 64-127
  tokenFamily: string;   // UUID linking access+refresh for rotation
  familyVersion: number; // monotonically incremented on each rotation
  exp: number; iat: number;
}
```

**Refresh token rotation with family reuse detection:**
- Store `token_families` table: `(family_id, user_id, current_version, revoked, revoked_reason)`
- On rotation: if `payload.familyVersion !== family.currentVersion` → **reuse detected** → delete entire family → force logout
- This prevents stolen refresh tokens being permanently valid

**White-label domain tokens:**
- Store `agency_custom_domains` table: `(domain, agency_id, verified, jwt_audience)`
- JWT issued with `iss: 'https://login.theirbrand.com'` and `aud` including both domains
- Guard validates issuer against `agency_custom_domains.domain` (cached 5min in Redis)
- Cookies must be `Domain=.theirbrand.com` — cannot share across domains

**Sub-account switch:** invalidates existing location token family, creates new family for target location.

---

### PostgreSQL Schema — Critical Tables

**Key design decisions:**
- `last_message_at` denormalized on `conversations` — required for inbox sort without subquery
- `phone_normalized` (digits-only) on `contacts` alongside E.164 `phone` — Twilio sends inconsistent formats
- `location_id` denormalized on `conversation_messages` — required for RLS without join
- `execution_id` UUID on every workflow step — idempotency key for at-least-once BullMQ delivery

**RLS implementation:**
```sql
-- Called at start of every request transaction
SELECT set_tenant_context($locationId::UUID, $agencyId::UUID, $role);

-- Policy on contacts (same pattern for all location-scoped tables)
CREATE POLICY contacts_isolation ON contacts FOR ALL TO app_user USING (
  current_setting('app.current_role') = 'SUPER_ADMIN'
  OR location_id = current_setting('app.current_location_id')::UUID
  OR (current_setting('app.current_role') IN ('AGENCY_OWNER','AGENCY_ADMIN')
      AND location_id IN (SELECT id FROM locations WHERE agency_id = current_setting('app.current_agency_id')::UUID))
);
```

**⚠️ PgBouncer blindspot:** `set_config` is transaction-scoped. With PgBouncer in transaction mode, context is lost between statements. Solution: wrap every RLS query in an explicit `BEGIN/COMMIT` transaction.

**Critical indexes:**
```sql
-- Phone lookup (most frequent: inbound SMS/call → find contact)
CREATE INDEX idx_contacts_phone ON contacts(location_id, phone_normalized) WHERE deleted_at IS NULL;

-- Inbox sort (every page load)
CREATE INDEX idx_conversations_inbox ON conversations(location_id, last_message_at DESC NULLS LAST)
  INCLUDE (contact_id, type, unread_count, assigned_to) WHERE deleted_at IS NULL;

-- Workflow active enrollments
CREATE INDEX idx_enrollments_active ON workflow_enrollments(contact_id, workflow_id, status) WHERE status = 'active';

-- Opportunities kanban
CREATE INDEX idx_opps_kanban ON opportunities(location_id, pipeline_id, pipeline_stage_id, updated_at DESC) WHERE deleted_at IS NULL;
```

**pgvector (Knowledge Base):**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE knowledge_base_chunks (
  id UUID PRIMARY KEY, knowledge_base_id UUID, location_id UUID,
  content TEXT, embedding vector(1536), source_type TEXT, metadata JSONB
);
CREATE INDEX ON knowledge_base_chunks USING hnsw (embedding vector_cosine_ops) WITH (m=16, ef_construction=64);
-- Query: always filter location_id in WHERE before vector distance operator
```

---

### Voice AI — Exact Implementation

**Three-leg architecture:**
```
Inbound Call → POST /voice/inbound → TwiML <Connect><Stream url="wss://.../voice/stream">
Twilio WS → NestJS VoiceGateway → OpenAI Realtime API WS
```

**Session isolation:** `Map<callSid, SessionState>` in the gateway. Re-keyed from nonce to callSid on Twilio's `start` event.

**Audio conversion (critical — no library, pure Buffer ops):**
```ts
// Twilio: mulaw 8kHz → OpenAI: pcm16 24kHz
// Step 1: mulaw decode (ITU-T G.711 lookup table, 256 entries)
// Step 2: upsample 8kHz→24kHz (factor 3, linear interpolation)
// Step 3: write as little-endian Int16 Buffer
// Reverse for OpenAI→Twilio output path
```

**OpenAI session.update** sent immediately on WS open:
```json
{
  "type": "session.update",
  "session": {
    "modalities": ["text","audio"],
    "voice": "alloy",
    "input_audio_format": "pcm16",
    "output_audio_format": "pcm16",
    "input_audio_transcription": { "model": "whisper-1" },
    "turn_detection": { "type": "server_vad", "threshold": 0.5, "silence_duration_ms": 700 },
    "tools": ["book_appointment", "transfer_to_human", "end_call"],
    "tool_choice": "auto"
  }
}
```

**Mid-call human transfer:**
```ts
// Cannot send new TwiML via Media Streams WS — must use REST API
await twilioClient.calls(callSid).update({
  url: `${BASE_URL}/voice/transfer-twiml?reason=${reason}`
});
// TwiML returns: <Say>...</Say><Dial><Number>{humanPhone}</Number></Dial>
```

**Missed call detection** — `POST /voice/status` statusCallback:
```ts
const isMissed = ['no-answer','busy','failed'].includes(body.CallStatus)
  || (body.CallStatus === 'completed' && parseInt(body.CallDuration) === 0);
```

**Post-call:** aggregate `response.audio_transcript.done` events → upsert contact by caller phone → save call record → enroll in post-call workflow via BullMQ.

---

### Workflow Execution Engine — Exact Implementation

**4 BullMQ queues:**
| Queue | Purpose |
|-------|---------|
| `workflow_trigger` | receives enrollment events, resolves which workflow(s) to start |
| `workflow_step` | executes one node (SMS, email, IF_ELSE, AI_DECISION, etc.) |
| `workflow_wait` | holds delayed jobs (WAIT_DELAY timeout jobs, WAIT_CONDITION timeouts) |
| `workflow_dlq` | permanently failed jobs after all retries exhausted |

**WAIT_CONDITION — exact mechanism (most complex):**
1. Worker processes `WAIT_CONDITION` node → writes to `workflow_condition_waiters` table + adds delayed BullMQ timeout job → marks job complete immediately (does NOT block worker)
2. External event fires (email open pixel, SMS reply webhook) → `advanceCondition(type, referenceId)` → query `workflow_condition_waiters` → remove timeout job (`job.remove()`) → enqueue `trueBranch` node
3. If timeout fires first → check if waiter row still exists → if yes, enqueue `timeoutBranch` and delete waiter → if no (condition already met), do nothing

```sql
CREATE TABLE workflow_condition_waiters (
  id UUID PRIMARY KEY, enrollment_id UUID, node_id VARCHAR(64),
  condition VARCHAR(64), reference_id VARCHAR(255),  -- trackingId, phone, tag
  true_branch VARCHAR(64), timeout_branch VARCHAR(64),
  bullmq_timeout_job_id VARCHAR(255),  -- for job.remove()
  expires_at TIMESTAMPTZ,
  UNIQUE(enrollment_id, node_id)
);
CREATE INDEX ON workflow_condition_waiters(condition, reference_id);  -- advance lookup
```

**Idempotency — prevents double-send on BullMQ at-least-once delivery:**
```ts
// Before any side effect (SMS send, email send)
const inserted = await db.query(`
  INSERT INTO workflow_execution_log (execution_id, ...) VALUES ($1, ...)
  ON CONFLICT (execution_id) DO NOTHING RETURNING id
`, [executionId]);
if (inserted.rowCount === 0) return;  // duplicate delivery — skip
```

**AI_DECISION node** — Claude picks workflow branch:
```ts
// Force tool_choice: { type: 'tool', name: 'select_branch' }
// Tool input_schema.properties.branch_key.enum = branches.map(b => b.key)
// Returns: { branch_key: 'hot_lead', reasoning: '...' }
// → advance to corresponding next node
```

**Retry strategy:**
- SMS: 4 attempts, exponential backoff 2s (2s/4s/8s/16s)
- Email: 3 attempts, exponential backoff 5s
- AI nodes: 2 attempts, fixed 3s delay
- All failed jobs → DLQ → mark enrollment `status='HALTED'`

**Rate limiting per location:** Redis `INCR ratelimit:sms:{locationId}` with 60s TTL → if over limit, add job with `delay = remaining TTL` instead of dropping.

---

### Omnichannel Adapters — Exact Implementation

**Canonical normalized schema** (`packages/shared`):
```ts
interface ConversationMessage {
  externalId: string;    // channel-native ID (for dedup)
  channel: 'SMS'|'MMS'|'EMAIL'|'FACEBOOK'|'INSTAGRAM'|'WHATSAPP'|'WEBCHAT';
  direction: 'inbound'|'outbound';
  body: string;
  subject?: string;      // email only
  attachments: { url: string; mimeType: string }[];
  threadId?: string;     // email In-Reply-To chain
  templateId?: string;   // WhatsApp template SID
  metadata: Record<string, unknown>;  // raw channel payload verbatim
  sentAt: Date;
}
```

**Webhook validation per channel:**
| Channel | Method | Key |
|---------|--------|-----|
| Twilio SMS | HMAC-SHA1 `X-Twilio-Signature` | Location's Twilio AuthToken |
| SendGrid | IP allowlist (SendGrid CIDR ranges) | No signature on inbound parse |
| Meta (FB/IG) | HMAC-SHA256 `X-Hub-Signature-256` | Meta App Secret — use `timingSafeEqual` |
| WhatsApp (Twilio) | Same as Twilio SMS | Location's WA AuthToken |

**⚠️ Raw body requirement:** Twilio and Meta signature validation requires raw request bytes BEFORE JSON parsing. Register `RawBodyMiddleware` only on `/webhooks/*` prefix — stores buffer on `req.rawBody`. All other routes use standard `express.json()`.

**Twilio MMS:** download `MediaUrl{N}` through backend (requires auth headers) → re-upload to MinIO → store MinIO URL. Never store raw Twilio media URLs (they expire and require auth).

**WhatsApp 24h session window:**
```ts
const windowOpen = lastInbound && (Date.now() - lastInbound.sentAt) < 86_400_000;
if (!windowOpen) {
  if (!dto.templateSid) throw new RequiresTemplateException();
  // use contentSid + contentVariables in Twilio API call
}
```

**Facebook page token refresh:** BullMQ cron job daily → find tokens expiring within 7 days → `GET /oauth/access_token?grant_type=fb_exchange_token` → update `location_channel_configs.config.pageAccessToken`.

**Web Chat Widget:**
- Served as Vite IIFE bundle from CDN (`packages/widget/`)
- `GET /api/widget/config/:locationId` — public endpoint, returns display config
- Socket.io namespace `/webchat`, rooms: `conversation:{id}`
- Anonymous visitor → `anonymous_visitors` table → linked to contact on pre-chat form submit
- AI handoff: if `conversations.assigned_to = null` → enqueue BullMQ AI job

**Location channel credentials** stored encrypted (AES-256-GCM) in `location_channel_configs.config` JSONB. Never raw tokens in DB. Key from `CREDENTIAL_ENCRYPTION_KEY` env var.

---

### Snapshot Deep Clone — Exact Algorithm

**Pre-generate ALL new IDs before any writes** (solves forward-reference cycles in workflow node graphs):
```ts
// Phase 1: Build complete IdMap<oldId, newId>
for (const item of allAssets) {
  idMap.set(item.id, crypto.randomUUID());
  // Also pre-map sub-entities (pipeline stages, workflow nodes)
}

// Phase 2: Deep recursive UUID remapper
function remapReferences(obj, idMap) {
  if (typeof obj === 'string' && UUID_REGEX.test(obj) && idMap.has(obj))
    return idMap.get(obj);
  if (Array.isArray(obj)) return obj.map(i => remapReferences(i, idMap));
  if (typeof obj === 'object') return Object.fromEntries(
    Object.entries(obj).map(([k,v]) => [k, remapReferences(v, idMap)])
  );
  return obj;
}
```

**⚠️ Custom field key blindspot:** `cf_<uuid>` patterns in template strings are NOT caught by UUID regex → add separate `cf_` pattern pass.

**Phase 3: Single SERIALIZABLE transaction** — insert all cloned entities. PostgreSQL ACID guarantees full rollback on any failure.

**Phase 4: Media files** (outside DB transaction) — copy S3 objects async. If fails, fallback to source URLs (DB is intact).

**Resumable clones:** `snapshot_clone_progress` table tracks completed steps by name. On failure, resume from last checkpoint.

**`origin_id` column** on every cloned entity (non-optional) — enables pushing snapshot updates to already-cloned locations without creating duplicates.

---

### Monorepo Structure

```
/ (Turborepo + pnpm)
├── apps/
│   ├── api/                    # NestJS — src/modules: auth, locations, contacts,
│   │                           #   conversations, channels/{twilio,sendgrid,facebook,
│   │                           #   whatsapp,webchat}, workflows, voice, ai, payments...
│   └── web/                    # Next.js 14 App Router
│       └── src/app/
│           ├── (auth)/         # login, forgot-password — no sidebar
│           └── (dashboard)/    # all app pages — DashboardLayout with sidebar
│               ├── inbox/[conversationId]/
│               ├── contacts/[contactId]/
│               ├── opportunities/
│               ├── workflows/[workflowId]/builder/
│               ├── channels/{facebook,instagram,whatsapp,sms,email,webchat}/
│               └── settings/
├── packages/
│   ├── shared/                 # TypeScript types, DTOs, Zod schemas
│   ├── ui/                     # shadcn/ui components, SME Connect design tokens
│   ├── ai/                     # Anthropic + OpenAI client wrappers
│   └── widget/                 # Web chat widget — Vite IIFE bundle for CDN
└── docker-compose.yml          # postgres, pgbouncer, redis, bullboard, minio
```

**Docker services:** postgres:16, pgbouncer (session mode for RLS), redis:7, bullboard (BullMQ UI), minio (S3-compatible media storage).

**Build order** (Turborepo resolves automatically): shared → ui → ai → api → web → widget (widget is standalone, no workspace deps).

---

## Build Phases (Recommended Order)

### Phase 1 — Foundation (Weeks 1-4)
- Multi-tenant auth (Agency + Sub-account + Users)
- Contacts CRM + Companies
- Conversations Inbox (SMS via Twilio, Email via SendGrid)
- Basic Workflow engine (triggers + actions)
- **AI**: Conversation AI (Claude auto-reply for SMS/email)

### Phase 2 — Sales Core (Weeks 5-8)
- Opportunities + Pipelines
- Calendars + Booking
- Payments (Stripe integration)
- Documents & Contracts
- **AI**: Lead scoring, GPT pipeline stage suggestions

### Phase 3 — AI Agents (Weeks 9-12) ← Core Differentiator
- Agent Studio (Claude tool-use agents)
- Voice AI (GPT-4o Realtime API)
- Knowledge Base (pgvector RAG)
- AI Workflow Builder (Claude → JSON workflow config)
- Content AI

### Phase 4 — Marketing + Sites (Weeks 13-18)
- Social Planner
- Email marketing engine
- Funnel + Website Builder
- Blogs + SEO
- Affiliate Manager

### Phase 5 — Memberships + Reputation (Weeks 19-22)
- Courses + Communities
- Review collection
- Listings

### Phase 6 — Agency Layer + White Label (Weeks 23-26)
- SaaS Configurator
- Prospecting Tool
- White labeling
- Reselling / billing engine
- Reporting + Audit Logs

---

## Key Files from This Repo to Use

| File | Use |
|------|-----|
| `apps/contacts.json` | Contacts endpoint schemas, custom field structure |
| `apps/conversations.json` | Conversation/message data models |
| `apps/workflows.json` | Workflow trigger/action definitions |
| `apps/opportunities.json` | Pipeline stage model |
| `apps/calendars.json` | Booking/appointment schema |
| `apps/invoices.json` | Invoice + payment schema |
| `apps/v3/conversation-ai-v3.json` | AI chatbot endpoint spec |
| `docs/oauth/Scopes.md` | Auth scopes to implement |
| `docs/webhook events/*.md` | All 58 webhook payloads to emit |
| `common/common-schemas.json` | Reuse error DTOs |

---

## Verification Plan
1. **Auth**: Create agency → create sub-account → create user → verify JWT scopes
2. **CRM**: Create contact, trigger webhook event (matches `docs/webhook events/ContactCreate.md` payload)
3. **Conversation AI**: Send SMS to Twilio number → Claude responds → appears in inbox
4. **Voice AI**: Call Twilio number → GPT-4o Realtime handles call → logs transcript
5. **Workflow**: Create trigger (Contact Created) + action (Send Email) → create contact → verify email sent
6. **Agent Studio**: Create Claude agent with CRM tool → ask it to "add a tag to John Smith" → verify tag added via API

---

## Section Index (Corrected)

> **Navigation guide** — Sections 10 and 14 were added out of order; they appear at the bottom of the file. The "Precise Technical Specs" block is a standalone deep-dive that sits outside the numbered section list.

| # | Section | Location in file |
|---|---------|-----------------|
| 1 | Missed Call Text Back | Near top |
| 2 | Omnichannel Unified Inbox | Near top |
| 3 | Conversation AI (Text & Chat) | Near top |
| 4 | Voice AI | Near top |
| 5 | Wait Conditions & Conditional Logic | Near top |
| 6 | Voicemail Drops | Near top |
| 7 | Trigger Links | Near top |
| 8 | Sub-Accounts & Snapshots | Near top |
| 9 | White-Labeling | Near top |
| 11 | Unified Conversations Inbox — Full Build | Middle |
| 12 | Opportunity Job Card — Full Panel | Middle |
| 13 | Form → Auto-Create Opportunity | Middle |
| 15 | Contacts — Full 3-Panel Layout + Custom Fields | Middle |
| 16 | File Upload Custom Field | Middle |
| 17 | User Hierarchy, Roles & Permission System | Middle |
| 18 | AI Agent & Conversational Agent System | Middle |
| 19 | Structured Knowledge Base Intake | Middle |
| 20 | Competitive Destruction Plan | Middle |
| 21 | Meta Integration | Middle |
| 22 | Database Management | Near bottom |
| *(gap)* | **Section 14 — Stripe Billing Engine** | ← **MISSING, needs to be written** |
| *(orphan)* | Contacts vs Opportunities (originally §12 duplicate) | Bottom |
| *(orphan)* | Workflow AI Builder (originally §10 duplicate) | Bottom |
| — | Precise Technical Specs (deep-dive, unnumbered) | Bottom |

---

## Gap A — Section 14: Stripe Billing & Subscription Engine (TODO)

> **Status: NOT YET WRITTEN** — this is the most critical missing section before Phase 1 starts.

This section must cover:
- **Agency Stripe Connect** — how the agency charges their sub-accounts (Connect Express or Standard)
- **Subscription plan tiers** — what feature gates apply per plan (Starter / Pro / Agency)
- **Usage-based billing** — per-SMS credit deduction, Twilio costs passed through with margin
- **Stripe webhooks** — `payment_intent.succeeded`, `subscription.updated`, `invoice.payment_failed`, `customer.subscription.deleted`
- **Plan enforcement guard** — `PlanGuard` NestJS guard that reads `location.planTier` and blocks endpoints above the tier
- **Billing portal** — Stripe Customer Portal URL redirect for self-service plan changes
- **Trial periods** — 14-day free trial, downgrade to read-only on expiry

**Database tables needed:**
```sql
CREATE TABLE subscription_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,           -- 'Starter', 'Pro', 'Agency'
  stripe_price_id TEXT NOT NULL UNIQUE,
  monthly_price NUMERIC(10,2) NOT NULL,
  sms_credits_included INTEGER NOT NULL DEFAULT 0,
  feature_gates JSONB NOT NULL DEFAULT '{}',  -- { "voice_ai": false, "custom_objects": true }
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE location_subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id         UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id  TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  plan_id             UUID NOT NULL REFERENCES subscription_plans(id),
  status              TEXT NOT NULL CHECK (status IN ('trialing','active','past_due','canceled','paused')),
  trial_ends_at       TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ NOT NULL,
  sms_credits_remaining INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sms_credit_ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  delta       INTEGER NOT NULL,   -- positive = added, negative = consumed
  reason      TEXT NOT NULL,      -- 'SUBSCRIPTION_RENEWAL', 'SMS_SENT', 'MANUAL_TOP_UP'
  balance     INTEGER NOT NULL,   -- running total after this transaction
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sms_ledger ON sms_credit_ledger(location_id, created_at DESC);
```

---

## Gap B — Migration Execution Order

> Run `pnpm --filter=api migration:run` — TypeORM applies these in filename order. Every file below corresponds to a migration in `apps/api/src/database/migrations/`.

**Order matters**: parent tables must exist before child tables that reference them via foreign key.

```
001_create_agencies.ts
  CREATE TABLE agencies (id, name, owner_email, branding JSONB, created_at)

002_create_locations.ts
  CREATE TABLE locations (id, agency_id → agencies, name, phone, website, settings JSONB, ...)
  CREATE TABLE agency_custom_domains (id, agency_id, domain, verified, ...)

003_create_users.ts
  CREATE TABLE users (id, agency_id, email_lower, password_hash, user_type, system_role,
    primary_location_id → locations, only_assigned_data, feature_permissions JSONB,
    is_owner, totp_secret, deleted_at, ...)
  CREATE TABLE user_location_access (user_id → users, location_id → locations, ...)

004_create_token_families.ts
  CREATE TABLE token_families (id, user_id → users, current_version, revoked, ...)
  CREATE TABLE revoked_tokens (jti, revoked_at, expires_at)

005_create_contacts.ts
  CREATE TABLE contacts (id, location_id → locations, first_name, last_name, email,
    email_lower, phone, phone_normalized, company_name, tags TEXT[], custom_fields JSONB,
    assigned_to → users, facebook_psid, instagram_igsid, source, source_meta JSONB, deleted_at, ...)
  CREATE INDEX idx_contacts_phone ON contacts(location_id, phone_normalized) WHERE deleted_at IS NULL
  CREATE INDEX idx_contacts_email ON contacts(location_id, email_lower) WHERE deleted_at IS NULL
  CREATE INDEX idx_contacts_fb_psid ON contacts(location_id, facebook_psid) WHERE facebook_psid IS NOT NULL
  CREATE INDEX idx_contacts_ig_igsid ON contacts(location_id, instagram_igsid) WHERE instagram_igsid IS NOT NULL

006_create_entity_followers.ts
  CREATE TABLE entity_followers (id, entity_type, entity_id, location_id → locations, user_id → users, ...)

007_create_pipelines.ts
  CREATE TABLE pipelines (id, location_id → locations, name, ...)
  CREATE TABLE pipeline_stages (id, pipeline_id → pipelines, location_id, name, sort_order, ...)

008_create_opportunities.ts
  CREATE TABLE opportunities (id, location_id → locations, name, pipeline_id → pipelines,
    pipeline_stage_id → pipeline_stages, primary_contact_id → contacts,
    monetary_value, currency, monetary_value_usd, status, assigned_to → users,
    custom_fields JSONB, ai_score, ai_score_reason, ai_next_action, deleted_at, ...)
  CREATE TABLE opportunity_contacts (opportunity_id → opportunities, contact_id → contacts,
    location_id, role, is_primary, ...)
  CREATE TABLE opportunity_notes (id, opportunity_id → opportunities, location_id, user_id → users, body, ...)
  CREATE TABLE opportunity_tasks (id, opportunity_id → opportunities, contact_id → contacts,
    location_id, title, assigned_to → users, due_date, completed, ...)
  CREATE TABLE opportunity_stage_history (id, opportunity_id, location_id, from_stage_id,
    to_stage_id, changed_by, time_in_stage_ms, ...)

009_create_conversations.ts
  CREATE TABLE conversations (id, location_id → locations, contact_id → contacts,
    type (channel), status, assigned_to → users, last_message_at, last_message_body,
    unread_count, ai_mode, ...)
  CREATE INDEX idx_conversations_inbox ON conversations(location_id, last_message_at DESC NULLS LAST)
    INCLUDE (contact_id, type, unread_count, assigned_to) WHERE deleted_at IS NULL
  CREATE TABLE conversation_messages (id, conversation_id → conversations, contact_id → contacts,
    location_id, direction, channel, body, message_type, user_id, external_id,
    status, sent_at, ...)
  CREATE TABLE conversation_ai_drafts (id, conversation_id, location_id, body, status, model_used, confidence, ...)

010_create_workflows.ts
  CREATE TABLE workflows (id, location_id → locations, name, status, trigger_type,
    trigger_config JSONB, nodes JSONB, edges JSONB, ...)
  CREATE TABLE workflow_enrollments (id, workflow_id → workflows, contact_id → contacts,
    location_id, status, current_node_id, execution_id, ...)
  CREATE TABLE workflow_execution_log (execution_id UUID PRIMARY KEY, workflow_id, contact_id,
    node_id, executed_at, ...)
  CREATE TABLE workflow_condition_waiters (id, enrollment_id, node_id, condition,
    reference_id, true_branch, timeout_branch, bullmq_timeout_job_id, expires_at, ...)

011_create_calendars.ts
  CREATE TABLE calendars (id, location_id → locations, name, type, timezone,
    availability JSONB, settings JSONB, ...)
  CREATE TABLE appointments (id, calendar_id → calendars, location_id, contact_id → contacts,
    title, starts_at, ends_at, status, zoom_link, notes, ...)
  CREATE TABLE opportunity_appointments (opportunity_id → opportunities, appointment_id → appointments)

012_create_custom_fields.ts
  CREATE TABLE custom_field_folders (id, location_id → locations, name, is_collapsed, sort_order, ...)
  CREATE TABLE custom_field_definitions (id, location_id → locations, folder_id → folders,
    name, key, data_type, options JSONB, placeholder, required, sort_order, entity_type,
    file_allowed_types TEXT[], file_allow_multiple, file_max_size_mb, ...)

013_create_file_uploads.ts
  CREATE TABLE contact_file_uploads (id, location_id → locations, contact_id → contacts,
    field_key, object_key, original_name, mime_type, size_bytes,
    signed_url, signed_url_expires_at, uploaded_at, ...)

014_create_knowledge_base.ts
  CREATE EXTENSION IF NOT EXISTS vector
  CREATE TABLE knowledge_base_chunks (id, knowledge_base_id, location_id → locations,
    agent_id, content TEXT, embedding vector(1536), source_type,
    category, priority, metadata JSONB, ...)
  CREATE INDEX ON knowledge_base_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m=16, ef_construction=64)
  -- Always filter location_id BEFORE the vector distance operator in queries

015_create_ai_agents.ts
  CREATE TABLE ai_agents (id, location_id → locations, name, system_prompt, greeting,
    mode, channels TEXT[], calendar_id → calendars, human_handoff_triggers TEXT[],
    booking_intent_phrases TEXT[], out_of_hours_message, tone_profile JSONB,
    response_delay_ms, max_messages_per_conv, is_auto_built, created_by, ...)
  CREATE TABLE kb_intake_drafts (id, location_id → locations UNIQUE, section_data JSONB,
    completed_at, processed_at, total_words, ...)
  -- Add agent_id column to knowledge_base_chunks (references ai_agents)

016_create_documents.ts
  CREATE TABLE documents (id, location_id → locations, contact_id → contacts,
    opportunity_id → opportunities, title, type, status, body_json JSONB,
    merge_fields JSONB, sent_at, first_viewed_at, view_count, signed_at, expires_at, ...)
  CREATE TABLE document_audit_events (id, document_id → documents, event_type, metadata JSONB, ...)
  CREATE TABLE document_signatures (id, document_id → documents, signer_name, signer_email,
    ip_address, user_agent, signature_png_key, signed_at, document_hash, certificate_id, ...)

017_create_custom_objects.ts
  CREATE TABLE custom_object_definitions (id, location_id → locations, name, name_plural,
    icon, color, fields JSONB, ...)
  CREATE TABLE custom_object_records (id, location_id, object_id → custom_object_definitions,
    data JSONB, ...)
  CREATE TABLE custom_object_relationships (id, location_id, from_type, from_id,
    from_object_id, to_type, to_id, to_object_id, relationship_label, ...)

018_create_inbox_teams.ts
  CREATE TABLE inbox_teams (id, location_id → locations, name, channels TEXT[],
    tag_filters TEXT[], pipeline_ids UUID[], color, ...)
  CREATE TABLE inbox_team_members (team_id → inbox_teams, user_id → users, can_manage, ...)

019_create_exchange_rates.ts
  CREATE TABLE exchange_rates (base_currency, target_currency, rate, fetched_at,
    PRIMARY KEY(base_currency, target_currency))
  -- Add currency + monetary_value_usd columns to opportunities

020_create_social_posts.ts
  CREATE TABLE social_posts (id, location_id → locations, caption, media_urls TEXT[],
    platforms TEXT[], status, scheduled_at, published_at,
    facebook_post_id, instagram_post_id, error_message, created_by → users, ...)

021_create_subscriptions.ts
  CREATE TABLE subscription_plans (id, name, stripe_price_id, monthly_price,
    sms_credits_included, feature_gates JSONB, ...)
  CREATE TABLE location_subscriptions (id, location_id → locations UNIQUE,
    stripe_customer_id, stripe_subscription_id, plan_id → subscription_plans,
    status, trial_ends_at, current_period_end, sms_credits_remaining, ...)
  CREATE TABLE sms_credit_ledger (id, location_id → locations, delta, reason, balance, ...)

022_create_location_channel_configs.ts
  CREATE TABLE location_channel_configs (id, location_id → locations UNIQUE,
    channel, config JSONB,  -- encrypted tokens stored here
    ...)

023_create_rls_policies.ts
  -- PostgreSQL RLS policies on all location-scoped tables
  -- CREATE POLICY ... USING (location_id = current_setting('app.current_location_id')::UUID ...)
  -- This migration runs LAST — all tables must exist first
```

**TypeORM migration commands:**
```bash
# Generate a new migration after schema change:
pnpm --filter=api migration:generate -- src/database/migrations/YourMigrationName

# Run all pending migrations:
pnpm --filter=api migration:run

# Revert the last migration:
pnpm --filter=api migration:revert

# Show migration status:
pnpm --filter=api migration:show
```

---

## Gap C — Complete Environment Variables Reference (`.env.example`)

> Copy this file to `apps/api/.env` and `apps/web/.env.local` as applicable. All secrets marked 🔑 must be set before the server starts.

### `apps/api/.env`

```bash
# ─── Node ─────────────────────────────────────────────────────────────────────
NODE_ENV=development           # development | production | test
PORT=3001

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://smeconnect:password@localhost:5432/smeconnect
# With PgBouncer (transaction mode — required for RLS):
# DATABASE_URL=postgresql://smeconnect:password@localhost:6432/smeconnect?pgbouncer=true

PGBOUNCER_ENABLED=true         # set false in dev if running without PgBouncer

# ─── Redis / BullMQ ───────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
BULLBOARD_USERNAME=admin       # BullMQ dashboard basic auth
BULLBOARD_PASSWORD=changeme    # 🔑

# ─── Auth / JWT ───────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=             # 🔑 min 64 random chars — openssl rand -hex 64
JWT_REFRESH_SECRET=            # 🔑 min 64 random chars — different from access
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# ─── Encryption ───────────────────────────────────────────────────────────────
CREDENTIAL_ENCRYPTION_KEY=     # 🔑 exactly 32 random bytes, hex-encoded (64 chars)
                                # used for AES-256-GCM encryption of Twilio/Meta tokens
                                # openssl rand -hex 32

# ─── Anthropic (Claude) ───────────────────────────────────────────────────────
ANTHROPIC_API_KEY=             # 🔑 sk-ant-...

# ─── OpenAI (GPT + Realtime + Embeddings) ─────────────────────────────────────
OPENAI_API_KEY=                # 🔑 sk-...

# ─── Twilio (SMS / Voice / WhatsApp) ──────────────────────────────────────────
TWILIO_ACCOUNT_SID=            # AC...
TWILIO_AUTH_TOKEN=             # 🔑
TWILIO_WEBHOOK_BASE_URL=       # https://api.yourdomain.com  — public URL Twilio calls back to

# ─── SendGrid (Email) ─────────────────────────────────────────────────────────
SENDGRID_API_KEY=              # 🔑 SG....
SENDGRID_INBOUND_PARSE_DOMAIN= # inbound.yourdomain.com — MX record must point to SendGrid

# ─── Meta (Facebook / Instagram) ──────────────────────────────────────────────
META_APP_ID=
META_APP_SECRET=               # 🔑 — used for HMAC-SHA256 webhook signature validation
META_WEBHOOK_VERIFY_TOKEN=     # 🔑 random string you set in Meta App Dashboard

# ─── MinIO (File Storage) ─────────────────────────────────────────────────────
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false            # true in production
MINIO_ACCESS_KEY=              # 🔑
MINIO_SECRET_KEY=              # 🔑
MINIO_BUCKET_DOCUMENTS=documents   # private bucket for contact files + signatures

# ─── Stripe (Billing) ─────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=             # 🔑 sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=         # 🔑 whsec_... — from Stripe Dashboard > Webhooks
STRIPE_CONNECT_CLIENT_ID=      # ca_... — for Stripe Connect OAuth flow

# ─── App URLs ─────────────────────────────────────────────────────────────────
APP_BASE_URL=https://app.smeconnect.co.za       # public URL of the web app
API_BASE_URL=https://api.smeconnect.co.za       # public URL of the NestJS API
WIDGET_CDN_URL=https://cdn.smeconnect.co.za     # CDN for web chat widget bundle

# ─── Exchange Rates (Multi-currency) ──────────────────────────────────────────
OPEN_EXCHANGE_RATES_APP_ID=    # free tier at openexchangerates.org
FX_REFRESH_INTERVAL_HOURS=4

# ─── Feature Flags ────────────────────────────────────────────────────────────
VOICE_AI_ENABLED=true          # master switch — disable in dev to avoid OpenAI Realtime costs
SOCIAL_PLANNER_ENABLED=true
CAPI_ENABLED=true              # Meta Conversions API

# ─── Logging ──────────────────────────────────────────────────────────────────
LOG_LEVEL=info                 # debug | info | warn | error
SENTRY_DSN=                    # optional — Sentry error tracking
```

### `apps/web/.env.local`

```bash
# ─── API ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001      # internal API — not exposed to browser
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001   # Socket.io server

# ─── Public keys (SAFE to expose to browser) ──────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_META_PIXEL_ID=                     # optional — if using browser pixel

# ─── Widget CDN (for embedding on client sites) ───────────────────────────────
NEXT_PUBLIC_WIDGET_URL=http://localhost:5173   # dev — Vite widget dev server

# ─── Feature flags mirrored to client ─────────────────────────────────────────
NEXT_PUBLIC_VOICE_AI_ENABLED=true
NEXT_PUBLIC_SOCIAL_PLANNER_ENABLED=true
```

### `packages/widget/.env`

```bash
# ─── Widget (web chat embed — Vite build) ─────────────────────────────────────
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### Docker / Infrastructure Secrets (set in docker-compose or CI/CD secrets)

```bash
POSTGRES_DB=smeconnect
POSTGRES_USER=smeconnect
POSTGRES_PASSWORD=             # 🔑 — also used in DATABASE_URL above
POSTGRES_PORT=5432

PGBOUNCER_POOL_MODE=transaction
PGBOUNCER_MAX_CLIENT_CONN=200
PGBOUNCER_DEFAULT_POOL_SIZE=20

REDIS_PASSWORD=                # 🔑 optional — set in redis.conf and REDIS_URL

MINIO_ROOT_USER=               # same as MINIO_ACCESS_KEY above
MINIO_ROOT_PASSWORD=           # same as MINIO_SECRET_KEY above
```

### Secret Generation Commands

```bash
# JWT secrets (run twice for access + refresh):
openssl rand -hex 64

# Encryption key (must be exactly 64 hex chars = 32 bytes):
openssl rand -hex 32

# Meta webhook verify token:
openssl rand -base64 32

# Postgres password:
openssl rand -base64 24
```

> **Security note:** Never commit `.env` files. Add `**/.env`, `**/.env.local`, `**/.env.*.local` to `.gitignore`. In production, inject secrets via your CI/CD platform (Railway, Render, Kubernetes Secrets, or Doppler).
