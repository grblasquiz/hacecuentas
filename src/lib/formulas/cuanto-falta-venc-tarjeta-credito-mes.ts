export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cuantoFaltaVencTarjetaCreditoMes(i: Inputs): Outputs {
  // Día de vencimiento del mes (1-31) que el usuario lee del resumen / home banking.
  const raw = i.diaVencimiento;
  const dia = Number(raw);
  if (raw === '' || raw === null || raw === undefined || !Number.isFinite(dia) || dia < 1 || dia > 31) {
    return { resultado: '—', proximoVencimiento: '—', resumen: 'Ingresá el día de vencimiento de tu tarjeta (1 a 31).' };
  }
  const diaObj = Math.floor(dia);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyDia = hoy.getDate();
  const hoyMes = hoy.getMonth();
  const hoyAnio = hoy.getFullYear();

  // Cantidad de días del mes target, para "clampear" días que no existen (ej. 31 en febrero).
  const diasEnMes = (anio: number, mesIdx: number) => new Date(anio, mesIdx + 1, 0).getDate();

  // Construye la fecha de vencimiento para un mes dado, ajustando el día al último día si no existe.
  const fechaVenc = (anio: number, mesIdx: number) => {
    const tope = diasEnMes(anio, mesIdx);
    const d = Math.min(diaObj, tope);
    const fecha = new Date(anio, mesIdx, d);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  };

  // El vencimiento de este mes: si todavía no pasó (>= hoy) sirve; si ya pasó, voy al mes que viene.
  let prox = fechaVenc(hoyAnio, hoyMes);
  if (prox.getTime() < hoy.getTime()) {
    prox = fechaVenc(hoyAnio, hoyMes + 1);
  }

  const diff = Math.round((prox.getTime() - hoy.getTime()) / 86400000);

  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const fechaTexto = `${diasSemana[prox.getDay()]} ${prox.getDate()} de ${meses[prox.getMonth()]} de ${prox.getFullYear()}`;
  const fechaISO = `${prox.getFullYear()}-${String(prox.getMonth() + 1).padStart(2, '0')}-${String(prox.getDate()).padStart(2, '0')}`;

  const ajusteNota = prox.getDate() !== diaObj
    ? ` (el día ${diaObj} no existe en ${meses[prox.getMonth()]}, se usó el último día del mes)`
    : '';

  let _insight;
  if (diff === 0) {
    _insight = { title: 'Vence hoy', text: 'El resumen **vence hoy**. Pagá antes del cierre del día para evitar intereses de mora sobre el saldo.', tone: 'warn', icon: '🚨' };
  } else if (diff <= 3) {
    _insight = { title: 'Se acerca el vencimiento', text: `Quedan **${diff} día${diff === 1 ? '' : 's'}** hasta el ${fechaTexto}. Programá el pago total ya: el saldo financiado arrastra intereses altísimos.`, tone: 'warn', icon: '⏰' };
  } else if (diff <= 7) {
    _insight = { title: 'Tenés poco margen', text: `Faltan **${diff} días** (${fechaTexto}). Asegurate de juntar el total antes de la fecha para no caer en el pago mínimo.`, tone: 'warn', icon: '📅' };
  } else {
    _insight = { title: 'Con tiempo para pagar', text: `Faltan **${diff} días** hasta el ${fechaTexto}. Pagá el **total** antes del vencimiento para no generar intereses de financiación.`, tone: 'good', icon: '💳' };
  }

  // Gauge de urgencia dentro del ciclo mensual de pago.
  const _chart = {
    type: 'scale',
    marker: Math.min(diff, 31),
    markerLabel: `${diff} día${diff === 1 ? '' : 's'}`,
    min: 0,
    segments: [
      { nombre: 'Urgente', max: 3, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Atención', max: 7, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Con margen', max: 31, color: '#22c55e', colorDark: '#4ade80' }
    ],
    ariaLabel: `Faltan ${diff} días para el vencimiento de la tarjeta`
  };

  return {
    resultado: `${diff} día${diff === 1 ? '' : 's'}`,
    proximoVencimiento: `${fechaTexto}${ajusteNota}`,
    resumen: `Tu próximo vencimiento es el ${fechaISO}: faltan ${diff} día${diff === 1 ? '' : 's'} desde hoy.`,
    _insight,
    _chart
  };
}
