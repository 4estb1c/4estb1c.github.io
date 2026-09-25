# Situational Awareness

By Leopold Aschenbrenner · Published 2024-06

Source: https://situational-awareness.ai/

The Decade Ahead, revisited. A reading companion to Leopold Aschenbrenner’s 2024 essays, with the evidence that has arrived since.

> A companion across all nine sections, checked through 25 September 2026. The left column contains concise claim summaries, not the original essay text. Read the complete essays at the linked sources. Dates on evidence distinguish measurements from forecasts; missing public evidence is left unresolved.

Source mode: independently written claim summaries. The original essay is linked, not reproduced here.

## Introduction

Compute investment and electricity demand will rise sharply as the race toward AGI gathers pace.

**Inspector update — The scale is becoming concrete.**

By April 2026, OpenAI said it had secured more than 10 GW of US infrastructure capacity. That is a commitment across a buildout, not 10 GW already running—or one giant training cluster.

[stargate] Building the compute infrastructure for the Intelligence Age — https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/ (OpenAI; 2026-04-29)

The essays anticipate graduate-level abilities in 2025–26, followed by superintelligence before the decade ends.

**Inspector update — Several milestones have arrived. The deadline remains open.**

Google’s research system earned 35 of 42 points at the 2025 International Mathematical Olympiad, with official grading. That is a substantial change from GPT-4’s school-exam performance. It does not settle whether a model can take over an open-ended research job.

[imo] Gemini Deep Think at IMO 2025 — https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/ (Google DeepMind; 2025-07-21)

## I. Counting the OOMs

Training compute is expected to grow by roughly half an OOM per year.

**Inspector update — The measured trend remains steep.**

Epoch’s February 2026 dashboard puts frontier language-model training compute growth at about 5× per year since 2020, or 0.70 OOM. Different sample windows give different slopes; this is a historical fit, not a measurement of any undisclosed new model.

[epoch-trends] Trends in Artificial Intelligence — https://epoch.ai/trends (Epoch AI; 2026-02-05)

```json
{
  "type": "bar",
  "title": "Annual training-compute growth",
  "description": "Factors per year. Original assumption versus Epoch’s historical estimate; different periods, not a before-and-after measurement.",
  "xLabel": "Estimate",
  "yLabel": "Growth factor / year",
  "series": [
    {
      "label": "Annual multiplier",
      "data": [
        {
          "x": "2024 assumption",
          "y": 3.16
        },
        {
          "x": "Epoch · Feb 2026",
          "y": 5
        }
      ]
    }
  ]
}
```

Algorithmic improvements may add another two OOMs of effective compute by 2027.

**Inspector context — There is no clean public odometer.**

Efficiency keeps improving, but lower serving prices, better benchmark scores and cheaper training are different quantities. The projected 100× training-efficiency gain cannot be marked achieved from API price cuts. Keep the forecast open until comparable training evidence is available.

[epoch-trends] Trends in Artificial Intelligence — https://epoch.ai/trends (Epoch AI; 2026-02-05)

Graduate-level science questions are expected to become another saturated benchmark.

**Inspector update — That particular barrier has largely fallen.**

OpenAI reports 96.0% on GPQA Diamond for Astra in September 2026. Its same release reports 59.3% on Agents’ Last Exam. These are different tests, not a shared intelligence scale; the contrast shows why exam mastery and dependable professional work need separate measurements.

[astra] GPT-6 Astra: A new generation of intelligence — https://openai.com/index/gpt-6-astra/ (OpenAI; 2026-09-03)

```json
{
  "type": "table",
  "title": "One model, different tests",
  "description": "Developer-reported Astra results, September 2026. Scores have different meanings and are not directly comparable.",
  "columns": [
    {
      "key": "benchmark",
      "label": "Benchmark"
    },
    {
      "key": "score",
      "label": "Reported score"
    }
  ],
  "rows": [
    {
      "benchmark": "GPQA Diamond",
      "score": "96.0%"
    },
    {
      "benchmark": "Agents’ Last Exam",
      "score": "59.3%"
    }
  ]
}
```

Finite internet data could block further scaling; synthetic data and reinforcement learning may provide a way through.

**Inspector update — A real alternative to another pass over the web.**

DeepSeek-R1 demonstrated reasoning gains from reinforcement learning, including a research variant trained without preliminary supervised fine-tuning. Feedback from verifiable answers supplies a different learning signal. That makes the data constraint less simple; it does not make trustworthy training data unlimited.

[r1] DeepSeek-R1 technical report — https://arxiv.org/abs/2501.12948 (DeepSeek; 2025-01-22)

Tools, memory and longer task execution could turn chatbots into useful autonomous coworkers.

**Inspector update — Measure the task, and the reliability.**

METR’s May 2026 update warns that horizons above 16 human-expert hours are unreliable with its current task suite. Its 50% horizon is a difficulty measure at one-in-two success—not a promise of 16 hours of reliable unattended work.

[metr-horizons] Task-completion time horizons — https://metr.org/time-horizons/ (METR; 2026-05-08)

Unlocking latent abilities is expected to complement larger base models.

**Inspector context — Compute now has another place to go.**

Geiping and colleagues demonstrated a 3.5-billion-parameter model that spends extra inference compute by repeatedly applying an internal block. More computation need not mean more visible reasoning tokens. This changes both the economics of an answer and what a human can inspect.

[latent] Scaling up test-time compute with latent reasoning — https://arxiv.org/abs/2502.05171v2 (Geiping et al.; 2025-02-17)

## II. The intelligence explosion

Replicated AI researchers could compress years of algorithmic progress into months.

