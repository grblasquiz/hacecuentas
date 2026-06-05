export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function trailRunningDesnivelRitmoAjustado(i: Inputs): Outputs {
  const d = Number(i.distanciaKm) || 0;
  const des = Number(i.desnivelPositivo) || 0;
  const p = Number(i.paceBaseKm) || 6;

  // Naismith rule: each 100m elevation gain = 1 km equivalent distance
  const equivDist = d + des / 100;
  const totSeg = equivDist * p * 60;
  const effectivePaceSec = d > 0 ? totSeg / d : p * 60;

  const h = Math.floor(totSeg / 3600);
  const m = Math.floor((totSeg % 3600) / 60);
  const s = Math.round(totSeg % 60);

  const epMin = Math.floor(effectivePaceSec / 60);
  const epSeg = Math.round(effectivePaceSec % 60);

  const baseMin = Math.floor(p);
  const baseSeg = Math.round((p - Math.floor(p)) * 60);
  const extraMin = Math.round((equivDist - d) * p);
  const desnivelPorKm = d > 0 ? Math.round(des / d) : 0;

  const tiempoAjustado = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const ritmoEfectivo = `${epMin}:${String(epSeg).padStart(2, '0')}/km`;

  return {
    tiempoAjustado,
    ritmoEfectivo,
    interpretacion: `${d} km con +${des}m desnivel: tiempo estimado ${h}h ${m}m (equiv. ${Math.round(equivDist * 10) / 10} km planos).`,
    _insight: {
      title: 'Cómo te frena el desnivel',
      text: `Los **+${des} m** de desnivel (≈${desnivelPorKm} m/km) equivalen a **${Math.round(des / 100)} km extras** según la Regla de Naismith: pasás de correr ${d} km a esforzarte como si fueran **${Math.round(equivDist * 10) / 10} km** planos. Tu pace base de **${baseMin}:${String(baseSeg).padStart(2, '0')}/km** se convierte en un ritmo efectivo de **${ritmoEfectivo}** sobre la distancia real, con tiempo estimado de **${tiempoAjustado}**.`,
      tone: 'neutral',
      icon: '⛰️',
    },
  };
}
