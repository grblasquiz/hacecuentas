export interface Inputs { [k: string]: number | string; }
export interface Outputs {
  gananciasImpuesto: string;
  bienesPersonales: string;
  total: string;
  _insight?: any;
  _chart?: any;
  [k: string]: string | number | any;
}
export function impuestoCriptoArgentinaDeclaracionAnual(i: Inputs): Outputs {
  const g=Number(i.gananciaRealizadaUsd)||0; const s=Number(i.saldoCripto31dic)||0; const c=Number(i.cotizacionMep)||1;
  const gan=g*0.15; const saldoPesos=s*c; const bp=saldoPesos>350000000?saldoPesos*0.0075:0; const total=gan*c+bp;

  const ganPesos = gan * c;
  const fmtARS = (v: number) => '$' + Math.round(v).toLocaleString('es-AR');

  const insight: any = {
    title: 'Tu carga impositiva cripto',
    text: total > 0
      ? `Entre ganancias realizadas (15% → **${fmtARS(ganPesos)}**)` +
        (bp > 0
          ? ` y Bienes Personales sobre tu saldo (**${fmtARS(bp)}**)`
          : ' y sin Bienes Personales (tu saldo quedó debajo del mínimo no imponible)') +
        `, declarás un total estimado de **${fmtARS(total)}**.`
      : `Con los datos cargados no te queda impuesto cripto a pagar: ni ganancias gravadas ni saldo por encima del mínimo no imponible de Bienes Personales.`,
    tone: total > 0 ? 'warn' : 'good',
    icon: '🪙',
  };

  const out: Outputs = {
    gananciasImpuesto:`USD ${gan.toFixed(2)}`,
    bienesPersonales:bp>0?`$${Math.round(bp).toLocaleString('es-AR')}`:'No aplica (debajo MNI)',
    total:`$${Math.round(total).toLocaleString('es-AR')}`,
    _insight: insight,
  };

  // Gráfico solo si el total se compone de partes que suman (ambos tributos presentes)
  if (ganPesos > 0 && bp > 0) {
    out._chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Ganancias (15%)', value: Math.round(ganPesos) },
        { label: 'Bienes Personales', value: Math.round(bp) },
      ],
      prefix: '$',
      centerValue: fmtARS(total),
      centerLabel: 'Total a declarar',
      ariaLabel: 'Composición del impuesto total: impuesto a las ganancias más Bienes Personales',
    };
  }

  return out;
}
