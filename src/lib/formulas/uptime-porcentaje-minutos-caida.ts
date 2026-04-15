/** Conversión de porcentaje de uptime SLA a minutos de caída */
export interface Inputs { uptimePorcentaje: number; }
export interface Outputs { caidaAnualMin: number; caidaAnualHoras: number; caidaMensualMin: number; caidaSemanalMin: number; detalle: string; }

export function uptimePorcentajeMinutosCaida(i: Inputs): Outputs {
  const uptime = Number(i.uptimePorcentaje);

  if (isNaN(uptime) || uptime < 0 || uptime > 100) throw new Error('Ingresá un porcentaje de uptime entre 0 y 100');

  const minutosAnio = 525960; // 365.25 * 24 * 60
  const downtimeFraction = 1 - uptime / 100;

  const caidaAnualMin = minutosAnio * downtimeFraction;
  const caidaAnualHoras = caidaAnualMin / 60;
  const caidaMensualMin = caidaAnualMin / 12;
  const caidaSemanalMin = caidaAnualMin / 52;

  let caidaTexto: string;
  if (caidaAnualMin < 1) caidaTexto = `${(caidaAnualMin * 60).toFixed(1)} segundos/año`;
  else if (caidaAnualMin < 60) caidaTexto = `${caidaAnualMin.toFixed(1)} minutos/año`;
  else if (caidaAnualHoras < 24) caidaTexto = `${caidaAnualHoras.toFixed(1)} horas/año`;
  else caidaTexto = `${(caidaAnualHoras / 24).toFixed(1)} días/año`;

  return {
    caidaAnualMin: Number(caidaAnualMin.toFixed(2)),
    caidaAnualHoras: Number(caidaAnualHoras.toFixed(2)),
    caidaMensualMin: Number(caidaMensualMin.toFixed(2)),
    caidaSemanalMin: Number(caidaSemanalMin.toFixed(2)),
    detalle: `Uptime ${uptime}% = caída máxima de ${caidaTexto} (${caidaMensualMin.toFixed(1)} min/mes, ${caidaSemanalMin.toFixed(1)} min/semana).`,
  };
}
