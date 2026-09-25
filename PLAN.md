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

1. Commit the final review fixes; the reader and evidence branches are integrated.
2. Push `main`, then verify `/Inspector/`, the article, generated context, and existing routes on GitHub Pages.

## Subagent ledger

| Agent/task | Branch or worktree | Status | Integration |
| --- | --- | --- | --- |
| Root: planning, editorial, integration, publication | `main` | Active | Commentary and context through `57d3db9` |
| Evidence corpus | `agent/margin-evidence` | Reviewed | `b3f9ae1`, `65e2061`, `8be12b6`, `d7719eb` |
| Initial reader | `agent/margin-reader` | Reviewed | `e7dd8cd` |
| Authoring workflow | `agent/margin-workflow` | Reviewed | `c2a1347` |
| Reader polish | `agent/inspector-reader-polish` | Reviewed and integrated | `d2beb96`; root review fixes pending commit |
| Evidence links and independent audit | `agent/inspector-evidence-links` | Reviewed and integrated | `f690318`, `664aafb`, `5630ed3` |

## Verification so far

All 32 paired passages, nine chapter dividers, seven figures, and provenance labels render without browser errors or literal `undefined` text. Desktop and 390px mobile layouts have no document-wide horizontal overflow; mobile commentary expands inline. JavaScript syntax, article/context validation, sitemap parsing, and Git whitespace checks pass. An independent review identified chart-readability, context-link, accessibility, and glossary-input issues; root addressed them before publication.
