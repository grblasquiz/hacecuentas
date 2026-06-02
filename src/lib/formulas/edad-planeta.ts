export interface Inputs { fechaNacimiento: string; }
export interface Outputs { edadTierra: number; edades: string; mensaje: string; _insight?: any; }
const PLANETAS:{nombre:string;periodo:number}[] = [
  {nombre:'Mercurio',periodo:0.2408},{nombre:'Venus',periodo:0.6152},{nombre:'Tierra',periodo:1},
  {nombre:'Marte',periodo:1.8809},{nombre:'Júpiter',periodo:11.862},{nombre:'Saturno',periodo:29.457},
  {nombre:'Urano',periodo:84.01},{nombre:'Neptuno',periodo:164.8},{nombre:'Plutón',periodo:247.9}
];
export function edadPlaneta(i: Inputs): Outputs {
  const parts = String(i.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha válida');
  const edadTierra = (hoy.getTime() - nac.getTime()) / (365.25 * 86400000);
  const edades = PLANETAS.map(p => {
    const e = edadTierra / p.periodo;
    return `${p.nombre}: ${e.toFixed(2)} años`;
  }).join('\n');
  const msg = `En la Tierra tenés ${edadTierra.toFixed(1)} años. En Mercurio tendrías ${(edadTierra/0.2408).toFixed(0)} y en Neptuno apenas ${(edadTierra/164.8).toFixed(2)}.`;
  const edadMercurio = edadTierra / 0.2408;
  const edadJupiter = edadTierra / 11.862;
  const _insight = {
    title: 'Tu edad cambia con la órbita',
    text: `La "edad" es solo cuántas vueltas al Sol diste. Como Mercurio orbita en 88 días, ahí tendrías **${edadMercurio.toFixed(0)} años**; en Júpiter, que tarda casi 12 años terrestres por vuelta, recién llegarías a **${edadJupiter.toFixed(1)} años**.`,
    tone: 'neutral',
    icon: '🪐',
  };
  return { edadTierra: Number(edadTierra.toFixed(1)), edades, mensaje: msg, _insight };
}
