import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'en/life/identity-permits-and-applications',
  title: "US Visa, Driver License and Permit Costs Calculator",
  description: "Estimate the total cost of a US B1/B2 tourist visa, a driver license by category, foreign residency and ID paperwork and other permits, all on one page.",
  silo: "Permits and applications",
  siloHref: '/en/life',
  locale: 'en',
  eyebrow: "United States · Permits and applications",
  h1: "What will this permit or application cost?",
  lede: "Choose your case and fill in only its fields. This hub keeps all 6 original formulas and brings the decision into one page.",
  stamps: ['6 calculators included', 'Original formulas reused', 'Reviewed July 28, 2026'],
  resultLabel: "Your result",
  cases: { title: "What do you need to calculate?", intro: "Choose one case; the hub applies its original formula.", items: [
  {
    "id": "c1",
    "label": "Auto Debt-Free Certificate Cost",
    "hint": "In the United States, getting a \"free and clear\" auto title after paying off a car loan is the legal step that confirms you own the vehicle outright with no lender lien attached. Once you make the final payoff, federal and state UCC rules generally require the lienholder to release the lien within 30 days.",
    "yes": [
      "**Total Cost = Lien Release (usually free from lender) + DMV Title Reissue Fee ($5–$77 by state) + Optional Expedited Fee ($10–$25) + Notary/Mailing ($0–$15)**. In most ELT states the new clean title arrives within 30–60 days at no extra cost; paper-title states require you to walk the Lien Release Letter into the DMV yourself."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-05-28.",
    "answer": "In the United States, getting a \"free and clear\" auto title after paying off a car loan is the legal step that confirms you own the vehicle outright with no lender lien attached. Once you make the final payoff, federal and state UCC rules generally require the lienholder to release the lien within 30 days."
  },
  {
    "id": "c2",
    "label": "Driver License Cost by Category",
    "hint": "Getting a driver's license in the United States involves multiple fees that vary significantly by state, license category, and whether you're applying for the first time, renewing, or upgrading.",
    "yes": [
      "**Total License Cost = Knowledge Test Fee + Skills Test Fee + License Issuance Fee + Endorsement Fees (if any)**. A standard new Class D license averages ~$40 nationally; a new CDL Class A averages ~$150–$300 in combined fees."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-19.",
    "answer": "Getting a driver's license in the United States involves multiple fees that vary significantly by state, license category, and whether you're applying for the first time, renewing, or upgrading."
  },
  {
    "id": "c3",
    "label": "Food Handler Permit Cost in Argentina",
    "hint": "A food handler permit (known in Argentina as libreta sanitaria or carnet de manipulador de alimentos) certifies that a worker has passed a medical exam and is fit to handle food safely. In Argentina, there is no single national fee — costs are set by each municipality or jurisdiction.",
    "yes": [
      "**Total Cost = Municipal Base Fee + Medical Exam Fee + (Optional Hygiene Course Fee)**. Example: CABA ≈ ARS $15,000 base + ARS $3,000 exam = ~ARS $18,000 total, valid for 1 year."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-19.",
    "answer": "A food handler permit (known in Argentina as libreta sanitaria or carnet de manipulador de alimentos) certifies that a worker has passed a medical exam and is fit to handle food safely. In Argentina, there is no single national fee — costs are set by each municipality or jurisdiction."
  },
  {
    "id": "c4",
    "label": "Foreign Residency & ID Cost Calculator",
    "hint": "This calculator estimates the total official cost of obtaining foreign residency and a Foreign National ID (DNI Extranjero) in Argentina in 2026. It covers every residency category recognized by Argentina's National Immigration Directorate (Dirección Nacional de Migraciones, DNM): Mercosur Temporary, Mercosur Permanent, Non-Mercosur Temporary, Non-Mercosur Permanent, and Special/Humanitarian.",
    "yes": [
      "**Total Cost = DNM Residency Fee + RENAPER DNI Fee** — In 2026, Mercosur Temporary runs ~ARS 22,500 + ARS 3,000 DNI (~USD 25 combined at official rate); Non-Mercosur Temporary runs ~ARS 85,000 + ARS 3,000 DNI (~USD 90 combined). Permanent residency fees are roughly 2× the temporary equivalents."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-07-24.",
    "answer": "This calculator estimates the total official cost of obtaining foreign residency and a Foreign National ID (DNI Extranjero) in Argentina in 2026. It covers every residency category recognized by Argentina's National Immigration Directorate (Dirección Nacional de Migraciones, DNM): Mercosur Temporary, Mercosur Permanent, Non-Mercosur Temporary, Non-Mercosur Permanent, and Special/Humanitarian."
  },
  {
    "id": "c5",
    "label": "UBA CBC Regular vs Libre Status Calculator",
    "hint": "To be **Regular** at UBA CBC you need: (1) attendance ≥ 75% of classes AND (2) a score of 4 or higher on EACH midterm (parcial) — on the 1–10 Argentine scale. Both conditions must be met simultaneously. Failing either one makes you **Libre** (failed standing). Regular students sit a standard final exam; Libre students face a harder comprehensive final.",
    "yes": [
      "**Regular standing = Attendance ≥ 75% AND Exam 1 ≥ 4 AND Exam 2 ≥ 4 (on the 1–10 scale). Average = (Exam1 + Exam2) / 2. A midterm average ≥ 7 with ≥ 75% attendance may qualify for direct promotion (no final exam) in eligible courses.**"
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-20.",
    "answer": "To be **Regular** at UBA CBC you need: (1) attendance ≥ 75% of classes AND (2) a score of 4 or higher on EACH midterm (parcial) — on the 1–10 Argentine scale. Both conditions must be met simultaneously. Failing either one makes you **Libre** (failed standing). Regular students sit a standard final exam; Libre students face a harder comprehensive final."
  },
  {
    "id": "c6",
    "label": "Total Cost of a US B1/B2 Tourist Visa — Full Breakdown",
    "hint": "The total cost of a US B1/B2 tourist visa starts at the $185 MRV application fee, plus photos, document translations and processing extras. Enter your local exchange rate for the full breakdown — at 1,000 ARS/USD the MRV fee alone is ~185,000 ARS.",
    "yes": [
      "Formula: **Fixed USD fee + Local processing in ARS**. Enter the current exchange rate to calculate your total cost, broken down by component. Includes $185 MRV fee, photos, translations, and estimated processing costs."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-21.",
    "answer": "The total cost of a US B1/B2 tourist visa starts at the $185 MRV application fee, plus photos, document translations and processing extras. Enter your local exchange rate for the full breakdown — at 1,000 ARS/USD the MRV fee alone is ~185,000 ARS."
  }
] },
  inputsTitle: "Your inputs",
  inputsIntro: "Fields are prefixed with the case they belong to. Other fields are ignored.",
  fields: [
  {
    "id": "c1__provincia",
    "label": "Auto Debt-Free Certificate Cost: State",
    "type": "select",
    "value": "caba",
    "options": [
      {
        "value": "caba",
        "label": "California (ELT)"
      },
      {
        "value": "pba",
        "label": "Texas (Paper)"
      },
      {
        "value": "cba",
        "label": "Florida (ELT)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__tipo",
    "label": "Driver License Cost by Category: License Type",
    "type": "select",
    "value": "nueva",
    "options": [
      {
        "value": "nueva",
        "label": "New"
      },
      {
        "value": "renov",
        "label": "Renewal"
      },
      {
        "value": "duplicado",
        "label": "Duplicate"
      },
      {
        "value": "ampliacion",
        "label": "Extension"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__categoria",
    "label": "Driver License Cost by Category: Category",
    "type": "select",
    "value": "a",
    "options": [
      {
        "value": "a",
        "label": "A Motorcycle"
      },
      {
        "value": "b",
        "label": "B Car"
      },
      {
        "value": "c",
        "label": "C Truck"
      },
      {
        "value": "d",
        "label": "D Passenger Transport"
      },
      {
        "value": "e",
        "label": "E Trailer"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__municipio",
    "label": "Food Handler Permit Cost in Argentina: Municipality",
    "type": "select",
    "value": "caba",
    "options": [
      {
        "value": "caba",
        "label": "CABA"
      },
      {
        "value": "la-plata",
        "label": "La Plata"
      },
      {
        "value": "cba",
        "label": "Córdoba"
      },
      {
        "value": "rosario",
        "label": "Rosario"
      }
    ],
    "thousands": false
  },
  {
    "id": "c4__tipo",
    "label": "Foreign Residency & ID Cost Calculator: Residency Type",
    "type": "select",
    "value": "temp-merc",
    "options": [
      {
        "value": "temp-merc",
        "label": "Temporary (Mercosur)"
      },
      {
        "value": "temp-no",
        "label": "Temporary (Non-Mercosur)"
      },
      {
        "value": "perm",
        "label": "Permanent"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__asistenciaPorcentaje",
    "label": "UBA CBC Regular vs Libre Status Calculator: Attendance %",
    "type": "number",
    "value": 75,
    "step": 0.01,
    "thousands": false,
    "help": "Enter your class attendance percentage (minimum 75% required)."
  },
  {
    "id": "c5__parcial1",
    "label": "UBA CBC Regular vs Libre Status Calculator: Midterm 1 Score (1–10)",
    "type": "number",
    "value": 6,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c5__parcial2",
    "label": "UBA CBC Regular vs Libre Status Calculator: Midterm 2 Score (1–10)",
    "type": "number",
    "value": 7,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c6__dolarOficial",
    "label": "Total Cost of a US B1/B2 Tourist Visa — Full Breakdown: Official Exchange Rate (USD/ARS)",
    "type": "number",
    "value": 1520,
    "step": 0.01,
    "thousands": false
  }
],
  fineprint: "Informational estimate. Verify inputs and official sources before acting.",
  chart: { type: 'bars', caption: "The main numeric outputs returned by the selected formula." },
  breakdownTitle: "Formula results",
  breakdownIntro: "Each row is returned by the original calculator formula.",
  faq: [
  {
    "q": "Does my lender mail the new title automatically once the loan is paid off?",
    "a": "In Electronic Lien and Title (ELT) states the lender transmits the lien release to the DMV electronically, and the DMV mails the new clean paper title to the registered owner — you do not have to file anything. This is the standard in California, Florida, Arizona, Ohio, Pennsylvania, Virginia, Washington and roughly 25 other states. In paper-title states (Texas, New York for some titles, parts of New Jersey) the lender mails you the existing paper title stamped with a lien release, and you have to take it to the county tax office or DMV yourself to get a new title issued in your name without the lienholder."
  },
  {
    "q": "How long after payoff should I get the title?",
    "a": "Most state statutes give the lender up to 30 days from receipt of final payment to release the lien (Florida is 10 business days). After release, the DMV typically mails the new clean title within 30 to 60 days in ELT states, or within a couple of weeks of you filing the application in paper-title states. New York and Pennsylvania can take 90 days due to processing backlogs. If you do not have a title within 90 days of payoff, send a written demand to the lender citing your state's vehicle code or UCC §9-513."
  },
  {
    "q": "I lost my title — how do I get a new one?",
    "a": "File an Application for Duplicate Title with your state DMV: REG 227 in California ($26), Form 130-U in Texas ($2 duplicate + $33 title), HSMV 82101 in Florida ($75.25 + $2.50 duplicate), MV-902 in New York ($20). You'll need to provide the VIN, license plate, your driver's license, and in some states a notarized statement. The duplicate is typically mailed within 2–6 weeks. If there is still a lien on the title, the duplicate will be sent to the lienholder, not to you."
  },
  {
    "q": "Which states use ELT (Electronic Lien and Title)?",
    "a": "ELT is mandatory for lenders in approximately 29 states, including Arizona, California, Florida, Georgia, Hawaii, Idaho, Kansas, Louisiana, Maryland, Massachusetts, Minnesota, Mississippi, Nebraska, Nevada, New Mexico, New York, North Carolina, Ohio, Oregon, Pennsylvania, South Carolina, Tennessee, Texas (for franchised dealers), Utah, Virginia, Washington, West Virginia, Wisconsin, and Wyoming. Several others (e.g., Colorado, Connecticut, New Jersey) offer ELT as an option but still issue paper titles in many cases. The AAMVA Title and Registration Working Group maintains the official current list."
  },
  {
    "q": "What can I do if the lender refuses or fails to release the lien?",
    "a": "First send a written demand by certified mail citing your state's lien release statute and UCC §9-513, attaching the final payoff confirmation. If the lender does not respond within 30 days, file a complaint with your state Attorney General's consumer protection division and with the CFPB at consumerfinance.gov. For non-bank auto lenders you can also file with the FTC at reportfraud.ftc.gov. If the lender is in bankruptcy, contact the bankruptcy trustee. As a last resort, file a quiet-title action in your county court — many states allow legal fees to be added to damages if the lender's failure was willful."
  },
  {
    "q": "How much does a title reissue cost in my state?",
    "a": "Title reissue fees in 2026 range from $4 (Arizona base title fee) to $77.25 (Florida) to $165 combined title and registration in Illinois. Common reference points: California $26, Texas $33, Florida $77.25, New York $50, New Jersey $60, Pennsylvania $58, Ohio $15, Washington $15 + $5.50 filing. Expedited or rush service typically adds $10–$50. Use the DMV calculator above to estimate the cost for your specific state."
  },
  {
    "q": "Can I sell my car before the new clean title arrives?",
    "a": "Technically yes in most states if you have the original title in hand with the lien release stamp from the lender, or a notarized Lien Release Letter. Many private buyers and almost all licensed dealers, however, will refuse to close until the new clean title arrives — the lien notation on the old title triggers a stop-sale at the buyer's DMV. If timing is tight, pay for expedited DMV processing or use a licensed third-party title service to walk the paperwork through. For dealer trade-ins the dealer can usually accept the lien release and process the title transfer on your behalf as part of the trade."
  },
  {
    "q": "Does the lien release also remove a salvage or rebuilt brand from the title?",
    "a": "No. A lien release only removes the lender's security interest. A salvage or rebuilt brand stays on the title until you complete the state's specific brand-removal inspection (e.g., California CHP VIN verification plus a certified rebuild inspection, Florida HSMV inspection, Texas TX-DMV salvage rebuild process). Brand-removal inspection fees range from $50 to $150 and are separate from any title reissue fee."
  },
  {
    "q": "What is the average cost of a new standard driver's license (Class D) in the United States?",
    "a": "The national average for a new standard (Class D/non-commercial) driver's license issuance fee is approximately $30–$89, with the total cost (including knowledge and skills tests) ranging from $50 to $160. California's combined DMV fees are around $82; Texas charges about $75 total; New York charges up to $130 for a standard DL. Fees are set by each state's DMV and updated periodically — always verify with your state's official DMV website before visiting."
  },
  {
    "q": "How much does a CDL Class A license cost compared to a Class B?",
    "a": "A CDL Class A (authorizing tractor-trailers and all combination vehicles) typically costs $75–$150 for the issuance fee alone, with total costs (permit + tests + issuance) reaching $200–$500+. A CDL Class B (straight heavy trucks, buses) usually runs $60–$120 issuance, with total costs of $150–$350. The main added cost of Class A is the more complex skills test, which can be $150–$300 at a third-party CDL testing facility. Both require a DOT physical exam ($75–$150 extra) and are federally regulated under FMCSA 49 CFR Part 383."
  },
  {
    "q": "Is the HazMat endorsement fee really set by the federal government?",
    "a": "Yes. The TSA (Transportation Security Administration) sets and collects the HazMat threat assessment (background check) fee, which is currently $86.50 per application under 49 CFR Part 1572. This federal fee is charged in addition to any state-level endorsement fee (typically $5–$30). The background check must be renewed every 5 years, and applicants must submit fingerprints at an approved enrollment center. This is the only driver's license-related fee directly set at the federal level."
  },
  {
    "q": "Does a driver's license validity period affect the real cost?",
    "a": "Absolutely. A license valid for 8 years at a $72 issuance fee costs $9/year, while a 4-year license at $60 costs $15/year — a 67% higher annualized cost. States like California issue licenses valid for 5 years; Florida issues up to 8 years for drivers under 80. CDLs are typically valid for 4–5 years federally under FMCSA rules (49 CFR §383.73), but the required annual DOT medical certificate adds recurring costs regardless of the license's validity period."
  }
],
  sources: [
  {
    "name": "Consumer Financial Protection Bureau (CFPB) — Auto Loans & Lien Release Guidance",
    "url": "https://www.consumerfinance.gov/consumer-tools/auto-loans/"
  },
  {
    "name": "American Association of Motor Vehicle Administrators (AAMVA) — Title & Registration Best Practices and ELT Program List",
    "url": "https://www.aamva.org/topics/vehicle-title-and-registration"
  },
  {
    "name": "National Conference of State Legislatures (NCSL) — State Vehicle Title Laws",
    "url": "https://www.ncsl.org/transportation"
  },
  {
    "name": "California DMV — Lien Sale and Title Transfer (REG 227, REG 166)",
    "url": "https://www.dmv.ca.gov/portal/vehicle-registration/titles/"
  },
  {
    "name": "Florida HSMV — Electronic Lien and Title (ELT) Program",
    "url": "https://www.flhsmv.gov/motor-vehicles-tags-titles/electronic-lien-title/"
  },
  {
    "name": "FMCSA – Commercial Driver's License Standards (49 CFR Part 383)",
    "url": "https://www.fmcsa.dot.gov/registration/commercial-drivers-license/drivers"
  },
  {
    "name": "TSA – Hazardous Materials Endorsement Threat Assessment Program",
    "url": "https://www.tsa.gov/for-industry/hazmat-driver-license"
  },
  {
    "name": "DHS – REAL ID Enforcement Information",
    "url": "https://www.dhs.gov/real-id"
  },
  {
    "name": "AAMVA – Driver's License Fees by State (American Association of Motor Vehicle Administrators)",
    "url": "https://www.aamva.org/jurisdiction-info/"
  },
  {
    "name": "ANMAT – Código Alimentario Argentino (Law 18.284)",
    "url": "https://www.argentina.gob.ar/anmat/codigoalimentario"
  },
  {
    "name": "Wikipedia EN — Mercosur Member States",
    "url": "https://en.wikipedia.org/wiki/Mercosur"
  },
  {
    "name": "Wikipedia EN — Argentine National Identity Document (DNI)",
    "url": "https://en.wikipedia.org/wiki/Argentine_identity_card"
  },
  {
    "name": "Universidad de Buenos Aires – Ciclo Básico Común Official Site",
    "url": "https://www.uba.ar/contenido/15"
  },
  {
    "name": "UBA – CBC: Regulations and Academic Standing Rules",
    "url": "https://www.uba.ar/contenido/181"
  },
  {
    "name": "U.S. Department of State - Bureau of Consular Affairs",
    "url": "https://travel.state.gov"
  },
  {
    "name": "US Embassy Buenos Aires",
    "url": "https://ar.usembassy.gov"
  },
  {
    "name": "US Citizenship and Immigration Services",
    "url": "https://www.uscis.gov"
  }
],
  replaces: [
    '/en/auto-debt-free-certificate-cost', // Absorbida como caso calculable con formulaId certificado-libre-deuda-auto-costo.
    '/en/driver-license-cost-by-category', // Absorbida como caso calculable con formulaId licencia-conducir-costo-categoria-b1-a.
    '/en/food-handler-permit-cost', // Absorbida como caso calculable con formulaId libreta-sanitaria-costo-hueria-food.
    '/en/foreigner-residency-id-cost-argentina', // Absorbida como caso calculable con formulaId dni-extranjero-residencia-costo-migraciones.
    '/en/uba-cbc-requirements', // Absorbida como caso calculable con formulaId cbc-uba-materias-regularidad-requisitos.
    '/en/us-b1-b2-tourist-visa-cost', // Absorbida como caso calculable con formulaId visa-turismo-usa-ee-uu-costo-b1-b2.
  ],
  lastReviewed: '2026-08-16',
};
