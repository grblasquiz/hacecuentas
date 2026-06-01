export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function horasPantallaEdadOmsRecomendadoNino(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e=Number(i.edad)||0;
  let max='',alt='',adv='';
  if(e<1){
    max=__lang==='en'?'0 (none)':'0 (ninguna)';
    alt=__lang==='en'?'Sensory play, reading':'Juego sensorial, lectura';
    adv=__lang==='en'?'No screens for children under 1 year':'Sin pantallas menores de 1 año';
  }
  else if(e<2){
    max=__lang==='en'?'Avoid':'Evitar';
    alt=__lang==='en'?'Books, free play':'Libros, juego libre';
    adv=__lang==='en'?'Video calls with family only':'Solo videollamadas con familia';
  }
  else if(e<5){
    max=__lang==='en'?'1 hour per day':'1 hora día';
    alt=__lang==='en'?'Active play, art, outdoor time':'Juego activo, arte, aire libre';
    adv=__lang==='en'?'Quality educational content':'Contenido educativo de calidad';
  }
  else if(e<13){
    max=__lang==='en'?'2 hours per day (non-school)':'2 horas día no escolar';
    alt=__lang==='en'?'Physical activity, books':'Actividad física, libros';
    adv=__lang==='en'?'Separate recreational from educational use':'Separar uso recreativo del escolar';
  }
  else {
    max=__lang==='en'?'Moderate with guidelines':'Moderado con pautas';
    alt=__lang==='en'?'Social media with limits':'Redes sociales con límite';
    adv=__lang==='en'?'Clear family agreements':'Acuerdos familiares claros';
  }
  return { maxRecomendado:max, alternativas:alt, advertencia:adv };
}
