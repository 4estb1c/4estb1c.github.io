# Reasoning and Tools for Human-Level Forecasting (RTF)

*Elvis Hsieh, Preston Fu, Jonathan Chen. [2408.12036](https://arxiv.org/abs/2408.12036). Submitted August 2024, revised October 2024.*

The tool-augmented counterpart to [[Halawi 2024 - Approaching Human-Level Forecasting|Halawi 2024]], built around **ReAct** (reasoning-and-acting) rather than a fixed five-stage pipeline.

**Method.** RTF gives the model dynamic tool access inside the reasoning loop itself, rather than running retrieval as a separate upstream stage. The agent interleaves reasoning steps with tool calls, retrieving updated information and running numerical simulations as needed mid-trajectory, deciding what to look up next based on what it's already found rather than committing to a fixed retrieval plan up front.

**Why this matters relative to the fixed-pipeline approach.** Halawi's harness decomposes the question into sub-questions and retrieves for all of them before reasoning begins. RTF's ReAct loop lets the model discover what it needs to know *while* reasoning, and go fetch it then, which is a more natural fit for questions where the right sub-question only becomes obvious partway through the reasoning chain.

**Results.** Evaluated on questions from competitive forecasting platforms, chosen so the answers don't exist in training data, isolating genuine reasoning from memorization. RTF is competitive with, and in some cases outperforms, human predictions.

This is the ReAct-style alternative to the fixed-stage harness, worth reading alongside [[Halawi 2024 - Approaching Human-Level Forecasting|Halawi 2024]] as the two founding approaches to how a forecasting agent should be structured, one a fixed pipeline, the other a dynamic tool-use loop.
