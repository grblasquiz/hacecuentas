/** Conversor: semana ↔ día */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorSemanasADias(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 7.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'semanas'; toLabel = 'días';
  } else {
    r = v / factor;
    fromLabel = 'días'; toLabel = 'semanas';
  }
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  const vStr = String(v);
  const days = d === 'ida' ? r : v;
  const months = days / 30.44;
  const monthsStr = months.toFixed(1).replace(/\.?0+$/, '');
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'd' : "sem"),
    resumen: v + ' ' + fromLabel + ' = ' + rStr + ' ' + toLabel + '.',
    _insight: {
      title: 'En meses, a ojo',
      text: '**' + vStr + ' ' + fromLabel + '** son **' + rStr + ' ' + toLabel + '**, es decir aproximadamente **' + monthsStr + ' meses**. Cada semana son 7 días exactos, sin importar el calendario.',
      tone: 'neutral',
      icon: '📅'
    }
  };
}
