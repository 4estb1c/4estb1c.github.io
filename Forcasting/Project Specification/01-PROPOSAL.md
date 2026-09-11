# Learning from forecasts before outcomes resolve

We want time to teach the model before the answer arrives. A forecast may take months to resolve, but the intervening evidence can already tell us something useful. The proposal is to let later research supervise earlier research, then anchor learning to the eventual outcome.

The causal clock is a constraint, not a performance claim. Its value is that a policy at date t has only learned from information available by t. The scientific question is whether bootstrapping within that constraint improves sample efficiency and future generalization. It may not.

## 1. The prediction target

Begin with continuous, judgmental financial forecasting: reading disclosures and other timestamped evidence to estimate a specified future return. Use binary event forecasting as a separate replication track, not an unnoticed replacement of the main task.

Each question specifies an asset, origin date, terminal date, return convention, units, and resolution rule. Every revisit predicts that same target. A February revisit of a January-to-March return must not become a prediction of February-to-March return. Prefer an explicit original-horizon output. Any remaining-return conversion belongs inside the forecasting interface and must be tested.

Interim market observations are inputs to research and forecasting. They are **not** intermediate labels, PnL increments, or reward targets. The hypothesis is that the model can interpret information in the market while improving on its forecast; it is not that the model is already proven better than the market. Include market-conditioned and market-blind input ablations, but do not make mark-to-market reward an equal default recipe.

Use mean squared error as the principal continuous forecasting objective. A return forecast that is accurate in expectation can still lose on one realization. Raw PnL encourages extreme positions without a separate risk/position definition, so evaluate trading utility separately. Binary replication uses Brier loss. Report RMSE if helpful, but optimize squared error rather than the square root of a noisy minibatch loss.

For heterogeneous returns, define a strictly positive scale s_e from information available at the question's origin, then freeze it for every revisit of that target. Scoring (f-Y)^2/s_e^2 changes the cross-event weighting intentionally. Report both normalized and raw-unit results. Never estimate scales on the complete train-plus-test period or refit a target's scale as its outcome approaches.

## 2. Three independent design axes

| Axis | Initial alternatives | What the comparison isolates |
|---|---|---|
| Output | Numeric tokens; separate scalar forecaster | Prediction parameterization and its training recipe |
| Feedback | Terminal only; next-forecast bootstrap; latest-forecast all-earlier replay | Whether provisional supervision helps and where it is assigned |
| Replay | Conservative stored-trajectory replay; fresh retrospective regeneration | Reusing genuine earlier actions versus learning anew with later weights |

Historical regeneration is a useful training baseline, but its outputs are not genuine earlier forecasts. A date-limited prompt does not erase information already learned by the weights. Do not mix regenerated predictions into the causal evaluation ledger.

## 3. Recipe T: a researcher that emits numeric tokens

The researcher receives a question and can use the evidence tools. It produces an evidence packet or rationale, then a machine-readable numeric return. The scalar is parsed from tokens; its squared error becomes the trajectory reward. The RL gradient reinforces generated research and answer tokens. Environment observations and prompt tokens are excluded from the policy loss.

There is no ordinary differentiable path through sampling a string and parsing it as a float. This recipe uses policy gradients. A separate token-level SFT objective would be another explicit experiment; it should not quietly be described as direct squared-error regression.

Start with a strict schema such as `{"return": -0.012}` in decimal-return units. The continuous parser must allow negative and greater-than-one returns where valid for the declared target. Do not reuse the existing [0,1] probability parser. Malformed output gets a prespecified format penalty, with invalid-rate and valid-only error reported separately. Avoid arbitrary clipping of legitimate large returns to repair bad formatting.

Advantages are computed within a group of research trajectories for the same question and date. Equal total trajectory weight, rather than equal weight per token across all traces, avoids rewarding verbosity through longer gradient contributions. The exact loss reduction must be explicit and tested.

Strengths: one model, a straightforward RL baseline, and no separate readout to co-adapt. Weaknesses: noisy numerical learning and a possible shortcut in which only the final numeric-token distribution improves. Score held-out research packets through a fixed diagnostic readout to help distinguish improved research from improved number emission.

## 4. Recipe S: researcher plus separate scalar forecaster

The researcher emits an evidence packet. A separate forecaster reads the question and packet and emits one continuous scalar through a regression head. The forecaster receives a direct squared-error gradient; the researcher receives a policy gradient based on the usefulness of its packet. The researcher and forecaster have distinct parameter ownership, versions, checkpoints, and optimizers.

