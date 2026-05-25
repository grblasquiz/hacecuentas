/**
 * Calculadora PNC Vejez (70 años) vs PUAM (65 años) — Argentina
 *
 * Marco legal:
 *   - PNC Vejez: Decreto-Ley 18.910/71 + Ley 13.478 — 70 años, sin recursos,
 *     sin parientes obligados a alimentos en condición de prestarlos.
 *     Importe: 70% del haber mínimo (Decreto 432/97).
 *   - PUAM: Ley 27.260 (2016), art. 13 — 65 años, sin jubilación,
 *     residencia 10 años continuos. Importe: 80% del haber mínimo.
 *   - Jubilación común: 60 mujer / 65 hombre, 30 años aportes.
 *
 * Esta calculadora compara cuál beneficio conviene tramitar según
 * edad, aportes y situación familiar.
 */

export type EdadRange = 'menor65' | '65a69' | '70omas';

export interface PncVejez70AnosInputs {
  edadActual: number;
  tienesAportes: boolean | string;
  aniosAportes: number;
  tienesFamiliarObligado: boolean | string;
  ingresoFamilia: number;
  haberMinimoVigente: number;
}

export interface PncVejez70AnosOutputs {
  beneficioRecomendado: string;
  importeEstimado: number;
  edadInicio: number;
  condicionesParaTramite: string[];
  mensaje: string;
  comparativa: {
    puam: { elegible: boolean; importe: number; edadInicio: number };
    pncVejez: { elegible: boolean; importe: number; edadInicio: number };
    jubilacionComun: { elegible: boolean; importe: number };
  };
  porcentajeHaberMinimo: number;
}

function toBool(v: boolean | string): boolean {
  return v === true || v === 'true' || v === 'si' || v === 'Si' || v === 'sí';
}

