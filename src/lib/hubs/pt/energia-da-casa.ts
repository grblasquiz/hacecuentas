import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/casa/energia-da-casa',
  title: "Quanto de energia minha casa consome? | Hacé Cuentas",
  description: "Hub de decisão com 3 cálculos: Consumo de Geladeira em kWh (Gasto Anual); Calculadora de conta de luz (kWh e bandeira tarifária); ¿Cuánto ahorrás cambiando a electrodoméstico A+++?.",
  silo: "Energia da casa",
  siloHref: '/pt/casa',
  locale: 'pt',
  eyebrow: "Brasil · Energia da casa",
  h1: "Quanto de energia minha casa consome?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 3 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['3 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Consumo de Geladeira em kWh (Gasto Anual)",
    "hint": "Consumo anual (kWh) = Potência do compressor (W) × 8.760 horas × Duty Cycle (decimal) ÷ 1.000. Uma geladeira de 150 W com ciclo de 40% consome cerca de 526 kWh/ano — aproximadamente R$ 379/ano na tarifa média brasileira de R$ 0,72/kWh. Geladeiras modernas classe A consomem entre 300 e 500 kWh/ano; modelos antigos podem superar 800 kWh/ano.",
    "yes": [
      "**kWh/ano = P (W) × 8.760 × Duty Cycle ÷ 1.000** — ex.: 150 W com ciclo de 40% = **526 kWh/ano ≈ R$ 379/ano** na tarifa média de R$ 0,72/kWh (ANEEL 2024)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Consumo anual (kWh) = Potência do compressor (W) × 8.760 horas × Duty Cycle (decimal) ÷ 1.000. Uma geladeira de 150 W com ciclo de 40% consome cerca de 526 kWh/ano — aproximadamente R$ 379/ano na tarifa média brasileira de R$ 0,72/kWh. Geladeiras modernas classe A consomem entre 300 e 500 kWh/ano; modelos antigos podem superar 800 kWh/ano."
  },
  {
    "id": "c2",
    "label": "Calculadora de conta de luz (kWh e bandeira tarifária)",
    "hint": "A conta de luz é o consumo (kWh) × tarifa da distribuidora + o acréscimo da bandeira tarifária + a contribuição de iluminação pública. As bandeiras 2026 (ANEEL) somam por 100 kWh: verde R$ 0, amarela R$ 1,88, vermelha 1 R$ 4,46 e vermelha 2 R$ 7,87. Ex.: 200 kWh a R$ 0,90 na bandeira vermelha 1 dá cerca de R$ 203,92.",
    "yes": [
      "Conta de luz ≈ **kWh × tarifa** (com impostos) **+ bandeira × kWh + CIP**. A bandeira 2026 soma por 100 kWh: verde R$ 0, amarela R$ 1,88, vermelha 1 R$ 4,46, vermelha 2 R$ 7,87. Para cortar a conta, o que mais pesa é reduzir o **consumo em kWh**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-18.",
    "answer": "A conta de luz é o consumo (kWh) × tarifa da distribuidora + o acréscimo da bandeira tarifária + a contribuição de iluminação pública. As bandeiras 2026 (ANEEL) somam por 100 kWh: verde R$ 0, amarela R$ 1,88, vermelha 1 R$ 4,46 e vermelha 2 R$ 7,87. Ex.: 200 kWh a R$ 0,90 na bandeira vermelha 1 dá cerca de R$ 203,92."
  },
  {
    "id": "c3",
    "label": "¿Cuánto ahorrás cambiando a electrodoméstico A+++?",
    "hint": "Esta calculadora mede a economia real de energia elétrica ao trocar um eletrodoméstico antigo (classe B, C ou inferior) por um modelo de alta eficiência A+++ (ou A). Utiliza a fórmula: Economia (R$/ano) = (kWh atual − kWh novo) × Tarifa (R$/kWh).",
    "yes": [
      "**Economia (R$/ano) = (kWh_atual − kWh_novo) × Tarifa_R$/kWh** — Ex.: (600 − 200) kWh × R$ 0,80 = **R$ 320/ano** economizados trocando uma geladeira classe D por um modelo A+++."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Esta calculadora mede a economia real de energia elétrica ao trocar um eletrodoméstico antigo (classe B, C ou inferior) por um modelo de alta eficiência A+++ (ou A). Utiliza a fórmula: Economia (R$/ano) = (kWh atual − kWh novo) × Tarifa (R$/kWh)."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__potenciaW",
    "label": "Consumo de Geladeira em kWh (Gasto Anual): Potência do compressor (W)",
    "type": "number",
    "value": 150,
    "thousands": false
  },
  {
    "id": "c1__dutyCycle",
    "label": "Consumo de Geladeira em kWh (Gasto Anual): Duty cycle — % do tempo ligada",
    "type": "number",
    "value": 40,
    "min": 10,
    "max": 100,
    "thousands": false,
    "help": "Percentual do tempo em que o compressor funciona (típico: 30–50%)."
  },
  {
    "id": "c1__tarifa",
    "label": "Consumo de Geladeira em kWh (Gasto Anual): Tarifa de energia (R$/kWh)",
    "type": "number",
    "value": 0.72,
    "thousands": false
  },
  {
    "id": "c2__consumoKwh",
    "label": "Calculadora de conta de luz (kWh e bandeira tarifária): Consumo do mês (kWh)",
    "type": "number",
    "value": 200,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Consumo registrado na conta, em quilowatt-hora."
  },
  {
    "id": "c2__tarifaKwh",
    "label": "Calculadora de conta de luz (kWh e bandeira tarifária): Tarifa por kWh (R$)",
    "type": "number",
    "value": 0.9,
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "Preço do kWh na sua conta, com impostos. Varia por distribuidora (~R$ 0,70 a R$ 1,00)."
  },
  {
    "id": "c2__bandeira",
    "label": "Calculadora de conta de luz (kWh e bandeira tarifária): Bandeira tarifária",
    "type": "select",
    "value": "verde",
    "options": [
      {
        "value": "verde",
        "label": "Verde (sem acréscimo)"
      },
      {
        "value": "amarela",
        "label": "Amarela (+R$ 1,88/100 kWh)"
      },
      {
        "value": "vermelha1",
        "label": "Vermelha 1 (+R$ 4,46/100 kWh)"
      },
      {
        "value": "vermelha2",
        "label": "Vermelha 2 (+R$ 7,87/100 kWh)"
      }
    ],
    "thousands": false,
    "help": "Bandeira vigente no mês, divulgada pela ANEEL."
  },
  {
    "id": "c2__cip",
    "label": "Calculadora de conta de luz (kWh e bandeira tarifária): Iluminação pública / CIP (R$)",
    "type": "number",
    "value": 0,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Opcional. Taxa fixa de iluminação pública cobrada pelo município na conta."
  },
  {
    "id": "c3__kwhClaseActual",
    "label": "¿Cuánto ahorrás cambiando a electrodoméstico A+++?: kWh/ano atual",
    "type": "number",
    "value": 600,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__kwhClaseNueva",
    "label": "¿Cuánto ahorrás cambiando a electrodoméstico A+++?: kWh/ano novo (A+++)",
    "type": "number",
    "value": 200,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__tarifa",
    "label": "¿Cuánto ahorrás cambiando a electrodoméstico A+++?: Tarifa R$/kWh",
    "type": "number",
    "value": 80,
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
    "q": "Qual é o consumo médio de uma geladeira frost-free no Brasil?",
    "a": "Segundo o PROCEL/INMETRO, geladeiras frost-free de 400–500 L consomem entre 35 e 55 kWh por mês, o que equivale a 420–660 kWh/ano. Na tarifa residencial média de R$ 0,72/kWh (ANEEL 2024), isso representa de R$ 302 a R$ 475 por ano apenas com a geladeira."
  },
  {
    "q": "O que é duty cycle e como ele afeta o cálculo?",
    "a": "O duty cycle é o percentual do tempo em que o compressor fica efetivamente ligado durante o dia. Uma geladeira com duty cycle de 40% tem o compressor funcionando 9,6 horas por dia. Geladeiras bem calibradas, sem excesso de alimentos quentes e com borrachas intactas ficam em torno de 30–45%; em dias quentes ou com porta mal vedada, pode subir para 60–70%, aumentando proporcionalmente o consumo."
  },
  {
    "q": "Como medir a potência real do compressor da minha geladeira?",
    "a": "A forma mais precisa é usar um **wattímetro** (medidor de consumo) plugado entre a tomada e a geladeira — custam entre R$ 30 e R$ 80. Ele mostra a potência instantânea (W) e o consumo acumulado (kWh). Conecte por pelo menos 48 horas para capturar múltiplos ciclos de degelo. A potência do compressor também consta no manual técnico ou na etiqueta interna da geladeira."
  },
  {
    "q": "A etiqueta INMETRO já mostra o consumo real?",
    "a": "A etiqueta PROCEL/INMETRO mostra o consumo medido em laboratório a 25 °C e sem carga de alimentos, conforme a norma ABNT NBR 7.256. Na prática, em residências com temperatura acima de 28–30 °C ou com a geladeira cheia, o consumo pode ser 10–25% maior. A etiqueta é uma referência comparativa, não uma promessa de consumo exato."
  },
  {
    "q": "Vale a pena trocar uma geladeira velha por um modelo inverter?",
    "a": "Em geral, sim. Uma geladeira convencional com 10 anos consome em média 30–50% mais do que um modelo inverter atual de mesma capacidade. Se a diferença for de 200 kWh/ano e a tarifa for R$ 0,72/kWh, a economia é de ~R$ 144/ano. Um modelo inverter novo custa entre R$ 2.500 e R$ 4.500; o payback pela economia de energia fica entre 17 e 31 anos — mas também conta a redução do risco de quebras e a valorização do imóvel."
  },
  {
    "q": "Qual é a tarifa de energia elétrica residencial média no Brasil?",
    "a": "Segundo a ANEEL (2024), a tarifa residencial média no Brasil fica em torno de **R$ 0,70 a R$ 0,75/kWh** (com todos os tributos — ICMS, PIS/COFINS, CIP). A tarifa varia por distribuidora e estado: em SP (ENEL/CPFL) gira em ~R$ 0,68/kWh; no RJ ~R$ 0,82/kWh; no AM (Amazonas Energia) pode superar R$ 1,00/kWh. Use sempre a tarifa da sua fatura para cálculos precisos."
  },
  {
    "q": "Geladeiras representam quanto da conta de luz residencial no Brasil?",
    "a": "De acordo com o PROCEL, a geladeira é responsável por cerca de **22% do consumo elétrico residencial médio** no Brasil — o maior consumidor individual entre os eletrodomésticos. Num domicílio que consome 250 kWh/mês, a geladeira responde por aproximadamente 55 kWh/mês (~R$ 39,60 na tarifa de R$ 0,72/kWh)."
  }
],
  sources: [
  {
    "name": "INMETRO – Programa de Etiquetagem (PBE): Tabelas de Consumo de Refrigeradores",
    "url": "https://www.inmetro.gov.br/consumidor/pbe/refrigeradores_freezers.asp"
  },
  {
    "name": "ANEEL – Tarifas de Energia Elétrica Residencial por Distribuidora",
    "url": "https://www.aneel.gov.br/tarifa-residencial"
  },
  {
    "name": "PROCEL/Eletrobras – Pesquisa de Posse e Hábitos de Uso de Equipamentos Elétricos (PPH)",
    "url": "https://eletrobras.com/pt/Paginas/PROCEL.aspx"
  },
  {
    "name": "ABNT NBR 7.256 – Aparelhos de refrigeração domésticos: método de ensaio",
    "url": "https://www.abntcatalogo.com.br/"
  },
  {
    "name": "ANEEL — Bandeiras tarifárias (valores e acionamento)",
    "url": "https://www.gov.br/aneel/pt-br/assuntos/tarifas/bandeiras-tarifarias"
  },
  {
    "name": "ANEEL — Calendário de bandeiras tarifárias 2026",
    "url": "https://www.gov.br/aneel/pt-br/assuntos/noticias/2026/bandeira-tarifaria-aneel-divulga-calendario-de-acionamento-para-2026"
  },
  {
    "name": "INMETRO – Etiqueta Nacional de Conservação de Energia (ENCE) e Produtos Certificados",
    "url": "https://www.inmetro.gov.br/consumidor/produtosPBE.asp"
  },
  {
    "name": "ANEEL – Tarifas de Energia Elétrica e Bandeiras Tarifárias",
    "url": "https://www.aneel.gov.br/bandeiras-tarifarias"
  },
  {
    "name": "Programa PROCEL – Eficiência Energética em Eletrodomésticos",
    "url": "http://www.procelinfo.com.br/main.asp?View=%7B5A08CAF7-C2AA-4ADE-A3A4-F6F0AE0ADE4E%7D"
  },
  {
    "name": "IBGE – IPCA: Índice de Preços ao Consumidor Amplo (energia elétrica residencial)",
    "url": "https://www.ibge.gov.br/explica/inflacao.php"
  },
  {
    "name": "US Department of Energy — Energy Saver",
    "url": "https://www.energystar.gov/products"
  },
  {
    "name": "IRS — Energy Efficient Home Improvement Credit (§25C)",
    "url": "https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit"
  },
  {
    "name": "EIA — Residential Electricity Rates",
    "url": "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a"
  },
  {
    "name": "INMETRO — Programa Brasileiro de Etiquetagem (eficiência energética)",
    "url": "https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem"
  },
  {
    "name": "IBGE — PNAD Contínua: Rendimento de todas as fontes 2023",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html"
  },
  {
    "name": "IRS — New Clean Vehicle Credit (Section 30D), end-date guidance",
    "url": "https://www.irs.gov/credits-deductions/credits-for-new-clean-vehicles-purchased-in-2023-or-after"
  },
  {
    "name": "IBGE – IPCA: Índice Nacional de Preços ao Consumidor Amplo",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/precos-custos-e-indices-de-precos/9173-indice-nacional-de-precos-ao-consumidor-amplo.html"
  },
  {
    "name": "IBGE — Pesquisa Nacional de Saúde: prática de atividade física e musculação no Brasil",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html"
  },
  {
    "name": "IBGE — Produção Agrícola Municipal (referência de culturas por região)",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9117-producao-agricola-municipal-culturas-temporarias-e-permanentes.html"
  },
  {
    "name": "IBGE – Pesquisa de Orçamentos Familiares (POF): Consumo Alimentar",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9050-pesquisa-de-orcamentos-familiares.html"
  },
  {
    "name": "IBGE — Rede Gravimétrica Fundamental Brasileira",
    "url": "https://www.ibge.gov.br/geociencias/informacoes-sobre-posicionamento-geodesico/geodesia/10988-rede-gravimetrica-fundamental-brasileira.html"
  },
  {
    "name": "IBGE — Inventário Nacional de Emissões de Gases de Efeito Estufa",
    "url": "https://www.ibge.gov.br/explica/emissoes-de-carbono.php"
  },
  {
    "name": "IBGE — Censo Demográfico 2022: Taxa de Crescimento Geométrico Anual",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html"
  },
  {
    "name": "IBGE — Síntese de Indicadores Sociais (linhas de pobreza)",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html"
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
    "name": "IBGE — Pesquisa de Orçamentos Familiares (POF) 2017–2018",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html"
  },
  {
    "name": "IBGE – Produção da Extração Vegetal e da Silvicultura (PEVS)",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9105-producao-da-extracao-vegetal-e-da-silvicultura.html"
  },
  {
    "name": "IBGE — Classificação Climática do Brasil (Koppen-Geiger)",
    "url": "https://www.ibge.gov.br/geociencias/informacoes-ambientais/climatologia.html"
  },
  {
    "name": "IBGE — Métodos Quantitativos (Noções de Estatística)",
    "url": "https://www.ibge.gov.br/apps/snig/v1/notas_metodologicas.html"
  }
],
  replaces: [
    '/pt/consumo-geladeira-anual-kwh', // Absorbida como caso calculable con formulaId consumo-heladera-anual-kwh.
    '/pt/conta-de-luz-kwh-bandeira-tarifaria', // Absorbida como caso calculable con formulaId conta-de-luz-kwh-bandeira-tarifaria.
    '/pt/economia-eletrodomestico-eficiencia', // Absorbida como caso calculable con formulaId energia-electrodomestico-etiqueta-eficiencia.
  ],
  lastReviewed: '2026-07-28',
};
