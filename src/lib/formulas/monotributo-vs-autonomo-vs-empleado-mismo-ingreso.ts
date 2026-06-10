// Calculadora: Monotributo vs Autónomo vs Empleado
// Valores 2026 — fuente única: monotributo-2026 (cuotas) + _ganancias-escala (4ª cat).
import { CUOTA_SERVICIOS } from '../data/monotributo-2026';
import {
  aplicarEscalaMensual,
  MNI_MENSUAL_BASE,
  INCREMENTO_HIJO_MENSUAL,
} from './_ganancias-escala';

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
  _chart?: any;
  _insight?: any;
}

// ─── MONOTRIBUTO: cuota mensual TOTAL por categoría (servicios, 2026)
// Fuente única: src/lib/data/monotributo-2026.ts (ARCA, vigente desde feb-2026).
const CUOTA_MONOTRIBUTO: Record<string, number> = CUOTA_SERVICIOS;

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

// ─── GANANCIAS 4ª Cat — fuente única src/lib/formulas/_ganancias-escala.ts
// MNI efectivo mensual (GNI + deducción especial apt.1) e incremento por hijo,
// más la escala progresiva del art. 94 LIG, todo del módulo compartido.
const MNI_MENSUAL_SIN_HIJOS = MNI_MENSUAL_BASE;
const DEDUCCION_HIJO_MENSUAL = INCREMENTO_HIJO_MENSUAL;

function calcularGanancias(baseImponible: number): number {
  return aplicarEscalaMensual(baseImponible).impuesto;
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

  // ─── GRÁFICO: descomposición del régimen recomendado (neto + carga = bruto)
  const cargaPorLabel: Record<string, number> = {
    "Monotributo": cargaMonotributo,
    "Autónomo": cargaAutonomo,
    "Empleado RD": cargaEmpleado,
  };
  const mejor = netos[0];
  const cargaMejor = cargaPorLabel[mejor.label] ?? 0;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto en mano', value: Math.round(Math.max(0, mejor.neto)) },
      { label: 'Cargas e impuestos', value: Math.round(Math.max(0, cargaMejor)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(ingresoBruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto (' + mejor.label + ')',
    ariaLabel: 'Composición del ingreso bruto en el régimen recomendado: neto en mano más cargas e impuestos',
  };

  const pctCargaMejor = ingresoBruto > 0 ? (cargaMejor / ingresoBruto * 100) : 0;
  const ventaja = netos[0].neto - netos[1].neto;
  const _insight = {
    title: 'El régimen que más te conviene',
    text: `Con un bruto de ${fmt(ingresoBruto)}, **${mejor.label}** es el que más te deja en mano: **${fmt(mejor.neto)}** netos (carga del ${pctCargaMejor.toFixed(1)}%). Te conviene **${fmt(ventaja)}** por mes frente a la opción que le sigue (${netos[1].label}).`,
    tone: 'good',
    icon: '🏆',
  };

  return {
    netoMonotributo: Math.round(netoMonotributo),
    cargaMonotributo: Math.round(cargaMonotributo),
    netoAutonomo: Math.round(netoAutonomo),
    cargaAutonomo: Math.round(cargaAutonomo),
    netoEmpleado: Math.round(netoEmpleado),
    cargaEmpleado: Math.round(cargaEmpleado),
    recomendacion,
    resumen,
    _chart: chart,
    _insight,
  };
}
