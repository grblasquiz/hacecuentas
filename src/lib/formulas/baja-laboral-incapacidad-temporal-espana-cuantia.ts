export interface Inputs {
  salario_bruto_mensual: number;   // euros/mes
  dias_baja: number;               // días totales de baja
  contingencia: 'comun' | 'profesional';
  complemento_empresa_dias1_3: 'no' | '60' | '100';
  num_pagas: '12' | '14';
  tipo_irpf: number;               // porcentaje, ej. 15
}

export interface Outputs {
  base_reguladora_diaria: number;
  subsidio_bruto_total: number;
  retencion_irpf: number;
  cotizacion_ss_trabajador: number;
  subsidio_neto_total: number;
  sueldo_neto_normal: number;
  diferencia_neta: number;
  porcentaje_sueldo_recuperado: number;
  desglose_texto: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // ── Constantes 2026 (Fuente: TGSS, cuadro de cotización 2026) ──
  const TIPO_SS_TRABAJADOR = 0.0635;   // 4,70% CC + 1,55% desempleo + 0,10% formación
  const PORCENTAJE_TRAMO_4_20 = 0.60; // días 4-20 en contingencia común (art. 172 LGSS)
  const PORCENTAJE_TRAMO_21_PLUS = 0.75; // día 21+ en contingencia común
  const PORCENTAJE_PROFESIONAL = 0.75;   // desde día 1 en contingencia profesional

  // ── Validaciones básicas (sin throws, usamos defaults) ──
  const salario = Math.max(0, i.salario_bruto_mensual ?? 0);
  const dias = Math.max(1, Math.min(545, Math.round(i.dias_baja ?? 1)));
  const irpf = Math.max(0, Math.min(47, i.tipo_irpf ?? 15)) / 100;
  const pagas = i.num_pagas === '12' ? 12 : 14;

  // ── Base reguladora diaria ──
  // BR diaria = Salario bruto mensual × nº_pagas ÷ 12 ÷ 30
  // (Fuente: art. 170 LGSS — base de cotización mes anterior ÷ 30)
  const br_diaria = (salario * pagas) / 12 / 30;

  // ── Cálculo del subsidio por tramos ──
  let subsidio_bruto = 0;
  let desglose_lineas: string[] = [];

  if (i.contingencia === 'profesional') {
    // Contingencia profesional: 75% desde el día 1, sin periodo de espera
    const importe = dias * br_diaria * PORCENTAJE_PROFESIONAL;
    subsidio_bruto = importe;
    desglose_lineas.push(
      `Días 1-${dias} (contingencia profesional, 75%): ${formatEur(importe)}`
    );
  } else {
    // Contingencia común: tramos según LGSS art. 172

    // Tramo 1: días 1-3 (periodo de espera)
    const diasT1 = Math.min(dias, 3);
    let pct_t1 = 0;
    if (i.complemento_empresa_dias1_3 === '60') pct_t1 = 0.60;
    if (i.complemento_empresa_dias1_3 === '100') pct_t1 = 1.00;
    const importeT1 = diasT1 * br_diaria * pct_t1;
    subsidio_bruto += importeT1;
    if (diasT1 > 0) {
      const labelT1 =
        i.complemento_empresa_dias1_3 === 'no'
          ? `Días 1-3 (periodo de espera, sin subsidio SS): 0,00 €`
          : `Días 1-3 (complemento empresa ${i.complemento_empresa_dias1_3 === '60' ? '60%' : '100%'}): ${formatEur(importeT1)}`;
      desglose_lineas.push(labelT1);
    }

    // Tramo 2: días 4-15 (empresa paga al 60%, a cuenta de la SS)
    if (dias >= 4) {
      const diasT2 = Math.min(dias, 15) - 3;
      const importeT2 = diasT2 * br_diaria * PORCENTAJE_TRAMO_4_20;
      subsidio_bruto += importeT2;
      desglose_lineas.push(
        `Días 4-${3 + diasT2} (empresa/SS, 60%): ${formatEur(importeT2)}`
      );
    }

    // Tramo 3: días 16-20 (SS paga al 60%)
    if (dias >= 16) {
      const diasT3 = Math.min(dias, 20) - 15;
      const importeT3 = diasT3 * br_diaria * PORCENTAJE_TRAMO_4_20;
      subsidio_bruto += importeT3;
      desglose_lineas.push(
        `Días 16-${15 + diasT3} (SS, 60%): ${formatEur(importeT3)}`
      );
    }

    // Tramo 4: día 21 en adelante (SS paga al 75%)
    if (dias >= 21) {
      const diasT4 = dias - 20;
      const importeT4 = diasT4 * br_diaria * PORCENTAJE_TRAMO_21_PLUS;
      subsidio_bruto += importeT4;
      desglose_lineas.push(
        `Días 21-${dias} (SS, 75%): ${formatEur(importeT4)}`
      );
    }
  }

