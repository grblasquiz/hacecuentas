// Calculadora Bono Social Eléctrico España 2026
// Fuente: RD 897/2017 (BOE) + actualizaciones; IPREM estimado 2026

export interface Inputs {
  miembros_hogar: '1' | '2' | '3' | '4' | '5';
  ingresos_anuales: number;
  familia_numerosa: 'no' | 'general' | 'especial';
  pension_minima: boolean;
  discapacidad: boolean;
  zona_climatica: 'alpha' | 'A' | 'B' | 'C' | 'D' | 'E';
  en_riesgo_exclusion: boolean;
}

export interface Outputs {
  tiene_derecho: string;
  tipo_bono: string;
  porcentaje_descuento: number;
  tope_kwh_anual: number;
  limite_ingresos_aplicado: number;
  margen_ingresos: number;
  como_solicitarlo: string;
}

export function compute(i: Inputs): Outputs {
  // ── Constantes 2026 ──────────────────────────────────────────
  // IPREM anual 2026 (14 pagas) – estimación; confirmar en BOE cuando se publique
  const IPREM_2026 = 7_200; // €/año

  // Multiplicadores IPREM por nº miembros y situación especial
  // Fuente: Art. 3 RD 897/2017
  const multiplicadoresGenerales: Record<string, number> = {
    '1': 2.5,
    '2': 3.0,
    '3': 3.5,
    '4': 4.0,
    '5': 4.5,
  };
  const multiplicadoresEspeciales: Record<string, number> = {
    '1': 3.0,
    '2': 3.5,
    '3': 4.0,
    '4': 4.5,
    '5': 5.0,
  };

  // Topes kWh anuales subvencionados por zona climática y miembros del hogar
  // Fuente: Anexo III RD 897/2017
  // Índice: [zona][miembros - 1]
  const topesKwh: Record<string, number[]> = {
    alpha: [1_380, 1_932, 2_346, 2_760, 3_174],
    A:     [1_380, 1_932, 2_346, 2_760, 3_174],
    B:     [1_932, 2_346, 2_760, 3_174, 3_588],
    C:     [2_346, 2_760, 3_174, 3_588, 4_002],
    D:     [2_760, 3_174, 3_588, 4_002, 4_416],
    E:     [3_174, 3_588, 4_002, 4_416, 4_830],
  };

  // ── Normalización de inputs ─────────────────────────────────
  const miembros = i.miembros_hogar ?? '1';
  const ingresos = Math.max(0, Number(i.ingresos_anuales) || 0);
  const zona = i.zona_climatica ?? 'C';

  // Índice miembros para arrays (0-4)
  const miembrosIdx = Math.min(parseInt(miembros, 10) - 1, 4);

  // Situación especial: familia numerosa, discapacidad ≥33% o pensión mínima
  const tieneCondicionEspecial =
    i.familia_numerosa === 'general' ||
    i.familia_numerosa === 'especial' ||
    i.pension_minima === true ||
    i.discapacidad === true;

  // ── Cálculo de límites de ingresos ─────────────────────────
  const limiteGeneral = IPREM_2026 * (multiplicadoresGenerales[miembros] ?? 2.5);
  const limiteEspecial = IPREM_2026 * (multiplicadoresEspeciales[miembros] ?? 3.0);

  // El límite aplicado depende de si tiene condición especial
  const limiteAplicado = tieneCondicionEspecial ? limiteEspecial : limiteGeneral;

  const margen = limiteAplicado - ingresos; // positivo → cumple; negativo → no cumple

  // ── Tope kWh según zona y miembros ─────────────────────────
  const topeKwh = (topesKwh[zona] ?? topesKwh['C'])[miembrosIdx];

  // ── Determinación del tipo de bono ─────────────────────────
  let tieneDerecho = false;
  let tipoBono = 'Sin derecho';
  let porcentajeDescuento = 0;

  if (ingresos <= limiteAplicado) {
    tieneDerecho = true;

    if (tieneCondicionEspecial && i.en_riesgo_exclusion) {
      // Bono vulnerable severo en riesgo de exclusión social
      tipoBono = 'Vulnerable severo en riesgo de exclusión';
      porcentajeDescuento = 65;
    } else if (tieneCondicionEspecial) {
      // Bono vulnerable severo
      tipoBono = 'Vulnerable severo';
      porcentajeDescuento = 40;
    } else {
      // Bono vulnerable general
      tipoBono = 'Vulnerable';
      porcentajeDescuento = 25;
    }
  }

  // ── Textos de resultado ─────────────────────────────────────
  const tienDerechoTexto = tieneDerecho
    ? '✅ Sí, cumples los criterios del bono social eléctrico 2026.'
    : '❌ No, tus ingresos superan el límite establecido para tu situación familiar.';

  let comoSolicitarlo: string;
  if (tieneDerecho) {
    comoSolicitarlo =
      '1. Asegúrate de tener contrato en tarifa PVPC (si no, cambia a la comercializadora de referencia de tu zona). ' +
      '2. Reúne la documentación: DNI/NIE del titular, empadronamiento colectivo y, según el caso, título de familia numerosa, certificado de discapacidad o resolución del INSS de pensión con mínimos. ' +
      '3. Solicita el bono directamente a tu comercializadora de referencia (Endesa, Iberdrola, Naturgy, EDP o CHC) por web, teléfono o presencialmente. ' +
      '4. Autoriza la consulta de ingresos a la AEAT. El bono se activa en un máximo de 7 días hábiles y aparece desglosado en tu factura.';
  } else {
    comoSolicitarlo =
      'Tus ingresos actuales superan el umbral para el bono social. Si tu situación económica cambia (reducción de ingresos, cambio en la unidad familiar, reconocimiento de discapacidad o pensión con mínimos), podrás volver a solicitarlo. Consulta también si tu comunidad autónoma dispone de ayudas complementarias al pago de la factura eléctrica.';
  }

  // ── Salida ──────────────────────────────────────────────────
  return {
    tiene_derecho: tienDerechoTexto,
    tipo_bono: tipoBono,
    porcentaje_descuento: porcentajeDescuento,
    tope_kwh_anual: tieneDerecho ? topeKwh : 0,
    limite_ingresos_aplicado: Math.round(limiteAplicado * 100) / 100,
    margen_ingresos: Math.round(margen * 100) / 100,
    como_solicitarlo: comoSolicitarlo,
  };
}
