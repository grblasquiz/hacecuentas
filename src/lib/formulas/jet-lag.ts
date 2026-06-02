/** Jet lag — días estimados de recuperación */
export interface Inputs {
  zonasAtravesadas: number;
  direccion: 'este' | 'oeste' | string;
  edad?: number;
}
export interface Outputs {
  diasRecuperacion: number;
  severidad: string;
  recomendaciones: string;
  _insight?: any;
  _chart?: any;
}

export function jetLag(i: Inputs): Outputs {
  const zonas = Math.abs(Number(i.zonasAtravesadas));
  const dir = String(i.direccion || 'este');
  const edad = Number(i.edad) || 35;
  if (zonas < 0) throw new Error('Zonas horarias inválido');

  // Regla general: 1 día por zona horaria (oeste) o 1.5 días (este)
  let dias = dir === 'este' ? zonas * 1.3 : zonas * 1;

  // Ajuste por edad: +10 % cada 10 años sobre 40
  if (edad > 40) dias *= 1 + (edad - 40) / 100;

  let severidad = '';
  if (zonas < 3) severidad = 'Mínimo — probablemente no notes jet lag significativo.';
  else if (zonas < 6) severidad = 'Moderado — algunos días de adaptación.';
  else if (zonas < 9) severidad = 'Intenso — expectá 1 semana de adaptación.';
  else severidad = 'Máximo — recuperación puede tardar hasta 2 semanas.';

  let tips = '';
  if (dir === 'este') {
    tips = 'Hacia el este: más difícil. Recomendaciones: exponerse a luz matinal, evitar siestas largas, cena liviana y adelantar horarios gradualmente 3 días antes.';
  } else {
    tips = 'Hacia el oeste: más fácil. Recomendaciones: mantenerse activo hasta la noche local, luz tarde, retrasar horarios gradualmente.';
  }

  const diasR = Number(dias.toFixed(1));
  const nivel = zonas < 3 ? 'Mínimo' : zonas < 6 ? 'Moderado' : zonas < 9 ? 'Intenso' : 'Máximo';
  const edadNota = edad > 40 ? ` Ajustamos por tus **${edad} años** (la recuperación se enlentece con la edad).` : '';
  const _insight = {
    title: zonas < 3 ? 'Casi sin jet lag' : `~${diasR} ${diasR === 1 ? 'día' : 'días'} de recuperación`,
    text: zonas < 3
      ? `Cruzás solo **${zonas} ${zonas === 1 ? 'zona' : 'zonas'} horarias** hacia el **${dir}**: con ~**${diasR} ${diasR === 1 ? 'día' : 'días'}** estás. Apenas vas a notar el cambio.${edadNota}`
      : `Cruzando **${zonas} zonas horarias** hacia el **${dir}**, esperá unos **${diasR} ${diasR === 1 ? 'día' : 'días'}** de adaptación. ${dir === 'este' ? 'El **este** cuesta más: hay que adelantar el reloj interno.' : 'El **oeste** es más fácil: alargás el día.'}${edadNota}`,
    tone: nivel === 'Máximo' || nivel === 'Intenso' ? 'warn' : nivel === 'Moderado' ? 'neutral' : 'good',
    icon: nivel === 'Máximo' ? '😵' : nivel === 'Intenso' ? '😴' : nivel === 'Moderado' ? '🥱' : '🙂',
  };
  const topMax = Math.max(12, Math.ceil(zonas) + 1);
  const _chart = {
    type: 'scale',
    marker: zonas,
    markerLabel: `${zonas} zonas`,
    min: 0,
    segments: [
      { nombre: 'Mínimo', max: 2, color: '#86efac', colorDark: '#22c55e' },
      { nombre: 'Moderado', max: 5, color: '#fde047', colorDark: '#eab308' },
      { nombre: 'Intenso', max: 8, color: '#fdba74', colorDark: '#f97316' },
      { nombre: 'Máximo', max: topMax, color: '#fca5a5', colorDark: '#ef4444' },
    ],
    ariaLabel: `Severidad del jet lag: ${zonas} zonas horarias, nivel ${nivel}`,
  };

  return {
    diasRecuperacion: diasR,
    severidad,
    recomendaciones: tips,
    _insight,
    _chart,
  };
}
