#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build academic working-paper PDFs (ES + EN) about hacecuentas.com for academia.edu.
Renders with reportlab (no LaTeX/pandoc needed). Single-column, Times, working-paper style.
Run: python3 papers/academia/build_pdf.py
"""
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, ListFlowable, ListItem
)

HERE = __file__.rsplit("/", 1)[0]

# ---------------------------------------------------------------- inline markdown
def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def inline(s):
    """Convert **bold**, *italic*, `code` and escape XML. Order matters."""
    s = esc(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<i>\1</i>", s)
    s = re.sub(r"`(.+?)`", r'<font face="Courier" size="9.5">\1</font>', s)
    return s

# ---------------------------------------------------------------- styles
def styles():
    S = {}
    S["title"] = ParagraphStyle("title", fontName="Times-Bold", fontSize=17,
                                leading=20, alignment=TA_CENTER, spaceAfter=4)
    S["type"] = ParagraphStyle("type", fontName="Times-Italic", fontSize=10.5,
                               leading=13, alignment=TA_CENTER, textColor=colors.HexColor("#444444"),
                               spaceAfter=10)
    S["author"] = ParagraphStyle("author", fontName="Times-Roman", fontSize=12.5,
                                 leading=15, alignment=TA_CENTER, spaceAfter=2)
    S["affil"] = ParagraphStyle("affil", fontName="Times-Italic", fontSize=9.5,
                                leading=12, alignment=TA_CENTER, textColor=colors.HexColor("#333333"),
                                spaceAfter=1)
    S["abshead"] = ParagraphStyle("abshead", fontName="Times-Bold", fontSize=10.5,
                                  leading=13, spaceBefore=6, spaceAfter=3)
    S["abstract"] = ParagraphStyle("abstract", fontName="Times-Roman", fontSize=9.7,
                                   leading=13.2, alignment=TA_JUSTIFY,
                                   leftIndent=14, rightIndent=14, spaceAfter=5)
    S["keywords"] = ParagraphStyle("keywords", fontName="Times-Roman", fontSize=9.5,
                                   leading=12.5, alignment=TA_JUSTIFY,
                                   leftIndent=14, rightIndent=14, spaceAfter=4)
    S["cite"] = ParagraphStyle("cite", fontName="Times-Italic", fontSize=8.6,
                               leading=11, alignment=TA_LEFT, leftIndent=14, rightIndent=14,
                               textColor=colors.HexColor("#333333"))
    S["h2"] = ParagraphStyle("h2", fontName="Times-Bold", fontSize=12.5, leading=15,
                             spaceBefore=12, spaceAfter=5)
    S["h3"] = ParagraphStyle("h3", fontName="Times-BoldItalic", fontSize=10.8, leading=13.5,
                             spaceBefore=8, spaceAfter=3)
    S["body"] = ParagraphStyle("body", fontName="Times-Roman", fontSize=10.6, leading=14.6,
                               alignment=TA_JUSTIFY, spaceAfter=6.5)
    S["bullet"] = ParagraphStyle("bullet", fontName="Times-Roman", fontSize=10.6, leading=14.2,
                                 alignment=TA_JUSTIFY, leftIndent=8, spaceAfter=3)
    S["ref"] = ParagraphStyle("ref", fontName="Times-Roman", fontSize=9.4, leading=12.6,
                              alignment=TA_LEFT, leftIndent=16, firstLineIndent=-16, spaceAfter=4)
    S["small"] = ParagraphStyle("small", fontName="Times-Roman", fontSize=9.3, leading=12.4,
                                alignment=TA_JUSTIFY, spaceAfter=5)
    S["tablecap"] = ParagraphStyle("tablecap", fontName="Times-Italic", fontSize=9.2,
                                   leading=12, alignment=TA_LEFT, spaceBefore=2, spaceAfter=8)
    S["thead"] = ParagraphStyle("thead", fontName="Times-Bold", fontSize=9.2, leading=11,
                                textColor=colors.white)
    S["tcell"] = ParagraphStyle("tcell", fontName="Times-Roman", fontSize=9.2, leading=11)
    S["tnum"] = ParagraphStyle("tnum", fontName="Times-Roman", fontSize=9.2, leading=11,
                               alignment=TA_CENTER)
    return S

# ---------------------------------------------------------------- category table
def category_table(S, rows, headers, total_label, total_n):
    # rows: list of (name, n); render two columns side by side
    half = (len(rows) + 1) // 2
    left, right = rows[:half], rows[half:]
    data = [[Paragraph(headers[0], S["thead"]), Paragraph(headers[1], S["thead"]),
             Paragraph(headers[0], S["thead"]), Paragraph(headers[1], S["thead"])]]
    for i in range(half):
        l = left[i]
        r = right[i] if i < len(right) else ("", "")
        data.append([Paragraph(l[0], S["tcell"]), Paragraph(str(l[1]), S["tnum"]),
                     Paragraph(r[0], S["tcell"]), Paragraph(str(r[1]) if r[1] != "" else "", S["tnum"])])
    data.append([Paragraph("<b>%s</b>" % total_label, S["tcell"]), Paragraph("<b>%d</b>" % total_n, S["tnum"]),
                 Paragraph("", S["tcell"]), Paragraph("", S["tnum"])])
    t = Table(data, colWidths=[5.0*cm, 1.7*cm, 5.0*cm, 1.7*cm], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2f4858")),
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, colors.HexColor("#2f4858")),
        ("LINEABOVE", (0, -1), (-1, -1), 0.5, colors.HexColor("#888888")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f3f5f7")]),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t

# ---------------------------------------------------------------- body parser
def parse_body(md, S, table_flowable):
    flow = []
    lines = md.split("\n")
    i = 0
    para = []
    bullets = []

    def flush_para():
        nonlocal para
        if para:
            flow.append(Paragraph(inline(" ".join(para).strip()), S["body"]))
            para = []

    def flush_bullets():
        nonlocal bullets
        if bullets:
            items = [ListItem(Paragraph(inline(b), S["bullet"]), leftIndent=14, value=None)
                     for b in bullets]
            flow.append(ListFlowable(items, bulletType="bullet", start="•",
                                     bulletFontName="Times-Roman", bulletFontSize=10,
                                     leftIndent=12, spaceAfter=4))
            bullets = []

    while i < len(lines):
        ln = lines[i].rstrip()
        s = ln.strip()
        if s == "[[TABLE]]":
            flush_para(); flush_bullets()
            flow.append(table_flowable)
            i += 1; continue
        if s == "":
            flush_para(); flush_bullets()
            i += 1; continue
        if s.startswith("### "):
            flush_para(); flush_bullets()
            flow.append(Paragraph(inline(s[4:]), S["h3"]))
            i += 1; continue
        if s.startswith("## "):
            flush_para(); flush_bullets()
            flow.append(Paragraph(inline(s[3:]), S["h2"]))
            i += 1; continue
        if s.startswith("- "):
            flush_para()
            bullets.append(s[2:])
            i += 1; continue
        flush_bullets()
        para.append(s)
        i += 1
    flush_para(); flush_bullets()
    return flow

# ---------------------------------------------------------------- doc build
def build(path, meta, body_md, refs, table_data):
    S = styles()
    story = []
    story.append(Paragraph(meta["title"], S["title"]))
    story.append(Paragraph(meta["type"], S["type"]))
    story.append(Paragraph(meta["author"], S["author"]))
    for a in meta["affil"]:
        story.append(Paragraph(a, S["affil"]))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#999999")))
    story.append(Paragraph(meta["abs_label"], S["abshead"]))
    story.append(Paragraph(inline(meta["abstract"]), S["abstract"]))
    story.append(Paragraph(inline(meta["kw"]), S["keywords"]))
    story.append(Paragraph(inline(meta["jel"]), S["keywords"]))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#999999")))
    story.append(Spacer(1, 6))

    tbl = category_table(S, table_data["rows"], table_data["headers"],
                         table_data["total_label"], table_data["total_n"])
    table_block = KeepTogether([
        tbl,
        Paragraph(table_data["caption"], S["tablecap"]),
    ])
    story += parse_body(body_md, S, table_block)

    # references
    story.append(Paragraph(meta["ref_label"], S["h2"]))
    for r in refs:
        story.append(Paragraph(inline(r), S["ref"]))

    # suggested citation
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#bbbbbb")))
    story.append(Paragraph(meta["cite_label"], S["abshead"]))
    story.append(Paragraph(inline(meta["cite_text"]), S["cite"]))

    doc = BaseDocTemplate(path, pagesize=A4,
                          leftMargin=2.4*cm, rightMargin=2.4*cm,
                          topMargin=2.0*cm, bottomMargin=1.9*cm,
                          title=meta["pdf_title"], author="Martin Rodriguez")
    frame = Frame(doc.leftMargin, doc.bottomMargin,
                  doc.width, doc.height, id="main")

    foot = meta["footer"]

    def on_page(canvas, d):
        canvas.saveState()
        canvas.setFont("Times-Italic", 8)
        canvas.setFillColor(colors.HexColor("#666666"))
        canvas.drawString(d.leftMargin, 1.15*cm, foot)
        canvas.drawRightString(d.leftMargin + d.width, 1.15*cm, "%d" % d.page)
        canvas.restoreState()

    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=on_page)])
    doc.build(story)
    print("wrote", path)

# ================================================================ REFERENCES (shared)
REFS = [
    "Atkinson, A., & Messy, F.-A. (2012). Measuring Financial Literacy: Results of the OECD/INFE Pilot Study. *OECD Working Papers on Finance, Insurance and Private Pensions*, No. 15. OECD Publishing. https://doi.org/10.1787/5k9csfs90fr4-en",
    "Banco Central de la República Argentina (BCRA). (2024-2026). *Índice para Contratos de Locación (ICL)* [serie estadística]. https://www.bcra.gob.ar",
    "Cavallo, A. (2013). Online and official price indexes: Measuring Argentina's inflation. *Journal of Monetary Economics*, 60(2), 152-165. https://doi.org/10.1016/j.jmoneco.2012.10.002",
    "Cavallo, A., & Rigobon, R. (2016). The Billion Prices Project: Using Online Prices for Measurement and Research. *Journal of Economic Perspectives*, 30(2), 151-178. https://doi.org/10.1257/jep.30.2.151",
    "Drexler, A., Fischer, G., & Schoar, A. (2014). Keeping It Simple: Financial Literacy and Rules of Thumb. *American Economic Journal: Applied Economics*, 6(2), 1-31. https://doi.org/10.1257/app.6.2.1",
    "Hastings, J. S., Madrian, B. C., & Skimmyhorn, W. L. (2013). Financial Literacy, Financial Education, and Economic Outcomes. *Annual Review of Economics*, 5, 347-373. https://doi.org/10.1146/annurev-economics-082312-125807",
    "Instituto Nacional de Estadística y Censos (INDEC). (2024-2026). *Índice de Precios al Consumidor (IPC)* [serie estadística]. https://www.indec.gob.ar",
    "Kaiser, T., Lusardi, A., Menkhoff, L., & Urban, C. (2022). Financial education affects financial knowledge and downstream behaviors. *Journal of Financial Economics*, 145(2), 255-272. https://doi.org/10.1016/j.jfineco.2021.09.022",
    "Klapper, L., Lusardi, A., & van Oudheusden, P. (2015). *Financial Literacy Around the World: Insights from the Standard & Poor's Ratings Services Global Financial Literacy Survey*. World Bank / Global Financial Literacy Excellence Center.",
    "Lusardi, A. (2019). Financial literacy and the need for financial education: evidence and implications. *Swiss Journal of Economics and Statistics*, 155, 1. https://doi.org/10.1186/s41937-019-0027-5",
    "Lusardi, A., & Mitchell, O. S. (2014). The Economic Importance of Financial Literacy: Theory and Evidence. *Journal of Economic Literature*, 52(1), 5-44. https://doi.org/10.1257/jel.52.1.5",
    "OECD. (2020). *OECD/INFE 2020 International Survey of Adult Financial Literacy*. OECD Publishing, Paris.",
    "Rodríguez, M. (2024-2026). *hacecuentas.com: calculadoras computacionales de acceso abierto para decisiones financieras cotidianas* [plataforma web]. https://hacecuentas.com",
]

CATS_EN = [
    ("Finance", 462), ("Everyday life", 324), ("Health", 310), ("Sports", 209),
    ("Mathematics", 157), ("Education", 128), ("Cooking", 123), ("Technology", 122),
    ("Business", 122), ("Pets", 120), ("Travel", 119), ("Construction", 108),
    ("Marketing", 82), ("Science", 82), ("Family", 76), ("Entertainment", 62),
    ("Automotive", 59), ("Electronics", 40), ("Gardening", 39), ("Languages", 33),
    ("Environment", 30), ("Taxes", 18), ("Home", 9), ("Weather", 5),
    ("Games", 4), ("Astronomy", 4),
]
CATS_ES = [
    ("Finanzas", 462), ("Vida cotidiana", 324), ("Salud", 310), ("Deportes", 209),
    ("Matemática", 157), ("Educación", 128), ("Cocina", 123), ("Tecnología", 122),
    ("Negocios", 122), ("Mascotas", 120), ("Viajes", 119), ("Construcción", 108),
    ("Marketing", 82), ("Ciencia", 82), ("Familia", 76), ("Entretenimiento", 62),
    ("Automotor", 59), ("Electrónica", 40), ("Jardinería", 39), ("Idiomas", 33),
    ("Medio ambiente", 30), ("Impuestos", 18), ("Hogar", 9), ("Clima", 5),
    ("Juegos", 4), ("Astronomía", 4),
]

# ================================================================ ENGLISH PAPER
EN_META = {
    "title": "Open Computational Tools for Financial Literacy in High-Inflation Economies: The Case of hacecuentas.com",
    "type": "Working Paper · June 2026",
    "author": "Martín Rodríguez",
    "affil": [
        "Independent researcher · Founder and maintainer, hacecuentas.com",
        "Buenos Aires, Argentina · rodriguezb.martin@gmail.com",
    ],
    "abs_label": "Abstract",
    "abstract": ("Financial literacy is low worldwide, and the cost of poor financial decisions is amplified in "
        "high-inflation economies, where nominal values lose meaning within months and where indexation rules, "
        "tax brackets and wage floors are revised continually. This paper is a descriptive case study of "
        "hacecuentas.com, a free, open-access platform of 4,124 computational calculators (Spanish, English and "
        "Portuguese; localized for Argentina, Spain, Mexico, Chile and Colombia, spanning 7,314 indexable pages), "
        "whose largest single domain is personal finance and taxation. We describe (i) the corpus and its category "
        "distribution; (ii) a data-freshness architecture that keeps high-stakes (“Your-Money-or-Your-Life”, YMYL) "
        "calculators aligned with official sources — the central-bank rent index, the tax authority's "
        "simplified-regime brackets, and statutory wage and social-security parameters; and (iii) interface choices "
        "that lower the cognitive cost of financial computation. We argue that maintained, source-anchored web "
        "calculators are an under-studied complement to formal financial education, especially where macroeconomic "
        "volatility renders static teaching material obsolete within a quarter. In such settings the binding "
        "constraint on usefulness is not building the tool but keeping it correct. We close with the platform's "
        "limitations and an agenda for measuring learning and decision outcomes."),
    "kw": "**Keywords:** financial literacy; financial education; inflation; indexation; Argentina; web-based tools; open educational resources; YMYL; just-in-time learning.",
    "jel": "**JEL classification:** D14 (Household Saving; Personal Finance); G53 (Financial Literacy); I22 (Educational Finance); E31 (Price Level; Inflation).",
    "ref_label": "References",
    "cite_label": "Suggested citation",
    "cite_text": "Rodríguez, M. (2026). Open Computational Tools for Financial Literacy in High-Inflation Economies: The Case of hacecuentas.com. Working paper. Available at https://hacecuentas.com",
    "pdf_title": "Open Computational Tools for Financial Literacy in High-Inflation Economies",
    "footer": "Rodríguez (2026) · Computational tools for financial literacy · hacecuentas.com",
}

EN_BODY = r"""
## 1. Introduction

