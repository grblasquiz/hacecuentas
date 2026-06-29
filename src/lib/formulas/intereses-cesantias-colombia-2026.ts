import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  salario_mensual: number;
  dias_trabajados: number;
}

export interface Outputs {
  cesantias: number;
  intereses: number;
  fecha_limite: string;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Constantes — fuente única: src/lib/data/colombia-2026.ts
const TASA_INTERESES = COLOMBIA_2026.prestaciones.interesesCesantias; // 12% anual (Ley 52/1975)
const BASE_DIAS = 360; // base anual laboral colombiana

// Helper puro: cesantías + intereses para un salario y días trabajados dados.
function calcularCesantias(salarioMensual: number, diasTrabajados: number) {
  const salario = Math.max(0, salarioMensual || 0);
  const dias = Math.max(0, diasTrabajados || 0);
  const cesantias = (salario * dias) / BASE_DIAS;
  const intereses = (cesantias * dias * TASA_INTERESES) / BASE_DIAS;
  return { salario, dias, cesantias, intereses };
}

export function compute(i: Inputs): Outputs {
  const dias = i.dias_trabajados && i.dias_trabajados > 0 ? i.dias_trabajados : BASE_DIAS;
  const r = calcularCesantias(i.salario_mensual || 0, dias);

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

  const _insight = r.cesantias > 0
    ? {
        title: 'Intereses de cesantías a recibir',
        text: `Sobre cesantías de **${fmtCOP(r.cesantias)}** acumuladas en ${r.dias.toLocaleString('es-CO')} días, te corresponden **${fmtCOP(r.intereses)}** de intereses (12% anual). Tu empleador debe pagártelos **a más tardar el 31 de enero**, directamente a vos.`,
        tone: 'good' as const,
        icon: '💰',
      }
    : {
        title: 'Calculá tus intereses de cesantías',
        text: 'Ingresá tu salario mensual (incluido el auxilio de transporte si lo recibís) y los días trabajados en el año para estimar los intereses del 12% que se pagan en enero.',
        tone: 'neutral' as const,
        icon: '💰',
      };

  const _chart = {
    type: 'bar',
    title: 'Cesantías vs intereses',
    bars: [
      { label: 'Cesantías', value: Math.round(r.cesantias) },
      { label: 'Intereses 12%', value: Math.round(r.intereses) },
    ],
    format: 'currency',
    ariaLabel: `Cesantías ${fmtCOP(r.cesantias)}, intereses ${fmtCOP(r.intereses)}`,
  };

  // Tabla computada: intereses según días trabajados, para el salario ingresado (mismo helper).
  const salarioRef = r.salario > 0 ? r.salario : COLOMBIA_2026.smlmv;
  const anclasDias = [90, 180, 270, 360];
  type Fila = { dias: number; tuCaso: boolean };
  const filas: Fila[] = anclasDias.map((d) => ({ dias: d, tuCaso: false }));
  if (r.salario > 0) filas.push({ dias: r.dias, tuCaso: true });
  const porDias = new Map<number, Fila>();
  for (const f of filas.sort((a, b) => Number(a.tuCaso) - Number(b.tuCaso))) porDias.set(f.dias, f);
  const filasFinales = Array.from(porDias.values()).sort((a, b) => a.dias - b.dias).slice(0, 7);
  const tableRows = filasFinales.map((f) => {
    const c = calcularCesantias(salarioRef, f.dias);
    return [
      `${f.dias.toLocaleString('es-CO')} días${f.tuCaso ? ' (tu caso)' : ''}`,
      fmtCOP(c.cesantias),
      fmtCOP(c.intereses),
    ];
  });
  const _table = {
    title: `Intereses de cesantías por tiempo trabajado (salario ${fmtCOP(salarioRef)})`,
    headers: ['Días trabajados', 'Cesantías acumuladas', 'Intereses 12%'],
    align: ['left', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: 'Intereses = cesantías × días × 12% ÷ 360 (Ley 52/1975). Para un año completo (360 días) equivalen a un 12% de las cesantías. Se pagan al trabajador a más tardar el 31 de enero.',
  };

  return {
    cesantias: Math.round(r.cesantias),
    intereses: Math.round(r.intereses),
    fecha_limite: '31 de enero',
    _insight,
    _chart,
    _table,
  };
}
