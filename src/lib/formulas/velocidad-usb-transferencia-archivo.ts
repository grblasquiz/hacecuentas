const SPEEDS: Record<string, number> = { '2.0': 35, '3.0': 400, '3.1': 800, '3.2': 1500, '4.0': 3500 };
export interface VelocidadUsbTransferenciaArchivoInputs { tamano: number; version: string; __lang?: string; }
export interface VelocidadUsbTransferenciaArchivoOutputs { tiempo: string; velocidadReal: string; resumen: string; _insight?: any; }
export function velocidadUsbTransferenciaArchivo(i: VelocidadUsbTransferenciaArchivoInputs): VelocidadUsbTransferenciaArchivoOutputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const gb = Number(i.tamano); const mbs = SPEEDS[i.version] ?? 400;
  if (!gb || gb <= 0) throw new Error(__lang === 'en' ? 'Enter file size' : __lang === 'pt' ? 'Informe o tamanho do arquivo' : 'Ingresá tamaño');
  const segundos = (gb * 1024) / mbs;
  let tFmt: string;
  if (segundos < 60) tFmt = segundos.toFixed(1) + ' s';
  else if (segundos < 3600) tFmt = (segundos / 60).toFixed(1) + ' min';
  else tFmt = (segundos / 3600).toFixed(2) + ' h';
  const gbMin = mbs * 60 / 1024; // GB por minuto a velocidad real sostenida
  const _insight = {
    title: __lang === 'en' ? 'What this transfer means' : __lang === 'pt' ? 'O que significa esta transferência' : 'Qué significa esta transferencia',
    text: __lang === 'en'
      ? `At ~**${mbs} MB/s** real, USB ${i.version} moves about **${gbMin.toFixed(1)} GB/min**, so your **${gb} GB** file takes **${tFmt}**. Marketed Gbps figures are peaks — real throughput is lower due to protocol overhead and the slower drive.`
      : __lang === 'pt'
      ? `A ~**${mbs} MB/s** real, o USB ${i.version} move cerca de **${gbMin.toFixed(1)} GB/min**, então seu arquivo de **${gb} GB** leva **${tFmt}**. Os Gbps anunciados são picos — a taxa real é menor por overhead e pelo disco mais lento.`
      : `A ~**${mbs} MB/s** reales, el USB ${i.version} mueve unos **${gbMin.toFixed(1)} GB/min**, así que tu archivo de **${gb} GB** tarda **${tFmt}**. Los Gbps de la caja son picos — la velocidad real es menor por overhead del protocolo y el disco más lento de los dos.`,
    tone: 'neutral',
    icon: '🔌',
  };
  return { tiempo: tFmt, velocidadReal: mbs + ' MB/s',
    resumen: __lang === 'en' ? `${gb} GB via USB ${i.version}: ${tFmt} at ~${mbs} MB/s real.` : __lang === 'pt' ? `${gb} GB via USB ${i.version}: ${tFmt} a ~${mbs} MB/s real.` : `${gb} GB por USB ${i.version}: ${tFmt} a ~${mbs} MB/s real.`, _insight };
}
