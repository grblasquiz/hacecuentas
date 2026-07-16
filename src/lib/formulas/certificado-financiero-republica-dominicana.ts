/**
 * Rendimiento neto de un certificado financiero (depósito a plazo) en República
 * Dominicana. El interés se calcula sobre el capital, la tasa anual y el plazo;
 * las entidades de intermediación financiera retienen el 10% de ISR sobre los
 * intereses pagados a personas físicas residentes, como pago único y definitivo
 * (Norma 07-19, DGII).
 */
import { fmtDOP } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  capital: number;      // monto depositado (RD$)
  tasaAnual: number;    // tasa de interés anual (%)
  plazoMeses: number;   // plazo en meses
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const RET_INTERES = 0.10; // 10% de retención de ISR sobre intereses a persona física

export function compute(i: Inputs): Outputs {
  const capital = Number(i.capital) || 0;
  const tasa = Number(i.tasaAnual) || 0;
  const meses = Number(i.plazoMeses) || 0;
  if (capital <= 0) throw new Error('Ingresá el capital a depositar en RD$');
  if (meses <= 0) throw new Error('Ingresá el plazo en meses');

  const interesBruto = capital * (tasa / 100) * (meses / 12);
  const retencion = interesBruto * RET_INTERES;
  const interesNeto = interesBruto - retencion;
  const montoFinal = capital + interesNeto;
  const rendimientoNetoPct = capital > 0 ? (interesNeto / capital) * 100 : 0;

  const _insight = {
    title: 'Rendimiento neto del certificado',
    text: `Un certificado de **${fmtDOP(capital)}** al **${tasa}%** anual por **${meses} meses** genera **${fmtDOP(interesBruto)}** de interés bruto. Tras la retención del 10% de ISR (**${fmtDOP(retencion)}**), el interés neto es **${fmtDOP(interesNeto)}** y al vencimiento recibís **${fmtDOP(montoFinal)}** (rendimiento neto ${rendimientoNetoPct.toFixed(2)}% sobre el capital).`,
    tone: 'good',
    icon: '💰',
  };
  const _chart = {
    type: 'bar',
    labels: ['Interés bruto', 'Retención 10%', 'Interés neto'],
    values: [Math.round(interesBruto), Math.round(retencion), Math.round(interesNeto)],
    prefix: 'RD$ ',
    ariaLabel: 'Interés bruto, retención e interés neto del certificado.',
  };

  return {
    interesNeto: fmtDOP(interesNeto),
    interesBruto: fmtDOP(interesBruto),
    retencion: fmtDOP(retencion),
    montoFinal: fmtDOP(montoFinal),
    rendimientoNeto: `${rendimientoNetoPct.toFixed(2)} %`,
    detalle: `Interés bruto ${fmtDOP(interesBruto)} − ISR 10% ${fmtDOP(retencion)} = neto ${fmtDOP(interesNeto)}; al vencimiento ${fmtDOP(montoFinal)}.`,
    _insight,
    _chart,
  };
}
