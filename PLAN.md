# Forecasting notes download

## Scope

Publish the requested `Forcasting` notes folder, including the new project specification, and a matching root-level `blf.zip`. Preserve the existing site and `/blog` without redesign or routing changes.

## Plan

1. Integrate the reviewed Markdown specification into the notes folder.
2. Copy only that folder into this checkout and create its ZIP archive.
3. Verify file counts, source/archive hashes, and absence of unrelated vault/config files.
4. Commit and push the scoped changes to the existing GitHub Pages branch.
5. Verify the published ZIP and existing blog route.

## Ledger

Root agent owns integration and publication. No implementation subagents used for this publication; earlier read-only research findings were incorporated into the specification. No training or model/data downloads are part of this change.

## Status

GitHub device authentication completed. The notes snapshot and ZIP have been refreshed, including the explicit volatility-normalized loss specification, and passed file-by-file SHA-256 validation. Existing pages remain unchanged. Push this validated snapshot and verify the served ZIP hash and existing `/blog/` route after GitHub Pages finishes deploying.

# Inspector — 2026-09-25

## Goal

Publish `/Inspector/` as a reusable, responsive reader with aligned commentary, glossary, original-note styling, figures, a shared evidence corpus, and a Codex authoring/discussion workflow. The first companion covers all nine sections of *Situational Awareness*; preserve the rest of the existing site.

## Decisions

- Static GitHub Pages in this repository, at the user's requested `/Inspector/` route; the site's existing `CNAME` is `forrestbicker.com`.
- Standardized semantic blocks; source text and commentary are separate. No hosted model or on-page research generation.
- The source offers no republication licence. Until permission is established, publish independent claim summaries and canonical links, clearly marked as summaries. Keep the template ready for authorized full text.
- Evidence has dated status, source, and caveat. Charts distinguish reported data, research estimates, and illustrative arithmetic.

## Next steps

1. If republication rights are established, replace independent claim summaries with the authorized original text and footnotes using the existing block renderer.
2. For later articles, start with `Inspector/prompts/research-and-annotate.md` and check the shared evidence registry before new research.

## Subagent ledger

| Agent/task | Branch or worktree | Status | Integration |
| --- | --- | --- | --- |
| Root: planning, editorial, integration, publication | `main` | Published | Commentary and context through `57d3db9`; review fixes `0dec1b1` |
| Evidence corpus | `agent/margin-evidence` | Reviewed | `b3f9ae1`, `65e2061`, `8be12b6`, `d7719eb` |
| Initial reader | `agent/margin-reader` | Reviewed | `e7dd8cd` |
| Authoring workflow | `agent/margin-workflow` | Reviewed | `c2a1347` |
| Reader polish | `agent/inspector-reader-polish` | Reviewed and integrated | `d2beb96`; root review fixes `0dec1b1` |
| Evidence links and independent audit | `agent/inspector-evidence-links` | Reviewed and integrated | `f690318`, `664aafb`, `5630ed3` |

## Verification so far

All 32 paired passages, nine chapter dividers, seven figures, and provenance labels render without browser errors or literal `undefined` text. Desktop and 390px mobile layouts have no document-wide horizontal overflow; mobile commentary expands inline. JavaScript syntax, article/context validation, sitemap parsing, and Git whitespace checks pass. An independent review identified chart-readability, context-link, accessibility, and glossary-input issues; root addressed them before publication.

GitHub Pages deployment of `0dec1b1` completed successfully. The live `/Inspector/` library, article, research context, agent prompt, and existing `/blog/` returned HTTP 200; the live reader rendered all 32 rows, nine chapters, and seven figures without console errors.

# Margin rename — 2026-09-25

## Goal

Rename the published project and route to `/Margin/` throughout the interface, article data, prompts, research workflow, code, and sitemap. Redirect the previously shared `/Inspector/` library and article links to their new locations.

## Plan and ledger

1. Move the tracked project directory and rename its validation CLI; update product-facing names and paths.
2. Add small legacy redirects for the two published Inspector entry points.
3. Rebuild context, validate data and JavaScript, check desktop/mobile pages locally, commit and push, then verify GitHub Pages.

Root agent owns this scoped rename and integration on `main`. No subagent needed for a straightforward, coupled path change.

## Completion and live verification

Completed in `36cb002` and published to `/Margin/`. The live library, article, context, prompt, and JavaScript returned HTTP 200. Published HTML, article data, context, JavaScript, and stylesheet match the checkout after normalizing line endings. The live reader renders 32 paired rows, nine chapters, and seven figures with no console errors or document-wide horizontal overflow. Data validation, JavaScript syntax, and Git whitespace checks pass. The edition remains a companion of linked claim summaries, not a full-text republication or an exhaustive audit of every numerical claim.

For subsequent articles use `Margin/prompts/research-and-annotate.md`; shared evidence is in `Margin/research/evidence.json` and discussion context in `Margin/context/`.
