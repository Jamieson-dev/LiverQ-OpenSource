interface QuestionCardProps {
  questionNumber: number
  total: number
  question: string
}

/**
 * Shows ONLY the question number and the question text before answering.
 * The topic name is deliberately NOT rendered here so the user cannot
 * infer the topic before submitting an answer.
 */
export function QuestionCard({
  questionNumber,
  total,
  question,
}: QuestionCardProps) {
  return (
    <div className="card">
      <div className="section-label" style={{ margin: '0 0 var(--s2)' }}>
        Question {questionNumber} of {total}
      </div>
      <p className="q-stem">{question}</p>
    </div>
  )
}
