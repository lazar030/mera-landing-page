import type { NextConfig } from 'next'

const config: NextConfig = {
  // Workspace packages ship raw TypeScript; Next compiles them (see CLAUDE.md).
  transpilePackages: ['@mera/core'],
}

export default config
