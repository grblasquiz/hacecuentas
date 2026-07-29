import type { HubData } from '../types';
import { ITV_2026 } from '../../data/espana-2026';

/**
 * Hub de decisión ES — "¿Cuánto me cuesta tener el coche al año?"
 *
 * Absorbe 5 calculadoras: impuesto de circulación (IVTM), precio de la ITV,
 * seguro, ITP de la transferencia de segunda mano y coste por kilómetro con
 * peajes.
 *
 * Constantes: espejo de src/lib/formulas/impuesto-circulacion-vehiculos-espana-municipio.ts,
 * itp-transferencia-coche-segunda-mano-espana.ts y ITV_2026 de
 * src/lib/data/espana-2026.ts.
 */

/** Disclaimer — textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANZAS =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'es/automotor/costes-del-coche',
  title: 'Cuánto cuesta tener coche en España: IVTM, ITV, seguro y coste por km',
  description:
    'Suma el coste anual real de tu coche en España: impuesto de circulación de tu municipio, ITV, seguro, ITP si lo compras de segunda mano y coste por kilómetro con peajes.',
  silo: 'Coche',
  siloHref: '/es/automotor',

  eyebrow: 'Guía de costes del coche',
  h1: '¿Cuánto me cuesta tener el coche cada año?',
  lede:
    'El precio del coche es lo que menos cuenta a largo plazo. Lo que pesa es lo que viene después: el impuesto de circulación del ayuntamiento, la ITV cada uno o dos años, el seguro, el combustible, los peajes y una depreciación que nadie ve pasar hasta que vende.',
  stamps: ['Ordenanzas municipales de IVTM', 'Tarifas de ITV por comunidad', '5 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué quieres calcular?',
    intro: 'Todos los costes se suman igual: la rama sólo cambia dónde ponemos el foco.',
    items: [
      {
        id: 'anual',
        label: 'El coste de todo el año',
        hint: 'Impuesto, ITV, seguro y uso',
        answer:
          'El coste anual de un coche suma impuesto de circulación, seguro, ITV prorrateada, combustible, mantenimiento y peajes.',
        yes: [
          'IVTM: tarifa según caballos fiscales por el coeficiente de tu municipio',
          'Seguro anual según coberturas y bonificación',
          'ITV prorrateada según la periodicidad que te toca',
          'Combustible, mantenimiento y peajes según los kilómetros',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'No incluye la depreciación, que en los primeros años suele ser el coste mayor de todos',
          'El coeficiente del IVTM lo fija cada ayuntamiento: el mismo coche paga muy distinto según dónde esté domiciliado',
        ],
        plazo: 'el IVTM se cobra en el período voluntario que fije cada ayuntamiento, normalmente en primavera.',
      },
      {
        id: 'transferencia',
        label: 'Comprar de segunda mano',
        hint: 'ITP y cambio de nombre',
        answer:
          'Comprar un coche usado a un particular implica ITP autonómico y la tasa de la DGT por el cambio de titularidad.',
        yes: [
          'ITP sobre el valor fiscal del vehículo, con el tipo de tu comunidad',
          'Tasa de tráfico por el cambio de titularidad',
          'Valor fiscal según las tablas oficiales, no según lo que pagues',
          'Gestoría, si no haces el trámite tú mismo',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'La base del ITP es el valor fiscal de las tablas de Hacienda con su coeficiente de antigüedad: pagar menos por el coche no reduce el impuesto',
          'El cambio de nombre tiene plazo: pasado el plazo hay sanción, y mientras tanto las multas siguen llegando al anterior titular',
          'Comprar a un concesionario lleva IVA en vez de ITP',
        ],
        plazo: 'el cambio de titularidad debe hacerse en los 30 días siguientes a la compra.',
      },
      {
        id: 'itv',
        label: 'La ITV',
        hint: 'Precio y periodicidad',
        answer:
          'El precio de la ITV cambia por comunidad autónoma y por tipo de vehículo, y en algunas está liberalizado.',
        yes: [
          'Tarifa de la estación según combustible y cilindrada',
          'Tasa de tráfico que se suma a la tarifa',
          'Periodicidad: cada dos años hasta los diez, y anual después',
          'En comunidades con precio libre, la diferencia entre estaciones es notable',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Pasar la ITV fuera de plazo es infracción grave y el seguro puede complicar la cobertura en caso de siniestro',
          'Una segunda inspección tras un desfavorable suele ser gratuita dentro de los dos meses, pero no siempre',
        ],
        plazo: 'la ITV se puede pasar hasta 30 días antes de la fecha de caducidad sin perder días.',
      },
      {
        id: 'km',
        label: 'El coste por kilómetro',
        hint: 'Combustible, peajes y desgaste',
        answer:
          'El coste real por kilómetro incluye combustible, mantenimiento, seguro e impuesto repartidos entre los kilómetros que haces.',
        yes: [
          'Combustible según consumo medio y precio del carburante',
          'Peajes del trayecto habitual',
          'Mantenimiento y neumáticos prorrateados',
          'Costes fijos repartidos entre los kilómetros anuales',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Cuantos menos kilómetros hagas, más caro sale cada uno: los costes fijos se reparten entre menos',
          'El consumo homologado del fabricante suele quedarse corto frente al real',
        ],
        plazo: 'el coste por kilómetro conviene recalcularlo cada vez que cambie el precio del carburante.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro: 'Los caballos fiscales están en la ficha técnica de tu coche, no son los CV de potencia.',
  fields: [
    {
      id: 'cvFiscales',
      label: 'Caballos fiscales',
      type: 'select',
      value: '8a12',
      options: [
        { value: 'menos8', label: 'Menos de 8 CV fiscales' },
        { value: '8a12', label: 'De 8 a 11,99 CV fiscales' },
        { value: '12a16', label: 'De 12 a 15,99 CV fiscales' },
        { value: '16a20', label: 'De 16 a 19,99 CV fiscales' },
        { value: 'mas20', label: '20 o más CV fiscales' },
      ],
    },
    {
      id: 'municipio',
      label: 'Municipio donde está domiciliado',
      type: 'select',
      value: 'madrid',
      options: [
        { value: 'madrid', label: 'Madrid' },
        { value: 'barcelona', label: 'Barcelona' },
        { value: 'valencia', label: 'Valencia' },
        { value: 'sevilla', label: 'Sevilla' },
        { value: 'zaragoza', label: 'Zaragoza' },
        { value: 'malaga', label: 'Málaga' },
        { value: 'bilbao', label: 'Bilbao' },
      ],
    },
    {
      id: 'tipoVehiculo',
      label: 'Tipo de vehículo para la ITV',
      type: 'select',
      value: 'gasolina-menor1600',
      options: [
        { value: 'gasolina-menor1600', label: 'Gasolina menos de 1.600 cc' },
        { value: 'gasolina-mayor1600', label: 'Gasolina 1.600 cc o más' },
        { value: 'diesel-menor1600', label: 'Diésel menos de 1.600 cc' },
        { value: 'diesel-mayor1600', label: 'Diésel 1.600 cc o más' },
        { value: 'moto', label: 'Motocicleta' },
      ],
    },
    {
      id: 'ccaaItv',
      label: 'Comunidad para la ITV',
      type: 'select',
      value: 'referencia',
      options: [
        { value: 'referencia', label: 'Media nacional' },
        { value: 'andalucia', label: 'Andalucía' },
        { value: 'extremadura', label: 'Extremadura' },
        { value: 'baleares', label: 'Baleares' },
        { value: 'cataluna', label: 'Cataluña' },
        { value: 'paisVasco', label: 'País Vasco' },
        { value: 'cantabria', label: 'Cantabria' },
      ],
    },
    { id: 'seguro', label: 'Prima anual del seguro', prefix: '€', value: '400', thousands: true },
    { id: 'kmAnuales', label: 'Kilómetros al año', type: 'number', value: 12000, min: 0, max: 100000, step: 500 },
    { id: 'consumo', label: 'Consumo medio', type: 'number', value: 6.5, min: 0, max: 25, step: 0.1, suffix: ' l/100 km' },
    { id: 'precioCarburante', label: 'Precio del carburante', type: 'number', prefix: '€', suffix: '/l', value: 1.55, min: 0, step: 0.01 },
    { id: 'peajes', label: 'Peajes al año', prefix: '€', value: '0', thousands: true },
    { id: 'valorFiscal', label: 'Valor fiscal del coche usado (si lo compras)', prefix: '€', value: '8.000', thousands: true },
    {
      id: 'tipoItp',
      label: 'Tipo de ITP de tu comunidad',
      type: 'number',
      value: '4',
      min: 0,
      max: 10,
      step: 0.5,
      suffix: '%',
    },
  ],
  fineprint: DISCLAIMER_FINANZAS,

  chart: {
    type: 'donut',
    title: 'Reparto del coste anual',
    caption:
      'Los costes fijos —impuesto, seguro, ITV— se pagan aunque el coche no salga del garaje; los variables dependen de los kilómetros.',
  },
  breakdownTitle: 'Todos los costes del coche',
  breakdownIntro:
    'Los importes son anuales salvo donde se indica. Las filas de kilómetros y porcentaje llevan su unidad.',

  faq: [
    {
      q: '¿Cómo se calcula el impuesto de circulación?',
      a: 'Se parte de una tarifa estatal según los caballos fiscales del vehículo y se multiplica por el coeficiente que fija la ordenanza de tu ayuntamiento, con un máximo legal. Por eso el mismo coche puede pagar casi el doble en un municipio que en otro.',
    },
    {
      q: '¿Qué son los caballos fiscales?',
      a: 'Una magnitud administrativa que se calcula a partir de la cilindrada y del número de cilindros, y que no coincide con los caballos de potencia. Está en la ficha técnica del vehículo y es el dato que determina la tarifa del impuesto.',
    },
    {
      q: '¿Hay bonificaciones en el impuesto de circulación?',
      a: 'Sí, y son municipales: la mayoría de los ayuntamientos grandes bonifican fuertemente los vehículos eléctricos e híbridos, y también los históricos con más de veinticinco años. Hay que solicitarlas y no siempre se aplican de forma automática.',
    },
    {
      q: '¿Cuánto cuesta la ITV?',
      a: 'Depende de la comunidad autónoma y del tipo de vehículo: en unas la tarifa está regulada y en otras el precio es libre y varía entre estaciones. A la tarifa se le suma siempre una tasa de tráfico. Los diésel pagan algo más que los gasolina por la prueba de emisiones.',
    },
    {
      q: '¿Cada cuánto hay que pasar la ITV?',
      a: 'En turismos, la primera a los cuatro años; luego cada dos años hasta los diez; y a partir de ahí, todos los años. Se puede pasar hasta un mes antes de la fecha de caducidad sin perder días de validez.',
    },
    {
      q: '¿Qué se paga al comprar un coche de segunda mano?',
      a: 'Si compras a un particular, el ITP autonómico —en torno al 4% en la mayoría de comunidades— más la tasa de la DGT por el cambio de titularidad. Si compras a un profesional, en vez de ITP hay IVA, normalmente ya incluido en el precio anunciado.',
    },
    {
      q: '¿Sobre qué valor se calcula el ITP de un coche?',
      a: 'Sobre el valor fiscal que publica Hacienda para ese modelo, corregido por un coeficiente de antigüedad, no sobre lo que pagaste. Escriturar un precio bajo no reduce el impuesto: Hacienda liquida sobre su propia tabla.',
    },
    {
      q: '¿Cuánto tiempo tengo para el cambio de nombre?',
      a: 'Treinta días desde la compra. Pasado el plazo hay sanción, y mientras el cambio no se haga, las multas y el impuesto siguen llegando al titular anterior, que puede reclamar por vía civil pero sigue figurando como responsable.',
    },
    {
      q: '¿Qué es la etiqueta ambiental de la DGT y para qué sirve?',
      a: 'Clasifica el vehículo según sus emisiones en cuatro categorías, de Cero a B, con los más antiguos sin etiqueta. Determina si puedes circular y aparcar en las zonas de bajas emisiones de las ciudades grandes, y algunas ciudades la usan para bonificar el impuesto o el aparcamiento regulado.',
    },
    {
      q: '¿Cuánto cuesta cada kilómetro de verdad?',
      a: 'Bastante más que el combustible: hay que repartir también el seguro, el impuesto, la ITV, el mantenimiento y los neumáticos entre los kilómetros que haces. Por eso quien hace pocos kilómetros al año paga un coste unitario muy alto, y suele ser quien más se beneficia de alternativas.',
    },
    {
      q: '¿Por qué mi seguro sube si no he dado ningún parte?',
      a: 'Porque la prima no depende sólo de tu historial: se recalcula cada año con la siniestralidad de tu zona, de tu modelo y con el coste de las reparaciones, que ha subido mucho. La bonificación por no dar partes amortigua la subida, pero no siempre la compensa.',
    },
  ],

  sources: [
    {
      name: 'Ley Reguladora de las Haciendas Locales — Impuesto sobre Vehículos de Tracción Mecánica',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'DGT — trámites de cambio de titularidad y tasas',
      url: 'https://sede.dgt.gob.es/es/vehiculos/cambio-de-titularidad/',
      publisher: 'Dirección General de Tráfico',
    },
    {
      name: 'DGT — distintivos ambientales',
      url: 'https://www.dgt.es/nuestros-servicios/permisos-de-conducir/tramites-y-gestiones/distintivo-ambiental/',
      publisher: 'Dirección General de Tráfico',
    },
    {
      name: 'Real Decreto 920/2017 — inspección técnica de vehículos',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2017-12841',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Precios de carburantes en estaciones de servicio',
      url: 'https://geoportalgasolineras.es/',
      publisher: 'Ministerio para la Transición Ecológica',
    },
  ],

  replaces: [
    '/calculadora-impuesto-circulacion-vehiculos-espana-municipio',
    '/calculadora-precio-itv-espana-2026-comunidad-tipo-vehiculo',
    '/calculadora-seguro-coche-precio-espana-2026-edad-bonus-malus',
    '/calculadora-itp-transferencia-coche-segunda-mano-espana',
    '/calculadora-coste-km-coche-espana-peajes-vs-alternativa',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Tarifas estatales del IVTM por caballos fiscales. Espejo de la fórmula vieja. */