  // ── Deducciones ──
  // IRPF: tributa como rendimiento del trabajo (art. 17 LIRPF)
  const retencion_irpf = subsidio_bruto * irpf;

  // Cotización SS a cargo del trabajador: 6,35% sobre base reguladora × días
  // (el trabajador sigue cotizando durante la IT — art. 144 LGSS)
  const cotizacion_ss_trabajador = br_diaria * dias * TIPO_SS_TRABAJADOR;

  const subsidio_neto_total = Math.max(
    0,
    subsidio_bruto - retencion_irpf - cotizacion_ss_trabajador
  );

  // ── Sueldo neto normal de referencia (mismo número de días) ──
  // Aproximación: salario diario neto = salario bruto mensual × pagas ÷ 12 ÷ 30 × (1 - IRPF - SS)
  const salario_diario_bruto = (salario * pagas) / 12 / 30;
  const sueldo_neto_normal = Math.max(
    0,
    salario_diario_bruto * dias * (1 - irpf - TIPO_SS_TRABAJADOR)
  );

  const diferencia_neta = subsidio_neto_total - sueldo_neto_normal;

  const porcentaje_sueldo_recuperado =
    sueldo_neto_normal > 0
      ? (subsidio_neto_total / sueldo_neto_normal) * 100
      : 0;

  const desglose_texto = desglose_lineas.join(' | ');

  const pctRec = round2(porcentaje_sueldo_recuperado);
  const netoR = round2(subsidio_neto_total);
  const difR = round2(diferencia_neta);
  const tone = pctRec >= 95 ? 'good' : pctRec >= 75 ? 'neutral' : 'warn';
  const insightText = difR < 0
    ? `Durante la baja cobrás unos **${formatEur(netoR)}** netos: recuperás el **${pctRec.toFixed(0)}%** de tu sueldo normal y perdés cerca de **${formatEur(Math.abs(difR))}** frente a trabajar esos días.`
    : `Durante la baja cobrás unos **${formatEur(netoR)}** netos, el **${pctRec.toFixed(0)}%** de tu sueldo habitual: tu ingreso prácticamente no varía respecto a trabajar esos días.`;

  return {
    base_reguladora_diaria: round2(br_diaria),
    subsidio_bruto_total: round2(subsidio_bruto),
    retencion_irpf: round2(retencion_irpf),
    cotizacion_ss_trabajador: round2(cotizacion_ss_trabajador),
    subsidio_neto_total: netoR,
    sueldo_neto_normal: round2(sueldo_neto_normal),
    diferencia_neta: difR,
    porcentaje_sueldo_recuperado: pctRec,
    desglose_texto,
    _insight: {
      title: 'Cuánto de tu sueldo recuperás',
      text: insightText,
      tone,
      icon: '🏥',
    },
    _chart: {
      type: 'scale',
      marker: Math.round(pctRec),
      markerLabel: `${pctRec.toFixed(0)}% recuperado`,
      min: 0,
      segments: [
        { nombre: 'Pérdida alta', max: 60, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Pérdida moderada', max: 75, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Casi completo', max: 95, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Sin pérdida', max: Math.max(110, Math.ceil(pctRec) + 5), color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Durante la baja recuperás el ${pctRec.toFixed(0)} por ciento de tu sueldo neto habitual`,
    },
  };
}

// ── Utilidades ──
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatEur(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
