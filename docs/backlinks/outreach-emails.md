# Outreach Emails — Templates y lista de targets

**Importante**: estos emails los enviás VOS (el kit no los manda automático). El objetivo es calidad, no volumen. 1 email pensado > 10 genéricos.

## Lista priorizada de targets

### Tier A — Medios AR de economía/finanzas (DR 70+)

| Medio | Contacto | Ángulo |
|---|---|---|
| iProfesional | redaccion@iprofesional.com | "Herramientas para freelancers y monotributistas" |
| Infobae Economía | editor.economia@infobae.com (via form) | "Calculadoras de sueldo/aguinaldo 2026 actualizadas" |
| Ámbito Financiero | redaccion@ambito.com | "Dashboard de valores BCRA en vivo" |
| El Cronista | redaccion@cronista.com | "Open source: herramienta para empresarios argentinos" |
| La Nación (Finanzas) | via form lanacion.com.ar/contacto | "Calculadora de Ganancias actualizada al 2026" |
| Clarín (Economía) | lectores@clarin.com | Sugerencia de herramienta para sus notas |

### Tier B — Blogs de finanzas personales AR (DR 30-50)

| Blog/Persona | Contacto | Ángulo |
|---|---|---|
| Mujer Financiera (Sofía Macedo) | @mujerfinanciera IG DM | "Herramientas que recomendaría a tus lectoras" |
| Pato Nisenson | web contact | "Calculadora de plazo fijo actualizada" |
| Damián Tabakman | web contact | "Calcs inmobiliarias (ICL, crédito UVA)" |
| Vicky Diz | IG DM | "Calcs de sueldo y aguinaldo" |
| Fede Tessore | email via web | "Herramienta para emprendedores" |
| Club de Emprendedores | email via web | "Recurso gratis para newsletter" |
| Finanzas en Pareja | IG | "Calcs de presupuesto familiar" |

### Tier C — Sitios de emprendimiento/productividad (DR 40+)

| Sitio | Contacto | Ángulo |
|---|---|---|
| EmpreTienda blog | contacto vía web | "Calcs para ecommerce AR" |
| Tiendanube blog | contact | "Herramientas para tiendistas" |
| Mercado Pago Devs | community | "API público de calcs" |
| Produvar (produ.ai) | community | "Calcs para SaaS" |

### Tier D — Comunidades y newsletters

| Comunidad | Plataforma | Ángulo |
|---|---|---|
| Argentina Tech Guild | Slack/Discord | "Showcase: built 1200 static pages" |
| Astro Discord | official | "Real-world Astro scaling" |
| WebPerformance Telegram | TG | "Cloudflare Pages + Astro case study" |
| r/argentina_newsletters | Reddit | inclusión en boletines de recursos |

---

## Template 1 — Cold email a medio

**Asunto**: `Herramienta gratuita para tus lectores — calculadoras fiscales 2026`

```
Hola {{nombre del periodista/editor}},

Sigo {{nombre del medio}} hace tiempo, especialmente las notas de {{columnista o sección específica}}. Me pareció que {{referencia concreta a una nota reciente}} es un buen ejemplo de la utilidad de tener herramientas accesibles.

Te escribo porque construí hacecuentas.com — una librería gratuita de 535+ calculadoras en español, mantenida actualizada a las escalas AFIP/ARCA de 2026.

Algunas que podrían interesarle a tus lectores:

→ Sueldo en mano Argentina (escalas 2026): https://hacecuentas.com/sueldo-en-mano-argentina
→ Aguinaldo SAC: https://hacecuentas.com/calculadora-aguinaldo-sac
→ Indemnización por despido: https://hacecuentas.com/calculadora-indemnizacion-despido
→ Monotributo 2026: https://hacecuentas.com/calculadora-monotributo-2026
→ Dashboard BCRA (dólar, inflación, UVA en vivo): https://hacecuentas.com/valores-bcra

Tres cosas que lo diferencian de otras calculadoras online:

1. Nada viaja a un servidor — todo el cálculo corre en el browser
2. Sin registro, sin ads, sin trackers
3. Open source (MIT): github.com/grblasquiz/hacecuentas

Si en alguna nota futura te viene bien linkear una calc concreta, contame y te armo la explicación paso a paso del cálculo que necesites (proceso de cálculo, escalas, casuística). Sin condiciones, sin costo.

También respondo si te parece overkill para tus lectores y no corresponde.

Saludos,
{{tu nombre}}
Creador de hacecuentas.com
```

---

## Template 2 — Blogger o influencer

**Asunto**: `Calcs que podés recomendar a tu audiencia (sin comisión, solo útiles)`

