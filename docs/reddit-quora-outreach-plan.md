# Plan de outreach Reddit / Quora — 30 días

Objetivo: 50 respuestas útiles con link a calc relevante en 30 días.
Resultado esperado: backlinks naturales + tráfico directo + branding en comunidades AR.

## Reglas no negociables

1. **Aporta primero, linkea después.** Si la respuesta es "andá a tal calc", te mutean.
   Patrón ganador: explicación útil de 2-3 párrafos + 1 link al final como referencia.
2. **No spamees el mismo calc.** Diversificá: 1 calc distinto por respuesta.
3. **No copy/paste templates.** Adaptá tono al sub. r/argentina es informal, r/Bogleheads es técnico.
4. **Cuenta con karma > 100.** Si la cuenta es nueva, las respuestas con link se filtran como spam.
   Si es necesario, hacé 2 semanas de comentar sin links primero.
5. **No pidas votos ni "miren mi sitio".** Promoción explícita = ban.

## Subreddits target (AR + finanzas/cripto/laburo)

| Sub | Subscribers | Por qué | Calcs que linkear |
|---|---|---|---|
| r/argentina | 1.2M | catch-all | aguinaldo, monotributo, dolar |
| r/Argentina_Personal_Finance | 50K | high-intent finanzas | plazo fijo, hipoteca, presupuesto |
| r/MercadosArgentina | 80K | inversiones AR | CEDEARs, bonos, dólar MEP |
| r/CriptoArg | 30K | cripto AR específico | impuestos cripto, RWA, staking |
| r/BAires | 200K | CABA local | ABL, monotributo, alquileres |
| r/devargentina | 80K | freelance/IT | sueldo USD, Deel, monotributo dev |
| r/CapitalFederal | 100K | CABA | servicios, alquiler, expensas |
| r/AskArgentina | 60K | preguntas práctica | varias |
| r/RecienEgresados | 40K | jóvenes profesionales | sueldo entry level, primer alquiler |
| r/inmigracion (varios) | — | emigrar AR→ | emigrar España, Uruguay |

## Quora ES (LATAM)

| Tema | Volumen typ | Calcs |
|---|---|---|
| "¿Cuánto se paga de aguinaldo?" | alto Q4-Q2 | calc aguinaldo |
| "Mejor plazo fijo Argentina" | alto siempre | plazo fijo, comparador |
| "Pasar de monotributo a autónomo" | medio | comparador 3 regímenes |
| "Cuánto cuesta vivir en Buenos Aires" | alto | sueldo en mano + presupuesto |
| "Calcular intereses tarjeta de crédito" | alto | costo real tarjeta |

## 50 threads/preguntas concretos a buscar (templates de query)

### Reddit (queries para search interno del sub)

1. `aguinaldo cuanto cobro` — r/argentina, r/Argentina_Personal_Finance
2. `monotributo recategorizar` — r/argentina, r/devargentina
3. `plazo fijo cuanto rinde` — r/MercadosArgentina, r/Argentina_Personal_Finance
4. `cripto impuestos argentina` — r/CriptoArg
5. `hipoteca uva conviene` — r/Argentina_Personal_Finance, r/BAires
6. `sueldo dev argentina` — r/devargentina
7. `cobrar usd freelance` — r/devargentina (Deel/Payoneer/Wise)
8. `IIBB caba calculo` — r/BAires, r/CapitalFederal
9. `IMC sano` — r/argentina, r/saludargentina
10. `vacaciones LCT días` — r/argentina, r/Argentina_Personal_Finance
11. `indemnización despido` — r/argentina, r/devargentina
12. `sueldo bruto neto` — r/devargentina, r/recienegresados
13. `dolar MEP comprar` — r/MercadosArgentina
14. `CEDEARs cuál comprar` — r/MercadosArgentina, r/CriptoArg
15. `bonos AL30 GD30` — r/MercadosArgentina
16. `comida perro porción` — r/argentina, r/perros (lifestyle, low spam)
17. `embarazo semanas calculo` — r/AskArgentina
18. `cuanto cuesta tener hijo` — r/argentina, r/AskArgentina
19. `pañales mes bebe` — r/argentina (familia)
20. `emigrar españa visa` — r/Spain (con cuidado), r/argentinos en exterior

