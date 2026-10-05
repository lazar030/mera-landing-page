/**
 * The validation error contract.
 *
 * The UI must be able to highlight the offending element and explain the
 * problem WITHOUT knowing any of the rules. So every issue carries:
 *   - a stable machine `code` (never shown to a human, safe to switch on)
 *   - the `elementId` / `rowId` it targets, so the renderer can highlight it
 *   - a `messageKey` for i18n (Serbian first) plus `params` for interpolation
 *   - a developer-facing English `message` — never render this to a customer
 */

export type ValidationSeverity = 'error' | 'warning'

export type ValidationCode =
  | 'EMPTY_CONFIGURATION'
  | 'UNKNOWN_ELEMENT_DEF'
  | 'MISSING_DIMENSION'
  | 'ELEMENT_BELOW_MIN'
  | 'ELEMENT_ABOVE_MAX'
  | 'ELEMENT_EXCEEDS_ENVELOPE'
  | 'PANEL_EXCEEDS_TRANSPORT_LIMIT'
  | 'ROW_UNDERFILL'
  | 'ROW_OVERFILL'
  | 'FILL_NO_CANDIDATES'
  | 'FILL_REMAINDER_UNABSORBABLE'
  | 'ROW_HEIGHT_MISMATCH'
  | 'ROWS_OVERLAP'
  | 'TOTAL_HEIGHT_EXCEEDED'
  | 'SPACE_INVALID'
  | 'APPLIANCE_WIDTH_INVALID'
  | 'OPTION_REQUIRED'
  | 'OPTION_UNAVAILABLE'

export interface ValidationIssue {
  code: ValidationCode
  severity: ValidationSeverity
  /** i18n key, e.g. 'validation.rowUnderfill' */
  messageKey: string
  /** Developer-facing English. Do not show this to customers. */
  message: string
  rowId?: string
  elementId?: string
  /** Values for message interpolation, e.g. { shortfall: 40 } */
  params?: Record<string, string | number>
}

export interface ValidationResult {
  /** True only when there are zero issues of severity 'error'. */
  valid: boolean
  issues: ValidationIssue[]
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

export function issue(
  code: ValidationCode,
  message: string,
  extra: Partial<Omit<ValidationIssue, 'code' | 'message'>> = {},
): ValidationIssue {
  return {
    code,
    message,
    severity: extra.severity ?? 'error',
    messageKey: extra.messageKey ?? `validation.${toCamel(code)}`,
    ...(extra.rowId !== undefined ? { rowId: extra.rowId } : {}),
    ...(extra.elementId !== undefined ? { elementId: extra.elementId } : {}),
    ...(extra.params !== undefined ? { params: extra.params } : {}),
  }
}

export function toResult(issues: ValidationIssue[]): ValidationResult {
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  return { valid: errors.length === 0, issues, errors, warnings }
}

function toCamel(code: string): string {
  return code
    .toLowerCase()
    .split('_')
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('')
}
