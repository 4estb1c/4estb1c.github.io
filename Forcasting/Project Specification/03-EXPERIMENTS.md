# Experiment specifications

The principal outcome is terminal forecasting quality on held-out event families. Learning curves against unique events matter more than matching FLOPs. Extra compute is allowed, but its use must be measured. Configuration values below are pilot defaults, not power calculations or claims about available data.

## E0. Offline correctness and infrastructure

Implement CPU-only fixtures before any model run: deterministic toy policies, eight-rollout groups, four forecast dates, one fixed terminal target, delayed labels, and a fake research environment. Exercise both output modes and all feedback modes. No network or model download is required.

Acceptance: clock invariants hold; future evidence and label-derived model states are rejected; losses match hand calculations; the date-4 all-earlier case touches exactly groups 1–3; action masks exclude observations; revision replay is idempotent after restart; scalar loss differentiates only through allowed parameters; delayed token updates change the expected toy parameters.

Operator-run GPU smoke: Qwen2.5-3B-Instruct QLoRA, two optimizer steps, G=4 then G=8, short synthetic contexts, save/reload. The existing token-probability smoke succeeded; continuous numeric output and scalar-head paths still need implementation and testing.

## E1. Teacher quality and variance

Before large RL runs, freeze the researcher/readout and generate repeated forecasts of the same terminal targets at scheduled horizons. Suggested pilot: up to 128 training/validation event families, three or four snapshots per event, two independent teacher batches at selected dates, G=8. The eventual test set remains sealed.

Compare G=1,4,8,16 teachers using nested subsets of saved samples; mean versus median/trimmed mean; fresh research versus earlier-evidence union; market-conditioned versus market-blind inputs. Measure terminal MSE by horizon, within-event teacher repeatability, earlier-versus-later error, advantage sign stability, and gradient variability on a small subset.

In a simulator with known conditional expectations, vary world noise, teacher bias, and research noise independently. Compare terminal advantages to oracle-teacher and learned-teacher advantages. This distinguishes variance reduction from merely reducing agreement loss. It also tests whether the proposed all-earlier update strengthens a shared error.

Gate: if later teachers are systematically worse or unstable, first improve research/readout or reduce TD weight. Do not assume closer-to-resolution error must decrease monotonically for a learned model.

## E2. Core method comparison

Use the same event universe, target units, information policy, snapshot schedule, initialization, and sealed future test period. Run three pilot training seeds, expanding to five or more for a confirmatory small-model result when feasible.

| ID | Output recipe | Feedback | Purpose |
|---|---|---|---|
| E2-T-MC | Numeric tokens | Causal terminal-only replay | Main token baseline |
| E2-T-ALL | Numeric tokens | Latest teacher to all earlier groups + terminal | Main proposed token method |
| E2-S-MC | Separate scalar network | Causal terminal-only replay | Direct-gradient readout baseline |
| E2-S-ALL | Separate scalar network | Latest teacher to all earlier groups + terminal | Main proposed scalar method |

Add adjacent-bootstrap versions after these four cells pass. Also include: unchanged model with the same research tools; frozen model with inference ensembles; and conventional historical terminal-reward RL. Give each method validation-selected replay/learning-rate choices rather than starving the baseline of extra compute.

Use two distinct evaluation protocols:

1. **Frozen future generalization:** finish all training using labels available before a cutoff, freeze all trainable components, then evaluate on later held-out events. This answers whether the training recipe transfers.
2. **Causal online adaptation:** maintain disjoint evaluation event families while training may continue on other families as their labels become available. Evaluate every saved prediction before its label. Declare cross-family public information and model updates explicitly. This answers whether the deployed learning process helps over time.

Do not combine these endpoints. A model initialized after the simulated period may already contain future knowledge; call that clock-correct fine-tuning with potentially contaminated initialization, not a fully causal historical simulation. A prospective post-release test is strongest where pretraining cutoffs are uncertain.

## E3. Replay and co-training ablations

After E2, vary one factor at a time before selected interactions:

- Adjacent versus all-earlier replay; fixed interim weights 0,0.25,1; terminal-only and TD-only diagnostic.
- Stored trajectories versus fresh retrospective regeneration; latter reported only as historical training.
- One versus additional replay passes, with both fixed loss exposure and deliberately increased exposure variants labeled.
- Collection-time scalar readout rewards versus current-frozen-head rescoring; frozen head versus alternating head training.
- Same-base separate adapters versus smaller independent forecaster; linear versus small MLP scalar head.
- Frozen-readout scoring of research from each policy, and no-research ablation, to diagnose research improvement.
- Conservative versus relaxed staleness thresholds; report rejected trace fractions and their event/horizon distribution.
- Forecaster-only supervised learning on cached evidence versus researcher RL. Direct scalar regression is a serious baseline, not merely an auxiliary loss.

Prefer three-seed pilots and validation pruning to a giant factorial. Keep final test evaluation to predefined checkpoints/configurations.

## E4. Pre-cutoff training and memorization

