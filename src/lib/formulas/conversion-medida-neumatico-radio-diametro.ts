export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function conversionMedidaNeumaticoRadioDiametro(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { diameter: 'diámetro' },
    en: { diameter: 'diameter' },
  } as const)[__lang];
  const w=Number(i.ancho)||0; const a=Number(i.aspect)||0; const r=Number(i.rin)||0;
  const h=w*a/100*2; const d=r*25.4+h;
  const circ=d*Math.PI/1000; const rev=1000/circ;
  return { diametroMm:`${d.toFixed(0)} mm`, circunf:`${circ.toFixed(2)} m`, revKm:`${rev.toFixed(0)} rev/km`, resumen:`${w}/${a} R${r}: ${T.diameter} ${d.toFixed(0)}mm.` };
}
