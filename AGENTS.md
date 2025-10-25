# Repository Guidelines

## Project Structure & Module Organization
- `index.html` is the single-page app entry point; update section content and modals here.
- `css/styles.css` centralizes layout, animations, and responsive rules; keep new styles modular and grouped by component (header, canvas grid, sidebar).
- `js/app.js` bootstraps the UI; supporting modules are split by concern: `canvas.js` manages data load/save, `auth.js` controls edit locks, `drag.js` handles drag-and-drop, and `github.js` covers future GitHub integrations. Legacy layouts live in `skill_sprint_traditional_canvas.html` for reference.

## Build, Test, and Development Commands
- `python3 -m http.server 3000` — serve the static site locally for quick iteration.
- `open http://localhost:3000/index.html` — macOS shortcut to launch the canvas in a browser; choose another command on other OSes.
- `npx prettier --check index.html css/styles.css js/*.js` — optional guard to spot formatting drifts before committing.

## Coding Style & Naming Conventions
- Use four-space indentation across HTML, CSS, and JS to match the current files; prefer single quotes in JavaScript.
- Keep function names action-oriented (`initDragAndDrop`, `loadCanvasData`) and CSS class names dashed (`.canvas-header`).
- Group related DOM hooks with leading comments and avoid inline `<script>` blocks; extend existing modules instead of creating new globals.

## Testing Guidelines
- After changes, run the local server and verify: edits persist via local storage, drag actions respect authentication, and the statistics panel updates live.
- Exercise both authenticated and view-only flows by toggling the mock auth state in `auth.js`.
- Smoke-test on mobile viewport widths (Chrome dev tools) to confirm responsive grid behavior; log defects as GitHub issues with reproduction steps.

## Commit & Pull Request Guidelines
- Follow the established git history: start with an imperative 50-character subject (`Refactor drag handles`), add context in the body if needed, and scope commits narrowly.
- PRs should include a concise summary, linked issues, screenshots or screen recordings of UI changes, and notes on manual verification.
- Request review from another contributor before merging; use draft PRs for work-in-progress updates.

## Security & Configuration Tips
- Do not embed secrets or API keys in `auth.js` or `github.js`; rely on server-side proxies if future integrations require credentials.
- Confirm GitHub Pages config after structural changes so the deployed `index.html` remains the default entry point.
- Document any new environment expectations (e.g., browser support, feature flags) in README.md alongside your PR.
