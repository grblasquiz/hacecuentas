/** Presupuesto diario mochilero por ciudad */
export interface MochileroCiudadInputs {
  ciudad?: string;
  dias: number;
  nivelGasto?: string;
}
export interface MochileroCiudadOutputs {
  gastoDiario: number;
  gastoTotal: number;
  desglose: string;
  detalle: string;
}

interface CiudadInfo {
  nombre: string;
  hostel: number;
  comida: number;
  transporte: number;
  actividades: number;
}

// Precios base "mochilero cómodo" en USD/día
const CIUDADES: Record<string, CiudadInfo> = {
  bangkok: { nombre: 'Bangkok', hostel: 10, comida: 10, transporte: 3, actividades: 5 },
  hanoi: { nombre: 'Hanoi', hostel: 8, comida: 8, transporte: 2, actividades: 4 },
  bali: { nombre: 'Bali', hostel: 12, comida: 10, transporte: 5, actividades: 6 },
  delhi: { nombre: 'Delhi', hostel: 7, comida: 6, transporte: 2, actividades: 4 },
  bogota: { nombre: 'Bogotá', hostel: 12, comida: 10, transporte: 3, actividades: 5 },
  cusco: { nombre: 'Cusco', hostel: 10, comida: 8, transporte: 2, actividades: 8 },
  ciudadmexico: { nombre: 'Ciudad de México', hostel: 12, comida: 10, transporte: 2, actividades: 5 },
  praga: { nombre: 'Praga', hostel: 15, comida: 12, transporte: 4, actividades: 6 },
  budapest: { nombre: 'Budapest', hostel: 13, comida: 10, transporte: 3, actividades: 6 },
  lisboa: { nombre: 'Lisboa', hostel: 20, comida: 15, transporte: 4, actividades: 7 },
  barcelona: { nombre: 'Barcelona', hostel: 25, comida: 18, transporte: 5, actividades: 8 },
  paris: { nombre: 'París', hostel: 30, comida: 22, transporte: 6, actividades: 10 },
  berlin: { nombre: 'Berlín', hostel: 22, comida: 15, transporte: 5, actividades: 7 },
  roma: { nombre: 'Roma', hostel: 25, comida: 18, transporte: 4, actividades: 8 },
  londres: { nombre: 'Londres', hostel: 30, comida: 25, transporte: 8, actividades: 10 },
  nyc: { nombre: 'Nueva York', hostel: 35, comida: 25, transporte: 8, actividades: 12 },
  tokyo: { nombre: 'Tokio', hostel: 25, comida: 20, transporte: 7, actividades: 8 },
  bariloche: { nombre: 'Bariloche', hostel: 15, comida: 12, transporte: 4, actividades: 8 },
  riodejaneiro: { nombre: 'Rio de Janeiro', hostel: 12, comida: 10, transporte: 3, actividades: 6 },
};

const MULT_NIVEL: Record<string, number> = {
  ultra: 0.65,
  moderado: 1.0,
  flashpacker: 1.7,
};

export function presupuestoDiarioMochileroCiudad(inputs: MochileroCiudadInputs): MochileroCiudadOutputs {
  const ciudad = String(inputs.ciudad || 'barcelona');
  const dias = Number(inputs.dias);
  const nivel = String(inputs.nivelGasto || 'moderado');

  if (!dias || dias <= 0) throw new Error('Ingresá los días de estadía');
  if (!CIUDADES[ciudad]) throw new Error('Ciudad no disponible');
  if (!MULT_NIVEL[nivel]) throw new Error('Nivel de gasto no válido');

  const c = CIUDADES[ciudad];
  const mult = MULT_NIVEL[nivel];

  const hostel = Number((c.hostel * mult).toFixed(0));
  const comida = Number((c.comida * mult).toFixed(0));
  const transporte = Number((c.transporte * mult).toFixed(0));
  const actividades = Number((c.actividades * mult).toFixed(0));
  const gastoDiario = hostel + comida + transporte + actividades;
  const gastoTotal = gastoDiario * dias;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    gastoDiario,
    gastoTotal,
    desglose: `Hostel: USD ${fmt.format(hostel)} | Comida: USD ${fmt.format(comida)} | Transporte: USD ${fmt.format(transporte)} | Actividades: USD ${fmt.format(actividades)}`,
    detalle: `${c.nombre}, ${dias} días, nivel ${nivel}: USD ${fmt.format(gastoDiario)}/día × ${dias} = USD ${fmt.format(gastoTotal)} total (sin pasaje aéreo ni seguro).`,
  };
}
