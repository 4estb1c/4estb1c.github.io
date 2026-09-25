# Inspector authoring workflow

Inspector is a static article reader with a source text, aligned commentary, original footnotes, glossary tooltips, and reproducible figures. Deep research happens in a Codex session using [the research prompt](prompts/research-and-annotate.md); the website does not run an AI model. Keep article data, research evidence, chart data, and analysis code in the repository so later articles and discussions can reuse them.

## Add or update an article

1. Read `prompts/research-and-annotate.md` in a Codex session and give it the article URL or local source, plus the desired scope. The prompt instructs the agent to inspect existing research first, read the full article, research each material number and assumption, and save its work in the site's schema.
2. Before collecting facts, inspect `research/evidence.json` and prior article context files for reusable research. Reuse stable evidence IDs and check time-sensitive facts against their latest primary source. Add general facts and sources to the shared registry so future articles can use them. Do not duplicate a fact just because another article uses it.
3. Create the article JSON in `data/` using [`templates/article.json`](templates/article.json) as a starter and add its metadata to `data/articles.json`. Use stable IDs. Put commentary in each block's `notes`: `update` for changed numbers or outcomes, `context` for an assumption or new development, and `original` for the source author's footnote. Original notes retain their attribution and links.
4. Cite each factual annotation with source IDs that resolve in the article's `sources` list. Keep the source's publication date separate from the evidence reference period. Include an “as of” date, unit, denominator, and uncertainty when they affect the claim.
5. Add a `figure` object to a note for line, bar, scatter, histogram, or table data. Store values in the article JSON, with source IDs, dates, units, and caveats. Keep any code that transforms source data into chart values alongside the research assets so it is easy to rerun. A chart is a presentation of the evidence, not a substitute for the source or methods.
6. Add concise glossary definitions under `glossary`, and reference them in block `glossaryTerms`. Images use an `image` block with a descriptive `alt`; equations can use MathML in `mathML` or readable text in `text`.
7. Regenerate the discussion context after edits, validate, preview locally, and inspect every link, annotation alignment, figure, image, equation, and glossary tooltip.

The optional local HTML importer can help start from a saved article page, including arXiv's HTML view:

```powershell
python Inspector/scripts/import_html.py .\paper.html --output Inspector\data\draft.json --article-id paper-draft --title "Paper title" --author "Author" --source-url "https://arxiv.org/html/..."
```

It emits a draft of headings, paragraphs, images, and MathML. It does not fetch a URL. Review the extraction, strip navigation or other page chrome that remains, repair image paths, and confirm that the source's license or terms permit the text and images you plan to publish. For sources without permission to republish, use metadata and links with only brief excerpts where allowed.

The initial *Situational Awareness* companion uses independent claim summaries because the source site does not grant republication of the full text and figures. `sourceMode: "summary"` makes this visible in the reader. If permission is obtained, an authorized transcription can replace the summaries in stable block IDs while retaining the aligned notes.

## Rebuild and validate

Run from the website repository root:

```powershell
python Inspector/scripts/rebuild_figures.py --automated-share 0.9 --speedups 1 2 5 10 20 50 100
python Inspector/scripts/inspector.py build-context situational-awareness
python Inspector/scripts/inspector.py validate
python -m http.server 8000
```

Then open `http://localhost:8000/Inspector/`. The context builder writes the page content, notes, source registry, glossary, and figure JSON to the catalogue's `contextPath`; include relevant auxiliary research and reproducibility paths there when preparing discussion context.

## Codex discussion

Open the generated context file and relevant chart code/research assets in a Codex session, then ask questions about the article. The context file includes all material shown on the page so the model can start with the article and its evidence in view. It deliberately contains research rationale, methods, caveats, and source data rather than private chain-of-thought. For a snappy conversation, include only relevant shared evidence and auxiliary notes instead of loading the whole evidence corpus.

## Shared evidence and charts

`research/evidence.json` is the shared, dated fact catalogue. Give records stable IDs, a clear scope, value and unit when numeric, status (observed, estimate, forecast, announced, and so on), source URL, retrieval date, and caveat. Separate a source's release date from its measurement period. Check before adding facts and refresh fast-changing values rather than overwriting their history without explanation.

Figure values live with the article annotation that uses them. Retain raw inputs or transformation code beside the evidence when a plot requires calculations. This keeps charts editable and avoids repeated collection work; it also lets later articles cite the same research without making the page depend on an external chart service.

The illustrative workflow speedup plot is generated by `scripts/rebuild_figures.py`; rerunning it updates both its data and accompanying explanatory sentence. Other first-release charts use directly reported values embedded in the article JSON, with their source URLs and units beside them.