**Inspector update — Research assistance is measurable; full substitution is harder.**

Anthropic reports that its typical engineer merged eight times as much code per day in Q2 2026 as in 2024. It explicitly cautions that code volume overstates productivity. This supports substantial workflow change, while leaving the speed of valuable scientific progress unresolved.

[anthropic-rd] When AI builds itself — https://www.anthropic.com/institute/recursive-self-improvement (Anthropic Institute; 2026-09-18)

Automated AI research could feed improvements back into the systems doing the research.

**Inspector update — A small version of the loop now exists.**

A September 2026 preprint reports seven successive improvements to a research agent’s own code during an eight-day run, with gains on four held-out benchmarks. The object being improved was the agent software. It was not an autonomous succession of newly trained frontier models.

[aide2] Recursive self-improvement of AI research agents — https://arxiv.org/abs/2609.26457 (Srikanth et al.; 2026-09-22)

Experiment compute and the last difficult parts of research could limit the intelligence explosion.

**Inspector context — The remaining work sets the ceiling.**

Illustration: if 90% of a workflow becomes 10× faster and the rest is unchanged, total speed rises only 5.26×. Even infinite speed on that fraction caps the gain at 10.00×. This is arithmetic, not an estimate of how much research is currently automated.

```json
{
  "type": "line",
  "title": "Faster parts, slower whole",
  "codePaths": [
    "scripts/rebuild_figures.py"
  ],
  "description": "Illustrative Amdahl calculation: S = 1 / ((1 − f) + f / s). Assumed accelerated fraction f = 0.9; not empirical data.",
  "xLabel": "Speedup of automated work",
  "yLabel": "Whole-workflow speedup",
  "series": [
    {
      "label": "90% of work accelerated",
      "data": [
        {
          "x": 1.0,
          "y": 1.0
        },
        {
          "x": 2.0,
          "y": 1.818
        },
        {
          "x": 5.0,
          "y": 3.571
        },
        {
          "x": 10.0,
          "y": 5.263
        },
        {
          "x": 20.0,
          "y": 6.897
        },
        {
          "x": 50.0,
          "y": 8.475
        },
        {
          "x": 100.0,
          "y": 9.174
        }
      ]
    }
  ]
}
```

## IIIa. The trillion-dollar cluster

The cluster scenario reaches around 1 GW in 2026, 10 GW in 2028 and 100 GW in 2030.

**Inspector context — Keep the units—and the boundaries—straight.**

A power reservation, an energized site, a company’s total fleet and a single training run are four different things. The latest Stargate commitment supports the scale of investment envisaged here. It does not establish that the projected single-cluster milestones have been met.

[stargate] Building the compute infrastructure for the Intelligence Age — https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/ (OpenAI; 2026-04-29)

The scenario depends on rapid growth in the compute available to leading labs.

**Inspector update — The available fleet grew 9.5× in two years.**

OpenAI disclosed roughly 1.9 GW of available compute in 2025, up from 0.2 GW in 2023. This company-reported fleet measure is closer to deployed capacity than a future power commitment; it still says little about any one training run.

[fleet] OpenAI House Select Committee update — https://cdn.openai.com/pdf/045aa967-ee96-4a09-94ee-3098ddf6db2c/OpenAI-US-House-Select-Cmte-Update-%5B021226%5D.pdf (OpenAI; 2026-02-12)

```json
{
  "type": "bar",
  "title": "OpenAI’s available compute",
  "description": "Company-reported capacity, GW. The 2025 value is approximate. Available fleet capacity is not a single cluster or measured utilization.",
  "yLabel": "GW",
  "series": [
    {
      "label": "Available compute",
      "data": [
        {
          "x": "2023",
          "y": 0.2
        },
        {
          "x": "2024",
          "y": 0.6
        },
        {
          "x": "2025",
          "y": 1.9
        }
      ]
    }
  ]
}
```

NVIDIA’s data-centre sales could keep expanding far beyond their 2024 level.

**Inspector update — The old annualized figure is now a quarter.**

NVIDIA reported $89 billion in Data Center revenue for the quarter ended July 26, 2026—117% above a year earlier. That is nearly the $90 billion annualized pace cited in the essay. Sales confirm demand; they do not count installed or active GPUs.

[nvidia26] NVIDIA Q2 FY2027 financial results — https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Second-Quarter-Fiscal-2027/ (NVIDIA; 2026-08-26)

Power generation, grid connections and equipment could constrain the buildout.

**Inspector update — Demand is outrunning the grid’s usual pace.**

IEA reports that data-centre electricity use rose 17% in 2025, versus 3% for global electricity demand. It also identifies tightening turbine, transformer and grid-connection bottlenecks. The physical constraint in the essay is now visible in deployment.

[iea26] Data-centre electricity use in 2025 — https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions (IEA; 2026-04-16)

```json
{
  "type": "bar",
  "title": "Electricity demand growth · 2025",
  "description": "Global annual growth, IEA April 2026. Data centres include AI and other workloads.",
  "yLabel": "Year-on-year growth (%)",
  "series": [
    {
      "label": "Demand growth",
      "data": [
        {
          "x": "All electricity",
          "y": 3
        },
        {
          "x": "Data centres",
          "y": 17
        }
      ]
    }
  ]
}
```

Future clusters are expressed in H100-equivalents, with hardware efficiency shaping cost and power.

**Inspector update — The hardware baseline has moved.**

Rubin’s published peak memory bandwidth is 22 TB/s, versus H100 SXM’s 3.35 TB/s. More bandwidth can ease inference bottlenecks. Converting this into H100-equivalents still requires a workload, numerical precision and measured utilization.

