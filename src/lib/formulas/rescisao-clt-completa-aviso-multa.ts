// Calculadora de Rescisão CLT Completa — 2026
// Fontes: CLT (Decreto-Lei 5.452/1943), Lei 12.506/2011, Lei 13.467/2017

export interface Inputs {
  salario_bruto: number;
  data_admissao: string;
  data_rescisao: string;
  tipo_rescisao: string;
  aviso_previo: string;
  dias_trabalhados_mes: number;
  saldo_fgts: number;
  ferias_vencidas: string;
}

export interface Outputs {
  saldo_salario: number;
  aviso_previo_valor: number;
  decimo_terceiro: number;
  ferias_proporcionais: number;
  ferias_vencidas_valor: number;
  multa_fgts: number;
  total_bruto: number;
  meses_aviso: number;
  detalhamento: string;
}

// Lei 12.506/2011 — Aviso prévio: 30 dias base + 3 dias por ano completo, máx. 90 dias
const AVISO_BASE_DIAS = 30;
const AVISO_DIAS_POR_ANO = 3;
const AVISO_MAX_DIAS = 90;

// CLT Art. 18 §1° — Multa FGTS demissão sem justa causa: 40%
const MULTA_FGTS_SEM_JUSTA_CAUSA = 0.40;

// CLT Art. 484-A — Multa FGTS acordo mútuo: 20%
const MULTA_FGTS_ACORDO_MUTUO = 0.20;

// Fator férias + 1/3 constitucional
const FATOR_FERIAS_COM_TERCO = 4 / 3; // 1.3333...

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d.getTime())) return null;
  return d;
}

function diffAnosCompletos(admissao: Date, rescisao: Date): number {
  let anos = rescisao.getFullYear() - admissao.getFullYear();
  const mesAdm = admissao.getMonth();
  const diaAdm = admissao.getDate();
  const mesResc = rescisao.getMonth();
  const diaResc = rescisao.getDate();
  if (mesResc < mesAdm || (mesResc === mesAdm && diaResc < diaAdm)) {
    anos--;
  }
  return Math.max(0, anos);
}

function diffMesesCompletos(inicio: Date, fim: Date): number {
  let meses = (fim.getFullYear() - inicio.getFullYear()) * 12;
  meses += fim.getMonth() - inicio.getMonth();
  if (fim.getDate() < inicio.getDate()) {
    meses--;
  }
  return Math.max(0, meses);
}

function calcularAvisoPrevio(anosCompletos: number): number {
  const dias = AVISO_BASE_DIAS + AVISO_DIAS_POR_ANO * anosCompletos;
  return Math.min(dias, AVISO_MAX_DIAS);
}

