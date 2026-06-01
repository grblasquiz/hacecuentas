/** Biorritmo físico, emocional e intelectual */
export interface Inputs { fechaNacimiento: string; }
export interface Outputs { fisico: number; emocional: number; intelectual: number; mensaje: string; _insight?: any; }

export function biorhythm(i: Inputs): Outputs {
  const parts = String(i.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha válida');
  if (nac > hoy) throw new Error('La fecha debe ser anterior a hoy');

  const dias = Math.round((hoy.getTime() - nac.getTime()) / 86400000);
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

  const ciclos = [
    { nombre: 'físico', v: fisico },
    { nombre: 'emocional', v: emocional },
    { nombre: 'intelectual', v: intelectual },
  ];
  const top = ciclos.reduce((a, b) => (b.v > a.v ? b : a));
  const bottom = ciclos.reduce((a, b) => (b.v < a.v ? b : a));
  const tone = criticos.length ? 'warn' : top.v > 50 && bottom.v >= 0 ? 'good' : 'neutral';
  const insText = criticos.length
    ? `Hoy tu ciclo **${criticos.join(' y ')}** cruza el cero (zona crítica): día de mayor inestabilidad, mejor evitar decisiones de alto riesgo en ${criticos.length > 1 ? 'esas áreas' : 'esa área'}.`
    : `Tu pico de hoy es el **${top.nombre}** (**${top.v > 0 ? '+' : ''}${top.v}%**) y el más bajo el **${bottom.nombre}** (**${bottom.v > 0 ? '+' : ''}${bottom.v}%**). Aprovechá lo alto y bajá expectativas en lo bajo.`;

  return {
    fisico, emocional, intelectual, mensaje: msg,
    _insight: {
      title: 'Tu día según el biorritmo',
      text: insText,
      tone,
      icon: criticos.length ? '⚠️' : top.nombre === 'físico' ? '💪' : top.nombre === 'emocional' ? '❤️' : '🧠',
    },
  };
}
