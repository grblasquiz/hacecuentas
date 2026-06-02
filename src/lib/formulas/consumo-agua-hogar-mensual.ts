/** Consumo de agua doméstico mensual según hábitos del hogar */
export interface Inputs {
  habitantes: number;
  duchasPorDiaPorPersona?: number;
  minutosPorDucha?: number;
  cargasLavarropas?: number;
  usosInodoroPorPersona?: number;
  riegoLitrosDia?: number;
  tipoDucha?: string;
}
export interface Outputs {
  consumoDiarioLitros: number;
  consumoMensualLitros: number;
  consumoMensualM3: number;
  litrosPorPersonaDia: number;
  categoria: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function consumoAguaHogarMensual(i: Inputs): Outputs {
  const h = Number(i.habitantes);
  const duchasDia = Number(i.duchasPorDiaPorPersona) || 1;
  const minDucha = Number(i.minutosPorDucha) || 8;
  const cargasLav = Number(i.cargasLavarropas) || 4;
  const inodoros = Number(i.usosInodoroPorPersona) || 5;
  const riego = Number(i.riegoLitrosDia) || 0;
  const tipoDucha = String(i.tipoDucha || 'normal');

  if (!h || h <= 0) throw new Error('Ingresá la cantidad de habitantes (al menos 1)');
  if (minDucha < 0 || minDucha > 60) throw new Error('Los minutos de ducha deben estar entre 0 y 60');

  // Caudal ducha: normal 12 L/min, economizadora 6 L/min
  const caudalDucha = tipoDucha === 'economizadora' ? 6 : 12;

  // Consumo diario por persona
  const duchaDiaPersona = duchasDia * minDucha * caudalDucha;
  const inodoroDiaPersona = inodoros * 9; // 9 L/descarga promedio
  const lavaplatosDia = 8; // litros/persona en lavado manual/cocina
  const higieneDia = 10; // lavado manos, cepillado, etc.
  const totalPersonaDia = duchaDiaPersona + inodoroDiaPersona + lavaplatosDia + higieneDia;

  // Lavarropas 70 L/carga (carga frontal moderna)
  const lavarropasSemanales = cargasLav * 70;
  const lavarropasDia = lavarropasSemanales / 7;

  const consumoDiarioLitros = totalPersonaDia * h + lavarropasDia + riego;
  const consumoMensualLitros = consumoDiarioLitros * 30;
  const consumoMensualM3 = consumoMensualLitros / 1000;
  const litrosPorPersonaDia = consumoDiarioLitros / h;

  // OMS: 100 L/persona/día es un consumo razonable
  let categoria = '';
  if (litrosPorPersonaDia < 80) categoria = 'Consumo bajo — muy eficiente';
  else if (litrosPorPersonaDia < 130) categoria = 'Consumo normal';
  else if (litrosPorPersonaDia < 200) categoria = 'Consumo alto';
  else categoria = 'Consumo excesivo — revisá hábitos y fugas';

  const lppd = Math.round(litrosPorPersonaDia);
  const esEficiente = litrosPorPersonaDia < 80;
  const esExcesivo = litrosPorPersonaDia >= 200;
  const _insight = {
    title: 'Tu consumo de agua',
    text: esEficiente
      ? `Tu hogar gasta **${lppd} L por persona/día**, por debajo de los **100 L** que la OMS toma como razonable: muy eficiente.`
      : esExcesivo
        ? `Cada persona consume **${lppd} L/día**, más del doble del referente de la OMS (**100 L**). Revisá fugas y duchas largas: el lavarropas y la ducha suelen ser los rubros más pesados.`
        : `Cada persona usa **${lppd} L/día** (~${consumoMensualM3.toFixed(1)} m³/mes en total). Estás en torno al promedio de la OMS de **100 L**.`,
    tone: esEficiente ? 'good' : esExcesivo ? 'warn' : 'neutral',
    icon: esExcesivo ? '🚱' : '💧'
  };

  // Donut: componentes que suman el consumo diario total
  const sDucha = Math.round(duchaDiaPersona * h);
  const sInodoro = Math.round(inodoroDiaPersona * h);
  const sCocina = Math.round(lavaplatosDia * h);
  const sHigiene = Math.round(higieneDia * h);
  const sLav = Math.round(lavarropasDia);
  const sRiego = Math.round(riego);
  const sliceTotal = sDucha + sInodoro + sCocina + sHigiene + sLav + sRiego;
  const slices = [
    { label: 'Ducha', value: sDucha },
    { label: 'Inodoro', value: sInodoro },
    { label: 'Cocina/vajilla', value: sCocina },
    { label: 'Higiene', value: sHigiene },
    { label: 'Lavarropas', value: sLav },
  ];
  if (sRiego > 0) slices.push({ label: 'Riego', value: sRiego });
  const _chart = {
    type: 'doughnut',
    slices: slices.filter(s => s.value > 0),
    prefix: '',
    centerValue: `${sliceTotal.toLocaleString('es-AR')} L`,
    centerLabel: 'por día',
    ariaLabel: `Composición del consumo diario de agua: ${sliceTotal} litros por día`
  };

  return {
    consumoDiarioLitros: Math.round(consumoDiarioLitros),
    consumoMensualLitros: Math.round(consumoMensualLitros),
    consumoMensualM3: Number(consumoMensualM3.toFixed(2)),
    litrosPorPersonaDia: lppd,
    categoria,
    resumen: `Tu hogar consume ~${consumoMensualM3.toFixed(1)} m³ por mes (${lppd} L por persona/día). ${categoria}.`,
    _insight,
    _chart,
  };
}
