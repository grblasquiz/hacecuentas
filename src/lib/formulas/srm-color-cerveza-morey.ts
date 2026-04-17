/** SRM Morey 1993 */
export interface Inputs { kgMaltaBase: number; lMaltaBase: number; kgMaltaCristal?: number; lMaltaCristal?: number; kgMaltaTostada?: number; lMaltaTostada?: number; volumenFinal: number; }
export interface Outputs { srm: number; ebc: number; colorDescripcion: string; estiloCompatible: string; }

export function srmColorCervezaMorey(i: Inputs): Outputs {
  const kgB = Number(i.kgMaltaBase);
  const lB = Number(i.lMaltaBase);
  const kgC = Number(i.kgMaltaCristal) || 0;
  const lC = Number(i.lMaltaCristal) || 0;
  const kgT = Number(i.kgMaltaTostada) || 0;
  const lT = Number(i.lMaltaTostada) || 0;
  const v = Number(i.volumenFinal);
  if (!kgB || kgB <= 0) throw new Error('Ingresá malta base');
  if (!lB || lB <= 0) throw new Error('Ingresá °L malta base');
  if (!v || v <= 0) throw new Error('Ingresá volumen');

  const galones = v * 0.264172;
  const mcuTotal = ((kgB * lB + kgC * lC + kgT * lT) * 2.20462) / galones;
  const srm = 1.4922 * Math.pow(mcuTotal, 0.6859);
  const ebc = srm * 1.97;

  let desc = '';
  if (srm < 3) desc = 'Amarillo paja pálido';
  else if (srm < 6) desc = 'Dorado';
  else if (srm < 10) desc = 'Dorado oscuro / ámbar claro';
  else if (srm < 17) desc = 'Ámbar / rojizo';
  else if (srm < 25) desc = 'Marrón cobrizo';
  else if (srm < 35) desc = 'Marrón oscuro';
  else desc = 'Negro opaco';

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
