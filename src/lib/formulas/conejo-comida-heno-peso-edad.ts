export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }

/*
 * Rabbit diet calculator — hay, vegetables & pellets
 * Based on House Rabbit Society (HRS) feeding guidelines and
 * WSAVA Nutritional Guidelines for rabbits (small exotic mammal medicine):
 *   - Hay: unlimited (≥30 g/kg/day as minimum, offered ad libitum)
 *   - Vegetables: 100 g/kg/day for adults (10% of body weight); graduated for other stages
 *   - Pellets: 20–30 g/kg/day adult cap 50 g; juniors unlimited; seniors reduced
 * Sources: House Rabbit Society (rabbit.org), WSAVA Nutritional Assessment Guidelines,
 *          Meredith & Redrobe, "BSAVA Manual of Rabbit Medicine and Surgery"
 */
export function conejoComidaHenoPesoEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const peso = Math.max(0, Number(i.peso_kg) || 0);
  const etapa = String(i.etapa || 'adulto');

  if (peso <= 0) {
    const noData = {
      es: { resultado: '—', resumen: 'Ingresá el peso del conejo para ver el cálculo.' },
      en: { resultado: '—', resumen: 'Enter your rabbit\'s weight to see the calculation.' },
      pt: { resultado: '—', resumen: 'Insira o peso do coelho para ver o cálculo.' },
    }[__lang];
    return { resultado: noData.resultado, resumen: noData.resumen, _insight: { title: '', text: '', icon: '🐰', tone: 'neutral' } } as Outputs;
  }

  // ── Hay: ad libitum, min 30 g/kg/day for all stages ──────────────────────
  const henoMin = Math.round(peso * 30);

  // ── Pellets (g/day) ───────────────────────────────────────────────────────
  // Cachorro/Juvenil (< 6 months): unlimited — growing rabbits need calcium & protein
  // Joven (6–12 months): 20 g/kg, transitioning to adult diet
  // Adulto (1–5 years): 20–30 g/kg, capped at 50 g
  // Senior (>5 years): 12–15 g/kg, monitor weight closely
  // Gestante/Lactante: 30 g/kg + alfalfa supplement
  let pelletsPorKg: number;
  let pelletsCap: number | null = null;
  let hayType: Record<string, string>;
  let etapaNote: Record<string, string>;

  switch (etapa) {
    case 'cachorro': // 0–6 months
      pelletsPorKg = 0; // unlimited — no per-kg cap; ad libitum
      hayType = { es: 'Alfalfa (ad libitum)', en: 'Alfalfa hay (unlimited)', pt: 'Alfafa (à vontade)' };
      etapaNote = {
        es: 'Cachorro (0–6 meses): pellets sin restricción, heno de alfalfa ad libitum. Iniciar verduras a las 12 semanas, de a un vegetal por vez.',
        en: 'Junior (0–6 months): unlimited pellets, alfalfa hay ad libitum. Introduce vegetables at 12 weeks, one at a time.',
        pt: 'Filhote (0–6 meses): pellets sem restrição, alfafa à vontade. Introduzir verduras às 12 semanas, um vegetal por vez.',
      };
      break;
    case 'joven': // 6–12 months
      pelletsPorKg = 20;
      hayType = { es: 'Mezcla alfalfa + pasto (transición)', en: 'Mixed alfalfa + grass (transition)', pt: 'Mistura alfafa + timothy (transição)' };
      etapaNote = {
        es: 'Joven (6–12 meses): transición gradual de alfalfa a heno de pasto, reducir pellets progresivamente al ritmo adulto.',
        en: 'Young (6–12 months): gradual transition from alfalfa to grass hay; reduce pellets progressively.',
        pt: 'Jovem (6–12 meses): transição gradual de alfafa para feno timothy; reduzir pellets progressivamente.',
      };
      break;
    case 'senior': // >5 years
      pelletsPorKg = 12;
      pelletsCap = 40;
      hayType = { es: 'Pasto (timothy/orchard) + monitoreo dentario', en: 'Grass hay (timothy/orchard) + dental monitoring', pt: 'Feno timothy/orchard + monitoramento dentário' };
      etapaNote = {
        es: 'Senior (>5 años): menor actividad, reducir pellets. Aumentar heno para mantener peso intestinal. Pesar mensualmente y consultar veterinario.',
        en: 'Senior (>5 years): lower activity, reduce pellets. Increase hay to maintain gut motility. Weigh monthly and consult vet.',
        pt: 'Idoso (>5 anos): menor atividade; reduzir pellets. Aumentar feno para manter motilidade. Pesar mensalmente e consultar veterinário.',
      };
      break;
    case 'gestante': // pregnant/nursing
      pelletsPorKg = 35;
      hayType = { es: 'Alfalfa + pasto mixto', en: 'Alfalfa + grass hay mixed', pt: 'Alfafa + feno misto' };
      etapaNote = {
        es: 'Gestante/Lactante: aumentar 50% el volumen total. Alfalfa junto con heno de pasto por demanda extra de calcio y proteína. Pellets sin tope.',
        en: 'Pregnant/Nursing: increase portions by 50%. Mix alfalfa with grass hay for extra calcium and protein. No pellet cap.',
        pt: 'Gestante/Lactante: aumentar 50% o volume total. Misture alfafa com feno de pasto para cálcio e proteína extras. Pellets sem restrição.',
      };
      break;
    default: // adulto (1–5 years)
      pelletsPorKg = 25;
      pelletsCap = 50;
      hayType = { es: 'Pasto (timothy, orchard grass, brome)', en: 'Grass hay (timothy, orchard, brome)', pt: 'Feno timothy, orchard grass, brome' };
      etapaNote = {
        es: 'Adulto (1–5 años): el heno debe representar el 80% de la dieta. Los pellets son suplemento, no alimento principal.',
        en: 'Adult (1–5 years): hay should make up 80% of diet. Pellets are a supplement, not the main food.',
        pt: 'Adulto (1–5 anos): feno deve representar 80% da dieta. Pellets são suplemento, não alimento principal.',
      };
  }

  // ── Compute daily portions ────────────────────────────────────────────────
  let pelletsGDia: number;
  let verdurasGDia: number;
  let frutaGSemana: number;

  if (etapa === 'cachorro') {
    // Unlimited pellets — just give practical estimate for display
    pelletsGDia = -1; // sentinel for "ad libitum"
    verdurasGDia = 0; // no vegetables before 12 weeks (formula doesn't know exact age)
    frutaGSemana = 0;
  } else if (etapa === 'gestante') {
    pelletsGDia = Math.round(peso * pelletsPorKg); // no cap for pregnant
    verdurasGDia = Math.round(peso * 150); // 150 g/kg (50% increase over adult 100 g/kg)
    frutaGSemana = Math.round(peso * 2);
  } else {
    let rawPellets = Math.round(peso * pelletsPorKg);
    if (pelletsCap !== null) rawPellets = Math.min(rawPellets, pelletsCap);
    pelletsGDia = rawPellets;
    verdurasGDia = Math.round(peso * 100); // 100 g/kg/day for young, adult, senior
    frutaGSemana = etapa === 'senior' ? 0 : Math.round(peso * 2); // no fruit for senior
  }

  // ── Format output strings ─────────────────────────────────────────────────
  const pelletsStr = pelletsGDia === -1
    ? { es: 'Sin límite (ad libitum)', en: 'Unlimited (ad libitum)', pt: 'Sem restrição (à vontade)' }[__lang]
    : `${pelletsGDia} g/día`;

  const pelletsStrPt = pelletsGDia === -1
    ? 'Sem restrição (à vontade)'
    : `${pelletsGDia} g/dia`;

  const verdStr = verdurasGDia === 0
    ? { es: 'No todavía (introducir a las 12 sem)', en: 'Not yet (introduce at 12 weeks)', pt: 'Ainda não (introduzir às 12 sem)' }[__lang]
    : `${verdurasGDia} g/día`;

  const verdStrPt = verdurasGDia === 0 ? 'Ainda não (introduzir às 12 sem)' : `${verdurasGDia} g/dia`;

  const frutaStr = frutaGSemana === 0
    ? { es: 'Ninguna', en: 'None', pt: 'Nenhuma' }[__lang]
    : { es: `${frutaGSemana} g/semana (máx)`, en: `${frutaGSemana} g/week (max)`, pt: `${frutaGSemana} g/semana (máx)` }[__lang];

  // Primary resultado = daily pellet grams (or ad libitum label)
  const resultadoStr = pelletsGDia === -1
    ? { es: 'Ad libitum', en: 'Ad libitum', pt: 'À vontade' }[__lang]
    : `${pelletsGDia} g`;

  // ── Resumen multi-line breakdown ──────────────────────────────────────────
  const hayLine = `${henoMin} g/día (mín.)`;
  const hayLinePt = `${henoMin} g/dia (mín.)`;
  const hayLineEn = `${henoMin} g/day (min.)`;

  const resumen = __lang === 'en'
    ? `**Daily diet for ${peso} kg rabbit (${etapa === 'adulto' ? 'adult' : etapa === 'joven' ? 'young' : etapa === 'cachorro' ? 'junior' : etapa === 'senior' ? 'senior' : 'pregnant/nursing'})** — Hay (${hayType.en}): ${hayLineEn} ad libitum | Vegetables: ${verdStr.replace('/día', '/day')} | Pellets: ${pelletsStr.replace('/día', '/day')} | Fruit: ${frutaStr}. ${etapaNote.en}`
    : __lang === 'pt'
    ? `**Dieta diária para coelho de ${peso} kg (${etapa === 'adulto' ? 'adulto' : etapa === 'joven' ? 'jovem' : etapa === 'cachorro' ? 'filhote' : etapa === 'senior' ? 'idoso' : 'gestante/lactante'})** — Feno (${hayType.pt}): ${hayLinePt} à vontade | Verduras: ${verdStrPt} | Pellets: ${pelletsStrPt} | Frutas: ${frutaGSemana === 0 ? 'Nenhuma' : frutaGSemana + ' g/semana (máx)'}. ${etapaNote.pt}`
    : `**Dieta diaria para conejo de ${peso} kg (${etapa === 'adulto' ? 'adulto' : etapa === 'joven' ? 'joven' : etapa === 'cachorro' ? 'cachorro' : etapa === 'senior' ? 'senior' : 'gestante/lactante'})** — Heno (${hayType.es}): ${hayLine} ad libitum | Verduras: ${verdStr} | Pellets: ${pelletsStr} | Frutas: ${frutaStr}. ${etapaNote.es}`;

  // ── _insight ──────────────────────────────────────────────────────────────
  let tone: string;
  if (etapa === 'senior') tone = 'warning';
  else if (etapa === 'gestante') tone = 'positive';
  else tone = 'neutral';

  const ins = __lang === 'en'
    ? {
        title: 'Rabbit diet summary',
        text: `Hay **${hayLineEn}** (unlimited, always available) · Vegetables **${verdStr.replace('/día', '/day')}** · Pellets **${pelletsStr.replace('/día', '/day')}**. ${etapaNote.en}`,
        icon: '🐰',
      }
    : __lang === 'pt'
    ? {
        title: 'Resumo da dieta do coelho',
        text: `Feno **${hayLinePt}** (à vontade, sempre disponível) · Verduras **${verdStrPt}** · Pellets **${pelletsStrPt}**. ${etapaNote.pt}`,
        icon: '🐰',
      }
    : {
        title: 'Resumen dieta conejo',
        text: `Heno **${hayLine}** (ad libitum, siempre disponible) · Verduras **${verdStr}** · Pellets **${pelletsStr}**. ${etapaNote.es}`,
        icon: '🐰',
      };

  const _insight = { ...ins, tone };

  return { resultado: resultadoStr, resumen, _insight } as Outputs;
}
