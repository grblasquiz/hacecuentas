/**
 * AUTO-GENERADO por scripts/gen-decisions-manifest.ts — NO editar a mano.
 * Metadata pura de las salas de decisión (sin compute) para sitemap + hub.
 */
export interface DecisionRoomMeta {
  slug: string; title: string; h1: string; description: string; intro: string;
  icon: string; category: string; lastReviewed: string;
  componentCalcs: { slug: string; label: string }[];
}

export const DECISION_MANIFEST: DecisionRoomMeta[] = [
  {
    "slug": "aceptar-oferta-laboral",
    "title": "Cambiar de trabajo: comparador de oferta laboral vs sueldo actual 2026",
    "h1": "¿Conviene cambiar de trabajo? Compará tu sueldo y la oferta",
    "description": "Compará tu trabajo actual contra una oferta nueva con números reales: sueldo neto, Ganancias, traslado, comidas, tiempo de viaje, bono y beneficios. Te decimos cuánto mejora de verdad y el sueldo mínimo que deberías pedir.",
    "intro": "No alcanza con mirar el sueldo bruto. Esta sala compara tu trabajo actual contra la oferta corriendo por dentro el sueldo neto, Ganancias, los costos de traslado y comida, el valor real de tu hora y el punto de indiferencia. El resultado no es \"ganás $X más\", sino cuánto mejora REALMENTE tu ingreso y cuál es el mínimo que deberías pedir para que convenga.",
    "icon": "💼",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-impuesto-ganancias-sueldo",
        "label": "Impuesto a las Ganancias"
      },
      {
        "slug": "calculadora-aguinaldo-sac",
        "label": "Aguinaldo (SAC)"
      },
      {
        "slug": "calculadora-sueldo-bruto-desde-neto",
        "label": "Sueldo bruto desde el neto"
      }
    ]
  },
  {
    "slug": "alquilar-o-comprar",
    "title": "¿Me conviene alquilar o comprar? Comparador 2026",
    "h1": "¿Me conviene alquilar o comprar?",
    "description": "Compará el costo acumulado de alquilar (con alquiler creciente y costo de oportunidad del anticipo) contra comprar (cuota, expensas, escritura y mantenimiento) a 5, 10 y 20 años. Te decimos el punto de equilibrio y cuál gana a tu horizonte.",
    "intro": "Alquilar tira plata, dicen. Pero comprar inmoviliza el anticipo, paga escritura y te ata. La respuesta real es comparar el costo acumulado de cada camino a lo largo del tiempo. Esta sala calcula cuánto gastás alquilando (alquiler que crece + lo que rinde tu anticipo invertido) contra cuánto gastás comprando (cuota + expensas + escritura + mantenimiento), encuentra el punto de equilibrio en años y te dice cuál conviene según cuánto pensás quedarte.",
    "icon": "🏠",
    "category": "finanzas",
    "lastReviewed": "2026-07-11",
    "componentCalcs": [
      {
        "slug": "calculadora-alquiler-vs-comprar",
        "label": "Alquilar vs comprar"
      },
      {
        "slug": "calculadora-hipoteca-mensual-cuota-fija",
        "label": "Cuota de hipoteca"
      },
      {
        "slug": "calculadora-costo-total-comprar-propiedad-gastos",
        "label": "Costo total de comprar"
      },
      {
        "slug": "calculadora-actualizacion-alquiler-icl",
        "label": "Actualización de alquiler (ICL)"
      }
    ]
  },
  {
    "slug": "auto-nuevo-o-usado",
    "title": "¿Auto nuevo o usado? Comparador de costo total 2026",
    "h1": "¿Me conviene comprar un auto nuevo o usado?",
    "description": "Compará el costo total de propiedad de un 0km contra un usado a varios años: precio, depreciación, patente, seguro y mantenimiento. Te decimos cuál sale más barato y por cuánto.",
    "intro": "Un 0km arranca más caro y pierde valor rápido los primeros años; un usado ya pasó ese golpe pero gasta más en mantenimiento. La decisión no es el precio de la etiqueta, es el costo total de propiedad: precio menos reventa más todos los gastos durante los años que lo vas a tener. Esta sala calcula los dos y te dice cuál te deja mejor parado.",
    "icon": "🚗",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota del crédito prendario"
      },
      {
        "slug": "calculadora-cft-prestamo-personal-comparativa",
        "label": "CFT del préstamo"
      },
      {
        "slug": "calculadora-combustible-viaje-auto",
        "label": "Costo de combustible"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "auto-transporte-publico-taxi-o-app",
    "title": "¿Auto, transporte público, taxi o app? Comparador de costos 2026",
    "h1": "¿Auto, transporte público, taxi o app?",
    "description": "Compará el costo mensual real de moverte en auto propio, transporte público, taxi o app según cuánto viajes, incluyendo el valor de tu tiempo. Te decimos cuál te sale más barato.",
    "intro": "Tener auto es un costo fijo alto lo uses o no; los viajes sueltos en taxi o app escalan con el uso; el transporte público es lo más barato en plata pero te cuesta tiempo. La opción más conveniente depende de cuánto te movés. Esta sala calcula el costo mensual de las cuatro —incluyendo el valor de tu tiempo— y te dice cuál gana para tu nivel de uso.",
    "icon": "🚦",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-combustible-viaje-auto",
        "label": "Costo de combustible"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Tu sueldo por hora"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "cancelar-deuda-o-invertir",
    "title": "¿Cancelar la deuda o invertir el dinero? Comparador 2026",
    "h1": "¿Me conviene cancelar esta deuda o invertir el dinero?",
    "description": "Compará la tasa efectiva de tu deuda contra el rendimiento de una inversión para saber qué te deja mejor: cancelar el crédito o invertir la plata. Incluye fondo de emergencia y estrategia mixta.",
    "intro": "Tenés plata y una deuda: ¿la cancelás o la invertís? La respuesta no es intuición, es comparar la tasa efectiva de tu deuda contra el rendimiento de la inversión sobre el mismo capital. Cancelar una deuda cara es un rendimiento garantizado. Esta sala te dice cuál gana, por cuánto, y cuánto fondo de emergencia conviene dejar intacto.",
    "icon": "⚖️",
    "category": "finanzas",
    "lastReviewed": "2026-07-11",
    "componentCalcs": [
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-cft-prestamo-personal-comparativa",
        "label": "CFT de un préstamo"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      }
    ]
  },
  {
    "slug": "como-cambia-mi-presupuesto-con-un-hijo",
    "title": "¿Cómo cambia nuestro presupuesto con un hijo? 2026",
    "h1": "¿Cómo cambia nuestro presupuesto con un hijo?",
    "description": "Mirá cómo cambia tu presupuesto mensual cuando llega un bebé: gastos nuevos (pañales, alimentación, guardería, cobertura) más la reducción de ingreso por la licencia. Con el colchón que necesitás.",
    "intro": "Un hijo no solo agrega gastos: cambia el presupuesto entero de la familia, sobre todo durante la licencia, cuando gastás más y a veces cobrás menos. Esta sala parte de tu presupuesto actual, le suma los gastos nuevos del bebé y la reducción de ingreso, y te muestra el nuevo presupuesto mensual y cuánto colchón necesitás para los meses de licencia.",
    "icon": "📊",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Armar el colchón (interés compuesto)"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "como-salir-de-deudas",
    "title": "Cómo salir de deudas: simulador avalancha vs bola de nieve 2026",
    "h1": "Cómo salir de deudas: armá tu plan (avalancha o bola de nieve)",
    "description": "Cargá tus deudas y cuánto podés pagar por mes: te decimos en cuánto tiempo te liberás y cuánto ahorrás con el método avalancha (la más cara primero) frente a la bola de nieve. Plan de pago ordenado.",
    "intro": "Tenés varias deudas y no sabés por cuál empezar. Esta sala simula tu salida con los dos métodos probados: avalancha (pagás primero la de mayor tasa, minimiza intereses) y bola de nieve (la más chica primero, da victorias rápidas). Te dice en cuántos meses te librás, cuánto pagás de intereses y en qué orden conviene atacar cada deuda.",
    "icon": "🪜",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      },
      {
        "slug": "calculadora-cft-prestamo-personal-comparativa",
        "label": "CFT de un préstamo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      }
    ]
  },
  {
    "slug": "comprar-o-alquilar-equipamiento",
    "title": "¿Comprar o alquilar equipamiento? Comparador de costo 2026",
    "h1": "¿Me conviene comprar o alquilar equipamiento?",
    "description": "Compará el costo total de comprar un equipo (precio, financiación, mantenimiento, depreciación y reventa) contra alquilarlo, durante los años que lo vas a usar. La frecuencia de uso define cuál conviene.",
    "intro": "Comprar un equipo inmoviliza capital pero te deja un activo; alquilarlo libera plata pero no construye patrimonio. La respuesta correcta depende de cuánto lo uses, cuánto cueste mantenerlo y cuánto valga cuando lo quieras vender. Esta sala compara el costo total de cada opción a lo largo de los años de uso y te dice cuál te cuesta menos y por qué.",
    "icon": "🔧",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-amortizacion-auto-valor-residual",
        "label": "Amortización y valor residual"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de financiación"
      },
      {
        "slug": "calculadora-cft-prestamo-personal-comparativa",
        "label": "CFT de un préstamo"
      },
      {
        "slug": "calculadora-alquiler-con-opcion-a-compra-leasing-inmueble",
        "label": "Leasing con opción a compra"
      }
    ]
  },
  {
    "slug": "construir-o-comprar-terminado",
    "title": "¿Me conviene construir o comprar terminado? Comparador 2026",
    "h1": "¿Me conviene construir o comprar terminado?",
    "description": "Compará el costo total de construir (terreno + obra + alquiler durante la obra + costo financiero) contra comprar una propiedad terminada. Te decimos cuál sale más barato y cuánto pesa el tiempo de espera.",
    "intro": "Construir parece más barato que comprar terminado, pero hay que sumar lo que no se ve: el terreno, los meses de alquiler mientras dura la obra y el costo de tener la plata inmovilizada. Esta sala compara el costo total de construir contra comprar algo hecho, te muestra el costo por m² de cada camino y te recuerda que las obras se atrasan, para que decidas con todos los números sobre la mesa.",
    "icon": "🧱",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-costo-m2-construccion-argentina",
        "label": "Costo por m² de construcción"
      },
      {
        "slug": "calculadora-costo-total-comprar-propiedad-gastos",
        "label": "Costo total de comprar"
      },
      {
        "slug": "calculadora-hierro-construccion-losa-m2",
        "label": "Hierro para losa"
      },
      {
        "slug": "calculadora-alquiler-vs-comprar",
        "label": "Alquilar vs comprar"
      }
    ]
  },
  {
    "slug": "cual-es-mi-salud-financiera",
    "title": "¿Cuál es mi salud financiera? Puntaje 0-100 explicable 2026",
    "h1": "¿Cuál es mi salud financiera?",
    "description": "Obtené un puntaje de salud financiera de 0 a 100 con nivel (Sólida, Aceptable o Frágil) a partir de tres pilares: liquidez (fondo de emergencia), endeudamiento (peso de las cuotas) y capacidad de ahorro. Con desglose explicable.",
    "intro": "¿Estás bien parado o estás más expuesto de lo que creés? Esta sala te da un puntaje de salud financiera de 0 a 100, construido sobre tres pilares concretos: cuántos meses de fondo de emergencia tenés, cuánto de tu ingreso se llevan las cuotas y qué porcentaje ahorrás. No es un número mágico: te mostramos cada sub-score para que sepas exactamente qué mejorar.",
    "icon": "🩺",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      }
    ]
  },
  {
    "slug": "cuando-alcanzo-la-independencia-financiera",
    "title": "¿Cuándo alcanzo la independencia financiera (FIRE)? 2026",
    "h1": "¿Cuándo alcanzo la independencia financiera (FIRE)?",
    "description": "Calculá tu número FIRE (25× tus gastos anuales, regla del 4%) y proyectá en cuántos años lo alcanzás con tu ahorro actual, tus aportes mensuales y un rendimiento real. Con escenarios para acelerarlo.",
    "intro": "La independencia financiera (FIRE) llega cuando tu cartera invertida es tan grande que podés vivir de su renta sin trabajar. La regla del 4% dice que ese número es 25 veces tus gastos anuales. Esta sala calcula tu número objetivo y simula año a año, con tu ahorro y tus aportes, cuándo lo alcanzás, y te muestra qué palancas acortan más el camino.",
    "icon": "🔥",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-fire-retiro-temprano",
        "label": "Número FIRE / retiro temprano"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      }
    ]
  },
  {
    "slug": "cuando-alcanzo-mi-meta-de-ahorro",
    "title": "¿Cuándo voy a alcanzar mi meta de ahorro? Calculá la fecha 2026",
    "h1": "¿Cuándo voy a alcanzar mi meta de ahorro?",
    "description": "Calculá en cuánto tiempo llegás a tu meta de ahorro según tu aporte mensual y el rendimiento, con ajuste por inflación. Te damos la fecha estimada y cuánto pone el interés vs tu bolsillo.",
    "intro": "Tenés una meta de ahorro (un viaje, un auto, el pie de un departamento) y querés saber cuándo llegás. Esta sala simula mes a mes tu acumulación —capital inicial, aportes y rendimiento— hasta tocar la meta, y si cargás inflación ajusta el objetivo para decirte cuándo llegás manteniendo el poder de compra, no solo el número nominal.",
    "icon": "🎯",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-fire-retiro-temprano",
        "label": "FIRE / retiro temprano"
      }
    ]
  },
  {
    "slug": "cuando-tomar-vacaciones",
    "title": "¿Cuándo conviene tomar vacaciones? Temporada alta vs baja 2026",
    "h1": "¿Cuándo me conviene tomar vacaciones?",
    "description": "Compará cuánto te ahorrás tomando vacaciones en temporada baja vs alta, y cuánto te cuesta tu tiempo si tenés ingreso variable. Elegí la mejor fecha para tu bolsillo sin resignar el descanso.",
    "intro": "El mismo viaje puede salir mucho más barato fuera de temporada, y si tu ingreso es variable, irte de vacaciones también te hace resignar facturación. Esta sala suma las dos cosas: el ahorro por elegir temporada baja y el costo de oportunidad de los días que no trabajás, para que elijas la fecha que mejor le cae a tu bolsillo.",
    "icon": "🏖️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-vacaciones-no-tomadas-indemnizacion-formula",
        "label": "Vacaciones no tomadas"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      }
    ]
  },
  {
    "slug": "cuanto-ahorrar-para-la-educacion-de-mis-hijos",
    "title": "¿Cuánto ahorrar para la educación de mis hijos? 2026",
    "h1": "¿Cuánto necesitamos ahorrar para la educación de nuestros hijos?",
    "description": "Calculá cuánto ahorrar por mes para cubrir la universidad o la educación de tus hijos: proyecta el costo futuro con inflación educativa y el aporte mensual con interés compuesto.",
    "intro": "Pagar la educación de un hijo es una meta lejana y grande, pero alcanzable si empezás temprano. Esta sala proyecta cuánto va a costar esa educación cuando tu hijo la empiece (ajustando por la inflación educativa, que suele ser más alta) y calcula cuánto necesitás ahorrar por mes para llegar, dejando que el interés compuesto haga parte del trabajo.",
    "icon": "🎓",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-fire-retiro-temprano",
        "label": "Metas de ahorro de largo plazo"
      }
    ]
  },
  {
    "slug": "cuanto-alquiler-puedo-pagar",
    "title": "¿Cuánto alquiler puedo pagar? Calculá tu tope sano 2026",
    "h1": "¿Cuánto alquiler puedo pagar?",
    "description": "Calculá el alquiler máximo que podés pagar sin ahogarte, usando la regla del 30-35% del ingreso, descontando deudas, servicios y tu objetivo de ahorro. Con el reparto de tu ingreso.",
    "intro": "Antes de salir a buscar departamento conviene saber hasta dónde llegás. La regla sana es que el alquiler más expensas no supere el 30% de tu ingreso (35% como techo). Esta sala calcula tu alquiler máximo saludable descontando deudas, servicios y lo que querés ahorrar, y te muestra cómo queda repartido tu ingreso para que no te quedes corto a fin de mes.",
    "icon": "🔑",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-aumento-alquiler-trimestral-cuatrimestral-semestral",
        "label": "Aumento del alquiler"
      },
      {
        "slug": "calculadora-actualizacion-alquiler-icl",
        "label": "Actualización de alquiler (ICL)"
      },
      {
        "slug": "calculadora-alquiler-vs-comprar",
        "label": "Alquilar vs comprar"
      }
    ]
  },
  {
    "slug": "cuanto-aumento-pedir",
    "title": "¿Cuánto aumento tengo que pedir? Calculadora de pedido 2026",
    "h1": "¿Cuánto aumento tengo que pedir?",
    "description": "Calculá cuánto aumento pedir según la inflación acumulada desde tu último aumento, tus nuevas responsabilidades y tu objetivo de mejora real. Tres cifras: piso, razonable e ideal, en % y en pesos.",
    "intro": "Pedir aumento \"a ojo\" te deja atrasado o pidiendo de menos. Esta sala calcula tres números concretos: cuánto necesitás solo para empatar la inflación desde tu último aumento, cuánto es razonable pedir sumando tus nuevas responsabilidades, y cuál es el techo ideal si además querés mejorar tu poder de compra. Entrás a la charla con datos, no con una sensación.",
    "icon": "📈",
    "category": "finanzas",
    "lastReviewed": "2026-07-11",
    "componentCalcs": [
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-aguinaldo-sac",
        "label": "Aguinaldo (SAC)"
      }
    ]
  },
  {
    "slug": "cuanto-cambia-mi-sueldo-con-la-paritaria",
    "title": "¿Cuánto cambia mi sueldo con la nueva paritaria? Real vs inflación 2026",
    "h1": "¿Cuánto cambia mi sueldo con la nueva paritaria?",
    "description": "Calculá cuánto sube tu sueldo neto con la nueva paritaria y, sobre todo, si le gana a la inflación. Distingue suma remunerativa de no remunerativa y te da la variación real de tu poder de compra.",
    "intro": "Una paritaria \"de 30%\" no significa que ganás 30% más de verdad. Hay que ver cuánto sube tu neto en mano (las sumas no remunerativas y Ganancias cambian la cuenta) y, sobre todo, cuánto sube contra la inflación del período. Esta sala calcula tu variación REAL de poder de compra: el único número que dice si mejoraste o te atrasaste.",
    "icon": "🤝",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-impuesto-ganancias-sueldo",
        "label": "Impuesto a las Ganancias"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-aguinaldo-sac",
        "label": "Aguinaldo (SAC)"
      }
    ]
  },
  {
    "slug": "cuanto-cobrar-por-hora-freelance",
    "title": "Tarifa freelance Argentina: cuánto cobrar por hora para cubrir costos e impuestos (2026)",
    "h1": "Cuánto cobrar por hora como freelance: la tarifa que cubre todo",
    "description": "Calculá tu tarifa por hora freelance partiendo del ingreso neto que querés ganar. Descuenta impuestos, equipamiento, clientes que no pagan y tiempo comercial no facturable para darte la hora real que tenés que cobrar.",
    "intro": "La tarifa por hora no es tu objetivo dividido tus horas: hay que cubrir impuestos, gastos, los clientes que no pagan y todo el tiempo que trabajás sin facturar (propuestas, reuniones, administración). Esta sala parte de cuánto querés que te quede neto y reconstruye hacia atrás la hora bruta que necesitás cobrar para llegar de verdad.",
    "icon": "⏱️",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-punto-equilibrio-break-even",
        "label": "Break-even freelance"
      },
      {
        "slug": "calculadora-costo-hora-empleado-real",
        "label": "Costo real de la hora"
      },
      {
        "slug": "calculadora-monotributo-2026",
        "label": "Cuota de monotributo"
      },
      {
        "slug": "calculadora-cuanto-cobrar-traduccion-palabra-2026-espanol-ingles",
        "label": "Cuánto cobrar (por palabra)"
      }
    ]
  },
  {
    "slug": "cuanto-cobrar-por-mi-producto-o-servicio",
    "title": "¿Cuánto cobrar por mi producto o servicio? Calculadora de precio 2026",
    "h1": "¿Cuánto debería cobrar por mi producto o servicio?",
    "description": "Calculá el precio de tu producto o servicio a partir de costos, margen objetivo, impuestos y el descuento promedio que das. Incluye precio de lista, ganancia por unidad y punto de equilibrio.",
    "intro": "Poner precio \"a ojo\" o copiando a la competencia es la forma más rápida de trabajar a pérdida. Esta sala parte de tu costo real (variable por unidad + fijos prorrateados), le suma el margen que querés y los impuestos, y ajusta por el descuento que terminás dando, para darte un precio que de verdad deja ganancia. Y te dice cuántas unidades necesitás vender para no perder.",
    "icon": "🏷️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-cafeteria-cuanto-cobrar-pais-cafe-medialuna-margen",
        "label": "Cuánto cobrar (cafetería)"
      },
      {
        "slug": "calculadora-punto-equilibrio-break-even",
        "label": "Punto de equilibrio"
      },
      {
        "slug": "calculadora-costo-hora-empleado-real",
        "label": "Costo real de la hora"
      },
      {
        "slug": "calculadora-monotributo-2026",
        "label": "Cuota de monotributo"
      }
    ]
  },
  {
    "slug": "cuanto-cuesta-comprar-una-propiedad",
    "title": "¿Cuánto cuesta realmente comprar una propiedad? Gastos 2026",
    "h1": "¿Cuánto cuesta realmente comprar una propiedad?",
    "description": "El precio publicado no es lo que pagás. Sumá comisión, escritura, sellos, informes, refacciones y mudanza para saber el efectivo total que necesitás para entrar y el costo mensual posterior.",
    "intro": "Ves una propiedad publicada y pensás que ese es el precio. Pero entre comisión inmobiliaria, escritura, sellos, informes, refacciones y mudanza, lo que de verdad necesitás en efectivo es bastante más. Esta sala suma todos los gastos sobre el precio para decirte cuánta plata real hay que tener el día de la operación, y cuánto te cuesta por mes después.",
    "icon": "🧾",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-costo-total-comprar-propiedad-gastos",
        "label": "Costo total de comprar"
      },
      {
        "slug": "calculadora-honorarios-escribano-caba-compraventa",
        "label": "Honorarios de escribano"
      },
      {
        "slug": "calculadora-arba-sellos-inmobiliarios-pba-compraventa",
        "label": "Sellos inmobiliarios (PBA)"
      },
      {
        "slug": "calculadora-comision-inmobiliaria-venta-inmueble-4-porciento",
        "label": "Comisión inmobiliaria"
      }
    ]
  },
  {
    "slug": "cuanto-cuesta-tener-un-hijo-primer-ano",
    "title": "¿Cuánto cuesta tener un hijo el primer año? 2026",
    "h1": "¿Cuánto cuesta tener un hijo el primer año?",
    "description": "Calculá el costo total del primer año de un bebé en Argentina: pañales, alimentación, salud, guardería, cuna, cochecito y la caída de ingreso por la licencia. Con el impacto mensual real.",
    "intro": "Tener un hijo no es un solo gasto: son los pañales y la leche todos los meses, el equipamiento que comprás de golpe (cuna, cochecito, ropa) y el ingreso que resignás durante la licencia. Esta sala suma todo y te dice cuánto te cuesta el primer año completo y, sobre todo, cuánto pesa por mes en tu presupuesto.",
    "icon": "👶",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Ahorro con interés compuesto"
      }
    ]
  },
  {
    "slug": "cuanto-cuesta-terminar-mi-obra",
    "title": "¿Cuánto va a costar terminar mi obra? Estimador 2026",
    "h1": "¿Cuánto va a costar terminar mi obra?",
    "description": "Estimá cuánto falta para terminar tu obra: costo por m² de lo pendiente, con desperdicio, contingencia e inflación por los meses que falten. Te damos el total y el desembolso mensual.",
    "intro": "Una obra a medias es un agujero negro: nunca sabés cuánto falta de verdad. Esta sala estima el costo de lo que queda según los metros cuadrados, el costo por m² actualizado y el porcentaje avanzado, le suma el desperdicio de materiales y un fondo de contingencia, y lo ajusta por inflación a lo largo de los meses que falten. El resultado: cuánto necesitás para terminar y cuánto por mes.",
    "icon": "🏗️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-costo-m2-construccion-argentina",
        "label": "Costo por m² de construcción"
      },
      {
        "slug": "calculadora-hierro-construccion-losa-m2",
        "label": "Hierro para losa"
      },
      {
        "slug": "calculadora-paritaria-uocra-construccion-2026-categoria",
        "label": "Paritaria UOCRA"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "cuanto-cuesta-vivir-en-esta-ciudad",
    "title": "¿Cuánto cuesta vivir en esta ciudad? Presupuesto mensual 2026",
    "h1": "¿Cuánto cuesta vivir en esta ciudad?",
    "description": "Sumá alquiler, transporte, alimentos, servicios, salud, educación y ocio para saber cuánto cuesta vivir por mes en una ciudad y qué ingreso neto necesitás para hacerlo con margen de ahorro. Con desglose por rubro.",
    "intro": "Antes de mudarte o aceptar un trabajo en otra ciudad necesitás un número claro: cuánto cuesta vivir ahí por mes y qué ingreso neto te hace falta. Esta sala suma todos tus rubros, calcula el ingreso necesario dejando un 20% de margen de ahorro y te muestra qué porcentaje se lleva cada gasto para que sepas dónde apretar.",
    "icon": "🏙️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-actualizacion-alquiler-icl",
        "label": "Actualización de alquiler (ICL)"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "cuanto-facturar-para-ganar-x-neto",
    "title": "¿Cuánto facturar para ganar X neto? Calculadora 2026",
    "h1": "¿Cuánto tengo que facturar para ganar X neto?",
    "description": "Partí del neto que querés en el bolsillo y calculá cuánto tenés que facturar por mes, descontando impuestos, cuota de monotributo o aportes y gastos fijos del negocio. Con facturación anual y tasa efectiva.",
    "intro": "Sabés cuánto querés ganar limpio, pero no cuánto tenés que facturar para llegar. Esta sala hace el camino inverso: parte del neto deseado y le suma los impuestos, la cuota de monotributo o tus aportes y los gastos fijos del negocio para decirte exactamente cuánto tenés que facturar por mes (y por año) para que te queden esos X netos.",
    "icon": "🎯",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-monotributo-2026",
        "label": "Cuota de monotributo"
      },
      {
        "slug": "calculadora-punto-equilibrio-break-even",
        "label": "Break-even freelance"
      },
      {
        "slug": "calculadora-monotributo-vs-responsable-inscripto",
        "label": "Monotributo vs RI"
      },
      {
        "slug": "calculadora-costo-hora-empleado-real",
        "label": "Costo real de la hora"
      }
    ]
  },
  {
    "slug": "cuanto-fondo-de-emergencia-necesito",
    "title": "¿Cuánto fondo de emergencia necesito? Calculalo según tu caso 2026",
    "h1": "¿Cuánto fondo de emergencia necesito?",
    "description": "Calculá tu fondo de emergencia ideal ajustado a tu situación: estabilidad laboral, hijos, alquiler y vehículo. Parte de la regla de 3 meses de gastos y la adapta a tu nivel de riesgo. Monto exacto y cómo armarlo.",
    "intro": "\"Tres a seis meses de gastos\" es la regla famosa, pero el número correcto para vos depende de tu situación. Esta sala parte de esa base y la ajusta por tus factores de riesgo (qué tan estable es tu ingreso, si tenés hijos, si pagás alquiler, si tenés auto) para darte un monto concreto y decirte cómo y dónde armarlo.",
    "icon": "🛟",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "cuanto-invertir-en-publicidad",
    "title": "¿Cuánto invertir en publicidad? CAC máximo y presupuesto 2026",
    "h1": "¿Cuánto puedo invertir en publicidad?",
    "description": "Calculá cuánto podés pagar por captar un cliente (CAC máximo) según tu ticket, margen, LTV y conversión, y definí un presupuesto de publicidad seguro y un ROAS objetivo a partir de tu flujo de caja.",
    "intro": "Invertir en publicidad sin saber tu CAC máximo es tirar plata o frenarte de más. Esta sala calcula cuánto podés pagar por captar un cliente sin perder (según tu ticket, margen y cuántas veces te compra), te da la puja máxima por click según tu conversión, y cruza todo con tu flujo de caja para recomendarte un presupuesto seguro y el ROAS objetivo que tenés que superar.",
    "icon": "📣",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-cac-ltv-costo-adquisicion-cliente",
        "label": "CAC y LTV"
      },
      {
        "slug": "calculadora-cpa-cac-ltv",
        "label": "CPA máximo rentable"
      },
      {
        "slug": "calculadora-roas-retorno-inversion-publicitaria",
        "label": "Break-even de campaña"
      },
      {
        "slug": "calculadora-cac-costo-adquisicion-sales-funnel",
        "label": "Payback del CAC"
      }
    ]
  },
  {
    "slug": "cuanto-necesito-para-mi-viaje",
    "title": "¿Cuánto necesito para mi viaje? Presupuesto completo y plan de ahorro 2026",
    "h1": "¿Cuánto necesito para mi viaje?",
    "description": "Armá el presupuesto completo de tu viaje rubro por rubro (pasajes, alojamiento, comida, actividades, recargo por moneda extranjera, imprevistos) y mirá si con tu ritmo de ahorro llegás a la fecha o cuánto tenés que apartar por mes.",
    "intro": "Un viaje no es solo el pasaje: es el alojamiento por noche, la comida de cada persona cada día, los traslados, las excursiones, el seguro, el recargo por pagar en moneda extranjera y los imprevistos que siempre aparecen. Esta sala arma el presupuesto completo rubro por rubro — total, por persona y por día — y lo cruza con tu plan de ahorro: cuánto tenés hoy, cuánto apartás por mes y cuántos meses faltan. El resultado no es solo el costo: es si llegás a la fecha del viaje, y si no, exactamente cuánto tenés que ahorrar por mes para llegar.",
    "icon": "🧳",
    "category": "finanzas",
    "lastReviewed": "2026-07-11",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-viaje-vacaciones",
        "label": "Presupuesto de viaje (versión rápida)"
      },
      {
        "slug": "calculadora-dias-ideales-viaje-destino",
        "label": "Días ideales según destino"
      },
      {
        "slug": "calculadora-costo-viaje-combustible-kilometros",
        "label": "Costo del viaje en auto"
      },
      {
        "slug": "calculadora-valor-millas-viajero-frecuente",
        "label": "Valor de tus millas"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Hacer rendir el ahorro hasta la fecha"
      }
    ]
  },
  {
    "slug": "cuanto-puedo-gastar-por-mes",
    "title": "¿Cuánto puedo gastar por mes sin endeudarme? 2026",
    "h1": "¿Cuánto puedo gastar por mes sin endeudarme?",
    "description": "Calculá tu tope de gasto variable mensual con la regla 50/30/20 adaptada: de tu ingreso, restamos obligaciones fijas y ahorro objetivo. Te decimos cuánto podés gastar por mes, semana y día sin entrar en rojo.",
    "intro": "Gastar sin un número en la cabeza es la forma más fácil de terminar en deuda. Esta sala adapta la regla 50/30/20 a tu situación: toma tu ingreso, descuenta tus obligaciones fijas y el ahorro que querés sostener, y te da un tope claro de cuánto podés gastar en lo variable cada mes, semana y día sin endeudarte.",
    "icon": "🧮",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      }
    ]
  },
  {
    "slug": "cuanto-sueldo-para-mantener-mi-nivel-de-vida",
    "title": "¿Cuánto sueldo necesito para mantener mi nivel de vida? 2026",
    "h1": "¿Cuánto sueldo necesito para mantener mi nivel de vida?",
    "description": "Calculá el sueldo bruto que necesitás para que tu neto en mano cubra tus gastos proyectados por inflación. Considera aportes, Ganancias y tu situación familiar. El número exacto a pedir en tu próxima negociación.",
    "intro": "La inflación te obliga a ganar más solo para quedarte igual. Esta sala toma tus gastos de hoy, los proyecta un año con la inflación esperada y calcula —por dentro, con la escala real de Ganancias— el sueldo bruto que necesitás para que tu neto en mano cubra esos gastos. Es el objetivo concreto de ingreso para no perder poder adquisitivo.",
    "icon": "📊",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-sueldo-bruto-desde-neto",
        "label": "Sueldo bruto desde el neto"
      },
      {
        "slug": "calculadora-impuesto-ganancias-sueldo",
        "label": "Impuesto a las Ganancias"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "cuanto-tiempo-de-mi-vida-cuesta-esta-compra",
    "title": "¿Cuánto tiempo de tu vida cuesta esta compra? 2026",
    "h1": "¿Cuánto tiempo de mi vida cuesta esta compra?",
    "description": "Traducí el precio de lo que querés comprar en horas, días y semanas de tu trabajo. Calcula tu valor-hora neto real (descontando los gastos de trabajar) y te dice cuánto tiempo de tu vida cuesta de verdad.",
    "intro": "El dinero se recupera; el tiempo no. Esta sala toma el precio de lo que querés comprar y lo traduce a la única moneda que no vuelve: las horas y días de tu vida que tenés que trabajar para pagarlo. Calcula tu valor-hora neto real (ya descontados los gastos de ir a trabajar) y te da una perspectiva que el precio en pesos esconde.",
    "icon": "⏳",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      }
    ]
  },
  {
    "slug": "cuanto-vale-mi-hora",
    "title": "¿Cuánto vale realmente mi hora de trabajo? Calculadora 2026",
    "h1": "¿Cuánto vale realmente mi hora de trabajo?",
    "description": "Calculá tu valor hora real, no el de folleto: descontá las horas extra que no te pagan, el tiempo de viaje y los gastos laborales. Descubrí cuánto vale de verdad cada hora que le dedicás al trabajo y usalo para decidir mejor.",
    "intro": "Dividir el sueldo por las horas contratadas da un número engañoso: no cuenta las horas extra que regalás, el viaje no pago ni los gastos de ir a trabajar. Esta sala calcula tu valor hora REAL —ingreso disponible sobre todas las horas que el trabajo te consume— y lo compara con el nominal. Es la cifra que te sirve para decidir si conviene una changa, delegar una tarea o hacer una hora extra.",
    "icon": "⏱️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-horas-extra",
        "label": "Horas extra"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      }
    ]
  },
  {
    "slug": "cuotas-o-contado",
    "title": "Cuotas o contado con inflación: qué conviene en 2026 (calculadora)",
    "h1": "Cuotas o contado: ¿qué conviene con esta inflación?",
    "description": "Compará el precio de contado con descuento contra el valor presente de las cuotas, descontando inflación y rendimiento. Con cuotas sin interés e inflación alta, financiar suele ganar. Te decimos cuál sale más barato hoy.",
    "intro": "Pagar en cuotas no es \"más caro\" automáticamente: con inflación, una cuota que pagás dentro de 10 meses vale mucho menos que hoy. Esta sala compara el contado con descuento contra el valor presente real de las cuotas, descontando inflación y el rendimiento que podrías sacarle a ese dinero, y te dice cuál sale más barato en pesos de hoy.",
    "icon": "💳",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      }
    ]
  },
  {
    "slug": "estoy-listo-para-jubilarme",
    "title": "¿Puedo jubilarme? Edad, aportes y si el haber te alcanza (simulador 2026)",
    "h1": "¿Puedo jubilarme ya? Edad, aportes y si te alcanza",
    "description": "Verificá si estás listo para jubilarte: edad y años de aportes requeridos, la brecha entre tu jubilación estimada y tus gastos, y cuánto te cubre tu ahorro. Incluye la moratoria si te faltan aportes.",
    "intro": "Jubilarte no es solo llegar a la edad: hay que ver si tenés los aportes, si la jubilación te alcanza para vivir y cuánto te cubre tu ahorro si queda una brecha. Esta sala cruza las tres cosas y te dice si estás listo, ajustado o con riesgo, y qué hacer en cada caso, incluida la moratoria si te faltan años de aportes.",
    "icon": "👵",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-fire-retiro-temprano",
        "label": "FIRE / retiro temprano"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      }
    ]
  },
  {
    "slug": "financiar-el-auto-o-contado",
    "title": "¿Financiar el auto o pagarlo al contado? Comparador 2026",
    "h1": "¿Financiar el auto o pagarlo al contado?",
    "description": "Compará el costo real de pagar el auto de contado (con descuento y costo de oportunidad) contra financiarlo en cuotas que la inflación licúa. Te decimos cuál sale más barato en valor de hoy.",
    "intro": "La cuenta no es solo \"cuánto pago de intereses\". Pagar de contado tiene un costo oculto: esa plata deja de rendir. Y financiar tiene un beneficio oculto: las cuotas fijas se licúan con la inflación. Esta sala compara los dos caminos en valor de hoy —descuento por contado, costo de oportunidad e inflación incluidos— y te dice cuál te deja mejor parado.",
    "icon": "💵",
    "category": "finanzas",
    "lastReviewed": "2026-07-11",
    "componentCalcs": [
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota del préstamo"
      },
      {
        "slug": "calculadora-cft-prestamo-personal-comparativa",
        "label": "CFT del crédito"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "guarderia-o-reducir-horas",
    "title": "¿Guardería o reducir horas de trabajo? Comparador 2026",
    "h1": "¿Nos conviene pagar guardería o reducir horas de trabajo?",
    "description": "Compará trabajar full y pagar guardería contra reducir tu jornada para cuidar al bebé. Te decimos qué opción deja más plata neta por mes, considerando guardería, transporte y aportes jubilatorios.",
    "intro": "Cuando llega un hijo, muchas familias dudan entre seguir trabajando full y pagar guardería, o reducir horas para cuidar en casa. La guardería puede comerse casi todo el sueldo extra. Esta sala compara las dos opciones con números: cuánto te queda neto por mes en cada una, descontando guardería y transporte, para que decidas con datos y no con culpa.",
    "icon": "⚖️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "calculadora-fire-retiro-temprano",
        "label": "Impacto en el largo plazo"
      }
    ]
  },
  {
    "slug": "me-conviene-aceptar-este-cliente",
    "title": "¿Me conviene aceptar este cliente o proyecto? Calculadora 2026",
    "h1": "¿Me conviene aceptar este cliente o proyecto?",
    "description": "Calculá el margen real y el valor por hora de un proyecto descontando impuestos, revisiones, costo de oportunidad de tu tiempo y riesgo de demora en el cobro. Decidí con números si te conviene aceptarlo.",
    "intro": "Un proyecto que paga bien puede dejarte poco si te lleva horas eternas, revisiones infinitas o un cobro que se demora. Esta sala toma el monto y le descuenta impuestos, el costo de oportunidad de tu tiempo (incluidas las revisiones) y el riesgo de demora, para mostrarte el margen real y el valor por hora verdadero. Así decidís con números si te conviene aceptar este cliente o tu tiempo rinde más en otro lado.",
    "icon": "🤝",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-costo-hora-empleado-real",
        "label": "Costo real de la hora"
      },
      {
        "slug": "calculadora-punto-equilibrio-break-even",
        "label": "Break-even freelance"
      },
      {
        "slug": "calculadora-cuanto-cobrar-traduccion-palabra-2026-espanol-ingles",
        "label": "Cuánto cobrar"
      },
      {
        "slug": "calculadora-monotributo-2026",
        "label": "Cuota de monotributo"
      }
    ]
  },
  {
    "slug": "me-conviene-adelantar-cuotas",
    "title": "¿Me conviene adelantar cuotas del préstamo o invertir? 2026",
    "h1": "¿Me conviene adelantar cuotas de mi préstamo?",
    "description": "Compará el ahorro de intereses por adelantar cuotas contra lo que rendiría ese mismo dinero invertido. Gana la tasa efectiva más alta: te decimos la ventaja anual de cada opción.",
    "intro": "Tenés un préstamo y un dinero extra: ¿adelantás cuotas o lo invertís? Adelantar capital es un \"rendimiento garantizado\" igual a la tasa efectiva de tu préstamo. Esta sala compara esa tasa contra el rendimiento que le sacarías invirtiendo el mismo dinero y te dice cuál gana y por cuánto al año, sin perder de vista la liquidez.",
    "icon": "⚖️",
    "category": "finanzas",
    "lastReviewed": "2026-07-11",
    "componentCalcs": [
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-cft-prestamo-personal-comparativa",
        "label": "CFT de un préstamo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      }
    ]
  },
  {
    "slug": "me-conviene-emigrar",
    "title": "¿Me conviene emigrar? Comparador de ahorro y costo de vida 2026",
    "h1": "¿Me conviene emigrar?",
    "description": "Compará tu capacidad de ahorro real (sueldo neto menos costo de vida) en tu país actual contra el destino, y descubrí en cuántos meses recuperás el costo de la mudanza. Honesto sobre lo que no mide.",
    "intro": "Emigrar no se decide por el sueldo que te ofrecen afuera, sino por cuánto podés ahorrar de verdad allá vs acá. Esta sala compara tu capacidad de ahorro (sueldo neto menos costo de vida) a cada lado, calcula cuánto mejora por mes y en cuánto tiempo recuperás la mudanza. Te dice qué dicen los números, y es honesta sobre lo que no mide.",
    "icon": "✈️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "me-conviene-estudiar-esta-carrera",
    "title": "¿Me conviene estudiar esta carrera o curso? ROI educativo 2026",
    "h1": "¿Me conviene estudiar esta carrera o curso?",
    "description": "Calculá el retorno real de una carrera o curso: cuánto cuesta (matrícula + ingreso que resignás) contra cuánto mejora tu sueldo al recibirte, y en cuántos años recuperás la inversión. Con ajuste por empleabilidad.",
    "intro": "Estudiar es una inversión: cuesta plata y, sobre todo, el ingreso que resignás mientras lo hacés. Esta sala pone esa inversión total contra la mejora de sueldo esperada al recibirte y te dice en cuántos años la recuperás (el ROI educativo), ajustado por la empleabilidad de la carrera. Así decidís con números, no con expectativas.",
    "icon": "🎓",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "me-conviene-vender-mi-auto",
    "title": "¿Me conviene vender mi auto? Cuánto liberás y ahorrás 2026",
    "h1": "¿Me conviene vender mi auto?",
    "description": "Calculá cuánta plata liberás al vender tu auto (descontando la deuda) y cuánto ahorrás por mes en seguro, patente, service y combustible, neto del transporte alternativo.",
    "intro": "Vender el auto tiene dos efectos: te entra plata de golpe (descontando la deuda que tenga) y dejás de pagar todos sus costos mensuales. Pero si después tenés que moverte en colectivo, taxi o app, ese gasto se descuenta del ahorro. Esta sala calcula cuánto liberás de verdad y cuánto ahorrás por mes, para que la decisión sea con números y no con corazonadas.",
    "icon": "🔑",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-combustible-viaje-auto",
        "label": "Costo de combustible"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Saldo de la prenda"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Invertir lo liberado"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      }
    ]
  },
  {
    "slug": "me-conviene-vender-mi-propiedad",
    "title": "¿Me conviene vender mi propiedad ahora? Neto real 2026",
    "h1": "¿Me conviene vender mi propiedad ahora?",
    "description": "Calculá cuánto te queda realmente al vender tu propiedad después de comisión, impuestos, deuda y mudanza, y cuánto rinde ese capital invertido. Para que decidas si vender ahora conviene.",
    "intro": "El precio de venta de tu propiedad no es lo que te queda. Entre comisión inmobiliaria, impuestos, la deuda que tengas que cancelar y la mudanza, el neto es bastante menor. Esta sala calcula cuánto te queda en la mano después de todos los gastos y cuánto rendiría ese capital invertido, para que lo compares con lo que la propiedad te da hoy y decidas si conviene vender ahora.",
    "icon": "🏷️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-comision-inmobiliaria-venta-inmueble-4-porciento",
        "label": "Comisión inmobiliaria"
      },
      {
        "slug": "calculadora-cap-rate-rentabilidad-alquiler-inmobiliario",
        "label": "Rentabilidad de alquiler"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      }
    ]
  },
  {
    "slug": "me-despidieron",
    "title": "Me despidieron: cuánto me corresponde y cuántos meses me cubre (2026)",
    "h1": "Me despidieron: ¿cuánto me corresponde y cuánto me dura?",
    "description": "Estimá tu liquidación por despido sin causa (indemnización, preaviso, integración, SAC y vacaciones) y cruzala con tus gastos, ahorros y deudas para saber cuántos meses podés sostenerte. Con seguro de desempleo.",
    "intro": "El día que te echan necesitás dos números: cuánta plata te tienen que pagar y cuánto tiempo te da. Esta sala calcula tu liquidación completa (antigüedad, preaviso, integración del mes, aguinaldo y vacaciones) y la cruza con tus gastos, ahorros y deudas para decirte cuántos meses de aire tenés y qué hacer primero.",
    "icon": "📄",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-indemnizacion-despido",
        "label": "Indemnización por despido"
      },
      {
        "slug": "calculadora-liquidacion-final-renuncia",
        "label": "Liquidación final"
      },
      {
        "slug": "calculadora-aguinaldo-sac",
        "label": "Aguinaldo (SAC)"
      },
      {
        "slug": "calculadora-vacaciones-no-tomadas-indemnizacion-formula",
        "label": "Vacaciones no gozadas"
      }
    ]
  },
  {
    "slug": "mi-negocio-es-rentable",
    "title": "¿Mi negocio es rentable? Margen y punto de equilibrio 2026",
    "h1": "¿Mi negocio es rentable?",
    "description": "Medí la rentabilidad de tu negocio: margen bruto, margen neto, punto de equilibrio y flujo del mes a partir de tus ingresos, costos variables, costos fijos y deuda. Diagnóstico claro y próximos pasos.",
    "intro": "\"Vendo bien\" no es lo mismo que \"gano plata\". Esta sala toma tus ingresos y los separa de tus costos variables, fijos y la deuda para mostrarte tu margen bruto, tu margen neto y, sobre todo, tu punto de equilibrio: cuánto necesitás facturar para no perder. Con eso sabés si tu negocio es rentable, está al límite o trabaja a pérdida, y qué palanca tocar.",
    "icon": "📊",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-punto-equilibrio-break-even",
        "label": "Punto de equilibrio"
      },
      {
        "slug": "calculadora-cafeteria-cuanto-cobrar-pais-cafe-medialuna-margen",
        "label": "Margen por producto"
      },
      {
        "slug": "calculadora-costo-laboral-total-empleador-cargas",
        "label": "Costo laboral"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      }
    ]
  },
  {
    "slug": "monotributo-o-responsable-inscripto",
    "title": "Monotributo vs Responsable Inscripto 2026: cuál conviene según tu facturación",
    "h1": "Monotributo o Responsable Inscripto: ¿cuál te conviene?",
    "description": "Compará la carga impositiva del monotributo contra Responsable Inscripto sobre tu facturación: cuota fija vs IVA, Ganancias, IIBB y contador. Te decimos cuál te deja más neto según a quién le vendas.",
    "intro": "La elección entre monotributo y Responsable Inscripto cambia mucho según cuánto factures, cuánto compres con IVA y a quién le vendas. El monotributo es una cuota fija simple pero te hace perder el IVA de tus compras; Responsable Inscripto te deja computar ese IVA pero suma Ganancias, IIBB y contador. Esta sala estima la carga de cada uno y te dice cuál te deja más en el bolsillo.",
    "icon": "⚖️",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-monotributo-vs-responsable-inscripto",
        "label": "Monotributo vs RI (detalle)"
      },
      {
        "slug": "calculadora-facturacion-maxima-monotributo-vs-ri",
        "label": "Facturación máxima por régimen"
      },
      {
        "slug": "calculadora-monotributo-2026",
        "label": "Cuota de monotributo"
      },
      {
        "slug": "calculadora-monotributo-categoria-ingresos-tope",
        "label": "Categoría y topes"
      }
    ]
  },
  {
    "slug": "nafta-hibrido-o-electrico",
    "title": "¿Nafta, híbrido o eléctrico? Comparador de costo total 2026",
    "h1": "¿Nafta, híbrido o eléctrico?",
    "description": "Compará el costo total a varios años de un auto a nafta, híbrido o eléctrico: precio, combustible o energía y mantenimiento. Te decimos cuál sale menos y a partir de cuántos años conviene el eléctrico.",
    "intro": "El eléctrico cuesta más al comprar pero gasta una fracción en energía y casi nada en mantenimiento; el nafta es barato de entrada pero caro de usar; el híbrido queda en el medio. Lo que decide es el costo total a los años que lo vas a tener, según tus kilómetros. Esta sala lo calcula para los tres y te dice cuál gana y a partir de cuántos años el eléctrico se amortiza.",
    "icon": "⚡",
    "category": "finanzas",
    "lastReviewed": "2026-07-11",
    "componentCalcs": [
      {
        "slug": "calculadora-combustible-viaje-auto",
        "label": "Costo de combustible"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota del crédito"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "podemos-afrontar-este-viaje-familiar",
    "title": "¿Podemos afrontar este viaje familiar? Calculadora 2026",
    "h1": "¿Podemos afrontar este viaje familiar?",
    "description": "Sumá el costo real de tu viaje familiar (vuelos, alojamiento, comidas, seguros, cambio de moneda, gastos post-viaje) y mirá si te alcanza el ahorro o en cuántas cuotas conviene financiarlo.",
    "intro": "Un viaje en familia no es solo los vuelos: son las comidas de cada día, el alojamiento, los seguros, el recargo por moneda extranjera y los gastos que aparecen en el resumen después. Esta sala suma todo el costo real y lo cruza con tu ahorro para decirte si lo pagás de contado y con qué colchón quedás, o cuánto te falta y a qué cuota mensual.",
    "icon": "✈️",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "calculadora-combustible-viaje-auto",
        "label": "Costo de combustible (si vas en auto)"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Ahorrar para el viaje"
      }
    ]
  },
  {
    "slug": "podemos-vivir-con-un-solo-ingreso",
    "title": "¿Podemos vivir con un solo ingreso? Test 2026",
    "h1": "¿Podemos vivir con un solo ingreso?",
    "description": "Averiguá si tu familia puede vivir con un solo ingreso: si lo que queda cubre los gastos, cuánto déficit hay recortando lo prescindible y cuántos meses aguanta tu ahorro tapando el hueco.",
    "intro": "Pasar a un solo ingreso (por una licencia, para criar a un hijo o tras un despido) es una de las decisiones más grandes de una familia. La pregunta es simple: ¿alcanza? Esta sala compara el ingreso que queda contra tus gastos, calcula el déficit recortando lo prescindible y te dice cuántos meses aguanta tu ahorro tapando el hueco.",
    "icon": "🏡",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "calculadora-fire-retiro-temprano",
        "label": "Independencia financiera"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Armar el colchón"
      }
    ]
  },
  {
    "slug": "puedo-afrontar-un-credito-uva",
    "title": "Crédito UVA: simulador de cuota, ingreso mínimo y estrés 2026",
    "h1": "Crédito UVA: ¿podés pagar la cuota si sube?",
    "description": "Calculá la cuota inicial de tu crédito UVA, la relación cuota/ingreso que exigen los bancos (≤25%) y un stress que proyecta cómo evoluciona la cuota frente a tu salario. Te decimos si podés, con qué colchón y cuánto se deteriora.",
    "intro": "El crédito UVA tiene una trampa: la cuota arranca accesible pero ajusta por inflación. Si tu salario no le sigue el ritmo, la cuota se va comiendo tu ingreso. Esta sala calcula la cuota inicial, la relación cuota/ingreso que miran los bancos (tope 25%) y corre un stress que proyecta cómo evoluciona la cuota frente a tu salario a 12 y 24 meses, para decirte si de verdad podés afrontarlo.",
    "icon": "🏦",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-ingreso-minimo-credito-hipotecario-uva-banco-nacion",
        "label": "Ingreso mínimo para crédito UVA"
      },
      {
        "slug": "calculadora-credito-uva-cuota-actual",
        "label": "Hipoteca UVA BBVA"
      },
      {
        "slug": "calculadora-hipoteca-mensual-cuota-fija",
        "label": "Cuota de hipoteca"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      }
    ]
  },
  {
    "slug": "puedo-contratar-a-una-persona",
    "title": "¿Puedo contratar a una persona? Costo real 2026",
    "h1": "¿Puedo contratar a una persona?",
    "description": "Calculá el costo total real de contratar un empleado en blanco: sueldo bruto + cargas patronales + ART + aguinaldo + vacaciones (≈1,5× el bruto) y cruzalo con el ingreso de tu negocio para saber si lo podés sostener.",
    "intro": "Contratar no cuesta el sueldo: cuesta cerca de 1,5 veces el bruto una vez que sumás cargas patronales, ART, aguinaldo y vacaciones. Esta sala arma ese costo total real mes a mes y lo cruza con el ingreso de tu negocio para responder lo que de verdad importa antes de sumar gente: ¿lo podés sostener, o todavía no?",
    "icon": "🧑‍💼",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-costo-laboral-total-empleador-cargas",
        "label": "Costo laboral total"
      },
      {
        "slug": "calculadora-aportes-patronales-empleado-registrado-cargas-sociales-2026",
        "label": "Aportes patronales"
      },
      {
        "slug": "calculadora-costo-hora-empleado-real",
        "label": "Costo real de la hora"
      },
      {
        "slug": "calculadora-aguinaldo-sac",
        "label": "Aguinaldo (SAC)"
      }
    ]
  },
  {
    "slug": "puedo-hacer-esta-compra",
    "title": "¿Puedo hacer esta compra sin desordenar mis finanzas? 2026",
    "h1": "¿Puedo hacer esta compra sin desordenar mis finanzas?",
    "description": "Antes de comprar, mirá qué te deja: comparamos pagar al contado vs en cuotas y te decimos cuánto colchón te queda y si la compra toca tu fondo de emergencia. Semáforo claro: adelante, cuidado o esperá.",
    "intro": "La pregunta no es \"¿me alcanza?\", sino \"¿qué me deja esta compra?\". Esta sala compara pagarla al contado (impacto directo en tu ahorro) contra hacerlo en cuotas (con su costo financiero), y te dice cuánto colchón te queda después y si estás tocando tu fondo de emergencia. Un semáforo simple para no arrepentirte.",
    "icon": "🛒",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      }
    ]
  },
  {
    "slug": "puedo-mantener-este-auto",
    "title": "¿Puedo mantener este auto? Test de presupuesto 2026",
    "h1": "¿Puedo mantener este auto?",
    "description": "Sumá cuota, seguro, patente, combustible y service y descubrí qué porcentaje de tu ingreso se lleva el auto. Si supera el 20–25%, te está apretando. Te decimos qué ajustar.",
    "intro": "Comprar el auto es la mitad: lo que de verdad pesa es mantenerlo todos los meses. Esta sala suma cuota, seguro, patente, combustible, service, cochera y peajes, y lo mide contra tu ingreso. Si el auto se lleva más del 20–25% de lo que ganás, te está apretando, y te decimos por dónde empezar a recortar.",
    "icon": "🚙",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-combustible-viaje-auto",
        "label": "Costo de combustible"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota del crédito"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano"
      }
    ]
  },
  {
    "slug": "puedo-pagar-este-prestamo",
    "title": "¿Puedo pagar este préstamo? Calculá la cuota y si te entra 2026",
    "h1": "¿Puedo pagar este préstamo?",
    "description": "Calculá la cuota del préstamo y cruzala con tu ingreso, gastos y deudas para saber si te entra sin asfixiarte. Usa la relación cuota/ingreso (regla del 25-35%) y te dice tu cuota máxima saludable.",
    "intro": "Antes de firmar un préstamo, la pregunta no es \"¿cuánto me prestan?\" sino \"¿puedo pagar la cuota sin quedarme sin aire?\". Esta sala calcula la cuota por el sistema francés y la cruza con tu ingreso, tus gastos fijos y tus otras deudas para darte un semáforo claro: si entra cómodo, si quedás justo o si te deja en rojo.",
    "icon": "🏦",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      },
      {
        "slug": "calculadora-cft-prestamo-personal-comparativa",
        "label": "CFT de un préstamo"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      }
    ]
  },
  {
    "slug": "que-categoria-de-monotributo-me-corresponde",
    "title": "¿Qué categoría de monotributo me corresponde? Guía 2026",
    "h1": "¿Qué categoría de monotributo me corresponde y cuándo cambiar?",
    "description": "Estimá tu categoría de monotributo (A–K) según tu facturación anual, alquiler y energía, y descubrí en cuántos meses superarías el tope para recategorizar. Valores orientativos 2026, verificables en ARCA.",
    "intro": "El monotributo se recategoriza por tramos de facturación, y quedarse en la categoría equivocada te puede excluir del régimen. Esta sala ubica tu facturación de los últimos 12 meses (y tu proyección) contra los topes A–K, te dice qué categoría te corresponde y en cuántos meses superarías el tope al ritmo que venís. Los montos son aproximados: la fuente oficial siempre es ARCA.",
    "icon": "🧾",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-monotributo-2026",
        "label": "Cuota de monotributo 2026"
      },
      {
        "slug": "calculadora-monotributo-categoria-ingresos-tope",
        "label": "Categoría por ingresos y topes"
      },
      {
        "slug": "calculadora-facturacion-maxima-monotributo-vs-ri",
        "label": "Facturación máxima vs RI"
      },
      {
        "slug": "calculadora-monotributo-vs-responsable-inscripto",
        "label": "Monotributo vs Responsable Inscripto"
      }
    ]
  },
  {
    "slug": "que-decision-mejora-mas-mis-finanzas",
    "title": "¿Qué decisión mejora más mis finanzas? Ranking de impacto 2026",
    "h1": "¿Qué decisión mejora más mis finanzas?",
    "description": "Cargá el impacto mensual de cada decisión financiera (bajar el alquiler, vender el auto, refinanciar, subir ingresos, recortar gastos, invertir) y descubrí cuál mueve más la aguja, rankeada por impacto anual.",
    "intro": "Tenés varias formas de mejorar tus finanzas, pero no todas rinden igual y no podés con todas a la vez. Esta sala toma el impacto mensual de cada palanca (alquiler, auto, deuda, ingresos, cuotas, gastos, inversión), las rankea por impacto anual y te dice por dónde empezar para que tu esfuerzo rinda lo máximo posible.",
    "icon": "🎯",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota de préstamo"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      }
    ]
  },
  {
    "slug": "que-hago-con-mis-ahorros",
    "title": "¿Qué hago con mis ahorros? Opciones explicadas según tu caso 2026",
    "h1": "¿Qué hago con mis ahorros?",
    "description": "Comparativa educativa de qué hacer con tus ahorros según tu situación: plazo fijo, dólar/MEP, money market, cancelar deuda o fondo de emergencia. Rendimientos estimados y la prioridad correcta. No es asesoramiento.",
    "intro": "Tenés plata ahorrada y no sabés qué hacer con ella. Esta sala NO te dice \"comprá esto\": te ordena las opciones según tu situación real (plazo, liquidez, deuda, fondo de emergencia) y te muestra el rendimiento estimado de cada una, con la regla de oro que sí aplica siempre: primero el colchón, después cancelar deuda cara, recién después invertir.",
    "icon": "💡",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      }
    ]
  },
  {
    "slug": "que-pasa-si-pierdo-mi-ingreso",
    "title": "¿Qué pasa si pierdo mi ingreso mañana? Test de supervivencia 2026",
    "h1": "¿Qué pasa si pierdo mi ingreso mañana?",
    "description": "Simulá el peor escenario: cero ingresos desde mañana. Calculá tu fondo de supervivencia (ahorros + indemnización − deudas) y cuántos meses aguantás recortando lo prescindible. La meta sana es 6 meses.",
    "intro": "Nadie quiere pensarlo, pero saberlo da tranquilidad: si mañana perdés tu ingreso, ¿cuántos meses aguantás? Esta sala hace el stress test. Suma tus activos líquidos y tu indemnización, resta tus deudas y divide por tus gastos (normales y recortados al mínimo) para decirte cuántos meses de aire tenés y cuánto te falta para llegar a los 6 que se consideran sanos.",
    "icon": "🛟",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-indemnizacion-despido",
        "label": "Indemnización por despido"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Regla 50/30/20"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo"
      },
      {
        "slug": "calculadora-interes-compuesto",
        "label": "Interés compuesto"
      }
    ]
  },
  {
    "slug": "refaccionar-o-mudarme",
    "title": "¿Me conviene refaccionar o mudarme? Comparador 2026",
    "h1": "¿Me conviene refaccionar o mudarme?",
    "description": "Compará el costo neto de refaccionar tu vivienda (obra + sobrecosto − valor agregado) contra mudarte a algo mejor (mudanza + diferencia de precio). Te decimos cuál sale mejor económicamente.",
    "intro": "Tu casa te quedó chica o vieja: ¿la refaccionás o te mudás a algo mejor? Refaccionar cuesta la obra (que casi siempre se pasa del presupuesto) pero suma valor a tu propiedad. Mudarte cuesta la mudanza más la diferencia de precio por algo equivalente a lo refaccionado. Esta sala compara el costo NETO de cada camino para decirte cuál sale mejor económicamente, y te recuerda pesar las molestias.",
    "icon": "🔨",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-costo-m2-construccion-argentina",
        "label": "Costo por m² de construcción"
      },
      {
        "slug": "calculadora-costo-total-comprar-propiedad-gastos",
        "label": "Costo total de comprar"
      },
      {
        "slug": "calculadora-alquiler-vs-comprar",
        "label": "Alquilar vs comprar"
      },
      {
        "slug": "calculadora-cap-rate-rentabilidad-alquiler-inmobiliario",
        "label": "Rentabilidad de alquiler"
      }
    ]
  },
  {
    "slug": "relacion-dependencia-o-facturar",
    "title": "Relación de dependencia o monotributo: cuánto facturar para igualar tu sueldo (2026)",
    "h1": "¿Relación de dependencia o facturar? Cuánto necesitás facturar para igualar tu sueldo",
    "description": "Compará trabajar en relación de dependencia contra facturar como monotributista con números reales: neto en mano, aguinaldo, vacaciones, indemnización, cuota y contador. Te decimos cuánto tenés que facturar para igualar el sueldo en blanco.",
    "intro": "Comparar el sueldo bruto contra el monto a facturar engaña: la relación de dependencia trae aguinaldo, vacaciones pagas, aportes e indemnización que el monotributista no tiene. Esta sala calcula el ingreso real de cada opción y te da el número que de verdad importa: cuánto tenés que facturar para igualar la posición en blanco.",
    "icon": "🧾",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-monotributo-2026",
        "label": "Monotributo 2026"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-aguinaldo-sac",
        "label": "Aguinaldo (SAC)"
      },
      {
        "slug": "calculadora-impuesto-ganancias-sueldo",
        "label": "Impuesto a las Ganancias"
      }
    ]
  },
  {
    "slug": "renovar-alquiler-o-mudarme",
    "title": "Renovar alquiler o mudarse: qué conviene en 2026 (comparador de costos)",
    "h1": "¿Renovar el alquiler o mudarse? Compará el costo real",
    "description": "Compará el costo del primer año de renovar el alquiler contra mudarte a otra zona, incluyendo depósito, comisión, mudanza, arreglos y tiempo de viaje. Te decimos cuánto tenés que ahorrar por mes para que mudarte valga la pena.",
    "intro": "Te llega la renovación con un aumento y pensás: ¿aguanto o me mudo a una zona más barata? Mudarte parece tentador, pero arranca con depósito, comisión, mudanza y arreglos, y muchas veces suma tiempo de viaje. Esta sala compara el costo del primer año de cada opción y te dice cuánto tenés que ahorrar de alquiler por mes para que mudarte realmente convenga.",
    "icon": "📦",
    "category": "finanzas",
    "lastReviewed": "2026-07-21",
    "componentCalcs": [
      {
        "slug": "calculadora-aumento-alquiler-trimestral-cuatrimestral-semestral",
        "label": "Aumento del alquiler"
      },
      {
        "slug": "calculadora-actualizacion-alquiler-icl",
        "label": "Actualización de alquiler (ICL)"
      },
      {
        "slug": "calculadora-comision-inmobiliaria-venta-inmueble-4-porciento",
        "label": "Comisión inmobiliaria"
      },
      {
        "slug": "calculadora-alquiler-vs-comprar",
        "label": "Alquilar vs comprar"
      }
    ]
  },
  {
    "slug": "reparar-o-reemplazar-electrodomestico",
    "title": "¿Reparar o reemplazar el electrodoméstico? Comparador 2026",
    "h1": "¿Conviene reparar o reemplazar un electrodoméstico?",
    "description": "Compará reparar tu electrodoméstico contra comprar uno nuevo midiendo el costo por mes de uso: desembolso, vida útil y consumo de energía. Te decimos cuál te sale más barato a la larga.",
    "intro": "Se rompió la heladera o el lavarropas y aparece la duda: ¿lo arreglo o compro uno nuevo? Mirar solo el precio engaña. Lo que importa es el costo por mes de uso: un arreglo barato que dura poco puede salir más caro que un equipo nuevo que dura años y consume menos energía. Esta sala compara las dos opciones con esa métrica justa.",
    "icon": "🔧",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-cuota-prestamo",
        "label": "Cuota si lo financiás"
      },
      {
        "slug": "calculadora-inflacion-acumulada-periodo",
        "label": "Inflación acumulada"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      }
    ]
  },
  {
    "slug": "trabajo-remoto-hibrido-o-presencial",
    "title": "¿Remoto, híbrido o presencial? Cuánto te cuesta ir a la oficina 2026",
    "h1": "¿Me conviene remoto, híbrido o presencial?",
    "description": "Calculá cuánto te cuesta de verdad ir a la oficina: transporte, comida y tiempo de viaje, frente al costo de trabajar remoto. Compará las tres modalidades y descubrí cuánto ahorrás por mes y por año trabajando desde casa.",
    "intro": "Ir a la oficina tiene un costo que casi nadie suma: además del transporte y la comida, está el tiempo de viaje, que vale plata. Esta sala compara remoto, híbrido y presencial poniendo todos esos costos en pesos por mes, y te dice cuánto ahorrás trabajando desde casa. Útil para negociar modalidad o evaluar una oferta remota.",
    "icon": "🏠",
    "category": "finanzas",
    "lastReviewed": "2026-06-29",
    "componentCalcs": [
      {
        "slug": "calculadora-combustible-viaje-auto",
        "label": "Combustible de un viaje en auto"
      },
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano (neto)"
      },
      {
        "slug": "calculadora-presupuesto-regla-50-30-20",
        "label": "Presupuesto 50/30/20"
      }
    ]
  }
];
