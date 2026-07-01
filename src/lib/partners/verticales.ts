// Registro de verticales para las landings de link building de Partner Studio
// (/partners/<vertical>). Cada vertical agrupa 3-5 calcs estrella con un uso
// sugerido concreto para ese rubro. Las landings se generan en
// src/pages/partners/[vertical].astro.

export interface Vertical {
  slug: string;
  nombre: string;
  icon: string;
  headline: string; // orientado al beneficio del sitio host
  pitch: string; // 2-3 oraciones: por qué le sirve a ESE vertical embeber la calc
  calcs: { slug: string; nombre: string; usoSugerido: string }[];
  ejemploUso: string; // caso de uso narrado
}

// Los 10 calcs estrella (slug real → nombre corto), para referencia:
// sueldo-en-mano-argentina                              → Sueldo neto (bruto a neto)
// calculadora-aguinaldo-sac                             → Aguinaldo (SAC)
// calculadora-indemnizacion-despido                     → Indemnización por despido
// calculadora-monotributo-2026                          → Monotributo: categoría y cuota
// calculadora-inflacion-acumulada-periodo               → Inflación acumulada
// calculadora-cuotas-sin-interes-costo-real-inflacion   → Cuotas vs contado
// calculadora-sueldo-minimo-para-alquilar               → Capacidad de alquiler
// calculadora-interes-compuesto                         → Interés compuesto
// calculadora-cuota-prestamo                            → Cuota de préstamo
// calculadora-freelance-tarifa-hora                     → Precio por hora freelance

