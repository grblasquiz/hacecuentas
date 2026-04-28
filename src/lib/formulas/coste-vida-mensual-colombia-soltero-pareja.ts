export interface Inputs {
  ciudad: 'bogota' | 'medellin' | 'cali' | 'barranquilla' | 'bucaramanga' | 'cartagena' | 'santa_marta' | 'manizales' | 'pereira' | 'armenia';
  composicion: 'soltero' | 'pareja' | 'pareja_1hijo' | 'pareja_2hijos' | 'monoparental_1hijo' | 'monoparental_2hijos';
  nivel_vida: 'basico' | 'medio' | 'alto';
  tiene_vehiculo: boolean;
  hijos_privada: boolean;
}

export interface Outputs {
  arriendo_mensual: number;
  alimentacion_mensual: number;
  transporte_mensual: number;
  servicios_mensual: number;
  educacion_mensual: number;
  salud_personal_mensual: number;
  ocio_mensual: number;
  total_mensual: number;
  salario_recomendado: number;
  comparativa_ciudad: number;
}

export function compute(i: Inputs): Outputs {
  // Fuente: DANE 2026, Banco República, encuestas mercado
  // Base: Bogotá nivel medio, soltero sin dependientes

  // Coeficientes ciudad (Bogotá = 1.0)
  const coeficiente_ciudad: Record<string, number> = {
    bogota: 1.0,
    medellin: 0.95,
    cali: 0.70,
    barranquilla: 0.68,
    bucaramanga: 0.65,
    cartagena: 0.72,
    santa_marta: 0.66,
    manizales: 0.69,
    pereira: 0.67,
    armenia: 0.66,
  };

  // Coeficientes composición (base soltero = 1.0)
  const coeficiente_composicion: Record<string, number> = {
    soltero: 1.0,
    pareja: 1.45,
    pareja_1hijo: 1.85,
    pareja_2hijos: 2.25,
    monoparental_1hijo: 1.65,
    monoparental_2hijos: 2.0,
  };

  // Coeficientes nivel vida (medio = 1.0)
  const coeficiente_nivel: Record<string, number> = {
    basico: 0.70,
    medio: 1.0,
    alto: 1.40,
  };

  // Número de dependientes para educación
  const num_hijos: Record<string, number> = {
    soltero: 0,
    pareja: 0,
    pareja_1hijo: 1,
    pareja_2hijos: 2,
    monoparental_1hijo: 1,
    monoparental_2hijos: 2,
  };

  const ciudad_coef = coeficiente_ciudad[i.ciudad];
  const composicion_coef = coeficiente_composicion[i.composicion];
  const nivel_coef = coeficiente_nivel[i.nivel_vida];
  const num_deps = num_hijos[i.composicion];

  // Base mensual Bogotá, soltero, nivel medio (COP 2026)
  const base_arriendo = 2200000; // DANE: aprox apartamento 2 hab
  const base_alimentacion = 1100000;
  const base_transporte = 400000; // TM + buses
  const base_servicios = 380000; // agua, luz, gas, internet
  const base_educacion = 0; // No aplica soltero
  const base_salud_personal = 250000; // medicinas, higiene, peluquería
  const base_ocio = 200000; // cine, cafés, entretenimiento

  // Ajustar por ciudad, composición y nivel
  let arriendo = base_arriendo * ciudad_coef * composicion_coef * nivel_coef;
  let alimentacion = base_alimentacion * ciudad_coef * composicion_coef * nivel_coef;
  let transporte = base_transporte * ciudad_coef * composicion_coef * nivel_coef;
  let servicios = base_servicios * ciudad_coef * composicion_coef * 0.85 * nivel_coef; // servicios básicos economía escala
  let educacion = 0;
  let salud_personal = base_salud_personal * ciudad_coef * composicion_coef * nivel_coef;
  let ocio = base_ocio * ciudad_coef * composicion_coef * nivel_coef;

  // Educación: si hay hijos y privada
  if (i.hijos_privada && num_deps > 0) {
    const costo_por_hijo_privada = 2500000; // promedio colegios privados Bogotá
    educacion = costo_por_hijo_privada * num_deps * ciudad_coef * nivel_coef;
  }

  // Vehículo propio
  if (i.tiene_vehiculo) {
    const gasolina = 500000 * ciudad_coef;
    const seguro = 200000 * ciudad_coef;
    const mantenimiento = 200000 * ciudad_coef;
    const parqueadero = 250000 * ciudad_coef;
    transporte += gasolina + seguro + mantenimiento + parqueadero;
  }

  // Redondear al mil más cercano
  const round_mil = (v: number) => Math.round(v / 1000) * 1000;

  arriendo = round_mil(arriendo);
  alimentacion = round_mil(alimentacion);
  transporte = round_mil(transporte);
  servicios = round_mil(servicios);
  educacion = round_mil(educacion);
  salud_personal = round_mil(salud_personal);
  ocio = round_mil(ocio);

  const total_mensual = arriendo + alimentacion + transporte + servicios + educacion + salud_personal + ocio;

  // Salario recomendado: total / 0.75 (aproxima deducciones EPS 4%, pensión 4%, aporte solidario ~10%)
  const salario_recomendado = round_mil(total_mensual / 0.75);

  // Comparativa vs Bogotá nivel medio, composición base
  const bogota_base_total = (base_arriendo + base_alimentacion + base_transporte + base_servicios + base_salud_personal + base_ocio) * composicion_coef * nivel_coef;
  const comparativa_ciudad = ((total_mensual - bogota_base_total) / bogota_base_total) * 100;

  return {
    arriendo_mensual: Math.round(arriendo),
    alimentacion_mensual: Math.round(alimentacion),
    transporte_mensual: Math.round(transporte),
    servicios_mensual: Math.round(servicios),
    educacion_mensual: Math.round(educacion),
    salud_personal_mensual: Math.round(salud_personal),
    ocio_mensual: Math.round(ocio),
    total_mensual: Math.round(total_mensual),
    salario_recomendado: Math.round(salario_recomendado),
    comparativa_ciudad: Math.round(comparativa_ciudad * 10) / 10,
  };
}
