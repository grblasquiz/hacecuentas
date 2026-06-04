export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function hotelPrecioNochesVsAirbnbComparativa(i: Inputs): Outputs {
  const lang = (i.__lang as string) || 'es';

  // ── Inputs comunes ──────────────────────────────────────────────
  const noches        = Math.max(1, Number(i.noches) || 1);

  // ── Hotel ───────────────────────────────────────────────────────
  const hotelTarifa   = Number(i.hotel_tarifa)   || 0;  // precio/noche base
  const hotelDesayuno = Number(i.hotel_desayuno) || 0;  // desayuno/persona/noche (0 = incluido)
  const hotelPersonas = Math.max(1, Number(i.hotel_personas) || 1);
  const hotelImpuesto = Number(i.hotel_impuesto) || 0;  // tasa turística/noche (flat)
  const hotelResortFee = Number(i.hotel_resort_fee) || 0; // resort fee/noche (común en EEUU)

  // ── Airbnb ──────────────────────────────────────────────────────
  const airbnbTarifa   = Number(i.airbnb_tarifa)   || 0; // precio/noche base
  const airbnbLimpieza = Number(i.airbnb_limpieza) || 0; // tarifa de limpieza única
  // Fee de servicio para el huésped: Airbnb cobra ~14–16 % sobre (tarifa × noches + limpieza).
  // En el modelo host-only (desde Q4 2025) puede ser 0 % para el huésped.
  const airbnbFeePorc = Math.min(50, Math.max(0, Number(i.airbnb_fee_porc) || 0)) / 100;
  const airbnbImpuesto = Number(i.airbnb_impuesto) || 0; // impuestos locales/noche (flat)

  // ── Cálculo Hotel ───────────────────────────────────────────────
  // Costo Hotel = (tarifa × noches)
  //             + (desayuno × personas × noches)
  //             + (impuesto turístico × noches)
  //             + (resort fee × noches)
  const costoHotelBase = hotelTarifa * noches;
  const costoDesayuno   = hotelDesayuno * hotelPersonas * noches;
  const costoHotelImp   = hotelImpuesto * noches;
  const costoResortFee  = hotelResortFee * noches;
  const costoHotelTotal = costoHotelBase + costoDesayuno + costoHotelImp + costoResortFee;

  // ── Cálculo Airbnb ──────────────────────────────────────────────
  // Subtotal sobre el que aplica el fee = (tarifa × noches) + limpieza
  // Costo Airbnb = subtotal + fee_servicio × subtotal + impuesto × noches
  const airbnbSubtotal  = airbnbTarifa * noches + airbnbLimpieza;
  const airbnbFee       = airbnbSubtotal * airbnbFeePorc;
  const costoAirbnbImp  = airbnbImpuesto * noches;
  const costoAirbnbTotal = airbnbSubtotal + airbnbFee + costoAirbnbImp;

  // ── Comparativa ─────────────────────────────────────────────────
  const diferencia  = costoHotelTotal - costoAirbnbTotal;   // + = hotel más caro
  const ahorroAbs   = Math.abs(diferencia);
  const ahorroPorc  = costoHotelTotal > 0
    ? Math.abs(diferencia) / costoHotelTotal * 100
    : 0;

  const masBarato  = diferencia > 0 ? 'airbnb' : diferencia < 0 ? 'hotel' : 'igual';
  const costoNocheHotel   = noches > 0 ? costoHotelTotal / noches : 0;
  const costoNocheAirbnb  = noches > 0 ? costoAirbnbTotal / noches : 0;

  // ── Textos según idioma ─────────────────────────────────────────
  let resultadoLabel: string;
  let resumenText: string;
  let insightTitle: string;
  let insightText: string;

  if (lang === 'en') {
    if (masBarato === 'airbnb') {
      resultadoLabel = `Airbnb saves you ${ahorroPorc.toFixed(1)}%`;
      resumenText = `Hotel total: ${costoHotelTotal.toFixed(2)} | Airbnb total: ${costoAirbnbTotal.toFixed(2)} | Airbnb saves ${ahorroAbs.toFixed(2)} (${ahorroPorc.toFixed(1)}%) over ${noches} night${noches !== 1 ? 's' : ''}. Effective cost per night — Hotel: ${costoNocheHotel.toFixed(2)} vs Airbnb: ${costoNocheAirbnb.toFixed(2)}.`;
      insightText = `The **Airbnb is cheaper** by **${ahorroAbs.toFixed(2)}** (${ahorroPorc.toFixed(1)}%) over ${noches} night${noches !== 1 ? 's' : ''}. The longer the stay, the more the fixed cleaning fee is diluted — if the gap is narrow, check whether the hotel includes breakfast or the Airbnb has a parking fee.`;
    } else if (masBarato === 'hotel') {
      resultadoLabel = `Hotel saves you ${ahorroPorc.toFixed(1)}%`;
      resumenText = `Hotel total: ${costoHotelTotal.toFixed(2)} | Airbnb total: ${costoAirbnbTotal.toFixed(2)} | Hotel saves ${ahorroAbs.toFixed(2)} (${ahorroPorc.toFixed(1)}%) over ${noches} night${noches !== 1 ? 's' : ''}. Effective cost per night — Hotel: ${costoNocheHotel.toFixed(2)} vs Airbnb: ${costoNocheAirbnb.toFixed(2)}.`;
      insightText = `The **Hotel is cheaper** by **${ahorroAbs.toFixed(2)}** (${ahorroPorc.toFixed(1)}%). For ${noches} night${noches !== 1 ? 's' : ''} the Airbnb's fixed cleaning fee and service charge outweigh the lower nightly rate. The Airbnb usually breaks even from night 4–5 when the cleaning fee is divided by more nights.`;
    } else {
      resultadoLabel = 'Same total cost';
      resumenText = `Hotel total: ${costoHotelTotal.toFixed(2)} | Airbnb total: ${costoAirbnbTotal.toFixed(2)} — Both options cost the same for ${noches} night${noches !== 1 ? 's' : ''}. Choose based on amenities, flexibility and location.`;
      insightText = `Both options have the **same total cost** for ${noches} night${noches !== 1 ? 's' : ''}. Factor in non-monetary perks: hotel has daily housekeeping and 24 h reception; Airbnb usually has a full kitchen and more living space.`;
    }
    insightTitle = 'Comparison result';
  } else {
    // es (default)
    if (masBarato === 'airbnb') {
      resultadoLabel = `El Airbnb ahorra ${ahorroPorc.toFixed(1)}%`;
      resumenText = `Total Hotel: ${costoHotelTotal.toFixed(2)} | Total Airbnb: ${costoAirbnbTotal.toFixed(2)} | El Airbnb ahorra ${ahorroAbs.toFixed(2)} (${ahorroPorc.toFixed(1)}%) en ${noches} noche${noches !== 1 ? 's' : ''}. Costo real por noche — Hotel: ${costoNocheHotel.toFixed(2)} vs Airbnb: ${costoNocheAirbnb.toFixed(2)}.`;
      insightText = `El **Airbnb resulta más barato** por **${ahorroAbs.toFixed(2)}** (${ahorroPorc.toFixed(1)}%) en ${noches} noche${noches !== 1 ? 's' : ''}. A mayor cantidad de noches, más se diluye la tarifa fija de limpieza del Airbnb. Si la diferencia es ajustada, verificá si el hotel incluye desayuno o el Airbnb tiene cargos de estacionamiento o traslados.`;
    } else if (masBarato === 'hotel') {
      resultadoLabel = `El Hotel ahorra ${ahorroPorc.toFixed(1)}%`;
      resumenText = `Total Hotel: ${costoHotelTotal.toFixed(2)} | Total Airbnb: ${costoAirbnbTotal.toFixed(2)} | El Hotel ahorra ${ahorroAbs.toFixed(2)} (${ahorroPorc.toFixed(1)}%) en ${noches} noche${noches !== 1 ? 's' : ''}. Costo real por noche — Hotel: ${costoNocheHotel.toFixed(2)} vs Airbnb: ${costoNocheAirbnb.toFixed(2)}.`;
      insightText = `El **Hotel resulta más barato** por **${ahorroAbs.toFixed(2)}** (${ahorroPorc.toFixed(1)}%). En ${noches} noche${noches !== 1 ? 's' : ''}, la tarifa fija de limpieza y el cargo por servicio del Airbnb superan el ahorro en la tarifa base. El punto de quiebre típico (cuando el Airbnb iguala al hotel) suele ser la 4.ª o 5.ª noche.`;
    } else {
      resultadoLabel = 'Costo total igual';
      resumenText = `Total Hotel: ${costoHotelTotal.toFixed(2)} | Total Airbnb: ${costoAirbnbTotal.toFixed(2)} — Ambas opciones cuestan lo mismo en ${noches} noche${noches !== 1 ? 's' : ''}. Elegí según comodidades, flexibilidad y ubicación.`;
      insightText = `Ambas opciones tienen el **mismo costo total** en ${noches} noche${noches !== 1 ? 's' : ''}. Considerá beneficios no monetarios: el hotel tiene limpieza diaria y recepción 24 h; el Airbnb suele tener cocina equipada y más espacio.`;
    }
    insightTitle = 'Resultado de la comparativa';
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: masBarato === 'airbnb' ? 'positive' : masBarato === 'hotel' ? 'info' : 'neutral',
    icon: '🏨',
  };

  return {
    resultado: resultadoLabel,
    resumen: resumenText,
    _insight,
  };
}
