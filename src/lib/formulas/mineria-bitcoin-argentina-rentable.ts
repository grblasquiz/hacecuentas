export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }
export function mineriaBitcoinArgentinaRentable(i: Inputs): Outputs {
  const h=Number(i.hashrateTh)||0; const c=Number(i.consumoKw)||0; const t=Number(i.tarifaKwh)||0; const p=Number(i.precioBtc)||0; const cm=Number(i.cotMep)||1;
  const networkHash=600e6; // TH/s aprox
  const btcBlock=3.125; const bloquesDia=144;
  const btcDia=(h/networkHash)*btcBlock*bloquesDia;
  const ingUsd=btcDia*p; const gastoPesos=c*24*t; const gastoUsd=gastoPesos/cm; const neto=ingUsd-gastoUsd;
  const tone = neto > 0 ? 'good' : 'warn';
  const margen = ingUsd > 0 ? (neto / ingUsd) * 100 : -100;
  const veredicto = neto > 0
    ? `Te queda un margen de **USD ${neto.toFixed(2)} netos por día** (el ${margen.toFixed(0)}% del ingreso): minar rinde con esta tarifa de luz.`
    : `Perdés **USD ${Math.abs(neto).toFixed(2)} por día**: la luz (USD ${gastoUsd.toFixed(2)}) te come todo el ingreso (USD ${ingUsd.toFixed(2)}). No conviene minar a esta tarifa.`;
  return {
    btcDiario:`${btcDia.toFixed(8)} BTC`,
    ingresoDiario:`USD ${ingUsd.toFixed(2)}`,
    gastoDiario:`$${Math.round(gastoPesos).toLocaleString('es-AR')}`,
    rentabilidad:`USD ${neto.toFixed(2)} neto/día`,
    _insight: {
      title: '¿Conviene minar?',
      text: veredicto,
      tone,
      icon: '⛏️'
    }
  };
}
