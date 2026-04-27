// Calculadora: Monotributo vs Autónomo vs Empleado
// Valores 2026 — actualizar trimestralmente según ARCA/ANSES

export interface Inputs {
  ingresoBruto: number;
  categoriaMonotributo: string; // A..K
  categoriaAutonomo: string;    // I..V
  tieneHijos: string;           // "si" | "no"
}

export interface Outputs {
  netoMonotributo: number;
  cargaMonotributo: number;
  netoAutonomo: number;
  cargaAutonomo: number;
  netoEmpleado: number;
  cargaEmpleado: number;
  recomendacion: string;
  resumen: string;
}

// ─── MONOTRIBUTO: cuotas fijas mensuales por categoría (servicios, 2026)
// Fuente: ARCA – actualizadas trimestralmente por RIPTE/IPC
const CUOTA_MONOTRIBUTO: Record<string, number> = {
  A: 5200,
  B: 6100,
  C: 7400,
  D: 9100,
  E: 11200,
  F: 14000,
  G: 17800,
  H: 24500,
  I: 30400,
  J: 37200,
  K: 44600,
};

// ─── AUTÓNOMO: base imponible mensual por categoría SIPA 2026
// Fuente: ANSES – Resolución ANSES vigente 2026
const BASE_AUTONOMO: Record<string, number> = {
  I:   108000,
  II:  162000,
  III: 216000,
  IV:  270000,
  V:   324000,
};

// Tasas aporte autónomo
const TASA_SIPA_AUTONOMO = 0.27;  // Jubilación
const TASA_OS_AUTONOMO   = 0.10;  // Obra Social
const TASA_IVA           = 0.21;  // IVA débito

// ─── EMPLEADO en Relación de Dependencia – tasas 2026
// Fuente: Ley 24.241, Ley 23.660, RG ARCA
const TASA_SIPA_EMPLEADO      = 0.11;
const TASA_OS_EMPLEADO        = 0.03;
const TASA_INSSJP_EMPLEADO    = 0.03;
const TASA_SINDICAL_EMPLEADO  = 0.02; // estimada
const TASA_APORTES_EMPLEADO   = TASA_SIPA_EMPLEADO + TASA_OS_EMPLEADO + TASA_INSSJP_EMPLEADO + TASA_SINDICAL_EMPLEADO; // 0.19

// ─── GANANCIAS 4ª Cat – MNI mensual 2026
// MNI anual: $3.091.035 (sin hijos) según RG ARCA 2026
const MNI_MENSUAL_SIN_HIJOS = 3091035 / 12;       // ~$257.586
const DEDUCCION_HIJO_ANUAL  = 968832;              // por hijo menor de 18
const DEDUCCION_HIJO_MENSUAL = DEDUCCION_HIJO_ANUAL / 12; // ~$80.736

// Escala progresiva Ganancias 4ª Cat 2026 (sobre excedente del MNI, valores mensuales)
// Fuente: ARCA – art. 94 LIG actualizado
const ESCALA_GANANCIAS = [
  { hasta: 173666,  tasa: 0.05, fijo: 0 },
  { hasta: 347332,  tasa: 0.09, fijo: 8683 },
  { hasta: 520998,  tasa: 0.12, fijo: 24313 },
  { hasta: 694664,  tasa: 0.15, fijo: 45153 },
  { hasta: 1041996, tasa: 0.19, fijo: 71211 },
  { hasta: 1389328, tasa: 0.23, fijo: 137212 },
  { hasta: 2083992, tasa: 0.27, fijo: 217154 },
  { hasta: 3126188, tasa: 0.31, fijo: 404892 },
  { hasta: Infinity, tasa: 0.35, fijo: 728003 },
];

function calcularGanancias(baseImponible: number): number {
  if (baseImponible <= 0) return 0;
  let impuesto = 0;
  let excedente = baseImponible;
  let limiteAnterior = 0;
  for (const tramo of ESCALA_GANANCIAS) {
    if (excedente <= 0) break;
    const tramoMax = tramo.hasta - limiteAnterior;
    const enEsteTramo = Math.min(excedente, tramoMax);
    impuesto += enEsteTramo * tramo.tasa;
    excedente -= enEsteTramo;
    limiteAnterior = tramo.hasta;
  }
  return impuesto;
}