(seguir con queries similares — apuntar a 5-7 threads/día x 30 días = 150-200 oportunidades, de las cuales 50 buenas)

### Quora ES

Para cada calc top, buscar variaciones de pregunta en Quora:
- ¿Cómo se calcula X?
- ¿Cuánto se paga de X?
- ¿Es mejor X o Y?
- ¿Cuándo conviene X?

## Templates de respuesta (3 formatos según contexto)

### Template A — Pregunta numérica directa

```
Para tu caso específico, la fórmula es [...explicar la lógica con tus números...].

Si tu sueldo bruto es $1.200.000, el aguinaldo bruto te queda en $600.000
(la mitad), menos el 17% de aportes = $498.000 en mano.

Hay [calc específica]({{URL}}) donde podés meter tu mejor sueldo del semestre
y los meses trabajados; te calcula el SAC neto considerando si entrás en
Ganancias también.
```

### Template B — Comparativa / "qué conviene"

```
Depende de [variables]. Te tiro un ejemplo concreto:

| Opción A | Opción B |
|---|---|
| ... | ... |

Para tu caso, la diferencia es de aprox $X/mes.

Hay un [comparador]({{URL}}) que toma estos parámetros y te tira el resultado
exacto. Pero la lógica de fondo es la que te resumo arriba.
```

### Template C — Concept question

```
[Concepto] funciona así: [explicación 2-3 oraciones].

El error típico es [misconception común]. La forma correcta de pensarlo es
[mental model].

Para los números concretos hay [calc relevante]({{URL}}).
```

## Cadencia recomendada

- **Mes 1**: 2 respuestas/día, 60 totales. Foco en r/argentina + r/Argentina_Personal_Finance.
- **Mes 2**: ampliar a r/devargentina, r/MercadosArgentina, r/CriptoArg.
- **Mes 3**: Quora ES + comunidades nicho (fitness, mascotas, padres).

## Métricas a trackear

- Backlinks creados (Ahrefs / GSC)
- Referrer traffic de reddit.com / quora.com (GA4)
- Upvotes promedio (calidad)
- Bans/removals (target: <5%)

## Stack para automatizar el tracking (no la posteada)

- **Canary URLs**: linkear con `?ref=reddit-arg` para ver qué sub trae más tráfico en GA4.
- **Saved searches Reddit**: en cada sub, guardar 5 queries que muestran threads nuevos diarios.
- **Sheet de tracking**: por respuesta — fecha, sub, URL del thread, calc linkeado, upvotes a 7d, removed sí/no.

## Riesgos a mitigar

- **Shadow ban**: si tu cuenta tiene <100 karma o todas las respuestas linkean al mismo dominio, Reddit la mute silenciosamente. Diversificá: 1 link cada 4-5 respuestas, alternalá calc.
- **Mod bans**: leé las rules del sub antes de postear. Algunos prohíben *cualquier* link a sites comerciales.
- **AdGuard/uBlock**: muchos users en /argentina bloquean GA. El tracking GA4 va a sub-contar el tráfico real.

## Action items para vos (no automatizable)

- [ ] Confirmar qué cuenta de Reddit/Quora vas a usar (con karma >100 idealmente)
- [ ] Day 1: leer rules de r/argentina, r/Argentina_Personal_Finance, r/MercadosArgentina
- [ ] Saved search en cada sub para queries top
- [ ] Empezar Lunes próximo: 2 posts/día durante 30 días
- [ ] Sheet de tracking compartida (Google Sheets o Notion)
