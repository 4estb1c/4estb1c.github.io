what we want to emphasize here is breadth of questions. these need to be judgmental questions that require research. something like weather prediction is not great because time series models can systematically do much better. we want questions that require some human judgment and reading, this is why i think reading financial statements is great. think of any similar ideas. and then do whatever it takes to find a good dataset of questions about that, or systematically generate it from a dataset (eg if you have stock returns, or if you have balance sheets you can turn those line items into prediction targets). and then also make sure we have apropriate tool calls to support the kind of resources you might need in order to make those predictins. for financials we might like access

Things we do differently
- We give the model the crowd belief as its baseline, you assume the market trades at fair and see if you can do better, otherwise you fade to their beliefs

#### 1. Harness
We need to think about good harness design. Good tools, good search engines.

We also want our harness to be conducive to good RL, however that is possible

Lots of variants to do here
- Do we want to break out fine tuning? Context retrieval LM, judge LM, interactive tool use reasoning LM, scoring LM could all be different adapters. 
- Single continuous scoring head

#### 2. Training Recipe
We establish a temporal RL framework with off-policy gradient updates and self-supervision

There are two different kinds of datasets. Ones that have a continuously updating live fair market value (stock price prediction, kalshi markets) and those that do not (if we have some LLM generated question about whether some event will occur in 6 months). For now we should use only data with a live fair. Otherwise you could use an ensemble of your current model to generate a standin self-supervised fair. You could also condition that generation on your previous forecast rationale.

Create a clock
1. Generate forecasts for open questions at that clock's PIT
2. For all open questions, with parameterizable probability $p$ select each question. Backpropagate a gradient marked to market and regenerate a fresh fair. Technically these steps don't need to be coupled. We could backprop a gradient more frequently without refreshing our estimate every time.
3. Check if any open questions resolved at that PIT and backpropagate their gradients against their resolution and weight sync

For an example let's say there's just one market:
- At $t=1$, we generate a forecast $f_1$
- At $t=2$, we sample $p$ and it hits. We observe market price $m_2$ and backprop $L=(f_1-m_2)^2$  and weight sync. We then generate $f_2$
- At $t=3$, the market resolves. We observe realization $o$ and backprop $L=(f_1-o)^2$ and $L=(f_2-o)^2$.

This is how things have to be in order to be causal. There is perhaps an argument that the RL will just build research skills and is not a huge avenue for leakage so its kind of okay. But also I think that there are often correlated events, where two contracts may be very similar or rely on the same sub-forecast, in which case this is genuine leakage. But then you are doing weird off-policy training

This is slightly weird because if we have a lot of edge, the current market price is not a good indicator. But on average we can assume our edge is approximately dominated by real market moves. And even if its not, this just acts as a regularizer so its fine.


Training pre-cutoff vs only post-cutoff
- I suspect that pre-cutoff training is cooked. Even if we control for zero-shot knowledge, the mechanism for trying to determine an answer will be very different pre-cutoff. Because you may not remember a particular event, but you may be able to remember other things that happened after is and try to reason your way into the answer backwarads from that known information. its a very different mechansim.

To make this sparse problem amenable to RL, we need to extend our dataset. 

self-supervised critic with clock temporal differencing
PnL loss

#### 3. Training Data
Financial instruments are a great source of forecasting problems.
- There is a long history of stock returns and documents.
- Predicting earnings for different companies requires learning diverse forecasting ability.
- We must hedge out common factors to isolate idiosyncratic movements and increase the effective number of independent observations

pool questions from [forecastbench.org](https://www.forecastbench.org/leaderboards/), [prophetarena.co](https://www.prophetarena.co/), [evals.futuresearch.ai](https://evals.futuresearch.ai/), Metaculus FutureEval.

Issue with a lot of these questions is they are not that interesting or predictable or meaningful to predict. If you can only get like a bip of edge it’s not worth the compute to train and the gradient variance will dominate. 
#### 4. Scaling Laws
How does this scale with inference time compute? That's a good question for our scaling laws.
How does it scale with RL compute? what's the optimal boundary of pretrain vs rl cutoff?

MOE same number of active parameters but vary sparsity.

#### 5. SOTA Forecaster

#### 6. Ablations
Do a no research ablation. Shows that your RL is in riding models with real skill. 

Have a different adaptor for each component. The question refinement. The article ranking. The reasoning. The final prediction head. Allows you to train them separately, see if that’s better than one composite, but also ablate them. 
#### 6. Future work
We would like to do pretraining. Model's knowledge more faithfully reflects, and allows to operate at the frontier of its knowledge. Budget precluding, there is a tradeoff between later model cutoffs having better performance but less RL data. 

We want to do some scaling laws with how much RL data you give, and how it performs at different horizons after the cutoff. 

X axis is time, y axis is performance. We have lines for performance over time of the same model as it gets more RL data. it should be several decreasing lines stacked on top of each other. 

We see that RL post-cutoff is more effective, 

Looped language models allow us to get reasoning performance without increasing parameters. Opposite of MOE. This is valuable because we see training effectiveness is greater when there is more reasoning per parameter.

Current landscape is heavily scaffolded. Human decisions regarding scaffolding choices are the main differentiator. Bitter lesson


#### Appendix
Cost estimate for a small 4B run on 1,000 questions is ~$100

| Item                                                                  | Estimated cost |
| --------------------------------------------------------------------- | -------------- |
| Generate 16,000 rollouts, averaging 4,000 input + 2,000 output tokens | $16            |
| One training pass over those sequences                                | $29            |
| **Training run total**                                                | **$45**        |
| Evaluation and room for debugging                                     | ~$25–$55       |
| **Suggested budget**                                                  | **$100**       |

10,000 rollouts
2,000 input per rollout at $0.1 / M = $20
3,000 output per rollout at $0.3 / M = $90
