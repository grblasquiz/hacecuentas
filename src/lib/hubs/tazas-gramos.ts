import type { HubData } from './types';
import { compute as medidasCocina } from '../formulas/conversion-medidas-cocina-tazas-gramos';
import { conversionCupsGramosHarinaAzucarAceite } from '../formulas/conversion-cups-gramos-harina-azucar-aceite';
import { tazasGramos } from '../formulas/tazas-gramos';
import { conversionCucharaditasGramosEspeciasSal } from '../formulas/conversion-cucharaditas-gramos-especias-sal';
import { conversionCucharadasCucharaditasMl } from '../formulas/conversion-cucharadas-cucharaditas-ml';
import { conversorTazasAMililitros } from '../formulas/conversor-tazas-a-mililitros';
import { conversionPesoVolumen } from '../formulas/conversion-peso-volumen';
import { equivalenciaHuevosTamanoGramosClaras } from '../formulas/equivalencia-huevos-tamano-gramos-claras';

/**
 * Hub de decisión — "¿Cuántos gramos es una taza?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cuatro ramas, y la rama NO es cosmética:
 * define cuántos mililitros tiene la taza con la que estás midiendo.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * EL NUDO: la taza no es una unidad universal, y las calculadoras viejas
 * NO se ponían de acuerdo. Contradicciones reales encontradas en el repo:
 *
 *  Volumen de la taza
 *    conversion-medidas-cocina-tazas-gramos.ts .... 240 ml
 *    conversion-cups-gramos-harina-azucar-aceite.ts 240 ml
 *    tazas-gramos.ts .............................. 240 ml
 *    conversion-cucharadas-cucharaditas-ml.ts ..... 240 ml
 *    conversor-tazas-a-mililitros.ts .............. 236,588 ml  ← el raro
 *
 *  Gramos por taza del MISMO ingrediente (240 ml)
 *    harina común    120 (medidas) · 120 (cups) · 125 «0000» y 130 «000»
 *                    (tazas-gramos) · 125 (peso-volumen)
 *    harina integral 130 (medidas) · 130 (cups) · 140 (tazas-gramos)
 *    cacao            85 (medidas) · 85 (cups) · 85 (peso-volumen) · 100 (tazas-gramos)
 *    arroz crudo     185 (medidas) · 195 (cups) · 200 (tazas-gramos) · 185 (peso-volumen)
 *    azúcar impalp.  120 (medidas) · 120 (cups) · 115 (tazas-gramos)
 *    avena            90 (medidas) · 90/80 (cups fina/gruesa) · 85 (tazas-gramos)
 *    bicarbonato     230 (medidas) · 220 (tazas-gramos)
 *    sal fina        288 (medidas) · 288 (peso-volumen) · 290 (tazas-gramos)
 *    maicena         120 (medidas) · 128 (peso-volumen)
 *    leche           245 (medidas) · 245 (tazas-gramos) · 240 (cups)
 *
 * CONVENCIÓN QUE ADOPTA EL HUB, dicha en la página y usada en todo el cálculo:
 *  1. La tabla de densidades es en gramos por 240 ml, que es la taza legal de
 *     EE.UU. y la base de King Arthur Baking y USDA — las dos fuentes que citan
 *     las fórmulas del repo.
 *  2. Precedencia entre tablas cuando se contradicen:
 *       (A) conversion-medidas-cocina-tazas-gramos  ← la más completa y citada
 *       (B) conversion-cups-gramos-harina-azucar-aceite  ← ingredientes que
 *           sólo están ahí (almendras, oliva, coco, chips)
 *       (C) tazas-gramos  ← ingredientes rioplatenses que sólo están ahí
 *           (dulce de leche, queso rallado, pan rallado, polenta…)
 *       (D) conversion-cucharaditas-gramos-especias-sal  ← especias, en g/cdta
 *       (E) equivalencia-huevos-tamano-gramos-claras  ← huevos, en g/unidad
 *     Ninguna densidad está escrita a mano: TODAS se derivan llamando a esas
 *     fórmulas. Si alguien las actualiza, este hub se actualiza solo.
 *  3. La taza de 250 ml (la del bazar argentino) y la de 236,588 ml (la
 *     estadounidense vieja, la que usa conversor-tazas-a-mililitros) se
 *     soportan como RAMAS: escalan el volumen, no la densidad.
 *  4. La cucharada es de 15 ml y la cucharadita de 5 ml en todas las ramas,
 *     porque así las define conversion-cucharadas-cucharaditas-ml y así las
 *     usa la tabla (taza/16 y taza/48 a 240 ml).
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ── Volumen de la taza, derivado de las fórmulas ──────────────────────── */

/** Taza base de la tabla de densidades: 1 cda × 16 según medidas-cocina. */
export const TAZA_BASE_ML = (() => {
  // conversion-cucharadas-cucharaditas-ml define taza=240 y cucharada=15.
  const o = conversionCucharadasCucharaditasMl({ cantidad: 1, unidadOrigen: 'taza', unidadDestino: 'ml' });
  return o.resultado;
})();

/** Cucharada y cucharadita, desde la fórmula volumétrica. */
export const CDA_ML = conversionCucharadasCucharaditasMl({ cantidad: 1, unidadOrigen: 'cucharada', unidadDestino: 'ml' }).resultado;
export const CDTA_ML = conversionCucharadasCucharaditasMl({ cantidad: 1, unidadOrigen: 'cucharadita', unidadDestino: 'ml' }).resultado;
/** Onza líquida, desde la misma fórmula. */
export const OZ_ML = conversionCucharadasCucharaditasMl({ cantidad: 1, unidadOrigen: 'oz', unidadDestino: 'ml' }).resultado;

