# Hacé Cuentas — herramientas y datos públicos para decidir mejor

[![Deploy](https://img.shields.io/badge/deploy-Cloudflare%20Workers-orange?logo=cloudflare)](https://hacecuentas.com)
[![Astro](https://img.shields.io/badge/Astro-6.x-blueviolet?logo=astro)](https://astro.build)
[![Tests](https://img.shields.io/badge/tests-572%20passing-brightgreen)](https://github.com/grblasquiz/hacecuentas/actions)
[![License](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![Datos](https://img.shields.io/badge/datos-CC--BY%204.0-success)](https://hacecuentas.com/datasets)

**[Hacé Cuentas](https://hacecuentas.com)** reúne herramientas gratuitas, explicaciones y datasets económicos para Argentina y Latinoamérica. Las páginas canónicas agrupan cálculos relacionados para responder una decisión completa, con fórmulas verificables, fuentes declaradas y ejecución privada en el navegador.

- Sin registro ni muros de pago.
- Cálculos ejecutados en el dispositivo del usuario.
- Cobertura en español, portugués e inglés.
- Fuentes oficiales y metodología visible.
- Datos económicos descargables en CSV y JSON.

## Empezar por los hubs canónicos

Estos son los destinos estables del proyecto. Cada hub concentra herramientas relacionadas, contexto, fórmulas, preguntas frecuentes y fuentes.

### Trabajo e impuestos

- [Sueldo bruto y neto](https://hacecuentas.com/trabajo/sueldo-bruto-y-neto)
- [Aguinaldo](https://hacecuentas.com/trabajo/aguinaldo)
- [Indemnización por despido](https://hacecuentas.com/trabajo/indemnizacion-por-despido)
- [Monotributo](https://hacecuentas.com/impuestos/monotributo)
- [Ganancias de cuarta categoría](https://hacecuentas.com/impuestos/ganancias-cuarta-categoria)
- [Costo de un empleado en México](https://hacecuentas.com/mx/trabajo/costo-de-un-empleado)

### Finanzas personales

- [Dólar y tipos de cambio](https://hacecuentas.com/finanzas-personales/dolar)
- [Plazo fijo e inversiones](https://hacecuentas.com/inversiones/plazo-fijo)
- [Crédito hipotecario](https://hacecuentas.com/vivienda/credito-hipotecario)
- [Préstamo quirografario IESS y créditos en Ecuador](https://hacecuentas.com/ec/finanzas-personales/creditos-y-ahorro)

### Conversiones, fechas y matemática

- [Números a letras para cheques y pagarés](https://hacecuentas.com/conversores/numeros-a-letras)
- [Generaciones por año de nacimiento](https://hacecuentas.com/fechas/generaciones)
- [Porcentajes](https://hacecuentas.com/matematica/porcentajes)
- [Mundial 2026](https://hacecuentas.com/futbol/mundial-2026)
- [Sol, Luna y mareas](https://hacecuentas.com/ciencia/sol-luna-y-mareas)

## Datasets económicos abiertos

El [catálogo público de datasets](https://hacecuentas.com/datasets) ofrece series y tablas reutilizables bajo licencia **CC-BY 4.0**. Se pueden usar en notas, trabajos académicos, aplicaciones y visualizaciones citando a Hacé Cuentas con un enlace al dataset original.

### Argentina

- [Tabla del Monotributo desde agosto 2026](https://hacecuentas.com/datos-monotributo-2026) — categorías A–K, topes y cuotas: [CSV](https://hacecuentas.com/datos/monotributo-2026.csv) · [JSON](https://hacecuentas.com/datos/monotributo-2026.json)

### Salarios mínimos de Latinoamérica

- [Comparativa regional 2026](https://hacecuentas.com/datos-salario-minimo-latam-2026)
- [Salario mínimo de México 2026](https://hacecuentas.com/mx/datos-salario-minimo-mexico-2026) — [CSV](https://hacecuentas.com/datos/salario-minimo-mexico-2026.csv) · [JSON](https://hacecuentas.com/datos/salario-minimo-mexico-2026.json)
- [Salario mínimo de Colombia 2026](https://hacecuentas.com/co/datos-salario-minimo-colombia-2026) — [CSV](https://hacecuentas.com/datos/salario-minimo-colombia-2026.csv) · [JSON](https://hacecuentas.com/datos/salario-minimo-colombia-2026.json)
- [Sueldo mínimo de Perú 2026](https://hacecuentas.com/pe/datos-sueldo-minimo-peru-2026) — [CSV](https://hacecuentas.com/datos/sueldo-minimo-peru-2026.csv) · [JSON](https://hacecuentas.com/datos/sueldo-minimo-peru-2026.json)

Cada ficha incluye fecha de revisión, alcance geográfico, fuentes, licencia y metadatos `Dataset`/`DataCatalog` de Schema.org.

## Integrar Hacé Cuentas

- [Documentación para desarrolladores](https://hacecuentas.com/desarrolladores)
- [Guía para embeber herramientas](https://hacecuentas.com/embeber)
- [Plugin para WordPress](https://hacecuentas.com/wordpress)

Los hubs y herramientas compatibles pueden integrarse mediante un `iframe`:

```html
<iframe
  src="https://hacecuentas.com/embed/calculadora-porcentajes"
  width="100%"
  height="650"
  loading="lazy"
  title="Calculadora de porcentajes de Hacé Cuentas">
</iframe>
<p>Fuente: <a href="https://hacecuentas.com/matematica/porcentajes">Hacé Cuentas</a></p>
```

## Arquitectura

| Capa | Tecnología |
|---|---|
| Framework | Astro 6.x, SSG + SSR |
| Lenguaje | TypeScript estricto |
| Runtime | Cloudflare Workers |
| Persistencia | Cloudflare D1 y KV para funciones puntuales |
| Pruebas | Vitest, smoke tests de fórmulas y gates editoriales |
| Indexación | Sitemaps segmentados e IndexNow |
| Datos abiertos | CSV, JSON y Schema.org Dataset/DataCatalog |

La lógica matemática vive en funciones TypeScript puras. Los hubs canónicos componen esas fórmulas en experiencias de decisión más completas, y los redirects históricos concentran la autoridad en esos destinos estables.

## Desarrollo local

Requiere Node.js 22 o superior.

```bash
git clone https://github.com/grblasquiz/hacecuentas
cd hacecuentas
npm install
npm run dev
```

Comandos principales:

```bash
npm test           # suite de Vitest
npm run build      # build de producción con gates
npm run seo:audit  # auditoría SEO
npm run sitemap    # regenerar sitemaps
```

## Calidad editorial

- [Política editorial](https://hacecuentas.com/politica-editorial)
- [Metodología](https://hacecuentas.com/metodologia)
- [Equipo y responsable editorial](https://hacecuentas.com/sobre-nosotros)

Los resultados son informativos. En temas financieros, fiscales o de salud, las páginas muestran fuentes y advertencias específicas; no reemplazan asesoramiento profesional.

## Contribuir

Las contribuciones pueden corregir fórmulas, fuentes, accesibilidad, traducciones o documentación. Antes de proponer un cambio:

1. Abrí un issue describiendo el caso y la fuente oficial.
2. Agregá o actualizá pruebas cuando cambie una fórmula.
3. Ejecutá `npm test` y el build completo.
4. No agregues páginas duplicadas: extendé el hub canónico correspondiente.

## Licencias

- Código: [MIT](LICENSE).
- Datasets publicados por Hacé Cuentas: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

Contacto editorial y prensa: [contacto@hacecuentas.com](mailto:contacto@hacecuentas.com)
