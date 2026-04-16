export interface Inputs { plaga: string; zona?: string; }
export interface Outputs { frecuencia: string; metodo: string; prevencion: string; costo: string; }
interface PlagaData { freq: string; metodo: string; prev: string; costo: string; }
const PLAGAS: Record<string, PlagaData> = {
  cucarachas: { freq: 'Cada 3–4 meses', metodo: 'Gel insecticida en grietas + aspersión perimetral', prev: 'Sellá grietas, no dejés comida expuesta, limpiá grasitud de cocina.', costo: '$15.000–$25.000 ARS por servicio (2 ambientes)' },
  hormigas: { freq: 'Cada 4–6 meses (o al detectar)', metodo: 'Cebo hormiguicida en senderos + aspersión exterior', prev: 'Sellá ingresos, no dejés azúcar/miel destapados, poné cebo preventivo.', costo: '$10.000–$20.000 ARS' },
  mosquitos: { freq: 'Mensual en temporada (octubre–abril)', metodo: 'Fumigación exterior con nebulizadora + larvicida en agua estancada', prev: 'Eliminá agua estancada, usá repelente, colocá mosquiteros.', costo: '$8.000–$15.000 ARS por servicio' },
  ratas: { freq: 'Cada 3 meses (trampeo y cebadero)', metodo: 'Cebaderos con rodenticida + sellado de accesos', prev: 'Sellá aberturas >1cm, no dejés basura abierta, cortá pasto.', costo: '$20.000–$40.000 ARS por servicio' },
  aranas: { freq: 'Cada 6 meses', metodo: 'Aspersión residual en rincones, cielos rasos y exterior', prev: 'Sacudir ropa/zapatos antes de usar, limpiá telas de araña, iluminación amarilla.', costo: '$12.000–$20.000 ARS' },
  polillas: { freq: 'Al detectar + preventivo cada 6 meses', metodo: 'Trampas con feromona + lavado de ropa a 60°C', prev: 'Guardá ropa limpia, usá bolsas herméticas, colocá cedro o lavanda.', costo: '$10.000–$18.000 ARS' },
};
const FACTOR_ZONA: Record<string, number> = { urbana: 1, suburbana: 1.3, rural: 1.5 };
export function fumigacionFrecuenciaHogar(i: Inputs): Outputs {
  const plaga = String(i.plaga || 'cucarachas');
  const data = PLAGAS[plaga]; if (!data) throw new Error('Plaga no encontrada');
  return { frecuencia: data.freq, metodo: data.metodo, prevencion: data.prev, costo: data.costo };
}