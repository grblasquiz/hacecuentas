// IPCA Brasil — série histórica mensal. FONTE ÚNICA (snapshot do BCB SGS série 433).
// Atualizar mensalmente: python3 scripts/generate-ipca-post.py também usa o BCB live.
// Snapshot: 20 meses · último: julho 2026 = 0.07%
export interface IpcaMes { mes: string; ipca: number }
export const IPCA_BR: IpcaMes[] = [
  { mes: '01/12/2024', ipca: 0.52 },
  { mes: '01/01/2025', ipca: 0.16 },
  { mes: '01/02/2025', ipca: 1.31 },
  { mes: '01/03/2025', ipca: 0.56 },
  { mes: '01/04/2025', ipca: 0.43 },
  { mes: '01/05/2025', ipca: 0.26 },
  { mes: '01/06/2025', ipca: 0.24 },
  { mes: '01/07/2025', ipca: 0.26 },
  { mes: '01/08/2025', ipca: -0.11 },
  { mes: '01/09/2025', ipca: 0.48 },
  { mes: '01/10/2025', ipca: 0.09 },
  { mes: '01/11/2025', ipca: 0.18 },
  { mes: '01/12/2025', ipca: 0.33 },
  { mes: '01/01/2026', ipca: 0.33 },
  { mes: '01/02/2026', ipca: 0.7 },
  { mes: '01/03/2026', ipca: 0.88 },
  { mes: '01/04/2026', ipca: 0.67 },
  { mes: '01/05/2026', ipca: 0.58 },
  { mes: '01/06/2026', ipca: 0.16 },
  { mes: '01/07/2026', ipca: 0.07 },
];
export const IPCA_BR_META = {
  ultimoMes: 'julho 2026',
  ultimoValor: 0.07,
  acumuladoAno: 3.44,
  acumulado12m: 4.44,
  fonte: 'IBGE / Banco Central do Brasil (SGS 433)',
  fonteUrl: 'https://www.ibge.gov.br/explica/inflacao.php',
  atualizado: '2026-08-11',
};
