export interface Inputs {
  tipo_prestacion: string;
  haber_actual: number;
  dni_terminacion?: number;
}

export interface Outputs {
  es_elegible: string;
  monto_bono: number;
  haber_total: number;
  fecha_acreditacion: string;
  observaciones: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const haberActual = Number(i.haber_actual) || 0;
  const dniTerminacion = Number(i.dni_terminacion) || 0;
  const tipoPrestacion = String(i.tipo_prestacion || 'jubilacion_aportante');

  // Límite de haber para elegibilidad (aproximadamente 2 SMVM 2026)
  const LIMITE_HABER_2026 = 411989;

  // Montos de bono según tipo de prestación (junio 2026)
  const MONTOS_BONO: { [key: string]: number } = {
    jubilacion_aportante: 70000,
    jubilacion_no_contributiva: 70000,
    auh: 0,
    pension_viudez: 70000,
    pension_invalidez: 70000
  };

  // Determinar elegibilidad
  const esElegible = haberActual > 0 && haberActual <= LIMITE_HABER_2026;
  const montoBono = esElegible ? (MONTOS_BONO[tipoPrestacion] || 0) : 0;
  const haberTotal = haberActual + montoBono;

  // Determinar fecha de acreditación según terminación de DNI
  let fechaAcreditacion = '';
  if (dniTerminacion >= 0 && dniTerminacion <= 99) {
    if (dniTerminacion >= 0 && dniTerminacion <= 4) {
      fechaAcreditacion = 'Primer lote: 2-5 de junio';
    } else if (dniTerminacion >= 5 && dniTerminacion <= 9) {
      fechaAcreditacion = 'Segundo lote: 5-10 de junio';
    } else if (dniTerminacion >= 10 && dniTerminacion <= 14) {
      fechaAcreditacion = 'Tercer lote: 10-15 de junio';
    } else if (dniTerminacion >= 15 && dniTerminacion <= 19) {
      fechaAcreditacion = 'Cuarto lote: 15-18 de junio';
    } else if (dniTerminacion >= 20 && dniTerminacion <= 24) {
      fechaAcreditacion = 'Quinto lote: 18-22 de junio';
    } else if (dniTerminacion >= 25 && dniTerminacion <= 29) {
      fechaAcreditacion = 'Sexto lote: 22-25 de junio';
    } else if (dniTerminacion >= 30 && dniTerminacion <= 34) {
      fechaAcreditacion = 'Séptimo lote: 25-28 de junio';
    } else if (dniTerminacion >= 35 && dniTerminacion <= 39) {
      fechaAcreditacion = 'Octavo lote: 28 de junio - 2 de julio';
    } else if (dniTerminacion >= 40 && dniTerminacion <= 44) {
      fechaAcreditacion = 'Noveno lote: 2-5 de julio';
    } else if (dniTerminacion >= 45 && dniTerminacion <= 49) {
      fechaAcreditacion = 'Décimo lote: 5-8 de julio';
    } else if (dniTerminacion >= 50 && dniTerminacion <= 54) {
      fechaAcreditacion = 'Undécimo lote: 8-12 de julio';
    } else if (dniTerminacion >= 55 && dniTerminacion <= 59) {
      fechaAcreditacion = 'Duodécimo lote: 12-15 de julio';
    } else if (dniTerminacion >= 60 && dniTerminacion <= 64) {
      fechaAcreditacion = 'Decimotercer lote: 15-18 de julio';
    } else if (dniTerminacion >= 65 && dniTerminacion <= 69) {
      fechaAcreditacion = 'Decimocuarto lote: 18-22 de julio';
    } else if (dniTerminacion >= 70 && dniTerminacion <= 74) {
      fechaAcreditacion = 'Decimoquinto lote: 22-25 de julio';
    } else if (dniTerminacion >= 75 && dniTerminacion <= 79) {
      fechaAcreditacion = 'Decimosexto lote: 25-28 de julio';
    } else if (dniTerminacion >= 80 && dniTerminacion <= 84) {
      fechaAcreditacion = 'Decimoséptimo lote: 28-31 de julio';
    } else if (dniTerminacion >= 85 && dniTerminacion <= 89) {
      fechaAcreditacion = 'Decimoctavo lote: 31 de julio - 4 de agosto';
    } else {
      fechaAcreditacion = 'Decimonoveno lote: 4-8 de agosto';
    }
  } else {
    fechaAcreditacion = 'Ingresá tu terminación de DNI para ver fecha estimada';
  }

  let observaciones = '';
  if (!esElegible && haberActual > LIMITE_HABER_2026) {
    observaciones = `Tu haber (\$${haberActual.toLocaleString('es-AR')}) supera el límite de \$${LIMITE_HABER_2026.toLocaleString('es-AR')}. No aplica bono en este período.`;
  } else if (esElegible && montoBono > 0) {
    observaciones = `Cumplís requisitos. Bono de \$${montoBono.toLocaleString('es-AR')} según tipo de prestación: ${tipoPrestacion.replace(/_/g, ' ')}.`;
  } else if (haberActual <= 0) {
    observaciones = 'Ingresá un haber válido mayor a 0 para calcular.';
  } else {
    observaciones = 'Verifica tus datos. Contactá a ANSES si hay dudas.';
  }

  let _insight: any;
  if (esElegible && montoBono > 0) {
    const pct = haberActual > 0 ? (montoBono / haberActual) * 100 : 0;
    _insight = {
      title: 'Te corresponde el bono',
      text: `Con un haber de **$${haberActual.toLocaleString('es-AR')}** cobrás un bono de **$${montoBono.toLocaleString('es-AR')}**, así que este mes percibís **$${haberTotal.toLocaleString('es-AR')}** en total (un **${pct.toFixed(0)}%** extra). El bono es por única vez y no se incorpora al haber.`,
      tone: 'good',
      icon: '💸',
    };
  } else if (haberActual > LIMITE_HABER_2026) {
    _insight = {
      title: 'Tu haber supera el tope',
      text: `Tu haber de **$${haberActual.toLocaleString('es-AR')}** está por encima del límite de **$${LIMITE_HABER_2026.toLocaleString('es-AR')}**, por eso este bono no aplica en junio 2026. Seguís cobrando tu haber normal sin el refuerzo.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: 'Completá tus datos',
      text: `Ingresá un haber válido y tu tipo de prestación para ver si te corresponde el bono de ANSES y cuánto cobrarías en total.`,
      tone: 'neutral',
      icon: '📝',
    };
  }

  const _chart = (esElegible && montoBono > 0)
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Tu haber', value: haberActual },
          { label: 'Bono ANSES', value: montoBono },
        ],
        prefix: '$',
        centerValue: `$${haberTotal.toLocaleString('es-AR')}`,
        centerLabel: 'a cobrar',
        ariaLabel: `De $${haberTotal.toLocaleString('es-AR')} a cobrar, $${haberActual.toLocaleString('es-AR')} es tu haber y $${montoBono.toLocaleString('es-AR')} el bono`,
      }
    : undefined;

  return {
    es_elegible: esElegible ? 'Sí' : 'No',
    monto_bono: montoBono,
    haber_total: haberTotal,
    fecha_acreditacion: fechaAcreditacion,
    observaciones: observaciones,
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
