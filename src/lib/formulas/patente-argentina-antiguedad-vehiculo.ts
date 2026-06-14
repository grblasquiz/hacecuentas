export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, unknown>; }

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

export function patenteArgentinaAntiguedadVehiculo(i: Inputs): Outputs {
  const valor = Number(i.valor) || 0;
  // Antigüedad en años (0 = 0 km). Se acota a [0, 50].
  const antiguedad = Math.max(0, Math.min(50, Number(i.antiguedad) || 0));
  // Alícuota editable. Si el campo viene vacío/0, usamos la típica 4,5 %.
  const alicuotaRaw = Number(i.alicuota);
  const alicuota = Number.isFinite(alicuotaRaw) && alicuotaRaw > 0 ? alicuotaRaw : 4.5;

  // Depreciación: ~10 % por año sobre el valor fiscal, con piso del 10 % del valor.
  const factor = Math.max(0.10, 1 - 0.10 * antiguedad);
  const valuacion = valor * factor;

  const anual = valuacion * (alicuota / 100);
  const mensual = anual / 12;

  const _insight = valor > 0 ? {
    title: 'Lo que pagás de patente',
    text: `Un vehículo de **${antiguedad} ${antiguedad === 1 ? 'año' : 'años'}** parte de un valor fiscal de **${fmt(valor)}** y, tras la depreciación por antigüedad, se toma una valuación de **${fmt(valuacion)}**. Con una alícuota del **${alicuota.toLocaleString('es-AR')} %**, la patente ronda **${fmt(anual)}/año** (~${fmt(mensual)}/mes). Es una estimación: el valor fiscal y la alícuota exactos los fija ARCA y tu provincia.`,
    tone: 'warn',
    icon: '🚗',
  } : undefined;

  const _chart = valor > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Valuación considerada', value: Math.round(valuacion) },
      { label: 'Depreciación por antigüedad', value: Math.round(valor - valuacion) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmt(anual),
    centerLabel: 'Patente/año',
    ariaLabel: 'Composición del valor fiscal: valuación considerada para la patente más la depreciación descontada por antigüedad.',
  } : undefined;

  return {
    cuotaAnual: fmt(anual),
    mensual: fmt(mensual),
    valuacion: fmt(valuacion),
    resumen: `Valor fiscal ${fmt(valor)} con ${antiguedad} ${antiguedad === 1 ? 'año' : 'años'} de antigüedad → valuación ${fmt(valuacion)}; patente ~${fmt(anual)}/año (alícuota ${alicuota.toLocaleString('es-AR')} %).`,
    ...(_insight ? { _insight } : {}),
    ...(_chart ? { _chart } : {}),
  };
}