Financial decisions rest on arithmetic that many adults find difficult to perform reliably: how much to set aside each month, whether a loan instalment is affordable once inflation is accounted for, how this year's salary compares with last year's in real terms, or which simplified-tax bracket a freelancer now falls into. Three decades of survey evidence show that financial literacy is low across both developing and advanced economies, and that the gap correlates with worse borrowing, saving and retirement-planning outcomes (Lusardi & Mitchell, 2014; Klapper, Lusardi & van Oudheusden, 2015; Hastings, Madrian & Skimmyhorn, 2013). The problem is not purely conceptual. Even individuals who grasp a principle often fail at the second step: executing the computation that would apply it to their own numbers.

This paper examines one practical and surprisingly under-studied response to that *execution* gap: free, open-access web **calculators**. We present a descriptive case study of hacecuentas.com, a Spanish-first platform launched in 2024 that now hosts 4,124 calculator definitions across personal finance, taxation, health, education, cooking, construction and twenty other domains. Rather than teaching a concept in the abstract, each tool lets a user enter their own figures and obtain a deterministic, explained result at the moment of decision.

The Argentine setting makes the case unusually sharp. Under chronic high inflation, nominal figures decay quickly, indexation regimes proliferate (rents indexed to a central-bank series; deposits and loans denominated in inflation-linked units), and official parameters — tax brackets, social-security floors, statutory wage adjustments — are revised monthly or quarterly. A calculator that was exactly correct last quarter can silently mislead this one. We therefore give particular attention to the **maintenance** problem: how a corpus of thousands of money-related tools is kept aligned with authoritative sources. Our central claim is that in a volatile macroeconomic environment the binding constraint on a financial tool's usefulness and trustworthiness is not its initial construction but its continued correctness over time.