[a100] A100 80 GB datasheet — https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/a100-80gb-datasheet-update-nvidia-us-1521051-r2-web.pdf (NVIDIA; )

[h100] H100 product specifications — https://www.nvidia.com/en-us/data-center/h100/ (NVIDIA; )

[hgxs] HGX GPU specifications — https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html (NVIDIA; 2026-05-18)

[rubin] Inside NVIDIA Rubin GPU architecture — https://developer.nvidia.com/blog/inside-nvidia-rubin-gpu-architecture-powering-the-era-of-agentic-ai/ (NVIDIA; 2026-07-21)

```json
{
  "type": "table",
  "title": "Memory is a separate axis of progress",
  "description": "Per-GPU vendor specifications. Capacity in GB; peak bandwidth in TB/s. Rubin values are up to. These are not measured application speedups.",
  "columns": [
    {
      "key": "gpu",
      "label": "GPU"
    },
    {
      "key": "capacity",
      "label": "GB"
    },
    {
      "key": "bandwidth",
      "label": "TB/s"
    }
  ],
  "rows": [
    {
      "gpu": "A100 80GB SXM",
      "capacity": 80,
      "bandwidth": 2.039
    },
    {
      "gpu": "H100 SXM",
      "capacity": 80,
      "bandwidth": 3.35
    },
    {
      "gpu": "H200 SXM",
      "capacity": 141,
      "bandwidth": 4.8
    },
    {
      "gpu": "B200 SXM",
      "capacity": 180,
      "bandwidth": 8
    },
    {
      "gpu": "B300 SXM",
      "capacity": 288,
      "bandwidth": 8
    },
    {
      "gpu": "Rubin",
      "capacity": 288,
      "bandwidth": 22
    }
  ]
}
```

## IIIb. Security for AGI

Protecting model weights and algorithmic knowledge will require much stronger security.

**Inspector update — The model is now part of the threat model.**

In September 2026, OpenAI classified Astra at its Critical cybersecurity threshold and described stronger isolation and monitoring after the Hugging Face incident. This is the developer’s assessment. The problem now includes containing the systems doing the work, as well as keeping outsiders out.

[critical] Path to Astra: critical capabilities and frontier safeguards — https://openai.com/index/path-to-astra/ (OpenAI; 2026-09-01)

Preparations against capable state actors need to start years before AGI.

**Inspector update — A roadmap is evidence of effort, not assurance.**

Anthropic moved the first phase of its extreme-security prototype work from May to September 30, 2026. As of this edition, that deadline is still ahead. Public commitments make progress easier to audit, but cannot demonstrate resistance to a top-tier intelligence service.

[roadmap] Frontier Safety Roadmap — https://www.anthropic.com/responsible-scaling-policy/roadmap (Anthropic; 2026-07-29)

## IIIc. Superalignment

Human feedback may become inadequate when people cannot reliably judge the model’s work.

**Inspector update — A readable explanation is only one safety layer.**

An August 2026 study found that monitors detected 60–94% of explicitly induced behavioral shifts, but detection fell by 41–46 percentage points in two settings when influence was implicit. The result is task-specific; it shows why legible reasoning alone is not evidence of faithful oversight.

[monitor] Chain-of-thought monitoring in implicit-influence settings — https://arxiv.org/abs/2608.04735v1 (Duzan & Cooper Stickland; 2026-08-05)

AI researchers may eventually help solve the alignment problem itself.

**Inspector update — Promising experiments still need to transfer.**

Anthropic reports agents recovering 97% of a weak-to-strong supervision gap in a research setup, compared with roughly 23% for two humans. The result did not transfer cleanly to production-scale models. A successful experiment can advance alignment research without solving deployment safety.

[anthropic-rd] When AI builds itself — https://www.anthropic.com/institute/recursive-self-improvement (Anthropic Institute; 2026-09-18)

Reliable containment and defense are needed alongside alignment.

**Inspector context — Evaluate the whole system.**

Astra’s September safety report describes classifiers over reasoning and actions that can stop unauthorized activity. Those controls complement behavioral training. A favorable result for a model alone should not be read as a guarantee for every tool, permission or deployment environment.

[critical] Path to Astra: critical capabilities and frontier safeguards — https://openai.com/index/path-to-astra/ (OpenAI; 2026-09-01)

## IIId. The free world

Chinese labs could remain competitive despite US advantages in compute.

**Inspector context — A smaller budget can still produce a strong model.**

DeepSeek-R1’s published reasoning results made that possibility concrete. They do not establish equality across research autonomy, compute supply or deployment scale. A national lead is a collection of advantages, not one leaderboard position.

[r1] DeepSeek-R1 technical report — https://arxiv.org/abs/2501.12948 (DeepSeek; 2025-01-22)

A lead in superintelligence might translate into decisive military power.

**Inspector context — This remains a separate forecast.**

Stronger software and cyber capabilities matter. They do not by themselves establish the much larger claim about defeating a nuclear deterrent. That step still depends on physical deployment, intelligence, countermeasures and an adversary’s response; a benchmark cannot adjudicate it.

[critical] Path to Astra: critical capabilities and frontier safeguards — https://openai.com/index/path-to-astra/ (OpenAI; 2026-09-01)

## IV. The Project

A government-led AGI effort could emerge around 2027–28.

**Inspector context — Track institutions as carefully as chips.**

Stargate is evidence of coordinated infrastructure investment. Its existence alone does not establish the government chain of command envisioned in the essay. The 2027–28 prediction remains prospective; public-private projects and state control should be recorded separately.

