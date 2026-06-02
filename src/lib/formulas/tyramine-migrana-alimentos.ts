/**
 * Tiramina por alimento.
 */

export interface TyramineMigranaAlimentosInputs {
  alimento: string;
}

export interface TyramineMigranaAlimentosOutputs {
  categoria: string;
  riesgoMigrana: string;
  recomendacion: string;
  resumen: string;
  _insight?: any;
}

export function tyramineMigranaAlimentos(inputs: TyramineMigranaAlimentosInputs): TyramineMigranaAlimentosOutputs {
  const a = inputs.alimento || 'fresco';
  const map: Record<string, { cat: string; risk: string; rec: string }> = {
    'fresco': { cat: 'Bajo ✅', risk: 'Mínimo', rec: 'Seguro.' },
    'lacteo-fresco': { cat: 'Bajo ✅', risk: 'Mínimo', rec: 'Seguro.' },
    'queso-semiduro': { cat: 'Moderado', risk: 'Posible trigger', rec: 'Ocasional, observar.' },
    'queso-azul': { cat: 'Muy alto 🚨', risk: 'Alto trigger', rec: 'Evitar con migraña o IMAO.' },
    'queso-anejo': { cat: 'Muy alto 🚨', risk: 'Alto trigger', rec: 'Evitar con migraña o IMAO.' },
    'salame': { cat: 'Muy alto 🚨', risk: 'Alto trigger', rec: 'Evitar.' },
    'arenque': { cat: 'Muy alto 🚨', risk: 'Alto trigger', rec: 'Evitar.' },
    'vino-tinto': { cat: 'Alto ⚠️', risk: 'Trigger en sensibles', rec: 'Evitar si migraña frecuente.' },
    'cerveza': { cat: 'Alto ⚠️', risk: 'Trigger especialmente artesanal', rec: 'Moderar.' },
    'chocolate': { cat: 'Moderado', risk: 'Trigger en algunos', rec: 'Ocasional.' },
    'chucrut': { cat: 'Muy alto 🚨', risk: 'Alto trigger', rec: 'Evitar fermentados.' },
    'palta-madura': { cat: 'Moderado', risk: 'Posible', rec: 'Consumir menos madura.' },
  };
  const r = map[a] ?? map['fresco'];

  const isMuyAlto = r.cat.includes('Muy alto');
  const isAlto = r.cat.includes('Alto') && !isMuyAlto;
  const isModerado = r.cat.includes('Moderado');
  const tone = (isMuyAlto || isAlto) ? 'warn' : isModerado ? 'neutral' : 'good';
  const text = isMuyAlto
    ? `Este alimento está en la categoría **${r.cat.replace(/[^\wÁÉÍÓÚáéíóúñ ]/g, '').trim()}** de tiramina: es un **trigger fuerte** de migraña. ${r.rec}`
    : isAlto
    ? `Nivel de tiramina **${r.cat.replace(/[^\wÁÉÍÓÚáéíóúñ ]/g, '').trim()}**: puede disparar crisis en personas sensibles. ${r.rec}`
    : isModerado
    ? `Tiramina **moderada**: ${r.risk.toLowerCase()}. ${r.rec}`
    : `Tiramina **baja**: ${r.risk.toLowerCase()}. ${r.rec}`;
  const _insight = {
    title: 'Riesgo de migraña',
    text,
    tone,
    icon: '🧠',
  };

  return {
    categoria: r.cat,
    riesgoMigrana: r.risk,
    recomendacion: r.rec,
    resumen: `${r.cat} - ${r.risk}. ${r.rec}`,
    _insight,
  };
}
