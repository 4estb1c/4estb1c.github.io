# Margin authoring workflow

Margin is a static article reader with continuous source text, sparse commentary beside relevant passages, original footnotes, selective tooltips, and reproducible figures. Deep research happens in a Codex session using [the research prompt](prompts/research-and-annotate.md); the website does not run an AI model. Keep article data, research evidence, chart data, and analysis code in the repository so later articles and discussions can reuse them.

## Add or update an article

1. Read `prompts/research-and-annotate.md` in a Codex session and give it the article URL or local source, plus the desired scope. The prompt instructs the agent to inspect existing research first, read the full article, research each material number and assumption, and save its work in the site's schema.
2. Before collecting facts, inspect `research/evidence.json` and prior article context files for reusable research. Reuse stable evidence IDs and check time-sensitive facts against their latest primary source. Add general facts and sources to the shared registry so future articles can use them. Do not duplicate a fact just because another article uses it.
3. Create the article JSON in `data/` using [`templates/article.json`](templates/article.json) as a starter and add its metadata to `data/articles.json`. Use stable IDs and preserve the source's full text and order in the left-hand blocks. Attach commentary only to passages where later evidence or context matters: `update` for changed numbers or outcomes, `context` for an assumption or new development. The author's own footnotes remain in the left-hand source, with their attribution and links.
4. Cite each factual annotation with source IDs that resolve in the article's `sources` list. Keep the source's publication date separate from the evidence reference period. Include an “as of” date, unit, denominator, and uncertainty when they affect the claim.
5. Add a `figure` object to a note for line, bar, scatter, histogram, or table data. Store values in the article JSON, with source IDs, dates, units, and caveats. Keep any code that transforms source data into chart values alongside the research assets so it is easy to rerun. A chart is a presentation of the evidence, not a substitute for the source or methods.
6. Add tooltips only for specific, useful facts a technically literate ML reader may want at hand, such as an H100's memory, bandwidth, and power specifications. Reference selected terms in a block's `glossaryTerms`; do not automatically underline basic terms. Images use an `image` block with a descriptive `alt`; equations can use MathML in `mathML` or readable text in `text`.
7. Regenerate the discussion context after edits, validate, preview locally, and inspect every link, annotation alignment, figure, image, equation, and glossary tooltip.

The optional local HTML importer can help start from a saved article page, including arXiv's HTML view:

```powershell
python margin/scripts/import_html.py .\paper.html --output margin\data\draft.json --article-id paper-draft --title "Paper title" --author "Author" --source-url "https://arxiv.org/html/..."
```

It emits a draft of headings, paragraphs, images, and MathML. It does not fetch a URL. Review the extraction, strip navigation or other page chrome that remains, repair image paths, and confirm that the source's license or terms permit the text and images you plan to publish. For sources without permission to republish, use metadata and links with only brief excerpts where allowed.

For a saved page with a distinct article-body container, use the fuller extractor. It retains ordered paragraphs, headings, lists, figures, tables, links, and source footnotes in an ignored private draft for review:

```powershell
python margin/scripts/extract_fulltext.py .\saved-article.html --output margin/drafts/article.fulltext.json --source-url "https://example.org/article" --content-class entry-content --id-prefix article
```

The extractor never fetches the source URL or evaluates page scripts. Check its blocks against the original page before assembling an article. Keep unpublished full-text drafts in `margin/drafts/`; this directory is ignored by Git and must not be copied into the public site without reuse rights.

Saved pages sometimes rewrite image URLs into a local `*_files` folder. The extractor flags these in `unresolvedLocalAssets` instead of inventing a remote URL. Confirm each image's canonical URL from the source page, then pass a reviewed JSON path map with `--asset-map`; leave assets unresolved when the original is unavailable. Footnote links should resolve to the extracted original footnote IDs before publication.

The original saved pages supplied for *Situational Awareness* are inventoried in [`research/source-inventory.md`](research/source-inventory.md). Chapter I and seven further full-text reader previews are assembled locally with the original prose, figures, and footnotes in reading order, and sparse evidence notes beside relevant passages. The later pages still need line-by-line editorial review. The source site provides no identified permission to republish its full text and figures, so keep the full-text edition local until reuse rights are established. The authoring template's `sourceMode: "full"` is for authorized source content.

## Rebuild and validate

Run from the website repository root:

```powershell
python margin/scripts/rebuild_figures.py --automated-share 0.9 --speedups 1 2 5 10 20 50 100
python margin/scripts/margin.py build-context situational-awareness
python margin/scripts/margin.py validate
python -m http.server 8000
```

Then open `http://localhost:8000/margin/`. The context builder writes the page content, notes, source registry, glossary, and figure JSON to the catalogue's `contextPath`; include relevant auxiliary research and reproducibility paths there when preparing discussion context.

## Codex discussion

Open the generated context file and relevant chart code/research assets in a Codex session, then ask questions about the article. The context file includes all material shown on the page so the model can start with the article and its evidence in view. It deliberately contains research rationale, methods, caveats, and source data rather than private chain-of-thought. For a snappy conversation, include only relevant shared evidence and auxiliary notes instead of loading the whole evidence corpus.

## Shared evidence and charts

`research/evidence.json` is the shared, dated fact catalogue. Give records stable IDs, a clear scope, value and unit when numeric, status (observed, estimate, forecast, announced, and so on), source URL, retrieval date, and caveat. Separate a source's release date from its measurement period. Check before adding facts and refresh fast-changing values rather than overwriting their history without explanation.

Figure values live with the article annotation that uses them. Retain raw inputs or transformation code beside the evidence when a plot requires calculations. This keeps charts editable and avoids repeated collection work; it also lets later articles cite the same research without making the page depend on an external chart service.

The illustrative workflow speedup plot is generated by `scripts/rebuild_figures.py`; rerunning it updates both its data and accompanying explanatory sentence. Other first-release charts use directly reported values embedded in the article JSON, with their source URLs and units beside them.
