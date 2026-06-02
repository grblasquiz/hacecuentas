export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function imagenDockerCapasPesoMb(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      ok: 'OK', heavy: 'Demasiado pesada, revisá capas', multistage: 'Considera multi-stage',
      insTitle: 'Peso de tu imagen Docker',
      insOk: (b: string, dep: number, t: number) => `**${t} MB** (${b} + ${dep} MB de deps): imagen **liviana**, ideal para builds y deploys rápidos.`,
      insMulti: (b: string, dep: number, t: number) => `**${t} MB** (${b} + ${dep} MB de deps): empieza a pesar. Un build **multi-stage** puede sacarte las dependencias de compilación y bajarla bastante.`,
      insHeavy: (b: string, dep: number, t: number) => `**${t} MB** (${b} + ${dep} MB de deps): **demasiado pesada**. Revisá capas, limpiá cachés y pasá a multi-stage o a una base más chica (alpine/distroless).`,
      segLight: 'Liviana', segMedium: 'Media', segHeavy: 'Pesada',
    },
    en: {
      ok: 'OK', heavy: 'Too heavy, review your layers', multistage: 'Consider multi-stage builds',
      insTitle: 'Your Docker image size',
      insOk: (b: string, dep: number, t: number) => `**${t} MB** (${b} + ${dep} MB of deps): a **lightweight** image, great for fast builds and deploys.`,
      insMulti: (b: string, dep: number, t: number) => `**${t} MB** (${b} + ${dep} MB of deps): getting heavy. A **multi-stage** build can drop the build-time dependencies and shrink it a lot.`,
      insHeavy: (b: string, dep: number, t: number) => `**${t} MB** (${b} + ${dep} MB of deps): **too heavy**. Review layers, clean caches and switch to multi-stage or a smaller base (alpine/distroless).`,
      segLight: 'Light', segMedium: 'Medium', segHeavy: 'Heavy',
    },
  } as const)[__lang];
  const b=String(i.base||'alpine'); const dep=Number(i.deps)||0;
  const bSize:Record<string,number>={alpine:5,'debian-slim':70,ubuntu:80,distroless:20};
  const total=(bSize[b]||50)+dep;
  let cons=T.ok; if (total>500) cons=T.heavy; else if (total>200) cons=T.multistage;
  const insTone = total>500 ? 'warn' : total>200 ? 'warn' : 'good';
  const insText = total>500 ? T.insHeavy(b, dep, total) : total>200 ? T.insMulti(b, dep, total) : T.insOk(b, dep, total);
  const insight = { title: T.insTitle, text: insText, tone: insTone, icon: '🐳' };
  const chart = {
    type: 'scale' as const,
    marker: total,
    markerLabel: `${total} MB`,
    min: 0,
    segments: [
      { nombre: T.segLight, max: 200, color: '#86efac', colorDark: '#15803d' },
      { nombre: T.segMedium, max: 500, color: '#fde047', colorDark: '#a16207' },
      { nombre: T.segHeavy, max: Math.max(800, total + 100), color: '#fca5a5', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Peso de la imagen Docker: ${total} MB`,
  };
  return { total:`${total} MB`, consejo:cons, resumen:`${b} + ${dep}MB deps = ${total} MB. ${cons}.`, _insight: insight, _chart: chart };
}
