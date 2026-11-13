# Notes for Claude on this repo (meshieldfinancial.com)

- Marketing content (blog, social, email, video scripts, ads): read `.claude/brand-voice.md` first and follow it. Run `meshield-terminology-checker` before anything is published. Do not post, schedule or send without Migoo's approval.
- Replies to Migoo are in Haitian Creole.
- Everything in this repo is deployed as the public website. `/.claude/`, `/.github/` and `/scripts/` are redirected away in `_redirects`, so never put secrets or private data anywhere in the repo.
- Pages are bilingual with `data-en` / `data-ht` pairs. Change both languages together.
- After changing `style.css`, `theme.css` or `shared.js`, bump the `?v=` version in the pages that load them.
- Push to `main` directly. Check desktop and mobile in a real browser before pushing UI changes.