For the local first version, use a frozen quantized language-model backbone plus separate LoRA adapters and a small scalar head for the forecaster. Load components sequentially if needed; two simultaneously resident full models are not required. Start with a linear head on a specified terminal hidden state; compare a small MLP only after the linear implementation works. A shared frozen base is a storage optimization, not permission to share mutable parameters accidentally. A smaller independent forecaster is a later capacity ablation.

The continuous head is unbounded unless the task definition requires otherwise. Binary replication uses a sigmoid and Brier loss. A normalized Yes/No token-probability readout is another parameterization, not equivalent to a new continuous regression head.

### Train by alternating frozen phases

1. Warm-start the scalar head on permitted training data or synthetic fixtures. A random readout is a poor research reward. Any real warm-start labels must already be available at the experiment's initialization time.
2. Freeze the forecaster for a research-collection and actor-update phase. Sample researcher groups and score all members with the same readout version.
3. Update the researcher from eligible terminal or teacher rewards.
4. Update the forecaster on stored packets with eligible scalar targets, holding the researcher fixed.
5. Freeze a new readout version for the next phase. Never feed a current target into the head before using that head to judge the same actor batch.

The principal delayed-replay experiment scores **archived forecasts from the collection-time readout**, preserving what each trajectory originally predicted. This is a lagged joint-system objective, not exact optimization of the researcher's utility under today's readout. A secondary `rescore_current_frozen_head` variant re-evaluates every packet in an old group through one current, frozen head before computing rewards. These rescored outputs are training diagnostics, never replacements for archived forecasts. Report readout drift and distinguish the two objectives.

Current-head rescoring can become an answer-memory shortcut if that head already trained on the same event. Use event-held-out/cross-fitted readouts for a diagnostic subset, or retain collection-time rewards as the primary comparison. Freezing weights within a phase prevents a moving target; it does not establish statistical independence or remove prior memorization.

Do not try to differentiate through sampled research text into the researcher. Direct head gradients stop at its input representation boundary; researcher credit remains policy-gradient based. Joint simultaneous training is a later ablation because it obscures which moving component supplied the gain.

## 5. What makes a later teacher useful?

Let f_i be an old group's fixed forecasts and z a shared teacher estimate. Centered negative-square advantages are

$$
A_i(z)=\frac{-(f_i^2-\overline{f^2})+2z(f_i-\bar f)}{s_e^2}.
$$

This is linear in the teacher. If z is the true conditional expectation of Y given information that includes the earlier research, then A_i(z) is the conditional expectation of the terminal advantage. In that idealized setting it removes some outcome noise. With an approximate teacher q+delta, the advantage error is exactly 2 delta (f_i-bar f)/s_e^2. Small teacher errors matter most when they can reverse meaningful comparisons between research paths.

These statements condition on the earlier forecasts and require a common, sufficiently informed teacher. A fresh later agent that missed earlier evidence does not automatically satisfy that condition. The default operational teacher uses fresh independent later research, without earlier numeric answers to copy. Test a second teacher that also receives the union of earlier cited evidence, stripped of predictions and evaluative commentary. Treat the clean mathematical teacher as a simulator reference, not a property guaranteed by either model variant.

Averaging eight later forecasts reduces independent research noise. It does not eliminate common model error. A median or trimmed mean is a robustness ablation, not the natural target of squared-error regression. Compare teacher quality against terminal outcomes by horizon; do not assume model error decreases monotonically as resolution approaches.

## 6. Decisions and open hypotheses

Recommended first comparison: terminal-only versus latest-target replay, crossed with token versus scalar output. Include adjacent bootstrap after these four cells work. The aim is to identify which component helps before running a large scaling grid.

Open hypotheses include: later ensembles improve advantage signal; all-earlier replay beats adjacent updates; direct scalar learning improves sample efficiency; longer histories add useful diversity rather than stale regimes; and sparse models rely more on outcome memory at comparable active capacity. Each may fail. A stable teacher loss, impressive retrospective score, or greater memorization by itself is not a successful forecasting result.

Use more compute when useful. Give the terminal-only baseline the same opportunity to benefit from replay and tuning, but do not impose iso-compute. Count unique events, unresolved events, snapshots, research tokens, training tokens, and evaluation ensembles separately. Eight rollouts are not eight independent outcomes.
