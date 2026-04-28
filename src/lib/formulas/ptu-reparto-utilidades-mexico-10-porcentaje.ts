export interface Inputs {
  utilidad_fiscal_empresa: number;
  numero_empleados: number;
  dias_trabajados_anio: number;
  salario_diario: number;
}

export interface Outputs {
  ptu_bruta: number;
  tope_3_meses: number;
  ptu_aplicable: number;
  uma_diaria_2026: number;
  exencion_uma_15: number;
  base_gravable_isr: number;
  isr_retenido: number;
  ptu_neta: number;
  aportacion_fondo_ahorro: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México (SAT, INEGI)
  const UMA_DIARIA_2026 = 20.40; // INEGI 2026
  const TASA_ISR_PTU = 0.20; // Tasa marginal aproximada PTU
  const EXENCION_UMA_DIAS = 15; // Art. 178 LISR
  const DIAS_3_MESES = 90; // Tope máximo
  const PORCENTAJE_PTU = 0.10; // Art. 117 LFT
  const TASA_FONDO_AHORRO = 0.02; // Opcional

  // Validaciones básicas
  const utilidad = Math.max(0, i.utilidad_fiscal_empresa);
  const empleados = Math.max(1, i.numero_empleados);
  const diasAnio = Math.min(365, Math.max(1, i.dias_trabajados_anio));
  const salarioDiario = Math.max(0, i.salario_diario);

  // 1. Cálculo PTU Bruta (proporcional a días trabajados)
  const ptuBruta = (utilidad * PORCENTAJE_PTU * diasAnio / 365) / empleados;

  // 2. Tope máximo: 3 meses salario
  const tope3Meses = salarioDiario * DIAS_3_MESES;

  // 3. PTU Aplicable: menor de bruta vs tope
  const ptuAplicable = Math.min(ptuBruta, tope3Meses);

  // 4. Exención ISR: 15 UMA × días trabajados
  const umaDiaria = UMA_DIARIA_2026;
  const exencionUma15 = EXENCION_UMA_DIAS * umaDiaria * (diasAnio / 365);

  // 5. Base Gravable ISR (máximo 0)
  const baseGravableIsr = Math.max(0, ptuAplicable - exencionUma15);

  // 6. ISR Retenido (tasa aproximada 20%)
  const isrRetenido = baseGravableIsr * TASA_ISR_PTU;

  // 7. PTU Neta
  const ptuNeta = ptuAplicable - isrRetenido;

  // 8. Aportación Fondo Ahorro (opcional, 2% sobre PTU neta)
  const aportacionFondoAhorro = ptuNeta * TASA_FONDO_AHORRO;

  return {
    ptu_bruta: Math.round(ptuBruta * 100) / 100,
    tope_3_meses: Math.round(tope3Meses * 100) / 100,
    ptu_aplicable: Math.round(ptuAplicable * 100) / 100,
    uma_diaria_2026: umaDiaria,
    exencion_uma_15: Math.round(exencionUma15 * 100) / 100,
    base_gravable_isr: Math.round(baseGravableIsr * 100) / 100,
    isr_retenido: Math.round(isrRetenido * 100) / 100,
    ptu_neta: Math.round(ptuNeta * 100) / 100,
    aportacion_fondo_ahorro: Math.round(aportacionFondoAhorro * 100) / 100
  };
}
