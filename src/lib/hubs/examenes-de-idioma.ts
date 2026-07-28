import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué puntaje necesito en TOEFL, IELTS o Cambridge?"
 * Arquetipo RAMIFICADO: 7 ramas. Absorbe 9 URLs (ver `replaces`).
 *
 * ESCALAS OFICIALES (las viejas calculadoras tenían las tablas mal, ver reporte):
 *  - MCER ↔ IELTS: IELTS.org — B1 4,0–5,0 · B2 5,5–6,5 · C1 7,0–8,0 · C2 8,5–9,0
 *  - MCER ↔ TOEFL iBT: ETS — B1 42–71 · B2 72–94 · C1 95–114 · C2 115–120
 *  - Cambridge English Scale: A1 80–99 · A2 100–119 · B1 120–139 · B2 140–159 ·
 *    C1 160–179 · C2 180–230 (escala única para KET/PET/FCE/CAE/CPE)
 *  - TOEFL ↔ IELTS: tabla de comparación de ETS (rangos por band), no una fórmula lineal.
 *
 * FORMATO: acá casi nada es plata. TODA fila declara su formato: 'plain' para
 * puntajes y percentiles, 'unit' para horas, semanas, meses y años. La rama de
 * costo trabaja en DÓLARES —el precio de estos exámenes se fija en USD y se paga
 * al cambio del día—, así que también va en 'plain' con "USD" declarado en el
 * label y en el campo. Nada de 'ars': el hub es de audiencia global.
 *
 * PRECIOS: NO se hardcodean en el copy. Son campos editables con un valor de
 * referencia, porque caducan. Lo mismo con los puntajes de corte de cada
 * universidad o visa: van como referencia y el fineprint manda a la fuente.
 */
