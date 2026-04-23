/** Captación de agua de lluvia: litros = mm × m² × eficiencia. */
export interface Inputs {
  mmLluvia: number;       // mm del evento o mensual/anual
  areaTecho: number;      // m² (proyección horizontal)
  eficiencia: number;     // 0-1 (0.8 típico)
}
export interface Outputs {
  litros: string;            // "1200 L"
  litrosNumero: number;
  m3: string;
  bidones200: string;
  equivalencia: string;
  mensaje: string;
}

export function captacionAguaLluviaTecho(i: Inputs): Outputs {
  const mm = Number(i.mmLluvia);
  const m2 = Number(i.areaTecho);
  const eff = Number(i.eficiencia);
  if (!Number.isFinite(mm) || mm <= 0 || mm > 5000) throw new Error('mm de lluvia fuera de rango (0 a 5000).');
  if (!Number.isFinite(m2) || m2 <= 0 || m2 > 10000) throw new Error('Área fuera de rango (0 a 10 000 m²).');
  if (!Number.isFinite(eff) || eff <= 0 || eff > 1) throw new Error('Eficiencia debe estar entre 0.05 y 1 (ideal 0.75-0.85).');

  // 1 mm × 1 m² = 1 litro
  const litros = mm * m2 * eff;
  const m3 = litros / 1000;
  const bidones = litros / 200;

  let equiv = '';
  if (litros < 500) equiv = 'Equivale a unas pocas duchas.';
  else if (litros < 2000) equiv = `Alcanza para ~${Math.round(litros / 150)} descargas de inodoro estándar.`;
  else if (litros < 10000) equiv = `Riego de huerta familiar por ${Math.round(litros / 50)} días.`;
  else equiv = `Abastecimiento de reserva considerable: ${m3.toFixed(1)} m³.`;

  return {
    litros: `${litros.toFixed(0)} L`,
    litrosNumero: Number(litros.toFixed(1)),
    m3: `${m3.toFixed(2)} m³`,
    bidones200: `${bidones.toFixed(1)} bidones de 200 L`,
    equivalencia: equiv,
    mensaje: `${mm} mm sobre ${m2} m² (ef. ${(eff * 100).toFixed(0)}%) = ${litros.toFixed(0)} L captables.`,
  };
}
