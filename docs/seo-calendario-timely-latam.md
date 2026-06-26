# Calendario timely SEO — LATAM (hacecuentas)

> Por qué existe: GA4 muestra que **lo que más crece en orgánico es contenido timely fiscal/laboral**
> (inflación-ipc +89%, DIAN mora, SAT recargos, recategorización monotributo, Mundial bonus +1600%).
> La jugada: tener la página **lista e indexada ANTES del pico de búsqueda**, no después.
> Regla: ~3-4 semanas antes del pico → verificar datos, refrescar `lastReviewed`, IndexNow + GSC submit.
>
> Estado al 2026-06-26. Revisar mensualmente.

## Cómo se usa
1. Cada mes, mirar los picos del mes siguiente.
2. Para cada uno: ¿existe la página? ¿los datos están actualizados (año, montos)? ¿está indexada (Bing/IndexNow)?
3. Si falta o está vieja → arreglar y `bash scripts/post-deploy-indexnow.sh` (o `indexnow-push.py <url>`).
4. Bonus: una Web Story AMP (`src/content/historias/`) del tema = canal Discover (no depende de autoridad).

---

## EN CURSO ahora (jun-jul 2026)

| Pico | Query objetivo | Página | Estado |
|---|---|---|---|
| **Mundial 2026** (11-jun→19-jul) | partidos/fixture/tabla/goleadores mundial 2026 | /fixture-mundial-2026, /partidos-hoy-mundial-2026, /posiciones-mundial-2026, /llave-, /goleadores- | ✅ live, títulos EN VIVO. CTR bajo = autoridad/posición vs ESPN, no título. Web Story ✅. IndexNow ✅ |
| **Aguinaldo / SAC 1er semestre** (cobro jun) | cómo se calcula aguinaldo 2026 | /calculadora-aguinaldo-sac | ✅ live + Web Story ✅ |
| **Recategorización monotributo** (cierra 5-ago) | categorías/tabla monotributo 2026 recategorización julio | /calculadora-monotributo-categoria-2026-recategorizacion-julio, /datos-monotributo-2026 | ✅ live + Web Story ✅ |

## Picos por mes (calendario base)

| Mes | Pico | País | Query | Página / acción |
|---|---|---|---|---|
| **Mensual** | Inflación / IPC del mes | AR/CO/MX | inflación [mes] 2026, IPC | /calculadora-actualizacion-inflacion-ipc — refrescar dato apenas sale INDEC/DANE/INEGI |
| **Mensual** | Actualización alquiler ICL | AR | aumento alquiler ICL [mes] | /calculadora-actualizacion-alquiler-icl — top tráfico, mantener serie ICL al día |
| **Mensual** | Salario mínimo / SMVM | AR/CO/MX | salario mínimo [mes] 2026 | /datos-salario-minimo-latam-2026, calcs por país |
| **Jul** | Recategorización monotributo | AR | recategorización monotributo julio | ✅ (ver arriba) |
| **Jul-Dic** | Aguinaldo 2º semestre | AR | aguinaldo diciembre 2026 | /calculadora-aguinaldo-sac — refrescar nov |
| **Ago-Sep** | DIAN: vencimientos renta / intereses mora | CO | interés mora DIAN, declaración renta | /calculadora-interes-mora-dian-colombia-2026 (ya crece) — verificar tasas |
| **Sep-Oct** | Recategorización monotributo 2º | AR | recategorización monotributo enero/julio | misma calc, refrescar |
| **Oct-Nov** | SAT México: ISR/recargos | MX | recargos SAT, ISR aguinaldo MX | /calcs MX impuestos (recargos-actualizacion-sat ya crece) |
| **Nov-Dic** | Aguinaldo MX / gratificación CL | MX/CL | aguinaldo méxico, gratificación legal chile | calcs MX/CL — verificar |
| **Dic-Ene** | Salario mínimo nuevo año | LATAM | salario mínimo 2027 | actualizar TODAS las calcs de SMVM apenas se decreta (CO Decreto, AR Consejo, MX CONASAMI) |
| **Dic-Mar** | Vacaciones / cálculo días | AR | días de vacaciones, liquidación vacaciones | calcs vacaciones — pico verano |
| **Mar-Abr** | Ganancias AR / Renta CO | AR/CO | impuesto ganancias 2026, declaración renta | /calculadora-impuesto-ganancias-sueldo (crece), calc renta CO |
| **Abr-Jun** | Aguinaldo 1er semestre | AR | aguinaldo junio | ✅ |

## Verticales con momentum (acelerar indexación, no sumar calcs sin indexar)
- **Perú +130% WoW**, **Venezuela +253%**, Rep.Dom/Paraguay/Uruguay nuevas con tracción.
- Acción recurrente: IndexNow de sus URLs + hub `/{país}/calculadoras` + internal links desde AR.
- (2026-06-26: pusheadas 74 URLs PE/VE a IndexNow.)

## Recordatorio de freshness (CLAUDE.md regla #2)
Si cambia un dato/monto: editar el `.json` del calc (aunque sea bumpear `lastReviewed`) para que el sitemap mueva el `lastmod` y Google/Bing recrawleen. Tocar solo el `.ts` NO mueve el sitemap.
