# Calendario de outreach H2 2026 — momentos-noticia → embeds

Lógica: contactar 2-3 semanas ANTES del pico de búsquedas, cuando la redacción está planificando la nota pero todavía no la publicó. El embed entra en la nota nueva, no en una vieja.

| Momento | Fecha pico | Enviar outreach | Calc a embeber (slug) | Grupo de targets | Asunto del email |
|---|---|---|---|---|---|
| **1. Recategorización monotributo** | Ventana ARCA: 15-jul → 5-ago | ⚠️ YA (1-10 jul) — es el más urgente | `calculadora-monotributo-categoria-2026-recategorizacion-julio` (secundarias: `calculadora-monotributo-categoria-ingresos-tope`, `calculadora-monotributo-cuota-2026-todas-categorias`) | Grupo B completo (contables: Contablix, Wynges, Piacentini, Finanzas p/Emprendedores, CPCE Córdoba, CTPCBA) + Diario de Cuyo, MDZ, Diario Uno | "calculadora de recategorización para tus lectores (abre el 15/7)" |
| **2. FAL / Ley 27.802** (Fondo de Asistencia Laboral operativo) | 1-nov | 6-20 oct | `calculadora-indemnizacion-despido` (actualizada con Ley 27.802; secundaria: `calculadora-indemnizacion-despido-fuerza-mayor-art-247-lct`) | Grupo B abogados (García Alonso, Herrera & Flamenco, Lamota, La Defensa, Sindical Federal) + MDZ, Perfil | "el 1/11 arranca el FAL: calculadora de indemnización actualizada para tu blog" |
| **3. CyberMonday (2-4 nov) / Black Friday (27-nov)** | nov | 12-26 oct | `calculadora-descuento-precio-final` y `calculadora-descuento-porcentaje-precio` (secundarias: `calculadora-cuanto-falta-venc-tarjeta-credito-mes`, cuotas vs contado) | Grupo A (medios provinciales, secciones de consumo) + Grupo D (tech ES: nota "herramientas para no comprar de más") | "widget de descuentos reales para tu cobertura de CyberMonday" |
| **4. Reforma tributaria** (anuncios nov-dic) | nov-dic (fecha móvil, seguir anuncios del Gobierno) | Preparar templates en oct; disparar el DÍA del anuncio (news-jacking: acá gana la velocidad, no la anticipación) | `sueldo-en-mano-argentina` + `calculadora-ganancias-aguinaldo-sac-retencion` (ajustar según qué toque la reforma) | Grupo A completo + Grupo B contables | "cuánto te cambia el sueldo con la reforma: calculadora lista para embeber" |
| **5. Aguinaldo diciembre** | fecha límite 18-dic; pico de búsquedas ~1-18 dic | 17-28 nov | `calculadora-aguinaldo-sac` (secundarias: `calculadora-cuanto-falta-aguinaldo-junio-diciembre`, `calculadora-ganancias-aguinaldo-sac-retencion`, `calculadora-aguinaldo-empleada-casa-particular-medio-tiempo-categoria`) | Grupo A completo — todos publicaron la nota de junio SIN herramienta (verificado: La Gaceta, MDZ; Diario Uno publicó 8+) | "para la nota del aguinaldo de diciembre: calculadora embebida, gratis" |

## Notas operativas

- **Momento 1 ya está encima**: la ventana 15-jul→5-ago arranca en dos semanas. Priorizar los 6 contables + Diario de Cuyo esta semana.
- **Pitch UVA (Grupo C) no tiene momento-noticia fijo**: las tasas cambian todos los meses → outreach evergreen, meter entre momentos (ago-sep es el hueco ideal).
- **Grupo D (tech ES)**: no depende del calendario AR. Mejor ventana: CyberMonday/Black Friday España (nota de herramientas) o cualquier semana floja de noticias. Evitar sep (vuelta al cole satura).
- **Regla de re-uso**: un medio que embebe la calc de aguinaldo en dic es candidato caliente para monotributo en ene-2027 (nueva recategorización 20-ene) y aguinaldo jun-2027. Registrar cada "sí" en `partners.json` con partner-id propio para trackear eventos (`hc:calculate`) por dominio.
- **Medición**: los embeds emiten `hc:ready` / `hc:calculate`; el backlink "Powered by" es followable → chequear nuevos referring domains en Bing Webmaster (motor real según diagnóstico 6-26) a los 15-30 días de cada ola.
- **No prometer exclusividad** ni aceptar `no-attribution` salvo acuerdo explícito de Martin (requiere alta en `/partners/<id>.json` con `attributionWaived`).
