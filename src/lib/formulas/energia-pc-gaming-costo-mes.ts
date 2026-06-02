/** Calculadora de Consumo Eléctrico PC Gaming */
export interface Inputs {
  wattsJuego: number;
  wattsIdle: number;
  horasJuegoDia: number;
  horasIdleDia: number;
  tarifaKwh: number;
}
export interface Outputs {
  costoMensual: number;
  kwhMes: number;
  costoAnual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function energiaPcGamingCostoMes(i: Inputs): Outputs {
  const wj = Number(i.wattsJuego);
  const wi = Number(i.wattsIdle);
  const hj = Number(i.horasJuegoDia);
  const hi = Number(i.horasIdleDia);
  const tarifa = Number(i.tarifaKwh);

  if (!wj || wj <= 0) throw new Error('Ingresá los watts en juego');
  if (!wi || wi <= 0) throw new Error('Ingresá los watts en idle');
  if (hj < 0 || hi < 0) throw new Error('Las horas no pueden ser negativas');
  if (hj + hi === 0) throw new Error('Ingresá al menos alguna hora de uso');
  if (!tarifa || tarifa <= 0) throw new Error('Ingresá la tarifa eléctrica');

  // Factor de eficiencia de fuente (80 Plus ~87% eficiencia)
  const eficiencia = 0.87;
  const consumoJuegoWh = (wj / eficiencia) * hj * 30;
  const consumoIdleWh = (wi / eficiencia) * hi * 30;
  const totalWh = consumoJuegoWh + consumoIdleWh;
  const kwhMes = totalWh / 1000;
  const costoMensual = kwhMes * tarifa;
  const costoAnual = costoMensual * 12;

  const costoJuego = Math.round(consumoJuegoWh / 1000 * tarifa);
  const costoIdle = Math.round(consumoIdleWh / 1000 * tarifa);
  const totalDonut = costoJuego + costoIdle;
  const pctJuego = totalDonut > 0 ? Math.round((costoJuego / totalDonut) * 100) : 0;

  const _insight = {
    title: 'Costo eléctrico de tu PC',
    text: `Tu PC consume **${kwhMes.toFixed(1)} kWh/mes** y te cuesta **$${Math.round(costoMensual).toLocaleString('es-AR')}** al mes (**$${Math.round(costoAnual).toLocaleString('es-AR')}** al año). El **${pctJuego}%** del gasto se va jugando.`,
    tone: 'neutral',
    icon: '🎮',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'En juego', value: costoJuego },
      { label: 'En idle', value: costoIdle },
    ],
    prefix: '$',
    centerValue: '$' + totalDonut.toLocaleString('es-AR'),
    centerLabel: 'Costo/mes',
    ariaLabel: `Costo mensual de $${totalDonut} repartido entre juego ($${costoJuego}) e idle ($${costoIdle})`,
  };

  return {
    costoMensual: Number(costoMensual.toFixed(0)),
    kwhMes: Number(kwhMes.toFixed(1)),
    costoAnual: Number(costoAnual.toFixed(0)),
    detalle: `Juego: ${(consumoJuegoWh / 1000).toFixed(1)} kWh/mes ($${(consumoJuegoWh / 1000 * tarifa).toFixed(0)}). Idle: ${(consumoIdleWh / 1000).toFixed(1)} kWh/mes ($${(consumoIdleWh / 1000 * tarifa).toFixed(0)}). Total: ${kwhMes.toFixed(1)} kWh/mes.`,
    _insight,
    _chart,
  };
}
