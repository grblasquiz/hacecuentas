// IRPF 2026 España — retenciones de rendimientos del trabajo.
// Implementa el núcleo del algoritmo oficial AEAT publicado el 26-12-2025:
// https://sede.agenciatributaria.gob.es/static_files/Sede/Programas_ayuda/Retenciones/2026/ALGORITMO_2026.pdf
//
// Alcance: cálculo inicial (sin regularizaciones, anualidades, ascendientes,
// movilidad geográfica, Ceuta/Melilla ni préstamo vivienda pre-2013).

export interface Inputs {
  salario_bruto: number;
  edad: number;
  num_hijos: number;
  discapacidad: string;
  situacion_familiar: string;
  tipo_contrato?: string;
  numero_pagas?: number | string;
  comunidad_autonoma?: string; // compatibilidad con URLs guardadas antiguas
}

export interface Outputs {
  base_liquidable: number;
  cuota_irpf_total: number;
  tipo_efectivo: number;
  tipo_marginal: number;
  retencion_mensual: number;
  neto_anual: number;
  neto_mensual: number;
  ss_trabajador: number;
  _insight?: any;
  _chart?: any;
}

const BASE_MAXIMA_SS_ANUAL = 5_101.2 * 12;

function cotizacionTrabajador(bruto: number): number {
  const baseOrdinaria = Math.min(bruto, BASE_MAXIMA_SS_ANUAL);
  // Contingencias comunes 4,70% + desempleo 1,55% + formación 0,10% + MEI 0,15%.
  let cuota = baseOrdinaria * 0.065;
  const exceso = Math.max(0, bruto - BASE_MAXIMA_SS_ANUAL);
  // Cotización adicional de solidaridad 2026, parte a cargo del trabajador.
  cuota += Math.min(exceso, BASE_MAXIMA_SS_ANUAL * 0.1) * 0.0019;
  cuota += Math.min(Math.max(0, exceso - BASE_MAXIMA_SS_ANUAL * 0.1), BASE_MAXIMA_SS_ANUAL * 0.4) * 0.0021;
  cuota += Math.max(0, exceso - BASE_MAXIMA_SS_ANUAL * 0.5) * 0.0024;
  return cuota;
}

const ESCALA_RETENCION = [
  { hasta: 12_450, tipo: 0.19 },
  { hasta: 20_200, tipo: 0.24 },
  { hasta: 35_200, tipo: 0.30 },
  { hasta: 60_000, tipo: 0.37 },
  { hasta: 300_000, tipo: 0.45 },
  { hasta: Number.POSITIVE_INFINITY, tipo: 0.47 },
];

type Situacion = 'situacion1' | 'situacion2' | 'situacion3';

function situacionAEAT(raw: string, hijos: number): Situacion {
  if ((raw === 'monoparental' || raw === 'conjunta_monoparental') && hijos > 0) return 'situacion1';
  if (raw === 'conyuge_sin_rentas' || raw === 'conjunta_biparental') return 'situacion2';
  return 'situacion3';
}

function escala(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let anterior = 0;
  for (const tramo of ESCALA_RETENCION) {
    const parte = Math.max(0, Math.min(base, tramo.hasta) - anterior);
    cuota += parte * tramo.tipo;
    if (base <= tramo.hasta) break;
    anterior = tramo.hasta;
  }
  return cuota;
}

function reduccionTrabajo(rnt: number): number {
  if (rnt <= 0) return 0;
  if (rnt <= 14_852) return 7_302;
  if (rnt <= 17_673.52) return Math.max(0, 7_302 - 1.75 * (rnt - 14_852));
  if (rnt < 19_747.5) return Math.max(0, 2_364.34 - 1.14 * (rnt - 17_673.52));
  return 0;
}

function minimoPersonal(edad: number): number {
  return 5_550 + (edad >= 65 ? 1_150 : 0) + (edad >= 75 ? 1_400 : 0);
}

function minimoDescendientes(hijos: number): number {
  const cuantias = [2_400, 2_700, 4_000, 4_500];
  let total = 0;
  for (let i = 0; i < hijos; i++) total += cuantias[Math.min(i, 3)];
  return total;
}

function minimoDiscapacidad(grado: string): number {
  if (grado === '65') return 12_000; // 9.000 + 3.000 asistencia
  if (grado === '33') return 3_000;
  return 0;
}

