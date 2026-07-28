import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'en/cars/titles-registration-and-transfer',
  title: "What will it cost to title, register or transfer my car? | Hacé Cuentas",
  description: "Decision hub with 3 calculations: New Car Registration Fee (DNRPA) in Argentina 2026; Transfer Your Car Registration to Another Province; Used Car Transfer Cost.",
  silo: "Car paperwork",
  siloHref: '/en/cars',
  locale: 'en',
  eyebrow: "United States · Car paperwork",
  h1: "What will it cost to title, register or transfer my car?",
  lede: "Choose your case and fill in only its fields. This hub keeps all 3 original formulas and brings the decision into one page.",
  stamps: ['3 calculators included', 'Original formulas reused', 'Reviewed July 28, 2026'],
  resultLabel: "Your result",
  cases: { title: "What do you need to calculate?", intro: "Choose one case; the hub applies its original formula.", items: [
  {
    "id": "c1",
    "label": "New Car Registration Fee (DNRPA) in Argentina 2026",
    "hint": "Total Registration Cost = (Fiscal Value × 5%) + (Fiscal Value × Provincial Stamp Rate). Example: $30,000 × 5% = $1,500 DNRPA fee + $30,000 × 1.5% (CABA) = $450 sellos → $1,950 total. In Buenos Aires Province (3.6% sellos), the same vehicle costs $2,580 (5% + 3.6% = 8.6%).",
    "yes": [
      "**Total Registration Cost = (Fiscal Value × 5%) + (Fiscal Value × Provincial Stamp Rate).** Example: $30,000 × 5% = $1,500 DNRPA fee + $30,000 × 1.5% (CABA) = $450 sellos → **$1,950 total**. In Buenos Aires Province (3.6% sellos), the same vehicle costs $2,580 (5% + 3.6% = 8.6%)."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-19.",
    "answer": "Total Registration Cost = (Fiscal Value × 5%) + (Fiscal Value × Provincial Stamp Rate). Example: $30,000 × 5% = $1,500 DNRPA fee + $30,000 × 1.5% (CABA) = $450 sellos → $1,950 total. In Buenos Aires Province (3.6% sellos), the same vehicle costs $2,580 (5% + 3.6% = 8.6%)."
  },
  {
    "id": "c2",
    "label": "Transfer Your Car Registration to Another Province",
    "hint": "Transferring a car registration between Argentine provinces — a procedure officially known as cambio de radicación or transferencia interprovincial — involves paying a combination of national and provincial taxes, notarial fees, and administrative charges that together can easily exceed 2-3% of the vehicle's fiscal value.",
    "yes": [
      "**Total Transfer Cost ≈ 1.5% (national tax) + 1–3% (origin stamp tax) + $15,000–$80,000 ARS flat fee (destination registration) + notarial fees (~$50,000–$120,000 ARS)** — on a $30,000,000 ARS vehicle, expect ~$350,000–$600,000 ARS all-in."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-19.",
    "answer": "Transferring a car registration between Argentine provinces — a procedure officially known as cambio de radicación or transferencia interprovincial — involves paying a combination of national and provincial taxes, notarial fees, and administrative charges that together can easily exceed 2-3% of the vehicle's fiscal value."
  },
  {
    "id": "c3",
    "label": "Used Car Transfer Cost",
    "hint": "The Used Car Transfer Cost Calculator estimates the total fees and taxes owed when transferring ownership of a used vehicle in Argentina. It combines DNRPA (Dirección Nacional de los Registros de la Propiedad del Automotor) registration fees with province-level transfer taxes.",
    "yes": [
      "**Total Transfer Cost = DNRPA Fee (~1.5% of car value) + Provincial Tax (1%–3.5% of car value)**. On a $20,000,000 ARS vehicle in Buenos Aires Province, expect roughly $900,000 ARS in combined fees and taxes."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-19.",
    "answer": "The Used Car Transfer Cost Calculator estimates the total fees and taxes owed when transferring ownership of a used vehicle in Argentina. It combines DNRPA (Dirección Nacional de los Registros de la Propiedad del Automotor) registration fees with province-level transfer taxes."
  }
] },
  inputsTitle: "Your inputs",
  inputsIntro: "Fields are prefixed with the case they belong to. Other fields are ignored.",
  fields: [
  {
    "id": "c1__valor",
    "label": "New Car Registration Fee (DNRPA) in Argentina 2026: Vehicle value",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c1__provincia",
    "label": "New Car Registration Fee (DNRPA) in Argentina 2026: Province",
    "type": "select",
    "value": "caba",
    "options": [
      {
        "value": "caba",
        "label": "CABA"
      },
      {
        "value": "pba",
        "label": "Buenos Aires"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__provOrigen",
    "label": "Transfer Your Car Registration to Another Province: Origin Province",
    "type": "select",
    "value": "caba",
    "options": [
      {
        "value": "caba",
        "label": "CABA"
      },
      {
        "value": "pba",
        "label": "Buenos Aires"
      },
      {
        "value": "cba",
        "label": "Córdoba"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__provDestino",
    "label": "Transfer Your Car Registration to Another Province: Destination Province",
    "type": "select",
    "value": "caba",
    "options": [
      {
        "value": "caba",
        "label": "CABA"
      },
      {
        "value": "pba",
        "label": "Buenos Aires"
      },
      {
        "value": "cba",
        "label": "Córdoba"
      },
      {
        "value": "sfe",
        "label": "Santa Fe"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__valor",
    "label": "Transfer Your Car Registration to Another Province: Vehicle Value",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__valor",
    "label": "Used Car Transfer Cost: Car Value",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__provincia",
    "label": "Used Car Transfer Cost: State/Province",
    "type": "select",
    "value": "caba",
    "options": [
      {
        "value": "caba",
        "label": "CABA"
      },
      {
        "value": "pba",
        "label": "Buenos Aires Province"
      },
      {
        "value": "cba",
        "label": "Córdoba"
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
    "q": "What is the DNRPA and why does it charge a fee for new car registration?",
    "a": "The **DNRPA** (Dirección Nacional de los Registros de la Propiedad del Automotor) is Argentina's national motor vehicle registry, established by **Decree-Law 6582/58**. It is the sole legal authority empowered to register motor vehicles, issue ownership titles (*título del automotor*), record liens, and process transfers across the country. The arancel funds the administration of this federal registry system, which maintains records for tens of millions of vehicles. Without paying the fee and completing the inscription, the buyer is **not** the legal owner of the vehicle even if they hold the dealership invoice — they cannot insure, transfer, or sell the car. The fee is mandatory and non-refundable once filed."
  },
  {
    "q": "Is the 5% DNRPA fee the same across all Argentine provinces?",
    "a": "Yes. The base DNRPA arancel of **5% for a 0km inscripción inicial is a federal rate** set by national resolution and applies uniformly in all 23 provinces and CABA. What varies by province is the **impuesto de sellos** (stamp duty), which is a separate provincial tax layered on top of the national fee. Provincial rates in 2026 range from **0% in Chubut** to **3.6% in Buenos Aires Province**. This is why two identical $30,000 vehicles can have total registration costs of $1,500 in Chubut versus $2,580 in Buenos Aires Province — the federal portion is the same ($1,500), but the provincial portion differs by $1,080."
  },
  {
    "q": "What is the difference between the DNRPA fee and 'sellos'?",
    "a": "The **DNRPA fee (arancel)** is a federal charge paid to the national registry for the legal act of inscribing the vehicle's ownership. **Sellos (impuesto de sellos)** is a provincial tax levied on the contract of sale itself, collected by each province's tax authority — **AGIP** in CABA, **ARBA** in Buenos Aires Province, **API** in Santa Fe, **DGR** in most other provinces. Both charges are mandatory and both are calculated on the vehicle's fiscal value, but they go to different government entities: the DNRPA fee to the national treasury, the sellos to the provincial treasury. They cannot be substituted for one another, and both must be paid before the title is issued."
  },
  {
    "q": "Can I register a new car in a province where I don't live to pay lower stamp taxes?",
    "a": "**No.** Legally, the vehicle must be registered in the province of the buyer's **fiscal domicile** — the address registered with AFIP under your CUIL or CUIT. Registering elsewhere to exploit lower stamp tax rates (for example, choosing **Neuquén at 0.5% over Buenos Aires Province at 3.6%**) is considered tax evasion under provincial fiscal codes. Penalties include: retroactive collection of the unpaid stamp duty in the correct province, fines of 50-200% of the evaded amount, complications when renewing the annual patente, and difficulty selling the vehicle later because the title shows a province inconsistent with the owner's actual residence. ARBA and other provincial agencies actively cross-check buyer addresses against fiscal records."
  },
  {
    "q": "Does the registration fee apply to the sticker price or a different value?",
    "a": "The fee applies to the **valor de plaza** — the official market reference value published in the DNRPA/AFIP valuation tables — **not** the negotiated purchase price. For a brand-new 0km vehicle, this value typically matches or closely approximates the manufacturer's official list price (precio de lista). If you negotiate a discount from $30,000 down to $27,000, the DNRPA fee is still computed on the $30,000 (or close to it) reference value. For imported vehicles, the customs-declared CIF value plus duties may also factor into the fiscal value determination. Always ask the DNRPA registry or your gestoría for the exact valor de plaza applicable to your specific make, model and year before signing the contract."
  },
  {
    "q": "How often does the DNRPA update its tariff schedule?",
    "a": "The DNRPA typically issues updated arancel resolutions **at least once per year**, usually aligned with Argentina's federal budget cycle (January) or major inflation adjustments. However, given Argentina's historically high inflation (exceeding 200% year-on-year in 2024 and triple-digit rates in 2023), **interim updates have been issued mid-year** — sometimes 2 or 3 times in a single calendar year. To budget accurately, always verify the current arancel on the official DNRPA website (**dnrpa.gov.ar**) or with your local registry office before finalizing the purchase. The published rate as a percentage (5%) has been stable for several years; the peso-denominated minimums and maximums per vehicle category are what get updated."
  },
  {
    "q": "What other costs should I expect on top of the DNRPA fee and sellos when buying a new car in Argentina?",
    "a": "Beyond the DNRPA fee (5%) and provincial sellos (0.5%–3.6%), expect: **(1) Gestoría fee** — the registry agent's processing charge, typically $80–$200 USD equivalent depending on complexity; **(2) Mandatory insurance** — at minimum, third-party liability (*seguro obligatorio* or *responsabilidad civil*) must be active at the moment of registration, costing $300–$800/year depending on coverage; **(3) Annual patente** — a recurring provincial vehicle tax, distinct from the one-time stamp duty, typically 2-4% of fiscal value per year; **(4) Plates and cédulas issuance** — fixed fees of roughly $50-$100 USD equivalent; **(5) VTV (Verificación Técnica Vehicular)** — although the first VTV is typically not required for 0km units in their first 2-3 years."
  }
],
  sources: [
  {
    "name": "DNRPA — Dirección Nacional de los Registros de la Propiedad del Automotor (Official Site)",
    "url": "https://www.dnrpa.gov.ar"
  },
  {
    "name": "Wikipedia EN — Vehicle Registration Plates of Argentina",
    "url": "https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Argentina"
  },
  {
    "name": "AFIP – Valuación de Automotores y Motovehículos (Tabla Oficial)",
    "url": "https://www.afip.gob.ar/genericos/novedades/automotores.asp"
  },
  {
    "name": "Wikipedia – Impuesto de sellos (Argentina)",
    "url": "https://es.wikipedia.org/wiki/Impuesto_de_sellos"
  },
  {
    "name": "AFIP - Costos y Régimen Simplificado",
    "url": "https://www.afip.gob.ar/monotributo/"
  },
  {
    "name": "Wikipedia — Common European Framework of Reference for Languages (CEFR), including guided learning hours",
    "url": "https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages"
  },
  {
    "name": "AFIP — Personal de Casas Particulares",
    "url": "https://www.afip.gob.ar/casasparticulares"
  },
  {
    "name": "Wikipedia – Frame rate (frame time formula and perception thresholds)",
    "url": "https://en.wikipedia.org/wiki/Frame_rate"
  },
  {
    "name": "AFIP - Factura y Régimen General",
    "url": "https://www.afip.gob.ar/facturacion/"
  },
  {
    "name": "Wikipedia — Gigabyte (1 GiB = 1.024 MiB, base binaria vs decimal)",
    "url": "https://es.wikipedia.org/wiki/Gigabyte"
  },
  {
    "name": "AFIP - Monotributo categorías y topes",
    "url": "https://www.afip.gob.ar/monotributo/categorias.asp"
  },
  {
    "name": "Wikipedia — Daylight saving time by country",
    "url": "https://en.wikipedia.org/wiki/Daylight_saving_time_by_country"
  },
  {
    "name": "Wikipedia — Técnica Pomodoro",
    "url": "https://es.wikipedia.org/wiki/T%C3%A9cnica_Pomodoro"
  },
  {
    "name": "Wikipedia: Large language model — Tokenization and cost overview",
    "url": "https://en.wikipedia.org/wiki/Large_language_model"
  },
  {
    "name": "Wikipedia – Universidad de Buenos Aires",
    "url": "https://en.wikipedia.org/wiki/University_of_Buenos_Aires"
  },
  {
    "name": "Wikipedia – Growing Degree Day (thermal time model)",
    "url": "https://en.wikipedia.org/wiki/Growing_degree_day"
  },
  {
    "name": "Wikipedia — Heron's Formula (with proof, history, and generalizations)",
    "url": "https://en.wikipedia.org/wiki/Heron%27s_formula"
  },
  {
    "name": "Wikipedia — Año luz (con factores de conversión oficiales)",
    "url": "https://es.wikipedia.org/wiki/A%C3%B1o_luz"
  },
  {
    "name": "Wikipedia — Día del Padre (fechas por país)",
    "url": "https://es.wikipedia.org/wiki/D%C3%ADa_del_Padre"
  },
  {
    "name": "Wikipedia — Día del Maestro (fechas por país)",
    "url": "https://es.wikipedia.org/wiki/D%C3%ADa_del_maestro"
  },
  {
    "name": "Wikipedia — Día del Abuelo",
    "url": "https://es.wikipedia.org/wiki/D%C3%ADa_del_Abuelo"
  },
  {
    "name": "Wikipedia — UTC",
    "url": "https://es.wikipedia.org/wiki/Tiempo_universal_coordinado"
  },
  {
    "name": "Wikipedia — Shoelace formula",
    "url": "https://en.wikipedia.org/wiki/Shoelace_formula"
  },
  {
    "name": "Wikipedia — Eclipse solar del 12 de agosto de 2026",
    "url": "https://es.wikipedia.org/wiki/Eclipse_solar_del_12_de_agosto_de_2026"
  },
  {
    "name": "Wikipedia — Algoritmo de Fisher–Yates (barajado / muestreo sin reemplazo)",
    "url": "https://es.wikipedia.org/wiki/Algoritmo_de_Fisher-Yates"
  },
  {
    "name": "Wikipedia — Distribución uniforme discreta (probabilidad pareja en un rango)",
    "url": "https://es.wikipedia.org/wiki/Distribuci%C3%B3n_uniforme_discreta"
  },
  {
    "name": "Wikipedia — JPEG (algoritmo DCT y niveles de calidad)",
    "url": "https://es.wikipedia.org/wiki/JPEG"
  },
  {
    "name": "Wikipedia – List of languages by total number of speakers",
    "url": "https://en.wikipedia.org/wiki/List_of_languages_by_total_number_of_speakers"
  },
  {
    "name": "Wikipedia – Forgetting Curve (Ebbinghaus, 1885)",
    "url": "https://en.wikipedia.org/wiki/Forgetting_curve"
  },
  {
    "name": "Wikipedia — Gregorian Calendar (Leap Year Algorithm)",
    "url": "https://en.wikipedia.org/wiki/Gregorian_calendar"
  },
  {
    "name": "Wikipedia – Data-rate units (bit/s, Mbps, Gbps definitions)",
    "url": "https://en.wikipedia.org/wiki/Data-rate_units"
  },
  {
    "name": "Wikipedia — Cross-linguistic Interference",
    "url": "https://en.wikipedia.org/wiki/Cross-linguistic_interference"
  },
  {
    "name": "Wikipedia — Grading Systems by Country",
    "url": "https://en.wikipedia.org/wiki/Grading_systems_by_country"
  },
  {
    "name": "Wikipedia — Gas mark (UK temperature scale history and table)",
    "url": "https://en.wikipedia.org/wiki/Gas_mark"
  },
  {
    "name": "Wikipedia – Rate limiting",
    "url": "https://en.wikipedia.org/wiki/Rate_limiting"
  },
  {
    "name": "Wikipedia — Words per minute — includes silent reading speed research",
    "url": "https://en.wikipedia.org/wiki/Words_per_minute"
  },
  {
    "name": "Wikipedia – High Availability (Nines terminology and uptime table)",
    "url": "https://en.wikipedia.org/wiki/High_availability"
  },
  {
    "name": "Wikipedia – Peukert's Law (discharge rate effect on battery capacity)",
    "url": "https://en.wikipedia.org/wiki/Peukert%27s_law"
  }
],
  replaces: [
    '/en/registro-dnrpa-auto-0km-arancel', // Absorbida como caso calculable con formulaId registro-dnrpa-auto-0km-arancel.
    '/en/transfer-car-registration-province', // Absorbida como caso calculable con formulaId titularidad-caratular-auto-trasladar-provincia.
    '/en/used-car-transfer-cost', // Absorbida como caso calculable con formulaId costo-transferencia-auto-0km-usado.
  ],
  lastReviewed: '2026-07-28',
};
