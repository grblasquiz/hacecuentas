export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function velocidadTraduccionPalabrasHoraProfesional(i: Inputs): Outputs {
  const t=String(i.tipo||'general');
  const w:Record<string,number>={general:500,tecnico:400,literario:200,juridico:300};
  const v=w[t]||400;
  const diario=v*8;
  // Tono: textos lentos (literario/jurídico) avisan que rinden menos por hora.
  const tono: 'good' | 'warn' | 'neutral' = v >= 500 ? 'good' : v <= 200 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Cuánto rendís por día',
    text: `Para texto **${t}** se traducen unas **${v} palabras/h**, o sea **${diario.toLocaleString('es-AR')} palabras** en una jornada de 8 h. Un documento de 5.000 palabras te llevaría ~**${(5000 / v).toFixed(1)} h**.`,
    tone: tono,
    icon: '🌐',
  };
  return { wph:`${v} palabras/h`, diario:`${diario.toLocaleString()} palabras/día`, resumen:`${t}: ~${v} palabras/h, ${diario.toLocaleString()} día.`, _insight };
}
