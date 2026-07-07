export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function electrolitosAtletaSudorReposicion(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0; const h=Number(i.horasEjercicio)||1; const t=Number(i.temperaturaC)||20; const i_=String(i.intensidad||'media');
  let naPorHora=500; if(t>30) naPorHora+=200; if(i_==='alta') naPorHora+=200; if(i_==='baja') naPorHora-=150;
  const naTot=naPorHora*h;
  const k=naPorHora*0.4*h;
  const liq=750*h;
  const naTotR=Math.round(naTot); const kR=Math.round(k); const totMin=naTotR+kR;
  const calor = t>30;
  return {
    sodio:`${naTotR} mg (${Math.round(naPorHora)} mg/h)`, potasio:`${kR} mg`, liquidos:`${liq} mL (~${(liq/1000).toFixed(1)} L)`,
    _insight: {
      title: 'Tu plan de reposición',
      text: `En ${h} h de ejercicio ${i_==='alta'?'de alta intensidad ':i_==='baja'?'suave ':''}${calor?'con calor (más de 30 °C) ':''}perdés alrededor de **${naTotR} mg de sodio** y **${kR} mg de potasio**. Reponé tomando **${(liq/1000).toFixed(1)} L** de líquido con sales, en sorbos cada 15-20 min — no todo de golpe al final.`,
      tone: (h>=3 || calor || i_==='alta') ? 'warn' : 'neutral',
      icon: '💧',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Sodio (Na)', value: naTotR },
        { label: 'Potasio (K)', value: kR },
      ],
      prefix: '',
      centerValue: `${totMin} mg`,
      centerLabel: 'Electrolitos',
      ariaLabel: `Reposición de electrolitos: ${naTotR} mg de sodio y ${kR} mg de potasio`,
    },
  };
}
