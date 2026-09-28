#!/usr/bin/env python3
"""Extract a locally saved article's main content into private, reviewable blocks.

The extractor never fetches a URL or evaluates document content.  It uses the
standard library's inert HTML parser, selects a site's main article container,
and writes ordered source blocks for editorial review.  Output is deliberately
kept outside ``Margin/data``: it is not reader input or publication-ready copy.
"""

from __future__ import annotations

import argparse
import json
import re
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse


VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
INLINE = {"a", "b", "br", "cite", "code", "del", "em", "i", "mark", "small", "span", "strong", "sub", "sup", "u"}
BLOCK_TAGS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"}
SKIP_TAGS = {"script", "style", "noscript", "svg", "canvas", "iframe", "form", "button", "nav", "header", "footer"}


def classes(attrs: dict[str, str]) -> set[str]:
    return set(attrs.get("class", "").split())


def clean_text(markup: str) -> str:
    """Produce a searchable text rendition while retaining source HTML separately."""
    text = re.sub(r"<br\s*/?>", "\n", markup, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"[ \t\r\f\v]+", " ", unescape(text)).replace("\n ", "\n").strip()


class FullTextExtractor(HTMLParser):
    """Capture semantic blocks inside one named content container."""

    def __init__(self, source_url: str, content_class: str = "entry-content") -> None:
        super().__init__(convert_charrefs=True)
        self.source_url = source_url
        self.content_class = content_class
        self.blocks: list[dict[str, Any]] = []
        self.stack: list[tuple[str, dict[str, str]]] = []
        self.capture_depth: int | None = None
        self.skip_depth = 0
        self.current: dict[str, Any] | None = None
        self.figure: dict[str, Any] | None = None
        self.list_block: dict[str, Any] | None = None
        self.list_stack: list[dict[str, Any]] = []
        self.table_depth = 0
        self.table_parts: list[str] = []
        self.footnotes: list[dict[str, Any]] = []
        self.in_footnotes = 0
        self.footnote_current: dict[str, Any] | None = None
        self.section_fragment = ""
        self.title = ""
        self.title_depth = 0
        self.title_parts: list[str] = []

    def absolute_url(self, value: str) -> str:
        if not value:
            return ""
        result = urljoin(self.source_url, value)
        return result if urlparse(result).scheme in {"http", "https", "mailto"} else ""

    def current_url(self) -> str:
        return f"{self.source_url}#{self.section_fragment}" if self.section_fragment else self.source_url

    def append(self, value: str) -> None:
        if self.footnote_current is not None:
            self.footnote_current["html"] += value
        elif self.current is not None:
            self.current["html"] += value
        elif self.list_stack and self.list_stack[-1].get("active_item") is not None:
            self.list_stack[-1]["active_item"]["html"] += value

    def finish_current(self) -> None:
        if self.current is None:
            return
        block = self.current
        self.current = None
        block["html"] = block["html"].strip()
        block["text"] = clean_text(block["html"])
        if not block["text"]:
            return
        if block["type"] == "heading":
            block["level"] = block.pop("level")
            if block["level"] == 1 and not self.title:
                self.title = block["text"]
        self.blocks.append(block)

    def finish_list(self) -> None:
        if self.list_block is None:
            return
        block = self.list_block
        self.list_block = None
        # Close any unfinished levels defensively. Well-formed source closes every
        # list before this point, but this keeps a malformed or interrupted list
        # from silently dropping its final item.
        while self.list_stack:
            level = self.list_stack.pop()
            if level.get("active_item") is not None:
                self._finish_list_item(level)
        block.pop("active_item", None)
        if block["items"]:
            block["html"] = self._list_html(block)
            block["text"] = "\n".join(self._list_text(item) for item in block["items"])
            self.blocks.append(block)

    def _list_text(self, item: dict[str, Any]) -> str:
        nested = "\n".join(
            "\n".join(self._list_text(child) for child in group["items"])
            for group in item.get("children", [])
        )
        return "\n".join(part for part in (item["text"], nested) if part)

    def _list_html(self, group: dict[str, Any]) -> str:
        tag = "ol" if group["ordered"] else "ul"
        items = "".join(
            f"<li>{item['html']}{''.join(self._list_html(child) for child in item.get('children', []))}</li>"
            for item in group["items"]
        )
        return f"<{tag}>{items}</{tag}>"

    def _active_list_item(self) -> dict[str, Any] | None:
        if not self.list_stack:
            return None
        return self.list_stack[-1].get("active_item")

    def make_block(self, kind: str, **extra: Any) -> dict[str, Any]:
        return {"type": kind, "sourceUrl": self.current_url(), "sourceAnchor": "", **extra}

    def start_block(self, tag: str, attrs: dict[str, str]) -> None:
        if tag == "p" and self.current is not None and self.current.get("type") == "quote":
            return
        self.finish_current()
        kind = "heading" if tag.startswith("h") else "quote" if tag == "blockquote" else "paragraph"
        fragment = attrs.get("id", "")
        self.current = self.make_block(kind, html="", level=int(tag[1]) if kind == "heading" else None, headingFragment=fragment)

    def start_footnote(self, attrs: dict[str, str]) -> None:
        identifier = attrs.get("id", "")
        self.footnote_current = self.make_block("footnote", html="", footnoteId=identifier)
        self.footnote_current["sourceUrl"] = f"{self.source_url}#{identifier}" if identifier else self.source_url

    def handle_starttag(self, tag: str, raw_attrs: list[tuple[str, str | None]]) -> None:
        attrs = {key.lower(): value or "" for key, value in raw_attrs}
        if tag not in VOID:
            self.stack.append((tag, attrs))
        if self.capture_depth is None:
            if tag == "h1" and "entry-title" in classes(attrs):
                self.title_depth = 1
                self.title_parts = []
            if tag == "div" and self.content_class in classes(attrs):
                self.capture_depth = len(self.stack)
            return
        if len(self.stack) < self.capture_depth:
            return
        if self.skip_depth:
            if tag not in VOID:
                self.skip_depth += 1
            return
        if self.table_depth:
            if tag not in VOID:
                self.table_depth += 1
            if tag in {"caption", "colgroup", "tbody", "td", "tfoot", "th", "thead", "tr"}:
                self.table_parts.append(f"<{tag}>")
            return
        node_classes = classes(attrs)
        if tag == "button" and "bigfoot-footnote__button" in node_classes:
            number = attrs.get("data-footnote-number", "")
            identifier = attrs.get("id", "")
            if number and (self.current is not None or self._active_list_item() is not None):
                self.append(f'<sup><a href="#{escape(identifier, quote=True)}">{escape(number)}</a></sup>')
            self.skip_depth = 1
            return
        if tag in SKIP_TAGS or attrs.get("id") == "ez-toc-container" or "ez-toc-container" in node_classes:
            self.skip_depth = 1
            return
        if "footnotes" in node_classes:
            self.finish_current()
            self.finish_list()
            self.in_footnotes = 1
            return
        if self.in_footnotes:
            if tag == "li" and "footnote" in node_classes:
                self.start_footnote(attrs)
            elif tag == "br":
                self.append("<br>")
            elif tag in INLINE:
                self._start_inline(tag, attrs)
            return
        if tag == "a" and "footnote-print-only" in node_classes:
            self.skip_depth = 1
            return
        if tag == "p" and self._active_list_item() is not None:
            if self._active_list_item()["html"]:
                self.append("<br>")
            return
        if tag in BLOCK_TAGS:
            self.start_block(tag, attrs)
            return
        if tag in {"ul", "ol"}:
            self.finish_current()
            if self.list_block is None:
                self.list_block = self.make_block("list", ordered=tag == "ol", items=[], active_item=None)
                self.list_stack = [self.list_block]
            else:
                parent = self._active_list_item()
                if parent is None:
                    return
                nested = {"ordered": tag == "ol", "items": [], "active_item": None}
                parent.setdefault("children", []).append(nested)
                self.list_stack.append(nested)
            return
        if tag == "li" and self.list_block is not None:
            level = self.list_stack[-1]
            if level.get("active_item") is not None:
                self._finish_list_item(level)
            level["active_item"] = {"html": "", "children": []}
            return
        if tag == "figure":
            self.finish_current()
            self.finish_list()
            self.figure = self.make_block("figure", images=[], captionHtml="", captionText="")
            return
        if tag == "table" and self.figure is not None:
            self.table_depth = 1
            self.table_parts = ["<table>"]
            return
        if tag == "img":
            image = {
                "src": self.absolute_url(attrs.get("data-orig-file") or attrs.get("src", "")),
                "alt": attrs.get("alt", ""),
                "width": attrs.get("width", ""),
                "height": attrs.get("height", ""),
            }
            if self.figure is not None:
                self.figure["images"].append(image)
            else:
                self.finish_current()
                self.blocks.append(self.make_block("image", **image))
            return
        if tag == "figcaption" and self.figure is not None:
            self.current = {"type": "caption", "html": "", "sourceUrl": self.current_url(), "sourceAnchor": ""}
            return
        if tag == "hr":
            self.finish_current()
            self.finish_list()
            self.blocks.append(self.make_block("separator"))
            return
        if tag == "math":
            self.finish_current()
            self.current = self.make_block("equation", html='<math xmlns="http://www.w3.org/1998/Math/MathML">')
            return
        if tag in INLINE:
            self._start_inline(tag, attrs)

    def _start_inline(self, tag: str, attrs: dict[str, str]) -> None:
        if tag == "br":
            self.append("<br>")
        elif tag == "a":
            href = self.absolute_url(attrs.get("href", ""))
            self.append(f'<a href="{escape(href, quote=True)}">')
        elif tag == "span":
            fragment = attrs.get("id", "")
            if fragment and self.current and self.current.get("type") == "heading":
                self.current["headingFragment"] = fragment
        else:
            self.append(f"<{tag}>")

    def handle_endtag(self, tag: str) -> None:
        if not self.stack:
            return
        _, attrs = self.stack.pop()
        if self.capture_depth is None:
            if tag == "h1" and self.title_depth:
                self.title_depth = 0
                self.title = clean_text("".join(self.title_parts))
            return
        if self.skip_depth:
            self.skip_depth -= 1
            return
        if self.table_depth:
            if tag in {"caption", "colgroup", "tbody", "td", "tfoot", "th", "thead", "tr"}:
                self.table_parts.append(f"</{tag}>")
            self.table_depth -= 1
            if tag == "table" and self.table_depth == 0 and self.figure is not None:
                self.table_parts.append("</table>")
                self.figure["tableHtml"] = "".join(self.table_parts)
                self.figure["tableText"] = clean_text(self.figure["tableHtml"])
                self.table_parts = []
            return
        if self.in_footnotes:
            if tag == "li" and self.footnote_current is not None:
                block = self.footnote_current
                self.footnote_current = None
                block["html"] = re.sub(r'<a href="[^"]*"[^>]*>↩</a>', "", block["html"]).strip()
                block["text"] = clean_text(block["html"])
                self.footnotes.append(block)
            elif tag in INLINE and tag != "br":
                self.append(f"</{tag}>")
            elif tag == "div" and "footnotes" in classes(attrs):
                self.in_footnotes = 0
            return
        if tag in BLOCK_TAGS and self.current is not None:
            if self.current.get("type") == "heading":
                fragment = self.current.pop("headingFragment", "")
                if fragment:
                    self.section_fragment = fragment
                    self.current["sourceUrl"] = self.current_url()
            self.finish_current()
        elif tag in {"ul", "ol"} and self.list_block is not None:
            level = self.list_stack[-1]
            if level.get("active_item") is not None:
                self._finish_list_item(level)
            self.list_stack.pop()
            if not self.list_stack:
                self.finish_list()
        elif tag == "li" and self.list_block is not None and self._active_list_item() is not None:
            self._finish_list_item(self.list_stack[-1])
        elif tag == "figcaption" and self.current is not None and self.current.get("type") == "caption":
            caption = self.current
            self.current = None
            if self.figure is not None:
                self.figure["captionHtml"] = caption["html"].strip()
                self.figure["captionText"] = clean_text(caption["html"])
        elif tag == "figure" and self.figure is not None:
            self.blocks.append(self.figure)
            self.figure = None
        elif tag == "math" and self.current is not None and self.current.get("type") == "equation":
            self.current["html"] += "</math>"
            self.finish_current()
        elif tag in INLINE and tag != "br":
            self.append(f"</{tag}>")
        if len(self.stack) < self.capture_depth:
            self.finish_current()
            self.finish_list()
            self.capture_depth = None

    def _finish_list_item(self, level: dict[str, Any]) -> None:
        item = level.pop("active_item")
        item["html"] = item["html"].strip()
        item["text"] = clean_text(item["html"])
        if not item["children"]:
            item.pop("children")
        level["items"].append(item)

    def handle_data(self, data: str) -> None:
        if self.title_depth:
            self.title_parts.append(escape(data, quote=False))
        if self.table_depth:
            self.table_parts.append(escape(data, quote=False))
            return
        if self.capture_depth is not None and not self.skip_depth:
            self.append(escape(data, quote=False))


