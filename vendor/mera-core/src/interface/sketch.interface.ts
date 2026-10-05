import type { ApplianceKind, Mm, SketchElementType } from '../types'
import type { ElementSpec } from './element-spec.interface'

/**
 * The vision read of a kitchen elevation, and the maker drafts it maps to.
 *
 * A photo/sketch is read (outside core — that is I/O) into a `SketchExtraction`.
 * `sketchToElements` (src/sketch-to-elements.ts) then turns that loose read into
 * draft `ElementSpec`s the maker confirms and the cut engine costs. Everything
 * here is pure data — the vision call itself lives in the app layer.
 */

/** One unit read from the elevation, left to right within its row. */
export interface SketchElement {
  type: SketchElementType
  /** Approximate width in mm if it can be inferred; else null. */
  widthMm: number | null
  /**
   * Whether a handle/pull is drawn: true if clearly visible, false if the front
   * is clearly handleless, null when it cannot be told.
   */
  hasHandle: boolean | null
}

/** The structured layout a vision model extracts from an uploaded photo/sketch. */
export interface SketchExtraction {
  /** Total wall width in mm if written on / inferable from the drawing. */
  wallWidthMm: number | null
  /** Base run, left to right. */
  base: SketchElement[]
  /** Wall run, left to right (empty if none drawn). */
  wall: SketchElement[]
}

/** One draft element produced from a sketch unit, for the maker to confirm. */
export interface SketchElementDraft {
  /** The maker element, pre-filled with sensible defaults — fully editable. */
  spec: ElementSpec
  /** Which run it came from, so the UI can group base vs. wall. */
  run: 'base' | 'wall'
  /** The appliance symbol read, if any (informational for the UI). */
  appliance?: ApplianceKind
}

/** A unit the workshop does not build (fridge, washer) — noted, never cut. */
export interface SketchSkip {
  appliance: ApplianceKind
  label: string
}

/** Overrides for the defaults `sketchToElements` fills a draft with. */
export interface SketchToElementsOptions {
  /** Base-run carcass height (default: STANDARD_HEIGHTS.baseCarcass). */
  baseHeight?: Mm
  /** Base-run carcass depth (default: STANDARD_HEIGHTS.baseDepth). */
  baseDepth?: Mm
  /** Wall-run carcass height (default: STANDARD_HEIGHTS.wallCarcass). */
  wallHeight?: Mm
  /** Wall-run carcass depth (default: STANDARD_HEIGHTS.wallDepth). */
  wallDepth?: Mm
  /** Width to assume when the read gives none (default: 600). */
  defaultWidth?: Mm
  /** Width at/above which a cabinet gets two doors (default: 900). */
  doubleDoorFromWidth?: Mm
}

/** What `sketchToElements` returns: drafts to confirm, plus what it skipped. */
export interface SketchToElementsResult {
  /** One draft per built unit, preserving the sketch's order (base then wall). */
  drafts: SketchElementDraft[]
  /** Free-standing appliances left out (fridge, washer). */
  skipped: SketchSkip[]
  /** The wall width read, if plausible (informational). */
  wallWidthMm: number | null
}
