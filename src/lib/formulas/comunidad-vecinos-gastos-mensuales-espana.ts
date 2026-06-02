export interface Inputs {
  tipo_edificio: 'basico' | 'ascensor' | 'ascensor_jardin' | 'ascensor_piscina' | 'lujo';
  numero_viviendas: number;
  coeficiente_participacion: number;
  gastos_comunes_base: number;
  tiene_conserje: 'no' | 'medio' | 'completo';
  aplicar_fondo_reserva: 'si_5' | 'si_10' | 'no';
}

export interface Outputs {
  cuota_mensual_total: number;
  gastos_comunes: number;
  cuota_ascensor: number;
  cuota_servicios_extra: number;
  fondo_reserva_aportacion: number;
  cuota_anual_total: number;
  desglose_json: Record<string, unknown>;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const coef = Math.max(0.1, Math.min(100, i.coeficiente_participacion));
  const numViviendas = Math.max(2, Math.floor(i.numero_viviendas));
  const gastosBase = Math.max(0, i.gastos_comunes_base);

  // 1. Gastos comunes base (aplicar coeficiente)
  // Fuente: Ley 49/1960 - Art. 9 distribución por coeficiente participación
  const gastosComunes = (gastosBase / 100) * coef;

  // 2. Cuota ascensor según tipo edificio
  // Estimaciones basadas en análisis de comunidades españolas
  let cuotaAscensor = 0;
  if (
    i.tipo_edificio === 'ascensor' ||
    i.tipo_edificio === 'ascensor_jardin' ||
    i.tipo_edificio === 'ascensor_piscina' ||
    i.tipo_edificio === 'lujo'
  ) {
    // Estimación: 400€/mes para comunidad de numViviendas (mantenimiento+revisión)
    const costAscensorComunidad = Math.min(500, 300 + numViviendas * 3);
    cuotaAscensor = (costAscensorComunidad / 100) * coef;
  }

  // 3. Cuota servicios extra (piscina, jardín, conserje)
  let cuotaServiciosExtra = 0;
  let costoServiciosExtraComunidad = 0;

  // Piscina
  if (
    i.tipo_edificio === 'ascensor_piscina' ||
    i.tipo_edificio === 'lujo'
  ) {
    // Estimación: 200-300€/mes mantenimiento piscina (cloro, análisis, reparaciones)
    costoServiciosExtraComunidad += 250;
  }

  // Jardín
  if (
    i.tipo_edificio === 'ascensor_jardin' ||
    i.tipo_edificio === 'lujo'
  ) {
    // Estimación: 150€/mes mantenimiento jardín y zonas verdes
    costoServiciosExtraComunidad += 150;
  }

  // Conserje
  if (i.tiene_conserje === 'medio') {
    // Conserje a tiempo parcial: ~600€/mes (salario mínimo parcial + SS aprox.)
    costoServiciosExtraComunidad += 600;
  } else if (i.tiene_conserje === 'completo') {
    // Conserje a tiempo completo: ~1.400€/mes (salario SMI + Seguridad Social)
    // Fuente: SEPE, Salario Mínimo 2026 ≈ 1.260€ + cotización SS ~314€
    costoServiciosExtraComunidad += 1400;
  }

  cuotaServiciosExtra = (costoServiciosExtraComunidad / 100) * coef;

  // 4. Subtotal antes de fondo reserva
  const subtotalMensual = gastosComunes + cuotaAscensor + cuotaServiciosExtra;

  // 5. Fondo de reserva
  // Fuente: Sentencia TS C-518/11 (2013) - mínimo 5% obligatorio
  let fondoReservaAportacion = 0;
  if (i.aplicar_fondo_reserva === 'si_5') {
    fondoReservaAportacion = subtotalMensual * 0.05;
  } else if (i.aplicar_fondo_reserva === 'si_10') {
    fondoReservaAportacion = subtotalMensual * 0.1;
  }

  // 6. CUOTA MENSUAL TOTAL
  const cuotaMensualTotal = subtotalMensual + fondoReservaAportacion;

  // 7. Cuota anual
  const cuotaAnualTotal = cuotaMensualTotal * 12;

