export interface Inputs { ambiente: string; humedadActual: number; }
export interface Outputs { rangoIdeal: string; estado: string; accion: string; riesgo: string; }
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
  return { rangoIdeal: `${data.min}–${data.max}%`, estado, accion, riesgo };
}