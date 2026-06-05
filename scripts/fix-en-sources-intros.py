#!/usr/bin/env python3
"""
Fix boilerplate in calcs-en: replace mismatched math/physics sources
(NIST/Khan/Wolfram trio) with topic-appropriate REAL sources already in
the repo, and rewrite templated salud/finanzas intros to calc-specific text.

- Source-fix targets: trio calcs (Wolfram MathWorld + Khan Academy) EXCEPT
  matematica (where those sources are genuinely correct).
- Every URL used here is already deployed elsewhere in the repo (verified),
  so there are zero invented/placeholder URLs.
- Run with --apply to write; default is dry-run.
"""
import json, glob, os, sys
from urllib.parse import urlparse

EN = "src/content/calcs-en"
APPLY = "--apply" in sys.argv

# ---------------------------------------------------------------- sources
def S(name, url): return {"name": name, "url": url}

# Health / nutrition / sports-medicine
ODS        = S("NIH Office of Dietary Supplements", "https://ods.od.nih.gov/")
USDA_FDC   = S("USDA FoodData Central", "https://fdc.nal.usda.gov/")
DGA        = S("USDA Dietary Guidelines for Americans 2020–2025", "https://www.dietaryguidelines.gov/")
HARVARD    = S("Harvard T.H. Chan School of Public Health — The Nutrition Source", "https://www.hsph.harvard.edu/nutritionsource/")
JISSN      = S("Journal of the International Society of Sports Nutrition (JISSN)", "https://jissn.biomedcentral.com/")
ACOG       = S("American College of Obstetricians and Gynecologists (ACOG)", "https://www.acog.org/")
MEDLINE    = S("MedlinePlus (U.S. National Library of Medicine)", "https://medlineplus.gov/")
CDC        = S("Centers for Disease Control and Prevention (CDC)", "https://www.cdc.gov/")
CDC_HW     = S("CDC — Healthy Weight, Nutrition, and Physical Activity", "https://www.cdc.gov/healthyweight/index.html")
CDC_PA     = S("CDC — Physical Activity Guidelines for Americans", "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html")
NHLBI      = S("NIH National Heart, Lung, and Blood Institute (NHLBI)", "https://www.nhlbi.nih.gov/")
NHLBI_BMI  = S("NIH NHLBI — Calculate Your Body Mass Index", "https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm")
NIDDK      = S("NIH National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)", "https://www.niddk.nih.gov/")
NIDDK_BWP  = S("NIH NIDDK — Body Weight Planner", "https://www.niddk.nih.gov/bwp")
AHA        = S("American Heart Association", "https://www.heart.org/")
AHA_HR     = S("American Heart Association — Target Heart Rates", "https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates")
WHO        = S("World Health Organization (WHO)", "https://www.who.int/")
FDA        = S("U.S. Food and Drug Administration (FDA)", "https://www.fda.gov/")
FDA_CAFF   = S("U.S. FDA — How Much Caffeine Is Too Much?", "https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much")
ACSM       = S("American College of Sports Medicine (ACSM)", "https://www.acsm.org/")
NSCA       = S("National Strength and Conditioning Association (NSCA)", "https://www.nsca.com/")

# US finance
IRS        = S("Internal Revenue Service (IRS)", "https://www.irs.gov/")
IRS550     = S("IRS Publication 550 — Investment Income and Expenses", "https://www.irs.gov/publications/p550")
IRS936     = S("IRS Publication 936 — Home Mortgage Interest Deduction", "https://www.irs.gov/publications/p936")
SEC        = S("U.S. SEC — Investor.gov", "https://www.investor.gov/")
CFPB       = S("Consumer Financial Protection Bureau (CFPB)", "https://www.consumerfinance.gov/")
CFPB_HOME  = S("CFPB — Owning a Home", "https://www.consumerfinance.gov/owning-a-home/")
CFPB_AUTO  = S("CFPB — Auto Loans", "https://www.consumerfinance.gov/consumer-tools/auto-loans/")
FED        = S("U.S. Federal Reserve", "https://www.federalreserve.gov/")
FDIC       = S("U.S. Federal Deposit Insurance Corporation (FDIC)", "https://www.fdic.gov/")
FREDDIE    = S("Freddie Mac Primary Mortgage Market Survey (PMMS)", "https://www.freddiemac.com/pmms")
BLS        = S("U.S. Bureau of Labor Statistics (BLS)", "https://www.bls.gov/")
DOL        = S("U.S. Department of Labor", "https://www.dol.gov/")
SSA        = S("U.S. Social Security Administration", "https://www.ssa.gov/")
FMCSA      = S("U.S. DOT — FMCSA (Federal Motor Carrier Safety Administration)", "https://www.fmcsa.dot.gov/")

