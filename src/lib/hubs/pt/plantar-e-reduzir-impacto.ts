import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/jardim/plantar-e-reduzir-impacto',
  title: "Quando plantar e qual é o impacto da minha escolha? | Hacé Cuentas",
  description: "Hub de decisão com 5 cálculos: Calendário de Plantio do Hemisfério Sul: O que Semear Mês a Mês; Calculadora de colheita esperada da horta (kg/m²); Pegada de carbono do casamento ou evento: calcule e compense; Quando Podar Roseiras — por Zona Climática; Tempo de Biodegradação de Materiais: calculadora + tabela completa.",
  silo: "Jardim e ambiente",
  siloHref: '/pt/jardim',
  locale: 'pt',
  eyebrow: "Brasil · Jardim e ambiente",
  h1: "Quando plantar e qual é o impacto da minha escolha?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 5 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['5 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calendário de Plantio do Hemisfério Sul: O que Semear Mês a Mês",
    "hint": "No hemisfério sul as estações são invertidas em relação ao hemisfério norte: primavera = setembro–novembro, verão = dezembro–fevereiro, outono = março–maio, inverno = junho–agosto. Culturas de verão (tomate, pimentão, abobrinha) são plantadas de setembro a novembro; culturas de inverno (alho, ervilha, espinafre, brócolis) de abril a julho. O alho é plantado de abril a junho para colheita em novembro–dezembro, após 240–270 dias.",
    "yes": [
      "**Mês do Hemisfério Sul → Estação real → Temperatura do solo ≥ limiar da espécie → Semear ou Transplantar.** Exemplo: Outubro (primavera) com solo a ~18 °C = janela ideal para tomate, pimentão e abobrinha; julho (inverno) com solo a ~8 °C = momento certo para alho, brócolis e espinafre."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "No hemisfério sul as estações são invertidas em relação ao hemisfério norte: primavera = setembro–novembro, verão = dezembro–fevereiro, outono = março–maio, inverno = junho–agosto. Culturas de verão (tomate, pimentão, abobrinha) são plantadas de setembro a novembro; culturas de inverno (alho, ervilha, espinafre, brócolis) de abril a julho. O alho é plantado de abril a junho para colheita em novembro–dezembro, após 240–270 dias."
  },
  {
    "id": "c2",
    "label": "Calculadora de colheita esperada da horta (kg/m²)",
    "hint": "O rendimento médio de uma horta doméstica varia de 1,5 kg/m² (alface) a 4,0 kg/m² (abóbora) por ciclo. Para tomate, o valor padrão é 3,0 kg/m²/ciclo: uma horta de 10 m² produz cerca de 30 kg por ciclo de 120 dias. Fórmula: Colheita (kg) = Rendimento da espécie (kg/m²) × Área (m²).",
    "yes": [
      "**Colheita (kg) = Produtividade da espécie (kg/m²) × Área (m²)** — Ex.: 10 m² de tomate × 3,0 kg/m² = **30 kg por ciclo produtivo (~120 dias)**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "O rendimento médio de uma horta doméstica varia de 1,5 kg/m² (alface) a 4,0 kg/m² (abóbora) por ciclo. Para tomate, o valor padrão é 3,0 kg/m²/ciclo: uma horta de 10 m² produz cerca de 30 kg por ciclo de 120 dias. Fórmula: Colheita (kg) = Rendimento da espécie (kg/m²) × Área (m²)."
  },
  {
    "id": "c3",
    "label": "Pegada de carbono do casamento ou evento: calcule e compense",
    "hint": "Um casamento típico gera cerca de **150 kg de CO₂ por convidado** (incluindo transporte, catering, energia do local, decoração e resíduos). Um casamento com 120 convidados emite aproximadamente **18 toneladas de CO₂e** — equivalente a dirigir um carro por mais de 90.000 km. Para compensar, seria necessário plantar cerca de **820 árvores** (considerando 22 kg de CO₂ sequestrado por árvore por ano).",
    "yes": [
      "**CO₂ total (kg) = Nº de convidados × 150 kg** — Um casamento com 120 convidados emite ~18.000 kg de CO₂e, exigindo o plantio de ~820 árvores para compensação total."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Um casamento típico gera cerca de **150 kg de CO₂ por convidado** (incluindo transporte, catering, energia do local, decoração e resíduos). Um casamento com 120 convidados emite aproximadamente **18 toneladas de CO₂e** — equivalente a dirigir um carro por mais de 90.000 km. Para compensar, seria necessário plantar cerca de **820 árvores** (considerando 22 kg de CO₂ sequestrado por árvore por ano)."
  },
  {
    "id": "c4",
    "label": "Quando Podar Roseiras — por Zona Climática",
    "hint": "Poda pesada de roseiras: no Sul do Brasil (RS, SC, PR), a melhor época é julho–agosto, quando a planta entra em dormência com temperaturas abaixo de 10 °C. No Sudeste temperado (interior de SP, MG serras), julho–agosto. Em climas tropicais (Nordeste, Centro-Oeste), poda-se após a florada principal (março–abril) + início da seca. Em Portugal, a poda pesada é feita em fevereiro, 4–6 semanas antes das últimas geadas.",
    "yes": [
      "**Poda pesada de roseiras: junho–agosto (climas frios/temperados) ou após florada principal (climas tropicais).** Poda leve de manutenção a cada 6–8 semanas durante o ciclo ativo."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Poda pesada de roseiras: no Sul do Brasil (RS, SC, PR), a melhor época é julho–agosto, quando a planta entra em dormência com temperaturas abaixo de 10 °C. No Sudeste temperado (interior de SP, MG serras), julho–agosto. Em climas tropicais (Nordeste, Centro-Oeste), poda-se após a florada principal (março–abril) + início da seca. Em Portugal, a poda pesada é feita em fevereiro, 4–6 semanas antes das últimas geadas."
  },
  {
    "id": "c5",
    "label": "Tempo de Biodegradação de Materiais: calculadora + tabela completa",
    "hint": "O plástico PET demora cerca de 400 anos para se biodegradar; o vidro demora mais de 1.000.000 anos; a fralda descartável 500–600 anos; a lata de alumínio 100–500 anos; e o papel apenas 2 a 6 semanas. A diferença está na química: polímeros sintéticos (plástico, borracha) resistem às enzimas microbianas, enquanto fibras naturais (papel, algodão) são rapidamente consumidas por bactérias e fungos.",
    "yes": [
      "**Plástico PET: 400 anos; vidro: 1.000.000+ anos; fralda descartável: 500–600 anos; lata de alumínio: 100–500 anos; papel: 2–6 semanas.** A velocidade de biodegradação depende da estrutura química do material, da temperatura, da umidade e da atividade microbiana local — e pode ser até 10 vezes mais lenta dentro de aterros sanitários."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "O plástico PET demora cerca de 400 anos para se biodegradar; o vidro demora mais de 1.000.000 anos; a fralda descartável 500–600 anos; a lata de alumínio 100–500 anos; e o papel apenas 2 a 6 semanas. A diferença está na química: polímeros sintéticos (plástico, borracha) resistem às enzimas microbianas, enquanto fibras naturais (papel, algodão) são rapidamente consumidas por bactérias e fungos."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__mes",
    "label": "Calendário de Plantio do Hemisfério Sul: O que Semear Mês a Mês: Mês",
    "type": "select",
    "value": "octubre",
    "options": [
      {
        "value": "marzo",
        "label": "Março (início do outono)"
      },
      {
        "value": "abril",
        "label": "Abril (outono)"
      },
      {
        "value": "mayo",
        "label": "Maio (fim do outono)"
      },
      {
        "value": "junio",
        "label": "Junho (início do inverno)"
      },
      {
        "value": "julio",
        "label": "Julho (inverno)"
      },
      {
        "value": "agosto",
        "label": "Agosto (fim do inverno)"
      },
      {
        "value": "septiembre",
        "label": "Setembro (início da primavera)"
      },
      {
        "value": "octubre",
        "label": "Outubro (primavera)"
      },
      {
        "value": "noviembre",
        "label": "Novembro (fim da primavera)"
      },
      {
        "value": "diciembre",
        "label": "Dezembro (início do verão)"
      },
      {
        "value": "enero",
        "label": "Janeiro (verão)"
      },
      {
        "value": "febrero",
        "label": "Fevereiro (fim do verão)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__especie",
    "label": "Calculadora de colheita esperada da horta (kg/m²): Cultivo",
    "type": "select",
    "value": "tomate",
    "options": [
      {
        "value": "tomate",
        "label": "Tomate (3,0 kg/m²)"
      },
      {
        "value": "lechuga",
        "label": "Alface (1,5 kg/m²)"
      },
      {
        "value": "zanahoria",
        "label": "Cenoura (2,0 kg/m²)"
      },
      {
        "value": "papa",
        "label": "Batata (3,5 kg/m²)"
      },
      {
        "value": "calabaza",
        "label": "Abóbora (4,0 kg/m²)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__m2",
    "label": "Calculadora de colheita esperada da horta (kg/m²): Área plantada (m²)",
    "type": "number",
    "value": 10,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__invitados",
    "label": "Pegada de carbono do casamento ou evento: calcule e compense: Número de convidados",
    "type": "number",
    "value": 120,
    "step": 1,
    "thousands": false,
    "help": "Total de convidados que irão participar do casamento ou evento"
  },
  {
    "id": "c4__zona",
    "label": "Quando Podar Roseiras — por Zona Climática: Zona climática",
    "type": "select",
    "value": "frio",
    "options": [
      {
        "value": "frio",
        "label": "Frio (Sul do Brasil / Serras / Portugal / Patagônia)"
      },
      {
        "value": "templado",
        "label": "Temperado (Sudeste BR, interior SP/MG / midlatitudes)"
      },
      {
        "value": "calido",
        "label": "Quente/Tropical (Nordeste, Norte, Centro-Oeste BR)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c5__material",
    "label": "Tempo de Biodegradação de Materiais: calculadora + tabela completa: Material",
    "type": "select",
    "value": "plastico",
    "options": [
      {
        "value": "papel",
        "label": "Papel"
      },
      {
        "value": "cascara-fruta",
        "label": "Casca de fruta"
      },
      {
        "value": "algodon",
        "label": "Algodão"
      },
      {
        "value": "vidrio",
        "label": "Vidro"
      },
      {
        "value": "lata",
        "label": "Lata de alumínio"
      },
      {
        "value": "plastico",
        "label": "Garrafa PET (plástico)"
      },
      {
        "value": "tetra",
        "label": "TetraBrik (caixa de suco)"
      },
      {
        "value": "pañal",
        "label": "Fraldas descartáveis"
      },
      {
        "value": "neumatico",
        "label": "Pneu de borracha"
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
    "q": "Por que o calendário de plantio do Hemisfério Sul é diferente do Hemisfério Norte?",
    "a": "Porque as estações do ano são invertidas: quando é verão na Europa ou América do Norte (junho–agosto), no Cone Sul é inverno. Toda recomendação de plantio deve ser espelhada: 'plantar tomate em abril' válido para a Espanha equivale a 'plantar tomate em outubro' no sul do Brasil, Argentina ou Chile. A regra prática é somar 6 meses a qualquer data de um calendário do Hemisfério Norte para obter o mês equivalente no Hemisfério Sul."
  },
  {
    "q": "Qual é a temperatura mínima do solo para germinar tomates no Hemisfério Sul?",
    "a": "O tomate (Solanum lycopersicum) exige temperatura mínima do solo de **15 °C** para germinar de forma confiável, com temperatura ótima entre 20–25 °C. Abaixo de 10 °C a germinação para completamente. No Hemisfério Sul, isso restringe a semeadura em bandeja de agosto a setembro nas regiões temperadas como Buenos Aires, Santiago ou Montevidéu, com transplante de outubro a novembro."
  },
  {
    "q": "Quais culturas podem ser plantadas no inverno do Hemisfério Sul (junho–agosto)?",
    "a": "No inverno do Hemisfério Sul plantam-se culturas de clima frio: **alho** (T_mín solo 8 °C), **ervilha** (6 °C), **favas** (5 °C), **espinafre** (4 °C), **alface** (5 °C), **brócolis** (7 °C), **couve** (5 °C) e **cenoura** (7 °C). Essas espécies não só toleram o frio como produzem melhor nele — o frio melhora o sabor de couves e espinafres por aumentar o teor de açúcares nas folhas."
  },
  {
    "q": "Como calcular a data de colheita a partir da data de plantio?",
    "a": "A fórmula básica é: **Data de colheita = Data de semeadura + Ciclo médio da cultura (dias)**. Exemplo: abobrinha semeada em 1.º de outubro tem ciclo de 50–60 dias, portanto colheita prevista para 20–30 de novembro. Culturas como rabanete (25 d) e alface (40–50 d) têm ciclo curto e permitem múltiplas colheitas por estação; milho (110 d) e abóbora (90 d) exigem planejamento para não cruzar com a geada ou o frio de outono."
  },
  {
    "q": "Posso plantar tomate em outubro em todas as regiões do Hemisfério Sul?",
    "a": "Em regiões de baixa altitude e clima temperado úmido (Buenos Aires, Montevidéu, litoral chileno), outubro é praticamente universal para transplante de tomate. Porém, em zonas com altitude acima de 700 m (Mendoza, serra gaúcha, região andina chilena), geadas tardias podem ocorrer até setembro–outubro, então o transplante seguro recua para **novembro**. Sempre verifique a data de última geada histórica da sua localidade antes de transplantar solanáceas a campo aberto."
  },
  {
    "q": "O que é semeadura em bandeja e quando é preferível à semeadura direta?",
    "a": "Semeadura em bandeja (ou almofada de mudas) significa germinar a semente em ambiente controlado — estufa, varanda aquecida ou bancada interna — e só transplantar a muda para o canteiro quando o clima externo for favorável. É preferível para espécies de ciclo longo e exigentes em calor (tomate, pimentão, berinjela) que precisam de 45–60 dias de crescimento antes de suportar o campo. A semeadura direta é indicada para espécies que não toleram o transplante (cenoura, rabanete, beterraba) ou que germinam rapidamente mesmo em solo frio (ervilha, alface)."
  },
  {
    "q": "Qual é a fonte científica por trás das temperaturas mínimas de germinação usadas nesta calculadora?",
    "a": "Os valores de temperatura mínima de germinação têm base em dados agronômicos consolidados pela Embrapa (Empresa Brasileira de Pesquisa Agropecuária) e pelo INTA (Instituto Nacional de Tecnología Agropecuaria, Argentina), que publicam tabelas de exigências térmicas para hortaliças. Os valores — tomate 15 °C, alface 5 °C, abobrinha 18 °C, ervilha 6 °C — estão dentro das faixas documentadas nessas publicações técnicas e são consistentes com a literatura internacional de fisiologia vegetal."
  },
  {
    "q": "Como a altitude afeta o calendário de plantio no Hemisfério Sul?",
    "a": "Para cada **100 m de aumento de altitude**, a temperatura média cai aproximadamente **0,65 °C** (gradiente adiabático seco, NOAA). Uma região a 1.000 m de altitude (como partes da serra gaúcha ou Andes chilenos) tem um clima equivalente a 2–3 semanas mais frio que o litoral na mesma latitude. Praticamente, o transplante de solanáceas que ocorre em outubro no litoral deve ser adiado para novembro nessas regiões, e culturas de inverno podem ser mantidas por mais tempo."
  },
  {
    "q": "Qual é o melhor mês para começar uma horta do zero no Hemisfério Sul?",
    "a": "**Setembro ou outubro** é o ponto de partida ideal para a maioria das regiões temperadas do Hemisfério Sul (Buenos Aires, Santiago, São Paulo, Auckland, Cidade do Cabo). O solo já aquece acima de 15 °C, o risco de geada é praticamente nulo e há 4–5 meses de estação quente pela frente. Comece com culturas fáceis: alface e rabanete direto da semente (prontos em 30–45 dias) e mudas de tomate ou abobrinha compradas em viveiro. Em janeiro você já terá as primeiras colheitas e a confiança para planejar um ciclo completo."
  },
  {
    "q": "Quantos kg produz 1 m² de tomate por ciclo?",
    "a": "Em condições de horta doméstica com solo corrigido e irrigação regular, **1 m² de tomate produz cerca de 3,0 kg por ciclo** de aproximadamente 120 dias. Em um ano (3 ciclos), isso equivale a ~9,0 kg/m². Em condições excepcionais (estufa, variedades híbridas, adubação intensa), pode chegar a 4–5 kg/m²/ciclo. Em solo fraco ou sem manejo, o rendimento cai para 1,5–2,0 kg/m²."
  }
],
  sources: [
  {
    "name": "Embrapa Hortaliças — Tabelas de Exigências Climáticas de Hortaliças",
    "url": "https://www.embrapa.br/hortalicas"
  },
  {
    "name": "INTA Argentina — Calendario de Siembra de Hortalizas",
    "url": "https://inta.gob.ar/documentos/calendario-de-siembra-de-hortalizas"
  },
  {
    "name": "IBGE — Produção Agrícola Municipal (referência de culturas por região)",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9117-producao-agricola-municipal-culturas-temporarias-e-permanentes.html"
  },
  {
    "name": "Wikipedia PT — Hemisfério Sul (Estações do ano)",
    "url": "https://pt.wikipedia.org/wiki/Hemisf%C3%A9Rio_Sul"
  },
  {
    "name": "IBGE – Pesquisa de Orçamentos Familiares (POF): Consumo Alimentar",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9050-pesquisa-de-orcamentos-familiares.html"
  },
  {
    "name": "Conab – Boletim Hortigranjeiro",
    "url": "https://www.conab.gov.br/info-agro/analises-do-mercado-agropecuario-e-extrativista/analises-do-mercado/historico-mensal-de-hortigranjeiros"
  },
  {
    "name": "Wikipedia PT – Horticultura",
    "url": "https://pt.wikipedia.org/wiki/Horticultura"
  },
  {
    "name": "IBGE — Inventário Nacional de Emissões de Gases de Efeito Estufa",
    "url": "https://www.ibge.gov.br/explica/emissoes-de-carbono.php"
  },
  {
    "name": "Ministério do Meio Ambiente — Programa Nacional de Florestas",
    "url": "https://www.gov.br/mma/pt-br/assuntos/servicosecossistemicos/florestas/programa-nacional-de-florestas"
  },
  {
    "name": "IPCC — Sexto Relatório de Avaliação (AR6), 2021",
    "url": "https://www.ipcc.ch/report/ar6/wg1/"
  },
  {
    "name": "SOS Mata Atlântica — Projetos de Compensação de Carbono",
    "url": "https://www.sosma.org.br"
  },
  {
    "name": "Embrapa Clima Temperado — Cultivo de Roseiras",
    "url": "https://www.embrapa.br/clima-temperado"
  },
  {
    "name": "IBGE — Classificação Climática do Brasil (Koppen-Geiger)",
    "url": "https://www.ibge.gov.br/geociencias/informacoes-ambientais/climatologia.html"
  },
  {
    "name": "Wikipedia PT — Rosa (gênero)",
    "url": "https://pt.wikipedia.org/wiki/Rosa_(g%C3%AAnero)"
  },
  {
    "name": "Embrapa — Cultivo de Roseiras (Circular Técnica)",
    "url": "https://www.embrapa.br/busca-de-publicacoes/-/publicacao/list/autoria/nome/roseiras"
  },
  {
    "name": "IBGE — Pesquisa Nacional de Saneamento Básico (PNSB 2017)",
    "url": "https://www.ibge.gov.br/estatisticas/multidominio/meio-ambiente/9073-pesquisa-nacional-de-saneamento-basico.html"
  },
  {
    "name": "Ministério do Meio Ambiente — Política Nacional de Resíduos Sólidos (Lei 12.305/2010)",
    "url": "https://www.gov.br/mma/pt-br/assuntos/agendaambientalurbana/lixao-zero/politica-nacional-de-residuos-solidos"
  },
  {
    "name": "NOAA — Quanto tempo para decompor um saco plástico",
    "url": "https://response.restoration.noaa.gov/about/media/how-long-will-it-take-that-bag-decompose.html"
  },
  {
    "name": "U.S. EPA — Sustainable Management of Food: Composting",
    "url": "https://www.epa.gov/sustainable-management-food/composting"
  },
  {
    "name": "Science Advances — Plastic degradation in the ocean (Jambeck et al.)",
    "url": "https://www.science.org/doi/10.1126/sciadv.1600782"
  },
  {
    "name": "IBGE — Pesquisa Nacional de Saúde: prática de atividade física e musculação no Brasil",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html"
  },
  {
    "name": "NOAA — Temperatura, salinidad y densidad del océano",
    "url": "https://oceanservice.noaa.gov/facts/whysalty.html"
  },
  {
    "name": "U.S. EPA – Paper and Paperboard: Material-Specific Data",
    "url": "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/paper-and-paperboard-material-specific-data"
  },
  {
    "name": "NOAA – Temperature Conversion Formulas (National Weather Service)",
    "url": "https://www.weather.gov/media/epz/wxcalc/tempConvert.pdf"
  },
  {
    "name": "IBGE — Rede Gravimétrica Fundamental Brasileira",
    "url": "https://www.ibge.gov.br/geociencias/informacoes-sobre-posicionamento-geodesico/geodesia/10988-rede-gravimetrica-fundamental-brasileira.html"
  },
  {
    "name": "IBGE — Pesquisa de Orçamentos Familiares (POF) 2017–2018",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html"
  },
  {
    "name": "IBGE – Produção da Extração Vegetal e da Silvicultura (PEVS)",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9105-producao-da-extracao-vegetal-e-da-silvicultura.html"
  },
  {
    "name": "IBGE — Censo Demográfico 2022: Taxa de Crescimento Geométrico Anual",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html"
  },
  {
    "name": "IBGE — IPCA: Índice Nacional de Preços ao Consumidor Amplo",
    "url": "https://www.ibge.gov.br/explica/inflacao.php"
  },
  {
    "name": "IBGE — Síntese de Indicadores Sociais (linhas de pobreza)",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html"
  },
  {
    "name": "IBGE – IPCA: Índice Nacional de Preços ao Consumidor Amplo",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/precos-custos-e-indices-de-precos/9173-indice-nacional-de-precos-ao-consumidor-amplo.html"
  },
  {
    "name": "IBGE – Noções de Estatística: Medidas de Dispersão",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao.html"
  },
  {
    "name": "IBGE — Estatísticas do Registro Civil (Divórcios e Casamentos)",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao/9110-estatisticas-do-registro-civil.html"
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
    "name": "IBGE — PNAD Contínua: Rendimento de todas as fontes 2023",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html"
  },
  {
    "name": "IBGE — Métodos Quantitativos (Noções de Estatística)",
    "url": "https://www.ibge.gov.br/apps/snig/v1/notas_metodologicas.html"
  }
],
  replaces: [
    '/pt/calendario-plantio-hemisferio-sul', // Absorbida como caso calculable con formulaId calendario-siembra-hemisferio-sur.
    '/pt/colheita-esperada-horta-kg', // Absorbida como caso calculable con formulaId cosecha-esperada-huerta-kg.
    '/pt/pegada-carbono-casamento-evento', // Absorbida como caso calculable con formulaId huella-carbono-boda-evento.
    '/pt/quando-podar-rosa', // Absorbida como caso calculable con formulaId podar-rosal-cuando-fecha.
    '/pt/tempo-biodegradacao-material', // Absorbida como caso calculable con formulaId biodegradacion-residuo-tiempo.
  ],
  lastReviewed: '2026-07-28',
};
