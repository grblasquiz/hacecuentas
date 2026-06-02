export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEstudioIdiomaMinutosDiaObjetivo(i: Inputs): Outputs {
  const h=Number(i.horasTotales)||600; const m=Number(i.meses)||12;
  const min=(h*60)/(m*30);
  const minR = Math.round(min);
  const pesado = min > 90;
  const liviano = min <= 30;
  const _insight = {
    title: 'Tu ritmo diario de estudio',
    text: pesado
      ? `Para cubrir **${h} horas en ${m} mes${m === 1 ? '' : 'es'}** tenés que estudiar **${minR} min por día** (6-7 días/semana). Es un ritmo exigente: si no podés sostenerlo, estirá el plazo o bajá la meta de horas.`
      : liviano
      ? `Para cubrir **${h} horas en ${m} mes${m === 1 ? '' : 'es'}** alcanza con **${minR} min por día** (6-7 días/semana). Es un ritmo muy llevadero, ideal para sostenerlo sin quemarte.`
      : `Para cubrir **${h} horas en ${m} mes${m === 1 ? '' : 'es'}** necesitás **${minR} min por día** (6-7 días/semana). Es un ritmo razonable: la clave es la constancia diaria, no las maratones de fin de semana.`,
    tone: pesado ? 'warn' : 'good',
    icon: '🗣️',
  };
  return { minDia:`${minR} min`, semDia:'6-7/sem', resumen:`${h}h en ${m}m: ${minR}min/día.`, _insight };
}
