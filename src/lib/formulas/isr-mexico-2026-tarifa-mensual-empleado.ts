export interface Inputs {
  salario_bruto_mensual: number;
  aplicar_subsidio: boolean;
}

export interface Outputs {
  isr_bruto: number;
  subsidio_empleo: number;
  isr_neto: number;
  aportacion_imss: number;
  neto_en_mano: number;
  tramo_aplicado: number;
  tasa_efectiva: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).aplicar_subsidio = (i as any).aplicar_subsidio === true || (i as any).aplicar_subsidio === 'true';
  const salario = i.salario_bruto_mensual || 0;

  // Fuente única verificada: Anexo 8 RMF 2026. Evita que la calculadora,
  // ejemplos y tablas diverjan por mantener copias locales de la tarifa.
  const tramos = MEXICO_2026.isrTarifaMensual;
  let tramo_idx = tramos.findIndex(([limInf, limSup]) => salario >= limInf && salario <= limSup);
  if (tramo_idx < 0) tramo_idx = salario > 0 ? tramos.length - 1 : 0;
  const isr_bruto = isrMensual2026(salario);

  // Decreto DOF 31-dic-2025: $536,22 mensuales sólo hasta $11.492,66.
  const subsidio_empleo = i.aplicar_subsidio ? subsidioEmpleoMensual2026(salario) : 0;

  // Paso 3: Calcular ISR neto (después de subsidio)
  const isr_neto = Math.max(0, isr_bruto - subsidio_empleo);

  // Cuota obrera IMSS por componentes LSS, con excedente de 3 UMA y tope de 25 UMA.
  const aportacion_imss = cuotaImssObreroMensual(salario);

  // Paso 5: Neto en mano
  const neto_en_mano = salario - isr_neto - aportacion_imss;

  // Paso 6: Tasa efectiva de ISR
  const tasa_efectiva = salario > 0 ? (isr_neto / salario) * 100 : 0;

  // Paso 7: Tasa marginal del tramo aplicado
  const tramo_aplicado = tramos[tramo_idx][3] * 100;

  const isrNetoOut = Math.round(isr_neto * 100) / 100;
  const imssOut = Math.round(aportacion_imss * 100) / 100;
  const netoOut = Math.round(neto_en_mano * 100) / 100;
  const subsidioOut = Math.round(subsidio_empleo * 100) / 100;
  const tasaEfectivaOut = Math.round(tasa_efectiva * 100) / 100;
  const fmtMXN = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const pctNeto = salario > 0 ? Math.round((netoOut / salario) * 1000) / 10 : 0;

  const _insight = {
    title: salario <= 0 ? 'Ingresá tu salario' : 'Tu neto en mano',
    text: salario <= 0
      ? 'Ingresa tu salario bruto mensual para estimar el ISR, el IMSS y el neto que recibes.'
      : subsidioOut > 0
      ? `De un bruto de **${fmtMXN(salario)}** te descuentan **${fmtMXN(isrNetoOut)}** de ISR (ya con subsidio de ${fmtMXN(subsidioOut)}) y **${fmtMXN(imssOut)}** de IMSS: te quedan **${fmtMXN(netoOut)}** en mano, el **${pctNeto}%**.`
      : `De un bruto de **${fmtMXN(salario)}** te descuentan **${fmtMXN(isrNetoOut)}** de ISR (tasa marginal ${Math.round(tramo_aplicado * 100) / 100}%) y **${fmtMXN(imssOut)}** de IMSS: recibes **${fmtMXN(netoOut)}** netos, el **${pctNeto}%**.`,
    tone: salario <= 0 ? 'neutral' : pctNeto >= 85 ? 'good' : pctNeto < 70 ? 'warn' : 'neutral',
    icon: '💵',
  };

  const out: Outputs = {
    isr_bruto: Math.round(isr_bruto * 100) / 100,
    subsidio_empleo: subsidioOut,
    isr_neto: isrNetoOut,
    aportacion_imss: imssOut,
    neto_en_mano: netoOut,
    tramo_aplicado: Math.round(tramo_aplicado * 100) / 100,
    tasa_efectiva: tasaEfectivaOut,
    _insight,
  };

  // Donut: el salario bruto se reparte entre neto en mano + ISR + IMSS (suman el bruto)
  if (salario > 0 && netoOut >= 0) {
    const slices = [
      { label: 'Neto en mano', value: netoOut },
      { label: 'ISR neto', value: isrNetoOut },
      { label: 'IMSS (empleado)', value: imssOut },
    ].filter(s => s.value > 0);
    if (slices.length >= 2) {
      out._chart = {
        type: 'doughnut',
        slices,
        prefix: '$',
        centerValue: fmtMXN(salario),
        centerLabel: 'Salario bruto',
        ariaLabel: 'Reparto del salario bruto mensual entre neto en mano, ISR e IMSS',
      };
    }
  }

  return out;
}
import {
  MEXICO_2026,
  cuotaImssObreroMensual,
  isrMensual2026,
  subsidioEmpleoMensual2026,
} from '../data/mexico-2026';
