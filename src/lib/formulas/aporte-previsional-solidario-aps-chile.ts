export interface Inputs {
  edad: number;
  pension_actual: number;
  rsh_decil: number;
}

export interface Outputs {
  elegible_aps: boolean;
  pmas_2026: number;
  brecha_pension: number;
  aps_complemento: number;
  pension_total_aps: number;
  motivo_ineligibilidad: string;
  referencias_pgu: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes PGU 2026 — Ley N° 21.419, reajuste +3,45% (IPC ene–dic 2025),
  // vigentes desde el 1 de febrero de 2026.
  // Fuente: Superintendencia de Pensiones (instruye al IPS). La PGU reemplazó al APS
  // desde 2022 y la administra el IPS (no el SII, que es el organismo tributario).
  const PGU_MAX_65_81 = 231732; // CLP/mes, beneficiarios de 65 a 81 años
  const PGU_MAX_82_MAS = 250275; // CLP/mes, beneficiarios de 82 años o más
  const PENSION_BASE_INFERIOR = 789139; // PBI: con pensión base ≤ PBI se recibe el 100% de la PGU
  const PENSION_BASE_SUPERIOR = 1252602; // PBS: con pensión base ≥ PBS no corresponde PGU
  const EDAD_MINIMA = 65;
  const RSH_DECIL_MAX_ELEGIBLE = 9; // 90% más pobre; el decil 10 (10% más rico) queda excluido

  // PGU máxima según tramo de edad
  const pgu_max = i.edad >= 82 ? PGU_MAX_82_MAS : PGU_MAX_65_81;

  // Validaciones de elegibilidad (PGU)
  const errores: string[] = [];

  if (i.edad < EDAD_MINIMA) {
    errores.push(`Edad mínima para la PGU: ${EDAD_MINIMA} años. Tu edad: ${i.edad}.`);
  }

  if (i.rsh_decil > RSH_DECIL_MAX_ELEGIBLE || i.rsh_decil < 1) {
    errores.push(
      `La PGU excluye al 10% más rico (decil 10). ` +
      `Con decil ${i.rsh_decil} no integrás el 90% más pobre (deben ser deciles 1 a ${RSH_DECIL_MAX_ELEGIBLE}).`
    );
  }

  if (i.pension_actual >= PENSION_BASE_SUPERIOR) {
    errores.push(
      `Tu pensión base ($ ${i.pension_actual.toLocaleString('es-CL')}) ` +
      `iguala o supera la Pensión Base Superior ($ ${PENSION_BASE_SUPERIOR.toLocaleString('es-CL')}). ` +
      `Sobre ese monto no corresponde PGU.`
    );
  }

  const elegible = errores.length === 0;

  // Cálculo de la PGU según la pensión base autofinanciada
  let pgu = 0;
  let reduccion = 0;
  if (elegible) {
    if (i.pension_actual <= PENSION_BASE_INFERIOR) {
      // 100% de la PGU máxima
      pgu = pgu_max;
    } else {
      // Tramo decreciente lineal entre PBI y PBS:
      // PGU = PGU_máx × [1 − (PB − PBI) / (PBS − PBI)]
      pgu =
        pgu_max *
        (1 - (i.pension_actual - PENSION_BASE_INFERIOR) / (PENSION_BASE_SUPERIOR - PENSION_BASE_INFERIOR));
    }
    pgu = Math.max(0, pgu);
    reduccion = pgu_max - pgu; // cuánto baja del tope por la pensión base
  }

  const pgu_estimada = Math.round(pgu);
  const reduccionR = Math.round(reduccion);
  const pensionActualR = Math.round(i.pension_actual);
  const pension_total = pensionActualR + pgu_estimada;

  const motivo_ineligibilidad =
    errores.length > 0
      ? errores.join(' | ')
      : 'Cumplís los requisitos de la PGU (estimación referencial 2026).';

  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const referencias_pgu = elegible
    ? `PGU estimada: ${fmtCLP(pgu_estimada)}/mes (tope ${fmtCLP(pgu_max)} para tu tramo de edad). ` +
      `La administra el IPS; trámite y consulta de estado en ChileAtiende (www.chileatiende.gob.cl).`
    : `No cumplís los requisitos de la PGU. ${motivo_ineligibilidad} ` +
      `Verificá tu situación en ChileAtiende (www.chileatiende.gob.cl) o en una sucursal del IPS. ` +
      `PGU máxima de referencia para tu edad: ${fmtCLP(pgu_max)}/mes.`;

  const _insight = elegible
    ? {
        title: 'Tu pensión sube con la PGU',
        text: `Cumplís los requisitos: la **PGU** te suma **${fmtCLP(pgu_estimada)}/mes** sobre tu pensión base de **${fmtCLP(pensionActualR)}**, llevándola a **${fmtCLP(pension_total)}** (tope máximo de la PGU para tu edad: **${fmtCLP(pgu_max)}**).`,
        tone: 'good',
        icon: '👵',
      }
    : {
        title: 'Hoy no calificás para la PGU',
        text: `Con los datos ingresados no accedés a la Pensión Garantizada Universal. Motivo: ${motivo_ineligibilidad}`,
        tone: 'warn',
        icon: '⚠️',
      };

  // Donut sólo si hay complemento real que sumar a la pensión base.
  const _chart = (elegible && pgu_estimada > 0 && pensionActualR >= 0) ? {
    type: 'doughnut',
    slices: [
      { label: 'Pensión base', value: pensionActualR },
      { label: 'Complemento PGU', value: pgu_estimada },
    ],
    prefix: '$',
    centerValue: fmtCLP(pension_total),
    centerLabel: 'pensión total',
    ariaLabel: `Pensión total de ${fmtCLP(pension_total)}: ${fmtCLP(pensionActualR)} de pensión base más ${fmtCLP(pgu_estimada)} de complemento PGU.`,
  } : undefined;

  return {
    elegible_aps: elegible,
    pmas_2026: pgu_max,
    brecha_pension: Math.max(0, reduccionR),
    aps_complemento: pgu_estimada,
    pension_total_aps: pension_total,
    motivo_ineligibilidad,
    referencias_pgu,
    _insight,
    _chart,
  };
}
