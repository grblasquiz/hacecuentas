/** WHtR - Índice cintura/estatura */
export interface Inputs { cintura: number; estatura: number; }
export interface Outputs { whtr: number; clasificacion: string; cinturaSaludable: number; mensaje: string; _chart?: any; _insight?: any; }

export function indiceCinturaEstatura(i: Inputs): Outputs {
  const cintura = Number(i.cintura);
  const estatura = Number(i.estatura);
  if (!cintura || !estatura) throw new Error('Ingresá cintura y estatura');

  const whtr = Number((cintura / estatura).toFixed(2));
  const cinturaSaludable = Math.round(estatura * 0.5);

  let clasificacion: string;
  if (whtr < 0.40) clasificacion = '🟢 Delgadez (posible bajo peso)';
  else if (whtr < 0.50) clasificacion = '🟢 Sin riesgo metabólico adicional';
  else if (whtr < 0.54) clasificacion = '🟡 Riesgo ligeramente aumentado';
  else if (whtr < 0.60) clasificacion = '🟠 Riesgo aumentado';
  else clasificacion = '🔴 Riesgo alto — obesidad abdominal';

  const topSeg = Math.max(0.7, Math.ceil(whtr * 100) / 100 + 0.05);
  const chart = {
    type: 'scale' as const,
    marker: whtr,
    markerLabel: 'Tu WHtR: ' + whtr,
    min: 0.30,
    unit: '',
    segments: [
      { nombre: 'Bajo peso', max: 0.40, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Saludable', max: 0.50, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Riesgo leve', max: 0.54, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Riesgo aumentado', max: 0.60, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Riesgo alto', max: topSeg, color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala del índice cintura-estatura (WHtR) y riesgo metabólico.',
  };

  let insight: any;
  if (whtr < 0.40) {
    insight = {
      title: 'Posible bajo peso',
      text: `Tu WHtR es **${whtr}**, por debajo de **0,40**: puede indicar **bajo peso**. La cintura saludable de referencia para tu estatura es hasta **${cinturaSaludable} cm**.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else if (whtr < 0.50) {
    const margen = cinturaSaludable - Math.round(cintura);
    insight = {
      title: 'Sin riesgo adicional',
      text: `Tu WHtR es **${whtr}**, dentro del rango saludable (**menos de 0,50**). Tu cintura está **${margen} cm** por debajo del máximo saludable (**${cinturaSaludable} cm**). La regla simple: la cintura debe medir menos de la mitad de tu altura.`,
      tone: 'good',
      icon: '🟢',
    };
  } else {
    const exceso = Math.round(cintura) - cinturaSaludable;
    const grave = whtr >= 0.60;
    insight = {
      title: grave ? 'Obesidad abdominal' : 'Cintura sobre lo saludable',
      text: `Tu WHtR es **${whtr}**, sobre el umbral de **0,50**: tu cintura supera por **${exceso} cm** el máximo saludable (**${cinturaSaludable} cm**). ${grave ? 'Está en zona de **riesgo metabólico alto**.' : 'Reducir el contorno de cintura baja el riesgo metabólico.'}`,
      tone: 'warn',
      icon: grave ? '🔴' : '🟠',
    };
  }

  return {
    whtr, clasificacion, cinturaSaludable,
    mensaje: `WHtR: ${whtr}. ${clasificacion}. Tu cintura máxima saludable: ${cinturaSaludable} cm.`,
    _chart: chart,
    _insight: insight,
  };
}