def finalize(blocks: list[dict[str, Any]], footnotes: list[dict[str, Any]], prefix: str) -> list[dict[str, Any]]:
    ordered = blocks + footnotes
    for index, block in enumerate(ordered, 1):
        block["id"] = f"{prefix}-{index:04d}"
        block["sourceAnchor"] = block["id"]
    return ordered


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html_file", type=Path, help="saved HTML file; it is parsed locally and never executed")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-url", required=True, help="canonical URL for the saved page")
    parser.add_argument("--content-class", default="entry-content", help="class on the article body container")
    parser.add_argument("--id-prefix", default="source", help="stable ID prefix for extracted blocks")
    args = parser.parse_args()

    raw = args.html_file.read_text(encoding="utf-8", errors="replace")
    extractor = FullTextExtractor(args.source_url, args.content_class)
    extractor.feed(raw)
    extractor.close()
    blocks = finalize(extractor.blocks, extractor.footnotes, args.id_prefix)
    if not blocks:
        raise SystemExit(f"No blocks found in .{args.content_class}; no output written.")
    payload = {
        "format": "margin-private-fulltext-v1",
        "publicationStatus": "private-draft-pending-rights-review",
        "canonicalSourceUrl": args.source_url,
        "sourceFile": args.html_file.name,
        "contentSelector": f".{args.content_class}",
        "title": extractor.title,
        "blocks": blocks,
        "extractionNotes": [
            "Parsed locally with Python html.parser; no document scripts, styles, network requests, navigation, advertisements, or site footer are evaluated or retained.",
            "sourceAnchor is a stable extractor ID for editorial mapping. sourceUrl is the canonical page URL, including the nearest source heading fragment when available.",
            "Text and meaningful inline markup, links, figures, captions, lists, and footnotes are retained for review. Source CSS, layout wrappers, responsive image sets, and interactive footnote buttons are intentionally excluded.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for block in blocks:
        counts[block["type"]] = counts.get(block["type"], 0) + 1
    print(f"Wrote {len(blocks)} private blocks to {args.output}")
    print("; ".join(f"{kind}={count}" for kind, count in sorted(counts.items())))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
