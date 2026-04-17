/** Suscriptores YouTube para 1000 */
export interface Inputs { suscriptoresActuales: number; suscriptoresPorDia: number; }
export interface Outputs { faltantes: number; diasEstimados: string; fechaEstimada: string; porcentaje: string; }

export function youtubeSuscriptoresPara1000(i: Inputs): Outputs {
  const actuales = Number(i.suscriptoresActuales) || 0;
  const porDia = Number(i.suscriptoresPorDia);
  if (porDia <= 0) throw new Error('Ingresá un ritmo de suscriptores por día válido');
  const META = 1000;
  const faltantes = Math.max(0, META - actuales);
  const dias = faltantes > 0 ? Math.ceil(faltantes / porDia) : 0;
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  const fechaStr = fecha.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  const pct = Math.min(100, (actuales / META) * 100);
  return {
    faltantes,
    diasEstimados: faltantes === 0 ? 'Ya llegaste a los 1.000' : `${dias} días (~${(dias/30).toFixed(1)} meses)`,
    fechaEstimada: faltantes === 0 ? 'Meta alcanzada' : fechaStr,
    porcentaje: `${pct.toFixed(1)}%`,
  };
}
