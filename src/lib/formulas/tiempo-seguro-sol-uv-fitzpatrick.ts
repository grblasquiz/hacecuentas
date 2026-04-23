/** Tiempo seguro al sol antes de quemadura según UV × fototipo Fitzpatrick. */
export interface Inputs {
  uvIndex: number;                                 // 0-14
  fototipo: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  spf: number;                                     // 0, 15, 30, 50, 70, 100
}
export interface Outputs {
  minutosSinProteccion: string;
  minutosConSPF: string;
  minutosSinProteccionNumero: number;
  minutosConSPFNumero: number;
  categoriaUV: string;
  recomendacion: string;
  mensaje: string;
}

// Minutos a UV 10 para cada fototipo (referencia OMS/WHO Global Solar UV Index)
const MIN_UV10: Record<string, number> = {
  I: 5,
  II: 10,
  III: 15,
  IV: 20,
  V: 30,
  VI: 40,
};

export function tiempoSeguroSolUvFitzpatrick(i: Inputs): Outputs {
  const uv = Number(i.uvIndex);
  const spf = Number(i.spf);
  if (!Number.isFinite(uv) || uv < 0 || uv > 16) throw new Error('Índice UV fuera de rango (0-16).');
  if (!Number.isFinite(spf) || spf < 0 || spf > 130) throw new Error('SPF fuera de rango (0-130).');
  const base10 = MIN_UV10[i.fototipo];
  if (!base10) throw new Error('Fototipo inválido (I-VI).');

  // Tiempo inversamente proporcional al UV: t = base10 × (10 / UV)
  const uvEff = uv <= 0 ? 0.5 : uv;
  const minSinSPF = base10 * (10 / uvEff);
  // Con SPF: multiplica el tiempo (en la práctica, efectividad real ~80-85% del teórico)
  const factorSPF = spf > 0 ? spf * 0.85 : 1;
  const minConSPF = minSinSPF * factorSPF;

  let catUV = 'Bajo';
  let rec = 'Protección mínima necesaria en exposición prolongada.';
  if (uv >= 11) { catUV = 'Extremo'; rec = 'Evitar sol directo 10-16 h. SPF 50+, sombra, ropa UV, gorro y anteojos obligatorios.'; }
  else if (uv >= 8) { catUV = 'Muy alto'; rec = 'SPF 30-50, repetir cada 2 h, sombra entre 11 y 16 h.'; }
  else if (uv >= 6) { catUV = 'Alto'; rec = 'SPF 30 mínimo, sombrero y anteojos. Evitar horario pico.'; }
  else if (uv >= 3) { catUV = 'Moderado'; rec = 'SPF 15-30 si la exposición supera 30-45 min.'; }
  else { catUV = 'Bajo'; rec = 'Protección mínima salvo exposiciones muy largas.'; }

  const fmt = (m: number) => m >= 120 ? `${(m / 60).toFixed(1)} h` : `${Math.round(m)} min`;

  return {
    minutosSinProteccion: fmt(minSinSPF),
    minutosConSPF: fmt(minConSPF),
    minutosSinProteccionNumero: Number(minSinSPF.toFixed(1)),
    minutosConSPFNumero: Number(minConSPF.toFixed(1)),
    categoriaUV: `UV ${uv} — ${catUV}`,
    recomendacion: rec,
    mensaje: `Fototipo ${i.fototipo} con UV ${uv}: quemadura en ~${fmt(minSinSPF)} sin protección; ${spf > 0 ? `~${fmt(minConSPF)} con SPF ${spf}` : 'usá protector solar'}.`,
  };
}