The paper makes four contributions. First, it provides a transparent, quantitative description of a large open calculator corpus and its category distribution (Section 3). Second, and most importantly, it documents a **data-freshness architecture** for high-stakes calculators — single-source-of-truth parameter modules, automated drift and staleness detection, and source-anchored computation — that we offer as a reusable pattern for any maintainer of YMYL tools (Section 4). Third, it frames calculators as *executable rules of thumb*, connecting them to evidence that simple, actionable heuristics outperform comprehensive instruction (Sections 2.3 and 6.1). Fourth, it sets out an agenda for measuring whether such tools actually improve knowledge and decisions (Section 7). We are explicit about scope: this is a descriptive and design paper, not a causal impact evaluation, and Section 6.3 treats that limitation directly.

## 2. Background

### 2.1 The financial-literacy gap

Large cross-country surveys converge on a stark figure: only about one in three adults worldwide can answer a small set of questions on interest compounding, inflation and risk diversification (Klapper et al., 2015). Latin America scores below that global average, and Argentina sits within the lower band of the region. Financial literacy is not a cosmetic competence: it predicts retirement planning, wealth accumulation, debt management and the avoidance of high-cost borrowing (Lusardi & Mitchell, 2014; Lusardi, 2019).

The natural policy response is financial education, and a recent meta-analysis of 76 randomized experiments finds that it does work — financial education has economically meaningful, statistically significant effects on both financial knowledge and downstream behaviors (Kaiser, Lusardi, Menkhoff & Urban, 2022). But the same literature reports two practical caveats: effects decay as the time between instruction and decision grows, and intensive curricula are costly to deliver at scale. Both caveats point toward lightweight, *just-in-time* interventions that meet the user at the moment a calculation is actually needed.

### 2.2 Why high inflation raises the stakes

Argentina is among the world's most persistently inflationary economies, and the reliability of its price statistics has itself been a subject of formal study (Cavallo, 2013; Cavallo & Rigobon, 2016). High inflation degrades financial decision-making through at least three channels. First, *money illusion*: people reason in nominal terms and systematically misjudge real changes in wages, prices and debts. Second, *indexation complexity*: contracts are increasingly written against indices rather than fixed amounts — residential rents tied to a published central-bank locative-contract index, and savings and loans denominated in inflation-linked units — so that even reading one's own contract requires a computation. Third, *parameter churn*: the thresholds that determine taxes, benefits and statutory bonuses are updated several times a year, so the knowledge needed to act correctly has a short half-life.

The combined effect is that static educational material — a printed worksheet, a fixed table of brackets, a blog post with last year's numbers — becomes not merely outdated but actively misleading within a quarter. This is the environment in which a maintained, source-anchored calculator has the most to offer.

### 2.3 Calculators as a complement to education

