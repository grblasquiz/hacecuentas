import type { HubData } from './types';
import { ladrillosM2 } from '../formulas/ladrillos-m2';
import { bloquesM2 } from '../formulas/bloques-m2';
import { adoquinesM2 } from '../formulas/adoquines-m2';
import { alambreCerco } from '../formulas/alambre-cerco';
import { morteroJuntas } from '../formulas/mortero-juntas';
import { cerramientoPerimetroCasaLadrillosCosto } from '../formulas/cerramiento-perimetro-casa-ladrillos-costo';
import { costoMedianeraMuroLindero } from '../formulas/costo-medianera-muro-lindero';

/**
 * Hub de decisión — "¿Cuántos ladrillos necesito?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cuatro ramas: pared de ladrillo común
 * (default), bloques de hormigón, cerco perimetral y piso de adoquines.
 *
 * IMPORTANTE — de dónde salen los rendimientos:
 * NINGUNO está escrito a mano acá. Todos se DERIVAN llamando a las fórmulas
 * reales del repo con superficies unitarias (o de 1.000 m² cuando la fórmula
 * redondea a bolsas enteras, para que el redondeo no contamine el valor por m²):
 *
 *   piezas por m²        → ladrillos-m2.ts · bloques-m2.ts · adoquines-m2.ts
 *   mortero de asiento   → cerramiento-perimetro-casa-ladrillos-costo.ts (1:1:6,
 *                          la única fórmula del repo que reparte cemento, CAL y
 *                          arena, que es lo que pide el gráfico de materiales)
 *   cemento/arena 1:3    → mortero-juntas.ts (receta alternativa, se usa para el
 *                          factor por espesor de junta)
 *   alambre y postes     → alambre-cerco.ts
 *   arena de cama        → adoquines-m2.ts (4 cm de cama)
 *   costo del m² de muro → costo-medianera-muro-lindero.ts (muro terminado, con
 *                          revoque y mano de obra: es el ÚNICO precio con
 *                          respaldo en el repo, no inventamos precios de corralón)
 *
 * Cuando alguien actualice esas fórmulas, este hub se actualiza solo.
 *
 * No pisa a /construccion/costo-por-m2: ese responde cuánto sale la obra
 * completa; éste cuenta el material de una pared, un cerco o un piso.
 */

/** Bolsa de cemento y de cal, tal como se compran en el corralón. */
export const KG_POR_BOLSA = 50;
/** Balde de albañil, para que la arena se pueda pedir en una unidad real. */
export const LITROS_POR_BALDE = 10;

/** Rendimiento de mortero por m² de pared, derivado de la fórmula de cerramiento. */
function morteroDeCerramiento(tipo: string) {
  // Área grande (1.000 m²) para que el `Math.ceil` a bolsas de la fórmula no
  // distorsione el valor unitario: dividimos después.
  const area = 1000;
  const out = cerramientoPerimetroCasaLadrillosCosto({
    perimetro_m: area,
    altura_m: 1,
    vanos_m: 0,
    tipo_ladrillo: tipo,
  });
  const resumen = String(out.resumen || '');
  const bolsasCemento = Number(/Cemento mezcla: ([\d.]+) bolsas/.exec(resumen)?.[1]?.replace(/\./g, '') || 0);
  const bolsasCal = Number(/Cal hidráulica: ([\d.]+) bolsas/.exec(resumen)?.[1]?.replace(/\./g, '') || 0);
  const arena = Number(/Arena gruesa: ([\d.,]+) m³/.exec(resumen)?.[1]?.replace(/\./g, '').replace(',', '.') || 0);
  return {
    cementoKg: (bolsasCemento * KG_POR_BOLSA) / area,
    calKg: (bolsasCal * KG_POR_BOLSA) / area,
    arenaM3: arena / area,
  };
}

const MORTERO_COMUN = morteroDeCerramiento('comun');
const MORTERO_HUECO18 = morteroDeCerramiento('hueco18');
const MORTERO_HUECO8 = morteroDeCerramiento('hueco8');
const MORTERO_BLOQUE = morteroDeCerramiento('bloque');

