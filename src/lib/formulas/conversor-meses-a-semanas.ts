/** Conversor: mes ↔ semana */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMesesASemanas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 4.34524;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'meses'; toLabel = 'semanas';
  } else {
    r = v / factor;
    fromLabel = 'semanas'; toLabel = 'meses';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const meses = d === 'ida' ? v : r;
  const dias = Math.round(meses * 30.4369);
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'sem'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Ojo con el mes "promedio"',
      text: '**' + v + ' ' + fromLabel + '** ≈ **' + rTxt + ' ' + toLabel + '** (unos **' + dias.toLocaleString('es-AR') + ' días**). Se usa el mes promedio de **4,35 semanas**, no 4: si contás de a 4 semanas por mes te quedás corto casi medio mes por año.',
      tone: 'neutral',
      icon: '🗓️'
    }
  };
}