A calculator is not a substitute for understanding, but it is an efficient complement to it. The clearest empirical support comes from Drexler, Fischer and Schoar (2014), who show in a randomized trial with microentrepreneurs that **rule-of-thumb** training — simple, actionable heuristics — improved financial practices more than a conventional, comprehensive accounting course. A well-designed calculator operationalizes exactly this insight: it encodes the correct rule once, hides the bookkeeping, and delivers the answer in the user's own terms precisely when a decision is on the table. Framed as open educational resources, such tools are free to use, require no account, and — when built on a static, edge-served architecture — load on low-end devices and weak connections, which matters for equity (Section 6.2).

## 3. The platform: corpus and architecture

### 3.1 Overview and scale

hacecuentas.com is a free, advertising-light web platform launched in 2024 and operated from Buenos Aires. As of June 2026 it comprises **4,124 calculator definitions**: 2,847 in the primary Argentine-Spanish corpus, 686 in English, 219 in Portuguese, 87 in locale-neutral Spanish, and country-localized variants for Chile (99), Colombia (101) and Mexico (85). Together these resolve to **7,314 indexable pages**.

Architecturally, each calculator is the pairing of two artifacts: a **structured content record** (a JSON document holding the prompt, the input fields and their units, a plain-language explanation, a frequently-asked-questions block of at least seven entries, and a list of authoritative sources) and a **formula module** (a TypeScript function that computes the result deterministically, with no server round-trip and no opaque model). The site is rendered as static pages and served from an edge content-delivery network, so computation happens on the user's device and pages remain fast and cheap to serve at scale.

### 3.2 Category distribution

The corpus is general-purpose, but personal finance is its centre of gravity. Table 1 reports the full category distribution of the primary Argentine-Spanish corpus.

[[TABLE]]

Finance is the single largest category (462 calculators, 16% of the primary corpus); together with the closely related Business (122) and Taxes (18) categories it forms a finance-and-economics cluster of just over 600 tools. This understates the true financial footprint, because many calculators classified under Everyday life, Family, Automotive or Construction also have a monetary dimension (loan instalments, the real cost of a purchase in instalments versus cash, severance estimates, materials budgeting). The financial subset includes, among others, tools for statutory year-end bonus (aguinaldo / SAC), rent indexation against the central-bank index, simplified-tax (monotributo) categorization and recategorization, real-wage adjustment for inflation, compound interest, and the yield of inflation-linked fixed-term deposits.

### 3.3 Localization, not translation

The platform is trilingual, but its financial tools are *localized*, not merely translated, because financial rules are national. A “rent-increase calculator” is not one tool in three languages; it is several distinct tools, because Argentina indexes residential rents against one published series while other jurisdictions use entirely different mechanisms. Likewise the simplified-tax tools encode Argentina's monotributo regime specifically, and the Chilean and Colombian variants incorporate their own indexation units and reference rates. Localization is therefore a substantive modelling task, not a linguistic one — and it multiplies the maintenance burden discussed next.

## 4. Keeping numbers honest: a data-freshness architecture

This section presents what we regard as the paper's main transferable contribution. The challenge it addresses is generic to any maintainer of high-stakes calculators; the solution is a small set of engineering patterns that any such maintainer can adopt.

### 4.1 The YMYL freshness problem

Search-quality and consumer-protection discourse uses the label *Your-Money-or-Your-Life* (YMYL) for content that can materially affect a person's finances, health or safety. Financial calculators are squarely YMYL: a stale tax threshold or an out-of-date index can produce a confidently-wrong number that a user acts on. Under high inflation the danger is acute, because the *half-life of correctness* is short — a parameter that was right in March may be wrong in July. Trust, once lost to a visibly wrong result, is hard to regain. The design goal is therefore not only to be correct at launch but to *fail safe* as the world moves.

### 4.2 Single source of truth for parameters

The first pattern is to separate volatile parameters from formulas. Domain parameters that change on an official schedule — for example, the full table of monotributo brackets and their ceilings for a given year — are held once in a dedicated data module rather than copied into each calculator that needs them. Every dependent tool imports the same canonical table, so there is no possibility of divergence between two calculators that ought to agree, and a single edit propagates everywhere at once. This converts a fan-out maintenance problem (“update forty tools”) into a point edit (“update one table”).

### 4.3 Automated validation and drift detection

The second pattern is to make staleness and implausibility *visible automatically* rather than relying on manual vigilance across thousands of files. The platform runs three validation passes as part of its build pipeline. A **freshness check** flags any data-driven parameter whose last-verified date exceeds a configured threshold, so that silent decay surfaces as a build warning rather than a user-facing error. A **sanity check** enforces plausibility bounds and detects suspicious drift — a value that has moved more than expected, or that disagrees with a second reference — catching both fat-finger edits and upstream data problems. An **update-validation** pass checks proposed parameter changes before they are merged. Crucially, the platform distinguishes the date a figure *refers to* from the date it was *last verified*, so that a recently-touched file is not mistaken for a recently-checked one.

### 4.4 Source-anchored computation: worked examples

The third pattern is to anchor each high-stakes tool to a named official source and, where possible, to refresh it programmatically.

- **Rent indexation.** Argentina's residential-rent index is published by the central bank. The platform fetches the series through a dedicated updater so that the rent-increase calculator computes the contractual adjustment from the current official index rather than a hand-copied number.
- **Simplified-tax (monotributo) categorization.** The full bracket table for the year lives in a single parameter module sourced from the tax authority; the categorization and recategorization tools read from it, so a mid-year update to the ceilings is reflected everywhere at once.
- **Statutory year-end bonus (aguinaldo / SAC).** The tool encodes the statutory formula — half of the highest monthly salary in the semester, prorated by months worked — a rule that is stable in form even as wages change, illustrating that not every parameter is volatile and that the architecture must tell the two kinds apart.
- **Real-wage adjustment.** Nominal salaries are deflated using the official consumer-price index, letting a user see whether a raise kept pace with inflation in real terms.

Each tool displays its formula and cites its source, so the computation is auditable rather than a black box — a property we return to in Section 5.

## 5. Design for low cognitive cost

If the goal is to reduce the *execution* cost of a financial decision, the interface must add as little extraneous load as possible. Several design choices follow from this. Each tool asks for the minimum necessary inputs and requires an explicit “Calculate” action, so that a result is never produced before the user has finished entering their situation. Inputs use plain language and sensible defaults; large monetary figures are grouped with thousands separators to reduce transcription error. The result is accompanied by the formula used and the source of any official parameter, which serves both transparency and education: a user who wants only the number gets it, while a user who wants to understand can see the working. Every tool carries a frequently-asked-questions block of at least seven entries addressing the common edge cases, and many present the result graphically. Because the pages are static and edge-served, they remain usable on low-end phones and constrained connections. None of these choices is individually novel; their combination operationalizes the principle that a calculator should lower, not raise, the cognitive cost of acting correctly.

## 6. Discussion

### 6.1 Calculators as executable rules of thumb

