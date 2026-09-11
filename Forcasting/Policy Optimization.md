The model should be trained to produce tradable disagreement with the current market fair, then rewarded by the subsequent return on that disagreement. This works for prediction markets and stocks so long as every example has a contemporaneous, point-in-time market price.

The objective is PnL, not Brier score. That changes what the output means: it is a forecast of future fair value, or equivalently a position signal relative to the current price. It is not automatically a calibrated probability.

Do we want to break this out into a researcher and a frozen judge? Probably yes. How do we train either. Can we train both simultaneously. 

## 1. Market-relative reward

Let $m_t$ be the current market price of a contract, $f_t$ the model's forecast of fair value at a specified terminal horizon, and $z_t$ be the implied forecasted return and position induced by their difference:
$$z_t = \frac{f_t-m_t}{m_t}$$
Let $r_{t:T}=\frac{m_T-m_t}{m_t}$ be the realized return. We opt to use the reward:
$$R_{t:T}=z_t r_{t:T}-\frac{1}{2}z_t^2$$
This is the PnL of a trade minus a risk penalty. We use $1/2$ since it gives us nice calibration: $z_t^*\ |\ \mathcal{I}_T=r_{t:T}$ and therefore $f_t^*\ |\ \mathcal{I}_t=\mathbb{E}[m_T]$

Some notes:
- This is equivalent to a market-relative Brier reward $R_{t:T} = \frac{(m_T-m_t)^2-(m_T-f_t)^2}{2m_t^2}$
- We opt not to liquidity weight to increase the effective variety of our sparse data.
- The model will directly forecast $f_t$ rather than the return because it is more intuitive to forecast fairs for binary contracts than returns.
- Naive PnL loss encourages the model to take the largest permitted position whenever expected return is positive. Clipping, risk normalization, and transaction costs are therefore part of the definition of the objective.

## 2. One global causal clock

At every clock time, expose only information available by that time: documents, tool results, market quotes, model weights, and resolved events. A single global clock is required across all questions. Training on the resolution of event A before evaluating a contemporaneous, related event B leaks information through the weights.

For each eligible open market at time $t$:

1. Record the point-in-time input, tool transcript, sampled research trajectory $\tau_t$, forecast $f_t$, market price $m_t$, behavior-policy log-probabilities, and policy version.
2. Convert the forecast into a bounded position $z_t$.
3. At later clock ticks, mark that position against market moves. At resolution, mark its final remaining return against the settlement payoff.
4. Use those delayed rewards to update the policy, then generate new forecasts with the updated policy.

Question sampling probability $p$ can determine which open trajectories receive intermediate updates. It controls compute and feedback delay; it does not create extra independent evidence.

## 3. Mark-to-market rewards telescope exactly

For a forecast made at $t_0$, observe subsequent market marks $m_{t_1},\ldots,m_{t_K}$ where $m_{t_K}=O$ for a resolved binary contract. Hold the original position $z_{t_0}$ fixed when attributing its reward. Its increments are

$$
r_k=z_{t_0}(m_{t_{k+1}}-m_{t_k}).
$$

They telescope:

$$
\sum_{k=0}^{K-1}r_k
=z_{t_0}(O-m_{t_0}).
$$

Thus market prices give earlier feedback without changing the total terminal PnL of the original forecast. This is stronger than repeatedly adding squared errors against each mark, which changes the objective by giving long-lived questions extra market-imitation weight.

For the one-market example:

- At $t=1$, generate $f_1$, observe $m_1$, and take $z_1=f_1-m_1$.
- At $t=2$, observe $m_2$. Credit the original trajectory with $z_1(m_2-m_1)$, update, then generate $f_2$ and take $z_2=f_2-m_2$.
- At $t=3$, the contract settles to $O$. Credit the first trajectory with the remaining increment $z_1(O-m_2)$ and the second with $z_2(O-m_2)$.

The total credit for $f_1$ is $z_1(O-m_1)$; it is not counted twice. The new forecast $f_2$ is separately judged from its own entry price.

