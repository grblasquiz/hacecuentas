/** Calculadora de Presupuesto para Equipo de Música */
export interface Inputs {
  presupuesto: number;
  nivel: string;
  tipo: string;
}
export interface Outputs {
  instrumento: number;
  amplificacion: number;
  accesorios: number;
  grabacion: number;
  recomendacion: string;
}

interface Dist { instrumento: number; amplificacion: number; accesorios: number; grabacion: number; }

const DISTRIBUCIONES: Record<string, Record<string, Dist>> = {
  principiante: {
    vivo:     { instrumento: 0.50, amplificacion: 0.30, accesorios: 0.15, grabacion: 0.05 },
    estudio:  { instrumento: 0.35, amplificacion: 0.20, accesorios: 0.10, grabacion: 0.35 },
    practica: { instrumento: 0.55, amplificacion: 0.25, accesorios: 0.15, grabacion: 0.05 },
  },
  intermedio: {
    vivo:     { instrumento: 0.40, amplificacion: 0.30, accesorios: 0.20, grabacion: 0.10 },
    estudio:  { instrumento: 0.25, amplificacion: 0.25, accesorios: 0.10, grabacion: 0.40 },
    practica: { instrumento: 0.45, amplificacion: 0.25, accesorios: 0.20, grabacion: 0.10 },
  },
  avanzado: {
    vivo:     { instrumento: 0.35, amplificacion: 0.30, accesorios: 0.25, grabacion: 0.10 },
    estudio:  { instrumento: 0.20, amplificacion: 0.25, accesorios: 0.10, grabacion: 0.45 },
    practica: { instrumento: 0.40, amplificacion: 0.20, accesorios: 0.20, grabacion: 0.20 },
  },
};

export function presupuestoEquipoMusica(i: Inputs): Outputs {
  const presupuesto = Number(i.presupuesto);
  if (!presupuesto || presupuesto <= 0) throw new Error('Ingresá el presupuesto');

  const dist = DISTRIBUCIONES[i.nivel]?.[i.tipo];
  if (!dist) throw new Error('Seleccioná nivel y tipo válidos');

  const instrumento = Math.round(presupuesto * dist.instrumento);
  const amplificacion = Math.round(presupuesto * dist.amplificacion);
  const accesorios = Math.round(presupuesto * dist.accesorios);
  const grabacion = Math.round(presupuesto * dist.grabacion);

  let recomendacion = `Distribución para ${i.nivel} (${i.tipo}): `;
  recomendacion += `Instrumento ${(dist.instrumento * 100).toFixed(0)}%, `;
  recomendacion += `Amplificación ${(dist.amplificacion * 100).toFixed(0)}%, `;
  recomendacion += `Accesorios ${(dist.accesorios * 100).toFixed(0)}%, `;
  recomendacion += `Grabación ${(dist.grabacion * 100).toFixed(0)}%. `;

  if (presupuesto < 200000) recomendacion += 'Con este presupuesto, priorizá lo esencial y comprá usado.';
  else if (presupuesto < 500000) recomendacion += 'Buen presupuesto para empezar. Podés conseguir equipo de calidad media.';
  else recomendacion += 'Excelente presupuesto. Podés armar un setup muy completo.';

  return { instrumento, amplificacion, accesorios, grabacion, recomendacion };
}
