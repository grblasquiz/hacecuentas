// Trackers "salario mínimo 2027" — fuente única verificada (2026-08-18).
// Formato anti-especulación: lo vigente HOY + mecanismo legal + cronograma +
// histórico verificable + SOLO anuncios reales publicados (nada inventado).
// Research: 5 agentes con 3+ fuentes por país. Actualizar cuando salgan las
// normas (ver `proximaRevision` de cada país).

export interface HitoHistorico {
  anio: string;
  valor: string;
  detalle?: string;
}

export interface SalarioMinimo2027Pais {
  pais: string;
  audience: string;
  slug: string;             // p.ej. 'co/datos-salario-minimo-colombia-2027'
  slug2026: string;         // página del valor vigente
  nombreDelMinimo: string;  // 'SMLMV' / 'salario mínimo' / 'IMM' / 'SBU' / 'RMV'
  vigenteHoy: string;       // valor actual con vigencia
  vigenteDetalle: string;
  estado2027: string;       // 1 frase: qué se sabe HOY del valor 2027
  definicion: string;       // cuándo y cómo se define el valor 2027
  mecanismo: string;
  cronograma: { fecha: string; hito: string }[];
  historico: HitoHistorico[];
  queSeSabe: string[];      // anuncios reales publicados, con quién lo dijo
  advertencia: string;      // qué NO está confirmado
  proximaRevision: string;  // cuándo re-verificar
  dataAsOf: string;
  fuentes: { nombre: string; url: string }[];
  calcRelacionada?: { href: string; label: string };
}

