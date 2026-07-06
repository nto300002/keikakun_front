const SENSITIVE_KEY_PATTERN = /(token|secret|password|cookie|authorization|email|name|phone|address|birth|disability|endpoint|auth|p256dh)/i;

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? '<redacted>' : sanitizeValue(item),
      ]),
    );
  }

  if (typeof value === 'string') {
    if (value.includes('@')) return '<redacted>';
    if (/https?:\/\//i.test(value)) return '<redacted>';
  }

  return value;
}

export function sanitizeE2EApiBody(bodyText: string, maxLength = 500): string {
  if (!bodyText) return '';

  try {
    return JSON.stringify(sanitizeValue(JSON.parse(bodyText))).slice(0, maxLength);
  } catch {
    return '<body omitted>';
  }
}

export function sanitizeE2EErrorMessage(bodyText: string): string {
  return sanitizeE2EApiBody(bodyText, 1000);
}
