# LiverQ (Open Source)

The **open-source application framework** for LiverQ — a mobile-first study app
for practicing hepatology knowledge through interactive educational quizzes.

This repository contains the **reusable application code and UI** plus a
**small, independently written sample question set** so the app can be cloned,
run, and demonstrated. **The production educational content bank is not included
in this repository.**

> Independent educational project. **Not affiliated with or endorsed by AASLD**
> or any other guideline-issuing organization. **Educational use only — not
> medical advice**, and not for diagnosis or treatment.

## What's included / what's not

- ✅ Application source code, UI, quiz engine, local-storage progress, tests, CI.
- ✅ **16 demonstration questions** (fictional educational examples) across 4
  general topics, plus 20 standard abbreviations.
- ❌ The full production question bank.
- ❌ Any source guideline materials, generated drafts, or internal/private
  documents.

All included questions are **limited demonstration content**: independently
written from general clinical knowledge, using fictional scenarios only, with no
patient information and no copied or closely paraphrased guideline wording.

## Project status

This public repository contains the reusable LiverQ application framework and a
limited demonstration dataset. The production LiverQ application is maintained
separately with a substantially larger private educational content library that
is intentionally excluded from this repository. This public framework is actively
maintained for open-source development, testing, accessibility, and community
contribution.

## Problem it addresses

Clinical guidelines are long and change often. LiverQ turns key teaching points
into topic-based multiple-choice practice for self-testing. This repository is
the **framework** for that app; operators supply their own reviewed content.

## Tech stack

React 18 · TypeScript · Vite · Vitest. No backend; `src/lib/dataSource.ts` is
the single swap point for a content source.

## Install & run locally

Prerequisites: Node.js 18+ and npm.

```bash
git clone https://github.com/Jamieson-dev/LiverQ-OpenSource.git
cd LiverQ-OpenSource
npm install
npm test         # run the unit tests
npm run build    # type-check (tsc -b) + production build
npm run dev      # http://localhost:5173
```

Designed for iPhone-size screens; on desktop the mobile layout is centered.

## Project structure

```
src/
  components/   Reusable UI
  screens/      Home, QuizSetup, Quiz, Result, Review, Stats, Profile, ...
  data/         Sample questions, topics, counts, abbreviations, authoring helper
  lib/          dataSource (content swap point), quiz builder, storage, validation
  types.ts      Shared Topic / Question types
tests/          Vitest unit tests (quiz builder, data layer, local storage)
```

## Adding your own content

The app reads all content through `src/lib/dataSource.ts`, which imports the
exported shapes `QUESTIONS`, `TOPICS`, `TOPIC_COUNTS`, and `ABBREVIATIONS` from
`src/data/`. Replace the sample data files with your own reviewed content using
the same shapes — no code changes are required.

## Medical disclaimer

LiverQ is an educational study tool and is **not** intended for direct patient
care, diagnosis, or treatment. The sample content is for demonstration only.
Always consult primary sources and current clinical standards for patient-care
decisions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Contributors **must not** submit
copyrighted guideline text, tables, or figures, or any patient information.
Sample content must be independently written. Please also read the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting security issues

See [SECURITY.md](SECURITY.md). Please do **not** open a public issue for
security reports; email **jamie.son.apps@gmail.com** instead.

## License

- **Code** — Apache License 2.0. See [LICENSE](LICENSE).
- **Sample content** (the demonstration questions, answers, and explanations) —
  Creative Commons Attribution 4.0 International (CC BY 4.0). See
  [CONTENT_LICENSE.md](CONTENT_LICENSE.md).
- **Third-party material** — organization names, titles, citations, and links
  are referenced for identification only and are **not** covered by the licenses
  above. See [NOTICE](NOTICE).

## Contact

Public contact: **jamie.son.apps@gmail.com**
