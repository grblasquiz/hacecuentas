export interface Inputs {
  saldoActual: number;
  tasaActual: number;
  mesesActuales: number;
  tasaNueva: number;
  mesesNuevos: number;
  gastosNuevo?: number;
  costoCancelacion?: number;
}

export interface Outputs {
  cuotaActual: number;
  cuotaNueva: number;
  ahorroMensual: number;
  puntoEquilibrioMeses: number;
  costoTotalActual: number;
  costoTotalNuevo: number;
  ahorroTotal: number;
  recomendacion: string;
  _chart?: any;
  _table?: any;
  _insight?: any;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const cuota = (p: number, tasaAnual: number, n: number) => {
  const r = tasaAnual / 100 / 12;
  if (r === 0) return p / n;
  const f = Math.pow(1 + r, n);
  return p * r * f / (f - 1);
};

export function refinanciacionPrestamo(i: Inputs): Outputs {
  const saldo = Number(i.saldoActual);
  const tasaActual = Number(i.tasaActual);
  const mesesActuales = Math.round(Number(i.mesesActuales));
  const tasaNueva = Number(i.tasaNueva);
  const mesesNuevos = Math.round(Number(i.mesesNuevos));
  const gastos = (Number(i.gastosNuevo) || 0) + (Number(i.costoCancelacion) || 0);
  if (saldo <= 0) throw new Error('Ingresá el saldo pendiente');
  if (mesesActuales <= 0 || mesesNuevos <= 0) throw new Error('Ingresá plazos válidos');
  if (tasaActual < 0 || tasaNueva < 0 || gastos < 0) throw new Error('Las tasas y gastos no pueden ser negativos');

  const cuotaActual = cuota(saldo, tasaActual, mesesActuales);
  const cuotaNueva = cuota(saldo, tasaNueva, mesesNuevos);
  const ahorroMensual = cuotaActual - cuotaNueva;
  const costoTotalActual = cuotaActual * mesesActuales;
  const costoTotalNuevo = cuotaNueva * mesesNuevos + gastos;
  const ahorroTotal = costoTotalActual - costoTotalNuevo;
  const punto = ahorroMensual > 0 ? Math.ceil(gastos / ahorroMensual) : 0;
  const conviene = ahorroTotal > 0;
  const recomendacion = conviene
    ? `La refinanciación reduce el costo total en ${fmt(ahorroTotal)}${punto ? ` y recupera los gastos en ${punto} meses` : ''}.`
    : `La nueva propuesta aumenta el costo total en ${fmt(Math.abs(ahorroTotal))}. Una cuota menor no compensa el plazo y los gastos.`;

  return {
    cuotaActual: Math.round(cuotaActual), cuotaNueva: Math.round(cuotaNueva), ahorroMensual: Math.round(ahorroMensual),
    puntoEquilibrioMeses: punto, costoTotalActual: Math.round(costoTotalActual), costoTotalNuevo: Math.round(costoTotalNuevo),
    ahorroTotal: Math.round(ahorroTotal), recomendacion,
    _chart: { type: 'bar', data: { labels: ['Cuota mensual', 'Costo total'], datasets: [
      { label: 'Crédito actual', data: [Math.round(cuotaActual), Math.round(costoTotalActual)] },
      { label: 'Refinanciación', data: [Math.round(cuotaNueva), Math.round(costoTotalNuevo)] },
    ] }, ariaLabel: 'Comparación de cuota y costo total entre el préstamo actual y la refinanciación.' },
    _table: { title: 'Comparación completa', headers: ['Concepto', 'Actual', 'Nuevo'], align: ['left', 'right', 'right'], rows: [
      ['Tasa anual', `${tasaActual}%`, `${tasaNueva}%`], ['Plazo', `${mesesActuales} meses`, `${mesesNuevos} meses`],
      ['Cuota', fmt(cuotaActual), fmt(cuotaNueva)], ['Gastos', '$0', fmt(gastos)], ['Costo total', fmt(costoTotalActual), fmt(costoTotalNuevo)],
    ], footer: ['Diferencia', '', fmt(ahorroTotal)] },
    _insight: { title: conviene ? 'La refinanciación reduce el costo total' : 'La cuota engaña: el costo total sube', text: `La cuota cambia de **${fmt(cuotaActual)}** a **${fmt(cuotaNueva)}**, pero la comparación completa da **${fmt(ahorroTotal)}** de diferencia.${punto ? ` Recuperás los gastos en **${punto} meses**.` : ''}`, tone: conviene ? 'good' : 'warn', icon: '🔄' },
  };
}