Section 2.3 cited evidence that simple heuristics can beat comprehensive instruction (Drexler et al., 2014). A maintained calculator is, in effect, a rule of thumb made *executable and auditable*: the correct rule is encoded once by a maintainer who can afford to get it exactly right, and is then delivered to many users at the moment of need without requiring each of them to internalize it first. This division of labour — expertise embedded in the tool, judgement retained by the user — is precisely what just-in-time financial support should look like, and it is complementary to, not a replacement for, formal education.

### 6.2 Equity and access

Free, account-less, low-bandwidth tools have a distributional argument in their favour. The populations most exposed to the costs of financial mistakes — lower-income households, the underbanked, informal and self-employed workers navigating the simplified-tax regime — are also those least able to pay for advice. A tool that runs on a cheap phone over a weak connection, in the user's own language and localized to their own country's rules, lowers the barrier to a correct calculation precisely where that barrier bites hardest.

### 6.3 Limitations

Several limitations bound the claims of this paper. First and most important, we present **no causal evidence** that the platform improves financial knowledge or decisions; establishing that requires the experiments outlined in Section 7, and the present paper is descriptive. Second, the corpus metrics are self-reported by its operator and the quality of 4,124 tools is necessarily heterogeneous; the freshness architecture mitigates but does not eliminate the risk of a stale or mis-specified tool. Third, correctness depends on the availability and accuracy of upstream official sources, which the platform does not control. Fourth, there is a **selection effect**: users who actively seek a calculator are already motivated, so any observed association with better outcomes need not generalize to the broader population that financial education aims to reach. Fifth, the author is the platform's founder and maintainer, a positionality stated plainly below.

## 7. Conclusion and research agenda

We have described a large, free, multilingual corpus of computational calculators and argued that, in a high-inflation economy, the decisive feature of such tools is not their initial construction but the architecture that keeps them correct as official parameters churn. The single-source-of-truth, automated-validation and source-anchoring patterns documented here are offered as a reusable template for any maintainer of high-stakes calculators.

The clear next step is evaluation. A credible agenda would (i) field randomized or quasi-experimental tests of whether using a specific calculator improves the accuracy of users' subsequent financial judgements; (ii) measure decision quality, not just self-reported confidence; (iii) track knowledge retention after tool use, to see whether executable rules of thumb leave any durable understanding behind; (iv) publish an open dataset of the official parameters and their revision history, which has research value independent of the tools; and (v) define and report an explicit freshness service-level objective, turning “kept current” from a claim into a measurable property. We invite collaboration from researchers in financial education, development economics and human-computer interaction on each of these fronts.

## Data and code availability

The platform is publicly accessible at https://hacecuentas.com. Category hubs (for example, https://hacecuentas.com/categoria/finanzas) and individual tools — such as the rent-indexation, simplified-tax-categorization and statutory-bonus calculators — are openly usable without registration. Aggregate corpus statistics reported here were computed directly from the platform's content repository in June 2026. The author welcomes inquiries from researchers wishing to access parameter histories or corpus metadata for replication.

## Conflict of interest and positionality

The author is the founder and maintainer of hacecuentas.com, which is a commercially-operated website funded primarily through organic search traffic. The platform carried no active monetization at the time of writing. This paper received no external funding. The author's dual role as operator and analyst is the reason the paper is framed as a descriptive and design contribution rather than an impact evaluation, and is the motivation for the independent-evaluation agenda in Section 7.
"""

# ================================================================ SPANISH PAPER
ES_META = {
    "title": "Herramientas computacionales abiertas para la alfabetización financiera en economías de alta inflación: el caso de hacecuentas.com",
    "type": "Documento de trabajo · Junio de 2026",
    "author": "Martín Rodríguez",
    "affil": [
        "Investigador independiente · Fundador y responsable de hacecuentas.com",
        "Buenos Aires, Argentina · rodriguezb.martin@gmail.com",
    ],
    "abs_label": "Resumen",
    "abstract": ("La alfabetización financiera es baja en todo el mundo, y el costo de las malas decisiones "
        "financieras se amplifica en las economías de alta inflación, donde los valores nominales pierden "
        "sentido en pocos meses y donde las reglas de indexación, los tramos impositivos y los pisos salariales "
        "se actualizan de forma continua. Este trabajo es un estudio de caso descriptivo de hacecuentas.com, una "
        "plataforma gratuita y de acceso abierto con 4.124 calculadoras computacionales (en español, inglés y "
        "portugués; localizadas para Argentina, España, México, Chile y Colombia, sobre 7.314 páginas "
        "indexables), cuyo dominio individual más extenso son las finanzas personales y los impuestos. Describimos "
        "(i) el corpus y su distribución por categorías; (ii) una arquitectura de frescura de datos que mantiene "
        "alineadas con las fuentes oficiales a las calculadoras de alto riesgo (“Your-Money-or-Your-Life”, YMYL) "
        "— el índice de alquileres del banco central, los tramos del régimen simplificado de la autoridad "
        "tributaria y los parámetros salariales y previsionales legales; y (iii) decisiones de interfaz que reducen "
        "el costo cognitivo del cálculo financiero. Sostenemos que las calculadoras web mantenidas y ancladas a "
        "fuentes oficiales son un complemento poco estudiado de la educación financiera formal, sobre todo donde "
        "la volatilidad macroeconómica vuelve obsoleto el material didáctico estático en un trimestre. En esos "
        "contextos, la restricción crítica no es construir la herramienta sino mantenerla correcta. Cerramos con "
        "las limitaciones de la plataforma y una agenda para medir resultados de aprendizaje y de decisión."),
    "kw": "**Palabras clave:** alfabetización financiera; educación financiera; inflación; indexación; Argentina; herramientas web; recursos educativos abiertos; YMYL; aprendizaje just-in-time.",
    "jel": "**Clasificación JEL:** D14 (Ahorro de los hogares; finanzas personales); G53 (Alfabetización financiera); I22 (Financiamiento educativo); E31 (Nivel de precios; inflación).",
    "ref_label": "Referencias",
    "cite_label": "Cita sugerida",
    "cite_text": "Rodríguez, M. (2026). Herramientas computacionales abiertas para la alfabetización financiera en economías de alta inflación: el caso de hacecuentas.com. Documento de trabajo. Disponible en https://hacecuentas.com",
    "pdf_title": "Herramientas computacionales para la alfabetizacion financiera en economias de alta inflacion",
    "footer": "Rodríguez (2026) · Herramientas computacionales para la alfabetización financiera · hacecuentas.com",
}

ES_BODY = r"""
## 1. Introducción

