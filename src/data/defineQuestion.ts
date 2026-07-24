import type {
  Citation,
  Difficulty,
  Question,
  QuestionStatus,
  QuestionType,
} from '../types'

// ============================================================
// LiverQ — question authoring helper
//
// New content is written in a clean, hard-to-get-wrong input format and
// normalized into the canonical runtime `Question`. This scales to
// hundreds of questions because:
//   - You give the correct answer + distractors separately, so the
//     correct answer can never be "missing from choices".
//   - Choices are assembled for you (correct + distractors), and the quiz
//     layer shuffles them at display time.
//   - The structured citation is mapped to the flat source* fields the
//     existing SourceCard reads, so nothing downstream breaks.
//   - Sensible defaults (type = multiple_choice, status = approved).
//
// Authoring example (demonstration only — write your own, independently):
//   defineQuestion({
//     id: 'demo-lb-example',
//     topicId: 'liver-basics',
//     subtopic: 'Anatomy',
//     difficulty: 'easy',
//     stem: 'Which vessel delivers most of the blood flowing into the liver?',
//     correctAnswer: 'The portal vein',
//     distractors: ['The hepatic artery', 'The hepatic vein', 'The renal vein'],
//     explanation: 'Most hepatic blood arrives via the portal vein from the gut...',
//     teachingPearl: 'The liver has a dual blood supply.',
//     citation: { source: 'General teaching example', url: '' },
//   })
// ============================================================

export interface QuestionInput {
  id: string
  topicId: string
  subtopic?: string
  difficulty?: Difficulty
  /** Defaults to 'multiple_choice'. */
  type?: QuestionType
  /** The question stem. */
  stem: string
  correctAnswer: string
  /**
   * Wrong options for multiple_choice. Omit for true_false (auto True/False)
   * and short_answer (no options).
   */
  distractors?: string[]
  explanation: string
  teachingPearl?: string
  citation: Citation
  /** Defaults to 'approved'. */
  status?: QuestionStatus
}

/** Build the canonical option list for a given question type. */
function buildChoices(
  type: QuestionType,
  correctAnswer: string,
  distractors: string[]
): string[] {
  switch (type) {
    case 'true_false':
      return ['True', 'False']
    case 'short_answer':
      return []
    case 'multiple_choice':
    default:
      // Canonical order = correct first, then distractors. The quiz layer
      // shuffles for display, so authoring order does not matter.
      return [correctAnswer, ...distractors]
  }
}

/** Normalize one authored input into a runtime Question. */
export function defineQuestion(input: QuestionInput): Question {
  const questionType: QuestionType = input.type ?? 'multiple_choice'
  const distractors = input.distractors ?? []
  const choices = buildChoices(questionType, input.correctAnswer, distractors)
  const citation = input.citation

  return {
    id: input.id,
    topicId: input.topicId,
    subtopic: input.subtopic,
    difficulty: input.difficulty,
    questionType,
    question: input.stem,
    choices,
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    teachingPearl: input.teachingPearl,
    citation,
    // Keep the flat source* fields in sync so the existing SourceCard and any
    // legacy reader keep working without changes.
    sourceTitle: citation.source,
    sourceYear: citation.year ?? '',
    sourceSection: citation.section ?? '',
    officialUrl: citation.url ?? '',
    status: input.status ?? 'approved',
  }
}

/** Normalize a list of authored inputs. */
export function defineQuestions(inputs: QuestionInput[]): Question[] {
  return inputs.map(defineQuestion)
}
