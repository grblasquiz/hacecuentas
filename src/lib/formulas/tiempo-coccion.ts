/** Tiempo y temperatura de cocción por carne/corte/peso */
export interface Inputs {
  carne: string;
  pesoKg: number;
  coccion?: string; // punto
}
export interface Outputs {
  tiempoTotalMin: number;
  tempHorno: number;
  tempInterna: number;
  metodo: string;
  notas: string;
  _insight?: any;
}

/**
 * MÍNIMOS DE SEGURIDAD ALIMENTARIA (USDA-FSIS, "Safe Minimum Internal Temperature Chart").
 * Son PISOS sanitarios, no puntos de cocción:
 *   - Aves (pollo, pavo/pavita), enteras, en presas o molidas: 74 °C (165 °F). SIN excepción y SIN reposo.
 *   - Carne molida de vaca/cerdo/cordero/ternera: 71 °C (160 °F).
 *   - Cortes enteros de vaca/cerdo/cordero/ternera (bifes, chuletas, roasts): 63 °C (145 °F) + 3 min de reposo.
 *   - Pescado y mariscos: 63 °C (145 °F).
 * Distinción usada en este archivo y en `temperatura-carne.ts` (criterio unificado):
 *   - "jugoso"/"medio" = PUNTO DE COCCIÓN culinario. Por debajo de 63 °C en cortes enteros
 *     es práctica de cocina, NO cumple el mínimo USDA (ver AVISO_SUBMINIMO).
 *   - "bien" (bien cocido) = 71 °C, que además coincide con el mínimo de carne molida.
 *     No se usa 74 °C para vaca/cerdo/cordero: 74 °C es el mínimo de AVES, no de carne roja.
 * Fuente: https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart
 */
const MIN_USDA_AVE = 74;
const MIN_USDA_CORTE_ENTERO = 63;
const AVISO_SUBMINIMO =
  'Por debajo de 63 °C internos es un punto de cocción culinario, no el mínimo de seguridad de USDA-FSIS (63 °C + 3 min de reposo en cortes enteros). Evitalo en embarazo, niños chicos, mayores o personas inmunocomprometidas.';

type Carne = {
  nombre: string;
  minPorKg: Record<string, number>; // rare, medium, well
  tempHorno: number;
  tempInterna: Record<string, number>;
  metodo: string;
  notas: string;
};

const CARNES: Record<string, Carne> = {
  pollo_entero: {
    nombre: 'Pollo entero',
    minPorKg: { bien: 60, medio: 60, jugoso: 60 }, // pollo siempre bien cocido
    tempHorno: 180,
    tempInterna: { bien: 74, medio: 74, jugoso: 74 },
    metodo: 'Horno estándar, espalda hacia arriba las últimas 15 min para dorar.',
    notas: '74 °C internos en pechuga. Reposar 10 min antes de trinchar.',
  },
  pollo_pechuga: {
    nombre: 'Pechuga de pollo',
    minPorKg: { bien: 25, medio: 25, jugoso: 25 },
    tempHorno: 200,
    // 74 °C es el mínimo USDA-FSIS para TODA ave, también la pechuga. No existe "pollo a punto".
    tempInterna: { bien: 74, medio: 74, jugoso: 74 },
    metodo: 'Horno 200 °C. Sellar en sartén antes para dorar.',
    notas: '74 °C internos mínimo (USDA-FSIS), medidos en la parte más gruesa. Para que no quede seca, controlá con termómetro y retirala apenas llega a 74 °C: no le sirve más tiempo, le sirve no pasarse.',
  },
  peceto: {
    nombre: 'Peceto',
    minPorKg: { jugoso: 20, medio: 30, bien: 45 },
    tempHorno: 200,
    tempInterna: { jugoso: 55, medio: 63, bien: 71 },
    metodo: 'Sellar por todas las caras, luego horno.',
    notas: 'Corte magro, no excederse. Cortar contra la fibra.',
  },
  bife_ancho: {
    nombre: 'Bife ancho / Asado',
    minPorKg: { jugoso: 25, medio: 35, bien: 50 },
    tempHorno: 180,
    tempInterna: { jugoso: 55, medio: 63, bien: 71 },
    metodo: 'Horno o parrilla lenta + alta al final.',
    notas: 'Ideal parrilla: 30-40 min/kg según grosor. Reposar 10 min.',
  },
  colita_cuadril: {
    nombre: 'Colita de cuadril',
    minPorKg: { jugoso: 30, medio: 40, bien: 55 },
    tempHorno: 200,
    tempInterna: { jugoso: 55, medio: 63, bien: 71 },
    metodo: 'Horno 200 °C o parrilla. Dorar antes por lado graso.',
    notas: 'Cortar contra la fibra en bastones finos.',
  },
  matambre: {
    nombre: 'Matambre de novillo',
    minPorKg: { bien: 180, medio: 180, jugoso: 180 },
    tempHorno: 150,
    tempInterna: { bien: 85, medio: 85, jugoso: 85 },
    metodo: 'Cocción lenta (150 °C × 3 hs) o a la parrilla 1.5-2 hs.',
    notas: 'Duro si no cocinás lo suficiente. Mejor a olla con caldo por 2 hs.',
  },
  cerdo_lomo: {
    nombre: 'Lomo de cerdo',
    minPorKg: { medio: 35, bien: 50, jugoso: 30 },
    tempHorno: 180,
    // 63 °C es el piso USDA para cortes enteros de cerdo: no se baja de ahí ni en "jugoso".
    tempInterna: { medio: 65, bien: 71, jugoso: 63 },
    metodo: 'Horno 180 °C. Sellar previo. Glaseado en últimos 15 min.',
    notas: 'Mínimo 63 °C internos + 3 min de reposo (USDA-FSIS). Punto medio: 65 °C. Reposar 10 min.',
  },
  pescado_filete: {
    nombre: 'Filete de pescado (salmón, merluza)',
    minPorKg: { bien: 15, medio: 12, jugoso: 10 },
    tempHorno: 200,
    tempInterna: { bien: 63, medio: 55, jugoso: 50 },
    metodo: 'Horno 200 °C o sartén. 1 min × cm de espesor x cara.',
    notas: 'Pescado gordo (salmón) soporta punto medio. Blanco mejor bien hecho.',
  },
  cordero_pierna: {
    nombre: 'Pierna de cordero',
    minPorKg: { jugoso: 35, medio: 45, bien: 55 },
    tempHorno: 180,
    tempInterna: { jugoso: 57, medio: 63, bien: 71 },
    metodo: 'Horno lento con romero, ajo, limón. Dorar con fuego alto al final.',
    notas: 'Reposar 15 min antes de servir.',
  },
  pavita: {
    nombre: 'Pavita (pechuga o muslo)',
    minPorKg: { bien: 40, medio: 40, jugoso: 40 },
    tempHorno: 180,
    tempInterna: { bien: 74, medio: 74, jugoso: 74 },
    metodo: 'Horno 180 °C con caldo abajo. 74 °C internos obligatorios.',
    notas: 'Como pollo, nunca medio. Jugosa con mantequilla bajo la piel.',
  },
};

