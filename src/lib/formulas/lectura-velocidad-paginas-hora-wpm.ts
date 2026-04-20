export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function lecturaVelocidadPaginasHoraWpm(i: Inputs): Outputs {
  const p=Number(i.palabras)||0; const t=Number(i.tiempoMinutos)||1;
  const wpm=p/t;
  let clas='', rec='';
  if(wpm>=500){clas='Muy rápida';rec='Excelente. Verifica comprensión.'}
  else if(wpm>=300){clas='Rápida';rec='Muy buena.'}
  else if(wpm>=200){clas='Promedio';rec='Intenta sin subvocalizar.'}
  else {clas='Lenta';rec='Practica: RSVP apps, Spreeder, lectura en chunks.'}
  return { wpm:`${Math.round(wpm)} WPM`, clasificacion:clas, recomendacion:rec };
}
