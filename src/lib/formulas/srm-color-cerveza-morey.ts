/** SRM Morey 1993 */
export interface Inputs { kgMaltaBase: number; lMaltaBase: number; kgMaltaCristal?: number; lMaltaCristal?: number; kgMaltaTostada?: number; lMaltaTostada?: number; volumenFinal: number; __lang?: string; }
export interface Outputs { srm: number; ebc: number; colorDescripcion: string; estiloCompatible: string; }

export function srmColorCervezaMorey(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errMalta: 'Ingresá malta base',
      errL: 'Ingresá °L malta base',
      errVol: 'Ingresá volumen',
      c1: 'Amarillo paja pálido',
      c2: 'Dorado',
      c3: 'Dorado oscuro / ámbar claro',
      c4: 'Ámbar / rojizo',
      c5: 'Marrón cobrizo',
      c6: 'Marrón oscuro',
      c7: 'Negro opaco',
    },
    en: {
      errMalta: 'Enter base malt',
      errL: 'Enter °L for base malt',
      errVol: 'Enter batch volume',
      c1: 'Pale straw',
      c2: 'Golden',
      c3: 'Dark golden / light amber',
      c4: 'Amber / reddish',
      c5: 'Copper brown',
      c6: 'Dark brown',
      c7: 'Opaque black',
    },
  } as const)[__lang];

  const kgB = Number(i.kgMaltaBase);
  const lB = Number(i.lMaltaBase);
  const kgC = Number(i.kgMaltaCristal) || 0;
  const lC = Number(i.lMaltaCristal) || 0;
  const kgT = Number(i.kgMaltaTostada) || 0;
  const lT = Number(i.lMaltaTostada) || 0;
  const v = Number(i.volumenFinal);
  if (!kgB || kgB <= 0) throw new Error(T.errMalta);
  if (!lB || lB <= 0) throw new Error(T.errL);
  if (!v || v <= 0) throw new Error(T.errVol);

  const galones = v * 0.264172;
  const mcuTotal = ((kgB * lB + kgC * lC + kgT * lT) * 2.20462) / galones;
  const srm = 1.4922 * Math.pow(mcuTotal, 0.6859);
  const ebc = srm * 1.97;

  let desc = '';
  if (srm < 3) desc = T.c1;
  else if (srm < 6) desc = T.c2;
  else if (srm < 10) desc = T.c3;
  else if (srm < 17) desc = T.c4;
  else if (srm < 25) desc = T.c5;
  else if (srm < 35) desc = T.c6;
  else desc = T.c7;

  let estilo = '';
  if (srm < 4) estilo = 'Light Lager, Witbier';
  else if (srm < 10) estilo = 'Pale Ale, Pilsner, Kölsch';
  else if (srm < 17) estilo = 'IPA, Amber Ale, Vienna';
  else if (srm < 30) estilo = 'Brown Ale, Porter';
  else estilo = 'Stout, Imperial Stout';

  return {
    srm: Number(srm.toFixed(1)),
    ebc: Number(ebc.toFixed(1)),
    colorDescripcion: desc,
    estiloCompatible: estilo,
  };
}
