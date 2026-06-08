/** Anticipo del impuesto a la renta (Ecuador) — fórmula sobre activos, ingresos, patrimonio y costos/gastos.
 *  Anticipo = 0,4% activos + 0,4% ingresos + 0,2% patrimonio + 0,2% costos/gastos deducibles.
 *  Aplica a sociedades y personas naturales obligadas a llevar contabilidad. Orientativo: verificar con el SRI. */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  ingresos: number;
  costosGastos: number;
  activos: number;
  patrimonio: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingresos = Math.max(0, Number(i.ingresos) || 0);
  const costosGastos = Math.max(0, Number(i.costosGastos) || 0);
  const activos = Math.max(0, Number(i.activos) || 0);
  const patrimonio = Math.max(0, Number(i.patrimonio) || 0);
  if (ingresos <= 0 && activos <= 0 && patrimonio <= 0 && costosGastos <= 0) {
    throw new Error('Ingresá al menos uno de los rubros (ingresos, activos, patrimonio o costos)');
  }

  const compActivos = activos * 0.004;       // 0,4% del total de activos
  const compIngresos = ingresos * 0.004;     // 0,4% del total de ingresos gravables
  const compPatrimonio = patrimonio * 0.002; // 0,2% del patrimonio total
  const compCostos = costosGastos * 0.002;   // 0,2% de costos y gastos deducibles
  const anticipo = compActivos + compIngresos + compPatrimonio + compCostos;

  const _insight = {
    title: 'Tu anticipo de impuesto a la renta',
    text: `Según la fórmula del SRI, tu anticipo de IR estimado es de **${fmtUSDec(anticipo)}**: 0,4% de activos (${fmtUSDec(compActivos)}) + 0,4% de ingresos (${fmtUSDec(compIngresos)}) + 0,2% de patrimonio (${fmtUSDec(compPatrimonio)}) + 0,2% de costos y gastos (${fmtUSDec(compCostos)}). Aplica a sociedades y personas naturales obligadas a llevar contabilidad. Verificá tu caso con el SRI.`,
    tone: 'neutral',
    icon: '🧾',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Activos (0,4%)', value: Math.round(compActivos * 100) / 100 },
      { label: 'Ingresos (0,4%)', value: Math.round(compIngresos * 100) / 100 },
      { label: 'Patrimonio (0,2%)', value: Math.round(compPatrimonio * 100) / 100 },
      { label: 'Costos/Gastos (0,2%)', value: Math.round(compCostos * 100) / 100 },
    ],
    ariaLabel: `Anticipo de impuesto a la renta ${fmtUSDec(anticipo)}.`,
  };

  return {
    anticipo: fmtUSDec(anticipo),
    compActivos: fmtUSDec(compActivos),
    compIngresos: fmtUSDec(compIngresos),
    compPatrimonio: fmtUSDec(compPatrimonio),
    compCostos: fmtUSDec(compCostos),
    detalle: `0,4% activos (${fmtUSDec(compActivos)}) + 0,4% ingresos (${fmtUSDec(compIngresos)}) + 0,2% patrimonio (${fmtUSDec(compPatrimonio)}) + 0,2% costos/gastos (${fmtUSDec(compCostos)}).`,
    _insight,
    _chart,
  };
}