/** Piezas por m² según la fórmula de ladrillos, sin desperdicio. */
function piezasPorM2(tipo: string) {
  return ladrillosM2({ m2: 1, tipo, desperdicio: 0 }).ladrillosPorM2;
}

/** Cemento por m² de pared de bloques, según la fórmula de bloques. */
function cementoBloque(tipoBloque: string) {
  return bloquesM2({ superficieM2: 1000, tipoBloque, porcentajeDesperdicio: 0 }).morteroKg / 1000;
}

/** Bloques por m², según la fórmula de bloques. */
const BLOQUES_POR_M2 = bloquesM2({ superficieM2: 1000, tipoBloque: '20x20x40', porcentajeDesperdicio: 0 }).cantidadBloques / 1000;

/** Adoquines por m² por tipo, según la fórmula de adoquines. */
function adoquinesPorM2(tipo: string) {
  return adoquinesM2({ area_m2: 1000, tipo_adoquin: tipo, desperdicio_pct: 0 }).adoquines / 1000;
}

/** Arena de cama por m² de adoquinado (4 cm), según la fórmula de adoquines. */
const ARENA_CAMA_M3_M2 = adoquinesM2({ area_m2: 1000, tipo_adoquin: 'rect_10x20', desperdicio_pct: 0 }).arena_m3 / 1000;

/** Cemento y arena por m² con receta 1:3 (mortero-juntas), junta base de 1,5 cm. */
function morteroJuntasUnitario(tipo: string) {
  const o = morteroJuntas({ superficieM2: 1000, tipoLadrillo: tipo, espesorJunta: 1.5 });
  return { cementoKg: o.cementoKg / 1000, arenaM3: o.arenaM3 / 1000 };
}
/** Junta de referencia de las fórmulas de mortero: todo escala contra este espesor. */
export const JUNTA_BASE_CM = 1.5;
export const MORTERO_1A3_COMUN = morteroJuntasUnitario('comun');

/** $/m² de muro TERMINADO (con revoque y mano de obra), desde su fórmula. */
function costoMuroM2(tipoMuro: string) {
  return costoMedianeraMuroLindero({ largoM: 1, alturaM: 1, tipoMuro }).costoTotal;
}
export const COSTO_M2_MURO = {
  comun: costoMuroM2('ladrilloComun'),
  hueco: costoMuroM2('ladrilloHueco'),
  bloque: costoMuroM2('bloqueHormigon'),
};

/** Alambre, postes y rollos por metro de perímetro, desde la fórmula de cerco. */
const _cerco = alambreCerco({ perimetroMetros: 1000, cantidadHilos: 1, postes: 'cada-2.5m' });
export const CERCO = {
  /** Metros de alambre por metro de perímetro y por hilo. */
  metrosPorHilo: _cerco.metrosAlambre / 1000,
  /** Separación de postes usada (m). */
  separacionPostes: 1000 / _cerco.cantidadPostes,
  /** Metros por rollo comercial. */
  metrosPorRollo: 1000,
};

/**
 * Tabla de piezas del hub. `mortero` es kg/m² y m³/m² de mezcla 1:1:6.
 * `muro` mapea al tipo de muro de la fórmula de costo (para el costo terminado).
 */
export const PIEZAS: Record<
  string,
  {
    label: string;
    porM2: number;
    unidad: string;
    familia: 'pared' | 'bloque' | 'adoquin';
    mortero: { cementoKg: number; calKg: number; arenaM3: number };
    muro?: 'comun' | 'hueco' | 'bloque';
  }
