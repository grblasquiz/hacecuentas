export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/** Planificador de publicaciones para una cuenta de Pinterest Business. */
export function pinterestCalendarioPines(i: Inputs): Outputs {
  const pinesSemana = Math.max(1, Math.round(Number(i.pinesSemana) || 7));
  const dias = Math.min(7, Math.max(1, Math.round(Number(i.diasPublicacion) || 5)));
  const pinesListos = Math.max(0, Math.round(Number(i.pinesListos) || 0));
  const porDia = Math.ceil(pinesSemana / dias);
  const semanasCobertura = pinesSemana ? Math.floor(pinesListos / pinesSemana) : 0;
  const cupoProgramable = Math.min(10, pinesListos);

  return {
    pinesPorDia: porDia,
    pinesSemana,
    semanasCobertura,
    pinesProgramables: cupoProgramable,
    faltantesParaSemana: Math.max(0, pinesSemana - pinesListos),
    plan: `${porDia} Pin${porDia === 1 ? '' : 'es'} por día durante ${dias} día${dias === 1 ? '' : 's'} (${pinesSemana} por semana).`,
    _insight: {
      title: `Tu calendario: ${porDia} Pin${porDia === 1 ? '' : 'es'} por día`,
      text: `Con ${pinesListos} piezas listas, tenés cobertura para **${semanasCobertura} semana${semanasCobertura === 1 ? '' : 's'}**. Pinterest permite programar hasta **10 Pins** a futuro desde una cuenta Business: hoy podés dejar ${cupoProgramable} programado${cupoProgramable === 1 ? '' : 's'} y producir ${Math.max(0, pinesSemana - pinesListos)} más para completar la próxima semana.`,
      tone: pinesListos >= pinesSemana ? 'good' : 'neutral',
      icon: '📌',
    },
  };
}
