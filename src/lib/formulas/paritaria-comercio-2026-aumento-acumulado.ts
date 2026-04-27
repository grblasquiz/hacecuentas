export interface Inputs {
  categoria: string;
  antiguedad: number;
  horasSemanales: string;
  incluirBono: string;
  bonoMonto: number;
}

export interface Outputs {
  basicoCategoria: number;
  adicionalAntiguedad: number;
  sueldoBruto: number;
  descuentosAportes: number;
  sueldoNeto: number;
  bonoNoRem: number;
  totalBolsillo: number;
  detalle: string;
}

// Escala salarial CCT 130/75 — básicos jornada completa 48 h
// Valores vigentes paritaria FAECYS 2026 (referencia abril 2026)
const BASICOS_2026: Record<string, number> = {
  A: 760000,   // Ayudante / Repositor
  B: 795000,   // Cajero / Empaquetador
  C: 830000,   // Vendedor / Administrativo C
  D: 875000,   // Vendedor Especializado / Administrativo B
  E: 930000,   // Jefe de Sección / Administrativo A
  F: 1010000,  // Subgerente / Encargado
  G: 1110000,  // Gerente / Apoderado
};

// Tasa de aportes del trabajador — CCT 130/75 / AFIP
// Jubilación 11% + OSECAC 3% + PAMI 3% = 17%
const TASA_APORTES = 0.17;

// Adicional antigüedad: 1% por año completo (CCT 130/75 art. de antigüedad)
const PORC_ANTIGUEDAD_POR_ANIO = 0.01;

// Jornada completa de referencia en horas semanales
const HORAS_FULL = 48;

export function compute(i: Inputs): Outputs {
  const categoria = (i.categoria || "C").toUpperCase();
  const antiguedad = Math.max(0, Math.floor(Number(i.antiguedad) || 0));
  const horasSemanales = Number(i.horasSemanales) || 48;
  const incluirBono = i.incluirBono === "si";
  const bonoMonto = incluirBono ? Math.max(0, Number(i.bonoMonto) || 0) : 0;

  // Básico de la categoría (jornada completa)
  const basicoFullTime = BASICOS_2026[categoria] ?? BASICOS_2026["C"];

  // Proporción jornada
  const proporcion = Math.min(horasSemanales, HORAS_FULL) / HORAS_FULL;

  // Básico proporcional a la jornada
  const basicoCategoria = basicoFullTime * proporcion;

  // Adicional antigüedad = 1% del básico proporcional × años
  const adicionalAntiguedad = basicoCategoria * PORC_ANTIGUEDAD_POR_ANIO * antiguedad;

  // Sueldo bruto remunerativo
  const sueldoBruto = basicoCategoria + adicionalAntiguedad;

  // Descuentos aportes sobre bruto remunerativo
  const descuentosAportes = sueldoBruto * TASA_APORTES;

  // Sueldo neto (sin bono)
  const sueldoNeto = sueldoBruto - descuentosAportes;

  // Bono no remunerativo (no tiene aportes)
  const bonoNoRem = bonoMonto;

  // Total al bolsillo
  const totalBolsillo = sueldoNeto + bonoNoRem;

  // Detalle textual
  const horasLabel = horasSemanales === HORAS_FULL
    ? "48 h (jornada completa)"
    : `${horasSemanales} h (${((proporcion) * 100).toFixed(0)}% de jornada)`;

  const detalle =
    `Categoría ${categoria} | ${horasLabel} | ${antiguedad} año(s) antigüedad. ` +
    `Básico: $${basicoCategoria.toFixed(0)} + Antigüedad: $${adicionalAntiguedad.toFixed(0)} = ` +
    `Bruto $${sueldoBruto.toFixed(0)}. Aportes 17%: $${descuentosAportes.toFixed(0)}. ` +
    (incluirBono ? `Bono no rem.: $${bonoNoRem.toFixed(0)}.` : "Sin bono no remunerativo.");

  return {
    basicoCategoria,
    adicionalAntiguedad,
    sueldoBruto,
    descuentosAportes,
    sueldoNeto,
    bonoNoRem,
    totalBolsillo,
    detalle,
  };
}
