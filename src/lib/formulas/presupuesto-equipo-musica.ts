/** Calculadora de Presupuesto para Equipo de Música */
export interface Inputs {
  presupuesto: number;
  nivel: string;
  tipo: string;
  __lang?: string;
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

const T = {
  es: {
    errorPresupuesto: 'Ingresá el presupuesto',
    errorNivelTipo: 'Seleccioná nivel y tipo válidos',
    distribPrefix: 'Distribución para',
    instrumento: 'Instrumento',
    amplificacion: 'Amplificación',
    accesorios: 'Accesorios',
    grabacion: 'Grabación',
    tipBajo: 'Con este presupuesto, priorizá lo esencial y comprá usado.',
    tipMedio: 'Buen presupuesto para empezar. Podés conseguir equipo de calidad media.',
    tipAlto: 'Excelente presupuesto. Podés armar un setup muy completo.',
  },
  en: {
    errorPresupuesto: 'Enter your budget',
    errorNivelTipo: 'Select a valid level and type',
    distribPrefix: 'Distribution for',
    instrumento: 'Instrument',
    amplificacion: 'Amplification',
    accesorios: 'Accessories',
    grabacion: 'Recording',
    tipBajo: 'With this budget, prioritize the essentials and consider buying used.',
    tipMedio: 'Good budget to get started. You can get mid-quality gear.',
    tipAlto: 'Excellent budget. You can put together a very complete setup.',
  },
} as const;

export function presupuestoEquipoMusica(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t = T[__lang];

  const presupuesto = Number(i.presupuesto);
  if (!presupuesto || presupuesto <= 0) throw new Error(t.errorPresupuesto);

  const dist = DISTRIBUCIONES[i.nivel]?.[i.tipo];
  if (!dist) throw new Error(t.errorNivelTipo);

  const instrumento = Math.round(presupuesto * dist.instrumento);
  const amplificacion = Math.round(presupuesto * dist.amplificacion);
  const accesorios = Math.round(presupuesto * dist.accesorios);
  const grabacion = Math.round(presupuesto * dist.grabacion);

  let recomendacion = `${t.distribPrefix} ${i.nivel} (${i.tipo}): `;
  recomendacion += `${t.instrumento} ${(dist.instrumento * 100).toFixed(0)}%, `;
  recomendacion += `${t.amplificacion} ${(dist.amplificacion * 100).toFixed(0)}%, `;
  recomendacion += `${t.accesorios} ${(dist.accesorios * 100).toFixed(0)}%, `;
  recomendacion += `${t.grabacion} ${(dist.grabacion * 100).toFixed(0)}%. `;

  if (presupuesto < 200000) recomendacion += t.tipBajo;
  else if (presupuesto < 500000) recomendacion += t.tipMedio;
  else recomendacion += t.tipAlto;

  return { instrumento, amplificacion, accesorios, grabacion, recomendacion };
}
