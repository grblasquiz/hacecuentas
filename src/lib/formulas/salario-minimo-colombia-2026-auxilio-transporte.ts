import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  aplica_auxilio_transporte: boolean;
  smlmv_2026: number;
  auxilio_transporte_valor: number;
}

export interface Outputs {
  salario_minimo_bruto: number;
  auxilio_transporte_total: number;
  ingreso_bruto_total_mensual: number;
  ingreso_por_hora: number;
  ingreso_por_dia: number;
  ingreso_por_semana: number;
  nota_tope_auxilio: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 desde la tabla maestra (Decretos 1469 y 1470 de 2025)
  const SMLMV_2026 = COLOMBIA_2026.smlmv; // $1.750.905
  const AUXILIO_TRANSPORTE_2026 = COLOMBIA_2026.auxilioTransporte; // $249.095
  const TOPE_AUXILIO = COLOMBIA_2026.topeAuxilioSmlmv * SMLMV_2026; // 2 × SMLMV = $3.501.810
  // Jornada Ley 2101/2021: 44 h/semana hasta el 14-jul-2026 → divisor 220 h/mes
  const HORAS_MENSUALES = COLOMBIA_2026.jornada.divisorMensualHasta14Jul2026; // 220
  const DIAS_MES_LEGAL = 30; // SMDLV = SMLMV ÷ 30 (convención legal CST)
  const SEMANAS_POR_ANIO = 52;
  const MESES_POR_ANIO = 12;

  // Salario mínimo bruto (SMLMV sin deducciones)
  const salario_minimo_bruto = SMLMV_2026;

  // Auxilio de transporte: aplica si el salario es inferior a 2 SMLMV
  const auxilio_transporte_total = i.aplica_auxilio_transporte ? AUXILIO_TRANSPORTE_2026 : 0;

  // Ingreso bruto total mensual (salario + auxilio si procede)
  const ingreso_bruto_total_mensual = salario_minimo_bruto + auxilio_transporte_total;

  // Valores por período — se calculan sobre el SALARIO (el auxilio no es salario):
  // hora ordinaria = salario ÷ 220 h; día (SMDLV) = salario ÷ 30; semana = salario × 12 ÷ 52
  const ingreso_por_hora = Math.round((salario_minimo_bruto / HORAS_MENSUALES) * 100) / 100;
  const ingreso_por_dia = Math.round((salario_minimo_bruto / DIAS_MES_LEGAL) * 100) / 100;
  const ingreso_por_semana = Math.round(((salario_minimo_bruto * MESES_POR_ANIO) / SEMANAS_POR_ANIO) * 100) / 100;

  const copFmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Nota sobre elegibilidad del auxilio
  let nota_tope_auxilio = '';
  if (i.aplica_auxilio_transporte) {
    nota_tope_auxilio = `✓ Aplica auxilio de transporte: el salario (${copFmt(salario_minimo_bruto)}) es inferior a 2 SMLMV (${copFmt(TOPE_AUXILIO)}). Decreto 1470 de 2025.`;
  } else {
    nota_tope_auxilio = `✗ No aplica auxilio de transporte: solo se reconoce a quien gana menos de 2 SMLMV (${copFmt(TOPE_AUXILIO)}).`;
  }

  const _insight = i.aplica_auxilio_transporte
    ? {
        title: 'Ingreso con auxilio de transporte',
        text: `Sumando el auxilio de transporte (**${copFmt(auxilio_transporte_total)}**), tu ingreso bruto mensual llega a **${copFmt(ingreso_bruto_total_mensual)}**. El auxilio aplica porque ganás menos de 2 SMLMV (${copFmt(TOPE_AUXILIO)}).`,
        tone: 'good',
        icon: '🚌',
      }
    : {
        title: 'Sin auxilio de transporte',
        text: `Tu ingreso bruto mensual es **${copFmt(ingreso_bruto_total_mensual)}**, todo salario. No recibís auxilio de transporte porque tu salario iguala o supera 2 SMLMV (${copFmt(TOPE_AUXILIO)}).`,
        tone: 'neutral',
        icon: '💼',
      };

  const _chart = i.aplica_auxilio_transporte
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Salario mínimo', value: salario_minimo_bruto },
          { label: 'Auxilio transporte', value: auxilio_transporte_total },
        ],
        prefix: '$',
        centerValue: copFmt(ingreso_bruto_total_mensual),
        centerLabel: 'Ingreso bruto',
        ariaLabel: `El ingreso bruto mensual de ${copFmt(ingreso_bruto_total_mensual)} se compone de ${copFmt(salario_minimo_bruto)} de salario mínimo más ${copFmt(auxilio_transporte_total)} de auxilio de transporte.`,
      }
    : undefined;

  return {
    salario_minimo_bruto,
    auxilio_transporte_total,
    ingreso_bruto_total_mensual,
    ingreso_por_hora,
    ingreso_por_dia,
    ingreso_por_semana,
    nota_tope_auxilio,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
