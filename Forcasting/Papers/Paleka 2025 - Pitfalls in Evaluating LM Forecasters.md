# Pitfalls in Evaluating Language Model Forecasters

*Paleka, Goel, Geiping, Tramèr. [2506.00723](https://arxiv.org/abs/2506.00723).*

The methodological paper that should make you suspicious of every reported forecasting number, including the ones elsewhere in this vault. Untrustworthy evals fail in a few specific, recurring ways:

- **Unreliable date-restricted retrieval.** Many forecasting systems incorporate retrieval components restricted to point-in-time (PIT) data. But date metadata is often unreliable, letting future data leak in. More subtly, the retrieval model itself has typically been trained on future data, causing leakage through learned associations even when documents are correctly dated. Example: searching for "January 6th" with a date restriction to 2020 still returns documents with an abnormally strong association to U.S. politics, by 2020 standards, because the retrieval model's embeddings were shaped by everything that happened after.
- **Over-reliance on model cutoff dates.** Stated cutoffs are a provider claim, not a verified wall, and later scrapes and fine-tuning can bleed knowledge past the stated date.
- **Logical leakage.** If someone from 2035 asks you to predict whether we'll find alien life before 2040, you can deduce the answer is "no" (or at least "not yet"), because if the answer were "yes" the asker wouldn't need to ask, they'd already have definitive evidence. The mere framing of a question at a given point in time can leak information about its eventual resolution.

The concrete cautionary case for the retrieval-leakage failure mode is Phan 2024's "LLMs Are Superhuman Forecasters" ([critique thread](https://www.alignmentforum.org/posts/uGkRcHqatmPkvpGLq/contra-papers-claiming-superhuman-ai-forecasting)): an independent replication using the authors' own codebase failed to reproduce the headline result, and the failure traced to exactly this class of leak.

**The practical rule this paper leaves you with:** before trusting any accuracy claim, check it has all four of: questions generated after the model's cutoff, a retrieval corpus frozen at forecast time *including its ranking*, a market or crowd baseline to beat, and a stated $N$ with a confidence interval. Almost nothing in the literature clears all four.