> = {
  comun: {
    label: 'Ladrillo común 24×12×6 cm (pared de 12)',
    porM2: piezasPorM2('comun'),
    unidad: 'ladrillos',
    familia: 'pared',
    mortero: MORTERO_COMUN,
    muro: 'comun',
  },
  visto: {
    label: 'Ladrillo visto 24×11×5 cm',
    porM2: piezasPorM2('visto'),
    unidad: 'ladrillos',
    familia: 'pared',
    mortero: MORTERO_COMUN,
    muro: 'comun',
  },
  hueco_18: {
    label: 'Ladrillo hueco 18×18×33 cm (pared de 18)',
    porM2: piezasPorM2('hueco_18'),
    unidad: 'ladrillos',
    familia: 'pared',
    mortero: MORTERO_HUECO18,
    muro: 'hueco',
  },
  hueco_12: {
    label: 'Ladrillo hueco 18×12×33 cm (pared de 12)',
    porM2: piezasPorM2('hueco_12'),
    unidad: 'ladrillos',
    familia: 'pared',
    mortero: MORTERO_HUECO18,
    muro: 'hueco',
  },
  hueco_8: {
    label: 'Ladrillo hueco 8×18×33 cm (tabique)',
    porM2: piezasPorM2('hueco_8'),
    unidad: 'ladrillos',
    familia: 'pared',
    mortero: MORTERO_HUECO8,
    muro: 'hueco',
  },
  bloque_20: {
    label: 'Bloque de hormigón 20×20×40 cm (muro de 20)',
    porM2: BLOQUES_POR_M2,
    unidad: 'bloques',
    familia: 'bloque',
    mortero: { cementoKg: cementoBloque('20x20x40'), calKg: MORTERO_BLOQUE.calKg, arenaM3: MORTERO_BLOQUE.arenaM3 },
    muro: 'bloque',
  },
  bloque_15: {
    label: 'Bloque de hormigón 15×20×40 cm (muro de 15)',
    porM2: BLOQUES_POR_M2,
    unidad: 'bloques',
    familia: 'bloque',
    mortero: { cementoKg: cementoBloque('15x20x40'), calKg: MORTERO_BLOQUE.calKg, arenaM3: MORTERO_BLOQUE.arenaM3 },
    muro: 'bloque',
  },
  bloque_10: {
    label: 'Bloque de hormigón 10×20×40 cm (tabique de 10)',
    porM2: BLOQUES_POR_M2,
    unidad: 'bloques',
    familia: 'bloque',
    mortero: { cementoKg: cementoBloque('10x20x40'), calKg: MORTERO_BLOQUE.calKg, arenaM3: MORTERO_BLOQUE.arenaM3 },
    muro: 'bloque',
  },
  adoquin_rect: {
    label: 'Adoquín rectangular 10×20 cm',
    porM2: adoquinesPorM2('rect_10x20'),
    unidad: 'adoquines',
    familia: 'adoquin',
    mortero: { cementoKg: 0, calKg: 0, arenaM3: ARENA_CAMA_M3_M2 },
  },
  adoquin_cuad: {
    label: 'Adoquín cuadrado 20×20 cm',
    porM2: adoquinesPorM2('cuad_20x20'),
    unidad: 'adoquines',
    familia: 'adoquin',
    mortero: { cementoKg: 0, calKg: 0, arenaM3: ARENA_CAMA_M3_M2 },
  },
  adoquin_hueso: {
    label: 'Adoquín hueso 6×24 cm',
    porM2: adoquinesPorM2('hueso_6x24'),
    unidad: 'adoquines',
    familia: 'adoquin',
    mortero: { cementoKg: 0, calKg: 0, arenaM3: ARENA_CAMA_M3_M2 },
  },
};

/** Pieza por defecto de cada rama, si la elegida no pertenece a esa familia. */
export const PIEZA_POR_RAMA: Record<string, string> = {
  pared: 'comun',
  bloques: 'bloque_20',
  cerco: 'comun',
  adoquines: 'adoquin_rect',
};

/** Zapata corrida 30×30 cm: m³ de hormigón por metro lineal (CIRSOC 101). */
export const CIMIENTO_M3_POR_METRO = 0.09;
/** Un pilar de refuerzo cada 3 m lineales (CIRSOC 101). */
export const METROS_ENTRE_PILARES = 3;

/** Los rendimientos con decimales se muestran con coma: es-AR, no 12.5. */
const nAr = (v: number, d = 1) =>
  v.toLocaleString('es-AR', { maximumFractionDigits: d });
const BLOQUES_M2_TXT = nAr(BLOQUES_POR_M2);

const LADRILLOS_M2_COMUN = PIEZAS.comun.porM2;
const LADRILLOS_M2_HUECO = PIEZAS.hueco_18.porM2;

