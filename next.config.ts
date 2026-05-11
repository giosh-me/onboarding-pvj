import type { NextConfig } from 'next'
import path from 'node:path'
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [[remarkFrontmatter, 'yaml'], remarkGfm],
  },
})

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: false,
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@/content': path.resolve(process.cwd(), 'content'),
    }
    return config
  },
}

export default withNextIntl(withMDX(nextConfig))
