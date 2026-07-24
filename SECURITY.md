# Security Policy

## Reporting a vulnerability

If you discover a security or privacy issue in LiverQ, please report it
**privately**. Do **not** open a public GitHub issue, pull request, or
discussion for security matters, because that would disclose the problem before
it can be addressed.

**Email:** jamie.son.apps@gmail.com

Please include, where possible:

- A description of the issue and its potential impact
- Steps to reproduce, or a proof of concept
- The affected page, file, or component
- Any suggested remediation

## What to expect

This project is maintained by a single maintainer, so responses are on a
best-effort basis. You can expect:

- An acknowledgement of your report when it is read
- An assessment of the issue and, if confirmed, a plan to address it
- Credit for the report if you would like it (let us know)

Please give the maintainer reasonable time to address the issue before any
public disclosure.

## Scope

LiverQ is a static, client-side web app with **no backend and no user
accounts**. All data (bookmarks, answered questions) is stored locally in the
browser. Reports that are most relevant include, for example:

- Cross-site scripting (XSS) or content-injection in the app
- Exposure of secrets or private data in the repository or build output
- Supply-chain issues in dependencies

## Privacy note

LiverQ does not collect analytics and does not transmit user answers to any
server. If you believe user data could be exposed or exfiltrated, please treat
it as a security issue and report it privately using the email above.
