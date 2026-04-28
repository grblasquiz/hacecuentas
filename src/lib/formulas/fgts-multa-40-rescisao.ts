export interface Inputs {
  salario_bruto: number;
  anos_trabalhados: number;
  saldo_real_fgts: number;
  tipo_rescisao: string;
  aderiu_saque_aniversario: string;
}

export interface Outputs {
  saldo_fgts_estimado: number;
  multa_rescisoria: number;
  total_fgts_mais_multa: number;
  percentual_multa_aplicado: number;
  aviso_saque_aniversario: string;
  observacao: string;
}

// Alíquota de depósito mensal FGTS — art. 15 da Lei 8.036/1990
const ALIQUOTA_DEPOSITO_FGTS = 0.08;

// Multa rescisória demissão sem justa causa — art. 18 da Lei 8.036/1990
const MULTA_SEM_JUSTA_CAUSA = 0.40;

// Multa rescisória acordo por mútuo consentimento — Lei 13.467/2017
const MULTA_ACORDO_RESCISORIO = 0.20;

// Sem multa no pedido de demissão
const MULTA_PEDIDO_DEMISSAO = 0.00;

export function compute(i: Inputs): Outputs {
  const salario = Number(i.salario_bruto) || 0;
  const anos = Number(i.anos_trabalhados) || 0;
  const saldoRealInformado = Number(i.saldo_real_fgts) || 0;
  const tipoRescisao = i.tipo_rescisao || "sem_justa_causa";
  const aderiu = i.aderiu_saque_aniversario || "nao";

  if (salario <= 0 || anos <= 0) {
    return {
      saldo_fgts_estimado: 0,
      multa_rescisoria: 0,
      total_fgts_mais_multa: 0,
      percentual_multa_aplicado: 0,
      aviso_saque_aniversario: "Informe o salário bruto e o tempo de serviço para calcular.",
      observacao: "Preencha os campos obrigatórios."
    };
  }

  // Estimativa de saldo: 8% × salário × meses (sem correção TR)
  const meses = anos * 12;
  const saldoEstimado = salario * ALIQUOTA_DEPOSITO_FGTS * meses;

  // Usa saldo real se informado e positivo; senão usa estimativa
  const saldoBase = saldoRealInformado > 0 ? saldoRealInformado : saldoEstimado;

  // Determina percentual e multa conforme tipo de rescisão
  let percentualMulha = 0;
  let multaRescisoria = 0;
  let obsRescisao = "";

  if (tipoRescisao === "sem_justa_causa") {
    if (aderiu === "sim") {
      percentualMulha = 0;
      multaRescisoria = 0;
      obsRescisao = "Você aderiu ao saque-aniversário: não há direito à multa de 40% nem ao saque do saldo total na demissão sem justa causa (art. 20, §§ 13-15 da Lei 8.036/1990, alterada pela MP 889/2019).";
    } else {
      percentualMulha = MULTA_SEM_JUSTA_CAUSA;
      multaRescisoria = saldoBase * MULTA_SEM_JUSTA_CAUSA;
      obsRescisao = "Multa de 40% aplicada sobre o saldo FGTS. Você mantém o direito ao saque integral do saldo mais a multa.";
    }
  } else if (tipoRescisao === "acordo_rescisao") {
    if (aderiu === "sim") {
      percentualMulha = 0;
      multaRescisoria = 0;
      obsRescisao = "Você aderiu ao saque-aniversário: a multa de 20% do acordo rescisório não se aplica. O saldo total também não pode ser sacado.";
    } else {
      percentualMulha = MULTA_ACORDO_RESCISORIO;
      multaRescisoria = saldoBase * MULTA_ACORDO_RESCISORIO;
      obsRescisao = "Acordo rescisório (Lei 13.467/2017): multa de 20% e direito a sacar 80% do saldo FGTS. Não há acesso ao seguro-desemprego.";
    }
  } else if (tipoRescisao === "pedido_demissao") {
    percentualMulha = MULTA_PEDIDO_DEMISSAO;
    multaRescisoria = 0;
    if (aderiu === "sim") {
      obsRescisao = "Pedido de demissão: sem multa. Por ter aderido ao saque-aniversário, você pode sacar apenas a parcela anual prevista. O saldo remanescente fica bloqueado.";
    } else {
      obsRescisao = "Pedido de demissão: sem multa. O saldo do FGTS fica bloqueado e só pode ser sacado em situações específicas previstas em lei (aposentadoria, doença grave, compra de imóvel etc.).";
    }
  }

  const totalFgtsComMulta = saldoBase + multaRescisoria;

  // Aviso sobre saque-aniversário
  let avisoSaqueAniversario = "";
  if (aderiu === "sim") {
    const perdaEstimada = saldoEstimado * MULTA_SEM_JUSTA_CAUSA;
    avisoSaqueAniversario = `Atenção: ao aderir ao saque-aniversário, você perdeu o direito à multa rescisória. A perda estimada neste cenário (40% sobre o saldo) seria de R$ ${perdaEstimada.toFixed(2).replace(".", ",")}. O cancelamento da adesão exige 25 meses de carência.`;
  } else {
    avisoSaqueAniversario = "Você está no regime padrão e mantém todos os direitos rescisórios, incluindo a multa de 40% em caso de demissão sem justa causa.";
  }

  // Nota sobre estimativa
  const fonteBase = saldoRealInformado > 0
    ? "Saldo calculado com base no valor real informado."
    : `Saldo estimado com base em 8% × R$ ${salario.toFixed(2).replace(".", ",")} × ${meses} meses. Para o valor exato, consulte o app FGTS da Caixa.`;

  return {
    saldo_fgts_estimado: parseFloat(saldoBase.toFixed(2)),
    multa_rescisoria: parseFloat(multaRescisoria.toFixed(2)),
    total_fgts_mais_multa: parseFloat(totalFgtsComMulta.toFixed(2)),
    percentual_multa_aplicado: parseFloat((percentualMulha * 100).toFixed(0)),
    aviso_saque_aniversario: avisoSaqueAniversario,
    observacao: `${obsRescisao} ${fonteBase}`.trim()
  };
}
