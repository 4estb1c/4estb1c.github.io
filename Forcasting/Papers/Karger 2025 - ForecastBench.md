# ForecastBench: A Dynamic Benchmark of AI Forecasting Capabilities

*Karger, Bastani, Yueh-Han, Jacobs, Zhang, Tetlock. ICLR 2025. [2409.19839](https://arxiv.org/abs/2409.19839). Live at [forecastbench.org](https://www.forecastbench.org/).*

The evaluation standard everyone reports against. Every two weeks it releases 1,000 forecasting questions with no known answer at submission time, so leakage is ruled out by construction rather than by filtering after the fact.

- 500 are **market questions**, about unpredictable near-term situations, scraped from sources like Metaculus and Kalshi.
- 500 are **dataset questions**, about quantitative trends (Bitcoin prices, Google Trends, macroeconomic series) rather than discrete world events.

Three leaderboards: **Tournament** (any scaffolding allowed), **Baseline** (out-of-the-box models, no tools), and **Preliminary** (early results ahead of tournament inclusion). Scores are reported as a Brier Index on a 0-100% scale.

**The caveat that governs every comparison on it:** the human superforecaster panel was last surveyed in July 2024, on a different question set than the models being scored later. Every human-vs-machine comparison on this benchmark rests on a statistical extrapolation from that panel, which gets shakier the further you get from that date. As of mid-2026, top systems have plausibly reached parity with that extrapolated superforecaster baseline, but the confidence intervals overlap substantially, and Metaculus' own live tournaments (which use fresh, contemporaneous human forecasters) still show a real gap in the pros' favor. See the [Forecasting Research Institute's parity read](https://forecastingresearch.substack.com/p/ai-models-have-likely-reached-parity) against [Good Judgment's rebuttal](https://goodjudgment.substack.com/p/what-superforecasters-actually-said).
