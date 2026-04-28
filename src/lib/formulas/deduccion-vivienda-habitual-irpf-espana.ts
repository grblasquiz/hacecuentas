export interface Inputs {
  anio_compra: number;
  cantidades_pagadas: number;
  porcentaje_titularidad: number;
  comunidad_autonoma: string;
}

export interface Outputs {
  tiene_derecho: string;
  base_deduccion: number;
  deduccion_estatal: number;
  deduccion_autonomica: number;
  deduccion_total: number;
  nota_regimen: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 (Disposición Transitoria 18.ª Ley IRPF, AEAT) ---
  const LIMITE_BASE = 9040; // Límite máximo base deducción anual, art. DT18 Ley 35/2006
  const TIPO_ESTATAL = 0.075; // 7,5% tramo estatal, DT18 Ley IRPF
  const TIPO_AUTONOMICO_GENERAL = 0.075; // 7,5% tramo autonómico general

  // Tipos autonómicos especiales conocidos (estimaciones orientativas para forales)
  // Fuente: Haciendas Forales de Navarra y País Vasco
  const TIPOS_AUTONOMICOS: Record<string, number> = {
    andalucia: 0.075,
    aragon: 0.075,
    asturias: 0.075,
    baleares: 0.075,
    canarias: 0.075,
    cantabria: 0.075,
    castilla_la_mancha: 0.075,
    castilla_leon: 0.075,
    cataluna: 0.075,
    extremadura: 0.075,
    galicia: 0.075,
    la_rioja: 0.075,
    madrid: 0.075,
    murcia: 0.075,
    navarra: 0.09, // Régimen foral Navarra: estimación orientativa ~18% total
    pais_vasco: 0.09, // Régimen foral PV: estimación orientativa ~18% total
    valencia: 0.075,
    ceuta: 0.075,
    melilla: 0.075,
  };

  // Notas especiales por comunidad
  const NOTAS_CCAA: Record<string, string> = {
    navarra:
      'Régimen foral de Navarra: los porcentajes y límites son distintos al régimen común. Esta cifra es orientativa. Consulta la Hacienda Foral de Navarra para datos exactos.',
    pais_vasco:
      'Régimen foral del País Vasco: los porcentajes y límites difieren del régimen común (hasta un 18% sobre base superior). Cifra orientativa. Consulta la Diputación Foral correspondiente.',
    valencia:
      'Comunitat Valenciana: verifica en la Conselleria d\'Hisenda si el tramo autonómico está vigente para tu ejercicio, ya que ha sufrido modificaciones en ejercicios recientes.',
  };

  // --- Validaciones de entrada ---
  const anioCompra = Math.floor(i.anio_compra ?? 2010);
  const cantidadesPagadas = Math.max(0, i.cantidades_pagadas ?? 0);
  const titularidad = Math.min(100, Math.max(0, i.porcentaje_titularidad ?? 100));
  const ccaa = (i.comunidad_autonoma ?? 'madrid').toLowerCase();

  // --- Comprobación régimen transitorio ---
  // Solo hipotecas con pagos iniciados ANTES del 1 de enero de 2013
  const tieneDerechoBoolean = anioCompra <= 2012;

  if (!tieneDerechoBoolean) {
    return {
      tiene_derecho:
        'No aplica. Solo pueden acogerse al régimen transitorio quienes compraron o iniciaron pagos antes del 1 de enero de 2013 (Ley 16/2012).',
      base_deduccion: 0,
      deduccion_estatal: 0,
      deduccion_autonomica: 0,
      deduccion_total: 0,
      nota_regimen:
        'Las adquisiciones de vivienda habitual desde el 1 de enero de 2013 no generan derecho a deducción en el IRPF estatal.',
    };
  }

  // --- Cálculo base de deducción ---
  // Cantidades proporcionales a la titularidad
  const cantidadesPropias = cantidadesPagadas * (titularidad / 100);
  // Base limitada al máximo legal de 9.040 €
  const baseDeduccion = Math.min(cantidadesPropias, LIMITE_BASE);

  // --- Cálculo deducciones ---
  const deduccionEstatal = parseFloat((baseDeduccion * TIPO_ESTATAL).toFixed(2));

  const tipoAutonomico = TIPOS_AUTONOMICOS[ccaa] ?? TIPO_AUTONOMICO_GENERAL;
  const deduccionAutonomica = parseFloat((baseDeduccion * tipoAutonomico).toFixed(2));

  const deduccionTotal = parseFloat((deduccionEstatal + deduccionAutonomica).toFixed(2));

  // --- Nota de régimen ---
  let notaRegimen = NOTAS_CCAA[ccaa] ?? '';

  if (!notaRegimen) {
    if (cantidadesPropias > LIMITE_BASE) {
      notaRegimen = `Has superado el límite de 9.040 € (cantidades propias: ${cantidadesPropias.toFixed(2).replace('.', ',')} €). Solo se computan 9.040 € como base máxima de deducción.`;
    } else if (cantidadesPropias < LIMITE_BASE) {
      const margen = (LIMITE_BASE - cantidadesPropias).toFixed(2).replace('.', ',');
      notaRegimen = `Podrías incrementar la base de deducción en hasta ${margen} € adicionales antes de alcanzar el límite legal de 9.040 €.`;
    } else {
      notaRegimen = 'Has alcanzado exactamente el límite máximo de 9.040 € de base de deducción. Deducción máxima posible aplicada.';
    }
  }

  const tieneDerechoTexto =
    'Sí. El año de compra (' +
    anioCompra +
    ') es anterior a 2013. Puedes aplicar el régimen transitorio de deducción por vivienda habitual.';

  return {
    tiene_derecho: tieneDerechoTexto,
    base_deduccion: parseFloat(baseDeduccion.toFixed(2)),
    deduccion_estatal: deduccionEstatal,
    deduccion_autonomica: deduccionAutonomica,
    deduccion_total: deduccionTotal,
    nota_regimen: notaRegimen,
  };
}
