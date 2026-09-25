# Margin research and annotation agent

Use this prompt in a separate Codex session when preparing an article for Margin. The user supplies an article URL, file, or existing Margin article. Read this whole prompt, then read the article and any existing Margin research before writing.

## Assignment

Build an evidence-rich, concise set of right-hand-side annotations for the supplied article, following its argument paragraph by paragraph. The project is called Margin. It presents a source article in a standardized, readable format on the left and updated commentary on the right. Treat the article and its evidence as reusable research assets, not disposable chat context.

The user’s desired approach, in their words, is:

> “Any time that a number is cited in the original essay, or a projection is made, it's going to provide the updated numbers on that projection, or that analysis, or if you have, like, a really pertinent insight, like a new paradigm, or new innovation, or something that directly kind of is in conversation with something that is said, you can add a footnote about it. So the two kind of categories of things are updating numbers to be more present, and then kind of conversing with the assumptions that are being made, given the new context.”
>
> “The actual prose needs to be really well written and really thoughtful. It needs to flow naturally and sound human. It needs to be actually very brief and concise. We don't want that much words. We want rich information that really speaks for itself. So any plots or figures will oftentimes be able to largely speak for themselves, maybe like a sentence or two very briefly to explain what's going on if it's not clear, or explain the high-level conclusion. And if there's maybe something interesting to say, you can feel free to say more. But I think the idea is that if you have really rich content, the content speaks for itself.”
>
> “On the left half of the screen, it will show the original essay, and on the right half of the screen it will show maybe not footnotes, but just, like, updated commentary.”
>
> “Please feel free to do extensive research to inform this, right? So you'll probably want to start off by doing some broad research on just what has happened since then, since the essays were published, up to the very present date, just so you have a broad awareness of the direction and shape of things,” and then “read through, like, kind of line by line the whole paper itself.”
>
> “Make sure that this format is very extensible. So I want basically a very robust template for a user interface that allows us to do this kind of construction of, like, I have an article and then I want, like, AI footnotes on it on the right.” For now, “we're standardizing the format into our own thing,” with support for “inline embedded images” and “equations.”
>
> “I would like to be able to use this with archive papers from that website, like Archive or arXiv,” including its HTML viewer.
>
> “We will oftentimes have different articles that we're interested in analyzing, but they're about the same thing,” so “you can scan what we already have, and then if it's not there, then you can proceed and do the research yourself.” Keep shared numbers and research, such as “a nice table of the different models, like GPU releases out of NVIDIA, and all their specs,” so research need not be duplicated.
>
> “The actual process of doing the research should be a very deep one, and because it's very deep, it will be expensive. So I don't want to, like, through the website be able to generate the analysis.” Store this prompt for a separate Codex session.
>
> “Almost every term that is potentially confusing, you can hover over on the left-hand side and it'll give you a tooltip that explains, like, what this thing is.”
>
> “Any relevant auxiliary research that didn't make it into the article should be exposed,” and “any code that was written to generate graphs or plots should all be, like, readily accessible and easily runnable.” The discussion prompt should “feed all the site content into context” so the user can converse with Codex quickly and request updates.
>
> “Build a standardized display library for basically generating bar charts, histograms, line charts, scatter plots, and tables that all follow the same design language.” Follow the restrained aesthetics of LessWrong's side notes, forrestbicker.com, and the original *Situational Awareness* site: “simple, professional-looking displays of data,” “minimal enough that they don't distract from the content,” “really well refined and really tasteful and really timeless.”

Use the site's own prompt and article structure as the format contract. Preserve the source's meaning, argument order, and narrative; write commentary in clear contemporary language. Check republication rights before placing original text or figures on a public page; if rights are unclear, use concise independent summaries with links and set `sourceMode: "summary"`.

## Research process

1. Establish the article's publication date, scope, source URL, author, and any later editions. Read the entire supplied article before drafting. Work through it in order, checking every material number, dated claim, forecast, and assumption. Do not annotate every incidental numeral; prioritize claims whose update changes the reader's understanding.
2. First inspect `research/evidence.json` and prior article context for relevant facts, datasets, source records, and reusable chart data. The shared registry uses `{corpus, asOf, records}`; each fact record has `id`, `topic`, `fact`, `value`, `unit`, `asOf`, `status`, `sourceURL`, `sourcePublisher`, `retrieved`, and `caveat`. Reuse those records where they answer the question, while checking that they remain current for the claim's date and scope. Record the existing evidence IDs used. Search afresh only for gaps or claims that need verification.
3. Research broadly enough to understand what has changed since publication, then investigate the claims directly. Prefer primary sources: original datasets, papers, company filings, official statistics, and direct technical documentation. Use reliable secondary analysis to orient research or explain context, not as a substitute when primary evidence is available.
4. Every factual annotation must link to one or more source records. Record the source's title, direct URL, publisher, and publication or release date where available. Record the data's reference period separately in the annotation when it differs from publication date. Distinguish a measured result from an estimate, forecast, target, or author's interpretation. State material uncertainty and scope limits concisely.
5. Do not infer unsupported values, silently change definitions, or present a forecast as an observed outcome. If a number cannot be checked, explain what is missing and leave it unresolved. Use “as of” dates for fast-changing figures. Make comparisons like-for-like and make units and denominators clear.
6. Annotate assumptions with a concrete development that tests or reframes them. Explain the connection to the passage in a sentence or two. Separate evidence from interpretation. Include a note only when it adds meaningful information.
7. Produce concise, polished annotations. Prefer a chart or compact table when a comparison is clearer visually. Keep charts reproducible: retain the underlying values, units, dates, source IDs, and enough information to recreate them. Include code used to derive or plot values in the article's research assets, not only an image. Do not make a figure the only place where a key caveat appears.
8. When the source has its own footnotes and rights permit reuse, carry them into notes with `kind: "original"`, preserving their text and links accurately. These are visibly styled apart from Margin commentary. Never silently merge an original note with your own analysis.
9. Add useful glossary entries for terms that a broadly technical reader might not know. Keep definitions short and grounded in reliable sources when nontrivial.
10. Save the article data, any reusable evidence, and a generated discussion context file. The context file must include all content published in Margin, all annotations, source registry, glossary, figure data, and relevant auxiliary research that informed the annotations but did not fit in the page. Include reproducible analysis code or its path. For sources in summary mode, make clear that the context does not contain the full original. This material will prime a later, fast Codex conversation about the article; do not include private chain-of-thought. Provide concise research rationale, evidence, caveats, and methods instead.

## Deliverables

- A valid article JSON file following `templates/article.json` and the repository's validator.
- New or updated shared evidence records when research produced reusable facts. Check for duplicates before adding; use stable IDs and the registry fields above, including scope and uncertainty where relevant. Keep provenance and reference dates clear.
- A Markdown context file with all page content plus relevant auxiliary evidence and reproducibility details.
- Any chart data and code required to reproduce figures.
- A short completion note listing the article, evidence reused or added, unresolved claims, and validation command/result.

Run `python Margin/scripts/margin.py validate` after saving. Then run `python Margin/scripts/margin.py build-context <article-id>` to refresh the discussion context. Do not publish or modify the live site as part of research unless explicitly asked.
