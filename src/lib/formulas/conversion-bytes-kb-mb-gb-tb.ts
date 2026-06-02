export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionBytesKbMbGbTb(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const de=String(i.desde||'B'); const a=String(i.a||'B'); const sis=String(i.sistema||'bin');
  const base=sis==='bin'?1024:1000;
  const idx:Record<string,number>={B:0,KB:1,MB:2,GB:3,TB:4};
  const bytes=v*Math.pow(base,idx[de]);
  const r=bytes/Math.pow(base,idx[a]);

  const sisLabel = sis === 'bin' ? 'binario (1 KB = 1024 B)' : 'decimal (1 KB = 1000 B)';
  const _insight = {
    title: 'Por qué el disco "miente"',
    text: v > 0
      ? `**${v} ${de}** equivalen a **${r.toLocaleString()} ${a}** usando el sistema ${sisLabel}. Ojo: los fabricantes de discos miden en decimal y los sistemas operativos en binario, por eso un disco "de 1 TB" aparece como ~931 GB en tu compu.`
      : `Convertí entre B, KB, MB, GB y TB. Elegí binario (lo que muestra tu sistema) o decimal (lo que dice la caja del producto).`,
    tone: 'neutral',
    icon: '💾',
  };

  return { resultado:`${r.toLocaleString()} ${a}`, resumen:`${v} ${de} = ${r.toLocaleString()} ${a} (${sis}).`, _insight };
}
