/** Replaces `{key}` placeholders in a copy string. */
export function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match))
}

/** Formats a number for display in the given locale with a fixed number of decimals. */
export function formatNumber(value: number, locale: string, decimals = 0): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}
