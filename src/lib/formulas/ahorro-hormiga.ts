/** Ahorro hormiga: cuánto ahorrás eliminando un gasto diario */

export interface Inputs {
  gastoDiario: number;
  tasaAnual: number;
}

export interface Outputs {
  ahorroMensual: number;
  ahorroAnual: number;
  ahorro5Anios: number;
  ahorro10Anios: number;
  _insight?: any;
}

function calcularVFAnualidad(aporteMensual: number, tasaMensual: number, meses: number): number {
  if (tasaMensual === 0) return aporteMensual * meses;
  return aporteMensual * ((Math.pow(1 + tasaMensual, meses) - 1) / tasaMensual);
}

export function ahorroHormiga(i: Inputs): Outputs {
  const gastoDiario = Number(i.gastoDiario);
  const tasaAnual = Number(i.tasaAnual);

  if (isNaN(gastoDiario) || gastoDiario <= 0) throw new Error('Ingresá el gasto diario a eliminar');
  if (isNaN(tasaAnual) || tasaAnual < 0) throw new Error('La tasa anual no puede ser negativa');

  const ahorroMensual = gastoDiario * 30;
  const tasaMensual = tasaAnual / 100 / 12;

  const ahorroAnual = calcularVFAnualidad(ahorroMensual, tasaMensual, 12);
  const ahorro5Anios = calcularVFAnualidad(ahorroMensual, tasaMensual, 60);
  const ahorro10Anios = calcularVFAnualidad(ahorroMensual, tasaMensual, 120);

  const fmt = (n: number) => '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(n));
  const aportes10 = ahorroMensual * 120;
  const interes10 = ahorro10Anios - aportes10;
  const _insight = {
    title: 'Lo que cuesta ese gasto chico',
    text: tasaAnual > 0
      ? `Ese gasto de **${fmt(gastoDiario)} por día** son **${fmt(ahorroMensual)} al mes**. Si en vez de gastarlo lo invertís al **${tasaAnual}% anual**, en 10 años tenés **${fmt(ahorro10Anios)}** — de los cuales **${fmt(interes10)}** son intereses que ganaste sin poner un peso extra.`
      : `Ese gasto de **${fmt(gastoDiario)} por día** son **${fmt(ahorroMensual)} al mes** y **${fmt(ahorro10Anios)}** en 10 años. Cargá una tasa anual para ver cuánto más rendiría si lo invertís en lugar de dejarlo quieto.`,
    tone: 'neutral',
    icon: '🐜',
  };

  return {
    ahorroMensual: Math.round(ahorroMensual),
    ahorroAnual: Math.round(ahorroAnual),
    ahorro5Anios: Math.round(ahorro5Anios),
    ahorro10Anios: Math.round(ahorro10Anios),
    _insight,
  };
}
