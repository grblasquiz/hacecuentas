/**
 * Cuántos árboles plantar para compensar emisiones de CO2.
 *
 * Cálculo: arboles = kg_CO2_a_compensar / absorción_kg_por_árbol_por_año
 *
 * La absorción varía fuertemente por especie:
 *   - Paulownia (árbol de crecimiento rápido): 40 kg CO2/año
 *   - Eucalipto: 35 kg/año
 *   - Ceibo / jacarandá / ficus (nativos AR): 22–28 kg/año
 *   - Roble, cedro (crecimiento lento): 15–22 kg/año
 *   - Nativo promedio mixto: ~22 kg/año
 *
 * Densidad de plantación: ~400 árboles/ha en forestación comercial;
 * ~1100 árboles/ha en plantaciones densas de rápido crecimiento.
 *
 * Años para madurar (llegar a absorción plena): 8–20 según especie.
 */

export interface Inputs {
  toneladasCO2: number;
  /** Absorción manual (kg/árbol/año). Si viene, prevalece sobre `especie`. */
  absorcionArbol?: number;
  /** Slug de especie para usar preset. */
  especie?: string;
}

export interface Outputs {
  arbolesNecesarios: number;
  hectareas: number;
  aniosParaMadurar: number;
  absorcionAplicada: number;
  especieNombre: string;
  detalle: string;
}

const ESPECIES: Record<string, { nombre: string; absorcion: number; anios: number; densidad: number }> = {
  paulownia:  { nombre: 'Paulownia',          absorcion: 40, anios: 8,  densidad: 1100 },
  eucalipto:  { nombre: 'Eucalipto',          absorcion: 35, anios: 10, densidad: 1100 },
  pino:       { nombre: 'Pino',               absorcion: 30, anios: 15, densidad: 1000 },
  ceibo:      { nombre: 'Ceibo (nativo AR)',  absorcion: 25, anios: 12, densidad: 400 },
  jacaranda:  { nombre: 'Jacarandá',          absorcion: 24, anios: 12, densidad: 400 },
  ficus:      { nombre: 'Ficus',              absorcion: 22, anios: 10, densidad: 400 },
  'mixto-nativo': { nombre: 'Mixto nativo promedio', absorcion: 22, anios: 12, densidad: 400 },
  roble:      { nombre: 'Roble',              absorcion: 18, anios: 20, densidad: 400 },
  cedro:      { nombre: 'Cedro',              absorcion: 15, anios: 20, densidad: 400 },
};

export function arbolesCompensarCo2Huella(i: Inputs): Outputs {
  const ton = Number(i.toneladasCO2);
  const absorcionManual = Number(i.absorcionArbol);
  const especie = String(i.especie || 'mixto-nativo').toLowerCase();

  if (!ton || ton <= 0) throw new Error('Ingresá las toneladas de CO2 a compensar');

  let absorcion: number;
  let nombreEspecie: string;
  let anios: number;
  let densidad: number;

  if (absorcionManual && absorcionManual > 0) {
    absorcion = absorcionManual;
    const cfg = ESPECIES[especie];
    nombreEspecie = cfg ? `${cfg.nombre} (absorción manual)` : 'Absorción manual';
    anios = cfg?.anios || 12;
    densidad = cfg?.densidad || 400;
  } else if (ESPECIES[especie]) {
    absorcion = ESPECIES[especie].absorcion;
    nombreEspecie = ESPECIES[especie].nombre;
    anios = ESPECIES[especie].anios;
    densidad = ESPECIES[especie].densidad;
  } else {
    throw new Error('Seleccioná una especie o ingresá la absorción manual en kg CO2/árbol/año');
  }

  const kgCO2 = ton * 1000;
  const arboles = Math.ceil(kgCO2 / absorcion);
  const hectareas = arboles / densidad;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    arbolesNecesarios: arboles,
    hectareas: Number(hectareas.toFixed(2)),
    aniosParaMadurar: anios,
    absorcionAplicada: absorcion,
    especieNombre: nombreEspecie,
    detalle: `${nombreEspecie}: ${fmt.format(absorcion)} kg CO₂/árbol/año. ${fmt2.format(ton)} t = ${fmt.format(kgCO2)} kg ÷ ${fmt.format(absorcion)} = ${fmt.format(arboles)} árboles en ~${fmt2.format(hectareas)} ha (densidad ${densidad}/ha). Tardan ~${anios} años en alcanzar absorción plena.`,
  };
}
