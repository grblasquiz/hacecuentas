import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'en/money/family-budget-and-big-expenses',
  title: "50/30/20 Family Budget and Big Expenses Calculator",
  description: "Run the 50/30/20 family budget rule, baby shower and back-to-school budgets, stacked discounts and private university costs — all on one single page.",
  silo: "Family budget",
  siloHref: '/en/money',
  locale: 'en',
  eyebrow: "United States · Family budget",
  h1: "How much can my family afford?",
  lede: "Choose your case and fill in only its fields. This hub keeps all 6 original formulas and brings the decision into one page.",
  stamps: ['6 calculators included', 'Original formulas reused', 'Reviewed July 28, 2026'],
  resultLabel: "Your result",
  cases: { title: "What do you need to calculate?", intro: "Choose one case; the hub applies its original formula.", items: [
  {
    "id": "c1",
    "label": "50/30/20 Family Budget Rule",
    "hint": "The 50/30/20 rule was popularized by Harvard bankruptcy expert Elizabeth Warren and her daughter Amelia Warren Tyagi in the 2005 book All Your Worth: The Ultimate Lifetime Money Plan.",
    "yes": [
      "Calculate 50/30/20 from **net (after-tax) income**, not gross. $5,000/mo take-home = $2,500 needs, $1,500 wants, $1,000 savings. In SF/NYC/Boston where rent alone runs 40%+ of net, flex to 60/20/20 and treat the extra needs allocation as a temporary state, not a permanent excuse."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-06-14.",
    "answer": "The 50/30/20 rule was popularized by Harvard bankruptcy expert Elizabeth Warren and her daughter Amelia Warren Tyagi in the 2005 book All Your Worth: The Ultimate Lifetime Money Plan."
  },
  {
    "id": "c2",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown",
    "hint": "A baby shower typically costs $500–$2,500 depending on guest count and venue. For 40 guests at home: food ($15/person) + decorations ($150) + cake ($100) + favors ($5/person) + photography ($300) = about $1,150, or $28.75 per guest. Choosing home over a restaurant ($30/person venue fee) saves roughly $1,200 for 40 guests.",
    "yes": [
      "A baby shower for 40 guests at home costs roughly $1,150–$1,500 ($29–$38 per guest). Hosting at a restaurant adds ~$1,200 in venue fees alone. Food and photography are typically the two largest line items."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-28.",
    "answer": "A baby shower typically costs $500–$2,500 depending on guest count and venue. For 40 guests at home: food ($15/person) + decorations ($150) + cake ($100) + favors ($5/person) + photography ($300) = about $1,150, or $28.75 per guest. Choosing home over a restaurant ($30/person venue fee) saves roughly $1,200 for 40 guests."
  },
  {
    "id": "c3",
    "label": "Back-to-School Budget Calculator 2026",
    "hint": "US families plan to spend an average of $863.86 per household on K-12 back-to-school shopping in 2026 (NRF): $293.11 on electronics, $250.29 on clothing, $174.01 on shoes, and $146.45 on school supplies. College households average $1,437.79. This calculator scales those averages by number of kids and grade level (elementary, middle, high, college) and lets you drop electronics to see the trimmed budget.",
    "yes": [
      "The average US family will spend $863.86 per K-12 household on back-to-school 2026 — and $293.11 of it is electronics. Skipping the device purchase (or timing it with a sales tax holiday) is the single biggest lever on the budget."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-07-22.",
    "answer": "US families plan to spend an average of $863.86 per household on K-12 back-to-school shopping in 2026 (NRF): $293.11 on electronics, $250.29 on clothing, $174.01 on shoes, and $146.45 on school supplies. College households average $1,437.79. This calculator scales those averages by number of kids and grade level (elementary, middle, high, college) and lets you drop electronics to see the trimmed budget."
  },
  {
    "id": "c4",
    "label": "Discount Calculator — Percent Off & Stacked Deals",
    "hint": "To calculate a discount: multiply the original price by (1 − discount/100). Example: $150 at 30% off → $150 × 0.70 = **$105** (you save $45). For stacked discounts (e.g. 20% + 10%), the real combined rate is 28%, not 30% — because the second discount applies to the already-reduced price: (1 − 0.20) × (1 − 0.10) = 0.72, so you pay 72% of the original.",
    "yes": [
      "A $100 item at 20% off costs $80 (save $20). Stack an extra 10% and you pay $72 — a real **28% discount**, not 30%. The combined rate is always less than the sum of the parts."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-07-24.",
    "answer": "To calculate a discount: multiply the original price by (1 − discount/100). Example: $150 at 30% off → $150 × 0.70 = **$105** (you save $45). For stacked discounts (e.g. 20% + 10%), the real combined rate is 28%, not 30% — because the second discount applies to the already-reduced price: (1 − 0.20) × (1 − 0.10) = 0.72, so you pay 72% of the original."
  },
  {
    "id": "c5",
    "label": "How Much Does Private University Cost in Argentina?",
    "hint": "Compare annual tuition and enrollment fees at Argentina's leading private universities. Get accurate 2026 costs for ITBA, UTDT, UdeSA, Austral, UCA, and UCEMA across engineering, economics, law, medicine, and business programs. Costs are verified quarterly to ensure you have current information.",
    "yes": [
      "Formula: **monthly tuition × 12 + enrollment fee = annual cost**. Apply with real 2026 figures from Argentina's top private universities."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-20.",
    "answer": "Compare annual tuition and enrollment fees at Argentina's leading private universities. Get accurate 2026 costs for ITBA, UTDT, UdeSA, Austral, UCA, and UCEMA across engineering, economics, law, medicine, and business programs. Costs are verified quarterly to ensure you have current information."
  },
  {
    "id": "c6",
    "label": "Bank Safe Deposit Box Costs by Size & Type",
    "hint": "Protecting valuable documents and items requires secure storage. Safe deposit boxes offer bank-backed security for important papers, jewelry, cash, and collectibles—protected against theft, fire, and natural disasters. Costs vary significantly by bank type and box size. This calculator shows typical annual fees based on 2026 rates, updated regularly to keep you current.",
    "yes": [
      "Formula: **monthly cost × 12 = annual cost**. Quick calculation with real market rates. Annual safe deposit box costs vary by size and bank type."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-20.",
    "answer": "Protecting valuable documents and items requires secure storage. Safe deposit boxes offer bank-backed security for important papers, jewelry, cash, and collectibles—protected against theft, fire, and natural disasters. Costs vary significantly by bank type and box size. This calculator shows typical annual fees based on 2026 rates, updated regularly to keep you current."
  }
] },
  inputsTitle: "Your inputs",
  inputsIntro: "Fields are prefixed with the case they belong to. Other fields are ignored.",
  fields: [
  {
    "id": "c1__monto",
    "label": "50/30/20 Family Budget Rule: Monthly Net Income (Take-Home)",
    "type": "number",
    "value": 5000,
    "step": 0.01,
    "thousands": false,
    "help": "After-tax pay deposited to checking. Subtract federal, state, FICA, 401k, and health premiums from gross. Example: $5,000."
  },
  {
    "id": "c1__plazo",
    "label": "50/30/20 Family Budget Rule: Period (months)",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false,
    "help": "Use 1 for monthly view, 12 for annual planning. Most US households budget monthly."
  },
  {
    "id": "c1__tasa",
    "label": "50/30/20 Family Budget Rule: Savings Allocation Override (%)",
    "type": "number",
    "value": 20,
    "max": 100,
    "step": 0.01,
    "thousands": false,
    "help": "Default 20%. Increase to 30-50% for FIRE track, drop to 15% if you're in transition out of paycheck-to-paycheck. The remainder splits 50/30 between needs and wants."
  },
  {
    "id": "c2__guest_count",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown: Number of Guests",
    "type": "number",
    "value": 40,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__venue_type",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown: Venue Type",
    "type": "select",
    "value": "home",
    "options": [
      {
        "value": "home",
        "label": "Home (Free)"
      },
      {
        "value": "restaurant",
        "label": "Restaurant ($30/person)"
      },
      {
        "value": "event_hall",
        "label": "Event Hall ($500–$1,500 flat)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__event_hall_cost",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown: Event Hall Rental (if selected above)",
    "type": "number",
    "value": 800,
    "step": 50,
    "thousands": false
  },
  {
    "id": "c2__food_per_person",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown: Food Cost per Person (USD)",
    "type": "number",
    "value": 15,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c2__decoration_budget",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown: Decorations Budget (USD)",
    "type": "number",
    "value": 150,
    "step": 10,
    "thousands": false
  },
  {
    "id": "c2__cake_cost",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown: Cake / Desserts (USD)",
    "type": "number",
    "value": 100,
    "step": 10,
    "thousands": false
  },
  {
    "id": "c2__favor_per_person",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown: Party Favors per Guest (USD)",
    "type": "number",
    "value": 5,
    "step": 0.25,
    "thousands": false
  },
  {
    "id": "c2__photography_budget",
    "label": "Baby Shower Budget Calculator — Cost Per Guest Breakdown: Photography / Videography (USD)",
    "type": "number",
    "value": 300,
    "step": 50,
    "thousands": false
  },
  {
    "id": "c3__kids",
    "label": "Back-to-School Budget Calculator 2026: Number of Kids / Students",
    "type": "number",
    "value": 2,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c3__grade_level",
    "label": "Back-to-School Budget Calculator 2026: Grade Level",
    "type": "select",
    "value": "middle",
    "options": [
      {
        "value": "elementary",
        "label": "Elementary school (K-5)"
      },
      {
        "value": "middle",
        "label": "Middle school (6-8)"
      },
      {
        "value": "high",
        "label": "High school (9-12)"
      },
      {
        "value": "college",
        "label": "College / university"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__include_electronics",
    "label": "Back-to-School Budget Calculator 2026: Buying Electronics This Year?",
    "type": "select",
    "value": "yes",
    "options": [
      {
        "value": "yes",
        "label": "Yes — laptop, tablet, or accessories"
      },
      {
        "value": "no",
        "label": "No — devices already covered"
      }
    ],
    "thousands": false
  },
  {
    "id": "c4__original_price",
    "label": "Discount Calculator — Percent Off & Stacked Deals: Original Price ($)",
    "type": "number",
    "value": 100,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__discount_1",
    "label": "Discount Calculator — Percent Off & Stacked Deals: Discount (%)",
    "type": "number",
    "value": 20,
    "max": 100,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c4__discount_2",
    "label": "Discount Calculator — Percent Off & Stacked Deals: Second Discount (%) — optional, stacks",
    "type": "number",
    "value": 0,
    "max": 100,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c5__universidad",
    "label": "How Much Does Private University Cost in Argentina?: University",
    "type": "select",
    "value": "itba",
    "options": [
      {
        "value": "itba",
        "label": "ITBA"
      },
      {
        "value": "utdt",
        "label": "UTDT"
      },
      {
        "value": "udesa",
        "label": "UdeSA"
      },
      {
        "value": "austral",
        "label": "Austral"
      },
      {
        "value": "uca",
        "label": "UCA"
      },
      {
        "value": "ucema",
        "label": "UCEMA"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__carrera",
    "label": "How Much Does Private University Cost in Argentina?: Degree Program",
    "type": "select",
    "value": "ingenieria",
    "options": [
      {
        "value": "ingenieria",
        "label": "Engineering"
      },
      {
        "value": "economia",
        "label": "Economics"
      },
      {
        "value": "derecho",
        "label": "Law"
      },
      {
        "value": "medicina",
        "label": "Medicine"
      },
      {
        "value": "administracion",
        "label": "Business Administration"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__tamano",
    "label": "Bank Safe Deposit Box Costs by Size & Type: Box Size",
    "type": "select",
    "value": "chica",
    "options": [
      {
        "value": "chica",
        "label": "Small"
      },
      {
        "value": "mediana",
        "label": "Medium"
      },
      {
        "value": "grande",
        "label": "Large"
      },
      {
        "value": "premium",
        "label": "Premium"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__banco",
    "label": "Bank Safe Deposit Box Costs by Size & Type: Bank Type",
    "type": "select",
    "value": "publico",
    "options": [
      {
        "value": "publico",
        "label": "Public Bank"
      },
      {
        "value": "privado_ar",
        "label": "Private Argentine"
      },
      {
        "value": "privado_internacional",
        "label": "International Private"
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
    "q": "Does the 50/30/20 rule work in high cost-of-living cities like San Francisco or NYC?",
    "a": "Not in its original form. In SF, NYC, Boston, Seattle, and DC, rent alone often consumes 40-45% of net income, blowing past the 50% needs cap. The standard adaptation is 60/20/20 — accept that needs run 60% during HCOL years but defend the 20% savings rate. Alternative: geographic arbitrage to a lower-COL city, where a 30% pay cut often results in a higher savings rate."
  },
  {
    "q": "Is paying more than 30% of income on rent automatically bad?",
    "a": "The 30%-of-gross rule comes from 1969 HUD housing-cost-burden definitions and is dated for 2026 markets. What matters is whether the 50% needs bucket as a whole stays achievable. If rent is 35% of net but you have no car payment and live in a walkable city, you're often better off than someone at 25% rent + $800 car payment. Run the full needs total before judging rent in isolation."
  },
  {
    "q": "Does debt go under needs or savings?",
    "a": "Split it. Minimum required payments on all debts (credit cards, student loans, auto loans, mortgages) go in Needs because you have to pay them to stay current. Anything above the minimum — extra principal payments to accelerate payoff — goes in the 20% Savings bucket alongside investments. This split matters because it forces you to fund retirement and pay down high-APR debt from the same disciplined 20%."
  },
  {
    "q": "Should I build an emergency fund before contributing to my 401k?",
    "a": "Partially. The CFP-standard sequence is: (1) 401k up to full employer match — never skip free money, (2) $1,000 starter emergency fund, (3) pay off debt above ~7% APR, (4) build emergency fund to 3-6 months of needs expenses in a HYSA, (5) then max Roth IRA and increase 401k beyond match. Skipping step 1 to build an emergency fund first costs you a guaranteed 50-100% match return."
  },
  {
    "q": "How do I prevent lifestyle creep from destroying my budget?",
    "a": "Use the 50/50 raise rule: every salary increase, bonus, or side-income bump gets split 50% to savings rate increase and 50% to lifestyle, *before* the money hits your checking account. Automate it — bump your 401k contribution percentage the same day HR notifies you of a raise. Without this rule, Bureau of Labor Statistics data shows household spending rises in near-lockstep with income, leaving net worth flat through middle-income years."
  },
  {
    "q": "Joint vs separate accounts — what works for married couples?",
    "a": "The yours/mine/ours model fits most US dual-income households in 2026: a joint account funds shared needs (rent, utilities, groceries, childcare), each spouse keeps a personal account for individual wants, retirement accounts stay individually titled by IRS rule. Fully separate accounts with split bills tends to hide financial incompatibility long-term. Fully joint requires aligned spending values to avoid friction."
  },
  {
    "q": "What's the best budgeting app for the 50/30/20 rule in 2026?",
    "a": "Mint shut down in 2024. Current top picks: YNAB ($14.99/mo) for category-level control, Monarch Money (~$100/yr) as the cleanest Mint successor for couples, Empower Personal Dashboard (free) for net worth tracking, Copilot (~$95/yr) for iOS-first households. For 50/30/20 specifically you don't need a paid app — a Google Sheet with three SUM formulas does the job for free."
  },
  {
    "q": "What if I'm living paycheck-to-paycheck — is 50/30/20 even realistic?",
    "a": "Use 70/15/15 as a 12-24 month transition target: 70% needs, 15% wants, 15% savings. The 15% savings goes first to a $1,000 starter emergency fund, then to paying off any debt above 7% APR. Once you've cleared high-APR debt and built one month of expenses in a HYSA, step up to 60/20/20, then aim for 50/30/20. According to LendingClub data, ~60% of US households live paycheck-to-paycheck in 2026, so this transition path is the norm, not the exception."
  },
  {
    "q": "How does FIRE (Financial Independence, Retire Early) modify the rule?",
    "a": "FIRE inverts the framework. A 50% savings rate gets you to financial independence in roughly 17 years from zero, per Mr. Money Mustache's math at 7% real returns and a 4% safe withdrawal rate. A 65% savings rate cuts that to ~10 years. The split becomes 30/20/50 or 30/10/60, which requires either a high income (typically $150k+ household), low fixed costs (no kids, no HCOL housing), or both. Lean FIRE pushes savings rates above 70%."
  },
  {
    "q": "What is the average cost of a baby shower in 2026?",
    "a": "Most baby showers in the U.S. cost between $500 and $2,500. Small intimate gatherings of 15–20 guests at home average $400–$700; medium parties of 30–50 guests run $1,000–$1,800; large events of 60–100 guests can reach $2,000–$3,500. The national average is roughly $1,000–$1,500 for 30–40 guests."
  },
  {
    "q": "How much should I budget per guest for a baby shower?",
    "a": "Budget $25–$45 per guest as a general rule for a mid-range baby shower at home: $10–$20 for food, $3–$7 for favors, and a share of flat costs (decorations, cake, photography) spread across guests. Restaurant or event hall venues add $20–$40 per person on top."
  },
  {
    "q": "Is it cheaper to host a baby shower at home or a restaurant?",
    "a": "Home is almost always cheaper by $20–$40 per person. For 40 guests, a restaurant at $30/person adds $1,200 to your venue cost that disappears entirely if you host at home. The trade-off is setup effort, space availability, and cleanup."
  }
],
  sources: [
  {
    "name": "Warren E. & Tyagi A.W. — All Your Worth: The Ultimate Lifetime Money Plan (2005)",
    "url": "https://www.amazon.com/All-Your-Worth-Ultimate-Lifetime/dp/0743269888"
  },
  {
    "name": "Bureau of Labor Statistics — Consumer Expenditure Survey (CES)",
    "url": "https://www.bls.gov/cex/"
  },
  {
    "name": "Consumer Financial Protection Bureau — Budgeting resources",
    "url": "https://www.consumerfinance.gov/consumer-tools/budgeting/"
  },
  {
    "name": "Bogleheads Wiki — Three-fund portfolio and savings rate",
    "url": "https://www.bogleheads.org/wiki/Three-fund_portfolio"
  },
  {
    "name": "NerdWallet — 50/30/20 budget calculator and methodology",
    "url": "https://www.nerdwallet.com/article/finance/nerdwallet-budget-calculator"
  },
  {
    "name": "The Knot – Baby Shower Planning & Budget Guide",
    "url": "https://www.theknot.com/content/baby-shower-planning-budget",
    "publisher": "The Knot",
    "date": "2025"
  },
  {
    "name": "BabyCenter – Baby Shower Planning",
    "url": "https://www.babycenter.com/pregnancy/preparing-for-baby",
    "publisher": "BabyCenter LLC",
    "date": "2025"
  },
  {
    "name": "Brides – Event Planning Cost Breakdown",
    "url": "https://www.brides.com/story/event-planning-costs",
    "publisher": "Brides Magazine",
    "date": "2024"
  },
  {
    "name": "NRF — Back-to-Class 2026 Consumer Survey (with Prosper Insights & Analytics)",
    "url": "https://nrf.com/media-center/press-releases/back-class-shopping-expected-reach-record-levels",
    "publisher": "National Retail Federation",
    "date": "2026-07"
  },
  {
    "name": "NRF — Prices are top of mind as consumers head into the 2026 back-to-class season",
    "url": "https://nrf.com/blog/prices-are-top-of-mind-as-consumers-head-into-the-2026-back-to-class-season",
    "publisher": "National Retail Federation",
    "date": "2026-07"
  },
  {
    "name": "Tax Foundation — Sales Tax Holidays by State, 2026",
    "url": "https://taxfoundation.org/data/all/state/sales-tax-holidays-by-state-2026/",
    "publisher": "Tax Foundation",
    "date": "2026"
  },
  {
    "name": "Federal Trade Commission — Guides Against Deceptive Pricing (16 CFR Part 233)",
    "url": "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-233",
    "publisher": "U.S. Federal Trade Commission",
    "date": "2026"
  },
  {
    "name": "Khan Academy — Percent word problems",
    "url": "https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates/pre-algebra-percent-problems/v/finding-a-percent",
    "publisher": "Khan Academy",
    "date": "2026"
  },
  {
    "name": "National Institute of Standards and Technology — Handbook 130: Uniform Pricing",
    "url": "https://www.nist.gov/pml/owm/nist-handbook-130-current-edition",
    "publisher": "NIST",
    "date": "2021"
  },
  {
    "name": "U.S. Federal Student Aid (studentaid.gov)",
    "url": "https://studentaid.gov/"
  },
  {
    "name": "U.S. National Center for Education Statistics (NCES)",
    "url": "https://nces.ed.gov/"
  },
  {
    "name": "INDEC – Anuario de Estadísticas Universitarias Argentina",
    "url": "https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31-118"
  },
  {
    "name": "Ministerio de Educación Argentina – Universidades",
    "url": "https://www.argentina.gob.ar/educacion/universidades"
  },
  {
    "name": "INDEC — Canasta básica y costo de vida familia tipo",
    "url": "https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-43-149"
  },
  {
    "name": "INDEC – Índice del Costo de la Construcción (ICC)",
    "url": "https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-6-32"
  },
  {
    "name": "INDEC — Canasta Básica Alimentaria y Canasta Básica Total (publicación mensual)",
    "url": "https://www.indec.gob.ar/indec/web/Nivel3-Tema-4-43"
  },
  {
    "name": "INDEC - Índice de Costo de la Construcción (ICC)",
    "url": "https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-30"
  },
  {
    "name": "U.S. Federal Deposit Insurance Corporation (FDIC)",
    "url": "https://www.fdic.gov/"
  },
  {
    "name": "Consumer Financial Protection Bureau (CFPB)",
    "url": "https://www.consumerfinance.gov/"
  },
  {
    "name": "Código Civil y Comercial (Ley 26.994) — arts. 1413 a 1417: contrato de caja de seguridad",
    "url": "https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm"
  },
  {
    "name": "Relevamiento de tarifas de cajas de seguridad bancarias y privadas (referencia de mercado 2026)",
    "url": "https://www.infobae.com/economia/2026/04/12/en-el-ultimo-ano-crecio-35-el-alquiler-de-cajas-de-seguridad-en-el-sector-privado-cuanto-cuestan-y-que-se-espera-para-este-ano/"
  },
  {
    "name": "Consumer Financial Protection Bureau — Renting vs. Owning",
    "url": "https://www.consumerfinance.gov/owning-a-home/process/prepare/"
  },
  {
    "name": "Consumer Financial Protection Bureau — Savings Accounts",
    "url": "https://www.consumerfinance.gov/consumer-tools/bank-accounts/"
  },
  {
    "name": "Consumer Financial Protection Bureau — Owning a Home",
    "url": "https://www.consumerfinance.gov/owning-a-home/"
  },
  {
    "name": "Consumer Financial Protection Bureau — Debt-to-Income Calculator Guidance",
    "url": "https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-why-is-the-43-debt-to-income-ratio-important-en-1791/"
  },
  {
    "name": "Consumer Financial Protection Bureau — What is PITI?",
    "url": "https://www.consumerfinance.gov/ask-cfpb/what-is-piti-en-1953/"
  },
  {
    "name": "Consumer Financial Protection Bureau — APR vs APY explained",
    "url": "https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-fixed-apr-and-a-variable-apr-en-48/"
  },
  {
    "name": "Consumer Financial Protection Bureau (CFPB) — Auto Loans & Lien Release Guidance",
    "url": "https://www.consumerfinance.gov/consumer-tools/auto-loans/"
  },
  {
    "name": "Consumer Financial Protection Bureau — Credit Cards",
    "url": "https://www.consumerfinance.gov/consumer-tools/credit-cards/"
  },
  {
    "name": "Consumer Financial Protection Bureau — Building an Emergency Fund",
    "url": "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/"
  },
  {
    "name": "Consumer Financial Protection Bureau (CFPB) — Mortgage tools",
    "url": "https://www.consumerfinance.gov/consumer-tools/mortgages/"
  },
  {
    "name": "Consumer Financial Protection Bureau - Compound Interest Explained",
    "url": "https://www.consumerfinance.gov/ask-cfpb/what-is-compound-interest-en-1949/"
  }
],
  replaces: [
    '/en/50-30-20-family-budget', // Absorbida como caso calculable con formulaId presupuesto-50-30-20-familiar-sueldo.
    '/en/baby-shower-budget-calculator', // Absorbida como caso calculable con formulaId baby-shower-budget-guests-food-decoration.
    '/en/back-to-school-budget-calculator', // Absorbida como caso calculable con formulaId back-to-school-budget-calculator.
    '/en/discount-calculator', // Absorbida como caso calculable con formulaId discount-calculator.
    '/en/itba-utdt-costo-carrera-anual-privada', // Absorbida como caso calculable con formulaId itba-utdt-costo-carrera-anual-privada.
    '/en/safe-deposit-box-bank-cost-comparison', // Absorbida como caso calculable con formulaId caja-seguridad-banco-comparativa-mensual.
  ],
  lastReviewed: '2026-08-16',
};
