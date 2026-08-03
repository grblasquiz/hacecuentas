export interface InstitutionalJourney {
  slug: string;
  title: string;
  description: string;
  silo: string;
  siloHref: string;
  eyebrow: string;
  h1: string;
  lede: string;
  accent: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    result: string;
    actions: string[];
    links: string[];
  }>;
  related: Array<{ href: string; title: string; copy: string }>;
  sources: Array<{ href: string; label: string; publisher: string }>;
  faq: Array<{ q: string; a: string }>;
  note: string;
}

const commonFaq = (topic: string) => [
  {
    q: `¿Este recorrido reemplaza el trámite oficial de ${topic}?`,
    a: "No. Ordena la decisión, estima los números y te lleva a la ventanilla correcta. La solicitud y la validación final siempre se hacen ante el organismo indicado.",
  },
  {
    q: "¿Tengo que registrarme para usarlo?",
    a: "No. Las respuestas se procesan en tu navegador y Hacé Cuentas no te pide nombre, DNI, CUIL ni datos de contacto.",
  },
  {
    q: "¿La conclusión es asesoramiento profesional?",
    a: "Es una orientación práctica basada en fuentes públicas. En casos conflictivos, montos altos o situaciones particulares conviene validarla con un profesional matriculado.",
  },
];

export const JOURNEYS: Record<string, InstitutionalJourney> = {
  accidente: {
    slug: "trabajo/accidente-laboral",
    title: "Accidente laboral: qué hacer, qué cobra la ART y cuándo reclamar",
    description:
      "Recorrido paso a paso ante un accidente laboral: denuncia, ART, sueldo durante la baja, incapacidad, Comisión Médica e indemnización orientativa.",
    silo: "Trabajo",
    siloHref: "/trabajo",
    eyebrow: "SRT · ART · recorrido laboral",
    h1: "Tuve un accidente laboral: ¿qué hago ahora?",
    lede: "Elegí en qué momento del caso estás. Te mostramos el próximo paso, qué documentación guardar y qué herramienta usar para estimar lo económico.",
    accent: "#b54708",
    question: "¿En qué situación estás?",
    options: [
      {
        id: "sin-denuncia",
        label: "Todavía no hice la denuncia",
        result:
          "Denunciá el accidente cuanto antes al empleador o directamente a la ART.",
        actions: [
          "Avisá por un medio que deje constancia.",
          "Pedí el número de siniestro y guardá estudios, certificados y recibos.",
          "Si la ART rechaza la denuncia, podés iniciar el trámite ante la SRT.",
        ],
        links: ["srt-worker"],
      },
      {
        id: "tratamiento",
        label: "Estoy de baja o en tratamiento",
        result:
          "La ART debe brindar tratamiento y cubrir la prestación dineraria durante la incapacidad temporaria.",
        actions: [
          "Controlá que el pago acompañe tu remuneración habitual.",
          "Guardá cada alta, baja, traslado y prescripción.",
          "Si no estás de acuerdo con el alta o las prestaciones, recurrí a Comisión Médica.",
        ],
        links: ["art-payments", "commissions"],
      },
      {
        id: "secuelas",
        label: "Me dieron el alta pero quedaron secuelas",
        result:
          "Corresponde evaluar el porcentaje de incapacidad y la prestación de pago único.",
        actions: [
          "No firmes una conformidad que no entendés.",
          "Reuní historia clínica, estudios y constancia de alta.",
          "La valoración o determinación se tramita ante Comisión Médica con patrocinio letrado.",
        ],
        links: ["permanent", "damage"],
      },
      {
        id: "rechazo",
        label: "La ART rechazó el caso o no responde",
        result:
          "Pedí la intervención de la SRT; el tipo de trámite depende de qué rechazó o incumplió la ART.",
        actions: [
          "Identificá si discutís la contingencia, el alta, el tratamiento o la incapacidad.",
          "Conservá la carta de rechazo y las constancias médicas.",
          "Verificá el plazo aplicable antes de demorar el reclamo.",
        ],
        links: ["commissions", "srt-worker"],
      },
    ],
    related: [
      {
        href: "/trabajo/indemnizacion-por-despido",
        title: "Estimar indemnización e incapacidad",
        copy: "Calculá una referencia económica y distinguí accidente laboral de despido.",
      },
      {
        href: "/trabajo/liquidacion-final",
        title: "Revisar la liquidación laboral",
        copy: "Separá los rubros de la relación laboral de los pagos propios de la ART.",
      },
    ],
    sources: [
      {
        href: "https://www.argentina.gob.ar/srt/trabajador",
        label: "Herramientas para el trabajador",
        publisher: "SRT",
      },
      {
        href: "https://www.argentina.gob.ar/srt/art/pagos-art",
        label: "Pagos que deben efectuar las ART",
        publisher: "SRT",
      },
      {
        href: "https://www.argentina.gob.ar/srt/art/pagos-art/incapacidad-laboral-permanente",
        label: "Incapacidad Laboral Permanente",
        publisher: "SRT",
      },
      {
        href: "https://www.argentina.gob.ar/srt/comisionesmedicas/tramites",
        label: "Trámites ante Comisiones Médicas",
        publisher: "SRT",
      },
      {
        href: "https://www.argentina.gob.ar/servicio/valoracion-del-dano",
        label: "Valoración del daño",
        publisher: "Argentina.gob.ar",
      },
    ],
    faq: [
      ...commonFaq("la SRT"),
      {
        q: "¿Quién paga mientras estoy de baja?",
        a: "Durante la incapacidad laboral temporaria corresponde una prestación dineraria calculada sobre la remuneración, con las reglas y actualizaciones informadas por la SRT.",
      },
      {
        q: "¿Toda secuela genera indemnización?",
        a: "La prestación depende de que se determine una incapacidad laboral permanente y de su porcentaje. La Comisión Médica interviene en esa determinación.",
      },
      {
        q: "¿Puedo discutir el alta médica?",
        a: "Sí. La SRT contempla el trámite por divergencia en el alta, además de divergencias en prestaciones y en la determinación de incapacidad.",
      },
      {
        q: "¿Necesito abogado?",
        a: "Los trámites vinculados con valoración o determinación de incapacidad requieren patrocinio letrado. Revisá el requisito concreto del trámite que vas a iniciar.",
      },
    ],
    note: "Los montos por incapacidad dependen de edad, ingreso base, porcentaje y fecha del accidente. La estimación no sustituye la resolución de la Comisión Médica.",
  },
  regimen: {
    slug: "impuestos/elegir-regimen",
    title:
      "Monotributo, autónomo o responsable inscripto: qué régimen conviene",
    description:
      "Decidí si seguir en monotributo o pasar al régimen general según facturación, gastos, clientes, IVA y riesgo de exclusión.",
    silo: "Impuestos",
    siloHref: "/impuestos",
    eyebrow: "ARCA · decisión fiscal",
    h1: "¿Sigo en monotributo o tengo que cambiar de régimen?",
    lede: "No alcanza con comparar una cuota contra Ganancias. Primero hay que detectar si todavía podés permanecer y después mirar IVA, gastos computables, autónomos y tipo de cliente.",
    accent: "#6b4eff",
    question: "¿Qué describe mejor tu situación?",
    options: [
      {
        id: "dentro",
        label: "Estoy dentro de los topes y vendo a consumidores finales",
        result:
          "El monotributo suele ser el punto de partida más simple, siempre que cumplas todos los parámetros.",
        actions: [
          "Revisá facturación acumulada de 12 meses, alquileres, superficie y precio unitario.",
          "Controlá la categoría en cada recategorización.",
          "Separá Ingresos Brutos: no está incluido en todos los casos.",
        ],
        links: ["mono"],
      },
      {
        id: "limite",
        label: "Estoy cerca del tope o crecí rápido",
        result:
          "Necesitás proyectar 12 meses: esperar a excederte puede convertir una transición planificada en exclusión.",
        actions: [
          "Proyectá ventas y no sólo lo ya facturado.",
          "Simulá IVA débito menos crédito, Ganancias y autónomos.",
          "Revisá con contador antes de emitir comprobantes fuera del régimen.",
        ],
        links: ["mono"],
      },
      {
        id: "gastos",
        label: "Tengo muchos gastos con factura A",
        result:
          "El régimen general puede recuperar IVA crédito y deducir costos; la comparación debe hacerse sobre margen, no facturación.",
        actions: [
          "Clasificá gastos computables y no computables.",
          "Medí cuánto IVA crédito real generás.",
          "Compará costo total anual, cumplimiento y honorarios.",
        ],
        links: ["mono"],
      },
      {
        id: "empresas",
        label: "Mis clientes son empresas o exporto servicios",
        result:
          "El tipo de cliente y la operación pueden cambiar la conveniencia aunque todavía entres por facturación.",
        actions: [
          "Confirmá qué comprobante necesita el cliente.",
          "Separá exportación de servicios de ventas locales.",
          "Revisá cobro, moneda, IVA e Ingresos Brutos con criterio profesional.",
        ],
        links: ["mono"],
      },
    ],
    related: [
      {
        href: "/impuestos/monotributo",
        title: "Categoría y cuota de monotributo",
        copy: "Calculá tu categoría con los parámetros vigentes.",
      },
      {
        href: "/impuestos/ganancias-cuarta-categoria",
        title: "Comparar Ganancias y monotributo",
        copy: "Usá el caso de cambio de régimen y revisá la diferencia anual.",
      },
      {
        href: "/impuestos/ingresos-brutos",
        title: "Sumar Ingresos Brutos",
        copy: "Incluí el impuesto provincial en el costo total.",
      },
    ],
    sources: [
      {
        href: "https://arca.gob.ar/monotributo/categorias.asp",
        label: "Montos y categorías vigentes",
        publisher: "ARCA",
      },
      {
        href: "https://www.arca.gob.ar/monotributo/",
        label: "Portal de monotributo",
        publisher: "ARCA",
      },
      {
        href: "https://www.arca.gob.ar/autonomos/",
        label: "Trabajadores autónomos",
        publisher: "ARCA",
      },
    ],
    faq: [
      ...commonFaq("ARCA"),
      {
        q: "¿Alcanza con mirar el tope de facturación?",
        a: "No. También pueden intervenir precio unitario, alquileres, superficie, energía y actividades incompatibles, según el caso.",
      },
      {
        q: "¿Responsable inscripto y autónomo son lo mismo?",
        a: "No. Responsable inscripto describe la situación frente al IVA; autónomos es el régimen previsional. En el régimen general suelen aparecer ambos, además de Ganancias e Ingresos Brutos.",
      },
      {
        q: "¿Los gastos hacen más conveniente el régimen general?",
        a: "Pueden hacerlo porque generan crédito fiscal de IVA y deducciones, pero sólo si son reales, están vinculados a la actividad y tienen respaldo válido.",
      },
      {
        q: "¿Cuándo conviene hablar con un contador?",
        a: "Antes de superar parámetros, incorporar una actividad nueva, exportar servicios o empezar a trabajar principalmente con empresas.",
      },
    ],
    note: "La herramienta ordena la comparación. La inscripción, exclusión y tratamiento fiscal exacto dependen de tu actividad y jurisdicción.",
  },
  credito: {
    slug: "finanzas-personales/perfil-crediticio",
    title:
      "Perfil crediticio: cómo saber si podés pedir un crédito y mejorar tu situación",
    description:
      "Interpretá la Central de Deudores del BCRA, evaluá tu carga de cuotas y armá un plan antes de pedir un préstamo.",
    silo: "Finanzas personales",
    siloHref: "/finanzas-personales",
    eyebrow: "BCRA · crédito responsable",
    h1: "¿Estoy en condiciones de pedir un crédito?",
    lede: "Primero mirá qué ve el sistema financiero; después calculá si la cuota entra de verdad en tu presupuesto.",
    accent: "#075985",
    question: "¿Qué encontraste al revisar tu situación?",
    options: [
      {
        id: "normal",
        label: "Estoy en situación normal y pago al día",
        result:
          "Tenés una base razonable, pero la aprobación también depende de ingreso, antigüedad, políticas del banco y carga total de cuotas.",
        actions: [
          "Sumá todas tus cuotas actuales.",
          "Probá la nueva cuota con un escenario de ingreso más bajo.",
          "Compará CFT, no sólo TNA.",
        ],
        links: ["bcra"],
      },
      {
        id: "atraso",
        label: "Tengo atrasos o una situación distinta de 1",
        result:
          "Antes de sumar deuda, entendé qué entidad informó el atraso y regularizá o reclamá si es incorrecto.",
        actions: [
          "Identificá entidad, monto, período y situación.",
          "Pedí el detalle y la regularización al informante.",
          "Guardá comprobantes y esperá la actualización mensual.",
        ],
        links: ["bcra", "rectify"],
      },
      {
        id: "error",
        label: "La información es incorrecta o ya pagué",
        result:
          "El reclamo empieza ante la entidad que informó; el BCRA actúa como segunda instancia.",
        actions: [
          "Reclamá por un canal que entregue número de gestión.",
          "Adjuntá libre deuda o comprobantes.",
          "Si no se corrige, usá el trámite de rectificación del BCRA.",
        ],
        links: ["rectify"],
      },
      {
        id: "sin-historial",
        label: "No tengo historial crediticio",
        result:
          "No tener atrasos ayuda, pero tampoco demuestra comportamiento de pago. Empezá con límites bajos y pagos totales puntuales.",
        actions: [
          "Evitá solicitar en muchas entidades al mismo tiempo.",
          "Usá poco del límite disponible.",
          "Pagá el total y no sólo el mínimo.",
        ],
        links: ["bcra"],
      },
    ],
    related: [
      {
        href: "/finanzas-personales/prestamo",
        title: "Calcular cuota y CFT",
        copy: "Compará cuánto pagás en total y si la cuota entra.",
      },
      {
        href: "/finanzas-personales/salir-de-deudas",
        title: "Armar un plan de salida",
        copy: "Ordená deudas antes de tomar un compromiso nuevo.",
      },
      {
        href: "/finanzas-personales/tarjeta-de-credito",
        title: "Entender el pago mínimo",
        copy: "Medí cuánto encarece financiar el saldo.",
      },
    ],
    sources: [
      {
        href: "https://www.bcra.gob.ar/conocer-que-es-la-central-de-deudores/",
        label: "Qué es la Central de Deudores",
        publisher: "BCRA",
      },
      {
        href: "https://www.bcra.gob.ar/rectificacion-supresion-central-deudores/",
        label: "Rectificar o suprimir registros",
        publisher: "BCRA",
      },
    ],
    faq: [
      ...commonFaq("el BCRA"),
      {
        q: "¿Qué información aparece en la Central de Deudores?",
        a: "Financiaciones informadas por bancos y otros proveedores de crédito, como préstamos, saldos de tarjetas e hipotecas, con historial de los últimos 24 meses.",
      },
      {
        q: "¿La situación 1 garantiza que me aprueben?",
        a: "No. Es una señal, pero cada entidad evalúa ingreso, estabilidad, endeudamiento, documentación y sus propias políticas.",
      },
      {
        q: "¿Cuándo se actualiza una deuda pagada?",
        a: "La Central se actualiza con información periódica de las entidades. Primero pedí la actualización al informante y conservá el comprobante.",
      },
      {
        q: "¿Cuánto de mi ingreso debería ir a cuotas?",
        a: "Como referencia prudente, todas las cuotas juntas deberían dejar margen suficiente para vivienda, gastos esenciales, ahorro e imprevistos; no uses sólo el máximo que acepta el banco.",
      },
    ],
    note: "Hacé Cuentas no consulta tu DNI ni accede a tu Central de Deudores. La consulta personal se hace únicamente en el sitio oficial.",
  },
  hijo: {
    slug: "familia/tener-un-hijo",
    title: "Voy a tener un hijo: licencias, asignaciones, gastos y trámites",
    description:
      "Recorrido desde el embarazo hasta el nacimiento: licencias, Prenatal, Maternidad, nacimiento, AUH o SUAF, presupuesto y trámites.",
    silo: "Familia",
    siloHref: "/familia",
    eyebrow: "ANSES · embarazo y nacimiento",
    h1: "Voy a tener un hijo: ¿qué cobro y qué tengo que hacer?",
    lede: "Ordenamos en una sola línea de tiempo lo laboral, ANSES, el nacimiento y el presupuesto familiar.",
    accent: "#a21caf",
    question: "¿En qué etapa estás?",
    options: [
      {
        id: "embarazo",
        label: "Durante el embarazo",
        result:
          "Revisá Prenatal o Asignación por Embarazo, licencia y acreditación de datos antes de que nazca.",
        actions: [
          "Verificá datos personales y vínculos en ANSES.",
          "Confirmá qué asignación corresponde según tu situación laboral.",
          "Planificá fechas y documentación de la licencia.",
        ],
        links: ["family", "plan"],
      },
      {
        id: "nacimiento",
        label: "Nació hace menos de 2 meses",
        result:
          "Acreditá el vínculo, reuní DNI y partida, y organizá cobertura, licencia y presupuesto del primer trimestre.",
        actions: [
          "Actualizá el vínculo familiar.",
          "Revisá alta en obra social o cobertura.",
          "Guardá comprobantes y consultá las prestaciones que se activan automáticamente.",
        ],
        links: ["family", "plan"],
      },
      {
        id: "pago-unico",
        label: "Nació o fue adoptado entre 2 meses y 2 años",
        result:
          "Podés revisar la Asignación Familiar por Nacimiento o Adopción y tramitarla si cumplís los requisitos.",
        actions: [
          "Controlá topes de ingreso vigentes.",
          "Reuní DNI, partida o sentencia.",
          "Iniciá Atención Virtual o pedí turno.",
        ],
        links: ["birth"],
      },
      {
        id: "primeros-anos",
        label: "Tiene menos de 3 años",
        result:
          "Revisá AUH o SUAF, controles de salud y las medidas del Plan 1000 días.",
        actions: [
          "Confirmá qué régimen de asignación corresponde.",
          "Cumplí controles y acreditaciones requeridas.",
          "Sumá los ingresos y gastos reales al presupuesto familiar.",
        ],
        links: ["family", "plan"],
      },
    ],
    related: [
      {
        href: "/familia/asignaciones-anses",
        title: "Calcular AUH y asignaciones",
        copy: "Compará AUH, SUAF, tramos y retenciones.",
      },
      {
        href: "/familia/costo-de-un-bebe",
        title: "Presupuesto mensual del bebé",
        copy: "Estimá pañales, alimentación, salud y cuidado.",
      },
      {
        href: "/embarazo/semanas",
        title: "Organizar el embarazo",
        copy: "Ubicá la semana y los próximos hitos.",
      },
    ],
    sources: [
      {
        href: "https://www.anses.gob.ar/asignaciones-familiares",
        label: "Asignaciones Familiares",
        publisher: "ANSES",
      },
      {
        href: "https://www.anses.gob.ar/asignacion-familiar-por-nacimiento-y-adopcion",
        label: "Nacimiento y Adopción",
        publisher: "ANSES",
      },
      {
        href: "https://www.anses.gob.ar/embarazo-y-nacimiento/plan-1000-dias",
        label: "Plan 1000 días",
        publisher: "ANSES",
      },
      {
        href: "https://www.argentina.gob.ar/normativa/nacional/25552/actualizacion",
        label: "Ley de Contrato de Trabajo actualizada",
        publisher: "Argentina.gob.ar",
      },
    ],
    faq: [
      ...commonFaq("ANSES"),
      {
        q: "¿El pago por nacimiento se cobra automáticamente?",
        a: "No siempre. ANSES informa que puede tramitarse por Atención Virtual o presencialmente, con datos y vínculos acreditados.",
      },
      {
        q: "¿Hasta cuándo se puede pedir?",
        a: "La página oficial indica que, para nacimiento o adopción, el niño o la sentencia deben estar dentro del período de 2 meses a 2 años.",
      },
      {
        q: "¿AUH y SUAF se cobran juntos por el mismo hijo?",
        a: "No. El régimen depende de la situación laboral e ingresos del grupo familiar; la herramienta de asignaciones ayuda a distinguirlos.",
      },
      {
        q: "¿La licencia y la asignación son lo mismo?",
        a: "No. La licencia protege el período laboral; la asignación es una prestación de seguridad social. Pueden intervenir reglas y organismos diferentes.",
      },
    ],
    note: "Los montos y topes cambian periódicamente. El recorrido enlaza las páginas oficiales para confirmar el valor vigente al momento del trámite.",
  },
  energia: {
    slug: "hogar/subsidios-energia",
    title: "Subsidios de luz, gas y garrafa: requisitos, inscripción y ahorro",
    description:
      "Descubrí si tu hogar puede solicitar Subsidios Energéticos Focalizados, qué datos necesitás y cómo impacta en luz, gas o garrafa.",
    silo: "Hogar",
    siloHref: "/hogar",
    eyebrow: "SEF · ReSEF · energía del hogar",
    h1: "¿Me corresponde subsidio de luz, gas o garrafa?",
    lede: "Identificá el servicio, revisá las condiciones del hogar y llegá al registro oficial con los datos preparados.",
    accent: "#047857",
    question: "¿Qué energía usás principalmente?",
    options: [
      {
        id: "luz-gas",
        label: "Electricidad y gas por red",
        result:
          "Revisá si el hogar califica para SEF y si la solicitud está correctamente asociada a los servicios.",
        actions: [
          "Tené a mano números de medidor, cliente o cuenta.",
          "Revisá ingresos y composición del hogar.",
          "Confirmá la inscripción en el registro oficial.",
        ],
        links: ["subsidies", "help"],
      },
      {
        id: "solo-luz",
        label: "Electricidad, sin gas de red",
        result:
          "Podés evaluar el subsidio eléctrico y, si usás garrafa, el beneficio específico para gas envasado.",
        actions: [
          "Identificá distribuidora y número de suministro.",
          "Revisá el consumo base aplicable.",
          "Consultá también el régimen de garrafas si corresponde.",
        ],
        links: ["subsidies"],
      },
      {
        id: "garrafa",
        label: "Garrafa",
        result:
          "El esquema oficial contempla subsidio para gas envasado mediante el registro correspondiente.",
        actions: [
          "Verificá si ya figurabas en programas anteriores.",
          "Inscribite en ReSEF si corresponde.",
          "Confirmá modalidad y medio de reintegro vigente.",
        ],
        links: ["subsidies", "help"],
      },
      {
        id: "problema",
        label: "Ya estoy inscripto pero no aparece el beneficio",
        result:
          "Revisá titularidad, asociación del suministro y los canales del Centro de Atención de Energía.",
        actions: [
          "Compará los datos de la factura con los declarados.",
          "Guardá número de gestión o reclamo.",
          "Contactá al ente o distribuidora que corresponda a tu zona.",
        ],
        links: ["help"],
      },
    ],
    related: [
      {
        href: "/hogar/factura-de-luz",
        title: "Entender la factura de luz",
        copy: "Separá consumo, cargos, impuestos y subsidio.",
      },
      {
        href: "/hogar/gas-y-agua",
        title: "Estimar gas y agua",
        copy: "Calculá consumo, zona fría y alternativas.",
      },
      {
        href: "/hogar/climatizacion",
        title: "Bajar el costo de climatización",
        copy: "Compará equipos, consumo y horas de uso.",
      },
    ],
    sources: [
      {
        href: "https://www.argentina.gob.ar/subsidios",
        label: "Subsidios Energéticos Focalizados",
        publisher: "Argentina.gob.ar",
      },
      {
        href: "https://www.argentina.gob.ar/economia/energia/ayuda",
        label: "Centro de Atención de Energía",
        publisher: "Secretaría de Energía",
      },
      {
        href: "https://www.argentina.gob.ar/subsidios/canasta",
        label: "Canasta básica y criterio de ingresos",
        publisher: "Argentina.gob.ar",
      },
    ],
    faq: [
      ...commonFaq("Energía"),
      {
        q: "¿El beneficio es igual para luz, gas y garrafa?",
        a: "No. El esquema y la aplicación dependen del servicio, el consumo y la modalidad informada en la página oficial.",
      },
      {
        q: "¿Alcanza con tener ingresos bajos?",
        a: "Los ingresos son un criterio central, pero el registro también contempla composición y condiciones del hogar. Confirmá las exclusiones vigentes.",
      },
      {
        q: "¿Qué pasa si la factura no está a mi nombre?",
        a: "El registro oficial permite informar los datos del suministro y del hogar. Revisá las instrucciones vigentes para asociarlos correctamente.",
      },
      {
        q: "¿El subsidio cubre todo el consumo?",
        a: "No necesariamente. El esquema oficial define consumos base y bonificaciones; el excedente puede tener otro tratamiento.",
      },
    ],
    note: "El beneficio y los porcentajes pueden modificarse. La fuente de verdad es el portal oficial de Subsidios Energéticos Focalizados.",
  },
  casas: {
    slug: "trabajo/contratar-personal-casas-particulares",
    title:
      "Contratar personal de casas particulares: alta, sueldo, aportes y costo total",
    description:
      "Calculá y organizá el alta de personal de casas particulares: remuneración, horas, aportes, ART, recibo, aguinaldo, vacaciones y calendario.",
    silo: "Trabajo",
    siloHref: "/trabajo",
    eyebrow: "ARCA · Casas Particulares",
    h1: "Voy a contratar personal para mi casa: ¿cuánto cuesta y qué hago?",
    lede: "Separá sueldo de bolsillo, aportes, contribuciones y ART; después seguí el alta y el calendario mensual.",
    accent: "#9a3412",
    question: "¿En qué momento estás?",
    options: [
      {
        id: "evaluando",
        label: "Estoy calculando si puedo contratar",
        result: "Compará el costo mensual completo, no sólo el valor por hora.",
        actions: [
          "Definí tareas, categoría, horas y modalidad.",
          "Sumá aportes, contribuciones y ART.",
          "Provisioná aguinaldo, vacaciones y reemplazos.",
        ],
        links: ["portal", "contributions"],
      },
      {
        id: "alta",
        label: "Ya acordamos y tengo que dar el alta",
        result:
          "Registrá la relación laboral y conservá la constancia antes de naturalizar pagos informales.",
        actions: [
          "Reuní datos de la persona y del domicilio laboral.",
          "Ingresá al Registro de Casas Particulares.",
          "Generá la constancia y acordá fecha, tareas y pago.",
        ],
        links: ["register", "portal"],
      },
      {
        id: "mensual",
        label: "Ya trabaja y tengo que liquidar el mes",
        result:
          "Liquidá sueldo y recibo, y pagá los conceptos mensuales en sus vencimientos.",
        actions: [
          "Revisá escala vigente y adicionales.",
          "Generá y entregá recibo.",
          "Pagá aportes, contribuciones y ART según corresponda.",
        ],
        links: ["portal", "contributions"],
      },
      {
        id: "baja",
        label: "La relación termina",
        result:
          "Documentá la baja y calculá la liquidación final según la causa y la antigüedad.",
        actions: [
          "Definí correctamente renuncia, despido o acuerdo.",
          "Calculá días, SAC y vacaciones proporcionales.",
          "Registrá la baja y entregá la documentación.",
        ],
        links: ["register"],
      },
    ],
    related: [
      {
        href: "/trabajo/empleada-domestica",
        title: "Calcular sueldo y aportes",
        copy: "Estimá el pago según categoría y horas.",
      },
      {
        href: "/trabajo/aguinaldo",
        title: "Calcular aguinaldo",
        copy: "Provisioná el SAC y revisá el proporcional.",
      },
      {
        href: "/trabajo/liquidacion-final",
        title: "Liquidación de cierre",
        copy: "Ordená los rubros cuando termina la relación.",
      },
    ],
    sources: [
      {
        href: "https://www.arca.gob.ar/casasparticulares/",
        label: "Portal Casas Particulares",
        publisher: "ARCA",
      },
      {
        href: "https://arca.gob.ar/casasparticulares/ayuda/empleador/registro-relacion-laboral.asp",
        label: "Registrar la relación laboral",
        publisher: "ARCA",
      },
      {
        href: "https://www.arca.gob.ar/casasparticulares/aportes-contribuciones-ART/conceptos.asp",
        label: "Aportes, contribuciones y ART",
        publisher: "ARCA",
      },
    ],
    faq: [
      ...commonFaq("ARCA"),
      {
        q: "¿El costo es sólo sueldo más aportes?",
        a: "No. También conviene provisionar aguinaldo, vacaciones, feriados, licencias y una eventual liquidación final.",
      },
      {
        q: "¿La ART está incluida?",
        a: "El régimen contempla una cuota de ART dentro de los pagos correspondientes. El valor depende de las horas y condiciones vigentes.",
      },
      {
        q: "¿Cómo se registra la relación?",
        a: "ARCA indica que se hace desde el Portal de Casas Particulares con clave fiscal, cargando los datos de la relación y obteniendo la constancia.",
      },
      {
        q: "¿Los aportes se pagan por adelantado?",
        a: "ARCA distingue conceptos: aportes y contribuciones se pagan a mes vencido, mientras la ART corresponde al mes en curso.",
      },
    ],
    note: "Las escalas salariales y los importes de aportes cambian. Usá el calculador de Hacé Cuentas y confirmá siempre el valor vigente en ARCA.",
  },
  fallecimiento: {
    slug: "familia/fallecimiento-y-tramites",
    title:
      "Falleció un familiar: pensión, sucesión, deudas y trámites paso a paso",
    description:
      "Checklist económico tras un fallecimiento: pensión, sucesión, herencia, cuentas, seguros, servicios, deudas y documentación.",
    silo: "Familia",
    siloHref: "/familia",
    eyebrow: "ANSES · sucesión · checklist",
    h1: "Falleció un familiar: ¿qué hay que cobrar, pagar y tramitar?",
    lede: "Un recorrido sereno para separar lo urgente, lo importante y lo que puede esperar, sin mezclar pensión con sucesión.",
    accent: "#475569",
    question: "¿Qué necesitás resolver primero?",
    options: [
      {
        id: "primeros-dias",
        label: "Los primeros días",
        result:
          "Concentrate en documentación, servicios inmediatos y resguardo de información; no cierres cuentas sin entender qué pagos entran.",
        actions: [
          "Reuní partida o certificado, DNI y documentación familiar.",
          "Identificá obra social, empleador, banco y seguros.",
          "Guardá estados de cuenta y comprobantes antes de pedir bajas.",
        ],
        links: [],
      },
      {
        id: "pension",
        label: "Necesito saber si corresponde pensión",
        result:
          "La pensión derivada depende del vínculo, los aportes o beneficio de la persona fallecida y los requisitos de ANSES.",
        actions: [
          "Identificá si era trabajador, jubilado o pensionado.",
          "Acreditá vínculos familiares.",
          "Revisá el trámite específico y la documentación.",
        ],
        links: ["anses-death"],
      },
      {
        id: "bienes",
        label: "Hay bienes, cuentas o una propiedad",
        result:
          "La transmisión de bienes requiere ordenar el patrimonio y evaluar la sucesión; no distribuyas informalmente sin inventario.",
        actions: [
          "Listá bienes, deudas y documentación de titularidad.",
          "Identificá herederos y posibles testamentos.",
          "Estimá gastos y pedí asesoramiento en la jurisdicción correspondiente.",
        ],
        links: [],
      },
      {
        id: "deudas",
        label: "Hay deudas o débitos automáticos",
        result:
          "Primero distinguí deudas personales, garantizadas, seguros de saldo y obligaciones de la sucesión.",
        actions: [
          "Pedí saldos y contratos por escrito.",
          "No asumas que toda deuda pasa automáticamente a la familia.",
          "Revisá seguros asociados antes de pagar o refinanciar.",
        ],
        links: [],
      },
    ],
    related: [
      {
        href: "/familia/herencia",
        title: "Calcular herencia y sucesión",
        copy: "Estimá porciones, bienes y gastos del proceso.",
      },
      {
        href: "/jubilacion/pensiones",
        title: "Revisar pensión",
        copy: "Diferenciá viudez, invalidez, PUAM y PNC.",
      },
      {
        href: "/finanzas-personales/gastos-del-mes",
        title: "Rearmar el presupuesto",
        copy: "Medí cómo cambia el ingreso y los gastos del hogar.",
      },
    ],
    sources: [
      {
        href: "https://www.anses.gob.ar/jubilaciones-y-pensiones/pensiones",
        label: "Pensiones",
        publisher: "ANSES",
      },
      {
        href: "https://www.argentina.gob.ar/justicia/derechofacil/leysimple/sucesiones",
        label: "Sucesiones — Derecho Fácil",
        publisher: "Argentina.gob.ar",
      },
    ],
    faq: [
      ...commonFaq("ANSES o Justicia"),
      {
        q: "¿Pensión y herencia son lo mismo?",
        a: "No. La pensión es una prestación de seguridad social para determinados derechohabientes; la herencia transmite bienes y deudas mediante las reglas sucesorias.",
      },
      {
        q: "¿Tengo que cerrar inmediatamente las cuentas bancarias?",
        a: "Conviene primero resguardar información e identificar pagos, débitos y titularidades. Consultá al banco sobre el procedimiento y la documentación.",
      },
      {
        q: "¿Las deudas se heredan?",
        a: "Las obligaciones pueden integrar la sucesión, pero la responsabilidad y el alcance dependen del tipo de deuda, las garantías y cómo se acepta la herencia. No pagues a ciegas.",
      },
      {
        q: "¿Siempre hace falta sucesión?",
        a: "Cuando hay bienes registrables o derechos que deben transmitirse, normalmente hace falta un proceso sucesorio. La vía y los costos dependen de la jurisdicción y del patrimonio.",
      },
    ],
    note: "No entregues claves personales ni pagues gestores que prometan atajos. Los trámites previsionales oficiales son gratuitos; la sucesión requiere asesoramiento jurídico según jurisdicción.",
  },
};
