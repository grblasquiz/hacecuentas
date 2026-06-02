export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function reintegroIvaTuristasExtranjerosArgentina(i: Inputs): Outputs {
  const m=Number(i.compraUsd)||0;
  const iva=m*0.21/1.21;
  const pct = m > 0 ? (iva/m*100) : 0;
  const insight = {
    title: 'Tu reintegro como turista',
    text: `Sobre una compra de **USD ${m.toFixed(2)}** podés recuperar hasta **USD ${iva.toFixed(2)}** de IVA, el **${pct.toFixed(1)}%** del total. Aplica solo a productos artesanales argentinos y hotelería, con factura A a tu nombre y sellado de Aduana al salir.`,
    tone: 'good',
    icon: '🛂',
  };
  return { ivaReintegrable:`USD ${iva.toFixed(2)}`, procedimiento:'1) Factura A con pasaporte. 2) Sellado Aduana salida. 3) Reintegro vía TaxFree o transferencia.', observacion:'Solo productos artesanales AR + hoteles. Mínimo ARS 70 IVA por factura.', _insight: insight };
}
