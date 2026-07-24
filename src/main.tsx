import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

/**
 * Hidden dev-only editor route. Matched by path (/editor, /dev/question-editor)
 * or hash (#/editor) so it works in `vite dev` without a router dependency. It
 * is never linked from the app UI.
 *
 * PRODUCTION SAFETY: the editor is a developer authoring tool and must not ship
 * to end users. `import.meta.env.DEV` is replaced with a literal at build time,
 * so in production the guard is statically `false` and the dynamic import()
 * below is tree-shaken out entirely — QuestionEditor is not in the prod bundle,
 * and hitting /editor in production just renders the normal app.
 */
function isEditorRoute(): boolean {
  const path = window.location.pathname.replace(/\/+$/, '')
  const hash = window.location.hash
  return (
    path === '/editor' ||
    path === '/dev/question-editor' ||
    hash === '#/editor' ||
    hash === '#editor'
  )
}

const root = createRoot(document.getElementById('root')!)
const IS_DEV = (import.meta as unknown as { env: { DEV: boolean } }).env.DEV

if (IS_DEV && isEditorRoute()) {
  // Dev-only: lazy-load the authoring tool so it never enters production output.
  import('./screens/QuestionEditor').then(({ QuestionEditor }) => {
    root.render(
      <StrictMode>
        <QuestionEditor />
      </StrictMode>
    )
  })
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
