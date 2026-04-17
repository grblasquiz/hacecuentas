/** Agua mineralización café */
export interface Inputs { durezaActual: number; tdsActual: number; phActual: number; }
export interface Outputs { evaluacion: string; scaCompliant: string; recomendacion: string; alternativa: string; }

export function aguaMineralizacionCafe(i: Inputs): Outputs {
  const d = Number(i.durezaActual);
  const tds = Number(i.tdsActual);
  const ph = Number(i.phActual);
  if (!isFinite(d) || !isFinite(tds) || !isFinite(ph)) throw new Error('Ingresá todos los valores');

  const durezaOk = d >= 50 && d <= 175;
  const tdsOk = tds >= 75 && tds <= 250;
  const phOk = ph >= 6.5 && ph <= 7.5;
  const all = durezaOk && tdsOk && phOk;

  let eval_ = '';
  if (all) eval_ = 'Agua en rango SCA — excelente para café specialty';
  else if (!durezaOk && d > 175) eval_ = 'Agua muy dura — afecta extracción y calcifica máquina';
  else if (!durezaOk && d < 50) eval_ = 'Agua muy blanda — corroe y sobreextrae';
  else if (!tdsOk && tds > 250) eval_ = 'TDS muy alto — café plano';
  else if (!tdsOk && tds < 75) eval_ = 'TDS muy bajo — café débil';
  else if (!phOk) eval_ = ph > 7.5 ? 'pH alto — café plano' : 'pH bajo — café ácido/agrio';
  else eval_ = 'Agua aceptable';

  const sca = all ? 'Sí (todas las métricas en rango)' : 'No';

  let rec = '';
  if (all) rec = 'Filtrá cloro con carbón activado, usá normalmente.';
  else if (d > 175 || tds > 250) rec = 'Mezclá 50/50 con agua destilada o instalá filtro de osmosis.';
  else if (d < 50 || tds < 75) rec = 'Remineralizá con Third Wave Water o 0.08g Epsom + 0.15g bicarbonato por litro.';
  else if (ph > 7.5) rec = 'pH alto — filtro con intercambio iónico.';
  else if (ph < 6.5) rec = 'pH bajo — pizca de bicarbonato sodio.';

  const alt = 'Agua mineral comercial: Volvic (ideal), Villa del Sur (bueno), Villavicencio (bueno). Evitá Evian para café.';

  return { evaluacion: eval_, scaCompliant: sca, recomendacion: rec, alternativa: alt };
}
