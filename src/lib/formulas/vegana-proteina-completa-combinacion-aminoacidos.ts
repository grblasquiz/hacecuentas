export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function veganaProteinaCompletaCombinacionAminoacidos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const p=String(i.plato||'lentejas_arroz');
  const data={
    'lentejas_arroz':{c:{es:'Sí',en:'Yes',pt:'Sim'},lim:{es:'Ninguno',en:'None',pt:'Nenhum'},pd:0.95},
    'hummus_pan_pita':{c:{es:'Sí',en:'Yes',pt:'Sim'},lim:{es:'Ninguno',en:'None',pt:'Nenhum'},pd:0.9},
    'tofu_quinoa':{c:{es:'Excelente',en:'Excellent',pt:'Excelente'},lim:{es:'Ninguno (ambos completos)',en:'None (both complete)',pt:'Nenhum (ambos completos)'},pd:1.0},
    'mani_pan_integral':{c:{es:'Casi',en:'Almost',pt:'Quase'},lim:{es:'Trazas metionina',en:'Methionine traces',pt:'Traços de metionina'},pd:0.85},
    'poroto_maiz':{c:{es:'Sí',en:'Yes',pt:'Sim'},lim:{es:'Ninguno',en:'None',pt:'Nenhum'},pd:0.9}
  };
  const d=data[p];

  const completoTxt = d.c[__lang];
  const limTxt = d.lim[__lang];

  const insightT = {
    es: {
      title: 'Calidad de la proteína combinada',
      text: `Esta combinación tiene un **PDCAAS de ${d.pd}** (sobre 1,0): proteína **${completoTxt.toLowerCase()}** completa. Aminoácido limitante: **${limTxt.toLowerCase()}**. Combinar legumbres y cereales en el día cubre todos los aminoácidos esenciales.`,
      icon: '🌱'
    },
    en: {
      title: 'Combined protein quality',
      text: `This combo scores a **PDCAAS of ${d.pd}** (out of 1.0): **${completoTxt.toLowerCase()}** a complete protein. Limiting amino acid: **${limTxt.toLowerCase()}**. Pairing legumes and grains during the day covers all essential amino acids.`,
      icon: '🌱'
    },
    pt: {
      title: 'Qualidade da proteína combinada',
      text: `Esta combinação tem um **PDCAAS de ${d.pd}** (de 1,0): proteína **${completoTxt.toLowerCase()}** completa. Aminoácido limitante: **${limTxt.toLowerCase()}**. Combinar leguminosas e cereais ao longo do dia cobre todos os aminoácidos essenciais.`,
      icon: '🌱'
    }
  };
  const ins = insightT[__lang];

  const segT = {
    es: [{ n: 'Incompleta', }, { n: 'Buena' }, { n: 'Excelente' }],
    en: [{ n: 'Incomplete' }, { n: 'Good' }, { n: 'Excellent' }],
    pt: [{ n: 'Incompleta' }, { n: 'Boa' }, { n: 'Excelente' }]
  };
  const sg = segT[__lang];

  return {
    completo: completoTxt,
    aminoacidoLimitante: limTxt,
    pdcaas: `${d.pd}`,
    _insight: { title: ins.title, text: ins.text, tone: d.pd >= 0.9 ? 'good' : d.pd >= 0.7 ? 'neutral' : 'warn', icon: ins.icon },
    _chart: {
      type: 'scale',
      marker: d.pd,
      markerLabel: `PDCAAS ${d.pd}`,
      min: 0,
      segments: [
        { nombre: sg[0].n, max: 0.7, color: '#f87171', colorDark: '#dc2626' },
        { nombre: sg[1].n, max: 0.9, color: '#fbbf24', colorDark: '#d97706' },
        { nombre: sg[2].n, max: 1.05, color: '#22c55e', colorDark: '#15803d' }
      ],
      ariaLabel: `PDCAAS ${d.pd} de un máximo de 1,0`
    }
  };
}
