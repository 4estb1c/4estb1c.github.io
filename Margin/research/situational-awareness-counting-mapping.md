# Chapter I source mapping — private draft

This map connects the existing **public companion summaries and annotations** to
passages in `../drafts/situational-awareness-counting.fulltext.json`. It does
not authorize or prepare the extracted source text for publication.

Canonical source: <https://situational-awareness.ai/from-gpt-4-to-agi/>

| Existing Margin annotation | Extracted passage(s) | Why it maps |
| --- | --- | --- |
| `compute-trend-note` | `counting-0053` — [Compute](https://situational-awareness.ai/from-gpt-4-to-agi/#Compute) | The original calls frontier training-compute growth “roughly ~0.5 OOMs/year”; the annotation updates that slope with Epoch's later historical fit. |
| `effective-compute-note` | `counting-0012`; `counting-0129`; `counting-0140` — [The next four years](https://situational-awareness.ai/from-gpt-4-to-agi/#The_next_four_years) | These passages state the roughly 100,000× / roughly five-OOM four-year projection and the implied agent-worker jump. |
| `efficiency-note` | `counting-0067`, `counting-0073`, `counting-0074` — [Algorithmic efficiencies](https://situational-awareness.ai/from-gpt-4-to-agi/#Algorithmic_efficiencies) | The source distinguishes sparse public evidence from its 1–3 OOM, best-guess two-OOM forecast; the annotation keeps that forecast unresolved. |
| `harder-exams-note` | `counting-0038` — [The trends in deep learning](https://situational-awareness.ai/from-gpt-4-to-agi/#The_trends_in_deep_learning) | This is the original GPQA claim: about 60% for Claude 3 Opus versus about 80% for in-domain PhDs, plus the forecast that the test would fall soon. |
| `data-wall-note` | `counting-0075`, `counting-0085`, `counting-0087` — [The data wall](https://situational-awareness.ai/from-gpt-4-to-agi/#The_data_wall) | These passages describe finite data, the proposed route through it, and the possibility that different labs diverge. |
| `agents-note` | `counting-0100`, `counting-0121` — [From chatbot to agent-coworker](https://situational-awareness.ai/from-gpt-4-to-agi/#From_chatbot_to_agent-coworker) | The original's agent-worker vision includes longer-horizon loops and using workplace tools. The present annotation narrows this to measured reliability and task horizons. |
| `reasoning-compute-note` | `counting-0107`, `counting-0112`, `counting-0116`, `counting-0118` — [From chatbot to agent-coworker](https://situational-awareness.ai/from-gpt-4-to-agi/#From_chatbot_to_agent-coworker) | These make the test-time-compute/latent-ability argument that the annotation updates with recurrent-depth work. |

## One selective H100 tooltip

There is one literal H100 occurrence: `counting-0150`, list item 2, at
“**fp8 on H100s**,” under [Addendum. Racing through the OOMs: It's this decade
or bust](https://situational-awareness.ai/from-gpt-4-to-agi/#Addendum_Racing_through_the_OOMs_Its_this_decade_or_bust).

Suggested tooltip text:

> **NVIDIA H100 SXM:** 80 GB HBM3, 3.35 TB/s memory bandwidth, and configurable TDP up to 700 W. These are per-accelerator vendor specifications, not a direct measure of model-training capability.

Use the official [NVIDIA H100 product and specification page](https://www.nvidia.com/en-us/data-center/h100/) as the tooltip's citation. This is intentionally selective: it anchors a concrete hardware reference in the source rather than adding general definitions for AGI, compute, reinforcement learning, or OOMs.

## Extraction anchors

`counting-0001` through `counting-0184` are deterministic ordered source
anchors. Every block records its canonical source URL; blocks after a source
heading also include that heading's original URL fragment. The synthetic ID is
for stable local editorial mapping when the source page has no paragraph-level
anchors.
