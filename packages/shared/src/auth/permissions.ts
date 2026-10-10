import { FeaturePermissions, UserType } from '../types/entities';

// ─── Bit position for each permission (0–49) ─────────────────────────────────
export const SCOPE_BITS: Record<keyof FeaturePermissions, number> = {
  users_invite: 0,
  users_delete: 1,
  users_edit_permissions: 2,
  contacts_view: 3,
  contacts_create: 4,
  contacts_edit: 5,
  contacts_delete: 6,
  contacts_export: 7,
  contacts_import: 8,
  contacts_merge: 9,
  custom_fields_create: 10,
  custom_fields_edit: 11,
  custom_fields_delete: 12,
  conversations_view: 13,
  conversations_send: 14,
  conversations_delete: 15,
  conversations_assign: 16,
  pipelines_view: 17,
  pipelines_create: 18,
  pipelines_edit: 19,
  pipelines_delete: 20,
  opportunities_create: 21,
  opportunities_edit: 22,
  opportunities_delete: 23,
  opportunities_value_edit: 24,
  workflows_view: 25,
  workflows_create: 26,
  workflows_edit: 27,
  workflows_publish: 28,
  workflows_delete: 29,
  forms_view: 30,
  forms_create: 31,
  forms_edit: 32,
  forms_delete: 33,
  funnels_view: 34,
  funnels_create: 35,
  funnels_edit: 36,
  funnels_delete: 37,
  calendars_view: 38,
  calendars_manage: 39,
  reports_view: 40,
  reports_export: 41,
  billing_view: 42,
  billing_manage: 43,
  sub_accounts_create: 44,
  sub_accounts_delete: 45,
  snapshots_deploy: 46,
  location_settings_edit: 47,
  integrations_manage: 48,
  phone_numbers_manage: 49,
  // bit 50 — stored in mask2 bit 0
  email_config_manage: 50,
};

// ─── Default permissions per user type ───────────────────────────────────────
const ALL_ON = Object.fromEntries(
  Object.keys(SCOPE_BITS).map((k) => [k, true]),
) as unknown as FeaturePermissions;

const ALL_OFF = Object.fromEntries(
  Object.keys(SCOPE_BITS).map((k) => [k, false]),
) as unknown as FeaturePermissions;

export const DEFAULT_PERMISSIONS: Record<UserType, FeaturePermissions> = {
  AGENCY_OWNER: { ...ALL_ON },
  AGENCY_ADMIN: {
    ...ALL_ON,
    sub_accounts_delete: false,
  },
  AGENCY_USER: {
    ...ALL_ON,
    users_delete: false,
    users_edit_permissions: false,
    custom_fields_delete: false,
    workflows_edit: false,
    workflows_publish: false,
    workflows_delete: false,
    opportunities_value_edit: false,
    billing_view: false,
    billing_manage: false,
    sub_accounts_create: false,
    sub_accounts_delete: false,
    snapshots_deploy: false,
    location_settings_edit: false,
    integrations_manage: false,
  },
  LOCATION_ADMIN: {
    ...ALL_ON,
    billing_view: false,
    billing_manage: false,
    sub_accounts_create: false,
    sub_accounts_delete: false,
    snapshots_deploy: false,
  },
  LOCATION_USER: {
    ...ALL_OFF,
    contacts_view: true,
    contacts_create: true,
    contacts_edit: true,
    conversations_view: true,
    conversations_send: true,
    pipelines_view: true,
    opportunities_create: true,
    opportunities_edit: true,
    calendars_view: true,
    reports_view: true,
  },
};

// ─── Encode permissions into two BigInt bitmasks ──────────────────────────────
export function encodePermissions(perms: FeaturePermissions): {
  mask1: bigint;
  mask2: bigint;
} {
  let mask1 = 0n;
  let mask2 = 0n;
  for (const [key, bit] of Object.entries(SCOPE_BITS)) {
    if (perms[key as keyof FeaturePermissions]) {
      if (bit < 64) {
        mask1 |= 1n << BigInt(bit);
      } else {
        mask2 |= 1n << BigInt(bit - 64);
      }
    }
  }
  return { mask1, mask2 };
}

// ─── JWT payload shape ────────────────────────────────────────────────────────
export interface AccessTokenPayload {
  sub: string; // userId
  jti: string; // unique token ID (for revocation)
  agencyId: string;
  locationId: string | null;
  userType: UserType;
  systemRole: 'ADMIN' | 'USER';
  isOwner: boolean;
  onlyAssignedData: boolean;
  scopeMask1: string; // BigInt as decimal string (bits 0–63)
  scopeMask2: string; // BigInt as decimal string (bits 64–127)
  tokenFamily: string;
  familyVersion: number;
  exp: number;
  iat: number;
}

// ─── Fast permission check from JWT payload (no DB hit) ───────────────────────
export function hasPermission(
  token: AccessTokenPayload,
  perm: keyof FeaturePermissions,
): boolean {
  if (token.isOwner) return true;
  const bit = SCOPE_BITS[perm];
  const mask = bit < 64 ? BigInt(token.scopeMask1) : BigInt(token.scopeMask2);
  const pos = bit < 64 ? bit : bit - 64;
  return (mask & (1n << BigInt(pos))) !== 0n;
}

// ─── Merge role defaults with JSONB overrides ────────────────────────────────
export function getEffectivePermissions(
  userType: UserType,
  overrides: Partial<FeaturePermissions>,
): FeaturePermissions {
  return { ...DEFAULT_PERMISSIONS[userType], ...overrides };
}
