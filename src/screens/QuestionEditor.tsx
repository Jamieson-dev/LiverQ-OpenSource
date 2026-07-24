import { useEffect, useMemo, useState } from 'react'
import type { Difficulty, QuestionStatus, QuestionType } from '../types'
import { getTopics } from '../lib/dataSource'
import { defineQuestion, type QuestionInput } from '../data/defineQuestion'
import { getQuestionIssues } from '../lib/validateQuestion'
import { QuestionCard } from '../components/QuestionCard'
import { AnswerButton } from '../components/AnswerButton'
import { ExplanationCard } from '../components/ExplanationCard'
import { TeachingPearlCard } from '../components/TeachingPearlCard'
import { SourceCard } from '../components/SourceCard'

// ============================================================
// LiverQ — local/dev-only Question Editor
//
// Reached only via a hidden route (see isEditorRoute in App.tsx); never
// linked from the app navigation. Author a question, preview it exactly as
// it renders in the quiz, and export JSON or a ready-to-paste
// defineQuestion({...}) snippet. No backend — drafts autosave to
// localStorage. This is an authoring aid; the code remains the source of
// truth (paste the export into a topic module to make a question permanent).
// ============================================================

const DRAFT_KEY = 'liverq:editor-draft'

interface Draft {
  id: string
  topicId: string
  subtopic: string
  difficulty: '' | Difficulty
  type: QuestionType
  stem: string
  correctAnswer: string
  distractors: string[]
  explanation: string
  teachingPearl: string
  citeSource: string
  citeYear: string
  citeSection: string
  citeUrl: string
  status: QuestionStatus
}