/** Taza estadounidense "customary", la que usa conversor-tazas-a-mililitros. */
export const TAZA_US_CUSTOMARY_ML = (() => {
  const o = conversorTazasAMililitros({ valor: 1, direccion: 'ida' });
  return Math.round(parseFloat(String(o.resultado)) * 1000) / 1000;
})();

/** Taza métrica del bazar argentino. No sale de ninguna fórmula: es la de 250 ml
 *  que menciona el insight de conversor-tazas-a-mililitros ("la taza de cocina
 *  latina suele ser de 250 mL"). Se declara acá a la vista. */
export const TAZA_METRICA_ML = 250;

/* ── Densidades: g por taza de 240 ml, derivadas ───────────────────────── */

/** (A) g/taza desde conversion-medidas-cocina-tazas-gramos. */
function densA(key: string): number {
  return medidasCocina({ ingredient: key, quantity: 1, from_unit: 'cup', to_unit: 'gram' }).result;
}
/** (B) g/taza desde conversion-cups-gramos-harina-azucar-aceite. */
function densB(key: string): number {
  const o = conversionCupsGramosHarinaAzucarAceite({ cups: 1, ingredient: key });
  return parseFloat(String(o.resultado));
}
/** (C) g/taza desde tazas-gramos (usa taza de 240 ml). */
function densC(key: string): number {
  return tazasGramos({ ingrediente: key, cantidad: 1, unidadOrigen: 'taza', unidadDestino: 'g' }).densidad;
}
/** (D) g/taza desde conversion-cucharaditas-gramos-especias-sal (g/cdta × 48). */
function densD(key: string): number {
  const o = conversionCucharaditasGramosEspeciasSal({ cucharaditas: 1, ingrediente: key });
  const gTsp = parseFloat(String(o.resultado));
  return Math.round(gTsp * (TAZA_BASE_ML / CDTA_ML) * 10) / 10;
}

export interface Ingrediente {
  id: string;
  label: string;
  grupo: string;
  /** Gramos por taza de 240 ml. */
  gTaza: number;
  /** Sólo huevos: gramos de UNA unidad, con cáscara. */
  gUnidad?: number;
  /** De qué fórmula salió el número. */
  fuente: 'A' | 'B' | 'C' | 'D' | 'E';
}

/** (E) Huevos, desde equivalencia-huevos-tamano-gramos-claras. */
function huevo(tamano: string): number {
  const o = equivalenciaHuevosTamanoGramosClaras({ tamano, cantidad: 1 });
  // La fórmula devuelve la porción comestible = 91% del bruto.
  return Math.round(Number(o.comestible) / (1 - 0.09));
}

/** Proporciones de clara / yema / comestible, derivadas de la fórmula de huevos. */
const _huevoG = equivalenciaHuevosTamanoGramosClaras({ tamano: 'G', cantidad: 100 });
const _brutoG = huevo('G') * 100;
export const HUEVO_CLARA_PCT = Math.round((Number(_huevoG.clara) / _brutoG) * 100) / 100;
export const HUEVO_YEMA_PCT = Math.round((Number(_huevoG.yema) / _brutoG) * 100) / 100;
export const HUEVO_COMESTIBLE_PCT = Math.round((Number(_huevoG.comestible) / _brutoG) * 100) / 100;

