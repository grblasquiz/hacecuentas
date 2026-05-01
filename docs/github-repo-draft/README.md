# Calculadoras Argentinas — Open Source Formulas

> Fórmulas oficiales para cálculos fiscales, laborales y financieros de Argentina.
> Mantenidas por [Joaquín Mendoza](https://hacecuentas.com/sobre-nosotros) — autor de [Hacé Cuentas](https://hacecuentas.com).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Sources](https://img.shields.io/badge/sources-AFIP%20%7C%20BCRA%20%7C%20ANSES-blue)](#fuentes-oficiales)
[![Live calculators](https://img.shields.io/badge/live%20calculators-hacecuentas.com-green)](https://hacecuentas.com)

## ¿Qué es esto?

Implementaciones TypeScript abiertas de las **30 fórmulas argentinas** más usadas:

- **Sueldo & Liquidación**: neto desde bruto, aguinaldo (SAC), indemnización por despido, vacaciones, horas extra
- **Impuestos**: Ganancias 4ta categoría, Monotributo, Bienes Personales, IIBB CABA, IVA, RG 830
- **ANSES & Beneficios**: jubilación, AUH, becas, asignaciones
- **Finanzas**: cuota préstamo (sistema francés), plazo fijo, inflación, UVA vs pesos vs dólar
- **Inversiones AR**: bonos AL30/AL35/AL41, CEDEARs, brecha cambiaria

Cada fórmula está **verificada contra fuentes oficiales** (AFIP, BCRA, ANSES, INDEC) y se actualiza cuando cambia la ley.

## ¿Por qué open source?

Las fórmulas fiscales/laborales argentinas son frecuentemente **mal implementadas** en blogs y calcs random. Los errores afectan decisiones reales (sueldo, jubilación, impuestos).

Este repo existe para que cualquier desarrollador pueda:
1. **Verificar** un cálculo antes de confiar
2. **Reutilizar** la fórmula en su proyecto (license MIT)
3. **Reportar errores** o discrepancias con la ley
4. **Contribuir** mejoras o nuevas fórmulas

## Demo en vivo

Cada fórmula tiene una calculadora online en [hacecuentas.com](https://hacecuentas.com) con UI completa, datos actualizados y FAQ:

| Categoría | Calculadoras live |
|-----------|-------------------|
| Sueldo | [Sueldo en mano](https://hacecuentas.com/sueldo-en-mano-argentina) · [Aguinaldo SAC](https://hacecuentas.com/calculadora-aguinaldo-sac) · [Indemnización despido](https://hacecuentas.com/calculadora-indemnizacion-despido) |
| Impuestos | [Ganancias 4ta cat](https://hacecuentas.com/calculadora-ganancias-empleados-4ta-categoria-2026) · [Monotributo](https://hacecuentas.com/calculadora-monotributo-2026) · [Bienes Personales](https://hacecuentas.com/calculadora-bienes-personales-2026) |
| ANSES | [Jubilación](https://hacecuentas.com/simulador-jubilacion-anses) · [AUH](https://hacecuentas.com/calculadora-auh-asignacion-universal-hijo-monto-2026) |
| Finanzas | [Cuota préstamo](https://hacecuentas.com/calculadora-cuota-prestamo) · [Plazo fijo](https://hacecuentas.com/comparador-plazo-fijo) · [Inflación](https://hacecuentas.com/inflacion-argentina) |

## Quick start

```bash
npm install calculadoras-argentinas
```

```typescript
import { aguinaldoSAC } from 'calculadoras-argentinas';

// Aguinaldo (SAC) — Ley 23.041
const result = aguinaldoSAC({
  mejorSueldoSemestre: 850000,  // pesos
  mesesTrabajados: 6,           // semestre completo
});

console.log(result);
// {
//   monto: 425000,             // mejor sueldo / 2
//   proporcional: false,       // semestre completo
//   fechaPago: '2026-06-30',   // hasta el 4 de cada mes posterior
//   fuente: 'Ley 23.041 — texto vigente',
// }
```

## Estructura

```
calculadoras-argentinas/
├── src/
│   ├── sueldo/
│   │   ├── neto-desde-bruto.ts
│   │   ├── aguinaldo-sac.ts
│   │   ├── indemnizacion-despido.ts
│   │   ├── vacaciones-dias-ley.ts
│   │   └── horas-extra.ts
│   ├── impuestos/
│   │   ├── ganancias-4ta-categoria.ts
│   │   ├── ganancias-escala-2026.ts
│   │   ├── monotributo-categoria.ts
│   │   ├── bienes-personales.ts
│   │   ├── iibb-caba.ts
│   │   ├── iva.ts
│   │   └── retencion-rg-830.ts
│   ├── anses/
│   │   ├── jubilacion-pbu-pc.ts
│   │   ├── auh-monto.ts
│   │   ├── beca-progresar.ts
│   │   └── edad-jubilacion-aportes.ts
│   ├── finanzas/
│   │   ├── cuota-prestamo-frances.ts
│   │   ├── plazo-fijo-tea-tem.ts
│   │   ├── inflacion-poder-compra.ts
│   │   ├── uva-vs-pesos-vs-dolar.ts
│   │   ├── sueldo-bruto-desde-neto.ts
│   │   └── actualizacion-alquiler-icl.ts
│   ├── inversiones/
│   │   ├── bonos-soberanos-tir.ts
│   │   ├── cedear-ratio-conversion.ts
│   │   └── dolar-mep-ccl-blue-brecha.ts
│   ├── data/
│   │   ├── escala-ganancias-2026.json
│   │   ├── monotributo-tabla-2026.json
│   │   ├── bienes-personales-2026.json
│   │   └── ipc-historico.json
│   └── index.ts
├── tests/
│   └── ...        # Vitest unit tests
├── docs/
│   ├── fuentes-oficiales.md
│   └── changelog-leyes.md
├── package.json
├── tsconfig.json
└── README.md
```

## Fuentes oficiales

Cada fórmula cita y linkea su fuente legal/regulatoria:

| Cálculo | Fuente | Última actualización |
|---------|--------|---------------------|
| Aguinaldo (SAC) | [Ley 23.041](https://servicios.infoleg.gob.ar/infolegInternet/anexos/15000-19999/15710/norma.htm) | 2026 |
| Indemnización despido | [LCT art. 245](https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm) | 2026 |
| Ganancias 4ta cat | [Ley 27.541 + decretos](https://www.afip.gob.ar/) | Actualización 2026 |
| Monotributo | [Resolución AFIP](https://www.afip.gob.ar/monotributo/) | Recategorización ene/2026 |
| Bienes Personales | [Ley 23.966](https://servicios.infoleg.gob.ar/) | 2026 (MNI actualizado) |
| Jubilación ANSES | [Ley 24.241](https://servicios.infoleg.gob.ar/) + Decretos | 2026 |
| Plazo fijo | [Comunicación BCRA "A"](https://www.bcra.gob.ar/) | 2026 |
| Inflación | [INDEC IPC](https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31) | Mensual |
| Dólar | [BCRA Cotizaciones](https://www.bcra.gob.ar/) + DolarApi | Real-time |

## Sobre el autor

**Joaquín Mendoza** — CMO en Argenprop (portal inmobiliario argentino, +20 años).

Inversor y emprendedor en finanzas/tecnología. Experiencia certificable en:
- Cálculos fiscales argentinos (Ganancias, Monotributo, Bienes Personales)
- Mercado inmobiliario AR (alquileres, hipotecas, valores)
- Análisis de inflación y poder adquisitivo

[LinkedIn]() · [hacecuentas.com](https://hacecuentas.com)

## Cómo contribuir

1. **Reportar errores**: si encontrás una discrepancia con la ley, abrí un [Issue](../../issues) con el cálculo + fuente oficial
2. **Sugerir nuevas fórmulas**: ¿falta tu cálculo favorito? Pull request o discussion
3. **Mejoras de docs**: typos, ejemplos, traducciones — bienvenido todo

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guidelines.

## License

[MIT](LICENSE) — usalo en tu proyecto, comercial o no, sin problema.

Si te resulta útil, considerá:
- ⭐ darle star al repo
- Linkearlo en tu blog/proyecto
- Contribuir con un test, fix, o nueva fórmula
- Compartir [hacecuentas.com](https://hacecuentas.com) si conocés a alguien que necesita una calc

---

> **Última revisión técnica**: 2026-05-01
> **Versión actual**: 0.1.0 (draft)
> **Mantenido por**: [Hacé Cuentas — Equipo Editorial](https://hacecuentas.com/sobre-nosotros)
