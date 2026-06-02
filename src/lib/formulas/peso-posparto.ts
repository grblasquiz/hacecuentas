/** Pérdida de peso posparto */
export interface Inputs { pesoPreEmbarazo: number; pesoActual: number; semanasPosParto: number; amamanta?: string; __lang?: string; }
export interface Outputs { pesoAPerdPer: string; tiempoEstimado: string; ritmo: string; nota: string; _insight?: any; }

export function pesoPosparto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorPesos: 'Ingresá ambos pesos',
      notaExclusiva: 'La lactancia exclusiva gasta ~500 kcal/día extra, lo que puede acelerar la pérdida. No bajes de 1.800 kcal/día.',
      notaMixta: 'La lactancia mixta gasta ~300 kcal/día extra. Mantenete hidratada y bien alimentada.',
      notaSin: 'Sin lactancia, tu metabolismo es el normal. Podés hacer un déficit moderado de 500 kcal/día.',
      pesoOk: '¡Ya estás en tu peso pre-embarazo o menos!',
      noNecesitas: 'No necesitás perder peso.',
      ritmoCero: '0 kg/semana (objetivo cumplido)',
      notaOk: 'Enfocate en alimentación nutritiva y actividad física para mantener tu salud.',
      ritmoNormal: '0,5 kg/semana (máx recomendado durante los primeros 6 meses posparto)',
    },
    en: {
      errorPesos: 'Enter both weights',
      notaExclusiva: 'Exclusive breastfeeding burns ~500 kcal/day extra, which can speed up weight loss. Do not go below 1,800 kcal/day.',
      notaMixta: 'Mixed breastfeeding burns ~300 kcal/day extra. Stay hydrated and well-nourished.',
      notaSin: 'Without breastfeeding, your metabolism is back to normal. A moderate deficit of 500 kcal/day is reasonable.',
      pesoOk: 'You are already at or below your pre-pregnancy weight!',
      noNecesitas: 'You do not need to lose weight.',
      ritmoCero: '0 kg/week (goal achieved)',
      notaOk: 'Focus on nutritious eating and physical activity to maintain your health.',
      ritmoNormal: '0.5 kg/week (max recommended during the first 6 months postpartum)',
    },
  } as const)[__lang];

  const pesoAntes = Number(i.pesoPreEmbarazo);
  const pesoAhora = Number(i.pesoActual);
  const semanas = Number(i.semanasPosParto);
  const amamanta = String(i.amamanta || 'exclusiva');
  if (!pesoAntes || !pesoAhora) throw new Error(T.errorPesos);

  const diferencia = pesoAhora - pesoAntes;
  const perdidoYa = semanas <= 2 ? Math.min(diferencia, 7) : Math.min(diferencia, 9);

  const faltaPerder = Math.max(0, diferencia);
  const ritmoSemanal = 0.5; // kg por semana saludable
  const semanasEstimadas = Math.ceil(faltaPerder / ritmoSemanal);
  const mesesEstimados = (semanasEstimadas / 4.33).toFixed(1);

  let nota = '';
  if (amamanta === 'exclusiva') {
    nota = T.notaExclusiva;
  } else if (amamanta === 'mixta') {
    nota = T.notaMixta;
  } else {
    nota = T.notaSin;
  }

  if (faltaPerder <= 0) {
    return {
      pesoAPerdPer: T.pesoOk,
      tiempoEstimado: T.noNecesitas,
      ritmo: T.ritmoCero,
      nota: T.notaOk,
      _insight: {
        title: __lang === 'en' ? 'You are already there' : 'Ya llegaste',
        text: __lang === 'en'
          ? `At **${pesoAhora} kg** you are already at or below your **${pesoAntes} kg** pre-pregnancy weight. There is nothing to chase — focus on energy, recovery and nourishing meals, not the scale.`
          : `Con **${pesoAhora} kg** ya estás en tu peso pre-embarazo de **${pesoAntes} kg** o por debajo. No hay nada que perseguir: enfocate en energía, recuperación y comer bien, no en la balanza.`,
        tone: 'good',
        icon: '🤱',
      },
    };
  }

  return {
    pesoAPerdPer: `${faltaPerder.toFixed(1)} kg (de ${pesoAhora} kg a ${pesoAntes} kg)`,
    tiempoEstimado: __lang === 'en'
      ? `~${semanasEstimadas} weeks (~${mesesEstimados} months) at a healthy pace`
      : `~${semanasEstimadas} semanas (~${mesesEstimados} meses) a ritmo saludable`,
    ritmo: T.ritmoNormal,
    nota,
    _insight: {
      title: __lang === 'en' ? 'A realistic timeline' : 'Un plazo realista',
      text: __lang === 'en'
        ? `You are about **${faltaPerder.toFixed(1)} kg** above your pre-pregnancy weight. At a safe ~0.5 kg/week that is roughly **${mesesEstimados} months** — postpartum recovery is a slow burn, and crash diets backfire on milk supply and energy.`
        : `Estás unos **${faltaPerder.toFixed(1)} kg** por encima de tu peso pre-embarazo. A un ritmo seguro de ~0,5 kg/semana son cerca de **${mesesEstimados} meses** — la recuperación posparto es lenta y las dietas extremas juegan en contra de la leche y la energía.`,
      tone: 'neutral',
      icon: '🤱',
    },
  };
}
