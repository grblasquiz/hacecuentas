export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fpsFluidezVideoJuego(i: Inputs): Outputs {
  const fps=Number(i.fps)||0;
  const lat=fps===0?Infinity:1000/fps;
  let q='—'; if (fps>=144) q='Competitivo'; else if (fps>=60) q='Fluido'; else if (fps>=30) q='Aceptable'; else if (fps>=24) q='Mínimo cine'; else q='Entrecortado';
  return { latencia:`${lat.toFixed(2)} ms`, calidad:q, resumen:`${fps} FPS: ${q} (${lat.toFixed(1)} ms/frame).` };
}