export const hub: HubData = {
  slug: 'construccion/ladrillos',
  title: '¿Cuántos ladrillos por m² de pared? Común, hueco y bloque',
  description:
    'Calculá cuántos ladrillos, bloques o adoquines necesitás y cuánto cemento, cal y arena lleva el mortero. Pared común, bloques de hormigón, cerco perimetral y piso de adoquines, con la lista para el corralón.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Cómputo de materiales',
  h1: '¿Cuántos ladrillos necesito?',
  lede:
    'Poné el largo y el alto de lo que vas a levantar y te devolvemos la lista para el corralón: piezas, bolsas de cemento, bolsas de cal y baldes de arena, con el desperdicio ya sumado.',
  stamps: [
    'Actualizado 07-08-2026',
    `${LADRILLOS_M2_COMUN} ladrillos comunes/m² · ${LADRILLOS_M2_HUECO} huecos 18/m²`,
    'Mortero 1:1:6 · CIRSOC 101',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Piezas que tenés que comprar',

  cases: {
    title: '¿Qué estás levantando?',
    intro: 'Partimos de la pared de ladrillo común. Si lo tuyo es otra cosa, cambialo.',
    items: [
      {
        id: 'pared',
        label: 'Una pared de ladrillo común',
        hint: 'El caso más común',
        answer: `Una pared de ladrillo común lleva ${LADRILLOS_M2_COMUN} ladrillos por m² de cara vista.`,
        yes: [
          `Ladrillo común de 24×12×6 cm en pared de 12: ${LADRILLOS_M2_COMUN} piezas por m²`,
          'Mortero de asiento 1:1:6 (cemento, cal y arena), medido por m² de pared',
          'Descuento de puertas y ventanas: se restan los m² de los vanos',
          'Un porcentaje de rotura y cortes, que por defecto es del 10%',
          'Zapata corrida de 30×30 cm y un pilar de refuerzo cada 3 metros lineales',
        ],
        warn: [
          'Si la pared es doble (24 cm de espesor) las piezas por m² se duplican: cargá el doble de superficie o elegí el tipo que corresponda',
          'El ladrillo visto lleva más piezas por m² porque es más finito, y la junta se ve: pedí siempre el mismo lote para que no cambie el tono',
          'Los m² son de CARA VISTA, no de superficie de piso',
          'La arena y el cemento del revoque van aparte: acá sólo está el mortero de asiento',
        ],
        plazo:
          'pedí el pallet completo de una sola partida: si tenés que volver al corralón dos semanas después, el tono del ladrillo puede no coincidir.',
      },
      {
        id: 'bloques',
        label: 'Una pared de bloques de hormigón',
        hint: 'Muro de 20, 15 o 10 cm',
        answer: `El bloque de hormigón rinde ${BLOQUES_M2_TXT} unidades por m², bastante menos piezas que el ladrillo.`,
        yes: [
          `Bloque de 20×20×40 cm: ${BLOQUES_M2_TXT} unidades por m² de muro`,
          'Mortero de asiento con menos consumo que el ladrillo común, porque hay menos juntas',
          'El desperdicio típico del bloque es menor: 5% alcanza en obras prolijas',
          'Sirve igual para muro portante, cerco perimetral macizo o tabique interior',
        ],
        warn: [
          'El bloque hueco necesita encadenado y columnas de encadenado: no lo levantes suelto más de 3 m sin refuerzo',
          'Si el muro queda a la vista tenés que sellar las juntas: el bloque sin hidrófugo chupa agua',
          'Los bloques se venden por pallet cerrado, normalmente de 100 o 120 unidades',
        ],
        plazo:
          'el bloque tiene que fraguar al menos 28 días antes de recibir carga estructural: no apures el encadenado.',
      },
      {
        id: 'cerco',
        label: 'Un cerco perimetral de alambre',
        hint: 'Alambrado de campo o quinta',
        answer: 'El alambre sale de multiplicar el perímetro por la cantidad de hilos.',
        yes: [
          'Metros de alambre = perímetro × cantidad de hilos',
          `Postes cada ${CERCO.separacionPostes} metros de perímetro`,
          `Rollos comerciales de ${CERCO.metrosPorRollo} metros: siempre se redondea para arriba`,
          'Sirve para alambrado liso, romboidal con hilos de refuerzo o boyero eléctrico',
        ],
        warn: [
          'Sumá un poste esquinero reforzado por cada vértice del terreno y otro en cada portón',
          'Los esquineros van con puntal o riostra: sin eso el alambre tensado te tuerce el poste al mes',
          'Si el terreno tiene desniveles fuertes vas a necesitar más postes de los que da la cuenta',
        ],
        plazo:
          'tensá el alambre recién cuando los postes lleven 48 horas hormigonados, si no se aflojan solos.',
      },
      {
        id: 'adoquines',
        label: 'Un piso de adoquines',
        hint: 'Vereda, patio o entrada de auto',
        answer: `El adoquín rectangular de 10×20 cm rinde ${PIEZAS.adoquin_rect.porM2} piezas por m² de piso.`,
        yes: [
          `Adoquín rectangular 10×20: ${PIEZAS.adoquin_rect.porM2} piezas por m²`,
          `Cama de arena de 4 cm: ${ARENA_CAMA_M3_M2} m³ de arena por m² de piso`,
          'El desperdicio sube con los cortes: en patios con curvas conviene ir al 10%',
          'Acá los metros son de SUPERFICIE de piso: largo × ancho',
        ],
        warn: [
          'El adoquín no lleva mortero: se asienta sobre arena y se traba entre piezas',
          'Necesitás cordón de contención en todo el perímetro o el piso se desarma solo',
          'Para entrada de auto pedí adoquín de 8 cm de espesor, no el de vereda de 6 cm',
        ],
        plazo:
          'compactá con placa vibratoria y volvé a barrer arena fina sobre las juntas a la semana: siempre baja.',
      },
    ],
  },

  inputsTitle: 'Medí lo que vas a levantar',
  inputsIntro:
    'En paredes y cercos el largo es el desarrollo horizontal; en el piso de adoquines usá largo por ancho. Los vanos de puertas y ventanas se descuentan en m².',
  fields: [
    { id: 'largo', label: 'Largo de la pared o perímetro (m)', type: 'number', min: 0, step: 0.1, value: 10 },
    {
      id: 'altura',
      label: 'Altura de la pared, o ancho del piso en adoquines (m)',
      type: 'number',
      min: 0,
      step: 0.1,
      value: 2.6,
      help: 'En cercos de alambre este campo no se usa.',
    },
    { id: 'vanos', label: 'm² de puertas y ventanas a descontar', type: 'number', min: 0, step: 0.1, value: 0 },
    {
      id: 'pieza',
      label: 'Tipo de pieza',
      type: 'select',
      value: 'comun',
      options: Object.entries(PIEZAS).map(([value, p]) => ({ value, label: p.label })),
    },
    {
      id: 'hilos',
      label: 'Hilos de alambre (solo cerco perimetral)',
      type: 'number',
      min: 1,
      max: 15,
      value: 7,
    },
    { id: 'desperdicio', label: 'Desperdicio y rotura (%)', type: 'number', min: 0, max: 30, value: 10 },
    {
      id: 'junta',
      label: 'Espesor de la junta de mortero (cm)',
      type: 'number',
      min: 0.5,
      max: 3,
      step: 0.1,
      value: JUNTA_BASE_CM,
    },
  ],
  fineprint:
    'Es un cómputo de materiales, no un presupuesto cerrado: no incluye revoque, hidrófugo, encadenados, hierro ni mano de obra. El costo que se muestra es de referencia, de muro terminado, y sale de la misma fórmula que usa la calculadora de medianeras.',

  chart: {
    type: 'donut',
    title: 'Tu lista para el corralón',
    caption:
      'Cada porción es un material de la lista, contado en la unidad con la que se compra: ladrillos sueltos, bolsas de 50 kg de cemento y de cal, y baldes de 10 litros de arena. Los ladrillos se comen casi toda la torta porque son miles de piezas: lo que importa acá es la lista, no la proporción.',
  },
  breakdownTitle: 'Todo lo que tenés que comprar',
  breakdownIntro: 'Las barras comparan cada renglón con el más numeroso, que siempre son las piezas.',

  faq: [
    {
      q: '¿Cuántos ladrillos por m² de pared lleva el común y el hueco?',
      a: `Depende del ladrillo y del espesor de la pared. Un ladrillo común de 24×12×6 cm en pared de 12 rinde <b>${LADRILLOS_M2_COMUN} piezas por m²</b>; el hueco cerámico de 18×18×33 cm, apenas <b>${LADRILLOS_M2_HUECO} por m²</b> porque cada pieza cubre mucha más superficie; el ladrillo visto sube a ${PIEZAS.visto.porM2} por m² y el bloque de hormigón de 20×20×40 baja a ${BLOQUES_M2_TXT}. Por eso el hueco se volvió el estándar de la vivienda argentina: menos piezas, menos juntas y menos horas de albañil.`,
    },
    {
      q: '¿Cuánto cemento, cal y arena lleva el mortero de asiento?',
      a: `Con la mezcla clásica 1:1:6 (una parte de cemento, una de cal y seis de arena), un m² de pared de ladrillo común consume alrededor de <b>${MORTERO_COMUN.cementoKg} kg de cemento</b>, <b>${MORTERO_COMUN.calKg} kg de cal</b> y <b>${MORTERO_COMUN.arenaM3} m³ de arena</b>. Con ladrillo hueco baja a ${MORTERO_HUECO18.cementoKg} kg de cemento y ${MORTERO_HUECO18.arenaM3} m³ de arena por m², porque hay muchas menos juntas que llenar.`,
    },
    {
      q: '¿Cuánto desperdicio de ladrillos tengo que calcular?',
      a: 'Entre un 5% y un 10% según cómo llegue el material y cuántos cortes tenga la obra. El 10% es el número seguro para ladrillo común, que viene con más piezas rotas de fábrica y se corta más. En bloques de hormigón prolijos alcanza con 5%. Si te quedás corto pagás un flete entero por dos pallets, así que conviene errar para arriba.',
    },
    {
      q: '¿Los metros cuadrados son de piso o de pared?',
      a: 'De pared, medidos como cara vista: largo por altura. Es el error más caro del cómputo, porque quien usa los m² de piso de la casa termina comprando la mitad del material que necesita. En el piso de adoquines sí es superficie: largo por ancho.',
    },
    {
      q: '¿Cómo descuento las puertas y las ventanas?',
      a: 'Se restan los m² del vano de la superficie total de la pared. Una puerta estándar ocupa cerca de 1,7 m² y una ventana de 1,20 × 1,10 alrededor de 1,3 m². Ojo: no descuentes los vanos chicos, de menos de 1 m², porque el material que ahorrás se te va en los cortes que tenés que hacer alrededor de la abertura.',
    },
    {
      q: '¿Cuántos bloques de hormigón necesito por m²?',
      a: `El bloque estándar de 20×20×40 cm rinde <b>${BLOQUES_M2_TXT} unidades por m²</b>, igual que el de 15 y el de 10, porque la cara vista es la misma (20×40 cm) y lo que cambia es el espesor del muro. Lo que sí cambia es el mortero: el muro de 20 consume ${PIEZAS.bloque_20.mortero.cementoKg} kg de cemento por m² y el tabique de 10, ${PIEZAS.bloque_10.mortero.cementoKg} kg.`,
    },
    {
      q: '¿Cuánto alambre y cuántos postes lleva un cerco perimetral?',
      a: `Los metros de alambre son el perímetro multiplicado por la cantidad de hilos: un terreno de 100 m de perímetro con 7 hilos consume 700 metros, es decir un rollo comercial de ${CERCO.metrosPorRollo} m. Los postes van cada ${CERCO.separacionPostes} metros, así que ese mismo perímetro lleva ${Math.ceil(100 / CERCO.separacionPostes)} postes, más uno reforzado en cada esquina y en cada portón.`,
    },
    {
      q: '¿Cuántos adoquines entran en un metro cuadrado?',
      a: `El adoquín rectangular de 10×20 cm rinde ${PIEZAS.adoquin_rect.porM2} piezas por m², el cuadrado de 20×20 rinde ${PIEZAS.adoquin_cuad.porM2} y el modelo hueso de 6×24 llega a ${PIEZAS.adoquin_hueso.porM2}. Todos necesitan una cama de arena de 4 cm, que son ${ARENA_CAMA_M3_M2} m³ de arena por m² de piso, y cordón de contención en el perímetro.`,
    },
    {
      q: '¿Qué cimiento necesita una pared o un cerco de ladrillo?',
      a: `Para un cerramiento perimetral la referencia de obra es una zapata corrida de 30×30 cm, que consume <b>${CIMIENTO_M3_POR_METRO} m³ de hormigón por metro lineal</b>, más un pilar de refuerzo cada ${METROS_ENTRE_PILARES} metros según el criterio del reglamento CIRSOC 101. En paredes portantes de una vivienda el cimiento lo tiene que dimensionar el calculista: depende del suelo y de la carga.`,
    },
    {
      q: '¿Cuánto sale el metro cuadrado de pared terminada?',
      a: `Como referencia de mercado, el m² de muro terminado —con mortero, revoque y mano de obra— ronda los $${COSTO_M2_MURO.comun.toLocaleString('es-AR')} en ladrillo común de 15 cm, $${COSTO_M2_MURO.hueco.toLocaleString('es-AR')} en ladrillo hueco de 18 con revoque y $${COSTO_M2_MURO.bloque.toLocaleString('es-AR')} en bloque de hormigón de 20. El cómputo de piezas de este hub es el material solo: la diferencia entre uno y otro número es, básicamente, la mano de obra y el revoque.`,
    },
    {
      q: '¿El espesor de la junta cambia cuánto mortero necesito?',
      a: `Sí, y bastante: el consumo escala en proporción directa al espesor. La junta de referencia es de ${JUNTA_BASE_CM} cm; si trabajás con junta de 2 cm el mortero sube un 33%, y con junta de 1 cm baja un tercio. En ladrillo hueco la junta gruesa además debilita la pared, porque el mortero es menos resistente que la pieza.`,
    },
    {
      q: '¿Conviene ladrillo común o ladrillo hueco?',
      a: 'El hueco es más liviano, aísla mejor por las cámaras de aire, se levanta mucho más rápido y consume menos mortero. El común tiene más masa térmica, aguanta mejor la humedad ascendente y es el que se usa cuando la pared queda a la vista o hay que amurar cargas pesadas. En vivienda económica el hueco gana casi siempre por costo de mano de obra.',
    },
  ],

  sources: [
    {
      name: 'Reglamento CIRSOC 501 — Estructuras de mampostería',
      url: 'https://www.inti.gob.ar/areas/servicios-industriales/construcciones-e-infraestructura/cirsoc',
      publisher: 'INTI · CIRSOC',
    },
    {
      name: 'Norma IRAM 12586 — Ladrillos y bloques cerámicos portantes',
      url: 'https://www.iram.org.ar/',
      publisher: 'IRAM',
    },
    {
      name: 'Índice del Costo de la Construcción (ICC) — capítulo materiales',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-20',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
    {
      name: 'Índice del Costo de la Construcción — Cámara Argentina de la Construcción',
      url: 'https://www.camarco.org.ar/',
      publisher: 'CAMARCO',
      date: 'publicación mensual',
    },
    {
      name: 'Código Civil y Comercial de la Nación — muros medianeros, arts. 2006 a 2036',
      url: 'http://www.saij.gob.ar/nuevo-codigo-civil-comercial-nacion',
      publisher: 'SAIJ · Ministerio de Justicia',
    },
  ],

  replaces: [
    '/calculadora-ladrillos-por-m2-construccion',
    '/calculadora-cantidad-ladrillos-metro-cuadrado-pared',
    '/calculadora-mortero-juntas-ladrillos-m2-pared',
    '/calculadora-bloques-hormigon-por-m2-pared',
    '/calculadora-alambre-cerco-perimetral-metros',
    '/calculadora-adoquines-m2',
    '/calculadora-cerramiento-perimetro-casa-ladrillos-costo',
  ],

  lastReviewed: '2026-08-07',
  audience: 'AR',
};
