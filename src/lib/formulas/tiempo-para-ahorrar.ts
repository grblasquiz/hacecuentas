export interface Inputs {
  meta: number;
  ahorroInicial?: number;
  aporte: number;
  frecuencia?: 'semanal' | 'quincenal' | 'mensual';
  tasaAnual?: number;
  inflacionAnual?: number;
}

export interface Outputs {
  mesesNecesarios: number;
  fechaEstimada: string;
  totalAportado: number;
  interesesGanados: number;
  valorReal: number;
  detalle: string;
  _chart?: any;
  _table?: any;
  _insight?: any;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

export function tiempoParaAhorrar(i: Inputs): Outputs {
  const meta = Number(i.meta);
  const inicial = Number(i.ahorroInicial) || 0;
  const aporte = Number(i.aporte);
  const frecuencia = i.frecuencia || 'mensual';
  const tasaAnual = Number(i.tasaAnual) || 0;
  const inflacionAnual = Number(i.inflacionAnual) || 0;

  if (meta <= 0) throw new Error('Ingresá una meta mayor que cero');
  if (inicial < 0 || aporte < 0) throw new Error('El ahorro y los aportes no pueden ser negativos');
  if (inicial < meta && aporte <= 0) throw new Error('Ingresá un aporte periódico para alcanzar la meta');
  if (tasaAnual < 0 || inflacionAnual < 0) throw new Error('Las tasas no pueden ser negativas');

  const aportesPorMes = frecuencia === 'semanal' ? 52 / 12 : frecuencia === 'quincenal' ? 2 : 1;
  const aporteMensual = aporte * aportesPorMes;
  const tasaMensual = Math.pow(1 + tasaAnual / 100, 1 / 12) - 1;
  let saldo = inicial;
  let meses = 0;
  const maxMeses = 1200;
  const labels = ['Inicio'];
  const saldos = [Math.round(saldo)];
  const aportados = [Math.round(inicial)];
  const rows: Array<Array<string | number>> = [];

  while (saldo < meta && meses < maxMeses) {
    saldo = saldo * (1 + tasaMensual) + aporteMensual;
    meses += 1;
    if (meses % 12 === 0 || saldo >= meta) {
      labels.push(meses % 12 === 0 ? `Año ${meses / 12}` : `Mes ${meses}`);
      saldos.push(Math.round(saldo));
      aportados.push(Math.round(inicial + aporteMensual * meses));
      rows.push([
        meses,
        fmt(saldo),
        fmt(inicial + aporteMensual * meses),
        fmt(Math.max(0, saldo - inicial - aporteMensual * meses)),
      ]);
    }
  }

  if (meses >= maxMeses && saldo < meta) throw new Error('Con estos datos la meta demora más de 100 años; aumentá el aporte');

  const totalAportado = inicial + aporteMensual * meses;
  const intereses = Math.max(0, saldo - totalAportado);
  const anios = meses / 12;
  const valorReal = saldo / Math.pow(1 + inflacionAnual / 100, anios);
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + meses);
  const fechaEstimada = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const aniosEnteros = Math.floor(meses / 12);
  const mesesResto = meses % 12;
  const plazo = [aniosEnteros ? `${aniosEnteros} año${aniosEnteros === 1 ? '' : 's'}` : '', mesesResto ? `${mesesResto} mes${mesesResto === 1 ? '' : 'es'}` : ''].filter(Boolean).join(' y ') || 'ahora';

  return {
    mesesNecesarios: meses,
    fechaEstimada,
    totalAportado: Math.round(totalAportado),
    interesesGanados: Math.round(intereses),
    valorReal: Math.round(valorReal),
    detalle: `Llegás a ${fmt(meta)} en ${plazo}, aproximadamente en ${fechaEstimada}.`,
    _chart: {
      type: 'line',
      data: { labels, datasets: [
        { label: 'Saldo proyectado', data: saldos, fill: true, tension: 0.2 },
        { label: 'Dinero aportado', data: aportados, fill: false, dashed: true },
      ] },
      ariaLabel: `Evolución del ahorro hasta alcanzar ${fmt(meta)} en ${meses} meses.`,
    },
    _table: {
      title: 'Evolución hasta la meta',
      headers: ['Mes', 'Saldo', 'Aportado', 'Rendimiento'],
      align: ['left', 'right', 'right', 'right'],
      rows,
      collapseAfter: 10,
      footer: ['Meta', fmt(saldo), fmt(totalAportado), fmt(intereses)],
      note: 'Proyección matemática con tasa constante. No garantiza rendimientos futuros.',
    },
    _insight: {
      title: inicial >= meta ? 'La meta ya está cubierta' : `Meta estimada para ${fechaEstimada}`,
      text: `Con aportes equivalentes a **${fmt(aporteMensual)} por mes**, llegás en **${plazo}**. Ponés **${fmt(totalAportado)}** y el rendimiento estimado aporta **${fmt(intereses)}**.${inflacionAnual > 0 ? ` Descontando ${inflacionAnual}% de inflación anual, el saldo equivale a **${fmt(valorReal)}** de hoy.` : ''}`,
      tone: meses <= 24 ? 'good' : meses <= 60 ? 'neutral' : 'warn',
      icon: '⏳',
    },
  };
}