# Argentina finance / law
BCRA       = S("Banco Central de la República Argentina (BCRA)", "https://www.bcra.gob.ar/")
BCRA_VARS  = S("BCRA — Principales Variables", "https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp")
CNV        = S("Comisión Nacional de Valores (CNV) — Argentina", "https://www.cnv.gov.ar/")
BYMA       = S("Bolsas y Mercados Argentinos (BYMA)", "https://www.byma.com.ar/")
ARCA       = S("ARCA (ex-AFIP) — Agencia de Recaudación y Control Aduanero", "https://www.arca.gob.ar/")
AFIP       = S("AFIP — Administración Federal de Ingresos Públicos", "https://www.afip.gob.ar/")
AR_TRABAJO = S("Argentina.gob.ar — Ministerio de Trabajo", "https://www.argentina.gob.ar/trabajo")
AR_LCT     = S("Ley 20.744 de Contrato de Trabajo (LCT) — Argentina", "https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552")
CCYC       = S("Código Civil y Comercial de la Nación (Ley 26.994) — Argentina", "https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975")
AR_CONSUM  = S("Argentina.gob.ar — Defensa del Consumidor", "https://www.argentina.gob.ar/produccion/defensadelconsumidor")

# Construction
ACI        = S("American Concrete Institute (ACI)", "https://www.concrete.org/")
ASTM       = S("ASTM International", "https://www.astm.org/")
ICC        = S("International Code Council (ICC) — Building Codes", "https://codes.iccsafe.org/")
TCNA       = S("Tile Council of North America (TCNA)", "https://www.tcnatile.com/")
DOE_ES     = S("U.S. Department of Energy — Energy Saver", "https://www.energy.gov/energysaver")
NIST       = S("National Institute of Standards and Technology (NIST)", "https://www.nist.gov/")
NIST_SP811 = S("NIST Special Publication 811 — Guide for the Use of the SI", "https://www.nist.gov/pml/special-publication-811")

# Education
NCES       = S("U.S. National Center for Education Statistics (NCES)", "https://nces.ed.gov/")
STUDENTAID = S("U.S. Federal Student Aid (studentaid.gov)", "https://studentaid.gov/")
FSI        = S("U.S. Foreign Service Institute — Language Difficulty Rankings", "https://www.state.gov/foreign-language-training/")
ED         = S("U.S. Department of Education", "https://www.ed.gov/")

# Cooking
FSIS       = S("USDA Food Safety and Inspection Service (FSIS)", "https://www.fsis.usda.gov/")
SCA        = S("Specialty Coffee Association (SCA)", "https://sca.coffee/")

# Auto / energy / environment
FUELECON   = S("U.S. DOE/EPA — FuelEconomy.gov", "https://www.fueleconomy.gov/")
EPA        = S("U.S. Environmental Protection Agency (EPA)", "https://www.epa.gov/")
EPA_VEH    = S("U.S. EPA — Greenhouse Gas Emissions from a Typical Passenger Vehicle", "https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle")
EPA_GHG    = S("U.S. EPA — Greenhouse Gas Equivalencies Calculator", "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator")
EIA        = S("U.S. Energy Information Administration (EIA)", "https://www.eia.gov/")
ENERGYSTAR = S("ENERGY STAR (U.S. EPA)", "https://www.energystar.gov/")
NHTSA      = S("U.S. National Highway Traffic Safety Administration (NHTSA)", "https://www.nhtsa.gov/")

# Tech / science
IEEE       = S("IEEE Standards Association", "https://standards.ieee.org/")
CSRC       = S("NIST Computer Security Resource Center (CSRC)", "https://csrc.nist.gov/")
AWS        = S("Amazon Web Services — Official Pricing", "https://aws.amazon.com/")
PHYSNIST   = S("NIST — Fundamental Physical Constants (CODATA)", "https://physics.nist.gov/cgi-bin/cuu/Value?gn")
WEBBOOK    = S("NIST Chemistry WebBook", "https://webbook.nist.gov/")

# Pets / garden / family / language
AKC        = S("American Kennel Club (AKC)", "https://www.akc.org/")
AVMA       = S("American Veterinary Medical Association (AVMA)", "https://www.avma.org/")
WSAVA      = S("World Small Animal Veterinary Association (WSAVA)", "https://wsava.org/")
NRCS       = S("USDA Natural Resources Conservation Service (NRCS)", "https://www.nrcs.usda.gov/")
PLANTHARDY = S("USDA Plant Hardiness Zone Map", "https://planthardiness.ars.usda.gov/")
HEALTHYKID = S("American Academy of Pediatrics — HealthyChildren.org", "https://www.healthychildren.org/")

# allowlist of domains we are allowed to emit (everything above lives in-repo)
def dom(u): return urlparse(u).netloc.replace("www.", "")
ALLOW = set()
for v in list(globals().values()):
    if isinstance(v, dict) and "url" in v:
        ALLOW.add(dom(v["url"]))

