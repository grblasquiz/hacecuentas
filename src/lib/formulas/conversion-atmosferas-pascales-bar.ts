export interface Inputs {
  valor: number;
  unidad_origen: string;
}

export interface Outputs {
  resultado_pa: number;
  resultado_atm: number;
  resultado_bar: number;
  resultado_psi: number;
  resultado_mmhg: number;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valor) || 0;
  const unidad = String(i.unidad_origen || 'pa').toLowerCase();

  // Constantes de conversión (2026 - valores estándar internacionales BIPM/ISO)
  const PA_PER_ATM = 101325;
  const PA_PER_BAR = 100000;
  const PA_PER_PSI = 6894.757293;
  const PA_PER_MMHG = 133.322368;

  let pa = 0;

  // Convertir a pascales primero
  switch (unidad) {
    case 'pa':
      pa = valor;
      break;
    case 'atm':
      pa = valor * PA_PER_ATM;
      break;
    case 'bar':
      pa = valor * PA_PER_BAR;
      break;
    case 'psi':
      pa = valor * PA_PER_PSI;
      break;
    case 'mmhg':
      pa = valor * PA_PER_MMHG;
      break;
    default:
      pa = valor;
  }

  // Convertir desde pascales a todas las unidades
  const resultado_pa = Math.round(pa * 100) / 100;
  const resultado_atm = Math.round((pa / PA_PER_ATM) * 100000) / 100000;
  const resultado_bar = Math.round((pa / PA_PER_BAR) * 100000) / 100000;
  const resultado_psi = Math.round((pa / PA_PER_PSI) * 100000) / 100000;
  const resultado_mmhg = Math.round((pa / PA_PER_MMHG) * 100000) / 100000;

  // --- Caja de insight narrativa ---
  const nombreUnidad: Record<string, string> = {
    pa: 'Pa', atm: 'atm', bar: 'bar', psi: 'psi', mmhg: 'mmHg',
  };
  const fmt = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 5 });
  const vecesAtm = resultado_atm;
  let comparacion: string;
  if (vecesAtm === 0) {
    comparacion = 'Ingresá un valor de presión para ver su equivalencia.';
  } else if (vecesAtm >= 0.9 && vecesAtm <= 1.1) {
    comparacion = 'Es prácticamente la **presión atmosférica a nivel del mar**.';
  } else if (vecesAtm > 1.1) {
    comparacion = `Equivale a **${fmt(Math.round(vecesAtm * 100) / 100)}× la presión atmosférica** a nivel del mar.`;
  } else {
    comparacion = `Es solo el **${fmt(Math.round(vecesAtm * 1000) / 10)}%** de la presión atmosférica a nivel del mar.`;
  }
  const _insight = {
    title: 'Tu presión, en contexto',
    text: vecesAtm === 0
      ? comparacion
      : `**${fmt(valor)} ${nombreUnidad[unidad] || unidad}** equivalen a **${fmt(resultado_bar)} bar** (${fmt(resultado_psi)} psi). ${comparacion}`,
    tone: 'neutral',
    icon: '🌡️',
  };

  return {
    resultado_pa,
    resultado_atm,
    resultado_bar,
    resultado_psi,
    resultado_mmhg,
    _insight
  };
}
