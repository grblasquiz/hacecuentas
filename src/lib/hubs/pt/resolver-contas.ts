import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/matematica/resolver-contas',
  title: "Como resolvo esta conta de ciência ou matemática? | Hacé Cuentas",
  description: "Hub de decisão com 9 cálculos: Energía Cinética: Calculadora Ec = ½mv²; Calculadora de Diluição — Fórmula C1V1 = C2V2; Queda Livre — Distância e Altura por Tempo; Empuxo de Arquimedes — Calcule a Força de Empuxo (E = ρ × V × g); Calculadora de Integral Indefinida de Polinômio; MDC e MMC de dois números — Máximo Divisor Comum e Mínimo Múltiplo Comum; Converter Gramas em Moles (n = m ÷ M); Paralaxe para Parsecs: Calculadora de Distância Estelar; Calculadora de Regra de Três.",
  silo: "Ciência e matemática",
  siloHref: '/pt/matematica',
  locale: 'pt',
  eyebrow: "Brasil · Ciência e matemática",
  h1: "Como resolvo esta conta de ciência ou matemática?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 9 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['9 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Energía Cinética: Calculadora Ec = ½mv²",
    "hint": "A energia cinética é calculada pela fórmula **Ec = ½ × m × v²**, onde m é a massa em kg e v é a velocidade em m/s. O resultado é expresso em Joules (J). Exemplo: um carro de 1.000 kg a 27,8 m/s (100 km/h) tem Ec = ½ × 1.000 × 27,8² ≈ **386.420 J ≈ 386 kJ**. Como a velocidade é elevada ao quadrado, dobrar a velocidade quadruplica a energia cinética.",
    "yes": [
      "A fórmula **Ec = ½ × m × v²** mostra que a energia cinética cresce com o quadrado da velocidade: um carro de **1.200 kg a 60 km/h (16,67 m/s) possui Ec ≈ 166.800 J**, enquanto a 120 km/h essa energia quadruplica para **≈ 667.200 J**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "A energia cinética é calculada pela fórmula **Ec = ½ × m × v²**, onde m é a massa em kg e v é a velocidade em m/s. O resultado é expresso em Joules (J). Exemplo: um carro de 1.000 kg a 27,8 m/s (100 km/h) tem Ec = ½ × 1.000 × 27,8² ≈ **386.420 J ≈ 386 kJ**. Como a velocidade é elevada ao quadrado, dobrar a velocidade quadruplica a energia cinética."
  },
  {
    "id": "c2",
    "label": "Calculadora de Diluição — Fórmula C1V1 = C2V2",
    "hint": "A fórmula de diluição C1V1 = C2V2 baseia-se na conservação dos moles de soluto: concentração inicial × volume inicial = concentração final × volume final. Para encontrar o volume final: **V2 = (C1 × V1) / C2**. Exemplo: diluir 10 mL de uma solução 1 M para 0,1 M exige V2 = (1 × 10) / 0,1 = **100 mL no total** — adicione 90 mL de solvente aos 10 mL originais. Funciona com qualquer unidade de concentração consistente (M, %, mg/mL, ppm).",
    "yes": [
      "**C1 × V1 = C2 × V2** — ex.: diluir 10 mL de solução 1 M para 0,1 M exige volume final de **100 mL** (adicionar 90 mL de água)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "A fórmula de diluição C1V1 = C2V2 baseia-se na conservação dos moles de soluto: concentração inicial × volume inicial = concentração final × volume final. Para encontrar o volume final: **V2 = (C1 × V1) / C2**. Exemplo: diluir 10 mL de uma solução 1 M para 0,1 M exige V2 = (1 × 10) / 0,1 = **100 mL no total** — adicione 90 mL de solvente aos 10 mL originais. Funciona com qualquer unidade de concentração consistente (M, %, mg/mL, ppm)."
  },
  {
    "id": "c3",
    "label": "Queda Livre — Distância e Altura por Tempo",
    "hint": "Em queda livre, a distância percorrida é **h = ½ × g × t²** metros. Na Terra (g = 9,81 m/s²): 1 s → 4,9 m, 2 s → 19,6 m, 3 s → 44,1 m (~10 andares), 4 s → 78,5 m (~20 andares), 5 s → 122,6 m. A velocidade de impacto é v = g × t.",
    "yes": [
      "A fórmula central é **h = ½ × g × t²**: com g = 9,81 m/s² e t = 3 s, a altura é **44,1 m** — equivalente a um edifício de ~10 andares."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Em queda livre, a distância percorrida é **h = ½ × g × t²** metros. Na Terra (g = 9,81 m/s²): 1 s → 4,9 m, 2 s → 19,6 m, 3 s → 44,1 m (~10 andares), 4 s → 78,5 m (~20 andares), 5 s → 122,6 m. A velocidade de impacto é v = g × t."
  },
  {
    "id": "c4",
    "label": "Empuxo de Arquimedes — Calcule a Força de Empuxo (E = ρ × V × g)",
    "hint": "Empuxo de Arquimedes: **E = ρ × V × g**, onde ρ é a densidade do fluido (kg/m³), V é o volume submerso (m³) e g = 9,81 m/s². Exemplo: objeto de 0,1 m³ em água doce (1000 kg/m³) → E = 1000 × 0,1 × 9,81 = **981 N** para cima. Em água do mar (1025 kg/m³) o mesmo objeto recebe 1.005,5 N.",
    "yes": [
      "A fórmula central é **E = ρ_fluido × V_submerso × g**; para um cubo de 0,1 m³ submerso em água doce (ρ = 1000 kg/m³): **E = 1000 × 0,1 × 9,81 = 981 N**, equivalente ao peso de ~100 kg na superfície terrestre."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Empuxo de Arquimedes: **E = ρ × V × g**, onde ρ é a densidade do fluido (kg/m³), V é o volume submerso (m³) e g = 9,81 m/s². Exemplo: objeto de 0,1 m³ em água doce (1000 kg/m³) → E = 1000 × 0,1 × 9,81 = **981 N** para cima. Em água do mar (1025 kg/m³) o mesmo objeto recebe 1.005,5 N."
  },
  {
    "id": "c5",
    "label": "Calculadora de Integral Indefinida de Polinômio",
    "hint": "Para integrar um polinômio, aplique a Regra da Potência em cada termo: ∫axⁿ dx = a·xⁿ⁺¹/(n+1) + C. Exemplo: ∫(3x² + 2x + 5) dx = x³ + x² + 5x + C. Sempre adicione +C (constante de integração). Insira os coeficientes do maior para o menor grau separados por vírgula — ex.: \"3, 2, 5\" para 3x²+2x+5.",
    "yes": [
      "**∫(aₙxⁿ + … + a₁x + a₀) dx = aₙxⁿ⁺¹/(n+1) + … + a₁x²/2 + a₀x + C** — cada coeficiente é dividido pelo novo expoente; nunca esqueça o +C."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Para integrar um polinômio, aplique a Regra da Potência em cada termo: ∫axⁿ dx = a·xⁿ⁺¹/(n+1) + C. Exemplo: ∫(3x² + 2x + 5) dx = x³ + x² + 5x + C. Sempre adicione +C (constante de integração). Insira os coeficientes do maior para o menor grau separados por vírgula — ex.: \"3, 2, 5\" para 3x²+2x+5."
  },
  {
    "id": "c6",
    "label": "MDC e MMC de dois números — Máximo Divisor Comum e Mínimo Múltiplo Comum",
    "hint": "Para calcular MDC e MMC de dois inteiros: (1) Aplique o algoritmo de Euclides — substitua repetidamente (a, b) por (b, a mod b) até b = 0; o último resto não nulo é o MDC. (2) MMC(a, b) = (a × b) ÷ MDC(a, b). Exemplo: MDC(12, 18) = 6, MMC(12, 18) = 36. Identidade fundamental: MDC × MMC = a × b.",
    "yes": [
      "**MDC(a, b) = último resto não nulo do algoritmo de Euclides; MMC(a, b) = (a × b) ÷ MDC(a, b).** Exemplo: a=12, b=18 → MDC=6, MMC=36."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Para calcular MDC e MMC de dois inteiros: (1) Aplique o algoritmo de Euclides — substitua repetidamente (a, b) por (b, a mod b) até b = 0; o último resto não nulo é o MDC. (2) MMC(a, b) = (a × b) ÷ MDC(a, b). Exemplo: MDC(12, 18) = 6, MMC(12, 18) = 36. Identidade fundamental: MDC × MMC = a × b."
  },
  {
    "id": "c7",
    "label": "Converter Gramas em Moles (n = m ÷ M)",
    "hint": "Para converter gramas em moles use: **n = m (g) ÷ M (g/mol)**. Exemplo: 18 g de água (M = 18,015 g/mol) = 0,9992 mol ≈ 1 mol = 6,02 × 10²³ moléculas. Para obter o número de moléculas, multiplique os moles pelo Número de Avogadro: Nₐ = 6,02214076 × 10²³ mol⁻¹.",
    "yes": [
      "**n (mol) = m (g) ÷ M (g/mol)** — Exemplo real: 36 g de água (M = 18,015 g/mol) → n = 36 ÷ 18,015 = **1,999 mol ≈ 2 mol = 1,204 × 10²⁴ moléculas**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Para converter gramas em moles use: **n = m (g) ÷ M (g/mol)**. Exemplo: 18 g de água (M = 18,015 g/mol) = 0,9992 mol ≈ 1 mol = 6,02 × 10²³ moléculas. Para obter o número de moléculas, multiplique os moles pelo Número de Avogadro: Nₐ = 6,02214076 × 10²³ mol⁻¹."
  },
  {
    "id": "c8",
    "label": "Paralaxe para Parsecs: Calculadora de Distância Estelar",
    "hint": "Distância (parsecs) = 1 / paralaxe (arcseg). Uma estrela com paralaxe 0,1\" está a exatamente 10 pc = 32,6 anos-luz. Próxima Centauri: p = 0,7687\" → d = 1,301 pc = 4,243 al (Gaia DR3).",
    "yes": [
      "**d (pc) = 1 / p (arcseg)** — exemplo real: Próxima Centauri tem p = 0,7687 arcseg → d = 1/0,7687 = **1,301 pc = 4,243 anos-luz** (Gaia DR3)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Distância (parsecs) = 1 / paralaxe (arcseg). Uma estrela com paralaxe 0,1\" está a exatamente 10 pc = 32,6 anos-luz. Próxima Centauri: p = 0,7687\" → d = 1,301 pc = 4,243 al (Gaia DR3)."
  },
  {
    "id": "c9",
    "label": "Calculadora de Regra de Três",
    "hint": "A regra de três encontra um valor desconhecido (X) a partir de três valores conhecidos que formam uma proporção. Na regra de três simples direta, se A corresponde a B e C corresponde a X, então X = (B × C) ÷ A. Na inversa (quando uma grandeza aumenta e a outra diminui), X = (A × B) ÷ C. Exemplo: se 2 kg de arroz custam R$ 10, quanto custam 5 kg? X = (10 × 5) ÷ 2 = R$ 25. Na composta, multiplica-se pela razão de cada grandeza adicional.",
    "yes": [
      "Na regra de três **direta**, multiplique em **cruz**: X = (B × C) ÷ A. Na **inversa**, multiplique na **linha** (os dois valores conhecidos da mesma grandeza): X = (A × B) ÷ C. O segredo é identificar se as grandezas são **diretamente** ou **inversamente** proporcionais antes de montar a conta."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-16.",
    "answer": "A regra de três encontra um valor desconhecido (X) a partir de três valores conhecidos que formam uma proporção. Na regra de três simples direta, se A corresponde a B e C corresponde a X, então X = (B × C) ÷ A. Na inversa (quando uma grandeza aumenta e a outra diminui), X = (A × B) ÷ C. Exemplo: se 2 kg de arroz custam R$ 10, quanto custam 5 kg? X = (10 × 5) ÷ 2 = R$ 25. Na composta, multiplica-se pela razão de cada grandeza adicional."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__masa",
    "label": "Energía Cinética: Calculadora Ec = ½mv²: Massa (kg)",
    "type": "number",
    "value": 10,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c1__velocidad",
    "label": "Energía Cinética: Calculadora Ec = ½mv²: Velocidade (m/s)",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c2__modo",
    "label": "Calculadora de Diluição — Fórmula C1V1 = C2V2: Calcular",
    "type": "select",
    "value": "v2",
    "options": [
      {
        "value": "v2",
        "label": "V2 (volume final)"
      },
      {
        "value": "c2",
        "label": "C2 (conc final)"
      },
      {
        "value": "v1",
        "label": "V1 (volume inicial)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__c1",
    "label": "Calculadora de Diluição — Fórmula C1V1 = C2V2: C1 — Concentração do estoque (M ou %)",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false,
    "help": "Concentração inicial da solução estoque. Use a mesma unidade que C2 (ex.: ambas em M, ou ambas em %)."
  },
  {
    "id": "c2__v1",
    "label": "Calculadora de Diluição — Fórmula C1V1 = C2V2: V1 — Volume do estoque (mL ou L)",
    "type": "number",
    "value": 10,
    "step": 0.01,
    "thousands": false,
    "help": "Volume de solução estoque a utilizar. Deve usar a mesma unidade que V2."
  },
  {
    "id": "c2__c2",
    "label": "Calculadora de Diluição — Fórmula C1V1 = C2V2: C2 — Concentração alvo (mesma unidade de C1)",
    "type": "number",
    "value": 0.1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c2__v2",
    "label": "Calculadora de Diluição — Fórmula C1V1 = C2V2: V2 — Volume total final (mesma unidade de V1)",
    "type": "number",
    "value": 100,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__t",
    "label": "Queda Livre — Distância e Altura por Tempo: Tempo (s)",
    "type": "number",
    "value": 3,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__g",
    "label": "Queda Livre — Distância e Altura por Tempo: Gravidade (m/s²)",
    "type": "number",
    "value": 9.81,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__rho",
    "label": "Empuxo de Arquimedes — Calcule a Força de Empuxo (E = ρ × V × g): Densidade do fluido (kg/m³)",
    "type": "number",
    "value": 1000,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__vol",
    "label": "Empuxo de Arquimedes — Calcule a Força de Empuxo (E = ρ × V × g): Volume submerso (m³)",
    "type": "number",
    "value": 0.1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__g",
    "label": "Empuxo de Arquimedes — Calcule a Força de Empuxo (E = ρ × V × g): Aceleração gravitacional (m/s²)",
    "type": "number",
    "value": 9.81,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c5__coefs",
    "label": "Calculadora de Integral Indefinida de Polinômio: Coeficientes (maior → menor grau, separados por vírgula)",
    "type": "text",
    "value": 0.325325,
    "thousands": false
  },
  {
    "id": "c6__a",
    "label": "MDC e MMC de dois números — Máximo Divisor Comum e Mínimo Múltiplo Comum: Primeiro inteiro (a)",
    "type": "number",
    "value": 0.12,
    "min": 1,
    "max": 1000000,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c6__b",
    "label": "MDC e MMC de dois números — Máximo Divisor Comum e Mínimo Múltiplo Comum: Segundo inteiro (b)",
    "type": "number",
    "value": 0.18,
    "min": 1,
    "max": 1000000,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__m",
    "label": "Converter Gramas em Moles (n = m ÷ M): Massa (g)",
    "type": "number",
    "value": 18,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c7__mw",
    "label": "Converter Gramas em Moles (n = m ÷ M): Peso molecular (g/mol)",
    "type": "number",
    "value": 18.015,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c8__paralaje",
    "label": "Paralaxe para Parsecs: Calculadora de Distância Estelar: Paralaxe (arcseg)",
    "type": "number",
    "value": 0.1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c9__tipo",
    "label": "Calculadora de Regra de Três: Tipo de regra de três",
    "type": "select",
    "value": "direta",
    "options": [
      {
        "value": "direta",
        "label": "Simples direta (crescem juntas)"
      },
      {
        "value": "inversa",
        "label": "Simples inversa (uma sobe, outra desce)"
      },
      {
        "value": "composta",
        "label": "Composta (duas grandezas + X)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c9__valorA",
    "label": "Calculadora de Regra de Três: Valor A (referência conhecida)",
    "type": "number",
    "value": 2,
    "step": 0.01,
    "thousands": false,
    "help": "1ª grandeza: valor de referência que corresponde a B."
  },
  {
    "id": "c9__valorB",
    "label": "Calculadora de Regra de Três: Valor B (correspondente a A)",
    "type": "number",
    "value": 10,
    "step": 0.01,
    "thousands": false,
    "help": "1ª grandeza: valor que corresponde a A na proporção."
  },
  {
    "id": "c9__valorC",
    "label": "Calculadora de Regra de Três: Valor C (corresponde ao X)",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false,
    "help": "1ª grandeza: valor conhecido cujo correspondente você quer descobrir (X)."
  },
  {
    "id": "c9__valorD",
    "label": "Calculadora de Regra de Três: Valor D (2ª grandeza, só na composta)",
    "type": "number",
    "value": 8,
    "step": 0.01,
    "thousands": false,
    "help": "Regra de três composta: valor de referência da 2ª grandeza."
  },
  {
    "id": "c9__valorE",
    "label": "Calculadora de Regra de Três: Valor E (2ª grandeza, correspondente ao X)",
    "type": "number",
    "value": 6,
    "step": 0.01,
    "thousands": false,
    "help": "Regra de três composta: valor da 2ª grandeza correspondente ao X."
  },
  {
    "id": "c9__relacaoSegunda",
    "label": "Calculadora de Regra de Três: A 2ª grandeza é (composta)",
    "type": "select",
    "value": "direta",
    "options": [
      {
        "value": "direta",
        "label": "Diretamente proporcional ao X"
      },
      {
        "value": "inversa",
        "label": "Inversamente proporcional ao X"
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
    "q": "O que é energia cinética e qual é a fórmula?",
    "a": "Energia cinética (Ec) é a energia que um objeto possui devido ao seu movimento. A fórmula é **Ec = ½ × m × v²**, onde m é a massa em kg e v é a velocidade em m/s. O resultado é em Joules (J). Exemplo: uma pessoa de 70 kg caminhando a 1,5 m/s tem Ec = 0,5 × 70 × 1,5² = **78,75 J**."
  },
  {
    "q": "Por que a velocidade tem muito mais impacto na energia cinética do que a massa?",
    "a": "Porque a velocidade entra na fórmula **elevada ao quadrado** (v²), enquanto a massa entra de forma linear. Dobrar a massa dobra a Ec, mas dobrar a velocidade **quadruplica** a Ec. Por exemplo, um carro de 1.000 kg a 100 km/h tem Ec ≈ 385.800 J; o mesmo carro a 200 km/h tem Ec ≈ 1.543.200 J — quatro vezes mais."
  },
  {
    "q": "Como converter km/h para m/s para usar na fórmula?",
    "a": "Divida o valor em km/h por **3,6**. Exemplos: 36 km/h ÷ 3,6 = 10 m/s; 90 km/h ÷ 3,6 = 25 m/s; 120 km/h ÷ 3,6 ≈ 33,33 m/s. Essa conversão é obrigatória pois a fórmula Ec = ½mv² exige a velocidade em metros por segundo (m/s) para que o resultado saia em Joules."
  },
  {
    "q": "Qual é a relação entre energia cinética e distância de frenagem de um veículo?",
    "a": "A distância de frenagem é diretamente proporcional à energia cinética que os freios precisam dissipar. Pelo Teorema do Trabalho-Energia: **F × d = Ec**, onde F é a força de frenagem e d é a distância percorrida até parar. Como Ec é proporcional a v², dobrar a velocidade **quadruplica** a distância de frenagem — fundamento técnico dos limites de velocidade do CTB (Lei nº 9.503/1997, Art. 61)."
  },
  {
    "q": "Um objeto em repouso tem energia cinética?",
    "a": "Não. Se a velocidade do objeto é **v = 0**, então Ec = ½ × m × 0² = **0 J**, independentemente da massa. Um objeto parado pode ter energia potencial (gravitacional, elástica etc.), mas a energia cinética, por definição, só existe quando há movimento — ou seja, quando v > 0."
  },
  {
    "q": "Como a energia cinética se relaciona com o Princípio da Conservação de Energia?",
    "a": "Em um sistema isolado (sem forças dissipativas como atrito), a energia total é constante: **Ec + Ep = constante**. Em uma queda livre, por exemplo, a energia potencial gravitacional (Ep = mgh) converte-se integralmente em energia cinética ao atingir o solo. Esse princípio, estabelecido pela Mecânica Clássica Newtoniana, é a base para calcular velocidades em rampas, pêndulos e projéteis."
  },
  {
    "q": "Qual é a diferença entre energia cinética translacional e rotacional?",
    "a": "A fórmula **Ec = ½mv²** descreve a energia cinética **translacional** (movimento linear do centro de massa). Já a energia cinética **rotacional** é dada por **Ec_rot = ½Iω²**, onde I é o momento de inércia (kg·m²) e ω é a velocidade angular (rad/s). Rodas, turbinas e peões possuem ambas as componentes simultaneamente. Esta calculadora trata apenas da energia translacional."
  },
  {
    "q": "A energia cinética pode ser negativa?",
    "a": "Não. Como Ec = ½mv² e o quadrado de qualquer número real é sempre ≥ 0, a energia cinética é sempre **positiva ou nula**. Mesmo que a velocidade seja negativa (indicando sentido contrário), v² torna-se positivo. Valores negativos de energia cinética não têm significado físico no contexto da Mecânica Clássica."
  },
  {
    "q": "Como a energia cinética é usada no contexto de energias renováveis no Brasil?",
    "a": "Na geração eólica, a energia cinética do vento (**Ec = ½mv²**) é convertida em energia elétrica pelas turbinas. A potência eólica disponível é **P = ½ × ρ × A × v³** (ρ = densidade do ar ≈ 1,225 kg/m³; A = área varrida pelas pás). O Brasil é um dos líderes mundiais em energia eólica, com mais de 28 GW instalados (dados ANEEL/2024), e toda a viabilidade de um parque começa pelo cálculo da energia cinética do vento local."
  },
  {
    "q": "Qual é a relação entre energia cinética e calorias ou kWh?",
    "a": "1 Joule equivale a aproximadamente **0,239 calorias** ou **2,778 × 10⁻⁷ kWh**. Um carro de 1.200 kg a 100 km/h possui cerca de 463.000 J de energia cinética, o equivalente a 110.700 calorias ou 0,129 kWh. Para comparação prática: essa energia poderia manter uma lâmpada LED de 10 W acesa por aproximadamente 13 horas, ou ferver cerca de 1,4 litros de água de 20 °C até 100 °C."
  },
  {
    "q": "Como o atrito e a resistência do ar afetam o cálculo de energia cinética?",
    "a": "A fórmula **Ec = ½mv²** calcula a energia cinética em um instante específico, independentemente das forças que atuam sobre o objeto. Porém, em situações reais, forças dissipativas como **atrito** e **resistência do ar** retiram energia cinética e a transformam em calor. Para problemas dinâmicos com atrito, aplique o Teorema Trabalho-Energia: **W_total = ΔEc**, somando todos os trabalhos (positivos e negativos)."
  },
  {
    "q": "Em que situações posso usar essa calculadora além da Física escolar?",
    "a": "Muitas aplicações práticas: **perícia veicular** (laudos de acidentes do DETRAN calculam velocidade de impacto a partir de deformação e energia dissipada), **engenharia de segurança** (dimensionamento de barreiras de contenção em rodovias), **balística forense** (energia de projétil em laudo do IML), **esportes de alto rendimento** (potência de chutes, saques e arremessos), **energias renováveis** (avaliação de potencial eólico antes de instalar turbina), **simulações de games físicos** (engines como Unity e Unreal usam essa fórmula em tempo real para colisões)."
  },
  {
    "q": "A equação C1V1 = C2V2 funciona para qualquer unidade de concentração?",
    "a": "Sim, desde que C1 e C2 estejam na **mesma unidade**. Funciona com mol/L (M), mmol/L (mM), % m/v, % v/v, mg/mL, ppm etc. O que não pode é misturar unidades diferentes nos dois lados — por exemplo, C1 em mol/L e C2 em g/L sem converter primeiro pela massa molar do soluto."
  },
  {
    "q": "Por que o álcool 70% é mais eficaz que o álcool 96% como antisséptico?",
    "a": "A água presente no álcool 70% atua como agente de penetração celular, permitindo que o etanol desnature proteínas intracelulares das bactérias com maior eficiência. O álcool 96% desidrata rapidamente a membrana e forma uma barreira protetora antes de penetrar. A ANVISA, em sua Nota Técnica GVIMS/GGTES/ANVISA nº 04/2020, recomenda concentrações entre 62% e 71% v/v como ótimas para antissepsia das mãos e superfícies."
  }
],
  sources: [
  {
    "name": "Wikipedia PT — Energia cinética: definição, fórmula e demonstração",
    "url": "https://pt.wikipedia.org/wiki/Energia_cin%C3%A9tica"
  },
  {
    "name": "Wikipedia PT — Teorema do Trabalho-Energia",
    "url": "https://pt.wikipedia.org/wiki/Teorema_trabalho-energia"
  },
  {
    "name": "INMETRO — Sistema Internacional de Unidades (SI)",
    "url": "https://www.inmetro.gov.br/consumidor/unidmedida.asp"
  },
  {
    "name": "Wikipedia PT — Diluição (química)",
    "url": "https://pt.wikipedia.org/wiki/Dilui%C3%A7%C3%A3o_(qu%C3%ADmica)"
  },
  {
    "name": "ANVISA — Nota Técnica GVIMS/GGTES nº 04/2020 (álcool antisséptico)",
    "url": "https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/notas-tecnicas/nota-tecnica-gvims-ggtes-anvisa-04-2020.pdf"
  },
  {
    "name": "Ministério da Saúde (MS) — Formulário Nacional da Farmacopeia Brasileira",
    "url": "https://www.gov.br/saude/pt-br/assuntos/assistencia-farmaceutica/formulario-nacional"
  },
  {
    "name": "NIST Chemistry WebBook — Solution Preparation",
    "url": "https://webbook.nist.gov"
  },
  {
    "name": "Wikipedia — Dilution (equation)",
    "url": "https://en.wikipedia.org/wiki/Dilution_(equation)"
  },
  {
    "name": "Wikipedia PT – Pascal (unidade): definição e relações entre Bar, PSI e kPa",
    "url": "https://pt.wikipedia.org/wiki/Pascal_(unidade)"
  },
  {
    "name": "ANVISA — Temperatura interna segura para carnes moídas (74°C)",
    "url": "https://www.gov.br/anvisa/pt-br"
  },
  {
    "name": "Wikipedia — Gigabyte (1 GiB = 1.024 MiB, base binaria vs decimal)",
    "url": "https://es.wikipedia.org/wiki/Gigabyte"
  },
  {
    "name": "Wikipedia PT — Aquarismo: técnicas e parâmetros de qualidade de água",
    "url": "https://pt.wikipedia.org/wiki/Aquarismo"
  },
  {
    "name": "Wikipedia — Shoelace formula",
    "url": "https://en.wikipedia.org/wiki/Shoelace_formula"
  },
  {
    "name": "Wikipedia PT — Fórmula de Heron",
    "url": "https://pt.wikipedia.org/wiki/F%C3%B3rmula_de_Heron"
  },
  {
    "name": "Wikipedia – List of languages by total number of speakers",
    "url": "https://en.wikipedia.org/wiki/List_of_languages_by_total_number_of_speakers"
  },
  {
    "name": "Wikipedia PT — Quadro Europeu Comum de Referência para Línguas (CEFR)",
    "url": "https://pt.wikipedia.org/wiki/Quadro_Europeu_Comum_de_Refer%C3%AAncia_para_as_L%C3%ADnguas"
  },
  {
    "name": "Wikipedia – Cylinder (geometry): Volume and Surface Area",
    "url": "https://en.wikipedia.org/wiki/Cylinder"
  },
  {
    "name": "Wikipedia – Frame rate (frame time formula and perception thresholds)",
    "url": "https://en.wikipedia.org/wiki/Frame_rate"
  },
  {
    "name": "Wikipedia PT – Aceleração gravitacional: valores por planeta e latitude",
    "url": "https://pt.wikipedia.org/wiki/Acelera%C3%A7%C3%A3o_gravitacional"
  },
  {
    "name": "Wikipedia — Heron's Formula (with proof, history, and generalizations)",
    "url": "https://en.wikipedia.org/wiki/Heron%27s_formula"
  },
  {
    "name": "Wikipedia PT — Mol (unidade)",
    "url": "https://pt.wikipedia.org/wiki/Mol"
  },
  {
    "name": "Wikipedia PT — Unidade de processamento gráfico (GPU)",
    "url": "https://pt.wikipedia.org/wiki/Unidade_de_processamento_gr%C3%A1fico"
  },
  {
    "name": "Wikipedia PT – Queda livre: fundamentos, fórmulas e história",
    "url": "https://pt.wikipedia.org/wiki/Queda_livre"
  },
  {
    "name": "INMETRO – Sistema Internacional de Unidades (SI): definições de metro e segundo",
    "url": "https://www.inmetro.gov.br/metcientifica/si.asp"
  },
  {
    "name": "NIST – Standard Acceleration of Gravity (g = 9.80665 m/s²)",
    "url": "https://physics.nist.gov/cgi-bin/cuu/Value?gn"
  },
  {
    "name": "Wikipedia PT — Princípio de Arquimedes",
    "url": "https://pt.wikipedia.org/wiki/Princ%C3%ADpio_de_Arquimedes"
  },
  {
    "name": "INMETRO — Vocabulário Internacional de Metrologia (VIM)",
    "url": "https://www.inmetro.gov.br/metcientifica/vim.asp"
  },
  {
    "name": "IBGE — Rede Gravimétrica Fundamental Brasileira",
    "url": "https://www.ibge.gov.br/geociencias/informacoes-sobre-posicionamento-geodesico/geodesia/10988-rede-gravimetrica-fundamental-brasileira.html"
  },
  {
    "name": "NIST Chemistry WebBook — Propriedades de fluidos",
    "url": "https://webbook.nist.gov/chemistry/fluid/"
  },
  {
    "name": "Wikipedia PT — Integral (Cálculo)",
    "url": "https://pt.wikipedia.org/wiki/Integral"
  },
  {
    "name": "Wikipedia PT — Regra da Potência",
    "url": "https://pt.wikipedia.org/wiki/Regra_da_pot%C3%AAncia_(c%C3%A1lculo)"
  },
  {
    "name": "Khan Academy BR — Integral Indefinida",
    "url": "https://pt.khanacademy.org/math/integral-calculus/ic-integration/ic-antiderivatives-intro/a/reverse-power-rule-review"
  },
  {
    "name": "NIST Digital Library of Mathematical Functions — Integrais Indefinidas",
    "url": "https://dlmf.nist.gov/1.4"
  },
  {
    "name": "Wikipedia PT — Algoritmo de Euclides",
    "url": "https://pt.wikipedia.org/wiki/Algoritmo_de_Euclides"
  },
  {
    "name": "Wikipedia PT — Máximo Divisor Comum",
    "url": "https://pt.wikipedia.org/wiki/M%C3%A1ximo_divisor_comum"
  },
  {
    "name": "Wikipedia PT — Mínimo Múltiplo Comum",
    "url": "https://pt.wikipedia.org/wiki/M%C3%ADnimo_m%C3%BAltiplo_comum"
  },
  {
    "name": "Khan Academy BR — Máximo divisor comum",
    "url": "https://pt.khanacademy.org/math/cc-sixth-grade-math/cc-6th-factors-and-multiples/cc-6th-gcf/a/greatest-common-factor-explained"
  },
  {
    "name": "NIST Chemistry WebBook — Pesos Moleculares e Propriedades Físicas",
    "url": "https://webbook.nist.gov/chemistry/"
  },
  {
    "name": "NIST — Constante de Avogadro (Constantes Físicas Fundamentais)",
    "url": "https://physics.nist.gov/cgi-bin/cuu/Value?na"
  },
  {
    "name": "PubChem — Base de Dados de Compostos Químicos (NCBI/NIH)",
    "url": "https://pubchem.ncbi.nlm.nih.gov/"
  },
  {
    "name": "ESA Gaia DR3 — Gaia Data Release 3 (2022)",
    "url": "https://www.cosmos.esa.int/web/gaia/dr3"
  },
  {
    "name": "Wikipedia PT — Paralaxe estelar",
    "url": "https://pt.wikipedia.org/wiki/Paralaxe_estelar"
  },
  {
    "name": "Wikipedia PT — Parsec",
    "url": "https://pt.wikipedia.org/wiki/Parsec"
  },
  {
    "name": "Bailer-Jones et al. 2021 — Distâncias Bayesianas Gaia EDR3",
    "url": "https://doi.org/10.3847/1538-3881/abd806"
  },
  {
    "name": "IAU — Definição de parsec e unidades astronômicas",
    "url": "https://www.iau.org/public/themes/measuring/"
  },
  {
    "name": "Brasil Escola — Regra de três composta",
    "url": "https://brasilescola.uol.com.br/matematica/regra-tres-composta.htm"
  },
  {
    "name": "Mundo Educação — Regra de três simples",
    "url": "https://mundoeducacao.uol.com.br/matematica/regra-tres-simples.htm"
  }
],
  replaces: [
    '/pt/calculadora-energia-cinetica', // Absorbida como caso calculable con formulaId energia-cinetica-ec.
    '/pt/diluicao-concentracao-c1v1-c2v2', // Absorbida como caso calculable con formulaId dilucion-concentracion-c1v1-c2v2.
    '/pt/distancia-queda-livre-altura', // Absorbida como caso calculable con formulaId distancia-caida-libre-altura.
    '/pt/empuxo-arquimedes-volume', // Absorbida como caso calculable con formulaId empuje-arquimedes-volumen.
    '/pt/integral-indefinida-polinomio', // Absorbida como caso calculable con formulaId integral-indefinida-polinomio-coefs.
    '/pt/mdc-mmc-dois-numeros-inteiros', // Absorbida como caso calculable con formulaId mcd-mcm-dos-numeros-enteros.
    '/pt/moles-massa-formula-molecular', // Absorbida como caso calculable con formulaId moles-masa-formula-molecular.
    '/pt/paralaxe-distancia-em-parsec', // Absorbida como caso calculable con formulaId paralaje-distancia-estrella-parsec.
    '/pt/regra-de-tres-simples-composta-direta-inversa', // Absorbida como caso calculable con formulaId regra-de-tres-simples-composta-direta-inversa.
  ],
  lastReviewed: '2026-07-28',
};
