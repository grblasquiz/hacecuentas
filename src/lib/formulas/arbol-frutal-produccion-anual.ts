/** Árbol frutal: producción anual estimada */
export interface Inputs { especie: string; edadAnios: number; cuidados?: string; }
export interface Outputs { kgAnual: number; estadoArbol: string; epocaCosecha: string; consejo: string; }

interface FrutalData { kgAdulto: number; edadAdulto: number; cosecha: string; }
const FRUTALES: Record<string, FrutalData> = {
  limonero: { kgAdulto: 75, edadAdulto: 8, cosecha: 'Todo el año (pico mayo-agosto)' },
  naranjo: { kgAdulto: 90, edadAdulto: 8, cosecha: 'Junio–Octubre' },
  mandarino: { kgAdulto: 60, edadAdulto: 7, cosecha: 'Abril–Julio' },
  duraznero: { kgAdulto: 45, edadAdulto: 5, cosecha: 'Diciembre–Febrero' },
  manzano: { kgAdulto: 60, edadAdulto: 6, cosecha: 'Febrero–Abril' },
  peral: { kgAdulto: 50, edadAdulto: 6, cosecha: 'Enero–Marzo' },
  ciruelo: { kgAdulto: 40, edadAdulto: 4, cosecha: 'Diciembre–Febrero' },
  higuera: { kgAdulto: 35, edadAdulto: 5, cosecha: 'Enero–Marzo (brevas dic)' },
  vid: { kgAdulto: 15, edadAdulto: 4, cosecha: 'Febrero–Abril' },
  olivo: { kgAdulto: 30, edadAdulto: 8, cosecha: 'Abril–Junio' },
  nogal: { kgAdulto: 40, edadAdulto: 10, cosecha: 'Marzo–Mayo' },
  aguacate: { kgAdulto: 50, edadAdulto: 6, cosecha: 'Mayo–Septiembre' },
};
const FACTOR_CUID: Record<string, number> = { bajo: 0.5, medio: 0.8, alto: 1.1 };

export function arbolFrutalProduccionAnual(i: Inputs): Outputs {
  const especie = String(i.especie || 'limonero');
  const edad = Number(i.edadAnios);
  const cuid = String(i.cuidados || 'medio');
  if (!edad || edad <= 0) throw new Error('Ingresá la edad del árbol');
  const data = FRUTALES[especie];
  if (!data) throw new Error('Especie no encontrada');

  let factorEdad = 0;
  if (edad <= 2) factorEdad = 0.05;
  else if (edad <= 3) factorEdad = 0.15;
  else if (edad <= 4) factorEdad = 0.3;
  else if (edad < data.edadAdulto) factorEdad = 0.3 + 0.7 * ((edad - 4) / (data.edadAdulto - 4));
  else factorEdad = 1;

  const fc = FACTOR_CUID[cuid] || 0.8;
  const kg = data.kgAdulto * factorEdad * fc;

  let estado = '';
  if (edad <= 2) estado = 'Juvenil — todavía no produce fruta significativa';
  else if (edad < data.edadAdulto) estado = 'En crecimiento — producción parcial, aumenta cada año';
  else estado = 'Adulto — producción plena';

  const consejo = edad <= 2
    ? 'Priorizá la formación de estructura con poda de formación. No esperes fruta todavía.'
    : edad < data.edadAdulto
    ? 'El árbol está entrando en producción. Fertilizá en primavera y podá en invierno.'
    : 'Producción plena. Hacé poda de mantenimiento anual y raleo de frutos si produce en exceso.';

  return {
    kgAnual: Number(kg.toFixed(1)),
    estadoArbol: estado,
    epocaCosecha: data.cosecha,
    consejo,
  };
}
