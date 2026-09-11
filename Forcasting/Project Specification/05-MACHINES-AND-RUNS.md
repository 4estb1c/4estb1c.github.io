# Machines and proposed run configurations

The implementation agent writes code and setup instructions only. It must not install dependencies, download weights/data, start a training job, rent hardware, or call a paid API. These profiles tell a later operator how to execute the experiments after review.

## Verified local machine

- GPU: NVIDIA RTX 5080, approximately 16 GB VRAM, compute capability 12.0.
- Host: Windows, NVIDIA driver 591.86 at the smoke test; Ubuntu 24.04 WSL2 with GPU access.
- WSL allocation observed: approximately 15 GiB RAM, 4 GiB swap, and over 900 GB free disk. This is the WSL allocation, not a claim about total installed host RAM.
- Python: 3.12; isolated environment `/home/fbicker/.venvs/blf-qlora`.
- Verified stack: torch 2.8.0+cu128, transformers 4.56.2, peft 0.17.1, trl 0.22.2, bitsandbytes 0.48.1, accelerate 1.10.1, datasets 4.1.1.
- Model: `Qwen/Qwen2.5-3B-Instruct`, NF4 double quantization, BF16 compute, rank-16 LoRA, alpha 32, zero adapter dropout, attention and MLP projection targets.

The verified 20-step short synthetic run took 61.7 seconds of training and peaked at 3.62 GiB of PyTorch-allocated VRAM. Adapter reload reproduced the saved predictions. An eight-rollout smoke also passed. These measurements exclude some driver/desktop memory and do not establish capacity for long research traces, two resident networks, or large logits tensors.

Use WSL for the CUDA path; preserve the Windows environment. Keep model caches on the Linux filesystem. The current single-process Transformers generator avoids a separate vLLM memory reservation. Preserve the narrow TRL/QLoRA compatibility fixes until tested replacements exist.

## Operator profiles to implement

| Profile | Hardware | Model / role | Context and group | Initial purpose |
|---|---|---|---|---|
| cpu_fixture | CPU; no model download | Fake policy; optional tiny initialized network | Four dates, G=8 | E0 mathematical and clock tests |
| local_smoke | RTX 5080 16 GB | Qwen2.5-3B QLoRA | Prompt ceiling 512, short output, G=4 then 8 | Two-step token/scalar save/reload |
| local_pilot | Same 5080 | Qwen2.5-3B QLoRA; sequential forecaster phases | Start 1,024 total tokens, then profile 2,048/4,096; G=8 | E1–E3 small event cohorts |
| local_scaling | Same, capacity permitting | Qwen2.5 0.5B/1.5B/3B | Same validated context policy | E5 dense size pilot |
| rented_memory | One A100 80 GB; suggested 16+ vCPU, 64–128 GB RAM, 200+ GB scratch | 3B or larger validated model | Profile actual transcripts; microbatch rollouts | Long-context or scalar-network expansion |
| rented_speed | One H100 80 GB; similar host resources | Same checkpoint/recipe as A100 comparison | Same workload | Measure faster iteration, not assume it |
| distributed_optional | Multiple GPUs only after profiling | Larger dense/MoE models | Backend-specific | Later E5; not required initial delivery |

Context figures are starting caps, not guaranteed fits. The context budget includes question, evidence, tool observations, research, and answer. Token output may need up to 256–512 generated tokens in a pilot; the scalar recipe needs a comparable research budget even though its scalar head emits no numeric tokens. Do not compare a long thinking model to a head that sees no research.

Profile eight-rollout generation and training separately, including backward activations and optimizer state. On OOM: reduce microbatch, sequence budget with explicit evidence handling, or resident components; do not silently truncate or switch quantization. Longer-context results must record the changed evidence policy. Record runtime, peak allocated/reserved VRAM, process memory if available, generated tokens, gradient tokens, and unique events.

## Initial experiment configurations

All substantive configs record task type, target units, evidence mode, model revisions, output recipe, feedback mode, teacher mode, seed, train/validation/test family manifests, and chronology. Config validation must reject incompatible combinations before loading a model.

