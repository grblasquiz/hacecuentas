export interface Inputs { ambiente: string; humedadActual: number; }
export interface Outputs { rangoIdeal: string; estado: string; accion: string; riesgo: string; _insight?: any; _chart?: any; }
interface HumData { min: number; max: number; }
const AMB: Record<string, HumData> = {
  dormitorio: { min: 40, max: 60 }, living: { min: 40, max: 55 }, bebe: { min: 45, max: 55 },
  cocina: { min: 40, max: 60 }, bano: { min: 40, max: 65 }, bodega: { min: 30, max: 50 },
};
export function humedadIdealAmbiente(i: Inputs): Outputs {
  const amb = String(i.ambiente || 'dormitorio');
  const actual = Number(i.humedadActual);
  if (!actual) throw new Error('Ingresá la humedad actual');
  const data = AMB[amb]; if (!data) throw new Error('Ambiente no encontrado');
  let estado = ''; let accion = ''; let riesgo = '';
  if (actual < data.min) {
    estado = 'Demasiado seco'; accion = 'Usá humidificador o poné recipientes con agua.';
    riesgo = 'Sequedad en piel, ojos y mucosas. Pisos de madera se agrietan. Mayor electricidad estática.';
  } else if (actual > data.max) {
    estado = 'Demasiado húmedo'; accion = 'Usá deshumidificador o ventilá más. Revisá filtraciones.';
    riesgo = 'Moho, hongos, ácaros, olor a humedad. Daño en paredes y muebles.';
  } else {
    estado = 'Dentro del rango ideal'; accion = 'No necesitás ajustar. Mantené buena ventilación.';
    riesgo = 'Sin riesgo. Condiciones óptimas de confort.';
  }
  const dentro = actual >= data.min && actual <= data.max;
  const tone = dentro ? 'good' : 'warn';
  const icon = dentro ? '✅' : actual < data.min ? '🏜️' : '💦';
  const insight = {
    title: `Humedad ${estado.toLowerCase()}`,
    text: `Con **${actual}%** de humedad, el ambiente está **${estado.toLowerCase()}** frente al rango ideal de **${data.min}–${data.max}%**. ${accion}`,
    tone,
    icon,
  };

  const chart = {
    type: 'scale' as const,
    marker: Math.round(actual),
    markerLabel: `Actual: ${Math.round(actual)}%`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Seco', max: data.min, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Ideal', max: data.max, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Húmedo', max: Math.max(100, Math.ceil(actual) + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de humedad: zona seca, ideal y húmeda para el ambiente elegido',
  };

  return { rangoIdeal: `${data.min}–${data.max}%`, estado, accion, riesgo, _insight: insight, _chart: chart };
}