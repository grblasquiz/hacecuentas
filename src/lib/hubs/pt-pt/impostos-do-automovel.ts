import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt-pt/financas/impostos-do-automovel',
  title: "Quanto vou pagar de ISV e IUC? | Hacé Cuentas",
  description: "Hub de decisão com 2 cálculos: Simulador de ISV — Importar e Legalizar um Carro em Portugal 2026; Calculadora de IUC: quanto pago de selo do carro?.",
  silo: "Impostos do automóvel",
  siloHref: '/pt-pt/financas',
  locale: 'pt-pt',
  eyebrow: "Portugal · Impostos do automóvel",
  h1: "Quanto vou pagar de ISV e IUC?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 2 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['2 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Simulador de ISV — Importar e Legalizar um Carro em Portugal 2026",
    "hint": "O ISV (Imposto Sobre Veículos) que se paga ao importar ou legalizar um carro em Portugal é a soma de duas componentes: a de cilindrada (baseada nos cm³ do motor) e a ambiental (baseada nas emissões de CO2 em g/km WLTP). Para os usados, aplica-se uma redução por anos de uso que vai de 10% (até 1 ano) a 80% (mais de 10 anos). Um carro a gasolina com 1.500 cm³ e 130 g/km paga cerca de 2.286 € de ISV se for novo; com 5 anos de uso, a redução de 43% baixa o imposto para cerca de 1.303 €. Os carros 100% elétricos estão isentos de ISV.",
    "yes": [
      "**ISV = componente de cilindrada + componente ambiental (CO2), menos a redução por anos de uso.** As tabelas de 2026 mantêm-se iguais às de 2025. Os usados têm redução de 10% (até 1 ano) a 80% (>10 anos). Os **100% elétricos estão isentos** e os **híbridos plug-in** elegíveis têm 75% de desconto na componente ambiental. O gasóleo paga uma tabela de CO2 mais gravosa e um adicional de 500 € por partículas."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-16.",
    "answer": "O ISV (Imposto Sobre Veículos) que se paga ao importar ou legalizar um carro em Portugal é a soma de duas componentes: a de cilindrada (baseada nos cm³ do motor) e a ambiental (baseada nas emissões de CO2 em g/km WLTP). Para os usados, aplica-se uma redução por anos de uso que vai de 10% (até 1 ano) a 80% (mais de 10 anos). Um carro a gasolina com 1.500 cm³ e 130 g/km paga cerca de 2.286 € de ISV se for novo; com 5 anos de uso, a redução de 43% baixa o imposto para cerca de 1.303 €. Os carros 100% elétricos estão isentos de ISV."
  },
  {
    "id": "c2",
    "label": "Calculadora de IUC: quanto pago de selo do carro?",
    "hint": "O IUC (Imposto Único de Circulação, o antigo selo do carro) dos ligeiros de passageiros calcula-se por dois métodos. Os carros matriculados até junho de 2007 (Categoria A) pagam segundo a cilindrada e a antiguidade. Os matriculados a partir de julho de 2007 (Categoria B) somam uma componente de cilindrada e uma de CO2, multiplicadas por um coeficiente conforme o ano da matrícula. Um carro a gasolina de 1.400 cm³ matriculado em 2015, com 120 g/km de CO2, paga cerca de 215 € de IUC por ano. Os veículos a gasóleo têm um agravamento. É uma estimativa — o valor exato obtém-se no Portal das Finanças.",
    "yes": [
      "**O IUC depende do ano de matrícula.** Categoria A (até jun-2007): cilindrada × coeficiente de antiguidade. Categoria B (desde jul-2007): (componente de cilindrada + componente de CO2) × coeficiente do ano. Os veículos a gasóleo têm agravamento. Um carro a gasolina de 1.400 cm³ de 2015 (120 g/km) paga cerca de 215 €/ano. É uma estimativa — confirme nas Finanças."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-24.",
    "answer": "O IUC (Imposto Único de Circulação, o antigo selo do carro) dos ligeiros de passageiros calcula-se por dois métodos. Os carros matriculados até junho de 2007 (Categoria A) pagam segundo a cilindrada e a antiguidade. Os matriculados a partir de julho de 2007 (Categoria B) somam uma componente de cilindrada e uma de CO2, multiplicadas por um coeficiente conforme o ano da matrícula. Um carro a gasolina de 1.400 cm³ matriculado em 2015, com 120 g/km de CO2, paga cerca de 215 € de IUC por ano. Os veículos a gasóleo têm um agravamento. É uma estimativa — o valor exato obtém-se no Portal das Finanças."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__cilindrada",
    "label": "Simulador de ISV — Importar e Legalizar um Carro em Portugal 2026: Cilindrada (cm³)",
    "type": "number",
    "value": 1500,
    "suffix": "cm³",
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Cilindrada do motor em centímetros cúbicos (consta no certificado de conformidade / DUA)."
  },
  {
    "id": "c1__co2",
    "label": "Simulador de ISV — Importar e Legalizar um Carro em Portugal 2026: Emissões de CO2 (g/km, WLTP)",
    "type": "number",
    "value": 130,
    "suffix": "g/km",
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Emissões de CO2 em g/km na norma WLTP, conforme o certificado de conformidade do veículo."
  },
  {
    "id": "c1__combustivel",
    "label": "Simulador de ISV — Importar e Legalizar um Carro em Portugal 2026: Combustível",
    "type": "select",
    "value": "gasolina",
    "options": [
      {
        "value": "gasolina",
        "label": "Gasolina"
      },
      {
        "value": "gasoleo",
        "label": "Gasóleo (diesel)"
      },
      {
        "value": "hibrido-plugin",
        "label": "Híbrido plug-in (PHEV)"
      },
      {
        "value": "eletrico",
        "label": "100% elétrico"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__anosUso",
    "label": "Simulador de ISV — Importar e Legalizar um Carro em Portugal 2026: Anos de uso (0 = novo)",
    "type": "number",
    "value": 0,
    "suffix": "anos",
    "min": 0,
    "max": 30,
    "step": 1,
    "thousands": false,
    "help": "Idade do veículo. Os usados importados têm redução do ISV por anos de uso (art. 11.º CISV)."
  },
  {
    "id": "c2__cilindrada",
    "label": "Calculadora de IUC: quanto pago de selo do carro?: Cilindrada (cm³)",
    "type": "number",
    "value": 1400,
    "suffix": "cm³",
    "min": 0,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__combustivel",
    "label": "Calculadora de IUC: quanto pago de selo do carro?: Combustível",
    "type": "select",
    "value": "gasolina",
    "options": [
      {
        "value": "gasolina",
        "label": "Gasolina / elétrico / híbrido"
      },
      {
        "value": "gasoleo",
        "label": "Gasóleo (diesel)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__anoMatricula",
    "label": "Calculadora de IUC: quanto pago de selo do carro?: Ano da 1.ª matrícula",
    "type": "number",
    "value": 2015,
    "min": 1960,
    "max": 2026,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__co2",
    "label": "Calculadora de IUC: quanto pago de selo do carro?: Emissões de CO2 (g/km) — só Categoria B (matrícula ≥ 2007)",
    "type": "number",
    "value": 130,
    "suffix": "g/km",
    "min": 0,
    "step": 1,
    "thousands": false
  }
],
  fineprint: "Estimativa informativa. Confira os dados e as fontes oficiais antes de decidir.",
  chart: { type: 'bars', caption: "Os principais resultados numéricos da fórmula selecionada." },
  breakdownTitle: "Resultados da fórmula",
  breakdownIntro: "Cada linha vem da fórmula da calculadora original.",
  faq: [
  {
    "q": "O que é o ISV e quando se paga?",
    "a": "O **ISV (Imposto Sobre Veículos)** é o imposto que se paga **uma única vez** quando um veículo é matriculado em Portugal — seja novo, seja importado usado. É diferente do **IUC**, que é anual. O ISV é liquidado na Declaração Aduaneira de Veículo (DAV) junto da Autoridade Tributária."
  },
  {
    "q": "Como se calcula o ISV de um carro?",
    "a": "Somam-se duas componentes: a de **cilindrada** (cm³ × taxa − parcela a abater) e a **ambiental** (CO2 em g/km × taxa − parcela a abater). Nos usados, aplica-se depois a **redução por anos de uso**. O resultado é o ISV a pagar."
  },
  {
    "q": "Quanto desconta o ISV num carro usado?",
    "a": "A redução por anos de uso vai de **10%** (até 1 ano) a **80%** (mais de 10 anos), passando por 43% aos 4–5 anos e 60% aos 6–7 anos. Quanto mais velho o carro, menor o ISV — por isso importar usados mais antigos sai bastante mais barato de imposto."
  },
  {
    "q": "Os carros elétricos pagam ISV?",
    "a": "Não. Os automóveis ligeiros de passageiros **100% elétricos estão isentos de ISV** em Portugal. Só pagam o IUC anual (reduzido) e os custos de legalização e matrícula. É um dos maiores incentivos fiscais à mobilidade elétrica."
  },
  {
    "q": "E os híbridos plug-in, quanto pagam de ISV?",
    "a": "Os **híbridos plug-in (PHEV)** que cumpram os requisitos legais (autonomia elétrica mínima e emissões reduzidas) têm **75% de desconto na componente ambiental**, pagando a componente de cilindrada integral. Isso torna-os bem mais baratos de ISV do que um equivalente a gasolina ou gasóleo."
  },
  {
    "q": "Por que o gasóleo paga mais ISV do que a gasolina?",
    "a": "Porque o gasóleo tem uma **tabela de CO2 própria e mais gravosa** e paga ainda um **adicional de 500 €** (agravamento por partículas). Para a mesma cilindrada e emissões, um diesel costuma ter um ISV significativamente superior ao de um carro a gasolina."
  },
  {
    "q": "As tabelas de ISV mudaram em 2026?",
    "a": "Não. As tabelas de ISV de **2026 mantêm-se iguais às de 2025** — o Orçamento do Estado não aumentou as taxas nem alterou os escalões da componente de cilindrada ou ambiental. A conta é, por isso, a mesma que em 2025."
  }
],
  sources: [
  {
    "name": "Código do ISV (CISV) — Diário da República",
    "url": "https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2007-34496475"
  },
  {
    "name": "Autoridade Tributária — Imposto Sobre Veículos (ISV)",
    "url": "https://www.portaldasfinancas.gov.pt/"
  },
  {
    "name": "Código do IUC — categorias e cálculo",
    "url": "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/iuc/Pages/codigo-do-iuc-indice.aspx"
  }
],
  replaces: [
    '/pt-pt/calculadora-isv-importacao-carro-portugal', // Absorbida como caso calculable con formulaId calculadora-isv-importacao-carro-portugal.
    '/pt-pt/calculadora-iuc-portugal', // Absorbida como caso calculable con formulaId calculadora-iuc-portugal.
  ],
  lastReviewed: '2026-07-28',
};
