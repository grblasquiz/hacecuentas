/** Calculadora Plan de Estudio */
export interface Inputs { horasMateria1: number; diasMateria1: number; horasMateria2?: number; diasMateria2?: number; horasMateria3?: number; diasMateria3?: number; }
export interface Outputs { planDiario: string; horasDiariasTotal: number; detalleMateria1: string; detalleMateria2: string; detalleMateria3: string; viabilidad: string; _insight?: any; _chart?: any; }

export function calendarioEstudioParciales(i: Inputs): Outputs {
  const materias: { horas: number; dias: number; hdpd: number }[] = [];

  const h1 = Number(i.horasMateria1);
  const d1 = Number(i.diasMateria1);
  if (h1 > 0 && d1 > 0) materias.push({ horas: h1, dias: d1, hdpd: h1 / d1 });

  const h2 = i.horasMateria2 ? Number(i.horasMateria2) : 0;
  const d2 = i.diasMateria2 ? Number(i.diasMateria2) : 0;
  if (h2 > 0 && d2 > 0) materias.push({ horas: h2, dias: d2, hdpd: h2 / d2 });

  const h3 = i.horasMateria3 ? Number(i.horasMateria3) : 0;
  const d3 = i.diasMateria3 ? Number(i.diasMateria3) : 0;
  if (h3 > 0 && d3 > 0) materias.push({ horas: h3, dias: d3, hdpd: h3 / d3 });

  if (materias.length === 0) throw new Error('Ingresá al menos una materia');

  // Max daily hours is the sum of all per-materia daily hours
  const totalDiario = materias.reduce((s, m) => s + m.hdpd, 0);
  const totalHoras = materias.reduce((s, m) => s + m.horas, 0);

  const detalles = materias.map((m, idx) =>
    `Materia ${idx + 1}: ${m.hdpd.toFixed(1)} h/día × ${m.dias} días = ${m.horas} h total`
  );

  let viab: string;
  if (totalDiario <= 4) viab = 'Plan muy viable. Ritmo cómodo con tiempo de sobra.';
  else if (totalDiario <= 6) viab = 'Plan viable. Ritmo exigente pero sostenible.';
  else if (totalDiario <= 8) viab = 'Plan ajustado. Necesitás disciplina y buena organización.';
  else viab = 'Plan NO viable a largo plazo. Considerá priorizar o redistribuir.';

  const hd = Number(totalDiario.toFixed(1));
  const hdTxt = totalDiario.toFixed(1).replace('.', ',');
  const matsTxt = `${materias.length} materia${materias.length === 1 ? '' : 's'}`;
  let insText: string, insTone: 'good' | 'warn' | 'neutral', insIcon: string;
  if (totalDiario <= 4) {
    insText = `Te alcanza con **${hdTxt} h/día** para cubrir ${matsTxt}: ritmo cómodo, con margen para imprevistos.`;
    insTone = 'good'; insIcon = '📚';
  } else if (totalDiario <= 6) {
    insText = `Vas a necesitar **${hdTxt} h/día** sostenidas para ${matsTxt}: exigente pero realista si cuidás los descansos.`;
    insTone = 'neutral'; insIcon = '📖';
  } else if (totalDiario <= 8) {
    insText = `Son **${hdTxt} h/día** para ${matsTxt}: plan ajustado que solo se sostiene con disciplina y buena organización.`;
    insTone = 'warn'; insIcon = '⏳';
  } else {
    insText = `**${hdTxt} h/día** para ${matsTxt} no es sostenible: priorizá materias o estirá los días disponibles antes de quemarte.`;
    insTone = 'warn'; insIcon = '🚨';
  }

  // El marker puede superar 8 h/día → último segmento dinámico para quedar por encima.
  const lastMax = Math.max(10, Math.ceil(hd) + 1);

  return {
    planDiario: `${hdTxt} h/día · ${materias.length} materia(s)`,
    horasDiariasTotal: hd,
    detalleMateria1: detalles[0] || 'No ingresada',
    detalleMateria2: detalles[1] || 'No ingresada',
    detalleMateria3: detalles[2] || 'No ingresada',
    viabilidad: viab,
    _insight: { title: 'Carga diaria de estudio', text: insText, tone: insTone, icon: insIcon },
    _chart: {
      type: 'scale',
      marker: hd,
      markerLabel: `${hdTxt} h/día`,
      min: 0,
      segments: [
        { nombre: 'Cómodo', max: 4, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Exigente', max: 6, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Ajustado', max: 8, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Inviable', max: lastMax, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: 'Escala de horas diarias de estudio según viabilidad del plan',
    },
  };
}
