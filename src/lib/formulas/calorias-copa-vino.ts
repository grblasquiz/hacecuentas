/** Calorías copa vino */
export interface Inputs { tipoVino: string; mlCopa: number; copasPorSemana: number; }
export interface Outputs { caloriasPorCopa: number; caloriasPorBotella: number; caloriasSemana: number; equivalenteEjercicio: string; comentario: string; _insight?: any; _chart?: any; }

export function caloriasCopaVino(i: Inputs): Outputs {
  const tipo = String(i.tipoVino);
  const ml = Number(i.mlCopa);
  const semana = Number(i.copasPorSemana);
  if (!ml || ml <= 0) throw new Error('Ingresá ml de copa');
  if (!isFinite(semana) || semana < 0) throw new Error('Ingresá copas por semana');

  const perfiles: Record<string, { abv: number; azucar: number }> = {
    tinto_seco: { abv: 13.5, azucar: 2 },
    blanco_seco: { abv: 12.5, azucar: 2 },
    rosado: { abv: 12.5, azucar: 5 },
    espumante_brut: { abv: 12, azucar: 8 },
    semi_dulce: { abv: 11, azucar: 40 },
    dulce: { abv: 10, azucar: 100 },
    fortificado: { abv: 19, azucar: 80 },
  };
  const p = perfiles[tipo] ?? perfiles.tinto_seco;
  const alcG = ml * (p.abv / 100) * 0.789;
  const azG = (ml / 1000) * p.azucar;
  const kcalCopa = alcG * 7 + azG * 4;

  const kcalBotella = kcalCopa * (750 / ml);
  const kcalSemana = kcalCopa * semana;

  const minCaminata = Math.round(kcalCopa / 4); // 4 kcal/min caminata
  const equiv = `${minCaminata} min caminata rápida o ${Math.round(minCaminata / 2)} min correr`;

  let com = '';
  let tone = 'neutral';
  if (kcalSemana < 300) { com = 'Consumo moderado — impacto calórico bajo.'; tone = 'good'; }
  else if (kcalSemana < 700) { com = 'Consumo estándar — equivale a 1 pizza chica al mes.'; tone = 'neutral'; }
  else if (kcalSemana < 1400) { com = 'Consumo medio-alto — 1 comida extra/semana.'; tone = 'warn'; }
  else { com = 'Consumo alto — considerá reducir por salud y calorías.'; tone = 'warn'; }

  const semanaR = Math.round(kcalSemana);
  const segMax = Math.max(1600, Number((semanaR * 1.1).toFixed(0)));

  return {
    caloriasPorCopa: Number(kcalCopa.toFixed(0)),
    caloriasPorBotella: Number(kcalBotella.toFixed(0)),
    caloriasSemana: Number(kcalSemana.toFixed(0)),
    equivalenteEjercicio: equiv,
    comentario: com,
    _insight: {
      title: 'Impacto de tu copa',
      text: `Cada copa suma **${Math.round(kcalCopa)} kcal**; con ${semana} por semana llegás a **${semanaR.toLocaleString('es-AR')} kcal/semana** (${equiv} por copa). ${com}`,
      tone,
      icon: '🍷',
    },
    _chart: {
      type: 'scale',
      marker: semanaR,
      markerLabel: `${semanaR.toLocaleString('es-AR')} kcal/sem`,
      min: 0,
      segments: [
        { nombre: 'Bajo', max: 300, color: '#86efac', colorDark: '#166534' },
        { nombre: 'Estándar', max: 700, color: '#fde047', colorDark: '#854d0e' },
        { nombre: 'Medio-alto', max: 1400, color: '#fdba74', colorDark: '#9a3412' },
        { nombre: 'Alto', max: segMax, color: '#fca5a5', colorDark: '#7f1d1d' },
      ],
      ariaLabel: 'Calorías semanales de vino ubicadas en su zona de consumo',
    },
  };
}
