import type { Question, Topic } from '../types'
import { buildReportMailto } from '../lib/reportIssue'

interface ReportIssueButtonProps {
  question: Question
  topic?: Topic
  selectedAnswer?: string | null
}

/**
 * Small, secondary "Report question issue" link. Opens the user's email client
 * via mailto with a prefilled draft — no network, storage, or tracking.
 */
export function ReportIssueButton({
  question,
  topic,
  selectedAnswer,
}: ReportIssueButtonProps) {
  return (
    <a
      className="report-issue"
      href={buildReportMailto({ question, topic, selectedAnswer })}
    >
      Report question issue
    </a>
  )
}
