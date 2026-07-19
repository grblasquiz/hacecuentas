/**
 * Datos fiscales y laborales de CHILE 2026 — tabla maestra única.
 * Patrón hermano de peru-2026.ts / ecuador-2026.ts / colombia-2026.ts / mexico-2026.ts.
 * Verificado 2026-07-18 vía fuentes oficiales:
 * - IMM 2026: Ley 21.830 (D.O. 22-06-2026) → $553.553 desde 01-may-2026
 *   (histórico: $539.000 ene–abr 2026 Ley 21.751; $529.000 may-2025).
 * - Topes imponibles 2026: Superintendencia de Pensiones (definitivos desde remuneraciones de feb-2026):
 *   AFP/salud/Ley de accidentes 90,0 UF; seguro de cesantía 135,2 UF.
 * - Cotizaciones legales: DL 3.500 (AFP 10%), Ley 18.469/18.933 (salud 7%), Ley 19.728 (AFC).
 * - Impuesto de segunda categoría: Art. 43 N°1 LIR (exento hasta 13,5 UTM/mes).
 * - Gratificación legal Art. 50 CT: 25% de lo devengado con tope 4,75 IMM al año.
 * UF/UTM/UTA viven en src/data/live/chile.json (mindicador.cl / Banco Central, refresco automático).
 * Moneda: Peso chileno (CLP, "$").
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-07-18';

export const CHILE_2026 = {
  anio: 2026,

  // ── Ingreso mínimo mensual — Ley 21.830, vigente desde 01-may-2026 ──
  // Mismo valor que IMM_MAYO_2026.general; esta es la fuente vigente para las fórmulas.
  // Histórico ene–abr 2026 ($539.000, Ley 21.751) → immHistoricoEneAbr2026.
  imm: 553_553,                 // trabajadores de 18 a 65 años (Ley 21.830)
  immMenores18Mayores65: 412_938,
  immNoRemuneracional: 356_815, // para fines no remuneracionales
  immHistoricoEneAbr2026: 539_000, // valor previo (Ley 21.751), ene–abr 2026

  // ── Topes imponibles 2026 — Superintendencia de Pensiones (desde feb-2026, en UF) ──
  topeImponibleAfpUf: 90.0,     // AFP, salud e ISL/mutual (era 87,8 UF en 2025)
  topeImponibleCesantiaUf: 135.2,

  // ── Cotizaciones del trabajador dependiente ──
  afpObligatorio: 0.10,         // DL 3.500 — aporte obligatorio al fondo
  // La comisión de la AFP se suma al 10% y varía por administradora (~0,49% a ~1,45%).
  saludFonasa: 0.07,            // 7% legal (Fonasa; en isapre el plan puede costar más)
  afcTrabajadorIndefinido: 0.006, // 0,6% seguro de cesantía contrato indefinido (Ley 19.728)

  // ── Cotizaciones del empleador (seguro de cesantía, Ley 19.728) ──
  afcEmpleadorIndefinido: 0.024, // 2,4% (contrato indefinido)
  afcEmpleadorPlazoFijo: 0.03,   // 3% (plazo fijo; el trabajador no cotiza)

  // ── Impuesto único de segunda categoría — Art. 43 N°1 LIR (tramos en UTM, mensual) ──
  segundaCategoriaExentoUtm: 13.5, // renta líquida imponible ≤ 13,5 UTM → exenta
  segundaCategoriaTasaMaxima: 0.40,

  // ── Gratificación legal — Art. 50 Código del Trabajo ──
  gratificacionArt50: {
    porcentaje: 0.25,           // 25% de lo devengado en el ejercicio…
    topeImmAnual: 4.75,         // …con tope de 4,75 ingresos mínimos mensuales al año
  },

  // ── IVA — DL 825 ──
  iva: 0.19,

  moneda: 'CLP',
  simbolo: '$',
} as const;

/** Formatea un monto en pesos chilenos (es-CL), sin decimales. */
export function fmtCLP(n: number): string {
  return '$' + new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(Math.round(n));
}

