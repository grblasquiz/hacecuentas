---
title: "Parsing markdown tables in 20 lines (because remark was overkill)"
published: false
description: A lightweight markdown table parser for Astro static sites that don't want to pull remark + rehype + 40 plugins.
tags: javascript, webdev, markdown, astro
cover_image: https://hacecuentas.com/og-default.png
canonical_url: https://hacecuentas.com/blog/markdown-tables-minimal-parser
---

On [Hacé Cuentas](https://hacecuentas.com) I render 1,200+ pages of user-facing explanation text from JSON content. Every page has at least one markdown table — tax brackets, conversion tables, BMI ranges, dose schedules.

For a long time my tables looked like this:

```
TasaQué esPara qué sirve
|---|---|---|
TNATasa Nominal Anual (sin capitalización)Lo que te muestra el banco
```

Ugly, right? The markdown pipes weren't rendering as a proper HTML table. Cells concatenated without separation. The separator row showed up as literal text.

The bug was in my hand-rolled markdown function:

```js
.replace(/^\\| (.+) \\|$/gm, (match) => {
  const cells = match.slice(2, -2).split(' | ');
  return '<tr>' + cells.map((c) => `<td>${c}</td>`).join('') + '</tr>';
})
```

It generated `<tr><td>…</td></tr>` per line, **but never wrapped them in `<table>`**. Without `<table>`, browsers render `<tr>` inline as text. Cells mash together. The separator `|---|---|---|` stays as plain text because it doesn't match the regex.

## Why not just use remark?

I considered adding `remark` + `remark-parse` + `remark-html` + `remark-gfm` (for tables). That's:

- 4 packages
- ~180 KB of dependencies
- A plugin system I'd have to learn
- Build time overhead per page

For a site where markdown is a _side feature_ (the main thing is the calculator widget), this felt like killing a fly with a bazooka.

## The fix: detect table blocks, not rows

Instead of processing each row in isolation, match the entire table block (header + separator + rows) in one regex:

```js
function md(text) {
  // Process markdown tables as blocks first
  text = text.replace(
    /^(\\|.+\\|)\\n(\\|[-:| ]+\\|)\\n((?:\\|.+\\|\\n?)*\\|.+\\|)/gm,
    (_, headerLine, _sep, bodyBlock) => {
      const hCells = headerLine.slice(1, -1).split('|').map(s => s.trim());
      const rows = bodyBlock.split('\\n').filter(Boolean).map(row => {
        const cells = row.slice(1, -1).split('|').map(s => s.trim());
        return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
      });
      return '<table><thead><tr>' +
        hCells.map(c => `<th>${c}</th>`).join('') +
        '</tr></thead><tbody>' + rows.join('') + '</tbody></table>';
    }
  );

  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\[(.+?)\\]\\((.+?)\\)/g, '<a href="$2">$1</a>')
    .replace(/\\n\\n/g, '</p><p>')
    .replace(/\\n/g, '<br>');
}
```

That's it. 20 lines of JavaScript, no dependencies.

## Breaking down the regex

```
/^(\\|.+\\|)\\n(\\|[-:| ]+\\|)\\n((?:\\|.+\\|\\n?)*\\|.+\\|)/gm
```

- `^(\\|.+\\|)` — capture the header line (e.g., `| Col 1 | Col 2 |`)
- `\\n` — newline
- `(\\|[-:| ]+\\|)` — capture the separator (`|---|---|`, supports alignment colons too)
- `\\n` — newline
- `((?:\\|.+\\|\\n?)*\\|.+\\|)` — capture one or more data rows. The `\\n?` on intermediate rows handles trailing newlines; the final `\\|.+\\|` matches the last row without requiring a trailing newline.

The `gm` flags make it match across the full document, anchored to line starts.

## Edge cases it handles

- Tables with any number of columns
- Bold/italic inside cells (processed after, by the inline replacements)
- Tables separated from surrounding text by blank lines
- Tables anywhere in the document (not just at the start)

## Edge cases it doesn't handle (on purpose)

- Escaped pipes `\\|` inside cells — I never use them, so not worth the regex complexity
- Multi-line cells — same reasoning
- Cell alignment (`:---:` for center) — could add `text-align` parsing if needed, but my CSS handles defaults fine

## CSS to make it pretty

The generated `<table>` inherits global styles. In my case:

```css
.explanation table {
  border-collapse: collapse;
  margin: 1rem 0;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.explanation th {
  padding: 0.625rem 0.875rem;
  border-bottom: 2px solid var(--border);
  font-weight: 600;
  text-align: left;
}

.explanation td {
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
}

.explanation tr:last-child td {
  border-bottom: none;
}
```

## Why this matters

When you're shipping a static site with Astro or 11ty or Eleventy, dependency weight adds up. Every package in your build chain is another thing that can break, another thing to update, another 50ms of cold-start time.

For "I need basic markdown rendering," a 30-line function beats a 180KB dependency tree. Measure the actual pain before reaching for the library.

Source code is MIT-licensed: [grblasquiz/hacecuentas](https://github.com/grblasquiz/hacecuentas) — `src/pages/[...slug].astro`, lines ~27-50.

The full markdown function (with lists, links, code, headings) is under 30 lines total. If you need tables in an Astro content collection and don't want to pull remark, copy it.

---

Live demo: check any calculator on [hacecuentas.com](https://hacecuentas.com) (e.g., [calculadora de plazo fijo](https://hacecuentas.com/calculadora-plazo-fijo)) — scroll down to "Cómo funciona" to see tables rendered from JSON markdown.