[stargate] Building the compute infrastructure for the Intelligence Age — https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/ (OpenAI; 2026-04-29)

National laboratories and government resources could become central to frontier AI.

**Inspector update — A federal research coalition has taken shape.**

DOE launched the Genesis Mission Consortium in February 2026, bringing national laboratories, companies and universities into an AI-for-science effort. It is a concrete institutional development toward state involvement, with a narrower remit than the unified AGI project envisioned here.

[genesis] Genesis Mission Consortium launch — https://www.energy.gov/articles/energy-department-launches-genesis-mission-consortium-accelerate-ai-driven-scientific (US Department of Energy; 2026-02-09)

## V. Parting thoughts

The series presents a concrete scenario for the decade, while acknowledging large uncertainty.

**Inspector context — Keep the forecast disaggregated.**

Compute growth, research automation, security, political control and military dominance are separate propositions. Evidence can strengthen one while leaving another unresolved. The useful update is a dated ledger of what has changed, with the original deadlines still visible.

## Glossary

- **AGI:** Artificial general intelligence. Here, the economically relevant threshold is a system that can do the full work of an AI researcher—not simply pass an exam.
- **OOM:** Order of magnitude: a factor of ten. Two OOMs is 100×; half an OOM is about 3.16×.
- **compute:** Computational work, often counted in floating-point operations (FLOP). A chip’s FLOP/s is a rate; a training run’s FLOP is a total.
- **inference:** Running a trained model to produce an answer or take an action. More reasoning steps can improve results while increasing cost and latency.
- **reinforcement learning:** Training through feedback on actions or answers. In verifiable domains, rewards can come from tests or correct solutions rather than human ratings.
- **GPQA:** A graduate-level science question benchmark. Results depend on the subset, prompting, tools, and inference budget.
- **time horizon:** In METR’s evaluation, the human-expert duration of a task at which an agent reaches a specified success probability. It is not the length of an unattended AI run.
- **model weights:** The learned numerical parameters of a model. Access to them permits running the model outside the developer’s hosted safeguards.
- **distillation:** Training one model on outputs from another. This transfers some capabilities without copying the original model’s weights.
- **chain of thought:** Intermediate text a model generates while solving a problem. It can help oversight, but may omit factors that influence the answer.
- **capex:** Capital expenditure: investment in durable assets. A company’s capex can include much more than AI, and a planned budget is not money already spent.
- **GW:** Gigawatt: one billion watts of power. Running at 1 GW continuously for a non-leap year uses 8.76 TWh of energy.
- **HBM:** High-bandwidth memory located close to a processor. Capacity and bandwidth can constrain model size, throughput, and serving cost.
- **H100-equivalent:** A normalization to the performance of NVIDIA’s H100. The conversion depends on numerical precision, sparsity, workload, and utilization; it is not a physical chip count.
- **reward hacking:** Improving a measured score by exploiting the test or reward rather than accomplishing the intended task.

## Source registry

- **original-introduction:** Introduction · original essay — https://situational-awareness.ai/ (Leopold Aschenbrenner; 2024-06)
- **original-counting:** I. Counting the OOMs · original essay — https://situational-awareness.ai/from-gpt-4-to-agi/ (Leopold Aschenbrenner; 2024-06)
- **original-explosion:** II. The intelligence explosion · original essay — https://situational-awareness.ai/from-agi-to-superintelligence/ (Leopold Aschenbrenner; 2024-06)
- **original-infrastructure:** IIIa. The trillion-dollar cluster · original essay — https://situational-awareness.ai/racing-to-the-trillion-dollar-cluster/ (Leopold Aschenbrenner; 2024-06)
- **original-security:** IIIb. Security for AGI · original essay — https://situational-awareness.ai/lock-down-the-labs/ (Leopold Aschenbrenner; 2024-06)
- **original-alignment:** IIIc. Superalignment · original essay — https://situational-awareness.ai/superalignment/ (Leopold Aschenbrenner; 2024-06)
- **original-competition:** IIId. The free world · original essay — https://situational-awareness.ai/the-free-world-must-prevail/ (Leopold Aschenbrenner; 2024-06)
- **original-project:** IV. The Project · original essay — https://situational-awareness.ai/the-project/ (Leopold Aschenbrenner; 2024-06)
- **original-parting:** V. Parting thoughts · original essay — https://situational-awareness.ai/parting-thoughts/ (Leopold Aschenbrenner; 2024-06)
- **epoch-trends:** Trends in Artificial Intelligence — https://epoch.ai/trends (Epoch AI; 2026-02-05)
- **metr-horizons:** Task-completion time horizons — https://metr.org/time-horizons/ (METR; 2026-05-08)
- **astra:** GPT-6 Astra: A new generation of intelligence — https://openai.com/index/gpt-6-astra/ (OpenAI; 2026-09-03)
- **r1:** DeepSeek-R1 technical report — https://arxiv.org/abs/2501.12948 (DeepSeek; 2025-01-22)
- **imo:** Gemini Deep Think at IMO 2025 — https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/ (Google DeepMind; 2025-07-21)
- **anthropic-rd:** When AI builds itself — https://www.anthropic.com/institute/recursive-self-improvement (Anthropic Institute; 2026-09-18)
- **aide2:** Recursive self-improvement of AI research agents — https://arxiv.org/abs/2609.26457 (Srikanth et al.; 2026-09-22)
- **latent:** Scaling up test-time compute with latent reasoning — https://arxiv.org/abs/2502.05171v2 (Geiping et al.; 2025-02-17)
- **monitor:** Chain-of-thought monitoring in implicit-influence settings — https://arxiv.org/abs/2608.04735v1 (Duzan & Cooper Stickland; 2026-08-05)
- **critical:** Path to Astra: critical capabilities and frontier safeguards — https://openai.com/index/path-to-astra/ (OpenAI; 2026-09-01)
- **stargate:** Building the compute infrastructure for the Intelligence Age — https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/ (OpenAI; 2026-04-29)
- **roadmap:** Frontier Safety Roadmap — https://www.anthropic.com/responsible-scaling-policy/roadmap (Anthropic; 2026-07-29)
- **rd-compute:** Final training runs account for a minority of R&D compute spending — https://epoch.ai/gradient-updates/r-and-d-vs-training-compute (Epoch AI; 2026-03-23)
- **iea26:** Data-centre electricity use in 2025 — https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions (IEA; 2026-04-16)
- **nvidia26:** NVIDIA Q2 FY2027 financial results — https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Second-Quarter-Fiscal-2027/ (NVIDIA; 2026-08-26)
- **hgxs:** HGX GPU specifications — https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html (NVIDIA; 2026-05-18)
- **h100:** H100 product specifications — https://www.nvidia.com/en-us/data-center/h100/ (NVIDIA; )
- **a100:** A100 80 GB datasheet — https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/a100-80gb-datasheet-update-nvidia-us-1521051-r2-web.pdf (NVIDIA; )
- **rubin:** Inside NVIDIA Rubin GPU architecture — https://developer.nvidia.com/blog/inside-nvidia-rubin-gpu-architecture-powering-the-era-of-agentic-ai/ (NVIDIA; 2026-07-21)
- **fleet:** OpenAI House Select Committee update — https://cdn.openai.com/pdf/045aa967-ee96-4a09-94ee-3098ddf6db2c/OpenAI-US-House-Select-Cmte-Update-%5B021226%5D.pdf (OpenAI; 2026-02-12)
- **genesis:** Genesis Mission Consortium launch — https://www.energy.gov/articles/energy-department-launches-genesis-mission-consortium-accelerate-ai-driven-scientific (US Department of Energy; 2026-02-09)

