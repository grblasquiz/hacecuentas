import type { HubData } from './types';

/**
 * Hub de decisión — "¿Con qué ajustes disparo?"
 * Absorbe 4 calculadoras sueltas (ver `replaces`).
 *
 * HERMANO, NO DUPLICADO: `/tecnologia/fotografia` responde cuánto OCUPAN las
 * fotos y a qué tamaño imprimen. Este responde cómo se CONFIGURA la cámara.
 * No hay una sola URL compartida entre los dos.
 *
 * NOTAS DE CONTRATO:
 *  - ACÁ NO HAY PLATA. El default de `format` es 'ars' y el runtime hace
 *    Object.assign(base, over), así que una fila sin `format` propio saldría en
 *    pesos. Todas las filas declaran 'unit' con su unidad (EV, pasos, s, mm, °,
 *    m, ×) o 'plain'.
 *  - `chart.type: 'scale'`: las cuatro ramas preguntan lo mismo —dónde caigo yo
 *    en un rango con franjas—, así que compute() devuelve SIEMPRE `position`
 *    (0-100) y `positionLabel`, y las franjas viajan en el chart del resultado
 *    con `from`/`to`. Cada rama trae su propia escala porque la magnitud cambia
 *    (EV, segundos, metros, milímetros).
 *
 * MATEMÁTICA (exacta, no tablas redondeadas):
 *   EV de la combinación   EV = log2(N² / t) = log2(N² · d)   con t = 1/d
 *   Luz de la escena       EV100 = EV − log2(ISO / 100)
 *   Filtro ND              t_con = t_sin · 2^pasos ·  factor = 2^pasos
 *   Densidad óptica        D = pasos · log10(2) = pasos · 0,30103
 *   Flash                  GN_efectivo = GN · √(ISO/100) ·  alcance = GN_ef / N
 *   Focal equivalente      FF = focal · crop_origen ·  eq = FF / crop_destino
 *   Ángulo horizontal      AOV = 2 · atan(36 / (2 · FF))  en grados
 *
 * DIFERENCIAS CONTRA LAS FÓRMULAS VIEJAS (verificadas con npx tsx):
 *  1. `exposicion-triangulo.ts` devolvía a la vez la compensación por ISO, por
 *     apertura Y por velocidad, y las presentaba juntas como "quedan
 *     equivalentes". Aplicar las tres a la vez sobrecompensa la foto por el
 *     doble de pasos. Acá se compensa por UNA variable a la vez y se muestra la
 *     escalera completa de combinaciones equivalentes, que es lo que el
 *     fotógrafo realmente elige.
 *  2. `filtro-nd-pasos-exposicion.ts` usaba densidad óptica = pasos × 0,3.
 *     El factor exacto es log10(2) = 0,30103: para un ND de 10 pasos da 3,0103
 *     y no 3,0. La diferencia es cosmética (los filtros se rotulan 3.0) pero el
 *     número que sale acá es el exacto.
 *  3. `filtro-nd-pasos-exposicion.ts` rechazaba `stops < 1`, así que no admitía
 *     medios pasos. Acá se admite desde 0,5.
 *  4. Los crop factors se unifican en los valores nominales del fabricante
 *     (APS-C Canon 1,6 · APS-C resto 1,5 · MFT 2,0 · 1" 2,7 · medio formato
 *     0,79). La calc vieja los recibía como `string` del select y los pasaba
 *     por Number(): mismo criterio, mismos números.
 */
