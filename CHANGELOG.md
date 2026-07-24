# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to adhere to [Semantic Versioning](https://semver.org/).

## [0.1.0]

Initial public release of the LiverQ open-source application framework.

### Added

- Reusable application source code and UI (React + TypeScript + Vite).
- A small, independently written demonstration question set: 16 questions across
  4 general topics (Liver Basics, Viral Hepatitis Basics, Cirrhosis and
  Complications, Liver Tests and Imaging), plus 20 standard abbreviations.
- Unit tests (Vitest) for the quiz builder, the approved-question data layer,
  and local-storage helpers.
- Continuous integration (GitHub Actions): install, type-check, test, build.
- Project documentation: README, LICENSE (Apache-2.0), CONTENT_LICENSE.md
  (CC BY 4.0), NOTICE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, and GitHub issue
  and pull-request templates.

### Notes

- The production educational content bank is **not** included in this
  repository; the included questions are limited demonstration content.