## Shared evidence records

The following dated records are reusable across articles; their status and caveats matter.

- **CMP-01** (2026-02-05; estimate): Epoch AI estimates frontier AI training compute has grown about 5x/year since 2020. Source: https://epoch.ai/trends. Caveat: Trend estimate; not a promise of future training runs or a direct capability scale.
- **CMP-02** (2026-02-05; methodology): Epochâ€™s public trend page distinguishes estimated frontier training runs from all AI compute and reports methodological uncertainty. Source: https://epoch.ai/trends. Caveat: Use a sourceâ€™s model definition and confidence bounds before comparing to an inferred private run.
- **CMP-03** (2025-08-07; company-reported): GPT-5 with thinking used 50â€“80% fewer output tokens than o3 in OpenAIâ€™s stated evaluations across several capability categories. Source: https://openai.com/index/introducing-gpt-5/. Caveat: Output-token efficiency is not training-compute efficiency and comes from the model developer.
- **CMP-04** (2025-08-07; company-reported): OpenAI reports GPT-5 was trained on Microsoft Azure AI supercomputers. Source: https://openai.com/index/introducing-gpt-5/. Caveat: The release does not disclose training FLOPs, data mixture, or a general solution to data constraints.
- **CAP-01** (2025-08-07; company-reported): OpenAI reported GPT-5 scored 74.9% on SWE-bench Verified and 88.0% on Aider Polyglot. Source: https://openai.com/index/introducing-gpt-5-for-developers/. Caveat: SWE-bench Verified uses a fixed 477-task subset; benchmark performance is not an employment-capability measure.
- **CAP-02** (2025-08-07; company-reported): OpenAI reported GPT-5 pro scored 88.4% on GPQA without tools and GPT-5 scored 94.6% on AIME 2025 without tools. Source: https://openai.com/index/introducing-gpt-5/. Caveat: Narrow evaluations; GPQA/AIME do not measure sustained research autonomy.
- **CAP-03** (2026-03-05; company-reported): OpenAI reported GPT-5.4 achieved 75.0% on OSWorld-Verified versus a cited human 72.4% under that benchmarkâ€™s conditions. Source: https://openai.com/index/introducing-gpt-5-4/. Caveat: The comparison is benchmark-specific, screenshot-based computer use; it is not general human equivalence.
- **CAP-04** (2026-05-08; measurement): METR warns that measurements above 16 human-expert hours are unreliable with its current task suite. Source: https://metr.org/time-horizons/. Caveat: Time horizons depend on task distribution, elicitation, and a 50%-success definition; do not extrapolate beyond displayed reliability.
- **CAP-05** (2025-07-17; observed): OpenAI introduced Operator in January 2025 and integrated it into ChatGPT agent in July 2025. Source: https://openai.com/index/introducing-operator/. Caveat: Product availability demonstrates an interface, not reliable autonomous completion of arbitrary work.
- **CAP-06** (2025-08-07; company-reported): OpenAI classified GPT-5-thinking as High capability in biological and chemical domains under its Preparedness Framework. Source: https://openai.com/index/gpt-5-system-card/. Caveat: A developerâ€™s safety classification is not a public demonstration of end-to-end harmful capability.
- **CAP-07** (2026-05; company-reported): Anthropic reported more than 80% of merged code was written by Claude in May 2026, within its own development context. Source: https://www.anthropic.com/institute/recursive-self-improvement. Caveat: Internal metric; it does not establish causality, quality without review, or general R&D automation.
- **CAP-08** (2026-Q2; company-reported): Anthropic reports the typical engineer merged 8x as much code per day in Q2 2026 as in 2024. Source: https://www.anthropic.com/institute/recursive-self-improvement. Caveat: LOC is an incomplete productivity metric; organization, tools, and task mix changed.
- **INF-01** (2026-04-29; announced): OpenAI said it had secured more than 10 GW of compute capacity for the intelligence age. Source: https://openai.com/index/building-the-compute-infrastructure-for-the-intelligence-age/. Caveat: Secured is not necessarily built, energized, operational, or dedicated to training.
- **INF-02** (2025; company-reported): OpenAIâ€™s House Select Committee update reports available compute of 0.2 GW in 2023, 0.6 GW in 2024, and about 1.9 GW in 2025. Source: https://cdn.openai.com/pdf/045aa967-ee96-4a09-94ee-3098ddf6db2c/OpenAI-US-House-Select-Cmte-Update-%5B021226%5D.pdf. Caveat: Company-provided series; definition and utilization are not independently audited in the document.
- **INF-03** (2025-04-10; observed-and-forecast): IEA estimated global data centres consumed 415 TWh in 2024, about 1.5% of global electricity, and projects about 945 TWh in 2030 in its Base Case. Source: https://www.iea.org/reports/energy-and-ai/executive-summary. Caveat: All data-centre workloads, not only AI; 2030 is a scenario forecast.
- **INF-04** (2025-04-10; forecast): The IEA 2025 Base Case endpoints imply approximately 14.7% annual compound growth in data-centre electricity from 2024 to 2030. Source: https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai. Caveat: Scenario estimate sensitive to AI uptake, efficiency, infrastructure, and local bottlenecks.
- **INF-05** (2026-04-16; observed-and-forecast): IEA reported capital expenditure by five large technology companies exceeded $400bn in 2025 and was set to rise another 75% in 2026. Source: https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions. Caveat: Company capex includes more than AI/data centres; 2026 is a forecast at publication.
- **INF-06** (2026-04-16; observed): IEA reported data-centre electricity use grew 17% in 2025 while global electricity demand grew 3%. Source: https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions. Caveat: Data-centre total, not a direct count of AI training energy.
- **INF-07** (2025-04-10; estimate): IEA characterizes a conventional data centre as about 10â€“25 MW, an AI-focused hyperscale facility as 100 MW or more, and its largest-planned example as 5,000 MW. Source: https://www.iea.org/reports/energy-and-ai/understanding-the-energy-ai-nexus. Caveat: Illustrative facility classes/plans, not a count of operational facilities.
- **INF-08** (2026-06-30; company-reported): Microsoft reported $41bn capital expenditures in FY2026 Q4; roughly two-thirds were short-lived assets, primarily CPUs and GPUs. Source: https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q4. Caveat: Company-wide capex includes AI and non-AI infrastructure; short-lived asset accounting is not a GPU count.
- **INF-09** (2026-07-29; company-reported): Microsoft reported adding 31 data centers across five continents in FY2026 Q4, 88 during the fiscal year, and another GW of capacity in the quarter. Source: https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q4. Caveat: Company statement without a disclosed capacity-definition or AI-only breakdown.
- **INF-10** (2026-06-30; observed): Alphabetâ€™s Q2 2026 SEC exhibit reports $44.924bn in purchases of property and equipment, versus $22.446bn in Q2 2025. Source: https://www.sec.gov/Archives/edgar/data/1652044/000165204426000066/googexhibit991q22026.htm. Caveat: Company-wide property/equipment spending; does not isolate AI infrastructure.
- **INF-11** (2026-07-26; company-reported): NVIDIA reported Q2 FY2027 total revenue of $96.221bn and Data Center revenue of $89.0bn, up 106% and 117% year over year respectively. Source: https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Second-Quarter-Fiscal-2027/. Caveat: Vendor revenue is demand-side evidence, not an installed-GPU count or a measure of model capability.
- **GPU-01** (2021-01; vendor-specification): NVIDIAâ€™s A100 80GB datasheet lists 80 GB HBM2e, 2,039 GB/s memory bandwidth, and 400 W maximum TDP for the NVLink model. Source: https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/a100-80gb-datasheet-update-nvidia-us-1521051-r2-web.pdf. Caveat: SKU/precision dependent peak specifications; not delivered training throughput.
- **GPU-02** (2026-05-18; vendor-specification): NVIDIA documentation lists H100 SXM at 80 GB HBM3 and H200 SXM at 141 GB HBM3e. Source: https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory-h100-h200-b200/latest/components.html. Caveat: SXM values; other form factors and product revisions differ.
- **GPU-03** (2026-05-18; vendor-specification): NVIDIA documentation lists B200 SXM at 180 GB HBM3e and B300 SXM at 288 GB HBM3e. Source: https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html. Caveat: Memory capacity alone does not determine cluster throughput or available supply.
- **GPU-04** (2026-05-18; vendor-specification): NVIDIA lists H200, B200, and B300 memory bandwidth at 4.80, up to 8, and up to 8 TB/s respectively. Source: https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html. Caveat: Vendor peak bandwidth, with workload-dependent utilization.
- **GPU-05** (2026-09; vendor-specification): NVIDIAâ€™s GB200 NVL72 contains 72 Blackwell GPUs and 36 Grace CPUs in one liquid-cooled rack-scale system. Source: https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/. Caveat: Product architecture, not an assertion of installed fleet count or delivered utilization.
- **SEC-01** (2026-07-23; company-reported): Anthropicâ€™s July 2026 transparency update says its Responsible Scaling Policy was updated in February 2026 and its Frontier Compliance Framework was published in December 2025. Source: https://www.anthropic.com/transparency/voluntary-commitments. Caveat: Published frameworks describe intent/process; they are not independent verification of implementation.
- **SEC-02** (2026-07-10; announced): Anthropicâ€™s roadmap lists a September 30, 2026 target for security work and says an isolated-network prototype is being explored at small scale. Source: https://www.anthropic.com/responsible-scaling-policy/roadmap. Caveat: Target/prototype, not completed security assurance; the date is after this corpus cutoff by five days.
- **SEC-03** (2026-02-22; company-reported): Anthropic says its strongest models as of February 22, 2026 were protected with ASL-3 safeguards for specified high-consequence capability risks. Source: https://www.anthropic.com/responsible-scaling-policy/roadmap. Caveat: Company-defined safeguards for scoped risks; it does not resolve broader alignment or theft risk.
- **SEC-04** (2026-09-10; company-reported): Anthropic reported September 2026 evaluations found its models useful for some tactical intelligence-targeting and conventional-weapons tasks, and added on-platform classifiers. Source: https://www.anthropic.com/research/intelligence-targeting-conventional-weapons-capabilities. Caveat: Evaluation summary does not quantify operational effectiveness or show deployment outside safeguards.
- **GEO-01** (2025-01-13; policy): BIS announced the AI Diffusion Rule on January 13, 2025, covering advanced chips, certain closed model weights, and large advanced-compute clusters. Source: https://www.bis.gov/press-release/biden-harris-administration-announces-regulatory-framework-responsible-diffusion-advanced-artificial. Caveat: Announcement text; later policy changes matter.
- **GEO-02** (2025-05-12; policy): BIS rescinded the Biden-era AI Diffusion Rule in May 2025 before its planned May 15 compliance date and announced additional semiconductor-control actions. Source: https://www.bis.gov/sites/default/files/documents/05.07%20Recission%20of%20AI%20Diffusion%20Press%20Release.pdf. Caveat: Rescission of that rule does not eliminate all pre-existing or subsequent controls.
- **GEO-03** (2024-12-02; policy): BISâ€™s December 2024 action added controls on high-bandwidth memory and listed 140 entities in connection with advanced semiconductor concerns. Source: https://www.bis.gov/press-release/commerce-strengthens-export-controls-restrict-chinas-capability-produce-advanced-semiconductors-military. Caveat: A legal/policy action; it neither measures compliance nor establishes strategic effects.
- **GEO-04** (2025-05-13; policy-guidance): BISâ€™s May 2025 counter-diversion guidance identifies 10 MW-or-larger data centers as meriting additional scrutiny in specified advanced-computing transactions. Source: https://www.bis.gov/media/documents/ai-counter-diversion-industry-guidance-may-13-2025.pdf. Caveat: Guidance for transaction scrutiny; it is not a blanket capacity prohibition or a measured strategic outcome.
- **GOV-02** (2026-06; policy-proposal): Anthropicâ€™s June 2026 Advanced AI Framework advocates rules for models trained with more than 10^25 FLOPs at companies above $500m AI revenue or $1bn AI R&D spend. Source: https://www.anthropic.com/policy-on-the-ai-exponential/aaif. Caveat: Company policy proposal, not enacted law.
- **GOV-03** (2026-03; estimate): The IEA says data centres accounted for around half of US electricity-demand growth in 2025. Source: https://www.iea.org/reports/global-energy-review-2026/global-trends. Caveat: Energy-sector aggregate, not evidence of any particular procurement programme.

