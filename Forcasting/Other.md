
## 5. Benchmarks

Evals / Live forcasting
- _Autocast_ ([Zou 2022](https://arxiv.org/pdf/2206.15474)) paired tournament questions with a PIT news corpus so you could replay the information state as it was at forecast time without leaking the future.
- _ForecastQA_ ([Jin 2021](https://arxiv.org/pdf/2005.00792)) predates it but is weaker, multiple-choice, mostly of historical interest now.
- [[Karger 2025 - ForecastBench|ForecastBench]] is the current standard

Iterating / Pastcasting
- _Bench To the Future_ ([Wildman 2025](https://arxiv.org/pdf/2506.21558)) bundles resolved questions with tens of thousands of archived web pages each, giving you a sealed, repeatable, offline environment. Use this for development, because the live benchmarks have a feedback lag of weeks to months and you can't iterate against that.
- _FutureX_ ([Zeng 2025](https://arxiv.org/pdf/2508.11987)) runs tool-using agents across politics, economics, and sports, evaluating 25 models and auto-generating fresh questions daily to fight contamination. _Prophet Arena_ ([Yang 2025](https://arxiv.org/pdf/2510.17638), also at [prophetarena.co](https://www.prophetarena.co/)) breaks performance apart into source curation, evidence use, reasoning, and calibration, and finds models are cautious (they rarely commit to extreme probabilities) and lag the market as resolution approaches. _FutureWorld_ ([Han 2026](https://arxiv.org/pdf/2604.26733)) is more than a benchmark, it's a live RL environment, and the training section comes back to it, over a third of its live-generated questions (35.65%) never resolve to retrievable ground truth, which is the real tax of building on live outcomes instead of a static dataset. _FutureSim_ ([Goel 2026](https://arxiv.org/pdf/2605.15188)), FutureBench, and DailyOracle round out the variants. And Metaculus' own quarterly AI Benchmark, now [FutureEval](https://www.metaculus.com/futureeval/), is the longest continuous record we have of bots getting better over time.

_Simulated Ignorance Fails_ ([Li 2026](https://arxiv.org/pdf/2601.13717)) shows that models can't reliably pretend not to know things that happened after their cutoff, closing only 48% of the gap between a model told to feign ignorance and one that genuinely lacks the knowledge, so any pastcasting inside the training window is contaminated no matter how clean your corpus is.

## 7. Aggregation

_Wisdom of the Silicon Crowd_ ([Schoenegger 2024](https://arxiv.org/pdf/2402.19379)) finds an ensemble of twelve LLMs had statistically indistinguishable performance from a crowd of 925 humans. The paper also documents two exploitable quirks, an acquiescence bias (mean predictions drift above 50% even when questions resolve close to even) and a preference for round numbers. Both are cheap to correct for.

_Crowdsourced versus Large Language Models Forecasting: Evidence for the Accuracy-Correlation Effect_ ([Schoenegger 2026](https://doi.org/10.1098/rstb.2024.0456)), which LLM errors are correlated, which is why LLMs ensembles underperforms a human crowds of the same individual accuracy.

_Humans vs. Large Language Models: Judgmental Forecasting in an Era of Advanced AI_ ([Abolghasemi 2025](https://arxiv.org/pdf/2312.06941))

## 8. Evaluation pitfalls

This is the section that should make you suspicious of both the benchmarks and the training results. The two anchor papers, [[Paleka 2025 - Pitfalls in Evaluating LM Forecasters|Paleka 2025]] and [[Zhang Stadie 2026 - Temporal Leakage in LLM Backtesting|Zhang and Stadie 2026]], get their own files. Here is the rest of the picture.

_LLMs Are Superhuman Forecasters_ ([Phan 2024](https://safe.ai/blog/forecasting) is a cautionary tale. Researchers reported parity with crowd superforecasters, but an independent team was unable to reproduce results. The failure traced back to leakage through date-filtered search, where even if you filter document dates, the retrieval ranking itself has been shaped by information from after the question resolved. They also had a cutoff-date mixup where the model turned out to already know facts past its assumed cutoff. See the [critique thread](https://www.alignmentforum.org/posts/uGkRcHqatmPkvpGLq/contra-papers-claiming-superhuman-ai-forecasting). It might be interesting to plot the Brier over time to help diagnose such things.

[[Zhang Stadie 2026 - Temporal Leakage in LLM Backtesting|Zhang and Stadie 2026]] sharpen the knife. On questions that resolve at least 30 days after a model's cutoff, where memorization is flat-out impossible, four of five flagship models still fail the standard contamination check, with spurious apparent gaps up to 0.061 Brier, because models genuinely know more about times near their cutoff and that recency looks exactly like leakage. They prove the inflation isn't identifiable from backtest scores alone, since the identified set is a sharp interval that no amount of extra data will narrow. To pin it down you need an external reference, something like a regression discontinuity at a known cutoff or a difference-in-differences against a matched clean reference model, and applying it clears all five models, so the naive check was what was broken, not the models. A companion paper ([Zhang 2026](https://arxiv.org/pdf/2602.17234)) pushes this further, decomposing a model's stated rationale into atomic claims to attribute contamination claim by claim, and finds the accuracy cost of forcing a model to stay pre-cutoff scales with how much each specific task was leaning on post-cutoff information in the first place, an indirect way of pricing how much a given task's score was inflated.

Two more. [Lu 2025](https://arxiv.org/pdf/2507.04562) finds, on 464 Metaculus questions, that frontier models (o3 at Brier 0.1352) now edge the human crowd baseline (0.149), but superforecasters still crush both, with a median Brier around 0.02 on the subset where their forecasts were available, beating the crowd and beating actual experts are very different bars. And there's a failure-mode taxonomy ([Karkar 2025](https://arxiv.org/pdf/2511.18394)) cataloguing rumour overweighting, definition drift, and recency bias, with the striking result that news context actually hurts in some domains, DeepSeek-R1 loses 28 accuracy points on entertainment questions once given news access, while the same context helps in finance and sports. Give a forecaster search and you can make it worse, not just better.

So here's the practical rule. Before you believe any accuracy claim, check that it has all four of these: questions generated after the model's cutoff, a retrieval corpus frozen at forecast time including its ranking, a market or crowd baseline to beat, and a stated $N$ with a confidence interval. Almost nothing above clears all four.

---

## 9. Finance

On the news-to-returns side, the anchor is _Can ChatGPT Forecast Stock Price Movements?_ ([Lopez-Lira 2023](https://arxiv.org/pdf/2304.07619), Running GPT-4 on post-cutoff headlines, they get roughly a 90% portfolio-day hit rate on the initial (non-tradable) reaction, plus real predictive power over the drift that follows. It concentrates hard in small caps, the small-cap interaction term in their regression (0.404, t=4.75) dwarfs the base coefficient (0.087, t=4.09), and in negative news, shorting on bad news earns 26bps/day at Sharpe 2.01 against just 8bps/day at Sharpe 0.78 on the long side. The novel contribution is that returns decay as LLM adoption rises, backed by an explicit limits-to-arbitrage model, and the paper's own year-by-year numbers show it happening in real time: annualized Sharpe goes 6.54 in Q4 2021, 3.68 in 2022, 2.33 in 2023, 1.22 by early 2024, roughly halving every year.

_Prediction Arena_ ([Zhang 2026](https://arxiv.org/pdf/2604.07355)) let six models trade $10k Kalshi and Polymarket from January to March 2026. How much research a model did was uncorrelated with how it performed, in the paper's own words, "computational effort does not predict performance." Forecasting accuracy and trading profit are not the same thing, and execution plus question selection is most of the gap between them. 

_PolyBench_ ([Cheng 2026](https://arxiv.org/pdf/2604.14199)) sees only 2 of 7 models tested net profitable and the most accurate model (75%) was not the most profitable one, _PolySwarm_ ([Barot 2026](https://arxiv.org/pdf/2604.03888)), _Agentic Trading_ ([Xia 2026](https://arxiv.org/pdf/2605.19337)), which is actually a reproducibility audit of the whole LLM-trading literature and finds only 1 of 19 reviewable studies specifies a transaction-cost model, and _LiveTradeBench_ ([Yu 2025](https://arxiv.org/pdf/2511.03628)), whose headline finding is that a model's general chatbot leaderboard score predicts nothing about how well it trades.

Three things break the moment you try to port the pipeline over to returns. The first is the baseline.
- Crowd consensus is already priced in, baseline
- Decay: a model of AI-driven signal erosion grounded in 99.5 million SEC 13F filings, puts current signal half-lives around 18 months, down from an estimated 5 to 7 years before AI-driven strategies existed ([Meng 2026](https://arxiv.org/pdf/2605.23905))

Worth noting: Turtel's team has already built the template for a narrow, well-supervised domain application, see the SEC risk and supply-chain disruption papers in [[Turtel (Lightning Rod Labs) - Foresight Learning]], both of which beat GPT-5 with a small purpose-trained model on exactly this kind of dense-text, clean-future-label setup.



To contribute to an ensemble, an LLM must be sufficiently accurate on its own and also decorrelated from other LLMs in the ensemble. Predictions from most frontier LLMs, while accurate, contribute little diversity to the top-performing model (in our case, Gemini 3 Pro) – Figure 7. Among the frontier LLMs, Grok 4 is the exception: its predictions score well whilst correlating less with other frontier LLMs.