export function compute(i: Inputs): Outputs {
  const salario = Number(i.salario_bruto) || 0;
  const diasMes = Math.min(Math.max(Number(i.dias_trabalhados_mes) || 0, 0), 30);
  const saldoFgts = Math.max(Number(i.saldo_fgts) || 0, 0);
  const tipoRescisao = i.tipo_rescisao || 'sem_justa_causa';
  const tipoAviso = i.aviso_previo || 'indenizado';
  const feriasTipo = i.ferias_vencidas || 'nao';

  if (salario <= 0) {
    return {
      saldo_salario: 0,
      aviso_previo_valor: 0,
      decimo_terceiro: 0,
      ferias_proporcionais: 0,
      ferias_vencidas_valor: 0,
      multa_fgts: 0,
      total_bruto: 0,
      meses_aviso: 0,
      detalhamento: 'Informe o salário bruto para calcular a rescisão.'
    };
  }

  const admissao = parseDate(i.data_admissao);
  const rescisao = parseDate(i.data_rescisao);

  if (!admissao || !rescisao || rescisao <= admissao) {
    return {
      saldo_salario: 0,
      aviso_previo_valor: 0,
      decimo_terceiro: 0,
      ferias_proporcionais: 0,
      ferias_vencidas_valor: 0,
      multa_fgts: 0,
      total_bruto: 0,
      meses_aviso: 0,
      detalhamento: 'Verifique as datas: a data de rescisão deve ser posterior à admissão.'
    };
  }

  // ── Anos completos de serviço (base para aviso prévio) ──
  const anosCompletos = diffAnosCompletos(admissao, rescisao);

  // ── Dias de aviso prévio proporcional (Lei 12.506/2011) ──
  const diasAviso = calcularAvisoPrevio(anosCompletos);

  // ── 1. Saldo de salário ──
  // (Salário ÷ 30) × dias trabalhados no mês da rescisão
  const salarioDiario = salario / 30;
  const saldoSalario = salarioDiario * diasMes;

  // ── 2. Aviso prévio indenizado ──
  // Apenas se demissão sem justa causa com aviso indenizado/dispensado,
  // ou acordo mútuo com 50% do aviso
  let avisoPrevioValor = 0;
  let diasAvisoEfetivo = 0;

  if (tipoRescisao === 'sem_justa_causa') {
    if (tipoAviso === 'indenizado' || tipoAviso === 'dispensado') {
      // Empresa paga aviso indenizado ao trabalhador
      diasAvisoEfetivo = diasAviso;
      avisoPrevioValor = salarioDiario * diasAviso;
    } else if (tipoAviso === 'trabalhado') {
      // Aviso trabalhado: não há pagamento adicional de aviso além do salário do período
      diasAvisoEfetivo = diasAviso;
      avisoPrevioValor = 0; // salário pago normalmente durante o período
    } else {
      // nao_aplica
      diasAvisoEfetivo = 0;
      avisoPrevioValor = 0;
    }
  } else if (tipoRescisao === 'acordo_mutuo') {
    // Art. 484-A: metade do aviso prévio indenizado
    diasAvisoEfetivo = Math.ceil(diasAviso / 2);
    avisoPrevioValor = salarioDiario * diasAvisoEfetivo;
  } else if (tipoRescisao === 'pedido_demissao') {
    // Funcionário deve o aviso ou é dispensado por ele
    if (tipoAviso === 'indenizado' || tipoAviso === 'nao_aplica') {
      // Não recebe aviso prévio indenizado; pode dever à empresa
      diasAvisoEfetivo = 0;
      avisoPrevioValor = 0;
    } else {
      diasAvisoEfetivo = diasAviso;
      avisoPrevioValor = 0;
    }
  } else {
    // justa_causa: sem aviso
    diasAvisoEfetivo = 0;
    avisoPrevioValor = 0;
  }

  // ── Projeção de data final com aviso indenizado ──
  // Para 13° e férias, quando o aviso é indenizado, os dias são somados ao contrato
  // (Art. 487 §1° CLT)
  let dataFinalEfetiva = rescisao;
  if (
    (tipoRescisao === 'sem_justa_causa' &&
      (tipoAviso === 'indenizado' || tipoAviso === 'dispensado')) ||
    tipoRescisao === 'acordo_mutuo'
  ) {
    const dataProjetada = new Date(rescisao);
    dataProjetada.setDate(dataProjetada.getDate() + diasAvisoEfetivo);
    dataFinalEfetiva = dataProjetada;
  }

  // ── 3. 13° salário proporcional ──
  // Meses trabalhados no ano corrente até data final efetiva
  // Fração >= 15 dias = 1 mês
  const anoRescisao = dataFinalEfetiva.getFullYear();
  const inicioAno = new Date(anoRescisao, 0, 1); // 1° de janeiro
  let mesesDecimoTerceiro = 0;

  if (admissao.getFullYear() < anoRescisao) {
    // Trabalhou o ano inteiro até a data de rescisão
    mesesDecimoTerceiro = dataFinalEfetiva.getMonth() + 1;
    // Ajuste se dia da rescisão < 15: não conta o último mês
    if (dataFinalEfetiva.getDate() < 15) {
      mesesDecimoTerceiro = Math.max(1, mesesDecimoTerceiro - 1);
    }
  } else {
    // Admitido no mesmo ano
    mesesDecimoTerceiro = diffMesesCompletos(admissao, dataFinalEfetiva) + 1;
    // Ajuste frações
    const diasNoMesAdm = admissao.getDate();
    if (diasNoMesAdm > 15) {
      mesesDecimoTerceiro = Math.max(0, mesesDecimoTerceiro - 1);
    }
    mesesDecimoTerceiro = Math.min(mesesDecimoTerceiro, 12);
  }

  mesesDecimoTerceiro = Math.min(Math.max(mesesDecimoTerceiro, 0), 12);

  let decimoTerceiro = 0;
  if (tipoRescisao !== 'justa_causa') {
    decimoTerceiro = (salario / 12) * mesesDecimoTerceiro;
  }

  // ── 4. Férias proporcionais + 1/3 ──
  // Período aquisitivo começa na data de aniversário do contrato
  // Meses desde o último aniversário de contrato até data final efetiva
  let feriasProp = 0;
  let mesesFeriasProp = 0;

  if (tipoRescisao !== 'justa_causa') {
    // Último aniversário do contrato
    let ultimoAniversario = new Date(
      dataFinalEfetiva.getFullYear(),
      admissao.getMonth(),
      admissao.getDate()
    );
    if (ultimoAniversario > dataFinalEfetiva) {
      ultimoAniversario = new Date(
        dataFinalEfetiva.getFullYear() - 1,
        admissao.getMonth(),
        admissao.getDate()
      );
    }

    mesesFeriasProp = diffMesesCompletos(ultimoAniversario, dataFinalEfetiva);
    const diasRestantes =
      dataFinalEfetiva.getDate() - admissao.getDate();
    // Fração >= 15 dias do mês seguinte ao último mês completo
    const diaFinalEfetivo = dataFinalEfetiva.getDate();
    // Verificação se há mês incompleto com >= 15 dias para contar
    const diaInicioAquisitivo = ultimoAniversario.getDate();
    const mesCorrente = diffMesesCompletos(ultimoAniversario, dataFinalEfetiva);
    // Recalcula com critério de 15 dias
    const dataInicioPeriodo = new Date(
      ultimoAniversario.getFullYear(),
      ultimoAniversario.getMonth() + mesCorrente,
      ultimoAniversario.getDate()
    );
    const diasFracaoMes = Math.round(
      (dataFinalEfetiva.getTime() - dataInicioPeriodo.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diasFracaoMes >= 15) {
      mesesFeriasProp = mesCorrente + 1;
    } else {
      mesesFeriasProp = mesCorrente;
    }
    mesesFeriasProp = Math.min(Math.max(mesesFeriasProp, 0), 11);
    feriasProp = (salario / 12) * mesesFeriasProp * FATOR_FERIAS_COM_TERCO;
  }

  // ── 5. Férias vencidas + 1/3 ──
  let feriasPeriodos = 0;
  if (feriasTipo === 'sim') feriasPeriodos = 1;
  else if (feriasTipo === 'dois') feriasPeriodos = 2;

  const feriasVencidasValor = salario * FATOR_FERIAS_COM_TERCO * feriasPeriodos;

  // ── 6. Multa FGTS ──
  let multaFgts = 0;
  if (tipoRescisao === 'sem_justa_causa') {
    multaFgts = saldoFgts * MULTA_FGTS_SEM_JUSTA_CAUSA;
  } else if (tipoRescisao === 'acordo_mutuo') {
    multaFgts = saldoFgts * MULTA_FGTS_ACORDO_MUTUO;
  }

  // ── Total bruto ──
  const totalBruto =
    saldoSalario +
    avisoPrevioValor +
    decimoTerceiro +
    feriasProp +
    feriasVencidasValor +
    multaFgts;

  // ── Detalhamento textual ──
  const tipoLabel: Record<string, string> = {
    sem_justa_causa: 'Demissão sem justa causa',
    pedido_demissao: 'Pedido de demissão',
    acordo_mutuo: 'Acordo mútuo (Art. 484-A)',
    justa_causa: 'Demissão por justa causa'
  };
  const avisoLabel: Record<string, string> = {
    indenizado: 'indenizado',
    trabalhado: 'trabalhado',
    dispensado: 'dispensado pelo empregador',
    nao_aplica: 'não se aplica'
  };

  const percentualMulta =
    tipoRescisao === 'sem_justa_causa'
      ? '40%'
      : tipoRescisao === 'acordo_mutuo'
      ? '20%'
      : '0%';

  const detalhamento =
    `Tipo: ${tipoLabel[tipoRescisao] || tipoRescisao} | ` +
    `Aviso prévio: ${diasAviso} dias (${avisoLabel[tipoAviso] || tipoAviso}) | ` +
    `Anos de serviço: ${anosCompletos} | ` +
    `Meses 13°: ${mesesDecimoTerceiro} | ` +
    `Meses férias prop.: ${mesesFeriasProp} | ` +
    `Multa FGTS: ${percentualMulta} de R$ ${saldoFgts.toFixed(2)} | ` +
    `⚠️ Valor bruto estimado — descontos de INSS e IR não incluídos.`;

  return {
    saldo_salario: Math.round(saldoSalario * 100) / 100,
    aviso_previo_valor: Math.round(avisoPrevioValor * 100) / 100,
    decimo_terceiro: Math.round(decimoTerceiro * 100) / 100,
    ferias_proporcionais: Math.round(feriasProp * 100) / 100,
    ferias_vencidas_valor: Math.round(feriasVencidasValor * 100) / 100,
    multa_fgts: Math.round(multaFgts * 100) / 100,
    total_bruto: Math.round(totalBruto * 100) / 100,
    meses_aviso: diasAviso,
    detalhamento
  };
}
