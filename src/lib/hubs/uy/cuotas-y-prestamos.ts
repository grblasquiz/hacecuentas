import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'uy/finanzas/cuotas-y-prestamos',
  title: "¿Cuánto voy a pagar por mes? | Hacé Cuentas",
  description: "Hub de decisión con 2 cálculos: Calculadora de cuota de crédito hipotecario en UI — Uruguay 2026; Calculadora de cuota de préstamo personal — Uruguay 2026.",
  silo: "Préstamos en Uruguay",
  siloHref: '/uy/finanzas',
  locale: 'uy',
  eyebrow: "Uruguay · Préstamos en Uruguay",
  h1: "¿Cuánto voy a pagar por mes?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de cuota de crédito hipotecario en UI — Uruguay 2026",
    "hint": "Un crédito hipotecario en UI tiene cuota fija en Unidades Indexadas, pero su valor en pesos sube con la inflación. $U 4.000.000 al 5,9% en 20 años da 4.261 UI (≈ $U 28.075 hoy, unos $U 50.278 en 10 años).",
    "yes": [
      "En un crédito en UI, la **cuota en UI es fija** (sistema francés) pero su valor **en pesos sube con el IPC**. montoUI = pesos ÷ **6,6253**; cuotaUI = montoUI × i / (1 − (1+i)^−n) con **i = (1+TEA_UI)^(1/12) − 1**. La cuota en pesos hoy = cuotaUI × 6,6253, y crece cada año con la inflación. Tasa editable; ejemplo orientativo, no es una oferta de crédito."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-26.",
    "answer": "Un crédito hipotecario en UI tiene cuota fija en Unidades Indexadas, pero su valor en pesos sube con la inflación. $U 4.000.000 al 5,9% en 20 años da 4.261 UI (≈ $U 28.075 hoy, unos $U 50.278 en 10 años)."
  },
  {
    "id": "c2",
    "label": "Calculadora de cuota de préstamo personal — Uruguay 2026",
    "hint": "La cuota de un préstamo por sistema francés = capital × i / (1 − (1+i)^−n), con i = tasa mensual efectiva. Un préstamo de $U 100.000 al 28% TEA en 24 cuotas da unos $U 5.334 por mes.",
    "yes": [
      "Cuota fija (sistema francés) = **capital × i / (1 − (1+i)^−n)**, con **i = (1+TEA)^(1/12) − 1** (NO se divide la TEA entre 12) y n = cantidad de cuotas. BROU parte de **~28% TEA**; el BCU fija los **topes de usura** por trimestre (Ley 18.212). Estirar el plazo baja la cuota pero sube el total de intereses. No incluye IVA sobre intereses ni seguros."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "La cuota de un préstamo por sistema francés = capital × i / (1 − (1+i)^−n), con i = tasa mensual efectiva. Un préstamo de $U 100.000 al 28% TEA en 24 cuotas da unos $U 5.334 por mes."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__montoPesos",
    "label": "Calculadora de cuota de crédito hipotecario en UI — Uruguay 2026: Monto del préstamo (en pesos)",
    "type": "number",
    "value": 4000000,
    "prefix": "$U",
    "min": 0,
    "step": 10000,
    "thousands": false,
    "help": "Capital del crédito en pesos. Se pasa a UI dividiendo por $U 6,6253 (valor de la UI)."
  },
  {
    "id": "c1__tasaTEA_UI",
    "label": "Calculadora de cuota de crédito hipotecario en UI — Uruguay 2026: Tasa efectiva anual en UI (TEA)",
    "type": "number",
    "value": 5.9,
    "suffix": "%",
    "min": 0,
    "max": 100,
    "step": 0.1,
    "thousands": false,
    "help": "TEA pactada en UI. En 2026 los créditos de vivienda rondaban 4,9%–6,5%; es editable."
  },
  {
    "id": "c1__plazoAnios",
    "label": "Calculadora de cuota de crédito hipotecario en UI — Uruguay 2026: Plazo (años)",
    "type": "number",
    "value": 20,
    "suffix": "años",
    "min": 1,
    "step": 1,
    "thousands": false,
    "help": "Duración del crédito en años (se pasa a meses ×12)."
  },
  {
    "id": "c1__inflacionAnual",
    "label": "Calculadora de cuota de crédito hipotecario en UI — Uruguay 2026: Inflación anual esperada",
    "type": "number",
    "value": 6,
    "suffix": "%",
    "min": 0,
    "step": 0.1,
    "thousands": false,
    "help": "Para proyectar cuánto sube en pesos la cuota (la UI sigue el IPC)."
  },
  {
    "id": "c2__monto",
    "label": "Calculadora de cuota de préstamo personal — Uruguay 2026: Monto del préstamo",
    "type": "number",
    "value": 100000,
    "prefix": "$U",
    "min": 0,
    "step": 1000,
    "thousands": false,
    "help": "Capital que pedís prestado, en pesos uruguayos."
  },
  {
    "id": "c2__tasaTEA",
    "label": "Calculadora de cuota de préstamo personal — Uruguay 2026: Tasa efectiva anual (TEA)",
    "type": "number",
    "value": 28,
    "suffix": "%",
    "min": 0,
    "max": 100,
    "step": 0.1,
    "thousands": false,
    "help": "TEA que informa la institución. BROU parte de ~28% en préstamos con convenio; es editable."
  },
  {
    "id": "c2__plazoMeses",
    "label": "Calculadora de cuota de préstamo personal — Uruguay 2026: Plazo (cantidad de cuotas)",
    "type": "number",
    "value": 24,
    "suffix": "meses",
    "min": 1,
    "step": 1,
    "thousands": false,
    "help": "Cantidad de cuotas mensuales."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Por qué los créditos hipotecarios en Uruguay están en UI?",
    "a": "Porque la **UI acompaña la inflación de forma suave** (sigue el IPC), sin los saltos bruscos del dólar. Así la cuota se actualiza sola con los precios internos y el banco no corre el riesgo cambiario. Es el estándar del BHU, la ANV y los bancos."
  },
  {
    "q": "¿La cuota de un crédito en UI cambia todos los meses?",
    "a": "La cuota **en UI es fija** (sistema francés). Lo que cambia es su equivalente **en pesos**: como la UI sube cada día por el IPC, la misma cuota en UI cuesta un poco más de pesos mes a mes. En un crédito a tasa fija en UI, la cuota en UI no se mueve."
  },
  {
    "q": "¿Cómo paso el monto en pesos a UI?",
    "a": "Dividís el monto en pesos por el valor de la UI. Por ejemplo, $U 4.000.000 ÷ 6,6253 = **603.746,25 UI**. Sobre ese monto en UI se calcula la cuota por el sistema francés."
  },
  {
    "q": "¿Cómo se pasa la TEA en UI a tasa mensual?",
    "a": "Con la equivalencia **i = (1 + TEA)^(1/12) − 1**, no dividiendo entre 12. Con una TEA en UI del 5,9%, la tasa mensual efectiva es **0,4789%**. Así queda bien reflejado el interés compuesto."
  },
  {
    "q": "¿Por qué la cuota en pesos sube con los años?",
    "a": "Porque la **UI se ajusta por la inflación (IPC)** y tu cuota está expresada en UI. Al 6% anual, una cuota de $U 28.075 hoy ronda $U 37.570 en 5 años y $U 50.278 en 10. En UI es siempre la misma; sube su valor en pesos."
  },
  {
    "q": "¿Es lo mismo la UI que la UR para un crédito de vivienda?",
    "a": "No. La **UI** se ajusta por el **IPC** (precios) y la **UR** por el **índice medio de salarios**. Algunos créditos del BHU están en UR y otros en UI: revisá tu contrato, porque los valores y la evolución son distintos."
  },
  {
    "q": "¿Qué tasa en UI conviene poner?",
    "a": "La que figura en tu oferta. En 2026 los créditos de vivienda en UI rondaban **4,9%–6,5%** de TEA según la institución, el plazo y el porcentaje financiado. El campo es editable para que compares escenarios."
  }
],
  sources: [
  {
    "name": "BROU — Préstamos para personas",
    "url": "https://www.brou.com.uy/personas/prestamos"
  },
  {
    "name": "DGI — Unidad Indexada (valor oficial)",
    "url": "https://www.gub.uy/direccion-general-impositiva/datos-y-estadisticas/datos/unidad-indexada"
  },
  {
    "name": "BROU — Préstamos con convenio en pesos",
    "url": "https://www.brou.com.uy/personas/prestamos/prestamo-consumo/prestamos-con-convenio-en-pesos"
  },
  {
    "name": "Tasas máximas de interés (usura) — Ley 18.212, BCU",
    "url": "https://datosuruguay.com/calculadora-tasa-interes-maxima"
  }
],
  replaces: [
    '/uy/calculadora-cuota-credito-hipotecario-ui-uruguay', // Absorbida como caso calculable con formulaId calculadora-cuota-credito-hipotecario-ui-uruguay.
    '/uy/calculadora-cuota-prestamo-uruguay', // Absorbida como caso calculable con formulaId calculadora-cuota-prestamo-uruguay.
  ],
  lastReviewed: '2026-07-28',
};
