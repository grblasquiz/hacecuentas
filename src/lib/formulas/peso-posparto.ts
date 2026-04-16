/** Pérdida de peso posparto */
export interface Inputs { pesoPreEmbarazo: number; pesoActual: number; semanasPosParto: number; amamanta?: string; }
export interface Outputs { pesoAPerdPer: string; tiempoEstimado: string; ritmo: string; nota: string; }

export function pesoPosparto(i: Inputs): Outputs {
  const pesoAntes = Number(i.pesoPreEmbarazo);
  const pesoAhora = Number(i.pesoActual);
  const semanas = Number(i.semanasPosParto);
  const amamanta = String(i.amamanta || 'exclusiva');
  if (!pesoAntes || !pesoAhora) throw new Error('Ingresá ambos pesos');

  const diferencia = pesoAhora - pesoAntes;
  const perdidoYa = semanas <= 2 ? Math.min(diferencia, 7) : Math.min(diferencia, 9);

  const faltaPerder = Math.max(0, diferencia);
  const ritmoSemanal = 0.5; // kg por semana saludable
  const semanasEstimadas = Math.ceil(faltaPerder / ritmoSemanal);
  const mesesEstimados = (semanasEstimadas / 4.33).toFixed(1);

  let nota = '';
  if (amamanta === 'exclusiva') {
    nota = 'La lactancia exclusiva gasta ~500 kcal/día extra, lo que puede acelerar la pérdida. No bajes de 1.800 kcal/día.';
  } else if (amamanta === 'mixta') {
    nota = 'La lactancia mixta gasta ~300 kcal/día extra. Mantenete hidratada y bien alimentada.';
  } else {
    nota = 'Sin lactancia, tu metabolismo es el normal. Podés hacer un déficit moderado de 500 kcal/día.';
  }

  if (faltaPerder <= 0) {
    return {
      pesoAPerdPer: '¡Ya estás en tu peso pre-embarazo o menos!',
      tiempoEstimado: 'No necesitás perder peso.',
      ritmo: 'N/A',
      nota: 'Enfocate en alimentación nutritiva y actividad física para mantener tu salud.',
    };
  }

  return {
    pesoAPerdPer: `${faltaPerder.toFixed(1)} kg (de ${pesoAhora} kg a ${pesoAntes} kg)`,
    tiempoEstimado: `~${semanasEstimadas} semanas (~${mesesEstimados} meses) a ritmo saludable`,
    ritmo: `0,5 kg/semana (máx recomendado durante los primeros 6 meses posparto)`,
    nota,
  };
}
