import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/vida/decisoes-e-calculos-do-dia-a-dia',
  title: "Qual é o número para decidir melhor no dia a dia? | Hacé Cuentas",
  description: "Hub de decisão com 3 cálculos: Calculadora de sódio diário na dieta DASH (hipertensão); Variação de ELO do Xadrez; Proteína Vegana Completa: Combinação de Aminoácidos.",
  silo: "Cálculos do dia a dia",
  siloHref: '/pt/vida',
  locale: 'pt',
  eyebrow: "Brasil · Cálculos do dia a dia",
  h1: "Qual é o número para decidir melhor no dia a dia?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 3 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['3 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de sódio diário na dieta DASH (hipertensão)",
    "hint": "A dieta DASH limita o sódio a 2.300 mg/dia na versão padrão (cerca de 5,75 g de sal, aproximadamente 1 colher de chá). A versão estrita baixa para 1.500 mg/dia (~3,75 g de sal), recomendada para hipertensos, pessoas acima de 50 anos e com doença renal crônica. Fator de conversão: 1 g de sal = 400 mg de sódio.",
    "yes": [
      "**Sal (g) = Sódio (mg) ÷ 400** → DASH Padrão: 2.300 mg = 5,75 g de sal/dia; DASH Estrita: 1.500 mg = 3,75 g de sal/dia."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "A dieta DASH limita o sódio a 2.300 mg/dia na versão padrão (cerca de 5,75 g de sal, aproximadamente 1 colher de chá). A versão estrita baixa para 1.500 mg/dia (~3,75 g de sal), recomendada para hipertensos, pessoas acima de 50 anos e com doença renal crônica. Fator de conversão: 1 g de sal = 400 mg de sódio."
  },
  {
    "id": "c2",
    "label": "Variação de ELO do Xadrez",
    "hint": "O sistema ELO é o método oficial de classificação de jogadores de xadrez, criado pelo físico húngaro-americano Arpad Elo na década de 1960 e adotado pela FIDE (Federação Internacional de Xadrez). Ele mede a força relativa de um jogador com base nos resultados contra adversários de diferentes níveis.",
    "yes": [
      "**Novo ELO = ELO atual + K × (Resultado − Expectativa)**, onde Expectativa = 1 / (1 + 10^((ELO_oponente − ELO_atual) / 400)). Exemplo real: ELO 1500 vence oponente 1600 com K=20 → ganha +16 pontos (1516)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "O sistema ELO é o método oficial de classificação de jogadores de xadrez, criado pelo físico húngaro-americano Arpad Elo na década de 1960 e adotado pela FIDE (Federação Internacional de Xadrez). Ele mede a força relativa de um jogador com base nos resultados contra adversários de diferentes níveis."
  },
  {
    "id": "c3",
    "label": "Proteína Vegana Completa: Combinação de Aminoácidos",
    "hint": "O conceito de \"proteína completa\" combinando alimentos veganos entrou na cultura popular com Frances Moore Lappé em 1971, no livro \"Dieta para um Planeta Pequeno\", que defendia combinar grãos e leguminosas em cada refeição para obter todos os aminoácidos essenciais.",
    "yes": [
      "**PDCAAS = (mg do aminoácido limitante por g de proteína ÷ mg de referência FAO) × digestibilidade fecal**. Exemplo real: feijão-preto tem lisina abundante (64 mg/g) mas metionina limitante (21 mg/g); arroz branco tem metionina alta (32 mg/g) mas pouca lisina (26 mg/g) — juntos, se complementam e o PDCAAS combinado chega a ~0,83, próximo ao da carne bovina (~0,92)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-05-28.",
    "answer": "O conceito de \"proteína completa\" combinando alimentos veganos entrou na cultura popular com Frances Moore Lappé em 1971, no livro \"Dieta para um Planeta Pequeno\", que defendia combinar grãos e leguminosas em cada refeição para obter todos os aminoácidos essenciais."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__tipoDash",
    "label": "Calculadora de sódio diário na dieta DASH (hipertensão): Versão",
    "type": "select",
    "value": "estandar",
    "options": [
      {
        "value": "estandar",
        "label": "Padrão"
      },
      {
        "value": "estricto",
        "label": "Rigoroso"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__eloActual",
    "label": "Variação de ELO do Xadrez: ELO atual",
    "type": "number",
    "value": 1500,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c2__eloOponente",
    "label": "Variação de ELO do Xadrez: ELO do oponente",
    "type": "number",
    "value": 1600,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c2__resultado",
    "label": "Variação de ELO do Xadrez: Resultado",
    "type": "select",
    "value": "gane",
    "options": [
      {
        "value": "gane",
        "label": "Ganhou"
      },
      {
        "value": "tabla",
        "label": "Empate"
      },
      {
        "value": "perdi",
        "label": "Perdeu"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__kFactor",
    "label": "Variação de ELO do Xadrez: Fator K",
    "type": "number",
    "value": 20,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__plato",
    "label": "Proteína Vegana Completa: Combinação de Aminoácidos: Prato",
    "type": "select",
    "value": "lentejas_arroz",
    "options": [
      {
        "value": "lentejas_arroz",
        "label": "Lentilhas e Arroz"
      },
      {
        "value": "hummus_pan_pita",
        "label": "Húmus e Pão Pita"
      },
      {
        "value": "tofu_quinoa",
        "label": "Tofu e Quinoa"
      },
      {
        "value": "mani_pan_integral",
        "label": "Amendoim e Pão Integral"
      },
      {
        "value": "poroto_maiz",
        "label": "Feijão e Milho"
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
    "q": "Qual é a diferença entre DASH Padrão e DASH Estrita?",
    "a": "A versão **Padrão** limita o sódio a **2.300 mg/dia** (5,75 g de sal) e é indicada para adultos saudáveis em prevenção geral. A versão **Estrita** limita a **1.500 mg/dia** (3,75 g de sal) e é recomendada para hipertensos, pessoas acima de 50 anos, afrodescendentes e portadores de doença renal crônica, pois esses grupos têm maior sensibilidade ao sódio e benefício adicional com a restrição mais severa."
  },
  {
    "q": "Por que se divide o sódio por 400 para obter gramas de sal?",
    "a": "O sal de cozinha (NaCl) é composto por ~39,3% de sódio e ~60,7% de cloro em massa. Portanto, 1 g de sal contém ~393 mg de sódio. As diretrizes nutricionais arredondam para **400 mg de sódio por grama de sal**, o que simplifica o cálculo: **sal (g) = sódio (mg) ÷ 400**. O fator exato seria 2,54 (sal = sódio × 2,54 ÷ 1000), mas a diferença prática é menor que 2% e desprezível no dia a dia."
  },
  {
    "q": "Quantas colheres de chá de sal correspondem ao limite DASH diário?",
    "a": "Uma colher de chá rasa de sal de cozinha pesa aproximadamente **5 g** e contém ~2.000 mg de sódio. Assim, o limite DASH Padrão (2.300 mg) equivale a cerca de **1,15 colher de chá** e o DASH Estrita (1.500 mg) a **0,75 colher de chá** por dia — incluindo todo o sal adicionado na cozinha e o presente em alimentos processados."
  },
  {
    "q": "O brasileiro consome mais sódio do que o recomendado pela DASH?",
    "a": "Sim. Segundo a **Pesquisa de Orçamentos Familiares (POF) 2017–2018 do IBGE**, o brasileiro consome em média **4.700 mg de sódio/dia**, o equivalente a ~11,75 g de sal — mais que o **dobro** do limite DASH Padrão (2.300 mg) e mais de **três vezes** o limite DASH Estrita (1.500 mg). Esse excesso está diretamente associado à alta prevalência de hipertensão no país, que afeta cerca de 36% dos adultos, segundo o Ministério da Saúde."
  },
  {
    "q": "A dieta DASH é recomendada oficialmente pelo Ministério da Saúde do Brasil?",
    "a": "O **Ministério da Saúde** e o **Guia Alimentar para a População Brasileira (2014)** recomendam reduzir o consumo de sal e alimentos ultraprocessados, alinhando-se aos princípios da DASH. Especificamente, as **Diretrizes Brasileiras de Hipertensão Arterial (2020)** da Sociedade Brasileira de Cardiologia citam a dieta DASH como abordagem não farmacológica de primeira linha para redução da pressão arterial, com evidência de nível A."
  },
  {
    "q": "Reduzir o sódio realmente baixa a pressão arterial? Em quanto?",
    "a": "Estudos clínicos mostram que a redução de **2.300 mg para 1.500 mg/dia** de sódio pode diminuir a pressão sistólica em **7–8 mmHg** em hipertensos e **2–4 mmHg** em normotensos. Combinada com os demais componentes da dieta DASH (potássio, cálcio, magnésio e fibras), a redução pode chegar a **11 mmHg** na sistólica, efeito comparável ao de alguns medicamentos anti-hipertensivos de primeira linha, conforme dados do estudo DASH original publicado no New England Journal of Medicine (Sacks et al., 2001)."
  },
  {
    "q": "Pessoas com doença renal crônica devem usar a DASH Estrita?",
    "a": "A DASH Estrita (1.500 mg/dia) é frequentemente indicada para pacientes com **doença renal crônica (DRC)**, pois os rins comprometidos eliminam menos sódio, elevando o risco de hipertensão e edema. No entanto, a DRC avançada (estágios 3–5) também requer restrição de **potássio e fósforo**, nutrientes abundantes na dieta DASH padrão (frutas, legumes, laticínios). Nesses casos, o plano deve ser individualizado por nutricionista e nefrologista, conforme as **Diretrizes da Sociedade Brasileira de Nefrologia**."
  }
],
  sources: [
  {
    "name": "Ministério da Saúde — Guia Alimentar para a População Brasileira (2014)",
    "url": "https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf"
  },
  {
    "name": "IBGE — Pesquisa de Orçamentos Familiares (POF) 2017–2018",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html"
  },
  {
    "name": "Wikipedia PT — Dieta DASH",
    "url": "https://pt.wikipedia.org/wiki/Dieta_DASH"
  },
  {
    "name": "NHLBI — National Heart, Lung, and Blood Institute (NIH): DASH Eating Plan",
    "url": "https://www.nhlbi.nih.gov/education/dash-eating-plan"
  },
  {
    "name": "Sacks FM et al. — DASH-Sodium Trial (NEJM, 2001)",
    "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa010392"
  },
  {
    "name": "WHO — Sodium intake for adults and children (Guideline 2012)",
    "url": "https://www.who.int/publications/i/item/9789241504836"
  },
  {
    "name": "Ministério da Saúde – Saúde da Criança: Aleitamento Materno e Alimentação Complementar",
    "url": "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/aleitamento-materno"
  },
  {
    "name": "IBGE – Pesquisa de Orçamentos Familiares (POF): Consumo Alimentar",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9050-pesquisa-de-orcamentos-familiares.html"
  },
  {
    "name": "Wikipedia PT – Pascal (unidade): definição e relações entre Bar, PSI e kPa",
    "url": "https://pt.wikipedia.org/wiki/Pascal_(unidade)"
  },
  {
    "name": "NHLBI: Aim for a Healthy Weight — BMI Classification Table",
    "url": "https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm"
  },
  {
    "name": "WHO — Guideline: Sugars Intake for Adults and Children (2015)",
    "url": "https://www.who.int/publications/i/item/9789241549028"
  },
  {
    "name": "IBGE — Pesquisa Nacional de Saúde: prática de atividade física e musculação no Brasil",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html"
  },
  {
    "name": "Wikipedia PT — Fórmula de Heron",
    "url": "https://pt.wikipedia.org/wiki/F%C3%B3rmula_de_Heron"
  },
  {
    "name": "WHO — Information Note on Sugars Recommendations (WHO/NMH/NHD/15.3)",
    "url": "https://www.who.int/publications/i/item/WHO-NMH-NHD-15.3"
  },
  {
    "name": "IBGE — Síntese de Indicadores Sociais (linhas de pobreza)",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html"
  },
  {
    "name": "Wikipedia PT — Quadro Europeu Comum de Referência para Línguas (CEFR)",
    "url": "https://pt.wikipedia.org/wiki/Quadro_Europeu_Comum_de_Refer%C3%AAncia_para_as_L%C3%ADnguas"
  },
  {
    "name": "WHO — Physical Activity Guidelines (2020)",
    "url": "https://www.who.int/publications/i/item/9789240015128"
  },
  {
    "name": "IBGE — Produção Agrícola Municipal (referência de culturas por região)",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9117-producao-agricola-municipal-culturas-temporarias-e-permanentes.html"
  },
  {
    "name": "Wikipedia PT — Café (bebida): preparo e métodos de extração",
    "url": "https://pt.wikipedia.org/wiki/Caf%C3%A9_(bebida)"
  },
  {
    "name": "WHO — Global recommendations on physical activity for health",
    "url": "https://www.who.int/publications/i/item/9789241599979"
  },
  {
    "name": "IBGE – Noções de Estatística: Medidas de Dispersão",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao.html"
  },
  {
    "name": "Wikipedia PT — Energia cinética: definição, fórmula e demonstração",
    "url": "https://pt.wikipedia.org/wiki/Energia_cin%C3%A9tica"
  },
  {
    "name": "IBGE — Estatísticas do Registro Civil (Divórcios e Casamentos)",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao/9110-estatisticas-do-registro-civil.html"
  },
  {
    "name": "Wikipedia PT – Chocolate: composição, tipos e processamento",
    "url": "https://pt.wikipedia.org/wiki/Chocolate"
  },
  {
    "name": "IBGE — Rede Gravimétrica Fundamental Brasileira",
    "url": "https://www.ibge.gov.br/geociencias/informacoes-sobre-posicionamento-geodesico/geodesia/10988-rede-gravimetrica-fundamental-brasileira.html"
  },
  {
    "name": "Wikipedia PT – Condomínio (direito brasileiro)",
    "url": "https://pt.wikipedia.org/wiki/Condom%C3%ADnio"
  },
  {
    "name": "IBGE — PNAD Contínua: Rendimento de todas as fontes 2023",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html"
  },
  {
    "name": "Wikipedia PT – Desvio padrão",
    "url": "https://pt.wikipedia.org/wiki/Desvio_padr%C3%A3o"
  },
  {
    "name": "IBGE — Censo Demográfico 2022: Taxa de Crescimento Geométrico Anual",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html"
  },
  {
    "name": "Wikipedia PT — Máximo Divisor Comum",
    "url": "https://pt.wikipedia.org/wiki/M%C3%A1ximo_divisor_comum"
  },
  {
    "name": "IBGE — IPCA: Índice Nacional de Preços ao Consumidor Amplo",
    "url": "https://www.ibge.gov.br/explica/inflacao.php"
  },
  {
    "name": "Wikipedia PT — Mol (unidade)",
    "url": "https://pt.wikipedia.org/wiki/Mol"
  },
  {
    "name": "IBGE – IPCA: Índice Nacional de Preços ao Consumidor Amplo",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/precos-custos-e-indices-de-precos/9173-indice-nacional-de-precos-ao-consumidor-amplo.html"
  },
  {
    "name": "Wikipedia PT — Unidade de processamento gráfico (GPU)",
    "url": "https://pt.wikipedia.org/wiki/Unidade_de_processamento_gr%C3%A1fico"
  },
  {
    "name": "IBGE — Pesquisa de Uso de TIC nas Residências (PNAD)",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/tecnologia-da-informacao.html"
  },
  {
    "name": "IBGE – Estatísticas de Comércio Exterior e Parceiros Comerciais do Brasil",
    "url": "https://www.ibge.gov.br/explica/exportacoes.php"
  },
  {
    "name": "IBGE — Frota de Veículos no Brasil",
    "url": "https://www.ibge.gov.br/explica/codigos-e-indicadores/frota-de-veiculos.php"
  },
  {
    "name": "IBGE – Produção da Extração Vegetal e da Silvicultura (PEVS)",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9105-producao-da-extracao-vegetal-e-da-silvicultura.html"
  },
  {
    "name": "IBGE — Inventário Nacional de Emissões de Gases de Efeito Estufa",
    "url": "https://www.ibge.gov.br/explica/emissoes-de-carbono.php"
  },
  {
    "name": "IBGE — Classificação Climática do Brasil (Koppen-Geiger)",
    "url": "https://www.ibge.gov.br/geociencias/informacoes-ambientais/climatologia.html"
  },
  {
    "name": "IBGE — Métodos Quantitativos (Noções de Estatística)",
    "url": "https://www.ibge.gov.br/apps/snig/v1/notas_metodologicas.html"
  },
  {
    "name": "FIDE – Regulations for the titles and ratings (Handbook, seção B02)",
    "url": "https://www.fide.com/fide/handbook.html"
  },
  {
    "name": "Wikipedia PT – Sistema de classificação Elo",
    "url": "https://pt.wikipedia.org/wiki/Sistema_de_classifica%C3%A7%C3%A3o_Elo"
  },
  {
    "name": "Confederação Brasileira de Xadrez (CBX) – Ratings nacionais",
    "url": "https://www.cbx.org.br"
  },
  {
    "name": "Mathai JK et al. — Br J Nutr (2017): Values for digestible indispensable amino acid scores (DIAAS) for some dairy and plant proteins",
    "url": "https://pubmed.ncbi.nlm.nih.gov/28382889/"
  },
  {
    "name": "Marsh KA et al. — Adv Nutr (2019): The Sources and Adequacy of Vitamin B12 in Plant-Based Diets",
    "url": "https://pubmed.ncbi.nlm.nih.gov/30505983/"
  },
  {
    "name": "Young VR, Pellett PL — Am J Clin Nutr (1994): Plant proteins in relation to human protein and amino acid nutrition",
    "url": "https://pubmed.ncbi.nlm.nih.gov/8172124/"
  },
  {
    "name": "Academy of Nutrition and Dietetics — Position Paper on Vegetarian Diets (2016)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/27886704/"
  },
  {
    "name": "Kreider RB et al. — ISSN Position Stand: Safety and efficacy of creatine supplementation (2017)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/28615996/"
  },
  {
    "name": "FAO — Dietary Protein Quality Evaluation in Human Nutrition (2013)",
    "url": "https://www.fao.org/ag/humannutrition/35978-02317b979a686a57aa4593304ffc17f86.pdf"
  }
],
  replaces: [
    '/pt/dash-sodio-diario-tabela', // Absorbida como caso calculable con formulaId dash-hipertension-sodio-diario-tabla.
    '/pt/elo-xadrez-vitoria-derrota-variacao', // Absorbida como caso calculable con formulaId elo-ajedrez-ganado-perdido-variacion.
    '/pt/proteina-vegana-completa-combinacao-aminoacidos', // Absorbida como caso calculable con formulaId vegana-proteina-completa-combinacion-aminoacidos.
  ],
  lastReviewed: '2026-07-28',
};
