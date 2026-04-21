/** Biorritmo físico, emocional e intelectual */
export interface Inputs { fechaNacimiento: string; }
export interface Outputs { fisico: number; emocional: number; intelectual: number; mensaje: string; }

export function biorhythm(i: Inputs): Outputs {
  const parts = String(i.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha válida');
  if (nac > hoy) throw new Error('La fecha debe ser anterior a hoy');

  const dias = Math.floor((hoy.getTime() - nac.getTime()) / 86400000);
  const fisico = Math.round(Math.sin(2 * Math.PI * dias / 23) * 100);
  const emocional = Math.round(Math.sin(2 * Math.PI * dias / 28) * 100);
  const intelectual = Math.round(Math.sin(2 * Math.PI * dias / 33) * 100);

  const estados: string[] = [];
  if (fisico > 50) estados.push('energía física alta');
  else if (fisico < -50) estados.push('energía física baja');
  if (emocional > 50) estados.push('buen humor');
  else if (emocional < -50) estados.push('emociones bajas');
  if (intelectual > 50) estados.push('mente aguda');
  else if (intelectual < -50) estados.push('concentración baja');

  const criticos: string[] = [];
  if (Math.abs(fisico) < 10) criticos.push('físico');
  if (Math.abs(emocional) < 10) criticos.push('emocional');
  if (Math.abs(intelectual) < 10) criticos.push('intelectual');

  let msg = `Día ${dias.toLocaleString('es-AR')} de vida. `;
  if (estados.length) msg += `Estado: ${estados.join(', ')}. `;
  if (criticos.length) msg += `Ciclo(s) en zona crítica: ${criticos.join(', ')}.`;
  else msg += 'Sin ciclos en zona crítica hoy.';

  return { fisico, emocional, intelectual, mensaje: msg };
}
