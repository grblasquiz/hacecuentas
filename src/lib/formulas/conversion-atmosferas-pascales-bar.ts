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

  return {
    resultado_pa,
    resultado_atm,
    resultado_bar,
    resultado_psi,
    resultado_mmhg
  };
}
