export interface Inputs {
  monto_honorarios_sin_iva: number;
  sujeto_retencion: boolean;
  tiene_rfc: boolean;
  ingresos_anuales_estimados: number;
}

export interface Outputs {
  iva_trasladado: number;
  monto_total_con_iva: number;
  retencion_isr: number;
  retencion_iva: number;
  retencion_total: number;
  neto_recibido: number;
  gastos_deducibles_max: number;
  utilidad_neta: number;
  obligacion_declarar: string;
  mensaje_rfc: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México - SAT
  const TASA_ISR_RETENCION = 0.10;      // 10% retención ISR (Art. 106-A CFF)
  const TASA_IVA = 0.16;                 // 16% IVA trasladado
  const TASA_RETENCION_IVA = 0.66625;   // 66.625% del IVA trasladado (10.66% sobre base)
  const UMBRAL_RFC_OBLIGATORIO = 600000; // $600,000 MXN anuales
  const PORCENTAJE_GASTOS_DEDUCIBLES = 0.30; // Estimación 30% máx deducible

  const monto = i.monto_honorarios_sin_iva || 0;
  const tieneRfc = i.tiene_rfc || false;
  const ingresosAnuales = i.ingresos_anuales_estimados || 0;
  const sujetoRetencion = i.sujeto_retencion !== false;

  // Validación mínima
  if (monto < 0) {
    return {
      iva_trasladado: 0,
      monto_total_con_iva: 0,
      retencion_isr: 0,
      retencion_iva: 0,
      retencion_total: 0,
      neto_recibido: 0,
      gastos_deducibles_max: 0,
      utilidad_neta: 0,
      obligacion_declarar: "Error: Monto negativo.",
      mensaje_rfc: "Verifica datos de entrada.",
      _insight: {
        title: 'Revisá el monto',
        text: 'El monto de honorarios no puede ser negativo. Ingresá un valor mayor o igual a cero.',
        tone: 'warn',
        icon: '⚠️',
      },
    };
  }

  // Cálculos de IVA
  const ivaTransladado = monto * TASA_IVA;
  const montoTotalConIva = monto + ivaTransladado;

  // Retenciones (solo aplican si es sujeto de retención)
  let retencionIsr = 0;
  let retencionIva = 0;
  let retencionTotal = 0;
  let netoRecibido = 0;

  if (sujetoRetencion) {
    retencionIsr = monto * TASA_ISR_RETENCION;
    retencionIva = ivaTransladado * TASA_RETENCION_IVA;
    retencionTotal = retencionIsr + retencionIva;
    netoRecibido = monto - retencionIsr - retencionIva;
  } else {
    // Si NO es sujeto de retención (p.ej., calcula como pagador)
    netoRecibido = monto;
  }

  // Gastos deducibles (aproximación)
  const gastosDeduciblesMax = monto * PORCENTAJE_GASTOS_DEDUCIBLES;
  const utilidadNeta = netoRecibido - gastosDeduciblesMax;

  // Lógica de obligación de declarar
  let obligacionDeclarar = "No";
  let mensajeRfc = "No obligatorio RFC si ingresos ≤ $600,000 anuales.";

  if (tieneRfc) {
    obligacionDeclarar = "Sí, tienes RFC activo. Debes declarar anualmente ante SAT (31 marzo).";
    if (ingresosAnuales > UMBRAL_RFC_OBLIGATORIO) {
      mensajeRfc = `Ingresos estimados ${ingresosAnuales.toLocaleString('es-MX')} MXN > $${UMBRAL_RFC_OBLIGATORIO.toLocaleString('es-MX')}. RFC OBLIGATORIO. Mantén activo y actualizado.`;
    } else {
      mensajeRfc = `Ingresos estimados ${ingresosAnuales.toLocaleString('es-MX')} MXN < $${UMBRAL_RFC_OBLIGATORIO.toLocaleString('es-MX')}. RFC activo: sigue declarando anualmente (cumplimiento).`;
    }
  } else {
    if (ingresosAnuales > UMBRAL_RFC_OBLIGATORIO) {
      obligacionDeclarar = "Sí. Ingresos > $600,000 anuales: RFC OBLIGATORIO. Regístrate inmediatamente en SAT.";
      mensajeRfc = `⚠️ URGENTE: Debes darte de alta en RFC antes de 30 días. Ingresos ${ingresosAnuales.toLocaleString('es-MX')} MXN exceden límite.`;
    } else {
      obligacionDeclarar = "No (por ahora). Ingresos < $600,000 anuales y sin RFC.";
      mensajeRfc = "Si esperas superar $600,000 en ejercicio futuro, solicita RFC de forma preventiva en SAT.gob.mx.";
    }
  }

  const fmtMXN = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const pctNeto = monto > 0 ? Math.round((netoRecibido / monto) * 1000) / 10 : 0;

  const _insight = {
    title: sujetoRetencion ? 'Cobrás con retención' : 'Sin retención',
    text: sujetoRetencion
      ? `De tus honorarios de **${fmtMXN(monto)}** te retienen **${fmtMXN(retencionTotal)}** (ISR + IVA) y cobrás **${fmtMXN(netoRecibido)}** netos, el **${pctNeto}%**. Esas retenciones son anticipo de tus impuestos: las acreditás en tu declaración anual.`
      : `No hay retención sobre estos **${fmtMXN(monto)}**: cobrás el monto completo más el IVA trasladado (**${fmtMXN(ivaTransladado)}**), que vos enterás al SAT.`,
    tone: sujetoRetencion ? 'warn' : 'neutral',
    icon: '🧾',
  };

  const out: Outputs = {
    iva_trasladado: Math.round(ivaTransladado * 100) / 100,
    monto_total_con_iva: Math.round(montoTotalConIva * 100) / 100,
    retencion_isr: Math.round(retencionIsr * 100) / 100,
    retencion_iva: Math.round(retencionIva * 100) / 100,
    retencion_total: Math.round(retencionTotal * 100) / 100,
    neto_recibido: Math.round(netoRecibido * 100) / 100,
    gastos_deducibles_max: Math.round(gastosDeduciblesMax * 100) / 100,
    utilidad_neta: Math.round(utilidadNeta * 100) / 100,
    obligacion_declarar: obligacionDeclarar,
    mensaje_rfc: mensajeRfc,
    _insight,
  };

  // Donut: de tus honorarios (sin IVA), cuánto cobrás neto vs cuánto se retiene (suman el monto)
  if (sujetoRetencion && retencionTotal > 0 && monto > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Neto a recibir', value: Math.round(netoRecibido * 100) / 100 },
        { label: 'Retención ISR', value: Math.round(retencionIsr * 100) / 100 },
        { label: 'Retención IVA', value: Math.round(retencionIva * 100) / 100 },
      ],
      prefix: '$',
      centerValue: fmtMXN(monto),
      centerLabel: 'Honorarios',
      ariaLabel: 'Reparto de los honorarios entre el neto a recibir y las retenciones de ISR e IVA',
    };
  }

  return out;
}
