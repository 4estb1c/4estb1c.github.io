# Policy optimization algorithms

These algorithms share the same causal clock, evidence tools, target definitions, event weights, and evaluation schedule. Their key difference is when an old research trajectory receives supervision. They support either output recipe from [the proposal](01-PROPOSAL.md).

## Common scoring and storage

For a valid forecast f and an eligible target z, use R = -(f-z)^2/s_e^2. Binary questions use s_e=1. Center scores within the original question/date group: A_i=R_i-mean(R). Do not center across different questions. Do not divide by the group's standard deviation in the initial recipe. Signed errors are not suitable rewards: their group centering cancels the target entirely.

For malformed numeric output, record a failure separately from numerical forecast error. Expose a fixed format penalty as a configuration, never impute the terminal outcome or silently parse a convenient number from the rationale. Such a penalty defines a formatting-plus-forecasting utility, not a proper score over all possible strings. Abort a pilot with substantial invalid output and repair the output protocol before interpreting comparisons; monitor whether malformed output becomes a way to avoid large continuous losses.

Save the question, original target definition, evidence packet and versions, tool transcript, token IDs, action mask, sampling log-probabilities, forecast, scale, researcher/readout versions, random seed, and clock time. Save enough to recompute a loss later. Do not retain computation graphs across clock ticks.

## Algorithm 1: causal terminal-only replay

```text
Initialize policy, optional scalar forecaster, optimizer states, and global clock.
Load only evidence and labels permitted at the initialization date.

FOR EACH predeclared clock tick t:
    Reveal documents and terminal labels whose availability time is at most t.
    Freeze the researcher and readout versions for this tick.

    FOR EACH question scheduled for a forecast and not yet resolved:
        Build a point-in-time environment for this question at t.
        Sample G independent research trajectories with the frozen researcher.
        Produce one forecast per trajectory using the chosen output recipe.
        Append the immutable group to the forecast ledger.

    FOR EACH terminal label newly available:
        Find stored groups predicting exactly that terminal target.
        Score each group's archived forecasts against the terminal label.
        Center rewards inside each original group.
        Create a terminal target revision for each group.

    Select eligible terminal replay records from multiple event families.
    Apply event/group weights and the predefined replay budget.
    Run the delayed actor-update subroutine below.

    IF using a scalar forecaster:
        Train the forecaster on eligible packets and terminal targets.
        Keep this update separate from the actor's frozen reward phase.

    Atomically checkpoint the clock, models, optimizers, and replay ledger.
```

At a tick, newly available labels are known, but scheduled forecasts are collected before this tick's optimizer changes. A different predict/update order could also be causal; use this one consistently across methods. Events with a label already public are not active forecasting questions. Missing or ambiguous resolutions are censored, not silently scored as zero.

## Algorithm 2: latest-forecast replay with terminal anchoring

```text
Initialize identically to Algorithm 1.

FOR EACH predeclared clock tick t:
    Reveal only newly available evidence and terminal labels.
    Freeze the researcher and readout versions for this tick.

    FOR EACH scheduled unresolved question:
        Generate G fresh research trajectories and their forecasts.
        Store this new group before any optimizer update.
        Average its valid forecasts to form the teacher for this tick.
        Require the configured minimum number of valid teacher forecasts.
        Freeze the teacher value, provenance, and model versions.

        Select earlier groups for exactly the same original terminal target:
            adjacent mode: select only the most recent earlier group;
            all-earlier mode: select every earlier group.

        FOR EACH selected earlier group:
            Score its archived forecasts against the common teacher.
            Center scores inside that earlier group.
            Replace its active provisional target revision with this revision.
            Preserve older revisions for audit, not duplicate-label sampling.

    FOR EACH newly available terminal outcome:
        Supersede provisional revisions for its earlier groups.
        Assign terminal scores and within-group advantages.

    Batch eligible groups across event families, with explicit event weights.
    Apply the delayed actor update, respecting separate TD and terminal budgets.

    IF using a scalar forecaster:
        Train it directly on packets and the currently eligible scalar targets.
        Do not train it on today's targets before today's actor scoring.

    Checkpoint all state atomically and advance the clock.
```

With eight rollouts at each of dates 1, 2, and 3, the date-4 teacher scores 24 earlier forecasts in all-earlier mode, versus eight in adjacent mode. The date-4 group does not supervise itself. Do not count all old/new pairings as independent outcomes.

This is a bootstrap-target algorithm. It is not automatically TD(lambda): there are no specified eligibility-trace weights or Bellman-return recursion here. An explicit lambda-return variant can be added later, with its target and weights defined rather than inferred from the name.

### Provisional and terminal weighting

Predeclare a maximum revisit schedule and an interim budget W_TD per question. Divide W_TD across those planned teacher dates; at a teacher date divide that date's budget over the eligible earlier groups and their rollouts. Unknown future events or realized resolution times must not determine an earlier weight. Unused budget may simply remain unused in the first implementation.

