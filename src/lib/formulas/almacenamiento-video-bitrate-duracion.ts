export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function almacenamientoVideoBitrateDuracion(i: Inputs): Outputs {
  const br=Number(i.bitrate)||0; const min=Number(i.duracion)||0;
  const gb=(br*min*60)/8/1024;
  const porHora = min>0 ? gb/min*60 : 0;
  const tone = gb>25 ? 'warn' : 'neutral';
  const text = gb>25
    ? `Un video de **${min} min a ${br} Mbps** pesa **${gb.toFixed(2)} GB**: supera el límite de subida de WhatsApp y de muchos mails. Vas a necesitar comprimirlo o subirlo por la nube. Consumo: **${porHora.toFixed(1)} GB/hora**.`
    : `Un video de **${min} min a ${br} Mbps** pesa **${gb.toFixed(2)} GB**, lo que equivale a **${porHora.toFixed(1)} GB por hora** de grabación a ese bitrate.`;
  return {
    tamano:`${(gb*1024).toFixed(1)} MB`, gb:`${gb.toFixed(2)} GB`, resumen:`${min} min a ${br}Mbps = ${gb.toFixed(2)} GB.`,
    _insight: { title: 'Cuánto pesa tu video', text, tone, icon: '🎬' },
  };
}
