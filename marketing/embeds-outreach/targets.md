# Targets de outreach — embeds `<hace-cuentas>`

Investigado: 2026-07-01. Patrón Omni Calculator: ofrecer el widget gratis a sitios que YA publican notas de cálculo sin herramienta → backlink "Powered by Hacé Cuentas" (followable, fuera del iframe, automático en hc.js).

**Estado del embed (verificado en código):** el web component agrega solo el crédito
`Powered by <a href="https://hacecuentas.com">Hacé Cuentas</a> — <a href=".../<slug>">nombre calc</a>`
en la página anfitriona (no dentro del iframe) → backlink real de home + deep-link a la calc. Sin `rel="nofollow"`. Solo se oculta con `no-attribution` + partner autorizado en `/partners/<id>.json`. **No hay gap de atribución.**

⚠️ **Bug encontrado (arreglar ANTES de enviar el primer email):** la demo de `/partners` usa `calculator="calculadora-sueldo-en-mano-argentina"`, slug que NO existe (`/embed/calculadora-sueldo-en-mano-argentina` → 404 en prod; el real es `sueldo-en-mano-argentina`). Un editor que entre a la demo la va a ver rota. Aparece 4 veces en `src/pages/partners/index.astro` (líneas ~45, 112, 120, 261).

🔑 Gotcha slugs: el atributo `calculator` lleva el **slug** del JSON (el de la URL), NO el filename. Todos los slugs de este documento están verificados contra prod (`/embed/<slug>` → 200).

⛔ Regla: NO contactar Argenprop ni portales competidores directos (Zonaprop, Mercado Libre Inmuebles) — ver `no-mezclar-argenprop`.

---

## Grupo A — Medios provinciales / nicho AR (publican notas de cálculo SIN herramienta)

