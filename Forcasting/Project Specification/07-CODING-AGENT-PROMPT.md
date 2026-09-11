# Prompt for the implementation agent

You are implementing a research system for sample-efficient language-model forecasting. Read every Markdown file in this specification directory before coding. The neighboring older forecasting notes are context; where they conflict, follow this directory and explicitly flag material ambiguity. Do not silently convert the continuous-return project into binary forecasting.

## Your assignment

Implement the staged system specified in `04-HARNESS-AND-IMPLEMENTATION.md`, with executable configurations for the experiments in `03-EXPERIMENTS.md` and machine profiles in `05-MACHINES-AND-RUNS.md`.

The first-class output recipes are:

1. Researcher emits a numeric return in tokens; train generated actions with grouped policy-gradient rewards.
2. Researcher produces an evidence packet; a separate scalar forecaster learns by direct regression while the researcher learns through policy gradients. Implement distinct parameter ownership and alternating frozen phases.

For both, implement causal terminal-only replay, adjacent later-forecast bootstrapping, and latest-forecast supervision of all earlier groups. Include the conventional historical terminal-training baseline with a clearly separate evaluation contract. The pseudocode in `02-ALGORITHMS.md` defines the intended behavior.

## Hard boundaries

- Write code, configs, offline fixtures, tests, and documentation only.
- Do not download anything: no models, tokenizers, datasets, package installation, external corpora, or fetching repositories. Work from the checkout and installed dependencies supplied to you. If something is absent, provide an explicit later operator command and report the untested path.
- Do not train real models, launch GPU jobs, provision machines, call paid APIs, or upload artifacts.
- No network calls in imports, unit tests, config validation, or default execution. Use fakes and local-files-only loading.
- Do not overwrite user changes or existing forecasting tools. Inspect Git and repository instructions first. Reuse the existing local QLoRA runner and finance/harness modules where appropriate.
- Never use interim market observations as reward labels. Only later model forecasts of the identical terminal target and eventually terminal outcomes provide supervision.
- Never replace an originally issued forecast with a regenerated or rescored one in evaluation.
- Do not claim zero-shot baseline subtraction filters memorization, that MoE must lose, that a calendar clock cures pretrained knowledge, or that clipped token ratios make arbitrary old traces unbiased.

## Working method

Maintain a root `PLAN.md`. Build in small tested milestones, with clear commits if Git is available. If delegating, use isolated worktrees and narrow tasks, then review integration. Avoid a broad framework rewrite or speculative cloud abstractions. Preserve unrelated changes and do not push externally unless separately authorized.

Start with CPU schemas, a deterministic fake research environment, hand-calculated reward/gradient tests, and a four-date replay fixture. Then connect trainer interfaces. The tests must cover actual behavior, not only whether classes instantiate. Unsupported backend operations must fail explicitly; no success-shaped placeholders.

Make replay probability conventions, group/event weighting, masks, scalar parameter ownership, teacher versioning, and checkpoint recovery inspectable. Each configuration must record all scientifically relevant choices. The core must run offline without a downloaded model; GPU integration commands may remain unexecuted if hardware/dependencies are absent.

Implement conventional model-generation adapters without fetching model files. Provide explicit operator instructions to prepare dependencies/models later, including exact machine assumptions. For multi-GPU/Tinker extensions, prioritize interfaces and loss fixtures rather than pretending those backends were tested.

## Required delivery

Write a root **`IMPLEMENTATION_REPORT.md`** and use it as your final handoff. Include:

1. What you implemented, mapped to each milestone and experiment ID.
2. Files and commits changed; any deviations and why.
3. Exact offline test commands and actual results; skipped tests with reasons.
4. Exact future setup, model/data preparation, smoke, training, evaluation, and resume commands. Mark proposed/unimplemented commands honestly.
5. Expected input schemas with tiny synthetic examples and explicit target units.
6. Machine requirements and memory assumptions, distinguishing measured from estimated.
7. Remaining scientific choices, unsupported features, and blockers.
8. A prioritized checklist for the human operator's first GPU session.
9. Confirmation that you did not download assets, install dependencies, run real training, incur cloud costs, or upload data.

Also supply configuration templates for E0–E6, a concise repository README entry, and the deterministic offline fixtures. Return a link/path to `IMPLEMENTATION_REPORT.md` in your final response. Do not report experimental wins: this assignment builds the system, not the evidence.
