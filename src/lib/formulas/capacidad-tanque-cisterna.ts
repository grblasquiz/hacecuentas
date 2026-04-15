/** Litros de un tanque cilíndrico o rectangular según dimensiones */
export interface Inputs {
  forma?: string; // cilindrico | rectangular
  diametro?: number; // cm (si cilíndrico)
  largo?: number; // cm
  ancho?: number; // cm
  alto?: number; // cm
  llenadoPct?: number;
}
export interface Outputs {
  volumenLitros: number;
  volumenM3: number;
  volumenUtilLitros: number;
  diasConsumoFamilia4: number;
  diasConsumoFamilia2: number;
  forma: string;
  resumen: string;
}

export function capacidadTanqueCisterna(i: Inputs): Outputs {
  const forma = String(i.forma || 'cilindrico');
  const llenado = Number(i.llenadoPct) || 90;

  let volLitros = 0;

  if (forma === 'cilindrico') {
    const d = Number(i.diametro);
    const h = Number(i.alto);
    if (!d || d <= 0) throw new Error('Ingresá el diámetro en cm');
    if (!h || h <= 0) throw new Error('Ingresá la altura en cm');
    // Volumen = π × r² × h. En cm³ → dividir por 1000 para litros
    const r = d / 2;
    const volCm3 = Math.PI * r * r * h;
    volLitros = volCm3 / 1000;
  } else if (forma === 'rectangular') {
    const l = Number(i.largo);
    const a = Number(i.ancho);
    const h = Number(i.alto);
    if (!l || !a || !h) throw new Error('Ingresá largo, ancho y alto en cm');
    const volCm3 = l * a * h;
    volLitros = volCm3 / 1000;
  } else {
    throw new Error('Forma no válida');
  }

  const volUtil = volLitros * (llenado / 100);
  // Consumo típico: 150 L/persona/día (OMS) — usamos 200 L (ducha + cocina + wc + limpieza)
  const diasFam4 = volUtil / (4 * 200);
  const diasFam2 = volUtil / (2 * 200);

  return {
    volumenLitros: Number(volLitros.toFixed(1)),
    volumenM3: Number((volLitros / 1000).toFixed(3)),
    volumenUtilLitros: Number(volUtil.toFixed(1)),
    diasConsumoFamilia4: Number(diasFam4.toFixed(1)),
    diasConsumoFamilia2: Number(diasFam2.toFixed(1)),
    forma: forma === 'cilindrico' ? 'Cilíndrico' : 'Rectangular',
    resumen: `Capacidad total: ${Math.round(volLitros)} litros. Útil (${llenado}%): ${Math.round(volUtil)} litros.`,
  };
}
