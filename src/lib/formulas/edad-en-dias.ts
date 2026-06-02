export interface Inputs { fechaNacimiento: string; }
export interface Outputs { diasVividos: number; hitos: string; mensaje: string; _insight?: any; _chart?: any; }
export function edadEnDias(i: Inputs): Outputs {
  const parts = String(i.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha válida');
  if (nac > hoy) throw new Error('La fecha debe ser anterior a hoy');
  const dias = Math.round((hoy.getTime() - nac.getTime()) / 86400000);
  const hitosArr = [1000,5000,10000,15000,20000,25000,30000];
  const hitos = hitosArr.map(h => {
    if (dias >= h) {
      const f = new Date(nac.getTime() + h * 86400000);
      return `✓ ${h.toLocaleString('es-AR')} días — cumplido el ${f.toLocaleDateString('es-AR')}`;
    }
    const f = new Date(nac.getTime() + h * 86400000);
    return `○ ${h.toLocaleString('es-AR')} días — ${f.toLocaleDateString('es-AR')} (faltan ${h - dias} días)`;
  }).join('\n');
  const pct = Math.round(dias / 30000 * 100);
  const msg = `Viviste ${dias.toLocaleString('es-AR')} días. Eso es el ${pct}% de 30.000 días (~82 años).`;

  const anos = Math.floor(dias / 365.25);
  const _insight = {
    title: 'Tu vida en números',
    text: `Llevás **${dias.toLocaleString('es-AR')} días** vividos, unos **${anos} años**. Eso equivale al **${pct}%** de los 30.000 días (~82 años) que dura una vida promedio.`,
    tone: 'neutral',
    icon: '📅',
  };

  const _chart = {
    type: 'scale',
    marker: dias,
    markerLabel: `${dias.toLocaleString('es-AR')} días`,
    min: 0,
    segments: [
      { nombre: 'Infancia', max: 6575, color: '#bfdbfe', colorDark: '#1e3a8a' },
      { nombre: 'Juventud', max: 14610, color: '#86efac', colorDark: '#166534' },
      { nombre: 'Adultez', max: 23741, color: '#fde68a', colorDark: '#854d0e' },
      { nombre: 'Madurez', max: 30000, color: '#fdba74', colorDark: '#9a3412' },
      { nombre: 'Longevidad', max: Math.max(36500, dias + 365), color: '#d8b4fe', colorDark: '#6b21a8' },
    ],
    ariaLabel: `Progreso de vida: ${dias.toLocaleString('es-AR')} días sobre una referencia de 30.000 días (~82 años).`,
  };

  return { diasVividos: dias, hitos, mensaje: msg, _insight, _chart };
}
