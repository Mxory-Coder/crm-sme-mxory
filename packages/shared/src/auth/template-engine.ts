// ─── Merge tag renderer: {{contact.first_name}}, {{contact.budget}}, etc. ─────

export interface TemplateVars {
  [key: string]: string;
}

export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key: string) => {
    const trimmed = key.trim();
    return vars[trimmed] !== undefined ? vars[trimmed] : match;
  });
}

export function buildContactVarMap(
  contact: Record<string, unknown>,
  location: Record<string, unknown>,
): TemplateVars {
  const customFields = (contact.customFields as Record<string, unknown>) ?? {};
  const vars: TemplateVars = {
    'contact.first_name': String(contact.firstName ?? ''),
    'contact.last_name': String(contact.lastName ?? ''),
    'contact.full_name':
      `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim(),
    'contact.email': String(contact.email ?? ''),
    'contact.phone': String(contact.phone ?? ''),
    'contact.company': String(contact.companyName ?? ''),
    'location.name': String(location.name ?? ''),
    'location.phone': String(location.phone ?? ''),
    'location.website': String(location.website ?? ''),
    'date.today': new Date().toLocaleDateString('en-ZA'),
  };

  // Expose all custom JSONB fields as {{contact.<key>}}
  for (const [k, v] of Object.entries(customFields)) {
    vars[`contact.${k}`] = String(v ?? '');
  }

  return vars;
}
