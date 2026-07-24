import { describe, it, expect, beforeEach } from 'vitest'
import {
  getBookmarks,
  isBookmarked,
  toggleBookmark,
  getIncorrect,
  addIncorrect,
  clearIncorrect,
  recordAnswer,
  getAnswerDetail,
  getAllAnswers,
  clearAllLocalProgress,
} from '../src/lib/storage'
import type { StoredAnswer } from '../src/types'

// jsdom (configured in vitest.config.ts) provides window.localStorage.
beforeEach(() => localStorage.clear())

describe('bookmarks round trip', () => {
  it('toggles on and off and persists through localStorage', () => {
    expect(getBookmarks()).toEqual([])
    expect(toggleBookmark('q1')).toBe(true)
    expect(isBookmarked('q1')).toBe(true)
    expect(getBookmarks()).toContain('q1')

    expect(toggleBookmark('q1')).toBe(false)
    expect(isBookmarked('q1')).toBe(false)
    expect(getBookmarks()).not.toContain('q1')
  })

  it('dedupes bookmarked ids', () => {
    toggleBookmark('q1')
    toggleBookmark('q2')
    expect(getBookmarks().sort()).toEqual(['q1', 'q2'])
  })
})

describe('incorrect list + answer detail round trip', () => {
  const answer = (over: Partial<StoredAnswer>): StoredAnswer => ({
    questionId: 'q',
    userAnswer: 'A',
    correctAnswer: 'A',
    isCorrect: true,
    answeredAt: '2026-07-24T00:00:00.000Z',
    questionType: 'multiple_choice',
    ...over,
  })

  it('records a wrong answer into the incorrect list and stores its detail', () => {
    recordAnswer(answer({ questionId: 'q2', userAnswer: 'B', correctAnswer: 'A', isCorrect: false }))
    expect(getIncorrect()).toContain('q2')
    const detail = getAnswerDetail('q2')
    expect(detail?.userAnswer).toBe('B')
    expect(detail?.isCorrect).toBe(false)
  })

  it('does not add a correct answer to the incorrect list but keeps its detail', () => {
    recordAnswer(answer({ questionId: 'q3', isCorrect: true }))
    expect(getIncorrect()).not.toContain('q3')
    expect(getAnswerDetail('q3')?.isCorrect).toBe(true)
  })

  it('addIncorrect dedupes and clearIncorrect removes', () => {
    addIncorrect('q4')
    addIncorrect('q4')
    expect(getIncorrect().filter((x) => x === 'q4')).toHaveLength(1)
    clearIncorrect('q4')
    expect(getIncorrect()).not.toContain('q4')
  })

  it('clearAllLocalProgress wipes bookmarks, incorrect, and answers', () => {
    toggleBookmark('q5')
    recordAnswer(answer({ questionId: 'q6', isCorrect: false }))
    clearAllLocalProgress()
    expect(getBookmarks()).toEqual([])
    expect(getIncorrect()).toEqual([])
    expect(getAllAnswers()).toEqual({})
  })
})
