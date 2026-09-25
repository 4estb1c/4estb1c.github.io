#!/usr/bin/env python3
"""Small standard-library utilities for the static Margin article collection."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / "data" / "articles.json"
EVIDENCE_PATH = ROOT / "research" / "evidence.json"
EVIDENCE_STATUSES = {
    "observed", "announced", "forecast", "estimate", "policy", "policy-guidance",
    "policy-proposal", "company-reported", "vendor-specification", "methodology",
    "measurement", "officially-graded", "research-preprint", "observed-and-forecast",
}


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"{path.relative_to(ROOT)}: {exc}") from exc


def check_date(value: Any, where: str, errors: list[str], required: bool = False) -> None:
    if value is None and not required:
        return
    if not isinstance(value, str):
        errors.append(f"{where}: expected ISO date YYYY-MM or YYYY-MM-DD")
        return
    try:
        date.fromisoformat(value + "-01" if re.fullmatch(r"\d{4}-\d{2}", value) else value)
    except ValueError:
        errors.append(f"{where}: invalid ISO date {value!r}")


def validate_article(article: Any, where: str, evidence_ids: set[str], errors: list[str]) -> None:
    if not isinstance(article, dict):
        errors.append(f"{where}: expected object")
        return
    for field in ("id", "title", "author", "sourceUrl", "chapters", "blocks", "sources"):
        if field not in article:
            errors.append(f"{where}: missing {field}")
    check_date(article.get("published"), f"{where}.published", errors, required=True)
    check_date(article.get("updated"), f"{where}.updated", errors)
    chapters = article.get("chapters", [])
    chapter_ids = {c.get("id") for c in chapters if isinstance(c, dict)} if isinstance(chapters, list) else set()
    if isinstance(chapters, list):
        for i, chapter in enumerate(chapters):
            if not isinstance(chapter, dict) or not chapter.get("id") or not chapter.get("title"):
                errors.append(f"{where}.chapters[{i}]: expected id and title")

    sources = article.get("sources", [])
    source_ids: set[str] = set()
    if not isinstance(sources, list):
        errors.append(f"{where}.sources: expected array")
        sources = []
    for i, source in enumerate(sources):
        loc = f"{where}.sources[{i}]"
        if not isinstance(source, dict) or not all(source.get(k) for k in ("id", "label", "url")):
            errors.append(f"{loc}: expected id, label, and url")
            continue
        if source["id"] in source_ids:
            errors.append(f"{loc}: duplicate source id {source['id']!r}")
        source_ids.add(source["id"])
        check_date(source.get("date"), f"{loc}.date", errors)

    blocks = article.get("blocks", [])
    block_ids: set[str] = set()
    if not isinstance(blocks, list):
        errors.append(f"{where}.blocks: expected array")
        return
    for i, block in enumerate(blocks):
        loc = f"{where}.blocks[{i}]"
        if not isinstance(block, dict):
            errors.append(f"{loc}: expected object")
            continue
        bid = block.get("id")
        if not bid:
            errors.append(f"{loc}: missing id")
        elif bid in block_ids:
            errors.append(f"{loc}: duplicate block id {bid!r}")
        block_ids.add(bid)
        if block.get("chapter") not in chapter_ids:
            errors.append(f"{loc}: unknown chapter {block.get('chapter')!r}")
        typ = block.get("type")
        if typ not in {"heading", "paragraph", "image", "equation", "figure", "quote", "footnote"}:
            errors.append(f"{loc}: unsupported block type {typ!r}")
        if typ == "image" and (not block.get("src") or not block.get("alt")):
            errors.append(f"{loc}: image requires src and descriptive alt text")
        if typ == "equation" and not (block.get("mathML") or block.get("text")):
            errors.append(f"{loc}: equation requires mathML or text")
        terms = block.get("glossaryTerms", [])
        glossary = article.get("glossary", {})
        if not isinstance(terms, list):
            errors.append(f"{loc}.glossaryTerms: expected array")
        for term in terms if isinstance(terms, list) else []:
            key = term.get("term") if isinstance(term, dict) else term
            if key not in glossary:
                errors.append(f"{loc}: glossary term {key!r} is undefined")
        notes = block.get("notes", [])
        if not isinstance(notes, list):
            errors.append(f"{loc}.notes: expected array")
            continue
        for j, note in enumerate(notes):
            nloc = f"{loc}.notes[{j}]"
            if not isinstance(note, dict) or not all(note.get(k) for k in ("id", "kind", "body")):
                errors.append(f"{nloc}: expected id, kind, and body")
                continue
            if note["kind"] not in {"update", "context", "original"}:
                errors.append(f"{nloc}: unsupported kind {note['kind']!r}")
            if note["kind"] in {"update", "context"} and not isinstance(note.get("status"), str):
                errors.append(f"{nloc}.status: factual update/context notes require a nonempty provenance label")
            elif note["kind"] in {"update", "context"} and not note["status"].strip():
                errors.append(f"{nloc}.status: factual update/context notes require a nonempty provenance label")
            for sid in note.get("sourceIds", []):
                if sid not in source_ids:
                    errors.append(f"{nloc}: unknown source id {sid!r}")
            note_evidence_ids = note.get("evidenceIds", [])
            if not isinstance(note_evidence_ids, list):
                errors.append(f"{nloc}.evidenceIds: expected array")
            else:
                for evidence_id in note_evidence_ids:
                    if evidence_id not in evidence_ids:
                        errors.append(f"{nloc}: unknown evidence id {evidence_id!r}")
            figure = note.get("figure")
            if figure is not None:
                validate_figure(figure, nloc + ".figure", source_ids, errors)

def validate_evidence(evidence: Any, errors: list[str]) -> set[str]:
    if not isinstance(evidence, dict):
        errors.append("research/evidence.json: expected object")
        return set()
    check_date(evidence.get("asOf"), "research/evidence.json.asOf", errors, required=True)
    records = evidence.get("records")
    if not isinstance(records, list):
        errors.append("research/evidence.json.records: expected array")
        return set()
    ids: set[str] = set()
    required = ("id", "topic", "fact", "asOf", "status", "sourceURL", "sourcePublisher", "retrieved", "caveat")
    for i, record in enumerate(records):
        loc = f"research/evidence.json.records[{i}]"
        if not isinstance(record, dict) or not all(record.get(field) for field in required):
            errors.append(f"{loc}: missing required evidence fields")
            continue
        record_id = record["id"]
        if not isinstance(record_id, str) or not re.fullmatch(r"[A-Z]+-[0-9]+", record_id):
            errors.append(f"{loc}.id: expected PREFIX-NUMBER identifier")
        elif record_id in ids:
            errors.append(f"{loc}: duplicate evidence id {record_id!r}")
        ids.add(record_id)
        if record["status"] not in EVIDENCE_STATUSES:
            errors.append(f"{loc}.status: unsupported status {record['status']!r}")
        if not isinstance(record["sourceURL"], str) or not re.match(r"https?://", record["sourceURL"]):
            errors.append(f"{loc}.sourceURL: expected http(s) URL")
        check_date(record["retrieved"], f"{loc}.retrieved", errors, required=True)
    return ids


def validate_figure(figure: Any, where: str, source_ids: set[str], errors: list[str]) -> None:
    if not isinstance(figure, dict):
        errors.append(f"{where}: expected object")
        return
    kind = figure.get("type")
    if kind not in {"line", "bar", "scatter", "histogram", "table"}:
        errors.append(f"{where}: unsupported figure type {kind!r}")
    if not figure.get("title"):
        errors.append(f"{where}: missing title")
    if figure.get("source") and figure["source"] not in source_ids:
        errors.append(f"{where}: unknown source id {figure['source']!r}")
    if kind == "table":
        if not isinstance(figure.get("columns"), list) or not isinstance(figure.get("rows"), list):
            errors.append(f"{where}: table requires columns and rows arrays")
    else:
        series = figure.get("series")
        if not isinstance(series, list) or not series:
            errors.append(f"{where}: requires at least one series")
            return
        for i, item in enumerate(series):
            data = item.get("data") if isinstance(item, dict) else None
            if not isinstance(data, list) or not data:
                errors.append(f"{where}.series[{i}]: requires nonempty data")
                continue
            for j, point in enumerate(data):
                if not isinstance(point, dict) or "x" not in point or "y" not in point:
                    errors.append(f"{where}.series[{i}].data[{j}]: expected x and y")
                elif not isinstance(point["y"], (int, float)):
                    errors.append(f"{where}.series[{i}].data[{j}].y: expected number")


def validate() -> int:
    errors: list[str] = []
    if not EVIDENCE_PATH.is_file():
        errors.append("Missing research/evidence.json")
        evidence_ids: set[str] = set()
    else:
        evidence_ids = validate_evidence(load_json(EVIDENCE_PATH), errors)
    if not CATALOGUE.exists():
        print(f"Missing {CATALOGUE.relative_to(ROOT)}")
        return 1
    catalogue = load_json(CATALOGUE)
    if not isinstance(catalogue, dict) or not isinstance(catalogue.get("articles"), list):
        print("data/articles.json: expected object with articles array")
        return 1
    article_ids: set[str] = set()
    for i, entry in enumerate(catalogue["articles"]):
        loc = f"data/articles.json.articles[{i}]"
        if not isinstance(entry, dict) or not entry.get("id"):
            errors.append(f"{loc}: expected id")
            continue
        aid = entry["id"]
        if aid in article_ids:
            errors.append(f"{loc}: duplicate article id {aid!r}")
        article_ids.add(aid)
        path = ROOT / entry.get("articlePath", "")
        if not path.is_file() or ROOT not in path.resolve().parents:
            errors.append(f"{loc}: articlePath must point to an existing file inside Margin")
            continue
        article = load_json(path)
        if article.get("id") != aid:
            errors.append(f"{loc}: article file id does not match catalogue id {aid!r}")
        validate_article(article, str(path.relative_to(ROOT)).replace("\\", "/"), evidence_ids, errors)
        for prop in ("contextPath", "promptPath"):
            if entry.get(prop) and not (ROOT / entry[prop]).is_file():
                errors.append(f"{loc}: missing {prop} {entry[prop]!r}")
    if errors:
        print("Margin validation found issues:")
        print("\n".join(f"- {e}" for e in errors))
        return 1
    print(f"Validated {len(article_ids)} article(s).")
    return 0


def md_escape(text: Any) -> str:
    return str(text or "")


def render_context(article: dict[str, Any]) -> str:
    lines = [f"# {md_escape(article.get('title'))}", "", f"By {md_escape(article.get('author'))} · Published {md_escape(article.get('published'))}", "", f"Source: {md_escape(article.get('sourceUrl'))}", ""]
    if article.get("dek"):
        lines += [article["dek"], ""]
    if article.get("editionNote"):
        lines += [f"> {article['editionNote']}", ""]
    if article.get("sourceMode") == "summary":
        lines += ["Source mode: independently written claim summaries. The original essay is linked, not reproduced here.", ""]
    sources = {source["id"]: source for source in article.get("sources", []) if isinstance(source, dict) and source.get("id")}
    evidence = load_json(EVIDENCE_PATH) if EVIDENCE_PATH.is_file() else {}
    evidence_by_id = {record["id"]: record for record in evidence.get("records", []) if isinstance(record, dict) and record.get("id")}
    chapter_names = {chapter.get("id"): chapter.get("title") for chapter in article.get("chapters", []) if isinstance(chapter, dict)}
    current_chapter = None
    for block in article.get("blocks", []):
        chapter = block.get("chapter")
        if chapter != current_chapter:
            current_chapter = chapter
            lines += [f"## {md_escape(chapter_names.get(chapter, chapter))}", ""]
        kind = block.get("type", "paragraph")
        if kind == "heading":
            lines += [f"### {md_escape(block.get('text', block.get('html')))}", ""]
        elif kind == "image":
            lines += [f"![{md_escape(block.get('alt'))}]({md_escape(block.get('src'))})", ""]
        elif kind == "equation":
            lines += ["$$", md_escape(block.get("text", block.get("mathML"))), "$$", ""]
        elif kind == "figure":
            lines += [f"[Figure block: {md_escape(block.get('label', block.get('id')))}]", ""]
        else:
            body = block.get("text", block.get("html", ""))
            lines += [f"> {body}" if kind == "quote" else md_escape(body), ""]
        for note in block.get("notes", []):
            label = {"update": "Margin update", "context": "Margin context", "original": "Original footnote"}.get(note.get("kind"), "Note")
            title = f" — {note['title']}" if note.get("title") else ""
            lines += [f"**{label}{title}**", "", md_escape(note.get("body")), ""]
            if note.get("status"):
                lines += [f"**Provenance:** {md_escape(note['status'])}", ""]
            for sid in note.get("sourceIds", []):
                source = sources.get(sid, {})
                if source:
                    lines += [f"[{sid}] {source.get('label', '')} — {source.get('url', '')} ({source.get('publisher', '')}; {source.get('date', '')})", ""]
            for evidence_id in note.get("evidenceIds", []):
                record = evidence_by_id.get(evidence_id)
                if record:
                    lines += [f"[Evidence {evidence_id}] ({record['asOf']}; {record['status']}): {record['fact']} Source: {record['sourceURL']}. Caveat: {record['caveat']}", ""]
            if note.get("figure"):
                lines += ["```json", json.dumps(note["figure"], ensure_ascii=False, indent=2), "```", ""]
    glossary = article.get("glossary", {})
    if glossary:
        lines += ["## Glossary", ""]
        for term, definition in glossary.items():
            text = definition.get("definition", "") if isinstance(definition, dict) else definition
            lines += [f"- **{term}:** {text}"]
        lines += [""]
    lines += ["## Source registry", ""]
    for source in sources.values():
        lines += [f"- **{source.get('id')}:** {source.get('label')} — {source.get('url')} ({source.get('publisher', '')}; {source.get('date', '')})"]
    if evidence:
        lines += ["", "## Shared evidence records", "", "The following dated records are reusable across articles; their status and caveats matter.", ""]
        for record in evidence.get("records", []):
            lines += [f"- **{record['id']}** ({record['asOf']}; {record['status']}): {record['fact']} Source: {record['sourceURL']}. Caveat: {record['caveat']}"]
    for relative in article.get("researchPaths", []):
        path = (ROOT / relative).resolve()
        if ROOT not in path.parents or not path.is_file():
            continue
        lines += ["", f"## Auxiliary research: {relative}", "", path.read_text(encoding="utf-8"), ""]
    lines += ["", "## Reproducibility", "", "Figure values and series are embedded above. The standard chart renderer is `charts.js`; edit the figure data in the article JSON and rebuild this context after changes.", ""]
    lines += ["", "## Discussion context", "", "This file contains the normalized page content and its cited evidence. Consult the linked research assets and source records before answering detail questions. Distinguish article claims, measured evidence, and interpretation. State dates and uncertainty. Do not invent missing information.", ""]
    return "\n".join(lines)


def build_context(article_id: str) -> int:
    catalogue = load_json(CATALOGUE)
    entry = next((x for x in catalogue["articles"] if x.get("id") == article_id), None)
    if entry is None:
        print(f"Unknown article id: {article_id}")
        return 1
    article_path = ROOT / entry["articlePath"]
    article = load_json(article_path)
    relative = entry.get("contextPath") or f"context/{article_id}.md"
    output = ROOT / relative
    if ROOT not in output.resolve().parents:
        print("contextPath must remain inside Margin")
        return 1
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_context(article), encoding="utf-8")
    print(f"Wrote {output.relative_to(ROOT)}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("validate", help="validate catalogue, articles, citations, and figures")
    context = sub.add_parser("build-context", help="write a complete article discussion context Markdown file")
    context.add_argument("article_id")
    args = parser.parse_args()
    return validate() if args.command == "validate" else build_context(args.article_id)


if __name__ == "__main__":
    raise SystemExit(main())
