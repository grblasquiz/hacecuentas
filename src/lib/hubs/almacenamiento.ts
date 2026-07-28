import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántos GB son y cuánto espacio me queda de verdad?"
 *
 * Arquetipo CÁLCULO DOMINANTE (sin `cases`): la unidad de entrada y la base
 * (decimal SI vs binaria IEC) se eligen en dos `select`, y la respuesta fija va
 * en `answer`.
 *
 * Absorbe 6 calculadoras (ver hub.replaces): la tabla bytes→KB→MB→GB→TB, los
 * tres conversores sueltos (bits↔bytes, KB↔MB, MB↔GB, TB↔GB) y el espacio útil
 * de un arreglo RAID.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay plata: TODAS las filas y el resultado declaran `format: 'unit'`
 *    o `'plain'`. El runtime hace Object.assign y una fila sin `format` propio
 *    cae a pesos.
 */
export const hub: HubData = {
  slug: 'tecnologia/almacenamiento',
  title: '¿Cuántos GB son? Conversor bytes, KB, MB, GB, TB y espacio útil en RAID',
  description:
    'Convertí entre bits, bytes, KB, MB, GB y TB en base decimal (1.000) o binaria (1.024) y entendé por qué un disco de 1 TB muestra 931 GB. Incluye el espacio útil real de un arreglo RAID 0, 1, 5, 6 o 10 y cuántos discos podés perder.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Unidades de almacenamiento y RAID',
  h1: '¿Cuántos GB son y cuánto espacio me queda de verdad?',
  lede:
    'El fabricante cuenta en miles y tu sistema operativo cuenta en 1.024: por eso el disco "de 1 TB" aparece como 931 GB. Acá convertís cualquier unidad en las dos bases y, si armás un RAID, ves cuánto espacio queda realmente disponible y cuántos discos podés perder sin llorar.',
  stamps: ['Actualizado 27-07-2026', 'Base decimal SI y binaria IEC', '6 calculadoras adentro'],

  resultLabel: 'Equivalente en gigabytes (decimal)',

  inputsTitle: 'Poné la cantidad, la unidad y, si armás un arreglo, los discos',
  inputsIntro:
    'La primera parte convierte cualquier cantidad entre unidades y bases. La segunda calcula el espacio útil del arreglo y te dice cuántas copias de ese archivo entran adentro.',
  fields: [
    {
      id: 'valor',
      label: 'Cantidad que querés convertir',
      type: 'number',
      min: 0,
      max: 1000000000,
      step: 0.001,
      value: 1,
      help: 'Puede ser el tamaño de un archivo, de una partición o de un disco entero.',
    },
    {
      id: 'unidadOrigen',
      label: 'Unidad de esa cantidad',
      type: 'select',
      value: 'tb',
      options: [
        { value: 'bits', label: 'Bits (b)' },
        { value: 'bytes', label: 'Bytes (B)' },
        { value: 'kb', label: 'Kilobytes (KB / KiB)' },
        { value: 'mb', label: 'Megabytes (MB / MiB)' },
        { value: 'gb', label: 'Gigabytes (GB / GiB)' },
        { value: 'tb', label: 'Terabytes (TB / TiB)' },
      ],
      help: 'Los planes de internet vienen en bits por segundo; los archivos, en bytes.',
    },
    {
      id: 'base',
      label: 'Cómo interpretar esa unidad',
      type: 'select',
      value: 'decimal',
      options: [
        { value: 'decimal', label: 'Decimal SI — 1 kB = 1.000 bytes (fabricantes, operadoras, macOS)' },
        { value: 'binaria', label: 'Binaria IEC — 1 KiB = 1.024 bytes (Windows, Linux, RAM)' },
      ],
      help: 'Cambia sólo cómo se lee lo que escribiste. El desglose siempre te muestra las dos bases.',
    },
    {
      id: 'discos',
      label: 'Cantidad de discos del arreglo',
      type: 'number',
      min: 2,
      max: 64,
      step: 1,
      value: 4,
    },
    {
      id: 'tamanoDisco',
      label: 'Tamaño de cada disco',
      type: 'number',
      suffix: 'TB',
      min: 0.1,
      max: 1000,
      step: 0.1,
      value: 4,
      help: 'Todos los discos del arreglo cuentan como el más chico: poné ese tamaño.',
    },
    {
      id: 'nivel',
      label: 'Nivel de RAID',
      type: 'select',
      value: '5',
      options: [
        { value: '0', label: 'RAID 0 — stripe, sin redundancia (mínimo 2 discos)' },
        { value: '1', label: 'RAID 1 — espejo (mínimo 2 discos)' },
        { value: '5', label: 'RAID 5 — paridad simple (mínimo 3 discos)' },
        { value: '6', label: 'RAID 6 — paridad doble (mínimo 4 discos)' },
        { value: '10', label: 'RAID 10 — espejo + stripe (mínimo 4, cantidad par)' },
      ],
    },
  ],
  fineprint:
    'El RAID no es un backup: protege contra la falla física de un disco, no contra un borrado, un ransomware ni un incendio. Los formateos, la tabla de particiones y el espacio reservado del sistema de archivos se comen otro 1% a 3% del espacio útil que ves acá.',

  chart: {
    type: 'donut',
    title: 'A dónde se va la capacidad bruta del arreglo',
    caption:
      'El anillo reparte los terabytes brutos que comprás en tres partes: el espacio que efectivamente vas a ver en el sistema, la brecha entre la unidad decimal del fabricante y la binaria del sistema operativo, y los discos que se van en redundancia. La brecha no es espacio perdido: son los mismos bytes contados con otra vara.',
  },
  breakdownTitle: 'La misma cantidad en todas las unidades, y el arreglo',
  breakdownIntro:
    'Arriba, la conversión en base decimal (la del fabricante) y en base binaria (la del sistema operativo). Abajo, el arreglo RAID: espacio útil, redundancia y cuántas copias de tu archivo entran.',

  answer: {
    title: 'Por qué el disco "de 1 TB" muestra 931 GB',
    copy:
      'No te robaron nada: son dos formas de contar. El fabricante usa el prefijo decimal del SI, donde 1 TB son 1.000.000.000.000 de bytes. Windows y la mayoría de los sistemas de archivos cuentan en potencias de 2 y llaman "GB" a lo que en realidad es un gibibyte (GiB), 1.073.741.824 bytes. Los bytes son exactamente los mismos: cambia el número que se imprime en pantalla.',
    yes: [
      'Decimal SI: 1 kB = 1.000 B · 1 MB = 1.000 kB · 1 GB = 1.000 MB · 1 TB = 1.000 GB',
      'Binaria IEC: 1 KiB = 1.024 B · 1 MiB = 1.024 KiB · 1 GiB = 1.024 MiB · 1 TiB = 1.024 GiB',
      'La brecha crece con la unidad: 2,4% en KB, 4,9% en MB, 6,9% en GB y 9,1% en TB',
      '1 byte son 8 bits: la velocidad del plan de internet va en bits y las descargas en bytes',
      'RAID 0 aprovecha el 100% del espacio y no tolera ninguna falla',
      'RAID 1 deja útil el tamaño de un solo disco, no importa cuántos pongas',
      'RAID 5 pierde el equivalente a un disco; RAID 6, a dos; RAID 10, a la mitad del arreglo',
    ],
    warn: [
      'El RAID no reemplaza un backup: un borrado accidental se replica en todos los discos al instante',
      'Reconstruir un RAID 5 de discos grandes tarda días y es cuando más probable es que muera un segundo disco',
      'En RAID 10 tolerás un disco seguro; podés tolerar más sólo si caen de espejos distintos',
      'Mezclar discos de distinto tamaño hace que todos cuenten como el más chico',
      'La RAM sí se mide en potencias de 2 de verdad: 8 GB de RAM son 8 GiB, ahí no hay brecha',
      'El espacio reservado del sistema de archivos y los metadatos descuentan otro 1% a 3%',
    ],
    plazo:
      'antes de comprar los discos: definí primero el nivel de RAID, porque de eso depende cuántos terabytes tenés que pagar para llegar al espacio útil que querés.',
  },

  faq: [
    {
      q: '¿Por qué mi disco de 1 TB muestra 931 GB?',
      a: 'Porque el fabricante vende 1.000.000.000.000 de bytes (1 TB decimal) y Windows los divide por 1.024 tres veces, mostrando 931,32 unidades que llama "GB" pero que técnicamente son gibibytes (GiB). Los bytes son los mismos: la diferencia del 9,1% es sólo la vara con la que se mide. macOS desde la versión 10.6 usa la base decimal, así que ahí el mismo disco aparece como 1 TB.',
    },
    {
      q: '¿Cuántos bytes tiene un gigabyte?',
      a: 'Un gigabyte decimal (GB) tiene 1.000.000.000 de bytes. Un gibibyte binario (GiB) tiene 1.073.741.824 bytes, un 7,4% más. La diferencia relativa entre lo que dice el fabricante y lo que muestra el sistema operativo es del 6,87% a nivel GB.',
    },
    {
      q: '¿Cuántos bits son un byte?',
      a: 'Ocho. Por eso, para pasar de bits a bytes se divide por 8 y para el camino inverso se multiplica por 8. Es la conversión que más confunde con internet: un plan de 300 Mbps son 300 megabits por segundo, o sea 37,5 MB por segundo de descarga real, antes de descontar overhead del protocolo.',
    },
    {
      q: '¿Cuántos MB tiene un GB?',
      a: '1.000 MB en base decimal, que es la que usan los fabricantes de discos y las operadoras de telefonía. En base binaria, 1 GiB son 1.024 MiB. Si tu plan de datos dice 5 GB, lo más probable es que sean 5.000 MB decimales; si el sistema operativo te dice que un archivo pesa 1 GB, en general son 1.024 MB.',
    },
    {
      q: '¿Cuántos KB tiene un MB?',
      a: '1.000 KB en decimal y 1.024 KiB en binario. La brecha a este nivel es de apenas 2,4%, por eso casi nadie la nota en archivos chicos; recién se vuelve visible cuando hablás de gigabytes y terabytes.',
    },
    {
      q: '¿Cuántos GB tiene un TB?',
      a: '1.000 GB si contás en decimal, que es como está impreso en la caja del disco. 1.024 GiB si contás en binario. De ahí sale el clásico "compré 4 TB y tengo 3,63 TB": son los mismos 4 billones de bytes leídos con la vara binaria.',
    },
    {
      q: '¿Cuánto espacio útil me queda en un RAID 5?',
      a: 'El equivalente a todos los discos menos uno: con 4 discos de 4 TB tenés 12 TB útiles de 16 TB brutos, un 75% de aprovechamiento, y tolerás la falla de un disco. Cuantos más discos sumes, mejor la eficiencia, pero más riesgosa la reconstrucción.',
    },
    {
      q: '¿Cuál es la diferencia entre RAID 5, RAID 6 y RAID 10?',
      a: 'RAID 5 reserva el equivalente a un disco para paridad y tolera una falla. RAID 6 reserva dos y tolera dos fallas simultáneas, a costa de escrituras más lentas. RAID 10 espeja pares de discos y después los agrupa: deja útil la mitad del arreglo, pero reconstruye rapidísimo porque sólo copia el espejo. Para discos de 8 TB o más, RAID 6 o RAID 10 son la recomendación habitual.',
    },
    {
      q: '¿Cuántos discos puedo perder sin perder los datos?',
      a: 'RAID 0, ninguno: un solo disco muerto se lleva todo. RAID 1, todos menos uno. RAID 5, uno. RAID 6, dos. RAID 10 garantiza uno; puede aguantar más sólo si las fallas caen en espejos distintos, y muere si se van los dos discos del mismo espejo.',
    },
    {
      q: '¿El RAID reemplaza al backup?',
      a: 'No. El RAID protege contra la falla física de un disco y nada más. Un borrado por error, un ransomware, un corte de luz que corrompe el sistema de archivos o un robo del gabinete afectan a todos los discos por igual. La regla práctica sigue siendo 3-2-1: tres copias, en dos medios distintos, una fuera del edificio.',
    },
    {
      q: '¿Qué es un gibibyte y por qué nadie lo usa?',
      a: 'Es la unidad binaria oficial definida por la norma IEC 80000-13: 1 GiB = 2³⁰ bytes = 1.073.741.824 bytes. Se creó justamente para terminar con la ambigüedad del "GB", pero llegó cuando la industria ya tenía tres décadas de costumbre. Linux y algunos gestores de archivos la muestran; Windows sigue escribiendo "GB" para valores binarios.',
    },
    {
      q: '¿Por qué la RAM sí coincide con lo que dice la caja?',
      a: 'Porque la memoria se direcciona en potencias de 2 por diseño físico: un módulo de 8 GB son literalmente 8 GiB, o sea 8.589.934.592 bytes. Los discos no tienen esa restricción, así que los fabricantes usan el prefijo decimal, que además les deja poner un número más grande en la caja.',
    },
  ],

  sources: [
    {
      name: 'IEC 80000-13 — Information science and technology (prefijos binarios kibi, mebi, gibi)',
      url: 'https://www.iso.org/standard/31898.html',
      publisher: 'ISO / IEC',
      date: '2008',
    },
    {
      name: 'Prefixes for binary multiples',
      url: 'https://physics.nist.gov/cuu/Units/binary.html',
      publisher: 'NIST',
    },
    {
      name: 'Prefixes for binary multiples (SI y binario)',
      url: 'https://www.iec.ch/si/binary.htm',
      publisher: 'International Electrotechnical Commission',
    },
    {
      name: 'Why does my hard drive report less capacity than indicated on the drive label?',
      url: 'https://www.seagate.com/support/kb/why-does-my-hard-drive-report-less-capacity-than-indicated-on-the-drives-label-172191en/',
      publisher: 'Seagate',
    },
    {
      name: 'SNIA Dictionary — RAID levels, striping, mirroring y parity',
      url: 'https://www.snia.org/education/dictionary',
      publisher: 'SNIA',
    },
    {
      name: "What's the diff: RAID levels explained",
      url: 'https://www.backblaze.com/blog/whats-the-diff-raid-levels/',
      publisher: 'Backblaze',
    },
  ],

  replaces: [
    '/calculadora-almacenamiento-bytes-kb-mb-gb-tb',
    '/calculadora-conversor-bits-a-bytes',
    '/calculadora-conversor-kb-a-mb',
    '/calculadora-conversor-mb-a-gb',
    '/calculadora-conversor-tb-a-gb',
    '/calculadora-raid-almacenamiento-util-discos',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-tamano-archivo-conversor',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Factores a bytes.
 *  - SI: los de `almacenamientoBytesKbMbGbTb` (1e3, 1e6, 1e9, 1e12) más el bit
 *    (1/8, el factor 0,125 de `conversorBitsABytes` invertido).
 *  - IEC: potencias de 1.024.
 */
export const FACTORES = {
  decimal: { bits: 0.125, bytes: 1, kb: 1e3, mb: 1e6, gb: 1e9, tb: 1e12 },
  binaria: { bits: 0.125, bytes: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 },
} as const;

/** Nombre corto de cada unidad, para el subtítulo. */
export const NOMBRES: Record<string, { si: string; iec: string }> = {
  bits: { si: 'bits', iec: 'bits' },
  bytes: { si: 'bytes', iec: 'bytes' },
  kb: { si: 'KB', iec: 'KiB' },
  mb: { si: 'MB', iec: 'MiB' },
  gb: { si: 'GB', iec: 'GiB' },
  tb: { si: 'TB', iec: 'TiB' },
};

/**
 * Niveles de RAID, calcados de `raidAlmacenamientoUtilDiscos`.
 *  - min / par: validaciones del original.
 *  - discosUtiles: cuántos discos de capacidad quedan útiles, expresado como
 *    `n * factorN + offset` (así el objeto viaja por define:vars sin funciones).
 *  - tol / tolTodosMenosUno: discos que pueden fallar (en RAID 10 el original
 *    devuelve 1, el piso garantizado; ver nota del hub).
 */
export interface RaidNivel {
  nombre: string;
  min: number;
  par?: boolean;
  /** discosUtiles = n * factorN + offset */
  factorN: number;
  offset: number;
  /** Tolerancia fija. Si `tolTodosMenosUno`, se usa n - 1. */
  tol: number;
  tolTodosMenosUno?: boolean;
  nota: string;
}

export const RAID: Record<string, RaidNivel> = {
  '0': {
    nombre: 'RAID 0 (stripe)',
    min: 2,
    factorN: 1,
    offset: 0,
    tol: 0,
    nota: 'aprovecha todo el espacio y no tolera ninguna falla.',
  },
  '1': {
    nombre: 'RAID 1 (espejo)',
    min: 2,
    factorN: 0,
    offset: 1,
    tol: 0,
    tolTodosMenosUno: true,
    nota: 'útil = un solo disco, sin importar cuántos sumes.',
  },
  '5': {
    nombre: 'RAID 5 (paridad simple)',
    min: 3,
    factorN: 1,
    offset: -1,
    tol: 1,
    nota: 'pierde el equivalente a un disco y tolera una falla.',
  },
  '6': {
    nombre: 'RAID 6 (paridad doble)',
    min: 4,
    factorN: 1,
    offset: -2,
    tol: 2,
    nota: 'pierde dos discos de capacidad y tolera dos fallas.',
  },
  '10': {
    nombre: 'RAID 10 (espejo + stripe)',
    min: 4,
    par: true,
    factorN: 0.5,
    offset: 0,
    tol: 1,
    nota: 'deja útil la mitad del arreglo y reconstruye rápido.',
  },
};
