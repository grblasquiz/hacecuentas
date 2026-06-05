# EN Off-Page Playbook — construir autoridad para las /en/ (lever #3)

> **Por qué importa.** La sección EN está *crawl-starved* (Bing crawleó solo 26% de las 680).
> El linking interno (lever #1, ya live) ayuda, pero el techo real es **autoridad externa**:
> Bing pondera backlinks 2-3x más que Google, y la sección EN tiene **cero links EN-facing**.
> Unos pocos links de calidad apuntando a `/en/` levantan crawl-priority *y* ranking.
>
> **Honestidad operativa.** Yo (Claude) **no puedo colocar** la mayoría de estos links:
> Reddit me bloquea, los directorios piden login/CAPTCHA. Esto es munición lista —
> vos ejecutás (5-10 min por ítem). Mismo patrón que los `reddit-queue-*.md`.

---

## Tier 1 — Directorios de tools/calcs EN (free submit, alto crawl de Bing)

Submit con **anchor en inglés** + 3-5 calcs EN top-relevantes a la categoría del directorio.

| Directorio | URL submit | DA~ | Calcs EN a pitchear |
|---|---|---|---|
| AlternativeTo | alternativeto.net/software/new/ | 91 | compound-interest, bmi, mortgage-payment-monthly |
| Calculator Soup | calculatorsoup.com (contacto) | 70 | sales-tax, percentage, tip |
| SaaSHub | saashub.com/submit | 60 | la home /en + scientific-calculator |
| Product Hunt | producthunt.com (launch) | 91 | lanzar "Hacé Cuentas — 680 free calculators" |
| There's An AI For That / tool lists | varios | — | calcs con LiveData (interés, FX) |
| ToolsForCreators / free-tools roundups | varios | — | scientific-calculator, unit/currency converter |

**Acción:** por directorio, 1 submission con la home `/en/` como link principal + 2-3 calcs de deep-link.

## Tier 2 — Comunidades EN (Claude redacta, vos posteás — anti-shadowban)

Regla de oro (igual que reddit-queue ES): **80% respuesta útil, el link al final, casual. Nunca arrancar con el link.**

**Subreddits/temas por nicho de calc:**
- Finanzas: r/personalfinance, r/financialindependence, r/Bogleheads → compound-interest, mortgage, savings
- Fitness: r/fitness, r/running, r/weightroom → 1rm, tdee-calorie, running-pace
- Estudiantes: r/college, r/GradSchool → gpa, final-grade
- Quora: buscar "how to calculate [X]" de alto volumen → responder + linkear la calc EN

**Draft listo #1 — r/personalfinance (o Quora "how does compound interest work"):**
> The thing that clicked for me was seeing it, not reading the formula. Compound interest is interest
> earning interest: each period you earn on principal *plus* all prior interest, so growth curves upward
> instead of staying linear. Rule of thumb (Rule of 72): 72 ÷ your rate ≈ years to double. At 8% that's
> ~9 years. If you want to plug in your own numbers, I used this one to model it: hacecuentas.com/en/compound-interest-calculator

**Draft listo #2 — r/running (o Quora "how to estimate race time"):**
> Riegel's formula is the standard for predicting race times across distances: T2 = T1 × (D2/D1)^1.06.
> It's surprisingly accurate up to ~2x the distance you've actually raced; beyond that it over-predicts
> because it ignores fatigue/fueling. Quick way to run the numbers for your goal race:
> hacecuentas.com/en/running-pace-calculator

## Tier 3 — GEO / AEO (que te citen ChatGPT/Perplexity/Copilot)

La infra ya existe (`llms-full.txt`, answerSnippets). EN-específico:
- Asegurar que las calcs EN top tengan **answerSnippet** (responde la query en 1-2 frases citables).
- Bing Copilot ya muestra el site para queries ES; replicar para EN (las calcs EN con answerSnippet
  son candidatas a grounding). Cruzar con `scripts/ai-visibility-monitor.py`.

## Autónomo vs manual

| Acción | Quién |
|---|---|
| Generar más drafts EN por nicho/calc | Claude (pedímelo) |
| answerSnippets EN para grounding | Claude |
| Submit a directorios (login/CAPTCHA) | Martin |
| Postear en Reddit/Quora | Martin (anti-shadowban) |
| Product Hunt launch | Martin |

**Próximo paso sugerido:** decime un nicho y te genero 5-10 drafts EN listos (formato reddit-queue),
o arranco con answerSnippets EN para las 20 calcs universales de más volumen.
