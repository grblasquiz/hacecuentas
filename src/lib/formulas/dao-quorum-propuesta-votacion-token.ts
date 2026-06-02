/** Quórum DAO: votos requeridos para que pase una propuesta según supply circulante */
export interface Inputs { supplyCirculante: number; quorumPct: number; mayoriaPct: number; participacionEsperadaPct: number; tokensATuFavor: number; }
export interface Outputs { tokensQuorum: number; tokensAFavorNecesarios: number; participacionVsQuorumPct: number; faltanTokens: number; explicacion: string; _insight?: any; }
export function daoQuorumPropuestaVotacionToken(i: Inputs): Outputs {
  const supply = Number(i.supplyCirculante);
  const quorum = Number(i.quorumPct) / 100;
  const mayoria = Number(i.mayoriaPct) / 100;
  const participacion = Number(i.participacionEsperadaPct) / 100;
  const tuyos = Number(i.tokensATuFavor);
  if (!supply || supply <= 0) throw new Error('Ingresá el supply circulante');
  if (!quorum || quorum <= 0) throw new Error('Ingresá el quórum requerido');
  const tokensQuorum = supply * quorum;
  const votosEsperados = supply * participacion;
  const tokensAFavor = votosEsperados * mayoria;
  const participacionVsQuorum = (votosEsperados / tokensQuorum) * 100;
  const faltan = Math.max(0, tokensAFavor - tuyos);
  const fmtTok = (n: number) => Math.round(n).toLocaleString('es-AR');
  let _insight;
  if (participacionVsQuorum < 100) {
    _insight = {
      title: 'No alcanza el quórum',
      text: `Con la participación esperada se juntan solo el **${participacionVsQuorum.toFixed(1)}%** del quórum (${fmtTok(tokensQuorum)} tokens). La propuesta no llegaría a votarse aunque tengas mayoría: hay que movilizar más votantes.`,
      tone: 'warn',
      icon: '🚫',
    };
  } else if (faltan > 0) {
    _insight = {
      title: `Te faltan ${fmtTok(faltan)} tokens`,
      text: `Para la mayoría del **${(mayoria * 100).toFixed(0)}%** necesitás **${fmtTok(tokensAFavor)}** tokens a favor y tenés ${fmtTok(tuyos)}: faltan **${fmtTok(faltan)}**. Vas a necesitar aliados para que pase.`,
      tone: 'warn',
      icon: '🗳️',
    };
  } else {
    _insight = {
      title: 'La propuesta pasa',
      text: `Llegás al quórum (**${participacionVsQuorum.toFixed(1)}%**) y tus **${fmtTok(tuyos)}** tokens cubren la mayoría requerida de **${fmtTok(tokensAFavor)}**. No necesitás votos adicionales.`,
      tone: 'good',
      icon: '✅',
    };
  }
  return {
    tokensQuorum: Number(tokensQuorum.toFixed(0)),
    tokensAFavorNecesarios: Number(tokensAFavor.toFixed(0)),
    participacionVsQuorumPct: Number(participacionVsQuorum.toFixed(2)),
    faltanTokens: Number(faltan.toFixed(0)),
    explicacion: `Supply ${supply.toLocaleString('en-US')}. Quórum ${(quorum * 100).toFixed(1)}% = ${tokensQuorum.toLocaleString('en-US')} tokens. Para mayoría ${(mayoria * 100).toFixed(0)}% necesitás ${tokensAFavor.toLocaleString('en-US')} a favor.`,
    _insight,
  };
}
