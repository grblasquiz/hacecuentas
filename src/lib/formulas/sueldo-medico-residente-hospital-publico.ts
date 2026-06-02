export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sueldoMedicoResidenteHospitalPublico(i: Inputs): Outputs {
  const a=String(i.anioResidencia||'r1'); const j=String(i.juridiccion||'caba');
  const base: Record<string,number> = { r1:780000, r2:880000, r3:980000, r4:1100000, r5:1200000 };
  const mult: Record<string,number> = { caba:1.0, pba:0.88, nac:0.95, interior:0.85 };
  const b=(base[a]||780000)*(mult[j]||1);
  const guardias=b*0.45;
  const bruto=b+guardias;
  const descuentos=bruto*0.13;
  const neto=bruto*0.87;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'Aportes (13%)', value: Math.round(descuentos) },
    ],
    prefix: '$',
    centerValue: fmt(bruto),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del bruto del residente: neto en mano más aportes y descuentos.',
  };
  return {
    basico:'$'+b.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    guardias:'$'+guardias.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto:'$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen:`${a.toUpperCase()} ${j.toUpperCase()}: básico ${b.toFixed(0)} + guardias = ${neto.toFixed(0)} neto.`,
    _insight: {
      title: 'Cuánto pesan las guardias',
      text: `Como residente **${a.toUpperCase()}** en **${j.toUpperCase()}** cobrás un básico de **${fmt(b)}**, pero las guardias suman **${fmt(guardias)}** más: casi la mitad de tu ingreso. Tu neto en mano queda en **${fmt(neto)}**, tras descontar ~13% de aportes.`,
      tone: 'neutral',
      icon: '🩺',
    },
    _chart: chart
  };
}
