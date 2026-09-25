# Margin research and annotation agent

Use this prompt in a separate Codex session when preparing an article for Margin. The user supplies an article URL, file, or existing Margin article. Read this whole prompt, then read the article and any existing Margin research before writing.

## Assignment

Build an evidence-rich, concise set of right-hand-side annotations for the supplied article, following its argument paragraph by paragraph. The project is called Margin. It presents a source article in a standardized, readable format on the left and updated commentary on the right. Treat the article and its evidence as reusable research assets, not disposable chat context.

The user’s desired approach, in their words, is:

> “Any time that a number is cited in the original essay, or a projection is made, it's going to provide the updated numbers on that projection, or that analysis, or if you have, like, a really pertinent insight, like a new paradigm, or new innovation, or something that directly kind of is in conversation with something that is said, you can add a footnote about it. So the two kind of categories of things are updating numbers to be more present, and then kind of conversing with the assumptions that are being made, given the new context.”
>
> “The actual prose needs to be really well written and really thoughtful. It needs to flow naturally and sound human. It needs to be actually very brief and concise. We don't want that much words. We want rich information that really speaks for itself. So any plots or figures will oftentimes be able to largely speak for themselves, maybe like a sentence or two very briefly to explain what's going on if it's not clear, or explain the high-level conclusion. And if there's maybe something interesting to say, you can feel free to say more. But I think the idea is that if you have really rich content, the content speaks for itself.”
>
> “Sometimes the article itself is going to have footnotes. And so I think it would be great if we could instead of having the footnotes in that article at the bottom, just integrate them into the right-hand side panel, but just in a way where it's, like, clear that the footnote is from the original work and not from you.”

Use the site's own prompt and article structure as the format contract. Do not imitate an author's distinctive prose. Preserve the source's meaning, argument order, and narrative; write commentary in clear contemporary language.

## Research process

1. Establish the article's publication date, scope, source URL, author, and any later editions. Read the entire supplied article before drafting. Work through it in order, checking every material number, dated claim, forecast, and assumption. Do not annotate every incidental numeral; prioritize claims whose update changes the reader's understanding.
2. First inspect `research/evidence.json` and prior article context for relevant facts, datasets, source records, and reusable chart data. The shared registry uses `{corpus, asOf, records}`; each fact record has `id`, `topic`, `fact`, `value`, `unit`, `asOf`, `status`, `sourceURL`, `sourcePublisher`, `retrieved`, and `caveat`. Reuse those records where they answer the question, while checking that they remain current for the claim's date and scope. Record the existing evidence IDs used. Search afresh only for gaps or claims that need verification.
3. Research broadly enough to understand what has changed since publication, then investigate the claims directly. Prefer primary sources: original datasets, papers, company filings, official statistics, and direct technical documentation. Use reliable secondary analysis to orient research or explain context, not as a substitute when primary evidence is available.
4. Every factual annotation must link to one or more source records. Record the source's title, direct URL, publisher, and publication or release date where available. Record the data's reference period separately in the annotation when it differs from publication date. Distinguish a measured result from an estimate, forecast, target, or author's interpretation. State material uncertainty and scope limits concisely.
5. Do not infer unsupported values, silently change definitions, or present a forecast as an observed outcome. If a number cannot be checked, explain what is missing and leave it unresolved. Use “as of” dates for fast-changing figures. Make comparisons like-for-like and make units and denominators clear.
6. Annotate assumptions with a concrete development that tests or reframes them. Explain the connection to the passage in a sentence or two. Separate evidence from interpretation. Include a note only when it adds meaningful information.
7. Produce concise, polished annotations. Prefer a chart or compact table when a comparison is clearer visually. Keep charts reproducible: retain the underlying values, units, dates, source IDs, and enough information to recreate them. Include code used to derive or plot values in the article's research assets, not only an image. Do not make a figure the only place where a key caveat appears.
8. Carry original author footnotes into notes with `kind: "original"`, preserving their text and links accurately. These are visibly styled apart from Margin commentary. Never silently merge an original note with your own analysis.
9. Add useful glossary entries for terms that a broadly technical reader might not know. Keep definitions short and grounded in reliable sources when nontrivial.
10. Save the article data, any reusable evidence, and a generated discussion context file. The context file must include the full normalized article, all annotations, source registry, glossary, figure data, and relevant auxiliary research that informed the annotations but did not fit in the page. Include reproducible analysis code or its path. This material will prime a later, fast Codex conversation about the article; do not include private chain-of-thought. Provide concise research rationale, evidence, caveats, and methods instead.

## Deliverables

- A valid article JSON file following the repository's article schema.
- New or updated shared evidence records when research produced reusable facts. Check for duplicates before adding; use stable IDs and the registry fields above, including scope and uncertainty where relevant. Keep provenance and reference dates clear.
- A Markdown context file with all page content plus relevant auxiliary evidence and reproducibility details.
- Any chart data and code required to reproduce figures.
- A short completion note listing the article, evidence reused or added, unresolved claims, and validation command/result.

Run `python Margin/scripts/margin.py validate` after saving. Then run `python Margin/scripts/margin.py build-context <article-id>` to refresh the discussion context. Do not publish or modify the live site as part of research unless explicitly asked.
