# Temporal Forecasting Policy Optimizer

> “The idea is that we are trying to build a policy optimizer for temporal forecasting environments where the rewards occur later in time but we would like to still continue learning and updating as time goes on so we can continue to improve based on new information as it is revolved without necessarily waiting for the event to realize”

We want time to teach the model before the answer arrives. A forecast made today may take months to resolve, but tomorrow's evidence can already reveal something useful about it. Can we extract some insights and turn that information into better research habits in the interim while keeping eventual outcomes as the final test?

The idea is to let a better-informed future forecast teach an earlier one. Throughout, we're forecasting the same terminal outcome. An interim return helps the model update its forecast; it doesn't become a reward on its own. When the specified horizon arrives, the actual outcome supplies the final label.

## 1. What are we forecasting?

Suppose we forecast on January 1 what an asset will be worth on March 1. On February 1, we forecast March 1 again. More information is evident by February that can be used to construct a more reliable forecast (we can show a plot of base model + harness forecast rmse as the horizon gets closer and we should see that it monotonically decraeses)

Write the fixed terminal target as $Y_T$ and the information available at time $t$ as $\mathcal I_t$. Research rollout $i$ produces

$$
f_{t,i}=F_{\theta_t}(x,T\mid\mathcal I_t,\tau_{t,i}).
$$

Here $\tau_{t,i}$ is the sampled research trajectory. The target date $T$ stays fixed as the information and policy improve.

The units must also stay fixed. If January's target is the January-to-March return, a February forecast of the remaining February-to-March return must be converted before comparison. For simple returns,

$$
\widehat r_{0:T\mid t}
=
\frac{P_t}{P_0}\left(1+\widehat r_{t:T}\right)-1.
$$

Equivalently, forecast the terminal price throughout. Binary questions use the same settlement outcome at every revisit. Market closing and settlement dates may differ; each question needs an explicit terminal definition.

## 2. Can a future forecast teach an earlier one?

Here is why it can work. Suppose the model could produce the true conditional expectation of the outcome:

$$
q_t=\mathbb E[Y_T\mid\mathcal I_t].
$$

Because later information includes what we knew earlier, the tower property gives, for $s>t$,

$$
\mathbb E[q_s\mid\mathcal I_t]=q_t.
$$

So, across examples, predicting tomorrow's informed belief can teach today's correct forecast. Today's model does not have to predict every surprise tomorrow brings. This is the basis for temporal-difference learning here.

The open problem is teacher quality. A later model has more information, but can still be biased or confidently wrong. Pure self-consistency admits a useless constant forecast. The later forecast is therefore a provisional teacher; terminal supervision and tests on unseen events keep the process tied to reality.

This design uses no direct mark-to-market reward before $T$. Even when interim profit increments sum to terminal profit, they can favor short-term price movements during learning. The intended intermediate signal is the model's updated estimate of the original terminal target.

## 3. What can we get from multiple rollouts?

The insight here is that the actor policy is also the critic. Because the research actor is generating a forecast. Or you could have the actor be the researcher and the critic be the value head. 

We're already generating several research rollouts for GRPO. We might as well use them to make a more reliable teacher, too.

Suppose we generate eight rollouts at time $t$ and save their forecasts and action sequences. At the next revisit $s$, we generate eight more with the current policy and updated information. Averaging the later forecasts gives

$$
z_s=\frac{1}{M}\sum_{j=1}^{M}f_{s,j},
\qquad M=8.
$$

The same new rollouts serve two purposes: they produce the current forecast and teach the earlier group. They can themselves receive feedback at a later revisit.

The mean is a sensible starting point because it matches the conditional-mean objective of squared error. A median or trimmed mean may help if some outputs are erratic; we can test whether that tradeoff improves the teacher.

Freeze $z_s$ during the update. Generate the teacher without showing it the earlier answers or rationales, which could encourage copying. The common question, public evidence, and market history remain available.

Eight earlier forecasts against one teacher produce **eight errors and eight rewards**. There are sixteen rollouts in storage, but the eight new ones are not yet receiving this temporal update. Pairing every old rollout with every new one would create 64 comparisons without 64 independent observations; under squared error, averaging those comparisons gives the same demeaned rewards as using the teacher mean.

## 4. How does this become a GRPO update?

The basic idea is to reward earlier rollouts that came closer to the later estimate. Give each rollout its own negative squared-error reward:

$$
R_{t,i}^{\mathrm{TD}}=-(f_{t,i}-z_s)^2.
$$

At resolution, replace the provisional target with the actual outcome:

$$
R_{t,i}^{\mathrm{MC}}=-(f_{t,i}-Y_T)^2.
$$

For binary outcomes this is negative Brier score. For continuous outcomes it targets the conditional mean. Normalize heterogeneous continuous targets using scales chosen from past data.

