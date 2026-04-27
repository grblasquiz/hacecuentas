export interface Inputs {
  categoria: string;
  diasTrabajados: number;
  viaticosNoche: number;
  horasExtrasNocturnas: number;
  horasExtrasDiurnas: number;
  antiguedad: number;
}

export interface Outputs {
  basicoMensual: number;
  adicionalAntiguedad: number;
  horasExtrasTotal: number;
  viaticosTotal: number;
  totalBruto: number;
  totalConViaticos: number;
  detalle: string;
}

// Básicos mensuales paritaria 2026 (FADEEAC / Federación Camioneros)
// Fuente: Acuerdo paritario enero 2026 — valores en ARS
const BASICOS_2026: Record<string, number> = {
  larga_a:    1_150_000, // Larga distancia Cat. A (> 150 km)
  larga_b:    1_050_000, // Larga distancia Cat. B (80-150 km)
  corta:        980_000, // Corta distancia / distribución urbana
  repartidor:   920_000, // Repartidor con ayudante
  peon:         820_000, // Peón / ayudante de camión
};

// Viático mínimo convencional por noche fuera del domicilio (no remunerativo)
// CCT 40/89 — referencia 2026
const VIATICO_POR_NOCHE = 14_000;

// Divisor horario mensual (LCT art. 197 + CCT)
const HORAS_MES = 200;

// Recargos horas extras
const RECARGO_EXTRA_DIURNA   = 1.50; // 50% sobre hora normal (LCT art. 201)
const RECARGO_EXTRA_NOCTURNA = 2.00; // 100% — CCT 40/89 jornada nocturna

// Antigüedad: 1% del básico proporcional por año (CCT)
const ANTIGUEDAD_PCT_POR_ANIO = 0.01;

export function compute(i: Inputs): Outputs {
  const categoria          = i.categoria || "larga_a";
  const dias               = Math.max(0, Math.min(31, Number(i.diasTrabajados)  || 0));
  const noches             = Math.max(0, Number(i.viaticosNoche)               || 0);
  const hsExtraNocturnas   = Math.max(0, Number(i.horasExtrasNocturnas)        || 0);
  const hsExtraDiurnas     = Math.max(0, Number(i.horasExtrasDiurnas)          || 0);
  const aniosAntiguedad    = Math.max(0, Number(i.antiguedad)                  || 0);

  const basicoMensual = BASICOS_2026[categoria] ?? BASICOS_2026["larga_a"];

  if (dias === 0) {
    return {
      basicoMensual,
      adicionalAntiguedad: 0,
      horasExtrasTotal: 0,
      viaticosTotal: 0,
      totalBruto: 0,
      totalConViaticos: 0,
      detalle: "Ingresá al menos 1 día trabajado para calcular el sueldo.",
    };
  }

  // Básico proporcional a los días trabajados
  const basicoProporcional = basicoMensual * (dias / 30);

  // Adicional antigüedad sobre el básico proporcional
  const adicionalAntiguedad = basicoProporcional * (aniosAntiguedad * ANTIGUEDAD_PCT_POR_ANIO);

  // Valor de la hora normal
  const valorHora = basicoMensual / HORAS_MES;

  // Horas extras
  const importeExtraDiurnas   = valorHora * RECARGO_EXTRA_DIURNA   * hsExtraDiurnas;
  const importeExtraNocturnas = valorHora * RECARGO_EXTRA_NOCTURNA * hsExtraNocturnas;
  const horasExtrasTotal      = importeExtraDiurnas + importeExtraNocturnas;

  // Viáticos no remunerativos
  const viaticosTotal = noches * VIATICO_POR_NOCHE;

  // Total bruto remunerativo (base para SAC, SIPA, descuentos)
  const totalBruto = basicoProporcional + adicionalAntiguedad + horasExtrasTotal;

  // Total incluyendo viáticos (lo que efectivamente percibe el trabajador)
  const totalConViaticos = totalBruto + viaticosTotal;

  // Detalle textual
  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  const lines: string[] = [
    `Básico mensual ${categoria.replace("_", " ").toUpperCase()}: ${fmt(basicoMensual)}`,
    `Básico proporcional (${dias}/30 días): ${fmt(basicoProporcional)}`,
  ];

  if (aniosAntiguedad > 0) {
    lines.push(`Antigüedad (${aniosAntiguedad} año/s × 1%): ${fmt(adicionalAntiguedad)}`);
  }
  if (hsExtraDiurnas > 0) {
    lines.push(`Horas extras diurnas (${hsExtraDiurnas} hs × 150%): ${fmt(importeExtraDiurnas)}`);
  }
  if (hsExtraNocturnas > 0) {
    lines.push(`Horas extras nocturnas (${hsExtraNocturnas} hs × 200%): ${fmt(importeExtraNocturnas)}`);
  }
  lines.push(`Total bruto remunerativo: ${fmt(totalBruto)}`);
  if (noches > 0) {
    lines.push(`Viáticos no remunerativos (${noches} noches × ${fmt(VIATICO_POR_NOCHE)}): ${fmt(viaticosTotal)}`);
  }
  lines.push(`TOTAL con viáticos: ${fmt(totalConViaticos)}`);
  lines.push("— Valores antes de descuentos (SIPA 11%, OS 3%, sindicato ~3%)");

  return {
    basicoMensual,
    adicionalAntiguedad,
    horasExtrasTotal,
    viaticosTotal,
    totalBruto,
    totalConViaticos,
    detalle: lines.join("\n"),
  };
}
