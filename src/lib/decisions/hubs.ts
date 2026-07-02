/**
 * Hubs de salas de decisión (/decidir/<hub>) — la capa que agrupa las salas
 * por tipo de decisión y las convierte en productos SEO completos.
 *
 * Por qué hubs: las salas individuales atacan queries decisionales concretas
 * ("¿alquilar o comprar?"), pero la intención más amplia ("decisiones de
 * vivienda", "qué hacer con mis deudas") no tenía landing. Cada hub es una
 * CollectionPage con copy propio, FAQ ≥7 y enlaces a sus salas: concentra
 * autoridad y reparte link equity hacia las salas miembro.
 *
 * TS PURO (sin DOM, sin imports de Vite): lo importan las páginas .astro,
 * el índice /decidir y scripts/generate-sitemap.ts (tsx).
 *
 * Reglas:
 *  - Un slug de hub NUNCA puede colisionar con un slug de sala (las páginas
 *    de hub son rutas explícitas que pisan a /decidir/[slug]).
 *  - `roomSlugs` puede solaparse entre hubs (una sala puede servir a dos
 *    intenciones); el hub PRIMARIO de una sala es el primero de HUBS que la
 *    contiene (gobierna breadcrumb y agrupación del índice).
 *  - `lastReviewed` es editorial y FIJO: alimenta el lastmod del sitemap sin
 *    inflarlo en cada deploy (regla #1/#3 de CLAUDE.md).
 */

export interface DecisionHub {
  /** Slug bajo /decidir/ (ruta explícita, no puede coincidir con una sala). */
  slug: string;
  /** <title> SEO. */
  title: string;
  /** H1 visible. */
  h1: string;
  /** Meta description. */
  description: string;
  /** Párrafo de intro (lede) del hub. */
  lede: string;
  /** Cierre editorial único del hub (diferenciación anti-templating). */
  pitch: string;
  icon: string;
  /** Etiqueta corta para breadcrumbs y chips ("Laborales"). */
  shortLabel: string;
  /** YYYY-MM-DD editorial — lastmod del sitemap. */
  lastReviewed: string;
  /** Salas miembro, en orden editorial (las de mayor demanda primero). */
  roomSlugs: string[];
  /** FAQ del hub (mínimo 7 — regla anti thin-content). */
  faq: Array<{ q: string; a: string }>;
}