# ---------------------------------------------------------- finanzas kits (explicit per-slug)
AR_BONDS    = [CNV, BYMA, BCRA]
AR_MONETARY = [BCRA, BCRA_VARS]
AR_TAX      = [ARCA, AFIP]
AR_LABOR    = [AR_TRABAJO, AR_LCT]
AR_PROPERTY = [CCYC, AR_CONSUM]
AR_FAMILY   = [CCYC, AR_TRABAJO]
CRYPTO      = [SEC, CFPB]
INVEST      = [SEC, FED]
SAVINGS     = [CFPB, FDIC]
US_LABOR    = [BLS, DOL, IRS]
MORTGAGE    = [FREDDIE, CFPB_HOME, IRS936]

FIN = {
  "al30-gd30-bond-yield": AR_BONDS,
  "bond-al30-al35-al41-yield": AR_BONDS,
  "cedear-dividend-yield-2026": AR_BONDS,
  "alyc-commissions-calculator": [CNV, BYMA],
  "bcra-interest-rate-savings-impact": AR_MONETARY,
  "monetary-policy-rate-tpm-return": AR_MONETARY,
  "iva-refund-debit-card": AR_TAX,
  "cedular-investment-income-tax": AR_TAX,
  "vacation-days-seniority-lct": AR_LABOR,
  "annual-bonus-net": [IRS, DOL],
  "ira-401k-argentina-equivalent": [SEC, SSA],
  "child-support-percentage-salary": AR_FAMILY,
  "cft-personal-loan-calculator": [BCRA, AR_CONSUM],
  "condo-fees-apartment-m2-category": AR_PROPERTY,
  "lease-comparison-2-vs-3-years": AR_PROPERTY,
  "rent-to-own-property-calculator": AR_PROPERTY,
  "fideicomiso-construccion-aporte-cuotas": [CCYC, CNV],
  "property-deed-transfer-cost": [CCYC, ARCA],
  "bogleheads-3-fund-portfolio-calculator": INVEST,
  "bond-modified-duration": INVEST,
  "bond-present-value-zero-coupon": INVEST,
  "emergency-fund-calculator-months-expenses": SAVINGS,
  "employee-vs-freelance-income": US_LABOR,
  "financial-independence-fire-movement": INVEST,
  "fixed-deposit-net-annual-returns": [FDIC, FED],
  "freelance-rate-usd-per-hour-by-experience": [BLS, IRS],
  "minimum-wage-2026-comparison": [DOL, BLS],
  "money-market-fund-yield": INVEST,
  "moving-truck-cost-calculator": [FMCSA, CFPB],
  "rule-of-72-doubling-calculator": INVEST,
  "safe-deposit-box-bank-cost-comparison": [FDIC, CFPB],
  "sharpe-ratio-backtest-calculator": INVEST,
  "stock-options-vesting-tech-startup": [SEC, IRS],
  "total-employment-cost-with-taxes": US_LABOR,
  "airdrop-historical-value-tokens-qualifying": CRYPTO,
  "bitcoin-halving-2028-proyeccion": CRYPTO,
  "bridge-fee-cripto-crosschain-costo": CRYPTO,
  "btc-nasdaq-sp500-correlation": INVEST,
  "cold-wallet-vs-hot-wallet-riesgo": CRYPTO,
  "crypto-balance-to-local-currency": CRYPTO,
  "dca-bitcoin-historical-returns": CRYPTO,
  "ethereum-gas-fee-calculator": CRYPTO,
  "funding-rate-perpetual-bitcoin-cost": CRYPTO,
  "leverage-trading-liquidation-price": CRYPTO,
  "nft-royalty-creator-secondary-market": CRYPTO,
  "pnl-futures-long-short-perpetual": CRYPTO,
  "portfolio-60-40-crypto-traditional-allocation": CRYPTO,
  "usdt-vs-usdc-commission-exchange": CRYPTO,
  "yield-farming-impermanent-loss-pool": CRYPTO,
}

def has(blob, *kw): return any(k in blob for k in kw)