function incrementoGastosDiscapacidad(grado: string): number {
  if (grado === '65') return 7_750;
  if (grado === '33') return 3_500;
  return 0;
}

function limiteExento(situacion: Situacion, hijos: number): number {
  const col = hijos <= 0 ? 0 : hijos === 1 ? 1 : 2;
  const tabla: Record<Situacion, number[]> = {
    situacion1: [0, 17_644, 18_694],
    situacion2: [17_197, 18_130, 19_262],
    situacion3: [15_876, 16_342, 16_867],
  };
  return tabla[situacion][col];
}

function truncar2(n: number): number {
  return Math.trunc((n + Number.EPSILON) * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  const bruto = Math.max(0, Number(i.salario_bruto) || 0);
  const edad = Math.max(16, Math.min(99, Number(i.edad) || 35));
  const hijos = Math.max(0, Math.min(10, Math.round(Number(i.num_hijos) || 0)));
  const discapacidad = String(i.discapacidad || '0');
  const situacion = situacionAEAT(String(i.situacion_familiar || 'otras'), hijos);
  const contrato = String(i.tipo_contrato || 'general');
  const pagas = Number(i.numero_pagas) === 14 ? 14 : 12;

  const ss = cotizacionTrabajador(bruto);
  const otrosGastos = Math.min(
    Math.max(0, bruto - ss),
    2_000 + incrementoGastosDiscapacidad(discapacidad),
  );
  const rnt = Math.max(0, bruto - ss);
  const red20 = reduccionTrabajo(rnt);
  const rntReducido = Math.max(0, rnt - otrosGastos - red20);
  const reduccionesAdicionales = hijos > 2 ? 600 : 0;
  const base = Math.max(0, rntReducido - reduccionesAdicionales);

  const minimo = minimoPersonal(edad) + minimoDescendientes(hijos) + minimoDiscapacidad(discapacidad);
  const exento = limiteExento(situacion, hijos);

  let cuota = bruto <= exento ? 0 : Math.max(0, escala(base) - escala(minimo));
  if (bruto <= 35_200 && bruto > exento) {
    cuota = Math.min(cuota, Math.max(0, (bruto - exento) * 0.43));
  }

  let tipo = bruto > 0 ? truncar2((cuota / bruto) * 100) : 0;
  if (contrato === 'inferior_anio' && tipo > 0 && tipo < 2) tipo = 2;
  if (contrato === 'especial' && tipo > 0 && tipo < 15) tipo = 15;

  const retencionAnual = Math.round((bruto * tipo)) / 100;
  const retencionPorPaga = retencionAnual / pagas;
  const netoAnual = Math.max(0, bruto - ss - retencionAnual);
  const netoPorPaga = netoAnual / pagas;

  const fmtEur = (n: number) => `${Math.round(n).toLocaleString('es-ES')} €`;
  const insight = {
    title: 'Tu retención estimada de nómina',
    text: bruto <= exento
      ? `Con **${fmtEur(bruto)} brutos** y tus datos familiares, el límite excluyente es **${fmtEur(exento)}**: la retención inicial estimada es **0%**.`
      : `Sobre **${fmtEur(bruto)} brutos**, el algoritmo AEAT 2026 estima un tipo de retención de **${tipo.toFixed(2)}%**: **${fmtEur(retencionAnual)} al año** o **${fmtEur(retencionPorPaga)} por paga** (${pagas} pagas).`,
    tone: 'neutral' as const,
    icon: '💶',
  };

  return {
    base_liquidable: Math.round(base * 100) / 100,
    cuota_irpf_total: Math.round(retencionAnual * 100) / 100,
    tipo_efectivo: tipo,
    tipo_marginal: exento,
    retencion_mensual: Math.round(retencionPorPaga * 100) / 100,
    neto_anual: Math.round(netoAnual * 100) / 100,
    neto_mensual: Math.round(netoPorPaga * 100) / 100,
    ss_trabajador: Math.round(ss * 100) / 100,
    _insight: insight,
    _chart: bruto > 0 ? {
      type: 'donut',
      segments: [
        { label: 'Neto', value: Math.round(netoAnual) },
        { label: 'Retención IRPF', value: Math.round(retencionAnual) },
        { label: 'Seguridad Social', value: Math.round(ss) },
      ],
      ariaLabel: `Neto ${fmtEur(netoAnual)}, retención ${fmtEur(retencionAnual)} y Seguridad Social ${fmtEur(ss)}.`,
    } : undefined,
  };
}
