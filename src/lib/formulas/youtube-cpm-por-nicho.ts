/** YT CPM por nicho */
export interface YoutubeCpmPorNichoInputs { nicho: string; vistasMensuales: number; fillRate: number; }
export interface YoutubeCpmPorNichoOutputs { cpmEstimado: number; rpmEstimado: number; ingresoMensual: number; ingresoAnual: number; _insight?: any; }
const CPM: Record<string, number> = { finanzas:25, tech:20, salud:10, educacion:8, viajes:7, lifestyle:6, cocina:5, gaming:4, musica:2.5, entretenimiento:3.5, infantil:1.2 };
export function youtubeCpmPorNicho(inputs: YoutubeCpmPorNichoInputs): YoutubeCpmPorNichoOutputs {
  const v=Number(inputs.vistasMensuales), f=Number(inputs.fillRate);
  if (!inputs.nicho || !CPM[inputs.nicho]) throw new Error('Selecciona un nicho valido');
  if (!v || v<=0) throw new Error('Vistas invalidas');
  if (f<0 || f>100) throw new Error('Fill rate 0-100');
  const cpm=CPM[inputs.nicho], rpm=cpm*0.55*(f/100), m=(v/1000)*rpm;
  const NICHO_ES: Record<string,string> = { finanzas:'finanzas', tech:'tecnología', salud:'salud', educacion:'educación', viajes:'viajes', lifestyle:'lifestyle', cocina:'cocina', gaming:'gaming', musica:'música', entretenimiento:'entretenimiento', infantil:'infantil' };
  const nichoLabel = NICHO_ES[inputs.nicho] ?? inputs.nicho;
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const altoCpm = cpm >= 15;
  const insightText = altoCpm
    ? `**${nichoLabel}** es de los nichos mejor pagos (CPM ~$${cpm.toFixed(0)}). Con **${fmt.format(v)} vistas/mes** y ${f}% de fill rate, ganás unos **$${fmt.format(m)}/mes** (RPM real $${rpm.toFixed(2)}), o **$${fmt.format(m*12)}/año**.`
    : `Con **${fmt.format(v)} vistas/mes** en **${nichoLabel}** (CPM ~$${cpm.toFixed(0)}, RPM real $${rpm.toFixed(2)}), tu ingreso por ads ronda los **$${fmt.format(m)}/mes** (**$${fmt.format(m*12)}/año**). El CPM de tu nicho es de los más bajos: más vistas o nichos como finanzas/tech multiplican el RPM.`;
  return {
    cpmEstimado:+cpm.toFixed(2),
    rpmEstimado:+rpm.toFixed(2),
    ingresoMensual:+m.toFixed(2),
    ingresoAnual:+(m*12).toFixed(2),
    _insight: {
      title: 'Tu ingreso estimado por ads',
      text: insightText,
      tone: altoCpm ? 'good' : 'neutral',
      icon: '📺',
    },
  };
}
