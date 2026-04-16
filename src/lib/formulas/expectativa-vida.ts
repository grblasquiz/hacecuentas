export interface Inputs { edad: number; genero?: string; actividad?: string; fuma?: string; imc?: string; }
export interface Outputs { esperanzaVida: number; anosRestantes: number; mensaje: string; }
export function expectativaVida(i: Inputs): Outputs {
  const edad = Number(i.edad);
  if (!edad || edad < 1) throw new Error('Ingresá tu edad');
  const genero = String(i.genero || 'm');
  const act = String(i.actividad || 'moderada');
  const fuma = String(i.fuma || 'no');
  const imc = String(i.imc || 'normal');
  let base = genero === 'f' ? 80 : 74;
  // Actividad
  if (act === 'activo') base += 4;
  else if (act === 'moderada') base += 2;
  else base -= 3;
  // Tabaco
  if (fuma === 'si') base -= 8;
  else if (fuma === 'ex') base -= 2;
  // IMC
  if (imc === 'normal') base += 1;
  else if (imc === 'sobrepeso') base -= 1;
  else if (imc === 'obesidad') base -= 4;
  else if (imc === 'bajo') base -= 2;
  const restantes = Math.max(0, Math.round(base - edad));
  const tips: string[] = [];
  if (fuma === 'si') tips.push('Dejar de fumar podría sumar hasta 8 años.');
  if (act === 'sedentario') tips.push('Sumar actividad física moderada sumaría ~3-5 años.');
  if (imc === 'obesidad') tips.push('Bajar a peso normal sumaría ~3-4 años.');
  const msg = `Esperanza de vida estimada: ${base} años. Te quedan ~${restantes} años. ` + (tips.length ? tips.join(' ') : 'Buen estilo de vida — seguí así.');
  return { esperanzaVida: base, anosRestantes: restantes, mensaje: msg };
}
