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
  _insight?: any;
}

export function histaminaAlimentoIntolerancia(inputs: HistaminaAlimentoIntoleranciaInputs): HistaminaAlimentoIntoleranciaOutputs {
  const a = inputs.alimento || 'fresco';
  const map: Record<string, { cat: string; rec: string; nivel: 'bajo' | 'medio' | 'alto' }> = {
    'fresco': { cat: 'Bajo ✅', rec: 'Seguro para intolerancia.', nivel: 'bajo' },
    'pescado-fresco': { cat: 'Bajo-moderado', rec: 'OK si pescado ultra fresco. No comer si >24h.', nivel: 'medio' },
    'citrico': { cat: 'Liberador ⚠️', rec: 'No tiene histamina pero la libera. Moderar.', nivel: 'medio' },
    'queso-ligero': { cat: 'Moderado', rec: 'Fresco OK. Evitar si agudo.', nivel: 'medio' },
    'pescado-no-fresco': { cat: 'Alto ⚠️', rec: 'Evitar. Histamina crece rápidamente.', nivel: 'alto' },
    'queso-anejo': { cat: 'Alto ⚠️', rec: 'Evitar parmesano, cheddar, azul.', nivel: 'alto' },
    'embutido': { cat: 'Alto ⚠️', rec: 'Evitar todos los embutidos.', nivel: 'alto' },
    'fermentado': { cat: 'Muy alto 🚨', rec: 'Evitar chucrut, kombucha, kimchi.', nivel: 'alto' },
    'vino': { cat: 'Muy alto 🚨', rec: 'Evitar, especialmente tinto.', nivel: 'alto' },
  };
  const r = map[a] ?? map['fresco'];

  // Insight dinámico según el nivel de histamina del alimento.
  const insightByNivel = {
    bajo: {
      title: 'Apto para una dieta baja en histamina',
      text: `Este alimento es de nivel **${r.cat}**: ${r.rec.toLowerCase()} Podés incluirlo con tranquilidad si seguís una dieta baja en histamina.`,
      tone: 'good',
      icon: '✅',
    },
    medio: {
      title: 'Con moderación',
      text: `Nivel **${r.cat}**: ${r.rec.toLowerCase()} La tolerancia varía entre personas, así que probá en porciones chicas y observá cómo te sienta.`,
      tone: 'neutral',
      icon: '🍽️',
    },
    alto: {
      title: 'Mejor evitarlo en intolerancia',
      text: `Nivel **${r.cat}**: ${r.rec.toLowerCase()} En personas con déficit de DAO suele desencadenar síntomas (cefalea, urticaria, congestión).`,
      tone: 'warn',
      icon: '🚫',
    },
  };

  return {
    categoria: r.cat,
    recomendacion: r.rec,
    resumen: `Este alimento es ${r.cat}. ${r.rec}`,
    _insight: insightByNivel[r.nivel],
  };
}