export const IVTM_TARIFAS: Record<string, number> = {
  menos8: 12.62,
  '8a12': 34.08,
  '12a16': 71.94,
  '16a20': 89.61,
  mas20: 112.0,
};

/** Coeficientes municipales del IVTM. Espejo de la fórmula vieja. */
export const IVTM_COEFICIENTES: Record<string, { nombre: string; coef: number }> = {
  madrid: { nombre: 'Madrid', coef: 1.6 },
  barcelona: { nombre: 'Barcelona', coef: 1.939 },
  valencia: { nombre: 'Valencia', coef: 1.7 },
  sevilla: { nombre: 'Sevilla', coef: 1.8 },
  zaragoza: { nombre: 'Zaragoza', coef: 1.7 },
  malaga: { nombre: 'Málaga', coef: 1.7 },
  bilbao: { nombre: 'Bilbao', coef: 1.8 },
};

export const ITV = ITV_2026;

/** Tasas de la DGT por cambio de titularidad. Espejo de la fórmula vieja. */
export const TASAS_DGT = { coche: 55.7, moto: 27.85 };

/** Mantenimiento y neumáticos de referencia, por kilómetro. */
export const MANTENIMIENTO_POR_KM = 0.035;

/** Periodicidad de la ITV en turismos: cada 2 años hasta los 10 y anual después. */
export const ITV_PERIODICIDAD = { hasta10Anios: 2, despues: 1 };
