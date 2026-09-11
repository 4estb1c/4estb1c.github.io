# Approaching Human-Level Forecasting with Language Models

*Halawi, Zhang, Yueh-Han, Steinhardt. NeurIPS 2024. [2402.18563](https://arxiv.org/abs/2402.18563). Code: [dannyallover/llm_forecasting](https://github.com/dannyallover/llm_forecasting).*

This paper builds a framework for using LLMs for **judgmental forecasting**, the discretionary class of questions that rely on domain knowledge and world intuition rather than clean numeric extrapolation.

![[Pasted image 20260830124723.png]]

## Setup

**Dataset**
- They curate ~5,000 binary questions from 2015 to 2024 from e.g. Metaculus and Polymarket.
- All questions have a **begin date**, **close date**, and **resolve date**. The resolve date can occur before the close date (e.g. "will *event* happen by *date*").

**Causality**
- Test set is from after June 2023.
- Models all have training cutoffs before June 2023, so there's no pretraining leakage.
- Train/val sets are resolved before June 2023, so there's no leakage from the tuning process.

**Eval pipeline**
- A forecasting scenario consists of a forecasting question and an asof retrieval date.
- Retrieval dates are sampled between start and end date, then dates after the resolution date are filtered out.
- Sampling directly from start to resolution date conditions the distribution on acausal information. Early retrieval dates would be oversampled when the contract resolves YES, biasing the mean probability of YES over the population of training scenarios upward for early dates and downward for late dates. Filtering, rather than resampling the window itself by the resolve date, keeps the schedule label-independent.

**Baseline**
- With no information retrieval harness, a prompted base LM with chain-of-thought does poorly.
- A random baseline scores 0.25 Brier, the human crowd scores 0.15, the best LM (GPT-4) scores 0.21.

## Harness

**Retrieval**
- Decompose the question into sub-questions and generate search queries for each.
- Issue API calls to retrieve news articles for each query.
- Have a weak model rank article relevance and filter out irrelevant ones.
- Have a weak model summarize the articles so they fit in context.
- Feed the top $k$ summaries to the LM as context.
- Grid search over ranking criteria and $k$.

**Reasoning**
- To elicit good chain of thought, the LM is asked to rephrase the question and expand it with its own knowledge to add detail.
- It is then asked to use its retrieved context to produce arguments for and against the forecasted outcome.
- It is then asked to weigh the arguments and aggregate them into an initial forecast.
- It is then asked to check whether it is over- or under-confident and recalibrate.

**Ensembling**
- Several LM instances are given different prompts and/or run with temperature to generate several forecasts.
- The trimmed mean is taken across them.

## Self-supervised fine-tuning

- Use the harness above to elicit forecasts from a base LM.
- Use **rejection-sampling fine-tuning**: sample many trajectories (varying temperature, model, reasoning prompt, retrieval mechanism) and use the high-reward traces to SFT a new LM.
- The resulting fine-tuning data consists of an input question and a target reasoning trace. Reasoning traces exclude the prompts, which directly teaches the model which reasoning to apply in which context, rather than teaching it to imitate the scaffold itself.

On questions published after the model's cutoff, the resulting system nears and sometimes exceeds the competitive crowd aggregate. This is the reference implementation the rest of the field builds on: the five-stage anatomy (retrieve, filter, summarize, reason-and-predict, aggregate) shows up, in some variant, in almost every later system.
