import { describe, it, expect, vi } from 'vitest'

// Controlled question bank so buildQuiz does not load the real ~1,830-item
// module. vi.hoisted lets the fixture be shared with the mock factory (which
// vitest hoists above the imports).
const { MOCK_QUESTIONS } = vi.hoisted(() => {
  const mcq = (id: string, topicId: string) => ({
    id,
    topicId,
    questionType: 'multiple_choice' as const,
    question: `Question ${id}?`,
    choices: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: `Because ${id}.`,
    sourceTitle: 'Test Guideline',
    sourceYear: '2024',
    sourceSection: 'S1',
    officialUrl: 'https://example.org',
    status: 'approved' as const,
  })
  return {
    MOCK_QUESTIONS: [
      mcq('a1', 'alpha'),
      mcq('a2', 'alpha'),
      mcq('a3', 'alpha'),
      mcq('b1', 'beta'),
      mcq('b2', 'beta'),
    ],
  }
})

vi.mock('../src/data/questions', () => ({ QUESTIONS: MOCK_QUESTIONS }))

import { shuffle, displayChoices, buildQuiz } from '../src/lib/quiz'
import type { Question } from '../src/types'

const mcqQuestion: Question = {
  id: 'x1',
  topicId: 'alpha',
  questionType: 'multiple_choice',
  question: 'Pick A',
  choices: ['A', 'B', 'C', 'D'],
  correctAnswer: 'A',
  explanation: 'A is correct.',
  sourceTitle: 'Test',
  sourceYear: '2024',
  sourceSection: 'S',
  officialUrl: 'https://example.org',
  status: 'approved',
}

describe('shuffle', () => {
  it('returns a new array containing exactly the same elements', () => {
    const input = ['A', 'B', 'C', 'D']
    const out = shuffle(input)
    expect(out).not.toBe(input) // does not mutate / alias the input
    expect(out).toHaveLength(input.length)
    expect([...out].sort()).toEqual([...input].sort())
  })
})

describe('displayChoices', () => {
  it('MCQ: returns a permutation that still contains the correct answer', () => {
    for (let i = 0; i < 25; i++) {
      const shown = displayChoices(mcqQuestion)
      expect([...shown].sort()).toEqual([...mcqQuestion.choices].sort())
      expect(shown).toContain(mcqQuestion.correctAnswer)
    }
  })

  it('true/false: always the canonical ["True","False"] order', () => {
    const tf: Question = {
      ...mcqQuestion,
      id: 'tf',
      questionType: 'true_false',
      choices: ['True', 'False'],
      correctAnswer: 'True',
    }
    expect(displayChoices(tf)).toEqual(['True', 'False'])
  })
})

describe('buildQuiz', () => {
  it('caps the quiz at the requested count', async () => {
    const quiz = await buildQuiz(['alpha'], 2)
    expect(quiz).toHaveLength(2)
    expect(quiz.every((q) => q.question.topicId === 'alpha')).toBe(true)
  })

  it('returns all available items when fewer exist than requested', async () => {
    const quiz = await buildQuiz(['alpha'], 10)
    expect(quiz).toHaveLength(3) // only 3 alpha questions exist
  })

  it('includes only the selected topics', async () => {
    const quiz = await buildQuiz(['beta'], 25)
    expect(quiz).toHaveLength(2)
    expect(quiz.every((q) => q.question.topicId === 'beta')).toBe(true)
  })

  it('pools across multiple selected topics', async () => {
    const quiz = await buildQuiz(['alpha', 'beta'], 100)
    expect(quiz).toHaveLength(5)
  })

  it('shuffles each item\'s choices while preserving the correct answer', async () => {
    const quiz = await buildQuiz(['alpha', 'beta'], 100)
    for (const item of quiz) {
      expect([...item.choices].sort()).toEqual([...item.question.choices].sort())
      expect(item.choices).toContain(item.question.correctAnswer)
    }
  })
})
