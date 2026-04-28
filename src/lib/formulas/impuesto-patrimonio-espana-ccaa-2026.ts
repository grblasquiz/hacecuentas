// Calculadora Impuesto Patrimonio España por CCAA 2026
// Fuentes: Ley 19/1991 (IP), Ley 38/2022 (ITSGF), normativa autonómica 2026

export interface Inputs {
  patrimonio_bruto: number;
  deudas: number;
  valor_vivienda_habitual: number;
  ccaa: string;
  minimo_exento_personalizado: number;
}

export interface Outputs {
  patrimonio_neto: number;
  base_imponible: number;
  cuota_ip_estatal: number;
  bonificacion_ccaa: number;
  cuota_ip_final: number;
  aplica_itsgf: string;
  cuota_itsgf: number;
  cuota_total_efectiva: number;
  tipo_efectivo: number;
  aviso: string;
}

// ---------------------------------------------------------------------------
// ESCALA ESTATAL IP — art. 30 Ley 19/1991 (vigente 2026)
// Cada tramo: [base_desde, cuota_acumulada, tipo_marginal]
// ---------------------------------------------------------------------------
const TRAMOS_IP: [number, number, number][] = [
  [0,              0.00,       0.002],
  [167129.45,      334.26,     0.003],
  [334252.88,      835.63,     0.005],
  [668499.75,      2506.86,    0.009],
  [1336999.51,     8523.36,    0.013],
  [2673999.01,     25904.35,   0.017],
  [5347998.03,     71362.33,   0.021],
  [10695996.06,    183670.29,  0.025],
];

// ---------------------------------------------------------------------------
// ESCALA ITSGF — art. 3 Ley 38/2022 (vigente 2026)
// El tramo 0-3M€ tiene tipo 0%; el mínimo exento es 700.000€
// ---------------------------------------------------------------------------
const TRAMOS_ITSGF: [number, number, number][] = [
  [0,            0.00,       0.000],
  [3000000,      0.00,       0.017],
  [5347998.03,   39915.97,   0.021],
  [10695996.06,  152223.93,  0.035],
];

// ---------------------------------------------------------------------------
// BONIFICACIONES AUTONÓMICAS 2026
// Porcentaje de bonificación sobre la cuota íntegra IP (0 a 1)
// ---------------------------------------------------------------------------
const BONIFICACIONES_CCAA: Record<string, number> = {
  andalucia:         1.00, // Decreto-ley 7/2022 Junta de Andalucía
  aragon:            0.00,
  asturias:          0.00,
  baleares:          0.00,
  canarias:          0.00,
  cantabria:         0.00,
  castilla_la_mancha:0.00,
  castilla_leon:     0.00,
  cataluna:          0.00,
  extremadura:       0.00,
  galicia:           0.50, // Ley 9/2021 Xunta de Galicia
  la_rioja:          0.00,
  madrid:            1.00, // Ley 22/2021 Comunidad de Madrid
  murcia:            1.00, // Ley 2/2023 Región de Murcia
  navarra:           0.00, // Régimen foral — estimación orientativa
  pais_vasco:        0.00, // Régimen foral — estimación orientativa
  valencia:          0.00,
  estatal:           0.00,
};

// ---------------------------------------------------------------------------
// AVISOS POR CCAA
// ---------------------------------------------------------------------------
const AVISOS_CCAA: Record<string, string> = {
  andalucia:   'Andalucía aplica bonificación del 100% en la cuota del IP. Sin embargo, si tu patrimonio neto supera 3.000.000€, el ITSGF actúa como suelo mínimo nacional y deberás tributar por él.',
  madrid:      'Madrid aplica bonificación del 100% en la cuota del IP. Si tu patrimonio neto supera 3.000.000€, el ITSGF anula el efecto de la bonificación y tributarás por dicho impuesto.',
  murcia:      'Murcia aplica bonificación del 100%. Para patrimonios superiores a 3.000.000€ aplica el ITSGF.',
  galicia:     'Galicia aplica bonificación del 50% sobre la cuota íntegra del IP.',
  navarra:     'Navarra tiene régimen foral propio con tramos distintos. Este cálculo es orientativo usando la escala estatal.',
  pais_vasco:  'El País Vasco tiene régimen foral propio (Álava, Gipuzkoa, Bizkaia) con normativa diferente. Este cálculo es orientativo.',
  cataluna:    'Cataluña fija el mínimo exento en 500.000€, pero se aplica el estatal de 700.000€ por ser más favorable al contribuyente.',
};

