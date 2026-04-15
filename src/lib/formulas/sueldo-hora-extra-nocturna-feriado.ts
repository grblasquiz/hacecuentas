/**
 * Calculadora de valor hora extra — nocturna y feriado
 * Extra 50% = valor_hora × 1.5 | Extra 100% = valor_hora × 2
 * Nocturna: factor 1.333 adicional
 */

export interface SueldoHoraExtraNocturnaFeriadoInputs {
  sueldoBruto: number;
  horasMensuales: number;
  tipoHoraExtra: string;
  cantidadHoras: number;
}

export interface SueldoHoraExtraNocturnaFeriadoOutputs {
  valorHoraExtra: number;
  totalHorasExtra: number;
  valorHoraNormal: number;
  detalle: string;
}

export function sueldoHoraExtraNocturnaFeriado(
  inputs: SueldoHoraExtraNocturnaFeriadoInputs
): SueldoHoraExtraNocturnaFeriadoOutputs {
  const bruto = Number(inputs.sueldoBruto);
  const horasMes = Number(inputs.horasMensuales) || 200;
  const tipo = inputs.tipoHoraExtra || '50';
  const cantidad = Number(inputs.cantidadHoras);

  if (!bruto || bruto <= 0) throw new Error('Ingresá tu sueldo bruto mensual');
  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de horas extra');
  if (horasMes <= 0) throw new Error('Las horas mensuales deben ser positivas');

  const valorHoraNormal = bruto / horasMes;

  const NOCTURNA_FACTOR = 8 / 6; // 1 hora nocturna = 1h 8min → factor 1.333

  let multiplicador = 1;
  let tipoStr = '';

  switch (tipo) {
    case '50':
      multiplicador = 1.5;
      tipoStr = 'extra al 50% (días hábiles)';
      break;
    case '100':
      multiplicador = 2;
      tipoStr = 'extra al 100% (sábado tarde / domingo / feriado)';
      break;
    case 'nocturna50':
      multiplicador = 1.5 * NOCTURNA_FACTOR;
      tipoStr = 'nocturna + extra al 50%';
      break;
    case 'nocturna100':
      multiplicador = 2 * NOCTURNA_FACTOR;
      tipoStr = 'nocturna + extra al 100%';
      break;
    default:
      multiplicador = 1.5;
      tipoStr = 'extra al 50%';
  }

  const valorHoraExtra = valorHoraNormal * multiplicador;
  const totalHorasExtra = valorHoraExtra * cantidad;

  return {
    valorHoraExtra: Math.round(valorHoraExtra),
    totalHorasExtra: Math.round(totalHorasExtra),
    valorHoraNormal: Math.round(valorHoraNormal),
    detalle: `Valor hora normal: $${Math.round(valorHoraNormal).toLocaleString('es-AR')} ($${Math.round(bruto).toLocaleString('es-AR')} / ${horasMes} hs). Hora ${tipoStr}: $${Math.round(valorHoraExtra).toLocaleString('es-AR')} (×${multiplicador.toFixed(2)}). ${cantidad} horas extra = $${Math.round(totalHorasExtra).toLocaleString('es-AR')} brutos.`,
  };
}
