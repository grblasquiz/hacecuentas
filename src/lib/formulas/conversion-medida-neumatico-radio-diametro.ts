export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }
export function conversionMedidaNeumaticoRadioDiametro(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { diameter: 'diámetro', insTitle: 'Cómo se traduce esta medida en la ruta', insText: (d:string,c:string,rev:string)=>`Tu rueda mide **${d} mm** de diámetro y rueda **${c} m** por vuelta, así que da **${rev} vueltas por kilómetro**. Si cambiás a un diámetro distinto, el velocímetro y el odómetro quedan descalibrados.` },
    en: { diameter: 'diameter', insTitle: 'What this size means on the road', insText: (d:string,c:string,rev:string)=>`Your wheel is **${d} mm** in diameter and rolls **${c} m** per turn, so it makes **${rev} turns per kilometer**. Switching to a different diameter throws your speedometer and odometer off.` },
    pt: { diameter: 'diâmetro', insTitle: 'O que esta medida significa na estrada', insText: (d:string,c:string,rev:string)=>`Sua roda mede **${d} mm** de diâmetro e roda **${c} m** por volta, logo dá **${rev} voltas por quilômetro**. Trocar para um diâmetro diferente descalibra o velocímetro e o odômetro.` },
  } as const)[__lang];
  const w=Number(i.ancho)||0; const a=Number(i.aspect)||0; const r=Number(i.rin)||0;
  const h=w*a/100*2; const d=r*25.4+h;
  const circ=d*Math.PI/1000; const rev=1000/circ;
  return { diametroMm:`${d.toFixed(0)} mm`, circunf:`${circ.toFixed(2)} m`, revKm:`${rev.toFixed(0)} rev/km`, resumen:`${w}/${a} R${r}: ${T.diameter} ${d.toFixed(0)}mm.`,
    _insight: { title: T.insTitle, text: T.insText(d.toFixed(0), circ.toFixed(2), rev.toFixed(0)), tone: 'neutral', icon: '🛞' } };
}
