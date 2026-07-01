# Templates de email — outreach embeds

Reglas: máx. 120 palabras, sin adjetivos de venta, gancho = SU nota concreta. Enviar desde cuenta personal (Martin), no "info@". Asunto corto, minúsculas tipo humano. Un solo follow-up a los 5-7 días, después soltar.

**Snippet real del web component** (verificado en `src/pages/hc.js.ts` — el crédito "Powered by Hacé Cuentas" con backlink se agrega solo, fuera del iframe):

```html
<script async src="https://hacecuentas.com/hc.js"></script>

<hace-cuentas calculator="SLUG_DE_LA_CALC"></hace-cuentas>
```

Personalización opcional (mostrarla solo si preguntan): `accent="#d2122e"` (color del medio), `logo="https://medio.com/logo.svg"`, `title="..."`, `cta-label` + `cta-url` (CTA propio del medio bajo el resultado), `prefill='{"campo":"valor"}'`.

---

## Template A — Medios provinciales/nicho (gancho: nota sin herramienta)

**Asunto:** una calculadora para su nota del aguinaldo

Hola, soy Martin, de hacecuentas.com.

Vi la nota de [MEDIO] sobre [TEMA + LINK A LA NOTA]. Explica bien la fórmula, pero el lector se va a otro sitio a calcular su caso.

Les ofrezco embeber nuestra calculadora de [TEMA] directo en la nota: 2 líneas de código, gratis, sin registro, y se actualiza sola cuando cambian los valores (tasas, topes, escalas ARCA). Pueden ponerle el color y logo del medio.

```html
<script async src="https://hacecuentas.com/hc.js"></script>
<hace-cuentas calculator="calculadora-aguinaldo-sac"></hace-cuentas>
```

Demo acá: https://hacecuentas.com/partners

Si le sirve a la redacción, lo dejo configurado con la identidad de [MEDIO].

Martin

---

## Template B — Estudios contables / abogados laborales

**Asunto:** calculadora de [indemnización/monotributo] para tu blog

Hola [NOMBRE],

Leí tu post sobre [TEMA + LINK]. El paso a paso está muy claro; lo único que le falta es que el lector pueda meter sus números.

Hacé Cuentas tiene una calculadora de [indemnización con Ley 27.802 / recategorización con las escalas vigentes] que podés embeber gratis en ese post con 2 líneas:

```html
<script async src="https://hacecuentas.com/hc.js"></script>
<hace-cuentas calculator="calculadora-indemnizacion-despido"></hace-cuentas>
```

Se actualiza sola cuando cambian los valores — no tenés que tocar el post en cada actualización de ARCA. El que calcula y quiere asesoramiento, queda en tu página, no en la nuestra: incluso podés poner tu propio botón de contacto abajo del resultado.

¿Te lo dejo armado?

Martin — hacecuentas.com

---

## Template C — Blogs / portales inmobiliarios (crédito UVA)

**Asunto:** simulador UVA embebido para sus guías

Hola,

Vi la guía de [SITIO] sobre créditos UVA [LINK]. Las tasas y la relación cuota-ingreso cambian todos los meses, y mantener eso en texto es un dolor.

Ofrecemos embeber gratis nuestro simulador de cuota UVA (valor UVA del día, tasas por banco) en esa guía. Dos líneas de código, con el color y logo de ustedes, y un CTA propio bajo el resultado ("Ver propiedades en [SITIO]"):

```html
<script async src="https://hacecuentas.com/hc.js"></script>
<hace-cuentas calculator="calculadora-credito-uva-vs-tasa-fija"
  cta-label="Ver propiedades" cta-url="https://SITIO.com/"></hace-cuentas>
```

El lector calcula sin irse de su página. Demo: https://hacecuentas.com/partners

Martin — hacecuentas.com

---

## Template D — Medios tech ES (pitch de producto)

**Asunto:** 2.900+ calculadoras gratis en español (y embebibles)

Hola,

Soy Martin, creador de hacecuentas.com: más de 2.900 calculadoras gratuitas en español — sueldo, impuestos, préstamos, finanzas, matemática, salud, conversores — sin registro y sin paywall, con versiones para Argentina, España, México, Chile, Colombia y más países.

Lo distinto: cualquier sitio puede embeber cualquier calculadora como widget propio (web component, 2 líneas de código, tema personalizable, datos que se actualizan solos). Es el camino que hizo Omni Calculator, pero nativo en español.

Si les interesa para una nota de herramientas, les paso demo, números y lo que necesiten: https://hacecuentas.com/partners

Gracias!
Martin

---

## Template E — EN, prensa tech internacional

**Subject:** 2,900+ free calculators in Spanish — embeddable anywhere

Hi,

I'm Martin, founder of hacecuentas.com — 2,900+ free calculators in Spanish (salary, taxes, loans, math, converters), localized for Argentina, Spain, Mexico, Chile, Colombia and more. No signup, no paywall.

What's different: any site can embed any calculator as its own widget — a web component, two lines of code, custom branding, and the underlying data (tax brackets, rates, indexes) updates automatically. Think Omni Calculator, but built natively for the Spanish-speaking world, where no comparable tool exists.

```html
<script async src="https://hacecuentas.com/hc.js"></script>
<hace-cuentas calculator="calculadora-aguinaldo-sac"></hace-cuentas>
```

Happy to share numbers, a demo, or anything else: https://hacecuentas.com/partners

Best,
Martin

---

## Follow-up único (todos los grupos, 5-7 días después)

**Asunto:** re: [asunto original]

Hola, ¿llegaste a ver esto? Si no es para ustedes, no insisto. Si querés lo dejo montado en una página de prueba para que lo vean funcionando con su marca. Martin
