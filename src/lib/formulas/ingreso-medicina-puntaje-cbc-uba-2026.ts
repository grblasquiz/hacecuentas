export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
    },
  } as const)[__lang];
  const p=Number(i.promedioCbc)||0;
  let pos='', cons='';
  if(p>=9){pos=T.posAlta;cons=T.consAlta}
  else if(p>=8){pos=T.posAltProb;cons=T.consAltProb}
  else if(p>=7){pos=T.posPosible;cons=T.consPosible}
  else if(p>=6){pos=T.posDificil;cons=T.consDificil}
  else {pos=T.posBaja;cons=T.consBaja}
  return { posibilidadIngreso:pos, referenciaCorte:T.refCorte, consejo:cons };
}