def route(cat, slug, blob):
    """Return 2-4 sources for a non-finanzas calc by keyword."""
    if cat == "salud":
        if has(blob, "caffeine", "cafeina", "coffee"):
            return [FDA_CAFF, ODS, MEDLINE]
        if has(blob, "cpr", "heimlich", "choking", "anaphylaxis", "epinephrine", "first-aid", "first aid", " bls ", "resuscitation"):
            return [AHA, MEDLINE, CDC]
        if has(blob, "creatine", "creatina", "protein", "whey", "beta-alanine", "pre-workout", "suplementos-deportivos", "supplement stack", "amino"):
            return [ODS, JISSN, USDA_FDC]
        if has(blob, "vitamin", "vitamina", "calcium", "calcio", "iron", "ferritin", "zinc", "magnes", "omega", "b12", "folate", "folic", "probiotic", "probiotico", "cfu", "rda", "dha", "epa"):
            return [ODS, MEDLINE, USDA_FDC]
        if has(blob, "pregnan", "ovulation", "fertil", "menstrual", "estrogen", "progesterone", "ovarian", "amh", "menopause", "perimenopause", "due-date", "due date", "gestation", "conception", "prenatal", "trimester"):
            return [ACOG, MEDLINE, CDC]
        if has(blob, "bmi", "body-fat", "body fat", "body-composition", "body composition", "obesity", "overweight", "waist", "circumference", "visceral", "subcutaneous", "ideal weight", "ideal-weight", "bmr", "tdee", "deficit", "plateau", "caloric", "weight loss", "weight-loss"):
            return [CDC_HW, NHLBI_BMI, NIDDK_BWP]
        if has(blob, "heart", "blood pressure", "blood-pressure", "cholesterol", "cardiovascular", "lipid", "triglyceride", "glucose", "glycemic", "spo2", "oxygen saturation", "hypertension", "dash"):
            return [AHA, NHLBI, MEDLINE]
        if has(blob, "gfr", "creatinine", "glomerular", "kidney", "renal"):
            return [NIDDK, MEDLINE, CDC]
        if has(blob, "hydration", "electrolyte", "dehydrat", "fluid intake", "water intake"):
            return [ACSM, CDC, ODS]
        if has(blob, "step", "exercise", "physical activity", "physical-activity", "workout", "training", "hypertrophy", "pilates", "rpe", "rir", "sets", "reps"):
            return [CDC_PA, ACSM, AHA]
        if has(blob, "calorie", "macro", "carb", "sugar", "fiber", "sodium", "salt", "diet", "meal", "nutrition", "eating", "food", "fasting", "digestion", "mediterranean", "vegan", "gluten", "celiac", "alcohol"):
            return [DGA, USDA_FDC, HARVARD]
        return [CDC, MEDLINE, WHO]
    if cat == "deportes":
        if has(blob, "run", "pace", "marathon", "5k", "10k", "race", "vo2", "riegel", "cooper", "tempo", "sprint"):
            return [ACSM, CDC_PA]
        if has(blob, "1rm", "one-rep", "strength", "power", "lift", "watt", "critical-power", "critical power", "deadlift", "squat", "bench"):
            return [NSCA, ACSM]
        if has(blob, "heart rate", "heart-rate", "zone", "bpm", "max hr"):
            return [AHA_HR, ACSM]
        return [ACSM, NSCA, CDC_PA]
    if cat == "construccion":
        if has(blob, "concrete", "mortar", "screed", "hormigon", "rebar", "footing", "slab", "foundation"):
            return [ACI, ASTM]
        if has(blob, "btu", "hvac", "air condition", "air-condition", "heating", "cooling", "insulation", "water heater", "water-heater", "boiler", "thermal", "ventilation", "cfm"):
            return [DOE_ES, ENERGYSTAR]
        if has(blob, "soil", "lawn", "grass", "seed", "garden", "topsoil", "mulch"):
            return [NRCS, PLANTHARDY]
        if has(blob, "tile", "ceramic", "porcelain", "grout"):
            return [TCNA, ASTM]
        if has(blob, "brick", "block", "masonry", " wall"):
            return [ASTM, ICC]
        return [ASTM, ICC, NIST]
    if cat == "educacion":
        if has(blob, "language", "cefr", "mcer", "vocabular", "fluency", "idiom", "english", "spanish", "bilingual", "fsi", "srs", "spaced rep"):
            return [FSI, NCES]
        if has(blob, "loan", "financial aid", "financial-aid", "tuition", "scholarship", "fafsa", "student debt", "carrera", "costo"):
            return [STUDENTAID, NCES]
        return [NCES, ED]
    if cat == "cocina":
        if has(blob, "safety", "temperature", "thaw", "defrost", "storage", "internal temp", "haccp", "spoil", "fridge", "refriger"):
            return [FSIS, FDA]
        if has(blob, "coffee", "espresso", "brew", "cafe"):
            return [SCA, USDA_FDC]
        return [USDA_FDC, FDA]
    if cat == "automotor":
        if has(blob, "loan", "lease", "payment", "financ", "depreciat", "residual"):
            return [CFPB_AUTO, FUELECON]
        if has(blob, "emission", "co2", "carbon"):
            return [EPA_VEH, FUELECON]
        if has(blob, "tire", "oil", "maintenance", "brake", "braking", "stopping", "friction", "payload", "belt", "safety"):
            return [NHTSA, FUELECON]
        return [FUELECON, EPA]
    if cat == "tecnologia":
        if has(blob, "security", "password", "hash", "encrypt", "cipher"):
            return [CSRC, IEEE]
        if has(blob, "cloud", "aws", "server", "hosting", "ec2", "instance"):
            return [AWS, NIST]
        if has(blob, "battery", "power", "runtime", "voltage", "current", "energy", "watt"):
            return [DOE_ES, IEEE]
        return [IEEE, NIST]
    if cat == "mascotas":
        if has(blob, "dog", "puppy", "perro", "canine"):
            return [AKC, AVMA]
        if has(blob, "cat", "feline", "gato", "kitten"):
            return [AVMA, WSAVA]
        if has(blob, "food", "nutrition", "weight", "calorie", "diet", "ferret", "rabbit", "parrot", "parakeet", "bird"):
            return [WSAVA, AVMA]
        return [AVMA, AKC]
    if cat == "jardineria":
        if has(blob, "soil", "fertiliz", "compost", "ph ", "nutrient", "manure"):
            return [NRCS, PLANTHARDY]
        return [PLANTHARDY, NRCS]
    if cat == "medio-ambiente":
        if has(blob, "carbon", "co2", "emission", "footprint", "greenhouse"):
            return [EPA_GHG, EIA]
        if has(blob, "energy", "electric", "power", "standby", "appliance"):
            return [EIA, ENERGYSTAR]
        return [EPA, EIA]
    if cat == "ciencia":
        if has(blob, "chemis", "molar", "molarity", "concentration", "ppm", "solution", "reaction", "acid", "buffer", "ph-", "ph ", "stoichiom"):
            return [WEBBOOK, NIST]
        return [PHYSNIST, NIST_SP811]
    if cat == "familia":
        return [CDC, HEALTHYKID, MEDLINE]
    if cat == "idiomas":
        return [FSI, NCES]
    return None

