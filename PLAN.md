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

# Margin — 2026-09-25
Goal: Publish /Margin, a reusable article reader with aligned research commentary, original notes, glossary, charts, shared evidence, and offline agent workflows. Preserve existing website.
Decisions: Static GitHub Pages; standardized semantic article blocks; source/annotation separation; primary-source dated evidence; no hosted inference. Main agent writes final commentary. Full original reproduction depends on source permission/license; otherwise use brief excerpts and source links.
Next: research/source audit, reader implementation, reusable tooling, editorial integration, adversarial review, browser validation, push and verify.
Ledger:
- Root: planner/editor/integrator, main, active.
- Reader agent: agent/margin-reader, pending.
- Evidence agent: agent/margin-evidence, pending.
- Workflow agent: agent/margin-workflow, pending.
