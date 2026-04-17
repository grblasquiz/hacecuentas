/**
 * Histamina alimento.
 */

export interface HistaminaAlimentoIntoleranciaInputs {
  alimento: string;
}

export interface HistaminaAlimentoIntoleranciaOutputs {
  categoria: string;
  recomendacion: string;
  resumen: string;
}

export function histaminaAlimentoIntolerancia(inputs: HistaminaAlimentoIntoleranciaInputs): HistaminaAlimentoIntoleranciaOutputs {
  const a = inputs.alimento || 'fresco';
  const map: Record<string, { cat: string; rec: string }> = {
    'fresco': { cat: 'Bajo ✅', rec: 'Seguro para intolerancia.' },
    'pescado-fresco': { cat: 'Bajo-moderado', rec: 'OK si pescado ultra fresco. No comer si >24h.' },
    'citrico': { cat: 'Liberador ⚠️', rec: 'No tiene histamina pero la libera. Moderar.' },
    'queso-ligero': { cat: 'Moderado', rec: 'Fresco OK. Evitar si agudo.' },
    'pescado-no-fresco': { cat: 'Alto ⚠️', rec: 'Evitar. Histamina crece rápidamente.' },
    'queso-anejo': { cat: 'Alto ⚠️', rec: 'Evitar parmesano, cheddar, azul.' },
    'embutido': { cat: 'Alto ⚠️', rec: 'Evitar todos los embutidos.' },
    'fermentado': { cat: 'Muy alto 🚨', rec: 'Evitar chucrut, kombucha, kimchi.' },
    'vino': { cat: 'Muy alto 🚨', rec: 'Evitar, especialmente tinto.' },
  };
  const r = map[a] ?? map['fresco'];
  return {
    categoria: r.cat,
    recomendacion: r.rec,
    resumen: `Este alimento es ${r.cat}. ${r.rec}`,
  };
}
