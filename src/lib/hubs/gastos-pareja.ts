import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo dividimos los gastos?"
 *
 * Absorbe siete calculadoras sueltas que eran la misma pregunta con distinto
 * recorte: repartir un gasto entre varias personas. Dos ramas reales conviven:
 *  (a) grupo de amigos → quién le debe a quién, con la MENOR cantidad de
 *      transferencias posible (el algoritmo greedy de saldo es el valor real);
 *  (b) pareja con ingresos distintos → reparto proporcional en vez de mitades.
 * La propina es un accesorio de las dos, no una rama con vida propia.
 *
 * Se diferencia de /finanzas-personales/gastos-del-mes (presupuesto propio):
 * acá el reparto es ENTRE PERSONAS.
 */

/** Disclaimer — copiado textual de src/lib/disclaimers.ts (dominio 'general'). */
const DISCLAIMER_GENERAL =
  'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.';

/** Propinas de referencia por país, para la rama de propina. Espejo de src/lib/formulas/propina-viaje.ts. */
export const PROPINA_PAISES: Array<{ id: string; nombre: string; restaurante: number; regla: string }> = [
  { id: 'argentina', nombre: 'Argentina', restaurante: 10, regla: '10% sugerido en restaurantes. En taxi y hotel no se espera.' },
  { id: 'usa', nombre: 'Estados Unidos', restaurante: 20, regla: 'Prácticamente obligatorio: 15-20% en restaurantes, 15% en taxi.' },
  { id: 'uk', nombre: 'Reino Unido', restaurante: 12, regla: 'Muchos locales ya cobran un service charge del 12,5%. Si no, 10%.' },
  { id: 'espana', nombre: 'España', restaurante: 5, regla: 'Opcional. Un 5% si el servicio fue excepcional; en taxi se redondea.' },
  { id: 'francia', nombre: 'Francia', restaurante: 5, regla: 'Va incluido por ley (service compris). Un 5% extra es opcional.' },
  { id: 'italia', nombre: 'Italia', restaurante: 10, regla: 'Suelen cobrar coperto. Propina adicional del 5 al 10%.' },
  { id: 'mexico', nombre: 'México', restaurante: 15, regla: 'Esperado entre 10% y 15% en restaurantes.' },
  { id: 'brasil', nombre: 'Brasil', restaurante: 10, regla: 'La taxa de serviço del 10% suele venir en la cuenta.' },
  { id: 'alemania', nombre: 'Alemania', restaurante: 10, regla: 'Se redondea hacia arriba o se agrega 10%, diciendo "stimmt so".' },
  { id: 'japon', nombre: 'Japón', restaurante: 0, regla: 'No se deja propina: puede tomarse como una ofensa.' },
  { id: 'chile', nombre: 'Chile', restaurante: 10, regla: '10% sugerido; suelen preguntarte antes de cobrarlo.' },
  { id: 'uruguay', nombre: 'Uruguay', restaurante: 10, regla: '10% en restaurantes, no obligatorio.' },
];