Subtract the group's mean reward to form advantages:

$$
A_{t,i}
=
R_{t,i}-\frac{1}{N}\sum_{j=1}^{N}R_{t,j}.
$$

Rollouts closer to the target than their peers receive positive advantage; those farther away receive negative advantage. Apply these weights to the stored model-generated tokens in a clipped GRPO-style policy update, with policy-ratio and KL controls. Tool observations are context, not sampled policy actions to reinforce.

Raw signed forecast errors do not work as rewards here. Demeaning them eliminates the target:

$$
(z_s-f_{t,i})-\frac{1}{N}\sum_j(z_s-f_{t,j})
=
\bar f_t-f_{t,i}.
$$

Squaring the errors preserves the information about which forecasts are closer to the teacher.

Start with mean subtraction without dividing by each group's reward standard deviation. Such division can magnify negligible differences and change the weighting implied by the scoring rule. This is a GRPO variant, not a claim that every standard GRPO recipe preserves calibration. A leave-one-out baseline is another option; for independent on-policy samples, it removes the finite-group shrinkage introduced by including each reward in its own baseline.

No separate value network is needed initially. The forecast ensemble supplies the bootstrap target; the group's rewards supply the comparison baseline. The forecast residual is measured in outcome units, while the GRPO advantage is a difference in scores.

## 5. Are we actually reducing variance?

The appeal of TD is that a good forecast can be less noisy than the outcome it predicts. But research is noisy too: the same model can take different paths and reach different conclusions. Its forecast might be just as variable as the outcome, or worse.

It helps to separate three sources:

- **Future-world uncertainty:** what remains unknown about the outcome, even to an ideal forecaster.
- **Research sampling noise:** different searches and reasoning paths produce different forecasts from the same model and information.
- **Shared model error:** systematic mistakes that survive averaging, including misreading prices or missing the same evidence. This is supervised by the MC loss. 

An ideal future teacher removes some outcome noise. Conditional on today's information,

$$
\operatorname{Var}(Y_T\mid\mathcal I_t)
=
\operatorname{Var}(q_s\mid\mathcal I_t)
+
\mathbb E[\operatorname{Var}(Y_T\mid\mathcal I_s)\mid\mathcal I_t].
$$

The first term is variation in the later informed belief. The second is uncertainty still unresolved then. Replacing the outcome with the ideal teacher removes that second component.

A real teacher adds estimation error. For intuition, write $z_s=q_s+b_s+\epsilon_s$, where $b_s$ is systematic error and $\epsilon_s$ is zero-mean ensemble sampling noise conditional on the later information. Under those assumptions,

$$
\mathbb E[(z_s-q_t)^2\mid\mathcal I_t]
=
\operatorname{Var}(q_s\mid\mathcal I_t)
+
\mathbb E[b_s^2+\operatorname{Var}(\epsilon_s\mid\mathcal I_s)\mid\mathcal I_t]
+
2\mathbb E[(q_s-q_t)b_s\mid\mathcal I_t].
$$

If the final cross-term is negligible, the useful rule of thumb is:

**Bootstrapping helps when teacher bias squared plus ensemble noise is smaller than the outcome uncertainty it removes.**

That condition need not hold. A noisy research policy can be a worse target than the eventual outcome. Low disagreement is also insufficient: eight copies of the same mistaken belief make a stable but poor teacher.

For independent rollouts from a fixed policy and prompt, the mean's sampling variance is $\sigma_{\mathrm{research}}^2/M$. If residuals have pairwise correlation $\rho$ in a broader error model, the corresponding expression is

$$
\operatorname{Var}(\bar\epsilon)
=
\sigma_{\mathrm{research}}^2
\left(\rho+\frac{1-\rho}{M}\right).
$$

Extra rollouts reduce the independent part. They do not remove a shared error floor.

## 6. How could we measure that?

We can start with what the rollouts already tell us. Within a group, the sample standard deviation divided by $\sqrt M$ estimates the teacher mean's sampling error, assuming independent generations. That tells us how repeatable the estimate is, though not whether it is calibrated or missing evidence. Occasional independently generated teacher batches can check that repeatability.

Then compare that uncertainty with the differences driving the policy update. For two old forecasts $f_i$ and $f_j$,

$$
R_i(z)-R_j(z)
=
(f_i-f_j)(2z-f_i-f_j).
$$

Their ranking flips when the teacher crosses their midpoint. If plausible teacher values fall on both sides, the update is uncertain. Bootstrap the teacher ensemble to estimate how often rankings or advantage signs change. This measures sampling sensitivity, not shared bias.

Measure downstream gradient variability as well. Reward noise is multiplied by the policy's log-probability gradients, so target variance alone cannot predict training stability.

