

- Naively training on question-answer pairs over a time period creates temporal leakage, as early samples in training can leak information relevant to later ones (e.g., "Who will win the election?" followed by "Who will win the primaries?")
- You have to temporally sort training samples and do one epoch
- Each batch you train pushes your PIT cutoff the to the latest resolution date. You can only train on data after this date.


We want to upweight on unlikely scenarios that happened
- Likelynees can be calculated via Kalshi PIT fairs
- Or a naieve base model


we want to give it access to data, a regression harness. basically if we can have an alpha research skill which is actually very good, and give it to the model as a subroutine just understand some data, that would be great


Binarized forcasting vs continuous value forcasting eg of the price of a stock. also predicting a distribution of outcomes explicitly perhaps. eg you convert to multiple choice and give a probablity for each choice

brier score bad? MSE loss not good for binary classificaotin


Skill.state

You should have a probability baysean scratchpad mutable
A world knowledge scarcthpad for persistent content append only with full trace lookup 


Mixture of parrots means we should use dense. 


We want to show a plot of memorization (zero shot score) vs something. It’s hard to control for everything though. Like parameter count changing, cutoff dates changing. Y could be improvement after RL but there are a lot of confounders. 