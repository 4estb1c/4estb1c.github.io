# Benjamin Turtel / Lightning Rod Labs: Outcome-Based RL and Foresight Learning

*Benjamin Turtel, CEO of [Lightning Rod Labs](https://www.lightningrod.ai/). This file covers his research line end to end: the original outcome-based RL result, its self-play predecessor, the generalized "Foresight Learning" framework, and its two domain applications so far. Five papers, one file, because they're really one continuous project.*

---

## Outcome-based Reinforcement Learning to Predict the Future

*Turtel, Franklin, Skotheim, Hewitt, Schoenegger. TMLR 2025. [2505.17989](https://arxiv.org/abs/2505.17989).*

The paper that opened up training-rather-than-prompting as a serious direction, and the one the rest of this file builds on.

**Method.** RLVR with negative Brier score as the reward, on resolved prediction-market questions. This is the founding move: instead of prompting a frozen model to reason well, directly optimize the policy against the proper scoring rule you actually care about.

**Results.** A 14B reasoning model matches or beats o1 on accuracy, with noticeably better calibration, and clears >10% ROI in a Polymarket trading simulation.

**Why it's methodologically interesting, not just a capability result.** The reward here is noisy (a single resolved outcome is a very weak signal about the quality of the underlying reasoning), delayed (you don't get the reward until the question resolves, which can be weeks or months later), and non-deterministic (the same good reasoning can still land on the wrong side of a genuinely 50/50 event). RLVR's native domain is clean, deterministic, immediate pass/fail signals (math, code). Forecasting breaks every one of those assumptions simultaneously, and working out how to train through that is the real contribution.

## LLMs Can Teach Themselves to Better Predict the Future

*Turtel, Franklin, Schoenegger. [2502.05253](https://arxiv.org/abs/2502.05253).*

The self-play predecessor to the TMLR paper, and worth reading in that order despite the earlier arXiv date, since the outcome-based RL paper is the cleaner statement of the idea this one is building toward.

**Method.** Model self-play generates pairs of diverse reasoning trajectories and probabilistic forecasts for questions that resolve beyond the model's knowledge cutoff, with no human-curated samples involved. The pairs are then ranked by their distance to the actual resolved outcome, and the model is fine-tuned via **Direct Preference Optimization (DPO)** on the ranked pairs.

Note this does use ground truth, the resolved outcomes, just not human-labeled reasoning, and the "self-play" is in how the training pairs are generated and compared, not in the absence of a real signal. It sits between pure imitation learning and full outcome-based RL: DPO on outcome-ranked pairs rather than a policy-gradient reward.

**Results.** Tested on Phi-4 14B and DeepSeek-R1 14B, giving a 7-10% increase in prediction accuracy over baseline and randomized-label control models, reaching performance comparable to GPT-4o.

## Future-as-Label: Scalable Supervision from Real-World Outcomes

*Turtel, Wilczewski, Franklin, Skotheim. 2026. [2601.06336](https://arxiv.org/abs/2601.06336).*

The generalization step: naming and formalizing "Foresight Learning" as a reusable training paradigm, rather than a one-off recipe for forecasting benchmarks. The two application papers below both cite this framework by name.

**Core idea.** Treat the natural temporal resolution of real-world events as an automatic supervision signal. Models predict using only pre-event information, and outcome verification happens later, once the event has actually resolved. This creates learning driven entirely by realized outcomes, with no human annotation required at any point.

**Method.** GRPO over multiple reasoning trajectories sampled per event, with a proper scoring rule (log score) as the reward once the outcome materializes. The predictor and resolver are strictly separated, meaning the model doing the forecasting never has access to resolution information, which is the causal-integrity guarantee that makes the whole scheme valid (compare this to the retrieval-leakage failure modes in [[Paleka 2025 - Pitfalls in Evaluating LM Forecasters]], this is the training-time version of the same discipline).

**Data.** 5,120 future-event predictions spanning politics, economics, and corporate actions, derived from timestamped news corpora. Test sets: 500 synthetic questions plus 293 independently authored questions from Metaculus. Prediction horizons range from days to several weeks.

**Results.** A 32B model trained this way improved Brier score by 27% and halved calibration error relative to baselines, outperforming a model seven times its size on both benchmarks.

## Foresight Learning for SEC Risk Prediction

*Turtel, Wilczewski, Franklin, Skotheim. 2026. [2601.19189](https://arxiv.org/abs/2601.19189).*

The first domain application: estimating whether a corporate risk disclosed in an SEC filing will actually materialize within a specified timeframe. This is the closest thing in Turtel's line to a direct financial application, and a good template for how to build a domain-specific version of this pipeline.

**Method.**
1. **Automated data generation.** A RAG pipeline extracts risks from the Risk Factors section of SEC filings and generates firm-specific, time-bounded queries, with no human annotation.
2. **Outcome resolution.** Future SEC filings supply the labels, i.e. the model checks whether a previously disclosed risk was subsequently disclosed as having occurred.
3. **Training.** A 32B model trained with Brier-score optimization and GRPO fine-tuning.

**Results.** Outperforms both the pretrained base model and GPT-5: Brier score 0.1979 vs GPT-5's 0.1986, expected calibration error 0.0287 vs GPT-5's 0.0812. A much smaller, domain-specific, single-GPU-deployable model beats a frontier general-purpose one on this narrow task, which is the recurring pattern across this whole research line and across other purpose-trained forecasters like OpenForecaster8B ([2512.25070](https://arxiv.org/abs/2512.25070)) as well.

## Forecasting Supply Chain Disruptions with Foresight Learning

*Turtel, Wilczewski, Skotheim. April 2026. [2604.01298](https://arxiv.org/abs/2604.01298).*

The second domain application, and the most directly forecasting-flavored of the two: one-month-ahead binary prediction of whether supply chain disruption intensity will increase by more than one standard deviation.

**Method.** GPT-OSS-120B fine-tuned with LoRA, log-score rewards based on realized outcomes, GRPO-style optimization. Inputs are built exclusively from information available before the prediction time (timestamped news on geopolitical tension, trade restrictions, labor disputes), supervised against future disruption-index outcomes from trade data, enforcing the same temporal separation as the SEC paper.

**Results.** 16.9% Brier Skill Score improvement over baseline, roughly 70% reduction in calibration error, and qualitatively improved probabilistic reasoning behaviors (base-rate anchoring, uncertainty refinement) that emerged without being explicitly prompted for.

---

**The throughline across all five papers:** start from outcome-based RL as the training signal (paper 1, refined from paper 2's DPO version), generalize it into a named, reusable framework (paper 3), then apply that framework to two verticals with dense, timestamped text and clean future labels (papers 4 and 5). Both applications beat GPT-5 with a much smaller, purpose-trained model, which is the strongest practical argument in this whole vault for training over prompting when you have a narrow, well-defined domain and a real supervision signal, exactly the SEC-filing and supply-chain-news kind of setting a finance application would also have.
