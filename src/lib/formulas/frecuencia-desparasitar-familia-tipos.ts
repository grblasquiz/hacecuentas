export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function frecuenciaDesparasitarFamiliaTipos(i: Inputs): Outputs {
  const z=String(i.zona||'urbano'); const e=Number(i.edad)||10;
  const f:Record<string,string>={urbano:'Anual',rural:'Cada 6 meses',tropical:'Cada 3-4 meses'};
  const frecuencia=f[z]||'Anual';
  const riesgo=z==='tropical'?'alto':z==='rural'?'moderado':'bajo';
  const tone=z==='tropical'?'warn':z==='urbano'?'good':'neutral';
  const icon=z==='tropical'?'🌴':z==='rural'?'🌾':'🏙️';
  return {
    frecuencia, medicamento:'Albendazol/Mebendazol (ver médico)', resumen:`Zona ${z}: ${frecuencia}. Consultar médico.`,
    _insight:{
      title:'Cada cuánto desparasitar',
      text:`En zona **${z}** el riesgo de parásitos es **${riesgo}**, así que la pauta sugerida es **${frecuencia.toLowerCase()}**. Es orientativo: el médico ajusta según síntomas y contacto con tierra o mascotas.`,
      tone, icon,
    },
  };
}
