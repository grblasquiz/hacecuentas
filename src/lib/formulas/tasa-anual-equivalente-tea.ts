/** TNA → TEA: convertir tasa nominal anual en efectiva anual según capitalización */
export interface Inputs {
  tna: number; // %
  capitalizacion: 'mensual' | 'trimestral' | 'semestral' | 'diaria' | 'continua';
}
export interface Outputs {
  tea: number;
  tasaPeriodo: number;
  capitalizacionesAnio: number;
  diferencia: number;
  resumen: string;
}

export function tasaAnualEquivalenteTea(i: Inputs): Outputs {
  const tna = Number(i.tna);
  const cap = i.capitalizacion || 'mensual';

  if (!tna || tna <= 0) throw new Error('Ingresá la TNA');
  if (tna > 500) throw new Error('La TNA parece demasiado alta, revisá el valor');

  const freq: Record<string, number> = {
    mensual: 12,
    trimestral: 4,
    semestral: 2,
    diaria: 365,
    continua: Infinity,
  };
  const m = freq[cap];
  if (!m) throw new Error('Capitalización no válida');

  const tnaDec = tna / 100;
  let tea: number;
  if (m === Infinity) {
    tea = (Math.exp(tnaDec) - 1) * 100;
  } else {
    tea = (Math.pow(1 + tnaDec / m, m) - 1) * 100;
  }
  const tasaPeriodo = m === Infinity ? 0 : (tnaDec / m) * 100;
  const diferencia = tea - tna;

  const resumen = `Una TNA de ${tna}% con capitalización ${cap} equivale a una TEA de ${tea.toFixed(2)}% (${diferencia.toFixed(2)}% extra por el efecto compuesto).`;

  return {
    tea: Number(tea.toFixed(4)),
    tasaPeriodo: Number(tasaPeriodo.toFixed(4)),
    capitalizacionesAnio: m === Infinity ? 0 : m,
    diferencia: Number(diferencia.toFixed(4)),
    resumen,
  };
}
