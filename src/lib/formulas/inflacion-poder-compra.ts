/** Calculadora de inflación y poder de compra */
export interface Inputs {
  montoOriginal: number;
  inflacionAnual: number;
  anios: number;
}
export interface Outputs {
  valorReal: number;
  perdida: number;
  perdidaPct: string;
  necesitasHoy: number;
  _insight?: any;
  _chart?: any;
}

export function inflacionPoderCompra(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal);
  const inflAnual = Number(i.inflacionAnual);
  const anios = Number(i.anios);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto original');
  if (inflAnual < 0) throw new Error('La inflación no puede ser negativa');
  if (!anios || anios <= 0) throw new Error('Ingresá la cantidad de años');

  const factor = Math.pow(1 + inflAnual / 100, anios);
  const valorReal = monto / factor;
  const perdida = monto - valorReal;
  const perdidaPctNum = (perdida / monto) * 100;
  const perdidaPct = perdidaPctNum.toFixed(1);
  const necesitasHoy = monto * factor;

  const _insight = {
    title: 'El valor real de tu plata',
    text: `Tus **$${Math.round(monto).toLocaleString('es')}** después de ${anios} año${anios > 1 ? 's' : ''} al ${inflAnual}% anual valen **$${Math.round(valorReal).toLocaleString('es')}** en poder de compra: la inflación se llevó **${perdidaPct}%**. Para comprar lo mismo hoy necesitás **$${Math.round(necesitasHoy).toLocaleString('es')}**.`,
    tone: perdidaPctNum >= 30 ? 'warn' : perdidaPctNum >= 10 ? 'neutral' : 'good',
    icon: '🛒',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Poder de compra que queda', value: Math.round(valorReal) },
      { label: 'Poder perdido', value: Math.round(perdida) },
    ],
    prefix: '$',
    centerValue: `$${Math.round(monto).toLocaleString('es')}`,
    centerLabel: 'Monto original',
    ariaLabel: `De $${Math.round(monto).toLocaleString('es')} originales quedan $${Math.round(valorReal).toLocaleString('es')} de poder de compra y se perdieron $${Math.round(perdida).toLocaleString('es')}`,
  };

  return {
    valorReal: Math.round(valorReal),
    perdida: Math.round(perdida),
    perdidaPct: `${perdidaPct}%`,
    necesitasHoy: Math.round(necesitasHoy),
    _insight,
    _chart,
  };
}
