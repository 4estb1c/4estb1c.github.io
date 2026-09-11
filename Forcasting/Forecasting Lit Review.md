LLM judgmental forecasting lit review.

## Contents

1. [[#1. Seminal Literature|Seminal Literature]]
2. [[#2. Brier Score|Brier Score]]
3. [[#3. Harness|Harness]]
4. [[#6. Training rather than prompting|Training rather than prompting]]
5. [[#11. Open problems|Open problems]]

---

## 1. Seminal Literature

Five key papers:
1. [[Halawi 2024 - Approaching Human-Level Forecasting|Halawi 2024]] is the seminal harness paper (retrieval -> reasoning)
2. [[Hsieh 2024 - Reasoning and Tools for Forecasting|Hsieh 2024]] (ReAct) introduces dynamic tool use at reasoning-time
3. [[Murphy 2026 - Bayesian Linguistic Forecaster|Murphy 2026]] (BLF) is the current public frontier harness, also a standard for robust statistical methodology.
4. [[Turtel (Lightning Rod Labs) - Foresight Learning|Turtel 2025]] introduces RL
5. [Jeen 2026](https://thinkingmachines.ai/news/training-llms-to-predict-world-events/) is Thinking Machines' well-done RL

---

## 2. Brier Score
###### Brier Score
For a set of $N$ forecasted probabilities $f_i \in [0,1]$ and realized outcomes $o_i\in\{0,1\}$. It is the MSE of forecasts. BS=0 for a perfect oracle, BS=1 if you're always wrong. Random guesses receive BS=0.5.
$$\mathrm{BS} = \frac{1}{N}\sum_i (f_i - o_i)^2,\qquad o_i \in \{0,1\}$$
Brier is strictly proper, which means reporting your true belief maximizes your expected score, hedging or bluster can't game it. The log score $-\log p_o$ is the other standard proper rule. It's unbounded and penalizes confident mistakes more.
###### Brier Index
$$\text{BI}=1-\sqrt{\text{BS}}$$
BI=1 for a perfect oracle, BI=0 if you're always wrong, 0.5 for random. sqrt BS is a standard deviation of errors.

BI is no longer strictly proper, it encourages overconfidence.
###### Brier Skill Score
$$BSS=1-\frac{\text{BS}}{\text{BS}_\text{ref}}$$
BSS=1 means perfect oracle. BSS=0 means we are as good as the baseline. BSS=0.2 means BS is 80% of the baseline.

###### Pricing
Asking how something will resolve vs asking what it will be priced at in a month

I think you want to do PnL loss instead

###### Murphy Decomposition
$$\mathrm{BS} = \text{calibration} + \text{resolution} + \text{irreducible}$$

- $\mathbb{E}[o | p]$ is the conditional base rate: among all cases where you said $p$, the empirical fraction that came true

- Calibration / reliability $\mathbb{E}[(p - \bar{o}_p)^2]$
- Resolution / discrimination $\mathbb{E}[(\bar{o}_p - \bar{o})^2]$
- Irreducible $\bar{o}(1-\bar{o})$


 [Q4 2025 AI benchmark write-up](https://www.lesswrong.com/posts/P8YwCvHoF2FHQoHjF/metaculus-q4-ai-benchmarking-bots-are-closing-the-gap) (Metaculus 2026): both the pros and the bots were well calibrated, so the pros' edge is discrimination, not calibration. Concretely, discrimination there is defined as the gap between a forecaster's average prediction on questions that resolve YES versus NO, and it came out 44 percentage points for the pros against 26 for the top bot team. 
 
---

## 3. Harness

[Metaculus 2026](https://www.metaculus.com/notebooks/43337/fall-2025-futureeval-survey/) finds that the harness adds ~9 months of base-model progress. Frontier base models improve ~0.9 peer-score points a month, and the top five scaffolded bots beat their harnessless baselines by 5 to 11 peer-score points per question.

[Schoenegger 2025](https://arxiv.org/pdf/2506.01578) finds prompt engineering barely helps. Testing 38 prompts, most produce negligible gains. Base-rate reminders help a little. Prompting the model to reason like a Bayesian actually made it worse. Metaculus separately found the same thing, that automated prompt-engineering gains failed to replicate live on frontier models.

There's also logprob-based elicitation, reading calibration off token log-probabilities instead of a verbalized number (Soru 2025), and aggregation via wagering mechanisms, where forecasters stake confidence against each other instead of just averaging (Luo 2026). **Are any of these useful??**

The standard harness
1. **Retrieval**: The model generates search queries against PIT news APIs. [Metaculus 2026](https://www.metaculus.com/notebooks/43337/fall-2025-futureeval-survey/) finds that breadth of sources is the strongest single indicator of predictor.
2. **Filtering**: The model scores retrieved articles for relevance, discarding the vast majority.
3. **Summarization**: Remaining articles are compressed into a context-fitting evidence set. Advanced setups occasionally substitute this with a rolling belief state (see [[Murphy 2026 - Bayesian Linguistic Forecaster|Murphy 2026]]).
4. **Reasoning**: $k$ independent rollouts execute, each yielding a discrete rationale and probability.
5. **Aggregation and Calibration**: Rollouts are combined via trimmed mean or logit-space averaging (where evidence adds linearly), followed by extremizing or Platt scaling.

---

## 6. Training rather than prompting

[[Turtel (Lightning Rod Labs) - Foresight Learning|Turtel 2025]] proposes RLVR with a negative-Brier reward on resolved market questions. It works out how to train against rewards that are noisy, delayed, and non-deterministic.
- Modified-GRPO's Brier score barely moved between a 10k-question and a 100k-question training run which suggests the σ-normalization fix bought the calibration gain, not the extra data.
- Lightning Rod later scaled the recipe to a 32B model tested live on Polymarket ([Foresight-32B beats frontier LLMs on live Polymarket predictions](https://blog.lightningrod.ai/p/foresight-32b-beats-frontier-llms-on-live-polymarket-predictions), Lightning Rod Labs 2026), and on 251 live questions it beat o3, Gemini 2.5 Pro, Grok 4, and Claude Opus on Brier, ECE, and trading profit simultaneously, using under 10k training samples.

[Thinking Machines and Mantic](https://thinkingmachines.ai/news/training-llms-to-predict-world-events/) (2026) ran GRPO on gpt-oss-120b over roughly 10k binary questions with a Brier reward. The fine-tuned model beats frontier LLMs despite starting from way behind.
- They run the research phase offline and freeze it into static prompts, so the only thing being trained is the prediction policy, and it matters more than you'd expect: the same GRPO training without the frozen research phase only gains 3 points instead of 7.
- The information-gathering policy never learns anything, and most of the win comes from not needing it to.

_FutureWorld_ ([Han 2026](https://arxiv.org/pdf/2604.26733)) scrapes about 2,000 questions a day from 72 sites, resolves them automatically, and trains through the delay with GRPO, masking the search observations out of the policy loss. Models in the 3 to 8B range improve monotonically in accuracy, Brier, and ECE across eight straight days of live training, and because the gains show up across every domain rather than in one, it reads as general reasoning improvement rather than narrow fit.

_Scaling Open-Ended Reasoning To Predict the Future_, OpenForecaster8B ([Chandak 2025](https://arxiv.org/pdf/2512.25070)), builds around 50k open-ended questions (not binary, not multiple-choice) synthesized from 248k news articles, filtering out about 93% of them to kill leakage. It trains with GRPO on a combined accuracy-plus-Brier reward, and the ablation is the takeaway: rewarding accuracy alone wrecks calibration, and rewarding Brier alone wrecks exploration, concretely, the Brier-only variant answers "Unknown" with near-zero confidence on about 40% of questions against about 4% for the combined reward, so you need both. The 8B model matches a 120B one on Brier, and they released the weights, data, and code. A smaller, more targeted result points the same direction: a GRPO-tuned 1.5B Qwen model with only a news-summary tool beat untrained Claude 3.5 Sonnet on forecasting cross-entropy ([Levy 2026](https://arxiv.org/pdf/2606.15917)), a much smaller model plus RL plus retrieval beating a much bigger untrained one, the same pattern as the 8B-matches-120B result above.

**Foresight Learning**, Turtel's team's own generalization of their outcome-based RL result into a reusable named framework, plus a self-play/DPO predecessor and two domain applications (SEC risk disclosure, supply-chain disruption), all covered in [[Turtel (Lightning Rod Labs) - Foresight Learning]]. Both applications beat GPT-5 with a much smaller, purpose-trained model, which is the strongest argument in this vault for training over prompting when you have a narrow domain with dense timestamped text and a clean future label, exactly the shape a finance application would take.

Reaching the frontier of AI forecasting with reinforcement learning (Jeen 2026)

https://github.com/thinking-machines-lab/tinker-cookbook/blob/main/tinker_cookbook/recipes/forecasting/README.md


---

## 11. Open problems

The big one is training the information-gathering policy instead of only the prediction policy. Mantic freezes research into static prompts, and _FutureWorld_ (Han 2026) and _The World Leaks the Future: Harness Evolution for Future Prediction Agents_ ([Wei 2026](https://arxiv.org/pdf/2604.15719)) are the first real attempts to go further. Wei's approach doesn't train the policy directly, it evolves the search harness itself, having the model make repeated checkpoint predictions on the same unresolved question and using how its answer moves as feedback to revise its own evidence-gathering procedure, and it's a real gain: +16.83 points on FutureX and +15.74 on FutureWorld over the baseline scaffold, with the harness's contribution growing the closer you get to resolution (an 11.43-point gap between harness-on and harness-off at two days out). The hard part is credit assignment, tracing a single delayed binary reward back through a long search trajectory.

Then there's resolution versus reliability. Calibration is a solved problem, a few lines of Platt scaling. The unsolved thing is knowing which questions to pull off the base rate and by how much, and that's the entire remaining human advantage, worth 44 percentage points of discrimination against 26 for the best bots (§2).

Fourth is measuring leakage in a way that's actually identifiable. [[Zhang Stadie 2026 - Temporal Leakage in LLM Backtesting|Zhang and Stadie 2026]] hand you designs, none of them cheap, and all of them need to be built in from the start rather than bolted on.


---




Blogs
- [Forecasting Research Institute](https://forecastingresearch.substack.com/)
- [Good Judgment](https://goodjudgment.substack.com/)
- ["AI Forecasting in 2026: What 11 Analyses Say"](https://forum.effectivealtruism.org/posts/Spyz3wESZu2eeqhDj/ai-forecasting-in-2026-what-11-analyses-say).
- https://forecasting-workshop.github.io/
