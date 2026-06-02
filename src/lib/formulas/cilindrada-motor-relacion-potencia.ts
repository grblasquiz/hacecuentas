export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cilindradaMotorRelacionPotencia(i: Inputs): Outputs {
  const cc=Number(i.cc)||0; const tb=String(i.turbo||'no');
  const l=cc/1000; const hp=tb==='si'?l*150:l*85;
  let cat='Económico'; if (hp>400) cat='Supercar'; else if (hp>200) cat='Sport'; else if (hp>130) cat='Medio';
  const hpR=Math.round(hp);
  const tone = cat==='Supercar' ? 'good' : cat==='Económico' ? 'neutral' : 'neutral';
  return {
    hpAprox:`${hp.toFixed(0)} HP`,
    categoria:cat,
    resumen:`${cc}cc ${tb==='si'?'turbo':'atm'}: ~${hp.toFixed(0)} HP (${cat}).`,
    _insight: {
      title: 'Potencia estimada del motor',
      text: `Un motor de **${cc} cc** ${tb==='si'?'**turbo**':'atmosférico'} rinde unos **${hpR} HP**, perfil ${cat.toLowerCase()}.`,
      tone,
      icon: '🐎',
    },
    _chart: {
      type: 'scale',
      marker: hpR,
      markerLabel: `${hpR} HP`,
      min: 0,
      segments: [
        { nombre: 'Económico', max: 130, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Medio', max: 200, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Sport', max: 400, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Supercar', max: Math.max(600, hpR + 50), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `Potencia estimada de ${hpR} HP ubicada en el perfil ${cat}.`,
    },
  };
}
