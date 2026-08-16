import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto gana un… según convenio?"
 * Arquetipo CATÁLOGO: un solo selector con los 16 convenios/escalafones y tres
 * escalones de categoría. Sin `cases`.
 *
 * Las escalas están centralizadas acá abajo (CONVENIOS) y replican, cifra por
 * cifra, los básicos que ya usan las calculadoras sueltas que este hub absorbe
 * (ver `replaces`). Si sale una paritaria nueva se toca UN solo lugar.
 */

export interface ConvenioEscala {
  label: string;
  /** Convenio colectivo o régimen aplicable. */
  cct: string;
  /** Mes/año de la escala cargada. */
  vigencia: string;
  /** Básicos mensuales de los tres escalones (inicial, medio, máximo de escala). */
  niveles: [number, number, number];
  /** Nombre real de cada escalón en ese convenio. */
  nombres: [string, string, string];
  /** Antigüedad: porcentaje por año, o tabla escalonada del GCBA. */
  antig: { tipo: 'pct' | 'tabla-caba'; v: number; tope?: number };
  /** Adicionales fijos del convenio, sobre el básico y en pesos. */
  extraPctBasico: number;
  extraFijo: number;
  /** Comercio: el presentismo es 1/12 del básico MÁS la antigüedad, no un % del básico. */
  extraDoceavo?: boolean;
  /** Etiqueta del adicional (para la fila del desglose). */
  extraLabel: string;
  /** Aportes y descuentos del trabajador, como fracción del bruto. */
  aportes: number;
  /** Aclaración corta que se muestra bajo el total. */
  nota: string;
}

/** Antigüedad escalonada del escalafón docente del GCBA. */
export function pctAntiguedadCaba(anios: number): number {
  if (anios >= 24) return 0.70;
  if (anios >= 22) return 0.60;
  if (anios >= 18) return 0.50;
  if (anios >= 15) return 0.40;
  if (anios >= 12) return 0.30;
  if (anios >= 10) return 0.25;
  if (anios >= 7) return 0.20;
  if (anios >= 5) return 0.15;
  if (anios >= 2) return 0.10;
  return 0;
}

