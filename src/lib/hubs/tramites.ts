import type { HubData } from './types';

/**
 * Hub de decisión — "DNI, pasaporte y trámites: ¿cuánto cuesta y qué necesito?"
 * Absorbe 7 URLs de calculadora suelta (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Es un hub MIXTO: cuatro ramas devuelven plata (aranceles) y tres devuelven
 *    un resultado determinístico sin unidad (CBU válido/inválido, CUIL, letra
 *    del DNI). Las ramas sin plata declaran `format:'plain'` en el resultado y
 *    en cada fila; sin eso el runtime imprime "$" y la página miente.
 *  - Los aranceles CADUCAN. Van con fecha de relevamiento en `stamps`, en el
 *    `fineprint` y en el `sub` del resultado, y las fuentes oficiales llevan la
 *    tabla viva. Los tres algoritmos (CBU, CUIL, letra) NO caducan.
 */
export const hub: HubData = {
  slug: 'tramites/dni-y-pasaporte',
  title: 'DNI, pasaporte y trámites: cuánto cuesta y qué necesito',
  description:
    'Cuánto sale renovar el DNI, sacar el pasaporte, pedir el certificado de antecedentes penales o tramitar la residencia, con los plazos de entrega. Y las tres cuentas que se resuelven solas: validar un CBU o CVU e identificar el banco, sacar el CUIL desde el DNI y la letra del DNI.',
  silo: 'Trámites',
  siloHref: '/tramites',

  eyebrow: 'Guía de trámites y documentación',
  h1: 'DNI, pasaporte y trámites: ¿cuánto cuesta y qué necesito?',
  lede:
    'Casi todos los trámites de documentación se resuelven con dos datos: el arancel del organismo y el plazo de entrega. Arrancamos por la renovación del DNI, que es la consulta más frecuente. Si el tuyo es otro —pasaporte, antecedentes penales, residencia— lo cambiás abajo. Y si lo que necesitás es verificar un CBU antes de transferir, sacar tu CUIL o la letra del DNI, esas tres son cuentas exactas: no dependen de ningún arancel.',
  stamps: ['Aranceles relevados 27-07-2026', 'RENAPER · Reincidencia · Migraciones · BCRA', '7 calculadoras adentro'],

  resultLabel: 'Resultado del trámite',

  cases: {
    title: '¿Qué estás resolviendo?',
    intro: 'Partimos de la renovación del DNI, que es la consulta más frecuente. Si el tuyo es otro, cambialo.',
    items: [
      {
        id: 'dni',
        label: 'Renovar o duplicar el DNI',
        hint: 'RENAPER · mayores de 5 años',
        answer: 'La renovación o el duplicado del DNI tienen un arancel único y se entregan en unos 15 días hábiles.',
        yes: [
          'Arancel único del RENAPER, igual para renovación que para duplicado',
          'Entrega estimada en 15 días hábiles, con envío al domicilio declarado',
          'Se hace en cualquier centro de documentación rápida, registro civil o consulado',
          'Llevá el DNI anterior (o la denuncia de extravío si es duplicado) y el comprobante de pago',
        ],
        warn: [
          'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.',
          'Los aranceles del RENAPER se actualizan por resolución: el valor de esta página es el relevado en la fecha del sello, no un precio garantizado',
          'La actualización obligatoria de los 5 y de los 14 años tiene el mismo arancel que cualquier renovación',
          'Si tenés el DNI vencido y viaje próximo, el pasaporte no te sirve de reemplazo dentro del país para trámites que exigen DNI',
        ],
        plazo: 'el DNI se renueva a los 5 y a los 14 años, y después vence cada 15 años.',
      },
      {
        id: 'dni-0-5',
        label: 'Primer DNI de un bebé o chico de hasta 5 años',
        hint: 'RENAPER · gratuito',
        answer: 'El primer DNI de 0 a 5 años es gratuito: $0 de arancel.',
        yes: [
          'Arancel $0: el trámite de 0 a 5 años no se cobra',
          'Entrega estimada en 15 días hábiles',
          'Van los dos progenitores con su DNI y el certificado o la partida de nacimiento',
          'Si va uno solo, hace falta autorización del otro o la constancia que la reemplace',
        ],
        warn: [
          'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.',
          'Gratuito es el arancel, no la gestoría: si delegás el trámite, eso lo cobra el gestor aparte',
          'A los 5 años vence y hay que hacer la actualización, que ya sí tiene arancel',
        ],
        plazo: 'inscribí el nacimiento dentro de los 40 días corridos para evitar la inscripción tardía.',
      },
      {
        id: 'pasaporte',
        label: 'Sacar o renovar el pasaporte',
        hint: 'RENAPER · común o exprés',
        answer: 'El pasaporte común y el exprés se diferencian en el plazo: el exprés cuesta el doble y sale en 96 horas hábiles.',
        yes: [
          'Pasaporte común: arancel base, entrega estimada en 15 días hábiles',
          'Pasaporte exprés: el doble del arancel, entrega estimada en 96 horas hábiles',
          'Validez de 10 años para mayores de edad',
          'Necesitás el DNI vigente: sin DNI en regla no se emite el pasaporte',
        ],
        warn: [
          'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.',
          'Muchos países exigen 6 meses de vigencia del pasaporte al ingresar: mirá la fecha de vencimiento antes de comprar el pasaje',
          'El exprés acelera la emisión, no el turno: si no hay turnos cerca, pagar el exprés no adelanta nada',
          'Los menores necesitan autorización de ambos progenitores para el trámite y para salir del país',
        ],
        plazo: 'sacalo con 3 meses de anticipación si tenés viaje: el cuello de botella es el turno, no la emisión.',
      },
      {
        id: 'antecedentes',
        label: 'Certificado de antecedentes penales',
        hint: 'Reincidencia · común, urgente o exprés',
        answer: 'El certificado de antecedentes penales tiene tres velocidades y vale 30 días desde su emisión.',
        yes: [
          'Común: arancel base, entrega estimada en 5 días',
          'Urgente: el doble del arancel, entrega estimada en 24 horas',
          'Exprés: cuatro veces el arancel base, entrega estimada en 3 horas',
          'Lo emite el Registro Nacional de Reincidencia y sirve para trabajo, visas y trámites migratorios',
        ],
        warn: [
          'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.',
          'Vale 30 días desde la emisión: pedilo cerca de cuando lo tenés que presentar, no antes',
          'El exprés cuesta unas 4 veces el común: conviene sólo si de verdad no podés esperar',
          'Si lo vas a usar en el exterior, en general además necesitás apostilla de La Haya, que es otro trámite con otro arancel',
        ],
        plazo: 'la validez es de 30 días corridos desde la fecha de emisión.',
      },
      {
        id: 'residencia',
        label: 'Residencia y DNI de extranjero',
        hint: 'Migraciones + RENAPER',
        answer: 'La radicación se paga en dos partes: la tasa de Migraciones y, aparte, el DNI de extranjero.',
        yes: [
          'Tasa de la Dirección Nacional de Migraciones según el tipo de residencia',
          'Más el arancel del DNI para extranjeros, que se paga aparte',
          'Residencia temporaria Mercosur: la tasa más baja de las tres',
          'Residencia permanente: tasa intermedia, y es la que habilita el DNI sin vencimiento por residencia',
        ],
        warn: [
          'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.',
          'Los aranceles de Migraciones se actualizan por disposición: verificá el valor vigente antes de pagar',
          'La tasa no incluye la documentación de origen: partida de nacimiento legalizada, apostilla y traducción pública se pagan aparte',
          'Los antecedentes penales del país de origen y de Argentina son requisito y tienen su propio costo',
        ],
        plazo: 'la temporaria dura entre 1 y 2 años y hay que renovarla antes del vencimiento para no caer en irregularidad.',
      },
      {
        id: 'cbu',
        label: 'Validar un CBU o CVU antes de transferir',
        hint: 'Algoritmo BCRA · 22 dígitos',
        answer: 'Un CBU o CVU válido tiene 22 dígitos y sus dos dígitos verificadores tienen que cerrar.',
        yes: [
          'Verificación real de los dos dígitos verificadores del CBU según el esquema del BCRA',
          'Identificación de la entidad por los 3 primeros dígitos y de la sucursal por los 4 siguientes',
          'Distingue CBU de banco de CVU de billetera virtual (Mercado Pago, Ualá, Naranja X)',
          'Detecta el error de tipeo más común: un dígito cambiado hace fallar el verificador',
        ],
        warn: [
          'Que el CBU sea válido no significa que sea de la persona que creés: confirmá el nombre del titular antes de transferir',
          'Un CBU válido puede pertenecer a un tercero. Es la estafa más común: te pasan un CBU real, pero de otra cuenta',
          'El cálculo se hace en tu navegador y el número no se envía a ningún lado, pero igual evitá pegar CBU en sitios que no conocés',
          'Si el verificador falla, no transfieras: pedí que te reenvíen el CBU completo, no lo "corrijas" vos',
        ],
        plazo: 'una transferencia enviada a un CBU válido equivocado no se revierte sola: hay que reclamar al banco.',
      },
      {
        id: 'cuil',
        label: 'Sacar el CUIL o CUIT desde el DNI',
        hint: 'ANSES · módulo 11',
        answer: 'El CUIL se arma con un prefijo, tu DNI con ceros a la izquierda y un dígito verificador módulo 11.',
        yes: [
          'Prefijo 20 para masculino y 27 para femenino, más los 8 dígitos del DNI y el verificador',
          'Si el verificador diera 10, ANSES asigna el prefijo alternativo 23 y recalcula el dígito',
          'Para una persona física el CUIT es el MISMO número que el CUIL',
          'El cálculo es determinístico: no depende de ningún trámite ni de ningún dato fiscal',
        ],
        warn: [
          'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.',
          'El número calculado no reemplaza a la constancia oficial: para presentarla hace falta bajarla de ANSES o de ARCA',
          'Los prefijos 30, 33 y 34 son de personas jurídicas y no se derivan de ningún DNI',
          'Si el prefijo cambia a 23, es porque el 20 o el 27 daban un verificador de dos dígitos: no es un error del cálculo',
        ],
        plazo: 'la constancia de CUIL se descarga gratis y al instante desde anses.gob.ar.',
      },
      {
        id: 'letra',
        label: 'La letra del DNI',
        hint: 'Módulo 11 · valor orientativo',
        answer: 'El DNI argentino no tiene letra verificadora oficial: la letra que circula sale de un módulo 11 orientativo.',
        yes: [
          'Se calcula ponderando los 8 dígitos del DNI y tomando el resto de dividir por 11',
          'El resultado se mapea a una letra de la A a la K',
          'Sirve como control interno de tipeo, igual que el dígito del CUIL',
        ],
        warn: [
          'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.',
          'No la pidas ni la presentes en ningún trámite: el DNI argentino no lleva letra, a diferencia del DNI español',
          'Si un formulario te pide "letra del DNI", casi seguro está pensado para España: revisá antes de completarlo',
          'El verificador que sí es oficial y sí se usa en trámites es el último dígito del CUIL/CUIT',
        ],
        plazo: 'si un trámite te exige un verificador del documento, el que corresponde es el dígito del CUIL.',
      },
    ],
  },

  inputsTitle: 'Completá lo que corresponda a tu caso',
  inputsIntro:
    'Cada rama usa los campos que necesita y se olvida del resto: si estás validando un CBU, el arancel y la cantidad de personas no entran en la cuenta.',
  fields: [
    {
      id: 'modalidad',
      label: 'Modalidad de entrega',
      type: 'select',
      value: 'comun',
      options: [
        { value: 'comun', label: 'Común' },
        { value: 'urgente', label: 'Urgente (24 horas)' },
        { value: 'expres', label: 'Exprés (el más rápido)' },
      ],
      help: 'Aplica al pasaporte y al certificado de antecedentes. El pasaporte sólo tiene común y exprés: si elegís urgente, se cotiza como exprés. El DNI tiene un único trámite.',
    },
    {
      id: 'residencia',
      label: 'Tipo de residencia (sólo para la rama de radicación)',
      type: 'select',
      value: 'mercosur',
      options: [
        { value: 'mercosur', label: 'Temporaria Mercosur' },
        { value: 'no-mercosur', label: 'Temporaria fuera del Mercosur' },
        { value: 'permanente', label: 'Permanente' },
      ],
      help: 'La nacionalidad define la tasa: los países del Mercosur y asociados tienen un régimen más barato.',
    },
    {
      id: 'personas',
      label: 'Cuántas personas hacen el trámite',
      type: 'number',
      min: 1,
      max: 12,
      value: 1,
      help: 'Multiplica el arancel. Sirve para presupuestar el pasaporte de toda la familia antes de un viaje.',
    },
    {
      id: 'dni',
      label: 'Número de DNI (para el CUIL y la letra)',
      type: 'text',
      value: '30.123.456',
      help: 'Sólo los números; los puntos se ignoran. El cálculo se hace en tu navegador.',
    },
    {
      id: 'sexo',
      label: 'Género registrado en el DNI (define el prefijo del CUIL)',
      type: 'select',
      value: 'M',
      options: [
        { value: 'M', label: 'Masculino — prefijo 20' },
        { value: 'F', label: 'Femenino — prefijo 27' },
        { value: 'X', label: 'No binario / otro' },
      ],
      help: 'El prefijo del CUIL sale del género registrado. Si es X, se calcula con el 20, que es lo que hace ANSES por defecto.',
    },
    {
      id: 'cbu',
      label: 'CBU o CVU a validar (22 dígitos)',
      type: 'text',
      value: '0110000612345678901233',
      help: 'Pegalo tal cual te lo pasaron. Se aceptan espacios y guiones: se limpian solos.',
    },
  ],
  fineprint:
    'Los aranceles son los relevados en la fecha del sello y se actualizan por resolución de cada organismo: verificá el valor vigente en la fuente oficial antes de pagar. Los tres cálculos determinísticos —CBU, CUIL y letra del DNI— no caducan: son algoritmos fijos.',

  chart: {
    type: 'donut',
    title: 'Cómo se compone el resultado',
    caption:
      'En las ramas de costo el gráfico parte el total entre el arancel base y lo que agrega la urgencia o el segundo organismo, para que veas cuánto estás pagando por apurar el trámite. En las ramas de verificación parte el número en sus bloques: en el CBU, los 8 dígitos de entidad y sucursal contra los 14 de la cuenta, en verde el bloque cuyo verificador cierra y en rojo el que falla.',
  },
  breakdownTitle: 'Los números de tu trámite',
  breakdownIntro:
    'Cada fila declara su propia unidad: las de arancel van en pesos y las de verificación en cantidades. Las barras comparan cada valor con el mayor.',

  faq: [
    {
      q: '¿Cuánto sale renovar el DNI en Argentina?',
      a: 'La renovación y el duplicado del DNI tienen el mismo arancel del RENAPER, con entrega estimada en 15 días hábiles. El primer DNI de 0 a 5 años es gratuito. Los valores se actualizan por resolución, así que el importe que ves acá es el relevado en la fecha del sello: antes de pagar confirmalo en el tarifario oficial del RENAPER, que es la única fuente que manda.',
    },
    {
      q: '¿Cuánto cuesta el pasaporte y cuál es la diferencia entre el común y el exprés?',
      a: 'El exprés cuesta el doble que el común y la diferencia es sólo el plazo: 96 horas hábiles contra unos 15 días hábiles. Ojo con una confusión frecuente: el exprés acelera la emisión, no el turno. Si el primer turno disponible es dentro de tres semanas, pagar el exprés no te adelanta nada. Y para viajar, muchos países exigen que el pasaporte tenga al menos 6 meses de vigencia al momento de ingresar.',
    },
    {
      q: '¿Cómo sé si un CBU es válido antes de transferir?',
      a: 'Un CBU o CVU tiene 22 dígitos partidos en dos bloques: 8 (3 de entidad, 4 de sucursal y 1 verificador) y 14 (13 de cuenta y 1 verificador). Cada verificador se calcula ponderando los dígitos del bloque por una serie fija y tomando el complemento a 10 de la suma. Si alguno no cierra, hay un error de tipeo. Pero cuidado: que el CBU sea válido no dice de quién es. Confirmá siempre el nombre del titular antes de mandar la plata.',
    },
    {
      q: '¿De qué banco es un CBU?',
      a: 'Los tres primeros dígitos son el código de entidad del BCRA y los cuatro siguientes, la sucursal. Por ejemplo, 011 es el Banco de la Nación Argentina, 007 Galicia, 017 BBVA, 072 Santander, 285 Macro y 191 Credicoop. Cuando los tres primeros dígitos son 000 se trata de un CVU de billetera virtual: 0000003 corresponde a Mercado Pago, 0000058 a Ualá y 0000168 a Naranja X.',
    },
    {
      q: '¿Cuál es la diferencia entre CBU y CVU?',
      a: 'El formato es idéntico —22 dígitos y los mismos dos dígitos verificadores— y ambos sirven para recibir y enviar transferencias. Lo que cambia es la entidad detrás: el CBU corresponde a una cuenta bancaria y el CVU a una cuenta de un proveedor de servicios de pago, o sea una billetera virtual. La plata que está en un CVU no tiene garantía de depósitos, que es la diferencia práctica que más importa.',
    },
    {
      q: '¿Cómo se calcula el CUIL desde el DNI?',
      a: 'Se toma el prefijo según el género registrado —20 masculino, 27 femenino—, se le pega el DNI completado con ceros a la izquierda hasta 8 dígitos, y se calcula el verificador por módulo 11: los 10 dígitos se multiplican por la serie 5, 4, 3, 2, 7, 6, 5, 4, 3, 2, se suman, se toma el resto de dividir por 11 y el verificador es 11 menos ese resto. Si el resto es 1 el dígito daría 10, así que ANSES cambia el prefijo a 23 y recalcula.',
    },
    {
      q: '¿El CUIT es el mismo número que el CUIL?',
      a: 'Para una persona física, sí: es exactamente el mismo número, con el mismo prefijo 20, 23 o 27. La diferencia es administrativa: el CUIL lo asigna ANSES para la seguridad social y el CUIT lo da ARCA para la actividad fiscal, pero el número no cambia. Los prefijos 30, 33 y 34 son de personas jurídicas y no se derivan de ningún DNI.',
    },
    {
      q: '¿El DNI argentino tiene letra?',
      a: 'No. A diferencia del DNI español, el documento argentino no lleva ninguna letra verificadora oficial. La letra que circula por internet sale de un cálculo por módulo 11 que sirve como control interno de tipeo, nada más. Si un formulario te pide "letra del DNI", casi seguro está pensado para España. El verificador que sí es oficial y sí se usa en trámites es el último dígito del CUIL o CUIT.',
    },
    {
      q: '¿Cuánto vale el certificado de antecedentes penales y cuánto dura?',
      a: 'Tiene tres velocidades: común con entrega estimada en 5 días, urgente en 24 horas al doble del arancel y exprés en 3 horas a cuatro veces el arancel común. Vale 30 días corridos desde su emisión, así que conviene pedirlo cerca de la fecha en que lo tenés que presentar. Si lo vas a usar en el exterior, en general además necesitás la apostilla de La Haya, que es un trámite aparte con su propio costo.',
    },
    {
      q: '¿Cuánto sale tramitar la residencia en Argentina?',
      a: 'Se paga en dos partes: la tasa de la Dirección Nacional de Migraciones, que depende del tipo de residencia, y aparte el arancel del DNI para extranjeros. La temporaria Mercosur es la más barata, la temporaria fuera del Mercosur la más cara y la permanente queda en el medio. Ninguna de las dos tasas incluye la documentación de origen: partida de nacimiento legalizada, apostilla, traducción pública y antecedentes penales del país de origen se pagan aparte.',
    },
    {
      q: '¿Cada cuánto se renueva el DNI?',
      a: 'Hay dos actualizaciones obligatorias, a los 5 y a los 14 años, y a partir de ahí el documento vence cada 15 años. La actualización de los 5 y la de los 14 tienen el mismo arancel que cualquier renovación. El primer DNI, el de 0 a 5 años, es el único gratuito.',
    },
    {
      q: '¿Se puede transferir plata a un CBU equivocado y recuperarla?',
      a: 'No de forma automática. Si el CBU era válido pero de otra persona, la transferencia se acredita y revertirla depende de que el titular que la recibió acepte devolverla; el banco puede gestionar el reclamo pero no puede debitarle la cuenta por su cuenta. Por eso el paso que de verdad protege no es validar el número sino confirmar el nombre del titular antes de enviar.',
    },
  ],

  sources: [
    {
      name: 'Tarifario de trámites del RENAPER (DNI y pasaporte)',
      url: 'https://www.argentina.gob.ar/interior/renaper/tarifario-de-tramites-de-renaper',
      publisher: 'Registro Nacional de las Personas — RENAPER',
      date: 'relevado 27-07-2026',
    },
    {
      name: 'Certificado de Antecedentes Penales — costos y plazos',
      url: 'https://www.argentina.gob.ar/justicia/reincidencia/certificadodeantecedentespenales',
      publisher: 'Registro Nacional de Reincidencia — Ministerio de Justicia',
      date: 'relevado 27-07-2026',
    },
    {
      name: 'Tasas migratorias y trámites de residencia',
      url: 'https://www.argentina.gob.ar/interior/migraciones',
      publisher: 'Dirección Nacional de Migraciones',
      date: 'relevado 27-07-2026',
    },
    {
      name: 'Comunicación “A” 2514 — Clave Bancaria Uniforme (CBU): estructura y dígitos verificadores',
      url: 'https://www.bcra.gob.ar/Pdfs/comytexord/A2514.pdf',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Consulta y constancia de CUIL',
      url: 'https://www.anses.gob.ar/tramite/consulta-y-constancia-de-cuil',
      publisher: 'ANSES',
    },
  ],

  replaces: [
    '/calculadora-validar-cbu-cvu-identificar-banco',
    '/calculadora-dni-pasaporte-costo-tramite-argentina',
    '/calculadora-letra-dni-argentina',
    '/calculadora-cuil-cuit-desde-dni-argentina',
    '/calculadora-certificado-antecedentes-penales-costo',
    '/calculadora-dni-extranjero-residencia-costo-migraciones',
    '/calculadora-libertad-condicional-dos-tercios-pena',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Aranceles calcados de las fórmulas que este hub absorbe:
 *  - dni-pasaporte-costo-tramite-argentina.ts (tarifario RENAPER)
 *  - certificado-antecedentes-penales-costo.ts (Reincidencia)
 *  - dni-extranjero-residencia-costo-migraciones.ts (DNM + RENAPER)
 *
 * NO duplicar valores en el copy: el texto habla de "el doble" o "cuatro veces"
 * justamente para que la actualización de un número no deje la prosa mintiendo.
 */
export const ARANCELES = {
  /** RENAPER. [costo, plazo de entrega] */
  dni: { comun: [10000, '15 días hábiles'] as [number, string], gratis: [0, '15 días hábiles'] as [number, string] },
  pasaporte: {
    comun: [100000, '15 días hábiles'] as [number, string],
    expres: [200000, '96 horas hábiles'] as [number, string],
  },
  /** Registro Nacional de Reincidencia. */
  antecedentes: {
    comun: [30000, '5 días'] as [number, string],
    urgente: [60000, '24 horas'] as [number, string],
    expres: [120000, '3 horas'] as [number, string],
  },
  /** Migraciones + DNI de extranjero. [tasa DNM, arancel DNI] */
  residencia: {
    mercosur: [35000, 12000] as [number, number],
    'no-mercosur': [90000, 12000] as [number, number],
    permanente: [50000, 12000] as [number, number],
  },
};

/** Códigos de entidad del BCRA. Espejo de validar-cbu-cvu-identificar-banco.ts. */
export const ENTIDADES: Record<string, string> = {
  '007': 'Banco de Galicia y Buenos Aires',
  '011': 'Banco de la Nación Argentina',
  '014': 'Banco de la Provincia de Buenos Aires',
  '015': 'ICBC (ex Standard Bank)',
  '016': 'Citibank N.A.',
  '017': 'BBVA Argentina',
  '020': 'Banco de la Provincia del Neuquén',
  '027': 'Banco Supervielle',
  '029': 'Banco de la Ciudad de Buenos Aires',
  '034': 'Banco Patagonia',
  '044': 'Banco Hipotecario',
  '045': 'Banco de San Juan',
  '065': 'Banco Municipal de Rosario',
  '072': 'Banco Santander Argentina',
  '083': 'Banco del Chubut',
  '086': 'Banco de Santa Cruz',
  '093': 'Banco de La Pampa',
  '094': 'Banco de Corrientes',
  '143': 'Brubank',
  '150': 'HSBC Bank Argentina',
  '191': 'Banco Credicoop Cooperativo',
  '259': 'Banco Itaú Argentina',
  '268': 'Banco Provincia de Tierra del Fuego',
  '269': 'Banco de Servicios y Transacciones (BST)',
  '285': 'Banco Macro',
  '299': 'Banco Comafi',
  '300': 'Banco de Inversión y Comercio Exterior (BICE)',
  '311': 'Nuevo Banco del Chaco',
  '315': 'Banco de Formosa',
  '321': 'Banco de Santiago del Estero',
  '322': 'Banco Industrial (BIND)',
  '330': 'Nuevo Banco de Santa Fe',
  '386': 'Nuevo Banco de Entre Ríos',
  '389': 'Banco Columbia',
};

/** Prefijos de CVU de billeteras virtuales. Espejo de la fórmula original. */
export const PSP: Array<[string, string]> = [
  ['0000003', 'Mercado Pago'],
  ['0000058', 'Ualá'],
  ['0000168', 'Naranja X'],
];

/** Series de ponderación: DV1 del bloque 1, DV2 del bloque 2, y módulo 11 del CUIL. */
export const PESOS = {
  dv1: [7, 1, 3, 9, 7, 1, 3],
  dv2: [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3],
  cuil: [5, 4, 3, 2, 7, 6, 5, 4, 3, 2],
  /** letra-dni-argentina.ts: se recorre el DNI de derecha a izquierda. */
  letra: [2, 3, 4, 5, 6, 7, 2, 3],
};

export const LETRAS = 'ABCDEFGHIJKL';
