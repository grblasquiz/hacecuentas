/** TikTok Hashtags Óptimos */
export interface Inputs { nicho: string; tamano: string; }
export interface Outputs { cantidadOptima: string; mixRecomendado: string; ejemplosNicho: string; evitar: string; }

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
  return {
    cantidadOptima: `${cantidad} hashtags`,
    mixRecomendado: `${Math.max(1, Math.round(cantidad*0.5))} de nicho + ${Math.max(1, Math.round(cantidad*0.33))} de tendencia + 1 branded`,
    ejemplosNicho: ejemplos[nicho] || '#nicho1 #nicho2 #nicho3',
    evitar: 'Evitá #fyp #foryou #viral #parati: saturados, TikTok los ignora',
  };
}