  // 8. Desglose detallado
  const desglose = {
    concepto_gastos_comunes: {
      subtotal_comunidad_eur: gastosBase,
      tu_coeficiente_porcentaje: coef.toFixed(2),
      tu_aportacion_eur: Math.round(gastosComunes * 100) / 100,
      descripcion: 'Limpieza, luz común, agua, mantenimiento estructura'
    },
    concepto_ascensor: {
      incluido: i.tipo_edificio.includes('ascensor'),
      estimado_subtotal_eur: cuotaAscensor > 0 ? Math.round((cuotaAscensor / coef) * 100 * 100) / 100 : 0,
      tu_aportacion_eur: Math.round(cuotaAscensor * 100) / 100,
      descripcion: 'Mantenimiento, revisión anual, reparaciones ascensor'
    },
    concepto_servicios_extra: {
      piscina: i.tipo_edificio === 'ascensor_piscina' || i.tipo_edificio === 'lujo',
      jardin: i.tipo_edificio === 'ascensor_jardin' || i.tipo_edificio === 'lujo',
      conserje: i.tiene_conserje !== 'no',
      estimado_subtotal_eur: costoServiciosExtraComunidad,
      tu_aportacion_eur: Math.round(cuotaServiciosExtra * 100) / 100,
      descripcion: 'Piscina, jardín, conserje/portería'
    },
    fondo_reserva: {
      aplicado: i.aplicar_fondo_reserva !== 'no',
      porcentaje: i.aplicar_fondo_reserva === 'si_5' ? 5 : i.aplicar_fondo_reserva === 'si_10' ? 10 : 0,
      tu_aportacion_eur: Math.round(fondoReservaAportacion * 100) / 100,
      descripcion: 'Fondo obligatorio para obras extraordinarias (TS 2013)'
    },
    resumen_anual: {
      cuota_mensual_total_eur: Math.round(cuotaMensualTotal * 100) / 100,
      cuota_anual_total_eur: Math.round(cuotaAnualTotal * 100) / 100,
      numero_viviendas_comunidad: numViviendas,
      tu_coeficiente_participacion_porcentaje: coef.toFixed(2)
    }
  };

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const cuotaMensualR = r2(cuotaMensualTotal);
  const gastosComunesR = r2(gastosComunes);
  const cuotaAscensorR = r2(cuotaAscensor);
  const cuotaServiciosExtraR = r2(cuotaServiciosExtra);
  const fondoReservaR = r2(fondoReservaAportacion);

  const fmtEur = (n: number) =>
    n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const pctServicios = cuotaMensualR > 0 ? Math.round((cuotaServiciosExtraR / cuotaMensualR) * 100) : 0;
  const _insight = {
    title: 'Tu cuota de comunidad',
    text: `Te toca pagar **${fmtEur(cuotaMensualR)}/mes** (**${fmtEur(r2(cuotaAnualTotal))}** al año) por tu coeficiente del **${coef.toFixed(2)}%**${cuotaServiciosExtraR > 0 ? `. Servicios como ascensor, piscina, jardín o conserje pesan **${pctServicios}%** de tu cuota` : ''}.`,
    tone: cuotaMensualR >= 200 ? 'warn' : cuotaMensualR >= 100 ? 'neutral' : 'good',
    icon: '🏢',
  };

  const slices = [
    { label: 'Gastos comunes', value: gastosComunesR },
    { label: 'Ascensor', value: cuotaAscensorR },
    { label: 'Servicios extra', value: cuotaServiciosExtraR },
    { label: 'Fondo de reserva', value: fondoReservaR },
  ].filter((s) => s.value > 0);
  const _chart = slices.length >= 2
    ? {
        type: 'doughnut',
        slices,
        prefix: '',
        centerValue: fmtEur(cuotaMensualR),
        centerLabel: 'Cuota mensual',
        ariaLabel: `Desglose de tu cuota mensual de comunidad de ${fmtEur(cuotaMensualR)}`,
      }
    : undefined;

  return {
    cuota_mensual_total: cuotaMensualR,
    gastos_comunes: gastosComunesR,
    cuota_ascensor: cuotaAscensorR,
    cuota_servicios_extra: cuotaServiciosExtraR,
    fondo_reserva_aportacion: fondoReservaR,
    cuota_anual_total: r2(cuotaAnualTotal),
    desglose_json: desglose,
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
