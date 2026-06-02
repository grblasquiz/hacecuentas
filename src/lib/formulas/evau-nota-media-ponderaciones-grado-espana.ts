export interface Inputs {
  nota_media_bachillerato: number;
  nota_obligatoria_1: number;
  nota_obligatoria_2: number;
  nota_obligatoria_3: number;
  nota_obligatoria_4: number;
  tiene_ponderacion: 'si' | 'no';
  nota_ponderacion_1?: number;
  multiplicador_ponderacion_1?: string;
  nota_ponderacion_2?: number;
  multiplicador_ponderacion_2?: string;
  grado_objetivo?: string;
}

export interface Outputs {
  nota_fase_obligatoria: number;
  aporte_ponderacion: number;
  nota_acceso_base: number;
  nota_acceso_final: number;
  cumple_acceso_basico: boolean;
  margen_respecto_5: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const notaBach = Math.max(0, Math.min(10, i.nota_media_bachillerato || 0));
  const notaOb1 = Math.max(0, Math.min(10, i.nota_obligatoria_1 || 0));
  const notaOb2 = Math.max(0, Math.min(10, i.nota_obligatoria_2 || 0));
  const notaOb3 = Math.max(0, Math.min(10, i.nota_obligatoria_3 || 0));
  const notaOb4 = Math.max(0, Math.min(10, i.nota_obligatoria_4 || 0));

  // 1. Calcula media fase obligatoria (4 materias)
  const notaFaseObligatoria = (notaOb1 + notaOb2 + notaOb3 + notaOb4) / 4;

  // 2. Calcula componente base (60% bach + 40% obligatorias)
  // Según RD 412/2023, Art. 4
  const notaBaseAcceso = (notaBach * 0.6) + (notaFaseObligatoria * 0.4);

  // 3. Calcula aporte ponderación
  let aportePonderacion = 0;
  if (i.tiene_ponderacion === 'si') {
    if (i.nota_ponderacion_1 !== undefined && i.multiplicador_ponderacion_1) {
      const notaP1 = Math.max(0, Math.min(10, i.nota_ponderacion_1));
      const multP1 = parseFloat(i.multiplicador_ponderacion_1);
      aportePonderacion += notaP1 * multP1;
    }
    if (i.nota_ponderacion_2 !== undefined && i.multiplicador_ponderacion_2) {
      const notaP2 = Math.max(0, Math.min(10, i.nota_ponderacion_2));
      const multP2 = parseFloat(i.multiplicador_ponderacion_2);
      aportePonderacion += notaP2 * multP2;
    }
  }

  // 4. Nota acceso final = base + ponderaciones, máximo 14
  const notaAccesoFinal = Math.min(14, notaBaseAcceso + aportePonderacion);

  // 5. Cumple acceso mínimo (5,0 puntos)
  const cumpleAccesoBasico = notaAccesoFinal >= 5.0;

  // 6. Margen respecto a 5,0
  const margenRespecto5 = notaAccesoFinal - 5.0;

  const notaFinal = parseFloat(notaAccesoFinal.toFixed(3));
  const notaFinalFmt = notaFinal.toFixed(3).replace('.', ',');
  const gradoTxt = (i.grado_objetivo && String(i.grado_objetivo).trim())
    ? ` Compará tu **${notaFinalFmt}** con la nota de corte de ${String(i.grado_objetivo).trim()}.`
    : '';

  let _insight: any;
  if (!cumpleAccesoBasico) {
    _insight = {
      title: 'No alcanza el acceso',
      text: `Tu nota de acceso es **${notaFinalFmt}/14**, por debajo del **5,0** mínimo (te faltan **${Math.abs(margenRespecto5).toFixed(2).replace('.', ',')}** puntos). Subir las materias obligatorias o ponderar asignaturas afines es la palanca clave.`,
      tone: 'warn',
      icon: '🎓',
    };
  } else if (notaFinal < 9) {
    _insight = {
      title: 'Acceso asegurado',
      text: `Tu nota de acceso es **${notaFinalFmt}/14**: superás el **5,0** mínimo con **${margenRespecto5.toFixed(2).replace('.', ',')}** puntos de margen. Suficiente para grados de corte medio-bajo.${gradoTxt}`,
      tone: 'good',
      icon: '🎓',
    };
  } else if (notaFinal < 12) {
    _insight = {
      title: 'Nota competitiva',
      text: `Tu nota de acceso es **${notaFinalFmt}/14**: una nota competitiva que abre la puerta a la mayoría de los grados.${gradoTxt}`,
      tone: 'good',
      icon: '🎓',
    };
  } else {
    _insight = {
      title: 'Nota de élite',
      text: `Tu nota de acceso es **${notaFinalFmt}/14**: estás en el rango más alto, suficiente para los grados más exigentes (Medicina, dobles grados).${gradoTxt}`,
      tone: 'good',
      icon: '🎓',
    };
  }

  const _chart = {
    type: 'scale',
    marker: notaFinal,
    markerLabel: `${notaFinalFmt}/14`,
    min: 0,
    segments: [
      { nombre: 'No apto', max: 5, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Acceso', max: 9, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Competitiva', max: 12, color: '#16a34a', colorDark: '#15803d' },
      { nombre: 'Élite', max: 14.001, color: '#0ea5e9', colorDark: '#0284c7' },
    ],
    ariaLabel: `Nota de acceso de ${notaFinalFmt} sobre 14, en una escala de no apto (menos de 5) a élite (12-14).`,
  };

  return {
    nota_fase_obligatoria: parseFloat(notaFaseObligatoria.toFixed(2)),
    aporte_ponderacion: parseFloat(aportePonderacion.toFixed(3)),
    nota_acceso_base: parseFloat(notaBaseAcceso.toFixed(3)),
    nota_acceso_final: notaFinal,
    cumple_acceso_basico: cumpleAccesoBasico,
    margen_respecto_5: parseFloat(margenRespecto5.toFixed(2)),
    _insight,
    _chart
  };
}
