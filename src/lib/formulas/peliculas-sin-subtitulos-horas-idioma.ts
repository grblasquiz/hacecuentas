export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function peliculasSinSubtitulosHorasIdioma(i: Inputs): Outputs {
  const n=String(i.nivel||'b1');
  const h:Record<string,number>={a2:500,b1:250,b2:100,c1:50};
  const hr=h[n]||250;
  const tone = hr >= 250 ? 'warn' : hr >= 100 ? 'neutral' : 'good';
  const text = hr >= 250
    ? `Desde el nivel **${n.toUpperCase()}** necesitás unas **${hr} h** de escucha activa para ver sin subtítulos. Es un camino largo: clavá 1 hora por día y vas a notar el salto en unos meses.`
    : hr >= 100
    ? `Desde el nivel **${n.toUpperCase()}** te faltan unas **${hr} h** de escucha para soltar los subtítulos. Estás a mitad de camino: probá empezar con subs en el idioma original antes de sacarlos del todo.`
    : `Desde el nivel **${n.toUpperCase()}** estás muy cerca: con unas **${hr} h** más de escucha ya deberías ver sin subtítulos. Animate a sacarlos en contenido que ya conozcas.`;
  return {
    horas:`~${hr}h`,
    metodo:'Reemplazar subs gradualmente',
    resumen:`${n.toUpperCase()}: ~${hr}h listening para lograr sin subs.`,
    _insight: {
      title: 'Horas para ver sin subtítulos',
      text,
      tone,
      icon: '🎬',
    },
  };
}