```
Hola {{nombre}},

Te escribo porque sigo tu contenido de {{tema específico, ej. "finanzas personales"}} desde {{cómo la conociste}}, y me imagino que muchas veces tus lectores/followers te preguntan cómo calcular X (aguinaldo, sueldo neto, cuota de préstamo, etc.).

Hice hacecuentas.com justamente por eso: calcs gratuitas en español, actualizadas, sin ads, sin registro.

Algunas que podrían ser útiles para tu audiencia argentina:

{{2-3 calcs específicas al nicho del influencer}}

- Si hacés finanzas personales: sueldo en mano, aguinaldo, plazo fijo
- Si hacés fitness/salud: IMC, TDEE, calorías diarias
- Si hacés emprendimientos: break-even, CAC payback, monotributo vs RI

No te estoy pidiendo que hagas una review ni nada comercial — solo que si te sirve, la tengas para cuando un follower te pregunte. Y si tenés feedback para mejorar alguna, te escucho.

Código es open source: github.com/grblasquiz/hacecuentas

Saludos,
{{tu nombre}}
```

---

## Template 3 — Comunidad tech

**Asunto**: `Case study: scaled an Astro site to 1,200 pages on Cloudflare`

```
Hey {{community name}},

Built hacecuentas.com — 1,236 static pages generated from content collections. Thought I'd share the architecture in case it's useful.

Key decisions:
- 1 dynamic route handles 535 calculators (one JSON per calc)
- Build-time data fetching for semi-realtime pages (daily exchange rates)
- Hand-rolled markdown parser (no remark) because the pipeline felt overkill
- Cloudflare Pages with _headers to bypass edge cache for HTML

Full writeup with code:
→ https://dev.to/{{tu-username}}/how-i-built-1200-calculator-pages-in-astro
→ https://dev.to/{{tu-username}}/parsing-markdown-tables-in-20-lines
→ https://dev.to/{{tu-username}}/fetching-real-time-data-at-build-time

Source (MIT): github.com/grblasquiz/hacecuentas
Live: hacecuentas.com

Open to questions / critique / roasts.
```

---

## Secuencia de follow-up

**Día 0**: email inicial
**Día 4**: follow-up 1 si no responden

```
Hola {{nombre}},

Sé que la bandeja se te llena. Rápido: te mandé el martes sobre hacecuentas.com (calcs gratuitas, sin ads).

Si te sirve para alguna nota o no es relevante, una respuesta corta me ayuda a no molestarte.

Gracias,
{{tu nombre}}
```

**Día 10**: follow-up 2 si sigue silencio

```
{{nombre}}, último mensaje sobre esto.

Te mando el link por si algún día te sirve: hacecuentas.com

Si no es relevante ahora, totalmente entendido. Dejo el ofrecimiento abierto por si en el futuro un tema fiscal te lleva a necesitar explicarle a lectores cómo calcular X, el sitio está y yo también.

Un saludo,
{{tu nombre}}
```

**Si no responde al día 15**: cerrar, no mandar más. Mandar a otro contacto del mismo medio si existe.

---

## Reglas

1. **Personalizá el primer párrafo siempre** — mencioná algo concreto del periodista/blog (nota reciente, columna, ángulo)
2. **Links en el cuerpo, no en subject**
3. **Valor gratis primero, ask después** — ofrecer info/herramientas, no pedir review
4. **Nunca attach**. Los medios filtran attachments por virus/spam
5. **Signature corta**. Nombre + una línea + URL. Nada de firmas de Outlook gigantes con logos
6. **Horario de envío**: 10-12h local del destinatario, martes-jueves. Nunca viernes PM ni lunes AM
7. **Un solo follow-up cada 4-6 días**. Más es acoso
8. **Tracker**: armá un sheet con nombre, email, fecha envío, respuesta. No quemes contactos mandando dos veces

---

## Tracking sheet (ejemplo)

| Medio | Contacto | Email | Enviado | Respondió | Status | Link conseguido |
|---|---|---|---|---|---|---|
| iProfesional | Juan Pérez | jperez@... | 18/abr | Sí, 22/abr | En redacción | Pendiente |
| Infobae | Editor Economía | form | 18/abr | No | F/U 22/abr | — |
| Mujer Financiera | Sofía | IG DM | 19/abr | Sí, 20/abr | Agendó post para 25/abr | Pendiente |

---

## Expectativas realistas

- **Tasa de respuesta**: 10-20% en cold outreach a medios
- **Tasa de conversión** (respuesta → link): 30-50%
- **Tiempo hasta ver el link publicado**: 2-6 semanas desde que aceptan
- **Links esperados de 30 emails a tier A/B**: 3-8 links

No es rápido, pero cada link de un medio argentino con DR 70+ vale más que 100 links de directorios de baja calidad.

---

**Timing sugerido**: empezar con 10 emails a tier B (más response rate, entrenás el pitch), luego 10 a tier A con lo aprendido.
