/** Conversor: día ↔ hora */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorDiasAHoras(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 24.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'días'; toLabel = 'horas';
  } else {
    r = v / factor;
    fromLabel = 'horas'; toLabel = 'días';
  }

  const dias = d === 'ida' ? v : r;
  const horas = d === 'ida' ? r : v;
  let extra = '';
  if (dias >= 7) {
    const semanas = dias / 7;
    extra = ' Son aproximadamente **' + semanas.toFixed(semanas < 10 ? 1 : 0).replace(/\.0$/, '') + ' semanas**.';
  }
  const insight = {
    title: 'Cómo se reparte el tiempo',
    text: '**' + dias.toFixed(2).replace(/\.?0+$/, '') + ' días** equivalen a **' + horas.toFixed(0) + ' horas**, porque cada día tiene **24 horas**.' + extra,
    tone: 'neutral',
    icon: '⏳'
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'h' : "d"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
