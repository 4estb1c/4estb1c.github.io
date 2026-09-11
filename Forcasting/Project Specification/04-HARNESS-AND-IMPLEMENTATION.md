# Harness and implementation contract

Build a small research system around explicit data contracts. Preserve the existing forecasting pipeline and local trainer; extend them rather than replacing the repository wholesale. Implement only code, configuration, tests, and documentation during the off-machine assignment. All model/data acquisition and real training must be opt-in operator actions later.

## Existing baseline

Inspect `src/training/local.py`, `rewards.py`, `clock.py`, `src/testing/test_training_core.py`, `scripts/train_local.ps1`, `scripts/setup_local_training.sh`, and `docs/local_training.md`. The working trainer is TRL-based numeric-probability GRPO, not continuous-return support, multi-tick replay, or a scalar network. The clock module contains gates, not a controller. Preserve its tested QLoRA compatibility fixes unless replaced with a verified alternative.

Inspect existing agent/tool, question, finance, and evaluation modules before adding interfaces. `CLAUDE.md`, `src/MODULES.md`, and the finance/workflow documents explain the current structure. Existing finance inputs are development data; neither their availability nor their point-in-time validity should be assumed publication-ready.

## Minimal components

| Component | Responsibility |
|---|---|
| Question/Target schema | Fixed target identity, origin/horizon, units, scale, resolution rule, split and event family |
| EvidenceStore | Immutable document versions and separate publication/first-available/ingestion times |
| ClockController | Monotone global ticks, reveal/collect/update order, model-information watermark |
| ResearchEnvironment | Time-filtered search/read/table tools with deterministic offline fixtures |
| ResearchPolicy | Sampling interface that returns tokens, behavior probabilities, and action masks |
| TokenReadout / ScalarForecaster | Separate output contracts and parameter ownership |
| ForecastLedger | Append-only predictions and model/evidence provenance |
| TargetRevisionStore | Teacher/terminal revisions, active revision, supersession and loss budget |
| ReplaySampler | Complete groups, event weights, staleness gates, no partial group centering |
| ActorUpdater / HeadUpdater | Separate gradient paths, optimizer state, drift diagnostics |
| Evaluator | Immutable forecasts, family-level splits, paired terminal scoring |

SQLite plus content-addressed files is sufficient initially. No distributed database, orchestration service, or agent framework migration is required. Handle path portability: no hardcoded Windows paths in library code. The existing personal PowerShell launcher may remain a convenience wrapper.

## Required records

**Question:** question_id, event_family_id, split, asset/entity, task_type, origin_at, target_at, target_definition_version, units, origin-frozen scale, resolution_rule, evidence eligibility.

**Document:** source_id, source_url, immutable content hash, published_at, first_available_at, ingested_at, revision_id, parent revision if any, license/access note. A later revised page with an old publication date is not earlier evidence.

**Rollout:** group_id, rollout_id, question_id, forecast_at, policy checkpoint hash, readout checkpoint hash, training-information watermark, prompt/template version, tool transcript, cited document hashes, token IDs, action mask, raw/sampler log-probabilities, decoding transforms, forecast or parse failure, RNG seeds, sampler selection probability.

**Target revision:** target_revision_id, group_id, kind (teacher/terminal), available_at, teacher model IDs and contributing rollouts, aggregation rule, scalar value, target identity and scale, superseded_by, eligible loss weight, consumed exposure. Teacher values must be stop-gradient data.

**Checkpoint:** researcher/readout weights, both optimizer/scheduler states, RNG states, clock, replay cursor, active revisions, selection state, cumulative exposure, source revision, configuration hash. A saved LoRA adapter alone is not resumable training.

## Clock invariants

- Every evidence version read at t has first_available_at <= t. Publication time alone is insufficient.
- Every model/adapter/teacher used for a genuine forecast has a training-information watermark <= t. Model release/cutoff uncertainty is separately declared.
- Terminal labels become accessible only at label_available_at, not simply target_at.
- Teachers are later than the student forecast, no later than the active clock, and predict the exact same target and units.
- Generate all scheduled groups at a tick before applying that tick's updates. Never train on a member's own teacher target before completing its group.
- Preserve originally issued forecasts. Training-time rescoring/regeneration uses a separate table/type.
- Test/validation labels cannot enter training, teacher aggregation, scale fitting, head fitting, retrieval indexes, or checkpoint selection beyond the declared validation protocol.
- Splits follow related-event families, not arbitrary rows. An issuer/event template can create correlated targets across horizons.
- Restarting after any committed step must neither repeat consumed target exposure nor skip an uncommitted update. Use transaction boundaries and a clearly documented recovery protocol.

## Tools and research packets

Start with `search_archive(query, as_of)`, `read_document(document_id, version)`, and `read_financial_table(entity, period, as_of)`. A price-history tool must enforce as_of and revision/adjustment conventions. Search over fake local fixtures first; later adapters may read user-supplied archives. No online download on import, test, dry-run, or default startup.

Use the same tool budget and output schema across the core output recipes. Evidence packets should contain cited observations, source timestamps, relevant calculations, uncertainties, and the original target definition. Distinguish observed facts from guesses. Do not place labels or future metadata in model-visible dictionaries and rely on a prompt to ignore them; build prompts from allowlisted fields.

Environment/tool text is untrusted data, never privileged instructions. Limit tool names, paths, response sizes, and execution time. Prefer parsed financial-table tools to arbitrary shell/code execution. A fake tool result containing instructions to reveal labels must not override clock controls.

Original research actions and follow-up calls are policy tokens; externally returned observations are not. Preserve this distinction through truncation, packing, and batching. Do not silently truncate the target definition or evidence; fail or use a specified summarization stage whose own information access is recorded.

## Loss fixtures and tests

Test at least: negative continuous returns and percentage/decimal confusion; binary boundaries; malformed/nonfinite output; fixed-target matching; scales fitted only on permitted history; teacher mean reward algebra; baseline-subtraction cancellation; date-4 replay counts; terminal supersession; equal event weighting under different revisit counts; masked observations; variable-length trajectory reduction; actual sampling transforms; stale replay; gradient ownership; optimizer restore; duplicate update prevention; chronological split leakage; and deterministic fake-environment end-to-end runs.

For the toy policy, compare a hand-computed on-policy gradient and full-trajectory importance-weighted gradient to implementation. Separately characterize the intentionally biased clipped token surrogate. A test passing for on-policy GRPO is not proof that delayed replay is correct.

Package dependencies so CPU-only schema/tests import without torch, CUDA, TRL, or network access where possible. Backend-specific tests can skip clearly when unavailable. Provide tiny locally initialized neural modules for gradient tests if torch is already present; never fetch a pretrained checkpoint for a test.

## Delivery milestones

1. **Contracts and simulator:** schemas, fake tools/policies, target revisions, clock, loss fixtures, event-level evaluator.
2. **Token baseline:** continuous parser/scoring, group-aware batching, offline historical and causal terminal modes, full checkpoint contract.
3. **Delayed replay:** adjacent/all-earlier teacher revisions, stored behavior probabilities, loss budgets, staleness metrics and filtering.
4. **Scalar recipe:** scalar head, separate optimizer/adapter ownership, collection-time and explicitly named rescoring modes, alternating phases.
5. **Experiment configurations:** E0–E6 config templates, dry-run validation, run manifests, paired evaluation/report commands, scaling orchestration without launching jobs.

Each milestone must have runnable offline tests and documented limitations. Do not leave core paths as silently successful stubs. Unsupported backends must fail clearly. A Tinker or distributed backend can remain an explicit extension interface until the local mathematical contracts are verified.
