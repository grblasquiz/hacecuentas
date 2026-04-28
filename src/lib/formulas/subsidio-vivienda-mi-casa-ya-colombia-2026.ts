export interface Inputs {
  ingreso_mensual: number;
  valor_vivienda: number;
  tipo_vivienda: 'vis' | 'vip';
  tasa_comercial: number;
  plazo_meses: number;
}

export interface Outputs {
  smmlv_2026: number;
  rango_beneficio: string;
  subsidio_cuota_inicial: number;
  cuota_inicial_neta: number;
  monto_credito: number;
  tasa_subsidiada: number;
  cuota_sin_subsidio: number;
  cuota_con_subsidio: number;
  ahorro_mensual: number;
  ahorro_total: number;
  cumple_requisitos: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia – Fuente: DIAN, FNA, Minvivienda
  const SMMLV_2026 = 1_580_000; // Salario Mínimo 2026 (aprox. con inflación esperada)
  const LIMITE_RANGO_2 = 2 * SMMLV_2026; // ~$3,160,000
  const LIMITE_RANGO_3 = 4 * SMMLV_2026; // ~$6,320,000
  const SUBSIDIO_RANGO_1 = 48_000_000; // 0–2 SMMLV
  const SUBSIDIO_RANGO_2 = 32_000_000; // 2–4 SMMLV
  const CUOTA_INICIAL_PORCENTAJE = 0.30; // 30% valor vivienda (típico)
  const DESCUENTO_TASA_RANGO_1 = 5; // puntos porcentuales 0–2 SMMLV
  const DESCUENTO_TASA_RANGO_2 = 4; // puntos porcentuales 2–4 SMMLV
  const LIMITE_VIS = 188_000_000; // Límite VIS 2026 (aproximado)
  const LIMITE_VIP_MAX = 280_000_000; // Límite VIP máx. 2026

  // Validar requisitos básicos
  let cumple = true;
  let rango_beneficio = '';
  let subsidio = 0;
  let descuento_tasa = 0;

  if (i.ingreso_mensual <= LIMITE_RANGO_2) {
    rango_beneficio = `0–2 SMMLV ($0–$${LIMITE_RANGO_2.toLocaleString('es-CO')})`;
    subsidio = SUBSIDIO_RANGO_1;
    descuento_tasa = DESCUENTO_TASA_RANGO_1;
  } else if (i.ingreso_mensual <= LIMITE_RANGO_3) {
    rango_beneficio = `2–4 SMMLV ($${LIMITE_RANGO_2.toLocaleString('es-CO')}–$${LIMITE_RANGO_3.toLocaleString('es-CO')})`;
    subsidio = SUBSIDIO_RANGO_2;
    descuento_tasa = DESCUENTO_TASA_RANGO_2;
  } else {
    cumple = false;
    rango_beneficio = 'No aplica (ingresos >4 SMMLV)';
    subsidio = 0;
    descuento_tasa = 0;
  }

  // Validar tipo vivienda
  if (i.tipo_vivienda === 'vis' && i.valor_vivienda > LIMITE_VIS) {
    cumple = false;
    rango_beneficio += ' | VIS exceeds $188M';
  } else if (i.tipo_vivienda === 'vip' && (i.valor_vivienda <= LIMITE_VIS || i.valor_vivienda > LIMITE_VIP_MAX)) {
    cumple = false;
    rango_beneficio += ' | VIP fuera rango $188M–$280M';
  }

  // Calcular cuota inicial teórica y neta
  const cuota_inicial_teorica = i.valor_vivienda * CUOTA_INICIAL_PORCENTAJE;
  const cuota_inicial_neta = Math.max(0, cuota_inicial_teorica - subsidio);
  const monto_credito = i.valor_vivienda - cuota_inicial_neta;

  // Tasa subsidiada
  const tasa_subsidiada = Math.max(0.01, i.tasa_comercial - descuento_tasa);

  // Función auxiliar: cuota francés
  const calcularCuota = (monto: number, tasaAnual: number, meses: number): number => {
    if (monto <= 0 || meses <= 0) return 0;
    const i_mensual = tasaAnual / 12 / 100;
    if (i_mensual === 0) return monto / meses; // si tasa 0
    const factor = (Math.pow(1 + i_mensual, meses) - 1) / (i_mensual * Math.pow(1 + i_mensual, meses));
    return monto / factor;
  };

  const cuota_sin_subsidio = calcularCuota(monto_credito, i.tasa_comercial, i.plazo_meses);
  const cuota_con_subsidio = calcularCuota(monto_credito, tasa_subsidiada, i.plazo_meses);
  const ahorro_mensual = Math.max(0, cuota_sin_subsidio - cuota_con_subsidio);
  const ahorro_total = ahorro_mensual * i.plazo_meses;

  const cumple_requisitos = cumple
    ? `Sí cumple: ingresos en rango, vivienda ${i.tipo_vivienda.toUpperCase()}, subsidio $${subsidio.toLocaleString('es-CO')}`
    : `No cumple: ${rango_beneficio}`;

  return {
    smmlv_2026: SMMLV_2026,
    rango_beneficio,
    subsidio_cuota_inicial: cumple ? subsidio : 0,
    cuota_inicial_neta: Math.round(cuota_inicial_neta),
    monto_credito: Math.round(monto_credito),
    tasa_subsidiada: Number(tasa_subsidiada.toFixed(2)),
    cuota_sin_subsidio: Math.round(cuota_sin_subsidio),
    cuota_con_subsidio: Math.round(cuota_con_subsidio),
    ahorro_mensual: Math.round(ahorro_mensual),
    ahorro_total: Math.round(ahorro_total),
    cumple_requisitos
  };
}
