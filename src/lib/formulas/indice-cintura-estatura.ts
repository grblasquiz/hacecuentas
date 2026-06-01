/** WHtR - Índice cintura/estatura */
export interface Inputs { cintura: number; estatura: number; }
export interface Outputs { whtr: number; clasificacion: string; cinturaSaludable: number; mensaje: string; _chart?: any; }

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

  return {
    whtr, clasificacion, cinturaSaludable,
    mensaje: `WHtR: ${whtr}. ${clasificacion}. Tu cintura máxima saludable: ${cinturaSaludable} cm.`,
    _chart: chart,
  };
}