function emptyDraft(topicId: string): Draft {
  return {
    id: '',
    topicId,
    subtopic: '',
    difficulty: '',
    type: 'multiple_choice',
    stem: '',
    correctAnswer: '',
    distractors: ['', '', ''],
    explanation: '',
    teachingPearl: '',
    citeSource: '',
    citeYear: '',
    citeSection: '',
    citeUrl: '',
    status: 'approved',
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

/** Build the clean authoring input from the raw draft (trims + drops blanks). */
function toInput(d: Draft): QuestionInput {
  const t = (v: string) => v.trim()
  const distractors =
    d.type === 'multiple_choice'
      ? d.distractors.map(t).filter((x) => x.length > 0)
      : undefined
  return {
    id: t(d.id),
    topicId: d.topicId,
    subtopic: t(d.subtopic) || undefined,
    difficulty: d.difficulty || undefined,
    type: d.type,
    stem: t(d.stem),
    correctAnswer: t(d.correctAnswer),
    distractors,
    explanation: t(d.explanation),
    teachingPearl: t(d.teachingPearl) || undefined,
    citation: {
      source: t(d.citeSource),
      year: t(d.citeYear) || undefined,
      section: t(d.citeSection) || undefined,
      url: t(d.citeUrl) || undefined,
    },
    status: d.status,
  }
}

/** Emit a ready-to-paste defineQuestion({...}) call. */
function toTsSnippet(input: QuestionInput): string {
  const q = (v: string) => JSON.stringify(v)
  const lines: string[] = ['defineQuestion({']
  lines.push(`  id: ${q(input.id)},`)
  lines.push(`  topicId: ${q(input.topicId)},`)
  if (input.subtopic) lines.push(`  subtopic: ${q(input.subtopic)},`)
  if (input.difficulty) lines.push(`  difficulty: ${q(input.difficulty)},`)
  if (input.type && input.type !== 'multiple_choice') lines.push(`  type: ${q(input.type)},`)
  lines.push(`  stem: ${q(input.stem)},`)
  lines.push(`  correctAnswer: ${q(input.correctAnswer)},`)
  if (input.distractors && input.distractors.length) {
    lines.push(`  distractors: [${input.distractors.map(q).join(', ')}],`)
  }
  lines.push(`  explanation: ${q(input.explanation)},`)
  if (input.teachingPearl) lines.push(`  teachingPearl: ${q(input.teachingPearl)},`)
  const c = input.citation
  const cparts = [`source: ${q(c.source)}`]
  if (c.year) cparts.push(`year: ${q(c.year)}`)
  if (c.section) cparts.push(`section: ${q(c.section)}`)
  if (c.url) cparts.push(`url: ${q(c.url)}`)
  lines.push(`  citation: { ${cparts.join(', ')} },`)
  lines.push('})')
  return lines.join('\n')
}

export function QuestionEditor() {
  const topics = useMemo(() => getTopics(), [])
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) return { ...emptyDraft(topics[0]?.id ?? ''), ...JSON.parse(raw) }
    } catch {
      /* ignore */
    }
    return emptyDraft(topics[0]?.id ?? '')
  })
  const [copied, setCopied] = useState<string | null>(null)

  // Autosave the working draft.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* ignore quota / privacy mode */
    }
  }, [draft])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const input = useMemo(() => toInput(draft), [draft])
  // Preview + validation use the SAME normalization the app uses at runtime.
  const question = useMemo(() => defineQuestion(input), [input])
  const issues = useMemo(() => getQuestionIssues(question), [question])
  const isValid = issues.length === 0
  const isShortAnswer = draft.type === 'short_answer'
  const isMcq = draft.type === 'multiple_choice'

  const tsSnippet = useMemo(() => toTsSnippet(input), [input])
  const jsonSnippet = useMemo(() => JSON.stringify(question, null, 2), [question])

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(null)
    }
  }

  function downloadJson() {
    const blob = new Blob([jsonSnippet], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${input.id || 'question'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function suggestId() {
    if (draft.stem.trim()) set('id', `${draft.topicId}-${slugify(draft.stem)}`)
  }

  function newQuestion() {
    setDraft(emptyDraft(topics[0]?.id ?? ''))
  }

  const previewTopic = topics.find((t) => t.id === draft.topicId)

  return (
    <div className="editor">
      <div className="editor-head">
        <div>
          <h1 className="h2">Question Editor</h1>
          <p className="text-sm muted" style={{ margin: '2px 0 0' }}>
            Local dev tool — not shown in the app. Author, preview, and export.
          </p>
        </div>
        <button className="btn btn-ghost editor-new" onClick={newQuestion}>
          New question
        </button>
      </div>

      <div className="editor-grid">
        {/* ---- Form ---- */}
        <div className="editor-form">
          <section className="card">
            <div className="section-label" style={{ margin: '0 0 10px' }}>
              Classification
            </div>
            <label className="field">
              <span>Topic</span>
              <select value={draft.topicId} onChange={(e) => set('topicId', e.target.value)}>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.displayTitle}
                  </option>
                ))}
              </select>
            </label>
            <div className="field-row">
              <label className="field">
                <span>Subtopic (optional)</span>
                <input
                  type="text"
                  value={draft.subtopic}
                  onChange={(e) => set('subtopic', e.target.value)}
                  placeholder="e.g. Diagnosis"
                />
              </label>
              <label className="field">
                <span>Difficulty (optional)</span>
                <select
                  value={draft.difficulty}
                  onChange={(e) => set('difficulty', e.target.value as Draft['difficulty'])}
                >
                  <option value="">—</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Question type</span>
              <select
                value={draft.type}
                onChange={(e) => set('type', e.target.value as QuestionType)}
              >
                <option value="multiple_choice">Multiple choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short answer</option>
              </select>
            </label>
          </section>

          <section className="card">
            <div className="section-label" style={{ margin: '0 0 10px' }}>
              Content
            </div>
            <label className="field">
              <span>Question stem</span>
              <textarea
                className="sa-input"
                rows={3}
                value={draft.stem}
                onChange={(e) => set('stem', e.target.value)}
                placeholder="The question text"
              />
            </label>

            <label className="field">
              <span>{isShortAnswer ? 'Model answer' : 'Correct answer'}</span>
              {draft.type === 'true_false' ? (
                <select
                  value={draft.correctAnswer}
                  onChange={(e) => set('correctAnswer', e.target.value)}
                >
                  <option value="">—</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={draft.correctAnswer}
                  onChange={(e) => set('correctAnswer', e.target.value)}
                  placeholder={isShortAnswer ? 'The expected answer' : 'The correct option'}
                />
              )}
            </label>

            {isMcq && (
              <div className="field">
                <span>Distractors (wrong options)</span>
                {draft.distractors.map((d, i) => (
                  <div key={i} className="distractor-row">
                    <input
                      type="text"
                      value={d}
                      onChange={(e) => {
                        const next = draft.distractors.slice()
                        next[i] = e.target.value
                        set('distractors', next)
                      }}
                      placeholder={`Distractor ${i + 1}`}
                    />
                    <button
                      className="icon-btn editor-remove"
                      aria-label="Remove distractor"
                      onClick={() =>
                        set(
                          'distractors',
                          draft.distractors.filter((_, j) => j !== i)
                        )
                      }
                    >
                      −
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-ghost editor-add"
                  onClick={() => set('distractors', [...draft.distractors, ''])}
                >
                  + Add distractor
                </button>
              </div>
            )}

            <label className="field">
              <span>Explanation</span>
              <textarea
                className="sa-input"
                rows={4}
                value={draft.explanation}
                onChange={(e) => set('explanation', e.target.value)}
                placeholder="Short, original explanation (do not paste guideline text)"
              />
            </label>
            <label className="field">
              <span>Teaching pearl (optional)</span>
              <input
                type="text"
                value={draft.teachingPearl}
                onChange={(e) => set('teachingPearl', e.target.value)}
                placeholder="One-line high-yield takeaway"
              />
            </label>
          </section>

          <section className="card">
            <div className="section-label" style={{ margin: '0 0 10px' }}>
              Citation
            </div>
            <p className="text-sm muted" style={{ margin: '0 0 10px' }}>
              Cite a real source only. Do not invent citations.
            </p>
            <label className="field">
              <span>Source title</span>
              <input
                type="text"
                value={draft.citeSource}
                onChange={(e) => set('citeSource', e.target.value)}
                placeholder="e.g. Textbook or open educational source"
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Year (optional)</span>
                <input
                  type="text"
                  value={draft.citeYear}
                  onChange={(e) => set('citeYear', e.target.value)}
                  placeholder="2023"
                />
              </label>
              <label className="field">
                <span>Section (optional)</span>
                <input
                  type="text"
                  value={draft.citeSection}
                  onChange={(e) => set('citeSection', e.target.value)}
                  placeholder="Statement 5"
                />
              </label>
            </div>
            <label className="field">
              <span>URL (optional)</span>
              <input
                type="text"
                value={draft.citeUrl}
                onChange={(e) => set('citeUrl', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </section>

          <section className="card">
            <div className="section-label" style={{ margin: '0 0 10px' }}>
              Metadata
            </div>
            <label className="field">
              <span>ID</span>
              <div className="distractor-row">
                <input
                  type="text"
                  value={draft.id}
                  onChange={(e) => set('id', e.target.value)}
                  placeholder="unique-question-id"
                />
                <button className="btn btn-ghost editor-add" style={{ width: 'auto' }} onClick={suggestId}>
                  Auto
                </button>
              </div>
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={draft.status}
                onChange={(e) => set('status', e.target.value as QuestionStatus)}
              >
                <option value="approved">approved</option>
                <option value="draft">draft</option>
              </select>
            </label>
          </section>
        </div>

        {/* ---- Preview + validation + export ---- */}
        <div className="editor-preview">
          <section className={`card editor-validation ${isValid ? 'is-ok' : 'is-bad'}`}>
            <div className="section-label" style={{ margin: 0 }}>
              Validation
            </div>
            {isValid ? (
              <p style={{ margin: '6px 0 0', color: 'var(--success)', fontWeight: 600 }}>
                ✓ Looks good — ready to export.
              </p>
            ) : (
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--error)' }}>
                {issues.map((iss) => (
                  <li key={iss}>{iss}</li>
                ))}
              </ul>
            )}
          </section>

          <div className="section-label">Preview</div>
          <QuestionCard questionNumber={1} total={1} question={question.question} />

          {!isShortAnswer && (
            <div className="stack-sm">
              {question.choices.map((choice, i) => (
                <AnswerButton
                  key={`${choice}-${i}`}
                  index={i}
                  label={choice}
                  selected={false}
                  answered
                  isCorrectAnswer={choice === question.correctAnswer}
                  onSelect={() => {}}
                />
              ))}
            </div>
          )}
          {isShortAnswer && (
            <div
              className="card"
              style={{ borderColor: 'var(--success)', background: 'var(--success-tint)' }}
            >
              <div className="section-label" style={{ margin: '0 0 6px' }}>
                Model answer
              </div>
              <p style={{ margin: 0, fontWeight: 700 }}>{question.correctAnswer}</p>
            </div>
          )}

          <ExplanationCard
            topic={previewTopic}
            explanation={question.explanation}
            subtopic={question.subtopic}
            difficulty={question.difficulty}
          />
          {question.teachingPearl && <TeachingPearlCard pearl={question.teachingPearl} />}
          <SourceCard question={question} />

          {/* Export */}
          <section className="card">
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="section-label" style={{ margin: 0 }}>
                Export — TypeScript (defineQuestion)
              </span>
              <button className="chip" onClick={() => copy(tsSnippet, 'ts')}>
                {copied === 'ts' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea className="sa-input editor-code" readOnly rows={10} value={tsSnippet} />
          </section>

          <section className="card">
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="section-label" style={{ margin: 0 }}>
                Export — JSON
              </span>
              <div className="row" style={{ gap: 8 }}>
                <button className="chip" onClick={() => copy(jsonSnippet, 'json')}>
                  {copied === 'json' ? 'Copied' : 'Copy'}
                </button>
                <button className="chip" onClick={downloadJson}>
                  Download
                </button>
              </div>
            </div>
            <textarea className="sa-input editor-code" readOnly rows={12} value={jsonSnippet} />
          </section>
        </div>
      </div>
    </div>
  )
}
