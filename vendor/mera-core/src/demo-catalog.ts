import type { Catalog, ElementDef } from './interface'
import {
  APPLIANCE_WIDTHS_MM,
  DEFAULT_MAX_PANEL_HEIGHT_MM,
  DEFAULT_MAX_PANEL_WIDTH_MM,
  STANDARD_HEIGHTS,
} from './constants'

/**
 * An in-memory catalog so `pnpm dev` shows a working configurator before
 * Supabase exists. Mirrors packages/db/schema/003_seed_pilot.sql — when you
 * point the app at a real database this is never loaded.
 */

const TENANT = 'demo-tenant'
const KITCHEN = 'demo-kitchen'

function def(over: Partial<ElementDef> & { id: string; name: string }): ElementDef {
  return {
    tenantId: TENANT,
    furnitureTypeId: KITCHEN,
    category: 'base',
    standardWidths: [300, 400, 450, 500, 600, 800, 900, 1000, 1200],
    minWidth: 200,
    maxWidth: 1200,
    minHeight: 400,
    maxHeight: 900,
    minDepth: 250,
    maxDepth: 700,
    defaultHeight: STANDARD_HEIGHTS.baseCarcass,
    defaultDepth: STANDARD_HEIGHTS.baseDepth,
    allowCustomWidth: true,
    customWidthStep: 10,
    customWidthPricing: 'onRequest',
    optionGroupIds: ['og-material', 'og-front'],
    ...over,
  }
}

