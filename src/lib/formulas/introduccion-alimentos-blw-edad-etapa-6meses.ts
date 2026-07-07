export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object; _insight?: any; }
export function introduccionAlimentosBlwEdadEtapa6meses(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      aptoNo: 'No todavía',
      etapa0: 'Leche exclusiva',
      rec0: 'Esperá hasta 6 meses y signos de preparación.',
      aptoSi: 'Sí',
      etapa1: 'Inicio BLW',
      rec1: 'Tiras blandas de palta, banana, batata, zapallo.',
      etapa2: 'Variedad creciente',
      rec2: 'Carne desmenuzada, legumbres blandas, frutas en trozos.',
      etapa3: 'Variada',
      rec3: 'Comida familiar sin sal ni azúcar agregada.',
      insTitle: 'Etapa según la edad del bebé',
      ins0: 'Con **{m} meses** todavía no toca sólidos: la leche (materna o fórmula) cubre el 100% de la nutrición. El BLW arranca a los **6 meses** con signos de preparación.',
      ins1: 'A los **{m} meses** estás en el inicio del BLW: ofrecé tiras blandas que el bebé pueda agarrar. La leche sigue siendo el alimento principal y la comida es exploración.',
      ins2: 'Con **{m} meses** podés ampliar la variedad: proteínas, legumbres y frutas en trozos. El bebé ya maneja mejor texturas y empieza a comer cantidades reales.',
      ins3: 'A los **{m} meses** el bebé ya come prácticamente lo mismo que la familia, sin sal ni azúcar agregada. La leche pasa a complementar la comida.',
      toneNeutral: 'neutral',
      toneGood: 'good',
    },
    en: {
      aptoNo: 'Not yet',
      etapa0: 'Exclusive milk',
      rec0: 'Wait until 6 months and look for signs of readiness.',
      aptoSi: 'Yes',
      etapa1: 'BLW Start',
      rec1: 'Soft strips of avocado, banana, sweet potato, squash.',
      etapa2: 'Growing variety',
      rec2: 'Shredded meat, soft legumes, fruit in chunks.',
      etapa3: 'Varied',
      rec3: 'Family food without added salt or sugar.',
      insTitle: 'Stage based on the baby\'s age',
      ins0: 'At **{m} months** solids are not on the table yet: milk (breast or formula) covers 100% of nutrition. BLW starts at **6 months** with signs of readiness.',
      ins1: 'At **{m} months** you are at the start of BLW: offer soft strips the baby can grab. Milk is still the main food and meals are about exploration.',
      ins2: 'At **{m} months** you can widen the variety: proteins, legumes and fruit in chunks. The baby handles textures better and starts eating real amounts.',
      ins3: 'At **{m} months** the baby eats almost the same as the family, with no added salt or sugar. Milk now complements meals.',
      toneNeutral: 'neutral',
      toneGood: 'good',
    },
    pt: {
      aptoNo: 'Ainda não',
      etapa0: 'Leite exclusivo',
      rec0: 'Aguarde até 6 meses e observe os sinais de prontidão.',
      aptoSi: 'Sim',
      etapa1: 'Início BLW',
      rec1: 'Tiras macias de abacate, banana, batata-doce, abóbora.',
      etapa2: 'Variedade crescente',
      rec2: 'Carne desfiada, leguminosas macias, frutas em pedaços.',
      etapa3: 'Variada',
      rec3: 'Comida da família sem sal nem açúcar adicionados.',
      insTitle: 'Etapa conforme a idade do bebê',
      ins0: 'Com **{m} meses** ainda não há sólidos: o leite (materno ou fórmula) cobre 100% da nutrição. O BLW começa aos **6 meses** com sinais de prontidão.',
      ins1: 'Aos **{m} meses** você está no início do BLW: ofereça tiras macias que o bebê consiga pegar. O leite continua sendo o alimento principal e a comida é exploração.',
      ins2: 'Com **{m} meses** dá para ampliar a variedade: proteínas, leguminosas e frutas em pedaços. O bebê já lida melhor com texturas e começa a comer quantidades reais.',
      ins3: 'Aos **{m} meses** o bebê já come praticamente o mesmo que a família, sem sal nem açúcar adicionados. O leite passa a complementar a comida.',
      toneNeutral: 'neutral',
      toneGood: 'good',
    },
  } as const)[__lang];
  const m=Number(i.edadMeses)||0;
  const mkIns = (txt: string, tone: string) => ({ title: T.insTitle, text: txt.replace('{m}', String(m)), tone, icon: '🥑' });
  if(m<6) return { apto:T.aptoNo, etapa:T.etapa0, recomendacion:T.rec0, _insight: mkIns(T.ins0, T.toneNeutral) };
  if(m<9) return { apto:T.aptoSi, etapa:T.etapa1, recomendacion:T.rec1, _insight: mkIns(T.ins1, T.toneGood) };
  if(m<12) return { apto:T.aptoSi, etapa:T.etapa2, recomendacion:T.rec2, _insight: mkIns(T.ins2, T.toneGood) };
  return { apto:T.aptoSi, etapa:T.etapa3, recomendacion:T.rec3, _insight: mkIns(T.ins3, T.toneGood) };
}
