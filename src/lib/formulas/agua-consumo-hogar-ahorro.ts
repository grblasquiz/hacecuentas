/** Consumo de agua del hogar y ahorro potencial */
export interface Inputs { personas: number; minutossDucha: number; duchasPorDia: number; descargas: number; }
export interface Outputs { consumoMensualLitros: number; consumoConAhorro: number; litrosAhorrados: number; porcentajeAhorro: number; detalle: string; }

export function aguaConsumoHogarAhorro(i: Inputs): Outputs {
  const personas = Number(i.personas);
  const minDucha = Number(i.minutossDucha);
  const duchas = Number(i.duchasPorDia);
  const descargas = Number(i.descargas);

  if (!personas || personas <= 0) throw new Error('Ingresá la cantidad de personas');
  if (!minDucha || minDucha <= 0) throw new Error('Ingresá los minutos de ducha');
  if (duchas < 0) throw new Error('Las duchas no pueden ser negativas');
  if (descargas < 0) throw new Error('Las descargas no pueden ser negativas');

  const aguaDuchas = duchas * minDucha * 9;
  const aguaInodoro = descargas * 10;
  const aguaOtros = personas * 30;
  const consumoDiario = aguaDuchas + aguaInodoro + aguaOtros;
  const consumoMensual = consumoDiario * 30;

  const aguaDuchasEf = duchas * (minDucha / 2) * 6;
  const aguaInodoroEf = descargas * 6;
  const aguaOtrosEf = personas * 20;
  const consumoDiarioEf = aguaDuchasEf + aguaInodoroEf + aguaOtrosEf;
  const consumoConAhorro = consumoDiarioEf * 30;

  const litrosAhorrados = consumoMensual - consumoConAhorro;
  const porcentajeAhorro = consumoMensual > 0 ? (litrosAhorrados / consumoMensual) * 100 : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    consumoMensualLitros: Number(consumoMensual.toFixed(0)),
    consumoConAhorro: Number(consumoConAhorro.toFixed(0)),
    litrosAhorrados: Number(litrosAhorrados.toFixed(0)),
    porcentajeAhorro: Number(porcentajeAhorro.toFixed(0)),
    detalle: `Consumo actual: ${fmt.format(consumoMensual)} L/mes (duchas ${fmt.format(aguaDuchas * 30)} L + inodoro ${fmt.format(aguaInodoro * 30)} L + otros ${fmt.format(aguaOtros * 30)} L). Con hábitos eficientes: ${fmt.format(consumoConAhorro)} L/mes. Ahorro: ${fmt.format(litrosAhorrados)} L/mes (${fmt.format(porcentajeAhorro)}%).`,
  };
}
