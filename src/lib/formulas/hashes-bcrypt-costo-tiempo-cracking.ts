export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; }
export function hashesBcryptCostoTiempoCracking(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      ok: 'OK', bajo: 'Subí a 10+', lento: 'Puede ser lento en servidor',
      titWarn: 'Cost factor bajo', titGood: 'Cost factor sólido', titSlow: 'Cost factor alto',
      txtWarn: (c: number, ms: string) => `Con **cost ${c}** cada hash tarda solo **${ms} ms**: un atacante puede probar muchas claves por segundo. El piso recomendado hoy es **10** (idealmente 12); cada +1 duplica el tiempo de cómputo.`,
      txtGood: (c: number, ms: string) => `Con **cost ${c}** cada hash tarda **${ms} ms**: buen punto de equilibrio entre seguridad y latencia de login. Cada +1 duplica el costo de un ataque por fuerza bruta.`,
      txtSlow: (c: number, ms: string) => `Con **cost ${c}** cada hash tarda **${ms} ms**: muy resistente a cracking, pero puede frenar el login bajo carga. Medí la latencia real en tu servidor antes de subir más.`,
    },
    en: {
      ok: 'OK', bajo: 'Increase to 10+', lento: 'May be slow on the server',
      titWarn: 'Low cost factor', titGood: 'Solid cost factor', titSlow: 'High cost factor',
      txtWarn: (c: number, ms: string) => `At **cost ${c}** each hash takes only **${ms} ms**: an attacker can try many passwords per second. Today's recommended floor is **10** (ideally 12); each +1 doubles the compute time.`,
      txtGood: (c: number, ms: string) => `At **cost ${c}** each hash takes **${ms} ms**: a good balance between security and login latency. Each +1 doubles the cost of a brute-force attack.`,
      txtSlow: (c: number, ms: string) => `At **cost ${c}** each hash takes **${ms} ms**: very crack-resistant, but it can slow logins under load. Measure real latency on your server before going higher.`,
    },
  } as const)[__lang];
  const c=Math.floor(Number(i.cost)||10);
  const base=2; const ms=base*Math.pow(2,c-10);
  const hs=1000/ms;
  let rec=T.ok; if (c<10) rec=T.bajo; else if (c>14) rec=T.lento;
  const msFmt = ms.toFixed(1);
  let _insight;
  if (c < 10) _insight = { title: T.titWarn, text: T.txtWarn(c, msFmt), tone: 'warn', icon: '🔓' };
  else if (c > 14) _insight = { title: T.titSlow, text: T.txtSlow(c, msFmt), tone: 'neutral', icon: '🐢' };
  else _insight = { title: T.titGood, text: T.txtGood(c, msFmt), tone: 'good', icon: '🔒' };
  return { hashPorSeg:`${hs.toFixed(1)}/s`, tiempo:`${msFmt} ms`, recomendacion:rec, resumen:`Cost ${c}: ${ms.toFixed(0)}ms/hash (${hs.toFixed(0)}/s).`, _insight };
}