export function compute(i: Inputs): Outputs {
  const ingresoBruto = Math.max(0, Number(i.ingresoBruto) || 0);
  if (ingresoBruto <= 0) {
    return {
      netoMonotributo: 0,
      cargaMonotributo: 0,
      netoAutonomo: 0,
      cargaAutonomo: 0,
      netoEmpleado: 0,
      cargaEmpleado: 0,
      recomendacion: "Ingresá un ingreso bruto válido",
      resumen: "Sin datos suficientes para comparar.",
    };
  }

  const tieneHijos = i.tieneHijos === "si";

  // ─── MONOTRIBUTO ───────────────────────────────────────────────
  const cat = (i.categoriaMonotributo || "D").toUpperCase();
  const cuotaMonotributo = CUOTA_MONOTRIBUTO[cat] ?? CUOTA_MONOTRIBUTO["D"];
  const cargaMonotributo = cuotaMonotributo;
  const netoMonotributo = ingresoBruto - cargaMonotributo;

  // ─── AUTÓNOMO ──────────────────────────────────────────────────
  const catAut = (i.categoriaAutonomo || "IV").toUpperCase();
  const baseAut = BASE_AUTONOMO[catAut] ?? BASE_AUTONOMO["IV"];

  const aporteSIPAAut = baseAut * TASA_SIPA_AUTONOMO;
  const aporteOSAut   = baseAut * TASA_OS_AUTONOMO;

  // IVA neto: el ingreso bruto se asume facturado CON IVA incluido
  // El autónomo retiene y devuelve al fisco: IVA débito = (bruto / 1.21) * 0.21
  // Simplificación: no se computa crédito fiscal de gastos (conservador)
  const ivaDebito = (ingresoBruto / (1 + TASA_IVA)) * TASA_IVA;

  // Base Ganancias autónomo (cat III): ingreso neto de IVA menos aportes menos MNI
  const ingresoSinIVA = ingresoBruto - ivaDebito;
  const deduccionesAut = aporteSIPAAut + aporteOSAut + MNI_MENSUAL_SIN_HIJOS +
    (tieneHijos ? DEDUCCION_HIJO_MENSUAL : 0);
  const baseGananciasAut = Math.max(0, ingresoSinIVA - deduccionesAut);
  const gananciasAut = calcularGanancias(baseGananciasAut);

  const cargaAutonomo = aporteSIPAAut + aporteOSAut + ivaDebito + gananciasAut;
  const netoAutonomo  = ingresoBruto - cargaAutonomo;

  // ─── EMPLEADO EN RELACIÓN DE DEPENDENCIA ──────────────────────
  const aportesEmpleado = ingresoBruto * TASA_APORTES_EMPLEADO;

  // Base Ganancias 4ª cat: bruto menos aportes menos MNI
  const mniMensual = MNI_MENSUAL_SIN_HIJOS + (tieneHijos ? DEDUCCION_HIJO_MENSUAL : 0);
  const baseGananciasEmp = Math.max(0, ingresoBruto - aportesEmpleado - mniMensual);
  const gananciasEmp = calcularGanancias(baseGananciasEmp);

  const cargaEmpleado = aportesEmpleado + gananciasEmp;
  const netoEmpleado  = ingresoBruto - cargaEmpleado;

  // ─── RECOMENDACIÓN ─────────────────────────────────────────────
  const netos = [
    { label: "Monotributo", neto: netoMonotributo },
    { label: "Autónomo",    neto: netoAutonomo },
    { label: "Empleado RD", neto: netoEmpleado },
  ];
  netos.sort((a, b) => b.neto - a.neto);

  const fmt = (n: number) =>
    "$" + Math.round(n).toLocaleString("es-AR");

  const recomendacion =
    `${netos[0].label} (neto ${fmt(netos[0].neto)}) — mayor ingreso en mano`;

  const pctCargaMono = ingresoBruto > 0 ? (cargaMonotributo / ingresoBruto * 100).toFixed(1) : "0";
  const pctCargaAut  = ingresoBruto > 0 ? (cargaAutonomo  / ingresoBruto * 100).toFixed(1) : "0";
  const pctCargaEmp  = ingresoBruto > 0 ? (cargaEmpleado  / ingresoBruto * 100).toFixed(1) : "0";

  const resumen =
    `Cargas sobre bruto: Monotributo ${pctCargaMono}% · Autónomo ${pctCargaAut}% · Empleado ${pctCargaEmp}%. ` +
    `Diferencia máxima entre regímenes: ${fmt(netos[0].neto - netos[2].neto)}. ` +
    `Nota: el empleado percibe además SAC y beneficios laborales no incluidos en este cálculo.`;

  return {
    netoMonotributo: Math.round(netoMonotributo),
    cargaMonotributo: Math.round(cargaMonotributo),
    netoAutonomo: Math.round(netoAutonomo),
    cargaAutonomo: Math.round(cargaAutonomo),
    netoEmpleado: Math.round(netoEmpleado),
    cargaEmpleado: Math.round(cargaEmpleado),
    recomendacion,
    resumen,
  };
}
