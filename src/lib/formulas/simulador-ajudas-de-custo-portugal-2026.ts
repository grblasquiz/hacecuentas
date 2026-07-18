/**
 * Ajudas de custo + deslocação em viatura própria — Portugal 2026.
 * Limites diários isentos de IRS/SS (Portaria 1553-D/2008 e atualizações): deslocação nacional
 * 62,75 €/dia; estrangeiro 148,91 €/dia; km em viatura própria 0,40 €/km. Acima destes limites,
 * o EXCEDENTE é tributado em IRS e sujeito a contribuições; abaixo, fica isento.
 */
import { fmtEUR, AJUDAS_CUSTO_2026 } from '../data/portugal-2026';

export interface Inputs {
  destino?: string;  // 'nacional' | 'estrangeiro'
  nDias?: number;    // n.º de dias de deslocação
  km?: number;       // quilómetros em viatura própria
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const destino = String(i.destino || 'nacional') === 'estrangeiro' ? 'estrangeiro' : 'nacional';
  const nDias = Math.max(0, Math.floor(Number(i.nDias) || 0));
  const km = Math.max(0, Number(i.km) || 0);

  if (nDias <= 0 && km <= 0) throw new Error('Indique pelo menos os dias de deslocação ou os quilómetros em viatura própria');

  const valorDia = destino === 'estrangeiro' ? AJUDAS_CUSTO_2026.estrangeiroDia : AJUDAS_CUSTO_2026.nacionalDia;
  const ajudasCusto = nDias * valorDia;
  const deslocacaoKm = km * AJUDAS_CUSTO_2026.kmViaturaPropria;
  const total = ajudasCusto + deslocacaoKm;

  const rotuloDestino = destino === 'estrangeiro' ? 'estrangeiro' : 'território nacional';

  const detalhe = `${nDias} ${nDias === 1 ? 'dia' : 'dias'} em ${rotuloDestino} × ${fmtEUR(valorDia)} = ${fmtEUR(ajudasCusto)}`
    + (km > 0 ? ` + ${km.toLocaleString('de-DE')} km × ${fmtEUR(AJUDAS_CUSTO_2026.kmViaturaPropria)} = ${fmtEUR(deslocacaoKm)}` : '')
    + `. Total isento: ${fmtEUR(total)}.`;

  const _table = {
    title: 'Ajudas de custo — limites isentos 2026',
    headers: ['Rubrica', 'Limite diário/km isento', 'No seu caso'],
    rows: [
      ['Ajuda de custo nacional', `${fmtEUR(AJUDAS_CUSTO_2026.nacionalDia)}/dia`, destino === 'nacional' ? fmtEUR(ajudasCusto) : '—'],
      ['Ajuda de custo estrangeiro', `${fmtEUR(AJUDAS_CUSTO_2026.estrangeiroDia)}/dia`, destino === 'estrangeiro' ? fmtEUR(ajudasCusto) : '—'],
      ['Viatura própria', `${fmtEUR(AJUDAS_CUSTO_2026.kmViaturaPropria)}/km`, km > 0 ? fmtEUR(deslocacaoKm) : '—'],
      ['Total isento a receber', '—', fmtEUR(total)],
    ],
    note: 'Valores dentro destes limites são isentos de IRS e de contribuições para a Segurança Social. O que a empresa pague acima do limite é tributado em IRS e sujeito a SS na parte excedente.',
  };

  const _insight = {
    title: `Total isento: ${fmtEUR(total)}`,
    text: `Com ${nDias} ${nDias === 1 ? 'dia' : 'dias'} de deslocação ${destino === 'estrangeiro' ? 'ao estrangeiro' : 'em território nacional'}`
      + (km > 0 ? ` e ${km.toLocaleString('de-DE')} km em viatura própria` : '')
      + `, recebe **${fmtEUR(total)}** livres de impostos. Estes montantes **não descontam IRS nem Segurança Social** — só o que exceda os limites da tabela é que é tributado.`,
    tone: 'good',
    icon: '🧳',
  };

  return {
    total: fmtEUR(total),
    ajudasCusto: fmtEUR(ajudasCusto),
    deslocacaoKm: fmtEUR(deslocacaoKm),
    detalhe,
    _insight,
    _table,
  };
}
