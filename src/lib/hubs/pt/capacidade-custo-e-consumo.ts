import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pt/vida/capacidade-custo-e-consumo',
  title: "Custo por token, bitrate de streaming e bateria em horas",
  description: "Custo de API por token (ChatGPT, Claude, Gemini), bitrate para streaming, autonomia de bateria em horas, PC gamer por FPS e tempo de transferência USB.",
  silo: "Tecnologia",
  siloHref: '/pt/vida',
  locale: 'pt',
  eyebrow: "Brasil · Tecnologia",
  h1: "Quanto custa, consome ou demora minha tecnologia?",
  lede: "Escolha o seu caso e preencha apenas os campos correspondentes. Este hub preserva as 11 fórmulas originais e reúne a decisão numa só página.",
  stamps: ['11 calculadoras incluídas', 'Fórmulas originais reutilizadas', 'Revisto em 28/07/2026'],
  resultLabel: "Seu resultado",
  cases: { title: "O que precisa calcular?", intro: "Escolha um caso; o hub aplica a fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de bitrate para streaming (YouTube, Twitch, Kick)",
    "hint": "Para transmitir em 1080p60 no YouTube o bitrate recomendado é 8.000 kbps (faixa oficial 4.500–9.000 kbps) e você precisa de cerca de 10 Mbps de upload estável. Na Twitch o limite é 6.000 kbps para todos; na Kick dá para chegar a 8.000 kbps. Em 720p bastam 5.000 kbps e ~6,4 Mbps de subida. Regra do upload: (bitrate + 0,32 Mbps de áudio) × 1,2.",
    "yes": [
      "1080p60 no YouTube = **8.000 kbps** (faixa oficial 4.500–9.000), upload mínimo **10 Mbps**. Twitch limita a **6.000 kbps** para todos. Regra do upload: **(bitrate + 0,32 Mbps de áudio) × 1,2**. Para 4K60 no YouTube são necessários **40.000 kbps** e ~48 Mbps de subida."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "Para transmitir em 1080p60 no YouTube o bitrate recomendado é 8.000 kbps (faixa oficial 4.500–9.000 kbps) e você precisa de cerca de 10 Mbps de upload estável. Na Twitch o limite é 6.000 kbps para todos; na Kick dá para chegar a 8.000 kbps. Em 720p bastam 5.000 kbps e ~6,4 Mbps de subida. Regra do upload: (bitrate + 0,32 Mbps de áudio) × 1,2."
  },
  {
    "id": "c2",
    "label": "Autonomia de Bateria em Horas (Ah e Watts)",
    "hint": "Autonomia (horas) = (Ah × V × DoD × η) ÷ W. Exemplo: bateria 100 Ah / 12 V, DoD 80%, eficiência 95%, carga 100 W → **9,1 horas**. Baterias chumbo-ácido: use DoD ≤ 50%. LiFePO4: use DoD ≤ 80–90%.",
    "yes": [
      "**Autonomia (h) = (Ah × V × DoD × η) ÷ W** — Ex.: bateria 100 Ah / 12 V, DoD 80%, η 95%, carga 100 W → **(100 × 12 × 0,80 × 0,95) ÷ 100 = 9,12 horas** de operação contínua."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "Autonomia (horas) = (Ah × V × DoD × η) ÷ W. Exemplo: bateria 100 Ah / 12 V, DoD 80%, eficiência 95%, carga 100 W → **9,1 horas**. Baterias chumbo-ácido: use DoD ≤ 50%. LiFePO4: use DoD ≤ 80–90%."
  },
  {
    "id": "c3",
    "label": "Claude vs Gemini vs GPT-4o: Comparação de Preço por Token",
    "hint": "Compare os custos reais de usar Claude (Anthropic), Gemini (Google) e GPT-4o (OpenAI) com base no seu volume mensal de tokens. A fórmula é direta mas os resultados surpreendem: Custo mensal (USD) = (Tokens de entrada em milhões × Preço entrada por MTok) + (Tokens de saída em milhões × Preço saída por MTok).",
    "yes": [
      "**Custo = (Entrada_M × $/MTok_entrada) + (Saída_M × $/MTok_saída)** — exemplo com Claude Sonnet: (10 × $3,00) + (5 × $15,00) = **$105,00/mês**. O mesmo volume no Gemini Pro = (10 × $3,50) + (5 × $10,50) = **$87,50/mês**. O modelo mais barato depende do seu ratio input/output."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "Compare os custos reais de usar Claude (Anthropic), Gemini (Google) e GPT-4o (OpenAI) com base no seu volume mensal de tokens. A fórmula é direta mas os resultados surpreendem: Custo mensal (USD) = (Tokens de entrada em milhões × Preço entrada por MTok) + (Tokens de saída em milhões × Preço saída por MTok)."
  },
  {
    "id": "c4",
    "label": "CO₂ por E-mail: Quanto Emite uma Mensagem com e sem Anexo",
    "hint": "Um e-mail de texto simples emite cerca de **4 g de CO₂**, enquanto um e-mail com anexo típico (1–5 MB) emite **50 g de CO₂** — 12 vezes mais. Enviar 100 e-mails/dia com 20% de anexos gera aproximadamente **482 kg de CO₂ por ano** — equivalente a dirigir um carro a gasolina por ~2.100 km. Esses valores consideram energia dos servidores, redes de dados e dispositivos dos usuários.",
    "yes": [
      "**CO₂ total/dia = (e-mails sem anexo × 4 g) + (e-mails com anexo × 50 g)** — ex.: 100 e-mails/dia com 20% de anexos = 1.320 g ≈ **482 kg CO₂/ano**."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Um e-mail de texto simples emite cerca de **4 g de CO₂**, enquanto um e-mail com anexo típico (1–5 MB) emite **50 g de CO₂** — 12 vezes mais. Enviar 100 e-mails/dia com 20% de anexos gera aproximadamente **482 kg de CO₂ por ano** — equivalente a dirigir um carro a gasolina por ~2.100 km. Esses valores consideram energia dos servidores, redes de dados e dispositivos dos usuários."
  },
  {
    "id": "c5",
    "label": "Quanto custa o Midjourney por mês?",
    "hint": "O Midjourney tem 4 planos mensais em 2026: Basic USD 10 (~3,3h de GPU rápida, sem modo Relaxed), Standard USD 30 (15h de GPU rápida + Relaxed ilimitado), Pro USD 60 (30h + Relaxed + modo stealth) e Mega USD 120 (60h + stealth). O plano anual dá 20% de desconto e horas extras de GPU custam USD 4/hora em qualquer plano. Não há teste grátis. O Standard (USD 30/mês) é o melhor custo-benefício para a maioria.",
    "yes": [
      "**Planos 2026 em resumo**: Basic USD 10 (3,3h GPU rápida, sem Relaxed), Standard USD 30 (15h + Relaxed ilimitado), Pro USD 60 (30h + Relaxed + stealth), Mega USD 120 (60h + stealth). Todos com uso comercial. Plano anual: -20%. Hora extra de GPU: USD 4/h."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "O Midjourney tem 4 planos mensais em 2026: Basic USD 10 (~3,3h de GPU rápida, sem modo Relaxed), Standard USD 30 (15h de GPU rápida + Relaxed ilimitado), Pro USD 60 (30h + Relaxed + modo stealth) e Mega USD 120 (60h + stealth). O plano anual dá 20% de desconto e horas extras de GPU custam USD 4/hora em qualquer plano. Não há teste grátis. O Standard (USD 30/mês) é o melhor custo-benefício para a maioria."
  },
  {
    "id": "c6",
    "label": "Quanto papel você economiza imprimindo frente e verso?",
    "hint": "Imprimir frente e verso (duplex) economiza exatamente 50% das folhas físicas em relação à impressão simples. A fórmula é: **Folhas poupadas/ano = (folhas/semana × 52) ÷ 2**. Exemplo: 50 folhas/semana → 1.300 folhas/ano economizadas, equivalente a cerca de 0,13 árvore de eucalipto (fator padrão: ~10.000 folhas A4 75 g/m² por árvore adulta).",
    "yes": [
      "**Folhas poupadas/ano = (folhas/semana × 52) ÷ 2** — ex.: 50 folhas/sem → 1.300 folhas/ano ≈ 0,13 árvores de eucalipto economizadas sem custo adicional."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Imprimir frente e verso (duplex) economiza exatamente 50% das folhas físicas em relação à impressão simples. A fórmula é: **Folhas poupadas/ano = (folhas/semana × 52) ÷ 2**. Exemplo: 50 folhas/semana → 1.300 folhas/ano economizadas, equivalente a cerca de 0,13 árvore de eucalipto (fator padrão: ~10.000 folhas A4 75 g/m² por árvore adulta)."
  },
  {
    "id": "c7",
    "label": "PC Gamer Preço e Orçamento por FPS",
    "hint": "Esta calculadora estima o orçamento necessário para montar um PC gamer em 2026, considerando sua meta de FPS (quadros por segundo) e a resolução-alvo. A fórmula central parte do binômio GPU+CPU, que representa entre 60% e 70% do custo total de qualquer build gamer.",
    "yes": [
      "**Orçamento total = (GPU + CPU) ÷ 0,65** — para 1080p/144 FPS isso resulta em ≈USD 960; para 1440p/144 FPS ≈USD 1.540; para 4K/60 FPS ≈USD 2.150."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "Esta calculadora estima o orçamento necessário para montar um PC gamer em 2026, considerando sua meta de FPS (quadros por segundo) e a resolução-alvo. A fórmula central parte do binômio GPU+CPU, que representa entre 60% e 70% do custo total de qualquer build gamer."
  },
  {
    "id": "c8",
    "label": "Calcular ângulo do servo a partir do pulso PWM",
    "hint": "Para um servo RC padrão (faixa 180°): **Ângulo = (pulso_ms − 1,0) × 180**. Exemplos: 1,0 ms = 0°, 1,5 ms = 90° (centro), 2,0 ms = 180°. Para converter ms em µs para o Arduino: `servo.writeMicroseconds(pulso_ms × 1000)`. Fórmula inversa: pulso_ms = (ângulo / faixa) + 1,0.",
    "yes": [
      "**Ângulo = (pulso_ms − 1,0) × faixa_°** — Ex.: 1,75 ms em servo 180° → (1,75 − 1,0) × 180 = **135°**. Fórmula inversa: pulso_ms = (ângulo / faixa) + 1,0."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Para um servo RC padrão (faixa 180°): **Ângulo = (pulso_ms − 1,0) × 180**. Exemplos: 1,0 ms = 0°, 1,5 ms = 90° (centro), 2,0 ms = 180°. Para converter ms em µs para o Arduino: `servo.writeMicroseconds(pulso_ms × 1000)`. Fórmula inversa: pulso_ms = (ângulo / faixa) + 1,0."
  },
  {
    "id": "c9",
    "label": "Passos por Revolução e Microstepping: NEMA 17, NEMA 23 e Drivers A4988",
    "hint": "Um motor stepper de 1,8°/passo (padrão NEMA 17) tem 200 passos por revolução em modo full-step. Fórmula: passos/rev = (360 ÷ ângulo_por_passo) × fator_microstep. Com microstepping 1/16: 200 × 16 = 3.200 passos/rev (8,89 passos por grau).",
    "yes": [
      "**Passos/rev = (360 ÷ ângulo_por_passo) × fator_microstep** — ex.: motor 1,8° com 1/16 microstepping = (360 ÷ 1,8) × 16 = **3200 passos/revolução**, equivalente a 8,89 passos por grau."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-06-04.",
    "answer": "Um motor stepper de 1,8°/passo (padrão NEMA 17) tem 200 passos por revolução em modo full-step. Fórmula: passos/rev = (360 ÷ ângulo_por_passo) × fator_microstep. Com microstepping 1/16: 200 × 16 = 3.200 passos/rev (8,89 passos por grau)."
  },
  {
    "id": "c10",
    "label": "Custo API OpenAI: Tokens ChatGPT e GPT-4",
    "hint": "Esta calculadora estima o custo mensal de uso da API da OpenAI (ChatGPT/GPT-4) com base no volume de tokens de entrada e saída processados. O modelo de cobrança da OpenAI é baseado em tokens — unidades de texto equivalentes a ~4 caracteres ou ¾ de uma palavra em inglês.",
    "yes": [
      "**Custo mensal = (M tokens entrada × USD/1M entrada) + (M tokens saída × USD/1M saída).** Exemplo real: 10M tokens entrada + 5M saída no GPT-4o ≈ USD 50 + USD 100 = **USD 150/mês** (preços de 2025)."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-20.",
    "answer": "Esta calculadora estima o custo mensal de uso da API da OpenAI (ChatGPT/GPT-4) com base no volume de tokens de entrada e saída processados. O modelo de cobrança da OpenAI é baseado em tokens — unidades de texto equivalentes a ~4 caracteres ou ¾ de uma palavra em inglês."
  },
  {
    "id": "c11",
    "label": "Quanto Tempo Demora uma Transferência USB?",
    "hint": "Tempo de transferência USB = tamanho do arquivo (MB) ÷ velocidade real (MB/s). Velocidades práticas: USB 2.0 ≈ 35 MB/s, USB 3.0 ≈ 400 MB/s, USB 3.1 Gen 2 ≈ 800 MB/s, USB 3.2 Gen 2×2 ≈ 1.500 MB/s, USB 4 ≈ 3.500 MB/s. Um arquivo de 10 GB leva ~25 segundos no USB 3.0 e ~4 minutos no USB 2.0.",
    "yes": [
      "**Tempo (s) = Tamanho (MB) ÷ Velocidade real (MB/s)**. USB 2.0: ~35 MB/s real. USB 3.0: ~400 MB/s real. USB 4: ~3.500 MB/s real. A velocidade real é ~70% da teórica por overhead de protocolo."
    ],
    "warn": [
      "Resultado informativo: confira os dados de entrada e a fonte aplicável."
    ],
    "plazo": "Dados revistos em 2026-04-18.",
    "answer": "Tempo de transferência USB = tamanho do arquivo (MB) ÷ velocidade real (MB/s). Velocidades práticas: USB 2.0 ≈ 35 MB/s, USB 3.0 ≈ 400 MB/s, USB 3.1 Gen 2 ≈ 800 MB/s, USB 3.2 Gen 2×2 ≈ 1.500 MB/s, USB 4 ≈ 3.500 MB/s. Um arquivo de 10 GB leva ~25 segundos no USB 3.0 e ~4 minutos no USB 2.0."
  }
] },
  inputsTitle: "Seus dados",
  inputsIntro: "Os campos indicam a qual caso pertencem; os demais são ignorados.",
  fields: [
  {
    "id": "c1__resolucion",
    "label": "Calculadora de bitrate para streaming (YouTube, Twitch, Kick): Resolução e FPS",
    "type": "select",
    "value": "1080p_60",
    "options": [
      {
        "value": "720p",
        "label": "720p"
      },
      {
        "value": "1080p_30",
        "label": "1080p 30fps"
      },
      {
        "value": "1080p_60",
        "label": "1080p 60fps"
      },
      {
        "value": "1440p",
        "label": "1440p (2K)"
      },
      {
        "value": "4k",
        "label": "4K (2160p)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__plataforma",
    "label": "Calculadora de bitrate para streaming (YouTube, Twitch, Kick): Plataforma",
    "type": "select",
    "value": "youtube",
    "options": [
      {
        "value": "youtube",
        "label": "YouTube"
      },
      {
        "value": "twitch",
        "label": "Twitch"
      },
      {
        "value": "kick",
        "label": "Kick"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__ah",
    "label": "Autonomia de Bateria em Horas (Ah e Watts): Capacidade da bateria (Ah)",
    "type": "number",
    "value": 100,
    "thousands": false
  },
  {
    "id": "c2__v",
    "label": "Autonomia de Bateria em Horas (Ah e Watts): Tensão da bateria (V)",
    "type": "number",
    "value": 12,
    "thousands": false
  },
  {
    "id": "c2__consumo",
    "label": "Autonomia de Bateria em Horas (Ah e Watts): Consumo do equipamento (W)",
    "type": "number",
    "value": 100,
    "thousands": false
  },
  {
    "id": "c2__dod",
    "label": "Autonomia de Bateria em Horas (Ah e Watts): Profundidade de descarga máxima — DoD (%)",
    "type": "number",
    "value": 80,
    "min": 10,
    "max": 100,
    "thousands": false,
    "help": "50% para chumbo-ácido, 80–90% para LiFePO4. Nunca use 100%."
  },
  {
    "id": "c2__eficiencia",
    "label": "Autonomia de Bateria em Horas (Ah e Watts): Eficiência do inversor / sistema (%)",
    "type": "number",
    "value": 95,
    "thousands": false,
    "help": "Inversor senoidal puro: 90–96%. Carga DC direta (sem inversor): 99–100%."
  },
  {
    "id": "c3__modelo",
    "label": "Claude vs Gemini vs GPT-4o: Comparação de Preço por Token: Modelo",
    "type": "select",
    "value": "claude_sonnet",
    "options": [
      {
        "value": "claude_sonnet",
        "label": "Claude Sonnet — $3,00/$15,00 por MTok"
      },
      {
        "value": "claude_opus",
        "label": "Claude Opus — $15,00/$75,00 por MTok"
      },
      {
        "value": "gemini_pro",
        "label": "Gemini Pro — $3,50/$10,50 por MTok"
      },
      {
        "value": "gemini_ultra",
        "label": "Gemini Ultra — $7,00/$21,00 por MTok"
      },
      {
        "value": "gpt_4o",
        "label": "GPT-4o — $5,00/$15,00 por MTok"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__tokensEntrada",
    "label": "Claude vs Gemini vs GPT-4o: Comparação de Preço por Token: Tokens de entrada",
    "type": "number",
    "value": 10,
    "min": 0.01,
    "max": 10000,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__tokensSalida",
    "label": "Claude vs Gemini vs GPT-4o: Comparação de Preço por Token: Tokens de saída",
    "type": "number",
    "value": 5,
    "min": 0.01,
    "max": 10000,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__emailsPorDia",
    "label": "CO₂ por E-mail: Quanto Emite uma Mensagem com e sem Anexo: E-mails por dia",
    "type": "number",
    "value": 100,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c4__porcentajeConAdjunto",
    "label": "CO₂ por E-mail: Quanto Emite uma Mensagem com e sem Anexo: % com anexo",
    "type": "number",
    "value": 20,
    "max": 100,
    "step": 0.01,
    "thousands": false,
    "help": "Informe como percentual (ex.: 20 para 20%)."
  },
  {
    "id": "c5__plan",
    "label": "Quanto custa o Midjourney por mês?: Plano Midjourney",
    "type": "select",
    "value": "standard",
    "options": [
      {
        "value": "basic",
        "label": "Basic — USD 10/mês"
      },
      {
        "value": "standard",
        "label": "Standard — USD 30/mês"
      },
      {
        "value": "pro",
        "label": "Pro — USD 60/mês"
      },
      {
        "value": "mega",
        "label": "Mega — USD 120/mês"
      }
    ],
    "thousands": false
  },
  {
    "id": "c6__hojasSem",
    "label": "Quanto papel você economiza imprimindo frente e verso?: Folhas impressas por semana (média)",
    "type": "number",
    "value": 50,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c7__objetivoFps",
    "label": "PC Gamer Preço e Orçamento por FPS: Objetivo de FPS",
    "type": "select",
    "value": "60_1080p",
    "options": [
      {
        "value": "60_1080p",
        "label": "60 FPS em 1080p"
      },
      {
        "value": "144_1080p",
        "label": "144 FPS em 1080p"
      },
      {
        "value": "60_4k",
        "label": "60 FPS em 4K"
      },
      {
        "value": "144_1440p",
        "label": "144 FPS em 1440p"
      },
      {
        "value": "240_competitive",
        "label": "240 FPS competitivo"
      }
    ],
    "thousands": false
  },
  {
    "id": "c7__anoJuegos",
    "label": "PC Gamer Preço e Orçamento por FPS: Ano de lançamento",
    "type": "number",
    "value": 2026,
    "step": 0.01,
    "thousands": false,
    "help": "Contribuição social (tipicamente 3%)."
  },
  {
    "id": "c8__pulso",
    "label": "Calcular ângulo do servo a partir do pulso PWM: Largura do pulso (ms)",
    "type": "number",
    "value": 1.5,
    "min": 0.5,
    "max": 2.5,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c8__rango",
    "label": "Calcular ângulo do servo a partir do pulso PWM: Faixa do servo (°)",
    "type": "number",
    "value": 180,
    "thousands": false
  },
  {
    "id": "c9__angulo",
    "label": "Passos por Revolução e Microstepping: NEMA 17, NEMA 23 e Drivers A4988: Ângulo por passo (°)",
    "type": "number",
    "value": 1.8,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c9__microstep",
    "label": "Passos por Revolução e Microstepping: NEMA 17, NEMA 23 e Drivers A4988: Microstepping",
    "type": "select",
    "value": "1",
    "options": [
      {
        "value": "1",
        "label": "Full step (1/1)"
      },
      {
        "value": "2",
        "label": "Half step (1/2)"
      },
      {
        "value": "4",
        "label": "1/4"
      },
      {
        "value": "8",
        "label": "1/8"
      },
      {
        "value": "16",
        "label": "1/16"
      },
      {
        "value": "32",
        "label": "1/32"
      }
    ],
    "thousands": false,
    "help": "O driver subdivide cada passo completo modulando a corrente nas bobinas. Drivers comuns: A4988 (máx. 1/16), DRV8825 (máx. 1/32), TMC2209 (máx. 1/256)."
  },
  {
    "id": "c10__tokensEntrada",
    "label": "Custo API OpenAI: Tokens ChatGPT e GPT-4: Tokens de entrada (M)",
    "type": "number",
    "value": 10,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c10__tokensSalida",
    "label": "Custo API OpenAI: Tokens ChatGPT e GPT-4: Tokens de saída (M)",
    "type": "number",
    "value": 5,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c10__modelo",
    "label": "Custo API OpenAI: Tokens ChatGPT e GPT-4: Modelo",
    "type": "select",
    "value": "gpt_4_turbo",
    "options": [
      {
        "value": "gpt_4_turbo",
        "label": "gpt_4_turbo"
      },
      {
        "value": "gpt_4",
        "label": "gpt_4"
      },
      {
        "value": "gpt_35_turbo",
        "label": "gpt_35_turbo"
      },
      {
        "value": "gpt_4o",
        "label": "gpt_4o"
      }
    ],
    "thousands": false
  },
  {
    "id": "c11__tamano",
    "label": "Quanto Tempo Demora uma Transferência USB?: Tamanho do arquivo (GB)",
    "type": "number",
    "value": 10,
    "thousands": false
  },
  {
    "id": "c11__version",
    "label": "Quanto Tempo Demora uma Transferência USB?: Versão USB",
    "type": "select",
    "value": "3.0",
    "options": [
      {
        "value": "2.0",
        "label": "USB 2.0 (480 Mbps, ~35 MB/s real)"
      },
      {
        "value": "3.0",
        "label": "USB 3.0 / 3.1 Gen 1 (5 Gbps, ~400 MB/s real)"
      },
      {
        "value": "3.1",
        "label": "USB 3.1 Gen 2 (10 Gbps, ~800 MB/s real)"
      },
      {
        "value": "3.2",
        "label": "USB 3.2 Gen 2×2 (20 Gbps, ~1.500 MB/s real)"
      },
      {
        "value": "4.0",
        "label": "USB 4 (40 Gbps, ~3.500 MB/s real)"
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
    "q": "Qual bitrate usar para transmitir em 1080p 60fps no YouTube?",
    "a": "O YouTube recomenda oficialmente entre <strong>4.500 e 9.000 kbps</strong> (4,5 a 9 Mbps) para 1080p60 com H.264 em CBR. O ponto que esta calculadora recomenda é <strong>8.000 kbps</strong>, que dá margem de qualidade sem saturar uma fibra residencial. Se você faz games com muito movimento (shooters, corridas), 8.000–9.000 kbps evita o macroblocking nas cenas rápidas. Se seu upload é baixo (menos de 12 Mbps estável), fique em 6.000 kbps. Para 8.000 kbps você precisa de pelo menos 10 Mbps de subida estável."
  },
  {
    "q": "Qual é o bitrate máximo permitido na Twitch, YouTube e Kick?",
    "a": "A <strong>Twitch</strong> aplica um limite rígido de <strong>6.000 kbps</strong> para usuários padrão e até 8.500 kbps para alguns Parceiros; se ultrapassar, o servidor de ingestão rejeita o stream. O <strong>YouTube Live</strong> aceita até <strong>51.000 kbps</strong> (51 Mbps) para 4K60 HDR, sem limite agressivo em resoluções menores, e transcodifica tudo (mais bitrate de origem = melhor qualidade para o espectador). A <strong>Kick</strong> não tem limite publicado oficialmente e aceita confortavelmente até ~8.000 kbps em 1080p. Para produção profissional ou eventos, o YouTube é a opção com mais margem."
  },
  {
    "q": "Quanto de upload de internet preciso para transmitir?",
    "a": "A regra desta calculadora é: <strong>Upload mínimo = (bitrate + 0,32 Mbps de áudio) × 1,2</strong>. Esses 20% extras cobrem overhead de protocolos RTMP/TCP, pacotes duplicados e variações de rede. Para 1080p60 a 8.000 kbps você precisa de <strong>10 Mbps de upload estável</strong>; para 720p a 5.000 kbps, ~6,4 Mbps. Uma fibra residencial de 30 Mbps de subida cobre até 1440p60 com folga. Teste sua velocidade de <strong>upload</strong> (não a de download) e faça isso em horário de pico, pois o upload cai quando a rede está congestionada."
  },
  {
    "q": "Qual a diferença entre H.264, H.265 e AV1 para streaming?",
    "a": "<strong>H.264 (AVC)</strong>: o padrão universal de 2026. Compatível com todas as plataformas (OBS, Streamlabs, vMix) e todos os dispositivos. Exige ~0,10 bits por pixel por frame. <strong>H.265 (HEVC)</strong>: 30–40% mais eficiente (mesmo bitrate = melhor qualidade, ou mesma qualidade com menos bitrate). Ideal para gravações e VoD, mas o suporte em live é parcial. <strong>AV1</strong>: o futuro, até 50% mais eficiente que o H.264; o Google o impulsiona no YouTube. Exige hardware recente (NVIDIA RTX 4000+, AMD RX 7000+, Intel Arc). Em live, o H.264 segue sendo a opção segura em 2026."
  },
  {
    "q": "É melhor 1080p 30fps ou 720p 60fps com a mesma banda?",
    "a": "Depende do conteúdo. <strong>Games, esportes, movimento rápido → 720p60fps</strong>: a fluidez de 60fps é percebida mais do que os pixels extras; um shooter a 720p60 parece mais profissional que a 1080p30. <strong>Tutoriais, podcast, palestras, arte digital → 1080p30fps</strong>: com pouco movimento, a resolução pesa mais que os FPS. A boa notícia é que ambas consomem bitrate parecido (5.000–6.000 kbps). Não há resposta universal: games puros → prioridade aos FPS; talking head → prioridade à resolução."
  },
  {
    "q": "CBR ou VBR para transmissão ao vivo?",
    "a": "Para live, o <strong>CBR (Constant Bitrate)</strong> é obrigatório: o encoder mantém exatamente o mesmo bitrate o tempo todo, que é o que as plataformas esperam de um fluxo ao vivo. O <strong>VBR (Variable Bitrate)</strong> aloca mais bits nas cenas com mais movimento; num pico de complexidade (uma explosão num jogo) o bitrate sobe e pode saturar o upload, causando travamentos. O VBR é ideal para gravações locais e VoD porque maximiza qualidade por GB, mas nunca para transmitir ao vivo. No OBS: Configurações → Saída → Controle de taxa = CBR."
  },
  {
    "q": "O que é o keyframe interval e como configurá-lo no OBS?",
    "a": "O keyframe interval (ou GOP, Group of Pictures) define a cada quantos quadros é enviado um frame completo em vez de apenas as mudanças. <strong>YouTube e Twitch exigem um keyframe a cada 2 segundos</strong>: a 60fps o GOP é 120; a 30fps, 60. Se você colocar um valor maior (por exemplo 10 segundos), os espectadores demoram a sincronizar ao entrar no stream, os VODs cortam mal e o buffering aumenta. No OBS: Configurações → Saída → modo avançado → Intervalo de keyframe = 2. É um dos erros mais comuns entre streamers iniciantes."
  },
  {
    "q": "Quantos GB consome 1 hora de transmissão?",
    "a": "O consumo de upload depende do bitrate configurado: <strong>720p a 5.000 kbps</strong>: ~2,25 GB/hora. <strong>1080p30 a 6.000 kbps</strong>: ~2,7 GB/hora. <strong>1080p60 a 8.000 kbps</strong>: ~3,6 GB/hora. <strong>1440p a 13.000 kbps</strong>: ~5,85 GB/hora. <strong>4K60 a 40.000 kbps</strong>: ~18 GB/hora. Um streamer que transmite 4 horas por dia em 1080p60 sobe ~14,4 GB/dia ≈ 432 GB/mês de upload. A fórmula: GB = (bitrate em Mbps × segundos) / 8 / 1024."
  },
  {
    "q": "Por que a plataforma rejeita o stream ou ele cai sozinho?",
    "a": "As duas causas mais comuns são: <strong>(1) Bitrate acima do limite da plataforma</strong> — se você configurar mais de 6.000 kbps na Twitch, o servidor de ingestão rejeita direto; <strong>(2) Bitrate acima do seu upload real</strong> — se sua subida é 8 Mbps e você configura 8.000 kbps sem folga, a qualquer flutuação o encoder dropa frames e o stream cai. Solução: reduza o bitrate ao recomendado da sua resolução, deixe 20% de folga sobre o upload medido e use CBR. Verifique também se o keyframe está em 2 segundos."
  },
  {
    "q": "A velocidade de internet no Brasil dá para streams em 4K?",
    "a": "Segundo dados de Anatel e da PNAD Contínua TIC, a velocidade média de upload residencial no Brasil ainda fica abaixo de 30 Mbps na maioria dos domicílios. Transmitir em 4K60 com H.264 exige cerca de <strong>48 Mbps de upload estável</strong> (40.000 kbps de vídeo + áudio + folga) — inviável para a maioria. Com H.265 a exigência cai pela metade, mas ainda fica restrita a planos de fibra óptica premium em grandes centros. Para a maior parte dos criadores, 1080p60 a 8.000 kbps (10 Mbps de upload) é o teto realista e mais do que suficiente."
  },
  {
    "q": "Dá para transmitir de um notebook ou preciso de um PC de mesa?",
    "a": "Depende do encoder. Com <strong>GPU NVIDIA (GTX 1060 ou superior)</strong> você usa o NVENC (encoding por hardware) e a CPU quase não trabalha: ideal para games + streaming ao mesmo tempo. Com <strong>AMD (AMF) ou Apple (VideoToolbox)</strong>: parecido. Se só tiver gráficos integrados, o encoding x264 por software consome muita CPU e convém conteúdo simples (talking head, tutoriais). A resolução de transmissão não depende da sua GPU de jogo, e sim do encoder e do upload. Um notebook intermediário (i5 + GTX 1650) transmite 1080p60 em NVENC sem problemas."
  },
  {
    "q": "Como o bitrate afeta o tamanho do arquivo gravado?",
    "a": "O tamanho cresce de forma linear com o bitrate e a duração: <strong>Tamanho (GB) = (Bitrate em Mbps × duração em segundos) / 8 / 1024</strong>. Um vídeo de 1 hora em 1080p60 a 8.000 kbps ocupa: (8 × 3600) / 8 / 1024 ≈ <strong>3,5 GB</strong>. Usando H.265 com ~4,5 Mbps, o mesmo vídeo ocupa cerca de 2 GB com qualidade visual equivalente. Por isso, para gravações e uploads offline, o H.265 (ou AV1) economiza muito espaço e tempo de envio."
  },
  {
    "q": "Qual é a fórmula para calcular a autonomia da bateria?",
    "a": "Autonomia (horas) = (Ah × V × DoD × η) ÷ W. Multiplique a capacidade em Ah pela tensão para obter Wh, aplique a profundidade de descarga e a eficiência do inversor, depois divida pelo consumo em watts. Exemplo: (100 × 12 × 0,80 × 0,95) ÷ 100 = 9,12 horas."
  },
  {
    "q": "Quanto tempo dura uma bateria de 100Ah 12V?",
    "a": "Depende da carga. Com LiFePO4 (DoD 80%, η 95%): a 50 W → 18,2 h; a 100 W → 9,1 h; a 200 W → 4,6 h. Com AGM (DoD 50%, η 93%) e carga de 100 W → 5,6 h. Insira seus valores exatos na calculadora acima para um resultado preciso."
  }
],
  sources: [
  {
    "name": "YouTube Help — Configurações de codificador ao vivo, bitrates e resoluções",
    "url": "https://support.google.com/youtube/answer/2853702"
  },
  {
    "name": "Twitch Broadcast Guidelines",
    "url": "https://help.twitch.tv/s/article/broadcasting-guidelines"
  },
  {
    "name": "OBS Project — General Performance and Encoding Issues",
    "url": "https://obsproject.com/kb/general-performance-and-encoding-issues"
  },
  {
    "name": "Battery University — Métodos de descarga e DoD (Cadex Electronics)",
    "url": "https://batteryuniversity.com/article/bu-501-basics-about-discharging"
  },
  {
    "name": "Wikipedia PT — Bateria elétrica (profundidade de descarga e vida útil)",
    "url": "https://pt.wikipedia.org/wiki/Bateria_el%C3%A9trica"
  },
  {
    "name": "INMETRO — Programa Brasileiro de Etiquetagem (eficiência energética)",
    "url": "https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem"
  },
  {
    "name": "Anthropic — Claude API Pricing",
    "url": "https://www.anthropic.com/pricing"
  },
  {
    "name": "Google AI — Gemini API Pricing",
    "url": "https://ai.google.dev/pricing"
  },
  {
    "name": "OpenAI — API Pricing",
    "url": "https://openai.com/api/pricing/"
  },
  {
    "name": "Wikipedia PT — Pegada de carbono digital",
    "url": "https://pt.wikipedia.org/wiki/Pegada_de_carbono"
  },
  {
    "name": "IBGE — Pesquisa de Uso de TIC nas Residências (PNAD)",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/tecnologia-da-informacao.html"
  },
  {
    "name": "ONS — Geração de energia por fonte no Brasil",
    "url": "https://www.ons.org.br/paginas/energia-e-producao/geracao-de-energia/geracao-por-fonte"
  },
  {
    "name": "The Carbon Literacy Project — Carbon and the Internet",
    "url": "https://carbonliteracy.com/the-carbon-cost-of-an-email/"
  },
  {
    "name": "IEA — The carbon footprint of streaming video: fact-checking the headlines (2020)",
    "url": "https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines"
  },
  {
    "name": "Midjourney – Comparing Plans (documentação oficial)",
    "url": "https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans"
  },
  {
    "name": "Midjourney – Plan Information (documentação oficial)",
    "url": "https://docs.midjourney.com/hc/en-us/sections/28005319720845-Plan-Information"
  },
  {
    "name": "INMETRO – Rotulagem Ambiental e Critérios para Papel",
    "url": "https://www.inmetro.gov.br/qualidade/rotulagem-ambiental/"
  },
  {
    "name": "IBGE – Produção da Extração Vegetal e da Silvicultura (PEVS)",
    "url": "https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9105-producao-da-extracao-vegetal-e-da-silvicultura.html"
  },
  {
    "name": "IBÁ – Indústria Brasileira de Árvores (Relatório Anual)",
    "url": "https://iba.org/publicacoes"
  },
  {
    "name": "Receita Federal do Brasil — Tributação de Importações (Programa Remessa Conforme)",
    "url": "https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessa-postal-e-encomenda-internacional"
  },
  {
    "name": "Wikipedia PT — Unidade de processamento gráfico (GPU)",
    "url": "https://pt.wikipedia.org/wiki/Unidade_de_processamento_gr%C3%A1fico"
  },
  {
    "name": "IBGE — Pesquisa Nacional por Amostra de Domicílios Contínua: Acesso à Internet e Televisão e Posse de Telefone Móvel",
    "url": "https://www.ibge.gov.br/estatisticas/sociais/trabalho/17270-pnad-continua.html"
  },
  {
    "name": "Wikipedia PT — Servomotor: princípio de funcionamento e sinal PWM",
    "url": "https://pt.wikipedia.org/wiki/Servomotor"
  },
  {
    "name": "Arduino Reference — Servo.writeMicroseconds()",
    "url": "https://www.arduino.cc/reference/en/libraries/servo/writemicroseconds/"
  },
  {
    "name": "SparkFun — Hobby Servo Tutorial: PWM timing and control",
    "url": "https://www.sparkfun.com/servos"
  },
  {
    "name": "Wikipedia PT – Motor de passo",
    "url": "https://pt.wikipedia.org/wiki/Motor_de_passo"
  },
  {
    "name": "OpenAI – Pricing oficial da API (platform.openai.com)",
    "url": "https://platform.openai.com/docs/pricing"
  },
  {
    "name": "Banco Central do Brasil – Taxa de câmbio do dólar (BCB)",
    "url": "https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes"
  },
  {
    "name": "Receita Federal – IOF sobre compras internacionais no cartão",
    "url": "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/iof"
  },
  {
    "name": "Wikipedia PT – Processamento de linguagem natural (tokenização)",
    "url": "https://pt.wikipedia.org/wiki/Tokeniza%C3%A7%C3%A3o_(processamento_de_linguagem_natural)"
  },
  {
    "name": "USB Implementers Forum (USB-IF) — Especificação USB 3.2",
    "url": "https://www.usb.org/sites/default/files/USB%203.2%20Specification_FINAL.pdf"
  },
  {
    "name": "USB-IF — Visão geral do USB4",
    "url": "https://www.usb.org/usb4"
  },
  {
    "name": "Wikipedia PT — Universal Serial Bus",
    "url": "https://pt.wikipedia.org/wiki/USB"
  }
],
  replaces: [
    '/pt/bandwidth-streaming-bitrate-resolucao-youtube', // Absorbida como caso calculable con formulaId bandwidth-streaming-bitrate-resolucion-youtube.
    '/pt/bateria-autonomia-ah', // Absorbida como caso calculable con formulaId bateria-capacidad-runtime-ah.
    '/pt/claude-gemini-tokens-comparacao-preco-uso', // Absorbida como caso calculable con formulaId claude-gemini-tokens-comparativa-precio-uso.
    '/pt/emissoes-email-anexos', // Absorbida como caso calculable con formulaId emisiones-enviar-email-adjuntos.
    '/pt/midjourney-creditos-mensais', // Absorbida como caso calculable con formulaId midjourney-stable-diffusion-credits-mensual.
    '/pt/papel-poupado-impressao-dupla', // Absorbida como caso calculable con formulaId papel-ahorrado-impresion-doble-cara.
    '/pt/pc-gamer-fps-componentes-orcamento', // Absorbida como caso calculable con formulaId gaming-fps-componentes-pc-armar-presupuesto.
    '/pt/servo-pwm-angulo', // Absorbida como caso calculable con formulaId servo-pwm-angulo.
    '/pt/stepper-passos-grau', // Absorbida como caso calculable con formulaId stepper-pasos-grado.
    '/pt/tokens-openai-gpt-custo-mensal', // Absorbida como caso calculable con formulaId tokens-openai-gpt-costo-uso-mensual.
    '/pt/velocidade-usb-transferencia-arquivo', // Absorbida como caso calculable con formulaId velocidad-usb-transferencia-archivo.
  ],
  lastReviewed: '2026-08-16',
};
