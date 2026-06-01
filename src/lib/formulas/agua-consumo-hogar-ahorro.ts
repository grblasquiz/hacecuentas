/** Consumo de agua del hogar y ahorro potencial */
export interface Inputs { personas: number; minutossDucha: number; duchasPorDia: number; descargas: number; }
export interface Outputs { consumoMensualLitros: number; consumoConAhorro: number; litrosAhorrados: number; porcentajeAhorro: number; detalle: string; _insight?: any; _chart?: any; }

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

  const duchasMes = aguaDuchas * 30;
  const inodoroMes = aguaInodoro * 30;
  const otrosMes = aguaOtros * 30;
  const m3Ahorrados = litrosAhorrados / 1000;

  return {
    consumoMensualLitros: Number(consumoMensual.toFixed(0)),
    consumoConAhorro: Number(consumoConAhorro.toFixed(0)),
    litrosAhorrados: Number(litrosAhorrados.toFixed(0)),
    porcentajeAhorro: Number(porcentajeAhorro.toFixed(0)),
    detalle: `Consumo actual: ${fmt.format(consumoMensual)} L/mes (duchas ${fmt.format(duchasMes)} L + inodoro ${fmt.format(inodoroMes)} L + otros ${fmt.format(otrosMes)} L). Con hábitos eficientes: ${fmt.format(consumoConAhorro)} L/mes. Ahorro: ${fmt.format(litrosAhorrados)} L/mes (${fmt.format(porcentajeAhorro)}%).`,
    _insight: {
      title: 'Tu margen de ahorro',
      text: `Hoy gastás ~**${fmt.format(consumoMensual)} L/mes** y con hábitos eficientes bajarías a **${fmt.format(consumoConAhorro)} L/mes**: un ahorro de **${fmt.format(litrosAhorrados)} L** (${fmt.format(porcentajeAhorro)}%), unos **${fmt.format(m3Ahorrados)} m³** que se reflejan en la factura. Las duchas son ${fmt.format(duchasMes)} L del total, el punto donde más se recorta.`,
      tone: porcentajeAhorro >= 30 ? 'good' : 'neutral',
      icon: '💧',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Duchas', value: Number(duchasMes.toFixed(0)) },
        { label: 'Inodoro', value: Number(inodoroMes.toFixed(0)) },
        { label: 'Otros usos', value: Number(otrosMes.toFixed(0)) },
      ],
      prefix: '',
      centerValue: `${fmt.format(consumoMensual)} L`,
      centerLabel: 'consumo/mes',
      ariaLabel: `Composición del consumo mensual de agua: duchas ${fmt.format(duchasMes)} L, inodoro ${fmt.format(inodoroMes)} L y otros usos ${fmt.format(otrosMes)} L.`,
    },
  };
}