export function tiempoCoccion(i: Inputs): Outputs {
  const carne = String(i.carne || 'pollo_entero');
  const peso = Number(i.pesoKg);
  const coccion = String(i.coccion || 'medio');
  if (!peso || peso <= 0) throw new Error('Ingresá el peso en kg');
  if (!CARNES[carne]) throw new Error('Carne no reconocida');

  const c = CARNES[carne];
  const min = (c.minPorKg[coccion] || c.minPorKg['medio'] || 40) * peso;
  const esAve = ['pollo_entero', 'pollo_pechuga', 'pavita'].includes(carne);
  let tempInt = c.tempInterna[coccion] || c.tempInterna['medio'] || MIN_USDA_CORTE_ENTERO;
  // Red de seguridad: ninguna ave puede salir por debajo de 74 °C, pase lo que pase con la tabla.
  if (esAve) tempInt = Math.max(tempInt, MIN_USDA_AVE);
  const bajoMinimoUSDA = !esAve && tempInt < MIN_USDA_CORTE_ENTERO;
  const notas = bajoMinimoUSDA ? `${c.notas} ${AVISO_SUBMINIMO}` : c.notas;
  const minTotal = Math.round(min);
  const horas = Math.floor(minTotal / 60);
  const resto = minTotal % 60;
  const tiempoTxt = horas > 0 ? `${horas} h ${resto} min` : `${minTotal} min`;

  return {
    tiempoTotalMin: minTotal,
    tempHorno: c.tempHorno,
    tempInterna: tempInt,
    metodo: c.metodo,
    notas,
    _insight: {
      title: esAve ? 'Cocción segura' : bajoMinimoUSDA ? 'Punto de cocción (bajo el mínimo USDA)' : 'Punto de cocción',
      text: esAve
        ? `**${c.nombre}** de ${peso} kg necesita unos **${tiempoTxt}** a ${c.tempHorno} °C. Clave de seguridad: **${MIN_USDA_AVE} °C internos como mínimo** (USDA-FSIS, mínimo para toda ave, sin excepciones y sin tiempo de reposo). Medí en la parte más gruesa, sin tocar el hueso: por debajo de 74 °C puede sobrevivir la salmonella.`
        : bajoMinimoUSDA
          ? `**${c.nombre}** de ${peso} kg a punto ${coccion}: unos **${tiempoTxt}** de horno a ${c.tempHorno} °C, retirando a **${tempInt} °C internos**. Ojo: ${AVISO_SUBMINIMO}`
          : `**${c.nombre}** de ${peso} kg a punto ${coccion}: unos **${tiempoTxt}** de horno a ${c.tempHorno} °C, retirando a **${tempInt} °C internos** (mínimo USDA para cortes enteros: ${MIN_USDA_CORTE_ENTERO} °C + 3 min de reposo). Dejá reposar antes de cortar.`,
      tone: esAve || bajoMinimoUSDA ? 'warn' : 'neutral',
      icon: esAve ? '🍗' : '🥩'
    },
  };
}