export const VERTICALES: Vertical[] = [
  {
    slug: 'estudios-contables',
    nombre: 'Estudios contables',
    icon: '🧾',
    headline: 'Que tus clientes calculen solos lo simple, y te llamen para lo importante',
    pitch:
      'Un estudio contable pierde horas respondiendo "¿en qué categoría de monotributo caigo?" o "¿cuánto me queda en mano?". Embebé las calculadoras en tu sitio y convertí esas consultas repetidas en una herramienta que trabaja por vos. El visitante calcula, ve que sabés del tema, y te contacta para el trabajo de verdad.',
    calcs: [
      {
        slug: 'calculadora-monotributo-2026',
        nombre: 'Monotributo: categoría y cuota',
        usoSugerido:
          'En tu página de servicios para monotributistas: el visitante averigua su categoría y cuota antes de pedirte turno, y llega con la mitad de la consulta resuelta.',
      },
      {
        slug: 'sueldo-en-mano-argentina',
        nombre: 'Sueldo neto (bruto a neto)',
        usoSugerido:
          'Para la sección de liquidación de sueldos: tus clientes empleadores verifican al instante cuánto queda en mano de un bruto ofrecido.',
      },
      {
        slug: 'calculadora-aguinaldo-sac',
        nombre: 'Aguinaldo (SAC)',
        usoSugerido:
          'Publicala en junio y diciembre: es la época en que todos googlean el aguinaldo, y tu sitio responde con números en vez de texto.',
      },
      {
        slug: 'calculadora-indemnizacion-despido',
        nombre: 'Indemnización por despido',
        usoSugerido:
          'En tu página de asesoramiento laboral: un despido siempre termina en consulta profesional, y el que calculó en tu sitio te elige a vos.',
      },
    ],
    ejemploUso:
      'Publicás una nota sobre la recategorización del monotributo y embebés la calculadora de categoría y cuota debajo. El lector pone su facturación, ve su categoría 2026, y el botón de contacto de tu estudio queda a un scroll de distancia.',
  },
  {
    slug: 'portales-de-empleo',
    nombre: 'Portales de empleo',
    icon: '💼',
    headline: 'El candidato ve el bruto en tu aviso — mostrale el neto sin que se vaya',
    pitch:
      'Todo aviso con sueldo bruto genera la misma pregunta: "¿y en mano cuánto es?". Hoy el candidato se va de tu portal a googlearlo. Con la calculadora embebida, esa duda se resuelve en tu página, sumás tiempo de sesión y el candidato aplica mejor informado.',
    calcs: [
      {
        slug: 'sueldo-en-mano-argentina',
        nombre: 'Sueldo neto (bruto a neto)',
        usoSugerido:
          'Junto a los avisos o en tu guía salarial: el candidato convierte el bruto publicado a neto sin salir del portal.',
      },
      {
        slug: 'calculadora-aguinaldo-sac',
        nombre: 'Aguinaldo (SAC)',
        usoSugerido:
          'En tu blog de empleo: el que cambia de trabajo a mitad de año quiere saber cuánto aguinaldo proporcional le corresponde.',
      },
      {
        slug: 'calculadora-freelance-tarifa-hora',
        nombre: 'Precio por hora freelance',
        usoSugerido:
          'Para tu sección de trabajo independiente: el freelancer calcula qué tarifa horaria necesita para llegar al ingreso que busca.',
      },
      {
        slug: 'calculadora-indemnizacion-despido',
        nombre: 'Indemnización por despido',
        usoSugerido:
          'En contenidos de transición laboral: el que fue desvinculado calcula qué le corresponde antes de buscar el próximo empleo.',
      },
    ],
    ejemploUso:
      'Publicás tu informe anual de salarios IT y embebés la calculadora de sueldo neto al lado de la tabla de brutos por seniority. El lector convierte cada cifra a su caso real y tu informe pasa de "dato" a "herramienta".',
  },
  {
    slug: 'recursos-humanos',
    nombre: 'Consultoras de RR.HH.',
    icon: '🤝',
    headline: 'Respondé las preguntas de compensaciones antes de que lleguen a tu inbox',
    pitch:
      'Las consultoras de RR.HH. y los blogs de people reciben siempre las mismas consultas: neto de un bruto, aguinaldo proporcional, costo de una desvinculación. Embebé las calculadoras y tu contenido de compensaciones deja de ser teoría: el lector calcula su caso ahí mismo y tu marca queda como la que le resolvió el número.',
    calcs: [
      {
        slug: 'sueldo-en-mano-argentina',
        nombre: 'Sueldo neto (bruto a neto)',
        usoSugerido:
          'En tus guías de compensaciones: el HR que arma una oferta verifica al toque cuánto neto representa el bruto que va a proponer.',
      },
      {
        slug: 'calculadora-indemnizacion-despido',
        nombre: 'Indemnización por despido',
        usoSugerido:
          'Para tu contenido de offboarding: estimar el costo de una desvinculación es la consulta #1 de cualquier empleador.',
      },
      {
        slug: 'calculadora-aguinaldo-sac',
        nombre: 'Aguinaldo (SAC)',
        usoSugerido:
          'En junio y diciembre: tus clientes calculan el SAC de altas y bajas de mitad de semestre sin escribirte un mail.',
      },
      {
        slug: 'calculadora-freelance-tarifa-hora',
        nombre: 'Precio por hora freelance',
        usoSugerido:
          'Para contenidos sobre contractors: comparar el costo de un freelance contra un empleado en relación de dependencia.',
      },
    ],
    ejemploUso:
      'Escribís una guía sobre "cuánto cuesta realmente un empleado" y embebés la calculadora de sueldo neto para que el lector juegue con los números de su propia estructura. La guía se comparte más porque no es un artículo: es una herramienta.',
  },
  {
    slug: 'sindicatos',
    nombre: 'Sindicatos y gremios',
    icon: '✊',
    headline: 'Que cada afiliado sepa exactamente qué le corresponde',
    pitch:
      'Después de cada paritaria, la pregunta de todos los afiliados es la misma: "¿cuánto me queda en mano con el aumento?". Embebé las calculadoras en el sitio del gremio y cada afiliado responde su caso con sus números. Transparencia total, sin sobrecargar a los delegados con consultas.',
    calcs: [
      {
        slug: 'sueldo-en-mano-argentina',
        nombre: 'Sueldo neto (bruto a neto)',
        usoSugerido:
          'Junto a las escalas salariales de tu convenio: el afiliado convierte el básico acordado a neto real, con su antigüedad y sus descuentos.',
      },
      {
        slug: 'calculadora-aguinaldo-sac',
        nombre: 'Aguinaldo (SAC)',
        usoSugerido:
          'Antes de cada SAC: el afiliado verifica que le liquidaron bien el aguinaldo, semestre por semestre.',
      },
      {
        slug: 'calculadora-indemnizacion-despido',
        nombre: 'Indemnización por despido',
        usoSugerido:
          'En la sección de defensa del trabajador: el despedido calcula qué le corresponde antes de la primera reunión con el abogado del gremio.',
      },
      {
        slug: 'calculadora-inflacion-acumulada-periodo',
        nombre: 'Inflación acumulada',
        usoSugerido:
          'Para negociar con datos: mostrá cuánta inflación acumuló el período de la paritaria y cuánto poder de compra hay que recuperar.',
      },
    ],
    ejemploUso:
      'Cerrás la paritaria y publicás el acuerdo con la calculadora de sueldo neto embebida debajo de la escala. Cada afiliado pone su categoría y su antigüedad, y ve su recibo proyectado en vez de un porcentaje abstracto.',
  },
  {
    slug: 'universidades',
    nombre: 'Universidades y educación',
    icon: '🎓',
    headline: 'Enseñá finanzas con herramientas reales, no con ejemplos de pizarrón',
    pitch:
      'Interés compuesto, inflación, costo financiero real: los conceptos que más cuestan en el aula se entienden en segundos cuando el alumno mueve los números él mismo. Embebé las calculadoras en el campus o en el material de cátedra y convertí la teoría en práctica interactiva, sin desarrollar nada.',
    calcs: [
      {
        slug: 'calculadora-interes-compuesto',
        nombre: 'Interés compuesto',
        usoSugerido:
          'En el material de matemática financiera: el alumno experimenta con capital, tasa y plazo y ve la curva exponencial en vivo.',
      },
      {
        slug: 'calculadora-inflacion-acumulada-periodo',
        nombre: 'Inflación acumulada',
        usoSugerido:
          'Para cátedras de economía: calcular la inflación acumulada real entre dos fechas con datos oficiales, no con ejemplos inventados.',
      },
      {
        slug: 'calculadora-cuotas-sin-interes-costo-real-inflacion',
        nombre: 'Cuotas vs contado',
        usoSugerido:
          'Educación financiera aplicada: ¿las "cuotas sin interés" son gratis con inflación? El alumno lo comprueba con su propio ejemplo.',
      },
      {
        slug: 'calculadora-freelance-tarifa-hora',
        nombre: 'Precio por hora freelance',
        usoSugerido:
          'Para el área de empleabilidad y emprendedorismo: el egresado calcula qué cobrar por hora en su primer trabajo independiente.',
      },
    ],
    ejemploUso:
      'La cátedra de administración financiera publica su apunte de valor tiempo del dinero con la calculadora de interés compuesto embebida. En vez de resolver tres ejercicios fijos, cada alumno simula su propio plan de ahorro y discute los resultados en clase.',
  },
  {
    slug: 'medios',
    nombre: 'Medios y periodismo',
    icon: '📰',
    headline: 'Tu nota da el dato — la calculadora deja que el lector calcule SU caso',
    pitch:
      'Una nota sobre paritarias, inflación o cuotas informa un número general; la calculadora embebida deja que cada lector aplique la noticia a su bolsillo. Eso es más tiempo en página, más scroll y una razón para volver. Se actualiza sola cuando cambian los valores: tu nota de hoy sigue siendo útil en tres meses.',
    calcs: [
      {
        slug: 'calculadora-inflacion-acumulada-periodo',
        nombre: 'Inflación acumulada',
        usoSugerido:
          'En cada nota del IPC: el lector calcula la inflación acumulada del período que le importa a él, no solo la interanual del título.',
      },
      {
        slug: 'sueldo-en-mano-argentina',
        nombre: 'Sueldo neto (bruto a neto)',
        usoSugerido:
          'Para notas de paritarias y salarios: del "el acuerdo fue del X%" a "esto es lo que te queda en mano a vos".',
      },
      {
        slug: 'calculadora-cuotas-sin-interes-costo-real-inflacion',
        nombre: 'Cuotas vs contado',
        usoSugerido:
          'En coberturas de Hot Sale y Cyber Monday: el lector verifica si las cuotas de esa oferta puntual convienen contra el contado.',
      },
      {
        slug: 'calculadora-aguinaldo-sac',
        nombre: 'Aguinaldo (SAC)',
        usoSugerido:
          'Dos picos de tráfico garantizados por año: la nota del aguinaldo de junio y la de diciembre, con la calculadora adentro.',
      },
    ],
    ejemploUso:
      'Publicás la nota de paritarias del gremio de comercio y embebés la calculadora de sueldo neto para que el lector calcule su caso con el aumento. La nota deja de ser un título que se lee en 40 segundos y pasa a ser una página donde la gente se queda calculando.',
  },
  {
    slug: 'inmobiliarias',
    nombre: 'Inmobiliarias y portales',
    icon: '🏠',
    headline: 'Calificá al interesado antes de la primera visita',
    pitch:
      '¿El interesado llega a la ficha sin saber si le alcanza? Con las calculadoras embebidas responde solo las dos preguntas que definen la operación: cuánto necesita ganar para alquilar y cuánto pagaría de cuota si compra. Menos visitas que no califican, más consultas serias.',
    calcs: [
      {
        slug: 'calculadora-sueldo-minimo-para-alquilar',
        nombre: 'Capacidad de alquiler',
        usoSugerido:
          'En tus fichas de alquiler: el interesado calcula qué ingresos necesita demostrar para ese alquiler antes de escribirte.',
      },
      {
        slug: 'calculadora-cuota-prestamo',
        nombre: 'Cuota de préstamo',
        usoSugerido:
          'En tus fichas de venta: el comprador simula la cuota del crédito hipotecario para ese precio y ese plazo, ahí mismo.',
      },
      {
        slug: 'calculadora-inflacion-acumulada-periodo',
        nombre: 'Inflación acumulada',
        usoSugerido:
          'Para tu contenido de mercado: contextualizar la actualización de los contratos contra la inflación real del período.',
      },
      {
        slug: 'calculadora-interes-compuesto',
        nombre: 'Interés compuesto',
        usoSugerido:
          'Para la sección de inversores: proyectar el rendimiento de reinvertir la renta de un departamento a lo largo de los años.',
      },
    ],
    ejemploUso:
      'Agregás la calculadora de capacidad de alquiler en tu página de requisitos. El interesado pone el valor del alquiler que vio, descubre qué ingresos necesita demostrar y llega a la visita sabiendo que califica — o ajusta la búsqueda solo, sin hacerte perder la mañana.',
  },
  {
    slug: 'blogs-financieros',
    nombre: 'Blogs y finanzas personales',
    icon: '📈',
    headline: 'Tu contenido explica — la calculadora convierte al lector en usuario',
    pitch:
      'Un post sobre interés compuesto se lee una vez; una calculadora de interés compuesto se usa veinte. Embebé las herramientas en tus posts y tu blog gana lo que todo creador de contenido financiero busca: visitas recurrentes, más tiempo en página y contenido que sigue vivo cuando el algoritmo ya pasó de largo.',
    calcs: [
      {
        slug: 'calculadora-interes-compuesto',
        nombre: 'Interés compuesto',
        usoSugerido:
          'En tu post pilar de inversiones: el lector proyecta su propio plan de ahorro y vuelve cada vez que quiere ajustarlo.',
      },
      {
        slug: 'calculadora-cuotas-sin-interes-costo-real-inflacion',
        nombre: 'Cuotas vs contado',
        usoSugerido:
          'Para contenidos de consumo inteligente: la decisión cuotas-o-contado con inflación, resuelta con números en vez de opiniones.',
      },
      {
        slug: 'calculadora-cuota-prestamo',
        nombre: 'Cuota de préstamo',
        usoSugerido:
          'En reviews de créditos y préstamos personales: el lector simula la cuota real del préstamo que estás analizando.',
      },
      {
        slug: 'calculadora-inflacion-acumulada-periodo',
        nombre: 'Inflación acumulada',
        usoSugerido:
          'Para tus análisis de contexto: cuánto perdió el peso en el período que analizás, calculado en vivo con datos actualizados.',
      },
      {
        slug: 'calculadora-freelance-tarifa-hora',
        nombre: 'Precio por hora freelance',
        usoSugerido:
          'Si escribís para freelancers: la calculadora de tarifa horaria convierte tu guía de "cuánto cobrar" en una respuesta concreta.',
      },
    ],
    ejemploUso:
      'Escribís "la guía definitiva del interés compuesto" y embebés la calculadora en el medio del post. El lector no se va a buscar una herramienta a otro lado: simula en tu página, guarda el link y vuelve el mes que viene a actualizar su plan.',
  },
];

export function getVertical(slug: string): Vertical | undefined {
  return VERTICALES.find((v) => v.slug === slug);
}