For stocks, use point-in-time prices and returns over the relevant holding intervals in the same way. Corporate actions, splits, delistings, liquidity, borrow, spreads, and execution assumptions have to be reflected in the realized return series.

## 4. Why current market prices are enough

The market quote is the benchmark from which a position is taken. You do not need to claim that future market prices are unbiased estimates of the eventual outcome in order to use mark-to-market PnL. You are directly optimizing the economic question: did the model's deviation from the market earn money over the next interval?

The market still determines the feedback path. If the model has insight that markets do not incorporate until settlement, intermediate marks may be noisy or adverse before terminal resolution. The telescoping construction prevents this from changing the total reward for a fixed held position; it only affects when feedback arrives and therefore its variance. If positions are rebalanced or closed after each mark, that is a different trading policy and should be evaluated as such.

This formulation assumes a usable, live fair price. It does not apply cleanly to isolated LLM-generated questions with no contemporaneous market. A self-generated fair would be self-distillation, not external PnL supervision.

## 5. Delayed outcomes still make policy learning off-policy

The forecast trajectory $\tau_t$ was sampled from $\pi_{\theta_t}$, while its market increment or eventual settlement may arrive after the policy has become $\pi_{\theta_T}$. Updating current parameters using the old trajectory is off-policy.

In principle, an importance-weighted policy-gradient term is

$$
\frac{\pi_{\theta_T}(\tau_t)}{\pi_{\theta_t}(\tau_t)}
R(\tau_t)\nabla_{\theta_T}\log\pi_{\theta_T}(\tau_t).
$$

For long LLM trajectories, this likelihood ratio can have enormous variance. Store behavior log-probabilities and policy versions, then use a bounded replay window, clipped ratios, KL control, and a conservative update schedule. Those measures introduce bias, but they limit variance and policy drift.

The relevant staleness measure is policy drift, not calendar delay. Market marks help because they deliver reward increments sooner, reducing how far the policy can move before the trajectory receives credit. They do not remove the off-policy problem.

“Replay” here means reuse the original stored trajectory after a new market mark or settlement becomes available. Do not ask the current model to answer an old question again: its weights may have learned later events or the answer, even if its prompt and tools are restricted to the old date. That creates hindsight-contaminated training and invalid historical evaluation.

## 6. Actor, critic, and forecast head

The actor generates research actions and a forecast. The return critic estimates expected future PnL from the current state and position:

$$
V^\pi(s_t,z_t)=\mathbb E\!\left[\sum_{k\ge t} r_k\mid s_t,z_t\right].
$$

Using $R-V^\pi$ as an advantage to train the actor gives a standard actor–critic method. A critic reduces variance by predicting expected PnL; it does not replace realized market returns as the reward signal.

The fair-value forecast $f_t$ is not itself the critic. It parameterizes the position $z_t$. A separate value head can share the LLM trunk with the forecast head, but should be trained to predict future PnL conditional on the state and chosen position.

Multiple actor rollouts for the same market can be compared against the same realized market move. This cancels much of the common market noise in their relative rewards. Averaging several rollouts reduces sampling variance in the forecast, but it does not remove shared model error or uncertainty in future market moves.

## 7. Evaluation

Evaluate the original recorded forecasts and positions in chronological order. Report realized PnL after costs, Sharpe or equivalent risk-adjusted performance, turnover, maximum drawdown, calibration as a diagnostic for binary forecasts, and performance versus the contemporaneous market benchmark.

Separate prospective evaluation from retrospective training. Pre-cutoff questions may teach procedures, but they do not establish that the model lacked knowledge of future events. A current policy rerun on an old question is not a valid historical forecast.

The main experiment compares terminal-only PnL feedback with telescoped mark-to-market feedback, holding position limits, market universe, compute, and policy-drift controls fixed. Intermediate marks are useful if they improve eventual out-of-sample PnL or reach the same performance with fewer resolved outcomes.