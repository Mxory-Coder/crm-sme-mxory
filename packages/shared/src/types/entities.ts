// ─── Core entity types shared across API and Web ──────────────────────────────

export type UserType =
  | 'AGENCY_OWNER'
  | 'AGENCY_ADMIN'
  | 'AGENCY_USER'
  | 'LOCATION_ADMIN'
  | 'LOCATION_USER';

export type SystemRole = 'ADMIN' | 'USER';

export type ChannelType =
  | 'SMS'
  | 'MMS'
  | 'EMAIL'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'WHATSAPP'
  | 'WEBCHAT';

export type MessageDirection = 'inbound' | 'outbound' | 'internal';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'PENDING';

export type ConversationStatus = 'open' | 'closed';

export type OpportunityStatus = 'open' | 'won' | 'lost' | 'abandoned';

export type AgentMode = 'OFF' | 'SUGGESTIVE' | 'AUTOPILOT';

export type WorkflowStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type CustomFieldDataType =
  | 'TEXT'
  | 'LARGE_TEXT'
  | 'NUMBER'
  | 'MONETARY'
  | 'DATE'
  | 'DATETIME'
  | 'DROPDOWN'
  | 'CHECKBOX'
  | 'MULTISELECT'
  | 'RADIO'
  | 'FILE'
  | 'SIGNATURE'
  | 'PHONE';

export type EntityType = 'contact' | 'opportunity' | 'company';

// ─── Feature Permissions (50 toggles) ────────────────────────────────────────

export interface FeaturePermissions {
  // Users & Staff
  users_invite: boolean;
  users_delete: boolean;
  users_edit_permissions: boolean;
  // Contacts
  contacts_view: boolean;
  contacts_create: boolean;
  contacts_edit: boolean;
  contacts_delete: boolean;
  contacts_export: boolean;
  contacts_import: boolean;
  contacts_merge: boolean;
  // Custom Fields
  custom_fields_create: boolean;
  custom_fields_edit: boolean;
  custom_fields_delete: boolean;
  // Conversations
  conversations_view: boolean;
  conversations_send: boolean;
  conversations_delete: boolean;
  conversations_assign: boolean;
  // Pipelines & Opportunities
  pipelines_view: boolean;
  pipelines_create: boolean;
  pipelines_edit: boolean;
  pipelines_delete: boolean;
  opportunities_create: boolean;
  opportunities_edit: boolean;
  opportunities_delete: boolean;
  opportunities_value_edit: boolean;
  // Workflows
  workflows_view: boolean;
  workflows_create: boolean;
  workflows_edit: boolean;
  workflows_publish: boolean;
  workflows_delete: boolean;
  // Forms & Funnels
  forms_view: boolean;
  forms_create: boolean;
  forms_edit: boolean;
  forms_delete: boolean;
  funnels_view: boolean;
  funnels_create: boolean;
  funnels_edit: boolean;
  funnels_delete: boolean;
  // Calendars
  calendars_view: boolean;
  calendars_manage: boolean;
  // Reports
  reports_view: boolean;
  reports_export: boolean;
  // Billing / Agency
  billing_view: boolean;
  billing_manage: boolean;
  sub_accounts_create: boolean;
  sub_accounts_delete: boolean;
  snapshots_deploy: boolean;
  // Settings
  location_settings_edit: boolean;
  integrations_manage: boolean;
  phone_numbers_manage: boolean;
  email_config_manage: boolean;
}
