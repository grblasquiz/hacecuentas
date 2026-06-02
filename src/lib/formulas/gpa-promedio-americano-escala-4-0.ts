export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function gpaPromedioAmericanoEscala40(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;

  // GPA en escala 4.0 (estándar EE.UU.): zonas académicas
  const gpa = Math.max(0, Math.min(4, r));
  let banda: string, tone: 'good'|'warn'|'neutral';
  if (gpa >= 3.7) { banda = __lang === 'en' ? 'A (excellent / honors)' : 'A (sobresaliente / honors)'; tone = 'good'; }
  else if (gpa >= 3.0) { banda = __lang === 'en' ? 'B (good standing)' : 'B (buen promedio)'; tone = 'good'; }
  else if (gpa >= 2.0) { banda = __lang === 'en' ? 'C (passing)' : 'C (aprobado)'; tone = 'neutral'; }
  else { banda = __lang === 'en' ? 'D/F (academic risk)' : 'D/F (riesgo académico)'; tone = 'warn'; }

  const _insight = {
    title: __lang === 'en' ? 'Your GPA on the 4.0 scale' : 'Tu GPA en escala 4.0',
    text: __lang === 'en'
      ? `A GPA of **${gpa.toFixed(2)}** falls in the **${banda}** band. On the U.S. 4.0 scale, 3.0+ is solid and 3.7+ opens honors and scholarship eligibility.`
      : `Un GPA de **${gpa.toFixed(2)}** cae en la banda **${banda}**. En la escala 4.0 de EE.UU., 3.0+ es sólido y 3.7+ habilita honores y becas.`,
    tone,
    icon: '🎓',
  };

  const _chart = {
    type: 'scale' as const,
    marker: Number(gpa.toFixed(2)),
    markerLabel: (__lang === 'en' ? 'Your GPA: ' : 'Tu GPA: ') + gpa.toFixed(2),
    min: 0,
    segments: [
      { nombre: 'D/F', max: 2.0, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'C', max: 3.0, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'B', max: 3.7, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'A', max: 4.0, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: __lang === 'en' ? 'GPA scale 0 to 4.0 with letter-grade zones.' : 'Escala de GPA de 0 a 4.0 con zonas por letra.',
  };

  return { resultado:r.toFixed(2), resumen, _insight, _chart };
}
