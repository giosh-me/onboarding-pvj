'use client'
import { useEffect } from 'react'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER, type ModuleSlug } from '@/lib/content/module-order'

export function LessonMarkRead({ slug }: { slug: ModuleSlug }) {
  const { markLessonRead } = useProgress(MODULE_ORDER)
  useEffect(() => {
    markLessonRead(slug)
  }, [slug, markLessonRead])
  return null
}
