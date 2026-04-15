/** Tiempo de cocción y remojo de legumbres */
export interface Inputs {
  legumbre: string;
  metodo?: string;
  gramosSeco?: number;
}
export interface Outputs {
  tiempoRemojo: string;
  tiempoCoccion: string;
  aguaLitros: string;
  rendimiento: string;
  detalle: string;
}

interface DatoLegumbre {
  nombre: string;
  remojoHs: string;
  coccionMin: [number, number]; // olla comun [min, max]
  presionMin: [number, number]; // olla presion [min, max]
  factorRendimiento: number;
  factorAgua: number;
}

export function tiempoCoccionLegumbresRemojo(i: Inputs): Outputs {
  const legumbre = i.legumbre;
  const metodo = i.metodo || 'olla_comun';
  const gramos = Number(i.gramosSeco) || 250;

  if (!legumbre) throw new Error('Seleccioná una legumbre');

  const datos: Record<string, DatoLegumbre> = {
    lenteja: { nombre: 'Lentejas', remojoHs: 'No necesitan (opcional 2-4 hs)', coccionMin: [20, 30], presionMin: [8, 12], factorRendimiento: 2.0, factorAgua: 3 },
    garbanzo: { nombre: 'Garbanzos', remojoHs: '8-12 horas', coccionMin: [60, 90], presionMin: [20, 30], factorRendimiento: 2.3, factorAgua: 3 },
    poroto_negro: { nombre: 'Porotos negros', remojoHs: '8-12 horas', coccionMin: [60, 90], presionMin: [20, 25], factorRendimiento: 2.5, factorAgua: 3 },
    poroto_blanco: { nombre: 'Porotos blancos', remojoHs: '8-12 horas', coccionMin: [60, 80], presionMin: [20, 25], factorRendimiento: 2.5, factorAgua: 3 },
    poroto_colorado: { nombre: 'Porotos colorados', remojoHs: '8-12 horas', coccionMin: [60, 90], presionMin: [20, 30], factorRendimiento: 2.5, factorAgua: 3 },
    arveja_seca: { nombre: 'Arvejas secas', remojoHs: '4-8 horas', coccionMin: [40, 60], presionMin: [15, 20], factorRendimiento: 2.0, factorAgua: 3 },
    haba_seca: { nombre: 'Habas secas', remojoHs: '8-12 horas', coccionMin: [45, 60], presionMin: [15, 20], factorRendimiento: 2.2, factorAgua: 3 },
    soja: { nombre: 'Soja', remojoHs: '12-24 horas', coccionMin: [90, 120], presionMin: [30, 40], factorRendimiento: 2.5, factorAgua: 3 },
  };

  const dato = datos[legumbre];
  if (!dato) throw new Error('Legumbre no encontrada');

  const [minC, maxC] = metodo === 'olla_presion' ? dato.presionMin : dato.coccionMin;
  const aguaMl = gramos * dato.factorAgua;
  const litros = aguaMl / 1000;
  const rendimiento = Math.round(gramos * dato.factorRendimiento);

  const metodoNombre = metodo === 'olla_presion' ? 'olla a presión' : 'olla común';

  return {
    tiempoRemojo: dato.remojoHs,
    tiempoCoccion: `${minC}-${maxC} minutos (${metodoNombre})`,
    aguaLitros: `${litros.toFixed(1)} litros (${aguaMl} ml)`,
    rendimiento: `${gramos} g secos → ~${rendimiento} g cocidos (×${dato.factorRendimiento})`,
    detalle: `${dato.nombre}: remojo ${dato.remojoHs}, cocción ${minC}-${maxC} min en ${metodoNombre}. Para ${gramos} g: usar ${litros.toFixed(1)} L de agua. Rinde ~${rendimiento} g cocidos.`,
  };
}
