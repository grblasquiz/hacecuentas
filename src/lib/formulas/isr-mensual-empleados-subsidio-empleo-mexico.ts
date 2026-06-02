export interface Inputs {
  salario_bruto_mensual: number;
  periodo_pago: 'mensual' | 'quincenal' | 'semanal';
}

export interface Outputs {
  subsidio_empleo: number;
  isr_bruto: number;
  isr_neto: number;
  salario_neto: number;
  tasa_efectiva: number;
  beneficio_subsidio: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Conversión a base mensual si aplica
  const salario_mensual = i.periodo_pago === 'quincenal' 
    ? i.salario_bruto_mensual * 2 
    : i.periodo_pago === 'semanal' 
    ? i.salario_bruto_mensual * 4.33 
    : i.salario_bruto_mensual;

  // Tablas ISR 2026 (SAT) - tramos mensuales
  const isr_tramos_2026 = [
    { limite: 5380.88, cuota_fija: 0, tasa_excedente: 0.0192 },
    { limite: 8071.28, cuota_fija: 103.31, tasa_excedente: 0.064 },
    { limite: 12106.92, cuota_fija: 372.27, tasa_excedente: 0.1088 },
    { limite: 21185.64, cuota_fija: 1307.78, tasa_excedente: 0.16 },
    { limite: 37824.96, cuota_fija: 2757.85, tasa_excedente: 0.192 },
    { limite: Infinity, cuota_fija: 6944.78, tasa_excedente: 0.2136 }
  ];

  // Función para calcular ISR bruto
  function calcularISRBruto(salario: number): number {
    let isrBruto = 0;
    let limiteAnterior = 0;

    for (let i = 0; i < isr_tramos_2026.length; i++) {
      const tramo = isr_tramos_2026[i];
      if (salario <= tramo.limite) {
        const excedente = salario - limiteAnterior;
        isrBruto = tramo.cuota_fija + (excedente * tramo.tasa_excedente);
        break;
      }
      limiteAnterior = tramo.limite;
    }

    return Math.max(0, isrBruto);
  }

  // Tabla subsidio al empleo 2026 (SAT) - puntos de control
  const subsidio_tramos_2026 = [
    { salario: 5000, subsidio: 475 },
    { salario: 8071.28, subsidio: 425 },
    { salario: 12106.92, subsidio: 300 },
    { salario: 15000, subsidio: 200 },
    { salario: 21185.64, subsidio: 100 },
    { salario: 27000, subsidio: 0 },
    { salario: Infinity, subsidio: 0 }
  ];

  // Función para calcular subsidio al empleo (interpolación lineal)
  function calcularSubsidio(salario: number): number {
    if (salario > 27000) return 0;

    for (let i = 0; i < subsidio_tramos_2026.length - 1; i++) {
      const tramo_actual = subsidio_tramos_2026[i];
      const tramo_siguiente = subsidio_tramos_2026[i + 1];

      if (salario >= tramo_actual.salario && salario < tramo_siguiente.salario) {
        // Interpolación lineal entre tramos
        const rango_salario = tramo_siguiente.salario - tramo_actual.salario;
        const rango_subsidio = tramo_siguiente.subsidio - tramo_actual.subsidio;
        const progreso = (salario - tramo_actual.salario) / rango_salario;
        const subsidio_interpolado = tramo_actual.subsidio + (progreso * rango_subsidio);
        return Math.max(0, Math.min(tramo_actual.subsidio, subsidio_interpolado));
      }
    }

    return 0;
  }

  // Cálculos
  const isr_bruto_total = calcularISRBruto(salario_mensual);
  const subsidio_empleo_total = calcularSubsidio(salario_mensual);
  const isr_neto_total = Math.max(0, isr_bruto_total - subsidio_empleo_total);
  const salario_neto_total = salario_mensual - isr_neto_total;
  const tasa_efectiva_pct = (isr_neto_total / salario_mensual) * 100;
  const beneficio_subsidio_total = subsidio_empleo_total;

  // Si período no es mensual, ajustar outputs proporcionalmente
  let factor = 1;
  if (i.periodo_pago === 'quincenal') {
    factor = 0.5;
  } else if (i.periodo_pago === 'semanal') {
    factor = 1 / 4.33;
  }

  const subsidioOut = Math.round((subsidio_empleo_total * factor) * 100) / 100;
  const isrBrutoOut = Math.round((isr_bruto_total * factor) * 100) / 100;
  const isrNetoOut = Math.round((isr_neto_total * factor) * 100) / 100;
  const salarioNetoOut = Math.round((salario_neto_total * factor) * 100) / 100;
  const tasaEfectivaOut = Math.round(tasa_efectiva_pct * 100) / 100;
  const beneficioOut = Math.round((beneficio_subsidio_total * factor) * 100) / 100;

  const fmtMXN = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const periodoTxt = i.periodo_pago === 'quincenal' ? 'por quincena' : i.periodo_pago === 'semanal' ? 'por semana' : 'al mes';
  const brutoOut = Math.round((salarioNetoOut + isrNetoOut) * 100) / 100;

  const _insight = {
    title: isrNetoOut <= 0 ? 'No pagás ISR' : beneficioOut > 0 ? 'El subsidio te baja el ISR' : 'ISR retenido',
    text: isrNetoOut <= 0
      ? `Con tu salario, el subsidio al empleo (**${fmtMXN(subsidioOut)}**) cubre todo el ISR: no te retienen impuesto y cobrás **${fmtMXN(salarioNetoOut)}** netos ${periodoTxt}.`
      : beneficioOut > 0
      ? `El subsidio al empleo te descuenta **${fmtMXN(beneficioOut)}** del ISR: pagás **${fmtMXN(isrNetoOut)}** netos (en vez de ${fmtMXN(isrBrutoOut)}) y cobrás **${fmtMXN(salarioNetoOut)}** ${periodoTxt}. Tasa efectiva: **${tasaEfectivaOut}%**.`
      : `Tu salario supera el tope del subsidio, así que retenés el ISR completo de **${fmtMXN(isrNetoOut)}** ${periodoTxt} y cobrás **${fmtMXN(salarioNetoOut)}** netos. Tasa efectiva: **${tasaEfectivaOut}%**.`,
    tone: isrNetoOut <= 0 || beneficioOut > 0 ? 'good' : 'neutral',
    icon: '💵',
  };

  const out: Outputs = {
    subsidio_empleo: subsidioOut,
    isr_bruto: isrBrutoOut,
    isr_neto: isrNetoOut,
    salario_neto: salarioNetoOut,
    tasa_efectiva: tasaEfectivaOut,
    beneficio_subsidio: beneficioOut,
    _insight,
  };

  // Donut: el salario se reparte entre lo que cobrás neto y el ISR retenido (suman el bruto)
  if (isrNetoOut > 0 && salarioNetoOut > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Salario neto', value: salarioNetoOut },
        { label: 'ISR neto', value: isrNetoOut },
      ],
      prefix: '$',
      centerValue: fmtMXN(brutoOut),
      centerLabel: 'Salario bruto',
      ariaLabel: 'Reparto del salario bruto entre el neto a cobrar y el ISR retenido',
    };
  }

  return out;
}
