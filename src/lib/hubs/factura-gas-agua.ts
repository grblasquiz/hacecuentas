import type { HubData } from './types';

/**
 * Hub de decisión — "Gas y agua: ¿cuánto voy a pagar?"
 * Arquetipo RAMIFICADO: cuatro caminos reales (factura de gas de red, zonas
 * frías, garrafa y consumo de agua).
 *
 * Absorbe 9 calculadoras sueltas (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - El hub MEZCLA unidades: pesos, m³, kg, días y litros. El resultado declara
 *    su `format` por rama y TODAS las filas que no son plata declaran el suyo.
 *    Una fila sin `format` propio cae a pesos y la página miente.
 *  - El cuadro de gas NO se inventa acá: es copia fiel de
 *    `src/lib/formulas/tarifa-gas-metrogas-naturgy-cuadro-2026.ts` (cuadro
 *    ENARGAS). Es la MISMA fuente que usa el hub hermano /hogar/climatizacion,
 *    que deriva de la categoría R23 un precio marginal de $133,39 por m³
 *    (componente variable de gas + distribución, con 27% de IVA y 2,5% de
 *    tasas). Acá se usa el cuadro completo, con cargos fijos incluidos.
 *  - El consumo de agua sale del modelo de `src/lib/formulas/consumo-agua-mensual.ts`,
 *    que es el más completo de los tres módulos de agua del repo.
 */
