/** TikTok Hashtags Óptimos */
export interface Inputs { nicho: string; tamano: string; }
export interface Outputs { cantidadOptima: string; mixRecomendado: string; ejemplosNicho: string; evitar: string; _insight?: any; }

export function tiktokHashtagsOptimosNicho(i: Inputs): Outputs {
  const nicho = String(i.nicho);
  const tam = String(i.tamano);
  if (!nicho || !tam) throw new Error('Seleccioná nicho y tamaño');
  let cantidad = 5;
  if (tam.startsWith('<')) cantidad = 7;
  else if (tam.startsWith('1K')) cantidad = 6;
  else if (tam.startsWith('10K')) cantidad = 5;
  else if (tam.startsWith('100K')) cantidad = 4;
  else cantidad = 3;
  const ejemplos: Record<string, string> = {
    'Humor / entretenimiento': '#humorargentino #comedytiktok #chistes',
    'Fitness / salud': '#fitnesstips #gymtok #ejerciciosencasa',
    'Cocina': '#recetasfaciles #cocinacasera #tipscocina',
    'Negocios / finanzas': '#finanzaspersonales #inversiones #ahorro',
    'Moda / beauty': '#outfitideas #fashiontips #streetstyle',
    'Tech / gadgets': '#gadgetsreview #apptips #tecnologia',
    'Gaming': '#gamertok #gamingtips #streamerlife',
    'Educativo / tutoriales': '#aprendeconmigo #datoscuriosos #sabiasque',
    'Viajes': '#travelvlog #viajespormundo #destinosocultos',
    'Mascotas': '#perrostiktok #gatostiktok #petlovers',
  };
  const deNicho = Math.max(1, Math.round(cantidad*0.5));
  const deTendencia = Math.max(1, Math.round(cantidad*0.33));
  const _insight = {
    title: 'Tu mezcla de hashtags',
    text: `Para tu cuenta apuntá a **${cantidad} hashtags** por video: **${deNicho} de nicho** (donde competís de verdad), **${deTendencia} de tendencia** y 1 branded. Cuanto más chica la cuenta más hashtags ayudan; mientras crecés conviene afinar y bajar la cantidad.`,
    tone: 'neutral' as const,
    icon: '#️⃣',
  };
  return {
    cantidadOptima: `${cantidad} hashtags`,
    mixRecomendado: `${deNicho} de nicho + ${deTendencia} de tendencia + 1 branded`,
    ejemplosNicho: ejemplos[nicho] || '#nicho1 #nicho2 #nicho3',
    evitar: 'Evitá #fyp #foryou #viral #parati: saturados, TikTok los ignora',
    _insight,
  };
}