Las decisiones financieras descansan sobre una aritmética que a muchos adultos les cuesta resolver con confianza: cuánto reservar cada mes, si la cuota de un préstamo es asumible una vez contemplada la inflación, cómo se compara el sueldo de este año con el del año pasado en términos reales, o en qué tramo del régimen simplificado queda ahora un trabajador independiente. Tres décadas de evidencia de encuestas muestran que la alfabetización financiera es baja tanto en economías en desarrollo como avanzadas, y que esa brecha se correlaciona con peores resultados en endeudamiento, ahorro y planificación de la jubilación (Lusardi & Mitchell, 2014; Klapper, Lusardi & van Oudheusden, 2015; Hastings, Madrian & Skimmyhorn, 2013). El problema no es solo conceptual. Incluso quienes comprenden un principio fallan a menudo en el segundo paso: ejecutar el cálculo que lo aplicaría a sus propios números.

Este trabajo examina una respuesta práctica y sorprendentemente poco estudiada a esa brecha de **ejecución**: las **calculadoras** web gratuitas y de acceso abierto. Presentamos un estudio de caso descriptivo de hacecuentas.com, una plataforma en español lanzada en 2024 que hoy aloja 4.124 calculadoras en finanzas personales, impuestos, salud, educación, cocina, construcción y otros veinte dominios. En lugar de enseñar un concepto en abstracto, cada herramienta permite al usuario ingresar sus propias cifras y obtener un resultado determinista y explicado en el momento de la decisión.

El contexto argentino vuelve el caso particularmente nítido. Bajo inflación alta y crónica, las cifras nominales se deterioran rápido, proliferan los regímenes de indexación (alquileres atados a una serie del banco central; depósitos y préstamos denominados en unidades ajustadas por inflación) y los parámetros oficiales — tramos impositivos, pisos previsionales, ajustes salariales legales — se revisan cada mes o cada trimestre. Una calculadora que era exacta el trimestre pasado puede inducir a error, en silencio, este trimestre. Por eso prestamos especial atención al problema del **mantenimiento**: cómo se mantiene alineado con las fuentes oficiales un corpus de miles de herramientas vinculadas al dinero. Nuestra tesis central es que, en un entorno macroeconómico volátil, la restricción crítica sobre la utilidad y la confiabilidad de una herramienta financiera no es su construcción inicial sino su corrección sostenida en el tiempo.

El trabajo realiza cuatro aportes. Primero, ofrece una descripción transparente y cuantitativa de un gran corpus abierto de calculadoras y de su distribución por categorías (Sección 3). Segundo, y de mayor importancia, documenta una **arquitectura de frescura de datos** para calculadoras de alto riesgo — módulos de parámetros de fuente única, detección automática de obsolescencia y de desvío, y cálculo anclado a fuentes — que proponemos como patrón reutilizable para cualquier responsable de herramientas YMYL (Sección 4). Tercero, enmarca las calculadoras como *reglas prácticas ejecutables*, conectándolas con la evidencia de que las heurísticas simples y accionables superan a la instrucción exhaustiva (Secciones 2.3 y 6.1). Cuarto, plantea una agenda para medir si estas herramientas efectivamente mejoran el conocimiento y las decisiones (Sección 7). Somos explícitos sobre el alcance: este es un trabajo descriptivo y de diseño, no una evaluación causal de impacto, y la Sección 6.3 aborda esa limitación de frente.

## 2. Antecedentes

### 2.1 La brecha de alfabetización financiera

Las grandes encuestas comparadas convergen en una cifra contundente: solo alrededor de uno de cada tres adultos en el mundo responde correctamente un conjunto reducido de preguntas sobre interés compuesto, inflación y diversificación del riesgo (Klapper et al., 2015). América Latina puntúa por debajo de ese promedio global, y Argentina se ubica en la banda inferior de la región. La alfabetización financiera no es una competencia cosmética: predice la planificación para el retiro, la acumulación de riqueza, la gestión de la deuda y la evitación de crédito de alto costo (Lusardi & Mitchell, 2014; Lusardi, 2019).

La respuesta natural de política pública es la educación financiera, y un metaanálisis reciente de 76 experimentos aleatorizados confirma que funciona: la educación financiera tiene efectos económicamente significativos y estadísticamente robustos tanto sobre el conocimiento como sobre los comportamientos posteriores (Kaiser, Lusardi, Menkhoff & Urban, 2022). Pero la misma literatura señala dos salvedades prácticas: los efectos se atenúan a medida que crece el tiempo entre la instrucción y la decisión, y los programas intensivos son costosos de escalar. Ambas apuntan hacia intervenciones livianas y *just-in-time* que encuentren al usuario en el momento en que el cálculo realmente se necesita.

### 2.2 Por qué la alta inflación eleva lo que está en juego

Argentina figura entre las economías más persistentemente inflacionarias del mundo, y la confiabilidad de sus estadísticas de precios ha sido objeto de estudio formal (Cavallo, 2013; Cavallo & Rigobon, 2016). La alta inflación deteriora la toma de decisiones por al menos tres vías. Primero, la *ilusión monetaria*: la gente razona en términos nominales y juzga mal los cambios reales en sueldos, precios y deudas. Segundo, la *complejidad de la indexación*: cada vez más contratos se escriben contra índices en lugar de montos fijos — alquileres atados a un índice de contratos de locación publicado por el banco central, y ahorros y préstamos denominados en unidades ajustadas por inflación — de modo que hasta leer el propio contrato exige un cálculo. Tercero, la *rotación de parámetros*: los umbrales que determinan impuestos, beneficios y aguinaldos se actualizan varias veces al año, por lo que el conocimiento necesario para actuar correctamente tiene una vida media corta.

El efecto combinado es que el material didáctico estático — una planilla impresa, una tabla fija de tramos, un artículo con los números del año pasado — no solo queda desactualizado sino que induce activamente a error en un trimestre. Es en este entorno donde una calculadora mantenida y anclada a fuentes oficiales tiene más para ofrecer.

### 2.3 Las calculadoras como complemento de la educación

Una calculadora no sustituye a la comprensión, pero la complementa de manera eficiente. El respaldo empírico más claro proviene de Drexler, Fischer y Schoar (2014), que muestran en un ensayo aleatorizado con microemprendedores que la capacitación basada en **reglas prácticas** — heurísticas simples y accionables — mejoró las prácticas financieras más que un curso de contabilidad convencional y exhaustivo. Una calculadora bien diseñada operacionaliza exactamente esa idea: codifica la regla correcta una sola vez, oculta la teneduría de libros y entrega la respuesta en los términos del propio usuario justo cuando hay una decisión sobre la mesa. Entendidas como recursos educativos abiertos, estas herramientas son gratuitas, no requieren cuenta y — cuando se construyen sobre una arquitectura estática servida desde el borde — cargan en dispositivos modestos y conexiones débiles, lo que importa para la equidad (Sección 6.2).

## 3. La plataforma: corpus y arquitectura

### 3.1 Panorama y escala

hacecuentas.com es una plataforma web gratuita y con publicidad mínima, lanzada en 2024 y operada desde Buenos Aires. A junio de 2026 comprende **4.124 calculadoras**: 2.847 en el corpus primario en español rioplatense, 686 en inglés, 219 en portugués, 87 en español neutro y variantes localizadas para Chile (99), Colombia (101) y México (85). En conjunto resuelven **7.314 páginas indexables**.