export const hub: HubData = {
  slug: 'hogar/gas-y-agua',
  title: 'Gas y agua: ¿cuánto voy a pagar? Factura, zona fría, garrafa y consumo',
  description:
    'Estimá la factura bimestral de gas natural con el cuadro ENARGAS por categoría, calculá la bonificación de zona fría, cuánto te dura y cuánto te cuesta la garrafa, y cuántos litros de agua gasta tu casa por mes.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'Guía y estimación del hogar',
  h1: 'Gas y agua: ¿cuánto voy a pagar?',
  lede:
    'Son las dos boletas del hogar que menos se entienden. La de gas se arma con dos cargos fijos, dos componentes variables y un 29,5% de impuestos encima; la de agua, en la mayor parte del AMBA, ni siquiera mira lo que consumís. Acá estimás las dos, más la bonificación de zona fría y la cuenta de la garrafa.',
  stamps: ['Actualizado 27-07-2026', 'Cuadro ENARGAS · Ley 27.637 de zona fría', '9 calculadoras adentro'],

  resultLabel: 'Factura de gas estimada (bimestre)',

  cases: {
    title: '¿Qué querés averiguar?',
    intro: 'Partimos por la pregunta más frecuente. Si buscás otra cosa, cambiala.',
    items: [
      {
        id: 'gas-red',
        label: 'Estimar la factura de gas de red',
        hint: 'El caso más común',
        answer:
          'La factura de gas es bimestral: dos cargos fijos, dos componentes variables por m³ y un 29,5% de impuestos sobre todo eso.',
        yes: [
          'Cargo fijo del gas (PIST) y cargo fijo de distribución, que se pagan aunque no abras la llave',
          'Componente variable del gas y componente variable de distribución, ambos por metro cúbico consumido',
          'La categoría R (de R11 a R34) que te asigna la distribuidora según tu consumo anual: cambia todos los valores del cuadro',
          'La bonificación por subsidio, si te corresponde, que se aplica sobre la base antes de impuestos',
          'IVA del 27% (alícuota agravada de servicios públicos domiciliarios) más un 2,5% de tasa de ENARGAS y cargos fiduciarios',
        ],
        warn: [
          'La categoría no la elegís vos: la asigna la distribuidora según tu consumo histórico y sube sola si el invierno te empuja arriba del umbral',
          'Los cargos fijos son la mitad de la factura de un consumo chico: bajar el consumo mueve menos de lo que parece',
          'Los medidores se leen cada dos meses; una factura estimada se regulariza en el período siguiente y llega abultada',
          'En zona litoral e interior (Naturgy) el componente de distribución es alrededor de un 8% más caro',
        ],
        plazo: 'el reclamo por facturación ante ENARGAS se presenta dentro de los 30 días de recibida la boleta.',
      },
      {
        id: 'zona-fria',
        label: 'Cuánto me bonifica la zona fría',
        hint: 'Ley 27.637',
        answer:
          'El régimen de zona fría bonifica un 30% de la tarifa de gas, y un 50% si el hogar entra en los grupos protegidos.',
        yes: [
          'La bonificación se aplica sobre la tarifa completa de gas: componente del gas más distribución, cargos fijos incluidos',
          'Alcanza a la Patagonia, La Pampa, Malargüe y las localidades frías incorporadas por la Ley 27.637 en Buenos Aires, Córdoba, San Luis, Mendoza, Santa Fe, Salta, Jujuy, Tucumán, Catamarca y La Rioja',
          'El descuento base es del 30% y sube al 50% para jubilados y pensionados con haberes bajos, titulares de AUH y AUE, monotributistas sociales, electrodependientes, hogares con certificado de discapacidad y beneficiarios de pensiones no contributivas',
          'Se puede acumular con el subsidio general: son dos descuentos distintos sobre la misma base',
        ],
        warn: [
          'La bonificación aplica sólo a gas natural por red: si usás garrafa, este régimen no te alcanza (para garrafas existe el Programa Hogar, que es otra cosa)',
          'No es automática en todos los casos: si sos beneficiario del 50% y no figurás, hay que acreditarlo ante la distribuidora',
          'El listado de localidades incluidas es taxativo: dos pueblos vecinos pueden estar uno dentro y el otro fuera',
          'El financiamiento del régimen se sostiene con un recargo sobre el resto de los usuarios del país y su continuidad se discute cada tanto',
        ],
        plazo: 'la incorporación al régimen se pide en la distribuidora y se refleja en la factura del período siguiente.',
      },
      {
        id: 'garrafa',
        label: 'Cuánto me dura y cuánto sale la garrafa',
        hint: 'Sin gas de red',
        answer:
          'Una garrafa de 10 kg para tres personas que sólo cocinan dura cerca de 50 días; si además calefacciona, no llega a tres semanas.',
        yes: [
          'El consumo se estima por uso: sólo cocina, cocina más calefón, o cocina más estufa',
          'Se escala por la cantidad de personas del hogar',
          'Se calcula cuántos días te dura el envase que usás (10, 15 o 45 kg) y cuántas garrafas necesitás por mes',
          'El costo mensual usa el precio que pagás vos, porque el valor de la garrafa varía muchísimo por región y por vendedor',
          'Se compara contra lo que costaría la misma energía en gas natural de red, equiparando por poder calorífico',
        ],
        warn: [
          'La garrafa es sensiblemente más cara por unidad de energía que el gas natural de red: la comparación de abajo muestra la diferencia',
          'El precio de referencia oficial y el precio de la reventa en el barrio pueden diferir bastante; poné el que pagás vos',
          'El consumo de invierno con estufa puede duplicar la estimación: son valores promedio de todo el año',
          'El Programa Hogar bonifica una parte del valor de la garrafa a hogares que califican y no está incluido en esta cuenta',
        ],
        plazo: 'conviene tener siempre una garrafa de repuesto: se terminan de noche y en invierno.',
      },
      {
        id: 'agua',
        label: 'Cuánta agua gasta mi casa',
        hint: 'Litros y metros cúbicos',
        answer:
          'La ducha explica la mitad del consumo: la referencia razonable es de 100 litros por persona por día.',
        yes: [
          'Se suman los cinco usos que explican casi todo: duchas, inodoro, cocina, lavarropas y otros',
          'La ducha se estima a 9 litros por minuto, que es el caudal típico de una ducha común',
          'El inodoro, a 8 litros por descarga y cinco descargas por persona por día',
          'El lavarropas, a 60 litros por lavado completo',
          'El resultado se pasa a metros cúbicos y a pesos con el valor del m³ que figure en tu factura',
        ],
        warn: [
          'En el AMBA la mayoría de los hogares de AySA NO tiene medidor: la factura se calcula por características del inmueble, así que bajar el consumo no baja la boleta (sí importa si tenés medidor o si la red es de otra prestataria)',
          'Una canilla que gotea pierde entre 30 y 50 litros por día y no aparece en ninguna de estas cuentas',
          'Un inodoro con la válvula perdiendo puede irse a más de 200 litros por día: es la fuga más cara y la más común',
          'Una ducha con cabezal de bajo caudal baja de 9 a 6 litros por minuto sin que se note en la presión',
        ],
        plazo: 'la prueba de fuga es simple: cerrá todas las canillas y mirá si el medidor sigue girando.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada rama usa los campos que le sirven. Los demás podés dejarlos como están.',
  fields: [
    {
      id: 'm3_bimestral',
      label: 'Consumo de gas del bimestre',
      type: 'number',
      suffix: 'm³',
      min: 0,
      max: 5000,
      step: 1,
      value: 200,
      thousands: true,
      help: 'Está en tu factura, en el renglón de lectura del medidor. Un hogar del AMBA con calefacción anda entre 150 y 350 m³ por bimestre de invierno.',
    },
    {
      id: 'categoria',
      label: 'Categoría tarifaria',
      type: 'select',
      value: 'R23',
      options: [
        { value: 'R11', label: 'R1-1 (consumo muy bajo)' },
        { value: 'R12', label: 'R1-2' },
        { value: 'R13', label: 'R1-3' },
        { value: 'R21', label: 'R2-1' },
        { value: 'R22', label: 'R2-2' },
        { value: 'R23', label: 'R2-3 (la más común con calefacción)' },
        { value: 'R31', label: 'R3-1' },
        { value: 'R32', label: 'R3-2' },
        { value: 'R34', label: 'R3-4 (consumo muy alto)' },
      ],
      help: 'Figura arriba a la derecha de tu factura. La asigna la distribuidora según tu consumo anual.',
    },
    {
      id: 'subsidio',
      label: 'Bonificación por subsidio',
      type: 'select',
      value: 'ninguno',
      options: [
        { value: 'ninguno', label: 'Sin subsidio (tarifa plena)' },
        { value: 'medio', label: 'Con subsidio — bonificación 40%' },
        { value: 'alto', label: 'Con subsidio ampliado — bonificación 55%' },
      ],
      help: 'El porcentaje que te bonifican figura en la factura como descuento sobre la tarifa. Si no estás seguro, mirá si tu boleta trae una línea de bonificación.',
    },
    {
      id: 'zona',
      label: 'Zona de la distribuidora',
      type: 'select',
      value: 'gba',
      options: [
        { value: 'gba', label: 'GBA / AMBA (Metrogas)' },
        { value: 'litoral', label: 'Litoral e interior (Naturgy y otras)' },
      ],
      help: 'Fuera del AMBA el componente de distribución es alrededor de un 8% más caro.',
    },
    {
      id: 'zona_fria',
      label: 'Régimen de zona fría',
      type: 'select',
      value: 'general',
      options: [
        { value: 'no', label: 'No me corresponde' },
        { value: 'general', label: 'Zona fría — bonificación 30%' },
        { value: 'beneficiario', label: 'Zona fría, grupo protegido — bonificación 50%' },
      ],
      help: 'Ley 27.637. El 50% es para jubilados con haberes bajos, AUH, electrodependientes, certificado de discapacidad y otros grupos.',
    },
    {
      id: 'personas',
      label: 'Personas en la casa',
      type: 'number',
      min: 1,
      max: 20,
      step: 1,
      value: 4,
    },
    {
      id: 'tipo_garrafa',
      label: 'Envase de garrafa',
      type: 'select',
      value: 'kg10',
      options: [
        { value: 'kg10', label: 'Garrafa de 10 kg' },
        { value: 'kg15', label: 'Garrafa de 15 kg' },
        { value: 'kg45', label: 'Tubo de 45 kg' },
      ],
    },
    {
      id: 'uso_garrafa',
      label: 'Para qué usás el gas envasado',
      type: 'select',
      value: 'cocina_calefon',
      options: [
        { value: 'solo_cocina', label: 'Sólo cocina' },
        { value: 'cocina_calefon', label: 'Cocina y calefón' },
        { value: 'cocina_estufa', label: 'Cocina y estufa' },
      ],
    },
    {
      id: 'precio_garrafa',
      label: 'Precio que pagás por el envase',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000,
      step: 100,
      value: 12000,
      thousands: true,
      help: 'Poné el precio real que te cobran: varía muchísimo entre el valor de referencia oficial y la reventa del barrio.',
    },
    {
      id: 'duchas_dia',
      label: 'Duchas por día en toda la casa',
      type: 'number',
      min: 0,
      max: 40,
      step: 1,
      value: 4,
    },
    {
      id: 'min_ducha',
      label: 'Duración de cada ducha',
      type: 'number',
      suffix: 'min',
      min: 0,
      max: 60,
      step: 1,
      value: 8,
      help: 'A 9 litros por minuto, cada minuto de más son 270 litros al mes por ducha diaria.',
    },
    {
      id: 'lavados_semana',
      label: 'Lavados de ropa por semana',
      type: 'number',
      min: 0,
      max: 30,
      step: 1,
      value: 3,
    },
    {
      id: 'costo_m3_agua',
      label: 'Valor del m³ de agua',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 100000,
      step: 10,
      value: 200,
      thousands: true,
      help: 'Sólo sirve si tenés medidor. Poné el valor que figure en tu factura; si no tenés medidor, la boleta no depende de los litros que uses.',
    },
  ],
  fineprint:
    'Es una estimación orientativa y el cuadro tarifario de gas que usa está sin verificar contra el último publicado por ENARGAS: en julio de 2026 hubo un aumento (Res. 175/2026 y 204/2026) que esta página todavía no refleja, así que tomá el resultado como orden de magnitud y no como el importe de tu boleta. Los cuadros cambian varias veces al año, la categoría R la asigna tu distribuidora y la factura puede incluir cuotas, ajustes o consumos estimados. En agua, la mayoría de los hogares de AySA no tiene medidor y la boleta no depende del consumo. El número que manda siempre es el de tu factura.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparte',
    caption:
      'En la factura de gas el gráfico separa lo que es gas, lo que es distribución y lo que son impuestos. En zona fría compara lo que pagás con lo que te bonifican; en garrafa, la garrafa contra el gas de red; y en agua, adónde se van los litros del mes.',
  },
  breakdownTitle: 'Cómo se arma el número',
  breakdownIntro:
    'Cada fila trae su unidad: hay pesos, metros cúbicos, kilos, días y litros. Las barras comparan cada concepto con el mayor.',

  faq: [
    {
      q: '¿Cómo se calcula la factura de gas natural en Argentina?',
      a: 'Se suman cuatro conceptos y después los impuestos. Los cuatro conceptos son: cargo fijo del gas, gas consumido (metros cúbicos por el precio del componente PIST), cargo fijo de distribución y distribución variable (los mismos metros cúbicos por el componente de red). Sobre esa base se aplica la bonificación por subsidio si corresponde, y sobre lo que queda se cargan un IVA del 27% y alrededor de un 2,5% entre tasa de ENARGAS y cargos fiduciarios. La facturación es bimestral, así que para saber el gasto mensual hay que dividir por dos.',
    },
    {
      q: '¿Qué significa la categoría R1, R2 o R3 de mi factura de gas?',
      a: 'Es la categoría residencial que te asigna la distribuidora según tu consumo anual medido en metros cúbicos. Las R1 son de consumo bajo, las R2 intermedias y las R3 altas, y cada una tiene su propio cuadro: cargos fijos y precios por metro cúbico más caros a medida que subís. No la elegís vos y puede cambiar sola de un año a otro si un invierno frío te empuja arriba del umbral. Por eso a veces la factura sube más de lo que subió el consumo.',
    },
    {
      q: '¿Por qué el IVA de la factura de gas es del 27% y no del 21%?',
      a: 'Porque los servicios públicos domiciliarios tienen la alícuota agravada del artículo 28 de la ley 23.349 cuando el titular es responsable inscripto o cuando el suministro no está destinado a vivienda. En la práctica, buena parte de las facturas residenciales de gas y de luz llega con IVA del 27%. Si en tu boleta figura 21%, usá ese valor: cambia el total en alrededor de un 5%.',
    },
    {
      q: '¿Cuánto descuenta la bonificación de zona fría?',
      a: 'El régimen de la Ley 27.637 bonifica el 30% de la tarifa de gas para los hogares de las zonas alcanzadas, y el 50% para grupos protegidos: jubilados y pensionados con haberes bajos, titulares de la AUH y la AUE, monotributistas sociales, electrodependientes, hogares con certificado de discapacidad y beneficiarios de pensiones no contributivas. El descuento se aplica sobre la tarifa de gas, no sobre el total con impuestos, y puede acumularse con el subsidio general.',
    },
    {
      q: '¿Qué provincias entran en la zona fría del gas?',
      a: 'El régimen original cubría la Patagonia (Neuquén, Río Negro, Chubut, Santa Cruz y Tierra del Fuego), La Pampa y el departamento de Malargüe en Mendoza. La Ley 27.637 lo amplió a localidades frías de Buenos Aires, Córdoba, San Luis, el resto de Mendoza, Santa Fe, Salta, Jujuy, Tucumán, Catamarca y La Rioja. El listado es por localidad y es taxativo: hay que verificar la propia en la distribuidora, porque dos pueblos vecinos pueden tener suerte distinta.',
    },
    {
      q: '¿Cuánto dura una garrafa de 10 kg?',
      a: 'Depende del uso y de cuánta gente vive en la casa. Para un hogar de tres personas, sólo cocinando, el consumo típico es de unos 6 kg por mes: la garrafa de 10 kg dura alrededor de 50 días. Sumando calefón sube a unos 12 kg por mes y la garrafa no llega a los 25 días. Con estufa, el consumo trepa a unos 18 kg mensuales y hace falta casi dos garrafas por mes.',
    },
    {
      q: '¿Conviene garrafa o gas natural de red?',
      a: 'Por unidad de energía, el gas natural de red es bastante más barato. Un kilo de gas licuado entrega alrededor de 12,8 kWh y un metro cúbico de gas natural unos 10,4 kWh, así que un kilo de garrafa equivale a cerca de 1,23 metros cúbicos de red. Comparando el precio de la garrafa contra lo que costarían esos metros cúbicos en el cuadro tarifario, la diferencia suele ser de varias veces. Lo que encarece el gas de red es la conexión inicial, no el consumo.',
    },
    {
      q: '¿Cuántos litros de agua gasta una persona por día?',
      a: 'La referencia de la Organización Mundial de la Salud para cubrir todas las necesidades domésticas con comodidad es de unos 100 litros por persona por día. En la práctica, un hogar urbano argentino con ducha diaria de ocho minutos suele estar entre 120 y 200 litros por persona. Arriba de 200 conviene revisar fugas y hábitos de ducha antes que cualquier otra cosa.',
    },
    {
      q: '¿Qué gasta más agua en una casa?',
      a: 'La ducha, con diferencia: a 9 litros por minuto, una ducha de ocho minutos son 72 litros, y en un hogar de cuatro personas eso puede ser la mitad del consumo total. Le sigue el inodoro, con unos 8 litros por descarga y cinco descargas por persona por día. El lavarropas usa alrededor de 60 litros por ciclo completo, y la cocina y la limpieza suman entre 10 y 20 litros por persona.',
    },
    {
      q: '¿Sirve ahorrar agua si no tengo medidor?',
      a: 'Para la factura, no: en la mayor parte del área de AySA el servicio no está medido y la boleta se calcula por las características del inmueble, así que gastar menos litros no baja el importe. Para el sistema, sí: menos consumo es menos presión sobre las plantas potabilizadoras y sobre las napas. Y si tenés medidor, o estás en una prestataria que factura por consumo, el ahorro se ve directo en pesos.',
    },
    {
      q: '¿Cómo bajo el consumo de agua sin resignar comodidad?',
      a: 'Por orden de impacto: revisá que el inodoro no pierda, que es la fuga más cara y más silenciosa; poné un cabezal de bajo caudal, que baja la ducha de 9 a 6 litros por minuto sin que se note; acortá la ducha dos o tres minutos; usá el lavarropas con carga completa; y arreglá canillas que gotean, que son 30 a 50 litros diarios cada una.',
    },
    {
      q: '¿Qué hago si la factura de gas me llegó mal?',
      a: 'Primero fijate si la boleta dice "estimada" en lugar de "leída": es el motivo más frecuente de una factura desproporcionada, porque el consumo real se regulariza recién en el período siguiente. Después reclamá por escrito a la distribuidora y guardá el número de reclamo. Si no hay respuesta o no te conforma, el reclamo sigue ante ENARGAS dentro de los 30 días de recibida la factura, y mientras esté abierto no pueden cortarte el servicio por el importe cuestionado.',
    },
  ],

  sources: [
    {
      name: 'ENARGAS — Cuadros tarifarios de las distribuidoras de gas natural',
      url: 'https://www.enargas.gob.ar/secciones/precios-y-tarifas/cuadros-tarifarios.php',
      publisher: 'Ente Nacional Regulador del Gas',
      date: '2026',
    },
    {
      name: 'Ley 27.637 — Régimen de zona fría: ampliación de la bonificación del gas',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/350000-354999/352128/norma.htm',
      publisher: 'InfoLeg — Ministerio de Justicia',
      date: '2021',
    },
    {
      name: 'Ley 23.349, art. 28 — alícuota de IVA del 27% para servicios públicos domiciliarios',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/42701/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'ENARGAS — Reclamos de usuarios y facturación',
      url: 'https://www.enargas.gob.ar/secciones/atencion-al-usuario/reclamos.php',
      publisher: 'Ente Nacional Regulador del Gas',
    },
    {
      name: 'Secretaría de Energía — Programa Hogar: subsidio a la garrafa de gas licuado',
      url: 'https://www.argentina.gob.ar/economia/energia/programa-hogar',
      publisher: 'Secretaría de Energía de la Nación',
    },
    {
      name: 'AySA — Régimen tarifario, servicio medido y no medido',
      url: 'https://www.aysa.com.ar/usuarios/Facturacion-y-Pagos/regimen-tarifario',
      publisher: 'Agua y Saneamientos Argentinos',
    },
    {
      name: 'ERAS — Ente Regulador de Agua y Saneamiento: reclamos y cuadro tarifario',
      url: 'https://www.eras.gob.ar/',
      publisher: 'Ente Regulador de Agua y Saneamiento',
    },
    {
      name: 'OMS — Cantidad de agua domiciliaria e higiene: la referencia de 100 litros por persona por día',
      url: 'https://www.who.int/water_sanitation_health/publications/2011/tn09_how_much_water_en.pdf',
      publisher: 'Organización Mundial de la Salud',
    },
  ],

  replaces: [
    '/calculadora-gas-natural-consumo-m3',
    '/calculadora-consumo-agua-mensual',
    '/calculadora-factura-gas-estimada',
    '/calculadora-gasto-agua-mensual-hogar-litros',
    '/calculadora-tarifa-gas-metrogas-naturgy-cuadro-2026',
    '/calculadora-garrafa-gas-duracion',
    '/calculadora-gas-natural-subsidio-zonas-frias-patagonia',
    '/calculadora-tarifa-agua-aysa-2026-factura',
    '/calculadora-agua-consumo-hogar-ahorro',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Cuadro tarifario de gas — COPIA FIEL de `TARIFAS_GBA` de
 * `src/lib/formulas/tarifa-gas-metrogas-naturgy-cuadro-2026.ts` (ENARGAS).
 * Valores BIMESTRALES en pesos.
 *   cargoFijoGas   $/bimestre del componente gas (PIST)
 *   variableGas    $/m³ del gas propiamente dicho
 *   cargoFijoDist  $/bimestre del cargo de distribución
 *   variableDist   $/m³ de distribución
 *
 * La categoría R23 de esta tabla (49 + 54 = 103 $/m³ netos) es la misma que usa
 * el hub /hogar/climatizacion para derivar su precio marginal de $133,39 por m³.
 */
export const GAS_CUADRO: Record<
  string,
  { cargoFijoGas: number; variableGas: number; cargoFijoDist: number; variableDist: number }
> = {
  R11: { cargoFijoGas: 2800, variableGas: 28, cargoFijoDist: 3200, variableDist: 32 },
  R12: { cargoFijoGas: 3100, variableGas: 31, cargoFijoDist: 3500, variableDist: 35 },
  R13: { cargoFijoGas: 3400, variableGas: 34, cargoFijoDist: 3900, variableDist: 38 },
  R21: { cargoFijoGas: 3800, variableGas: 38, cargoFijoDist: 4400, variableDist: 43 },
  R22: { cargoFijoGas: 4200, variableGas: 43, cargoFijoDist: 4900, variableDist: 48 },
  R23: { cargoFijoGas: 4700, variableGas: 49, cargoFijoDist: 5500, variableDist: 54 },
  R31: { cargoFijoGas: 5400, variableGas: 57, cargoFijoDist: 6300, variableDist: 62 },
  R32: { cargoFijoGas: 6100, variableGas: 65, cargoFijoDist: 7100, variableDist: 70 },
  R34: { cargoFijoGas: 7200, variableGas: 76, cargoFijoDist: 8400, variableDist: 82 },
};

/** Distribución ~8% más cara fuera del AMBA (mismo módulo real). */
export const FACTOR_LITORAL = 1.08;

/** Bonificación general sobre la tarifa, antes de impuestos (mismo módulo real). */
export const DESCUENTO_SUBSIDIO: Record<string, number> = {
  ninguno: 0,
  medio: 0.4,
  alto: 0.55,
};

/** Bonificación del régimen de zona fría (Ley 27.637). */
export const DESCUENTO_ZONA_FRIA: Record<string, number> = {
  no: 0,
  general: 0.3,
  beneficiario: 0.5,
};

/** IVA agravado de servicios domiciliarios y tasas del sector (mismo módulo real). */
export const GAS_IVA = 0.27;
export const GAS_TASAS = 0.025;
/** Multiplicador que convierte base neta en total facturado: 1,295. */
export const GAS_FACTOR_IMPUESTOS = 1 + GAS_IVA + GAS_TASAS;

/** Kilos por envase (garrafa-gas-duracion.ts). */
export const GARRAFA_KG: Record<string, number> = { kg10: 10, kg15: 15, kg45: 45 };

/** Consumo base en kg/mes para un hogar de 3 personas, por uso (mismo módulo). */
export const GARRAFA_CONSUMO_BASE: Record<string, number> = {
  solo_cocina: 6,
  cocina_calefon: 12,
  cocina_estufa: 18,
};
export const GARRAFA_PERSONAS_BASE = 3;

/**
 * Poder calorífico para poder comparar garrafa contra red.
 * El valor del gas natural (10,4 kWh/m³) es el mismo que usa el hub
 * /hogar/climatizacion. El del gas licuado es el poder calorífico superior
 * estándar del GLP envasado.
 */
export const KWH_POR_M3_GAS_NATURAL = 10.4;
export const KWH_POR_KG_GLP = 12.8;

/** Litros por unidad de uso — modelo de `consumo-agua-mensual.ts`. */
export const AGUA = {
  /** Caudal de una ducha común, litros por minuto. */
  duchaLitrosMinuto: 9,
  /** Descargas de inodoro por persona por día. */
  descargasPersonaDia: 5,
  /** Litros por descarga. */
  litrosDescarga: 8,
  /** Cocina y limpieza, litros por persona por día. */
  cocinaPersonaDia: 12,
  /** Litros por lavado de ropa completo. */
  litrosLavado: 60,
  /** Otros usos, litros por persona por día. */
  otrosPersonaDia: 8,
};

/** Escenario eficiente (modelo de `agua-consumo-hogar-ahorro.ts`). */
export const AGUA_EFICIENTE = {
  /** Cabezal de bajo caudal. */
  duchaLitrosMinuto: 6,
  /** Ducha a la mitad del tiempo. */
  factorMinutos: 0.5,
  /** Inodoro de doble descarga. */
  litrosDescarga: 6,
  /** Recorte en cocina, lavado y otros usos. */
  factorResto: 0.75,
};

/** Referencia de la OMS: litros por persona por día. */
export const OMS_LITROS_PERSONA_DIA = 100;

export const DIAS_MES = 30;
export const MESES_BIMESTRE = 2;
export const SEMANAS_MES = 30 / 7;
