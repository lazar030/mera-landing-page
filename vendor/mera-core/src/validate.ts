/**
 * The "stick or error" engine — product spec §6.3.
 *
 * Pure, deterministic, dependency-free. This exact function runs twice:
 *   - in the browser, on every change, for instant feedback
 *   - on the server, at submit, as the ONLY authority
 *
 * If those two ever disagree, we have a bug, not a policy.
 */

import type { Mm } from './types'
import type { Catalog, Configuration, ConfiguredElement, ConfiguredRow, SpaceSpec } from './interface'
import { MAX_TOTAL_HEIGHT_MM } from './constants'
import { indexCatalog, panelWidthLimit, type CatalogIndex } from './catalog'
import { issue, toResult, type ValidationIssue, type ValidationResult, type ValidationSeverity } from './errors'

/**
 * Product spec §9 open question 3 is unresolved: are the "soft" rules hard
 * errors or overridable warnings? Rather than guess, we make it configurable
 * and default to the strict reading. Flipping a value here is a one-line
 * change once the pilot company answers.
 */
export interface Strictness {
  rowHeightMismatch: ValidationSeverity
  applianceWidth: ValidationSeverity
  transportLimit: ValidationSeverity
  optionUnavailable: ValidationSeverity
}

export const DEFAULT_STRICTNESS: Strictness = {
  rowHeightMismatch: 'error',
  applianceWidth: 'error',
  transportLimit: 'error',
  optionUnavailable: 'warning',
}

export interface ValidateOptions {
  strictness?: Partial<Strictness>
}

export function validate(
  config: Configuration,
  catalog: Catalog,
  options: ValidateOptions = {},
): ValidationResult {
  const strict: Strictness = { ...DEFAULT_STRICTNESS, ...options.strictness }
  const index = indexCatalog(catalog)
  const issues: ValidationIssue[] = []

  // --- The space itself must make sense ------------------------------------
  const { space } = config
  if (!isPositive(space.width) || !isPositive(space.height) || !isPositive(space.depth)) {
    issues.push(
      issue('SPACE_INVALID', 'Space width, height and depth must all be positive.', {
        params: { width: space.width, height: space.height, depth: space.depth },
      }),
    )
    // Nothing downstream is meaningful without a valid space.
    return toResult(issues)
  }

  if (config.rows.length === 0 || config.rows.every((r) => r.elements.length === 0)) {
    issues.push(issue('EMPTY_CONFIGURATION', 'The configuration contains no elements.'))
    return toResult(issues)
  }

  const envelopeHeight = Math.min(space.height, MAX_TOTAL_HEIGHT_MM)

  for (const row of config.rows) {
    validateRow(row, config, index, strict, envelopeHeight, issues)
  }

  // --- Rule 4: total height cap --------------------------------------------
  const totalHeight = config.rows.reduce(
    (max, row) => Math.max(max, row.yOffset + rowHeight(row)),
    0,
  )
  if (totalHeight > MAX_TOTAL_HEIGHT_MM) {
    issues.push(
      issue('TOTAL_HEIGHT_EXCEEDED', `Total height ${totalHeight}mm exceeds the ${MAX_TOTAL_HEIGHT_MM}mm cap.`, {
        params: { totalHeight, max: MAX_TOTAL_HEIGHT_MM },
      }),
    )
  }
  if (totalHeight > space.height) {
    issues.push(
      issue('TOTAL_HEIGHT_EXCEEDED', `Total height ${totalHeight}mm exceeds the available ${space.height}mm.`, {
        params: { totalHeight, max: space.height },
      }),
    )
  }

  // --- Rule 3 (vertical half): rows must not overlap each other ------------
  const ordered = [...config.rows].sort((a, b) => a.yOffset - b.yOffset)
  for (let i = 1; i < ordered.length; i++) {
    const below = ordered[i - 1]!
    const above = ordered[i]!
    const belowTop = below.yOffset + rowHeight(below)
    if (above.yOffset < belowTop) {
      issues.push(
        issue('ROWS_OVERLAP', `Row "${above.id}" starts at ${above.yOffset}mm but row "${below.id}" ends at ${belowTop}mm.`, {
          rowId: above.id,
          params: { top: belowTop, start: above.yOffset },
        }),
      )
    }
  }

  return toResult(issues)
}

