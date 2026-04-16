/** Calculadora de Bottleneck CPU/GPU */
export interface Inputs {
  fps720p: number;
  fps1080p: number;
  fps1440p: number;
  usoCpu?: number;
  usoGpu?: number;
}
export interface Outputs {
  bottleneck: string;
  porcentajeBottleneck: number;
  escaladoGpu: number;
  recomendacion: string;
}

export function configuracionPcBottleneck(i: Inputs): Outputs {
  const f720 = Number(i.fps720p);
  const f1080 = Number(i.fps1080p);
  const f1440 = Number(i.fps1440p);
  const usoCpu = i.usoCpu ? Number(i.usoCpu) : null;
  const usoGpu = i.usoGpu ? Number(i.usoGpu) : null;

  if (!f720 || f720 <= 0) throw new Error('Ingresá los FPS a 720p');
  if (!f1080 || f1080 <= 0) throw new Error('Ingresá los FPS a 1080p');
  if (!f1440 || f1440 <= 0) throw new Error('Ingresá los FPS a 1440p');

  // GPU scaling: how much do FPS drop from 720 to 1440 (4x pixels)
  // Perfect GPU scaling would be ~50% drop. Less drop = CPU limited.
  const escaladoGpu = ((f720 - f1440) / f720) * 100;

  // If FPS barely change with resolution -> CPU bottleneck
  // Theoretical: 720p to 1440p = 4x pixels, so FPS should roughly halve if GPU is the limit
  const escalado720a1080 = ((f720 - f1080) / f720) * 100;
  const escalado1080a1440 = ((f1080 - f1440) / f1080) * 100;

  let bottleneck: string;
  let porcentajeBottleneck: number;
  let recomendacion: string;

  // Calculate from hw usage if available
  if (usoCpu !== null && usoGpu !== null) {
    if (usoCpu > 90 && usoGpu < 80) {
      bottleneck = 'CPU — tu procesador es el cuello de botella';
      porcentajeBottleneck = Math.round((1 - usoGpu / 100) * 100);
      recomendacion = `Tu CPU está al ${usoCpu}% y la GPU solo al ${usoGpu}%. Upgradear CPU o bajar settings que cargan al procesador (draw distance, NPCs, física).`;
    } else if (usoGpu > 90 && usoCpu < 80) {
      bottleneck = 'GPU — tu placa de video es el cuello de botella';
      porcentajeBottleneck = Math.round((1 - usoCpu / 100) * 100);
      recomendacion = `Tu GPU está al ${usoGpu}% y la CPU solo al ${usoCpu}%. Esto es ideal en la mayoría de juegos. Para más FPS, upgradá GPU o bajá resolución/calidad gráfica.`;
    } else {
      bottleneck = 'Balanceado — buen equilibrio CPU/GPU';
      porcentajeBottleneck = Math.abs((usoCpu || 0) - (usoGpu || 0));
      recomendacion = 'Tu PC está bien balanceada. Ambos componentes trabajan de forma pareja.';
    }
  } else {
    // Estimate from FPS scaling
    if (escaladoGpu < 20) {
      bottleneck = 'CPU — tu procesador es el cuello de botella';
      porcentajeBottleneck = Math.round(100 - escaladoGpu * 2);
      recomendacion = `Los FPS casi no bajan al subir resolución (solo ${escaladoGpu.toFixed(0)}% de caída 720p→1440p). La CPU limita antes que la GPU. Upgradear CPU daría más FPS.`;
    } else if (escaladoGpu > 50) {
      bottleneck = 'GPU — tu placa de video es el cuello de botella';
      porcentajeBottleneck = Math.round(escaladoGpu - 30);
      recomendacion = `Los FPS caen ${escaladoGpu.toFixed(0)}% de 720p a 1440p, indicando que la GPU es el limitante. Bajá resolución o calidad gráfica, o upgradá GPU.`;
    } else {
      bottleneck = 'Relativamente balanceado';
      porcentajeBottleneck = Math.round(Math.abs(escaladoGpu - 35));
      recomendacion = 'Tu PC tiene un balance razonable entre CPU y GPU para la carga actual.';
    }
  }

  return {
    bottleneck,
    porcentajeBottleneck: Math.min(porcentajeBottleneck, 100),
    escaladoGpu: Number(escaladoGpu.toFixed(1)),
    recomendacion,
  };
}
