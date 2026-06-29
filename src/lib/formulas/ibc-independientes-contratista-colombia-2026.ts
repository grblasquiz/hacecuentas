import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  ingreso_mensual: number;
}

export interface Outputs {
  ibc: number;
  ibc_en_smmlv: number;
  aplica_piso: string;
  aplica_tope: string;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Constantes — fuente única: src/lib/data/colombia-2026.ts
const PRESUNCION = COLOMBIA_2026.independientes.ibcPorcentajeIngresos; // 40% (Ley 2277/2022 art. 89)
const PISO_SMMLV = COLOMBIA_2026.aportes.ibcMinimoSmlmv;  // 1 SMMLV
const TECHO_SMMLV = COLOMBIA_2026.aportes.ibcTopeSmlmv;   // 25 SMMLV

// Helper puro: dado un ingreso, resuelve el IBC aplicando presunción 40% + piso/techo.
// Misma lógica para el resultado principal y para cada fila de la tabla.
function calcularIbc(ingresoMensual: number, smmlv: number) {
  const ingreso = Math.max(0, ingresoMensual || 0);
  const piso = PISO_SMMLV * smmlv;
  const techo = TECHO_SMMLV * smmlv;
  const base = ingreso * PRESUNCION;
  const ibc = Math.min(Math.max(base, piso), techo);
  const aplicaPiso = base < piso;
  const aplicaTope = base > techo;
  const ibcEnSmmlv = ibc / smmlv;
  return { ingreso, base, piso, techo, ibc, aplicaPiso, aplicaTope, ibcEnSmmlv };
}

export function compute(i: Inputs): Outputs {
  const SMMLV = COLOMBIA_2026.smlmv; // $1.750.905 (Decreto 1469/2025)
  const r = calcularIbc(i.ingreso_mensual || 0, SMMLV);

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

  let aplicaPisoTxt: string;
  if (r.ingreso <= 0) {
    aplicaPisoTxt = 'Ingresá tu ingreso mensual.';
  } else if (r.aplicaPiso) {
    aplicaPisoTxt = `Sí: el 40% de tu ingreso (${fmtCOP(r.base)}) es menor a 1 SMMLV (${fmtCOP(r.piso)}), por lo que cotizás sobre el piso de 1 SMMLV.`;
  } else {
    aplicaPisoTxt = `No: el 40% de tu ingreso (${fmtCOP(r.base)}) supera el piso de 1 SMMLV (${fmtCOP(r.piso)}).`;
  }

  let aplicaTopeTxt: string;
  if (r.ingreso <= 0) {
    aplicaTopeTxt = 'Ingresá tu ingreso mensual.';
  } else if (r.aplicaTope) {
    aplicaTopeTxt = `Sí: el 40% de tu ingreso (${fmtCOP(r.base)}) supera el tope de 25 SMMLV (${fmtCOP(r.techo)}), por lo que cotizás sobre el tope máximo.`;
  } else {
    aplicaTopeTxt = `No: el 40% de tu ingreso (${fmtCOP(r.base)}) está por debajo del tope de 25 SMMLV (${fmtCOP(r.techo)}).`;
  }

  const _insight = r.aplicaPiso
    ? {
        title: 'Cotizás sobre el piso (1 SMMLV)',
        text: `El 40% de tus ingresos (**${fmtCOP(r.base)}**) queda por debajo de 1 SMMLV. La ley te obliga a cotizar como mínimo sobre **${fmtCOP(r.ibc)}** (1 SMMLV), aunque ganes menos.`,
        tone: 'warn' as const,
        icon: '🧾',
      }
    : r.aplicaTope
    ? {
        title: 'Cotizás sobre el tope (25 SMMLV)',
        text: `El 40% de tus ingresos (**${fmtCOP(r.base)}**) supera el tope legal. Tu IBC se limita a **${fmtCOP(r.ibc)}** (25 SMMLV): cotizás sobre ese máximo aunque tu ingreso sea mayor.`,
        tone: 'warn' as const,
        icon: '🧾',
      }
    : {
        title: 'IBC = 40% de tu ingreso',
        text: `Tu base de cotización es el **40%** de tu ingreso mensualizado: **${fmtCOP(r.ibc)}** (${(Math.round(r.ibcEnSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV). Sobre este valor pagás salud (12,5%) y pensión (16%).`,
        tone: 'good' as const,
        icon: '🧾',
      };

  const _chart = {
    type: 'bar',
    title: 'De tu ingreso al IBC',
    bars: [
      { label: 'Ingreso mensual', value: Math.round(r.ingreso) },
      { label: 'Base 40%', value: Math.round(r.base) },
      { label: 'IBC (con piso/techo)', value: Math.round(r.ibc) },
    ],
    format: 'currency',
    ariaLabel: `Ingreso ${fmtCOP(r.ingreso)}, base 40% ${fmtCOP(r.base)}, IBC final ${fmtCOP(r.ibc)}`,
  };

  // Tabla computada: IBC y aportes estimados para distintos ingresos (mismo helper).
  const SALUD = COLOMBIA_2026.independientes.salud;   // 12,5%
  const PENSION = COLOMBIA_2026.independientes.pension; // 16%
  type Fila = { ingreso: number; tuCaso: boolean };
  const anclas = [2_000_000, 4_000_000, 8_000_000, 15_000_000, 30_000_000];
  const filas: Fila[] = anclas.map((v) => ({ ingreso: v, tuCaso: false }));
  if (r.ingreso > 0) filas.push({ ingreso: Math.round(r.ingreso), tuCaso: true });
  const porIngreso = new Map<number, Fila>();
  for (const f of filas.sort((a, b) => Number(a.tuCaso) - Number(b.tuCaso))) porIngreso.set(f.ingreso, f);
  const filasFinales = Array.from(porIngreso.values()).sort((a, b) => a.ingreso - b.ingreso).slice(0, 7);
  const tableRows = filasFinales.map((f) => {
    const c = calcularIbc(f.ingreso, SMMLV);
    return [
      `${fmtCOP(c.ingreso)}${f.tuCaso ? ' (tu caso)' : ''}`,
      fmtCOP(c.ibc),
      fmtCOP(c.ibc * SALUD),
      fmtCOP(c.ibc * PENSION),
      fmtCOP(c.ibc * (SALUD + PENSION)),
    ];
  });
  const _table = {
    title: `IBC y aportes mensuales estimados (SMMLV 2026 = ${fmtCOP(SMMLV)})`,
    headers: ['Ingreso mensual', 'IBC (40%)', 'Salud 12,5%', 'Pensión 16%', 'Total aportes'],
    align: ['left', 'right', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: 'IBC = 40% del ingreso mensualizado (Ley 2277/2022 art. 89), con piso de 1 SMMLV y tope de 25 SMMLV. Salud 12,5% y pensión 16% van 100% a cargo del independiente. No incluye ARL.',
  };

  return {
    ibc: Math.round(r.ibc),
    ibc_en_smmlv: Math.round(r.ibcEnSmmlv * 100) / 100,
    aplica_piso: aplicaPisoTxt,
    aplica_tope: aplicaTopeTxt,
    _insight,
    _chart,
    _table,
  };
}