| # | Medio | URL | Nota publicada (ejemplo real) | ¿Tiene herramienta? | Calc a ofrecer | Contacto |
|---|-------|-----|-------------------------------|---------------------|----------------|----------|
| 1 | **La Gaceta** (Tucumán) | lagaceta.com.ar | [Cuándo se cobra el aguinaldo junio 2026 + cómo calcular](https://www.lagaceta.com.ar/nota/1135293/sociedad/cuando-se-cobra-aguinaldo-junio-2026-fechas-como-calcular-monto.html) | ✅ VERIFICADO con WebFetch: NO — solo fórmula en texto, sin link a calc externa | `calculadora-aguinaldo-sac` | form contacto lagaceta.com.ar / redacción |
| 2 | **MDZ Online** (Mendoza) | mdzol.com | [Aguinaldo junio 2026: cómo calcular el monto exacto](https://www.mdzol.com/sociedad/aguinaldo-junio-2026-cuando-se-cobra-y-como-calcular-el-monto-exacto-n1539398) + [Indemnización por despido 2026 tras la reforma](https://www.mdzol.com/dinero/indemnizacion-despido-como-se-calcula-2026-la-reforma-laboral-y-que-cambia-n1507649) | ✅ VERIFICADO con WebFetch: NO — solo texto | `calculadora-aguinaldo-sac` + `calculadora-indemnizacion-despido` | mdzol.com/contacto |
| 3 | **Diario Uno** (Mendoza) | diariouno.com.ar | Serie de 8+ notas de aguinaldo jun-2026, ej: [fechas clave + cómo calcular](https://www.diariouno.com.ar/economia/aguinaldo-junio-2026-las-fechas-clave-cobro-y-como-calcular-cuanto-te-toca-recibir-n1564252) y ["el truco para saber el monto exacto"](https://www.diariouno.com.ar/economia/aguinaldo-junio-2026-cuando-se-cobra-argentina-y-el-truco-saber-el-monto-exacto-antes-tiempo-n1558335) | NO (titulan "el truco para saber el monto" — el truco ES una calculadora) | `calculadora-aguinaldo-sac` | diariouno.com.ar/contacto |
| 4 | **LM Neuquén** | lmneuquen.com | [Aguinaldo junio 2026: fecha límite y cómo calcular](https://www.lmneuquen.com/pais/cuando-se-cobra-el-aguinaldo-junio-2026-la-fecha-limite-y-como-calcular-el-monto-n1237407) | NO | `calculadora-aguinaldo-sac` | lmneuquen.com/contacto |
| 5 | **La Capital** (Rosario) | lacapital.com.ar | [Aguinaldo junio 2026: cuándo se paga y cómo calcularlo](https://www.lacapital.com.ar/informacion-general/aguinaldo-junio-2026-cuando-se-paga-quienes-lo-cobran-y-como-calcularlo-n10261802) | NO | `calculadora-aguinaldo-sac` | lacapital.com.ar (form) |
| 6 | **0221.com.ar** (La Plata) | 0221.com.ar | [Plazo fijo 2026: qué bancos ofrecen las tasas más altas](https://www.0221.com.ar/nacional/plazo-fijo-2026-que-bancos-ofrecen-las-tasas-nominales-mas-altas-n121702) | NO — tabla estática de tasas | `calculadora-plazo-fijo` | 0221.com.ar/contacto |
| 7 | **Aries Online** (Salta) | ariesonline.com.ar | [Plazo fijo 2026: qué bancos pagan más](https://ariesonline.com.ar/amp/184922/plazo-fijo-2026-que-bancos-pagan-mas-en-la-primera-rueda-del-ano) | NO | `calculadora-plazo-fijo` | ariesonline.com.ar (form) |
| 8 | **Diario de Cuyo** (San Juan) | diariodecuyo.com.ar | [Recategorización Monotributo: nuevas escalas desde julio 2026](https://www.diariodecuyo.com.ar/economia/recategorizacion-monotributo-nuevas-escalas-topes-e-importes-pagar-julio-2026-informo-arca-n6576285) | NO — tablas de texto | `calculadora-monotributo-categoria-2026-recategorizacion-julio` | diariodecuyo.com.ar (form) |
| 9 | **Perfil / Canal E** | perfil.com | [Aguinaldo junio 2026: hasta cuándo pueden pagarlo y cómo se calcula](https://www.perfil.com/noticias/canal-e/aguinaldo-junio-2026-hasta-cuando-pueden-pagarlo-y-como-se-calcula.phtml) | NO | `calculadora-aguinaldo-sac` | perfil.com (redacción / prensa) |
| 10 | **Econoblog** | econoblog.com.ar | Blog nicho economía AR — publica de tasas/sueldos. ⚠️ Sin nota puntual verificada en esta ronda (no apareció en resultados de búsqueda; verificar manualmente el sitio antes de enviar) | s/verificar | `calculadora-plazo-fijo` / `sueldo-en-mano-argentina` | econoblog.com.ar (contacto en sitio) |

## Grupo B — Estudios contables / abogados laborales AR con blog

| # | Estudio | URL | Post publicado | ¿Tiene herramienta? | Calc a ofrecer | Contacto |
|---|---------|-----|----------------|---------------------|----------------|----------|
| 11 | **Contablix** | contablix.ar | [Recategorización monotributo 2026: fechas, pasos y errores](https://contablix.ar/blog/recategorizacion-monotributo-2026) | NO | `calculadora-monotributo-categoria-2026-recategorizacion-julio` | contacto en sitio |
| 12 | **Wynges** | wynges.com | [Monotributo junio 2026: nuevos topes ARCA](https://wynges.com/blog/monotributo-junio-2026-nuevos-topes-arca/) | NO | `calculadora-monotributo-categoria-ingresos-tope` | contacto en sitio |
| 13 | **Estudio Piacentini** (CABA) | estudiopiacentini.com.ar | [Sección monotributo con posts recurrentes](https://www.estudiopiacentini.com.ar/estudio-contable/monotributo/) | NO | `calculadora-monotributo-cuota-2026-todas-categorias` | contacto en sitio |
| 14 | **García Alonso** (abogados) | garciaalonso.com.ar | [Indemnización en la Ley 27.802: FAL y cálculo paso a paso](https://garciaalonso.com.ar/blog/indemnizacion-en-la-ley-27-802-calculo/) | NO — paso a paso en texto | `calculadora-indemnizacion-despido` | form del sitio |
| 15 | **Herrera & Flamenco** | esderecho.com.ar | [Indemnización por despido en 2026 (reforma laboral)](https://www.esderecho.com.ar/indemnizacion-despido-2026-reforma-laboral-calculo/) | NO | `calculadora-indemnizacion-despido` | form del sitio |
| 16 | **Estudio Lamota** | estudiolamota.com.ar | [Despidos en 2026: indemnización, FAL y Ley Bases](https://estudiolamota.com.ar/blog/despidos-2026-reforma-laboral.html) | ✅ VERIFICADO con WebFetch: NO — solo ejemplo numérico en texto; contacto vía WhatsApp | `calculadora-indemnizacion-despido` | WhatsApp del sitio |
| 17 | **La Defensa** | ladefensa.com.ar | [Indemnización por despido sin causa: cálculo actualizado](https://www.ladefensa.com.ar/indemnizacion-por-despido-sin-causa-en-argentina-calculo-actualizado-y-como-reclamar/) | NO | `calculadora-indemnizacion-despido` | contacto en sitio |
| 18 | **Sindical Federal** | sindicalfederal.com.ar | [Cómo calcular una indemnización por despido en 2026](https://sindicalfederal.com.ar/como-calcular-una-indemnizacion-por-despido-en-argentina-en-2026/) | NO | `calculadora-indemnizacion-despido` + `calculadora-aguinaldo-sac` | contacto en sitio |
| 19 | **Finanzas para Emprendedores** | finanzasparaemprendedores.com | [Recategorización monotributo 2026: fechas, valores, trámite](https://finanzasparaemprendedores.com/recategorizacion-monotributo-2026/) | NO | `calculadora-impuestos-monotributo-freelance` | contacto en sitio |

Bonus institucional (linkers de autoridad, pitch distinto — "recurso para matriculados"):
| 20 | **CPCE Córdoba** | web.cpcecba.org.ar | [Monotributo: recategorización con nueva tabla](https://web.cpcecba.org.ar/monotributo-se-habilito-la-recategorizacion-semestral-con-la-nueva-tabla/) | NO | `calculadora-monotributo-categoria-2026-recategorizacion-julio` | prensa del consejo |
| 21 | **CTPCBA** (Colegio de Traductores) | traductores.org.ar | [Novedades impositivas: recategorización 1er semestre 2026](https://www.traductores.org.ar/asesoria-juridica-y-contable/novedades-impositivas-recategorizacion-y-nuevos-valores-del-monotributo-primer-semestre-de-2026/) | NO | `calculadora-impuestos-monotributo-freelance` | asesoría contable del colegio |

## Grupo C — Blogs / portales inmobiliarios que escriben de crédito UVA

⛔ Excluidos por regla: Argenprop, Zonaprop, ML Inmuebles. Excluido creditosuva.ar y tuplazofijo.com.ar (competidores con calc propia).

| # | Sitio | URL | Post publicado | ¿Tiene herramienta? | Calc a ofrecer | Contacto |
|---|-------|-----|----------------|---------------------|----------------|----------|
| 22 | **Roomix** | roomix.ai | [Créditos hipotecarios UVA 2026: bancos, tasas y requisitos](https://roomix.ai/blog/creditos-hipotecarios-uva-guia-2026) + [relación cuota-ingreso](https://roomix.ai/blog/credito-hipotecario-relacion-cuota-ingreso) | Blog de texto; publican 3+ guías UVA | `calculadora-credito-uva-vs-tasa-fija` + `calculadora-ingreso-minimo-credito-hipotecario-uva-banco-nacion` | contacto en sitio |
| 23 | **Somos Inmobiliarios** | somosinmobiliarios.com | [Comprar con crédito UVA 2026: simulador](https://somosinmobiliarios.com/blog/comprar-credito-uva-2026-simulador/) + [tasas actualizadas](https://somosinmobiliarios.com/blog/tasas-creditos-hipotecarios-argentina-2026/) | ⚠️ Titulan "simulador" — verificar si linkean a los bancos o tienen propio. Pitch: simulador embebido que se actualiza solo | `calculadora-credito-uva-vs-tasa-fija` | contacto en sitio |
| 24 | **Mudafy** | mudafy.com.ar | [Créditos hipotecarios UVA: guía completa](https://mudafy.com.ar/blog/post/nuevos-creditos-hipotecarios-uva) | NO en el blog | `calculadora-credito-uva-cuota-actual` | prensa/marketing Mudafy |
| 25 | **Segundo Enfoque** | segundoenfoque.com | [Crédito UVA: requisitos y lo que nadie te dice antes de firmar](https://segundoenfoque.com/credito-hipotecario-uva-argentina-requisitos-junio-2026) | NO | `calculadora-credito-uva-vs-tasa-fija` | contacto en sitio |
| 26 | **Reporte Inmobiliario** | reporteinmobiliario.com | Medio de referencia del sector, notas de crédito/mercado sin herramientas embebidas (verificar nota puntual antes de enviar) | s/verificar | `calculadora-credito-uva-vs-tasa-fija` + `calculadora-cuota-credito-hipotecario-uva-banco-nacion` | info@ del sitio |
| 27 | **Cámara Inmobiliaria Argentina (CIA)** / colegios de corredores provinciales | cia.org.ar | Newsletters y notas para matriculados; pitch "herramienta para la web de cada inmobiliaria socia" (multiplica: 1 acuerdo = N dominios) | NO | `calculadora-credito-uva-vs-tasa-fija` + `calculadora-hipoteca-uva-santander-argentina` | institucional |

## Grupo D — Medios tech en español (pitch: "2.900+ calculadoras gratis en español")

| # | Medio | URL | Ángulo | Contacto REAL (verificado) |
|---|-------|-----|--------|----------------------------|
| 28 | **Wwwhatsnew** (Juan Diego Polo) | wwwhatsnew.com | Cubre herramientas web gratuitas hace 20 años; encaja perfecto "sitio argentino con 2.900+ calculadoras gratis + widget embebible" | ✅ `contacto@wwwhatsnew.com` (para proponer artículos, verificado en /contacto) · alt: `diego@wwwhatsnew.com` |
| 29 | **Hipertextual** | hipertextual.com | Sección de herramientas/apps; pitch de producto + historia (un CMO argentino construyó 2.900 calcs) | ✅ `prensa@hipertextual.com` (notas de prensa, verificado en /contacto) · gral: `info@hipertextual.com` |
| 30 | **Genbeta** (Webedia) | genbeta.com | Cubre "webs útiles/gratis" constantemente | Form en genbeta.com/contacto → "contactar con los editores" (no publican email editorial; NO usar recruiting-spain@webedia-group.com, es de RRHH) |
| 31 | **Xataka** (Webedia) | xataka.com | Basics/herramientas; mismo grupo que Genbeta — si Genbeta publica, pitch interno | Form en xataka.com/contacto |
| 32 | **Computer Hoy** | computerhoy.com | Listas de "mejores webs para calcular X" | Form de contacto / redacción Axel Springer ES |

---

## Priorización sugerida (primeras 10 a contactar)

1. Diario Uno (publica aguinaldo en serie — máximo fit)
2. La Gaceta (verificado sin herramienta)
3. MDZ (2 temas: aguinaldo + indemnización)
4. García Alonso (post de FAL 27.802 = momento nov)
5. Contablix (recategorización = momento 15-jul, URGENTE)
6. Diario de Cuyo (ídem recategorización)
7. Wwwhatsnew (email verificado, respuesta rápida histórica)
8. Estudio Lamota (verificado sin calc)
9. Roomix (3 posts UVA)
10. LM Neuquén