export const SALARIO_MINIMO_2027: Record<string, SalarioMinimo2027Pais> = {
  mexico: {
    pais: 'México', audience: 'MX',
    slug: 'mx/datos-salario-minimo-mexico-2027',
    slug2026: '/mx/datos-salario-minimo-mexico-2026',
    nombreDelMinimo: 'salario mínimo',
    vigenteHoy: '$315,04 diarios (zona general) · $440,87 (ZLFN)',
    vigenteDetalle: 'Resolución CONASAMI publicada en el DOF el 9-dic-2025, vigente desde el 1-ene-2026. Equivalente mensual: ~$9.577 (factor 30,4).',
    estado2027: 'El monto 2027 NO está definido: CONASAMI lo anuncia en diciembre de 2026 y rige desde el 1 de enero de 2027.',
    definicion: 'Diciembre de 2026 (anuncio CONASAMI + publicación en el DOF); vigencia desde el 1-ene-2027.',
    mecanismo: 'Lo fija el Consejo de Representantes de la CONASAMI (gobierno + sector obrero + sector empresarial), en general por consenso. La fórmula reciente combina un monto fijo de recuperación (MIR) más un porcentaje: para 2026 fue MIR de $17,01 + 6,5% en la zona general (total +13%) y +5% en la ZLFN.',
    cronograma: [
      { fecha: 'may–nov 2026', hito: 'CONASAMI elabora estudios técnicos (canasta básica LPIU, inflación, empleo) y negocia con los sectores' },
      { fecha: 'nov–dic 2026', hito: 'Propuestas públicas de los sectores; el Consejo de Representantes vota la resolución' },
      { fecha: '~primera quincena de dic 2026', hito: 'Anuncio oficial y publicación de la resolución en el DOF' },
      { fecha: '1-ene-2027', hito: 'Entra en vigor el salario mínimo 2027' },
    ],
    historico: [
      { anio: '2019', valor: '$102,68 / ZLFN $176,72', detalle: '+16,2%' },
      { anio: '2020', valor: '$123,22 / ZLFN $185,56', detalle: '+20%' },
      { anio: '2021', valor: '$141,70 / ZLFN $213,39', detalle: '+15%' },
      { anio: '2022', valor: '$172,87 / ZLFN $260,34', detalle: '+22%' },
      { anio: '2023', valor: '$207,44 / ZLFN $312,41', detalle: '+20%' },
      { anio: '2024', valor: '$248,93 / ZLFN $374,89', detalle: '+20%' },
      { anio: '2025', valor: '$278,80 / ZLFN $419,88', detalle: '+12%' },
      { anio: '2026', valor: '$315,04 / ZLFN $440,87', detalle: '+13% general · +5% ZLFN' },
    ],
    queSeSabe: [
      'Compromiso explícito del gobierno de Sheinbaum: que al cierre del sexenio (2030) el mínimo alcance para 2,5 canastas básicas (hoy cubre ~1,7). Eso implica aumentos de doble dígito o cercanos cada año hasta 2030.',
      'Proyecciones de prensa (IDC, con base en criterios económicos del gobierno) estiman ~7% para 2027 (≈$332–337 diarios), pero los aumentos reales vienen superando esas proyecciones: para 2026 también se proyectaba menos y terminó en 13%.',
      'El aumento de la zona general y el de la ZLFN pueden diferir (2026: 13% vs 5%): la franja fronteriza ya cumple la meta de canastas.',
    ],
    advertencia: 'No hay cifra oficial 2027 de CONASAMI ni de la STPS. Cualquier número que circule antes del anuncio de diciembre es proyección.',
    proximaRevision: 'primera quincena de diciembre de 2026',
    dataAsOf: '2026-08-18',
    fuentes: [
      { nombre: 'CONASAMI — Incremento a los salarios mínimos para 2026', url: 'https://www.gob.mx/conasami/articulos/incremento-a-los-salarios-minimos-para-2026?idiom=es' },
      { nombre: 'DOF — Resolución de salarios mínimos 2026 (9-dic-2025)', url: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5775534&fecha=09/12/2025' },
      { nombre: 'STPS — Serie histórica del salario mínimo', url: 'https://www.stps.gob.mx/gobmx/estadisticas/302_0074.xls' },
    ],
    calcRelacionada: { href: '/mx/trabajo/sueldo-neto', label: 'Calculadora de sueldo neto México' },
  },
  colombia: {
    pais: 'Colombia', audience: 'CO',
    slug: 'co/datos-salario-minimo-colombia-2027',
    slug2026: '/co/datos-salario-minimo-colombia-2026',
    nombreDelMinimo: 'SMLMV',
    vigenteHoy: '$1.750.905 + auxilio de transporte $249.095',
    vigenteDetalle: 'Fijado por el Decreto 1469/2025 y restablecido de forma transitoria por el Decreto 0159/2026. Con auxilio: $2.000.000.',
    estado2027: 'El SMLMV 2027 NO está definido: se concerta (o se decreta) en diciembre de 2026 y rige desde el 1 de enero de 2027.',
    definicion: 'Diciembre de 2026 (mesa de concertación; si no hay acuerdo, decreto del Gobierno antes del 30-dic); vigencia 1-ene-2027.',
    mecanismo: 'Lo negocia la Comisión Permanente de Concertación de Políticas Salariales y Laborales (Gobierno, gremios y centrales obreras). El plazo legal de concertación vence el 15 de diciembre; si no hay consenso, el Gobierno lo fija por decreto antes del 30 de diciembre, considerando inflación y productividad.',
    cronograma: [
      { fecha: '2º semestre 2026', hito: 'El DANE publica inflación y productividad, los insumos de la mesa' },
      { fecha: 'primeras semanas de dic 2026', hito: 'Instalación de la mesa de concertación (fecha exacta aún no publicada)' },
      { fecha: '15-dic-2026', hito: 'Plazo legal para concertar en la Comisión (Ley 278/1996)' },
      { fecha: '15 al 30-dic-2026', hito: 'Ventana de salvedades y segundo intento de acuerdo' },
      { fecha: 'a más tardar 30-dic-2026', hito: 'Si no hay consenso, el Gobierno fija SMLMV y auxilio 2027 por decreto' },
    ],
    historico: [
      { anio: '2019', valor: '$828.116', detalle: '+6%' },
      { anio: '2020', valor: '$877.803', detalle: '+6%' },
      { anio: '2021', valor: '$908.526', detalle: '+3,5%' },
      { anio: '2022', valor: '$1.000.000', detalle: '+10,07%' },
      { anio: '2023', valor: '$1.160.000', detalle: '+16%' },
      { anio: '2024', valor: '$1.300.000', detalle: '+12,07%' },
      { anio: '2025', valor: '$1.423.500', detalle: '+9,54%' },
      { anio: '2026', valor: '$1.750.905', detalle: '+23%' },
    ],
    queSeSabe: [
      'Analistas (Corficolombiana) proyectan un piso de negociación cercano al 7%, y ~8% si la inflación 2026 cierra alrededor del 7% más un punto de productividad. La inflación anualizada a junio de 2026 fue 6,14% (DANE).',
      'Escenarios de prensa (no propuestas oficiales): con 8%, el mínimo con auxilio pasaría de $2.000.000 a ~$2.160.000; con 5-6%, el SMLMV quedaría entre ~$1.838.000 y ~$1.856.000.',
      'El nuevo gobierno delineó como criterios inflación y productividad ("mantener el poder adquisitivo sin alejarse demasiado de la inflación"), y el Banco de la República advierte contra aumentos muy por encima de inflación + productividad — un tono distinto al +23% de 2026.',
      'Centrales obreras y gremios todavía no publicaron cifras de propuesta; la mesa no está instalada.',
    ],
    advertencia: 'No existe cifra oficial 2027: todo lo anterior son proyecciones de analistas y criterios declarados, no propuestas formales en mesa. La definición llega entre el 15 y el 30 de diciembre.',
    proximaRevision: 'diciembre de 2026 (concertación y decreto)',
    dataAsOf: '2026-08-18',
    fuentes: [
      { nombre: 'Ley 278 de 1996 — Comisión de Concertación y plazos (Función Pública)', url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4928' },
      { nombre: 'MinTrabajo — Comisión Permanente de Concertación', url: 'https://www.mintrabajo.gov.co/relaciones-laborales/comision-permanente-de-concertacion' },
      { nombre: 'Noticias RCN — salario mínimo 2027: inflación y productividad', url: 'https://www.noticiasrcn.com/economia/salario-minimo-2027-colombia-aumento-inflacion-1042576' },
      { nombre: 'El País Cali — escenarios del salario mínimo 2027', url: 'https://www.elpais.com.co/economia/salario-minimo-para-el-2027-en-colombia-cuanto-podria-ser-el-incremento-y-cuales-son-los-escenarios-1058.html' },
    ],
    calcRelacionada: { href: '/co/trabajo/sueldo-neto', label: 'Calculadora de sueldo neto Colombia' },
  },
  chile: {
    pais: 'Chile', audience: 'CL',
    slug: 'cl/datos-sueldo-chile-2027',
    slug2026: '/cl/datos-sueldo-chile-2026',
    nombreDelMinimo: 'ingreso mínimo mensual (IMM)',
    vigenteHoy: '$553.553 (18 a 65 años, desde el 1-may-2026)',
    vigenteDetalle: 'Ley N° 21.830 (D.O. 22-jun-2026, retroactiva al 1-may-2026). Menores de 18 y mayores de 65: $412.938. Fines no remuneracionales: $356.815.',
    estado2027: 'El reajuste de enero-2027 YA está legislado: la Ley 21.830 ordena subir el IMM el 1-ene-2027 según el IPC acumulado may–dic 2026. El monto exacto se conocerá con el IPC de diciembre.',
    definicion: '1-ene-2027 por reajuste automático de IPC (Ley 21.830); el decreto con los montos exactos sale antes del 15-ene-2027. Nueva negociación legal hacia abril-mayo 2027.',
    mecanismo: 'El IMM se fija por ley negociada entre el Ejecutivo, la CUT y el Congreso. Las leyes recientes traen montos escalonados más una cláusula de reajuste automático por IPC para el enero siguiente, y obligan al Ejecutivo a enviar un nuevo proyecto de reajuste al año siguiente (vigencia habitual desde el 1 de mayo).',
    cronograma: [
      { fecha: '8-ene-2027 (aprox.)', hito: 'El INE publica el IPC de diciembre → queda determinado el reajuste acumulado may–dic 2026' },
      { fecha: 'antes del 15-ene-2027', hito: 'Hacienda y Trabajo dictan el decreto supremo con los tres montos reajustados exactos' },
      { fecha: '~abr-may 2027', hito: 'El Ejecutivo envía al Congreso el nuevo proyecto de ley de reajuste (próxima negociación), vigencia habitual 1-may-2027' },
    ],
    historico: [
      { anio: '2022', valor: '$350.000 → $400.000 (ago)', detalle: 'Ley 21.456' },
      { anio: '2023', valor: '$410.000 → $460.000 (sep)', detalle: 'Ley 21.578' },
      { anio: '2024', valor: '$460.000 → $500.000 (jul)', detalle: 'Ley 21.578' },
      { anio: '2025', valor: '$510.636 (ene, IPC) → $529.000 (may)', detalle: 'Ley 21.751' },
      { anio: '2026', valor: '$539.000 (ene, Ley 21.751) → $553.553 (may)', detalle: 'Ley 21.830' },
    ],
    queSeSabe: [
      'El reajuste del 1-ene-2027 es un hecho legal (Ley 21.830): sube por el IPC acumulado entre el 1-may-2026 y el 31-dic-2026, y aplica proporcionalmente a los tres montos (18-65 años, menores/mayores, y no remuneracional).',
      'Simulaciones de prensa por escenario de IPC (no oficiales): con 1% acumulado → ~$559.089; con 2% → ~$564.624; con 3% → ~$570.160.',
      'El siguiente aumento negociado requiere una nueva ley: el proyecto debe entrar al Congreso hacia abril de 2027.',
    ],
    advertencia: 'El monto nominal de enero-2027 NO existe todavía: depende del IPC de las próximas mediciones y del decreto supremo. Las cifras por escenario son simulaciones, no valores oficiales.',
    proximaRevision: '10–15 de enero de 2027 (decreto con montos exactos)',
    dataAsOf: '2026-08-18',
    fuentes: [
      { nombre: 'Dirección del Trabajo — Dictamen ORD. N°307/28 sobre la Ley 21.830', url: 'https://www.dt.gob.cl/legislacion/1624/w3-article-129410.html' },
      { nombre: 'Diario Oficial — Ley N° 21.830 (22-jun-2026)', url: 'https://www.diariooficial.interior.gob.cl/publicaciones/2026/06/22/44481-B/01/2829298.pdf' },
      { nombre: 'BCN LeyChile — Ley 21.751 (reajuste 2025-2026)', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1214530' },
    ],
    calcRelacionada: { href: '/cl/trabajo/sueldo-liquido', label: 'Calculadora de sueldo líquido Chile' },
  },
  ecuador: {
    pais: 'Ecuador', audience: 'EC',
    slug: 'datos-salario-basico-ecuador-2027',
    slug2026: '/datos-salario-basico-ecuador-2026',
    nombreDelMinimo: 'salario básico unificado (SBU)',
    vigenteHoy: 'US$ 482 mensuales',
    vigenteDetalle: 'Acuerdo Ministerial MDT-2025-195 (15-dic-2025), vigente desde el 1-ene-2026. Fue el primer consenso tripartito en casi una década.',
    estado2027: 'El SBU 2027 NO está definido: el CNTS lo negocia en noviembre-diciembre de 2026 y rige desde el 1 de enero de 2027. La meta declarada del gobierno es US$ 500.',
    definicion: 'Noviembre-diciembre de 2026 (CNTS; sin acuerdo, lo fija el Ministerio del Trabajo con fórmula técnica); vigencia 1-ene-2027.',
    mecanismo: 'Lo define el Consejo Nacional de Trabajo y Salarios (CNTS), tripartito. Si no hay acuerdo entre empleadores y trabajadores, el Ministerio del Trabajo lo fija con la fórmula técnica (inflación proyectada + productividad), como ocurrió casi todos los años de la última década. Se formaliza por Acuerdo Ministerial.',
    cronograma: [
      { fecha: 'nov 2026 (estimado)', hito: 'Instalación de las mesas del CNTS para el SBU 2027' },
      { fecha: 'dic 2026', hito: 'Definición del monto (acuerdo tripartito o fijación ministerial) y Acuerdo Ministerial' },
      { fecha: '1-ene-2027', hito: 'Entra en vigencia el SBU 2027' },
    ],
    historico: [
      { anio: '2019', valor: 'US$ 394', detalle: '+8' },
      { anio: '2020', valor: 'US$ 400', detalle: '+6' },
      { anio: '2021', valor: 'US$ 400', detalle: 'congelado (pandemia)' },
      { anio: '2022', valor: 'US$ 425', detalle: '+25' },
      { anio: '2023', valor: 'US$ 450', detalle: '+25' },
      { anio: '2024', valor: 'US$ 460', detalle: '+10' },
      { anio: '2025', valor: 'US$ 470', detalle: '+10' },
      { anio: '2026', valor: 'US$ 482', detalle: '+12' },
    ],
    queSeSabe: [
      'La meta declarada del gobierno de Noboa es llevar el SBU a US$ 500 en 2027 (lo afirmó públicamente la exministra del Trabajo Ivonne Núñez). Es una meta política, no un monto fijado.',
      'Llegar a US$ 500 implicaría +US$ 18, un salto mayor a los últimos aumentos (+10, +10, +12).',
      'Análisis de prensa (La Hora) estiman que un SBU de US$ 500 llevaría el costo real por trabajador formal a ~US$ 706/mes, un punto de debate en la negociación.',
    ],
    advertencia: 'No hay convocatoria del CNTS ni Acuerdo Ministerial para 2027 todavía. Los US$ 500 son meta declarada del gobierno, no dato oficial.',
    proximaRevision: 'diciembre de 2026 (Acuerdo Ministerial y Registro Oficial)',
    dataAsOf: '2026-08-18',
    fuentes: [
      { nombre: 'Ministerio del Trabajo — acuerdo tripartito SBU 2026 (US$ 482)', url: 'https://www.trabajo.gob.ec/despues-de-casi-una-decada-hay-consenso-gobierno-empleadores-y-trabajadores-acuerdan-fijar-el-salario-basico-unificado-de-2026-en-usd-482-no-hay-imposicion-hay-union/' },
      { nombre: 'El Universo — meta de SBU US$ 500 para 2027 (exministra Núñez)', url: 'https://www.eluniverso.com/noticias/economia/ivonne-nunez-renuncia-ministerio-trabajo-daniel-noboa-contratos-colectivos-furukawa-ecuador-nota/' },
      { nombre: 'Teleamazonas — evolución del SBU en 10 años', url: 'https://www.teleamazonas.com/actualidad/noticias/economia/asi-incremento-monto-salario-basico-unificado-ecuador-ultimos-10-anos-107582/' },
    ],
    calcRelacionada: { href: '/ec/trabajo/sueldo-neto', label: 'Calculadora de sueldo neto Ecuador' },
  },
  peru: {
    pais: 'Perú', audience: 'PE',
    slug: 'pe/datos-sueldo-minimo-peru-2027',
    slug2026: '/pe/datos-sueldo-minimo-peru-2026',
    nombreDelMinimo: 'remuneración mínima vital (RMV)',
    vigenteHoy: 'S/ 1.130 mensuales',
    vigenteDetalle: 'Decreto Supremo 006-2024-TR (El Peruano, 28-dic-2024), vigente desde el 1-ene-2025. Ningún decreto posterior la modificó a la fecha.',
    estado2027: 'Hay un aumento ANUNCIADO en dos tramos: S/ 1.230 desde noviembre de 2026 y S/ 1.300 desde abril de 2027 — pero todavía sin decreto supremo publicado.',
    definicion: 'La RMV no tiene calendario fijo: se ajusta por decreto supremo cuando el Ejecutivo lo decide. Los tramos anunciados (nov-2026 y abr-2027) se confirman recién con la publicación en El Peruano.',
    mecanismo: 'Se fija por decreto supremo del Ejecutivo (MTPE/MEF), en teoría con recomendación del Consejo Nacional de Trabajo y Promoción del Empleo (CNTPE), órgano tripartito. En la práctica el Ejecutivo ha decretado aumentos con o sin consenso del CNTPE.',
    cronograma: [
      { fecha: 'nov 2026 (anunciado)', hito: 'Primer tramo: RMV pasaría de S/ 1.130 a S/ 1.230 (+S/ 100)' },
      { fecha: 'abr 2027 (anunciado)', hito: 'Segundo tramo: RMV llegaría a S/ 1.300 (+S/ 70)' },
    ],
    historico: [
      { anio: '2018', valor: 'S/ 930 (desde abr)', detalle: 'DS 004-2018-TR' },
      { anio: '2022', valor: 'S/ 1.025 (desde may)', detalle: 'DS 003-2022-TR' },
      { anio: '2025', valor: 'S/ 1.130 (desde ene)', detalle: 'DS 006-2024-TR' },
    ],
    queSeSabe: [
      'El gobierno (asumió en julio de 2026) anunció en el Mensaje a la Nación que la RMV subirá de S/ 1.130 a S/ 1.300 (+15%).',
      'El ministro de Economía Elmer Cuba precisó (El Peruano, 10-ago-2026) que será en dos tramos: +S/ 100 en noviembre de 2026 y +S/ 70 en abril de 2027, escalonado para amortiguar el impacto en precios y mypes.',
      'La CGTP calificó el aumento de insuficiente y pide un monto cercano a S/ 1.500.',
    ],
    advertencia: 'Los tramos son anuncios del Ejecutivo, no norma: hasta que el decreto supremo salga en El Peruano, montos y fechas pueden cambiar. El valor legal vigente sigue siendo S/ 1.130.',
    proximaRevision: 'octubre-noviembre de 2026 (publicación del decreto del primer tramo)',
    dataAsOf: '2026-08-18',
    fuentes: [
      { nombre: 'El Peruano — el aumento de la RMV se aplicaría desde noviembre (ministro Cuba)', url: 'https://elperuano.pe/noticia/302132-aumento-de-la-rmv-se-aplicaria-a-partir-de-noviembre' },
      { nombre: 'MTPE — Decreto Supremo 006-2024-TR (RMV S/ 1.130)', url: 'https://www.gob.pe/institucion/mtpe/normas-legales/6335262-006-2024-tr' },
      { nombre: 'Diario Correo — MEF: aumento en dos tramos (nov-2026 y abr-2027)', url: 'https://diariocorreo.pe/politica/mef-sueldo-minimo-subira-en-dos-tramos-primero-en-noviembre-y-luego-en-abril-de-2027-noticia/' },
    ],
    calcRelacionada: { href: '/pe/trabajo/sueldo-neto', label: 'Calculadora de sueldo neto Perú' },
  },
};
