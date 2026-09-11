# Temporal Leakage in LLM Backtesting: Measurement, Validation, and Adjusted Scores

*Zeyu Zhang, Bradly C. Stadie. Northwestern University. August 2026. [2608.02985](https://arxiv.org/abs/2608.02985).*

The sharpest paper in the pitfalls literature, and the one most relevant to a finance application, because financial questions leave the densest, most continuously-updated public trail of any domain, so this problem bites hardest there.

**Core problem.** Standard contamination checks for LLM backtests are fundamentally uninformative. The authors evaluate five flagship models on questions resolving *after* their documented training cutoffs, so memorization is theoretically impossible, and four of the five models still fail the standard pre/post-cutoff contamination check, with apparent leakage gaps up to +0.061 Brier.

**Why the naive check fails.** There's a structural confound: models legitimately know more about times near their training cutoff than times far from it (more relevant training data density near the cutoff), so recency alone produces a signal that mimics leakage. A passive backtest, comparing pre-cutoff to post-cutoff performance, cannot distinguish "the model is cheating" from "the model just knows more about last month than next year," because both produce the same observable pattern.

**The mathematical result.** They prove leakage inflation is *not identifiable* from backtest scores alone. The identified parameter set forms a sharp interval, and no amount of additional backtest data can narrow it further. This isn't a data-quantity problem you can fix by collecting more questions, it's a structural non-identifiability.

**Three identification routes that do work, all requiring an external reference:**
1. **Regression discontinuity** at a known, sharp cutoff boundary.
2. **Difference-in-differences** using matched "twin" control models with a known-clean training history.
3. **Paraphrase probes**, useful for *detecting* leakage but not for *measuring* its magnitude.

**Validation.** Using deliberately contaminated "twin" models with injected leakage of known size, the estimators successfully recovered the injected dose, returned null findings on genuinely clean questions, and correctly identified one leakage signature among deployed frontier models while clearing five others that a naive analysis had flagged.

**Practical implication for anyone building a finance backtest:** you need one of the three designs above built into your evaluation from the start. "We only retrieved pre-cutoff documents" is not sufficient on its own, per [[Paleka 2025 - Pitfalls in Evaluating LM Forecasters]], and now you also can't just check pre/post-cutoff performance and call it a day, per this paper.