Give each question a terminal budget W_MC=1, divided over its stored groups when its label arrives. Start with W_TD=0.25 and compare 0, 0.25, and 1. These are loss-weight budgets, not guarantees about total gradient norms. Additional replay epochs divide the revision's allotted weight rather than silently multiplying its total weight; separately test increased optimization exposure as a compute ablation. Log actual exposure after staleness filtering and incomplete batches.

Refreshing targets does not undo earlier parameter changes. Terminal anchoring can repair a bias empirically; it cannot guarantee reversal of every earlier teacher error. TD-only training is a diagnostic collapse control, not the recommended final method.

## Delayed actor-update subroutine

```text
Receive a batch of complete groups and frozen reward revisions.

FOR EACH stored trajectory:
    Re-run the current policy on its exact saved tokens and observations.
    Calculate log-probabilities only for model-generated action tokens.
    Compare them with probabilities from the actual behavior sampler.
    Measure policy drift, support mismatches, and importance-weight diagnostics.

Reject or quarantine records outside the configured staleness policy.
Do not regenerate replacement trajectories and call them original forecasts.

Form the clipped policy-gradient surrogate using the stored advantages.
Average action-token contributions within each trajectory.
Apply explicit rollout, group, event, and target-revision weights.
Accumulate gradients over microbatches to form one effective batch.
Check finite gradients, clip global gradient norm, and step the optimizer once.

Record which target revisions contributed and their consumed replay weights.
```

Start with a PPO-style token-ratio surrogate, clipping ratio changes to [0.9,1.1], gradient norm 1, and a tunable reference-policy KL penalty. This is a pragmatic biased replay estimator, **not an exact correction for arbitrary months-old trajectories**. Token ratios do not account for all shifted prefix/state visitation. Full trajectory importance ratios are a small-simulator reference; they can have intolerable variance for long tool traces. Group-mean baselines also deserve care off-policy: do not claim standard on-policy guarantees for the delayed surrogate.

Default sampling for the first real implementation: temperature 1, top-p 1, top-k disabled, and identical recorded transforms in generation and replay. If using a grammar or token mask, store it and normalize probabilities over the actual sampler support. Store raw and sampling-distribution log-probabilities when they differ. An unsupported behavior distribution must fail validation rather than produce plausible-looking ratios.

Initial staleness diagnostics: sampled token log-ratio mean/quantiles, token clipping fraction, policy-version age, and trajectory-weight ESS computed stably from trajectory log weights. ESS is a drift diagnostic, not an effective number of independent events. Pilot rejection candidates are clipping fraction above 0.2 or trajectory ESS below 0.25 of the batch; these are tunable heuristics, not validated guarantees. Report which questions and long-delay examples are excluded. If most terminal traces become unusable, the method has failed an important feasibility test; do not hide that with selective evaluation.

## Scalar-forecaster update subroutine

```text
Freeze the researcher.
Select archived evidence packets and targets available at the current clock.
Select the head-training data split; exclude validation and test event families.
Compute a scalar with the current forecaster and declared pooling rule.
Backpropagate weighted squared error through its head and permitted adapter only.
Use separate parameter groups for a new head and pretrained adapter.
Checkpoint the new forecaster version.
Use it only in subsequent collection/scoring phases.
```

Supervised packet regression does not need an actor importance ratio to minimize its declared replay-distribution loss. That distribution may still differ from current-policy packets; track the mismatch and use fresh-packet validation. Do not describe it as automatically optimizing the current policy's state distribution.

## Historical training baseline

```text
Freeze an allowed historical training corpus and its outcome labels.
Generate fresh current-policy research against archived evidence packets.
Use terminal rewards immediately; perform ordinary on-policy grouped updates.
Evaluate only on a separate genuinely later test period.
```

This can be a legitimate offline training baseline. It is not a valid historical backtest of the regenerated predictions. Compare it to causal methods on future generalization without declaring it invalid simply because it uses historical labels. Separately test deliberately look-ahead-contaminated replay only as a leakage diagnostic, never a publishable forecasting claim.

## Batch and learning-rate proposal

Start with G=8 and an effective batch of eight question/date groups, ideally from distinct families: 64 trajectories. On a 5080, use microbatch one and explicit accumulation. The existing smoke runner accumulates one group per update; the new group-aware sampler must implement the larger batch without mixing group centering. Small event pools require honest smaller/diverse batches, not repeated examples presented as independent data.

Pilot researcher LoRA rates: 1e-6, 3e-6, 1e-5. Scalar-head rate: 1e-4 initially, comparing 3e-5 and 3e-4; forecaster LoRA rate: 3e-6 initially. Use AdamW, explicitly declared weight decay (start zero), 5% warm-up for substantive runs, then constant rate within a fixed update budget. Two-step smoke tests need no warm-up. Tune rates separately for the two output recipes, because gradient scales differ.

Compare effective group batches 1, 4, and 8 only after the baseline works. Do not automatically scale learning rate linearly with batch size. Record generated trajectories, optimizer steps, unique event count, target refreshes, and cumulative event weights so changing one axis does not silently change the others.
