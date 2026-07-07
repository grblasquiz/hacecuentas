export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function energiaFotonesFrecuenciaLongitudOnda(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h = 6.626e-34; const c = 3e8;
  const modo = String(i.modo); const v = Number(i.valor); const u = String(i.unidad);
  if (!v) throw new Error(__lang === 'en' ? 'Enter a value' : 'Completá valor');
  let freq: number;
  if (modo === 'freq') { freq = u === 'THz' ? v * 1e12 : v; }
  else { const lam = u === 'um' ? v * 1e-6 : v * 1e-9; freq = c / lam; }
  const E = h * freq;
  const eV = E / 1.602e-19;
  const region = __lang === 'en'
    ? (eV < 1.65 ? 'infrared' : eV <= 3.1 ? 'visible light' : eV < 124 ? 'ultraviolet' : 'X-rays')
    : (eV < 1.65 ? 'infrarrojo' : eV <= 3.1 ? 'luz visible' : eV < 124 ? 'ultravioleta' : 'rayos X');
  const _insight = {
    title: __lang === 'en' ? 'Photon energy' : 'Energía del fotón',
    text: __lang === 'en'
      ? `Each photon carries **${E.toExponential(2)} J** (**${eV.toFixed(2)} eV**), placing it in the **${region}** part of the spectrum.`
      : `Cada fotón transporta **${E.toExponential(2)} J** (**${eV.toFixed(2)} eV**), lo que lo ubica en la zona de **${region}** del espectro.`,
    tone: 'neutral',
    icon: '💡',
  };
  return { energia: E.toExponential(3) + ' J', ev: eV.toFixed(3) + ' eV', resumen: `E = ${E.toExponential(2)} J (${eV.toFixed(2)} eV).`, _insight };
}
