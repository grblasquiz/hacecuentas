/** Cantidad máxima de peces por litros de acuario según perfil. */
export interface Inputs {
  litros: number;
  perfil?: string;
  plantado?: boolean;
  filtro?: string;
}
export interface Outputs {
  pecesMax: number;
  cmPecesTotal: number;
  ejemploCardumenes: string;
  recomendacion: string;
  _insight?: any;
}

export function cantidadPecesAcuarioLitros(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar.
  (i as any).plantado = (i as any).plantado === true || (i as any).plantado === 'true';
  const litros = Number(i.litros);
  if (!litros || litros <= 0) throw new Error('Ingresá los litros del acuario');

  const perfil = String(i.perfil || 'comunitario');
  const plantado = i.plantado === true;
  const filtro = String(i.filtro || 'normal');

  // Litros efectivos (descuento por decoración/sustrato)
  const efectivos = litros * 0.9;

  // Ratio: litros por cm de pez adulto
  const ratio: Record<string, number> = {
    'nano': 1.5,
    'comunitario': 2.0,
    'mediano': 2.5,
    'fondo': 3.0,
    'ciclidos-enanos': 4.0,
    'ciclidos-grandes': 9.0,
  };
  const r = ratio[perfil] ?? 2.0;

  let cm = efectivos / r;

  if (plantado) cm *= 1.17;
  if (filtro === 'potente') cm *= 1.15;
  else if (filtro === 'basico') cm *= 0.75;

  // Estimación cantidad: tamaño promedio por perfil
  const tamAdulto: Record<string, number> = {
    'nano': 3.5,
    'comunitario': 5,
    'mediano': 6,
    'fondo': 5,
    'ciclidos-enanos': 7,
    'ciclidos-grandes': 20,
  };
  const tam = tamAdulto[perfil] ?? 5;
  const peces = Math.floor(cm / tam);

  const ejemplos: Record<string, string> = {
    'nano': `${Math.max(6, Math.round(peces * 0.7))} tetras nano + ${Math.round(peces * 0.3)} corys pygmaeus o caracoles.`,
    'comunitario': `${Math.max(6, Math.round(peces * 0.4))} tetras cardenal + ${Math.round(peces * 0.3)} corys + ${Math.round(peces * 0.15)} otos + 1-2 guramis enanos.`,
    'mediano': `${Math.round(peces * 0.5)} platys/mollys + ${Math.round(peces * 0.3)} corys + ${Math.round(peces * 0.15)} otos.`,
    'fondo': `${Math.round(peces * 0.6)} corys + ${Math.round(peces * 0.3)} otos + algún ancistrus.`,
    'ciclidos-enanos': `1 pareja apistograma + ${Math.max(6, Math.round(peces * 0.5))} tetras + 5-6 corys.`,
    'ciclidos-grandes': `1-2 peces grandes (ángel, oscar) con plec grande y filtro externo.`,
  };

  let rec = '';
  if (filtro === 'basico') rec = 'Con filtro básico reducí carga. Considerá sumar filtro externo o interno más potente.';
  else if (peces < 5 && perfil !== 'ciclidos-grandes') rec = 'Tu acuario es chico: limitate a peces nano y respetá cardúmenes mínimos (6+).';
  else rec = 'Sumá los peces en tandas de 2-3 por semana, no todos juntos. Mediá amoníaco y nitritos al agregar cada grupo.';

  const pecesMaxFinal = Math.max(1, peces);
  const chico = pecesMaxFinal < 5 && perfil !== 'ciclidos-grandes';
  const insight = {
    title: chico ? 'Acuario chico: cuidá la carga' : 'Sumá los peces de a poco',
    text: chico
      ? `Con **${litros} L** te entran ~**${pecesMaxFinal} peces** (${Math.round(cm)} cm de pez adulto en total). Es poco margen: limitate a especies nano y respetá los cardúmenes mínimos (6+) para que no estén estresados.`
      : `Con **${litros} L** podés tener hasta ~**${pecesMaxFinal} peces** (${Math.round(cm)} cm de pez adulto en total). No los metas todos juntos: agregalos en tandas de 2-3 por semana y medí amoníaco y nitritos en cada grupo.`,
    tone: chico ? 'warn' : 'good',
    icon: '🐟',
  };
  return {
    pecesMax: pecesMaxFinal,
    cmPecesTotal: Math.round(cm),
    ejemploCardumenes: ejemplos[perfil] ?? 'Consultá ejemplos en la explicación extendida.',
    recomendacion: rec,
    _insight: insight,
  };
}