The proposed zero-shot improvement reward has an exact negative control. If every rollout's reward is S(f_i,Y)-S(f_0,Y), subtracting the group mean cancels the zero-shot term. Under demeaned GRPO it is the same advantage as S(f_i,Y). It does not filter memorized examples.

Implement four variants: ordinary terminal score; baseline subtraction (must be algebraically identical under the same samples); explicit frozen example eligibility; and explicit soft event weighting. Freeze the zero-shot model and cache several baseline generations before training. Apply event weights outside group standardization. Define thresholds in validation and keep them fixed.

For continuous returns, near-correct zero-shot output can be luck or a strong base-rate forecast, not memory. Define filters using standardized error and stability but do not call them a memorization detector. For binary outcomes, confident correctness is also only a proxy. Evaluate every variant on the same complete clean future test set, not its filtered subset.

Add controlled contamination: twin initializations, with known outcome information injected into one copy on an isolated training subset at several doses. Measure retrieval/answer recall, value of research, and subsequent clean forecasting. Keep injected examples and related families out of evaluation. This intervention is more informative than assuming pre/post-cutoff score gaps measure memory.

Track pre-cutoff data as transfer-training material. Research can elicit latent knowledge that zero-shot prompts failed to retrieve. Frozen page snapshots and clean-looking reasoning do not cure weight contamination.

## E5. Scaling study

Build curves in stages, using nested event-family subsets. Pilot budgets: 32,64,128,256 distinct events if genuinely available; expand only with defensible labels. Maintain known unresolved-pool size separately. Repeated snapshots do not increase the number of labeled events.

1. **Data:** vary unique resolved-event budget at fixed model family and evaluation period.
2. **RL compute:** vary G=4,8,16, replay passes, and optimizer budget separately. Compare frozen-model inference ensembling too.
3. **Window:** compare expanding histories with a fixed endpoint; then fix event count across different history durations to separate data volume from recency/diversity. Select windows causally and do not use eventual unresolved-event resolution to decide earlier eligibility.
4. **Model size:** start Qwen2.5 0.5B,1.5B,3B, then 7B only after profiling and license/revision checks. Same-family models still differ in pretraining and ability; document those confounders. Tune per-size learning rates on validation.
5. **MoE:** exploratory only after a dense result. Report active and total parameters, training lineage, context, FLOPs, and memory. Compare both active-capacity and total-capacity views where possible. Current unmatched open-model comparisons cannot identify architecture causally.

The MoE hypothesis is that larger sparse total capacity at comparable active capacity may amplify outcome-memory shortcuts under sparse supervision. Test memory and forecasting quality separately; informed factual recall can help forecasts. A matched tiny dense/MoE controlled study is a mechanism experiment, not evidence that all large MoEs forecast poorly. Its code can be planned now; execution and data acquisition remain separate.

Fit response curves with uncertainty before fitting power laws. Claim a scaling law only if a parametric relation predicts held-out scales/windows; the dataset may support only a scaling study. Do not demand a desired sign or monotonic curve from results.

## E6. Domain robustness and economic relevance

First continuous pilot: fixed-horizon equity returns after filings, with a frozen schema for split/dividend adjustments, corporate actions, delistings, origin price, terminal price, and data availability. A point-in-time factor-residual target is an extension; factor exposures must be estimated using only origin-available history. It does not make companies independent.

Add fundamental line-item forecasts where labels can be tied to original versus revised filings unambiguously. Binary event questions provide a separate literature-comparable task. No automated question generation from a future article may copy answer-bearing facts into an earlier prompt. Generated wording needs outcome-blind templates or an audited generation pipeline.

Report terminal trading utility only under separately specified position limits, execution prices, costs, and rebalance rules. Better normalized MSE does not establish profitable trading. No intermediate PnL rewards are used in the primary algorithms.

## Evaluation and uncertainty

Average prespecified forecast-date losses within each event before comparing policies, then aggregate with declared event weights. For A versus B use paired event differences, lower being better for A:

$$
d_e=\frac{1}{|\mathcal T_e|}\sum_{t\in\mathcal T_e}
\left[\frac{(f^A_{e,t}-Y_e)^2}{s_e^2}-\frac{(f^B_{e,t}-Y_e)^2}{s_e^2}\right].
$$

Primary reporting: paired mean difference and a confidence interval from prespecified related-event cluster resampling. Add calendar-block sensitivity analysis for common shocks and overlapping horizons. Where event families cross time blocks, do not pretend they form a simple nesting; use conservative block aggregation or an explicitly justified multiway method. Report seed-level results and uncertainty from training randomness separately or with a justified crossed resampling scheme.

A paired t-test on approximately independent cluster aggregates is a secondary transparent check. Never treat rollouts, snapshots, or seed-event cells as independent replicates. Choose one main comparison before the confirmatory run; label other comparisons exploratory or adjust multiplicity. A nonsignificant difference is not equivalence. Use pilot cluster variance and a smallest worthwhile improvement for power planning; no arbitrary event count guarantees significance.

Publish failed runs, invalid outputs, missing labels, replay exclusions, compute accounting, and negative results. Teacher agreement loss is diagnostic only; held-out terminal error is the endpoint.
