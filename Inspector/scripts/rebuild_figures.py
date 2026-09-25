#!/usr/bin/env python3
"""Recalculate the illustrative workflow speedup figure from its stated assumptions."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ARTICLE = Path(__file__).resolve().parents[1] / "data" / "situational-awareness.json"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--automated-share", type=float, default=0.9)
    parser.add_argument("--speedups", type=float, nargs="+", default=[1, 2, 5, 10, 20, 50, 100])
    args = parser.parse_args()
    if not 0 <= args.automated_share < 1 or any(x < 1 for x in args.speedups):
        parser.error("automated share must be in [0, 1); each speedup must be at least 1")

    article = json.loads(ARTICLE.read_text(encoding="utf-8"))
    block = next(block for block in article["blocks"] if block["id"] == "bottlenecks")
    figure = block["notes"][0]["figure"]
    share = args.automated_share
    at_ten = 1 / ((1 - share) + share / 10)
    limit = 1 / (1 - share)
    block["notes"][0]["body"] = (
        f"Illustration: if {share:.0%} of a workflow becomes 10× faster and the rest is unchanged, "
        f"total speed rises only {at_ten:.2f}×. Even infinite speed on that fraction caps the gain "
        f"at {limit:.2f}×. This is arithmetic, not an estimate of how much research is currently automated."
    )
    figure["description"] = (
        f"Illustrative Amdahl calculation: S = 1 / ((1 − f) + f / s). "
        f"Assumed accelerated fraction f = {share:g}; not empirical data."
    )
    figure["series"][0]["label"] = f"{share:.0%} of work accelerated"
    figure["series"][0]["data"] = [
        {"x": speed, "y": round(1 / ((1 - share) + share / speed), 3)}
        for speed in args.speedups
    ]
    ARTICLE.write_text(json.dumps(article, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {ARTICLE} from f={share:g} and {len(args.speedups)} speedup values")


if __name__ == "__main__":
    main()
