/** Estimador de consumo de agua mensual */
export interface Inputs { personas: number; duchasDia: number; duracionDucha?: number; lavadosRopa?: number; costoM3?: number; }
export interface Outputs { consumoMensualLitros: string; consumoDiarioLitros: string; costoMensual: number; litrosPorPersona: string; _insight?: any; _chart?: any; }

export function consumoAguaMensual(i: Inputs): Outputs {
  const personas = Number(i.personas);
  const duchas = Number(i.duchasDia);
  const minDucha = Number(i.duracionDucha) || 8;
  const lavados = Number(i.lavadosRopa) || 3;
  const costoM3 = Number(i.costoM3) || 200;
  if (!personas || personas <= 0) throw new Error('Ingresá la cantidad de personas');
  if (duchas < 0) throw new Error('Duchas no puede ser negativo');

  const litrosDucha = duchas * minDucha * 9; // 9 L/min promedio
  const litrosInodoro = personas * 5 * 8; // 5 veces/día × 8L
  const litrosCocina = personas * 12;
  const litrosLavado = (lavados * 60) / 7; // por día
  const litrosOtros = personas * 8;
  const diario = litrosDucha + litrosInodoro + litrosCocina + litrosLavado + litrosOtros;
  const mensual = diario * 30;
  const m3 = mensual / 1000;
  const costoMensual = m3 * costoM3;

  const lppd = Math.round(diario / personas);
  const esEficiente = lppd < 80;
  const esAlto = lppd >= 200;
  const _insight = {
    title: 'Tu factura de agua',
    text: esEficiente
      ? `Gastás **${lppd} L por persona/día**, por debajo del referente de la OMS (**100 L**): consumo eficiente. Te sale unos **$${Math.round(costoMensual).toLocaleString('es-AR')}/mes**.`
      : esAlto
        ? `Cada persona usa **${lppd} L/día**, muy por encima de los **100 L** de la OMS. Bajar la ducha unos minutos recorta el rubro más pesado y el gasto de **$${Math.round(costoMensual).toLocaleString('es-AR')}/mes**.`
        : `Cada persona consume **${lppd} L/día** (~$${Math.round(costoMensual).toLocaleString('es-AR')}/mes en total). Estás cerca del promedio de la OMS de **100 L**.`,
    tone: esEficiente ? 'good' : esAlto ? 'warn' : 'neutral',
    icon: esAlto ? '🚱' : '💧'
  };

  // Donut: componentes que suman el consumo diario
  const sDucha = Math.round(litrosDucha);
  const sInodoro = Math.round(litrosInodoro);
  const sCocina = Math.round(litrosCocina);
  const sLavado = Math.round(litrosLavado);
  const sOtros = Math.round(litrosOtros);
  const sliceTotal = sDucha + sInodoro + sCocina + sLavado + sOtros;
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Ducha', value: sDucha },
      { label: 'Inodoro', value: sInodoro },
      { label: 'Cocina', value: sCocina },
      { label: 'Lavado ropa', value: sLavado },
      { label: 'Otros', value: sOtros },
    ].filter(s => s.value > 0),
    prefix: '',
    centerValue: `${sliceTotal.toLocaleString('es-AR')} L`,
    centerLabel: 'por día',
    ariaLabel: `Composición del consumo diario de agua: ${sliceTotal} litros por día`
  };

  return {
    consumoMensualLitros: `${Math.round(mensual).toLocaleString('es-AR')} litros (${m3.toFixed(1)} m3)`,
    consumoDiarioLitros: `${Math.round(diario).toLocaleString('es-AR')} litros/día`,
    costoMensual: Math.round(costoMensual),
    litrosPorPersona: `${lppd} litros/persona/día`,
    _insight,
    _chart,
  };
}