// ═══════════════════════════════════════════════════════════════════════════
// Agregados 2026-07-18 — fábrica calcs CL (fuentes verificadas por WebFetch)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ingreso mínimo mensual VIGENTE desde 01-may-2026 — Ley 21.830 (D.O. 22-jun-2026).
 * Fuente: Dirección del Trabajo — https://www.dt.gob.cl/portal/1628/w3-article-60141.html
 * Nota: desde 2026-07-18 CHILE_2026.imm también apunta a este valor ($553.553);
 * este objeto conserva `anteriorGeneral` para la calc de reajuste salarial.
 */
export const IMM_MAYO_2026 = {
  general: 553_553,             // trabajadores de 18 a 65 años, desde 01-may-2026
  menores18Mayores65: 412_938,
  noRemuneracional: 356_815,
  anteriorGeneral: 539_000,     // vigente ene–abr 2026 (Ley 21.751)
  vigenciaDesde: '2026-05-01',
  ley: 'Ley 21.830 (D.O. 22-06-2026)',
} as const;

/**
 * Condonación inicial de deudas educativas (CAE) — plan de reorganización FES.
 * Proyecto de ley en tramitación 2026. Fórmula oficial Mineduc:
 * condonación inicial UF = base según perfil × (cuotas pagadas ÷ cuotas totales + 1).
 * Fuente: https://fes.mineduc.cl/plan-de-reorganizacion.html
 */
export const FES_CONDONACION_2026 = {
  baseUf: {
    noTituladoAlDia: 20,
    tituladoAlDia: 30,
    noTituladoMoroso: 40,
    tituladoMoroso: 60,
  },
  // Para el saldo restante: 25% adicional condonado si se paga el 75% en hasta 12 cuotas.
  pagoAnticipado: { condonacionPct: 0.25, pagoRequeridoPct: 0.75, cuotasMax: 12 },
} as const;

/**
 * Subsidio de Arriendo MINVU — llamado 2026 (postulación 07-jul a 07-ago-2026).
 * Fuente: https://www.minvu.gob.cl/noticia/minvu-anuncia-la-proxima-apertura-del-llamado-al-subsidio-de-arriendo-de-2026/
 * Zonas especiales (tope 4,9 UF / arriendo 13 UF): Arica y Parinacota, Tarapacá,
 * Antofagasta, Atacama, Metropolitana, Aysén y Magallanes.
 */
export const SUBSIDIO_ARRIENDO_2026 = {
  totalUf: 170,
  topeMensualUf: 4.2,
  topeMensualUfZonaEspecial: 4.9,
  arriendoMaxUf: 11,
  arriendoMaxUfZonaEspecial: 13,
  ahorroMinimoUf: 4,
  ingresoMinUf: 7,
  ingresoMaxUf: 25,
  ufExtraPorIntegranteDesde4to: 8, // el tope de ingreso suma 8 UF por integrante adicional después del tercero
  rshTramoMax: 70,                 // hasta el tramo del 70% del RSH
  postulacion: { desde: '2026-07-07', hasta: '2026-08-07' },
} as const;

/**
 * Beneficio por Años Cotizados — reforma previsional (Seguro Social), pago desde ene-2026.
 * 0,1 UF por cada 12 meses cotizados, tope 2,5 UF (25 años / 300 meses).
 * Fuente: https://www.chileatiende.gob.cl/fichas/130450-beneficio-por-anos-cotizados
 */
export const BENEFICIO_ANIOS_COTIZADOS_2026 = {
  ufPorAnioCotizado: 0.1,
  topeUf: 2.5,
  aniosTope: 25,
  mesesMinMujer: 120,   // sube gradualmente hasta 180 meses en 2036 (desde ene-2028: 132)
  mesesMinHombre: 240,
  edadMinima: 65,
} as const;

/**
 * Franquicias e impuestos de viajero — Servicio Nacional de Aduanas 2026.
 * Sobre lo que se declara: 6% derecho ad valorem sobre CIF + 19% IVA sobre (CIF + derecho);
 * +3% de recargo si el artículo es usado. Declaración simplificada hasta US$1.500 FOB.
 * Fuentes: https://www.aduana.cl/pago-impuestos-viajeros-y-viajeras/aduana/2018-12-28/084707.html
 *          https://www.aduana.cl/equipaje-de-viajero-y-viajera/aduana/2018-12-28/083959.html
 */
