export interface Inputs {
  monto_herencia: number;
  parentesco: 'conyuge' | 'hijo_descendiente' | 'padre_abuelo' | 'hermano' | 'tio_sobrino' | 'otro_pariente' | 'no_pariente';
  es_donacion: boolean;
  años_donacion: number;
  vivienda_hereditaria: boolean;
  deuda_herencia: number;
}

export interface Outputs {
  base_imponible: number;
  tarifa_aplicada: number;
  cuota_impuesto: number;
  descuento_donacion: number;
  exencion_vivienda: number;
  impuesto_neto: number;
  tasa_efectiva: number;
  observacion: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).vivienda_hereditaria = (i as any).vivienda_hereditaria === true || (i as any).vivienda_hereditaria === 'true';
  // Constantes 2026 Chile - Fuente: SII
  const UTA_2026 = 30440; // Unidad Tributaria Anual 2026 (aprox.)
  const UTA_VIVIENDA_LIMITE = 2000 * UTA_2026; // $60.880.000
  const TASA_DESCUENTO_DONACION = 0.05; // 5% anual
  
  // Objeto tarifas por parentesco (en % - tramo medio)
  const tarifas: Record<string, number> = {
    'conyuge': 0,                  // Exento total
    'hijo_descendiente': 0.04,     // 1-4% (tramo medio)
    'padre_abuelo': 0.10,          // 5-15%
    'hermano': 0.15,               // 5-25% (tramo medio)
    'tio_sobrino': 0.16,           // 8-25%
    'otro_pariente': 0.17,         // Variable
    'no_pariente': 0.25            // 25% plano
  };
  
  // Paso 1: Calcular exención vivienda hereditaria
  let exencion_vivienda = 0;
  if (i.vivienda_hereditaria && (i.parentesco === 'conyuge' || i.parentesco === 'hijo_descendiente')) {
    exencion_vivienda = Math.min(i.monto_herencia, UTA_VIVIENDA_LIMITE);
  }
  
  // Paso 2: Calcular base imponible (monto - exenciones - deudas)
  const base_imponible = Math.max(
    0,
    i.monto_herencia - exencion_vivienda - i.deuda_herencia
  );
  
  // Paso 3: Obtener tarifa aplicable según parentesco
  const tarifa_aplicada = tarifas[i.parentesco] || 0.17;
  
  // Paso 4: Calcular cuota de impuesto
  const cuota_impuesto = base_imponible * tarifa_aplicada;
  
  // Paso 5: Calcular descuento por antigüedad donación (solo si es donación)
  let descuento_donacion = 0;
  if (i.es_donacion && i.años_donacion > 0) {
    const años_validos = Math.min(i.años_donacion, 5);
    descuento_donacion = cuota_impuesto * (TASA_DESCUENTO_DONACION * años_validos);
  }
  
  // Paso 6: Calcular impuesto neto (cuota - descuentos)
  const impuesto_neto = Math.max(0, cuota_impuesto - descuento_donacion);
  
  // Paso 7: Calcular tasa efectiva sobre monto original
  const tasa_efectiva = i.monto_herencia > 0 ? impuesto_neto / i.monto_herencia : 0;
  
  // Paso 8: Generar observación legal
  let observacion = '';
  
  if (i.parentesco === 'conyuge') {
    observacion = 'Cónyuge exento de impuesto a herencias. No hay cuota tributaria.';
  } else if (i.vivienda_hereditaria && exencion_vivienda > 0) {
    observacion = `Exención vivienda hereditaria aplicada: $${exencion_vivienda.toLocaleString('es-CL')}. Base reducida.`;
  } else if (i.deuda_herencia > 0) {
    observacion = `Deudas hereditarias rebajadas: $${i.deuda_herencia.toLocaleString('es-CL')}. Base imponible neta.`;
  }
  
  if (i.es_donacion && descuento_donacion > 0) {
    observacion += ` Descuento donación antigüedad: $${descuento_donacion.toLocaleString('es-CL')}.`;
  }
  
  if (i.parentesco === 'no_pariente') {
    observacion += ' Tercero no pariente: tarifa máxima 25% aplicada.';
  }
  
  if (impuesto_neto === 0) {
    observacion = 'Beneficiario exento de impuesto. Cero cuota tributaria.';
  }
  
  const fmtCL = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const tasaEfPct = tasa_efectiva * 100;
  const netoRecibido = Math.max(0, Math.round(i.monto_herencia - impuesto_neto));

  // ── Insight narrativo (dinámico: exento vs gravado) ────────────────
  const _insight = impuesto_neto <= 0
    ? {
        title: i.parentesco === 'conyuge' ? 'Cónyuge: herencia exenta' : 'No pagás impuesto a la herencia',
        text: i.parentesco === 'conyuge'
          ? `Como cónyuge estás **exento**: recibís los **${fmtCL(i.monto_herencia)}** sin cuota tributaria.`
          : `Entre exenciones y deudas, la base imponible queda en cero o no genera cuota: recibís **${fmtCL(netoRecibido)}** **sin impuesto** a la herencia.`,
        tone: 'good',
        icon: '🕊️',
      }
    : {
        title: 'Impuesto a la herencia a pagar',
        text: `Sobre una base de **${fmtCL(base_imponible)}** te corresponde pagar **${fmtCL(impuesto_neto)}** (tasa del **${(tarifa_aplicada * 100).toFixed(0)}%** por parentesco, **${tasaEfPct.toFixed(1)}%** efectivo sobre el total). Recibís netos **${fmtCL(netoRecibido)}**.`,
        tone: 'warn',
        icon: '⚖️',
      };

  // ── Gráfico: sólo si hay impuesto, repartiendo la herencia declarada ──
  const _chart = impuesto_neto > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Recibís neto', value: netoRecibido },
          { label: 'Impuesto a la herencia', value: Math.round(impuesto_neto) },
        ],
        prefix: '$',
        centerValue: fmtCL(i.monto_herencia),
        centerLabel: 'Herencia',
        ariaLabel: 'Reparto de la herencia declarada entre lo que recibís neto y el impuesto',
      }
    : undefined;

  return {
    base_imponible: Math.round(base_imponible),
    tarifa_aplicada: tarifa_aplicada * 100,
    cuota_impuesto: Math.round(cuota_impuesto),
    descuento_donacion: Math.round(descuento_donacion),
    exencion_vivienda: Math.round(exencion_vivienda),
    impuesto_neto: Math.round(impuesto_neto),
    tasa_efectiva: tasa_efectiva * 100,
    observacion: observacion.trim() || 'Cálculo completado según Ley 16.271.',
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