// ---------------------------------------------------------------------------
// FUNCIÓN AUXILIAR: calcula cuota con escala progresiva genérica
// ---------------------------------------------------------------------------
function calcularCuotaEscala(
  base: number,
  tramos: [number, number, number][]
): number {
  if (base <= 0) return 0;
  let cuota = 0;
  for (let i = tramos.length - 1; i >= 0; i--) {
    const [desde, cuotaAcum, tipo] = tramos[i];
    if (base > desde) {
      cuota = cuotaAcum + (base - desde) * tipo;
      break;
    }
  }
  return Math.max(0, cuota);
}

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------
export function compute(i: Inputs): Outputs {
  // 1. Validaciones y valores por defecto
  const patrimonioBruto = Math.max(0, i.patrimonio_bruto || 0);
  const deudas = Math.max(0, i.deudas || 0);
  const valorVivienda = Math.min(300000, Math.max(0, i.valor_vivienda_habitual || 0));
  const ccaa = i.ccaa || 'estatal';

  // Mínimo exento: el definido por el usuario nunca puede ser inferior a 700.000€
  const minimoExento = Math.max(700000, i.minimo_exento_personalizado || 700000);

  // 2. Patrimonio neto
  const patrimonioNeto = Math.max(0, patrimonioBruto - deudas);

  // 3. Base imponible IP
  const baseImponible = Math.max(0, patrimonioNeto - valorVivienda - minimoExento);

  // 4. Cuota íntegra IP (escala estatal)
  const cuotaIPEstatal = calcularCuotaEscala(baseImponible, TRAMOS_IP);

  // 5. Bonificación autonómica
  const porcentajeBonificacion = BONIFICACIONES_CCAA[ccaa] ?? 0;
  const bonificacionCCAA = cuotaIPEstatal * porcentajeBonificacion;

  // 6. Cuota IP final
  const cuotaIPFinal = Math.max(0, cuotaIPEstatal - bonificacionCCAA);

  // 7. ITSGF — aplica si patrimonio neto > 3.000.000€
  // El mínimo exento del ITSGF también es 700.000€
  const UMBRAL_ITSGF = 3000000;
  const aplicaITSGF = patrimonioNeto > UMBRAL_ITSGF;
  let cuotaITSGFCalculada = 0;
  let cuotaITSGFAIngresar = 0;

  if (aplicaITSGF) {
    // Base ITSGF: patrimonio neto − mínimo exento (700.000€)
    const baseITSGF = Math.max(0, patrimonioNeto - 700000);
    cuotaITSGFCalculada = calcularCuotaEscala(baseITSGF, TRAMOS_ITSGF);
    // Se deduce la cuota IP efectivamente pagada (art. 3.2 Ley 38/2022)
    cuotaITSGFAIngresar = Math.max(0, cuotaITSGFCalculada - cuotaIPFinal);
  }

  // 8. Cuota total efectiva
  const cuotaTotalEfectiva = cuotaIPFinal + cuotaITSGFAIngresar;

  // 9. Tipo efectivo sobre patrimonio neto
  const tipoEfectivo =
    patrimonioNeto > 0 ? (cuotaTotalEfectiva / patrimonioNeto) * 100 : 0;

  // 10. Aviso
  let aviso = AVISOS_CCAA[ccaa] || '';
  if (!aviso && aplicaITSGF) {
    aviso =
      'Tu patrimonio neto supera 3.000.000€. El ITSGF aplica como suelo mínimo nacional.';
  }
  if (baseImponible <= 0 && patrimonioNeto <= minimoExento + valorVivienda) {
    aviso =
      'Tu patrimonio neto no supera el mínimo exento más la exención de vivienda habitual. No hay cuota a pagar.' +
      (aviso ? ' ' + aviso : '');
  }

  return {
    patrimonio_neto: parseFloat(patrimonioNeto.toFixed(2)),
    base_imponible: parseFloat(baseImponible.toFixed(2)),
    cuota_ip_estatal: parseFloat(cuotaIPEstatal.toFixed(2)),
    bonificacion_ccaa: parseFloat(bonificacionCCAA.toFixed(2)),
    cuota_ip_final: parseFloat(cuotaIPFinal.toFixed(2)),
    aplica_itsgf: aplicaITSGF ? 'Sí' : 'No',
    cuota_itsgf: parseFloat(cuotaITSGFAIngresar.toFixed(2)),
    cuota_total_efectiva: parseFloat(cuotaTotalEfectiva.toFixed(2)),
    tipo_efectivo: parseFloat(tipoEfectivo.toFixed(4)),
    aviso: aviso,
  };
}