# ---------------------------------------------------------------- intros (49)
INTROS = {
 "abdominal-circumference-cardiovascular-risk": "Your waist size is one of the simplest predictors of metabolic and cardiovascular risk — often more telling than body weight alone. This calculator compares your abdominal circumference against the clinical thresholds used by the WHO and NIH: above 102 cm (40 in) in men or 88 cm (35 in) in women signals elevated risk of type 2 diabetes, hypertension, and heart disease. Enter your measurement to see where you land and what it means.",
 "added-sugars-daily-oms-mg-grams": "The WHO recommends keeping added sugars under 10% of your daily calories, and ideally below 5%. For a typical 2,000-calorie diet that's a ceiling of about 50 g per day, with 25 g as the healthier target. This calculator turns those percentages into grams and teaspoons so you can tell at a glance whether a label's \"36 g of sugar\" blows your daily budget.",
 "blood-oxygen-saturation-spo2": "Blood oxygen saturation (SpO₂) measures how well your lungs are moving oxygen into your bloodstream. A normal reading sits between 95% and 100%; 90–94% is borderline and worth monitoring; and anything under 90% (hypoxemia) warrants urgent medical attention. This tool helps you interpret a pulse-oximeter reading against the standard clinical ranges.",
 "cafeina-dosis-segura-diaria-peso": "The FDA puts the safe ceiling for healthy adults at 400 mg of caffeine a day — roughly four cups of coffee — but body weight changes the picture, with about 6 mg per kilogram as the common per-weight guideline. This calculator gives you a personalized daily limit based on your weight and lowers it for pregnancy, where the recommended cap drops to 200 mg.",
 "coffee-hydration-myths": "Does coffee actually dehydrate you? The short answer from the research is no — the fluid in a normal cup more than offsets caffeine's mild diuretic effect. This calculator estimates the net hydration from your daily coffee based on cup count and size, so you can see how the habit really affects your fluid balance instead of relying on the myth.",
 "creatine-loading-maintenance": "Creatine monohydrate is the most-studied sports supplement there is, and dosing it well comes down to two phases: a short loading phase to saturate your muscles fast, then a steady maintenance dose. Using the ISSN protocol of 0.3 g/kg during loading and 3–5 g daily afterward, this calculator turns your body weight into an exact gram-per-day schedule.",
 "daily-caffeine-safe-maximum-cups": "How many cups is too many? For healthy adults the FDA caps caffeine at about 400 mg per day — the equivalent of four 8-oz coffees or eight espresso shots. This calculator converts that limit into the drinks you actually consume, accounting for the very different caffeine loads of brewed coffee, espresso, tea, and energy drinks.",
 "daily-calcium-intake": "Calcium needs shift with age and life stage — from 1,000 mg a day for most adults up to 1,200 mg for women over 50 and older men, per the NIH Office of Dietary Supplements. This calculator returns your personal recommended daily allowance based on age, sex, and pregnancy status, so you know the target your diet and supplements need to hit.",
 "daily-sodium-intake-mg-hypertension": "Most people eat far more sodium than they realize. The WHO ceiling is 2,300 mg a day — about one teaspoon of salt — and drops to 1,500 mg if you have high blood pressure. This calculator checks your intake against the right threshold for your situation and shows how far over (or under) the limit you are.",
 "daily-steps-calculator": "The \"10,000 steps\" rule is a useful target, but research shows real health benefits start well below it — around 7,000 steps a day for most adults. This calculator compares the steps you actually take against an evidence-based goal and tells you how much further you'd need to walk to close the gap.",
 "dieta-mediterranea-adherencia-score-test": "The Mediterranean diet is one of the most evidence-backed eating patterns for heart and metabolic health. This calculator uses the 14-item PREDIMED questionnaire — the same screener used in landmark clinical trials — to score how closely your habits match it, from olive oil and fish to vegetables and wine, and shows where you can improve.",
 "fasting-blood-glucose-levels": "A fasting blood glucose reading is the first-line screen for prediabetes and diabetes. Using standard ADA reference ranges, this calculator classifies your result: under 100 mg/dL is normal, 100–125 mg/dL signals prediabetes, and 126 mg/dL or above (confirmed on repeat testing) points to diabetes. Enter your reading to see where it falls.",
 "food-digestion-time-calculator": "Different foods clear your stomach at very different rates — water in about 20 minutes, fruit in 30–60, carbohydrates in 2–3 hours, and meat in 4–5. This calculator estimates how long a given food and portion take to digest, useful for timing meals around workouts, sleep, or a fasting window.",
 "gfr-glomerular-filtration-rate-ckd-epi": "Estimated GFR is the standard measure of how well your kidneys filter waste. This calculator uses the 2021 CKD-EPI equation — the current clinical reference, which removed the race coefficient — to estimate your filtration rate from serum creatinine, age, and sex, and maps it to the chronic kidney disease stages (G1–G5).",
 "healthy-caloric-deficit": "Sustainable weight loss comes from a moderate calorie deficit, not starvation. The rule of thumb: a 500-calorie daily deficit yields about 0.5 kg (1 lb) of fat loss per week. This calculator works out the daily deficit needed to reach a goal weight by a target date, and flags when that pace becomes too aggressive to be healthy.",
 "hydration-hot-climate-daily-activity": "Your daily water needs rise with heat and exercise. Starting from the common baseline of 35 mL per kilogram of body weight, this calculator adds adjustments for ambient temperature and the minutes you train, giving you a personalized fluid target for hot-climate days when generic \"8 glasses\" guidance falls short.",
 "intermittent-fasting-16-8-calories": "On 16/8 intermittent fasting, what matters isn't just when you eat but how you spread your calories across the 8-hour window. This calculator splits your daily intake into balanced meals and snacks within the eating window, helping you avoid the common trap of under-eating early and overshooting at night.",
 "magnesio-dosis-deficiencia-sintomas": "Magnesium powers hundreds of enzyme reactions, yet many people fall short of the RDA. Based on NIH Office of Dietary Supplements values, this calculator returns your recommended daily magnesium intake by age and sex — roughly 310–320 mg for adult women and 400–420 mg for adult men — as a baseline to compare your diet against.",
 "omega-3-daily-dha-epa-dose": "Not all omega-3 milligrams count equally — it's the combined DHA + EPA that drives the heart and brain benefits. The American Heart Association points to roughly 250–500 mg of combined DHA+EPA per day for healthy adults. This calculator adds up the DHA and EPA from your supplements and diet to show whether you're hitting that target.",
 "probiotic-daily-cfu-dosage": "Probiotic doses are measured in CFU (colony-forming units), and an effective amount depends heavily on the strain and your goal rather than a single magic number. This calculator helps you translate a product's CFU count into a sensible daily dose for adults or children, based on the ranges used for general gut-health support.",
 "subcutaneous-visceral-fat-difference": "Not all body fat carries the same risk. Subcutaneous fat sits just under the skin, while visceral fat wraps around your organs and drives most of the metabolic danger linked to diabetes and heart disease. This calculator helps you estimate and distinguish the two, so you understand what your body-composition numbers actually mean.",
 "suplementos-deportivos-stack-principiante": "New to the gym and overwhelmed by the supplement aisle? Most beginners need far less than the marketing suggests. This calculator builds a sensible starter stack around the few supplements with strong evidence — creatine, protein, and the basics — matched to your training goal, so you spend money only where it actually helps.",
 "vitamin-d-dosage-daily-sun-exposure-age": "Vitamin D comes from both sunlight and diet, and the right target shifts with age — generally 600 IU/day for adults and 800 IU for those over 70, per NIH guidance. This calculator estimates your daily vitamin D need and how much midday sun exposure (typically 15–20 minutes) contributes, so you can tell whether you need a supplement.",
 "waist-to-hip-ratio-cardiovascular-health": "Waist-to-hip ratio is a quick, clothing-on proxy for how your body stores fat — and where you store it matters. Using WHO thresholds, a ratio above 0.90 in men or 0.85 in women marks elevated cardiovascular risk. This calculator divides your two measurements and tells you which risk band you fall into.",
 "weight-plateau-diet-reset-strategy": "Hit a wall where the scale won't budge? Plateaus are a normal metabolic adaptation, not a failure. This calculator looks at how long you've stalled and your current deficit, then suggests an evidence-based reset — a structured refeed, a cardio adjustment, or a recalculated deficit — to get fat loss moving again.",
 "zinc-dosage-by-age-gender": "Zinc supports immunity, wound healing, and hundreds of enzymes, but needs differ by sex and life stage. Drawing on NIH Office of Dietary Supplements values — about 11 mg/day for adult men and 8 mg for women — this calculator returns your personalized recommended daily zinc intake as a baseline for diet and supplementation.",

 "al30-gd30-bond-yield": "AL30 and GD30 are Argentina's most-traded restructured sovereign bonds, and their appeal comes down to one number: yield. This calculator estimates the internal rate of return (TIR) on an AL30 or GD30 position from your purchase price, coupon, and years to maturity — the metric that lets you compare them against other dollar instruments.",
 "annual-bonus-net": "Your annual bonus looks bigger before tax than after. This calculator applies your income-tax withholding rate to a gross bonus to show what actually lands in your account, so you can plan around the take-home figure instead of the headline number.",
 "bcra-interest-rate-savings-impact": "When Argentina's central bank (BCRA) moves its reference rate, the return on your peso savings moves with it. This calculator shows how a given rate applied to your balance over a set period changes what you earn — turning an abstract \"the BCRA raised rates\" headline into a concrete figure for your own money.",
 "bitcoin-halving-2028-proyeccion": "Bitcoin's supply issuance halves roughly every four years, and each past halving has preceded a major price cycle. This calculator lets you model a 2028 post-halving scenario by applying a historical-style multiplier to today's BTC price — a framework for stress-testing projections, not a prediction.",
 "bond-modified-duration": "Modified duration tells you how sensitive a bond's price is to interest-rate moves: a duration of 6 means a 1% rate rise drops the price about 6%. This calculator computes it from yield to maturity, years to maturity, and coupon frequency, so you can gauge the interest-rate risk in a bond before you buy.",
 "bond-present-value-zero-coupon": "A bond is worth the present value of its future cash flows, discounted at the yield you require. This calculator handles both zero-coupon bonds (a single payment at maturity) and coupon-bearing bonds, turning face value, YTM, and term into today's fair price.",
 "cedear-dividend-yield-2026": "CEDEARs let Argentine investors hold foreign stocks in pesos — but their dividend yield depends on the conversion ratio and the exchange rate, not just the headline payout. This calculator works out the real annual dividend yield on a CEDEAR position, converting USD dividends through the ratio and FX rate into a peso-based percentage.",
 "dca-bitcoin-historical-returns": "Dollar-cost averaging means buying a fixed amount on a schedule regardless of price, smoothing out volatility. This calculator estimates what a recurring Bitcoin DCA would have accumulated — total BTC and current value — from your monthly amount, the number of months, your average entry price, and today's price.",
 "emergency-fund-calculator-months-expenses": "An emergency fund is measured in months of expenses, not a round dollar figure. The common guidance is 3–6 months of essential spending kept in accessible savings. This calculator multiplies your monthly expenses by your chosen cushion to set a concrete target, and factors in interest if the fund sits in a yield account.",
 "fixed-deposit-net-annual-returns": "The advertised rate on a fixed-term deposit isn't what you keep — taxes and the exact term change the real return. This calculator computes your net annual yield from principal, rate, and term, so you can compare deposits on an apples-to-apples, after-tax basis.",
 "ira-401k-argentina-equivalent": "There's no local IRA or 401(k) in Argentina, but the same retirement-saving math applies to the vehicles you can use. This calculator projects how regular contributions grow over time at a given return, so you can size a private retirement plan the way a US saver would size a tax-advantaged account.",
 "iva-refund-debit-card": "Argentina refunds part of the VAT (IVA) on purchases paid with a debit card under the national reintegro scheme. This calculator estimates the refund on a purchase from its total and the applicable refund percentage, so you can see how much of the 21% VAT actually comes back to you.",
 "monetary-policy-rate-tpm-return": "The BCRA's monetary-policy rate (TPM) sets the floor for short-term peso returns. This calculator estimates the interest you'd earn on a principal at the current TPM over a number of days, using the standard day-count convention — handy for sizing a short-term placement.",
 "money-market-fund-yield": "Money-market funds are where you park cash you might need tomorrow, prized for liquidity over high returns. This calculator estimates the yield on a given amount over a chosen term at a stated rate, making it easy to compare a money-market fund against a fixed-term deposit.",
 "nft-royalty-creator-secondary-market": "One of the NFT model's promises is that creators keep earning on resales. This calculator shows exactly how much a royalty clause pays out: enter a secondary-sale price and the royalty percentage to see the creator's cut, and how it compounds across multiple resales.",
 "pnl-futures-long-short-perpetual": "Perpetual futures let you go long or short with leverage, and your profit or loss scales with both the price move and your position size. This calculator computes P&L on a perpetual position from entry price, exit price, size, and direction — before funding and fees — so you can see the outcome of a trade at a glance.",
 "portfolio-60-40-crypto-traditional-allocation": "The classic 60/40 portfolio gets a modern twist when crypto enters the mix. This calculator breaks a total portfolio into its traditional (stocks and bonds) and crypto slices at your chosen split, so you can see the dollar allocation behind a target percentage and keep your risk where you want it.",
 "rule-of-72-doubling-calculator": "The Rule of 72 is the mental-math shortcut for compound growth: divide 72 by your annual return and you get the years it takes to double your money. This calculator does it instantly and shows the underlying compounding, so you can compare how different rates accelerate — or stall — your savings.",
 "sharpe-ratio-backtest-calculator": "The Sharpe ratio measures return per unit of risk — how much extra you earned above the risk-free rate for the volatility you stomached. This calculator computes it from your strategy's annual return, volatility, and the risk-free rate, giving you one number to compare strategies on a risk-adjusted basis.",
 "yield-farming-impermanent-loss-pool": "Impermanent loss is the hidden cost of providing liquidity to an automated market maker: when the two tokens' prices diverge, you end up with less than if you'd simply held them. This calculator quantifies that loss from the price change of the pair, so you can weigh it against the fees and rewards a pool pays.",
 "bond-al30-al35-al41-yield": "AL30, AL35, and AL41 are Argentina's local-law dollar bonds, differing mainly in maturity and coupon schedule. This calculator estimates the yield (TIR) on any of them from your amount, term, and rate, so you can compare the short, medium, and long end of the sovereign curve side by side.",
 "cold-wallet-vs-hot-wallet-riesgo": "How much crypto should live in cold storage versus a hot wallet? A common security rule keeps roughly 80% in offline cold storage and 20% in a hot wallet for everyday access. This calculator turns that principle into specific amounts based on your holdings and how often you actually transact.",

 "critical-power-cp": "Critical power (CP) is the highest intensity you can sustain aerobically — the line between hard-but-steady and unsustainable. From two all-out efforts (typically a 3-minute and a 12-minute test), this calculator derives your CP and W′ (the finite work you can do above it) using the 2-parameter model cyclists and runners use to set training zones.",
}

