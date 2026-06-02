export interface Inputs {
  salario_diario_bruto: number; // MXN
  fecha_nacimiento_hijo: string; // YYYY-MM-DD
  incluir_domingos: 'si' | 'no';
}

export interface Outputs {
  dias_totales_licencia: number;
  monto_total_cobrar: number; // MXN
  salario_diario_promedio: number; // MXN
  comparativa_ocde: string;
  notas_importantes: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const salarioDiario = Math.max(0, i.salario_diario_bruto || 0);
  
  // Constante LFT art. 132: siempre 5 días laborables
  // Fuente: Cámara de Diputados 2015, reforma vigente 2026
  const DIAS_PATERNIDAD_MEXICO = 5;
  
  // Cálculo de monto total
  const montoTotal = salarioDiario * DIAS_PATERNIDAD_MEXICO;
  
  // Validación de fecha
  let fechaTexto = '';
  try {
    const fecha = new Date(i.fecha_nacimiento_hijo);
    if (isNaN(fecha.getTime())) {
      fechaTexto = 'Fecha no válida';
    } else {
      const hoy = new Date();
      const diferenciaDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
      if (diferenciaDias > 365) {
        fechaTexto = `Nacimiento hace ${Math.floor(diferenciaDias / 365)} años. Licencia puede haber prescrito.`;
      } else if (diferenciaDias >= 0) {
        fechaTexto = `Nacimiento hace ${diferenciaDias} días. Aún en plazo para solicitar.`;
      } else {
        fechaTexto = 'Fecha futura. Prepárate para solicitar en RR.HH.';
      }
    }
  } catch (e) {
    fechaTexto = 'Error procesando fecha.';
  }
  
  // Cálculo de retenciones estimadas (2026 México)
  // ISR aprox. 10-20% según tramo; IMSS trabajador 7.65%
  const tasaISREstimada = 0.15; // promedio 15%
  const tasaIMSSEstimada = 0.0765; // 7.65% aportación trabajador
  const brutoPorISR = montoTotal * tasaISREstimada;
  const brutoPorIMSS = montoTotal * tasaIMSSEstimada;
  const netoProbable = montoTotal - brutoPorISR - brutoPorIMSS;
  
  // Descripción de días laborables
  const descDias = i.incluir_domingos === 'si'
    ? 'Los 5 días laborables incluyen domingos si trabajas ese día.'
    : 'Los 5 días son lunes a viernes (estándar 5 días por semana).';
  
  // Comparativa OCDE 2024
  const comparativaOCDE = 
    'México: 5 días laborables (mínimo legal global). ' +
    'Comparativa: España 15 días, Brasil 5 días, Colombia 8 días, Chile 5 días, Argentina 2 días. ' +
    'Promedio OCDE: 12-16 semanas. ' +
    'México es el mínimo legal junto a Chile; muy rezagado vs España y OCDE.';
  
  const notasImportantes =
    `✓ Monto bruto: $${montoTotal.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN\n` +
    `✓ Retención ISR estimada (~15%): $${brutoPorISR.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN\n` +
    `✓ Retención IMSS trabajador (~7.65%): $${brutoPorIMSS.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN\n` +
    `✓ Neto probable: $${Math.max(0, netoProbable).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN\n` +
    `✓ ${descDias}\n` +
    `✓ ${fechaTexto}\n` +
    `✓ Base legal: LFT artículo 132, fracción XXVII (reforma 2015, vigente 2026).\n` +
    `✓ Aplica a: Trabajadores IMSS sector privado y público. Excluidos: independientes, trabajo hogar sin aseguramiento.\n` +
    `✓ Múltiples hijos: 5 días totales, no acumulativos por hijo.\n` +
    `✓ Protección: No puedes ser despedido por solicitar paternidad. Denuncia ante PROFEDET si hay represalia.`;
  
  // Donut: bruto = neto + ISR + IMSS (slices enteros que suman el bruto redondeado)
  const montoRedondeado = Math.round(montoTotal);
  const isrRedondeado = Math.round(brutoPorISR);
  const imssRedondeado = Math.round(brutoPorIMSS);
  const netoRedondeado = montoRedondeado - isrRedondeado - imssRedondeado;
  let chart: any = undefined;
  if (montoRedondeado > 0) {
    chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Neto en mano', value: netoRedondeado },
        { label: 'ISR (~15%)', value: isrRedondeado },
        { label: 'IMSS (~7.65%)', value: imssRedondeado },
      ],
      prefix: '$',
      centerValue: '$' + montoRedondeado.toLocaleString('es-MX'),
      centerLabel: 'Bruto 5 días',
      ariaLabel: 'Reparto del pago bruto de los 5 días de paternidad entre neto, ISR e IMSS',
    };
  }

  // Insight: monto neto estimado + recordatorio del mínimo legal
  const netoFmt = '$' + Math.round(Math.max(0, netoProbable)).toLocaleString('es-MX');
  const brutoFmt = '$' + montoRedondeado.toLocaleString('es-MX');
  const insightText = montoRedondeado > 0
    ? `Por los **5 días laborables** (mínimo legal de la LFT) cobrás **${brutoFmt} MXN** brutos; tras ISR e IMSS te quedan unos **${netoFmt} MXN**. México empata con Chile en el piso más bajo de la región.`
    : `La LFT garantiza **5 días laborables** de paternidad pagados. Ingresá tu salario diario para estimar cuánto cobrás. Es el mínimo legal de la región.`;

  return {
    dias_totales_licencia: DIAS_PATERNIDAD_MEXICO,
    monto_total_cobrar: Math.round(montoTotal * 100) / 100,
    salario_diario_promedio: Math.round(salarioDiario * 100) / 100,
    comparativa_ocde: comparativaOCDE,
    notas_importantes: notasImportantes,
    _insight: {
      title: 'Tu licencia de paternidad',
      text: insightText,
      tone: 'warn',
      icon: '👨‍🍼',
    },
    ...(chart ? { _chart: chart } : {})
  };
}