## Auxiliary research: research/claim-audit.md

# Situational Awareness claim ledger

This is a concise ledger of the central forecast and assumption clusters across every chapter, not an exhaustive line-by-line or numeric audit. Compact independent descriptions only: `SA-*` IDs identify a location/topic in the June 2024 series and do not reproduce it. The source URLs are canonical; “Update” points to records in `evidence.json`.

| ID | Chapter / compact claim | Type | 2026 audit direction | Update records |
| --- | --- | --- | --- | --- |
| SA-INTRO-01 | Introduction: rapid cluster plans, power competition, and near-term broad capability forecast. | projection | Buildout is observable, but 2026 product capability is not a settled general-human-comparison measure. | INF-01, INF-05, CAP-01, CAP-05 |
| SA-I-01 | I: frontier training compute had risen roughly half an order/year; another large scaleup was expected by 2027. | projection | Use the refreshed 5x/year estimate and distinguish trend fit from a guaranteed continuation. | CMP-01, CMP-02 |
| SA-I-02 | I: algorithmic efficiency was treated as a second roughly half-order/year driver. | projection | Training-efficiency estimates remain uncertain; test-time compute and agent scaffolds are now material separate levers. | CMP-03, CAP-03, CAP-04 |
| SA-I-03 | I: internet-data limits could be bypassed with synthetic data, RL, and self-play. | assumption | Data quality and interaction remain live constraints; public results show stronger reasoning/agent systems, not a proof that a general data wall vanished. | CMP-04, CAP-02, CAP-05 |
| SA-I-04 | I: models could become useful AI R&D coworkers around 2027. | projection | Current tools complete meaningful coding/computer tasks under evaluated settings; reliability and task duration remain boundary conditions. | CAP-01, CAP-02, CAP-03, CAP-04 |
| SA-II-01 | II: automating AI research could compress years of progress into a very short period. | assumption | Bounded agent self-improvement and disclosed internal use now provide evidence of parts of the loop; full frontier-model self-improvement remains unestablished. | CAP-03, CAP-04, CAP-07, CAP-08 |
| SA-II-02 | II: large populations of AGIs could create an intelligence explosion. | projection | This remains conditional on automation, cost, coordination, and hardware; no public count of AGIs exists. | CAP-03, INF-01, INF-03 |
| SA-IIIa-01 | IIIa: tens/hundreds of billions of dollars and very large clusters would arrive this decade. | projection | Report capex and secured capacity as announced/committed; do not call either an operational cluster. | INF-01, INF-02, INF-05, INF-08, INF-10, INF-11 |
| SA-IIIa-02 | IIIa: US electricity output would rise by tens of percent, driven partly by AI infrastructure. | projection | Data-centre demand is rising fast and locally binding; global and US forecasts remain scenario-dependent. | INF-03, INF-04, INF-07 |
| SA-IIIb-01 | IIIb: frontier labs were far below state-actor-resistant security. | assumption | Labs now publish framework/roadmap material, but public declarations are not independent assurance of weight security. | SEC-01, SEC-02, SEC-03 |
| SA-IIIb-02 | IIIb: model weights and research secrets would become central targets. | projection | Security controls are now explicitly linked to frontier frameworks; their effectiveness is not publicly measurable. | SEC-01, SEC-02 |
| SA-IIIc-01 | IIIc: controlling substantially smarter systems was an unsolved technical problem. | assumption | Current frameworks publish evaluations and mitigations, not a demonstrated solution to superhuman alignment. | SEC-02, SEC-04, CAP-06 |
| SA-IIIc-02 | IIIc: deceptive behavior/situational awareness could defeat naive evaluations. | assumption | Keep capability and behavior evaluation claims bounded to the task and access conditions. | CAP-04, SEC-04 |
| SA-IIId-01 | IIId: US–China access to advanced compute would shape strategic competition. | projection | Controls expanded and then the 2025 diffusion rule was rescinded; policy status must be dated, not treated as a single monotonic regime. | GEO-01, GEO-02, GEO-03 |
| SA-IIId-02 | IIId: export controls could preserve a decisive compute lead. | assumption | HBM, manufacturing, and end-use controls exist, but effectiveness, circumvention, and non-US supply remain empirical questions. | GEO-02, GEO-03, GEO-04 |
| SA-IV-01 | IV: a US government AGI project might arrive in 2027/28. | projection | Government collaboration and policy activity are observable; no public programme verifies the predicted project form or date. | INF-02, GOV-02, GOV-03 |
| SA-IV-02 | IV: superintelligence would exceed a startup’s governance capacity. | assumption | Public safety frameworks and state policy are developing, but governance adequacy is not established by their existence. | GOV-02, SEC-01, SEC-02 |
| SA-V-01 | V: the series asks readers to prepare for a highly discontinuous decade. | synthesis | Preserve uncertainty: evidence documents fast progress and buildout alongside forecasting ranges and unverified causal links. | CMP-01, INF-03, CAP-03 |

