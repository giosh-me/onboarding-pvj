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
    table: (props) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm" {...props} />
      </div>
    ),
    thead: (props) => <thead className="border-b border-pvj-cream-200" {...props} />,
    th: (props) => (
      <th
        className="px-3 py-2 text-left text-xs uppercase tracking-wider text-pvj-navy/60 font-semibold"
        {...props}
      />
    ),
    td: (props) => (
      <td className="px-3 py-2 border-b border-pvj-cream-200/60 align-top" {...props} />
    ),
    tr: (props) => <tr {...props} />,
    hr: () => <hr className="my-10 border-pvj-cream-200" />,
    code: (props) => (
      <code className="rounded bg-pvj-cream-200/60 px-1.5 py-0.5 text-[0.92em] font-mono" {...props} />
    ),
  }
}