export const INGREDIENTES: Ingrediente[] = [
  /* Harinas y secos — (A) */
  { id: 'harina_comun', label: 'Harina 0000 / común', grupo: 'Harinas y secos', gTaza: densA('all_purpose_flour'), fuente: 'A' },
  { id: 'harina_integral', label: 'Harina integral', grupo: 'Harinas y secos', gTaza: densA('whole_wheat_flour'), fuente: 'A' },
  { id: 'harina_almendras', label: 'Harina de almendras', grupo: 'Harinas y secos', gTaza: densB('harina_almendras'), fuente: 'B' },
  { id: 'maicena', label: 'Maicena / fécula de maíz', grupo: 'Harinas y secos', gTaza: densA('cornstarch'), fuente: 'A' },
  { id: 'polenta', label: 'Polenta / harina de maíz', grupo: 'Harinas y secos', gTaza: densC('polenta'), fuente: 'C' },
  { id: 'avena', label: 'Avena en copos', grupo: 'Harinas y secos', gTaza: densA('rolled_oats'), fuente: 'A' },
  { id: 'pan_rallado', label: 'Pan rallado', grupo: 'Harinas y secos', gTaza: densC('pan_rallado'), fuente: 'C' },
  { id: 'galletas_molidas', label: 'Galletitas molidas', grupo: 'Harinas y secos', gTaza: densC('galletas_molidas'), fuente: 'C' },
  { id: 'arroz_crudo', label: 'Arroz crudo', grupo: 'Harinas y secos', gTaza: densA('rice_white'), fuente: 'A' },
  { id: 'arroz_cocido', label: 'Arroz cocido', grupo: 'Harinas y secos', gTaza: densC('arroz_cocido'), fuente: 'C' },

  /* Azúcares y dulces */
  { id: 'azucar_blanca', label: 'Azúcar blanca', grupo: 'Azúcares y dulces', gTaza: densA('white_sugar'), fuente: 'A' },
  { id: 'azucar_negra', label: 'Azúcar negra / mascabo (compactada)', grupo: 'Azúcares y dulces', gTaza: densA('brown_sugar'), fuente: 'A' },
  { id: 'azucar_impalpable', label: 'Azúcar impalpable', grupo: 'Azúcares y dulces', gTaza: densA('powdered_sugar'), fuente: 'A' },
  { id: 'miel', label: 'Miel', grupo: 'Azúcares y dulces', gTaza: densA('honey'), fuente: 'A' },
  { id: 'dulce_de_leche', label: 'Dulce de leche', grupo: 'Azúcares y dulces', gTaza: densC('dulce_de_leche'), fuente: 'C' },
  { id: 'cacao', label: 'Cacao amargo en polvo', grupo: 'Azúcares y dulces', gTaza: densA('cocoa_powder'), fuente: 'A' },
  { id: 'chips_chocolate', label: 'Chips de chocolate', grupo: 'Azúcares y dulces', gTaza: densB('chips_chocolate'), fuente: 'B' },
  { id: 'coco_rallado', label: 'Coco rallado seco', grupo: 'Azúcares y dulces', gTaza: densB('coco_rallado'), fuente: 'B' },
  { id: 'pasas_uva', label: 'Pasas de uva', grupo: 'Azúcares y dulces', gTaza: densC('pasas_uva'), fuente: 'C' },
  { id: 'nueces_picadas', label: 'Nueces picadas', grupo: 'Azúcares y dulces', gTaza: densC('nueces_picadas'), fuente: 'C' },

  /* Líquidos y grasas */
  { id: 'agua', label: 'Agua', grupo: 'Líquidos y grasas', gTaza: densA('water'), fuente: 'A' },
  { id: 'leche', label: 'Leche', grupo: 'Líquidos y grasas', gTaza: densA('milk'), fuente: 'A' },
  { id: 'leche_en_polvo', label: 'Leche en polvo', grupo: 'Líquidos y grasas', gTaza: densC('leche_en_polvo'), fuente: 'C' },
  { id: 'crema', label: 'Crema de leche', grupo: 'Líquidos y grasas', gTaza: densC('crema'), fuente: 'C' },
  { id: 'yogur', label: 'Yogur', grupo: 'Líquidos y grasas', gTaza: densC('yogur'), fuente: 'C' },
  { id: 'aceite', label: 'Aceite de girasol / maíz', grupo: 'Líquidos y grasas', gTaza: densA('vegetable_oil'), fuente: 'A' },
  { id: 'aceite_oliva', label: 'Aceite de oliva', grupo: 'Líquidos y grasas', gTaza: densB('aceite_oliva'), fuente: 'B' },
  { id: 'manteca', label: 'Manteca', grupo: 'Líquidos y grasas', gTaza: densA('butter'), fuente: 'A' },
  { id: 'queso_rallado', label: 'Queso rallado', grupo: 'Líquidos y grasas', gTaza: densC('queso_rallado'), fuente: 'C' },

  /* Sal, leudantes y especias */
  { id: 'sal_fina', label: 'Sal fina', grupo: 'Sal, leudantes y especias', gTaza: densA('salt'), fuente: 'A' },
  { id: 'sal_gruesa', label: 'Sal gruesa', grupo: 'Sal, leudantes y especias', gTaza: densC('sal_gruesa'), fuente: 'C' },
  { id: 'polvo_hornear', label: 'Polvo de hornear', grupo: 'Sal, leudantes y especias', gTaza: densA('baking_powder'), fuente: 'A' },
  { id: 'bicarbonato', label: 'Bicarbonato de sodio', grupo: 'Sal, leudantes y especias', gTaza: densA('baking_soda'), fuente: 'A' },
  { id: 'levadura_seca', label: 'Levadura seca', grupo: 'Sal, leudantes y especias', gTaza: densC('levadura_seca'), fuente: 'C' },
  { id: 'canela', label: 'Canela molida', grupo: 'Sal, leudantes y especias', gTaza: densD('canela'), fuente: 'D' },
  { id: 'pimienta', label: 'Pimienta negra molida', grupo: 'Sal, leudantes y especias', gTaza: densD('pimienta'), fuente: 'D' },
  { id: 'oregano', label: 'Orégano seco', grupo: 'Sal, leudantes y especias', gTaza: densD('oregano'), fuente: 'D' },
  { id: 'pimenton', label: 'Pimentón / paprika', grupo: 'Sal, leudantes y especias', gTaza: densD('pimenton'), fuente: 'D' },
  { id: 'comino', label: 'Comino molido', grupo: 'Sal, leudantes y especias', gTaza: densD('comino'), fuente: 'D' },
  { id: 'aji_molido', label: 'Ají molido', grupo: 'Sal, leudantes y especias', gTaza: densD('aji_molido'), fuente: 'D' },
  { id: 'cafe_molido', label: 'Café molido', grupo: 'Sal, leudantes y especias', gTaza: densD('cafe'), fuente: 'D' },

  /* Huevos — se miden por unidad, no por taza */
  { id: 'huevo_M', label: 'Huevo mediano (M)', grupo: 'Huevos', gTaza: densC('huevo_entero_batido'), gUnidad: huevo('M'), fuente: 'E' },
  { id: 'huevo_G', label: 'Huevo grande (G)', grupo: 'Huevos', gTaza: densC('huevo_entero_batido'), gUnidad: huevo('G'), fuente: 'E' },
  { id: 'huevo_XG', label: 'Huevo extra grande (XG)', grupo: 'Huevos', gTaza: densC('huevo_entero_batido'), gUnidad: huevo('XG'), fuente: 'E' },
];