export const hub: HubData = {
  slug: 'finanzas-personales/dividir-gastos',
  title: '¿Cómo dividimos los gastos? Quién le debe a quién y con cuántas transferencias',
  description:
    'Dividí gastos entre amigos o en pareja: saldá las cuentas del grupo con la menor cantidad de transferencias posible, repartí proporcional al ingreso cuando ganan distinto y sumá la propina que corresponde.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Reparto entre personas',
  h1: '¿Cómo dividimos los gastos?',
  lede:
    'Partimos del caso más frecuente: salieron o viajaron entre varios, cada uno puso distinto y hay que saldar con la menor cantidad de transferencias. Si lo tuyo es una pareja con ingresos distintos, o solo la propina, cambiá el caso abajo.',
  stamps: [
    'Saldo del grupo con mínimas transferencias',
    'Reparto proporcional al ingreso',
    'Propina por país',
    '7 calculadoras en una',
  ],

  resultLabel: 'Resultado del reparto',

  cases: {
    title: '¿Cómo se reparte?',
    intro: 'Arrancamos por el grupo de amigos, que es la consulta más habitual.',
    items: [
      {
        id: 'amigos',
        label: 'Grupo de amigos: quién le debe a quién',
        hint: 'Cada uno puso lo que pudo. La calculadora salda con la menor cantidad de transferencias.',
        yes: [
          'Se suma todo lo que puso cada uno y se divide en partes iguales entre los participantes',
          'Quien puso de más queda acreedor, quien puso de menos queda deudor',
          'Las transferencias se arman emparejando el deudor más grande con el acreedor más grande: así salen menos movimientos',
          'La propina, si la cargás, se suma al total antes de dividir',
        ],
        warn: [
          DISCLAIMER_GENERAL,
          'Si alguien consumió mucho más que el resto, dividir en partes iguales deja de ser justo: cargá los gastos por separado',
          'Los centavos de redondeo pueden dejar diferencias de pesos: alguien tiene que absorberlos',
        ],
        plazo: 'lo mejor es saldar el mismo día del gasto: cuanto más pasa, más se discute quién puso qué.',
        answer:
          'Con N personas nunca hacen falta más de N−1 transferencias, y en la práctica suelen alcanzar muchas menos.',
      },
      {
        id: 'pareja',
        label: 'Pareja con ingresos distintos',
        hint: 'Reparto proporcional al ingreso, en vez de partir todo al medio.',
        yes: [
          'Cada uno aporta el mismo porcentaje de SU ingreso, no la mitad del gasto',
          'La calculadora muestra cuánto pone cada uno y la diferencia contra un 50/50',
          'Sirve para el alquiler, las expensas, el súper o cualquier gasto común',
        ],
        warn: [
          DISCLAIMER_GENERAL,
          'Proporcional al ingreso no siempre es lo más justo: si uno tiene deudas o hijos a cargo, conviene ajustar la base',
          'Conviene acordar de antemano qué gastos entran al pozo común y cuáles quedan personales',
        ],
        plazo: 'lo práctico es revisar el reparto cada vez que cambia un ingreso, no cada mes.',
        answer:
          'Si uno gana el doble que el otro, le toca aportar dos tercios del gasto, no la mitad.',
      },
      {
        id: 'propina',
        label: 'La cuenta del restaurante y la propina',
        hint: 'Cuánto dejar de propina y cuánto pone cada uno con la propina adentro.',
        yes: [
          'La propina se calcula sobre el consumo, antes de dividir',
          'El total con propina se reparte en partes iguales entre los comensales',
          'Podés usar el porcentaje sugerido del país donde estás',
        ],
        warn: [
          DISCLAIMER_GENERAL,
          'Fijate si la cuenta ya trae un cargo por servicio incluido: si lo trae, sumar otra propina es pagar dos veces',
          'En algunos países dejar propina es una ofensa, en otros es prácticamente obligatorio',
        ],
        plazo: 'la propina se define al momento de pagar; después es incómodo volver atrás.',
        answer:
          'La propina se calcula sobre el consumo y recién después se divide: dividir primero y aplicar el porcentaje encima da lo mismo, pero confunde a la mesa.',
      },
    ],
  },

  inputsTitle: 'Los datos del reparto',
  inputsIntro:
    'Cargá solo lo que necesita tu caso. En el grupo de amigos, el total sale de lo que puso cada uno; en pareja y propina, del campo "gasto total".',
  fields: [
    {
      id: 'gastoTotal',
      label: 'Gasto total o cuenta',
      prefix: '$',
      value: '80.000',
      thousands: true,
      help: 'La cuenta o el gasto a repartir. En el caso de amigos se usa solo si nadie cargó lo que puso.',
    },
    {
      id: 'personas',
      label: 'Cuántas personas lo comparten',
      type: 'number',
      value: 4,
      min: 1,
      max: 30,
      step: 1,
    },
    {
      id: 'propinaPct',
      label: 'Propina a sumar',
      suffix: '%',
      type: 'number',
      value: 10,
      min: 0,
      max: 100,
      step: 1,
      help: 'Poné 0 si no va propina o si la cuenta ya trae el cargo por servicio.',
    },
    {
      id: 'pais',
      label: 'País (referencia de propina)',
      type: 'select',
      value: 'argentina',
      options: PROPINA_PAISES.map((p) => ({
        value: p.id,
        label: p.restaurante === 0 ? `${p.nombre} — no se deja propina` : `${p.nombre} — ${p.restaurante}% sugerido`,
      })),
      help: 'Solo para el caso de propina: pisa el porcentaje de arriba con la costumbre local.',
    },
    {
      id: 'pagoA',
      label: 'Puso la persona A',
      prefix: '$',
      value: '50.000',
      thousands: true,
      help: 'Solo para el caso de amigos: lo que ya desembolsó cada uno.',
    },
    { id: 'pagoB', label: 'Puso la persona B', prefix: '$', value: '30.000', thousands: true },
    { id: 'pagoC', label: 'Puso la persona C', prefix: '$', value: 0, thousands: true },
    { id: 'pagoD', label: 'Puso la persona D', prefix: '$', value: 0, thousands: true },
    {
      id: 'ingresoA',
      label: 'Ingreso mensual de A',
      prefix: '$',
      value: '900.000',
      thousands: true,
      help: 'Solo para el caso de pareja.',
    },
    { id: 'ingresoB', label: 'Ingreso mensual de B', prefix: '$', value: '600.000', thousands: true },
  ],
  fineprint: DISCLAIMER_GENERAL,

  chart: {
    type: 'donut',
    title: 'Cómo queda repartido',
    caption: 'Muestra cuánto le toca finalmente a cada uno sobre el total, para ver de una si el reparto quedó parejo o no.',
  },
  breakdownTitle: 'El reparto, paso a paso',
  breakdownIntro: 'Las barras comparan cada monto contra el mayor del reparto.',

  faq: [
    {
      q: '¿Cuál es la menor cantidad de transferencias para saldar un grupo?',
      a: 'Con N personas nunca hacen falta más de N−1 transferencias, y casi siempre alcanzan bastante menos. El método que usa esta página es el que funciona en la práctica: se calcula el saldo de cada uno (lo que puso menos lo que le tocaba) y después se empareja al que más debe con el que más puso de más, hasta que uno de los dos queda en cero. Repetido, deja el mínimo práctico de movimientos.',
    },
    {
      q: '¿Por qué no me conviene que cada uno le transfiera a cada uno?',
      a: 'Porque multiplica los movimientos sin cambiar el resultado. En un grupo de cinco personas, pagar "todos contra todos" puede dar diez transferencias cuando con dos o tres alcanza. Menos movimientos también significa menos comisiones, menos errores de tipeo y menos gente que se olvida de mandar su parte.',
    },
    {
      q: '¿Cómo se divide si uno consumió mucho más que el resto?',
      a: 'Dividir en partes iguales deja de ser justo cuando alguien pidió el doble o no tomó alcohol. En ese caso conviene separar: cargá como gasto común lo compartido (entradas, la pizza del medio, el Airbnb) y que cada uno se haga cargo de su consumo individual. Esta calculadora reparte en partes iguales el pozo común que le cargues.',
    },
    {
      q: '¿Está bien dividir los gastos de pareja en partes iguales?',
      a: 'Depende de los ingresos. Si ganan parecido, el 50/50 es simple y funciona. Si uno gana bastante más, partir al medio significa que el que menos gana destina un porcentaje mucho mayor de su sueldo al mismo gasto. El reparto proporcional iguala ese esfuerzo: cada uno pone el mismo porcentaje de lo que gana.',
    },
    {
      q: '¿Cómo se calcula el reparto proporcional al ingreso?',
      a: 'Se suman los dos ingresos y se ve qué porcentaje del total representa cada uno. Ese mismo porcentaje se aplica al gasto compartido. Si uno gana 900.000 y el otro 600.000, el primero aporta el 60% del gasto y el segundo el 40%. Ninguno de los dos aporta más esfuerzo relativo que el otro.',
    },
    {
      q: '¿Qué pasa si uno de los dos no tiene ingresos?',
      a: 'Con el reparto proporcional puro, el gasto queda íntegro del lado del que gana. En la práctica suele acordarse un piso simbólico para el que no tiene ingresos, o compensar con trabajo no remunerado del hogar. La calculadora te da el número matemático; el acuerdo lo definen ustedes.',
    },
    {
      q: '¿La propina se calcula antes o después de dividir la cuenta?',
      a: 'Da exactamente lo mismo en plata, pero calcularla antes es más claro para la mesa: se ve el total real a pagar y de ahí sale lo de cada uno. Si dividís primero y cada uno agrega su porcentaje aparte, terminás con cuatro cuentas distintas y alguien siempre pone de menos.',
    },
    {
      q: '¿Cuánta propina se deja en cada país?',
      a: 'Cambia muchísimo. En Estados Unidos ronda el 15-20% y es prácticamente obligatorio; en Argentina, Chile, Uruguay, Brasil o México se mueve entre el 10% y el 15%; en España o Francia es opcional y bajo, porque el servicio ya está incluido; y en Japón directamente no se deja, puede tomarse como una ofensa. La calculadora usa la referencia del país que elijas.',
    },
    {
      q: '¿Qué hago si la cuenta ya trae "servicio incluido"?',
      a: 'No sumes otra propina encima: estarías pagando dos veces por lo mismo. Poné 0% en el campo de propina. El cargo por servicio, cuando figura en la cuenta, ya es la retribución al personal; cualquier agregado es voluntario y suele ser un redondeo chico.',
    },
    {
      q: '¿Cómo manejo los centavos que sobran al dividir?',
      a: 'Redondeá para arriba lo de cada uno: la diferencia que sobra se suma a la propina o la absorbe quien pagó con tarjeta. Es la salida más limpia y evita que el grupo se trabe discutiendo por monedas. Lo importante es que nadie ponga de menos, no que el número cierre al centavo.',
    },
    {
      q: '¿Sirve para dividir gastos de un viaje entre varios?',
      a: 'Sí, es exactamente el caso de amigos: cargás cuánto puso cada uno a lo largo del viaje —el que pagó los pasajes, el que puso el alojamiento, el que puso la nafta— y la calculadora te dice quién le transfiere a quién al volver. Es mucho más rápido que llevar una planilla de todos contra todos.',
    },
    {
      q: '¿Y si alguien no puede pagar su parte ahora?',
      a: 'Registrá lo que efectivamente puso: la calculadora va a mostrar su saldo deudor y la transferencia pendiente. Tenerlo escrito y en números es lo que evita la incomodidad de tener que reclamarlo después de memoria, y deja claro cuánto falta poner sobre la mesa.',
    },
  ],

  sources: [
    {
      name: 'Problema de saldo de deudas en grafos (settling debts) — planteo y método greedy',
      url: 'https://en.wikipedia.org/wiki/Debt_settlement',
      publisher: 'Wikipedia',
    },
    {
      name: 'Guía de propinas por país para viajeros',
      url: 'https://www.tripadvisor.com/',
      publisher: 'Tripadvisor',
    },
    {
      name: 'Reparto de gastos en pareja proporcional al ingreso — enfoque de finanzas del hogar',
      url: 'https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/',
      publisher: 'Consumer Financial Protection Bureau',
    },
  ],

  replaces: [
    '/calculadora-split-gastos-grupo-amigos',
    '/calculadora-dividir-gastos-pareja-proporcional',
    '/calculadora-pago-proporcional-pareja-ingreso-gastos-compartidos',
    '/calculadora-dividir-cuenta-propina-amigos',
    '/calculadora-propina-restaurante',
    '/calculadora-propina-por-pais-viaje',
    '/calculadora-de-propinas',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
