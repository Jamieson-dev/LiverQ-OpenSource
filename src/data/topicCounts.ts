// ============================================================
// LiverQ (open source) — precomputed approved-question counts per topic.
//
// The topic list only needs per-topic counts, not the question content,
// so the shell can render instantly while questions lazy-load on demand
// (see src/lib/dataSource.ts). In this open-source framework the bank is a
// small independently written DEMONSTRATION set (4 topics × 4 questions).
// ============================================================

export const TOPIC_COUNTS: Record<string, number> = {
  'liver-basics': 4,
  'viral-hepatitis-basics': 4,
  'cirrhosis-and-complications': 4,
  'liver-tests-and-imaging': 4,
}