export const hub: HubData = {
  slug: 'estudio/examenes-de-idioma',
  title: '¿Qué puntaje necesito en TOEFL, IELTS o Cambridge? — Equivalencias y niveles',
  description:
    'Pasá tu puntaje de TOEFL iBT, IELTS o Cambridge a nivel MCER y a los otros exámenes, mirá qué band te pide tu objetivo y cuánto te falta, calculá tu percentil del SAT, tu nota de Goethe o DELE, las horas de preparación para SAT y GRE y cuál examen te sale más barato por año de vigencia.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Guía y calculadora de exámenes internacionales',
  h1: '¿Qué puntaje necesito en TOEFL, IELTS o Cambridge?',
  lede:
    'Empezamos por lo que casi todo el mundo busca: pasar un puntaje de un examen a otro y saber qué nivel del MCER es. Si tu caso es otro —el band que te pide tu visa o tu universidad, el percentil del SAT, la nota del Goethe o del DELE, las horas de preparación o cuál examen conviene por costo— lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '7 cuentas de examen adentro', 'Escalas oficiales ETS, IELTS y Cambridge'],

  resultLabel: 'Tu resultado',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Elegí tu situación. Cada rama usa sus propios campos y el desglose te muestra exactamente qué entró en la cuenta y con qué tabla oficial.',
    items: [
      {
        id: 'convertir',
        label: 'Pasar mi puntaje de un examen a otro',
        hint: 'Ej.: "tengo 95 en el TOEFL, ¿qué IELTS es?"',
        answer:
          'Se ubica tu puntaje en su nivel del MCER y desde ahí se lee el puntaje equivalente en los demás exámenes.',
        yes: [
          'Elegí el examen que rendiste y cargá tu puntaje: TOEFL iBT 0–120, IELTS 0–9 o Cambridge English Scale 80–230',
          'Entre TOEFL e IELTS el hub usa la tabla de comparación de ETS, que es la oficial y va por rangos, no por una fórmula lineal',
          'Cambridge se lee sobre la Cambridge English Scale, la escala única que comparten KET, PET, FCE, CAE y CPE',
          'El nivel MCER es el dato que suelen pedir las universidades europeas y los empleadores: B2 es el piso habitual y C1 el que abre posgrados',
        ],
        warn: [
          'No existe una conversión exacta entre exámenes: miden cosas distintas y las tablas oficiales dan rangos, no números únicos',
          'El equivalente en Cambridge se deriva de los cortes del MCER en la Cambridge English Scale, no de una tabla punto a punto: tomalo como referencia',
          'Ninguna institución acepta una conversión: si te piden IELTS, tenés que rendir IELTS, aunque tu TOEFL equivalga',
          'IELTS no certifica niveles A1 y A2: por debajo de 4,0 la equivalencia sale de la escala',
        ],
        plazo:
          'TOEFL e IELTS valen 2 años desde la fecha del examen; los certificados de Cambridge no tienen vencimiento, aunque muchas instituciones igual piden que sean recientes.',
      },
      {
        id: 'objetivo',
        label: 'Qué band de IELTS necesito y cuánto me falta',
        hint: 'Ej.: "quiero un posgrado en UK, tengo 6,0"',
        answer:
          'Se compara tu band actual con el que pide tu objetivo y se arma el reparto por sección que te deja en el promedio necesario.',
        yes: [
          'Elegí tu objetivo y el hub te muestra el band de referencia y el mínimo por sección cuando lo hay',
          'Cargá tu band actual: el desglose te dice cuántos medios puntos te faltan',
          'El plan por sección asume que compensás tu sección floja subiendo las otras, porque el band final es el promedio de Listening, Reading, Writing y Speaking',
          'El promedio del IELTS se redondea al 0,5 más cercano: un 6,625 se informa como 6,5 y un 6,75 como 7,0',
        ],
        warn: [
          'Los puntajes de corte los fija cada universidad, cada programa y cada organismo migratorio, y cambian entre convocatorias: verificá siempre en la fuente oficial antes de decidir',
          'Muchos destinos piden mínimo por sección además del promedio: llegar al promedio y quedar corto en Writing te deja afuera igual',
          'Para visas del Reino Unido hace falta un examen de la lista SELT aprobada (IELTS UKVI y otros): el IELTS común, el TOEFL y los Cambridge generales no sirven para ese trámite',
          'Las profesiones reguladas (salud, docencia, derecho) suelen pedir más que la universidad y con mínimos por sección propios',
        ],
        plazo:
          'inscribite con 4 a 6 semanas de anticipación: las sedes con fecha cercana se llenan y el resultado del IELTS tarda entre 3 y 13 días según el formato.',
      },
      {
        id: 'sat',
        label: 'Mi puntaje del SAT y su percentil',
        hint: 'Ej.: "saqué 1350, ¿en qué percentil estoy?"',
        answer:
          'El percentil te dice qué porcentaje de quienes rinden queda por debajo de tu puntaje total.',
        yes: [
          'Cargá tu score total del SAT, de 400 a 1600 (la suma de las dos secciones, cada una de 200 a 800)',
          'El percentil sale de la tabla de referencia nacional que publica College Board: un 1050 ronda la mitad de la cohorte',
          'El desglose te muestra cuántos puntos te separan de los cortes típicos de admisión selectiva',
          'El SAT no mide inglés como lengua extranjera: es un examen académico y no reemplaza al TOEFL o al IELTS que te piden como estudiante internacional',
        ],
        warn: [
          'Los percentiles se recalculan con cada cohorte: el número real de tu informe puede moverse uno o dos puntos respecto de esta referencia',
          'College Board publica dos percentiles —el de la muestra nacional representativa y el de quienes efectivamente rindieron—: son distintos y el segundo suele ser más bajo',
          'Muchas universidades pasaron a política test-optional: un buen SAT suma, pero la ausencia no siempre resta',
          'El SAT no da equivalencia con TOEFL, IELTS ni MCER: son exámenes de propósitos distintos y cualquier tabla que los cruce es inventada',
        ],
        plazo:
          'los resultados salen entre 2 y 4 semanas después de la fecha y el envío a universidades tarda algunos días más: contá ese margen contra la deadline de aplicación.',
      },
      {
        id: 'goethe',
        label: 'Mi nota del Goethe-Zertifikat (alemán)',
        hint: 'Ej.: "Lesen 72, Hören 68, Schreiben 61, Sprechen 80"',
        answer:
          'Cada módulo se aprueba por separado con 60 sobre 100: no hay compensación entre módulos.',
        yes: [
          'El Goethe-Zertifikat es modular: Lesen, Hören, Schreiben y Sprechen se puntúan de 0 a 100 cada uno',
          'Se aprueba cada módulo con 60 puntos o más, de forma independiente',
          'La mención sale del puntaje de cada módulo: sehr gut 90–100, gut 80–89, befriedigend 70–79, ausreichend 60–69',
          'Podés rendir de nuevo sólo el módulo que te faltó, sin repetir los que aprobaste',
        ],
        warn: [
          'No hay promedio salvador: 95 en Sprechen no compensa un 55 en Schreiben, ese módulo queda pendiente igual',
          'El certificado se emite completo cuando tenés los cuatro módulos aprobados; algunos institutos exigen que se completen dentro de un plazo',
          'Los formatos y las escalas cambian según el nivel y el año del examen: confirmá el modelo vigente con tu instituto',
          'La nota que te informan es la del examen rendido: esta cuenta es para estimar, no reemplaza el acta oficial',
        ],
        plazo:
          'los resultados suelen estar entre 2 y 6 semanas según la sede y el nivel; el certificado en papel puede tardar más.',
      },
      {
        id: 'dele',
        label: 'Mi puntaje del DELE (español)',
        hint: 'Ej.: "Grupo 1: 18, Grupo 2: 14"',
        answer:
          'Hacen falta 30 puntos sobre 50 y además un mínimo de 15 en cada uno de los dos grupos de pruebas.',
        yes: [
          'El DELE agrupa las cuatro pruebas en dos grupos de 25 puntos cada uno: total 50',
          'Grupo 1: comprensión de lectura y expresión e interacción escritas · Grupo 2: comprensión auditiva y expresión e interacción orales',
          'Condición doble: 30 o más en el total Y 15 o más en cada grupo',
          'El resultado del DELE es apto o no apto: no lleva nota numérica en el diploma',
        ],
        warn: [
          'Aprobar el total no alcanza: con 20 en un grupo y 12 en el otro sumás 32 y quedás no apto igual',
          'La agrupación de pruebas cambia según el nivel del diploma: verificá cómo se arman los grupos en el tuyo',
          'El DELE no vence, pero algunos trámites piden certificados recientes',
          'Para la nacionalidad española por residencia se pide DELE A2 o superior más el examen CCSE: son dos exámenes distintos',
        ],
        plazo:
          'la calificación sale unos tres meses después del examen y el diploma tarda varios meses más: si lo necesitás para un trámite con fecha, rendí con mucha anticipación.',
      },
      {
        id: 'horas',
        label: 'Cuántas horas de preparación me llevan al objetivo',
        hint: 'Ej.: "de 1200 a 1500 en el SAT, 10 h por semana"',
        answer:
          'Se estiman las horas por la brecha de puntaje y se dividen por las horas semanales que podés sostener.',
        yes: [
          'Elegí SAT o GRE y cargá tu puntaje actual, el objetivo y las horas por semana que podés poner',
          'En el SAT la estimación es de 0,4 h por punto hasta 1400 y sube a 0,6, 0,8 y 1 h por punto a medida que el objetivo se acerca a 1600',
          'En el GRE la cuenta va por sección: subir un punto cuesta más caro cuanto más alto estás parado, y Verbal cuesta más horas que Quant',
          'El desglose te da horas totales, semanas y meses, más una lectura de si el plazo es realista',
        ],
        warn: [
          'Es una estimación de planificación, no una promesa: el rendimiento real depende de la base, del método y de cuántos simulacros completos hagas',
          'Los últimos 50 puntos del SAT y los últimos 3 del GRE son los más caros en horas: si el plazo aprieta, conviene un objetivo intermedio',
          'Estudiar más horas por semana no escala en forma lineal: por encima de unas 15 semanales el rendimiento por hora cae',
          'El GRE arranca en 130 y termina en 170 por sección: cargá los valores dentro de ese rango',
        ],
        plazo:
          'reservá la fecha del examen cuando arranques el plan: tener la fecha fija es lo que sostiene la rutina, y siempre podés reprogramar pagando la diferencia.',
      },
      {
        id: 'costo',
        label: 'Cuál examen me conviene por costo y vigencia',
        hint: 'Ej.: "¿me conviene el CAE que no vence?"',
        answer:
          'Se compara el precio contra los años que vas a necesitar el certificado: los que vencen hay que volver a rendirlos.',
        yes: [
          'Cargá el precio actual de cada examen en dólares y los años durante los que vas a necesitar el certificado vigente',
          'TOEFL iBT e IELTS valen 2 años: si necesitás cobertura por más tiempo, la cuenta suma las veces que tenés que volver a rendir',
          'Los certificados de Cambridge (incluido el C1 Advanced / CAE) no tienen fecha de vencimiento',
          'El desglose te da el costo total del horizonte y el costo por año de vigencia de cada uno',
        ],
        warn: [
          'Los precios de examen cambian seguido y varían por país y por sede: por eso son campos editables y no números fijos del texto. Confirmá el precio en el centro donde vas a rendir',
          'El más barato no siempre sirve: para visas del Reino Unido sólo valen los exámenes de la lista SELT aprobada, y muchas universidades de EE.UU. prefieren TOEFL',
          'Aunque los certificados de Cambridge no venzan, muchas instituciones piden que la certificación tenga menos de 2 años: preguntá antes de decidir por vigencia',
          'La cuenta no incluye el curso de preparación, los materiales ni el reenvío de resultados a universidades, que en algunos casos se cobra aparte',
        ],
        plazo:
          'inscribite con anticipación: las sedes cobran recargo por inscripción tardía y las fechas cercanas a los cierres de admisión se agotan primero.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Cada rama usa sólo los campos que necesita; el resto queda ahí sin molestar. Los precios y los puntajes de corte vienen con un valor de referencia editable, porque cambian.',
  fields: [
    {
      id: 'examenOrigen',
      label: 'Examen que rendiste',
      type: 'select',
      value: 'toefl',
      options: [
        { value: 'toefl', label: 'TOEFL iBT (0 a 120)' },
        { value: 'ielts', label: 'IELTS (0 a 9)' },
        { value: 'cambridge', label: 'Cambridge English Scale (80 a 230)' },
      ],
    },
    {
      id: 'puntaje',
      label: 'Tu puntaje en ese examen',
      type: 'number',
      min: 0,
      max: 230,
      step: 0.5,
      value: 95,
      help: 'TOEFL iBT total, band global del IELTS o número de la Cambridge English Scale.',
    },
    {
      id: 'objetivoIelts',
      label: 'Para qué necesitás el IELTS',
      type: 'select',
      value: 'universidad_grado',
      options: [
        { value: 'universidad_grado', label: 'Universidad — carrera de grado' },
        { value: 'universidad_posgrado', label: 'Universidad — maestría o doctorado' },
        { value: 'visa_uk', label: 'Visa de estudiante del Reino Unido (SELT)' },
        { value: 'australia_pr', label: 'Migración a Australia — inglés "proficient"' },
        { value: 'canada_ee', label: 'Canadá Express Entry — CLB 9' },
        { value: 'trabajo_salud', label: 'Trabajo en salud (enfermería, medicina)' },
        { value: 'trabajo_general', label: 'Trabajo general en el exterior' },
      ],
    },
    { id: 'bandActual', label: 'Tu band actual de IELTS', type: 'number', min: 0, max: 9, step: 0.5, value: 6 },
    {
      id: 'seccionDebil',
      label: 'Tu sección más floja del IELTS',
      type: 'select',
      value: 'writing',
      options: [
        { value: 'ninguna', label: 'Ninguna — estoy parejo' },
        { value: 'listening', label: 'Listening' },
        { value: 'reading', label: 'Reading' },
        { value: 'writing', label: 'Writing' },
        { value: 'speaking', label: 'Speaking' },
      ],
    },
    { id: 'satScore', label: 'Tu score total del SAT (o el actual, si estás preparando)', type: 'number', min: 400, max: 1600, step: 10, value: 1200 },
    { id: 'satObjetivo', label: 'Score del SAT al que apuntás', type: 'number', min: 400, max: 1600, step: 10, value: 1500 },
    { id: 'greVerbalActual', label: 'GRE Verbal — puntaje actual', type: 'number', min: 130, max: 170, value: 150 },
    { id: 'greVerbalObjetivo', label: 'GRE Verbal — objetivo', type: 'number', min: 130, max: 170, value: 160 },
    { id: 'greQuantActual', label: 'GRE Quant — puntaje actual', type: 'number', min: 130, max: 170, value: 155 },
    { id: 'greQuantObjetivo', label: 'GRE Quant — objetivo', type: 'number', min: 130, max: 170, value: 165 },
    {
      id: 'examenPrep',
      label: 'Qué examen estás preparando',
      type: 'select',
      value: 'sat',
      options: [
        { value: 'sat', label: 'SAT' },
        { value: 'gre', label: 'GRE' },
      ],
    },
    { id: 'horasSemana', label: 'Horas de estudio por semana que podés sostener', type: 'number', min: 1, max: 40, value: 10, suffix: 'h' },
    { id: 'lesen', label: 'Goethe — Lesen (0 a 100)', type: 'number', min: 0, max: 100, value: 72 },
    { id: 'horen', label: 'Goethe — Hören (0 a 100)', type: 'number', min: 0, max: 100, value: 68 },
    { id: 'schreiben', label: 'Goethe — Schreiben (0 a 100)', type: 'number', min: 0, max: 100, value: 61 },
    { id: 'sprechen', label: 'Goethe — Sprechen (0 a 100)', type: 'number', min: 0, max: 100, value: 80 },
    { id: 'dele1', label: 'DELE — Grupo 1: lectura + escrita (0 a 25)', type: 'number', min: 0, max: 25, step: 0.5, value: 18 },
    { id: 'dele2', label: 'DELE — Grupo 2: auditiva + oral (0 a 25)', type: 'number', min: 0, max: 25, step: 0.5, value: 14 },
    {
      id: 'precioIelts',
      label: 'Precio del IELTS en tu sede (USD)',
      type: 'number',
      min: 0,
      value: 300,
      prefix: 'USD',
      help: 'Valor de referencia. Cambia por país, por sede y por año: poné el que te cotizaron.',
    },
    { id: 'precioToefl', label: 'Precio del TOEFL iBT en tu sede (USD)', type: 'number', min: 0, value: 300, prefix: 'USD' },
    { id: 'precioCae', label: 'Precio del C1 Advanced / CAE en tu sede (USD)', type: 'number', min: 0, value: 350, prefix: 'USD' },
    {
      id: 'aniosVigencia',
      label: 'Años durante los que vas a necesitar el certificado vigente',
      type: 'number',
      min: 1,
      max: 15,
      value: 4,
      suffix: 'años',
    },
    {
      id: 'objetivoExamen',
      label: 'Para qué lo vas a usar',
      type: 'select',
      value: 'universidad_usa',
      options: [
        { value: 'universidad_usa', label: 'Universidad en EE.UU. o Canadá' },
        { value: 'universidad_uk', label: 'Universidad en Reino Unido, Irlanda o Australia' },
        { value: 'visa_uk', label: 'Visa del Reino Unido (requiere examen SELT)' },
        { value: 'trabajo', label: 'Trabajo o acreditación profesional' },
        { value: 'cualquiera', label: 'Todavía no lo tengo definido' },
      ],
    },
  ],
  fineprint:
    'Las equivalencias entre exámenes son aproximadas: las tablas oficiales de ETS, IELTS y Cambridge dan rangos, no números únicos, y ninguna institución acepta una conversión en lugar del examen que pide. Los puntajes de corte de universidades, visas y organismos profesionales cambian entre convocatorias: verificá siempre el requisito vigente en la fuente oficial antes de inscribirte o de descartarte. Los precios de examen son valores de referencia editables —varían por país, sede y año—: usá el que te cotice tu centro de examen. Esta página es orientativa y no reemplaza la información oficial de ETS, IELTS, Cambridge English, Instituto Cervantes, Goethe-Institut ni College Board.',

  chart: {
    type: 'scale',
    title: 'Dónde caés',
    caption:
      'La barra ubica tu resultado dentro de la escala que corresponde a cada rama: A1 a C2 en la de equivalencias, 0 a 9 en la de bands del IELTS, percentil 0 a 100 en la del SAT, 0 a 100 en la del Goethe, 0 a 50 en la del DELE, meses de preparación en la de horas y dólares totales en la de costo. Ver la franja importa más que el número: entre un B2 y un C1 hay medio band de IELTS y una lista distinta de universidades.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un dato que entró o un paso de la cuenta, con la tabla oficial de la que sale. En la rama de equivalencias vas a ver el rango de la tabla de ETS además del punto estimado: el rango es el dato oficial y el punto es sólo una lectura cómoda.',

  faq: [
    {
      q: '¿Cuánto es un TOEFL de 95 en IELTS?',
      a: 'Por la tabla de comparación de ETS, un TOEFL iBT de <b>95</b> cae en el tramo 94–101, que corresponde a un band de <b>IELTS 7,0</b>. En el MCER es un <b>C1</b>, el nivel que piden la mayoría de los posgrados. Ojo: la tabla trabaja con rangos, así que un 94 y un 101 informan el mismo band.',
    },
    {
      q: '¿Qué nivel del MCER es cada puntaje de IELTS?',
      a: 'Según IELTS: <b>4,0 a 5,0 es B1</b>, <b>5,5 a 6,5 es B2</b>, <b>7,0 a 8,0 es C1</b> y <b>8,5 a 9,0 es C2</b>. Por debajo de 4,0 el IELTS no certifica nivel del MCER. El B2 es el piso habitual de admisión universitaria y el C1 el que abre posgrados y profesiones reguladas.',
    },
    {
      q: '¿Y en TOEFL iBT, qué puntaje es cada nivel?',
      a: 'ETS mapea el total del TOEFL iBT así: <b>42 a 71 es B1</b>, <b>72 a 94 es B2</b>, <b>95 a 114 es C1</b> y <b>115 a 120 es C2</b>. Por debajo de 42 no hay correspondencia con el MCER. Es el mismo criterio que usan las universidades que publican su corte en niveles en vez de en puntos.',
    },
    {
      q: '¿Cómo se lee la Cambridge English Scale?',
      a: 'Es una escala única de 80 a 230 que comparten todos los exámenes de Cambridge, así que un mismo número significa lo mismo venga de un B2 First o de un C1 Advanced. Los cortes del MCER son: <b>80–99 A1</b>, <b>100–119 A2</b>, <b>120–139 B1</b>, <b>140–159 B2</b>, <b>160–179 C1</b> y <b>180–230 C2</b>. Cada examen informa dentro de su franja: el C1 Advanced, por ejemplo, reporta de 160 a 210.',
    },
    {
      q: '¿Qué band de IELTS piden las universidades?',
      a: 'Como referencia: <b>6,0 a 6,5</b> para carreras de grado, <b>6,5 a 7,0</b> para maestrías y doctorados, y <b>7,0 o más</b> con mínimos por sección para profesiones reguladas como enfermería o medicina. Muchos programas exigen además un mínimo en cada sección, así que llegar al promedio y quedar corto en Writing te deja afuera igual. El corte lo fija cada programa: confirmalo en su página de admisión.',
    },
    {
      q: '¿Cuál examen sirve para la visa del Reino Unido?',
      a: 'Para trámites migratorios del Reino Unido hace falta un <b>SELT</b> (Secure English Language Test) de la lista aprobada por el Home Office, rendido en un centro habilitado: el <b>IELTS for UKVI</b> es el más conocido, pero no es el único. El IELTS común, el TOEFL iBT y los exámenes generales de Cambridge no sirven para ese trámite aunque tu universidad sí los acepte. La lista se actualiza: chequeala antes de pagar.',
    },
    {
      q: '¿Conviene el CAE porque no vence?',
      a: 'Depende de cuánto tiempo lo vayas a necesitar. TOEFL e IELTS valen <b>2 años</b>; los certificados de Cambridge no tienen vencimiento. Si vas a necesitar el certificado durante 4 años, un examen que vence te obliga a rendirlo dos veces y el de Cambridge una sola: ahí la cuenta se da vuelta aunque el precio de lista sea más alto. La trampa es que muchas instituciones piden certificación de los últimos 2 años igual, así que preguntá antes.',
    },
    {
      q: '¿Cuánto tarda subir 300 puntos en el SAT?',
      a: 'Como estimación de planificación, pasar de 1200 a 1500 son unos <b>300 puntos × 0,8 h por punto = 240 horas</b>, porque el objetivo está por encima de 1400 y los últimos puntos son los más caros. A 10 horas por semana son unas 24 semanas, algo más de 5 meses. Con una base por debajo de 1000 la estimación sube un 30%, porque primero hay que cerrar contenido.',
    },
    {
      q: '¿Qué percentil es un SAT de 1350?',
      a: 'Un total de <b>1350</b> ronda el <b>percentil 90</b> de la muestra nacional de referencia: el 92% de quienes rinden queda por debajo. El promedio se ubica cerca de <b>1050</b>, o sea el percentil 50. Los percentiles se recalculan con cada cohorte y College Board publica dos —el nacional representativo y el de quienes rindieron efectivamente—, así que tu informe puede diferir en uno o dos puntos.',
    },
    {
      q: '¿Cómo se aprueba el Goethe-Zertifikat?',
      a: 'Es <b>modular</b>: Lesen, Hören, Schreiben y Sprechen se puntúan de 0 a 100 y cada uno se aprueba por separado con <b>60 puntos</b>. No hay compensación: un 95 en Sprechen no salva un 55 en Schreiben. La ventaja es que podés volver a rendir sólo el módulo que te faltó. Las menciones son sehr gut (90–100), gut (80–89), befriedigend (70–79) y ausreichend (60–69).',
    },
    {
      q: '¿Cuántos puntos hace falta para aprobar el DELE?',
      a: 'Dos condiciones al mismo tiempo: <b>30 puntos sobre 50</b> en el total y <b>15 puntos como mínimo en cada uno de los dos grupos</b> de pruebas. El grupo 1 reúne comprensión de lectura y expresión escrita; el grupo 2, comprensión auditiva y expresión oral. Con 20 en un grupo y 12 en el otro sumás 32 y quedás <b>no apto</b> igual: el total no compensa el grupo flojo.',
    },
    {
      q: '¿El SAT sirve como examen de inglés?',
      a: 'No. El SAT es un examen académico de razonamiento y matemática pensado para estudiantes cuya lengua de instrucción ya es el inglés. Si aplicás como estudiante internacional te van a pedir igual un TOEFL, un IELTS u otro examen de dominio del idioma. Cualquier tabla que convierta SAT a MCER o a bands de IELTS está inventada: son escalas que no miden lo mismo.',
    },
  ],

  sources: [
    {
      name: 'TOEFL iBT — puntajes, niveles MCER y tabla de comparación con IELTS',
      url: 'https://www.ets.org/toefl/score-users/ibt/compare-scores.html',
      publisher: 'ETS',
    },
    {
      name: 'IELTS — cómo se calculan los bands y su correspondencia con el MCER',
      url: 'https://ielts.org/organisations/ielts-scoring-in-detail',
      publisher: 'IELTS (British Council / IDP / Cambridge)',
    },
    {
      name: 'Cambridge English Scale — escala única y equivalencia con los niveles del MCER',
      url: 'https://www.cambridgeenglish.org/exams-and-tests/cambridge-english-scale/',
      publisher: 'Cambridge University Press & Assessment',
    },
    {
      name: 'Marco Común Europeo de Referencia para las lenguas (MCER)',
      url: 'https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions',
      publisher: 'Consejo de Europa',
    },
    {
      name: 'DELE — estructura de las pruebas, grupos y criterios de calificación',
      url: 'https://examenes.cervantes.es/es/dele/que-es',
      publisher: 'Instituto Cervantes',
    },
    {
      name: 'Goethe-Zertifikat — exámenes modulares y criterios de aprobación',
      url: 'https://www.goethe.de/en/spr/kup/prf.html',
      publisher: 'Goethe-Institut',
    },
    {
      name: 'SAT — comprender los puntajes y las tablas de percentiles',
      url: 'https://satsuite.collegeboard.org/sat/scores/understanding-scores',
      publisher: 'College Board',
    },
    {
      name: 'GRE General Test — estructura, escalas de puntaje y percentiles',
      url: 'https://www.ets.org/gre/test-takers/general-test/scores.html',
      publisher: 'ETS',
    },
    {
      name: 'Approved Secure English Language Tests (SELT) para trámites migratorios del Reino Unido',
      url: 'https://www.gov.uk/guidance/prove-your-english-language-abilities-with-a-secure-english-language-test-selt',
      publisher: 'UK Home Office',
    },
  ],

  replaces: [
    '/calculadora-equivalencia-toefl-ielts-cambridge-mcer',
    '/calculadora-ielts-toefl-puntaje-equivalencia-cef-c1-c2',
    '/calculadora-sat-ielts-toefl-equivalencias-puntaje-convertidor',
    '/calculadora-score-ielts-band-objetivo',
    '/calculadora-puntaje-dele-spanish',
    '/calculadora-nivel-goethe-aleman',
    '/calculadora-cae-vs-toefl-vs-ielts-cuanto-cuesta-rinde-mas',
    '/calculadora-horas-preparar-sat',
    '/calculadora-horas-preparar-gre',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
