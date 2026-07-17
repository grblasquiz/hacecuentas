import clLive from '../../data/live/chile.json';

export interface Inputs { monto: number; direccion: string }
export interface Outputs { resultado: number; valorUf: number; unidadResultado: string; detalle: string; _insight?: any }

export function compute(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const valorUf = (clLive as any)?.uf?.valor ?? 40844.79;
  const aPesos = i.direccion !== 'pesos_a_uf';
  const resultado = aPesos ? monto * valorUf : monto / valorUf;
  const unidadResultado = aPesos ? 'pesos chilenos' : 'UF';
  const n = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });
  return {
    resultado: Math.round(resultado * 100) / 100,
    valorUf,
    unidadResultado,
    detalle: aPesos ? `${n.format(monto)} UF equivalen a $${n.format(resultado)} CLP.` : `$${n.format(monto)} CLP equivalen a ${n.format(resultado)} UF.`,
    _insight: { title: aPesos ? 'Equivalente en pesos' : 'Equivalente en UF', text: `Usando una UF de **$${n.format(valorUf)}**, el resultado es **${aPesos ? '$' : ''}${n.format(resultado)} ${aPesos ? 'CLP' : 'UF'}**.`, tone: 'neutral', icon: '🔢' },
  };
}
