/**
 * Colágeno por objetivo.
 */

export interface ColagenoTipoDosisDiariaInputs {
  objetivo: string;
  peso: number;
}

export interface ColagenoTipoDosisDiariaOutputs {
  dosisGramos: number;
  tipo: string;
  timing: string;
  resumen: string;
  _insight?: any;
}

export function colagenoTipoDosisDiaria(inputs: ColagenoTipoDosisDiariaInputs): ColagenoTipoDosisDiariaOutputs {
  const obj = inputs.objetivo || 'piel';
  const map: Record<string, { dosis: number; tipo: string; timing: string }> = {
    'piel': { dosis: 10, tipo: 'Tipo I/III hidrolizado (bovino o marino)', timing: 'Cualquier hora del día, con vit C.' },
    'articulacion': { dosis: 10, tipo: 'Tipo II (UC-II 40mg) o I/III hidrolizado', timing: 'Con comida principal.' },
    'tendon': { dosis: 15, tipo: 'Tipo I hidrolizado', timing: '30-60 min pre-rehab/ejercicio con vit C.' },
    'cirugia': { dosis: 20, tipo: 'Tipo I/III hidrolizado', timing: 'Repartido en 2 tomas + vit C.' },
  };
  const r = map[obj] ?? map['piel'];

  const objLabel: Record<string, string> = {
    'piel': 'piel',
    'articulacion': 'articulaciones',
    'tendon': 'tendones',
    'cirugia': 'recuperación post-cirugía',
  };
  const meta = objLabel[obj] ?? 'piel';
  const insight = {
    title: 'Tu dosis de colágeno',
    text: `Para **${meta}**, apuntá a **${r.dosis} g/día** de ${r.tipo}. Tomalo con **vitamina C** (potencia la síntesis) y sé constante: los resultados aparecen recién a las **8-12 semanas**.`,
    tone: 'neutral',
    icon: '💊',
  };

  return {
    dosisGramos: r.dosis,
    tipo: r.tipo,
    timing: r.timing,
    resumen: `${r.dosis}g colágeno (${r.tipo}) - ${r.timing}`,
    _insight: insight,
  };
}
