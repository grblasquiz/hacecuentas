import type { HubData } from '../types';

/**
 * Hub de decisão BR — "Como calculo essa figura?"
 *
 * Absorve as calculadoras soltas de geometria e trigonometria do mercado BR.
 * Não é YMYL nem dinheiro: TODAS as linhas do resultado usam format 'plain' ou
 * 'unit' — sem isso o runtime imprimiria áreas e senos como se fossem pesos.
 */

export const hub: HubData = {
  slug: 'pt/matematica/geometria-e-trigonometria',
  title: 'Área, volume e trigonometria: como calcular a sua figura',
  description:
    'Área de um triângulo pelos três lados (fórmula de Heron), volume e área de um cone, e seno, cosseno e tangente de um ângulo com os lados de um triângulo retângulo. Com a fórmula aberta e o passo a passo.',
  silo: 'Matemática',
  siloHref: '/pt/matematica',
  locale: 'pt',

  eyebrow: 'Matemática · geometria e trigonometria',
  h1: 'Como calculo essa figura?',
  lede:
    'Três contas resolvem quase toda a geometria que aparece na prova, na obra e na oficina: a área de um triângulo quando você só tem os três lados, o volume de um cone, e as razões trigonométricas que ligam um ângulo aos lados de um triângulo retângulo. Aqui elas estão juntas, com a fórmula à mostra e a verificação que a maioria das calculadoras esquece.',
  stamps: [
    'Fórmula de Heron · volume do cone · razões trigonométricas',
    'Verifica a desigualdade triangular antes de calcular',
    '4 calculadoras dentro',
  ],

  resultLabel: 'Resultado da figura',

  cases: {
    title: 'Qual é a sua figura?',
    intro:
      'Escolha o que você tem em mãos. Cada caso usa só os campos que precisa — os outros ficam fora da conta.',
    items: [
      {
        id: 'triangulo',
        label: 'Um triângulo com os três lados',
        hint: 'Fórmula de Heron · área sem saber a altura',
        answer:
          'Com os três lados dá para achar a área sem medir nenhuma altura: é a fórmula de Heron.',
        yes: [
          'Semiperímetro s = (a + b + c) ÷ 2',
          'Área = raiz quadrada de s × (s − a) × (s − b) × (s − c)',
          'Verificação da desigualdade triangular: cada lado tem de ser menor que a soma dos outros dois',
          'Perímetro, altura relativa a cada lado e o raio da circunferência inscrita',
          'Classificação do triângulo: acutângulo, retângulo ou obtusângulo, pelo teorema de Pitágoras',
        ],
        warn: [
          'Se os três valores não respeitam a desigualdade triangular, não existe triângulo — a raiz fica negativa e qualquer resultado seria inventado',
          'Heron perde precisão em triângulos muito "achatados" (um lado quase igual à soma dos outros dois); nesses casos use a forma estável de Kahan',
          'As três medidas têm de estar na mesma unidade antes de entrar na conta',
        ],
        plazo:
          'a área sai na unidade ao quadrado: lados em centímetros dão centímetros quadrados, lados em metros dão metros quadrados.',
      },
      {
        id: 'cone',
        label: 'Um cone',
        hint: 'Volume, área total e geratriz',
        answer:
          'O volume do cone é exatamente um terço do cilindro de mesma base e mesma altura.',
        yes: [
          'Volume = (1/3) × π × r² × h',
          'Geratriz (a lateral inclinada) = raiz quadrada de r² + h²',
          'Área lateral = π × r × geratriz e área total = π × r × (r + geratriz)',
          'Conversão para litros quando as medidas estão em centímetros (1 litro = 1.000 cm³)',
        ],
        warn: [
          'A altura é a perpendicular do vértice à base, não a geratriz — trocar as duas é o erro mais comum e infla o volume',
          'O raio é metade do diâmetro: se você mediu a boca do cone com uma régua, divida por dois',
          'A fórmula vale para o cone reto de base circular; cones oblíquos mantêm o volume, mas a área lateral muda',
        ],
        plazo:
          'volume em cm³ vira litros dividindo por 1.000; em m³ vira litros multiplicando por 1.000.',
      },
      {
        id: 'trigonometria',
        label: 'Um ângulo ou um triângulo retângulo',
        hint: 'Seno, cosseno, tangente e os lados',
        answer:
          'Seno é cateto oposto sobre hipotenusa, cosseno é cateto adjacente sobre hipotenusa e tangente é a razão entre os dois catetos.',
        yes: [
          'Seno, cosseno e tangente do ângulo, em graus ou em radianos',
          'Os três lados do triângulo retângulo a partir do ângulo e da hipotenusa',
          'Conversão entre graus e radianos',
          'Verificação da identidade fundamental: sen² + cos² = 1',
          'O ângulo complementar e a razão inversa (secante, cossecante e cotangente)',
        ],
        warn: [
          'A tangente não existe em 90° nem em 270°: o cosseno vale zero e a divisão é impossível',
          'Calculadora em modo radianos com valor em graus é o erro clássico — confira a unidade antes de aceitar o resultado',
          'Seno e cosseno sempre ficam entre −1 e 1; se der mais que isso, o dado de entrada está errado',
        ],
        plazo:
          '180 graus equivalem a π radianos; para converter, multiplique os graus por π e divida por 180.',
      },
    ],
  },

  inputsTitle: 'As medidas da sua figura',
  inputsIntro:
    'Use a mesma unidade em todos os comprimentos. O resultado sai na unidade que você escolher abaixo.',

  fields: [
    { id: 'a', label: 'Lado a do triângulo', type: 'number', value: 6, min: 0, step: 0.01 },
    { id: 'b', label: 'Lado b do triângulo', type: 'number', value: 8, min: 0, step: 0.01 },
    { id: 'c', label: 'Lado c do triângulo', type: 'number', value: 10, min: 0, step: 0.01 },
    { id: 'raio', label: 'Raio da base do cone', type: 'number', value: 5, min: 0, step: 0.01, help: 'Metade do diâmetro da boca do cone.' },
    { id: 'altura', label: 'Altura do cone', type: 'number', value: 12, min: 0, step: 0.01, help: 'A perpendicular do vértice até o centro da base. Não é a lateral inclinada.' },
    { id: 'angulo', label: 'Ângulo', type: 'number', value: 30, min: -3600, max: 3600, step: 0.0001 },
    {
      id: 'unidadeAngulo',
      label: 'O ângulo está em',
      type: 'select',
      value: 'graus',
      options: [
        { value: 'graus', label: 'Graus' },
        { value: 'rad', label: 'Radianos' },
      ],
    },
    { id: 'hipotenusa', label: 'Hipotenusa do triângulo retângulo', type: 'number', value: 10, min: 0, step: 0.01, help: 'Usada para achar os catetos a partir do ângulo.' },
    {
      id: 'unidade',
      label: 'Unidade dos comprimentos',
      type: 'select',
      value: 'cm',
      options: [
        { value: 'cm', label: 'Centímetros' },
        { value: 'm', label: 'Metros' },
        { value: 'mm', label: 'Milímetros' },
        { value: 'in', label: 'Polegadas' },
      ],
    },
  ],

  fineprint:
    'Conta de geometria, sem arredondamento escondido: os valores saem com quatro casas e as fórmulas estão à mostra em cada linha. Se o triângulo não existe, o hub avisa em vez de devolver um número.',

  chart: {
    type: 'donut',
    title: 'Composição da figura',
    caption:
      'No triângulo, cada fatia é o peso de um lado no perímetro — três fatias iguais significam triângulo equilátero. No cone, o gráfico compara o volume do cone com o que sobra do cilindro de mesma base e altura: o cone é sempre um terço. Na trigonometria, as fatias são os dois catetos.',
  },

  breakdownTitle: 'A conta, passo a passo',
  breakdownIntro:
    'Cada linha traz a fórmula que gerou o número, para você conferir na prova ou refazer na mão.',

  faq: [
    {
      q: 'O que é a fórmula de Heron e quando ela serve?',
      a: 'É a fórmula que dá a área de um triângulo qualquer conhecendo apenas os três lados, sem precisar de altura nem de ângulo. Primeiro calcula-se o semiperímetro s = (a + b + c) ÷ 2 e depois a área = √(s(s−a)(s−b)(s−c)). Serve exatamente nos casos em que a altura é difícil de medir: um terreno irregular, uma peça de chapa, um triângulo desenhado num mapa. Foi descrita por Heron de Alexandria no século I, mas os babilônios já usavam relações equivalentes.',
    },
    {
      q: 'Por que às vezes aparece "triângulo inválido"?',
      a: 'Porque os três valores não respeitam a desigualdade triangular: cada lado precisa ser menor que a soma dos outros dois. Com lados 2, 3 e 10, por exemplo, os lados de 2 e 3 juntos não alcançam o de 10 — as pontas nunca se encontram e a figura não fecha. Nesses casos, o produto s(s−a)(s−b)(s−c) fica negativo e a raiz quadrada não existe nos números reais. Uma calculadora que devolve um número aí está mentindo.',
    },
    {
      q: 'Como sei se o meu triângulo é retângulo?',
      a: 'Pelo teorema de Pitágoras aplicado ao maior lado: se o quadrado do maior lado for igual à soma dos quadrados dos outros dois, o triângulo é retângulo. Se for menor, é acutângulo (todos os ângulos abaixo de 90°); se for maior, é obtusângulo (um ângulo acima de 90°). Com lados 6, 8 e 10: 100 = 36 + 64, então é retângulo — e a área de 24 pode ser conferida pela fórmula simples base × altura ÷ 2, já que os catetos são a base e a altura.',
    },
    {
      q: 'Qual a diferença entre altura e geratriz num cone?',
      a: 'A altura é a distância perpendicular do vértice até o plano da base, medida por dentro do cone. A geratriz é a lateral inclinada, do vértice até a borda da base, medida por fora. Elas formam um triângulo retângulo com o raio, então geratriz = √(r² + h²) e a geratriz é sempre maior que a altura. O volume usa a altura; a área lateral usa a geratriz. Trocar as duas é o erro mais comum e superestima o volume.',
    },
    {
      q: 'Por que o volume do cone é um terço do cilindro?',
      a: 'Porque a área da seção do cone diminui com o quadrado da distância ao vértice, e integrar essa área ao longo da altura dá exatamente um terço do produto área da base × altura. Dá para verificar sem cálculo: encha um cone e despeje num cilindro de mesma base e altura — cabem três cones exatos. A mesma proporção vale para qualquer pirâmide em relação ao prisma de mesma base e altura.',
    },
    {
      q: 'Como converto o volume em litros?',
      a: 'Um litro é exatamente 1.000 cm³, ou seja, um cubo de 10 cm de lado. Se as suas medidas estão em centímetros, divida o volume por 1.000 para obter litros. Se estão em metros, o volume sai em m³ e cada m³ vale 1.000 litros, então multiplique por 1.000. Um cone de 5 cm de raio e 12 cm de altura tem cerca de 314 cm³, ou 0,314 litro.',
    },
    {
      q: 'Como converto graus em radianos?',
      a: 'Multiplique os graus por π e divida por 180 — meia volta (180°) equivale a π radianos, e a volta completa (360°) a 2π. Assim, 30° = π/6 ≈ 0,5236 rad, 45° = π/4 ≈ 0,7854 rad e 90° = π/2 ≈ 1,5708 rad. Para o caminho inverso, multiplique os radianos por 180 e divida por π. Praticamente toda linguagem de programação (JavaScript, Python, Excel com a função RADIANOS) usa radianos nas funções trigonométricas, não graus.',
    },
    {
      q: 'Por que a tangente de 90° não existe?',
      a: 'Porque a tangente é o seno dividido pelo cosseno, e em 90° o cosseno vale exatamente zero. Dividir por zero não está definido. À medida que o ângulo se aproxima de 90° por baixo, a tangente cresce sem limite (tende a +∞); por cima, ela vem de −∞. Geometricamente, a tangente é o comprimento do segmento tangente ao círculo unitário, que se torna paralelo ao eixo e nunca cruza.',
    },
    {
      q: 'O que é a identidade fundamental sen² + cos² = 1?',
      a: 'É o teorema de Pitágoras aplicado ao círculo de raio 1. Um ponto do círculo unitário tem coordenadas (cos θ, sen θ), e a distância dele à origem é 1 — logo cos²θ + sen²θ = 1, para qualquer ângulo. Ela serve como verificação: se você calculou seno e cosseno e a soma dos quadrados não dá 1, algum dos dois está errado. Dela saem também 1 + tg² = sec² e 1 + cotg² = cossec².',
    },
    {
      q: 'Como acho os lados de um triângulo retângulo só com um ângulo?',
      a: 'Precisa do ângulo e de um lado. Com a hipotenusa h e o ângulo θ: cateto oposto = h × sen θ e cateto adjacente = h × cos θ. Com um cateto: o outro cateto = cateto conhecido × tg θ (ou ÷ tg θ, dependendo de qual você tem) e a hipotenusa = cateto oposto ÷ sen θ. A regra mnemônica brasileira é SOH-CAH-TOA: Seno = Oposto/Hipotenusa, Cosseno = Adjacente/Hipotenusa, Tangente = Oposto/Adjacente.',
    },
    {
      q: 'A área sai em qual unidade?',
      a: 'Na unidade dos lados, elevada ao quadrado. Lados em centímetros dão área em cm² e volume em cm³; lados em metros dão m² e m³. O que não pode é misturar: se um lado está em metros e outro em centímetros, converta tudo para a mesma unidade antes de calcular. Converter área depois exige cuidado — 1 m² são 10.000 cm², não 100.',
    },
    {
      q: 'Dá para calcular a área de um polígono qualquer com isso?',
      a: 'Dá, dividindo o polígono em triângulos. Qualquer polígono de n lados pode ser recortado em n−2 triângulos traçando diagonais a partir de um vértice; calcule a área de cada um por Heron e some. É exatamente assim que se mede um terreno irregular com trena: divide-se em triângulos, medem-se os três lados de cada um e somam-se as áreas. Para polígonos definidos por coordenadas, a fórmula do "cadarço" (shoelace) é mais direta.',
    },
  ],

  sources: [
    {
      name: 'Base Nacional Comum Curricular — Matemática (geometria e trigonometria no Ensino Médio)',
      url: 'http://basenacionalcomum.mec.gov.br/abase/',
      publisher: 'Ministério da Educação',
    },
    {
      name: 'NIST Digital Library of Mathematical Functions — funções trigonométricas',
      url: 'https://dlmf.nist.gov/4.14',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'Sistema Internacional de Unidades — relação entre litro e metro cúbico',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'BIPM — Bureau International des Poids et Mesures',
    },
    {
      name: 'W. Kahan — "Miscalculating Area and Angles of a Needle-like Triangle" (estabilidade numérica da fórmula de Heron)',
      url: 'https://people.eecs.berkeley.edu/~wkahan/Triangle.pdf',
      publisher: 'University of California, Berkeley',
    },
  ],

  replaces: [
    '/pt/area-triangulo-heron-tres-lados',
    '/pt/volume-cone-raio-altura',
    '/pt/seno-cosseno-tangente-angulo-triangulo',
    // Absorvida só por URL (301): álgebra linear, não geometria plana. Ver relatório.
    '/pt/determinante-inversa-matriz-2x2',
  ],

  lastReviewed: '2026-07-28',
};