export const ADUANA_VIAJERO_2026 = {
  derechoAdValorem: 0.06,
  iva: 0.19,
  recargoUsado: 0.03,
  dutyFreeMaxUsd: 675,
  obsequiosMaxUsd: 300,
  declaracionSimplificadaMaxUsd: 1500,
} as const;

/**
 * Tablas de transformación NEM → puntaje (escala 100–1000) — DEMRE, Proceso de Admisión 2026.
 * Índice 0 = promedio 4,00 · índice 300 = promedio 7,00 (paso 0,01).
 * Grupo A: Humanístico-Científica diurna · Grupo B: HC de adultos (vespertino/nocturno) ·
 * Grupo C: Técnico-Profesional.
 * Fuente: https://demre.cl/paes/factores-seleccion/tabla-transformacion-nem-grupo-a (y grupos B/C)
 */
export const NEM_DEMRE_2026: Record<'A' | 'B' | 'C', number[]> = {
  A: [
    100, 103, 105, 109, 112, 115, 118, 122, 124, 128, 131, 135, 137, 140, 144, 146, 150, 153, 157, 159,
    163, 166, 169, 172, 176, 178, 181, 185, 187, 191, 194, 198, 200, 204, 207, 211, 213, 216, 220, 222,
    226, 229, 232, 235, 239, 241, 245, 248, 252, 254, 257, 261, 263, 267, 270, 274, 276, 280, 283, 286,
    289, 292, 295, 298, 302, 304, 308, 311, 315, 317, 321, 324, 328, 330, 333, 337, 339, 343, 346, 349,
    352, 356, 358, 362, 365, 367, 371, 374, 378, 380, 384, 387, 391, 393, 397, 400, 403, 406, 409, 412,
    415, 419, 421, 425, 428, 432, 434, 438, 441, 443, 447, 450, 454, 456, 460, 463, 466, 469, 473, 475,
    479, 482, 484, 488, 491, 495, 497, 501, 504, 508, 510, 514, 517, 519, 523, 526, 529, 532, 536, 538,
    542, 545, 549, 551, 555, 558, 560, 564, 567, 569, 572, 574, 577, 580, 583, 586, 589, 591, 594, 596,
    599, 603, 605, 608, 610, 613, 617, 619, 622, 625, 628, 631, 634, 636, 639, 643, 645, 648, 650, 654,
    657, 659, 662, 664, 668, 671, 673, 676, 680, 682, 685, 688, 690, 694, 697, 699, 702, 706, 708, 711,
    713, 716, 720, 722, 725, 727, 731, 734, 736, 739, 742, 745, 748, 751, 753, 757, 760, 762, 765, 767,
    771, 774, 776, 779, 783, 785, 788, 790, 793, 797, 799, 802, 805, 808, 811, 814, 816, 819, 823, 825,
    828, 830, 834, 837, 839, 842, 844, 848, 851, 853, 856, 860, 862, 865, 868, 870, 874, 877, 879, 882,
    886, 888, 891, 893, 896, 900, 902, 905, 907, 911, 914, 916, 919, 922, 925, 928, 931, 933, 937, 940,
    942, 945, 947, 951, 954, 956, 959, 963, 965, 968, 970, 973, 977, 979, 982, 985, 988, 991, 994, 996,
    1000,
  ],
  B: [
    100, 103, 105, 109, 112, 115, 118, 122, 124, 128, 131, 135, 137, 141, 144, 148, 150, 154, 157, 160,
    163, 167, 169, 173, 176, 180, 182, 186, 189, 193, 195, 199, 202, 205, 208, 212, 214, 218, 221, 225,
    227, 231, 234, 236, 240, 243, 247, 249, 253, 256, 259, 262, 266, 268, 272, 275, 279, 281, 285, 288,
    292, 294, 298, 301, 304, 307, 311, 313, 317, 320, 324, 326, 330, 333, 337, 339, 343, 346, 349, 352,
    356, 358, 362, 365, 369, 371, 374, 378, 380, 384, 387, 391, 393, 397, 400, 403, 406, 410, 412, 416,
    419, 423, 425, 429, 432, 436, 438, 442, 445, 448, 451, 455, 457, 461, 464, 468, 470, 474, 477, 481,
    483, 487, 490, 493, 496, 500, 502, 505, 509, 511, 515, 518, 522, 524, 528, 531, 535, 537, 541, 544,
    547, 550, 554, 556, 560, 563, 567, 569, 572, 574, 577, 580, 582, 585, 587, 590, 592, 595, 598, 600,
    604, 607, 609, 612, 614, 618, 621, 623, 626, 628, 632, 635, 637, 640, 643, 646, 649, 652, 654, 657,
    661, 663, 666, 668, 671, 675, 677, 680, 682, 685, 689, 691, 694, 697, 699, 703, 706, 708, 711, 713,
    717, 720, 722, 725, 727, 731, 734, 736, 739, 742, 745, 748, 751, 753, 756, 760, 762, 765, 767, 770,
    774, 776, 779, 781, 784, 788, 790, 793, 796, 798, 802, 805, 807, 810, 812, 816, 819, 821, 824, 826,
    830, 833, 835, 838, 841, 844, 847, 850, 852, 855, 859, 861, 864, 866, 869, 873, 875, 878, 880, 883,
    887, 889, 892, 895, 897, 901, 904, 906, 909, 911, 915, 918, 920, 923, 925, 929, 932, 934, 937, 940,
    943, 946, 949, 951, 954, 958, 960, 963, 965, 968, 972, 974, 977, 979, 982, 986, 988, 991, 994, 996,
    1000,
  ],
  C: [
    100, 103, 105, 109, 112, 115, 118, 122, 124, 128, 131, 135, 137, 141, 144, 148, 150, 154, 157, 160,
    163, 166, 169, 172, 176, 178, 182, 185, 189, 191, 195, 198, 202, 204, 208, 211, 214, 217, 221, 223,
    226, 230, 232, 236, 239, 243, 245, 249, 252, 256, 258, 262, 265, 268, 271, 275, 277, 281, 284, 286,
    290, 293, 297, 299, 303, 306, 310, 312, 316, 319, 322, 325, 329, 331, 335, 338, 342, 344, 347, 351,
    353, 357, 360, 364, 366, 370, 373, 376, 379, 383, 385, 389, 392, 396, 398, 402, 405, 409, 411, 414,
    418, 420, 424, 427, 430, 433, 437, 439, 443, 446, 450, 452, 456, 459, 463, 465, 469, 472, 474, 478,
    481, 484, 487, 491, 493, 497, 500, 504, 506, 510, 513, 517, 519, 523, 526, 529, 532, 535, 538, 541,
    545, 547, 551, 554, 558, 560, 564, 567, 571, 572, 574, 577, 580, 582, 585, 587, 590, 592, 595, 598,
    601, 604, 607, 609, 613, 616, 618, 621, 623, 627, 630, 632, 635, 637, 641, 644, 646, 649, 652, 655,
    658, 661, 663, 667, 670, 672, 675, 677, 681, 684, 686, 689, 691, 695, 698, 700, 703, 707, 709, 712,
    715, 717, 721, 724, 726, 729, 731, 735, 738, 740, 743, 747, 749, 752, 754, 757, 761, 763, 766, 769,
    771, 775, 778, 780, 783, 787, 789, 792, 794, 797, 801, 803, 806, 808, 811, 815, 817, 820, 823, 825,
    829, 832, 834, 837, 841, 843, 846, 848, 851, 855, 857, 860, 862, 865, 869, 871, 874, 877, 880, 883,
    886, 888, 891, 895, 897, 900, 902, 905, 909, 911, 914, 916, 920, 923, 925, 928, 931, 934, 937, 940,
    942, 945, 949, 951, 954, 956, 960, 963, 965, 968, 970, 974, 977, 979, 982, 985, 988, 991, 994, 996,
    1000,
  ],
};
