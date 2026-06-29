import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  salario: number;
  personas_a_cargo: number;
  cuota_monetaria_dpto: number;
}

export interface Outputs {
  aporte_caja: number;
  aplica_subsidio: string;
  subsidio_total: number;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Constantes — fuente única: src/lib/data/colombia-2026.ts
const TASA_CAJA = COLOMBIA_2026.aportes.parafiscales.cajaCompensacion; // 4% (Ley 21/1982)
const TOPE_SUBSIDIO_SMMLV = 4; // requisito subsidio familiar: ganar hasta 4 SMMLV

// Helper puro: aporte a la caja + subsidio para un caso dado.
function calcularCaja(salario: number, personasACargo: number, cuotaDpto: number, smmlv: number) {
  const s = Math.max(0, salario || 0);
  const personas = Math.max(0, Math.floor(personasACargo || 0));
  const cuota = Math.max(0, cuotaDpto || 0);
  const enSmmlv = smmlv > 0 ? s / smmlv : 0;
  const aporteCaja = s * TASA_CAJA;
  const aplicaSubsidio = s > 0 && enSmmlv <= TOPE_SUBSIDIO_SMMLV && personas > 0;
  const subsidioTotal = aplicaSubsidio ? personas * cuota : 0;
  return { s, personas, cuota, enSmmlv, aporteCaja, aplicaSubsidio, subsidioTotal };
}

export function compute(i: Inputs): Outputs {
  const SMMLV = COLOMBIA_2026.smlmv; // $1.750.905 (Decreto 1469/2025)
  const r = calcularCaja(i.salario || 0, i.personas_a_cargo || 0, i.cuota_monetaria_dpto || 0, SMMLV);

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

  let aplicaTxt: string;
  if (r.s <= 0) {
    aplicaTxt = 'Ingresá tu salario para saber si calificás al subsidio.';
  } else if (r.enSmmlv > TOPE_SUBSIDIO_SMMLV) {
    aplicaTxt = `No: tu salario equivale a ${(Math.round(r.enSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV, por encima del tope de 4 SMMLV (${fmtCOP(TOPE_SUBSIDIO_SMMLV * SMMLV)}). Tenés derecho a los servicios de la caja, pero no a la cuota monetaria.`;
  } else if (r.personas <= 0) {
    aplicaTxt = 'No: cumplís el tope salarial, pero necesitás al menos una persona a cargo (hijos, padres o cónyuge) para recibir la cuota monetaria.';
  } else {
    aplicaTxt = `Sí: ganás ${(Math.round(r.enSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV (≤4 SMMLV) y tenés ${r.personas} persona(s) a cargo. Recibís cuota monetaria por cada una.`;
  }

  const _insight = r.aplicaSubsidio
    ? {
        title: 'Tenés derecho al subsidio familiar',
        text: `Por ${r.personas} persona(s) a cargo recibís **${fmtCOP(r.subsidioTotal)}** al mes de cuota monetaria (a ${fmtCOP(r.cuota)} cada una). El empleador, además, aporta **${fmtCOP(r.aporteCaja)}** (4% de tu salario) a la caja.`,
        tone: 'good' as const,
        icon: '👨‍👩‍👧',
      }
    : {
        title: 'Sin cuota monetaria',
        text: r.s > 0 && r.enSmmlv > TOPE_SUBSIDIO_SMMLV
          ? `Tu salario supera 4 SMMLV: no recibís cuota monetaria, aunque sí accedés a los servicios de la caja (recreación, educación, vivienda). El aporte del empleador es **${fmtCOP(r.aporteCaja)}** (4%).`
          : 'Verificá el salario (≤4 SMMLV) y las personas a cargo, y consultá la cuota monetaria de tu departamento para estimar el subsidio.',
        tone: 'neutral' as const,
        icon: '👨‍👩‍👧',
      };

  const _chart = {
    type: 'bar',
    title: 'Aporte del empleador y subsidio que recibís',
    bars: [
      { label: 'Aporte caja (4%)', value: Math.round(r.aporteCaja) },
      { label: 'Cuota monetaria', value: Math.round(r.subsidioTotal) },
    ],
    format: 'currency',
    ariaLabel: `Aporte caja ${fmtCOP(r.aporteCaja)}, subsidio ${fmtCOP(r.subsidioTotal)}`,
  };

  // Tabla computada: subsidio según personas a cargo, para el salario y cuota ingresados.
  const cuotaRef = r.cuota > 0 ? r.cuota : 50000;
  const anclas = [1, 2, 3, 4];
  type Fila = { personas: number; tuCaso: boolean };
  const filas: Fila[] = anclas.map((p) => ({ personas: p, tuCaso: false }));
  if (r.s > 0 && r.personas > 0) filas.push({ personas: r.personas, tuCaso: true });
  const porPersonas = new Map<number, Fila>();
  for (const f of filas.sort((a, b) => Number(a.tuCaso) - Number(b.tuCaso))) porPersonas.set(f.personas, f);
  const filasFinales = Array.from(porPersonas.values()).sort((a, b) => a.personas - b.personas).slice(0, 7);
  const salarioRef = r.s > 0 ? r.s : SMMLV;
  const tableRows = filasFinales.map((f) => {
    const c = calcularCaja(salarioRef, f.personas, cuotaRef, SMMLV);
    return [
      `${f.personas}${f.tuCaso ? ' (tu caso)' : ''}`,
      c.aplicaSubsidio ? 'Sí' : 'No',
      fmtCOP(c.subsidioTotal),
    ];
  });
  const _table = {
    title: `Cuota monetaria estimada por personas a cargo (cuota ${fmtCOP(cuotaRef)} c/u)`,
    headers: ['Personas a cargo', '¿Aplica?', 'Subsidio mensual'],
    align: ['center', 'center', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: `La cuota monetaria varía por caja y departamento (acá: ${fmtCOP(cuotaRef)} por persona, valor de referencia editable). Solo se paga si el salario es ≤4 SMMLV (${fmtCOP(TOPE_SUBSIDIO_SMMLV * SMMLV)}). El aporte del 4% lo paga siempre el empleador.`,
  };

  return {
    aporte_caja: Math.round(r.aporteCaja),
    aplica_subsidio: aplicaTxt,
    subsidio_total: Math.round(r.subsidioTotal),
    _insight,
    _chart,
    _table,
  };
}
