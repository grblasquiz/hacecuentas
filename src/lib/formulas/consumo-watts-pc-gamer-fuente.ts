export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function consumoWattsPcGamerFuente(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const cpu=Number(i.cpu)||0; const gpu=Number(i.gpu)||0; const otr=Number(i.otros)||50;
  const total=cpu+gpu+otr; const fuente=Math.ceil(total*1.3/50)*50;
  const margen = fuente - total;
  const pctGpu = total > 0 ? Math.round((gpu / total) * 100) : 0;
  const resumen = __lang === 'en'
    ? `Peak ${total}W → recommended PSU ${fuente}W.`
    : `Pico ${total}W → fuente recomendada ${fuente}W.`;
  const insightText = __lang === 'en'
    ? `Your build peaks at **${total}W**, with the **GPU drawing ${pctGpu}%**. A **${fuente}W** unit leaves **${margen}W** of headroom (30%) for spikes and future upgrades.`
    : `Tu equipo pico a **${total}W**, y la **placa de video se lleva el ${pctGpu}%**. Una fuente de **${fuente}W** deja **${margen}W** de margen (30%) para picos y futuros upgrades.`;
  const slices = __lang === 'en'
    ? [ { label: 'CPU', value: cpu }, { label: 'GPU', value: gpu }, { label: 'Other', value: otr } ]
    : [ { label: 'CPU', value: cpu }, { label: 'GPU', value: gpu }, { label: 'Otros', value: otr } ];
  return { total:`${total} W`, fuente:`${fuente} W (80+ Gold)`, resumen,
    _insight: {
      title: __lang === 'en' ? 'Power draw and PSU' : 'Consumo y fuente',
      text: insightText,
      tone: 'neutral',
      icon: '🔌',
    },
    _chart: {
      type: 'doughnut',
      slices: slices.filter(s => Number(s.value) > 0),
      prefix: '',
      centerValue: `${total} W`,
      centerLabel: __lang === 'en' ? 'peak draw' : 'consumo pico',
      ariaLabel: __lang === 'en'
        ? `Power breakdown: ${total}W split across CPU, GPU and other components`
        : `Desglose de consumo: ${total}W repartidos entre CPU, GPU y otros`,
    },
  };
}
