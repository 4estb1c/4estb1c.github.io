# Agentic Forecasting using Sequential Bayesian Updating of Linguistic Beliefs

*Kevin Murphy. April 2026. [2604.18576](https://arxiv.org/abs/2604.18576).*

The current ForecastBench state of the art, and the paper to read if what you care about is architecture rather than raw capability. Murphy calls the system the **Bayesian Linguistic Forecaster (BLF)**.

**The idea.** Keep a semi-structured belief state, a numeric probability paired with a natural-language summary of the evidence, and update it step by step as the model uses tools, rather than piling everything retrieved into an ever-growing context window. The belief state is a sufficient statistic, and each new piece of evidence functions as a likelihood ratio applied to it. This is the abstraction that carries over cleanly to a live setting where evidence keeps arriving and re-reading the entire history on every update isn't tractable, which is exactly the constraint a live financial application would face.

**Three moving parts**, all shown by ablation to earn their keep:
1. The linguistic belief representation itself.
2. Aggregation across multiple trials in logit space (log-odds is the space where evidence is additive).
3. Hierarchical Platt calibration.

**Results.** Brier Index 73.3 overall on ForecastBench (83.8 on market questions, 73.3 on dataset questions), from the Oct-Nov 2025 evaluation tranches. The difficulty-adjusted score of 71.0 sits right at the superforecaster median of 70.9. It's the only system to significantly beat the LLM-free crowd-plus-empirical-prior baseline (+3.4 points). It beats Cassi, GPT-5, Grok 4.20, and Foresight-32B on 400 ForecastBench questions, and the authors explicitly claim state-of-the-art status.

Note ForecastBench is dynamic, so this Brier Index isn't directly comparable to a number from a different tranche or date, only to systems evaluated on the same question set.

See also Wei 2026, "The World Leaks the Future" ([2604.15719](https://arxiv.org/abs/2604.15719)), for a related but distinct idea, an editable procedure rather than a belief state, aimed at the same problem of getting supervision before a question resolves.
