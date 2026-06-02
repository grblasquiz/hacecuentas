/** Calcula el consumo real de combustible en L/100km y km/L */
export interface Inputs {
  kmRecorridos: number;
  litrosCargados: number;
}
export interface Outputs {
  consumoL100km: number;
  kmPorLitro: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function consumoNaftaLitros100km(i: Inputs): Outputs {
  const km = Number(i.kmRecorridos);
  const litros = Number(i.litrosCargados);

  if (!km || km <= 0) throw new Error('Ingresá los kilómetros recorridos (mayor a 0)');
  if (!litros || litros <= 0) throw new Error('Ingresá los litros de nafta cargados (mayor a 0)');

  const consumoL100km = (litros / km) * 100;
  const kmPorLitro = km / litros;

  let nivel = '';
  if (consumoL100km < 7) nivel = 'muy eficiente';
  else if (consumoL100km < 10) nivel = 'eficiente';
  else if (consumoL100km < 13) nivel = 'promedio';
  else if (consumoL100km < 16) nivel = 'alto';
  else nivel = 'muy alto';

  const consumoRound = Number(consumoL100km.toFixed(1));
  const kmLRound = Number(kmPorLitro.toFixed(1));
  const tone = consumoL100km < 10 ? 'good' : consumoL100km < 13 ? 'neutral' : 'warn';
  const icon = consumoL100km < 10 ? '⛽' : consumoL100km < 13 ? '🚗' : '🔴';
  const insightText = consumoL100km < 10
    ? `Tu auto rinde **${kmLRound} km/L** (**${consumoRound} L/100km**), un consumo **${nivel}**: estás aprovechando bien cada litro.`
    : consumoL100km < 13
    ? `Tu auto rinde **${kmLRound} km/L** (**${consumoRound} L/100km**), un consumo **${nivel}**. Manejá suave y revisá presión de neumáticos para bajarlo.`
    : `Tu auto consume **${consumoRound} L/100km** (**${kmLRound} km/L**), un nivel **${nivel}**. Conviene revisar filtro de aire, bujías y hábitos de manejo: gastás más nafta de lo esperable.`;

  // El último segmento debe superar el marker para que el gauge lo ubique siempre.
  const ultimoMax = Math.max(20, Math.ceil(consumoL100km) + 2);

  return {
    consumoL100km: consumoRound,
    kmPorLitro: kmLRound,
    detalle: `Tu auto consume ${consumoL100km.toFixed(1)} L/100km (${kmPorLitro.toFixed(1)} km/L). Nivel: ${nivel}. Recorriste ${km} km con ${litros} litros.`,
    _insight: {
      title: 'Tu eficiencia de combustible',
      text: insightText,
      tone,
      icon,
    },
    _chart: {
      type: 'scale',
      marker: consumoRound,
      markerLabel: `${consumoRound} L/100km`,
      min: 0,
      segments: [
        { nombre: 'Muy eficiente', max: 7, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Eficiente', max: 10, color: '#65a30d', colorDark: '#84cc16' },
        { nombre: 'Promedio', max: 13, color: '#ca8a04', colorDark: '#eab308' },
        { nombre: 'Alto', max: 16, color: '#ea580c', colorDark: '#f97316' },
        { nombre: 'Muy alto', max: ultimoMax, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Consumo de ${consumoRound} litros cada 100 km, nivel ${nivel}`,
    },
  };
}