# ----------------------------------------------------- explanation boilerplate cleaner
EXPL_BOILER_MARK = (
    "based on physical principles",
    "based on mathematical principles",
    "is based on well-established mathematical",
    "validated by the scientific community",
    "mathematics is the language",
)
def clean_explanation(expl):
    """Drop a leading boilerplate paragraph if it is generic physics/math filler."""
    if not expl: return expl, False
    parts = expl.split("\n\n## ", 1)
    if len(parts) != 2: return expl, False
    lead, rest = parts
    low = lead.lower()
    if any(m in low for m in EXPL_BOILER_MARK) and len(lead) < 600:
        return "## " + rest, True
    return expl, False

# ---------------------------------------------------------------- run
BOILER = {"Wolfram MathWorld", "Khan Academy"}
src_fixed = {}; intro_fixed = 0; expl_fixed = 0; problems = []
sample = []

for f in sorted(glob.glob(EN + "/*.json")):
    d = json.load(open(f))
    names = {(s.get("name") or "").strip() for s in (d.get("sources") or [])}
    is_trio = BOILER <= names
    # also catch URL-based boilerplate with name variants (e.g. "Khan Academy — Science")
    has_kw = any(("khanacademy" in (s.get("url") or "")) or ("wolfram" in (s.get("url") or ""))
                 for s in (d.get("sources") or []))
    cat = d.get("category", "?")
    slug = d["slug"]
    changed = False

    # 1) sources (skip matematica; vida/other math calcs return no route and are left as-is)
    if (is_trio or has_kw) and cat != "matematica":
        if cat == "finanzas":
            kit = FIN.get(slug)
            if kit is None:
                kit = [SEC, CFPB]; problems.append(f"finanzas fallback: {slug}")
        else:
            blob = (slug + " " + (d.get("title") or "") + " " + (d.get("h1") or "") + " " +
                    " ".join(d.get("seoKeywords") or [])).lower()
            kit = route(cat, slug, blob)
            if kit is None:
                problems.append(f"NO ROUTE: {cat}/{slug}"); kit = None
        if kit:
            d["sources"] = [dict(s) for s in kit]
            src_fixed[cat] = src_fixed.get(cat, 0) + 1
            changed = True

    # 2) intro
    if slug in INTROS:
        d["intro"] = INTROS[slug]; intro_fixed += 1; changed = True

    # 3) explanation boilerplate lead
    new_expl, did = clean_explanation(d.get("explanation"))
    if did:
        d["explanation"] = new_expl; expl_fixed += 1; changed = True

    if changed:
        # validate emitted source URLs
        for s in (d.get("sources") or []):
            if dom(s["url"]) not in ALLOW:
                problems.append(f"URL NOT ALLOWED: {slug} -> {s['url']}")
        if len(sample) < 2:
            sample.append((slug, d.get("sources"), d.get("intro", "")[:80]))
        if APPLY:
            with open(f, "w") as fh:
                json.dump(d, fh, ensure_ascii=False, indent=2)
                fh.write("\n")

print("MODE:", "APPLY" if APPLY else "DRY-RUN")
print("sources fixed by category:")
for c in sorted(src_fixed): print(f"   {src_fixed[c]:3d}  {c}")
print("   TOTAL sources fixed:", sum(src_fixed.values()))
print("intros rewritten:", intro_fixed)
print("explanation leads cleaned:", expl_fixed)
print("problems:", len(problems))
for p in problems[:40]: print("   !", p)
print("\n--- sample ---")
for slug, srcs, intro in sample:
    print(slug)
    for s in (srcs or []): print("   src:", s["name"], "||", s["url"])
    print("   intro:", intro, "...")
