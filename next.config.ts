import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: false, // we use MDX components, not the Rust-only mode
  },
}

export default withNextIntl(withMDX(nextConfig))
