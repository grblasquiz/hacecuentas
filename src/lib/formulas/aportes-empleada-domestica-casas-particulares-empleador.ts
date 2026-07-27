/**
 * Aportes de empleada doméstica — lo que paga el EMPLEADOR a AFIP.
 *
 * Régimen Especial de Casas Particulares (Ley 26.844). El empleador registra a
 * la trabajadora y paga por el F.102/RT de AFIP, por mes, según las HORAS
 * SEMANALES trabajadas para él, tres tramos:
 *   - menos de 12 hs/semana
 *   - de 12 a menos de 16 hs/semana
 *   - 16 hs/semana o más  (da obra social plena y cómputo jubilatorio)
 * Además es obligatoria la ART (cuota mensual del seguro de riesgos).
 *
 * VALORES:
 *   - El SUELDO usa la escala horaria oficial CNTCP vigente (jun-2026), la misma
 *     fuente única que el resto de las calcs de casas particulares del sitio.
 *   - Los APORTES/CONTRIBUCIONES a AFIP y la cuota de ART son montos fijos que
 *     AFIP/la ART actualizan periódicamente: acá van como REFERENCIALES y
 *     EDITABLES. Verificá el importe vigente en AFIP → "Casas Particulares".
 */

export interface Inputs {
  categoria?: string;         // categoría CNTCP
  horasSemanales: number;     // horas por semana para este empleador
  conRetiro?: string;         // 'si' | 'no'
  aportesAfip?: number;       // override referencial de aportes+contribuciones/mes
  cuotaArt?: number;          // override referencial de la cuota ART/mes
}

export interface Outputs {
  sueldoMensual: string;
  aportesContribuciones: string;
  art: string;
  totalAfip: string;
  costoTotalEmpleador: string;
  tramoHoras: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Escala horaria CNTCP vigente jun-2026 (misma fuente que sueldo-empleada-domestica-horas-retiro.ts).
export const ESCALA_HORA: Record<string, { conRetiro: number; sinRetiro: number }> = {
  supervisor: { conRetiro: 4297.33, sinRetiro: 4683.64 },
  cocinera: { conRetiro: 4223.25, sinRetiro: 4597.18 },
  caseros: { conRetiro: 3996.45, sinRetiro: 3996.45 },
  'cuidado-per': { conRetiro: 3862.18, sinRetiro: 4295.26 },
  'tareas-gen': { conRetiro: 3600.66, sinRetiro: 3862.18 },
};

// Aportes+contribuciones a AFIP (obra social + SIPA) por tramo de horas — REFERENCIAL 2026.
// Editable por el usuario; verificar importe vigente en AFIP.
export const AFIP_POR_TRAMO = { menos12: 1900, de12a16: 3100, mas16: 4500 };
// Cuota ART referencial mensual (varía por aseguradora) — REFERENCIAL 2026, editable.
export const ART_REFERENCIAL = 3500;

const fmt = (n: number): string => '$' + Math.round(n).toLocaleString('es-AR');

export function compute(i: Inputs): Outputs {
  const cat = String(i.categoria || 'tareas-gen');
  const horas = Number(i.horasSemanales) || 0;
  const conRetiro = String(i.conRetiro || 'si') === 'si';
  if (horas <= 0) throw new Error('Ingresá las horas semanales que trabaja para vos.');

  const fila = ESCALA_HORA[cat] || ESCALA_HORA['tareas-gen'];
  const valorHora = conRetiro ? fila.conRetiro : fila.sinRetiro;
  // Mensual = valor hora × horas semanales × 4,33 semanas promedio/mes.
  const sueldoMensual = valorHora * horas * 4.33;

  // Tramo de horas → aportes AFIP.
  let tramoHoras: string;
  let aportesDefault: number;
  if (horas < 12) { tramoHoras = 'Menos de 12 hs/semana'; aportesDefault = AFIP_POR_TRAMO.menos12; }
  else if (horas < 16) { tramoHoras = 'De 12 a menos de 16 hs/semana'; aportesDefault = AFIP_POR_TRAMO.de12a16; }
  else { tramoHoras = '16 hs/semana o más (obra social plena)'; aportesDefault = AFIP_POR_TRAMO.mas16; }

  const aportes = Number.isFinite(Number(i.aportesAfip)) && Number(i.aportesAfip) >= 0 ? Number(i.aportesAfip) : aportesDefault;
  const art = Number.isFinite(Number(i.cuotaArt)) && Number(i.cuotaArt) >= 0 ? Number(i.cuotaArt) : ART_REFERENCIAL;

  const totalAfip = aportes + art;
  const costoTotal = sueldoMensual + totalAfip;
  const pesoAfip = costoTotal > 0 ? (totalAfip / costoTotal) * 100 : 0;

  const _insight = {
    title: `Aportes a AFIP: ${fmt(totalAfip)}/mes`,
    text: `Con **${horas} hs/semana** (${tramoHoras.toLowerCase()}), a AFIP pagás **${fmt(aportes)}** de aportes y contribuciones más **${fmt(art)}** de ART = **${fmt(totalAfip)}/mes**. Sumado al sueldo de **${fmt(sueldoMensual)}**, el costo total de tenerla registrada es **${fmt(costoTotal)}/mes** (los aportes son el ${pesoAfip.toFixed(1)}%). Registrarla con 16+ hs le da obra social y cuenta para su jubilación.`,
    tone: 'neutral',
    icon: '🧹',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo de bolsillo', value: Math.round(sueldoMensual) },
      { label: 'Aportes + contribuciones AFIP', value: Math.round(aportes) },
      { label: 'ART', value: Math.round(art) },
    ],
    prefix: '$',
    centerValue: fmt(costoTotal),
    centerLabel: 'Costo total/mes',
    ariaLabel: `Costo total mensual de ${fmt(costoTotal)}: sueldo ${fmt(sueldoMensual)}, aportes AFIP ${fmt(aportes)} y ART ${fmt(art)}.`,
  };

  return {
    sueldoMensual: fmt(sueldoMensual),
    aportesContribuciones: fmt(aportes),
    art: fmt(art),
    totalAfip: fmt(totalAfip),
    costoTotalEmpleador: fmt(costoTotal),
    tramoHoras,
    detalle: `${horas}h/sem (${tramoHoras}): sueldo ${fmt(sueldoMensual)} + AFIP ${fmt(aportes)} + ART ${fmt(art)} = ${fmt(costoTotal)}/mes.`,
    _insight,
    _chart,
  };
}
