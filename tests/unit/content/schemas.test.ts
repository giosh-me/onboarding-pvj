import { describe, it, expect } from 'vitest'
import { quizFileSchema, flashcardFileSchema } from '@/lib/content/schemas'

describe('quizFileSchema', () => {
  it('accepts a valid quiz file', () => {
    const valid = {
      welcome: [
        { id: 'q-w-001', type: 'mcq', question: 'X?', options: ['a','b','c','d'], correct_index: 1, explanation: '...' }
      ]
    }
    expect(() => quizFileSchema.parse(valid)).not.toThrow()
  })

  it('rejects correct_index out of range', () => {
    const bad = {
      welcome: [
        { id: 'q-w-002', type: 'mcq', question: 'X?', options: ['a','b'], correct_index: 5, explanation: '...' }
      ]
    }
    expect(() => quizFileSchema.parse(bad)).toThrow()
  })

  it('rejects fewer than 2 options', () => {
    const bad = {
      welcome: [
        { id: 'q-w-003', type: 'mcq', question: 'X?', options: ['a'], correct_index: 0, explanation: '...' }
      ]
    }
    expect(() => quizFileSchema.parse(bad)).toThrow()
  })
})

describe('flashcardFileSchema', () => {
  it('accepts a valid flashcards file', () => {
    const valid = {
      welcome: [
        { id: 'f-w-001', front: 'X', back: 'Y', tags: ['t1'] }
      ]
    }
    expect(() => flashcardFileSchema.parse(valid)).not.toThrow()
  })

  it('rejects missing back', () => {
    const bad = { welcome: [{ id: 'f-w-002', front: 'X' }] }
    expect(() => flashcardFileSchema.parse(bad)).toThrow()
  })
})
