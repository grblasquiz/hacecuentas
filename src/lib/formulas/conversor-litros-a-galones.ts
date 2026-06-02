/** Conversor: litro ↔ galón US */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorLitrosAGalones(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.264172;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'litros'; toLabel = 'galones US';
  } else {
    r = v / factor;
    fromLabel = 'galones US'; toLabel = 'litros';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Ojo: galón de EE.UU.',
    text: d === 'ida'
      ? '**' + v + ' litros** son **' + rTxt + ' galones US** (1 gal US = 3,785 L). El galón imperial (Reino Unido) es mayor (4,546 L), así que daría un número distinto.'
      : '**' + v + ' galones US** equivalen a **' + rTxt + ' litros** (1 gal US = 3,785 L). Si tu dato viene de UK, usá el galón imperial (4,546 L) en su lugar.',
    tone: 'warn',
    icon: '⛽'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'gal US'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight
  };
}
