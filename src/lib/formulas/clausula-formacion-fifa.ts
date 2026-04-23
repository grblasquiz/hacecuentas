/** FIFA Training Compensation — indemnización por formación, jugador <23 */
export interface Inputs {
  edadAlFichaje: number; // 17-23
  categoriaClubFormador: string; // 'I' | 'II' | 'III' | 'IV'
  categoriaClubCompra: string; // 'I' | 'II' | 'III' | 'IV'
  confederacionDestino: string; // 'uefa' | 'conmebol' | 'concacaf' | 'afc' | 'caf' | 'ofc'
  anosEnClubFormador: number; // años que formó al jugador entre 12-21
}

export interface Outputs {
  tarifaAnualAplicada: number;
  anosFormacionComputados: number;
  compensacionTotal: number;
  moneda: string;
  factorEdad: number;
  resumen: string;
}

// Tarifas anuales FIFA Circular 1798 (ajustadas 2024) en EUR por categoría del club que compra
// Referencia UEFA: I = €90k, II = €60k, III = €30k, IV = €10k
const TARIFAS_UEFA: Record<string, number> = { I: 90_000, II: 60_000, III: 30_000, IV: 10_000 };
const TARIFAS_CONMEBOL: Record<string, number> = { I: 50_000, II: 30_000, III: 10_000, IV: 2_000 };
const TARIFAS_CONCACAF: Record<string, number> = { I: 40_000, II: 30_000, III: 10_000, IV: 2_000 };
const TARIFAS_AFC: Record<string, number> = { I: 40_000, II: 30_000, III: 10_000, IV: 2_000 };
const TARIFAS_CAF: Record<string, number> = { I: 30_000, II: 10_000, III: 10_000, IV: 2_000 };
const TARIFAS_OFC: Record<string, number> = { I: 30_000, II: 10_000, III: 2_000, IV: 2_000 };

export function clausulaFormacionFifa(i: Inputs): Outputs {
  const edad = Math.max(12, Math.min(23, Number(i.edadAlFichaje) || 20));
  const catForm = String(i.categoriaClubFormador || 'II').toUpperCase();
  const catCompra = String(i.categoriaClubCompra || 'I').toUpperCase();
  const conf = String(i.confederacionDestino || 'uefa').toLowerCase();
  const anosPropuestos = Math.max(0, Math.min(10, Number(i.anosEnClubFormador) || 4));

  const tablaConf: Record<string, Record<string, number>> = {
    uefa: TARIFAS_UEFA,
    conmebol: TARIFAS_CONMEBOL,
    concacaf: TARIFAS_CONCACAF,
    afc: TARIFAS_AFC,
    caf: TARIFAS_CAF,
    ofc: TARIFAS_OFC,
  };

  const tablaCompra = tablaConf[conf] || TARIFAS_UEFA;
  const tablaForm = tablaConf[conf] || TARIFAS_UEFA;

  // Entre 12-15: tarifa Cat IV siempre (protección jugador joven)
  // Entre 16-21: tarifa categoría real del club que compra
  const anosTempranos = Math.min(anosPropuestos, Math.max(0, Math.min(4, edad - 12)));
  const anosMayores = Math.max(0, anosPropuestos - anosTempranos);

  const compTemprano = anosTempranos * tablaForm['IV'];
  const compMayor = anosMayores * (tablaCompra[catCompra] ?? tablaCompra.II);
  const total = compTemprano + compMayor;

  // factor edad (si jugador fichado >21 ya no aplica plena training compensation, cap 23)
  let factor = 1;
  if (edad > 21) factor = 0.8;
  if (edad === 23) factor = 0.5;

  const finalComp = total * factor;

  return {
    tarifaAnualAplicada: tablaCompra[catCompra] ?? tablaCompra.II,
    anosFormacionComputados: anosPropuestos,
    compensacionTotal: Math.round(finalComp),
    moneda: 'EUR',
    factorEdad: factor,
    resumen: `Training compensation FIFA: €${Math.round(finalComp).toLocaleString('en')} a clubes formadores por jugador de ${edad} años (${anosPropuestos} años formado, Cat ${catForm} → ${catCompra} ${conf.toUpperCase()}).`,
  };
}
