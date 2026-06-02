export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionBtuKcalAireAcondicionado(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 0.251996;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'BTU' : 'kcal';
  const toU = u === 'a' ? 'kcal' : 'BTU';
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');

  // BTU/h de referencia para dimensionar el equipo (siempre en BTU)
  const btuH = u === 'a' ? v : r;
  let ambiente = '';
  if (btuH > 0) {
    if (btuH <= 2500) ambiente = 'un ambiente chico (hasta ~15 m²)';
    else if (btuH <= 3500) ambiente = 'un ambiente mediano (~15 a 25 m²)';
    else if (btuH <= 5500) ambiente = 'un living amplio (~25 a 40 m²)';
    else ambiente = 'un espacio grande o de uso comercial (más de 40 m²)';
  }

  const _insight = {
    title: 'Equivalencia de frigorías',
    text: btuH > 0
      ? `**${v} ${fromU}** equivalen a **${rTxt} ${toU}**. En aires acondicionados, las "frigorías" que ves en la etiqueta son kcal/h: este equipo de **${Math.round(btuH).toLocaleString('es-AR')} BTU/h** alcanza para ${ambiente}.`
      : `Ingresá un valor para convertir entre **BTU** y **kcal** (frigorías).`,
    tone: 'neutral',
    icon: '❄️',
  };

  return {
    resultado: rTxt + ' ' + toU,
    resumen: `${v} ${fromU} = ${rTxt} ${toU}.`,
    _insight,
  };
}
