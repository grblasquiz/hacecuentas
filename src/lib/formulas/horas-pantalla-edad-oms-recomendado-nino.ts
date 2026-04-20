export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasPantallaEdadOmsRecomendadoNino(i: Inputs): Outputs {
  const e=Number(i.edad)||0;
  let max='',alt='',adv='';
  if(e<1){max='0 (ninguna)';alt='Juego sensorial, lectura';adv='Sin pantallas menores de 1 año'}
  else if(e<2){max='Evitar';alt='Libros, juego libre';adv='Solo videollamadas con familia'}
  else if(e<5){max='1 hora día';alt='Juego activo, arte, aire libre';adv='Contenido educativo de calidad'}
  else if(e<13){max='2 horas día no escolar';alt='Actividad física, libros';adv='Separar uso recreativo del escolar'}
  else {max='Moderado con pautas';alt='Redes sociales con límite';adv='Acuerdos familiares claros'}
  return { maxRecomendado:max, alternativas:alt, advertencia:adv };
}
