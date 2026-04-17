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
  return {
    categoria: r.cat,
    riesgoMigrana: r.risk,
    recomendacion: r.rec,
    resumen: `${r.cat} - ${r.risk}. ${r.rec}`,
  };
}
