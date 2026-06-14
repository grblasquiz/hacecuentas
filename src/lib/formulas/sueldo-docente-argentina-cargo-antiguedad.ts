import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
import { aplicarEscalaMensual, MNI_MENSUAL_BASE } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; }
export function sueldoDocenteArgentinaCargoAntiguedad(i: Inputs): Outputs {
  const antig = Number(i.antiguedad) || 0;
  const cargo = String(i.cargo || 'maestro-pri');
  const horas = Number(i.horas) || 0;
  // Piso salarial mínimo docente garantizado por la PARITARIA NACIONAL para 2026:
  // $500.000 (maestro de grado, jornada simple, sin antigüedad). Es un PISO de
  // referencia: los básicos provinciales suelen ser bastante mayores (ej. un
  // maestro de grado real con 25 hs ronda $1.200.000+ en varias provincias).
  // Fuente: paritaria nacional docente 2026.
  const PISO_NACIONAL_JORNADA_SIMPLE = 500_000;
  // Multiplicador por cargo respecto del maestro de grado (jerarquía típica del
  // Estatuto Docente; valores orientativos, varían por provincia).
  const factorCargo: Record<string, number> = {
    'maestro-pri': 1, // maestro de grado / primario
    'prof-sec': 1, // profesor de secundaria (se aproxima por horas cátedra)
    preceptor: 1, // preceptor, cargo simple ~ maestro de grado
    vice: 1.2, // vicedirector +20%
    director: 1.35, // director +35%
  };
  // La jornada simple de referencia equivale a ~20 hs cátedra semanales.
  // Si el usuario carga horas, se prorratea sobre esa base (sin horas => jornada simple).
  const HORAS_JORNADA_SIMPLE = 20;
  const propHoras = horas > 0 ? horas / HORAS_JORNADA_SIMPLE : 1;
  const basico = PISO_NACIONAL_JORNADA_SIMPLE * (factorCargo[cargo] ?? 1) * propHoras;
  // Antigüedad docente: 10% del básico por año (típico hasta cierto tope).
  const plusAntig = basico * 0.1 * antig;
  const bruto = basico + plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const baseGanancias = Math.max(0, bruto - jubilacion - obraSocial - pami - MNI_MENSUAL_BASE);
  const ganancias = aplicarEscalaMensual(baseGanancias).impuesto;
  const neto = bruto - jubilacion - obraSocial - pami - ganancias;
  const sac = bruto / 12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto de bolsillo', value: neto },
      { label: 'Jubilación', value: jubilacion },
      { label: 'Obra social', value: obraSocial },
      { label: 'PAMI', value: pami },
      { label: 'Ganancias', value: ganancias },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto, jubilación, obra social, PAMI y Ganancias.',
  };
  const descTotal = jubilacion + obraSocial + pami + ganancias;
  const pctDesc = bruto > 0 ? (descTotal / bruto) * 100 : 0;
  const fmtAr = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'Sueldo docente (piso nacional de referencia)',
    text: `Partiendo del piso nacional garantizado, el bruto da **${fmtAr(bruto)}** y cobrás **${fmtAr(neto)}** netos tras **${fmtAr(descTotal)}** (${pctDesc.toFixed(0)}%) de descuentos. ${ganancias > 0 ? `Pagás **${fmtAr(ganancias)}** de Ganancias por mes.` : 'No pagás Ganancias: tu sueldo queda por debajo del mínimo no imponible.'} Ojo: los básicos provinciales suelen ser bastante más altos que este piso.`,
    tone: 'neutral' as const,
    icon: '📚',
  };
  return {
    basico: '$' + Math.round(basico).toLocaleString('es-AR'),
    bruto: '$' + bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    neto: '$' + neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    sac: '$' + sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    resumen: `${cargo}: piso nacional ${fmtAr(basico)} con antigüedad ${antig} años → neto ~${fmtAr(neto)}. Piso de referencia (paritaria nacional 2026); los básicos provinciales son mayores.`,
    _chart: chart,
    _insight: insight,
  };
}
