# Contributing to LiverQ (Open Source)

Thanks for your interest in improving LiverQ. This repository is the
**open-source application framework** for LiverQ, with **demonstration content
only**. Contributions to the app code, UI, tests, docs, and accessibility are
very welcome.

Please also read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- **Code / bug fixes** — UI, quiz logic, data layer, build tooling.
- **Documentation** — README, this guide, in-repo notes.
- **Accessibility** — keyboard navigation, screen-reader labels, contrast.
- **Tests** — reproducible bug reports and additional unit tests.
- **Sample content** — small, independently written demonstration questions
  (see the strict rules below).

## Local development

Prerequisites: Node.js 18+ and npm.

```bash
git clone https://github.com/Jamieson-dev/LiverQ-OpenSource.git
cd LiverQ-OpenSource
npm install
npm run dev      # http://localhost:5173
```

Before opening a pull request:

```bash
npm test         # unit tests must pass
npm run build    # type-check + production build must pass
```

## Pull request checklist

- The branch builds: `npm run build` succeeds and `npm test` passes.
- The change is focused; unrelated changes are split into separate PRs.
- No patient-identifiable information and no copyrighted third-party material.
- No secrets, tokens, or private files are committed.

## Rules for sample / demonstration content

This project intentionally ships **demonstration content only**. If you add or
change a sample question, all of the following are required:

1. **Independently written** from general, widely-taught clinical knowledge.
2. **Do NOT quote or closely paraphrase** AASLD or any other guideline, and do
   not copy any copyrighted text, tables, or figures.
3. **Do NOT cite** page numbers, tables, figures, or proprietary guideline
   sections.
4. **Fictional educational scenarios only** — no patient-identifiable
   information and no real clinical records.
5. **Do not submit AI-generated content without review** — you may use AI to
   help draft, but you must personally review it for accuracy.
6. **Disclose conflicts of interest** (or state "none").
7. **You must hold the rights** to what you submit.

Do not add production or large-scale content to this repository. It is a
framework with a limited demonstration set.

## Licensing of contributions

By contributing, you agree that:

- **Code** contributions are licensed under the Apache License 2.0
  (see [LICENSE](LICENSE)).
- **Sample content** contributions (the original question wording, answer
  choices, and explanations) are licensed under CC BY 4.0
  (see [CONTENT_LICENSE.md](CONTENT_LICENSE.md)).
- You are not granting, and cannot grant, rights in third-party materials; see
  [NOTICE](NOTICE).

## Reporting security or privacy issues

Do **not** open a public issue for security or privacy problems. See
[SECURITY.md](SECURITY.md) and email **jamie.son.apps@gmail.com**.
