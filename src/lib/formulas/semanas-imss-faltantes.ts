/**
 * Calculadora de semanas IMSS faltantes para pensión
 * Ley 97 (2026): 875 semanas (reforma 2020 en transición, llega a 1000 en 2031+)
 * Ley 73: 500 semanas
 */

export interface Inputs {
  semanasActuales: number;
  añoJubilacion?: number;
  semanasPorAno?: number;
  ley?: '97' | '73' | 97 | 73;
  // retro-compat
  semanasCotizadasActuales?: number;
  edad?: number;
}

export interface Outputs {
  semanasFaltantes: number;
  requisitoAplicable: number;
  añoCompletas: number;
  estaListo: string;
  aniosFaltan: number;
  porcentajeAvance: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

function requisitoLey97(anio: number): number {
  const table: Record<number, number> = {
    2021: 750, 2022: 775, 2023: 800, 2024: 825, 2025: 850,
    2026: 875, 2027: 900, 2028: 925, 2029: 950, 2030: 975,
  };
  if (anio <= 2020) return 750;
  if (anio >= 2031) return 1000;
  return table[anio] ?? 875;
}

export function semanasImssFaltantes(i: Inputs): Outputs {
  const semanas = Number(i.semanasActuales ?? i.semanasCotizadasActuales);
  const anioJubilacion = Number(i.añoJubilacion ?? 2030);
  const semanasPorAno = Number(i.semanasPorAno ?? 52);
  const ley = String(i.ley ?? '97');

  if (semanas === undefined || semanas === null || isNaN(semanas) || semanas < 0) {
    throw new Error('Ingresá las semanas cotizadas actuales');
  }

  const requisito = ley === '73' ? 500 : requisitoLey97(anioJubilacion);
  const semanasFaltan = Math.max(0, requisito - semanas);
  const aniosFaltan = Number((semanasFaltan / 52).toFixed(2));
  const porcentajeAvance = Number(Math.min(100, (semanas / requisito) * 100).toFixed(2));

  // Año en que las completa: desde el año actual (2026) sumando semanasFaltan/semanasPorAno
  const anioBase = 2026;
  const anioCompletas = semanasPorAno > 0
    ? anioBase + Math.ceil(semanasFaltan / semanasPorAno)
    : anioBase;

  const estaListoBool = semanasFaltan === 0 || anioCompletas <= anioJubilacion;

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (semanasFaltan === 0) {
    insightText = `Ya cumpliste el requisito de **${requisito} semanas** (Ley ${ley}). Tu avance es del **100%**: podés iniciar el trámite de pensión.`;
    insightTone = 'good';
  } else if (estaListoBool) {
    insightText = `Tenés un avance del **${porcentajeAvance}%**: te faltan **${semanasFaltan} semanas** (~${aniosFaltan} años) y las completarías en **${anioCompletas}**, a tiempo para jubilarte en ${anioJubilacion}.`;
    insightTone = 'good';
  } else {
    insightText = `Avance del **${porcentajeAvance}%**: te faltan **${semanasFaltan} semanas** (~${aniosFaltan} años) y recién las completarías en **${anioCompletas}**, después de tu meta de ${anioJubilacion}. Conviene seguir cotizando.`;
    insightTone = 'warn';
  }

  const _insight = {
    title: 'Tu camino a la pensión',
    text: insightText,
    tone: insightTone,
    icon: '🏖️',
  };

  // Gauge: % de avance hacia las semanas requeridas
  const _chart = {
    type: 'scale',
    marker: porcentajeAvance,
    markerLabel: `${porcentajeAvance}%`,
    min: 0,
    segments: [
      { nombre: 'Lejos', max: 50, color: '#fecaca', colorDark: '#991b1b' },
      { nombre: 'En camino', max: 80, color: '#fde68a', colorDark: '#92400e' },
      { nombre: 'Casi', max: 99.99, color: '#bfdbfe', colorDark: '#1e40af' },
      { nombre: 'Completo', max: 100.01, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: `Avance hacia la pensión: ${porcentajeAvance}% de ${requisito} semanas`,
  };

  return {
    semanasFaltantes: semanasFaltan,
    requisitoAplicable: requisito,
    añoCompletas: anioCompletas,
    estaListo: estaListoBool ? 'Sí alcanza' : 'No alcanza — seguí cotizando',
    aniosFaltan,
    porcentajeAvance,
    mensaje: semanasFaltan === 0
      ? `Ya tenés las ${requisito} semanas requeridas (Ley ${ley}). Avance: ${porcentajeAvance}%.`
      : `Te faltan ${semanasFaltan} semanas (~${aniosFaltan} años) para Ley ${ley} (requisito ${requisito}). Las completás en ${anioCompletas}.`,
    _insight,
    _chart,
  };
}