/** Mapa id → ingrediente, el que consume el compute() del navegador. */
export const DENSIDADES: Record<string, { label: string; gTaza: number; gUnidad: number; grupo: string }> =
  Object.fromEntries(
    INGREDIENTES.map((x) => [x.id, { label: x.label, gTaza: x.gTaza, gUnidad: x.gUnidad || 0, grupo: x.grupo }])
  );

/** Opciones del select, agrupadas por rubro en la etiqueta. */
export const OPCIONES_INGREDIENTE = INGREDIENTES.map((x) => ({ value: x.id, label: `${x.grupo} · ${x.label}` }));

/** Mililitros de la taza en cada rama. */
export const TAZA_POR_RAMA: Record<string, number> = {
  cups: TAZA_BASE_ML,
  taza_ar: TAZA_METRICA_ML,
  sin_balanza: TAZA_BASE_ML,
  cucharas: TAZA_BASE_ML,
};

/** Unidades de masa aceptadas, en gramos. Salen de conversion-medidas-cocina. */
export const MASA_G: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: Math.round(
    (medidasCocina({ ingredient: 'water', quantity: 1, from_unit: 'ounce', to_unit: 'gram' }).result) * 10000
  ) / 10000,
  lb: Math.round(
    (medidasCocina({ ingredient: 'water', quantity: 1, from_unit: 'pound', to_unit: 'gram' }).result) * 1000
  ) / 1000,
};

const nAr = (v: number, d = 0) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

const HARINA = DENSIDADES.harina_comun.gTaza;
const AZUCAR = DENSIDADES.azucar_blanca.gTaza;
const ACEITE = DENSIDADES.aceite.gTaza;
const CACAO = DENSIDADES.cacao.gTaza;
const MIEL = DENSIDADES.miel.gTaza;
const SAL = DENSIDADES.sal_fina.gTaza;

