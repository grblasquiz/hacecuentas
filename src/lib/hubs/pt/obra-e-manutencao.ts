import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/casa/obra-e-manutencao',
  title: "Custo de obra por m² (CUB), tijolos e aço por m² de laje",
  description: "Calculadoras de obra: custo por m² com o CUB, tijolos por m² de parede, aço por m² de laje, brita para drenagem e custo de mudança com frete e embalagem.",
  silo: "Obra e manutenção",
  siloHref: '/pt/casa',
  locale: 'pt',
  eyebrow: "Brasil · Obra e manutenção",
  h1: "Quanto de material e dinheiro preciso para a obra da casa?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 7 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['7 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Aço por m² de Laje — Calculadora + Tabela de Referência",
    "hint": "Uma laje maciça tradicional consome entre 10 e 15 kg de aço por m². Lajes nervuradas usam 7–10 kg/m² e lajes aliviadas 8–12 kg/m². Para obter o total, multiplique a taxa pelo área da laje e acrescente 10–12% para perdas de emendas, espaçadores e corte.",
    "yes": [
      "**Total de aço (kg) = taxa (kg/m²) × área da laje (m²)**. Acrescente 10–12% para perdas de emendas, espaçadores e recortes. Laje maciça: 10–15 kg/m². Nervurada: 7–10 kg/m². Aliviada: 8–12 kg/m²."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Uma laje maciça tradicional consome entre 10 e 15 kg de aço por m². Lajes nervuradas usam 7–10 kg/m² e lajes aliviadas 8–12 kg/m². Para obter o total, multiplique a taxa pelo área da laje e acrescente 10–12% para perdas de emendas, espaçadores e corte."
  },
  {
    "id": "c2",
    "label": "kW por m² para aquecimento: tabela por isolamento e tamanho",
    "hint": "Regra prática para dimensionar caldeira: 70–120 W por m² (0,07–0,12 kW/m²) conforme o isolamento. Para uma casa de 100 m² com isolamento normal, são necessários aproximadamente 9 kW. Fórmula: kW = m² × 0,09 (normal) / 0,07 (bom isolamento) / 0,12 (isolamento ruim). Sempre escolha o modelo com potência imediatamente acima do valor calculado.",
    "yes": [
      "**kW = m² × fator W/m² ÷ 1000** — Bom isolamento: 70 W/m². Normal: 90 W/m². Ruim: 120 W/m². Uma casa de 100 m² precisa de 7–12 kW conforme o isolamento. Escolha sempre a potência imediatamente acima do calculado."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Regra prática para dimensionar caldeira: 70–120 W por m² (0,07–0,12 kW/m²) conforme o isolamento. Para uma casa de 100 m² com isolamento normal, são necessários aproximadamente 9 kW. Fórmula: kW = m² × 0,09 (normal) / 0,07 (bom isolamento) / 0,12 (isolamento ruim). Sempre escolha o modelo com potência imediatamente acima do valor calculado."
  },
  {
    "id": "c3",
    "label": "Calculadora de Custo de Obra por m² (CUB)",
    "hint": "Para estimar o custo de construir uma casa, multiplique a área (m²) pelo CUB do seu estado (Custo Unitário Básico, divulgado mensalmente pelo Sinduscon) e aplique uma margem conforme o padrão, já que o CUB não cobre fundações, projetos, ligações e BDI. Exemplo: 100 m² com CUB de R$ 2.200/m² dá R$ 220.000 pelo CUB; no padrão normal, o custo total estimado fica em torno de R$ 286.000 (faixa de R$ 253 mil a R$ 319 mil), ou cerca de R$ 2.860 por m².",
    "yes": [
      "Custo estimado = **área × CUB × fator do padrão**. O CUB é a base (estrutura + acabamentos padrão), mas a obra completa custa **15% a 75% a mais**, dependendo do padrão, por causa de fundações, projetos, instalações e BDI. Consulte o **CUB atualizado** do seu estado no Sinduscon — ele muda todo mês."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-24.",
    "answer": "Para estimar o custo de construir uma casa, multiplique a área (m²) pelo CUB do seu estado (Custo Unitário Básico, divulgado mensalmente pelo Sinduscon) e aplique uma margem conforme o padrão, já que o CUB não cobre fundações, projetos, ligações e BDI. Exemplo: 100 m² com CUB de R$ 2.200/m² dá R$ 220.000 pelo CUB; no padrão normal, o custo total estimado fica em torno de R$ 286.000 (faixa de R$ 253 mil a R$ 319 mil), ou cerca de R$ 2.860 por m²."
  },
  {
    "id": "c4",
    "label": "Quanto de Brita para Drenagem em Vasos",
    "hint": "Use entre 5% e 15% do volume do vaso como camada de brita para drenagem. Em um vaso de 10 L: 0,5 L (cactos/suculentas) a 1,5 L (samambaias/tropicais). Fórmula: Brita (L) = Volume do vaso (L) × 0,05 a 0,15.",
    "yes": [
      "**Volume de brita (L) = Volume do vaso (L) × fator de drenagem**, onde o fator varia de **0,05 (5%) para plantas tropicais** até **0,15 (15%) para suculentas e cactos**. Exemplo: vaso de 20 L com suculenta → 20 × 0,15 = **3 L de brita**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Use entre 5% e 15% do volume do vaso como camada de brita para drenagem. Em um vaso de 10 L: 0,5 L (cactos/suculentas) a 1,5 L (samambaias/tropicais). Fórmula: Brita (L) = Volume do vaso (L) × 0,05 a 0,15."
  },
  {
    "id": "c5",
    "label": "Mudança: custo frete + embalagem",
    "hint": "Calcular o custo de uma mudança no Brasil em 2026 depende de seis variáveis principais que determinam o orçamento final: o volume transportado (em metros cúbicos ou número de caixas), a distância em quilômetros entre origem e destino, o andar de saída e chegada (com elevador de serviço disponível ou não), o serviço de montagem e desmontagem de móveis, o pacote de embalagens (caixas, plástico bolha, fita) e o seguro…",
    "yes": [
      "**Total = Frete (m³ × R$ 80) + Km (km × R$ 4,50) + Andar (escada R$ 80–150/andar) + Embalagem + Seguro RCTRC (0,8–2% valor declarado)** — apartamento 2Q a 20 km com elevador custa entre **R$ 1.800 e R$ 3.200** em 2026."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-05-28.",
    "answer": "Calcular o custo de uma mudança no Brasil em 2026 depende de seis variáveis principais que determinam o orçamento final: o volume transportado (em metros cúbicos ou número de caixas), a distância em quilômetros entre origem e destino, o andar de saída e chegada (com elevador de serviço disponível ou não), o serviço de montagem e desmontagem de móveis, o pacote de embalagens (caixas, plástico bolha, fita) e o seguro…"
  },
  {
    "id": "c6",
    "label": "Quanto Mulch Preciso? Volume e Peso por Área e Espessura",
    "hint": "Para calcular quanto mulch você precisa: multiplique a área (m²) pela espessura em metros (cm ÷ 100). Exemplo: 20 m² a 5 cm de espessura = 20 × 0,05 = **1,0 m³ ≈ 100 kg de palha seca** (densidade ~100 kg/m³). Para wood chips (~320 kg/m³), o mesmo 1,0 m³ pesa ~320 kg.",
    "yes": [
      "**V (m³) = Área (m²) × Espessura (cm) ÷ 100** — Ex.: 20 m² × 5 cm = 20 × 0,05 = **1,0 m³ ≈ 100 kg de palha**. Acrescente 10–15% para compensar compactação."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Para calcular quanto mulch você precisa: multiplique a área (m²) pela espessura em metros (cm ÷ 100). Exemplo: 20 m² a 5 cm de espessura = 20 × 0,05 = **1,0 m³ ≈ 100 kg de palha seca** (densidade ~100 kg/m³). Para wood chips (~320 kg/m³), o mesmo 1,0 m³ pesa ~320 kg."
  },
  {
    "id": "c7",
    "label": "Calculadora de tijolos por m² de parede",
    "hint": "Para tijolo cerâmico comum de 6 furos (9×19×19 cm), são necessários **60 tijolos por m² de parede simples** (espessura de 9 cm). Adicionando 10% de margem para quebras e cortes, compre **66 tijolos por m²**. Para parede dupla (19 cm de espessura), dobre a quantidade: ~120 un/m².",
    "yes": [
      "**Tijolo comum 6 furos (9×19×19 cm): 60 un/m² | Tijolo portante/estrutural: 16 un/m² | Tijolo de vedação grande: 20 un/m².** Sempre adicione 10% de folga para quebras, cortes e nichos elétricos."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Para tijolo cerâmico comum de 6 furos (9×19×19 cm), são necessários **60 tijolos por m² de parede simples** (espessura de 9 cm). Adicionando 10% de margem para quebras e cortes, compre **66 tijolos por m²**. Para parede dupla (19 cm de espessura), dobre a quantidade: ~120 un/m²."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__tipo",
    "label": "Aço por m² de Laje — Calculadora + Tabela de Referência: Tipo de laje",
    "type": "select",
    "value": "viguetas",
    "options": [
      {
        "value": "viguetas",
        "label": "Nervurada / Vigotas pretensadas"
      },
      {
        "value": "maciza",
        "label": "Maciça tradicional"
      },
      {
        "value": "aliviana",
        "label": "Aliviada (com tavelas)"
      }
    ],
    "thousands": false,
    "help": "Escolha o sistema construtivo da laje do seu projeto."
  },
  {
    "id": "c2__m2",
    "label": "kW por m² para aquecimento: tabela por isolamento e tamanho: Área a aquecer (m²)",
    "type": "number",
    "value": 100,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__aislamiento",
    "label": "kW por m² para aquecimento: tabela por isolamento e tamanho: Qualidade do isolamento",
    "type": "select",
    "value": "normal",
    "options": [
      {
        "value": "bueno",
        "label": "Bom (vidros duplos, paredes isoladas)"
      },
      {
        "value": "normal",
        "label": "Normal (forro, janelas simples vedadas)"
      },
      {
        "value": "malo",
        "label": "Ruim (sem isolamento, correntes de ar)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__areaConstruida",
    "label": "Calculadora de Custo de Obra por m² (CUB): Área construída (m²)",
    "type": "number",
    "value": 100,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Metragem total a construir, em metros quadrados."
  },
  {
    "id": "c3__cubM2",
    "label": "Calculadora de Custo de Obra por m² (CUB): CUB do seu estado (R$/m²)",
    "type": "number",
    "value": 2200,
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "Custo Unitário Básico por m², divulgado pelo Sinduscon do seu estado."
  },
  {
    "id": "c3__padrao",
    "label": "Calculadora de Custo de Obra por m² (CUB): Padrão de acabamento",
    "type": "select",
    "value": "normal",
    "options": [
      {
        "value": "baixo",
        "label": "Simples/econômico (+15% sobre o CUB)"
      },
      {
        "value": "normal",
        "label": "Normal (+30% sobre o CUB)"
      },
      {
        "value": "alto",
        "label": "Alto/luxo (+55% sobre o CUB)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c4__volumenMaceta",
    "label": "Quanto de Brita para Drenagem em Vasos: Volume do vaso (L)",
    "type": "number",
    "value": 10,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c5__km",
    "label": "Mudança: custo frete + embalagem: Quilômetros a percorrer",
    "type": "number",
    "value": 10,
    "step": 0.01,
    "thousands": false,
    "help": "Distância em quilômetros pela rota real (Google Maps), não em linha reta."
  },
  {
    "id": "c5__m3",
    "label": "Mudança: custo frete + embalagem: Volume de móveis",
    "type": "number",
    "value": 20,
    "step": 0.01,
    "thousands": false,
    "help": "Volume estimado em m³. Kitnet ≈ 10–12 m³, ap 2Q ≈ 18–28 m³, ap 3Q ≈ 30–40 m³."
  },
  {
    "id": "c5__pisoSalida",
    "label": "Mudança: custo frete + embalagem: Andar de saída",
    "type": "select",
    "value": "pb",
    "options": [
      {
        "value": "pb",
        "label": "Térreo"
      },
      {
        "value": "1-3",
        "label": "1-3"
      },
      {
        "value": "4-6",
        "label": "4-6"
      },
      {
        "value": "7-mas",
        "label": "7 ou mais"
      }
    ],
    "thousands": false,
    "help": "Andar de origem da mudança. Sem elevador de serviço, gera sobretaxa por andar."
  },
  {
    "id": "c5__conEmbalaje",
    "label": "Mudança: custo frete + embalagem: Com embalagem",
    "type": "select",
    "value": "no",
    "options": [
      {
        "value": "no",
        "label": "Não"
      },
      {
        "value": "si",
        "label": "Sim"
      }
    ],
    "thousands": false,
    "help": "Inclui caixas (60×60×60 cm), plástico bolha, fita e mão de obra para embalar."
  },
  {
    "id": "c6__m2",
    "label": "Quanto Mulch Preciso? Volume e Peso por Área e Espessura: Área do canteiro (m²)",
    "type": "number",
    "value": 20,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c6__espesor",
    "label": "Quanto Mulch Preciso? Volume e Peso por Área e Espessura: Espessura do mulch (cm)",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c7__tipo",
    "label": "Calculadora de tijolos por m² de parede: Tipo de tijolo",
    "type": "select",
    "value": "comun",
    "options": [
      {
        "value": "comun",
        "label": "Comum 6 furos (9×19×19 cm) — 60 un/m²"
      },
      {
        "value": "portante",
        "label": "Portante / Estrutural (18×14×33 cm) — 16 un/m²"
      },
      {
        "value": "cerramiento",
        "label": "Vedação grande (20×12×33 cm) — 20 un/m²"
      }
    ],
    "thousands": false
  },
  {
    "id": "c7__m2",
    "label": "Calculadora de tijolos por m² de parede: Área da parede (m²)",
    "type": "number",
    "value": 20,
    "step": 0.01,
    "thousands": false
  }
],
  fineprint: "Estimativa informativa. Confira os dados e as fontes oficiais antes de decidir.",
  chart: { type: 'bars', caption: "Os principais resultados numéricos da fórmula selecionada." },
  breakdownTitle: "Resultados da fórmula",
  breakdownIntro: "Cada linha vem da fórmula da calculadora original.",
  faq: [
  {
    "q": "Quantos kg de aço por m² tem uma laje maciça residencial?",
    "a": "Uma laje maciça residencial típica (120–180 mm de espessura, vão de 4–6 m) consome entre **10 e 15 kg de aço por m²**, incluindo armadura positiva, negativa, de distribuição e espaçadores. Para orçamento rápido, use o valor central de **12 kg/m²** e acrescente 12% de perdas antes de comprar o material."
  },
  {
    "q": "Qual norma técnica regula o consumo de aço em lajes no Brasil?",
    "a": "A **NBR 6118:2023** (Projeto de estruturas de concreto armado e protendido) da ABNT é a norma principal. Ela define taxa mínima de armadura (ρ_mín ≈ 0,15% para CA-50) e máxima (ρ_máx ≈ 4%), além de exigências de cobrimento e ancoragem que impactam o consumo total de aço."
  },
  {
    "q": "Qual tipo de laje consome menos aço por m²?",
    "a": "A **laje protendida** apresenta menor taxa de aço passivo (4–8 kg/m²), pois os cabos de protensão substituem grande parte da armadura convencional. Em segundo lugar ficam as lajes pré-moldadas (4–8 kg/m²) e nervuradas (6–10 kg/m²). Para grandes vãos acima de 8 m, a protensão é especialmente vantajosa economicamente."
  },
  {
    "q": "Como calcular a quantidade de aço para uma laje de 50 m²?",
    "a": "Multiplique a área pela taxa de referência. Para uma laje maciça de 50 m² com taxa de 12 kg/m²: **50 × 12 = 600 kg de aço total**. Acrescente 12% de perdas: 600 × 1,12 = **672 kg a comprar**. Uma barra ø10 mm CA-50 de 12 m pesa ~7,4 kg — seriam necessárias cerca de 91 barras."
  },
  {
    "q": "O kg/m² de aço inclui tela soldada e barras?",
    "a": "Sim. A taxa de kg/m² deve incluir **toda a armadura da laje**: barras CA-50 (armadura positiva e negativa), telas soldadas CA-60 (distribuição e temperatura), além de armaduras de punção em lajes cogumelo. Em lajes nervuradas, a tela soldada Q-138 ou Q-196 na capa de compressão representa 1,5–2,5 kg/m² do total."
  },
  {
    "q": "Qual a diferença entre aço CA-50 e CA-60 em lajes?",
    "a": "O **CA-50** (fyk = 500 MPa) é usado em barras de armadura principal (ø ≥ 6,3 mm) de lajes maciças e nervuradas. O **CA-60** (fyk = 600 MPa) é utilizado em fios e telas soldadas para armadura de distribuição (ø ≤ 10 mm). O CA-60 permite menor seção de aço para a mesma carga, conforme especificado na NBR 7480:2022."
  },
  {
    "q": "Como o vão livre afeta o consumo de aço por m²?",
    "a": "O consumo cresce de forma **aproximadamente quadrática** com o vão. Dobrando o vão de 3 m para 6 m, o momento fletor quadruplica (M = q×L²/8), o que pode aumentar a taxa de aço em 60–120% para lajes maciças. Por isso, vãos acima de 6 m geralmente exigem mudança de sistema construtivo para manter a viabilidade econômica."
  },
  {
    "q": "O índice kg/m² de aço aparece no SINAPI?",
    "a": "Sim. O **SINAPI** (Caixa Econômica Federal / IBGE) utiliza composições de serviço que expressam o consumo de aço em kg/m² para cada tipo de laje. Por exemplo, o código SINAPI 94240 (laje nervurada com EPS) já embute a taxa de aço, facilitando orçamentos públicos exigidos pela Lei 14.133/2021."
  },
  {
    "q": "Preciso contratar engenheiro para dimensionar a laje?",
    "a": "Sim, **sempre**. Esta calculadora fornece índices paramétricos para estimativa de materiais e orçamento — não substitui o projeto estrutural assinado por engenheiro habilitado (CREA). A NBR 6118 exige memorial de cálculo com verificação de estado-limite último (ELU) e estado-limite de serviço (ELS) para toda estrutura de concreto armado."
  },
  {
    "q": "Quantos kW por m² são necessários para aquecimento?",
    "a": "A regra prática é 70–120 W/m² (0,07–0,12 kW/m²) conforme o isolamento. Uma casa moderna bem isolada usa 70 W/m²; uma construção antiga sem isolamento precisa de 120 W/m² ou mais. Para dimensionamento rápido: multiplique os m² por 0,09 para construção padrão, ou use a tabela acima conforme seu nível de isolamento."
  },
  {
    "q": "Qual a potência de caldeira para 100 m²?",
    "a": "Para 100 m²: bom isolamento → 7 kW; isolamento normal → 9 kW; isolamento ruim → 12 kW. Sempre escolha a próxima potência comercial acima. A maioria das casas de 100 m² com isolamento médio é atendida por caldeira de 10–12 kW."
  },
  {
    "q": "Qual caldeira para 150 m²?",
    "a": "Uma casa de 150 m² precisa de aproximadamente: bom isolamento → 10,5 kW (escolha caldeira de 12 kW); isolamento normal → 13,5 kW (escolha 15 ou 18 kW); isolamento ruim → 18 kW (escolha 20 ou 24 kW). Adicione 10–15% de margem ao escolher o equipamento."
  },
  {
    "q": "Qual caldeira para 200 m²?",
    "a": "200 m² exigem aproximadamente: bom isolamento → 14 kW (escolha 15 ou 18 kW); normal → 18 kW (escolha 20 ou 24 kW); ruim → 24 kW (escolha 28 kW). Imóveis grandes com múltiplos banheiros podem demandar caldeira mural de sistema em vez de combinada."
  },
  {
    "q": "O pé-direito alto afeta o dimensionamento da caldeira?",
    "a": "Sim. A fórmula kW/m² é calibrada para pé-direito padrão de 2,5–3 m. Para ambientes com pé-direito acima de 3,5 m (galpões, salões comerciais), calcule por volume (m³): multiplique por 30–50 W/m³. Um galpão de 250 m² com 4 m de pé-direito (1.000 m³) precisa de cerca de 40 kW."
  }
],
  sources: [
  {
    "name": "NBR 6118:2023 — Projeto de estruturas de concreto armado e protendido (ABNT)",
    "url": "https://www.abnt.org.br/normalizacao/lista-de-publicacoes/abnt-nbr-6118"
  },
  {
    "name": "SINAPI — Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (IBGE/Caixa)",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/precos-custos-e-indices-de-precos/9270-sistema-nacional-de-pesquisa-de-custos-e-indices-da-construcao-civil.html"
  },
  {
    "name": "NBR 7480:2022 — Aço destinado a armaduras para estruturas de concreto armado (ABNT)",
    "url": "https://www.abnt.org.br/normalizacao/lista-de-publicacoes/abnt-nbr-7480"
  },
  {
    "name": "TCPO — Tabelas de Composição de Preços para Orçamentos, 14ª ed. (PINI)",
    "url": "https://www.piniweb.com.br/construcao/tcpo/"
  },
  {
    "name": "ABNT NBR 15220 — Desempenho Térmico de Edificações (ABNT/INMETRO)",
    "url": "https://www.inmetro.gov.br/legislacao/rtac/pdf/RTAC002764.pdf"
  },
  {
    "name": "INMETRO — Etiquetagem de Eficiência Energética de Edificações (ENCE)",
    "url": "https://www.inmetro.gov.br/qualidade/energetica/edificacoes.asp"
  },
  {
    "name": "ASHRAE Handbook — Fundamentals: Heating Load Calculations",
    "url": "https://www.ashrae.org/technical-resources/ashrae-handbook"
  },
  {
    "name": "BS EN 12831 — Heating Systems in Buildings: Method for calculation of the design heat load (BSI Standards)",
    "url": "https://www.bsigroup.com/en-GB/standards/bs-en-12831/"
  },
  {
    "name": "Energy Saving Trust — Boiler Sizing and Central Heating Advice (UK)",
    "url": "https://energysavingtrust.org.uk/advice/boilers/"
  },
  {
    "name": "CBIC — Banco de dados: CUB (Custo Unitário Básico) por estado",
    "url": "https://cbicdados.com.br/menu/custos/cub-custo-unitario-basico"
  },
  {
    "name": "Caixa — Habitação: construção e financiamento de imóveis",
    "url": "https://www.caixa.gov.br/voce/habitacao/financiamento-construcao"
  },
  {
    "name": "ABNT NBR 7211 – Agregados para concreto: especificação (referência para classificação de brita por granulometria)",
    "url": "https://pt.wikipedia.org/wiki/Brita"
  },
  {
    "name": "Embrapa – Cultivo de plantas ornamentais em vasos e recipientes",
    "url": "https://www.embrapa.br/hortalicas/cultura-do-vaso"
  },
  {
    "name": "ANTT — Agência Nacional de Transportes Terrestres (cadastro RNTRC e CT-e)",
    "url": "https://www.gov.br/antt/pt-br"
  },
  {
    "name": "ABRACAM — Associação Brasileira de Mudanças",
    "url": "https://www.abracam.com.br/"
  },
  {
    "name": "CNT — Confederação Nacional do Transporte",
    "url": "https://www.cnt.org.br/"
  },
  {
    "name": "Embrapa — Cobertura Morta do Solo (Mulching)",
    "url": "https://www.embrapa.br/busca-de-publicacoes/-/publicacao/lista/mulching"
  },
  {
    "name": "Engineering Toolbox — Bulk Density of Common Materials",
    "url": "https://www.engineeringtoolbox.com/density-materials-d_1652.html"
  },
  {
    "name": "Wikipedia — Mulch",
    "url": "https://en.wikipedia.org/wiki/Mulch"
  },
  {
    "name": "ABNT NBR 7171 — Bloco cerâmico para alvenaria de vedação",
    "url": "https://www.abntcatalogo.com.br/norma.aspx?ID=313902"
  },
  {
    "name": "ABNT NBR 15270 — Componentes cerâmicos: Blocos e tijolos para alvenaria estrutural",
    "url": "https://www.abntcatalogo.com.br/norma.aspx?ID=330374"
  },
  {
    "name": "INMETRO — Programa de Avaliação da Conformidade de Blocos Cerâmicos",
    "url": "https://www.inmetro.gov.br/qualidade/prodCompulsorios/blocos-ceramicos.asp"
  }
],
  replaces: [
    '/pt/aco-kg-m2-laje', // Absorbida como caso calculable con formulaId acero-kg-m2-losa.
    '/pt/caldeira-kw-m2-aquecimento', // Absorbida como caso calculable con formulaId caldera-kw-m2-calefaccion.
    '/pt/custo-obra-por-m2-quanto-custa-construir-casa-cub', // Absorbida como caso calculable con formulaId custo-obra-por-m2-quanto-custa-construir-casa-cub.
    '/pt/drenagem-brita-vaso', // Absorbida como caso calculable con formulaId drenaje-grava-maceta.
    '/pt/mudanca-custo-frete-caminhao-km-caixa', // Absorbida como caso calculable con formulaId mudanza-costo-flete-camioneta-km-caja.
    '/pt/mulch-espessura-quantidade', // Absorbida como caso calculable con formulaId mulching-espesor-cantidad.
    '/pt/parede-tijolos-m2', // Absorbida como caso calculable con formulaId pared-ladrillos-metros-m2.
  ],
  lastReviewed: '2026-08-16',
};
