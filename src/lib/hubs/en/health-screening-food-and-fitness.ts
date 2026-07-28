import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'en/health/health-screening-food-and-fitness',
  title: "What does this health or nutrition number mean? | Hacé Cuentas",
  description: "Decision hub with 15 calculations: Blood Alcohol Content (BAC) Calculator — Widmark Formula; Body Fat % Calculator by Skinfolds; Calories Burned Boxing — by Weight, Style & Duration; Burnout Index Calculator; Gluten in Foods: ppm Levels & Celiac-Safe Alternatives; Competition Weight Calculator: Ideal Range by Sport and Height; Complete Vegan Protein Combinations; FBI Criminal Background Check Cost 2026 (+ State & Employment Checks); Low FODMAP Foods: Complete Chart for IBS; Food pH and Alkalinity Calculator; Keto Macros Calculator — fat, protein & carbs for ketosis; Sleep Quality Calculator — Simplified Pittsburgh Index; Postpartum Depression Test — EPDS Edinburgh Scale; PRAL Calculator: Calculate Urine Acidity by Food; How Long Does Sunscreen Protect You? SPF Time Calculator.",
  silo: "Health decisions",
  siloHref: '/en/health',
  locale: 'en',
  eyebrow: "United States · Health decisions",
  h1: "What does this health or nutrition number mean?",
  lede: "Choose your case and fill in only its fields. This hub keeps all 15 original formulas and brings the decision into one page.",
  stamps: ['15 calculators included', 'Original formulas reused', 'Reviewed July 28, 2026'],
  resultLabel: "Your result",
  cases: { title: "What do you need to calculate?", intro: "Choose one case; the hub applies its original formula.", items: [
  {
    "id": "c1",
    "label": "Blood Alcohol Content (BAC) Calculator — Widmark Formula",
    "hint": "Blood alcohol content (BAC) is calculated with the Widmark formula: BAC = grams of alcohol ÷ (weight in kg × r) − (0.15 × hours elapsed), where r = 0.68 for males and 0.55 for females. Your body eliminates alcohol at ~0.15 g/L per hour. One standard beer (330ml, 5% ABV) produces roughly 0.25 g/L BAC in a 70 kg person and takes about 1.7 hours to clear. In the US, the legal driving limit is 0.08% BAC (0.8 g/L).",
    "yes": [
      "1 beer (330ml, 5%) ≈ 13g alcohol → ~0.25 g/L in a 70 kg person. 1 wine glass ≈ 15g. 1 shot whisky ≈ 14g. Elimination rate: **0.15 g/L per hour**. **If you drink, don't drive** — it's the law and it saves lives."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-16.",
    "answer": "Blood alcohol content (BAC) is calculated with the Widmark formula: BAC = grams of alcohol ÷ (weight in kg × r) − (0.15 × hours elapsed), where r = 0.68 for males and 0.55 for females. Your body eliminates alcohol at ~0.15 g/L per hour. One standard beer (330ml, 5% ABV) produces roughly 0.25 g/L BAC in a 70 kg person and takes about 1.7 hours to clear. In the US, the legal driving limit is 0.08% BAC (0.8 g/L)."
  },
  {
    "id": "c2",
    "label": "Body Fat % Calculator by Skinfolds",
    "hint": "Measure 3 skinfolds with calipers. Calculate density via Jackson-Pollock regression. Convert to % fat using Siri: (495÷density)−450. Standard error: ±3–4% vs. DEXA.",
    "yes": [
      "**Siri formula**: (495÷BD)−450 = % fat. **Men**: chest+abdomen+thigh measured on right side. **Women**: triceps+suprailiac+thigh. **Calibrated calipers** (Harpenden/Lange, 10 g/mm²) improve accuracy to ±1%."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-05-30.",
    "answer": "Measure 3 skinfolds with calipers. Calculate density via Jackson-Pollock regression. Convert to % fat using Siri: (495÷density)−450. Standard error: ±3–4% vs. DEXA."
  },
  {
    "id": "c3",
    "label": "Calories Burned Boxing — by Weight, Style & Duration",
    "hint": "A 170 lb (77 kg) boxer burns roughly 693 kcal/hour on the heavy bag (MET 9), 462 kcal/hour shadow boxing (MET 6), and 924 kcal/hour sparring (MET 12). Formula: calories = MET × weight_kg × hours.",
    "yes": [
      "Formula: **calories = MET × weight (kg) × hours**. Shadow boxing: 6 MET. Heavy bag: 9 MET. Sparring: 12 MET. Kickboxing: 10 MET."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-05-28.",
    "answer": "A 170 lb (77 kg) boxer burns roughly 693 kcal/hour on the heavy bag (MET 9), 462 kcal/hour shadow boxing (MET 6), and 924 kcal/hour sparring (MET 12). Formula: calories = MET × weight_kg × hours."
  },
  {
    "id": "c4",
    "label": "Burnout Index Calculator",
    "hint": "Burnout is a state of emotional, physical, and mental exhaustion caused by prolonged stress at work. The Maslach Burnout Inventory (MBI) is the most widely used assessment tool for measuring occupational burnout. This simplified version evaluates three key dimensions of burnout: emotional exhaustion, depersonalization (cynicism), and reduced sense of personal accomplishment.",
    "yes": [
      "**Maslach Burnout Inventory (MBI) Test**: Measures burnout across three dimensions—emotional exhaustion, cynicism, and personal accomplishment. Direct calculation based on your input values (1-10 scale). Results help you understand your burnout risk and identify areas for intervention."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-20.",
    "answer": "Burnout is a state of emotional, physical, and mental exhaustion caused by prolonged stress at work. The Maslach Burnout Inventory (MBI) is the most widely used assessment tool for measuring occupational burnout. This simplified version evaluates three key dimensions of burnout: emotional exhaustion, depersonalization (cynicism), and reduced sense of personal accomplishment."
  },
  {
    "id": "c5",
    "label": "Gluten in Foods: ppm Levels & Celiac-Safe Alternatives",
    "hint": "Wheat flour contains approximately 30,000 ppm of gluten; barley about 25,000 ppm. Conventional oats carry 100–300 ppm due to cross-contamination during milling. Rice, corn, quinoa, and potatoes are naturally gluten-free (0 ppm). The legal gluten-free threshold is 20 ppm (FDA/Codex) or 10 ppm in Argentina. 1 ppm = 1 mg gluten per kg of food.",
    "yes": [
      "Wheat flour contains ~30,000 ppm of gluten; barley ~25,000 ppm. Conventional oats carry 100–300 ppm due to cross-contamination. Rice, corn, quinoa, and potatoes are naturally gluten-free (0 ppm). The legal gluten-free threshold is 20 ppm (FDA/Codex) or 10 ppm (Argentina). To convert: 1 ppm = 1 mg gluten per kg of food."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-20.",
    "answer": "Wheat flour contains approximately 30,000 ppm of gluten; barley about 25,000 ppm. Conventional oats carry 100–300 ppm due to cross-contamination during milling. Rice, corn, quinoa, and potatoes are naturally gluten-free (0 ppm). The legal gluten-free threshold is 20 ppm (FDA/Codex) or 10 ppm in Argentina. 1 ppm = 1 mg gluten per kg of food."
  },
  {
    "id": "c6",
    "label": "Competition Weight Calculator: Ideal Range by Sport and Height",
    "hint": "Ideal competition weight depends on your sport and height. For a male runner at 175 cm, the competitive range is roughly 56–64 kg (BMI 18.5–21). For road cycling it's 58–67 kg (BMI 19–22). Powerlifting allows 77–107 kg (BMI 25–35). Enter your height and sport below for your exact window.",
    "yes": [
      "**Competitive weight = BMI_sport × height_m²**. Each sport has a characteristic BMI band: running males 18.5–21.0, road cycling 19–22, swimming 21–24, powerlifting 25–35. These reflect the body composition of elite competitors, not general population norms. Females use a 1–2 point lower BMI target than males in the same sport."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-07-24.",
    "answer": "Ideal competition weight depends on your sport and height. For a male runner at 175 cm, the competitive range is roughly 56–64 kg (BMI 18.5–21). For road cycling it's 58–67 kg (BMI 19–22). Powerlifting allows 77–107 kg (BMI 25–35). Enter your height and sport below for your exact window."
  },
  {
    "id": "c7",
    "label": "Complete Vegan Protein Combinations",
    "hint": "Legumes (lentils, beans, chickpeas) are low in methionine; grains (rice, wheat) are low in lysine. Combining them during the day gives you a complete protein. Lentils + rice reach PDCAAS ≈ 0.95 — nearly equivalent to meat. Tofu and quinoa are already complete proteins on their own.",
    "yes": [
      "**You don't need to combine at every meal** — daily variety is enough for healthy adults per the Academy of Nutrition and Dietetics 2016 position paper. For solo plant-protein meals, pairing a grain (low lysine) with a legume (low methionine) gives a complete amino acid profile. PDCAAS scores: lentils + rice ≈ 0.95, tofu + quinoa ≈ 1.0, hummus + pita ≈ 0.90."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-05-28.",
    "answer": "Legumes (lentils, beans, chickpeas) are low in methionine; grains (rice, wheat) are low in lysine. Combining them during the day gives you a complete protein. Lentils + rice reach PDCAAS ≈ 0.95 — nearly equivalent to meat. Tofu and quinoa are already complete proteins on their own."
  },
  {
    "id": "c8",
    "label": "FBI Criminal Background Check Cost 2026 (+ State & Employment Checks)",
    "hint": "An FBI criminal background check (Identity History Summary) costs $18 in 2026, plus $25–$50 if you use an FBI-approved Channeler for 1–3 day electronic delivery (~$53 total). State police checks run $5–$61 and FCRA employment screenings $25–$100.",
    "yes": [
      "Formula: **Base agency fee + Channeler / vendor service fee + (optional) apostille**. FBI IdHSC = $18 + $25–$50 Channeler. State checks $5–$61 depending on jurisdiction. FCRA employment screens $25–$100. Choose by purpose: immigration (FBI + apostille), employment (FCRA vendor), licensing (state DOJ)."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-05-28.",
    "answer": "An FBI criminal background check (Identity History Summary) costs $18 in 2026, plus $25–$50 if you use an FBI-approved Channeler for 1–3 day electronic delivery (~$53 total). State police checks run $5–$61 and FCRA employment screenings $25–$100."
  },
  {
    "id": "c9",
    "label": "Low FODMAP Foods: Complete Chart for IBS",
    "hint": "Low FODMAP foods safe for IBS include: rice, carrots, ripe bananas (1 medium), oats (up to 52 g), lactose-free yogurt (up to 170 g), hard cheeses, eggs, chicken, and most leafy greens. High FODMAP foods to avoid in the elimination phase: onions, garlic, apples, pears, regular milk, wheat bread, mushrooms, and most legumes. Onion and garlic are the most common triggers because they are very high in fructans (fermentable oligosaccharides). Serving size matters — many moderate-FODMAP foods are safe in small amounts.",
    "yes": [
      "Look up a food to instantly see its FODMAP level, safe serving size, and low-FODMAP alternatives. Based on the **Monash University FODMAP database** — the global gold standard. Results are informational; consult a registered dietitian for the full protocol."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-20.",
    "answer": "Low FODMAP foods safe for IBS include: rice, carrots, ripe bananas (1 medium), oats (up to 52 g), lactose-free yogurt (up to 170 g), hard cheeses, eggs, chicken, and most leafy greens. High FODMAP foods to avoid in the elimination phase: onions, garlic, apples, pears, regular milk, wheat bread, mushrooms, and most legumes. Onion and garlic are the most common triggers because they are very high in fructans (fermentable oligosaccharides). Serving size matters — many moderate-FODMAP foods are safe in small amounts."
  },
  {
    "id": "c10",
    "label": "Food pH and Alkalinity Calculator",
    "hint": "pH in foods determines whether they are acidic (<7), neutral (=7), or alkaline (7). While the alkaline diet theory is controversial—your body regulates blood pH independently—food pH does impact dental health, acid reflux symptoms, and kidney stone formation. This calculator shows the pH of 15 common foods and beverages based on FDA and FAO measurements.",
    "yes": [
      "Foods with pH<4 erode tooth enamel. For acid reflux, choose foods with **pH>5**. While 'alkaline diets' don't change blood pH, they do affect urine pH."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-16.",
    "answer": "pH in foods determines whether they are acidic (<7), neutral (=7), or alkaline (7). While the alkaline diet theory is controversial—your body regulates blood pH independently—food pH does impact dental health, acid reflux symptoms, and kidney stone formation. This calculator shows the pH of 15 common foods and beverages based on FDA and FAO measurements."
  },
  {
    "id": "c11",
    "label": "Keto Macros Calculator — fat, protein & carbs for ketosis",
    "hint": "A standard ketogenic diet uses roughly 72% of calories from fat, 23% from protein, and 5% from carbohydrates — keeping total carbs under 50 g/day to sustain nutritional ketosis (blood BHB ≥ 0.5 mmol/L). At 2,000 kcal: ~160 g fat, ~115 g protein, ~25 g carbs.",
    "yes": [
      "Standard keto split: **72% fat / 23% protein / 5% carbs**. At 2,000 kcal → 160 g fat, 115 g protein, 25 g carbs. Cutting goal applies a 20% calorie reduction; gaining applies a 15% surplus. Carbs stay at or below 25 g to ensure BHB ≥ 0.5 mmol/L."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-05-28.",
    "answer": "A standard ketogenic diet uses roughly 72% of calories from fat, 23% from protein, and 5% from carbohydrates — keeping total carbs under 50 g/day to sustain nutritional ketosis (blood BHB ≥ 0.5 mmol/L). At 2,000 kcal: ~160 g fat, ~115 g protein, ~25 g carbs."
  },
  {
    "id": "c12",
    "label": "Sleep Quality Calculator — Simplified Pittsburgh Index",
    "hint": "The Pittsburgh Sleep Quality Index (PSQI) is the most-used questionnaire in clinical research to assess sleep quality. This simplified version evaluates key components: latency (how long you take to fall asleep), duration, efficiency, disturbances, and subjective quality. A global score 5 indicates poor sleep quality.",
    "yes": [
      "**PSQI ≤5**: good sleep quality. **PSQI >5**: poor sleep quality. Components: latency (min to fall asleep), efficiency (% of time in bed sleeping), duration, and disturbances."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-05-30.",
    "answer": "The Pittsburgh Sleep Quality Index (PSQI) is the most-used questionnaire in clinical research to assess sleep quality. This simplified version evaluates key components: latency (how long you take to fall asleep), duration, efficiency, disturbances, and subjective quality. A global score 5 indicates poor sleep quality."
  },
  {
    "id": "c13",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale",
    "hint": "The Edinburgh Postnatal Depression Scale (EPDS) scores 0 to 30. A score of 0–9 indicates low risk of postpartum depression. 10–12 suggests possible mild depression and warrants a conversation with your provider. A score of 13 or above indicates probable postpartum depression and professional evaluation is recommended. If question 10 (self-harm thoughts) scores above 0, seek immediate help regardless of your total score.",
    "yes": [
      "EPDS cutoffs: **0–9** = low risk. **10–12** = possible mild depression (talk to your provider). **13–30** = probable postpartum depression (seek professional evaluation). **If question 10 > 0**: seek help immediately — call or text **988** (Suicide & Crisis Lifeline)."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-16.",
    "answer": "The Edinburgh Postnatal Depression Scale (EPDS) scores 0 to 30. A score of 0–9 indicates low risk of postpartum depression. 10–12 suggests possible mild depression and warrants a conversation with your provider. A score of 13 or above indicates probable postpartum depression and professional evaluation is recommended. If question 10 (self-harm thoughts) scores above 0, seek immediate help regardless of your total score."
  },
  {
    "id": "c14",
    "label": "PRAL Calculator: Calculate Urine Acidity by Food",
    "hint": "PRAL (Potential Renal Acid Load) was developed by Remer and Manz in 1995 and estimates how much acidity a food generates when metabolized, measured in mEq per 100 g. Positive values acidify urine (meats, cheeses, grains); negative values alkalinize it (fruits, vegetables).",
    "yes": [
      "**PRAL positive** acidifies urine; **negative** alkalinizes it. Protein and phosphorus push the score up; potassium, magnesium, and calcium pull it down. Daily target: aim for a net PRAL between −10 and +10 for optimal kidney health, and offset high-PRAL meals with fruits and vegetables in the same day."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-16.",
    "answer": "PRAL (Potential Renal Acid Load) was developed by Remer and Manz in 1995 and estimates how much acidity a food generates when metabolized, measured in mEq per 100 g. Positive values acidify urine (meats, cheeses, grains); negative values alkalinize it (fruits, vegetables)."
  },
  {
    "id": "c15",
    "label": "How Long Does Sunscreen Protect You? SPF Time Calculator",
    "hint": "Most people apply sunscreen once and assume they're covered all day — but that's one of the most common and costly mistakes in sun safety.",
    "yes": [
      "Protection time = your skin's natural burn time × SPF. A Type II person (≈10 min) wearing SPF 30 gets a theoretical 300 minutes — but reapply every 2 hours regardless, because real-world protection is far shorter."
    ],
    "warn": [
      "Informational result: verify the inputs and the applicable source."
    ],
    "plazo": "Data reviewed 2026-04-20.",
    "answer": "Most people apply sunscreen once and assume they're covered all day — but that's one of the most common and costly mistakes in sun safety."
  }
] },
  inputsTitle: "Your inputs",
  inputsIntro: "Fields are prefixed with the case they belong to. Other fields are ignored.",
  fields: [
  {
    "id": "c1__peso",
    "label": "Blood Alcohol Content (BAC) Calculator — Widmark Formula: Body weight (kg)",
    "type": "number",
    "value": 75,
    "min": 30,
    "max": 200,
    "step": 0.1,
    "thousands": false,
    "help": "Your body weight in kilograms. To convert: 1 lb = 0.454 kg."
  },
  {
    "id": "c1__sexo",
    "label": "Blood Alcohol Content (BAC) Calculator — Widmark Formula: Biological sex",
    "type": "select",
    "value": "m",
    "options": [
      {
        "value": "m",
        "label": "Male"
      },
      {
        "value": "f",
        "label": "Female"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__bebidas",
    "label": "Blood Alcohol Content (BAC) Calculator — Widmark Formula: Number of drinks",
    "type": "number",
    "value": 2,
    "min": 0,
    "max": 20,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__tipoBebida",
    "label": "Blood Alcohol Content (BAC) Calculator — Widmark Formula: Type of drink",
    "type": "select",
    "value": "cerveza_330",
    "options": [
      {
        "value": "cerveza_330",
        "label": "Beer 330ml can (5% ABV)"
      },
      {
        "value": "cerveza_500",
        "label": "Beer 500ml pint (5% ABV)"
      },
      {
        "value": "vino_150",
        "label": "Wine 150ml glass (13% ABV)"
      },
      {
        "value": "fernet_50",
        "label": "Spirits 50ml shot (39% ABV)"
      },
      {
        "value": "whisky_45",
        "label": "Whisky/Vodka 45ml shot (40% ABV)"
      },
      {
        "value": "champagne_150",
        "label": "Champagne 150ml glass (12% ABV)"
      },
      {
        "value": "vodka_45",
        "label": "Gin/Tequila 45ml shot (40% ABV)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__horas",
    "label": "Blood Alcohol Content (BAC) Calculator — Widmark Formula: Hours since your first drink",
    "type": "number",
    "value": 2,
    "min": 0,
    "max": 24,
    "step": 0.5,
    "thousands": false,
    "help": "Number of hours elapsed since you started drinking."
  },
  {
    "id": "c2__sexo",
    "label": "Body Fat % Calculator by Skinfolds: Sex",
    "type": "select",
    "value": "m",
    "options": [
      {
        "value": "m",
        "label": "Male"
      },
      {
        "value": "f",
        "label": "Female"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__edad",
    "label": "Body Fat % Calculator by Skinfolds: Age",
    "type": "number",
    "value": 30,
    "min": 15,
    "max": 80,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__peso",
    "label": "Body Fat % Calculator by Skinfolds: Weight (kg)",
    "type": "number",
    "value": 75,
    "min": 30,
    "max": 250,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c2__pliegue1",
    "label": "Body Fat % Calculator by Skinfolds: Skinfold 1 (mm) — Men: chest / Women: triceps",
    "type": "number",
    "value": 12,
    "min": 1,
    "max": 80,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c2__pliegue2",
    "label": "Body Fat % Calculator by Skinfolds: Skinfold 2 (mm) — Men: abdomen / Women: suprailiac",
    "type": "number",
    "value": 18,
    "min": 1,
    "max": 80,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c2__pliegue3",
    "label": "Body Fat % Calculator by Skinfolds: Skinfold 3 (mm) — Thigh (both)",
    "type": "number",
    "value": 15,
    "min": 1,
    "max": 80,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c3__pesoKg",
    "label": "Calories Burned Boxing — by Weight, Style & Duration: Body Weight (kg)",
    "type": "number",
    "value": 75,
    "step": 0.01,
    "thousands": false,
    "help": "Your weight in kilograms. To convert: 1 lb = 0.4536 kg (so 170 lb ≈ 77 kg, 150 lb ≈ 68 kg)."
  },
  {
    "id": "c3__tipo",
    "label": "Calories Burned Boxing — by Weight, Style & Duration: Session Type",
    "type": "select",
    "value": "sombra",
    "options": [
      {
        "value": "sombra",
        "label": "Shadow boxing (MET 6)"
      },
      {
        "value": "bolsa",
        "label": "Heavy bag (MET 9)"
      },
      {
        "value": "sparring",
        "label": "Sparring (MET 12)"
      },
      {
        "value": "kickboxing",
        "label": "Kickboxing (MET 10)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__minutos",
    "label": "Calories Burned Boxing — by Weight, Style & Duration: Duration (minutes)",
    "type": "number",
    "value": 45,
    "step": 1,
    "thousands": false,
    "help": "Total session duration in minutes. A typical 12-round session with 3-min rounds + 1-min rest = 48 minutes."
  },
  {
    "id": "c4__cansancioEmocional",
    "label": "Burnout Index Calculator: Emotional Exhaustion (1-10)",
    "type": "number",
    "value": 6,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__despersonalizacion",
    "label": "Burnout Index Calculator: Cynicism (1-10)",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__realizacionPersonal",
    "label": "Burnout Index Calculator: Personal Accomplishment (1-10)",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c5__alimento",
    "label": "Gluten in Foods: ppm Levels & Celiac-Safe Alternatives: Food to check",
    "type": "select",
    "value": "harina_trigo",
    "options": [
      {
        "value": "harina_trigo",
        "label": "Wheat Flour"
      },
      {
        "value": "arroz",
        "label": "Rice (white or brown)"
      },
      {
        "value": "maiz",
        "label": "Corn (corn flour, polenta)"
      },
      {
        "value": "cebada",
        "label": "Barley (grain or malt)"
      },
      {
        "value": "avena",
        "label": "Oats (conventional, uncertified)"
      },
      {
        "value": "quinoa",
        "label": "Quinoa (grain or flour)"
      },
      {
        "value": "papa",
        "label": "Potato / cassava / sweet potato"
      },
      {
        "value": "queso_duro",
        "label": "Hard Cheese (no additives)"
      },
      {
        "value": "yogur",
        "label": "Yogurt (check brand)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__altura",
    "label": "Competition Weight Calculator: Ideal Range by Sport and Height: Height (cm)",
    "type": "number",
    "value": 175,
    "min": 140,
    "max": 220,
    "step": 1,
    "thousands": false,
    "help": "Your height in centimeters."
  },
  {
    "id": "c6__sexo",
    "label": "Competition Weight Calculator: Ideal Range by Sport and Height: Biological Sex",
    "type": "select",
    "value": "masculino",
    "options": [
      {
        "value": "masculino",
        "label": "Male"
      },
      {
        "value": "femenino",
        "label": "Female"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__deporte",
    "label": "Competition Weight Calculator: Ideal Range by Sport and Height: Sport",
    "type": "select",
    "value": "running",
    "options": [
      {
        "value": "running",
        "label": "Running / Long Distance Track"
      },
      {
        "value": "ciclismo",
        "label": "Road Cycling"
      },
      {
        "value": "natacion",
        "label": "Swimming"
      },
      {
        "value": "futbol",
        "label": "Soccer"
      },
      {
        "value": "basquet",
        "label": "Basketball"
      },
      {
        "value": "boxeo",
        "label": "Boxing / MMA"
      },
      {
        "value": "powerlifting",
        "label": "Powerlifting"
      },
      {
        "value": "crossfit",
        "label": "CrossFit"
      },
      {
        "value": "tenis",
        "label": "Tennis / Padel"
      }
    ],
    "thousands": false
  },
  {
    "id": "c7__plato",
    "label": "Complete Vegan Protein Combinations: Dish",
    "type": "select",
    "value": "lentejas_arroz",
    "options": [
      {
        "value": "lentejas_arroz",
        "label": "Lentils & Rice"
      },
      {
        "value": "hummus_pan_pita",
        "label": "Hummus & Pita Bread"
      },
      {
        "value": "tofu_quinoa",
        "label": "Tofu & Quinoa"
      },
      {
        "value": "mani_pan_integral",
        "label": "Peanut Butter & Whole Wheat Bread"
      },
      {
        "value": "poroto_maiz",
        "label": "Beans & Corn"
      }
    ],
    "thousands": false
  },
  {
    "id": "c8__urgencia",
    "label": "FBI Criminal Background Check Cost 2026 (+ State & Employment Checks): Processing Option",
    "type": "select",
    "value": "comun",
    "options": [
      {
        "value": "comun",
        "label": "Standard 5 days"
      },
      {
        "value": "urg",
        "label": "Urgent 24 hours"
      },
      {
        "value": "exp",
        "label": "Express 3 hours"
      }
    ],
    "thousands": false
  },
  {
    "id": "c9__alimento",
    "label": "Low FODMAP Foods: Complete Chart for IBS: Food",
    "type": "select",
    "value": "cebolla",
    "options": [
      {
        "value": "cebolla",
        "label": "Onion"
      },
      {
        "value": "ajo",
        "label": "Garlic"
      },
      {
        "value": "manzana",
        "label": "Apple"
      },
      {
        "value": "pera",
        "label": "Pear"
      },
      {
        "value": "banana",
        "label": "Banana"
      },
      {
        "value": "zanahoria",
        "label": "Carrot"
      },
      {
        "value": "arroz",
        "label": "Rice"
      },
      {
        "value": "avena",
        "label": "Oats"
      },
      {
        "value": "leche",
        "label": "Milk"
      },
      {
        "value": "yogur_sin_lactosa",
        "label": "Lactose-free yogurt"
      }
    ],
    "thousands": false
  },
  {
    "id": "c10__alimento",
    "label": "Food pH and Alkalinity Calculator: Food",
    "type": "select",
    "value": "limon",
    "options": [
      {
        "value": "limon",
        "label": "Lemon"
      },
      {
        "value": "vinagre",
        "label": "Vinegar"
      },
      {
        "value": "gaseosa",
        "label": "Cola Soda"
      },
      {
        "value": "cafe",
        "label": "Coffee"
      },
      {
        "value": "tomate",
        "label": "Tomato"
      },
      {
        "value": "manzana",
        "label": "Apple"
      },
      {
        "value": "leche",
        "label": "Milk"
      },
      {
        "value": "agua",
        "label": "Pure Water"
      },
      {
        "value": "espinaca",
        "label": "Spinach"
      },
      {
        "value": "brocoli",
        "label": "Broccoli"
      },
      {
        "value": "banana",
        "label": "Banana"
      },
      {
        "value": "carne",
        "label": "Red Meat"
      },
      {
        "value": "palta",
        "label": "Avocado"
      },
      {
        "value": "almendra",
        "label": "Almonds"
      },
      {
        "value": "bicarbonato",
        "label": "Baking Soda"
      }
    ],
    "thousands": false
  },
  {
    "id": "c11__calorias",
    "label": "Keto Macros Calculator — fat, protein & carbs for ketosis: Daily Calories (kcal)",
    "type": "number",
    "value": 2000,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c11__objetivo",
    "label": "Keto Macros Calculator — fat, protein & carbs for ketosis: Goal",
    "type": "select",
    "value": "adelgazar",
    "options": [
      {
        "value": "adelgazar",
        "label": "Lose weight (−20% calories)"
      },
      {
        "value": "mantener",
        "label": "Maintain weight"
      },
      {
        "value": "ganar",
        "label": "Gain muscle (+15% calories)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c12__latencia",
    "label": "Sleep Quality Calculator — Simplified Pittsburgh Index: Minutes to fall asleep (average)",
    "type": "number",
    "value": 20,
    "min": 0,
    "max": 180,
    "step": 5,
    "thousands": false
  },
  {
    "id": "c12__duracion",
    "label": "Sleep Quality Calculator — Simplified Pittsburgh Index: Actual sleep hours per night",
    "type": "number",
    "value": 7,
    "min": 1,
    "max": 14,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c12__horasCama",
    "label": "Sleep Quality Calculator — Simplified Pittsburgh Index: Hours spent in bed",
    "type": "number",
    "value": 8,
    "min": 2,
    "max": 16,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c12__perturbaciones",
    "label": "Sleep Quality Calculator — Simplified Pittsburgh Index: Frequency of night awakenings",
    "type": "select",
    "value": "1",
    "options": [
      {
        "value": "0",
        "label": "None"
      },
      {
        "value": "1",
        "label": "Less than 1 time/week"
      },
      {
        "value": "2",
        "label": "1-2 times/week"
      },
      {
        "value": "3",
        "label": "3 or more times/week"
      }
    ],
    "thousands": false
  },
  {
    "id": "c12__calidadSubjetiva",
    "label": "Sleep Quality Calculator — Simplified Pittsburgh Index: How do you rate your sleep overall?",
    "type": "select",
    "value": "1",
    "options": [
      {
        "value": "0",
        "label": "Very good"
      },
      {
        "value": "1",
        "label": "Fairly good"
      },
      {
        "value": "2",
        "label": "Fairly bad"
      },
      {
        "value": "3",
        "label": "Very bad"
      }
    ],
    "thousands": false
  },
  {
    "id": "c12__disfuncionDiurna",
    "label": "Sleep Quality Calculator — Simplified Pittsburgh Index: Do you have daytime sleepiness or low energy?",
    "type": "select",
    "value": "1",
    "options": [
      {
        "value": "0",
        "label": "Never"
      },
      {
        "value": "1",
        "label": "Mild (1-2 times/week)"
      },
      {
        "value": "2",
        "label": "Moderate (3-4 times/week)"
      },
      {
        "value": "3",
        "label": "Severe (every day)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds1",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: In the past 7 days: I have been able to laugh and see the funny side of things",
    "type": "select",
    "value": "0",
    "options": [
      {
        "value": "0",
        "label": "As much as I always could"
      },
      {
        "value": "1",
        "label": "Not quite as much now"
      },
      {
        "value": "2",
        "label": "Definitely not as much now"
      },
      {
        "value": "3",
        "label": "Not at all"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds2",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: I have looked forward to things with enjoyment as I always did",
    "type": "select",
    "value": "0",
    "options": [
      {
        "value": "0",
        "label": "As much as I always did"
      },
      {
        "value": "1",
        "label": "Rather less than I used to"
      },
      {
        "value": "2",
        "label": "Definitely less than I used to"
      },
      {
        "value": "3",
        "label": "Hardly at all"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds3",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: I have blamed myself unnecessarily when things went wrong",
    "type": "select",
    "value": "3",
    "options": [
      {
        "value": "3",
        "label": "Yes, most of the time"
      },
      {
        "value": "2",
        "label": "Yes, some of the time"
      },
      {
        "value": "1",
        "label": "Not very often"
      },
      {
        "value": "0",
        "label": "No, never"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds4",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: I have been anxious or worried for no good reason",
    "type": "select",
    "value": "0",
    "options": [
      {
        "value": "0",
        "label": "No, not at all"
      },
      {
        "value": "1",
        "label": "Hardly ever"
      },
      {
        "value": "2",
        "label": "Yes, sometimes"
      },
      {
        "value": "3",
        "label": "Yes, very often"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds5",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: I have felt scared or panicky for no very good reason",
    "type": "select",
    "value": "3",
    "options": [
      {
        "value": "3",
        "label": "Yes, quite a lot"
      },
      {
        "value": "2",
        "label": "Yes, sometimes"
      },
      {
        "value": "1",
        "label": "No, not much"
      },
      {
        "value": "0",
        "label": "No, not at all"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds6",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: Things have been getting on top of me",
    "type": "select",
    "value": "3",
    "options": [
      {
        "value": "3",
        "label": "Yes, most of the time I haven't been able to cope"
      },
      {
        "value": "2",
        "label": "Yes, sometimes I haven't been able to cope"
      },
      {
        "value": "1",
        "label": "No, most of the time I have coped"
      },
      {
        "value": "0",
        "label": "No, I have been coping as well as ever"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds7",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: I have been so unhappy that I have had difficulty sleeping even when the baby is asleep",
    "type": "select",
    "value": "3",
    "options": [
      {
        "value": "3",
        "label": "Yes, most of the time"
      },
      {
        "value": "2",
        "label": "Yes, sometimes"
      },
      {
        "value": "1",
        "label": "Not very often"
      },
      {
        "value": "0",
        "label": "No, not at all"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds8",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: I have felt sad and miserable",
    "type": "select",
    "value": "3",
    "options": [
      {
        "value": "3",
        "label": "Yes, most of the time"
      },
      {
        "value": "2",
        "label": "Yes, quite often"
      },
      {
        "value": "1",
        "label": "Not very often"
      },
      {
        "value": "0",
        "label": "No, not at all"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds9",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: I have been so unhappy that I have been crying",
    "type": "select",
    "value": "3",
    "options": [
      {
        "value": "3",
        "label": "Yes, most of the time"
      },
      {
        "value": "2",
        "label": "Yes, quite often"
      },
      {
        "value": "1",
        "label": "Only occasionally"
      },
      {
        "value": "0",
        "label": "No, never"
      }
    ],
    "thousands": false
  },
  {
    "id": "c13__epds10",
    "label": "Postpartum Depression Test — EPDS Edinburgh Scale: I have thought of harming myself",
    "type": "select",
    "value": "3",
    "options": [
      {
        "value": "3",
        "label": "Yes, quite often"
      },
      {
        "value": "2",
        "label": "Sometimes"
      },
      {
        "value": "1",
        "label": "Hardly ever"
      },
      {
        "value": "0",
        "label": "No, never"
      }
    ],
    "thousands": false
  },
  {
    "id": "c14__proteina",
    "label": "PRAL Calculator: Calculate Urine Acidity by Food: Protein per 100 g",
    "type": "number",
    "value": 25,
    "suffix": "g",
    "min": 0,
    "max": 100,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c14__fosforo",
    "label": "PRAL Calculator: Calculate Urine Acidity by Food: Phosphorus per 100 g",
    "type": "number",
    "value": 200,
    "suffix": "mg",
    "min": 0,
    "max": 2000,
    "step": 1,
    "thousands": false,
    "help": "Typically 2–3% of the food's total weight."
  },
  {
    "id": "c14__potasio",
    "label": "PRAL Calculator: Calculate Urine Acidity by Food: Potassium per 100 g",
    "type": "number",
    "value": 300,
    "suffix": "mg",
    "min": 0,
    "max": 3000,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c14__magnesio",
    "label": "PRAL Calculator: Calculate Urine Acidity by Food: Magnesium per 100 g",
    "type": "number",
    "value": 20,
    "suffix": "mg",
    "min": 0,
    "max": 500,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c14__calcio",
    "label": "PRAL Calculator: Calculate Urine Acidity by Food: Calcium per 100 g",
    "type": "number",
    "value": 15,
    "suffix": "mg",
    "min": 0,
    "max": 2000,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c15__tipoPiel",
    "label": "How Long Does Sunscreen Protect You? SPF Time Calculator: Fitzpatrick skin type (I-VI)",
    "type": "select",
    "value": "I",
    "options": [
      {
        "value": "I",
        "label": "I — Very fair, always burns"
      },
      {
        "value": "II",
        "label": "II — Fair, usually burns"
      },
      {
        "value": "III",
        "label": "III — Light brown, sometimes burns"
      },
      {
        "value": "IV",
        "label": "IV — Olive/medium brown, rarely burns"
      },
      {
        "value": "V",
        "label": "V — Dark brown, very rarely burns"
      },
      {
        "value": "VI",
        "label": "VI — Deeply pigmented, never burns"
      }
    ],
    "thousands": false
  },
  {
    "id": "c15__spf",
    "label": "How Long Does Sunscreen Protect You? SPF Time Calculator: SPF of your sunscreen",
    "type": "number",
    "value": 50,
    "step": 1,
    "thousands": false
  }
],
  fineprint: "Informational estimate. Verify inputs and official sources before acting.",
  chart: { type: 'bars', caption: "The main numeric outputs returned by the selected formula." },
  breakdownTitle: "Formula results",
  breakdownIntro: "Each row is returned by the original calculator formula.",
  faq: [
  {
    "q": "How long does it take for one beer to leave your system?",
    "a": "A standard 330ml beer (13g alcohol) in a 70 kg person produces ~0.25 g/L BAC. At the elimination rate of 0.15 g/L per hour, your body clears it in roughly **1.7 hours**. A 500ml pint takes about 2.7 hours for the same person."
  },
  {
    "q": "How long does alcohol stay in your bloodstream?",
    "a": "Your liver eliminates alcohol at a constant rate of approximately **0.15 g/L per hour** (range: 0.10–0.20 g/L/h). After 4 standard drinks, most people take **6–8 hours** to reach zero BAC. Only time works — coffee, water, and exercise do not speed the process."
  },
  {
    "q": "What is a standard drink in the US?",
    "a": "One US standard drink contains **14 grams of pure alcohol**, equivalent to: 355ml beer (5% ABV), 150ml wine (12% ABV), or 45ml distilled spirits (40% ABV). Our calculator uses similar volumes with accurate ABV-based gram calculations."
  },
  {
    "q": "Can you fail a breathalyzer after just one beer?",
    "a": "Yes, it's possible. One beer can produce a BAC of 0.02–0.04% (0.2–0.4 g/L), which is detectable by a breathalyzer. Though it's below the 0.08% legal limit in the US, you could still be charged with DUI if your driving is impaired."
  },
  {
    "q": "Why do women have a higher BAC than men from the same amount of alcohol?",
    "a": "Women have a lower Widmark factor (r = 0.55 vs. 0.68 for men), reflecting lower body water content, less of the stomach enzyme alcohol dehydrogenase (ADH), and typically higher body fat percentage. At the same weight and consumption, women's BAC is typically **20–30% higher** than men's."
  },
  {
    "q": "Does eating before drinking affect your BAC?",
    "a": "Yes, food eaten before or during drinking slows alcohol absorption from the stomach into the bloodstream, **delaying and lowering the peak BAC**. However, it doesn't reduce the total amount of alcohol processed — the final number of hours to reach zero remains similar."
  },
  {
    "q": "How many drinks can you have and still legally drive in the US?",
    "a": "For a 70 kg male: roughly 2 standard drinks (28g alcohol) produces ~0.59 g/L (0.059%), which is under the 0.08% limit. But impairment starts at very low BAC levels. The safest answer is **zero drinks** if you plan to drive — individual metabolism varies widely."
  },
  {
    "q": "How accurate is this BAC calculator?",
    "a": "The Widmark formula has an estimated margin of **±20%** because actual BAC depends on metabolism, genetics, food consumed, hydration, medications, and alcohol tolerance. **Never use this calculator to decide whether to drive.** If you've been drinking, don't drive."
  },
  {
    "q": "What's the difference between g/L and % BAC?",
    "a": "They are equivalent measurements. **0.8 g/L = 0.08% BAC** (the US legal limit). To convert: divide g/L by 10 to get %. The US and UK typically express BAC as a percentage; other countries use g/L or g/dL."
  },
  {
    "q": "What should I do if I've been drinking and need to get home?",
    "a": "Call Uber, Lyft, or a local taxi. Designate a sober driver before you start drinking. Many areas have drunk-driving prevention hotlines that offer free rides. A rideshare costs far less than a DUI fine, license suspension, or the risk of harming yourself or others."
  },
  {
    "q": "How accurate is the Jackson-Pollock 3-Site method compared to DEXA?",
    "a": "When performed by a trained technician, the Jackson-Pollock 3-Site method has a standard error of estimate (SEE) of approximately **±3–4% body fat** versus DEXA (considered a gold standard). Jackson & Pollock's original 1978 study (Medicine & Science in Sports) reported an SEE of 3.4% for men and 3.9% for women. DEXA itself carries an SEE of ~1–2%, but costs $50–$200 per scan. For tracking relative changes over time (rather than absolute values), skinfolds are a practical and widely validated alternative."
  },
  {
    "q": "What type of caliper should I use?",
    "a": "Research-validated protocols use **Harpenden** or **Lange** calipers, which apply a standardized jaw pressure of **10 g/mm²** across the full measurement range. Consumer-grade plastic calipers (e.g., Accu-Measure) are less consistent and typically have test-retest errors of ±3–5%, compared to ±1% for professional calipers. For gym or home use, plastic calipers are acceptable for rough tracking, but clinical or research assessments require calibrated metal calipers."
  },
  {
    "q": "Where exactly are the measurement sites located?",
    "a": "**Men — Chest:** diagonal fold halfway between the anterior axillary line and the nipple. **Men — Abdomen:** vertical fold 2 cm to the right of the navel. **Both sexes — Thigh:** vertical fold on the anterior midline of the thigh, halfway between the inguinal crease and the proximal border of the patella. **Women — Triceps:** vertical fold on the posterior midline of the upper arm, halfway between the acromion and olecranon. **Women — Suprailiac:** diagonal fold just above the iliac crest at the anterior axillary line."
  },
  {
    "q": "Can I use this calculator if I am over 60 or under 18?",
    "a": "The Jackson-Pollock equations were validated on adults **aged 18–61**. Applying them outside this range increases prediction error because body fat distribution and density of lean tissue change significantly with aging (lean mass density decreases after ~60) and in adolescents (whose bodies are still developing). For older adults, the **Durnin-Womersley 4-site method** or **DEXA** is generally preferred. For children and teens, CDC growth charts and pediatric-specific skinfold equations (e.g., Slaughter et al., 1988) are recommended."
  }
],
  sources: [
  {
    "name": "NHTSA — Drunk Driving Prevention",
    "url": "https://www.nhtsa.gov/risky-driving/drunk-driving"
  },
  {
    "name": "CDC — Alcohol and Public Health: Blood Alcohol Concentration",
    "url": "https://www.cdc.gov/alcohol/fact-sheets/alcohol-use.htm"
  },
  {
    "name": "MedlinePlus (NIH) — Blood Alcohol Level",
    "url": "https://medlineplus.gov/ency/article/003409.htm"
  },
  {
    "name": "WHO — Alcohol Fact Sheet",
    "url": "https://www.who.int/news-room/fact-sheets/detail/alcohol"
  },
  {
    "name": "NIH — Body Composition Assessment Methods (National Library of Medicine / PubMed)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/690997/",
    "publisher": "PubMed (NCBI)"
  },
  {
    "name": "CDC — Measuring Body Fat in Adults (NHANES Body Composition Procedures Manual)",
    "url": "https://www.cdc.gov/nchs/data/nhanes/nhanes_11_12/Body_Measures_Procedures_Manual.pdf",
    "publisher": "CDC"
  },
  {
    "name": "Wikipedia — Jackson-Pollock Body Density Equations",
    "url": "https://en.wikipedia.org/wiki/Body_fat_percentage#Skinfold_methods",
    "publisher": "Wikipedia"
  },
  {
    "name": "Ainsworth BE et al. — Compendium of Physical Activities (2011, Med Sci Sports Exerc) — MET values for boxing, sparring, and combat sports",
    "url": "https://pubmed.ncbi.nlm.nih.gov/21681120/"
  },
  {
    "name": "ACSM — American College of Sports Medicine, Guidelines for Exercise Testing and Prescription, 11th Edition",
    "url": "https://www.acsm.org"
  },
  {
    "name": "Borsheim E & Bahr R — Effect of exercise intensity, duration and mode on post-exercise oxygen consumption (2003, Sports Medicine)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/14606925/"
  },
  {
    "name": "Helms ER et al. — Evidence-based recommendations for natural bodybuilding contest preparation (2014, JISSN)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/24864135/"
  },
  {
    "name": "USA Boxing — National Governing Body, licensing and amateur rules",
    "url": "https://www.usaboxing.org"
  },
  {
    "name": "NSCA — National Strength and Conditioning Association, Essentials of Strength Training and Conditioning",
    "url": "https://www.nsca.com"
  },
  {
    "name": "Centers for Disease Control and Prevention (CDC)",
    "url": "https://www.cdc.gov/"
  },
  {
    "name": "MedlinePlus (U.S. National Library of Medicine)",
    "url": "https://medlineplus.gov/"
  },
  {
    "name": "World Health Organization (WHO)",
    "url": "https://www.who.int/"
  },
  {
    "name": "Codex Alimentarius — Standard for Gluten-Free Foods (FAO/WHO)",
    "url": "https://www.fao.org/4/w3663s/W3663S06.htm"
  },
  {
    "name": "FDA — Gluten-Free Labeling of Foods",
    "url": "https://www.fda.gov/food/nutrition-food-labeling-and-critical-nutrients/gluten-free-labeling-foods"
  },
  {
    "name": "Celiac Disease Foundation — What is Celiac Disease?",
    "url": "https://celiac.org/about-celiac-disease/what-is-celiac-disease/"
  },
  {
    "name": "NIDDK — Celiac Disease (National Institutes of Health)",
    "url": "https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease"
  },
  {
    "name": "Beyond Celiac — Oats and Celiac Disease",
    "url": "https://www.beyondceliac.org/celiac-disease/the-gluten-free-diet/oats/"
  },
  {
    "name": "ACSM's Guidelines for Exercise Testing and Prescription, 11th Ed.",
    "url": "https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription"
  },
  {
    "name": "NIH National Institute on Aging — Sarcopenia and Muscle Loss Research",
    "url": "https://www.nia.nih.gov/news/research-consortium-including-nih-proposes-diagnostic-criteria-sarcopenia"
  },
  {
    "name": "Lohman TG — Advances in Body Composition Assessment, Human Kinetics (1992)",
    "url": "https://www.tandfonline.com/doi/abs/10.1080/02701367.1993.10608782"
  },
  {
    "name": "IOC Medical Commission — Relative Energy Deficiency in Sport (RED-S)",
    "url": "https://www.olympic.org/athlete365/health/red-s/"
  },
  {
    "name": "Academy of Nutrition and Dietetics — Position Paper on Vegetarian Diets (Melina, Craig, Levin 2016)",
    "url": "https://jandonline.org/article/S2212-2672(16)31192-3/fulltext"
  },
  {
    "name": "Young VR, Pellett PL — Plant proteins in relation to human protein and amino acid nutrition (Am J Clin Nutr 1994, PMID 8172124)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/8172124/"
  },
  {
    "name": "Mathai JK et al. — DIAAS values of selected plant proteins (Br J Nutr 2017, PMID 28166859)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/28166859/"
  },
  {
    "name": "Hallberg L, Hulthén L — Iron absorption and vitamin C (Am J Clin Nutr 1989, PMID 2911999)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/2911999/"
  },
  {
    "name": "Hevia-Larraín V et al. — Vegan vs. omnivore protein for resistance training (Sports Medicine 2021, PMID 33599941)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/33599941/"
  },
  {
    "name": "USDA FoodData Central — Nutrient database",
    "url": "https://fdc.nal.usda.gov/"
  },
  {
    "name": "FBI — Identity History Summary Checks",
    "url": "https://www.fbi.gov/services/cjis/identity-history-summary-checks"
  },
  {
    "name": "FBI — Approved Channelers list",
    "url": "https://www.fbi.gov/services/cjis/identity-history-summary-checks/list-of-fbi-approved-channelers"
  },
  {
    "name": "EEOC — Consideration of Arrest and Conviction Records in Employment Decisions",
    "url": "https://www.eeoc.gov/laws/guidance/enforcement-guidance-consideration-arrest-and-conviction-records-employment-decisions"
  },
  {
    "name": "FTC — Background Checks: What Employers Need to Know (FCRA)",
    "url": "https://www.ftc.gov/business-guidance/resources/background-checks-what-employers-need-know"
  },
  {
    "name": "US Department of State — Office of Authentications (Apostille)",
    "url": "https://travel.state.gov/content/travel/en/records-and-authentications/authenticate-your-document/office-of-authentications.html"
  },
  {
    "name": "Monash University FODMAP Diet — Official database and app",
    "url": "https://www.monashfodmap.com"
  },
  {
    "name": "Gibson PR, Shepherd SJ — Evidence-based dietary management of functional gastrointestinal symptoms (J Gastroenterol Hepatol, 2010)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/20136989/"
  },
  {
    "name": "Rome Foundation — Rome IV Diagnostic Criteria for Functional GI Disorders",
    "url": "https://theromefoundation.org/rome-iv/"
  },
  {
    "name": "International Foundation for Functional Gastrointestinal Disorders",
    "url": "https://www.iffgd.org"
  },
  {
    "name": "WHO - Healthy Diet",
    "url": "https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet"
  },
  {
    "name": "NIH - Office of Dietary Supplements",
    "url": "https://ods.od.nih.gov/"
  },
  {
    "name": "Academy of Nutrition and Dietetics",
    "url": "https://www.eatright.org/"
  },
  {
    "name": "Virta Health — Two-Year Outcomes of a Novel Continuous Care Intervention for T2D",
    "url": "https://www.virtahealth.com/research"
  },
  {
    "name": "Athinarayanan SJ et al. — Long-Term Effects of a Ketogenic Diet in T2D (Frontiers in Endocrinology 2019)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/31231311/"
  },
  {
    "name": "Norwitz NG, Soto-Mota A et al. — Elevated LDL Cholesterol with a Carbohydrate-Restricted Diet (Curr Opin Endocrinol Diabetes Obes 2022)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/35938987/"
  },
  {
    "name": "Phinney SD & Volek JS — The Art and Science of Low Carbohydrate Living (Beyond Obesity LLC)",
    "url": "https://www.artandscienceoflowcarb.com"
  },
  {
    "name": "ISSN Position Stand: Diets and Body Composition (Aragon et al., JISSN 2017)",
    "url": "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0174-y"
  },
  {
    "name": "National Sleep Foundation",
    "url": "https://www.thensf.org/"
  },
  {
    "name": "National Sleep Foundation — Sleep Duration Recommendations",
    "url": "https://www.thensf.org/how-many-hours-of-sleep-do-you-really-need/"
  },
  {
    "name": "National Sleep Foundation — Jet Lag",
    "url": "https://www.sleepfoundation.org/travel-and-sleep/jet-lag"
  },
  {
    "name": "Cox JL, Holden JM, Sagovsky R — Detection of postnatal depression: development of the 10-item EPDS (Br J Psychiatry, 1987)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/3651732/"
  },
  {
    "name": "ACOG Committee Opinion #757 — Screening for Perinatal Depression (2018)",
    "url": "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2018/11/screening-for-perinatal-depression"
  },
  {
    "name": "Postpartum Support International (PSI) — Resources and helpline",
    "url": "https://www.postpartum.net/"
  },
  {
    "name": "Eberhard-Gran M et al. — Review of validation studies of the EPDS (Acta Psychiatr Scand, 2001)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/11722353/"
  },
  {
    "name": "Remer T, Manz F. PRAL formulation 1995",
    "url": "https://pubmed.ncbi.nlm.nih.gov/7797810/"
  },
  {
    "name": "National Kidney Foundation",
    "url": "https://www.kidney.org/"
  },
  {
    "name": "American Academy of Dermatology — Sunscreen FAQs",
    "url": "https://www.aad.org/public/everyday-care/sun-protection/sunscreen-patients/sunscreen-faqs"
  },
  {
    "name": "World Health Organization — UV radiation and the UV Index",
    "url": "https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index"
  },
  {
    "name": "Skin Cancer Foundation — Ask the Expert: SPF",
    "url": "https://www.skincancer.org/blog/ask-the-expert-does-a-high-spf-protect-my-skin-better/"
  }
],
  replaces: [
    '/en/blood-alcohol-bac-widmark', // Absorbida como caso calculable con formulaId alcohol-sangre-bac.
    '/en/body-fat-skinfolds-jackson-pollock', // Absorbida como caso calculable con formulaId grasa-corporal-pliegues.
    '/en/boxing-calories-burned', // Absorbida como caso calculable con formulaId boxeo-calorias-quemadas-rounds-peso.
    '/en/burnout-mbi-assessment', // Absorbida como caso calculable con formulaId burnout-indice-carga-laboral-test-mbi.
    '/en/celiac-gluten-free-tacc-foods', // Absorbida como caso calculable con formulaId celiaco-gluten-alimentos-ppm-sin-tacc.
    '/en/competition-weight-calculator', // Absorbida como caso calculable con formulaId peso-objetivo-competicion.
    '/en/complete-vegan-protein-combinations', // Absorbida como caso calculable con formulaId vegana-proteina-completa-combinacion-aminoacidos.
    '/en/criminal-background-certificate-cost', // Absorbida como caso calculable con formulaId certificado-antecedentes-penales-costo.
    '/en/fodmap-foods-intolerance-chart', // Absorbida como caso calculable con formulaId fodmap-alimentos-intolerancia-sii-tabla.
    '/en/food-ph-acidity-calculator', // Absorbida como caso calculable con formulaId pH-alimento-alcalinidad.
    '/en/keto-macros-deficit-complete', // Absorbida como caso calculable con formulaId keto-macros-cetogenica-deficit-completo.
    '/en/pittsburgh-sleep-quality-index', // Absorbida como caso calculable con formulaId calidad-sueno-pittsburgh.
    '/en/postpartum-depression-screening', // Absorbida como caso calculable con formulaId depresion-posparto-test.
    '/en/pral-urine-acidity', // Absorbida como caso calculable con formulaId acidez-orina-alimentos.
    '/en/spf-sun-protection-minutes-skin-type', // Absorbida como caso calculable con formulaId spf-proteccion-solar-minutos-piel.
  ],
  lastReviewed: '2026-07-28',
};
