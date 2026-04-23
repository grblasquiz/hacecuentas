/** Mundial 2026 - Descanso entre partidos */
export interface Inputs { fechaPartido1: string; fechaPartido2: string; }
export interface Outputs { horas: string; cumpleReglamento: string; recomendacion: string; }

function parseFecha(s: string): number {
  const m = String(s || '').trim().replace('T', ' ');
  const parts = m.split(/\s+/);
  if (parts.length < 1) return NaN;
  const [y, mo, d] = parts[0].split('-').map(Number);
  let h = 0, mi = 0;
  if (parts[1]) {
    const hm = parts[1].split(':').map(Number);
    h = hm[0] || 0; mi = hm[1] || 0;
  }
  if (!y || !mo || !d) return NaN;
  return new Date(y, mo - 1, d, h, mi).getTime();
}

export function mundial2026Descanso(i: Inputs): Outputs {
  const t1 = parseFecha(String(i.fechaPartido1));
  const t2 = parseFecha(String(i.fechaPartido2));
  if (isNaN(t1) || isNaN(t2)) throw new Error('Fecha inválida');
  if (t2 <= t1) throw new Error('La fecha del segundo partido debe ser posterior a la del primero');
  const horas = (t2 - t1) / 3600000;
  const cumple = horas >= 48;
  const ideal = horas >= 72;
  return {
    horas: `${horas.toFixed(1)} horas (${(horas / 24).toFixed(1)} días)`,
    cumpleReglamento: cumple ? `Sí cumple (mínimo FIFA 48hs)` : `No cumple (faltan ${(48 - horas).toFixed(1)}h para el mínimo FIFA)`,
    recomendacion: ideal
      ? 'Descanso ideal (≥72hs): recuperación muscular completa.'
      : cumple
        ? 'Descanso aceptable pero no ideal. FIFA Medical Network recomienda 72hs.'
        : 'Descanso insuficiente: riesgo alto de lesiones y bajo rendimiento.',
  };
}
