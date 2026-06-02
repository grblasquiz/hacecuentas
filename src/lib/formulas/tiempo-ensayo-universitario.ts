/** Tiempo Ensayo Universitario */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  horasInvestigacion: number;
  horasEscritura: number;
  horasRevision: number;
  diasConDedicacion: number;
  _insight?: any;
  _chart?: any;
}

export function tiempoEnsayoUniversitario(i: Inputs): Outputs {
  const pal = Number(i.palabras) || 2500;
  const tipo = String(i.tipoEnsayo || 'argumentativo');
  const fam = String(i.familiaridadTema || 'media');
  if (pal <= 0) throw new Error('Palabras inválidas');

  const HXP: Record<string, number> = {
    reflexivo: 0.003, argumentativo: 0.005, comparativo: 0.005,
    critico: 0.006, investigacion: 0.008,
  };
  const FAM: Record<string, number> = { alta: 0.8, media: 1.0, baja: 1.3 };

  const hxp = HXP[tipo] || 0.005;
  const f = FAM[fam] || 1;

  const horas = pal * hxp * f;
  const inv = Math.round(horas * 0.3 * 10) / 10;
  const esc = Math.round(horas * 0.5 * 10) / 10;
  const rev = Math.round(horas * 0.2 * 10) / 10;
  const horasTot = Math.round(horas * 10) / 10;
  const dias = Math.ceil(horas / 3);

  const tipoLabel: Record<string, string> = {
    reflexivo: 'reflexivo', argumentativo: 'argumentativo', comparativo: 'comparativo',
    critico: 'crítico', investigacion: 'de investigación',
  };
  const famNota = fam === 'baja'
    ? ' Como conocés poco el tema, ya sumamos un 30% extra de investigación.'
    : fam === 'alta'
      ? ' Tu familiaridad alta con el tema descontó tiempo.'
      : '';
  const insightText = `Un ensayo ${tipoLabel[tipo] || tipo} de **${pal.toLocaleString('es-AR')} palabras** te pide unas **${horasTot} h** de trabajo real, repartibles en ~**${dias} días** a 3 h diarias. La escritura (${esc} h) se lleva la mitad; investigación y revisión, el resto.${famNota}`;

  return {
    horasTotales: horasTot,
    horasInvestigacion: inv,
    horasEscritura: esc,
    horasRevision: rev,
    diasConDedicacion: dias,
    _insight: { title: 'Cómo se reparte el trabajo', text: insightText, tone: 'neutral', icon: '📝' },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Investigación', value: inv },
        { label: 'Escritura', value: esc },
        { label: 'Revisión', value: rev },
      ],
      suffix: ' h',
      centerValue: `${horasTot} h`,
      centerLabel: 'total',
      ariaLabel: `Reparto de las ${horasTot} horas del ensayo entre investigación, escritura y revisión`,
    },
  };

}
