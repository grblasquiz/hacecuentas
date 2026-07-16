// Regra de três — simples (direta/inversa) e composta.
// Utilidade matemática pura. Resolve o valor desconhecido (X) de uma proporção.
//
// Simples direta:  A → B  ,  C → X   ⇒  X = B·C / A
// Simples inversa: A → B  ,  C → X   ⇒  X = A·B / C
// Composta:        multiplica-se pela razão de cada grandeza extra
//                  (direta: ×D2/A2 ; inversa: ×A2/D2).

export interface Inputs {
  tipo: string;      // 'direta' | 'inversa' | 'composta'
  valorA: number;    // 1ª grandeza — valor conhecido de referência (A)
  valorB: number;    // 1ª grandeza — valor correspondente conhecido (B)
  valorC: number;    // 1ª grandeza — valor conhecido cujo correspondente é X
  valorD?: number;   // (composta) 2ª grandeza — referência
  valorE?: number;   // (composta) 2ª grandeza — valor correspondente ao X
  relacaoSegunda?: string; // (composta) 'direta' | 'inversa' da 2ª grandeza
}
export interface Outputs {
  x: string;
  proporcao: string;
  formula: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

/** Formata número com até 4 casas, sem zeros à direita desnecessários. */
function fmtNum(n: number): string {
  if (!isFinite(n)) return '—';
  const r = Math.round(n * 10000) / 10000;
  return r.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
}

export function compute(i: Inputs): Outputs {
  const tipo = ['direta', 'inversa', 'composta'].includes(String(i.tipo)) ? String(i.tipo) : 'direta';
  const A = Number(i.valorA) || 0;
  const B = Number(i.valorB) || 0;
  const C = Number(i.valorC) || 0;

  const invalido = (msg: string): Outputs => ({
    x: '—', proporcao: '—', formula: '—', detalhe: msg,
    _insight: { title: 'Dados insuficientes', text: msg, tone: 'warn', icon: '⚠️' },
  });

  if (A === 0 || B === 0 || C === 0) {
    return invalido('Preencha os três valores conhecidos (A, B e C). Nenhum deles pode ser zero.');
  }

  let x: number;
  let formula: string;
  let proporcao: string;

  if (tipo === 'inversa') {
    // A·B = C·X  ⇒  X = A·B / C
    x = (A * B) / C;
    formula = 'X = (A × B) ÷ C';
    proporcao = `${fmtNum(A)} → ${fmtNum(B)} ⇄ ${fmtNum(C)} → X (inversa)`;
  } else if (tipo === 'composta') {
    const D = Number(i.valorD) || 0;
    const E = Number(i.valorE) || 0;
    const rel2 = String(i.relacaoSegunda) === 'inversa' ? 'inversa' : 'direta';
    if (D === 0 || E === 0) {
      return invalido('Na regra de três composta, preencha também a 2ª grandeza (D e E), sem zeros.');
    }
    // Base direta da 1ª grandeza: (B·C/A), ajustada pela 2ª grandeza.
    const razao2 = rel2 === 'direta' ? E / D : D / E;
    x = (B * C / A) * razao2;
    formula = rel2 === 'direta' ? 'X = (B × C ÷ A) × (E ÷ D)' : 'X = (B × C ÷ A) × (D ÷ E)';
    proporcao = `1ª: ${fmtNum(A)}→${fmtNum(B)}, ${fmtNum(C)}→X · 2ª (${rel2}): ${fmtNum(D)}↔${fmtNum(E)}`;
  } else {
    // direta: A/B = C/X ⇒ X = B·C / A
    x = (B * C) / A;
    formula = 'X = (B × C) ÷ A';
    proporcao = `${fmtNum(A)} → ${fmtNum(B)} = ${fmtNum(C)} → X (direta)`;
  }

  const xStr = fmtNum(x);
  const detalhe = `${proporcao}. Aplicando ${formula}, o valor desconhecido é X = ${xStr}.`;

  return {
    x: xStr,
    proporcao,
    formula,
    detalhe,
    _insight: {
      title: `X = ${xStr}`,
      text: `Pela regra de três ${tipo === 'composta' ? 'composta' : tipo === 'inversa' ? 'simples inversa' : 'simples direta'}, **${formula}** dá **X = ${xStr}**. ${tipo === 'inversa' ? 'Numa relação inversa, quando uma grandeza aumenta a outra diminui.' : 'Numa relação direta, as grandezas crescem juntas.'}`,
      tone: 'good',
      icon: '🔢',
    },
    _chart: {
      type: 'bar',
      labels: ['A', 'B', 'C', 'X'],
      values: [Math.round(A * 100) / 100, Math.round(B * 100) / 100, Math.round(C * 100) / 100, Math.round(x * 100) / 100],
      ariaLabel: `Valores da proporção: A=${A}, B=${B}, C=${C}, X=${xStr}.`,
    },
  };
}
