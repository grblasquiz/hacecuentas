import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'en/family/events-and-family-transitions',
  title: "Divorce Costs, Ring Size and Family Event Budgets",
  description: "Estimate divorce settlement costs, convert ring sizes between mm, US, UK and EU, and plan the budget for big family events and changes, all on one page.",
  silo: "Family events and transitions",
  siloHref: '/en/family',
  locale: 'en',
  eyebrow: "United States · Family events and transitions",
  h1: "What should I budget for this family event or change?",
  lede: "Choose your case and fill in only its fields. This hub keeps all 3 original formulas and brings the decision into one page.",
  stamps: ['3 calculators included', 'Original formulas reused', 'Reviewed July 28, 2026'],
  resultLabel: "Your result",
  cases: { title: "What do you need to calculate?", intro: "Choose one case; the hub applies its original formula.", items: [
  {
    "id": "c1",
    "label": "Estimate Your Divorce Settlement Costs",
    "hint": "This calculator estimates the total financial cost of a divorce settlement in the United States, including attorney fees, court costs, mediation expenses, and asset division implications. The core cost driver is divorce type (uncontested vs. contested vs. high-asset litigation), combined with total marital asset value.",
    "yes": [
      "**Estimated Attorney Fees ≈ Asset Value × Fee Rate (0.5%–8%) + Fixed Court Costs ($300–$500).** For a $500,000 marital estate, expect $2,500–$40,000+ depending on whether the divorce is uncontested (0.5%–1%), mediated (1%–3%), or fully contested (4%–8% or higher)."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-20.",
    "answer": "This calculator estimates the total financial cost of a divorce settlement in the United States, including attorney fees, court costs, mediation expenses, and asset division implications. The core cost driver is divorce type (uncontested vs. contested vs. high-asset litigation), combined with total marital asset value."
  },
  {
    "id": "c2",
    "label": "Ring Size Calculator: Convert mm to US, UK & EU",
    "hint": "Your ring size comes from your finger's inside circumference in millimeters. The EU/ISO size equals that circumference (e.g. 54 mm = EU 54). To get the US size, use: (circumference in mm − 36.5) ÷ 2.55. So 54.4 mm = EU 54 = US 7 = UK N, with an inside diameter of 17.3 mm. Measure at the end of the day for the most accurate fit.",
    "yes": [
      "**Measure the inside circumference** of your finger in mm. The **EU/ISO size = circumference in mm** (e.g. 54 mm = size 54). The **US size** = `(circumference − 36.5) ÷ 2.55`. The **inside diameter** = `circumference ÷ π`."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-06-04.",
    "answer": "Your ring size comes from your finger's inside circumference in millimeters. The EU/ISO size equals that circumference (e.g. 54 mm = EU 54). To get the US size, use: (circumference in mm − 36.5) ÷ 2.55. So 54.4 mm = EU 54 = US 7 = UK N, with an inside diameter of 17.3 mm. Measure at the end of the day for the most accurate fit."
  },
  {
    "id": "c3",
    "label": "Stages of Grief After Family Loss",
    "hint": "The 5 stages of grief (Kübler-Ross) are: denial, anger, bargaining, depression, and acceptance. They are not linear or sequential. Typical grief duration after family loss is 6-12 months for anticipated loss (long illness) and 12-18 months for sudden loss. Childhood loss is reworked over years at key life stages.",
    "yes": [
      "Grief stages are not linear. Typical duration: 6-12 months for anticipated loss, 12-18 months for sudden loss. Prolonged Grief Disorder affects ~7-10% of bereaved people and responds to specialized therapy."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-18.",
    "answer": "The 5 stages of grief (Kübler-Ross) are: denial, anger, bargaining, depression, and acceptance. They are not linear or sequential. Typical grief duration after family loss is 6-12 months for anticipated loss (long illness) and 12-18 months for sudden loss. Childhood loss is reworked over years at key life stages."
  }
] },
  inputsTitle: "Your inputs",
  inputsIntro: "Fields are prefixed with the case they belong to. Other fields are ignored.",
  fields: [
  {
    "id": "c1__bienes",
    "label": "Estimate Your Divorce Settlement Costs: Total Marital Assets ($)",
    "type": "number",
    "value": 100000000,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c1__acuerdo",
    "label": "Estimate Your Divorce Settlement Costs: Divorce Type",
    "type": "select",
    "value": "acuerdo",
    "options": [
      {
        "value": "acuerdo",
        "label": "Uncontested"
      },
      {
        "value": "contradictorio",
        "label": "Contested"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__circunferencia",
    "label": "Ring Size Calculator: Convert mm to US, UK & EU: Finger circumference (mm)",
    "type": "number",
    "value": 54,
    "min": 35,
    "max": 80,
    "step": 0.5,
    "thousands": false,
    "help": "Wrap a string or strip of paper around your finger, mark the overlap, and measure that length with a ruler in millimeters."
  },
  {
    "id": "c2__sistema",
    "label": "Ring Size Calculator: Convert mm to US, UK & EU: Preferred size system",
    "type": "select",
    "value": "US",
    "options": [
      {
        "value": "AR",
        "label": "EU / Argentina"
      },
      {
        "value": "US",
        "label": "US"
      },
      {
        "value": "UK",
        "label": "UK"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__tipoPerdida",
    "label": "Stages of Grief After Family Loss: Type of Loss",
    "type": "select",
    "value": "esperada",
    "options": [
      {
        "value": "esperada",
        "label": "Long-term illness (anticipated loss)"
      },
      {
        "value": "subita",
        "label": "Sudden loss (accident, cardiac, suicide)"
      },
      {
        "value": "ninez",
        "label": "Loss of a parent in childhood"
      }
    ],
    "thousands": false
  }
],
  fineprint: "Informational estimate. Verify inputs and official sources before acting.",
  chart: { type: 'bars', caption: "The main numeric outputs returned by the selected formula." },
  breakdownTitle: "Formula results",
  breakdownIntro: "Each row is returned by the original calculator formula.",
  faq: [
  {
    "q": "What is the average cost of a divorce in the United States?",
    "a": "According to data compiled by NOLO and the American Academy of Matrimonial Lawyers, the average total cost of a US divorce is approximately $12,900 when including attorney fees. However, the median for uncontested cases is closer to $4,100, while contested divorces average $23,300 per spouse. High-asset divorces with business valuations and expert witnesses regularly exceed $100,000 per side."
  },
  {
    "q": "How does the divorce type affect total cost?",
    "a": "Divorce type is the single biggest cost driver. An uncontested DIY divorce can cost under $1,000 in filing fees alone. Mediated divorces run $5,000–$20,000 total. Collaborative divorces cost $15,000–$50,000. A fully litigated contested divorce averages $43,000 per spouse according to the AAML 2023 survey, and complex high-asset cases can reach $500,000+ per side if they go to trial."
  },
  {
    "q": "What is a QDRO and why does it matter for divorce?",
    "a": "A Qualified Domestic Relations Order (QDRO) is a court order required by IRS rules (IRC §414(p)) to divide employer-sponsored retirement plans (401(k), pension) between divorcing spouses without triggering taxes or penalties. Without a properly filed QDRO, the receiving spouse may owe income tax plus a 10% early withdrawal penalty on the full amount transferred. QDRO drafting typically costs $500–$1,500 in attorney fees, but protects potentially tens of thousands in tax liability. See IRS Publication 504."
  },
  {
    "q": "Which states follow community property rules vs. equitable distribution?",
    "a": "Nine states apply community property law (50/50 split of marital assets by default): California, Texas, Arizona, Nevada, New Mexico, Idaho, Louisiana, Washington, and Wisconsin. The remaining 41 states plus DC use equitable distribution, where judges divide assets based on fairness factors such as each spouse's income, length of marriage, age, health, and financial contributions — which does NOT guarantee an equal split. Alaska allows couples to opt into community property rules."
  },
  {
    "q": "How long does a divorce typically take to finalize?",
    "a": "Timeline varies widely by state and divorce type. Uncontested divorces in states with short waiting periods (e.g., 30 days in Texas) can finalize in 1–3 months. Most mediated divorces resolve in 4–9 months. Contested divorces typically take 12–24 months, and complex high-asset litigations can take 3–5+ years. California mandates a minimum 6-month separation period before any divorce is finalized, regardless of agreement."
  },
  {
    "q": "Are attorney fees in a divorce tax deductible?",
    "a": "Since the Tax Cuts and Jobs Act of 2017 (effective tax year 2018), personal legal fees — including most divorce attorney costs — are no longer deductible on federal returns (IRS Publication 504, updated 2024). The one narrow exception: fees paid specifically to produce or collect taxable alimony income may still qualify as a miscellaneous deduction in some circumstances, but the TCJA eliminated alimony deductibility for divorces finalized after December 31, 2018."
  },
  {
    "q": "What is a Certified Divorce Financial Analyst (CDFA) and do I need one?",
    "a": "A CDFA is a financial professional trained specifically to analyze the long-term financial impact of divorce settlement proposals — including tax consequences, retirement account splits, real estate options, and cash flow projections. Their typical fee is $2,000–$10,000 for a full analysis. A CDFA is most valuable when marital assets exceed $250,000, when there is a pension or stock options involved, or when significant business interests require valuation. They can often save far more than their fee by catching unfavorable settlement terms."
  }
],
  sources: [
  {
    "name": "IRS Publication 504 – Divorced or Separated Individuals",
    "url": "https://www.irs.gov/publications/p504"
  },
  {
    "name": "IRS – Retirement Plans and QDROs (IRC §414(p))",
    "url": "https://www.irs.gov/retirement-plans/qdro-retirement-plans"
  },
  {
    "name": "U.S. Department of Labor – QDRO Fact Sheet",
    "url": "https://www.dol.gov/sites/dolgov/files/ebsa/about-ebsa/our-activities/resource-center/faqs/qdro-overview.pdf"
  },
  {
    "name": "Wikipedia – Division of property (divorce law, United States)",
    "url": "https://en.wikipedia.org/wiki/Division_of_property"
  },
  {
    "name": "ISO 8653:2016 — Jewellery, ring sizes, definition, measurement and designation",
    "url": "https://www.iso.org/standard/69624.html"
  },
  {
    "name": "GIA — How to Find Your Ring Size",
    "url": "https://www.gia.edu/gia-news-research/how-to-find-your-ring-size"
  },
  {
    "name": "Brilliance — Ring Size Conversion Chart (US to International)",
    "url": "https://www.brilliance.com/ring-size-conversion-chart"
  },
  {
    "name": "WHO — ICD-11: Prolonged Grief Disorder",
    "url": "https://www.who.int/standards/classifications/classification-of-diseases"
  },
  {
    "name": "American Psychiatric Association — DSM-5-TR: Prolonged Grief Disorder (2022)",
    "url": "https://www.psychiatry.org/psychiatrists/practice/dsm"
  },
  {
    "name": "Columbia University — Complicated Grief Treatment (CGT)",
    "url": "https://complicatedgrief.columbia.edu"
  },
  {
    "name": "988 Suicide & Crisis Lifeline (US)",
    "url": "https://988lifeline.org"
  },
  {
    "name": "The Compassionate Friends — Child Loss Support",
    "url": "https://www.compassionatefriends.org"
  }
],
  replaces: [
    '/en/divorce-settlement-cost-calculator', // Absorbida como caso calculable con formulaId divorcio-liquidacion-bienes-gananciales-costo.
    '/en/ring-size-finger', // Absorbida como caso calculable con formulaId talla-anillo-dedo.
    '/en/stages-of-grief-family-loss', // Absorbida como caso calculable con formulaId etapas-duelo-perdida-familiar-meses.
  ],
  lastReviewed: '2026-08-16',
};
