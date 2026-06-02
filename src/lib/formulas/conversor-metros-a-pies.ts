/** Conversor: metro ↔ pie */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMetrosAPies(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 3.28084;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros'; toLabel = 'pies';
  } else {
    r = v / factor;
    fromLabel = 'pies'; toLabel = 'metros';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const metros = d === 'ida' ? v : r;
  const totalPulg = metros * 39.3701;
  const pies = Math.floor(totalPulg / 12);
  const pulg = Math.round(totalPulg - pies * 12);
  const piesAjust = pulg === 12 ? pies + 1 : pies;
  const pulgAjust = pulg === 12 ? 0 : pulg;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'ft'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Cómo se dice en pies y pulgadas',
      text: '**' + v + ' ' + fromLabel + '** son **' + rTxt + ' pies**, que en el sistema anglosajón se expresa como **' + piesAjust + "' " + pulgAjust + '"** (' + piesAjust + ' pies y ' + pulgAjust + ' pulgadas). Útil para estaturas y medidas de muebles o deportes.',
      tone: 'neutral',
      icon: '📏'
    }
  };
}
