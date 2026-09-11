# Forecasting RL: project specification

> We want to keep improving our forecasts as new information arrives, without always waiting for the outcome to resolve.

This directory is the implementation handoff for a sample-efficient forecasting RL project. Its central question is whether a later, better-informed forecast can provide useful supervision for earlier research. Actual terminal outcomes remain the final authority.

The most important experimental axis is **how the forecast is produced**: a researcher that emits a return in tokens, versus a separate network that reads the research and emits a continuous scalar. Those approaches need different gradient paths and training schedules. Neither is assumed superior.

Read in this order:

1. [Proposal and decisions](01-PROPOSAL.md): hypotheses, scope, and the output-network recipes.
2. [Algorithms](02-ALGORITHMS.md): English pseudocode, scoring, delayed replay, and batching.
3. [Experiments](03-EXPERIMENTS.md): baseline comparisons, teacher diagnostics, contamination, scaling, and statistics.
4. [Harness and implementation](04-HARNESS-AND-IMPLEMENTATION.md): interfaces, invariants, offline tests, and milestones.
5. [Machines and run configurations](05-MACHINES-AND-RUNS.md): the existing 5080 setup and proposed configurations.
6. [Paper outline and literature](06-PAPER-AND-SOURCES.md): claims we could establish, related work, and limitations.
7. [Coding-agent prompt](07-CODING-AGENT-PROMPT.md): the complete assignment, including the required Markdown handoff.

## Status and authority

These are research proposals and implementation requirements, not completed experiments. The coding agent should implement the system and CPU/offline tests; **it must not download models or datasets, provision hardware, call paid services, or run training**. A separate operator will execute the resulting commands.

The existing `BLF-RL` repository already contains a working local Qwen2.5-3B-Instruct NF4 QLoRA GRPO smoke runner. A 20-step run and adapter reload succeeded on an RTX 5080; this establishes infrastructure feasibility on short synthetic prompts, not forecasting improvement. The current runner handles binary probabilities, not the continuous-return research system specified here.

This specification takes precedence over conflicting older brainstorming notes in the parent folder. In particular: no interim market-return rewards; sample efficiency rather than iso-compute; no assumption that zero-shot subtraction removes memorization; no assertion that MoE must be worse; and no claim that replay guards alone enforce causality. Older notes are preserved as historical context.

The proposal remains open to review. Implement the named variants as explicit configurations; do not silently choose an unresolved scientific assumption or expand into unrelated infrastructure. The larger vault has not been fully audited. The literature section records the sources used for this design, not an exhaustive systematic review.