The unobservable true probabilities prevent an exact decomposition from one real event. Use chronological held-out cohorts to compare teacher calibration, terminal scores, and learning curves; use simulated environments with known probabilities to test the variance argument directly. No single variance ratio can replace those checks.

## 7. When are more rollouts worth the compute?

The scheduled batches are the natural place to start. More teacher samples are useful when they could change an uncertain update and the sampling noise appears reducible. If the group is already stable, more of the same research is unlikely to help.

If all earlier forecasts are nearly identical, a sharper teacher still gives little relative signal. More diverse research or a different question may be a better use of compute. If teachers agree but remain poorly calibrated, improve evidence collection or the model rather than merely increasing the ensemble size.

Disagreement is a diagnostic, not a reason to weight questions arbitrarily. Adaptive sampling can change the training distribution; record selection probabilities and define the intended weighting.

Compare methods at equal total research tokens and training compute. Reusing eight scheduled rollouts is economical, but it does not make additional revisits free.

## 8. How do we keep learning as time passes?

Store the original prompts, evidence, sampled actions, forecasts, behavior log-probabilities, and policy versions. When feedback arrives, recompute the loss on those recorded trajectories. There is no need to retain a computation graph for months.

The current policy may differ from the policy that generated a stored rollout. Delayed GRPO therefore requires off-policy care. Clipped ratios limit updates but do not fully correct arbitrary policy drift. Use conservative replay and measure staleness.

Predefine each question's total training weight. Allocate a fixed share to interim teacher updates and a fixed share to terminal scoring, dividing the interim share across scheduled revisits. This prevents long-lived questions from receiving unlimited self-distillation weight. Once outcomes arrive, stop using obsolete teacher targets for those examples. Terminal updates provide an anchor; they do not mathematically undo every earlier biased update.

All questions share one causal clock, including the model weights. Future observations may become labels when they arrive, but must not enter earlier decisions or retrospective evaluation.

## 9. The experiment that would settle something

Compare terminal-only GRPO with ensemble-teacher GRPO that also learns from terminal outcomes. Both use the same fixed outcome, scoring rule, research budget, and evaluation schedule. Vary teacher ensemble size, revisit frequency, and interim weight; test robust aggregation only as an ablation.

Report prospective terminal Brier/MSE, calibration, learning per resolved event, and improvement per unit of compute. For a trading application, evaluate the resulting strategy separately on terminal returns after costs. Group uncertainty estimates by event and time, since rollouts share outcomes and related events share shocks.

A sound forecast can lose to chance. Terminal scores distinguish forecasting quality across events, while evidence audits can identify research mistakes within an event. A future teacher may reduce the noise in that learning signal; it cannot certify that one earlier forecast was objectively right.

The question is simple: **does learning before resolution improve later forecasts, or merely make the model agree with its teachers sooner?** Success means better prospective results at the same budget, with fewer resolved events needed to get there.

## 10. Closest literature

- [Sutton (1988), *Learning to Predict by the Methods of Temporal Differences*](https://mlanthology.org/mlj/1988/sutton1988mlj-learning/): learning through successive predictions.
- [Shao et al. (2024), *DeepSeekMath*](https://arxiv.org/abs/2402.03300): introduces GRPO, using grouped rewards to train sampled reasoning.
- [Francis-Meretzki et al. (2026), *Temporal Difference Calibration in Sequential Tasks*](https://arxiv.org/abs/2604.20472): TD calibration of success predictions before episodes end, demonstrated in robotics.
- [Wei et al. (2026), *Harnessing Pre-Resolution Signals for Future Prediction Agents*](https://arxiv.org/abs/2604.15719): uses evolving evidence on unresolved questions to improve procedural guidance.
- [Joulani, György & Szepesvári (2013), *Online Learning under Delayed Feedback*](https://proceedings.mlr.press/v28/joulani13.html), and [Degris, White & Sutton (2012), *Off-Policy Actor-Critic*](https://arxiv.org/abs/1205.4839): foundations for delayed feedback and learning from older policies.
- [Gneiting & Raftery (2007), *Strictly Proper Scoring Rules, Prediction, and Estimation*](https://doi.org/10.1198/016214506000001437): why squared and logarithmic scores reward honest beliefs in expectation.

This formulation develops the future-teacher idea in [[Forcasting/RL/Notes|Notes]]. It retains the causal clock and replay concerns in [[Forcasting/Policy Optimization|Policy Optimization]], while choosing forecast-mediated supervision over that note's interim market-profit updates.




an open question here is, do we want to regenerate each of the trajectories fresh, or do we want to feed in the context of the earlier research agents? i would say the former probably so these all serve as good training data that makes sense, normal standard trajectories all of the same flavor.