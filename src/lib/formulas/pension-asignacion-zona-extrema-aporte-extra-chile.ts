export interface Inputs {
  sueldo_base: number;
  asignacion_zona: number;
  tipo_afiliacion: 'obligatoria' | 'voluntaria_adicional';
  comision_afp: number;
  seguro_invalidez: boolean;
}

export interface Outputs {
  sueldo_base_formateado: string;
  asignacion_zona_formateado: string;
  imponible_total: number;
  aporte_afp_obligatorio: number;
  comision_total: number;
  seguro_total: number;
  descuento_previsional_total: number;
  saldo_liquido_aproximado: number;
  detalle_cotizacion: string;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const sueldoBase = Math.max(0, i.sueldo_base || 0);
  const asignacionZona = Math.max(0, i.asignacion_zona || 0);
  const comisionAFP = Math.max(0.5, Math.min(3, i.comision_afp || 1.44));
  const incluyeSeguro = i.seguro_invalidez !== false;

  // Imponible total: sueldo base + asignación zona (ambos afectos a AFP)
  const imponibleTotal = sueldoBase + asignacionZona;

  // Aporte obligatorio AFP: 10% sobre imponible total (Decreto 3.626, Ley 19.728)
  const aporteAFPObligatorio = imponibleTotal * 0.10;

  // Comisión administradora: % sobre imponible total
  // Rango 2026: ~0.77% a 2.4%, promedio ~1.44% (CMF)
  const comisionTotal = imponibleTotal * (comisionAFP / 100);

  // Seguro invalidez y sobrevivencia: ~1.27% sobre imponible total (obligatorio)
  // Fuente: CMF 2026
  const seguroInvalidezSobrevivencia = incluyeSeguro ? imponibleTotal * 0.0127 : 0;

  // Descuento previsional total
  const descuentoPrevisionalTotal =
    aporteAFPObligatorio + comisionTotal + seguroInvalidezSobrevivencia;

  // Saldo líquido aproximado (antes IRPF y otros descuentos)
  const saldoLiquidoAproximado = imponibleTotal - descuentoPrevisionalTotal;

  // Formateo moneda chilena: $X.XXX.XXX
  const formatCLP = (valor: number): string => {
    return (
      '$' +
      Math.round(valor)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    );
  };

  // Desglose detallado
  const detalle = `Desglose de cotización previsional:\n\n` +
    `Sueldo base: ${formatCLP(sueldoBase)}\n` +
    `Asignación zona: ${formatCLP(asignacionZona)}\n` +
    `─────────────────────────\n` +
    `Imponible total: ${formatCLP(imponibleTotal)}\n\n` +
    `Aporte AFP (10%): ${formatCLP(aporteAFPObligatorio)}\n` +
    `Comisión administradora (${comisionAFP.toFixed(2)}%): ${formatCLP(comisionTotal)}\n` +
    (incluyeSeguro
      ? `Seguro invalidez/sobrevivencia (1.27%): ${formatCLP(seguroInvalidezSobrevivencia)}\n`
      : '') +
    `─────────────────────────\n` +
    `Descuento previsional total: ${formatCLP(descuentoPrevisionalTotal)}\n\n` +
    `Aprox. saldo líquido (antes impuestos): ${formatCLP(saldoLiquidoAproximado)}\n\n` +
    `Nota: este saldo no incluye retención IRPF, Fonasa (7%) o Isapre, ni otros descuentos.`;

  return {
    sueldo_base_formateado: formatCLP(sueldoBase),
    asignacion_zona_formateado: formatCLP(asignacionZona),
    imponible_total: Math.round(imponibleTotal),
    aporte_afp_obligatorio: Math.round(aporteAFPObligatorio),
    comision_total: Math.round(comisionTotal),
    seguro_total: Math.round(seguroInvalidezSobrevivencia),
    descuento_previsional_total: Math.round(descuentoPrevisionalTotal),
    saldo_liquido_aproximado: Math.round(saldoLiquidoAproximado),
    detalle_cotizacion: detalle,
  };
}
