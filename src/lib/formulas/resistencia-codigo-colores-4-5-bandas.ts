const DIG: Record<string, number> = { negro: 0, marron: 1, rojo: 2, naranja: 3, amarillo: 4, verde: 5, azul: 6, violeta: 7, gris: 8, blanco: 9 };
const MULT: Record<string, number> = { negro: 1, marron: 10, rojo: 100, naranja: 1e3, amarillo: 1e4, verde: 1e5, azul: 1e6, violeta: 1e7, dorado: 0.1, plateado: 0.01 };
const TOL: Record<string, number> = { marron: 1, rojo: 2, verde: 0.5, azul: 0.25, violeta: 0.1, dorado: 5, plateado: 10 };

export interface ResistenciaCodigoColoresInputs { tipo: string; banda1: string; banda2: string; banda3: string; banda4: string; banda5?: string; }
export interface ResistenciaCodigoColoresOutputs { valor: string; tolerancia: string; minimo: string; maximo: string; resumen: string; }

function fmt(ohms: number): string {
  if (ohms >= 1e6) return (ohms / 1e6).toFixed(2) + ' MΩ';
  if (ohms >= 1e3) return (ohms / 1e3).toFixed(2) + ' kΩ';
  return ohms.toFixed(2) + ' Ω';
}

export function resistenciaCodigoColores45Bandas(i: ResistenciaCodigoColoresInputs): ResistenciaCodigoColoresOutputs {
  const t = String(i.tipo);
  let v: number, tol: number;
  if (t === '5') {
    v = ((DIG[i.banda1] ?? 0) * 100 + (DIG[i.banda2] ?? 0) * 10 + (DIG[i.banda3] ?? 0)) * (MULT[i.banda4] ?? 1);
    tol = TOL[i.banda5 ?? 'marron'] ?? 1;
  } else {
    v = ((DIG[i.banda1] ?? 0) * 10 + (DIG[i.banda2] ?? 0)) * (MULT[i.banda3] ?? 1);
    tol = TOL[i.banda4] ?? 20;
  }
  const mn = v * (1 - tol / 100);
  const mx = v * (1 + tol / 100);
  return {
    valor: fmt(v),
    tolerancia: `±${tol}%`,
    minimo: fmt(mn),
    maximo: fmt(mx),
    resumen: `Resistencia ${fmt(v)} con tolerancia ±${tol}%. Rango real: ${fmt(mn)} a ${fmt(mx)}.`
  };
}