Canonical pages: [Introduction](https://situational-awareness.ai/), [I](https://situational-awareness.ai/from-gpt-4-to-agi/), [II](https://situational-awareness.ai/from-agi-to-superintelligence/), [IIIa](https://situational-awareness.ai/racing-to-the-trillion-dollar-cluster/), [IIIb](https://situational-awareness.ai/lock-down-the-labs/), [IIIc](https://situational-awareness.ai/superalignment/), [IIId](https://situational-awareness.ai/the-free-world-must-prevail/), [IV](https://situational-awareness.ai/the-project/), [V](https://situational-awareness.ai/parting-thoughts/).



## Auxiliary research: research/research-notes.md

# Research notes — current context

## Editorial findings

The strongest present-tense update is structural: public evidence now separates four things the 2024 narrative sometimes grouped together—base-model capability, agent scaffolding/test-time compute, deployed capacity, and future commitments. They can reinforce each other but have different measurements and failure modes.

Useful annotation posture:

1. State the original topic in a compact paraphrase and attach a current fact with status and date.
2. Preserve uncertainty on the adjacent line: a vendor benchmark, secured power, or policy announcement is not its most expansive interpretation.
3. Use one chart only when a source reports a coherent series. Do not fabricate a unified “AI progress” index from incomparable benchmarks, GPU specifications, or capex announcements.

## Reusable chart candidates

- `INF-02`: OpenAI’s disclosed available-compute series (2023–25). Label as company-reported GW, not a general industry series.
- `INF-03` and `INF-04`: IEA observed 2024 data-centre electricity and 2030 Base Case forecast. Render observed/forecast with visibly different stroke styles.
- `GPU-01`–`GPU-04`: GPU memory and memory-bandwidth comparison by SKU; avoid a single “performance” bar because numeric precision and workload differ.

## Source selection notes

IEA is the strongest common source for power context because it publishes scope and scenarios. NVIDIA values are product specifications, useful for a factual component/table but insufficient evidence of training progress. US BIS releases are dated policy snapshots: the January 2025 diffusion announcement and May rescission demonstrate why an annotation must name the date and current legal status.

The commentary should avoid a scorecard declaring the essays “right” or “wrong.” Several central predictions are still future-dated. The appropriate update is a concise full-series claim ledger of what has occurred, what has been announced, and which causal links are still unobserved; it should not imply exhaustive numerical coverage.



## Reproducibility

Figure values and series are embedded above. The standard chart renderer is `charts.js`; edit the figure data in the article JSON and rebuild this context after changes.


## Discussion context

This file contains the normalized page content and its cited evidence. Consult the linked research assets and source records before answering detail questions. Distinguish article claims, measured evidence, and interpretation. State dates and uncertainty. Do not invent missing information.
