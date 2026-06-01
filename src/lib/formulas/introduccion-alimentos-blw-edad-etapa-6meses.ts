export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
    },
  } as const)[__lang];
  const m=Number(i.edadMeses)||0;
  if(m<6) return { apto:T.aptoNo, etapa:T.etapa0, recomendacion:T.rec0 };
  if(m<9) return { apto:T.aptoSi, etapa:T.etapa1, recomendacion:T.rec1 };
  if(m<12) return { apto:T.aptoSi, etapa:T.etapa2, recomendacion:T.rec2 };
  return { apto:T.aptoSi, etapa:T.etapa3, recomendacion:T.rec3 };
}
