/**
 * @mera/core — the Mera configuration engine.
 *
 * Rules of this package, from 02_TECH_STACK.md §5:
 *   1. Zero dependencies. No React, no Supabase, no Next.
 *   2. Pure functions. No I/O, no clock, no randomness.
 *   3. Deterministic. Same input, same output — always.
 *
 * That is what lets the browser compute instant feedback and the server
 * re-compute the same answer as the authority, from one implementation.
 */

export * from './types'
export * from './interface'
export * from './constants'
export * from './errors'
export * from './catalog'
export * from './validate'
export * from './fill'
export * from './layout'
export * from './price'
export * from './derive'
export * from './calc'
export * from './cut'
export * from './sketch-to-elements'
export * from './sketch-to-config'
export * from './config-to-elements'
export * from './elements-to-geometry'
export * from './demo-catalog'