En términos de arquitectura, cada calculadora es la combinación de dos artefactos: un **registro de contenido estructurado** (un documento JSON con la consigna, los campos de entrada y sus unidades, una explicación en lenguaje llano, un bloque de preguntas frecuentes de al menos siete entradas y una lista de fuentes oficiales) y un **módulo de fórmula** (una función en TypeScript que computa el resultado de forma determinista, sin viaje al servidor y sin modelo opaco). El sitio se renderiza como páginas estáticas servidas desde una red de distribución de contenidos en el borde, de modo que el cálculo ocurre en el dispositivo del usuario y las páginas se mantienen rápidas y baratas de servir a escala.

### 3.2 Distribución por categorías

El corpus es de propósito general, pero su centro de gravedad son las finanzas personales. La Tabla 1 reporta la distribución completa por categorías del corpus primario en español.

[[TABLE]]

Finanzas es la categoría individual más extensa (462 calculadoras, el 16% del corpus primario); junto con las categorías estrechamente vinculadas de Negocios (122) e Impuestos (18) conforma un núcleo de finanzas y economía de algo más de 600 herramientas. Esto subestima la verdadera huella financiera, porque muchas calculadoras clasificadas bajo Vida cotidiana, Familia, Automotor o Construcción también tienen una dimensión monetaria (cuotas de préstamos, el costo real de una compra en cuotas frente al pago de contado, estimaciones de indemnización, presupuesto de materiales). El subconjunto financiero incluye, entre otras, herramientas para el aguinaldo (SAC), la actualización de alquileres contra el índice del banco central, la categorización y recategorización del monotributo, el ajuste del salario real por inflación, el interés compuesto y el rendimiento de los plazos fijos ajustados por inflación.

### 3.3 Localización, no traducción

La plataforma es trilingüe, pero sus herramientas financieras están *localizadas*, no meramente traducidas, porque las reglas financieras son nacionales. Una “calculadora de aumento de alquiler” no es una herramienta en tres idiomas; son varias herramientas distintas, porque Argentina indexa los alquileres residenciales contra una serie publicada mientras que otras jurisdicciones usan mecanismos por completo diferentes. Del mismo modo, las herramientas del régimen simplificado codifican específicamente el monotributo argentino, y las variantes chilena y colombiana incorporan sus propias unidades de indexación y tasas de referencia. La localización es, por lo tanto, una tarea sustantiva de modelado, no lingüística — y multiplica la carga de mantenimiento que se discute a continuación.

## 4. Mantener los números honestos: una arquitectura de frescura de datos

Esta sección presenta lo que consideramos el principal aporte transferible del trabajo. El desafío que aborda es genérico a cualquier responsable de calculadoras de alto riesgo; la solución es un pequeño conjunto de patrones de ingeniería que cualquiera de ellos puede adoptar.

### 4.1 El problema de frescura YMYL

El discurso sobre calidad de búsqueda y protección al consumidor usa la etiqueta *Your-Money-or-Your-Life* (YMYL) para el contenido que puede afectar materialmente las finanzas, la salud o la seguridad de una persona. Las calculadoras financieras son claramente YMYL: un umbral impositivo desactualizado o un índice vencido pueden producir un número confiadamente erróneo sobre el que el usuario actúe. Bajo alta inflación el peligro es agudo, porque la *vida media de la corrección* es corta — un parámetro que era correcto en marzo puede estar mal en julio. La confianza, una vez perdida ante un resultado visiblemente equivocado, es difícil de recuperar. El objetivo de diseño, entonces, no es solo ser correcto al lanzar sino *fallar de forma segura* a medida que el mundo cambia.

### 4.2 Fuente única de verdad para los parámetros

El primer patrón es separar los parámetros volátiles de las fórmulas. Los parámetros de dominio que cambian según un calendario oficial — por ejemplo, la tabla completa de tramos del monotributo y sus topes para un año dado — se guardan una sola vez en un módulo de datos dedicado, en lugar de copiarse dentro de cada calculadora que los necesita. Toda herramienta dependiente importa la misma tabla canónica, de modo que no hay posibilidad de divergencia entre dos calculadoras que deberían coincidir, y una única edición se propaga a todas a la vez. Esto convierte un problema de mantenimiento ramificado (“actualizar cuarenta herramientas”) en una edición puntual (“actualizar una tabla”).

### 4.3 Validación automática y detección de desvío

El segundo patrón es volver la obsolescencia y la inverosimilitud *visibles de forma automática*, en lugar de depender de la vigilancia manual sobre miles de archivos. La plataforma corre tres pasadas de validación como parte de su tubería de construcción. Una **verificación de frescura** marca todo parámetro dirigido por datos cuya fecha de última verificación supere un umbral configurado, de modo que el deterioro silencioso aflore como una advertencia de build y no como un error de cara al usuario. Una **verificación de plausibilidad** impone límites razonables y detecta desvíos sospechosos — un valor que se movió más de lo esperado, o que discrepa con una segunda referencia — atrapando tanto errores de tipeo como problemas en los datos de origen. Una pasada de **validación de actualizaciones** revisa los cambios de parámetros propuestos antes de incorporarlos. De manera crucial, la plataforma distingue la fecha a la que una cifra *se refiere* de la fecha en que fue *verificada por última vez*, para que un archivo tocado recientemente no se confunda con uno chequeado recientemente.

### 4.4 Cálculo anclado a fuentes: ejemplos trabajados

El tercer patrón es anclar cada herramienta de alto riesgo a una fuente oficial nombrada y, cuando es posible, refrescarla de forma programática.

- **Indexación de alquileres.** El índice argentino de alquileres residenciales lo publica el banco central. La plataforma obtiene la serie mediante un actualizador dedicado, de modo que la calculadora de aumento de alquiler computa el ajuste contractual a partir del índice oficial vigente y no de un número copiado a mano.
- **Categorización del monotributo.** La tabla completa de tramos del año vive en un único módulo de parámetros tomado de la autoridad tributaria; las herramientas de categorización y recategorización leen de ella, de modo que una actualización de los topes a mitad de año se refleja en todas a la vez.
- **Aguinaldo (SAC).** La herramienta codifica la fórmula legal — la mitad de la mejor remuneración mensual del semestre, prorrateada por los meses trabajados — una regla estable en su forma aunque los salarios cambien, lo que ilustra que no todo parámetro es volátil y que la arquitectura debe distinguir ambos tipos.
- **Ajuste del salario real.** Los salarios nominales se deflactan con el índice oficial de precios al consumidor, permitiendo al usuario ver si un aumento le ganó a la inflación en términos reales.

Cada herramienta muestra su fórmula y cita su fuente, de modo que el cálculo es auditable y no una caja negra — propiedad sobre la que volvemos en la Sección 5.

## 5. Diseño para un bajo costo cognitivo

