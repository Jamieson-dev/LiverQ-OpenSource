import { describe, it, expect, vi } from 'vitest'

// A small controlled bank mixing approved, draft, and malformed items so the
// approved-only filter and the validation drop can be checked in isolation.
const { MOCK } = vi.hoisted(() => {
  const base = (over: Record<string, unknown>) => ({
    id: 'id',
    topicId: 'alpha',
    questionType: 'multiple_choice',
    question: 'Q?',
    choices: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: 'E',
    sourceTitle: 'T',
    sourceYear: '2024',
    sourceSection: 'S',
    officialUrl: 'https://example.org',
    status: 'approved',
    ...over,
  })
  return {
    MOCK: [
      base({ id: 'a1', topicId: 'alpha', status: 'approved' }),
      base({ id: 'a2', topicId: 'alpha', status: 'approved' }),
      base({ id: 'b1', topicId: 'beta', status: 'approved' }),
      base({ id: 'd1', topicId: 'alpha', status: 'draft' }), // excluded: not approved
      base({ id: 'm1', topicId: 'alpha', status: 'approved', correctAnswer: 'Z' }), // excluded: malformed
    ],
  }
})

vi.mock('../src/data/questions', () => ({ QUESTIONS: MOCK }))

import { getApprovedQuestions } from '../src/lib/dataSource'

describe('getApprovedQuestions', () => {
  it('returns only approved, well-formed questions', async () => {
    const res = await getApprovedQuestions()
    expect(res.map((q) => q.id).sort()).toEqual(['a1', 'a2', 'b1'])
    expect(res.every((q) => q.status === 'approved')).toBe(true)
  })

  it('drops draft items', async () => {
    const res = await getApprovedQuestions()
    expect(res.find((q) => q.id === 'd1')).toBeUndefined()
  })

  it('drops malformed approved items (correctAnswer not in choices)', async () => {
    const res = await getApprovedQuestions()
    expect(res.find((q) => q.id === 'm1')).toBeUndefined()
  })

  it('filters by the selected topic ids', async () => {
    expect((await getApprovedQuestions(['alpha'])).map((q) => q.id).sort()).toEqual(['a1', 'a2'])
    expect((await getApprovedQuestions(['beta'])).map((q) => q.id)).toEqual(['b1'])
    expect(await getApprovedQuestions(['does-not-exist'])).toEqual([])
  })
})