export const DEMO_CATALOG: Catalog = {
  tenantId: TENANT,
  currency: 'EUR',
  furnitureTypes: [{ id: KITCHEN, tenantId: TENANT, key: 'kitchen', name: 'Kuhinja' }],
  elementDefs: [
    def({ id: 'def-base', name: 'Donji element', description: 'Base unit under the worktop' }),
    def({
      id: 'def-wall',
      name: 'Gornji element',
      description: 'Wall unit above the worktop',
      category: 'wall',
      defaultHeight: STANDARD_HEIGHTS.wallCarcass,
      defaultDepth: STANDARD_HEIGHTS.wallDepth,
      minDepth: 250,
      maxDepth: 450,
    }),
    def({
      id: 'def-oven',
      name: 'Ugradna rerna',
      description: 'Built-in oven housing',
      category: 'appliance',
      standardWidths: [600],
      minWidth: 600,
      maxWidth: 600,
      allowCustomWidth: false,
      applianceSlot: { kind: 'oven', allowedWidths: [...APPLIANCE_WIDTHS_MM.oven] },
      optionGroupIds: [],
    }),
    def({
      id: 'def-dishwasher',
      name: 'Mašina za sudove',
      description: 'Dishwasher slot',
      category: 'appliance',
      standardWidths: [600, 450],
      minWidth: 450,
      maxWidth: 600,
      allowCustomWidth: false,
      applianceSlot: { kind: 'dishwasher', allowedWidths: [...APPLIANCE_WIDTHS_MM.dishwasher] },
      optionGroupIds: [],
    }),
    // A sink base is a base cabinet with a sink cut into the worktop above it.
    // Same 720mm carcass height as the other base units (row-height rule).
    def({
      id: 'def-sink',
      name: 'Sudopera (donji)',
      description: 'Sink base cabinet',
      standardWidths: [600, 800, 900],
      minWidth: 600,
      maxWidth: 900,
      allowCustomWidth: false,
      applianceSlot: { kind: 'sink', allowedWidths: [...APPLIANCE_WIDTHS_MM.sink] },
    }),
    // A worktop spanning the base run. Supplied and jointed on site, so it can
    // be far wider than a single cabinet panel — hence the generous caps.
    def({
      id: 'def-worktop',
      name: 'Radna ploča',
      description: 'Worktop over the base units',
      category: 'worktop',
      standardWidths: [],
      minWidth: 300,
      maxWidth: 6000,
      minHeight: 20,
      maxHeight: 60,
      defaultHeight: 40,
      minDepth: 500,
      maxDepth: 650,
      defaultDepth: 600,
      allowCustomWidth: true,
      customWidthPricing: 'priced',
      maxPanelWidth: 6000,
      optionGroupIds: [],
    }),
    // A chimney hood, sized to the wall-cabinet height so the wall row keeps a
    // single height (row-height rule).
    def({
      id: 'def-hood',
      name: 'Aspirator',
      description: 'Chimney extractor hood',
      category: 'wall',
      standardWidths: [600, 900],
      minWidth: 600,
      maxWidth: 900,
      defaultHeight: STANDARD_HEIGHTS.wallCarcass,
      defaultDepth: STANDARD_HEIGHTS.wallDepth,
      minDepth: 250,
      maxDepth: 450,
      allowCustomWidth: false,
      applianceSlot: { kind: 'hood', allowedWidths: [...APPLIANCE_WIDTHS_MM.hood] },
      optionGroupIds: [],
    }),
  ],
  materials: [
    { id: 'mat-oak', tenantId: TENANT, name: 'Hrast', description: 'Oak-effect melamine', color: '#c8a06a', available: true },
    { id: 'mat-white', tenantId: TENANT, name: 'Bela', description: 'Matte white', color: '#ecebe7', available: true },
    { id: 'mat-anthracite', tenantId: TENANT, name: 'Antracit', description: 'Anthracite grey', color: '#3f3f46', available: true },
  ],
  optionGroups: [
    {
      id: 'og-material',
      tenantId: TENANT,
      key: 'material',
      name: 'Materijal',
      description: 'Board finish for carcass and fronts',
      required: true,
      values: [
        { id: 'ov-oak', name: 'Hrast', description: 'Warm oak effect', materialId: 'mat-oak', available: true },
        { id: 'ov-white', name: 'Bela', description: 'Matte white', materialId: 'mat-white', available: true },
        { id: 'ov-anthracite', name: 'Antracit', description: 'Anthracite grey', materialId: 'mat-anthracite', available: true },
      ],
    },
    {
      id: 'og-front',
      tenantId: TENANT,
      key: 'front',
      name: 'Front',
      description: 'Door and drawer front style',
      required: false,
      values: [
        { id: 'ov-slab', name: 'Ravna vrata', description: 'Flat slab door', available: true },
        { id: 'ov-drawers', name: 'Fioke', description: 'Drawer stack', available: true },
        { id: 'ov-glass', name: 'Staklena vrata', description: 'Glass front', available: false },
      ],
    },
  ],
  priceRules: [
    // Appliance slots are deliberately unpriced, so "on request" is visible
    // in the demo exactly as it will be in production.
    { id: 'pr-base-s', tenantId: TENANT, elementDefId: 'def-base', minWidth: 200, maxWidth: 600, amount: 120, currency: 'EUR' },
    { id: 'pr-base-l', tenantId: TENANT, elementDefId: 'def-base', minWidth: 601, maxWidth: 1200, amount: 180, currency: 'EUR' },
    { id: 'pr-wall-s', tenantId: TENANT, elementDefId: 'def-wall', minWidth: 200, maxWidth: 600, amount: 90, currency: 'EUR' },
    { id: 'pr-wall-l', tenantId: TENANT, elementDefId: 'def-wall', minWidth: 601, maxWidth: 1200, amount: 140, currency: 'EUR' },
    // A sink base is quotable; the sink appliance itself is the buyer's own.
    { id: 'pr-sink', tenantId: TENANT, elementDefId: 'def-sink', amount: 220, currency: 'EUR' },
    // Worktop priced by run length band. Oven/dishwasher/hood stay "on request".
    { id: 'pr-worktop-s', tenantId: TENANT, elementDefId: 'def-worktop', minWidth: 300, maxWidth: 3000, amount: 260, currency: 'EUR' },
    { id: 'pr-worktop-l', tenantId: TENANT, elementDefId: 'def-worktop', minWidth: 3001, maxWidth: 6000, amount: 420, currency: 'EUR' },
  ],
  maxPanelWidth: DEFAULT_MAX_PANEL_WIDTH_MM,
  maxPanelHeight: DEFAULT_MAX_PANEL_HEIGHT_MM,
}

export const DEMO_FURNITURE_TYPE_ID = KITCHEN
