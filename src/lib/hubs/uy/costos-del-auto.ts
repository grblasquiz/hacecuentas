import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'uy/finanzas/costos-del-auto',
  title: "¿Cuánto cuesta tener y usar el auto? | Hacé Cuentas",
  description: "Hub de decisión con 2 cálculos: Calculadora de Costo de Viaje en Auto — Nafta y Peajes (Uruguay 2026); Calculadora de Patente de Rodados — Uruguay 2026 (SUCIVE).",
  silo: "Costos del auto",
  siloHref: '/uy/finanzas',
  locale: 'uy',
  eyebrow: "Uruguay · Costos del auto",
  h1: "¿Cuánto cuesta tener y usar el auto?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de Costo de Viaje en Auto — Nafta y Peajes (Uruguay 2026)",
    "hint": "Un viaje de 300 km solo ida, a 7 L/100 km con Súper 95 a $U 88,67/L, gasta 21 litros ($U 1.862,07). Con 2 peajes por Telepeaje ($U 167 c/u) suma $U 334: total $U 2.196,07.",
    "yes": [
      "Costo de viaje = **combustible + peajes**. Combustible = km × (rendimiento/100) × precio del litro (**Súper 95 $U 88,67** o **Gasoil 50S $U 58,68**). Peajes = pasadas × (**$U 167 Telepeaje** o **$U 196,57 efectivo**). Ida y vuelta duplica km y peajes. Ejemplo: 300 km + 2 peajes ≈ **$U 2.196,07**."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "Un viaje de 300 km solo ida, a 7 L/100 km con Súper 95 a $U 88,67/L, gasta 21 litros ($U 1.862,07). Con 2 peajes por Telepeaje ($U 167 c/u) suma $U 334: total $U 2.196,07."
  },
  {
    "id": "c2",
    "label": "Calculadora de Patente de Rodados — Uruguay 2026 (SUCIVE)",
    "hint": "La patente de rodados en Uruguay se calcula como el AFORO del vehículo (el valor fiscal que fija el SUCIVE, no el precio de mercado) por la alícuota de su categoría: 5% para autos 0 km, 4,5% para autos usados, 3% y 2,25% para eléctricos (0 km y usados), 5%/4,5% para motos de 500cc o más y 1,3% para camiones. Por ejemplo, un auto usado con un aforo de $U 600.000 paga unos $U 27.000 de patente anual (600.000 × 4,5%), que se puede abonar en hasta 10 cuotas de $U 2.700 o contado con descuento. El aforo lo publica cada Intendencia a través del SUCIVE.",
    "yes": [
      "Patente = **aforo × alícuota**. Auto 0 km **5%**, usado **4,5%**, eléctrico **3%/2,25%**, moto ≥500cc **5%/4,5%**, camión **1,3%**. El **aforo** lo fija el SUCIVE (no es el precio de compra). Se paga en hasta 10 cuotas o **contado con descuento** (~10%, varía por departamento)."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-16.",
    "answer": "La patente de rodados en Uruguay se calcula como el AFORO del vehículo (el valor fiscal que fija el SUCIVE, no el precio de mercado) por la alícuota de su categoría: 5% para autos 0 km, 4,5% para autos usados, 3% y 2,25% para eléctricos (0 km y usados), 5%/4,5% para motos de 500cc o más y 1,3% para camiones. Por ejemplo, un auto usado con un aforo de $U 600.000 paga unos $U 27.000 de patente anual (600.000 × 4,5%), que se puede abonar en hasta 10 cuotas de $U 2.700 o contado con descuento. El aforo lo publica cada Intendencia a través del SUCIVE."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__distanciaKm",
    "label": "Calculadora de Costo de Viaje en Auto — Nafta y Peajes (Uruguay 2026): Distancia (km, solo ida)",
    "type": "number",
    "value": 300,
    "min": 0,
    "step": 10,
    "thousands": false,
    "help": "Kilómetros de un tramo (solo ida). Si es ida y vuelta, activá la opción de abajo."
  },
  {
    "id": "c1__idaYVuelta",
    "label": "Calculadora de Costo de Viaje en Auto — Nafta y Peajes (Uruguay 2026): ¿Ida y vuelta?",
    "type": "select",
    "value": "no",
    "options": [
      {
        "value": "no",
        "label": "No (solo ida)"
      },
      {
        "value": "si",
        "label": "Sí (duplica distancia y peajes)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__rendimiento",
    "label": "Calculadora de Costo de Viaje en Auto — Nafta y Peajes (Uruguay 2026): Rendimiento (L cada 100 km)",
    "type": "number",
    "value": 7,
    "min": 1,
    "step": 0.5,
    "thousands": false,
    "help": "Consumo de tu auto. Un auto naftero promedio ronda 7 L/100 km en ruta."
  },
  {
    "id": "c1__tipoCombustible",
    "label": "Calculadora de Costo de Viaje en Auto — Nafta y Peajes (Uruguay 2026): Combustible",
    "type": "select",
    "value": "super95",
    "options": [
      {
        "value": "super95",
        "label": "Nafta Súper 95 ($U 88,67/L)"
      },
      {
        "value": "gasoil50s",
        "label": "Gasoil 50S ($U 58,68/L)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__cantidadPeajes",
    "label": "Calculadora de Costo de Viaje en Auto — Nafta y Peajes (Uruguay 2026): Cantidad de peajes (solo ida)",
    "type": "number",
    "value": 0,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Peajes que cruzás en un tramo. Ida y vuelta los duplica automáticamente."
  },
  {
    "id": "c1__telepeaje",
    "label": "Calculadora de Costo de Viaje en Auto — Nafta y Peajes (Uruguay 2026): ¿Pagás con Telepeaje?",
    "type": "select",
    "value": "si",
    "options": [
      {
        "value": "si",
        "label": "Sí — Telepeaje ($U 167 por pasada)"
      },
      {
        "value": "no",
        "label": "No — efectivo/SUCIVE ($U 196,57 por pasada)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__aforo",
    "label": "Calculadora de Patente de Rodados — Uruguay 2026 (SUCIVE): Aforo del vehículo ($U)",
    "type": "number",
    "value": 600000,
    "min": 0,
    "step": 1000,
    "thousands": false,
    "help": "Valor fiscal que fija el SUCIVE por marca/modelo/año (no es el precio de compra)."
  },
  {
    "id": "c2__categoria",
    "label": "Calculadora de Patente de Rodados — Uruguay 2026 (SUCIVE): Categoría del vehículo",
    "type": "select",
    "value": "auto-usado",
    "options": [
      {
        "value": "auto-usado",
        "label": "Automóvil usado (4,5%)"
      },
      {
        "value": "auto-0km",
        "label": "Automóvil 0 km (5%)"
      },
      {
        "value": "auto-electrico-0km",
        "label": "Auto eléctrico 0 km (3%)"
      },
      {
        "value": "auto-electrico-usado",
        "label": "Auto eléctrico usado (2,25%)"
      },
      {
        "value": "moto",
        "label": "Moto 500cc o más (5%)"
      },
      {
        "value": "camion",
        "label": "Camión (1,3%)"
      }
    ],
    "thousands": false
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cómo se calcula cuánto gasto de nafta en un viaje?",
    "a": "Multiplicás la distancia por el rendimiento del auto y dividís entre 100 para obtener los litros; después multiplicás por el precio del litro. Por ejemplo, 300 km a 7 L/100 km = 21 litros; a $U 88,67 son **$U 1.862,07** de Súper 95."
  },
  {
    "q": "¿Cuánto cuesta la nafta Súper 95 en Uruguay en 2026?",
    "a": "La **Nafta Súper 95** ronda los **$U 88,67 por litro** (ANCAP/URSEA, julio 2026). El **Gasoil 50S** está en unos **$U 58,68 por litro**. Los precios se ajustan periódicamente por decreto."
  },
  {
    "q": "¿Cuánto sale un peaje en Uruguay?",
    "a": "Para un auto (categoría 1), la pasada cuesta **$U 196,57 en efectivo/SUCIVE** y **$U 167 con Telepeaje** (CVU/MTOP, tarifas desde junio 2026). Los peajes se actualizan cada seis meses."
  },
  {
    "q": "¿Cuánto ahorro usando Telepeaje?",
    "a": "**$U 29,57 por cada pasada** ($U 196,57 en efectivo vs. $U 167 con Telepeaje). En un viaje con 2 peajes ida y vuelta (4 pasadas) el ahorro es de unos **$U 118,28**."
  },
  {
    "q": "¿Cuánto sale ir en auto de Montevideo a Punta del Este?",
    "a": "Son unos 130 km por la Interbalnearia. A 7 L/100 km con Súper 95 gastás cerca de **$U 806** de nafta solo ida, más los peajes que cruces (cada pasada $U 167 con Telepeaje). Ingresá los km y peajes exactos de tu ruta para el total."
  },
  {
    "q": "¿Conviene la nafta o el gasoil para viajar?",
    "a": "Por litro, el **Gasoil 50S ($U 58,68)** es más barato que la **Súper 95 ($U 88,67)**, así que en un mismo trayecto el costo de combustible baja bastante con diésel. Elegí en la calculadora el combustible de tu auto para ver la diferencia."
  },
  {
    "q": "¿Cómo calculo un viaje de ida y vuelta?",
    "a": "Activá la opción **'¿Ida y vuelta?'**: la calculadora duplica automáticamente la distancia y la cantidad de peajes, porque recorrés el tramo dos veces y volvés a pasar por cada cabina."
  }
],
  sources: [
  {
    "name": "ANCAP — Precios de combustibles",
    "url": "https://www.ancap.com.uy/2093/1/precios-combustibles.html"
  },
  {
    "name": "MTOP — Tarifas de peajes",
    "url": "https://www.gub.uy/ministerio-transporte-obras-publicas/politicas-y-gestion/tarifas"
  },
  {
    "name": "SUCIVE — Sistema Único de Cobro de Ingresos Vehiculares",
    "url": "https://www.sucive.gub.uy/"
  },
  {
    "name": "Congreso de Intendentes — Texto Ordenado del SUCIVE 2026",
    "url": "https://www.gub.uy/congreso-intendentes/comunicacion/publicaciones/texto-ordenado-del-sucive-2026"
  }
],
  replaces: [
    '/uy/calculadora-costo-viaje-nafta-uruguay', // Absorbida como caso calculable con formulaId calculadora-costo-viaje-nafta-uruguay.
    '/uy/calculadora-patente-rodados-uruguay', // Absorbida como caso calculable con formulaId patente-rodados-uruguay.
  ],
  lastReviewed: '2026-07-28',
};