export const DECISION_HUBS: DecisionHub[] = [
  {
    slug: 'laborales',
    title: 'Decisiones laborales: oferta, aumento, despido y más — con números reales',
    h1: 'Decisiones laborales',
    description:
      'Todas las decisiones de trabajo resueltas con números: ¿acepto la oferta?, ¿cuánto aumento pido?, ¿relación de dependencia o facturar?, ¿remoto o presencial?, me despidieron. Cargás tus datos y te damos una conclusión clara.',
    lede:
      'Las decisiones de trabajo se toman una o dos veces por año y condicionan todo lo demás: cuánto ganás, cuánto te queda y cuánto tiempo libre tenés. Acá están todas las salas para decidir con números reales — sueldo neto, Ganancias, inflación, costos ocultos — y no con sensaciones.',
    pitch:
      'Una oferta laboral que "paga 20% más" puede dejarte peor si suma dos horas de viaje. Un aumento del 30% puede ser una pérdida si la inflación acumulada fue 40%. Cada sala de esta sección corre por dentro las cuentas que casi nadie hace antes de decidir: neto real en mano, valor de tu hora, punto de indiferencia. Entrás con la duda y salís con un número y una recomendación.',
    icon: '💼',
    shortLabel: 'Laborales',
    lastReviewed: '2026-07-01',
    roomSlugs: [
      'aceptar-oferta-laboral',
      'cuanto-aumento-pedir',
      'cuanto-sueldo-para-mantener-mi-nivel-de-vida',
      'relacion-dependencia-o-facturar',
      'trabajo-remoto-hibrido-o-presencial',
      'cuanto-cambia-mi-sueldo-con-la-paritaria',
      'cuanto-vale-mi-hora',
      'me-despidieron',
      'que-pasa-si-pierdo-mi-ingreso',
      'guarderia-o-reducir-horas',
      'me-conviene-estudiar-esta-carrera',
      'me-conviene-emigrar',
      'cuando-tomar-vacaciones',
    ],
    faq: [
      {
        q: '¿Cómo sé si me conviene aceptar una oferta laboral?',
        a: 'Comparando el neto real de las dos posiciones, no el bruto: sueldo en mano después de aportes y Ganancias, menos los costos de cada trabajo (traslado, comidas, tiempo de viaje valuado a tu hora). La sala de oferta laboral hace esa cuenta completa y te dice cuánto mejora de verdad y cuál es el mínimo que deberías pedir.',
      },
      {
        q: '¿Cuánto aumento tengo que pedir para no perder contra la inflación?',
        a: 'Como piso, la inflación acumulada desde tu último aumento: si tu sueldo subió por última vez hace 10 meses y la inflación acumulada fue 25%, con menos de 25% estás perdiendo poder de compra. Sobre ese piso se suma lo que aportás de más (nuevas responsabilidades) y tu objetivo de mejora real. La sala de aumento te da las tres cifras: piso, razonable e ideal.',
      },
      {
        q: '¿Qué conviene: relación de dependencia o facturar como monotributista?',
        a: 'Depende de cuánto factures y de cuánto valores los beneficios del empleo en blanco: aguinaldo, vacaciones pagas, obra social, aportes e indemnización. Como regla rápida, facturar tiene que rendirte bastante más que tu bruto actual para empatar todo eso. La sala correspondiente calcula el número exacto de indiferencia para tu caso.',
      },
      {
        q: '¿Cuánto me tienen que pagar si me despiden sin causa?',
        a: 'La liquidación completa incluye indemnización por antigüedad (un sueldo por año trabajado), preaviso, integración del mes de despido, SAC proporcional y vacaciones no gozadas. La sala "Me despidieron" la estima completa y además cruza el monto con tus gastos para decirte cuántos meses de cobertura te da.',
      },
      {
        q: '¿Cuánto cuesta ir a la oficina versus trabajar remoto?',
        a: 'Mucho más de lo que parece: transporte, comidas afuera y — el rubro que nadie suma — las horas de viaje valuadas a tu valor-hora. Para viajes de una hora por tramo, el costo total puede superar el 10-15% del sueldo. La sala de modalidad de trabajo lo calcula en pesos por mes para remoto, híbrido y presencial.',
      },
      {
        q: '¿Sirve comparar sueldos entre países antes de emigrar?',
        a: 'Comparar sueldos brutos no sirve; lo que decide es la capacidad de ahorro: sueldo neto menos costo de vida en cada lugar. Un sueldo triple en un país donde vivir cuesta el triple no te mejora nada. La sala de emigración compara ahorro mensual real y calcula en cuántos meses recuperás el costo de la mudanza.',
      },
      {
        q: '¿Estas herramientas sirven fuera de Argentina?',
        a: 'Las salas están calibradas para Argentina (Ganancias, SAC, indemnización según la Ley de Contrato de Trabajo, monotributo). La lógica de decisión — comparar netos, valuar el tiempo, punto de indiferencia — aplica en cualquier país, pero los impuestos y derechos laborales cambian: verificá las reglas locales si estás en otro lado.',
      },
      {
        q: '¿Los resultados son asesoramiento profesional?',
        a: 'No: son estimaciones orientativas con números transparentes (cada sala muestra cómo calcula). Para un despido conflictivo, una negociación compleja o una decisión impositiva grande, conviene validar con un abogado laboral o contador. Las salas te sirven para llegar a esa charla con los números claros.',
      },
    ],
  },
  {
    slug: 'vivienda',
    title: 'Decisiones de vivienda: ¿alquilar, comprar, mudarte, refaccionar? — con números',
    h1: 'Decisiones de vivienda',
    description:
      'Las decisiones de vivienda más grandes resueltas con números: ¿cuánto alquiler puedo pagar?, ¿alquilar o comprar?, ¿renovar o mudarme?, ¿puedo con un crédito UVA?, ¿cuánto cuesta realmente comprar? Conclusión clara y escenarios.',
    lede:
      'La vivienda es la decisión económica más grande de la mayoría de las personas: compromete años de ingresos y es carísima de revertir. Estas salas ponen números a cada bifurcación — alquilar o comprar, renovar o mudarte, refaccionar o vender — para que decidas con el costo total sobre la mesa, no con el precio de la publicación.',
    pitch:
      'En vivienda los costos ocultos son la regla: la escritura y la comisión que no están en el precio publicado, el alquiler que pagás mientras dura la obra, el anticipo que deja de rendir cuando comprás, la cuota UVA que ajusta más rápido que tu sueldo. Cada sala de esta sección está construida para que ninguno de esos números te sorprenda después de firmar.',
    icon: '🏠',
    shortLabel: 'Vivienda',
    lastReviewed: '2026-07-01',
    roomSlugs: [
      'cuanto-alquiler-puedo-pagar',
      'alquilar-o-comprar',
      'renovar-alquiler-o-mudarme',
      'refaccionar-o-mudarme',
      'puedo-afrontar-un-credito-uva',
      'cuanto-cuesta-comprar-una-propiedad',
      'construir-o-comprar-terminado',
      'cuanto-cuesta-terminar-mi-obra',
      'me-conviene-vender-mi-propiedad',
      'cuanto-cuesta-vivir-en-esta-ciudad',
    ],
    faq: [
      {
        q: '¿Cuánto alquiler puedo pagar sin ahogarme?',
        a: 'La regla sana es que alquiler más expensas no superen el 30% de tu ingreso neto, con 35% como techo absoluto. Pero tu número real depende de tus deudas, servicios y objetivo de ahorro: la sala de alquiler máximo lo calcula descontando todo eso y te muestra cómo queda repartido tu ingreso.',
      },
      {
        q: '¿Conviene alquilar o comprar en Argentina?',
        a: 'Depende de tres cosas: cuánto tiempo pensás quedarte, cuánto rinde tu anticipo invertido y cómo evoluciona el alquiler. Comprar gana casi siempre a horizontes largos; alquilar suele ganar a horizontes cortos porque la escritura y la comisión se amortizan en pocos años. La sala calcula el punto de equilibrio en años para tus números.',
      },
      {
        q: '¿Cuánto cuesta realmente comprar una propiedad, además del precio?',
        a: 'Entre comisión inmobiliaria (3-4% + IVA), escritura y honorarios (2-3%), sellos según jurisdicción, informes y mudanza, el efectivo total suele ser un 8-12% mayor al precio publicado. Si además hay refacciones, más. La sala de costos de compra suma todos los rubros para decirte cuánta plata hay que tener el día de la operación.',
      },
      {
        q: '¿Puedo afrontar un crédito UVA?',
        a: 'Los bancos exigen que la cuota inicial no supere el 25% de tu ingreso, pero eso no alcanza: la cuota UVA ajusta por inflación, y si tu sueldo va detrás, la relación cuota/ingreso se deteriora mes a mes. La sala del crédito UVA corre un stress test a 12 y 24 meses para mostrarte ese deterioro antes de firmar.',
      },
      {
        q: '¿Me conviene renovar el alquiler con aumento o mudarme a algo más barato?',
        a: 'Mudarte arranca perdiendo: depósito, comisión, mudanza y arreglos pueden sumar varios meses de alquiler. Para que convenga, el ahorro mensual del alquiler nuevo tiene que amortizar ese costo inicial en un plazo razonable (y no comerte el ahorro en más tiempo de viaje). La sala calcula el costo del primer año de cada camino.',
      },
      {
        q: '¿Es más barato construir que comprar terminado?',
        a: 'El costo por m² de obra suele ser menor al de compra, pero la cuenta completa suma el terreno, los meses de alquiler durante la obra, el costo financiero de la plata inmovilizada y los sobrecostos (las obras casi siempre se pasan del presupuesto y del plazo). La sala de construir vs comprar pone los dos caminos en el mismo plano.',
      },
      {
        q: '¿Qué porcentaje del ingreso se recomienda destinar a vivienda en total?',
        a: 'Sumando alquiler o cuota, expensas, servicios y mantenimiento, la referencia internacional es no superar el 35-40% del ingreso neto del hogar. Por encima de eso, cualquier imprevisto te deja sin margen. Varias salas de esta sección usan ese umbral como semáforo.',
      },
      {
        q: '¿Los cálculos consideran la inflación argentina?',
        a: 'Sí: las salas que comparan flujos en el tiempo (alquilar vs comprar, crédito UVA, terminar una obra) trabajan con alquileres que crecen, cuotas que ajustan y costos que se actualizan. Podés cargar tu propio supuesto de inflación y ver cómo cambia la conclusión con cada escenario.',
      },
    ],
  },
  {
    slug: 'deudas',
    title: 'Decisiones de deuda y consumo: ¿cuotas o contado? ¿cancelar o invertir? — con números',
    h1: 'Decisiones de deuda y consumo',
    description:
      '¿Cuotas o contado?, ¿cancelo la deuda o invierto?, ¿cuál deuda pago primero?, ¿puedo pagar este préstamo?, ¿me conviene adelantar cuotas? Cada decisión de deuda y consumo resuelta con números y una recomendación clara.',
    lede:
      'Con inflación alta, las decisiones de deuda y consumo son contraintuitivas: las cuotas sin interés suelen ganarle al contado, cancelar una deuda cara rinde más que invertir, y el orden en que pagás tus deudas cambia cuántos intereses terminás pagando. Estas salas hacen la cuenta fina para cada caso.',
    pitch:
      'La intuición financiera que sirve en países estables acá falla: "no te endeudes" puede ser mal consejo cuando la inflación licúa cuotas fijas, y "pagá al contado" puede regalar el rendimiento de tu plata. Cada sala de esta sección compara las opciones en valor presente — pesos de hoy — que es la única forma honesta de comparar plata que se paga en momentos distintos.',
    icon: '💳',
    shortLabel: 'Deudas y consumo',
    lastReviewed: '2026-07-01',
    roomSlugs: [
      'cuotas-o-contado',
      'cancelar-deuda-o-invertir',
      'como-salir-de-deudas',
      'me-conviene-adelantar-cuotas',
      'puedo-pagar-este-prestamo',
      'puedo-hacer-esta-compra',
      'cuanto-puedo-gastar-por-mes',
      'financiar-el-auto-o-contado',
      'reparar-o-reemplazar-electrodomestico',
      'cuanto-tiempo-de-mi-vida-cuesta-esta-compra',
    ],
    faq: [
      {
        q: '¿Conviene pagar en cuotas o al contado con inflación alta?',
        a: 'Si las cuotas son sin interés (o con interés menor a la inflación), financiar suele ganar: una cuota fija que pagás dentro de 10 meses vale mucho menos en pesos de hoy. El contado gana cuando el descuento por pagar ya es grande. La sala de cuotas vs contado compara el valor presente de los dos caminos y te dice cuál sale más barato hoy.',
      },
      {
        q: '¿Cancelo mi deuda o invierto la plata?',
        a: 'Gana la tasa más alta: cancelar una deuda al 90% anual efectivo es un rendimiento garantizado del 90%, imposible de conseguir invirtiendo sin riesgo. La excepción: nunca uses el fondo de emergencia para cancelar deuda — quedarte sin liquidez te puede empujar a deuda más cara después.',
      },
      {
        q: '¿Cuál deuda pago primero si tengo varias?',
        a: 'El método avalancha (primero la de mayor tasa) minimiza los intereses totales y es matemáticamente óptimo. La bola de nieve (primero la más chica) paga un poco más de intereses pero da victorias rápidas que ayudan a sostener el plan. La sala de salir de deudas simula los dos con tus números y te muestra la diferencia en pesos y en meses.',
      },
      {
        q: '¿Cómo sé si puedo pagar la cuota de un préstamo?',
        a: 'La regla que usan los bancos: el total de tus cuotas no debería superar el 25-35% de tu ingreso neto. Pero el número honesto sale de tu presupuesto real: ingreso menos gastos fijos menos otras deudas. La sala del préstamo calcula la cuota por sistema francés y te da un semáforo claro: entra cómodo, justo o en rojo.',
      },
      {
        q: '¿Me conviene adelantar cuotas de un préstamo que ya tengo?',
        a: 'Adelantar capital es un rendimiento garantizado igual a la tasa efectiva del préstamo. Si tu préstamo está al 60% y tu mejor inversión rinde 45%, adelantar gana. Si el préstamo es UVA o a tasa baja licuada por inflación, suele convenir invertir. La sala compara las dos tasas efectivas para tu caso.',
      },
      {
        q: '¿Qué es el valor presente y por qué importa para estas decisiones?',
        a: 'Es cuánto vale HOY un pago futuro, descontando inflación y el rendimiento que podrías obtener mientras tanto. $100.000 a pagar en un año, con 40% de inflación, equivalen a unos $71.000 de hoy. Comparar opciones de pago sin traducirlas a valor presente es comparar peras con manzanas — por eso todas estas salas lo usan.',
      },
      {
        q: '¿Cuánto puedo gastar por mes sin endeudarme?',
        a: 'Un marco simple: de tu ingreso neto, restá obligaciones fijas y el ahorro que querés sostener; lo que queda es tu tope de gasto variable. La regla 50/30/20 (50% necesidades, 30% gustos, 20% ahorro) es el punto de partida, y la sala de gasto mensual la adapta a tus números reales, con tope por mes, semana y día.',
      },
      {
        q: '¿Estas salas me dicen qué hacer o solo muestran números?',
        a: 'Las dos cosas: cada sala termina en una conclusión concreta ("te conviene X, por $Y de diferencia") más tres escenarios y próximos pasos. Pero siempre con el desglose visible de cómo se llegó al número, para que puedas cuestionar los supuestos y ajustarlos a tu situación.',
      },
    ],
  },
  {
    slug: 'negocio',
    title: 'Decisiones para independientes y negocios: tarifa, precios, monotributo, contratar',
    h1: 'Decisiones para independientes y negocios',
    description:
      '¿Cuánto cobrar por hora?, ¿qué precio ponerle a mi producto?, ¿cuánto facturar para ganar X neto?, ¿monotributo o RI?, ¿puedo contratar? Las decisiones de todo freelance y dueño de negocio, resueltas con números.',
    lede:
      'Trabajar por cuenta propia es tomar decisiones de negocio todo el tiempo, casi siempre sin un financiero al lado: qué cobrar, qué precio poner, cuándo contratar, qué régimen impositivo elegir. Estas salas son ese analista que te falta — cargás tus números y te devuelven la cuenta hecha y una recomendación.',
    pitch:
      'El error más caro del independiente es ponerle precio a su trabajo "a ojo": olvidarse de los impuestos, del tiempo no facturable, de los clientes que pagan tarde o no pagan. Cada sala de esta sección reconstruye el número desde tu objetivo real — cuánto querés que te quede limpio — hacia atrás, hasta la tarifa, el precio o la facturación que lo hace posible.',
    icon: '🏷️',
    shortLabel: 'Negocio',
    lastReviewed: '2026-07-01',
    roomSlugs: [
      'cuanto-cobrar-por-hora-freelance',
      'cuanto-cobrar-por-mi-producto-o-servicio',
      'cuanto-facturar-para-ganar-x-neto',
      'mi-negocio-es-rentable',
      'puedo-contratar-a-una-persona',
      'cuanto-invertir-en-publicidad',
      'me-conviene-aceptar-este-cliente',
      'monotributo-o-responsable-inscripto',
      'que-categoria-de-monotributo-me-corresponde',
      'comprar-o-alquilar-equipamiento',
      'relacion-dependencia-o-facturar',
    ],
    faq: [
      {
        q: '¿Cómo calculo cuánto cobrar por hora como freelance?',
        a: 'Al revés de como se suele hacer: partí del neto mensual que querés ganar, sumale impuestos, gastos y equipamiento, y dividilo por tus horas FACTURABLES — que son bastante menos que las trabajadas, porque las propuestas, reuniones y administración no se facturan. La sala de tarifa por hora hace ese camino inverso completo.',
      },
      {
        q: '¿Cuánto tengo que facturar para que me queden X pesos limpios?',
        a: 'Más de lo que parece: al neto deseado hay que sumarle la cuota de monotributo o los impuestos de RI, ingresos brutos si corresponde, y los gastos fijos del negocio. Según el régimen y el nivel, la facturación necesaria puede ser 20-40% mayor que el neto objetivo. La sala te da el número exacto mensual y anual.',
      },
      {
        q: '¿Monotributo o Responsable Inscripto: cuál me deja más neto?',
        a: 'Depende de cuánto facturás, cuánto comprás con IVA y a quién le vendés. El monotributo es cuota fija simple pero perdés el crédito fiscal de tus compras; RI te deja computar IVA pero suma Ganancias, IIBB y contador. La sala comparadora estima la carga total de cada régimen para tu caso.',
      },
      {
        q: '¿Cuánto cuesta realmente contratar a un empleado?',
        a: 'Cerca de 1,5 veces el sueldo bruto: a lo pactado se suman cargas patronales, ART, aguinaldo y vacaciones. Un bruto de $1.000.000 cuesta alrededor de $1.500.000 por mes sostenidos. La sala de contratación arma el costo total y lo cruza con el ingreso de tu negocio para decirte si lo podés sostener.',
      },
      {
        q: '¿Cómo sé si mi negocio es realmente rentable?',
        a: 'Facturar mucho no es ganar plata. Los tres números que lo dicen: margen bruto (ventas menos costos variables), margen neto (después de fijos e impuestos) y punto de equilibrio (cuánto necesitás facturar para no perder). La sala de rentabilidad los calcula y te dice qué palanca tocar si algo no cierra.',
      },
      {
        q: '¿Cuánto conviene invertir en publicidad?',
        a: 'El límite lo pone tu CAC máximo: cuánto podés pagar por captar un cliente sin perder plata, que sale de tu ticket promedio, tu margen y cuántas veces te compra ese cliente (LTV). Invertir sin ese número es apostar. La sala de publicidad lo calcula y te recomienda un presupuesto que tu flujo de caja aguante.',
      },
      {
        q: '¿Cómo decido si acepto un cliente o proyecto?',
        a: 'Mirando el valor por hora REAL del proyecto: monto menos impuestos, dividido por todas las horas que va a consumir — incluidas revisiones y idas y vueltas — y ajustado por el riesgo de cobrar tarde. Un proyecto grande puede rendir menos por hora que uno chico bien acotado. La sala del cliente hace esa cuenta antes de que digas que sí.',
      },
      {
        q: '¿Los valores de monotributo están actualizados?',
        a: 'Las salas trabajan con las escalas vigentes al momento de la última revisión (indicada en cada página) y son orientativas: la fuente oficial siempre es ARCA. Antes de recategorizar o cambiar de régimen, verificá los topes vigentes ahí o con tu contador.',
      },
    ],
  },
];

