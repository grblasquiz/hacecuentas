export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function patenteCiclomotorMotoArgentinaCosto(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const c=String(i.cilindrada||'moto');
  const pat: Record<string,number> = { cic:0, moto:v*0.03, gran:v*0.045 };
  const p=pat[c]||v*0.03;
  const arancelFijo=45000;
  const selladoProp=v*0.008;
  const costo=arancelFijo+selladoProp;
  return { costo:'$'+costo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), patente:'$'+p.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Moto ${c} $${v.toLocaleString('es-AR')}: registro $${costo.toFixed(0)}, patente $${p.toFixed(0)}.`, _insight: {
    title: 'Registro + patente',
    text: c==='cic'
      ? `Inscribir tu ciclomotor cuesta ≈ **$${Math.round(costo).toLocaleString('es-AR')}** (trámite único). La **patente da $0**: por baja cilindrada suele estar exenta en la mayoría de las provincias.`
      : `Patentar la moto cuesta ≈ **$${Math.round(costo).toLocaleString('es-AR')}** de trámite único, más una **patente anual de ≈ $${Math.round(p).toLocaleString('es-AR')}** (impuesto recurrente). Verificá la alícuota de tu provincia, que cambia bastante.`,
    tone: 'warn',
    icon: '🏍️',
  }, _chart: {
    type: 'doughnut' as const,
    slices: [
      { label: 'Arancel fijo', value: Math.round(arancelFijo) },
      { label: 'Sellado (0,8% del valor)', value: Math.round(selladoProp) },
    ].filter((s)=>s.value>0),
    prefix: '$',
    centerValue: '$'+Math.round(costo).toLocaleString('es-AR'),
    centerLabel: 'Registro',
    ariaLabel: 'Composición del costo de registro: arancel fijo más sellado proporcional al valor.',
  } };
}