export const hub: HubData = {
  slug: 'cocina/tazas-y-gramos',
  title: '¿Cuántos gramos es una taza? Conversor de cocina',
  description:
    'Una taza de harina son ~120 g y una de azúcar ~200 g: la taza mide volumen, no peso. Convertí tazas, cucharadas y cucharaditas a gramos con la densidad real de 45 ingredientes, y elegí si tu taza es de 240 o de 250 ml.',
  silo: 'Cocina',
  siloHref: '/cocina',

  eyebrow: 'Medidas de cocina',
  h1: '¿Cuántos gramos es una taza?',
  lede:
    'No hay un solo número, y ese es todo el problema: la taza mide volumen y cada ingrediente pesa distinto. Elegí qué estás midiendo y con qué taza, y te decimos los gramos exactos — más las cucharadas y cucharaditas equivalentes.',
  stamps: [
    'Actualizado 27-07-2026',
    `1 taza de harina = ${nAr(HARINA)} g · 1 de azúcar = ${nAr(AZUCAR)} g`,
    `Taza base de ${nAr(TAZA_BASE_ML)} ml · cucharada ${CDA_ML} ml · cucharadita ${CDTA_ML} ml`,
    `${INGREDIENTES.length} ingredientes · 9 calculadoras adentro`,
  ],

  resultLabel: 'Tu conversión',

  cases: {
    title: '¿Con qué taza estás midiendo?',
    intro:
      'Es la pregunta que ninguna tabla de internet te hace, y la que hace que la misma receta te salga distinta. Partimos de la taza de 240 ml, que es la de las recetas en inglés y la base de todas las tablas de densidad serias.',
    items: [
      {
        id: 'cups',
        label: `Taza de ${nAr(TAZA_BASE_ML)} ml (cups)`,
        hint: 'Recetas en inglés y tablas de repostería',
        answer: `Con la taza de ${nAr(TAZA_BASE_ML)} ml, 1 taza de harina común pesa ${nAr(HARINA)} g, 1 de azúcar blanca ${nAr(AZUCAR)} g y 1 de aceite ${nAr(ACEITE)} g.`,
        yes: [
          `La taza legal de EE.UU. mide ${nAr(TAZA_BASE_ML)} ml exactos: es la que usan King Arthur Baking y la USDA, y la base de la tabla de este conversor`,
          `1 taza = 16 cucharadas de ${CDA_ML} ml = 48 cucharaditas de ${CDTA_ML} ml`,
          `Harina común ${nAr(HARINA)} g · azúcar blanca ${nAr(AZUCAR)} g · azúcar impalpable ${nAr(DENSIDADES.azucar_impalpable.gTaza)} g · cacao ${nAr(CACAO)} g · miel ${nAr(MIEL)} g`,
          'El "cup" que aparece en libros de cocina estadounidenses viejos es de 236,588 ml: la diferencia con 240 es del 1,4% y en repostería casera no se nota',
        ],
        warn: [
          'La densidad no es un dato fijo del ingrediente sino de cómo llenás la taza: si compactás la harina con la cuchara podés meter hasta un 20-30% más',
          'Para harina, el método correcto es airearla, cucharearla dentro de la taza y enrasar con el lomo de un cuchillo — nunca hundir la taza en el paquete',
          'Ninguna tabla es exacta al gramo: si la receta es sensible (macarons, pan de masa madre, merengue italiano), pesá',
        ],
        plazo:
          'si la receta original está en gramos, quedate en gramos: convertir a tazas y volver es donde se acumula el error.',
      },
      {
        id: 'taza_ar',
        label: `Taza de ${TAZA_METRICA_ML} ml (métrica)`,
        hint: 'La taza medidora del bazar argentino',
        answer: `Con la taza métrica de ${TAZA_METRICA_ML} ml, 1 taza de harina pesa ${nAr((HARINA * TAZA_METRICA_ML) / TAZA_BASE_ML)} g y 1 de azúcar ${nAr((AZUCAR * TAZA_METRICA_ML) / TAZA_BASE_ML)} g: un ${Math.round(((TAZA_METRICA_ML / TAZA_BASE_ML) - 1) * 100)}% más que con la taza de ${nAr(TAZA_BASE_ML)} ml.`,
        yes: [
          `La taza medidora que se vende en Argentina suele estar marcada en ${TAZA_METRICA_ML} ml, no en ${nAr(TAZA_BASE_ML)}`,
          `Es un ${Math.round(((TAZA_METRICA_ML / TAZA_BASE_ML) - 1) * 100)}% más de volumen: en una receta con 3 tazas de harina son ${nAr(3 * (HARINA * TAZA_METRICA_ML) / TAZA_BASE_ML - 3 * HARINA)} g de diferencia`,
          'El hub escala el volumen, no la densidad: el ingrediente sigue pesando lo mismo por mililitro',
          `La cucharada y la cucharadita NO cambian: siguen siendo ${CDA_ML} y ${CDTA_ML} ml`,
        ],
        warn: [
          `Con taza de ${TAZA_METRICA_ML} ml ya no vale que "1 taza = 16 cucharadas": son ${nAr(TAZA_METRICA_ML / CDA_ML, 1)} cucharadas`,
          'Fijate si tu taza tiene el volumen impreso: muchas no lo tienen y hay que medirla llenándola de agua y pesándola (1 ml de agua = 1 g)',
          'Si la receta es de un canal o libro estadounidense, casi seguro está en tazas de 240 ml aunque no lo diga',
        ],
        plazo:
          'medí tu taza una sola vez: llenala de agua hasta el borde de uso y pesala. Ese número es tu taza real para siempre.',
      },
      {
        id: 'sin_balanza',
        label: 'La receta está en gramos y no tengo balanza',
        hint: 'De gramos a tazas',
        answer: `Sin balanza se hace al revés: ${nAr(HARINA)} g de harina son 1 taza, ${nAr(AZUCAR)} g de azúcar son 1 taza y ${nAr(SAL)} g de sal fina también, aunque pesen distinto.`,
        yes: [
          'Poné los gramos que pide la receta en "Cantidad", elegí "gramos" como unidad de origen y "tazas" como destino',
          `100 g de harina = ${nAr(100 / HARINA, 2)} tazas · 100 g de azúcar = ${nAr(100 / AZUCAR, 2)} tazas · 100 g de miel = ${nAr(100 / MIEL, 2)} tazas`,
          'Para cantidades chicas conviene pasar a cucharadas o cucharaditas: son mucho más precisas que "un octavo de taza"',
          'Los líquidos son la excepción fácil: 1 ml de agua, leche o caldo pesa prácticamente 1 g',
        ],
        warn: [
          'Convertir de peso a volumen agrega error, no lo quita: esta rama es un parche, no un método',
          'Los ingredientes que se compactan (azúcar negra, cacao, harina integral) son los que peor toleran la conversión',
          'Para leudantes y sal usá siempre cucharadita: la diferencia entre 5 y 7 g de polvo de hornear se ve en el resultado',
        ],
        plazo:
          'una balanza de cocina digital cuesta menos que dos tortas fallidas y elimina el problema de raíz.',
      },
      {
        id: 'cucharas',
        label: 'Mido con cucharas',
        hint: 'Cucharadas, cucharaditas y especias',
        answer: `Una cucharada rasa de ${CDA_ML} ml lleva ${nAr(HARINA / (TAZA_BASE_ML / CDA_ML), 1)} g de harina, ${nAr(AZUCAR / (TAZA_BASE_ML / CDA_ML), 1)} g de azúcar y ${nAr(SAL / (TAZA_BASE_ML / CDA_ML), 1)} g de sal fina.`,
        yes: [
          `1 cucharada = ${CDA_ML} ml = 3 cucharaditas de ${CDTA_ML} ml, siempre, en todas las ramas`,
          `Con taza de ${nAr(TAZA_BASE_ML)} ml: 1 taza = 16 cucharadas = 48 cucharaditas`,
          `Especias por cucharadita rasa: canela ${nAr(DENSIDADES.canela.gTaza / 48, 1)} g · pimienta ${nAr(DENSIDADES.pimienta.gTaza / 48, 1)} g · orégano ${nAr(DENSIDADES.oregano.gTaza / 48, 1)} g · pimentón ${nAr(DENSIDADES.pimenton.gTaza / 48, 1)} g`,
          `Sal fina: ${nAr(SAL / 48, 1)} g por cucharadita rasa`,
        ],
        warn: [
          'Todos los valores son de cuchara RASA (enrasada con un cuchillo). Una cucharada colmada puede pesar hasta el doble',
          'La cuchara de sopa de tu cajón no es una cucharada de medir: varía entre 10 y 18 ml. Comprá el juego de medidoras o pesá',
          `La OMS recomienda menos de 5 g de sal por día para un adulto: menos de 1 cucharadita rasa de sal fina (${nAr(SAL / 48, 1)} g), contando la que ya traen los alimentos`,
          'El bicarbonato es unas 3 veces más leudante que el polvo de hornear: nunca los cambies uno por otro en partes iguales',
        ],
        plazo:
          'para menos de 30 g, la cucharadita le gana a la balanza doméstica: la mayoría de las balanzas baratas no distingue por debajo de 2 g.',
      },
    ],
  },

  inputsTitle: 'Qué querés convertir',
  inputsIntro:
    'Elegí el ingrediente primero: es lo que define la densidad y, por lo tanto, todo el resultado. Los huevos se miden por unidad, no por taza.',
  fields: [
    {
      id: 'ingrediente',
      label: 'Ingrediente',
      type: 'select',
      value: 'harina_comun',
      options: OPCIONES_INGREDIENTE,
      help: 'La densidad de este ingrediente es lo único que convierte volumen en peso.',
    },
    { id: 'cantidad', label: 'Cantidad', type: 'number', min: 0, step: 0.25, value: 1 },
    {
      id: 'unidadOrigen',
      label: 'Unidad de origen',
      type: 'select',
      value: 'taza',
      options: [
        { value: 'taza', label: 'Tazas' },
        { value: 'media_taza', label: 'Medias tazas' },
        { value: 'cuarto_taza', label: 'Cuartos de taza' },
        { value: 'cda', label: 'Cucharadas soperas' },
        { value: 'cdta', label: 'Cucharaditas' },
        { value: 'ml', label: 'Mililitros' },
        { value: 'g', label: 'Gramos' },
        { value: 'kg', label: 'Kilos' },
        { value: 'oz', label: 'Onzas (oz)' },
        { value: 'lb', label: 'Libras (lb)' },
        { value: 'unidad', label: 'Unidades (sólo huevos)' },
      ],
    },
    {
      id: 'unidadDestino',
      label: 'Convertir a',
      type: 'select',
      value: 'g',
      options: [
        { value: 'g', label: 'Gramos' },
        { value: 'kg', label: 'Kilos' },
        { value: 'taza', label: 'Tazas' },
        { value: 'cda', label: 'Cucharadas soperas' },
        { value: 'cdta', label: 'Cucharaditas' },
        { value: 'ml', label: 'Mililitros' },
        { value: 'oz', label: 'Onzas (oz)' },
        { value: 'lb', label: 'Libras (lb)' },
        { value: 'unidad', label: 'Unidades (sólo huevos)' },
      ],
    },
  ],
  fineprint:
    `Las densidades están expresadas en gramos por taza de ${nAr(TAZA_BASE_ML)} ml y salen de las tablas de King Arthur Baking y USDA FoodData Central que ya usan las calculadoras del sitio. Son valores de referencia para ingrediente enrasado y sin compactar: el mismo ingrediente puede variar entre un 15% y un 30% según cómo llenes la taza, la humedad del ambiente y la marca. Para repostería de precisión, pesá.`,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu ingrediente en la escala de densidad',
    caption:
      `La barra va de 0 a 350 gramos por taza de ${nAr(TAZA_BASE_ML)} ml. El marcador muestra cuánto pesa UNA taza de lo que elegiste. Ahí se ve de un vistazo por qué no existe "cuántos gramos es una taza": entre el orégano y la miel hay más de 20 veces de diferencia midiendo exactamente el mismo volumen.`,
    bands: [
      { label: 'Livianos (especias, cacao, avena)', from: 0, to: 120, tone: 'good' },
      { label: 'Medios (harinas, azúcares)', from: 120, to: 230, tone: 'neutral' },
      { label: 'Densos (miel, sal, líquidos)', from: 230, to: 350, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Tu conversión, en todas las unidades',
  breakdownIntro:
    'La misma cantidad expresada en peso, en volumen y en medidas de cocina, más las equivalencias de referencia del ingrediente que elegiste.',

  faq: [
    {
      q: '¿Cuántos gramos es una taza?',
      a: `<b>Depende del ingrediente, y por mucho.</b> Una taza de ${nAr(TAZA_BASE_ML)} ml lleva ${nAr(HARINA)} g de harina común, ${nAr(AZUCAR)} g de azúcar blanca, ${nAr(ACEITE)} g de aceite, ${nAr(CACAO)} g de cacao y ${nAr(MIEL)} g de miel. La taza mide <b>volumen</b>, no peso: siempre entra el mismo espacio, pero lo que ese espacio pesa cambia con la densidad de cada ingrediente. Por eso la pregunta "¿cuántos gramos es una taza?" no tiene una sola respuesta, y cualquier tabla que te dé un número único está mintiendo.`,
    },
    {
      q: '¿Cuántos gramos es una taza de harina?',
      a: `<b>${nAr(HARINA)} g</b> en una taza de ${nAr(TAZA_BASE_ML)} ml, harina común o 0000, aireada y enrasada sin compactar. Con la taza métrica de ${TAZA_METRICA_ML} ml son ${nAr((HARINA * TAZA_METRICA_ML) / TAZA_BASE_ML)} g. La harina integral pesa más (${nAr(DENSIDADES.harina_integral.gTaza)} g) porque el salvado es más denso, y la de almendras menos (${nAr(DENSIDADES.harina_almendras.gTaza)} g). Ojo con el método: si en vez de cucharear la harina dentro de la taza la hundís directo en el paquete, podés llegar a ${nAr(HARINA * 1.25)} g o más en la misma taza. Esa es la razón número uno de las tortas secas.`,
    },
    {
      q: '¿Cuántos gramos es una taza de azúcar?',
      a: `<b>${nAr(AZUCAR)} g de azúcar blanca granulada</b> por taza de ${nAr(TAZA_BASE_ML)} ml. La impalpable pesa ${nAr(DENSIDADES.azucar_impalpable.gTaza)} g porque tiene mucho aire entre partículas, y la negra o mascabo <b>compactada</b> llega a ${nAr(DENSIDADES.azucar_negra.gTaza)} g. Eso último es importante: casi todas las recetas que piden azúcar negra asumen que la apretás dentro de la taza. Si la ponés suelta, vas a poner un 20% menos de la que pide la receta.`,
    },
    {
      q: '¿Una taza son 240 o 250 ml?',
      a: `Las dos cosas existen y por eso conviene saber cuál tenés. La <b>taza legal de Estados Unidos</b> —la de las recetas en inglés, los libros de repostería y las tablas de King Arthur y USDA— mide <b>${nAr(TAZA_BASE_ML)} ml</b>. La <b>taza medidora métrica</b> que se vende en Argentina y buena parte de Latinoamérica suele estar marcada en <b>${TAZA_METRICA_ML} ml</b>. Hay una tercera, la "US customary" de los libros viejos, que mide ${nAr(TAZA_US_CUSTOMARY_ML, 3)} ml. Entre la de ${nAr(TAZA_BASE_ML)} y la de ${TAZA_METRICA_ML} hay un ${Math.round(((TAZA_METRICA_ML / TAZA_BASE_ML) - 1) * 100)}% de diferencia: en una torta con 3 tazas de harina son ${nAr(3 * (HARINA * TAZA_METRICA_ML) / TAZA_BASE_ML - 3 * HARINA)} g de más. Este hub te deja elegir cuál usás.`,
    },
    {
      q: '¿Cuántas cucharadas tiene una taza?',
      a: `<b>16 cucharadas</b>, si tu taza es de ${nAr(TAZA_BASE_ML)} ml: la cucharada mide ${CDA_ML} ml y ${nAr(TAZA_BASE_ML)} ÷ ${CDA_ML} = 16 exactas. En cucharaditas de ${CDTA_ML} ml son <b>48</b>. Y la regla de oro que hay que memorizar: <b>1 cucharada = 3 cucharaditas</b>. Con la taza métrica de ${TAZA_METRICA_ML} ml la cuenta se ensucia: son ${nAr(TAZA_METRICA_ML / CDA_ML, 1)} cucharadas, y es una de las razones para preferir la de ${nAr(TAZA_BASE_ML)}.`,
    },
    {
      q: '¿Cuántos gramos tiene una cucharada?',
      a: `Otra vez: depende del ingrediente. Por cucharada rasa de ${CDA_ML} ml hay ${nAr(HARINA / 16, 1)} g de harina, ${nAr(AZUCAR / 16, 1)} g de azúcar, ${nAr(ACEITE / 16, 1)} g de aceite, ${nAr(SAL / 16, 1)} g de sal fina y ${nAr(MIEL / 16, 1)} g de miel. El dato clave no es el número sino la palabra <b>rasa</b>: los valores de cualquier tabla suponen la cuchara enrasada con el lomo de un cuchillo. Una cucharada colmada de harina puede pesar el doble.`,
    },
    {
      q: '¿Cuántos gramos de sal hay en una cucharadita?',
      a: `<b>${nAr(SAL / 48, 1)} g de sal fina</b> en una cucharadita rasa de ${CDTA_ML} ml; la sal gruesa pesa menos por el mismo volumen (${nAr(DENSIDADES.sal_gruesa.gTaza / 48, 1)} g) porque los cristales dejan más aire entre sí. Es el dato de cocina con más consecuencias fuera de la cocina: la OMS recomienda no pasar de <b>5 g de sal por día</b> para un adulto, o sea menos de una cucharadita rasa, contando toda la que ya viene en el pan, los fiambres y los enlatados. Si cambiás sal fina por gruesa en una receta sin ajustar el volumen, estás poniendo un ${Math.round((1 - DENSIDADES.sal_gruesa.gTaza / SAL) * 100)}% menos de sal.`,
    },
    {
      q: '¿Cuánto pesa un huevo y cuánta clara tiene?',
      a: `Con cáscara, un huevo <b>mediano (M) pesa ${DENSIDADES.huevo_M.gUnidad} g</b>, uno <b>grande (G) ${DENSIDADES.huevo_G.gUnidad} g</b> y uno <b>extra grande (XG) ${DENSIDADES.huevo_XG.gUnidad} g</b>. La cáscara es alrededor del 9% del peso: de un huevo G quedan ${Math.round(DENSIDADES.huevo_G.gUnidad * HUEVO_COMESTIBLE_PCT)} g comestibles, repartidos en <b>${Math.round(DENSIDADES.huevo_G.gUnidad * HUEVO_CLARA_PCT)} g de clara</b> y <b>${Math.round(DENSIDADES.huevo_G.gUnidad * HUEVO_YEMA_PCT)} g de yema</b>. Si una receta pide "200 g de claras" y sólo tenés huevos G, son unas ${Math.ceil(200 / (DENSIDADES.huevo_G.gUnidad * HUEVO_CLARA_PCT))} unidades. Elegí el huevo en la lista de ingredientes y poné "unidades" como origen: el hub te desglosa clara y yema.`,
    },
    {
      q: '¿Por qué la misma receta me sale distinta cada vez que la hago?',
      a: 'Casi siempre es la medición por volumen. Con la misma taza, la misma harina y la misma persona, la diferencia entre una harina aireada y una compactada llega al 20-30%. Sumale que la harina absorbe humedad del ambiente, que cada marca tiene un molido distinto y que "una taza al ras" es un criterio y no una medida, y ya tenés toda la varianza que te falta explicar. Pesar en gramos elimina esas cuatro variables de una sola vez: es el motivo por el que ninguna panadería del mundo trabaja con tazas.',
    },
    {
      q: '¿Puedo convertir tazas a gramos con una sola tabla para todo?',
      a: `No, y ese es el error más común. Necesitás una densidad por ingrediente. Fijate la escala del gráfico: el orégano seco pesa ${nAr(DENSIDADES.oregano.gTaza)} g por taza y la miel ${nAr(MIEL)} g — más de veinte veces, con el mismo volumen. Incluso dentro de la misma familia hay saltos grandes: harina común ${nAr(HARINA)} g contra harina integral ${nAr(DENSIDADES.harina_integral.gTaza)} g, azúcar blanca ${nAr(AZUCAR)} g contra impalpable ${nAr(DENSIDADES.azucar_impalpable.gTaza)} g. Por eso este conversor tiene ${INGREDIENTES.length} ingredientes cargados y no una regla única.`,
    },
    {
      q: '¿Los líquidos también cambian de peso según el ingrediente?',
      a: `Sí, aunque mucho menos que los secos. Una taza de agua pesa ${nAr(DENSIDADES.agua.gTaza)} g (agua: 1 ml = 1 g, la única equivalencia gratis de la cocina), la de leche ${nAr(DENSIDADES.leche.gTaza)} g porque tiene sólidos disueltos, y la de aceite sólo ${nAr(ACEITE)} g porque el aceite es menos denso que el agua. La miel se va al otro extremo con ${nAr(MIEL)} g. Para agua, leche, caldo o jugo podés usar la equivalencia 1 ml = 1 g sin culpa; para aceite, miel o dulce de leche, no.`,
    },
    {
      q: '¿Cómo mido bien una taza de harina?',
      a: 'El método estándar de repostería tiene tres pasos y cambia el resultado más que cualquier tabla. Uno: airear la harina en el paquete o el bol con un tenedor o batidor, porque se compacta sola con el tiempo. Dos: pasarla a la taza con una cuchara, sin apretar y sin golpear la taza contra la mesada. Tres: enrasar deslizando el lomo de un cuchillo por el borde. Lo que NO hay que hacer es hundir la taza en el paquete: así entra hasta un 25% más de harina y la receta se te desbalancea entera.',
    },
  ],

  sources: [
    {
      name: 'Ingredient Weight Chart — gramos por taza de cada ingrediente',
      url: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart',
      publisher: 'King Arthur Baking Company',
    },
    {
      name: 'FoodData Central — densidad y composición de alimentos',
      url: 'https://fdc.nal.usda.gov/',
      publisher: 'USDA · Departamento de Agricultura de EE.UU.',
    },
    {
      name: '21 CFR 101.9(b)(5)(viii) — la taza legal de EE.UU. es de 240 ml',
      url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-A/section-101.9',
      publisher: 'FDA · Code of Federal Regulations',
    },
    {
      name: 'Código Alimentario Argentino, Capítulo VI — Huevos',
      url: 'https://www.argentina.gob.ar/anmat/codigoalimentario',
      publisher: 'ANMAT · Ministerio de Salud',
    },
    {
      name: 'Reducción del consumo de sal — menos de 5 g por día',
      url: 'https://www.who.int/es/news-room/fact-sheets/detail/salt-reduction',
      publisher: 'OMS · Organización Mundial de la Salud',
    },
    {
      name: 'NIST Handbook 44 — unidades de medida legales y equivalencias',
      url: 'https://www.nist.gov/pml/owm/publications/nist-handbooks/nist-handbook-44',
      publisher: 'NIST · Instituto Nacional de Estándares y Tecnología',
    },
  ],

  replaces: [
    '/conversor-tazas-gramos-cocina-recetas',
    '/calculadora-conversion-medidas-cocina-tazas-gramos',
    '/calculadora-equivalencia-huevos-tamano-gramos-claras',
    '/calculadora-conversion-cups-gramos-harina-azucar-aceite',
    '/calculadora-conversor-tazas-a-mililitros',
    '/calculadora-conversion-cucharaditas-gramos-especias-sal',
    '/calculadora-huevos-por-receta-comensales',
    '/calculadora-conversion-peso-volumen-ingredientes-cocina',
    '/conversion-cucharadas-cucharaditas-ml',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/* Referencia usada sólo para dejar constancia de que la tabla vieja de
 * conversion-peso-volumen también se consultó al resolver las contradicciones
 * (ver el comentario de cabecera). No alimenta el cálculo. */
export const PESO_VOLUMEN_HARINA_G_TAZA = conversionPesoVolumen({
  ingrediente: 'harina',
  cantidad: 1,
  unidadOrigen: 'tazas',
}).resultado;
