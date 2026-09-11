Can you think a bit about exactly what the best way to structure our training policy is? We don't really care about iso-compute because the data is so sparse. We care about sample efficiency—basically, finding the best existing RL framework and using that as a starting baseline. And then there are three questions I have:



- **Propose this causal clock** as an approach to improve sample efficiency. Start building the code to do this kind of experiment to answer this question. The experiment will look something like: train a small model in the same way that the best RL paper for this sort of forecasting fine-tuning model works. Then, train a small model with our proposed clock methodology and custom TD/MC backprop, and compare their performance on held-out data using some kind of paired t-test. Remember, iso-compute doesn't matter because we are data-bound, so any way to pour more compute in and get better results is okay.

  \

- **Try to see if we can get training pre-cutoff to work.** The way this would roughly look is you get the model to zero-shot a prediction, then you let it use the tools and see what it can do. We reward improvement over its zero-shot performance. So if it had already memorized the right answer, no research would ever help. This automatically kind of filters down to the cases where the model hasn't memorized the answer even though it's pre-cutoff.

  \

- **Try to establish scaling laws for RL for forecasting.** We are interested in how performance scales with model size, RL compute, RL window (like how many months the examples span), and how MoE impacts things (it may be hard to test this because we don't have that many open models, but think of how to best do it. We want to show that MoE is bad—it has more memorization).

  \


Another note that we should think about is: we probably want a separate model for the output head. The output will read in the context the thinker/context-gatherer agent has gathered and then return a single float. We need to think about how to effectively co-train these networks. This requires a whole other recipe and careful thought. These are a bunch of different ideas, but they all interconnect, so we do need to think carefully about these recipes.



Think of the best way to serve and train our models. Do we want to rent some H100s or A100s, or is it easier to use tinker from Thinking Machines?



Please outline a paper for this whole thing in an md file too. It should still call out any uncertainties. This is really frontier stuff—real legitimate research at the edge of human knowledge—so please go deep and think hard.



For now, please just focus on the plan: read in every document in my Obsidian folder, and then just think about refining this idea that I have discussed. This design document will guide our entire project so please work hard to generate great ideas at this stage, outline a few possibilities when there are multiple potential valid ways to do something and then argue the one you want to go with and why.&#x20;



This should serve as the design doc and spec for how the whole project will go. Feel free to dig deep into research of the literature too if that would help.


for the really small scale expirmetns we would like to be able to run these training runs on my own gpu. please aim to set up all the infrastructure so that this works and we can start training some mini experiments at small scale. whatever the best transofmer that we could fine tune on a 5080 is. please try **Qwen 2.5-3B** with a qlora