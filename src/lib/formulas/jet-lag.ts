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

  return {
    diasRecuperacion: Number(dias.toFixed(1)),
    severidad,
    recomendaciones: tips,
  };
}