/**
 * Grupos SOLO para el índice /decidir (sin página de hub propia): salas que no
 * pertenecen a ninguno de los 4 hubs, agrupadas para que el índice no sea una
 * lista plana. Si alguno de estos grupos junta demanda, se promueve a hub.
 */
export const INDEX_EXTRA_GROUPS: Array<{
  title: string;
  icon: string;
  roomSlugs: string[];
}> = [
  {
    title: 'Auto y movilidad',
    icon: '🚗',
    roomSlugs: [
      'auto-nuevo-o-usado',
      'nafta-hibrido-o-electrico',
      'auto-transporte-publico-taxi-o-app',
      'me-conviene-vender-mi-auto',
      'puedo-mantener-este-auto',
    ],
  },
  {
    title: 'Viajes',
    icon: '🧳',
    roomSlugs: [
      'cuanto-necesito-para-mi-viaje',
      'podemos-afrontar-este-viaje-familiar',
    ],
  },
  {
    title: 'Familia',
    icon: '👨‍👩‍👧',
    roomSlugs: [
      'cuanto-cuesta-tener-un-hijo-primer-ano',
      'como-cambia-mi-presupuesto-con-un-hijo',
      'cuanto-ahorrar-para-la-educacion-de-mis-hijos',
      'podemos-vivir-con-un-solo-ingreso',
    ],
  },
  {
    title: 'Ahorro y futuro',
    icon: '🎯',
    roomSlugs: [
      'cuanto-fondo-de-emergencia-necesito',
      'cuando-alcanzo-mi-meta-de-ahorro',
      'que-hago-con-mis-ahorros',
      'cuando-alcanzo-la-independencia-financiera',
      'estoy-listo-para-jubilarme',
      'cual-es-mi-salud-financiera',
      'que-decision-mejora-mas-mis-finanzas',
    ],
  },
];

/** Hub primario de una sala: el primero de HUBS que la contiene (o null). */
export function primaryHubOf(roomSlug: string): DecisionHub | null {
  return DECISION_HUBS.find((h) => h.roomSlugs.includes(roomSlug)) ?? null;
}
