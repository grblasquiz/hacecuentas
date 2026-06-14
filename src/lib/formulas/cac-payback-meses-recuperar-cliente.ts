/**
 * Calculadora de CAC payback (meses para recuperar el costo de adquisición)
 *   meses = cac / (ingreso_mensual_por_cliente × margen/100)
 *   benchmark según meses (SaaS sano < 12 meses)
 */

export interface CacPaybackInputs {
  cac: number; // $
  ingreso_mensual_por_cliente: number; // $
  margen_bruto_pct: number; // % (default 100)
}

export interface CacPaybackOutputs {
  mesesPayback: number;
  contribucionMensual: number;
  benchmark: string;
  benchmarkDetalle: string;
  _insight?: any;
  _chart?: any;
}

export function cacPaybackMesesRecuperarCliente(
  inputs: CacPaybackInputs
): CacPaybackOutputs {
  const cac = Number(inputs.cac);
  const ingresoMensual = Number(inputs.ingreso_mensual_por_cliente);
  const margenRaw = inputs.margen_bruto_pct;
  // default 100 (si viene vacío/null tratamos como 100% = sin descuento por margen)
  const margen =
    margenRaw === '' || margenRaw === null || margenRaw === undefined
      ? 100
      : Math.max(1, Math.min(100, Number(margenRaw) || 100));

  if (!cac || cac <= 0) throw new Error('Ingresá el CAC (costo de adquisición)');
  if (!ingresoMensual || ingresoMensual <= 0)
    throw new Error('Ingresá el ingreso mensual por cliente');

  const contribucionMensual = ingresoMensual * (margen / 100);
  const mesesPayback = cac / contribucionMensual;

  let benchmark = '';
  let benchmarkDetalle = '';
  if (mesesPayback <= 6) {
    benchmark = '🚀 Excelente';
    benchmarkDetalle = 'Recuperás el CAC en menos de 6 meses: economía unitaria muy sólida, podés reinvertir rápido en crecimiento.';
  } else if (mesesPayback <= 12) {
    benchmark = '✅ Sano';
    benchmarkDetalle = 'Recuperás el CAC en menos de 12 meses: es el benchmark de un SaaS/negocio de suscripción saludable.';
  } else if (mesesPayback <= 18) {
    benchmark = '⚡ Aceptable';
    benchmarkDetalle = 'Entre 12 y 18 meses: tolerable si la retención es alta y tenés capital para financiar el ciclo.';
  } else if (mesesPayback <= 24) {
    benchmark = '⚠️ Exigente';
    benchmarkDetalle = 'Entre 18 y 24 meses: necesitás mucho capital de trabajo y baja deserción para sostenerlo.';
  } else {
    benchmark = '🔴 Riesgoso';
    benchmarkDetalle = 'Más de 24 meses: difícil de financiar; si el cliente se va antes, perdés plata. Bajá el CAC o subí el ingreso/margen.';
  }

  const mesesR = Math.round(mesesPayback * 10) / 10;
  const insightText = `Tardás **${mesesR} meses** en recuperar lo que te costó traer al cliente. ${margen < 100 ? `Como cada mes aporta solo el margen ($${Math.round(contribucionMensual).toLocaleString('es-AR')} de los $${ingresoMensual.toLocaleString('es-AR')} de ingreso), ` : ''}a partir de ese mes el cliente empieza a dejarte ganancia neta. ${mesesR <= 12 ? 'Estás dentro del rango sano de un negocio de suscripción.' : 'Está por encima del benchmark sano de 12 meses: vigilá la retención y el capital de trabajo.'}`;

  const tone = mesesPayback <= 12 ? 'good' : mesesPayback <= 18 ? 'neutral' : 'warn';
  const topSeg = Math.max(Math.ceil(mesesPayback) + 3, 24);
  return {
    mesesPayback: mesesR,
    contribucionMensual: Math.round(contribucionMensual),
    benchmark,
    benchmarkDetalle,
    _insight: {
      title: 'Recupero del CAC',
      text: insightText,
      tone,
      icon: '⏱️',
    },
    _chart: {
      type: 'scale',
      marker: mesesR,
      markerLabel: `${mesesR} meses`,
      min: 0,
      segments: [
        { nombre: 'Excelente', max: 6, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Sano', max: 12, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Aceptable', max: 18, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Exigente', max: 24, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Riesgoso', max: topSeg, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Payback del CAC en ${mesesR} meses`,
    },
  };
}
