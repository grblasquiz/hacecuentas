import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/vida/aprender-e-passar',
  title: "Média do ENEM, nota para passar e média escolar",
  description: "Calculadora de média ponderada do ENEM (nota de corte do SiSU), média escolar do ensino médio, quanto preciso para passar e aulas de idiomas por semana.",
  silo: "Estudos",
  siloHref: '/pt/vida',
  locale: 'pt',
  eyebrow: "Brasil · Estudos",
  h1: "Quanto preciso tirar para passar: ENEM, escola e idiomas",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 7 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['7 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Qual aplicativo de idiomas é melhor para o seu nível?",
    "hint": "O melhor app de idiomas depende do seu nível e objetivo: iniciantes em vocabulário → Duolingo; intermediários em conversação → iTalki (USD 8–25/h, 3–5× mais ganho oral que apps gamificados); avançados → Anki personalizado + coach nativo. O stack ideal é Anki (vocabulário SRS) + Busuu/Babbel (gramática) + iTalki (conversação).",
    "yes": [
      "**A1–A2 (Iniciante)**: Duolingo + Anki · **B1–B2 (Intermediário)**: Busuu/Babbel + iTalki · **C1+ (Avançado)**: iTalki/Preply + imersão real. Pronúncia: ELSA Speak (inglês com IA). Conversação: iTalki (USD 8–25/h), HelloTalk (gratuito)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "O melhor app de idiomas depende do seu nível e objetivo: iniciantes em vocabulário → Duolingo; intermediários em conversação → iTalki (USD 8–25/h, 3–5× mais ganho oral que apps gamificados); avançados → Anki personalizado + coach nativo. O stack ideal é Anki (vocabulário SRS) + Busuu/Babbel (gramática) + iTalki (conversação)."
  },
  {
    "id": "c2",
    "label": "Quantas Aulas de Idioma por Semana Você Precisa?",
    "hint": "A maioria dos alunos precisa de **2–3 aulas por semana de 60 minutos** para ter progresso mensurável em um idioma. Para apenas manter o nível, 1 aula/semana é suficiente. Para uma meta intensiva (exame, mudança), 5–7 aulas/semana é o recomendado. Essas frequências são baseadas nas estimativas de horas do Foreign Service Institute (FSI) e em pesquisas sobre repetição espaçada.",
    "yes": [
      "**2–3 aulas/semana de 60 min** é o equilíbrio ideal para progresso constante: frequência suficiente para vencer o esquecimento (curva de Ebbinghaus) sem esgotamento ou custo excessivo. Abaixo de 1 aula/semana, o esquecimento supera o aprendizado para a maioria dos alunos."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "A maioria dos alunos precisa de **2–3 aulas por semana de 60 minutos** para ter progresso mensurável em um idioma. Para apenas manter o nível, 1 aula/semana é suficiente. Para uma meta intensiva (exame, mudança), 5–7 aulas/semana é o recomendado. Essas frequências são baseadas nas estimativas de horas do Foreign Service Institute (FSI) e em pesquisas sobre repetição espaçada."
  },
  {
    "id": "c3",
    "label": "Calculadora de Regularidade CBC UBA: Regular ou Livre?",
    "hint": "Para ficar **Regular** no CBC da UBA você precisa de: (1) presença ≥ 75% nas aulas E (2) nota ≥ 4 em CADA parcial (escala 1–10 argentina). As duas condições são obrigatórias ao mesmo tempo. Se uma falhar, você fica **Livre** (reprovado). Estudantes regulares fazem uma prova final normal; livres enfrentam uma final abrangente e mais difícil.",
    "yes": [
      "**Regular = Presença ≥ 75% E Parcial 1 ≥ 4 E Parcial 2 ≥ 4 (escala 1–10). Média = (P1 + P2) / 2. Média ≥ 7 com ≥ 75% de presença pode dar promoção direta (sem prova final) em matérias que oferecem essa modalidade.**"
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "Para ficar **Regular** no CBC da UBA você precisa de: (1) presença ≥ 75% nas aulas E (2) nota ≥ 4 em CADA parcial (escala 1–10 argentina). As duas condições são obrigatórias ao mesmo tempo. Se uma falhar, você fica **Livre** (reprovado). Estudantes regulares fazem uma prova final normal; livres enfrentam uma final abrangente e mais difícil."
  },
  {
    "id": "c4",
    "label": "Média escolar do ensino médio: aprovação, recuperação ou reprovação",
    "hint": "A calculadora de média escolar do ensino médio calcula a média aritmética simples (ou ponderada) das suas notas por matéria e informa imediatamente se você foi aprovado, está em recuperação ou foi reprovado.",
    "yes": [
      "**Média = (N1 + N2 + ... + Nn) ÷ n** — ex.: notas 8, 7, 9, 6, 7, 8 → Média = 45 ÷ 6 = **7,5 → Aprovado** (mínimo nacional mais comum: 5,0 ou 6,0)"
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "A calculadora de média escolar do ensino médio calcula a média aritmética simples (ou ponderada) das suas notas por matéria e informa imediatamente se você foi aprovado, está em recuperação ou foi reprovado."
  },
  {
    "id": "c5",
    "label": "Calculadora: quanto preciso para passar",
    "hint": "Para saber quanto precisa na prova final, use: nota necessária = (média para passar − média parcial × peso das notas já feitas) ÷ peso da prova final. Exemplo: você tem média 5,0 nas notas que valem 70% e a prova final vale 30%; para fechar média 6,0 precisa de (6,0 − 5,0 × 0,70) ÷ 0,30 = 8,33. Se a conta der 0 ou menos, você já está aprovado; se der mais que 10, não dá para passar apenas com a final.",
    "yes": [
      "Nota necessária = (**média para passar** − **média parcial** × peso das notas feitas) ÷ **peso da prova final**. Se o resultado for **≤ 0**, você já passou; se for **maior que o teto** (10), não dá para recuperar só na final. Sempre confira os **pesos** e a **média de aprovação** da sua instituição."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-16.",
    "answer": "Para saber quanto precisa na prova final, use: nota necessária = (média para passar − média parcial × peso das notas já feitas) ÷ peso da prova final. Exemplo: você tem média 5,0 nas notas que valem 70% e a prova final vale 30%; para fechar média 6,0 precisa de (6,0 − 5,0 × 0,70) ÷ 0,30 = 8,33. Se a conta der 0 ou menos, você já está aprovado; se der mais que 10, não dá para passar apenas com a final."
  },
  {
    "id": "c6",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU)",
    "hint": "A média ponderada do ENEM para o SiSU é Σ(nota × peso) ÷ Σ(peso), usando as 5 notas (Linguagens, Humanas, Natureza, Matemática e Redação) e os pesos que o curso define. Se seu resultado ficar igual ou acima da nota de corte da última atualização do SiSU, você estaria classificado. Com pesos iguais, o cálculo vira a média simples.",
    "yes": [
      "A média do SiSU é **ponderada**: média = Σ(nota × peso) ÷ Σ(peso). Os **pesos mudam por curso**, então descubra os pesos do seu curso antes de calcular. Compare com a **nota de corte** — mas lembre que ela **oscila diariamente** enquanto o SiSU está aberto."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-07-18.",
    "answer": "A média ponderada do ENEM para o SiSU é Σ(nota × peso) ÷ Σ(peso), usando as 5 notas (Linguagens, Humanas, Natureza, Matemática e Redação) e os pesos que o curso define. Se seu resultado ficar igual ou acima da nota de corte da última atualização do SiSU, você estaria classificado. Com pesos iguais, o cálculo vira a média simples."
  },
  {
    "id": "c7",
    "label": "Podcasts para aprender idiomas",
    "hint": "Esta calculadora estima quantos minutos de podcast por dia você precisa ouvir para evoluir num idioma estrangeiro, partindo da hipótese do input compreensível de Stephen Krashen (1982): a aquisição acontece quando o aprendiz é exposto de forma sistemática a conteúdo levemente acima do seu nível atual (i+1).",
    "yes": [
      "**Minutos/dia = (Horas totais necessárias para o nível × 60) ÷ Dias disponíveis** — ex.: para ir de A2 a B1 (≈200 h) em 12 meses (365 dias) = (200×60)÷365 ≈ **33 min/dia** de podcast."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-05-28.",
    "answer": "Esta calculadora estima quantos minutos de podcast por dia você precisa ouvir para evoluir num idioma estrangeiro, partindo da hipótese do input compreensível de Stephen Krashen (1982): a aquisição acontece quando o aprendiz é exposto de forma sistemática a conteúdo levemente acima do seu nível atual (i+1)."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__nivel",
    "label": "Qual aplicativo de idiomas é melhor para o seu nível?: Nível atual",
    "type": "select",
    "value": "princ",
    "options": [
      {
        "value": "princ",
        "label": "Iniciante (A1–A2)"
      },
      {
        "value": "inter",
        "label": "Intermediário (B1–B2)"
      },
      {
        "value": "avan",
        "label": "Avançado (C1+)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__objetivo",
    "label": "Qual aplicativo de idiomas é melhor para o seu nível?: Objetivo principal",
    "type": "select",
    "value": "vocab",
    "options": [
      {
        "value": "vocab",
        "label": "Vocabulário"
      },
      {
        "value": "gram",
        "label": "Gramática"
      },
      {
        "value": "conv",
        "label": "Conversação"
      },
      {
        "value": "pron",
        "label": "Pronúncia"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__meta",
    "label": "Quantas Aulas de Idioma por Semana Você Precisa?: Sua meta",
    "type": "select",
    "value": "mejora",
    "options": [
      {
        "value": "manten",
        "label": "Manter o nível atual"
      },
      {
        "value": "mejora",
        "label": "Melhorar progressivamente"
      },
      {
        "value": "intensivo",
        "label": "Intensivo (avanço rápido)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__asistenciaPorcentaje",
    "label": "Calculadora de Regularidade CBC UBA: Regular ou Livre?: Presença %",
    "type": "number",
    "value": 75,
    "max": 100,
    "step": 0.01,
    "thousands": false,
    "help": "Insira sua porcentagem de presença nas aulas (mínimo 75% exigido)."
  },
  {
    "id": "c3__parcial1",
    "label": "Calculadora de Regularidade CBC UBA: Regular ou Livre?: Nota Parcial 1 (1–10)",
    "type": "number",
    "value": 6,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__parcial2",
    "label": "Calculadora de Regularidade CBC UBA: Regular ou Livre?: Nota Parcial 2 (1–10)",
    "type": "number",
    "value": 7,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__notasTexto",
    "label": "Média escolar do ensino médio: aprovação, recuperação ou reprovação: Notas (separadas por vírgula)",
    "type": "text",
    "value": "7,5,6,8",
    "thousands": false
  },
  {
    "id": "c5__mediaParcial",
    "label": "Calculadora: quanto preciso para passar: Média que você já tem (0 a 10)",
    "type": "number",
    "value": 5,
    "min": 0,
    "max": 10,
    "step": 0.1,
    "thousands": false,
    "help": "Média das notas já lançadas (bimestres, trabalhos, provas parciais)."
  },
  {
    "id": "c5__pesoParcialPct",
    "label": "Calculadora: quanto preciso para passar: Peso das notas já feitas (%)",
    "type": "number",
    "value": 70,
    "min": 1,
    "max": 99,
    "step": 1,
    "thousands": false,
    "help": "Quanto as notas que você já tem valem na nota final (o resto é a prova final)."
  },
  {
    "id": "c5__mediaParaPassar",
    "label": "Calculadora: quanto preciso para passar: Média para passar",
    "type": "number",
    "value": 6,
    "min": 0,
    "max": 10,
    "step": 0.1,
    "thousands": false,
    "help": "Média mínima de aprovação da sua escola/faculdade (padrão 6,0)."
  },
  {
    "id": "c5__notaMaxima",
    "label": "Calculadora: quanto preciso para passar: Nota máxima possível",
    "type": "number",
    "value": 10,
    "min": 1,
    "step": 0.1,
    "thousands": false,
    "help": "Teto da nota da avaliação final (padrão 10)."
  },
  {
    "id": "c6__notaLinguagens",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Nota de Linguagens e Códigos",
    "type": "number",
    "value": 650,
    "min": 0,
    "max": 1000,
    "step": 0.1,
    "thousands": false,
    "help": "Nota da prova de Linguagens (0 a 1000)."
  },
  {
    "id": "c6__notaHumanas",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Nota de Ciências Humanas",
    "type": "number",
    "value": 680,
    "min": 0,
    "max": 1000,
    "step": 0.1,
    "thousands": false,
    "help": "Nota da prova de Ciências Humanas (0 a 1000)."
  },
  {
    "id": "c6__notaNatureza",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Nota de Ciências da Natureza",
    "type": "number",
    "value": 620,
    "min": 0,
    "max": 1000,
    "step": 0.1,
    "thousands": false,
    "help": "Nota da prova de Ciências da Natureza (0 a 1000)."
  },
  {
    "id": "c6__notaMatematica",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Nota de Matemática",
    "type": "number",
    "value": 700,
    "min": 0,
    "max": 1000,
    "step": 0.1,
    "thousands": false,
    "help": "Nota da prova de Matemática (0 a 1000)."
  },
  {
    "id": "c6__notaRedacao",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Nota da Redação",
    "type": "number",
    "value": 820,
    "min": 0,
    "max": 1000,
    "step": 0.1,
    "thousands": false,
    "help": "Nota da Redação (0 a 1000). Redação zero elimina o candidato do SiSU."
  },
  {
    "id": "c6__pesoLinguagens",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Peso de Linguagens",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 10,
    "step": 0.5,
    "thousands": false,
    "help": "Peso da área no curso escolhido (padrão 1 = média simples)."
  },
  {
    "id": "c6__pesoHumanas",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Peso de Humanas",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 10,
    "step": 0.5,
    "thousands": false,
    "help": "Peso da área no curso escolhido (padrão 1)."
  },
  {
    "id": "c6__pesoNatureza",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Peso de Natureza",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 10,
    "step": 0.5,
    "thousands": false,
    "help": "Peso da área no curso escolhido (padrão 1)."
  },
  {
    "id": "c6__pesoMatematica",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Peso de Matemática",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 10,
    "step": 0.5,
    "thousands": false,
    "help": "Peso da área no curso escolhido (padrão 1)."
  },
  {
    "id": "c6__pesoRedacao",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Peso da Redação",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 10,
    "step": 0.5,
    "thousands": false,
    "help": "Peso da Redação no curso escolhido (padrão 1)."
  },
  {
    "id": "c6__notaCorte",
    "label": "Calculadora de média ponderada do ENEM (nota de corte do SiSU): Nota de corte do curso (opcional)",
    "type": "number",
    "value": 700,
    "min": 0,
    "max": 1000,
    "step": 0.1,
    "thousands": false,
    "help": "Última nota de corte do curso no SiSU, para comparar. Deixe em branco se não souber."
  },
  {
    "id": "c7__nivel",
    "label": "Podcasts para aprender idiomas: Nível",
    "type": "select",
    "value": "a1",
    "options": [
      {
        "value": "a1",
        "label": "A1"
      },
      {
        "value": "a2",
        "label": "A2"
      },
      {
        "value": "b1",
        "label": "B1"
      },
      {
        "value": "b2",
        "label": "B2"
      },
      {
        "value": "c1",
        "label": "C1"
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
    "q": "O Duolingo realmente funciona para aprender um idioma do zero?",
    "a": "O Duolingo é eficaz para iniciantes absolutos (A1), pois constrói hábito de estudo diário e apresenta vocabulário básico de forma engajante. No entanto, um estudo da City University of New York (2012) concluiu que 34 horas no app equivalem a apenas um semestre universitário de espanhol. Para passar de A2 em diante, o Duolingo precisa ser combinado com recursos de produção oral e escrita real, como iTalki ou Preply."
  },
  {
    "q": "Qual app é melhor para quem precisa passar no TOEFL ou IELTS?",
    "a": "A combinação mais eficiente para exames de proficiência: **Anki** (vocabulário acadêmico — lista AWL com 570 famílias de palavras) + **iTalki ou Preply** com tutor certificado para treinar speaking e writing com feedback real. Nenhum app isolado prepara completamente para o nível C1 exigido (IELTS 7.0+ / TOEFL 100+)."
  },
  {
    "q": "Quantas horas de estudo por app são necessárias para subir um nível QECR?",
    "a": "Segundo o Quadro Europeu Comum de Referência (QECR): A1→A2: 80–150h; A2→B1: 180–200h; B1→B2: 200–250h; B2→C1: 250–300h; C1→C2: 300–400h. Com apps de alta eficiência (Anki + iTalki), é possível atingir essas horas em 12–18 meses estudando 1h/dia. Com Duolingo isolado, o progresso pode ser 2–3× mais lento."
  },
  {
    "q": "O Anki é realmente superior para memorização de vocabulário?",
    "a": "Sim. O Anki usa o algoritmo SM-2 de repetição espaçada (SRS), baseado na curva de esquecimento de Ebbinghaus. Estudos de memória mostram que a revisão espaçada aumenta a retenção de longo prazo para 90%+, contra 55–68% de apps por repetição por proximidade (Duolingo, Busuu). O Anki é gratuito no Android/desktop e custa USD 24,99 (pagamento único) no iOS."
  },
  {
    "q": "Vale a pena pagar por Babbel ou Busuu em vez de usar o Duolingo grátis?",
    "a": "Babbel (R$ 30–55/mês) e Busuu (R$ 25–50/mês) oferecem explicações gramaticais estruturadas, exercícios de produção escrita e, no caso do Busuu, correção por falantes nativos — recursos ausentes no Duolingo gratuito. Para usuários que querem sair do A1 e atingir B1 com gramática sólida, o investimento é justificado. Para manutenção casual de A1–A2, o Duolingo gratuito é suficiente."
  },
  {
    "q": "iTalki e Preply são a mesma coisa? Qual escolher?",
    "a": "São modelos similares (marketplace de tutores), com diferenças importantes: o **iTalki** tem maior variedade de tutores informais a preços mais baixos (a partir de USD 5–10/h) e é ideal para conversação livre. O **Preply** tem foco em professores certificados com planos de aula estruturados (USD 15–25/h), sendo mais adequado para quem precisa de progressão QECR documentada ou preparação para exames corporativos."
  },
  {
    "q": "Qual app é melhor para crianças e adolescentes?",
    "a": "Para crianças (6–12 anos), o **Duolingo** padrão e o **Duolingo ABC** são os mais indicados pela interface gamificada e sessões curtas (5–10 min). Para adolescentes (13–17 anos) com meta acadêmica, **Babbel** ou **Busuu** oferecem progressão mais estruturada. A UNESCO recomenda iniciar idiomas estrangeiros formalmente a partir dos 7–8 anos para maximizar a plasticidade neural."
  },
  {
    "q": "Existe algum app gratuito realmente eficiente para nível avançado (C1–C2)?",
    "a": "Sim: o **Anki** (gratuito no Android/desktop) com decks de vocabulário avançado (ex.: 'Frequency Dictionary' ou listas específicas por idioma) é a ferramenta mais eficiente para C1–C2 sem custo. Complementarmente, o **Language Transfer** (100% gratuito, áudio) é altamente recomendado para estrutura gramatical avançada em espanhol, italiano, árabe e outros. Para inglês avançado, podcasts nativos com transcrição (BBC Learning English, gratuito) são recursos de alta efetividade."
  },
  {
    "q": "Quantas aulas por semana são necessárias para aprender inglês do zero em 1 ano?",
    "a": "Para atingir o nível B1 em inglês (≈300–400 horas FSI para lusófonos), em 52 semanas com aulas de 60 min seriam necessárias entre 6 e 8 aulas/semana apenas com instrução 1:1. Na prática, recomenda-se **3–4 aulas/semana com tutor** + 2 horas diárias de estudo autônomo (apps, vídeos, leitura), totalizando as horas necessárias de forma sustentável."
  },
  {
    "q": "Quantas aulas por semana devo contratar no iTalki para realmente melhorar?",
    "a": "Para melhora mensurável e constante, contrate **2–3 aulas/semana de 60 min** no iTalki. Essa frequência gera repetição espaçada suficiente para consolidar vocabulário entre sessões sem esgotamento. Combine cada aula com pelo menos 30–45 min de estudo autônomo nos dias sem aula. Abaixo de 2 aulas/semana, a curva de esquecimento supera o que cada sessão agrega para a maioria dos alunos."
  },
  {
    "q": "Qual a diferença entre aulas de 30, 45 e 60 minutos? Qual vale mais a pena?",
    "a": "Aulas de 60 min são mais custo-eficientes para gramática e conversação aprofundada. Sessões de 30 min funcionam bem para revisão de vocabulário e pronúncia com alta frequência (5×/sem). Aulas de 45 min são o equilíbrio mais popular no iTalki para iniciantes. O total de horas semanais importa mais do que o formato: 3h/semana bem distribuídas superam 3h em bloco único."
  },
  {
    "q": "Com que frequência devo ter aulas se meu objetivo é apenas melhorar sem pressa?",
    "a": "Para progresso contínuo sem meta de exame ou prazo, **2 aulas/semana de 60 min é o mínimo recomendado**. Abaixo disso, o intervalo entre sessões (≥7 dias) permite que o esquecimento supere o aprendizado, tornando cada aula uma \"revisão do zero\". Com 2 aulas/semana + prática autônoma esporádica, espera-se progresso de meio nível CEFR a cada 6–8 meses."
  },
  {
    "q": "Quantas aulas por semana para um curso intensivo ou preparação para exame?",
    "a": "Para um prazo fixo — exame em 10 semanas, mudança de país em 3 meses ou certificação — mire **5–7 aulas/semana de 60 min**. Esse é o nível intensivo: exigente e caro, mas produz os resultados mais rápidos. Limite cronogramas intensivos a 4–8 semanas para evitar esgotamento; depois, reduza para o nível \"Melhorar\" (2–3/sem) para progresso sustentável."
  },
  {
    "q": "Como calcular o custo mensal de aulas com base na frequência escolhida?",
    "a": "Fórmula: **Custo mensal = (Aulas/sem × 4,33) × Preço por aula**. Exemplo: 3 aulas/sem × 4,33 semanas/mês × R$ 60/aula = R$ 779/mês. O fator 4,33 representa a média de semanas por mês (52 ÷ 12). Plataformas como iTalki cobram em dólares; use a cotação do Banco Central do Brasil (bcb.gov.br) do dia para converter."
  }
],
  sources: [
  {
    "name": "Quadro Europeu Comum de Referência para Línguas (QECR) — Conselho da Europa",
    "url": "https://www.coe.int/en/web/common-european-framework-reference-languages"
  },
  {
    "name": "U.S. Foreign Service Institute — Language Difficulty Rankings",
    "url": "https://www.state.gov/foreign-language-training/"
  },
  {
    "name": "Wikipedia PT — Repetição Espaçada (Spaced Repetition)",
    "url": "https://pt.wikipedia.org/wiki/Repeti%C3%A7%C3%A3o_espa%C3%A7ada"
  },
  {
    "name": "Wikipedia PT — Curva do esquecimento (Ebbinghaus)",
    "url": "https://pt.wikipedia.org/wiki/Curva_do_esquecimento"
  },
  {
    "name": "Wikipedia PT — Quadro Europeu Comum de Referência para Línguas (CEFR)",
    "url": "https://pt.wikipedia.org/wiki/Quadro_Europeu_Comum_de_Refer%C3%AAncia_para_as_L%C3%ADnguas"
  },
  {
    "name": "UBA — Universidad de Buenos Aires: Ciclo Básico Común (CBC)",
    "url": "https://www.uba.ar/contenido/181"
  },
  {
    "name": "UBA — Ciclo Básico Común: Site Oficial",
    "url": "https://www.uba.ar/contenido/15"
  },
  {
    "name": "Lei de Diretrizes e Bases da Educação Nacional (Lei nº 9.394/1996) — MEC/Planalto",
    "url": "https://www.planalto.gov.br/ccivil_03/leis/l9394.htm"
  },
  {
    "name": "Base Nacional Comum Curricular (BNCC) — MEC",
    "url": "http://basenacionalcomum.mec.gov.br/"
  },
  {
    "name": "Novo Ensino Médio — Lei nº 13.415/2017 — Planalto",
    "url": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13415.htm"
  },
  {
    "name": "Ministério da Educação — Educação Básica",
    "url": "https://www.gov.br/mec/pt-br/acesso-a-informacao/institucional/secretarias/secretaria-de-educacao-basica"
  },
  {
    "name": "SiSU — Portal do MEC (pesos, notas de corte e inscrição)",
    "url": "https://sisu.mec.gov.br/"
  },
  {
    "name": "INEP — ENEM (escala de notas e resultados)",
    "url": "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem"
  },
  {
    "name": "Krashen, S. — Principles and Practice in Second Language Acquisition (1982)",
    "url": "https://www.sdkrashen.com/content/books/principles_and_practice.pdf"
  },
  {
    "name": "Cambridge English — CEFR Companion Volume (2018)",
    "url": "https://www.cambridgeenglish.org/research/cefr/"
  },
  {
    "name": "Lichtman & VanPatten — Was Krashen right? Forty years later (2021, PubMed)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/"
  },
  {
    "name": "ABRALIC — Associação Brasileira de Linguística",
    "url": "https://abralic.org.br/"
  }
],
  replaces: [
    '/pt/aplicativos-idioma-efetividade-comparacao-nivel', // Absorbida como caso calculable con formulaId apps-idioma-efectividad-comparacion-nivel.
    '/pt/aulas-semanais-italki-online-frequencia', // Absorbida como caso calculable con formulaId clases-semanales-italki-online-frecuencia.
    '/pt/cbc-uba-materias-regularidade-requisitos', // Absorbida como caso calculable con formulaId cbc-uba-materias-regularidad-requisitos.
    '/pt/media-escolar-ensino-medio', // Absorbida como caso calculable con formulaId nota-promedio-bachillerato-secundario-materias.
    '/pt/media-para-passar-recuperacao-nota-necessaria', // Absorbida como caso calculable con formulaId media-para-passar-recuperacao-nota-necessaria.
    '/pt/media-ponderada-enem-nota-corte-sisu', // Absorbida como caso calculable con formulaId media-ponderada-enem-nota-corte-sisu.
    '/pt/podcasts-aprender-idioma-minutos-dia', // Absorbida como caso calculable con formulaId podcasts-aprender-idioma-minutos-diarios.
  ],
  lastReviewed: '2026-08-16',
};
