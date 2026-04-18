# Próximas calcs provinciales (data y template listos)

Esta sesión agregamos **impuesto-inmobiliario.json** (24 provincias). Para escalar más calcs provinciales, usar el mismo template.

## Calc #2 — Tarifa eléctrica residencial (próximo a implementar)

### Estructura JSON esperada

```json
{
  "calcSlug": "calculadora-tarifa-electrica-residencial-provincia",
  "calcName": "Tarifa Eléctrica Residencial",
  "heroEmoji": "⚡",
  "category": "finanzas",
  "provinceData": {
    "buenos-aires": {
      "rate": "$ 65-180/kWh",
      "details": "...",
      "metrics": {
        "Tarifa T1R residencial básico": "$ 65/kWh",
        "Distribuidora principal": "EDELAP / EDEN / EDES",
        "Cargo fijo": "$ 2.500/mes",
        "Subsidio N1/N2/N3": "Si"
      }
    }
    // ... 23 más
  }
}
```

### Data sources para investigación

- **ENRE** (Ente Nacional Regulador de Electricidad) — tarifas nacionales vigentes
- **Web de cada distribuidora** — tablas tarifarias actualizadas
  - EDELAP (Buenos Aires sur/oeste)
  - EDEN/EDEA (Buenos Aires interior)
  - Edenor (CABA norte + GBA norte)
  - Edesur (CABA sur + GBA sur)
  - EPEC (Córdoba)
  - EPE (Santa Fe)
  - EDEMSA (Mendoza)
  - EDET (Tucumán)
  - SECHEEP (Chaco)
  - etc.
- **Secretaría de Energía** — schemas de subsidios N1/N2/N3

### Por qué tiene alto search volume

- "tarifa luz [provincia] 2026" → búsquedas masivas (recurring billing)
- "cuánto sale el kWh en [provincia]" → mensual
- "categoría N1 N2 N3 luz" → confusión por subsidios

### Diferencial vs competencia

La mayoría de sitios muestran solo una distribuidora o tarifas desactualizadas. Con 24 provincias × distribuidora + categorías de subsidio, cubrimos un gap real.

---

## Calc #3 — Impuesto a los sellos sobre compraventa inmobiliaria

Diferente del existente `calculadora-impuesto-sellos-inmueble-contrato` (que es para alquileres).

### Key features

- Alícuota típica 1.2% a 3.6% sobre valor de compraventa
- Quién paga: depende de la provincia (comprador, vendedor, o 50/50)
- Bonificaciones para vivienda única (exención o reducción)
- Base imponible: mayor entre precio y valuación fiscal

### Fuente

Códigos fiscales provinciales + escribanías (colegios notariales por provincia tienen tablas).

---

## Por qué no generamos más automáticamente

Generar data fiscal sin verificación fuente-por-fuente puede:
1. Dar información errónea a usuarios (decisiones financieras reales)
2. Bajar E-E-A-T del sitio (Google detecta datos desactualizados)
3. Generar responsabilidad legal si alguien hace decisiones basadas en esto

**El template está probado funcionando** (impuesto-inmobiliario.json genera 24 páginas). Para cada nueva calc provincial:
1. Copiar estructura del existing
2. Investigar data real por provincia (1-3h de trabajo)
3. Poner disclaimer visible + link a fuente oficial
4. Correr `npm run build` para validar

## Volumen total potencial

Con 5 calcs provinciales completas:
- 5 × 24 = **120 páginas nuevas indexables**
- Cada una = oportunidad de ranking en queries long-tail
- Todo el contenido es único + útil (no boilerplate)

**Estimación**: +5.000 a +15.000 visitas/mes orgánicas una vez indexadas (3-6 meses).
