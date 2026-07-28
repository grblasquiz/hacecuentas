import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/ferramentas/converter-medidas',
  title: "Como converto esta medida sem errar? | Hacé Cuentas",
  description: "Hub de decisão com 4 cálculos: Medida de Pneu: Calcule o Diâmetro Real; Calculadora: Quintal Métrico para Tonelada; Conversão de Torque: Nm, lb·ft e kg·m; Conversão de velocidade: km/h ↔ mph ↔ nós.",
  silo: "Conversores",
  siloHref: '/pt/ferramentas',
  locale: 'pt',
  eyebrow: "Brasil · Conversores",
  h1: "Como converto esta medida sem errar?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 4 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['4 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Medida de Pneu: Calcule o Diâmetro Real",
    "hint": "A calculadora de medida de pneu converte a nomenclatura padrão (ex.: 205/55 R16) em valores reais de diâmetro total, circunferência e número de rotações por quilômetro.",
    "yes": [
      "**Diâmetro (mm) = (Largura_mm × Aspecto% ÷ 100 × 2) + (Aro_pol × 25,4)** — Ex.: 205/55 R16 → (205 × 0,55 × 2) + (16 × 25,4) = 225,5 + 406,4 = **631,9 mm ≈ 632 mm**"
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "A calculadora de medida de pneu converte a nomenclatura padrão (ex.: 205/55 R16) em valores reais de diâmetro total, circunferência e número de rotações por quilômetro."
  },
  {
    "id": "c2",
    "label": "Calculadora: Quintal Métrico para Tonelada",
    "hint": "1 quintal métrico = 100 kg = 0,1 tonelada. Para converter quintais em toneladas, multiplique por 0,1 (ou divida por 10). Para converter toneladas em quintais, multiplique por 10. Exemplo: 350 quintais = 35 toneladas.",
    "yes": [
      "**1 quintal métrico = 100 kg = 0,1 tonelada** — Para converter qq → t: multiplique por 0,1 (divida por 10). Para t → qq: multiplique por 10. Atenção: a \"saca\" brasileira padrão vale 60 kg, não 100 kg."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "1 quintal métrico = 100 kg = 0,1 tonelada. Para converter quintais em toneladas, multiplique por 0,1 (ou divida por 10). Para converter toneladas em quintais, multiplique por 10. Exemplo: 350 quintais = 35 toneladas."
  },
  {
    "id": "c3",
    "label": "Conversão de Torque: Nm, lb·ft e kg·m",
    "hint": "Se você já tentou comparar a ficha técnica de um pickup americano com a de um SUV europeu, sabe bem o problema: um vem em lb·ft, o outro em Nm, e às vezes aparece ainda um manual japonês antigo com kgf·m.",
    "yes": [
      "**1 Nm = 0,737562 lb·ft = 0,101972 kgf·m** — ou seja, 100 Nm equivalem a exatamente 73,76 lb·ft e 10,20 kgf·m. Use esses fatores para comparar torques de motores nacionais e importados sem erro."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Se você já tentou comparar a ficha técnica de um pickup americano com a de um SUV europeu, sabe bem o problema: um vem em lb·ft, o outro em Nm, e às vezes aparece ainda um manual japonês antigo com kgf·m."
  },
  {
    "id": "c4",
    "label": "Conversão de velocidade: km/h ↔ mph ↔ nós",
    "hint": "Esta calculadora converte valores de velocidade entre as quatro unidades mais usadas no mundo: km/h (quilômetros por hora), mph (milhas por hora), nós (milhas náuticas por hora) e m/s (metros por segundo).",
    "yes": [
      "**100 km/h = 62,137 mph = 53,996 nós = 27,778 m/s** — as quatro unidades de velocidade mais usadas em um único número de referência."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Esta calculadora converte valores de velocidade entre as quatro unidades mais usadas no mundo: km/h (quilômetros por hora), mph (milhas por hora), nós (milhas náuticas por hora) e m/s (metros por segundo)."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__ancho",
    "label": "Medida de Pneu: Calcule o Diâmetro Real: Largura",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c1__aspect",
    "label": "Medida de Pneu: Calcule o Diâmetro Real: Aspecto",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c1__rin",
    "label": "Medida de Pneu: Calcule o Diâmetro Real: Aro",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c2__valor",
    "label": "Calculadora: Quintal Métrico para Tonelada: Quantidade a converter",
    "type": "number",
    "value": 0.25,
    "min": 0,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c2__unidad",
    "label": "Calculadora: Quintal Métrico para Tonelada: Direção da conversão",
    "type": "select",
    "value": "a",
    "options": [
      {
        "value": "a",
        "label": "Quintais → Toneladas (qq para t)"
      },
      {
        "value": "b",
        "label": "Toneladas → Quintais (t para qq)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__v",
    "label": "Conversão de Torque: Nm, lb·ft e kg·m: Valor",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__de",
    "label": "Conversão de Torque: Nm, lb·ft e kg·m: De",
    "type": "select",
    "value": "nm",
    "options": [
      {
        "value": "nm",
        "label": "Nm"
      },
      {
        "value": "lbft",
        "label": "lb·ft"
      },
      {
        "value": "kgm",
        "label": "kg·m"
      }
    ],
    "thousands": false
  },
  {
    "id": "c4__v",
    "label": "Conversão de velocidade: km/h ↔ mph ↔ nós: Valor",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__de",
    "label": "Conversão de velocidade: km/h ↔ mph ↔ nós: De",
    "type": "select",
    "value": "kmh",
    "options": [
      {
        "value": "kmh",
        "label": "km/h"
      },
      {
        "value": "mph",
        "label": "mph"
      },
      {
        "value": "kn",
        "label": "nós"
      },
      {
        "value": "ms",
        "label": "m/s"
      }
    ],
    "thousands": false
  }
],
  fineprint: "Estimativa informativa. Confira os dados e as fontes oficiais antes de decidir.",
  chart: { type: 'bars', caption: "Os principais resultados numéricos da fórmula selecionada." },
  breakdownTitle: "Resultados da fórmula",
  breakdownIntro: "Cada linha vem da fórmula da calculadora original.",
  faq: [
  {
    "q": "O que significa cada número em '205/55 R16'?",
    "a": "**205** é a largura da seção transversal do pneu em milímetros. **55** é o índice de aspecto: a altura do flanco equivale a 55% dos 205 mm, ou seja, 112,75 mm. **R** indica construção Radial (padrão desde os anos 1980). **16** é o diâmetro interno do pneu — e externo da roda — em polegadas (= 406,4 mm). Juntos, esses três valores determinam completamente o diâmetro total do pneu."
  },
  {
    "q": "Qual é a tolerância máxima de variação de diâmetro ao trocar de pneu?",
    "a": "A recomendação geral da indústria automotiva (seguida por fabricantes como Volkswagen, GM e Toyota em seus manuais de serviço) é de no máximo **±3% de variação no diâmetro total** em relação ao pneu original. Acima disso, o erro do velocímetro supera os ±4 km/h permitidos pelo CONTRAN (Resolução 689/2017), e sistemas de ABS e controle de estabilidade podem operar fora da faixa de calibração."
  },
  {
    "q": "Como a variação do diâmetro afeta o velocímetro?",
    "a": "O velocímetro é calibrado para a circunferência do pneu original. Se o novo pneu tem diâmetro **maior**, o carro percorre mais distância por rotação, fazendo o velocímetro marcar **menos** do que a velocidade real (perigoso legalmente). Se o diâmetro é **menor**, o velocímetro marca mais. A fórmula do erro é: Erro% = (D_novo − D_original) ÷ D_original × 100. Ex.: pneu 3% maior → velocímetro indica 97 km/h quando o carro vai a 100 km/h."
  },
  {
    "q": "O que é 'plus-sizing' e como calcular o pneu correto?",
    "a": "Plus-sizing é a prática de instalar rodas de aro maior acompanhadas de pneus de aspecto menor, mantendo o diâmetro total original. A cada polegada a mais no aro, reduz-se o aspecto em aproximadamente 5 a 10 pontos. Ex.: de 195/65 R15 (diâm. 622 mm) para 205/55 R16 (diâm. 632 mm) — diferença de apenas +10 mm (+1,6%), dentro da tolerância. Use a fórmula inversa: Aspecto_novo = (D_orig − Aro_novo × 25,4) ÷ (Largura_nova × 2) × 100."
  },
  {
    "q": "Por que pneus de carga (tipo 'C') têm diâmetro maior?",
    "a": "Pneus com designação **C** (Commercial/Cargo), como 205/75 R16 C, usam aspectos mais altos (70–80%) que aumentam a altura do flanco, resultando em maior diâmetro e maior volume de ar interno. Isso permite suportar cargas maiores (índice de carga mais alto) sem comprometer a integridade estrutural. O INMETRO regula os índices de carga e velocidade pelo Regulamento Técnico RTQ-PNEU, que exige marcações de carga máxima no flanco do pneu."
  },
  {
    "q": "Qual a diferença entre diâmetro externo e diâmetro interno do pneu?",
    "a": "O **diâmetro interno** (= diâmetro da roda) é o ponto de encaixe no aro, expresso em polegadas (ex.: 16\" = 406,4 mm). O **diâmetro externo** (ou total) é o calculado pela fórmula, incluindo os dois flancos. A diferença entre eles é sempre 2× a altura do flanco. Em um pneu 205/55 R16: diâmetro interno = 406,4 mm; diâmetro externo = 631,9 mm; diferença = 225,5 mm = 2 × 112,75 mm (altura do flanco)."
  },
  {
    "q": "Como calcular rotações por km e para que serve esse dado?",
    "a": "**Rev/km = 1.000.000 ÷ Circunferência(mm)**, onde Circunferência = π × Diâmetro. Para um pneu 205/55 R16 com circunferência de 1.985 mm: Rev/km ≈ 504. Esse dado é usado por: (1) gestores de frota para acompanhar desgaste por rotações e não só por km; (2) mecânicos que programam módulos de ABS e velocímetros eletrônicos; (3) pilotos de automobilismo que monitoram temperatura e desgaste por ciclo de rotação."
  },
  {
    "q": "O diâmetro calculado é igual ao diâmetro real em uso?",
    "a": "Não exatamente. O cálculo fornece o diâmetro **estático não carregado** (pneu inflado sem peso sobre ele). Em uso, o pneu sofre **deflexão estática** (achatamento pela carga do veículo) que reduz a altura efetiva em 10–20 mm dependendo da calibragem e do peso. Por isso a circunferência efetiva de rolamento é ligeiramente menor. Fabricantes especificam a 'rolling circumference' em boletins técnicos, mas o cálculo padrão é suficiente para comparações e diagnósticos práticos com precisão de ±1–2%."
  }
],
  sources: [
  {
    "name": "INMETRO – Regulamento Técnico de Pneus (RTQ-PNEU) e Etiquetagem",
    "url": "https://www.inmetro.gov.br/producao/pneus.asp"
  },
  {
    "name": "Wikipedia PT – Pneu: nomenclatura e leitura de medidas",
    "url": "https://pt.wikipedia.org/wiki/Pneu"
  },
  {
    "name": "CONTRAN – Resolução nº 689/2017 (velocímetros e odômetros)",
    "url": "https://www.denatran.gov.br/resolucoes"
  },
  {
    "name": "BIPM — Le Système International d'Unités (SI), 9ª edição",
    "url": "https://www.bipm.org/en/publications/si-brochure"
  },
  {
    "name": "Bolsa de Comercio de Rosario — Pizarra de grãos (referência quintal métrico AR)",
    "url": "https://www.bcr.com.ar"
  },
  {
    "name": "INMETRO — Vocabulário Internacional de Metrologia (VIM)",
    "url": "https://www.inmetro.gov.br"
  },
  {
    "name": "FAO – FAOSTAT Crops and Livestock Products",
    "url": "https://www.fao.org/faostat/en/#data/QCL"
  },
  {
    "name": "INMETRO – Unidades Legais de Medida no Brasil (SI)",
    "url": "https://www.inmetro.gov.br/consumidor/unidLegaisMed.asp"
  },
  {
    "name": "Wikipedia PT – Torque (momento de força)",
    "url": "https://pt.wikipedia.org/wiki/Torque"
  },
  {
    "name": "INMETRO – Unidades Legais de Medida no Brasil (Resolução Conmetro nº 12/1988)",
    "url": "https://www.inmetro.gov.br/legislacao/resolucoes-conmetro"
  },
  {
    "name": "Wikipedia PT – Nó (unidade de medida)",
    "url": "https://pt.wikipedia.org/wiki/N%C3%B3_(unidade_de_medida)"
  },
  {
    "name": "Wikipedia PT – Milha náutica",
    "url": "https://pt.wikipedia.org/wiki/Milha_n%C3%A1utica"
  }
],
  replaces: [
    '/pt/conversao-medida-pneu-diametro', // Absorbida como caso calculable con formulaId conversion-medida-neumatico-radio-diametro.
    '/pt/conversao-quintal-tonelada-kg-agro', // Absorbida como caso calculable con formulaId conversion-quintal-tonelada-kg-agro.
    '/pt/conversao-torque-nm-lb-ft-kgm', // Absorbida como caso calculable con formulaId conversion-torque-nm-lb-ft-kgm.
    '/pt/conversao-velocidade-kmh-mph-nos', // Absorbida como caso calculable con formulaId conversion-velocidad-kmh-mph-nudos.
  ],
  lastReviewed: '2026-07-28',
};
