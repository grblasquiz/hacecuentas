export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function ingresoMedicinaPuntajeCbcUba2026(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      posAlta: 'Casi garantizado',
      consAlta: 'Felicitaciones. Preparate para 2do año.',
      posAltProb: 'Altamente probable',
      consAltProb: 'Mantener nivel.',
      posPosible: 'Posible, pero con cupo ajustado',
      consPosible: 'Considerá mejorar el promedio.',
      posDificil: 'Difícil con cupo actual',
      consDificil: 'Evaluá recursar materias específicas.',
      posBaja: 'Poco probable',
      consBaja: 'Fortalecé bases antes de continuar.',
      refCorte: '~7.5 histórico (varía por cuatrimestre)',
      insTitleArriba: 'Estás sobre el corte',
      insTitleAjustado: 'Justo en la línea del corte',
      insTitleDebajo: 'Por debajo del corte',
      insArriba: (p: string, d: string) => `Tu promedio de **${p}** está **${d} puntos por encima** del corte histórico (~7.5): tenés muy buenas chances de quedar en Medicina.`,
      insAjustado: (p: string) => `Tu promedio de **${p}** ronda el corte histórico (~7.5): podés entrar, pero el cupo se define al límite. Subir unas décimas te da margen.`,
      insDebajo: (p: string, d: string) => `Tu promedio de **${p}** está **${d} puntos por debajo** del corte histórico (~7.5). Reforzá las materias más flojas para acercarte.`,
      gaugeAria: (p: string) => `Promedio del CBC de ${p} sobre un corte histórico de 7.5 para Medicina en la UBA`,
    },
    en: {
      posAlta: 'Almost guaranteed',
      consAlta: 'Congratulations. Get ready for 2nd year.',
      posAltProb: 'Highly likely',
      consAltProb: 'Keep up the current level.',
      posPosible: 'Possible, but with limited spots',
      consPosible: 'Consider improving your average.',
      posDificil: 'Difficult with current capacity',
      consDificil: 'Evaluate retaking specific subjects.',
      posBaja: 'Unlikely',
      consBaja: 'Strengthen your foundations before continuing.',
      refCorte: '~7.5 historical cutoff (varies by semester)',
      insTitleArriba: 'You are above the cutoff',
      insTitleAjustado: 'Right at the cutoff line',
      insTitleDebajo: 'Below the cutoff',
      insArriba: (p: string, d: string) => `Your average of **${p}** is **${d} points above** the historical cutoff (~7.5): you have very good chances of getting into Medicine.`,
      insAjustado: (p: string) => `Your average of **${p}** is around the historical cutoff (~7.5): you can get in, but spots are decided at the limit. Gaining a few tenths gives you margin.`,
      insDebajo: (p: string, d: string) => `Your average of **${p}** is **${d} points below** the historical cutoff (~7.5). Reinforce your weakest subjects to close the gap.`,
      gaugeAria: (p: string) => `CBC average of ${p} against a historical cutoff of 7.5 for Medicine at UBA`,
    },
  } as const)[__lang];
  const p=Number(i.promedioCbc)||0;
  let pos='', cons='';
  if(p>=9){pos=T.posAlta;cons=T.consAlta}
  else if(p>=8){pos=T.posAltProb;cons=T.consAltProb}
  else if(p>=7){pos=T.posPosible;cons=T.consPosible}
  else if(p>=6){pos=T.posDificil;cons=T.consDificil}
  else {pos=T.posBaja;cons=T.consBaja}

  const CORTE = 7.5;
  const pTxt = p.toFixed(2).replace(/\.?0+$/, '');
  const diff = Math.abs(p - CORTE).toFixed(2).replace(/\.?0+$/, '');
  let insTitle: string, insText: string, insTone: 'good' | 'warn' | 'neutral', insIcon: string;
  if (p >= CORTE + 0.5) {
    insTitle = T.insTitleArriba; insText = T.insArriba(pTxt, diff); insTone = 'good'; insIcon = '🩺';
  } else if (p >= CORTE - 0.5) {
    insTitle = T.insTitleAjustado; insText = T.insAjustado(pTxt); insTone = 'warn'; insIcon = '⚖️';
  } else {
    insTitle = T.insTitleDebajo; insText = T.insDebajo(pTxt, diff); insTone = 'warn'; insIcon = '📚';
  }

  const _chart = {
    type: 'scale',
    marker: Math.round(p * 100) / 100,
    markerLabel: pTxt,
    min: 4,
    segments: [
      { nombre: '4–6', max: 6, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: '6–7.5', max: CORTE, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: '7.5–10', max: 10, color: '#22c55e', colorDark: '#15803d' }
    ],
    ariaLabel: T.gaugeAria(pTxt)
  };

  return {
    posibilidadIngreso:pos,
    referenciaCorte:T.refCorte,
    consejo:cons,
    _insight: { title: insTitle, text: insText, tone: insTone, icon: insIcon },
    _chart
  };
}