export const CONVENIOS: Record<string, ConvenioEscala> = {
  uocra: {
    label: 'Construcción (UOCRA)',
    cct: 'CCT 76/75 · Zona A',
    vigencia: 'julio 2026',
    // Jornal horario Zona A × 8 h × 22 jornadas: 4948 / 5817 / 6800.
    niveles: [870_848, 1_023_792, 1_196_800],
    nombres: ['Ayudante', 'Oficial', 'Oficial especializado'],
    antig: { tipo: 'pct', v: 0 },
    extraPctBasico: 0.20,
    extraFijo: 0,
    extraLabel: 'Presentismo (20%, art. 52)',
    aportes: 0.17,
    nota: 'Jornal horario Zona A × 8 h × 22 jornadas. El CCT 76/75 no paga antigüedad: en su lugar va el fondo de cese (Ley 22.250), a cargo del empleador.',
  },
  uthgra: {
    label: 'Gastronómicos (UTHGRA)',
    cct: 'CCT 389/04 · Categoría B',
    vigencia: 'junio 2026',
    niveles: [1_038_120, 1_384_689, 1_538_297],
    nombres: ['Bachero (Punto 1)', 'Cocinero / mozo de salón (Punto 6)', 'Encargado / jefe de brigada (Punto 7)'],
    antig: { tipo: 'pct', v: 0.01, tope: 20 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Adicionales de convenio',
    aportes: 0.17,
    nota: 'Escala FEHGRA categoría B (restaurante, bar, hotel 3★) con la suma no remunerativa ya incorporada al básico. Hoteles 4★ y 5★ tienen escalas más altas.',
  },
  comercio: {
    label: 'Empleados de Comercio (FAECYS)',
    cct: 'CCT 130/75',
    vigencia: 'julio 2026',
    niveles: [1_233_585, 1_255_270, 1_299_445],
    nombres: ['Maestranza A', 'Administrativo C / Cajero B', 'Vendedor D'],
    antig: { tipo: 'pct', v: 0.01 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraDoceavo: true,
    extraLabel: 'Presentismo (art. 40)',
    aportes: 0.17,
    nota: 'Desde julio 2026 las sumas fijas no remunerativas quedaron absorbidas por el básico. El presentismo del art. 40 es 1/12 (8,33%) del básico más antigüedad.',
  },
  camioneros: {
    label: 'Camioneros (FEDCAM)',
    cct: 'CCT 40/89 · corta distancia',
    vigencia: 'julio 2026',
    niveles: [968_120, 1_060_010, 1_139_646],
    nombres: ['Ayudante / peón', 'Conductor de 1ª', 'Conductor especializado'],
    antig: { tipo: 'pct', v: 0.01 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Adicionales de convenio',
    aportes: 0.17,
    nota: 'Rama corta distancia. En larga distancia se suman viáticos NO remunerativos (permanencia fuera de residencia y por kilómetro) que pueden superar al propio básico.',
  },
  uta: {
    label: 'Choferes de colectivo (UTA)',
    cct: 'CCT 460/73 · AMBA urbano',
    vigencia: 'junio 2026',
    niveles: [1_390_750, 1_468_014, 1_545_278],
    nombres: ['Boletero', 'Chofer de 2ª', 'Chofer de 1ª'],
    antig: { tipo: 'pct', v: 0.015 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Adicionales de convenio',
    aportes: 0.17,
    nota: 'Básico conformado del chofer de 1ª urbano del AMBA. Las categorías menores se estiman como proporción del chofer: la paritaria sólo publica ese básico.',
  },
  smata: {
    label: 'Mecánicos del automotor (SMATA)',
    cct: 'Escala concesionarias y talleres',
    vigencia: 'junio 2026',
    niveles: [1_297_732, 1_447_446, 1_604_838],
    nombres: ['Operario / semioficial', 'Oficial de taller', 'Maestro / especialista superior'],
    antig: { tipo: 'pct', v: 0.01 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Adicionales de convenio',
    aportes: 0.19,
    nota: 'Los descuentos incluyen la cuota sindical SMATA del 2% además de los aportes de ley.',
  },
  uom: {
    label: 'Metalúrgicos (UOM)',
    cct: 'CCT 260/75',
    vigencia: 'julio 2026',
    niveles: [862_686, 1_077_490, 1_191_768],
    nombres: ['Categoría 1 (ingresante)', 'Categoría 4 (especializado)', 'Categoría 6/7 (oficial)'],
    antig: { tipo: 'pct', v: 0.01 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Adicionales de convenio',
    aportes: 0.19,
    nota: 'Los descuentos incluyen la cuota sindical UOM del 2% además de los aportes de ley.',
  },
  panaderos: {
    label: 'Panaderos',
    cct: 'CCT 269/95',
    vigencia: 'junio 2026',
    niveles: [920_000, 1_050_000, 1_200_000],
    nombres: ['Ayudante', 'Medio oficial', 'Oficial panadero'],
    antig: { tipo: 'pct', v: 0.01 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Adicionales de convenio',
    aportes: 0.17,
    nota: 'No incluye el recargo del 30% por trabajo nocturno (21 a 6 h), que en la panadería suele ser la parte más pesada del recibo.',
  },
  'docente-nacional': {
    label: 'Docentes (piso nacional)',
    cct: 'Paritaria nacional docente',
    vigencia: '2026',
    niveles: [500_000, 600_000, 675_000],
    nombres: ['Maestro de grado / preceptor', 'Vicedirector (+20%)', 'Director (+35%)'],
    antig: { tipo: 'pct', v: 0.10 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Adicionales del estatuto',
    aportes: 0.17,
    nota: 'Es el PISO garantizado por la paritaria nacional para jornada simple. Los básicos provinciales están bastante por encima: tomalo como suelo, no como sueldo real.',
  },
  'docente-caba': {
    label: 'Docentes CABA (ADEMYS/UTE)',
    cct: 'Escalafón GCBA · punto índice $3.200',
    vigencia: 'abril 2026',
    niveles: [512_000, 592_000, 1_024_000],
    nombres: ['Preceptor (160 puntos)', 'Maestro de sección (185 puntos)', 'Director de primaria (320 puntos)'],
    antig: { tipo: 'tabla-caba', v: 0 },
    extraPctBasico: 0.10,
    extraFijo: 25_000,
    extraLabel: 'Presentismo 10% + material didáctico',
    aportes: 0.17,
    nota: 'La antigüedad del GCBA no es lineal: salta a 10% a los 2 años, 25% a los 10, 40% a los 15 y llega al 70% a los 24.',
  },
  'residente-medico': {
    label: 'Médicos residentes (hospital público)',
    cct: 'Régimen de residencias · CABA',
    vigencia: '2026',
    niveles: [780_000, 980_000, 1_200_000],
    nombres: ['R1', 'R3', 'R5 / jefe de residentes'],
    antig: { tipo: 'pct', v: 0 },
    extraPctBasico: 0.45,
    extraFijo: 0,
    extraLabel: 'Guardias (45% del básico)',
    aportes: 0.13,
    nota: 'La progresión R1→R5 ya es la antigüedad del régimen. Fuera de CABA el haber baja: Nación ~95%, provincia de Buenos Aires ~88%, interior ~85%.',
  },
  enfermeria: {
    label: 'Enfermería (hospital público)',
    cct: 'Escalafón sanidad · sector público',
    vigencia: '2026',
    niveles: [800_000, 900_000, 1_100_000],
    nombres: ['Auxiliar de enfermería', 'Enfermero profesional', 'Licenciado en enfermería'],
    antig: { tipo: 'pct', v: 0 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Guardias extra',
    aportes: 0.17,
    nota: 'Sin guardias extra. Cada guardia adicional suma ~$70.000 en el público y ~$90.000 en el privado, que es donde se hace la diferencia real.',
  },
  aeronautico: {
    label: 'Aeronáuticos (piloto y tripulación)',
    cct: 'CCT APLA / AAA',
    vigencia: '2026',
    niveles: [900_000, 2_200_000, 3_500_000],
    nombres: ['Tripulante de cabina', 'Copiloto', 'Piloto comercial'],
    antig: { tipo: 'pct', v: 0.01 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Horas de vuelo',
    aportes: 0.20,
    nota: 'Sin horas de vuelo cargadas. La hora vale entre $12.000 (tripulante) y $45.000 (comandante) y en un mes activo puede duplicar el básico.',
  },
  policia: {
    label: 'Policía Federal Argentina',
    cct: 'Ley 21.965 · régimen especial',
    vigencia: '2026',
    niveles: [1_100_000, 1_340_000, 2_500_000],
    nombres: ['Agente', 'Sargento', 'Comisario'],
    antig: { tipo: 'pct', v: 0.02 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Suplementos particulares',
    aportes: 0.18,
    nota: 'Régimen previsional propio: aporta a la Caja de Retiros de la PFA (~13%) y a OSFPF (~5%). No aporta a ANSES ni a PAMI.',
  },
  'dt-afa': {
    label: 'Directores técnicos (AFA)',
    cct: 'Contrato AFA por divisional',
    vigencia: '2026',
    niveles: [280_000, 800_000, 3_000_000],
    nombres: ['Primera D', 'Primera B Metropolitana', 'Liga Profesional (Primera A)'],
    // 4% por año con tope del 50% ⇒ el tope se alcanza a los 12,5 años, no a los 12.
    antig: { tipo: 'pct', v: 0.04, tope: 12.5 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Premios y viáticos',
    aportes: 0.17,
    nota: 'La experiencia suma 4% por año hasta un tope del 50%. Los títulos ganados pueden duplicar el contrato y no entran en esta estimación.',
  },
  programador: {
    label: 'Programadores (mercado IT)',
    cct: 'Sin convenio · rango de mercado',
    vigencia: '2026 · USD a $1.400',
    niveles: [924_000, 1_694_000, 2_695_000],
    nombres: ['Junior', 'Semi-senior', 'Senior'],
    antig: { tipo: 'pct', v: 0 },
    extraPctBasico: 0,
    extraFijo: 0,
    extraLabel: 'Bonos',
    aportes: 0.17,
    nota: 'IT no tiene convenio: es el piso del rango de mercado en relación de dependencia (55% del equivalente en USD). El seniority ya hace de antigüedad.',
  },
};

export const ORDEN_CONVENIOS = Object.keys(CONVENIOS);

export const hub: HubData = {
  slug: 'trabajo/sueldos-por-convenio',
  title: 'Sueldos por convenio 2026: escalas y cálculo por CCT',
  description:
    'Elegí tu gremio y mirá el básico de convenio vigente, la antigüedad, los adicionales y el neto de bolsillo. UOCRA, Comercio, Camioneros, UTHGRA, UOM, SMATA, UTA, docentes, salud y más, con la escala de la última paritaria.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Escalas salariales de convenio',
  h1: '¿Cuánto gana un… según convenio?',
  lede:
    'Elegí el gremio y el escalón de tu categoría. Vas a ver el básico de la última paritaria, cuánto suma tu antigüedad, qué queda de bolsillo y —lo importante— dónde queda parado tu convenio frente a los otros dieciséis.',
  stamps: ['Actualizado 27-07-2026', '16 convenios cargados', '18 calculadoras adentro'],

  resultLabel: 'Neto estimado de bolsillo',

  inputsTitle: 'Elegí tu convenio',
  inputsIntro:
    'Cada convenio trae su propia escala, su regla de antigüedad y sus adicionales. Los tres escalones equivalen al ingreso, a la categoría más habitual y al techo de la escala.',
  fields: [
    {
      id: 'convenio',
      label: 'Convenio o escalafón',
      type: 'select',
      value: 'comercio',
      options: ORDEN_CONVENIOS.map((k) => ({ value: k, label: CONVENIOS[k].label })),
      help: 'Los básicos son los de la última paritaria homologada de cada gremio.',
    },
    {
      id: 'nivel',
      label: 'Escalón de categoría',
      type: 'select',
      value: '1',
      options: [
        { value: '0', label: 'Inicial / ingreso' },
        { value: '1', label: 'Categoría intermedia (la más común)' },
        { value: '2', label: 'Máximo de escala' },
      ],
    },
    { id: 'antiguedad', label: 'Años de antigüedad', type: 'number', min: 0, max: 45, value: 5 },
    {
      id: 'noRem',
      label: 'Sumas no remunerativas del mes',
      prefix: '$',
      value: '',
      thousands: true,
      help:
        'Bonos de paritaria y viáticos: no pagan aportes, pero tampoco cuentan para el SAC ni para la jubilación. ' +
        'Camioneros de larga distancia: $14.000 por noche fuera de casa. Comercio: el bono no remunerativo del acuerdo vigente.',
    },
  ],
  fineprint:
    'Estimación sobre el básico de convenio. Horas extra, guardias, francos y adicionales de empresa pueden mover bastante el recibo real. Las sumas no remunerativas se muestran aparte porque no aportan al SAC ni a la jubilación.',

  chart: {
    type: 'bars',
    title: 'Tu convenio contra los demás',
    caption:
      'Las barras del desglose comparan el bruto de los dieciséis convenios en el mismo escalón y con la misma antigüedad. La tuya queda destacada: así ves si tu gremio paga por encima o por debajo del resto.',
  },
  breakdownTitle: 'Dónde queda parado tu convenio',
  breakdownIntro:
    'Mismo escalón, misma antigüedad, todos los gremios. La barra más larga es el convenio que mejor paga en esa posición.',

  answer: {
    title: 'Cómo leer tu recibo de convenio',
    copy:
      'El sueldo de convenio se arma en capas: primero el básico de tu categoría según la última paritaria, después la antigüedad, después los adicionales propios del gremio (presentismo, guardias, viáticos, horas extra) y recién al final se descuentan los aportes.',
    yes: [
      'Básico de convenio de tu categoría, según la escala vigente del mes',
      'Antigüedad: 1% por año en la mayoría de los convenios privados, 10% anual en docencia y escalonada en el GCBA',
      'Adicionales propios del gremio: presentismo, guardias, viáticos, horas de vuelo, nocturnidad',
      'Aportes del trabajador: 11% jubilación, 3% obra social y 3% PAMI, más la cuota sindical donde exista',
    ],
    warn: [
      'El básico de convenio es un PISO: la empresa puede pagar por encima, nunca por debajo',
      'Los viáticos y las sumas no remunerativas no cuentan para el aguinaldo, la indemnización ni la jubilación',
      'Si tu recibo muestra un básico menor al de la escala vigente, el reclamo tiene dos años de prescripción',
    ],
    plazo: 'las paritarias se revisan cada tres o cuatro meses: chequeá la escala del mes que estás cobrando.',
  },

  faq: [
    {
      q: '¿Qué es el básico de convenio y en qué se diferencia del sueldo bruto?',
      a: 'El básico de convenio es el mínimo que fija el CCT para tu categoría. El bruto es ese básico más antigüedad, presentismo y todos los adicionales remunerativos. El neto es lo que queda después de los aportes. Nunca compares el básico de un gremio con el neto de otro: son capas distintas.',
    },
    {
      q: '¿Cómo se calcula la antigüedad en cada convenio?',
      a: 'En la mayoría de los convenios privados (Comercio, UOM, SMATA, Camioneros, UTHGRA) es 1% del básico por año. UTA paga alrededor del 1,5%, la Policía Federal el 2% y la docencia el 10% anual. El escalafón del GCBA usa una tabla escalonada que arranca en 10% a los 2 años y llega al 70% a los 24. La construcción no paga antigüedad: la reemplaza el fondo de cese de la Ley 22.250.',
    },
    {
      q: '¿Por qué la UOCRA no tiene adicional por antigüedad?',
      a: 'Porque el régimen de la industria de la construcción (Ley 22.250) no usa indemnización por despido ni antigüedad: el empleador deposita mes a mes un fondo de cese laboral —12% el primer año y 8% después— que el trabajador retira al terminar la obra. Ese fondo es el equivalente funcional de la antigüedad y la indemnización juntas.',
    },
    {
      q: '¿Qué convenio paga mejor hoy en la Argentina?',
      a: 'Entre los convenios de esta comparación, los aeronáuticos y los directores técnicos de Primera A están muy por encima del resto, pero son escalas chicas y muy específicas. En los gremios masivos, en 2026 los básicos más altos son los de UTA, SMATA y Empleados de Comercio; los más bajos, el piso docente nacional y las categorías de ingreso de UOM.',
    },
    {
      q: '¿El presentismo se pierde por una sola falta?',
      a: 'Depende del convenio. En Comercio (art. 40 del CCT 130/75) el premio por asistencia y puntualidad equivale a 1/12 del básico más antigüedad y se pierde por inasistencias injustificadas o llegadas tarde reiteradas. En la construcción (art. 52 del CCT 76/75) es el 20% del básico devengado y exige asistencia perfecta en la quincena. Las faltas justificadas por enfermedad con certificado no lo hacen perder.',
    },
    {
      q: '¿Los viáticos de larga distancia son sueldo?',
      a: 'No. En Camioneros los viáticos por permanencia fuera de la residencia y por kilómetro son no remunerativos: no pagan aportes ni Ganancias, pero tampoco cuentan para el aguinaldo, la indemnización por despido ni el haber jubilatorio. Por eso un chofer de larga distancia puede cobrar mucho más de bolsillo y jubilarse con bastante menos.',
    },
    {
      q: '¿Mi empleador puede pagarme menos que el básico de convenio?',
      a: 'No. El básico del CCT es un piso de orden público: cualquier acuerdo individual por debajo es nulo aunque lo hayas firmado. Si detectás la diferencia, podés reclamar los haberes impagos de los últimos dos años, que es el plazo de prescripción del art. 256 de la LCT.',
    },
    {
      q: '¿Cuánto se descuenta del bruto en cada caso?',
      a: 'El régimen general descuenta 17%: 11% de jubilación, 3% de obra social y 3% de PAMI, sobre la base imponible con tope de la Ley 24.241. En UOM y SMATA se agrega la cuota sindical del 2%. La Policía Federal tiene régimen propio: alrededor del 13% a la Caja de Retiros y 5% a OSFPF, sin aportes a ANSES ni a PAMI.',
    },
    {
      q: '¿Con estos sueldos se paga Impuesto a las Ganancias?',
      a: 'Con los básicos de convenio solos, casi ningún gremio de esta lista llega al mínimo no imponible de 2026. Se empieza a pagar cuando se acumulan horas extra, guardias, viáticos remunerativos o cargos jerárquicos, y en los aeronáuticos y los DT de Primera A desde el propio básico.',
    },
    {
      q: '¿Cada cuánto cambian las escalas de convenio?',
      a: 'Depende de la paritaria: la mayoría de los gremios grandes cerró en 2026 acuerdos con revisiones trimestrales o cuatrimestrales y tramos mensuales de aumento. Por eso la escala que corresponde es siempre la del mes que estás cobrando, no la del acuerdo firmado.',
    },
  ],

  sources: [
    {
      name: 'Escala salarial CCT 76/75 — acuerdo UOCRA–CAMARCO',
      url: 'https://www.uocra.org/',
      publisher: 'UOCRA',
      date: 'escala julio 2026',
    },
    {
      name: 'Escala salarial CCT 130/75 — acuerdo FAECYS–CAC/CAME/UDECA',
      url: 'https://www.faecys.org.ar/',
      publisher: 'FAECYS',
      date: 'escala julio 2026',
    },
    {
      name: 'Escala FEHGRA CCT 389/04 — acuerdo UTHGRA–FEHGRA',
      url: 'https://www.uthgra.org.ar/',
      publisher: 'UTHGRA',
      date: 'escala junio 2026',
    },
    {
      name: 'Escala salarial CCT 40/89 — Federación Nacional de Trabajadores Camioneros',
      url: 'https://www.fedcam.org.ar/',
      publisher: 'FEDCAM',
      date: 'escala julio 2026',
    },
    {
      name: 'Convenios y escalas salariales SMATA',
      url: 'https://www.smata.org.ar/',
      publisher: 'SMATA',
      date: 'escala junio 2026',
    },
    {
      name: 'Acuerdos paritarios UOM — CCT 260/75',
      url: 'https://uom.org.ar/',
      publisher: 'Unión Obrera Metalúrgica',
      date: 'escala julio 2026',
    },
    {
      name: 'Acuerdos salariales UTA — transporte automotor de pasajeros',
      url: 'https://www.uta.org.ar/',
      publisher: 'Unión Tranviarios Automotor',
      date: 'escala junio 2026',
    },
    {
      name: 'Escalafón docente y salarios del GCBA',
      url: 'https://buenosaires.gob.ar/educacion',
      publisher: 'Ministerio de Educación de la Ciudad de Buenos Aires',
      date: 'punto índice abril 2026',
    },
    {
      name: 'Paritaria nacional docente — piso salarial garantizado',
      url: 'https://www.argentina.gob.ar/educacion',
      publisher: 'Ministerio de Capital Humano',
      date: '2026',
    },
    {
      name: 'Ley 22.250 — Régimen laboral de la industria de la construcción (fondo de cese)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/35000-39999/38542/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Ley de Contrato de Trabajo 20.744, arts. 121, 156 y 256',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Ley 21.965 del Personal de la Policía Federal Argentina',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/41541/texact.htm',
      publisher: 'InfoLeg',
    },
  ],

  replaces: [
    '/calculadora-paritaria-uocra-construccion-2026-categoria',
    '/calculadora-sueldo-gastronomico-uthgra-mozo-cocinero',
    '/calculadora-sueldo-docente-argentina-cargo-antiguedad',
    '/calculadora-sueldo-camionero-fedcam-basico-adicionales',
    '/calculadora-paritaria-comercio-2026-aumento-acumulado',
    '/calculadora-sueldo-empleados-comercio-cct-130-75',
    '/calculadora-paritaria-camioneros-2026-flete-larga-distancia',
    '/calculadora-sueldo-smata-mecanico-automotor-basico',
    '/calculadora-sueldo-policia-federal-grado-antiguedad',
    '/calculadora-sueldo-docente-ademys-caba-antiguedad',
    '/calculadora-sueldo-uom-metalurgico-basico-neto',
    '/calculadora-sueldo-medico-residente-hospital-publico',
    '/calculadora-sueldo-aeronautico-piloto-azafata-tripulante',
    '/calculadora-sueldo-panadero-basico-feriado-nocturno',
    '/calculadora-sueldo-enfermero-hospital-publico-categoria',
    '/calculadora-sueldo-chofer-colectivo-uta-urbano',
    '/calculadora-sueldo-programador-desarrollador-argentina-seniority',
    '/calculadora-sueldo-docente-afa-tecnico-categoria-b-c',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
