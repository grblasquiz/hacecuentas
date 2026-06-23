export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

// ---------------------------------------------------------------------------
// Esquema SEF — Subsidios Energéticos Focalizados (Decreto 943/2025,
// Boletín Oficial 02/01/2026). Reemplaza la segmentación N1/N2/N3 y el RASE.
//
// Lógica vigente 2026:
//  - La segmentación en TRES niveles (N1/N2/N3) quedó DEROGADA (Art. 2°).
//  - Sólo dos condiciones: CON subsidio / SIN subsidio (según ingresos ≤ 3 CBT).
//  - "Sin subsidio" = paga el PRECIO PLENO (costo real) de la energía por kWh.
//  - "Con subsidio" = 50% de bonificación SOLO sobre un bloque base de
//      300 kWh/mes en meses de mayor demanda (verano e invierno) o
//      150 kWh/mes en meses templados (primavera y otoño) — Art. 4° / Anexo II.
//    El EXCEDENTE del bloque se paga a precio pleno (sin subsidio).
//  - Bonificación extraordinaria SOLO 2026 (Art. 8°): hasta +25% en enero,
//    bajando ~2 p.p./mes hasta apagarse en diciembre. Se explica en la prosa;
//    el cálculo usa la bonificación base estable del 50%.
// ---------------------------------------------------------------------------

// Bonificación base del subsidio focalizado (estable todo el año).
const BONIFICACION_BASE = 0.5;

// Bloque base subsidiado (kWh/mes) según temporada — Decreto 943/2025 Art. 4°.
const BLOQUE_ALTA_DEMANDA = 300; // verano e invierno (mayor demanda)
const BLOQUE_TEMPLADO = 150; // primavera y otoño (templado)

// IVA diferencial 27% para energía eléctrica residencial (Art. 28, Ley 23.349).
const IVA = 0.27;

export function electricidadTarifaSocialSubsidioN1N2(i: Inputs): Outputs {
  const k = Math.max(0, Number(i.kwhMes) || 0);
  const condicion = String(i.condicion || 'con_subsidio').toLowerCase();
  const temporada = String(i.temporada || 'alta_demanda').toLowerCase();
  const tarifaPlena = Number(i.tarifaPlena) || 220; // $/kWh precio pleno (costo real)

  const tieneSubsidio = condicion === 'con_subsidio';
  const bloqueBase = temporada === 'templado' ? BLOQUE_TEMPLADO : BLOQUE_ALTA_DEMANDA;

  // --- Cargo variable (energía) ---
  // Sin subsidio: todo el consumo a precio pleno.
  // Con subsidio: hasta el bloque base con 50% off; el excedente, a precio pleno.
  let kwhSubsidiados = 0;
  let kwhExcedente = k;
  let energia = 0;
  let ahorro = 0;

  if (tieneSubsidio) {
    kwhSubsidiados = Math.min(k, bloqueBase);
    kwhExcedente = Math.max(0, k - bloqueBase);
    const precioSubsidiado = tarifaPlena * (1 - BONIFICACION_BASE);
    energia = kwhSubsidiados * precioSubsidiado + kwhExcedente * tarifaPlena;
    ahorro = kwhSubsidiados * tarifaPlena * BONIFICACION_BASE;
  } else {
    energia = k * tarifaPlena;
  }

  // Factura sin ningún subsidio (precio pleno sobre todo el consumo), con IVA.
  const energiaPlenaTotal = k * tarifaPlena;
  const costoConIva = energia * (1 + IVA);
  const sinSubsidioConIva = energiaPlenaTotal * (1 + IVA);
  const ahorroConIva = sinSubsidioConIva - costoConIva;

  const costoR = Math.round(costoConIva);
  const sinR = Math.round(sinSubsidioConIva);
  const ahorroR = Math.round(ahorroConIva);
  const pctAhorro = sinR > 0 ? Math.round((ahorroR / sinR) * 100) : 0;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  const condicionLabel = tieneSubsidio ? 'Con subsidio (SEF)' : 'Sin subsidio (tarifa plena)';

  const out: Outputs = {
    costoMensual: fmt(costoR),
    segmento: condicionLabel,
    ahorroVsN1: tieneSubsidio && ahorroR > 0
      ? `${fmt(ahorroR)} (${pctAhorro}%)`
      : '$0 (sin subsidio)',
  };

  // Insight: tono dinámico según haya o no subsidio.
  out._insight = tieneSubsidio
    ? {
        title: 'Cuánto te ahorra el subsidio (SEF)',
        text: `Sin subsidio, los **${k} kWh** te costarían **${fmt(sinR)}** (IVA incl.). Con subsidio focalizado pagás **${fmt(costoR)}**: el 50% aplica solo sobre **${kwhSubsidiados} kWh** (bloque de ${bloqueBase} kWh de la temporada)${kwhExcedente > 0 ? `, y los **${kwhExcedente} kWh** excedentes van a precio pleno` : ''}. Te ahorrás **${fmt(ahorroR)}** (**${pctAhorro}%**).`,
        tone: 'good',
        icon: '💡',
      }
    : {
        title: 'Tarifa plena, sin subsidio',
        text: `Sin subsidio pagás el **precio pleno** (costo real) sobre cada kWh: **${fmt(costoR)}** por **${k} kWh** (IVA incl.). La segmentación N1/N2/N3 quedó derogada en enero de 2026; hoy es con o sin subsidio.`,
        tone: 'warn',
        icon: '💡',
      };

  // Donut SOLO si hay subsidio y ahorro positivo: la factura plena se reparte
  // en lo que pagás + lo que cubre el subsidio.
  if (tieneSubsidio && ahorroR > 0 && sinR > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Lo que pagás', value: costoR },
        { label: 'Cubre el subsidio', value: ahorroR },
      ],
      prefix: '$',
      centerValue: fmt(sinR),
      centerLabel: 'Factura sin subsidio',
      ariaLabel: `Factura plena de ${fmt(sinR)} repartida en ${fmt(costoR)} que pagás y ${fmt(ahorroR)} que cubre el subsidio focalizado`,
    };
  }

  return out;
}
