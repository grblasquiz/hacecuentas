export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function phConcentracionHPlus(i: Inputs): Outputs {
  const h = Number(i.h);
  if (!h || h <= 0) throw new Error('Ingresá [H+] > 0');
  const ph = -Math.log10(h);
  let clasif: string;
  if (ph < 3) clasif = 'Muy ácido'; else if (ph < 7) clasif = 'Ácido';
  else if (ph === 7 || Math.abs(ph - 7) < 0.1) clasif = 'Neutro';
  else if (ph < 11) clasif = 'Alcalino'; else clasif = 'Muy alcalino';
  return { ph: ph.toFixed(2), clasificacion: clasif, resumen: `pH ${ph.toFixed(2)} — ${clasif} (con [H⁺] = ${h} mol/L).` };
}
