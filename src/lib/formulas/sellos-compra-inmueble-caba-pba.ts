export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
// Régimen 2026 verificado:
// CABA (Ley Tarifaria 2026 / Ley 6.927): vivienda única familiar y permanente exenta hasta $226.100.000
//   (sobre el excedente paga 3,5%); resto de inmuebles 2,7% (bajó de 3,5%).
// PBA (Ley Impositiva 2026 / Ley 15.558): compraventa 2% (1% cada parte). La exención de vivienda
//   única se mide sobre la VALUACIÓN FISCAL (no el precio) con un tope muy bajo (~$1.154.400),
//   por lo que en la práctica casi todas las operaciones tributan al 2%.
export function sellosCompraInmuebleCabaPba(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const j=String(i.jurisdiccion||'caba'); const u=String(i.viviendaUnica||'no')==='si';
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  let imp=0; let alic=''; let base=v;
  let insightText:string; let insightTone:string;

  if (j==='caba') {
    const topeUnica=226100000; // exención CABA 2026 vivienda única
    if (u) {
      if (v<=topeUnica) { base=0; imp=0; alic='Exento (vivienda única ≤ $226.100.000)';
        insightText=`Por ser **vivienda única, familiar y permanente** y no superar el tope de ${fmt(topeUnica)} en CABA, quedás **exento del impuesto de sellos** (Ley Tarifaria 2026). Sin el beneficio, una segunda vivienda de este valor pagaría ${fmt(v*0.027)} al 2,7%.`;
        insightTone='good';
      } else { base=v-topeUnica; imp=base*0.035; alic='3,5% sobre el excedente de $226.100.000';
        insightText=`Aunque es vivienda única, el valor supera el tope de ${fmt(topeUnica)}: en CABA pagás **${fmt(imp)}** de sellos al 3,5% solo sobre el excedente de ${fmt(base)} (suele dividirse entre comprador y vendedor).`;
        insightTone='warn';
      }
    } else {
      base=v; imp=base*0.027; alic='2,7%';
      insightText=`El impuesto de sellos sobre ${fmt(v)} en CABA (segunda vivienda / no vivienda única) es de **${fmt(imp)}** (2,7%, alícuota reducida vigente desde 2026). Suele repartirse en partes iguales entre comprador y vendedor; presupuestalo aparte de la seña.`;
      insightTone='warn';
    }
  } else { // pba
    base=v; imp=base*0.02; alic='2%';
    if (u) {
      insightText=`En PBA la compraventa tributa sellos al **2%** (1% cada parte): ${fmt(imp)} sobre ${fmt(v)}. La exención de vivienda única en PBA se mide sobre la **valuación fiscal** (no el precio) con un tope muy bajo (~$1.154.400), por lo que en la práctica casi todas las operaciones pagan el 2%. Confirmá con ARBA si tu valuación fiscal califica.`;
      insightTone='warn';
    } else {
      insightText=`El impuesto de sellos sobre ${fmt(v)} en PBA es de **${fmt(imp)}** (2%, 1% comprador y 1% vendedor según Ley Impositiva 2026). Presupuestalo aparte de la seña y los honorarios del escribano.`;
      insightTone='warn';
    }
  }

  const insight={title:'Impuesto de sellos',text:insightText,tone:insightTone,icon:'🏡'};
  return {
    sellos:fmt(imp),
    alicuota:alic,
    resumen:`${fmt(v)} en ${j.toUpperCase()}: sellos ${fmt(imp)}${u?' (vivienda única)':''} — ${alic}.`,
    _insight: insight
  };
}
