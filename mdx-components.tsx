import type { MDXComponents } from 'mdx/types'
import { lessonComponents } from '@/components/lesson/mdx-components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...lessonComponents,
    h1: (props) => <h1 className="mb-6" {...props} />,
    h2: (props) => <h2 className="mt-10 mb-4" {...props} />,
    p: (props) => <p className="my-4 leading-7" {...props} />,
    a: (props) => (
      <a
        className="underline decoration-pvj-gold-soft underline-offset-4 hover:text-pvj-gold"
        {...props}
      />
    ),
    ul: (props) => <ul className="my-4 list-disc pl-6 space-y-1" {...props} />,
    ol: (props) => <ol className="my-4 list-decimal pl-6 space-y-1" {...props} />,
    blockquote: (props) => (
      <blockquote className="my-6 border-l-2 border-pvj-gold pl-4 italic text-pvj-navy/80" {...props} />
    ),
  }
}
