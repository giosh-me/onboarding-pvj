import { z } from 'zod'

export const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('mcq'),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6),
    correct_index: z.number().int().min(0),
    explanation: z.string().min(1),
    source: z.string().optional(),
  })
  .refine((q) => q.correct_index < q.options.length, {
    message: 'correct_index must be a valid index of options',
    path: ['correct_index'],
  })

export const quizFileSchema = z.record(z.string(), z.array(quizQuestionSchema))

export const flashcardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

export const flashcardFileSchema = z.record(z.string(), z.array(flashcardSchema))

export const moduleFrontmatterSchema = z.object({
  slug: z.string().min(1),
  order: z.number().int().min(1),
  title: z.string().min(1),
  estimated_minutes: z.number().int().min(1),
  sources: z.array(z.string()).default([]),
})

export type QuizQuestion = z.infer<typeof quizQuestionSchema>
export type Flashcard = z.infer<typeof flashcardSchema>
export type ModuleFrontmatter = z.infer<typeof moduleFrontmatterSchema>