function validateRow(
  row: ConfiguredRow,
  config: Configuration,
  index: CatalogIndex,
  strict: Strictness,
  envelopeHeight: Mm,
  issues: ValidationIssue[],
): void {
  const { space } = config
  let sumWidth = 0

  for (const element of row.elements) {
    // --- Reserved openings ------------------------------------------------
    // An empty slot for something the workshop does not build. It still counts
    // toward exact-fill and must fit the room, but it has no def, bounds,
    // panel/transport limit, appliance rule or options to check.
    if (element.reserved) {
      const missing = (['width', 'height', 'depth'] as const).filter((k) => !isPositive(element[k]))
      if (missing.length > 0) {
        issues.push(
          issue('MISSING_DIMENSION', `Opening "${element.id}" is missing: ${missing.join(', ')}.`, {
            rowId: row.id,
            elementId: element.id,
            params: { missing: missing.join(',') },
          }),
        )
        continue
      }
      sumWidth += element.width
      reservedEnvelopeChecks(element, space, envelopeHeight, row.id, issues)
      continue
    }

    const def = index.elementDef(element.elementDefId)
    if (!def) {
      issues.push(
        issue('UNKNOWN_ELEMENT_DEF', `Element "${element.id}" references unknown definition "${element.elementDefId}".`, {
          rowId: row.id,
          elementId: element.id,
        }),
      )
      continue
    }

    // --- Rule 1: fully dimensioned ---------------------------------------
    const missing = (['width', 'height', 'depth'] as const).filter((k) => !isPositive(element[k]))
    if (missing.length > 0) {
      issues.push(
        issue('MISSING_DIMENSION', `Element "${element.id}" is missing: ${missing.join(', ')}.`, {
          rowId: row.id,
          elementId: element.id,
          params: { missing: missing.join(',') },
        }),
      )
      continue // every check below needs real numbers
    }

    sumWidth += element.width

    // --- Bounds from the catalog definition ------------------------------
    const below: Array<[string, number, number]> = [
      ['width', element.width, def.minWidth],
      ['height', element.height, def.minHeight],
      ['depth', element.depth, def.minDepth],
    ]
    for (const [axis, value, min] of below) {
      if (value < min) {
        issues.push(
          issue('ELEMENT_BELOW_MIN', `Element "${element.id}" ${axis} ${value}mm is below the minimum ${min}mm.`, {
            rowId: row.id,
            elementId: element.id,
            params: { axis, value, min },
          }),
        )
      }
    }
    const above: Array<[string, number, number]> = [
      ['width', element.width, def.maxWidth],
      ['height', element.height, def.maxHeight],
      ['depth', element.depth, def.maxDepth],
    ]
    for (const [axis, value, max] of above) {
      if (value > max) {
        issues.push(
          issue('ELEMENT_ABOVE_MAX', `Element "${element.id}" ${axis} ${value}mm exceeds the maximum ${max}mm.`, {
            rowId: row.id,
            elementId: element.id,
            params: { axis, value, max },
          }),
        )
      }
    }

    // --- Rule 5, primary cap: the overall furniture envelope --------------
    if (element.width > space.width) {
      issues.push(
        issue('ELEMENT_EXCEEDS_ENVELOPE', `Element "${element.id}" is wider (${element.width}mm) than the wall (${space.width}mm).`, {
          rowId: row.id,
          elementId: element.id,
          params: { axis: 'width', value: element.width, max: space.width },
        }),
      )
    }
    if (element.height > envelopeHeight) {
      issues.push(
        issue('ELEMENT_EXCEEDS_ENVELOPE', `Element "${element.id}" is taller (${element.height}mm) than the envelope (${envelopeHeight}mm).`, {
          rowId: row.id,
          elementId: element.id,
          params: { axis: 'height', value: element.height, max: envelopeHeight },
        }),
      )
    }
    if (element.depth > space.depth) {
      issues.push(
        issue('ELEMENT_EXCEEDS_ENVELOPE', `Element "${element.id}" is deeper (${element.depth}mm) than the space (${space.depth}mm).`, {
          rowId: row.id,
          elementId: element.id,
          params: { axis: 'depth', value: element.depth, max: space.depth },
        }),
      )
    }

    // --- Rule 5, secondary cap: transport / board size --------------------
    // A 4m-tall unit fits the envelope and still cannot leave the workshop.
    const panelLimit = panelWidthLimit(def, index)
    if (element.width > panelLimit) {
      issues.push(
        issue('PANEL_EXCEEDS_TRANSPORT_LIMIT', `Element "${element.id}" (${element.width}mm) exceeds the ${panelLimit}mm single-panel limit — split it into two units.`, {
          severity: strict.transportLimit,
          rowId: row.id,
          elementId: element.id,
          params: { value: element.width, max: panelLimit },
        }),
      )
    }

    // --- Rule 7: appliance slots lock to real appliance sizes -------------
    if (def.applianceSlot && !def.applianceSlot.allowedWidths.includes(element.width)) {
      issues.push(
        issue('APPLIANCE_WIDTH_INVALID', `Element "${element.id}" is a ${def.applianceSlot.kind} slot; ${element.width}mm is not one of ${def.applianceSlot.allowedWidths.join('/')}mm.`, {
          severity: strict.applianceWidth,
          rowId: row.id,
          elementId: element.id,
          params: { kind: def.applianceSlot.kind, value: element.width, allowed: def.applianceSlot.allowedWidths.join('/') },
        }),
      )
    }

    // --- Required options must be chosen, and must be available ----------
    for (const groupId of def.optionGroupIds) {
      const group = index.optionGroup(groupId)
      if (!group) continue
      const chosenId = element.options[group.key]
      if (!chosenId) {
        if (group.required) {
          issues.push(
            issue('OPTION_REQUIRED', `Element "${element.id}" is missing a choice for "${group.key}".`, {
              rowId: row.id,
              elementId: element.id,
              params: { option: group.key },
            }),
          )
        }
        continue
      }
      const value = group.values.find((v) => v.id === chosenId)
      if (!value || !value.available) {
        issues.push(
          issue('OPTION_UNAVAILABLE', `Element "${element.id}" selects an unavailable "${group.key}" option.`, {
            severity: strict.optionUnavailable,
            rowId: row.id,
            elementId: element.id,
            params: { option: group.key },
          }),
        )
      }
    }
  }

  // --- Rule 6: everything in a row shares one height --------------------
  const heights = new Set(row.elements.map((e) => e.height).filter(isPositive))
  if (heights.size > 1) {
    issues.push(
      issue('ROW_HEIGHT_MISMATCH', `Row "${row.id}" mixes heights: ${[...heights].join(', ')}mm.`, {
        severity: strict.rowHeightMismatch,
        rowId: row.id,
        params: { heights: [...heights].join(',') },
      }),
    )
  }

  // --- Rules 2 & 3: exact fill, no gap, no overflow ---------------------
  if (sumWidth > space.width) {
    issues.push(
      issue('ROW_OVERFILL', `Row "${row.id}" is ${sumWidth - space.width}mm wider than the wall.`, {
        rowId: row.id,
        params: { overflow: sumWidth - space.width, sum: sumWidth, wall: space.width },
      }),
    )
  } else if (row.spanFullWidth && sumWidth < space.width) {
    issues.push(
      issue('ROW_UNDERFILL', `Row "${row.id}" leaves a ${space.width - sumWidth}mm gap.`, {
        rowId: row.id,
        params: { shortfall: space.width - sumWidth, sum: sumWidth, wall: space.width },
      }),
    )
  }
}

function rowHeight(row: ConfiguredRow): Mm {
  return row.elements.reduce((max, e) => Math.max(max, e.height > 0 ? e.height : 0), 0)
}

/**
 * A reserved opening must still physically fit the room — Rule 5's envelope cap
 * (spec §6.3) applies to a hole in the run exactly as it does to a cabinet.
 */
function reservedEnvelopeChecks(
  element: ConfiguredElement,
  space: SpaceSpec,
  envelopeHeight: Mm,
  rowId: string,
  issues: ValidationIssue[],
): void {
  const checks: Array<[string, Mm, Mm]> = [
    ['width', element.width, space.width],
    ['height', element.height, envelopeHeight],
    ['depth', element.depth, space.depth],
  ]
  for (const [axis, value, max] of checks) {
    if (value > max) {
      issues.push(
        issue('ELEMENT_EXCEEDS_ENVELOPE', `Opening "${element.id}" ${axis} ${value}mm exceeds the available ${max}mm.`, {
          rowId,
          elementId: element.id,
          params: { axis, value, max },
        }),
      )
    }
  }
}

function isPositive(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0
}
