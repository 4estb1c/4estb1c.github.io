# Teaching a Model to Forecast Markets: A Working Research Review

An agent that does an analyst's job across thousands of names at once, reading the news and filings, forming a view on a company's idiosyncratic future, and stating it as a calibrated forecast. Base model Qwen3-32B, ~1 year of clean data, targets are factor-hedged residual returns plus fundamentals. The plan is reinforcement learning: forecast, score against reality, reinforce the reasoning behind the good calls. These notes trace where that framing holds, where it quietly breaks, and every idea we considered for getting more signal out of very little data, including the ones that don't work and why.

# 7. Time as a free teacher: TD / privileged-information distillation

Every timestamp `t' > t` is a better-informed, zero-cost teacher for time `t`, with no leakage as long as the student's context stops at `t`. This is learning under privileged information (Vapnik), the same principle as smoothing beats filtering. The right way to spend it is to regress the earlier forecast toward an independently generated later one, `p_t ← p_{t+1}`, anchored by `p_r = y`. That's TD learning, and it's not an approximation of the objective, it is the objective split into steps, for a martingale path ending at `y`:

$$ \mathbb E[(p_0-y)^2] = \sum_t \mathbb E[(p_{t+1}-p_t)^2], $$

so total Brier error is the quadratic variation of the belief path, with per-step credit for free. For stocks the teacher can be exogenous and unhackable: score a quarterly forecast against the realized price a week out, turning one label at t+63 into ~63 daily observations of a moving target. Weight the terminal anchor heavily (λ→1 early) or the never-revise forecast is degenerate-optimal, and never show the model its own prior forecast, since it copies.

