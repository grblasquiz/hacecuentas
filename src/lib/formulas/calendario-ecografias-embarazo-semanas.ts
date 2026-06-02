export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function calendarioEcografiasEmbarazoSemanas(i: Inputs): Outputs {
  const s=Number(i.semanaActual)||0;
  let prox='', que='';
  if (s<=6) { prox='6-8 sem'; que='Confirmar embarazo + posición'; }
  else if (s<=14) { prox='11-14 sem'; que='Scan nucal + aneuploidías'; }
  else if (s<=22) { prox='20-22 sem'; que='ECO morfológica (órganos)'; }
  else if (s<=34) { prox='32-34 sem'; que='Crecimiento + placenta'; }
  else { prox='Parto'; que='Monitoreo fetal'; }

  const trimestre = s <= 13 ? 'primer' : s <= 27 ? 'segundo' : 'tercer';
  const insText = s >= 35
    ? `Estás en la **semana ${s}** (${trimestre} trimestre): a término. El foco ya es el **monitoreo fetal** previo al parto.`
    : `Estás en la **semana ${s}**, dentro del ${trimestre} trimestre. Tu próximo control es la ECO de **${prox}**: ${que.toLowerCase()}.`;
  const lastMax = Math.max(42, Math.ceil(s) + 1);

  return {
    proximaEco:prox,
    queRevisa:que,
    resumen:`Semana ${s}: próximo control ${prox}.`,
    _insight: { title: 'Tu próxima ecografía', text: insText, tone: 'neutral', icon: '🤰' },
    _chart: {
      type: 'scale',
      marker: s,
      markerLabel: `Sem ${s}`,
      min: 0,
      segments: [
        { nombre: '1er trim.', max: 13, color: '#f472b6', colorDark: '#f9a8d4' },
        { nombre: '2do trim.', max: 27, color: '#c084fc', colorDark: '#d8b4fe' },
        { nombre: '3er trim.', max: lastMax, color: '#818cf8', colorDark: '#a5b4fc' },
      ],
      ariaLabel: 'Línea de tiempo del embarazo en semanas por trimestre',
    },
  };
}