export const hub: HubData = {
  slug: 'tecnologia/ajustes-de-camara',
  title: '¿Con qué ajustes disparo? — Exposición, ND, flash y focal equivalente',
  description:
    'Sacá el EV de tu combinación de ISO, diafragma y velocidad, las combinaciones equivalentes, cuánto se alarga la exposición con un filtro ND, hasta dónde llega tu flash según el número guía y cómo encuadra tu lente en otro sensor.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Guía y calculadoras de fotografía',
  h1: '¿Con qué ajustes disparo?',
  lede:
    'ISO, diafragma y velocidad son tres formas de medir lo mismo: cuánta luz entra. Cargá lo que tenés puesto y salen el EV de la escena, las combinaciones que dan exactamente la misma foto, cuánto se estira la exposición con un ND, hasta dónde ilumina el flash y cómo encuadra esa lente en tu sensor.',
  stamps: ['Actualizado 27-07-2026', 'Fórmulas exactas, sin tablas redondeadas', '4 calculadoras adentro'],

  resultLabel: 'Ajuste estimado',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro: 'Partimos por la exposición, que es la pregunta de fondo. Si buscás otra cosa, cambiala.',
    items: [
      {
        id: 'exposicion',
        label: 'Quiero la exposición correcta',
        hint: 'Triángulo ISO · f/ · velocidad',
        answer: 'Cada paso que sumás en una variable lo tenés que restar en otra.',
        yes: [
          'El EV de la combinación que tenés puesta y el EV100 de la luz de la escena',
          'La escalera de combinaciones equivalentes: la misma foto con más o menos diafragma',
          'Cuántos pasos te separan de la regla del sol f/16',
        ],
        warn: [
          'Equivalente en luz no es equivalente en resultado: cerrar el diafragma suma profundidad de campo y bajar la velocidad agrega movimiento',
          'Subir el ISO no agrega luz, amplifica la señal: gana ruido y pierde rango dinámico',
        ],
        plazo: 'a mano alzada, no bajes de 1/focal equivalente si no tenés estabilizador.',
      },
      {
        id: 'nd',
        label: 'Le pongo un filtro ND',
        hint: 'Larga exposición',
        answer: 'Cada paso de ND duplica el tiempo de exposición.',
        yes: [
          'La velocidad nueva con el filtro puesto, en segundos o minutos',
          'El factor de reducción (2, 4, 8, 1024×) y la densidad óptica rotulada en el filtro',
          'Si te alcanza el obturador de la cámara o necesitás modo Bulb',
        ],
        warn: [
          'Pasados los 30 segundos la cámara no llega sola: hace falta modo Bulb con disparador o intervalómetro',
          'Enfocá y componé ANTES de poner el filtro: con un ND de 10 pasos el visor queda negro y el autofoco no engancha',
        ],
        plazo: 'con más de 1 segundo de exposición el trípode deja de ser opcional.',
      },
      {
        id: 'flash',
        label: '¿Hasta dónde llega mi flash?',
        hint: 'Número guía',
        answer: 'El alcance es el número guía dividido por el diafragma.',
        yes: [
          'El alcance máximo en metros a full power con tu ISO y tu diafragma',
          'El número guía efectivo, que sube con la raíz del ISO',
          'Qué potencia conviene poner para el sujeto que tenés adelante',
        ],
        warn: [
          'El número guía del fabricante se mide a ISO 100, en metros y con el zoom del flash en la posición más tele: en gran angular el alcance real es bastante menor',
          'Rebotar el flash contra el techo te come entre 2 y 3 pasos de alcance',
        ],
        plazo: 'la luz cae con el cuadrado de la distancia: al doble de distancia llega la cuarta parte.',
      },
      {
        id: 'focal',
        label: '¿Cómo encuadra esta lente?',
        hint: 'Focal equivalente y crop',
        answer: 'El sensor no cambia la lente, cambia el recorte.',
        yes: [
          'La focal equivalente en el sensor de destino y en full frame',
          'El ángulo de visión horizontal en grados',
          'Qué tipo de lente es en la práctica: gran angular, normal, retrato o tele',
        ],
        warn: [
          'El crop cambia el encuadre, NO la luminosidad: un f/1.8 sigue dejando pasar la misma luz en APS-C que en full frame',
          'La profundidad de campo sí cambia: para el mismo encuadre, un sensor más chico da más profundidad y menos desenfoque de fondo',
        ],
        plazo: 'el equivalente sirve para comparar encuadres entre cámaras, no para comparar calidad.',
      },
    ],
  },

  inputsTitle: 'Cargá lo que tenés puesto',
  inputsIntro:
    'Cada rama usa los campos que le sirven y deja el resto quieto. Los valores de ejemplo son una tarde nublada a mano alzada.',
  fields: [
    { id: 'iso', label: 'ISO', type: 'number', min: 25, max: 409600, value: 400 },
    {
      id: 'apertura',
      label: 'Diafragma (f/)',
      type: 'select',
      value: '5.6',
      options: [
        { value: '1.4', label: 'f/1.4' },
        { value: '2', label: 'f/2' },
        { value: '2.8', label: 'f/2.8' },
        { value: '4', label: 'f/4' },
        { value: '5.6', label: 'f/5.6' },
        { value: '8', label: 'f/8' },
        { value: '11', label: 'f/11' },
        { value: '16', label: 'f/16' },
        { value: '22', label: 'f/22' },
      ],
    },
    {
      id: 'velocidad',
      label: 'Velocidad: el denominador de 1/x segundos',
      type: 'number',
      min: 1,
      max: 8000,
      value: 125,
      help: 'Si disparás a 1/125 s, poné 125. Para exposiciones de más de un segundo, poné una fracción: 1/2 s es 2.',
    },
    {
      id: 'stops_nd',
      label: 'Pasos del filtro ND',
      type: 'select',
      value: '10',
      options: [
        { value: '1', label: 'ND2 — 1 paso (0.3)' },
        { value: '2', label: 'ND4 — 2 pasos (0.6)' },
        { value: '3', label: 'ND8 — 3 pasos (0.9)' },
        { value: '4', label: 'ND16 — 4 pasos (1.2)' },
        { value: '6', label: 'ND64 — 6 pasos (1.8)' },
        { value: '10', label: 'ND1000 — 10 pasos (3.0)' },
        { value: '15', label: 'ND32000 — 15 pasos (4.5)' },
      ],
    },
    {
      id: 'gn',
      label: 'Número guía del flash (a ISO 100, en metros)',
      type: 'number',
      min: 1,
      max: 200,
      value: 36,
      help: 'Viene en el nombre del modelo: un Godox V860 es GN 60, un flash incorporado ronda GN 12.',
    },
    { id: 'focal', label: 'Distancia focal de la lente (mm)', type: 'number', min: 1, max: 2000, value: 50 },
    {
      id: 'sensor_origen',
      label: 'Sensor de tu cámara',
      type: 'select',
      value: '1.5',
      options: [
        { value: '0.79', label: 'Medio formato (44×33) — crop 0,79×' },
        { value: '1', label: 'Full frame (35 mm) — crop 1×' },
        { value: '1.5', label: 'APS-C Nikon / Sony / Fuji — crop 1,5×' },
        { value: '1.6', label: 'APS-C Canon — crop 1,6×' },
        { value: '2', label: 'Micro 4/3 — crop 2×' },
        { value: '2.7', label: '1 pulgada — crop 2,7×' },
        { value: '5.6', label: 'Celular (1/2.3") — crop 5,6×' },
      ],
    },
    {
      id: 'sensor_destino',
      label: 'Sensor con el que querés comparar',
      type: 'select',
      value: '1',
      options: [
        { value: '0.79', label: 'Medio formato (44×33) — crop 0,79×' },
        { value: '1', label: 'Full frame (35 mm) — crop 1×' },
        { value: '1.5', label: 'APS-C Nikon / Sony / Fuji — crop 1,5×' },
        { value: '1.6', label: 'APS-C Canon — crop 1,6×' },
        { value: '2', label: 'Micro 4/3 — crop 2×' },
        { value: '2.7', label: '1 pulgada — crop 2,7×' },
        { value: '5.6', label: 'Celular (1/2.3") — crop 5,6×' },
      ],
    },
  ],
  fineprint:
    'Los números salen de las fórmulas ópticas, no de tablas redondeadas: EV = log2(N²/t), el ND multiplica el tiempo por 2 elevado a los pasos, el número guía escala con la raíz del ISO y la focal equivalente es la focal por el crop factor. El fotómetro de tu cámara y el reflejo real de la escena mandan por encima de cualquier estimación.',

  chart: {
    type: 'scale',
    title: 'Dónde caés en la escala',
    caption:
      'La regla cambia según lo que estés resolviendo: la luz de la escena en EV100, el tiempo de exposición en segundos, el alcance del flash en metros o el tipo de lente en milímetros equivalentes. El marcador muestra dónde queda tu combinación dentro de esa escala.',
  },
  breakdownTitle: 'Los números de tu configuración',
  breakdownIntro: 'Cada fila trae su propia unidad. Las barras comparan magnitudes dentro de la misma rama.',

  faq: [
    {
      q: '¿Qué es un paso o stop de exposición?',
      a: 'Es duplicar o dividir a la mitad la luz que llega al sensor. Pasar de 1/125 a 1/60 es un paso más de luz, de f/8 a f/5.6 también, y de ISO 400 a ISO 800 también. Por eso las tres variables se pueden intercambiar: lo que sumás en una lo restás en otra y la foto queda igual de expuesta.',
    },
    {
      q: '¿Por qué los diafragmas van 1.4, 2, 2.8, 4, 5.6…?',
      a: 'Porque el número f es la relación entre la focal y el diámetro de la pupila, y la luz que entra depende del área, que crece con el cuadrado. Para duplicar el área hay que multiplicar el diámetro por la raíz de 2, es decir 1,414. De ahí sale la serie: cada valor es el anterior por 1,414.',
    },
    {
      q: '¿Qué es el EV y para qué me sirve?',
      a: 'El EV (exposure value) es un número único que resume la combinación de diafragma y velocidad: todas las combinaciones que dan la misma exposición comparten el mismo EV. El EV100 describe la luz de la escena a ISO 100: una noche urbana ronda EV 3, un interior con luz artificial EV 7, un día nublado EV 12 y pleno sol EV 15.',
    },
    {
      q: '¿Qué es la regla del sol f/16?',
      a: 'Con sol pleno, en f/16 la velocidad correcta es aproximadamente 1 dividido el ISO: a ISO 100, 1/100 s. Equivale a EV 15 a ISO 100 y sirve para verificar que el fotómetro no esté engañado por un fondo muy claro o muy oscuro.',
    },
    {
      q: '¿Cuánto alarga la exposición un filtro ND?',
      a: 'Cada paso duplica el tiempo. Un ND8 (3 pasos) multiplica por 8, un ND1000 (10 pasos) multiplica por 1024. Si sin filtro disparabas a 1/125 s, con un ND de 10 pasos pasás a unos 8 segundos, que es lo que hace falta para que el agua quede sedosa.',
    },
    {
      q: '¿Qué significa el 3.0 que viene impreso en un filtro ND?',
      a: 'Es la densidad óptica, que son los pasos multiplicados por 0,30103 (el logaritmo de 2). Un filtro rotulado 3.0 corta 10 pasos; uno de 1.8, seis pasos. Es la nomenclatura que usan las marcas europeas; los filtros que dicen ND1000 o ND64 están informando el factor de reducción, que es lo mismo dicho de otra manera.',
    },
    {
      q: '¿Cómo se calcula el alcance del flash?',
      a: 'El alcance en metros es el número guía dividido por el diafragma. Un flash de GN 36 a f/5.6 llega a 6,4 metros a ISO 100. Como el número guía se mide a ISO 100, si subís el ISO el alcance crece con la raíz: a ISO 400 el mismo flash llega al doble.',
    },
    {
      q: '¿El número guía del fabricante es real?',
      a: 'Es optimista. Se mide en la posición más tele del zoom del flash, que concentra el haz, y a full power. En gran angular el mismo flash puede perder la mitad del alcance, y si rebotás la luz contra el techo perdés entre 2 y 3 pasos más.',
    },
    {
      q: '¿Qué es el crop factor?',
      a: 'Es cuánto más chico es tu sensor que un full frame de 36×24 mm. Un APS-C de Canon tiene crop 1,6 y uno de Nikon o Sony, 1,5. Como el sensor recorta la imagen que proyecta la lente, un 50 mm en APS-C encuadra como un 75 u 80 mm en full frame.',
    },
    {
      q: '¿Un 50 mm f/1.8 en APS-C se convierte en un f/2.8?',
      a: 'En luz, no: sigue dejando pasar exactamente la misma cantidad y el fotómetro no cambia. Lo que sí se comporta como f/2.8 es la profundidad de campo cuando comparás el MISMO encuadre, porque para encuadrar igual tenés que alejarte. Por eso los sensores chicos desenfocan menos el fondo.',
    },
    {
      q: '¿Cuál es la velocidad mínima para disparar a mano alzada?',
      a: 'La regla clásica es 1 dividido la focal equivalente: con un 50 mm en full frame, 1/50 s. Con un sensor APS-C hay que usar la focal equivalente, así que ese mismo 50 mm pide 1/80 s. Un estabilizador te regala entre 3 y 5 pasos, pero no congela al sujeto si se mueve.',
    },
    {
      q: '¿Conviene subir el ISO o bajar la velocidad?',
      a: 'Depende de qué querés conservar. Si el sujeto se mueve, subí el ISO: una foto con algo de ruido se salva, una movida no. Si está quieto y tenés trípode, bajá la velocidad y dejá el ISO en el mínimo, que es donde el sensor tiene todo su rango dinámico.',
    },
  ],

  sources: [
    {
      name: 'ISO 2721 / ISO 2720 — Fotografía: determinación de la exposición y valores de exposición (EV)',
      url: 'https://www.iso.org/standard/7690.html',
      publisher: 'International Organization for Standardization',
    },
    {
      name: 'ANSI/ISO 1230 y guía de números guía de flash — Guide Number and flash exposure',
      url: 'https://www.iso.org/standard/5806.html',
      publisher: 'International Organization for Standardization',
    },
    {
      name: 'Understanding Exposure Value, aperture scale and neutral density filters',
      url: 'https://www.bhphotovideo.com/explora/photography/tips-and-solutions/understanding-neutral-density-filters',
      publisher: 'B&H Explora',
    },
    {
      name: 'Crop factor y ángulo de visión — comparativa de tamaños de sensor',
      url: 'https://www.dpreview.com/articles/2666934640/what-is-equivalence-and-why-should-i-care',
      publisher: 'DPReview',
    },
  ],

  replaces: [
    '/calculadora-exposicion-triangulo',
    '/calculadora-filtro-nd-pasos-exposicion',
    '/calculadora-flash-numero-guia-distancia',
    '/calculadora-distancia-focal-equivalente',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Escalera estándar de diafragmas, en pasos enteros. */
export const APERTURAS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

/** Densidad óptica por paso: log10(2) exacto, no el 0,3 redondeado. */
export const DENSIDAD_POR_PASO = Math.log10(2);
