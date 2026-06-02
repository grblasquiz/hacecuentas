export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function fuerzaFriccionCoeficiente(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      error: 'Completá μ y N',
      resumen: (f: number, mu: number, n: number) => `Fricción ${f.toFixed(1)} N con μ=${mu} y N=${n}.`,
      insTitle: 'Qué significa esta fricción',
      ins: (f: number, mu: number, kg: number) => `Con μ=**${mu}** y una normal de **${n0(f, mu)} N**, la fricción vale **${f.toFixed(1)} N**: esa es la fuerza mínima que tenés que aplicar para empezar a deslizar el objeto (equivale a empujar unos **${kg.toFixed(1)} kg**).`,
    },
    en: {
      error: 'Enter μ and N',
      resumen: (f: number, mu: number, n: number) => `Friction ${f.toFixed(1)} N with μ=${mu} and N=${n}.`,
      insTitle: 'What this friction means',
      ins: (f: number, mu: number, kg: number) => `With μ=**${mu}** and a normal force of **${n0(f, mu)} N**, friction equals **${f.toFixed(1)} N**: that is the minimum force you must apply to start sliding the object (like pushing about **${kg.toFixed(1)} kg**).`,
    },
  } as const)[__lang];
  const mu = Number(i.mu); const n = Number(i.n);
  if (!mu || !n) throw new Error(T.error);
  const f = mu * n;
  const kgEquiv = f / 9.81;
  return {
    friccion: f.toFixed(2) + ' N',
    resumen: T.resumen(f, mu, n),
    _insight: { title: T.insTitle, text: T.ins(f, mu, kgEquiv), tone: 'neutral', icon: '🧲' },
  };
}
function n0(f: number, mu: number): string { return mu ? (f / mu).toFixed(0) : '0'; }
