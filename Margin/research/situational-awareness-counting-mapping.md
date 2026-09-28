# Chapter I source mapping — private draft

This map connects the existing **public companion summaries and annotations** to
passages in `../drafts/situational-awareness-counting.fulltext.json`. It does
not authorize or prepare the extracted source text for publication.

Canonical source: <https://situational-awareness.ai/from-gpt-4-to-agi/>

| Existing Margin annotation | Exact extracted block ID(s) and identifying words | Why it maps |
| --- | --- | --- |
| `compute-trend-note` | `counting-0052` — “training compute … ~0.5 OOMs/year” ([Compute](https://situational-awareness.ai/from-gpt-4-to-agi/#Compute)) | The annotation updates that slope with Epoch's later historical fit. |
| `effective-compute-note` | `counting-0011` — “~100,000x effective compute scaleup”; `counting-0128` — “best guess of ~5 OOMs” ([The next four years](https://situational-awareness.ai/from-gpt-4-to-agi/#The_next_four_years)) | These passages state the four-year projection and implied agent-worker jump. |
| `efficiency-note` | `counting-0066` — “harder to measure”; `counting-0073` — “1-3 OOMs … best guess of ~2” ([Algorithmic efficiencies](https://situational-awareness.ai/from-gpt-4-to-agi/#Algorithmic_efficiencies)) | The source distinguishes sparse public evidence from its forecast; the annotation keeps that forecast unresolved. |
| `harder-exams-note` | `counting-0037` — “tests like GPQA” ([The trends in deep learning](https://situational-awareness.ai/from-gpt-4-to-agi/#The_trends_in_deep_learning)) | This is the original GPQA claim and forecast that the test would fall soon. |
| `data-wall-note` | `counting-0084` — “overcoming the data wall”; `counting-0086` — “lab … get stuck” ([The data wall](https://situational-awareness.ai/from-gpt-4-to-agi/#The_data_wall)) | These passages describe finite data, the proposed route through it, and divergent lab outcomes. |
| `agents-note` | `counting-0119` — “isolated box”; `counting-0120` — “Zoom calls … dev tooling” ([From chatbot to agent-coworker](https://situational-awareness.ai/from-gpt-4-to-agi/#From_chatbot_to_agent-coworker)) | The original's agent-worker vision includes longer-horizon loops and workplace tools. The present annotation narrows this to measured reliability and task horizons. |
| `reasoning-compute-note` | `counting-0106` — “test-time compute overhang”; `counting-0111` — “error correct”; `counting-0115` — “substitute for training compute” ([From chatbot to agent-coworker](https://situational-awareness.ai/from-gpt-4-to-agi/#From_chatbot_to_agent-coworker)) | These make the latent-ability argument that the annotation updates with recurrent-depth work. |

## One selective H100 tooltip

There is one literal H100 occurrence: `counting-0149`, list item 2, at
“**fp8 on H100s**,” under [Addendum. Racing through the OOMs: It's this decade
or bust](https://situational-awareness.ai/from-gpt-4-to-agi/#Addendum_Racing_through_the_OOMs_Its_this_decade_or_bust).

Suggested tooltip text:

> **NVIDIA H100 SXM:** 80 GB HBM3, 3.35 TB/s memory bandwidth, and configurable TDP up to 700 W. These are per-accelerator vendor specifications, not a direct measure of model-training capability.

Use the official [NVIDIA H100 product and specification page](https://www.nvidia.com/en-us/data-center/h100/) as the tooltip's citation. This is intentionally selective: it anchors a concrete hardware reference in the source rather than adding general definitions for AGI, compute, reinforcement learning, or OOMs.

## Extraction anchors

List blocks retain their source hierarchy: a list item may contain `children`,
where each child is an `{ "ordered": boolean, "items": [...] }` group. The
root block and every item also retain rendered source markup in `html`; this
keeps nested `<ul>` and `<ol>` distinctions available for a future private
reader without changing the public article schema.

## Saved image asset repair

The private draft deliberately marks saved-page `*_files` image paths as
`unresolved-local-saved-asset` with `src: null`; it never turns those paths into
invented URLs on the canonical page. The current Chapter I draft has three:

- `counting-0022` — `gpt3_examples-1.png`. The reviewed canonical original is
  `https://situational-awareness.ai/wp-content/uploads/2024/06/gpt3_examples-1.png`.
- `counting-0025` — `gpt4_examples-3.png`. The reviewed canonical original is
  `https://situational-awareness.ai/wp-content/uploads/2024/06/gpt4_examples-3.png`.
- `counting-0151` — `unnamed.png`. Keep unresolved pending a reviewed original;
  its source page's Google-hosted URL was not a reliable canonical replacement.

[`situational-awareness-counting.asset-map.example.json`](../drafts/situational-awareness-counting.asset-map.example.json)
contains the two reviewed mappings. To create a review-only repaired derivative,
copy it to a local map, add a verified mapping for any remaining asset, and run
`py Margin/scripts/extract_fulltext.py <saved-html> --source-url <canonical-page>
--output <private-draft> --asset-map <local-map>`. Do not point a public reader
at the saved local files or this private draft.

`counting-0001` through `counting-0183` are deterministic ordered source
anchors. Every block records its canonical source URL; blocks after a source
heading also include that heading's original URL fragment. The synthetic ID is
for stable local editorial mapping when the source page has no paragraph-level
anchors.
