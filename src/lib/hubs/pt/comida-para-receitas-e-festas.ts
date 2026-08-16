import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/vida/comida-para-receitas-e-festas',
  title: "Churrasco: gramas de carne por pessoa e porções de festa",
  description: "Gramas de carne por pessoa no churrasco, porções de bolo por forma, hambúrgueres e sushi por convidado e conversor de cups para gramas nas receitas.",
  silo: "Receitas e festas",
  siloHref: '/pt/vida',
  locale: 'pt',
  eyebrow: "Brasil · Receitas e festas",
  h1: "Quanto de comida preciso preparar para a festa ou a receita?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 10 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['10 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Quantidade de Bolo de Casamento por Convidado",
    "hint": "Confeitarias brasileiras seguem uma regra consagrada: 100 gramas de bolo por convidado em casamentos, e 8 a 10 doces finos por pessoa (brigadeiro gourmet, beijinho, bem-casado, camafeu, etc.). Isso assegura que todo mundo prove o bolo dos noivos e leve doces pra casa.",
    "yes": [
      "**Bolo de casamento = 100 g × número de convidados** (150 convidados = 15 kg). **Doces finos = 8 a 10 unidades por pessoa**, incluindo o bem-casado. Ajuste para cima em festas noturnas longas ou com mesa de doces como atração; para baixo se houver sobremesa servida no jantar."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-22.",
    "answer": "Confeitarias brasileiras seguem uma regra consagrada: 100 gramas de bolo por convidado em casamentos, e 8 a 10 doces finos por pessoa (brigadeiro gourmet, beijinho, bem-casado, camafeu, etc.). Isso assegura que todo mundo prove o bolo dos noivos e leve doces pra casa."
  },
  {
    "id": "c2",
    "label": "Quanto Café Moído por Xícara (por Método de Preparo)",
    "hint": "Para V60 ou coador, use 15–16 g de café por xícara de 250 mL (proporção 1:16). Prensa francesa: 16,7 g/xícara (1:15). Espresso: 15 g por dose de 30 mL (brew ratio 1:2). Coador automático: cerca de 10 g por xícara de 177 mL (1:17). A proporção de ouro da SCA é 55 g por litro (≈1:18) — ajuste ao seu gosto.",
    "yes": [
      "**Espresso: 15 g por dose · V60 (2 xícaras de 250 mL): 31,3 g · Prensa francesa (3 xícaras): 50 g · Cold Brew concentrado (4 xícaras): 120 g**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "Para V60 ou coador, use 15–16 g de café por xícara de 250 mL (proporção 1:16). Prensa francesa: 16,7 g/xícara (1:15). Espresso: 15 g por dose de 30 mL (brew ratio 1:2). Coador automático: cerca de 10 g por xícara de 177 mL (1:17). A proporção de ouro da SCA é 55 g por litro (≈1:18) — ajuste ao seu gosto."
  },
  {
    "id": "c3",
    "label": "Quanto chocolate preciso para fazer bombons caseiros?",
    "hint": "Para calcular o chocolate para bombons, use: **Cobertura bruta (g) = (Peso do bombom × (1 − % recheio) × Quantidade) ÷ (1 − % perda na temperagem)**. Exemplo: 50 bombons de 18 g com 45 % de recheio e 6 % de perda = (18 × 0,55 × 50) ÷ 0,94 = **527 g a pesar antes de temperar**. Sempre adicione 6–8 % de perda para produção caseira, pois o chocolate gruda na tigela e nas espátulas durante a temperagem.",
    "yes": [
      "**Cobertura a pesar (g) = (Peso do bombom × (1 − % recheio) × Quantidade) ÷ (1 − % perda)** → Exemplo: 50 bombons de 18 g, 45 % de recheio, 6 % de perda → (18 × 0,55 × 50) ÷ 0,94 = **527 g a pesar antes de temperar**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "Para calcular o chocolate para bombons, use: **Cobertura bruta (g) = (Peso do bombom × (1 − % recheio) × Quantidade) ÷ (1 − % perda na temperagem)**. Exemplo: 50 bombons de 18 g com 45 % de recheio e 6 % de perda = (18 × 0,55 × 50) ÷ 0,94 = **527 g a pesar antes de temperar**. Sempre adicione 6–8 % de perda para produção caseira, pois o chocolate gruda na tigela e nas espátulas durante a temperagem."
  },
  {
    "id": "c4",
    "label": "Conversão de Colher de Chá para Gramas — Sal, Açúcar, Especiarias",
    "hint": "1 colher de chá rasa de sal refinado = 6 g. Açúcar refinado = 4 g/colher. Bicarbonato de sódio = 4,8 g/colher. Fermento em pó = 4 g/colher. Orégano seco = 1 g/colher. Canela em pó = 2,6 g/colher. Farinha de trigo = 3 g/colher. Fórmula: gramas = colheres × gramas por colher (específico ao ingrediente — NÃO um valor fixo de 5 g).",
    "yes": [
      "**Fórmula: Gramas = colheres de chá × gramas por colher (específico ao ingrediente)**. O valor genérico '1 colher de chá = 5 g' está ERRADO para a maioria dos ingredientes. Valores chave: sal 6 g, açúcar 4 g, farinha 3 g, bicarbonato 4,8 g, orégano 1 g."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "1 colher de chá rasa de sal refinado = 6 g. Açúcar refinado = 4 g/colher. Bicarbonato de sódio = 4,8 g/colher. Fermento em pó = 4 g/colher. Orégano seco = 1 g/colher. Canela em pó = 2,6 g/colher. Farinha de trigo = 3 g/colher. Fórmula: gramas = colheres × gramas por colher (específico ao ingrediente — NÃO um valor fixo de 5 g)."
  },
  {
    "id": "c5",
    "label": "Conversor Cups para Gramas — Farinha, Açúcar, Óleo e 18 Ingredientes",
    "hint": "1 cup de farinha de trigo (peneirada) = 120 g. 1 cup de açúcar refinado = 200 g. 1 cup de óleo vegetal = 220 g. Fórmula: Gramas = Cups × Fator de densidade (g/cup). A xícara americana (US cup) tem 240 mL; a xícara de chá brasileira tem 200 mL — diferença de 20%.",
    "yes": [
      "**Gramas = Xícaras × fator do ingrediente** — Ex.: 2 xícaras de farinha = 2 × 120 g = **240 g**; 1 xícara de açúcar refinado = **200 g**; 1 xícara de óleo vegetal = **220 g**. A xícara padrão americana tem 240 mL; a xícara de chá brasileira tem 200 mL — diferença de 20%."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "1 cup de farinha de trigo (peneirada) = 120 g. 1 cup de açúcar refinado = 200 g. 1 cup de óleo vegetal = 220 g. Fórmula: Gramas = Cups × Fator de densidade (g/cup). A xícara americana (US cup) tem 240 mL; a xícara de chá brasileira tem 200 mL — diferença de 20%."
  },
  {
    "id": "c6",
    "label": "Gramas de Carne por Pessoa no Churrasco",
    "hint": "Fazer churrasco sem calcular direito é um risco clássico: ou sobra meia geladeira ou falta no meio da festa. A regra prática brasileira para uma festa padrão (tarde/noite com bebidas): 400g de picanha, 150g de linguiça, 200g de frango e 2 pães de alho por adulto. Crianças consomem metade.",
    "yes": [
      "**Churrasco padrão brasileiro**: 400g de picanha + 150g de linguiça + 200g de frango + 2 pães de alho por adulto — cerca de **750g de carne por pessoa**. Crianças contam como metade. Compre **10-15% a mais** como margem de segurança: sobra vira marmita, falta vira vexame."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-22.",
    "answer": "Fazer churrasco sem calcular direito é um risco clássico: ou sobra meia geladeira ou falta no meio da festa. A regra prática brasileira para uma festa padrão (tarde/noite com bebidas): 400g de picanha, 150g de linguiça, 200g de frango e 2 pães de alho por adulto. Crianças consomem metade."
  },
  {
    "id": "c7",
    "label": "Calculadora de Porções de Bolo por Tamanho da Forma",
    "hint": "Um bolo redondo de 24 cm rende 24 porções de festa ou 35 porções de casamento. A fórmula: Porções = Área de superfície (cm²) ÷ Base da porção (cm²). Porção de festa = 1.5\" × 2\" = 19,4 cm². Porção de casamento = 1\" × 2\" = 12,9 cm². A altura do bolo NÃO afeta o número de porções — apenas a área de superfície importa (padrão Wilton).",
    "yes": [
      "**Porções = Área de superfície (cm²) ÷ Base da porção (cm²).** Porção de festa = 1.5\" × 2\" ≈ 19,4 cm² | Casamento = 1\" × 2\" ≈ 12,9 cm² | Festa infantil = 1\" × 1.5\" ≈ 9,7 cm². Exemplo: bolo redondo de 26 cm → área 531 cm² ÷ 19,4 = **27 porções de festa**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "Um bolo redondo de 24 cm rende 24 porções de festa ou 35 porções de casamento. A fórmula: Porções = Área de superfície (cm²) ÷ Base da porção (cm²). Porção de festa = 1.5\" × 2\" = 19,4 cm². Porção de casamento = 1\" × 2\" = 12,9 cm². A altura do bolo NÃO afeta o número de porções — apenas a área de superfície importa (padrão Wilton)."
  },
  {
    "id": "c8",
    "label": "Porções de sushi por pessoa",
    "hint": "Esta calculadora diz quantas peças de sushi pedir conforme o número de pessoas, se há crianças na mesa e o tipo de refeição: 6 peças por adulto como entrada, 11 na refeição principal e 18 em degustação ampla ou rodízio, sempre com 10% de reserva. Crianças até 12 anos contam à parte (4, 7 ou 10 peças). Um roll padrão tem 8 peças. Exemplo: 4 adultos + 2 crianças no jantar → 64 peças ≈ 8 rolls.",
    "yes": [
      "Refeição principal: **11 peças por adulto e 7 por criança**, +10% de reserva. Entrada/petisco: 6 e 4. Degustação ampla ou rodízio: 18 e 10. Exemplo: 4 adultos + 2 crianças no jantar → (4×11)+(2×7) = 58 → com a reserva, **64 peças ≈ 8 rolls de 8**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-24.",
    "answer": "Esta calculadora diz quantas peças de sushi pedir conforme o número de pessoas, se há crianças na mesa e o tipo de refeição: 6 peças por adulto como entrada, 11 na refeição principal e 18 em degustação ampla ou rodízio, sempre com 10% de reserva. Crianças até 12 anos contam à parte (4, 7 ou 10 peças). Um roll padrão tem 8 peças. Exemplo: 4 adultos + 2 crianças no jantar → 64 peças ≈ 8 rolls."
  },
  {
    "id": "c9",
    "label": "Quantos Hambúrgueres por Pessoa para uma Festa?",
    "hint": "A regra padrão: **2 hambúrgueres por adulto** quando é o prato principal, **1,5** quando há outras proteínas (linguiça, frango), e **2,5** quando o hambúrguer é o único alimento. Para crianças com menos de 12 anos: 1,5 (prato principal) ou 1,0 (cardápio misto). Sempre adicione **15% de margem** para imprevistos. Exemplo: 20 adultos, prato principal → 20 × 2 × 1,15 = **46 hambúrgueres** (≈ 5,5 kg de carne moída a 120 g/disco).",
    "yes": [
      "**Fórmula: adultos × 2 + crianças × 1,5 + 15% de margem (prato principal)**. Exemplo: 15 adultos e 8 crianças → (15×2 + 8×1,5) × 1,15 = 42 × 1,15 = **49 hambúrgueres** (≈ 5,9 kg de carne moída a 120 g/disco)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "A regra padrão: **2 hambúrgueres por adulto** quando é o prato principal, **1,5** quando há outras proteínas (linguiça, frango), e **2,5** quando o hambúrguer é o único alimento. Para crianças com menos de 12 anos: 1,5 (prato principal) ou 1,0 (cardápio misto). Sempre adicione **15% de margem** para imprevistos. Exemplo: 20 adultos, prato principal → 20 × 2 × 1,15 = **46 hambúrgueres** (≈ 5,5 kg de carne moída a 120 g/disco)."
  },
  {
    "id": "c10",
    "label": "Tempos de cozimento de verduras no vapor e em água fervente",
    "hint": "Tempos de cozimento mais comuns: brócolis no vapor 4–6 min (fervido 5–8 min), cenoura fatiada 5–8 min no vapor (5–10 min fervida), espinafre 2–3 min (qualquer método), batata em cubos fervida 12–18 min, vagem 5–8 min. O vapor demora 20–30% a mais que a fervura, mas preserva mais vitaminas. Sempre conte o tempo a partir do momento em que a água retoma a fervura.",
    "yes": [
      "O tempo de cozimento depende do vegetal e do método. No vapor, o tempo é geralmente **20–30 % maior** do que em água fervente para o mesmo vegetal e corte. Folhas como espinafre e couve ficam prontas em **2–5 minutos**; raízes densas como beterraba e batata inteira podem levar **25–45 minutos**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-19.",
    "answer": "Tempos de cozimento mais comuns: brócolis no vapor 4–6 min (fervido 5–8 min), cenoura fatiada 5–8 min no vapor (5–10 min fervida), espinafre 2–3 min (qualquer método), batata em cubos fervida 12–18 min, vagem 5–8 min. O vapor demora 20–30% a mais que a fervura, mas preserva mais vitaminas. Sempre conte o tempo a partir do momento em que a água retoma a fervura."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__numeroConvidados",
    "label": "Quantidade de Bolo de Casamento por Convidado: Número de convidados",
    "type": "number",
    "value": 150,
    "min": 1,
    "max": 2000,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__doceFinoPorPessoa",
    "label": "Quantidade de Bolo de Casamento por Convidado: Doces finos por pessoa",
    "type": "number",
    "value": 9,
    "min": 4,
    "max": 15,
    "step": 1,
    "thousands": false,
    "help": "Padrão: 8-10 unidades. Ajuste conforme estilo da festa"
  },
  {
    "id": "c2__metodo",
    "label": "Quanto Café Moído por Xícara (por Método de Preparo): Método de preparo",
    "type": "select",
    "value": "espresso",
    "options": [
      {
        "value": "espresso",
        "label": "Espresso (30 mL, brew ratio 1:2)"
      },
      {
        "value": "espresso-doble",
        "label": "Espresso duplo (60 mL, brew ratio 1:2)"
      },
      {
        "value": "moka",
        "label": "Moka / cafeteira italiana (60 mL, proporção 1:10)"
      },
      {
        "value": "aeropress",
        "label": "AeroPress (220 mL, proporção 1:15)"
      },
      {
        "value": "v60",
        "label": "Pour-over / V60 / Chemex (250 mL, proporção 1:16)"
      },
      {
        "value": "french-press",
        "label": "Prensa francesa (250 mL, proporção 1:15)"
      },
      {
        "value": "drip",
        "label": "Coador automático / drip (177 mL, proporção 1:17)"
      },
      {
        "value": "cold-brew",
        "label": "Cold Brew concentrado (240 mL, proporção 1:8)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__tazas",
    "label": "Quanto Café Moído por Xícara (por Método de Preparo): Número de xícaras",
    "type": "number",
    "value": 2,
    "min": 1,
    "max": 50,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c3__cantidad",
    "label": "Quanto chocolate preciso para fazer bombons caseiros?: Quantidade de bombons",
    "type": "number",
    "value": 50,
    "min": 1,
    "max": 10000,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c3__peso",
    "label": "Quanto chocolate preciso para fazer bombons caseiros?: Peso por bombom",
    "type": "number",
    "value": 18,
    "min": 5,
    "max": 200,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c3__relleno",
    "label": "Quanto chocolate preciso para fazer bombons caseiros?: Percentual de recheio",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 80,
    "step": 5,
    "thousands": false,
    "help": "0 % = bombom sólido. 40–50 % = bombom com ganache, brigadeiro ou praliné típico."
  },
  {
    "id": "c3__merma",
    "label": "Quanto chocolate preciso para fazer bombons caseiros?: Perda na temperagem",
    "type": "number",
    "value": 6,
    "min": 0,
    "max": 20,
    "step": 1,
    "thousands": false,
    "help": "Chocolate perdido na tigela e na pedra durante a temperagem. Caseiro: 6–8 %. Profissional: 4–6 %."
  },
  {
    "id": "c4__ingrediente",
    "label": "Conversão de Colher de Chá para Gramas — Sal, Açúcar, Especiarias: Ingrediente",
    "type": "select",
    "value": "sal_fina",
    "options": [
      {
        "value": "sal_fina",
        "label": "Sal refinado (6 g/colher)"
      },
      {
        "value": "sal_gruesa",
        "label": "Sal grosso / marinho (4,5 g/colher)"
      },
      {
        "value": "sal_escamas",
        "label": "Sal em flocos — Maldon (2,8 g/colher)"
      },
      {
        "value": "azucar_blanca",
        "label": "Açúcar refinado (4 g/colher)"
      },
      {
        "value": "azucar_impalpable",
        "label": "Açúcar de confeiteiro (3 g/colher)"
      },
      {
        "value": "azucar_morena",
        "label": "Açúcar mascavo (4,5 g/colher)"
      },
      {
        "value": "harina_comun",
        "label": "Farinha de trigo (3 g/colher)"
      },
      {
        "value": "bicarbonato",
        "label": "Bicarbonato de sódio (4,8 g/colher)"
      },
      {
        "value": "polvo_hornear",
        "label": "Fermento em pó químico (4 g/colher)"
      },
      {
        "value": "levadura_seca",
        "label": "Fermento biológico seco (3 g/colher)"
      },
      {
        "value": "pimienta",
        "label": "Pimenta-do-reino moída (2 g/colher)"
      },
      {
        "value": "canela",
        "label": "Canela em pó (2,6 g/colher)"
      },
      {
        "value": "oregano",
        "label": "Orégano seco (1 g/colher)"
      },
      {
        "value": "cafe",
        "label": "Café moído (2 g/colher)"
      },
      {
        "value": "cacao",
        "label": "Cacau em pó (2,6 g/colher)"
      },
      {
        "value": "almidon",
        "label": "Amido de milho — maisena (2,5 g/colher)"
      },
      {
        "value": "curcuma",
        "label": "Cúrcuma em pó (3 g/colher)"
      },
      {
        "value": "comino",
        "label": "Cominho moído (2,5 g/colher)"
      },
      {
        "value": "pimenton",
        "label": "Páprica / colorau (2,5 g/colher)"
      },
      {
        "value": "aji_molido",
        "label": "Pimenta vermelha moída (2 g/colher)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c4__cucharaditas",
    "label": "Conversão de Colher de Chá para Gramas — Sal, Açúcar, Especiarias: Quantidade (colheres de chá rasas)",
    "type": "number",
    "value": 15,
    "min": 0,
    "max": 100,
    "step": 0.25,
    "thousands": false
  },
  {
    "id": "c5__cups",
    "label": "Conversor Cups para Gramas — Farinha, Açúcar, Óleo e 18 Ingredientes: Quantidade de xícaras",
    "type": "number",
    "value": 2.25,
    "min": 0,
    "max": 100,
    "step": 0.25,
    "thousands": false
  },
  {
    "id": "c5__ingredient",
    "label": "Conversor Cups para Gramas — Farinha, Açúcar, Óleo e 18 Ingredientes: Ingrediente",
    "type": "select",
    "value": "harina_0000",
    "options": [
      {
        "value": "harina_0000",
        "label": "Farinha de trigo (peneirada)"
      },
      {
        "value": "harina_leudante",
        "label": "Farinha com fermento"
      },
      {
        "value": "harina_integral",
        "label": "Farinha integral"
      },
      {
        "value": "harina_almendras",
        "label": "Farinha de amêndoas"
      },
      {
        "value": "azucar_blanca",
        "label": "Açúcar refinado"
      },
      {
        "value": "azucar_morena",
        "label": "Açúcar mascavo (compactado)"
      },
      {
        "value": "azucar_impalpable",
        "label": "Açúcar de confeiteiro"
      },
      {
        "value": "cacao_polvo",
        "label": "Cacau em pó (peneirado)"
      },
      {
        "value": "aceite_vegetal",
        "label": "Óleo vegetal (soja/milho)"
      },
      {
        "value": "aceite_oliva",
        "label": "Azeite de oliva extra virgem"
      },
      {
        "value": "manteca_solida",
        "label": "Manteiga (sólida)"
      },
      {
        "value": "leche_entera",
        "label": "Leite integral"
      },
      {
        "value": "miel",
        "label": "Mel"
      },
      {
        "value": "avena_fina",
        "label": "Aveia em flocos finos"
      },
      {
        "value": "avena_gruesa",
        "label": "Aveia em flocos grossos"
      },
      {
        "value": "chips_chocolate",
        "label": "Gotas de chocolate"
      },
      {
        "value": "coco_rallado",
        "label": "Coco ralado seco"
      },
      {
        "value": "arroz_crudo",
        "label": "Arroz cru"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__adultos",
    "label": "Gramas de Carne por Pessoa no Churrasco: Número de adultos",
    "type": "number",
    "value": 15,
    "min": 0,
    "max": 500,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c6__criancas",
    "label": "Gramas de Carne por Pessoa no Churrasco: Número de crianças",
    "type": "number",
    "value": 0,
    "min": 0,
    "max": 500,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__shape",
    "label": "Calculadora de Porções de Bolo por Tamanho da Forma: Formato da forma",
    "type": "select",
    "value": "round",
    "options": [
      {
        "value": "round",
        "label": "Redonda (circular)"
      },
      {
        "value": "square",
        "label": "Quadrada"
      },
      {
        "value": "rect",
        "label": "Retangular"
      }
    ],
    "thousands": false
  },
  {
    "id": "c7__diametro",
    "label": "Calculadora de Porções de Bolo por Tamanho da Forma: Diâmetro da forma (cm)",
    "type": "number",
    "value": 24,
    "min": 10,
    "max": 80,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__lado",
    "label": "Calculadora de Porções de Bolo por Tamanho da Forma: Lado da forma (cm)",
    "type": "number",
    "value": 24,
    "min": 10,
    "max": 80,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__largo",
    "label": "Calculadora de Porções de Bolo por Tamanho da Forma: Comprimento da forma (cm)",
    "type": "number",
    "value": 35,
    "min": 10,
    "max": 80,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__ancho",
    "label": "Calculadora de Porções de Bolo por Tamanho da Forma: Largura da forma (cm)",
    "type": "number",
    "value": 25,
    "min": 10,
    "max": 80,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__portion",
    "label": "Calculadora de Porções de Bolo por Tamanho da Forma: Tipo de porção",
    "type": "select",
    "value": "party",
    "options": [
      {
        "value": "party",
        "label": "Festa/aniversário (1.5\" × 2\" ≈ 19,4 cm²)"
      },
      {
        "value": "wedding",
        "label": "Casamento/evento formal (1\" × 2\" ≈ 12,9 cm²)"
      },
      {
        "value": "child",
        "label": "Festa infantil (1\" × 1.5\" ≈ 9,7 cm²)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c8__personas",
    "label": "Porções de sushi por pessoa: Total de pessoas (adultos + crianças)",
    "type": "number",
    "value": 6,
    "min": 1,
    "max": 200,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c8__nivelHambre",
    "label": "Porções de sushi por pessoa: Tipo de refeição",
    "type": "select",
    "value": "principal",
    "options": [
      {
        "value": "entrada",
        "label": "Entrada / petisco — 6 peças por adulto"
      },
      {
        "value": "principal",
        "label": "Refeição principal — 11 peças por adulto"
      },
      {
        "value": "degustacion",
        "label": "Degustação ampla / rodízio — 18 peças por adulto"
      }
    ],
    "thousands": false
  },
  {
    "id": "c8__ninos",
    "label": "Porções de sushi por pessoa: Crianças incluídas no total (até 12 anos)",
    "type": "number",
    "value": 0,
    "min": 0,
    "max": 100,
    "step": 1,
    "thousands": false,
    "help": "Crianças comem menos: 4 peças (entrada), 7 (refeição principal) ou 10 (degustação). São descontadas do total de pessoas."
  },
  {
    "id": "c8__precioPorPieza",
    "label": "Porções de sushi por pessoa: Preço por peça (R$) — opcional",
    "type": "number",
    "value": 0,
    "prefix": "R$",
    "min": 0,
    "step": 0.5,
    "thousands": false,
    "help": "Divida o preço do combinado pelo número de peças para obter o preço unitário. A calculadora multiplica pelo total e estima o custo."
  },
  {
    "id": "c9__adultos",
    "label": "Quantos Hambúrgueres por Pessoa para uma Festa?: Adultos e adolescentes",
    "type": "number",
    "value": 15,
    "min": 0,
    "max": 500,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c9__ninos",
    "label": "Quantos Hambúrgueres por Pessoa para uma Festa?: Crianças (menos de 12 anos)",
    "type": "number",
    "value": 0,
    "min": 0,
    "max": 200,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c9__rol",
    "label": "Quantos Hambúrgueres por Pessoa para uma Festa?: Papel do hambúrguer no cardápio",
    "type": "select",
    "value": "principal",
    "options": [
      {
        "value": "principal",
        "label": "Prato principal (sem outras proteínas)"
      },
      {
        "value": "compartido",
        "label": "Cardápio misto (+ linguiça, frango, carne)"
      },
      {
        "value": "solo",
        "label": "Prato único (sem acompanhamentos quentes)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c9__peso_medallon",
    "label": "Quantos Hambúrgueres por Pessoa para uma Festa?: Peso do disco cru",
    "type": "select",
    "value": "120",
    "options": [
      {
        "value": "90",
        "label": "90 g — Disco industrial pequeno"
      },
      {
        "value": "100",
        "label": "100 g — Disco industrial padrão ou caseiro pequeno"
      },
      {
        "value": "120",
        "label": "120 g — Caseiro padrão (recomendado)"
      },
      {
        "value": "150",
        "label": "150 g — Caseiro gourmet / grande"
      }
    ],
    "thousands": false
  },
  {
    "id": "c10__v1",
    "label": "Tempos de cozimento de verduras no vapor e em água fervente: Verdura / Legume",
    "type": "select",
    "value": "asparagus",
    "options": [
      {
        "value": "asparagus",
        "label": "Aspargos"
      },
      {
        "value": "beetroot",
        "label": "Beterraba"
      },
      {
        "value": "broccoli",
        "label": "Brócolis"
      },
      {
        "value": "brussels_sprouts",
        "label": "Couve-de-Bruxelas"
      },
      {
        "value": "cabbage",
        "label": "Repolho"
      },
      {
        "value": "carrot",
        "label": "Cenoura"
      },
      {
        "value": "cauliflower",
        "label": "Couve-flor"
      },
      {
        "value": "corn",
        "label": "Milho (em grão)"
      },
      {
        "value": "eggplant",
        "label": "Berinjela"
      },
      {
        "value": "green_beans",
        "label": "Vagem"
      },
      {
        "value": "kale",
        "label": "Couve"
      },
      {
        "value": "leek",
        "label": "Alho-poró"
      },
      {
        "value": "peas",
        "label": "Ervilha (fresca)"
      },
      {
        "value": "potato_cubed",
        "label": "Batata (cubos)"
      },
      {
        "value": "potato_whole",
        "label": "Batata (inteira, média)"
      },
      {
        "value": "spinach",
        "label": "Espinafre"
      },
      {
        "value": "sweet_corn",
        "label": "Espiga de milho"
      },
      {
        "value": "sweet_potato",
        "label": "Batata-doce"
      },
      {
        "value": "turnip",
        "label": "Nabo"
      },
      {
        "value": "zucchini",
        "label": "Abobrinha"
      }
    ],
    "thousands": false
  },
  {
    "id": "c10__v2",
    "label": "Tempos de cozimento de verduras no vapor e em água fervente: Método de cozimento",
    "type": "select",
    "value": "1",
    "options": [
      {
        "value": "1",
        "label": "No vapor (cesta/panela a vapor)"
      },
      {
        "value": "2",
        "label": "Fervido (água fervente)"
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
    "q": "Quantos kg de bolo para 100 convidados?",
    "a": "Cerca de 10 kg, aplicando a regra de 100 g por convidado usada pelas confeitarias brasileiras. Se o perfil dos convidados for mais guloso, se a festa for longa ou se o bolo for a única sobremesa, suba para 12 kg. Lembre de confirmar com o confeiteiro quantos andares de massa real esse peso exige — em média, um bolo de 3 andares reais atende bem 100 pessoas."
  },
  {
    "q": "Quantos doces finos por pessoa?",
    "a": "O padrão de mercado é de 8 a 10 unidades por convidado, o que já inclui o bem-casado de lembrancinha. Festas noturnas com open bar e mesa de doces farta pedem de 10 a 12 por pessoa, porque o consumo dispara depois da pista de dança abrir. Se o buffet servir sobremesa empratada no jantar, 8 unidades por pessoa costumam ser suficientes."
  },
  {
    "q": "Bolo de casamento tem andares fake?",
    "a": "Sim, é uma prática comum e legítima: 1 ou 2 andares cenográficos (de isopor decorado) dão altura e impacto visual na foto, enquanto a massa real fica nos andares de baixo ou em bolos de cozinha servidos na copa. Sempre confirme no contrato quantos quilos são de massa real — o cálculo dos 100 g por convidado vale só para o bolo comestível."
  },
  {
    "q": "Quais sabores são mais pedidos?",
    "a": "Chocolate com morango, baunilha com doce de leite, red velvet e ninho com Nutella lideram os pedidos nas confeitarias brasileiras. O mais comum é dividir o bolo em 2 ou 3 sabores, um por andar, para agradar perfis diferentes de convidados. Evite sabores muito polarizantes (como maracujá ou café) como sabor único — funcionam melhor como segundo ou terceiro andar."
  },
  {
    "q": "Bem-casado conta como doce fino?",
    "a": "Sim. O tradicional é reservar 1 bem-casado por convidado como lembrancinha de saída, e ele entra na conta das 8 a 10 unidades por pessoa. Se você quiser bem-casado na mesa E de lembrança, some 1 unidade extra por convidado ao total. Como o bem-casado costuma custar mais caro que o brigadeiro, esse detalhe muda o orçamento — negocie o cento separadamente."
  },
  {
    "q": "Meus convidados são doceiros. Peço mais?",
    "a": "Sim, aumente para 10 a 12 doces por pessoa e considere 110-120 g de bolo por convidado. O custo marginal de encomendar 10-15% a mais é baixo comparado ao constrangimento de mesa vazia às 23h. Vale a regra de ouro dos buffets: é sempre melhor sobrar um pouco (dá para distribuir em caixinhas no fim) do que faltar no auge da festa."
  },
  {
    "q": "Quanto custa o kg de bolo de casamento no Brasil?",
    "a": "Entre R$ 200 e R$ 500 por kg em 2026, dependendo da cidade, da reputação da confeitaria e do nível de decoração (pasta americana e flores naturais encarecem). Doces finos saem entre R$ 8 e R$ 15 a unidade. Para 150 convidados, isso significa algo entre R$ 3.000 e R$ 7.500 só de bolo, mais R$ 10.800 a R$ 20.250 de doces no padrão de 9 por pessoa."
  },
  {
    "q": "Faço um bolo cenográfico inteiro e coloco docinhos separados?",
    "a": "É uma opção válida e econômica: o bolo 100% cenográfico serve para a foto e o corte simbólico (alguns têm um compartimento com fatia real para o ritual), enquanto bolos de cozinha simples são fatiados na copa. Nesse formato, reforce a mesa para 12 a 15 doces por pessoa, já que os doces assumem o papel de sobremesa principal da festa."
  },
  {
    "q": "Com quanta antecedência devo encomendar o bolo?",
    "a": "Confeitarias de casamento trabalham com agenda: reserve a data com 3 a 6 meses de antecedência (boas casas fecham a agenda de sábados concorridos antes disso) e confirme o número final de convidados e sabores 15 a 20 dias antes do evento. A degustação costuma acontecer no fechamento do contrato — aproveite para definir quantos andares serão de massa real."
  },
  {
    "q": "Quantos gramas de café moído por xícara no coador V60?",
    "a": "Com a proporção padrão SCA 1:16, use **15,6 g de café de moagem média por xícara de 250 mL**. Para 2 xícaras, isso dá 31,3 g; para 4 xícaras, 62,5 g. Para um café mais suave, tente 1:17 (14,7 g/xícara); para mais forte, use 1:15 (16,7 g/xícara)."
  },
  {
    "q": "Quanto café moído usar no coador automático (drip) por xícara?",
    "a": "Para coador automático, use cerca de **10,4 g por xícara de 177 mL** na proporção padrão 1:17. Isso equivale a aproximadamente 2 colheres de sopa rasas por xícara. Uma cafeteira de 12 xícaras (12 × 177 mL = 2.124 mL) requer cerca de 125 g (≈22–24 colheres) de café de moagem média."
  },
  {
    "q": "Quantos gramas de café por xícara na prensa francesa?",
    "a": "A prensa francesa usa proporção **1:15: são 16,7 g por xícara de 250 mL** (moagem grossa). Para 2 xícaras, meça 33,3 g; para 4 xícaras, 66,7 g. Deixe em infusão por 4 minutos antes de pressionar o êmbolo. Nunca use moagem fina — entopirá o filtro metálico e sobreextrairá o café."
  },
  {
    "q": "Qual é a proporção de ouro recomendada pela SCA?",
    "a": "A Specialty Coffee Association (SCA) recomenda **55 g de café por litro de água** (proporção ≈ 1:18) como base. O range de extração ideal é 18–22% de sólidos totais dissolvidos (TDS 1,15–1,45%). Na prática doméstica, a maioria dos baristas trabalha entre 1:15 e 1:17."
  },
  {
    "q": "Quantos gramas de café vão em um espresso simples?",
    "a": "Os padrões modernos de café de especialidade indicam **15–18 g de café** (cesta dupla) para uma extração de 30–36 g de líquido (brew ratio 1:2). Espresso simples clássico usa 7–9 g. Esta calculadora usa 15 g para espresso simples (30 mL de extração, brew ratio 1:2), alinhado com o padrão specialty."
  }
],
  sources: [
  {
    "name": "ABRASEL — Associação Brasileira de Bares e Restaurantes",
    "url": "https://abrasel.com.br"
  },
  {
    "name": "Sebrae — Festas e eventos",
    "url": "https://sebrae.com.br"
  },
  {
    "name": "Gov.br — Orientações para eventos",
    "url": "https://www.gov.br/pt-br"
  },
  {
    "name": "Specialty Coffee Association — Coffee Standards and Golden Ratio",
    "url": "https://sca.coffee/research/coffee-standards"
  },
  {
    "name": "ABIC — Associação Brasileira das Indústrias de Café",
    "url": "https://www.abic.com.br"
  },
  {
    "name": "Wikipedia PT — Café (bebida): preparo e métodos de extração",
    "url": "https://pt.wikipedia.org/wiki/Caf%C3%A9_(bebida)"
  },
  {
    "name": "ANVISA / MAPA – Resolução RDC 264/2005: Regulamento técnico para chocolate e produtos de cacau",
    "url": "https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-vegetal/legislacao/portarias-e-instrucoes-normativas/chocolates-e-produtos-de-cacau"
  },
  {
    "name": "Wikipedia PT – Chocolate: composição, tipos e processamento",
    "url": "https://pt.wikipedia.org/wiki/Chocolate"
  },
  {
    "name": "École Chocolat – Professional Chocolate Tempering Guide (EN)",
    "url": "https://www.ecolechocolat.com/en/chocolate-tempering.html"
  },
  {
    "name": "USDA FoodData Central — Densidades de ingredientes alimentares",
    "url": "https://fdc.nal.usda.gov/"
  },
  {
    "name": "Ministério da Saúde — Guia Alimentar para a População Brasileira (2ª edição)",
    "url": "https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf"
  },
  {
    "name": "OMS — Guideline: Sodium intake for adults and children",
    "url": "https://www.who.int/publications/i/item/9789241599412"
  },
  {
    "name": "IBGE — Pesquisa de Orçamentos Familiares (POF) 2017–2018",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html"
  },
  {
    "name": "King Arthur Baking — Ingredient Weight Chart",
    "url": "https://www.kingarthurbaking.com/learn/ingredient-weight-chart"
  },
  {
    "name": "INMETRO – Unidades de Medida no Brasil",
    "url": "https://www.inmetro.gov.br/consumidor/unidMedidas.asp"
  },
  {
    "name": "ABIEC — Associação Brasileira das Indústrias Exportadoras de Carnes",
    "url": "https://www.abiec.com.br"
  },
  {
    "name": "Embrapa Gado de Corte",
    "url": "https://www.embrapa.br/gado-de-corte"
  },
  {
    "name": "Wilton – Ultimate Cake Serving Chart (padrão mundial da indústria confeiteira)",
    "url": "https://wilton.com/baking-inspiration/cake-baking-serving-guide/"
  },
  {
    "name": "Webstaurantstore – Cake Size & Servings Guide for Round & Square Cakes",
    "url": "https://www.webstaurantstore.com/article/1115/cake-serving-sizes.html"
  },
  {
    "name": "BakeProfit – How Big of a Cake to Make? Serving Chart",
    "url": "https://bakeprofit.com/blog/how-big-of-a-cake-to-make"
  },
  {
    "name": "Fine Dining Lovers — How Much Sushi Per Person",
    "url": "https://www.finedininglovers.com/"
  },
  {
    "name": "Ministério da Saúde — Guia Alimentar para a População Brasileira",
    "url": "https://www.gov.br/saude/pt-br/composicao/saps/promocao-da-saude/guias-alimentares"
  },
  {
    "name": "ANVISA — Boas Práticas para Manipulação de Pescado Cru (RDC 216/2004)",
    "url": "https://www.gov.br/anvisa/pt-br/assuntos/alimentos"
  },
  {
    "name": "ANVISA — Temperatura interna segura para carnes moídas (74°C)",
    "url": "https://www.gov.br/anvisa/pt-br"
  },
  {
    "name": "IBGE — Pesquisa de Orçamentos Familiares: consumo alimentar no Brasil",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/saude/9050-pesquisa-de-orcamentos-familiares.html"
  },
  {
    "name": "Rouxbe Online Culinary School – Vegetable Cooking Times",
    "url": "https://rouxbe.com"
  },
  {
    "name": "Betty Crocker – Fresh Vegetable Cooking Chart",
    "url": "https://www.bettycrocker.com/how-to/tipslibrary/cooking-tips/fresh-vegetable-cooking-chart"
  },
  {
    "name": "HealWithFood – Steaming Vegetables Times Chart",
    "url": "https://www.healwithfood.org/charts/steaming-vegetables-times.php"
  },
  {
    "name": "Fine Dining Lovers – Vegetable Cooking Times",
    "url": "https://www.finedininglovers.com/article/vegetable-cooking-times"
  }
],
  replaces: [
    '/pt/bolo-casamento-kg-por-convidado-br', // Absorbida como caso calculable con formulaId bolo-casamento-br.
    '/pt/cafe-moido-por-xicara', // Absorbida como caso calculable con formulaId cafe-molido-taza-metodo-preparacion.
    '/pt/chocolate-bombons-caseiro-receita', // Absorbida como caso calculable con formulaId kilos-chocolate-casero-bombones-receta.
    '/pt/conversao-colher-cha-gramas', // Absorbida como caso calculable con formulaId conversion-cucharaditas-gramos-especias-sal.
    '/pt/conversao-cups-gramas-farinha-acucar-oleo', // Absorbida como caso calculable con formulaId conversion-cups-gramos-harina-azucar-aceite.
    '/pt/festa-churrasco-gramas-por-pessoa-br', // Absorbida como caso calculable con formulaId festa-churrasco-gramas-br.
    '/pt/porcoes-bolo-tamanho', // Absorbida como caso calculable con formulaId porciones-torta-cumpleanos-invitados-tamano.
    '/pt/porcoes-sushi-por-pessoa-media', // Absorbida como caso calculable con formulaId porciones-sushi-por-persona-promedio.
    '/pt/quantidade-hamburguer-churrasco-aniversario', // Absorbida como caso calculable con formulaId cantidad-hamburguesas-parrilla-cumpleanos.
    '/pt/tempos-cozimento-verduras-vapor-cozido', // Absorbida como caso calculable con formulaId tiempos-coccion-verduras-al-vapor-hervido.
  ],
  lastReviewed: '2026-08-16',
};