| Experiment | Starting setup | Required variants |
|---|---|---|
| E0 | CPU fixtures; operator smoke 2 steps | Token/scalar; MC/adjacent/all-earlier |
| E1 | Frozen 3B; up to 128 eligible train/validation families; G=8 | G subsets 1/4/8/16; teacher aggregation/evidence variants |
| E2 | 3B; 3 pilot seeds; G=8; 8 groups/effective batch | Four output-by-feedback cells; frozen and historical baselines |
| E3 | Selected E2 setup | W_TD 0/0.25/1; replay passes 1/2/4; batch groups 1/4/8; readout/staleness ablations |
| E4 | Same model and event universe | Baseline subtraction control; explicit filtering/weighting; twin contamination |
| E5 | Nested budgets 32/64/128/256 if available | Model size, RL compute, window, later MoE |
| E6 | Selected stable recipe | Separate financial fundamental/binary replication tracks |

Researcher learning-rate candidates: 1e-6,3e-6,1e-5. New scalar-head rate: start 1e-4; forecaster adapter: 3e-6. Initial PPO-style clip: 0.1; gradient norm clip: 1; reference KL coefficient: 0 initially, with 0.01 as a pilot ablation. Snapshot/reference identities must be explicit; rolling behavior policy and fixed KL reference are different objects. Use validation rather than assuming these settings transfer between models.

For real pilots, schedule at most four revisits at 0%,25%,50%,75% of a target's declared forecast window, subject to evidence availability, plus terminal scoring. A known early resolution stops forecasts; it must not be used retrospectively to alter earlier schedules. Begin with capped optimizer budgets (for example 20 steps for integration, 100–300 for a pilot), but log actual event exposure and do not interpret a common step count as equal data usage. Full experiments choose replay/update budgets on validation.

## Tinker and distributed alternatives

Stay local for the first experiment. Tinker can accept externally computed token advantages and saved behavior log-probabilities, but current support must be checked before execution. Its catalog does not establish support for Qwen2.5-3B; changing to a supported model is a separate experimental change. Its custom loss interface is based on token log-probabilities, not arbitrary hidden-state access for a new continuous MLP head.[^1]

A token-output recipe may fit Tinker well; a genuinely separate scalar architecture is more naturally self-hosted. Do not claim that a Yes/No token readout implements continuous regression. Add an optional backend only after a shared loss fixture and checkpoint/resume test pass. Prices, availability, export rights, and model retirement must be rechecked at execution; no cloud reservation is authorized by this document.

Consider verl with vLLM/SGLang only when distributed rollout scheduling is actually needed.[^2] Asynchronous rollout support does not by itself solve long-delayed causal replay. Preserve the same ledger and loss contracts across backends.

## Setup and execution instructions the agent must deliver

Provide a no-network dry-run command, CPU test command, environment validation command, operator-only dependency setup script, operator-only explicit model preparation command, and separate train/evaluate/resume commands. Names below are proposed contracts, not commands that exist today:

```text
validate-config CONFIG --offline
run-experiment CONFIG --dry-run --offline
run-experiment CONFIG --execute
resume-experiment RUN_DIRECTORY --execute
evaluate-run RUN_DIRECTORY --split test
summarize-study STUDY_MANIFEST
```

Execution must require an explicit flag and local model/data availability. Default to local-files-only model loading; if absent, fail with instructions rather than downloading. Setup should pin dependencies and capture a lock/manifest. Do not change system drivers automatically. Do not hardcode the personal username in core library code.

[^1]: Thinking Machines, [model catalog](https://tinker-docs.thinkingmachines.ai/tinker/models/) and [custom losses](https://tinker-docs.thinkingmachines.ai/tinker/losses/custom/), reviewed September 2026.
[^2]: verl, [LoRA training](https://verl.readthedocs.io/en/latest/advance/ppo_lora.html) and [asynchronous training](https://verl.readthedocs.io/en/latest/advance/fully_async.html).