Si el objetivo es reducir el costo de *ejecución* de una decisión financiera, la interfaz debe agregar la menor carga superflua posible. De ahí se derivan varias decisiones de diseño. Cada herramienta pide los insumos mínimos necesarios y requiere una acción explícita de “Calcular”, para que nunca se produzca un resultado antes de que el usuario termine de ingresar su situación. Los campos usan lenguaje llano y valores por defecto razonables; las cifras monetarias grandes se agrupan con separadores de miles para reducir errores de transcripción. El resultado se acompaña de la fórmula utilizada y de la fuente de cualquier parámetro oficial, lo que sirve a la vez a la transparencia y a la educación: quien solo quiere el número lo obtiene, y quien quiere entender puede ver el procedimiento. Cada herramienta lleva un bloque de preguntas frecuentes de al menos siete entradas que cubren los casos límite habituales, y muchas presentan el resultado de forma gráfica. Como las páginas son estáticas y servidas desde el borde, siguen siendo utilizables en teléfonos modestos y conexiones limitadas. Ninguna de estas decisiones es individualmente novedosa; su combinación operacionaliza el principio de que una calculadora debe reducir, y no aumentar, el costo cognitivo de actuar correctamente.

## 6. Discusión

### 6.1 Las calculadoras como reglas prácticas ejecutables

La Sección 2.3 citó evidencia de que las heurísticas simples pueden superar a la instrucción exhaustiva (Drexler et al., 2014). Una calculadora mantenida es, en efecto, una regla práctica vuelta *ejecutable y auditable*: la regla correcta la codifica una sola vez un responsable que puede darse el lujo de acertarla con exactitud, y luego se entrega a muchos usuarios en el momento de necesidad sin exigir que cada uno la internalice primero. Esta división del trabajo — pericia incorporada en la herramienta, juicio retenido por el usuario — es precisamente lo que debería ser el apoyo financiero just-in-time, y es complementaria, no sustituta, de la educación formal.

### 6.2 Equidad y acceso

Las herramientas gratuitas, sin cuenta y de bajo consumo de datos tienen un argumento distributivo a su favor. Las poblaciones más expuestas al costo de los errores financieros — hogares de menores ingresos, personas sub-bancarizadas, trabajadores informales e independientes que navegan el régimen simplificado — son también las que menos pueden pagar asesoramiento. Una herramienta que corre en un teléfono barato sobre una conexión débil, en el idioma del usuario y localizada a las reglas de su propio país, baja la barrera a un cálculo correcto justo donde esa barrera más pesa.

### 6.3 Limitaciones

Varias limitaciones acotan las afirmaciones de este trabajo. Primero, y lo más importante, no presentamos **ninguna evidencia causal** de que la plataforma mejore el conocimiento o las decisiones financieras; establecer eso requiere los experimentos esbozados en la Sección 7, y el presente trabajo es descriptivo. Segundo, las métricas del corpus las reporta su operador y la calidad de 4.124 herramientas es necesariamente heterogénea; la arquitectura de frescura mitiga, pero no elimina, el riesgo de una herramienta desactualizada o mal especificada. Tercero, la corrección depende de la disponibilidad y exactitud de las fuentes oficiales de origen, que la plataforma no controla. Cuarto, hay un **efecto de selección**: los usuarios que buscan activamente una calculadora ya están motivados, de modo que cualquier asociación observada con mejores resultados no necesariamente se generaliza a la población más amplia a la que apunta la educación financiera. Quinto, el autor es el fundador y responsable de la plataforma, una posición que se declara con claridad más abajo.

## 7. Conclusión y agenda de investigación

Hemos descrito un corpus amplio, gratuito y multilingüe de calculadoras computacionales y sostenido que, en una economía de alta inflación, el rasgo decisivo de estas herramientas no es su construcción inicial sino la arquitectura que las mantiene correctas mientras los parámetros oficiales rotan. Los patrones de fuente única de verdad, validación automática y anclaje a fuentes aquí documentados se ofrecen como plantilla reutilizable para cualquier responsable de calculadoras de alto riesgo.

El paso siguiente claro es la evaluación. Una agenda creíble debería (i) realizar pruebas aleatorizadas o cuasi-experimentales sobre si usar una calculadora específica mejora la exactitud de los juicios financieros posteriores del usuario; (ii) medir la calidad de las decisiones, no solo la confianza autorreportada; (iii) rastrear la retención del conocimiento tras el uso, para ver si las reglas prácticas ejecutables dejan algún entendimiento durable; (iv) publicar un conjunto de datos abierto con los parámetros oficiales y su historial de revisiones, de valor para la investigación con independencia de las herramientas; y (v) definir y reportar un objetivo de nivel de servicio de frescura explícito, convirtiendo “mantenido al día” de una afirmación en una propiedad medible. Invitamos a la colaboración de investigadores en educación financiera, economía del desarrollo e interacción persona-computadora en cada uno de estos frentes.

## Disponibilidad de datos y código

La plataforma es de acceso público en https://hacecuentas.com. Los hubs por categoría (por ejemplo, https://hacecuentas.com/categoria/finanzas) y las herramientas individuales — como las calculadoras de actualización de alquileres, de categorización del monotributo y de aguinaldo — son de uso abierto y sin registro. Las estadísticas agregadas del corpus aquí reportadas se computaron directamente del repositorio de contenido de la plataforma en junio de 2026. El autor recibe con agrado consultas de investigadores que deseen acceder a los historiales de parámetros o a los metadatos del corpus para fines de replicación.

## Conflicto de intereses y posicionamiento

El autor es el fundador y responsable de hacecuentas.com, un sitio web de operación comercial financiado principalmente mediante tráfico orgánico de búsqueda. La plataforma no tenía monetización activa al momento de escribir este trabajo. Esta investigación no recibió financiamiento externo. El doble rol del autor como operador y analista es la razón por la cual el trabajo se enmarca como un aporte descriptivo y de diseño, y no como una evaluación de impacto, y es la motivación de la agenda de evaluación independiente de la Sección 7.
"""

# ================================================================ build both
if __name__ == "__main__":
    build(
        HERE + "/hacecuentas-financial-literacy-EN.pdf",
        EN_META, EN_BODY, REFS,
        {"rows": CATS_EN, "headers": ["Category", "Calc."],
         "total_label": "Total (primary corpus, AR)", "total_n": 2847,
         "caption": "Table 1. Category distribution of the primary Argentine-Spanish corpus (June 2026). "
                    "Excludes the 1,277 English, Portuguese and other localized calculators."},
    )
    build(
        HERE + "/hacecuentas-alfabetizacion-financiera-ES.pdf",
        ES_META, ES_BODY, REFS,
        {"rows": CATS_ES, "headers": ["Categoría", "Calc."],
         "total_label": "Total (corpus primario, AR)", "total_n": 2847,
         "caption": "Tabla 1. Distribución por categorías del corpus primario en español rioplatense (junio de 2026). "
                    "Excluye las 1.277 calculadoras en inglés, portugués y otras localizaciones."},
    )
    print("done")
