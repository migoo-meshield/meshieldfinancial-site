# OpenMontage (archived: evaluated, NOT installed, NOT executed)

Status: archived on 2026-11-13. Decision by Migoo: stay with `remotion-shorts-skill` for now. Do not install or run OpenMontage unless Migoo asks again.

- Repo: https://github.com/calesthio/OpenMontage (AGPL-3.0). Reviewed commit `fecb9a1` (2026-11-08).
- What it is: an agentic video production system for coding assistants (research, script, voiceover, stock footage, Remotion/HyperFrames render, FFmpeg). 9:16 profiles for Shorts, Reels, TikTok. Free stack works with no keys (Piper TTS, FFmpeg, Pexels/Pixabay); paid providers are optional (fal.ai, ElevenLabs, Runway...). Default budget cap $10, approval above $0.50 per action.
- Requires: Python 3.10+, Node 22/24/26, FFmpeg, `make setup`. Runs on a laptop, not in the cloud.

## SkillSpector static scan (`--no-llm`, v2.12.0)

Score 100/100 CRITICAL, DO_NOT_INSTALL, but judged noise after manual source review. Verdict: **CAUTION**, nothing malicious found.
- 553 HIGH "Concealed Executable" (SC9): every `.py`/`.ts` file inside skill folders. A code repo, so expected.
- 44 HIGH credential-access (PE3): instructions to store API keys in `.env`. Normal.
- 11 HIGH hidden-instructions (P2) and 6 CRITICAL (YR1): false positives (HTML comments, a documented HeyGen `curl` example using `$HEYGEN_API_KEY`).
- Manual review: only common Python dependencies, no npm postinstall, no `curl | sh` or `eval` in core code, no `shell=True`, network only to provider APIs, no telemetry, no hooks, nothing reading `~/.ssh`. Not every one of 800+ files was read.

## If it is ever installed

1. Never inside `meshieldfinancial-site` or any repo (everything in the site repo is public). Use a separate folder such as `~/OpenMontage`.
2. API keys only in the local `.env`, never in chat or in git.
3. Use the venv that `make setup` creates. Keep the $10 budget cap.
4. Re-scan with `skill-inspector` first, since the repo changes often.
