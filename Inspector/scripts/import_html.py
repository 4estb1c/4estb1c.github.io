#!/usr/bin/env python3
"""Turn a locally saved article HTML page into a reviewable Inspector block draft.

This is a text/structure aid, not a web scraper or a republication license. Check
the source's terms and rights, remove site chrome, verify equations and images,
and add citations and annotations by hand before using the draft.
"""

from __future__ import annotations

import argparse
import json
import re
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


SKIP = {"script", "style", "noscript", "nav", "header", "footer", "aside", "svg", "canvas"}
TEXT_BLOCKS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "figcaption", "li"}
INLINE = {"em", "strong", "b", "i", "code", "sub", "sup", "span", "a", "br"}
MATH = {"math", "mrow", "mi", "mn", "mo", "msup", "msub", "mfrac", "msqrt", "mroot", "mtext", "mstyle", "mover", "munder", "munderover", "mtable", "mtr", "mtd", "semantics", "annotation"}


class ArticleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[dict[str, Any]] = []
        self.skip_depth = 0
        self.skip_stack: list[str] = []
        self.active: str | None = None
        self.parts: list[str] = []
        self.math_depth = 0
        self.math_parts: list[str] = []

    def flush(self) -> None:
        value = "".join(self.parts).strip()
        self.parts = []
        if value:
            kind = "quote" if self.active == "blockquote" else "heading" if self.active and self.active.startswith("h") else "paragraph"
            text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value)).strip()
            if text:
                self.blocks.append({"type": kind, "text": text, "html": value} if kind != "heading" else {"type": kind, "text": text})
        self.active = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs = attrs or []
        values = dict(attrs)
        if self.skip_depth:
            if tag in SKIP:
                self.skip_depth += 1
                self.skip_stack.append(tag)
            return
        if tag in SKIP:
            self.flush()
            self.skip_depth = 1
            self.skip_stack = [tag]
            return
        if tag == "math":
            self.flush()
            self.math_depth = 1
            self.math_parts = ['<math xmlns="http://www.w3.org/1998/Math/MathML">']
            return
        if self.math_depth:
            if tag in MATH:
                self.math_depth += 1
                attr = ""
                if tag == "mi" and values.get("mathvariant"):
                    attr = f' mathvariant="{values["mathvariant"]}"'
                self.math_parts.append(f"<{tag}{attr}>")
            return
        if tag in TEXT_BLOCKS:
            self.flush()
            self.active = tag
            if tag == "blockquote":
                self.parts.append("<blockquote>")
            return
        if tag == "img":
            self.flush()
            self.blocks.append({"type": "image", "src": values.get("src", ""), "alt": values.get("alt", "")})
            return
        if self.active and tag in INLINE:
            if tag == "a":
                href = values.get("href", "")
                self.parts.append(f'<a href="{escape(href, quote=True)}">')
            elif tag != "br":
                self.parts.append(f"<{tag}>")
            else:
                self.parts.append("<br>")

    def handle_endtag(self, tag: str) -> None:
        if self.skip_depth:
            if self.skip_stack and self.skip_stack[-1] == tag:
                self.skip_stack.pop()
                self.skip_depth -= 1
            return
        if self.math_depth:
            if tag in MATH:
                self.math_parts.append(f"</{tag}>")
                self.math_depth -= 1
                if not self.math_depth:
                    self.blocks.append({"type": "equation", "mathML": "".join(self.math_parts)})
                    self.math_parts = []
            return
        if self.active == tag:
            if tag == "blockquote":
                self.parts.append("</blockquote>")
            self.flush()
            return
        if self.active and tag in INLINE and tag not in {"br"}:
            self.parts.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        if self.skip_depth or not data.strip() and not self.active and not self.math_depth:
            return
        if self.math_depth:
            self.math_parts.append(data.replace("&", "&amp;").replace("<", "&lt;"))
        elif self.active:
            self.parts.append(data.replace("&", "&amp;").replace("<", "&lt;"))

    def handle_entityref(self, name: str) -> None:
        self.handle_data(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.handle_data(f"&#{name};")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html_file", type=Path, help="path to a locally saved HTML article, such as arXiv HTML")
    parser.add_argument("--output", type=Path, required=True, help="output JSON draft path")
    parser.add_argument("--article-id", default="imported-draft")
    parser.add_argument("--title", default="Review imported article")
    parser.add_argument("--author", default="Add author")
    parser.add_argument("--source-url", default="https://example.org/source")
    args = parser.parse_args()
    raw = args.html_file.read_text(encoding="utf-8", errors="replace")
    extractor = ArticleParser()
    extractor.feed(raw)
    extractor.flush()
    blocks = []
    for index, block in enumerate(extractor.blocks, 1):
        blocks.append({"id": f"imported-{index:04d}", "chapter": "article", **block, "notes": []})
    draft = {
        "id": args.article_id,
        "title": args.title,
        "dek": "Imported structure draft. Review extraction and permissions before publication.",
        "author": args.author,
        "published": "YYYY-MM-DD",
        "sourceUrl": args.source_url,
        "editionNote": "Draft generated from a local HTML copy. Check rights, source fidelity, image links, equations, and site chrome before publication.",
        "chapters": [{"id": "article", "title": "Article"}],
        "glossary": {},
        "blocks": blocks,
        "sources": [],
        "context": {"downloadUrl": f"context/{args.article_id}.md", "promptUrl": "prompts/research-and-annotate.md"},
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(draft, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(blocks)} draft blocks to {args.output}")
    print("Review content and rights; then add publication dates, chapters, sources, notes, and figure data.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