The clearest working example of this exact mechanism isn't from forecasting, it's from robotics. _Temporal Difference Calibration in Sequential Tasks_ ([Francis-Meretzki 2026](https://arxiv.org/pdf/2604.20472)) trains a confidence head with a TD(0)-style bootstrap, early steps regress toward the next step's confidence and only the final step regresses toward ground truth, and gets roughly a 29% relative improvement in ROC-AUC and a 13-point jump in downstream task success versus a standard cross-entropy-trained confidence head, with the biggest gains specifically on tasks unlike anything in training. That's the shape of result to expect here too, the gain should concentrate wherever the student's own experience is thinnest.

## 8. The failure to avoid: outcome-aware grading

Tempting and wrong: let the better-informed later model grade the earlier trace and return a reward. The extra information it holds is the outcome, so it rewards the lucky 80% and punishes the reasoned-but-unlucky 20%, training resulting, the exact habit forecasting discipline exists to kill. This is the hindsight bias documented in _Hindsight ≠ Foresight_ ([Fischhoff 1975](https://doi.org/10.1037/0096-1523.1.3.288)). Distill a later belief about the world: sound. Distill a later verdict about the student, contaminated by the outcome: poison. Same information asymmetry, opposite sign.

---

## 9. The causal boundary: what leakage is, and why GRPO ≠ the hindsight teacher

This is the organizing principle for everything below, because the intuition that "GRPO is just as leaky as a privileged teacher, since both condition on `t+h` information" is a category error worth killing precisely. Leakage is about the information set that conditions the decision, not about what touches the reward. Every learning rule uses `y`: a loss is a `y`-weighted update, and supervised regression "uses the future" because labels postdate features, yet nobody calls that leakage. Leakage is when `y`, or a proxy, enters the input to the function you deploy.

Track where `y` enters, and the two methods separate.

GRPO: rollouts are drawn from `π(·|s)`, with `s ⊆ F_t`. `y` enters only the scalar `r_i = −(p_i−y)²`. It reweights within a support fixed by `s`, and never enters the support itself. The deployed policy generated its forecast under exactly the information it has at inference, so it is causally clean.

Hindsight teacher: rollouts are drawn from `π(·|s, y)`. `y` is in the generation conditioning, so the support expands to traces reachable only from `(s,y)`, reasoning whose pivotal step is "given the trial passes...". The distilled student approximates a function defined using `y` as an input, and reproduces its shape at inference where no `y` exists.

Reweighting by a `y`-dependent scalar is what RL is. Expanding the support to include `y`-dependent traces is leakage. These are different operations, and only one survives to deployment as a function of `s` alone.

Why the outcome integrates out of GRPO: the policy is a shared function of `s`, trained across many `(s, y)` pairs where similar `s` recurs with different `y` (same pharma setup, trial passes in one episode, fails in another). It must emit one output per `s`, and under a proper score the reward-maximizing single output is

$$ p^* = \arg\max_p \mathbb{E}_{y|s}[R(p,y)] = \mathbb{E}[y \mid s], $$

the outcome marginalized away. The teacher, seeing `(s,y)`, emits opposite traces for the same `s` depending on outcome and never reconciles them, so nothing forces marginalization at generation time.

The gibberish limit sharpens this rather than collapsing it. Sample `10^100` random-string rollouts and let GRPO upweight the ones whose `p` landed near `y`. Those strings are gibberish uncorrelated with the `p`, so reinforcing them transfers nothing. GRPO fails to learn in the pure-noise limit, which is correct, since it can only reinforce structure the policy already generates from `s`. The teacher's single coherent rollout, by contrast, transfers structure that encodes `y`. Its one-shot efficiency is the contamination: you cannot buy the efficiency without the leak, as long as one mechanism does both proposal and validation.

Where the equivalence genuinely holds, and it's the bug you smelled: hard top-1 selection on a single outcome draw (keep the rollout closest to realized `y`, imitate it) is not GRPO. For binary `y=1` the closest `p` is `1`, so top-1 selection always keeps the extreme in the realized direction, the STaR-style rejection sampling on one draw is improper and biased toward overconfidence. GRPO differs by one thing: it keeps the losers with signed negative advantage, penalizing the confident-wrong `p=0.95, y=0` rollout instead of discarding it. That is the identical keep-the-losers principle as the HER discussion in §14, now on the reward side.

Three conditions keep GRPO clean and calibrated. Drop any one and it slides toward the teacher.

1. A proper reward with curvature. `E_y[∂_p(−(p−y)²)] = −2(p−E[y])`, zero at `p^*`, restoring from either side, the confident-wrong losers eat a quadratic penalty that supplies the pull-back. A linear reward `−(y−p)` or `−|p−y|` has no curvature, since `∂_p E|p−y| = 1−2p^*` is a constant that drives `p` to 0 or 1 (a pure "predict the mode" degenerate). If overconfidence appears, check that the reward is quadratic or log first, since properness lives in the curvature.
2. The signed full advantage, with losers penalized rather than selected away.
3. Outcome variation across similar states, which is what forces `E[y|s]`.

Two riders. σ-normalization (`Â=(r−μ)/σ`) is not a leak but a distortion: it flattens the magnitude asymmetry the proper score encodes, the source of the 39.3% to 7.9% extreme-bucket swing in §4, and the same mechanism [Bereket 2025](https://arxiv.org/pdf/2508.11800) measured directly outside forecasting. And even proper, signed, σ-free GRPO is a high-variance single-draw estimator. Properness holds in expectation over `y`, but each question gives one draw, so per-question the update does point at the extreme matching that draw, and calibration only emerges after averaging. With small `N_eff` (§1) that noise is real and looks like extremeness-chasing, mitigated by many short-horizon events, a small learning rate, and the dense TD and exogenous-price targets of §7 that replace one binary with ~63 continuous observations.

Resolution: teacher proposes, GRPO disposes. The teacher's real advantage is sample-efficient exploration via the `y`-shortcut, and its cost is contamination. They are inseparable only if one mechanism does both jobs. So split them. Let the teacher expand the support, getting the good hypothesis into `π`'s reachable set, symmetrically across outcomes (§14), and let proper-reward GRPO do the weighting on causally-clean, `s`-generated rollouts. That extracts the one-shot efficiency while keeping `y` out of the input to the deployed function.

---

Bad ideas: 
## 10. Idea: hindsight-generated reasoning traces (partly salvageable)

The idea is to generate a trace while conditioning on the answer, then train on it as if produced forward. This is STaR-style rationalization bootstrapping, from _STaR: Bootstrapping Reasoning With Reasoning_ ([Zelikman 2022](https://arxiv.org/pdf/2203.14465)), which works in verifiable domains like math and code because there `y` is ground truth and any valid derivation of it is valid regardless of how it was found.

Forecasting breaks the load-bearing assumption: `y` is one noisy draw, not ground truth. A stock that returned +8% residual had a right forecast near zero. A trace that confidently explains +8% is rationalizing noise, and distilling it teaches the student that residual returns are more explainable ex-ante than they are, plus a house style of crisp outcome-pointing narratives. At inference, with no answer to rationalize, the student emits the shape of that confidence over nothing. It's also unfaithful by construction, since the real cause of the conclusion is the injected answer, not the written reasoning, the general failure documented in _Language Models Don't Always Say What They Think_ ([Turpin 2023](https://arxiv.org/pdf/2305.04388)).

Salvage: only generate traces for events that were genuinely high-probability ex-ante, where the outcome roughly matches the correct forecast so there's no noise to rationalize, or target an ensemble probability rather than the realized binary. This restricts the method to the subset where hindsight and foresight agree, safe but least informative.

## 11. Idea: make the model "forget" the future (does not work)

The idea is to prompt or fine-tune the model to ignore everything after date `t`. Tested directly, it fails. _Simulated Ignorance Fails: A Systematic Study of LLM Behaviors on Forecasting Problems Before Model Knowledge Cutoff_ ([Li 2026](https://arxiv.org/pdf/2601.13717)) runs 477 competition questions across 9 models. Instructing a model to suppress pre-cutoff knowledge, "simulated ignorance" or SI, leaves a 52% performance gap versus a model that genuinely lacks the knowledge, "true ignorance" or TI. Adding an explicit cutoff date (C = 2023-01-01) closes only 48% of the SI-TI gap, leaving 52% unexplained. Chain-of-thought does not suppress the knowledge even when the visible trace contains no post-cutoff references, and reasoning-optimized models are worse at feigning ignorance. So "ignore the future" yields exactly the feared nonsense: a model half-recalling the answer and laundering it through a research-shaped trace, invisible in training, surfacing as overconfidence live.

Two supporting points. Forecasting skill isn't recall in the first place: _FOReCAst: The Future Outcome Reasoning and Confidence Assessment Benchmark_ ([Yuan 2025](https://arxiv.org/pdf/2502.19676)) finds no correlation between how close an event is to a model's cutoff and how well it forecasts, flat performance across temporal distance, so the "extra 20 years of pre-cutoff data" contains answers, not obviously the skill. And the faithful fix is temporal masking during training, not forgetting. The scaled-up sibling of the Lightning Rod work, _Future-as-Label_ ([[Turtel (Lightning Rod Labs) - Foresight Learning|Turtel 2026]]), applies a temporal information mask, with inputs only from sources dated at or before t, and requires all training events to resolve strictly after the pretrained cutoff, with a frozen resolver (Gemini-2.5-Flash) reading post-t sources to label outcomes, so its resolution errors are pure noise, never an endogenous reward the policy can game. The design concedes the point: they don't make the model forget, they train only where there's nothing to forget.

## 12. Idea: RL on pre-cutoff events + the self-baseline fix (works, with care)

The idea is to use pre-cutoff events to teach the research process, since it can't hurt and it buys years of data. It can hurt: given §11, the model often already knows the answer, so reward is maximized by recall plus justification, and RL reinforces exactly the §10 rationalization failure rather than seeding it once.

The fix that makes it usable is to reward the delta over the model's own memory. Run the model with no research, ticker and date only, so its forecast reads out what it already knows, its memorization floor. Then run the full research loop. Reward the improvement:

$$ R = \text{score}(p_{\text{research}}, y) - \text{score}(p_{\text{no-research}}, y). $$

Memorization appears in both terms and cancels. If the model already knew, the baseline is already good and research earns ≈0, so the only way to score is to surface information the weights lacked. Same logic as the exogenous-target TD above: reward the marginal, verifiable gain, never the absolute level memory can fake. Caveat: this controls the score, not the trace. The model may "research" its way to a conclusion it actually retrieved. So pre-cutoff data is a process gym for the research mechanics, and the calibration signal must still come from post-cutoff events where true ignorance holds.

## 13. Idea: elicit-and-freeze assumptions, and the open generalization question

A cleaner instantiation of §12: rather than an implicit baseline subtraction, make the model explicitly write out everything it already knows relevant to the question, freeze that as given context, then reward research that adds beyond it. This fits the standard forecasting-system front end, where a question is first reformulated and enriched, sub-queries generated, context assembled, before any forecast, as in _Approaching Human-Level Forecasting_ ([[Halawi 2024 - Approaching Human-Level Forecasting|Halawi 2024]]) and the Bayesian-aggregation systems of [[Murphy 2026 - Bayesian Linguistic Forecaster|Murphy 2026]]. Elicited priors become part of that enriched question.

The genuine open question is whether research skill learned in this odd regime, a model stuck at time `t` but retaining full parametric memory of the world, transfers to true out-of-sample forecasting, where it has no such memory. The training distribution, research conditioned on latent knowledge, differs from deployment, research under real ignorance, and whether the act of tool-use research generalizes across that shift is untested and worth an experiment: hold out post-cutoff events and compare research behavior and quality against the pre-cutoff regime.

## 14. Idea: hindsight for hypothesis coverage, HER, not calibration

The pharma case, where a drug clears a trial and the stock jumps but GRPO may never sample a trace that surfaces the pending readout at all, is an exploration problem, not a calibration one. If the base policy puts ≈0 mass on generating the catalyst, no rollouts reach it and there's no gradient toward it. You can't reweight onto an absent hypothesis, you must first get mass on it. This is exactly _Hindsight Experience Replay_ ([Andrychowicz 2017](https://arxiv.org/pdf/1707.01495)): relabel trajectories with what happened to create signal in sparse-reward settings. Their cleanest number is the bit-flipping toy problem, plain DQN caps out solving 13-bit sequences while DQN with HER solves up to 50, same reward, only the relabeling changes, and on the real robotic tasks a pick-and-place policy trained with HER went from 2 of 5 successful trials to 5 of 5 once observation noise was added during training. Here it builds hypothesis coverage.

The knife-edge: HER leaks the moment the injection correlates with the outcome. Inject "consider the trial" only for stocks whose trial passed, and the model learns that surfacing a catalyst implies the catalyst fires, useless at inference and possibly poison (selection-on-outcome, the §10 failure through the back door, and precisely the hard-selection degenerate of §9). Inject the pending readout for every name that had one, failures included, at the ex-ante base rate, and surfacing decouples from firing. So inject the losers too.

Then split the reward and never let the halves touch. Coverage: did the forward trace surface the catalysts knowable at `t`? Hindsight-supervisable, because "was there a public phase-3 readout pending at t" is a fact about `F_t`, not the outcome. Dense. Calibration: given the catalyst was surfaced, was its probability sensible? Scored against the outcome, as in §7.

A model that surfaces the trial, says "15%, phase-3 oncology base rate," and then the drug passes did everything right: full coverage, near-full calibration, a losing return. That's the target behavior.

And decompose by knowability, because it flips the verdict. If the catalyst was knowable at `t` (public trial, disclosed pipeline), the failure is retrieval, not exploration. The right fix is tools and scaffolding to find it from `F_t`, with hindsight used only to build the eval, checking whether it was findable. If the catalyst was not knowable at `t` (genuine surprise), injecting it teaches the model to expect unpredictable hidden upside everywhere, to hallucinate lurking catalysts. Poison. The correct lesson is that the variance was irreducible.

Inject the population base rate, the historical phase-3 oncology success frequency, never a rate informed by this outcome. The base rate is a prior computable at `t`. The posterior is leakage.

---

