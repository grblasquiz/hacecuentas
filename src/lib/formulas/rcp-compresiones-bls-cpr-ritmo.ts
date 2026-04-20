export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rcpCompresionesBlsCprRitmo(i: Inputs): Outputs {
  const e=String(i.edadVictima||'adulto');
  const freq='100-120 compresiones/min';
  const prof={'adulto':'5-6 cm','nino_1_8':'~5 cm (1/3 profundidad tórax)','bebe_menor_1':'4 cm'}[e];
  const rat={'adulto':'30:2','nino_1_8':'30:2 (1 rescatador) / 15:2 (2)','bebe_menor_1':'30:2 (1) / 15:2 (2)'}[e];
  return { frecuencia:freq, profundidad:prof, ratio:rat };
}