export function pncVejez70Anos(inputs: PncVejez70AnosInputs): PncVejez70AnosOutputs {
  const edad = Math.max(0, Math.floor(Number(inputs.edadActual) || 0));
  const tieneAportes = toBool(inputs.tienesAportes);
  const aportes = Math.max(0, Number(inputs.aniosAportes) || 0);
  const familiarObligado = toBool(inputs.tienesFamiliarObligado);
  const ingresoFamilia = Math.max(0, Number(inputs.ingresoFamilia) || 0);
  const haberMinimo = Math.max(0, Number(inputs.haberMinimoVigente) || 0);

  if (!haberMinimo || haberMinimo <= 0) {
    throw new Error('Ingresá el haber mínimo jubilatorio vigente (consultá ANSES)');
  }
  if (!edad || edad <= 0) {
    throw new Error('Ingresá la edad actual');
  }

  // Importes según ley vigente
  const importePuam = haberMinimo * 0.8; // 80% (Ley 27.260)
  const importePncVejez = haberMinimo * 0.7; // 70% (Decreto 432/97)
  const importeJubComun = haberMinimo; // mínimo 100% si solo llegás al haber mínimo

  // Elegibilidad PUAM (65+, sin jubilación, residencia >= 10 años)
  const puamElegible = edad >= 65;

  // Elegibilidad PNC Vejez (70+, sin recursos, sin familiares obligados con capacidad)
  // El umbral de "familiar con capacidad" típicamente se evalúa caso por caso;
  // tomamos como heurística que el ingreso familiar > 3× haber mínimo descalifica
  const familiarBloquea = familiarObligado && ingresoFamilia > 3 * haberMinimo;
  const pncVejezElegible = edad >= 70 && !familiarBloquea;

  // Jubilación común con moratoria 27.705: edad legal + alguna posibilidad de comprar aportes
  // Asumimos genérico: si tiene 30+ años aportes, jub. común sin moratoria
  const jubComunSinMoratoriaElegible = edad >= 65 && tieneAportes && aportes >= 30;

  // Recomendación
  let beneficioRecomendado = '';
  let importeEstimado = 0;
  let edadInicio = 0;
  const condicionesParaTramite: string[] = [];
  let mensaje = '';

  if (jubComunSinMoratoriaElegible) {
    beneficioRecomendado = 'Jubilación ordinaria (Ley 24.241)';
    importeEstimado = importeJubComun;
    edadInicio = 65;
    condicionesParaTramite.push(
      '30 años de aportes completos certificados por ANSES',
      'Edad legal alcanzada (60 mujer / 65 hombre)',
      'Trámite en ANSES con certificación de servicios (Form. PS 6.2)',
    );
    mensaje = `Tenés ${aportes} años de aportes y ${edad} años: te conviene tramitar la jubilación ordinaria, que cobra como mínimo el 100% del haber mínimo (no el 70 u 80% como las pensiones no contributivas). Tu haber puede ser mayor si tu sueldo promedio fue alto.`;
  } else if (edad >= 70) {
    // Comparar PUAM vs PNC Vejez a los 70
    if (familiarBloquea) {
      beneficioRecomendado = 'PUAM (Pensión Universal Adulto Mayor)';
      importeEstimado = importePuam;
      edadInicio = 65;
      condicionesParaTramite.push(
        '65 años cumplidos',
        'No estar jubilado/a',
        'Residencia continua en Argentina (10 años para extranjeros)',
      );
      mensaje = `A los 70 años con familiares obligados con capacidad económica, no calificás para PNC Vejez. La PUAM es tu mejor opción: 80% del haber mínimo, vitalicia y compatible con trabajo en relación de dependencia.`;
    } else {
      // Si no hay familiar obligado, PUAM (80%) sigue siendo mejor que PNC Vejez (70%)
      beneficioRecomendado = 'PUAM (mejor que PNC Vejez por importe)';
      importeEstimado = importePuam;
      edadInicio = 65;
      condicionesParaTramite.push(
        '65 años cumplidos (ya superás)',
        'No estar jubilado/a',
        'Residencia continua en Argentina',
        'La PUAM paga 80% del haber mínimo vs 70% de PNC Vejez',
      );
      mensaje = `Aunque tenés 70 años y podrías tramitar PNC Vejez, la PUAM paga más (80% vs 70% del haber mínimo). Te conviene la PUAM, salvo que ya la hayas perdido por no cumplir residencia.`;
    }
  } else if (edad >= 65) {
    beneficioRecomendado = 'PUAM (Pensión Universal Adulto Mayor)';
    importeEstimado = importePuam;
    edadInicio = 65;
    condicionesParaTramite.push(
      '65 años cumplidos',
      'No estar jubilado/a',
      'Residencia continua en Argentina (10 años para extranjeros)',
      'Compatible con trabajo registrado',
    );
    mensaje = `A tu edad (${edad}), la PUAM es el beneficio recomendado: 80% del haber mínimo, vitalicia y se tramita en ANSES con turno previo. Si tenés años de aportes sin certificar, consultá si te conviene la moratoria 27.705 para acceder a una jubilación ordinaria con haber potencialmente mayor.`;
  } else {
    beneficioRecomendado = 'Aún no calificás — esperar / aportar';
    importeEstimado = 0;
    edadInicio = 65;
    condicionesParaTramite.push(
      `Te faltan ${65 - edad} años para PUAM (65)`,
      `Te faltan ${70 - edad} años para PNC Vejez (70)`,
      'Mientras tanto, regularizá aportes para llegar a jubilación ordinaria',
    );
    mensaje = `Tenés ${edad} años: aún no alcanzás la edad mínima para PUAM (65) ni PNC Vejez (70). Te conviene regularizar aportes mediante moratoria (Ley 27.705) para llegar a la edad legal con 30 años computables y acceder a jubilación ordinaria.`;
  }

  const porcentajeHaberMinimo = haberMinimo > 0 ? Math.round((importeEstimado / haberMinimo) * 100) : 0;

  return {
    beneficioRecomendado,
    importeEstimado: Math.round(importeEstimado),
    edadInicio,
    condicionesParaTramite,
    mensaje,
    comparativa: {
      puam: {
        elegible: puamElegible,
        importe: Math.round(importePuam),
        edadInicio: 65,
      },
      pncVejez: {
        elegible: pncVejezElegible,
        importe: Math.round(importePncVejez),
        edadInicio: 70,
      },
      jubilacionComun: {
        elegible: jubComunSinMoratoriaElegible,
        importe: Math.round(importeJubComun),
      },
    },
    porcentajeHaberMinimo,
  };
}
