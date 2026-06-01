/** Árbol frutal: producción anual estimada */
export interface Inputs { especie: string; edadAnios: number; cuidados?: string; }
export interface Outputs { kgAnual: number; estadoArbol: string; epocaCosecha: string; consejo: string; _insight?: any; }

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

  const nombreEsp = especie.charAt(0).toUpperCase() + especie.slice(1);
  const kgFmt = Number(kg.toFixed(1)).toLocaleString('es-AR');
  // A los pocos años todavía no rinde; en plena producción es buena noticia
  const tone = edad <= 2 ? 'warn' : edad < data.edadAdulto ? 'neutral' : 'good';
  const _insight = {
    title: `${nombreEsp} de ${edad} años`,
    text: edad <= 2
      ? `Con **${edad} años** tu ${especie} recién arranca: estimamos apenas **${kgFmt} kg/año**. Recién hacia los ${data.edadAdulto} años llega a producción plena (~${data.kgAdulto} kg con cuidado medio).`
      : edad < data.edadAdulto
      ? `A los **${edad} años** y cuidado ${cuid}, tu ${especie} rinde **~${kgFmt} kg/año** y sigue subiendo hasta los ${data.edadAdulto} años, cuando alcanza su techo (~${data.kgAdulto} kg).`
      : `Tu ${especie} está en **producción plena**: **~${kgFmt} kg/año** con cuidado ${cuid}. La cosecha cae en ${data.cosecha.toLowerCase()}.`,
    tone,
    icon: '🌳',
  };
  return {
    kgAnual: Number(kg.toFixed(1)),
    estadoArbol: estado,
    epocaCosecha: data.cosecha,
    consejo,
    _insight,
  };
}
