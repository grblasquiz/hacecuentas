/** Impuesto AR al ejercer RSU/ISO de startup USA siendo residente fiscal AR */
export interface Inputs { cantidadAcciones: number; precioEjercicioUsd: number; fmvEjercicioUsd: number; tipoEquity: 'RSU' | 'ISO' | 'NSO'; alicuotaGananciasPct: number; }
export interface Outputs { spreadGravadoUsd: number; impuestoArUsd: number; netoUsd: number; explicacion: string; _insight?: any; _chart?: any; }
export function equityStartupRsuIsoImpuestoEjercicioAr(i: Inputs): Outputs {
  const acciones = Number(i.cantidadAcciones);
  const strike = Number(i.precioEjercicioUsd) || 0;
  const fmv = Number(i.fmvEjercicioUsd);
  const alic = Number(i.alicuotaGananciasPct) / 100;
  if (!acciones || acciones <= 0) throw new Error('Ingresá la cantidad de acciones');
  if (!fmv || fmv <= 0) throw new Error('Ingresá el FMV al momento del ejercicio');
  const spread = (fmv - strike) * acciones;
  const gravado = Math.max(0, spread);
  const impuesto = gravado * alic;
  const neto = gravado - impuesto;
  const pctImp = gravado > 0 ? Math.round((impuesto / gravado) * 100) : 0;
  const fmt = (n: number) => 'USD ' + Math.round(n).toLocaleString('en-US');
  const _insight = gravado > 0
    ? {
        title: 'Lo que te queda después de impuestos',
        text: `Ejercer estas ${i.tipoEquity} genera un spread gravable de **${fmt(gravado)}**. Ganancias AR se lleva **${fmt(impuesto)}** (${pctImp}%) y te quedan **${fmt(neto)}** netos. Recordá que es un impuesto sobre ganancia en papel: no recibís cash hasta vender.`,
        tone: 'warn',
        icon: '📈',
      }
    : {
        title: 'Sin spread gravable',
        text: `Con un FMV de USD ${fmv} igual o menor al strike de USD ${strike}, **no hay spread gravable** al ejercer: el impuesto AR es USD 0. La ganancia recién aparecería si el valor sube por encima del strike.`,
        tone: 'neutral',
        icon: '📈',
      };
  const out: Outputs = {
    spreadGravadoUsd: Number(gravado.toFixed(2)),
    impuestoArUsd: Number(impuesto.toFixed(2)),
    netoUsd: Number(neto.toFixed(2)),
    explicacion: `${i.tipoEquity}: spread USD ${gravado.toFixed(2)} ((${fmv}-${strike})×${acciones}). Impuesto AR (${(alic * 100).toFixed(0)}%) USD ${impuesto.toFixed(2)}. Neto USD ${neto.toFixed(2)}.`,
    _insight,
  };
  if (gravado > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Neto para vos', value: Number(neto.toFixed(2)) },
        { label: 'Impuesto AR', value: Number(impuesto.toFixed(2)) },
      ],
      prefix: 'USD ',
      centerValue: fmt(gravado),
      centerLabel: 'Spread gravable',
      ariaLabel: `Reparto del spread gravable: ${fmt(neto)} netos y ${fmt(impuesto)} de impuesto AR`,
    };
  }
  return out;
}
