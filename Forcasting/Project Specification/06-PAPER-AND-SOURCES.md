# Paper outline and related work

Working title: **Learning Before Resolution: Causal Replay for Language-Model Forecasting**.

The paper should distinguish established methods, our proposed application, and measured results. Do not claim that forecasting RL, delayed feedback, or temporal bootstrapping is new. The potential contribution is the tested combination of a global information clock, later research-ensemble targets, delayed trajectory replay, and distinct scalar versus token readout recipes.

## Paper outline

1. **Introduction.** Sparse outcomes and delayed feedback make forecasting a difficult RL setting. State the hypothesis that later evidence supplies useful provisional supervision, and explain why it could fail.
2. **Related work.** Forecasting harnesses and outcome-trained LMs; delayed/off-policy RL; pre-resolution feedback; proper scoring; contamination and scaling.
3. **Problem and information protocol.** Fixed terminal targets, continuous and binary tracks, evidence availability, shared model clock, task splits, and immutable forecast ledger. Distinguish historical training from historical evaluation.
4. **Output recipes.** Numeric-token policy gradients versus scalar regression plus researcher RL. Explain gradient ownership, alternating readout phases, and collection-time versus rescored training rewards.
5. **Learning algorithms.** Terminal-only baseline, adjacent bootstrap, all-earlier latest-target replay, event loss budgets, and off-policy limitations. Include the English algorithms and mathematical score definitions.
6. **Teacher analysis.** Conditional-expectation advantage identity, approximate-teacher bias, ensemble variance, information non-nesting, and simulator tests. Present assumptions before any variance-reduction conclusion.
7. **Experimental design.** Core factorial, teacher diagnostics, historical baseline, contamination intervention, scaling controls, hardware, and validation-only selection.
8. **Results.** Terminal held-out scores and intervals; label-efficiency curves; readout/replay ablations; seed variability; invalid/excluded cases; cost and memory. Leave numbers blank until experiments exist.
9. **Limitations.** Unknown base-model contamination, approximate teachers, correlated outcomes, off-policy bias, imperfect archives, continuous-target noise, and architecture confounding.
10. **Conclusion.** State what the evidence supports, including a null result if appropriate. Do not infer universal scaling laws or MoE inferiority from a small pilot.

Suggested figures: a shared-clock timeline; terminal error versus unique labeled events with unresolved-pool size shown; a four-cell output/feedback comparison; teacher error versus horizon; replay drift/exclusion versus label delay; and scaling curves only where data support them. Do not fabricate expected results for the outline.

## Reference recipe decision

There is no defensible single universally best forecasting RL framework across binary events, continuous returns, static evidence, and agentic research. Start from the reproducible grouped terminal-scoring recipe in the Thinking Machines forecasting cookbook, with the existing local TRL implementation as the execution backend.[^1] Use Turtel as an important outcome-RL reference, not an assumed acausal strawman.[^2] A small-model reproduction with a different checkpoint and data is a recipe adaptation, not a reproduction of a headline score.

Mantic/Thinking Machines emphasizes training with prepared research context; that is a strong static-evidence prediction baseline but does not settle the benefit of training the research policy itself.[^1] FutureWorld is closer to live research agents and delayed outcomes.[^3] Check its actual loop and dataset protocol before comparing claims. Do not infer that no existing paper handles chronology merely because its title omits a clock.

## Related-work map

| Source | Relevant connection | What it does not establish for this project |
|---|---|---|
| Thinking Machines forecasting recipe | Grouped outcome scores, reproducible training starting point | Our continuous-return/scalar-head/replay combination |
| Turtel et al., outcome-based RL | Forecasting fine-tuning with noisy outcome rewards | That overlapping events in every implementation are handled identically |
| FutureWorld | Live agents, tools, delayed feedback | Our all-earlier teacher replay being superior |
| Future-as-Label | Future outcomes as training supervision | Model-generated provisional labels being reliable |
| Pre-resolution prediction-agent work | Evolving unresolved evidence can improve agents | Necessarily performing weight-level policy updates on old traces |
| Sutton; delayed-feedback; off-policy literature | Foundational learning and replay concepts | Unbiasedness of our clipped long-trace surrogate |
| Proper scoring rules | Why conditional means/probabilities are target statistics | That arbitrary normalization or formatting penalties preserve the same objective |
| Simulated ignorance and leakage studies | Prompts/date filters are insufficient contamination controls | Every pre-cutoff training example being useless |
| Mixture of Parrots; optimal sparsity | Capacity/memorization/reasoning tradeoffs | MoE being worse at forecasting |

## Sources

These primary-source pointers informed the proposal. Precise empirical comparisons must be checked against the cited version before writing final results or claiming exact replication.

1. Thinking Machines Lab, [Training LLMs to predict world events](https://thinkingmachines.ai/news/training-llms-to-predict-world-events/) and [forecasting cookbook](https://tinker-docs.thinkingmachines.ai/cookbook/recipes/forecasting/), 2026.
2. Turtel et al., [outcome-based forecasting RL paper, arXiv:2505.17989v3](https://arxiv.org/html/2505.17989v3), 2025. Its chronological-training description deserves careful treatment; do not simply label the paper acausal.
3. [FutureWorld, arXiv:2604.26733](https://arxiv.org/abs/2604.26733), 2026.
4. [Future-as-Label, arXiv:2601.06336](https://arxiv.org/abs/2601.06336), 2026.
5. [Pre-resolution prediction-agent work, arXiv:2604.15719](https://arxiv.org/abs/2604.15719), 2026. Titles/version framing have changed; pin the actual version used.
6. Sutton, [Learning to Predict by the Methods of Temporal Differences](https://mlanthology.org/mlj/1988/sutton1988mlj-learning/), 1988.
7. Joulani, Gyorgy and Szepesvari, [Online Learning under Delayed Feedback](https://proceedings.mlr.press/v28/joulani13.html), 2013.
8. Degris, White and Sutton, [Off-Policy Actor-Critic](https://arxiv.org/abs/1205.4839), 2012.
9. Shao et al., [DeepSeekMath](https://arxiv.org/abs/2402.03300), 2024: GRPO origin; our non-standardized delayed replay differs from the original setting.
10. Gneiting and Raftery, [Strictly Proper Scoring Rules, Prediction, and Estimation](https://doi.org/10.1198/016214506000001437), 2007.
11. [Simulated Ignorance Fails, arXiv:2601.13717](https://arxiv.org/abs/2601.13717), 2026.
12. [Temporal Leakage in Search-Engine Date-Filtered Web Retrieval, arXiv:2602.00758](https://arxiv.org/abs/2602.00758), 2026.
13. Zhang and Stadie, [Temporal Leakage in LLM Backtesting, arXiv:2608.02985](https://arxiv.org/abs/2608.02985), 2026.
14. [Mixture of Parrots, arXiv:2410.19034](https://arxiv.org/abs/2410.19034), 2024.
15. [Optimal Sparsity of Mixture-of-Experts Language Models for Reasoning Tasks, arXiv:2508.18672](https://arxiv.org/abs/2508.18672), 2025.
16. Agarwal et al., [Deep Reinforcement Learning at the Edge of the Statistical Precipice](https://arxiv.org/abs/2108.13264), 2021: uncertainty across runs; event/time clustering is an application-specific additional requirement.

[^1]: Thinking Machines Lab, sources 1 above.
[^2]: Turtel et al., source 2 above.
[^3]: FutureWorld, source 3 above.
