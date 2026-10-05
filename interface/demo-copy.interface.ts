/** Labels for the interactive wall-fit demo in the hero. */
export interface DemoCopy {
  project: string
  sliderLabel: string
  hint: string
  /** Badge when the fill is exact; `{count}` is replaced with the element count. */
  exact: string
  /** Badge when the solver leaves a remainder; `{mm}` is replaced. */
  remainder: string
  customLegend: string
  boards: string
  edge: string
  hardware: string
  labour: string
  total: string
  currency: string
  /** Unit suffixes. */
  units: { mm: string; m2: string; m: string; pcs: string }
}
