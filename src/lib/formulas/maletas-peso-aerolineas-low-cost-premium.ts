export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Airline baggage policies — excess weight charge calculator
// Sources: official airline pages + aviacionline.com (June 2026)

interface AirlinePolicy {
  name: string;
  type: 'lowcost' | 'full';
  domestic: {
    carryOnKg: number;
    checkedKg: number;          // 0 = not included
    excessPerKg_USD: number;    // 0 means flat fee model (low-cost)
    flatFeeAtAirport_USD: number; // additional piece at airport
  };
  international: {
    carryOnKg: number;
    checkedKg: number;
    excessPerKg_USD: number;
    flatFeeAtAirport_USD: number;
  };
}

const POLICIES: Record<string, AirlinePolicy> = {
  flybondi: {
    name: 'Flybondi',
    type: 'lowcost',
    domestic: {
      carryOnKg: 10,
      checkedKg: 0,            // not included; buy online (12 kg ~USD 9, 20 kg ~USD 14)
      excessPerKg_USD: 8,      // per kg surcharge at airport for overweight piece
      flatFeeAtAirport_USD: 30, // adding a checked bag at airport vs not having one
    },
    international: {
      carryOnKg: 10,
      checkedKg: 0,
      excessPerKg_USD: 12,
      flatFeeAtAirport_USD: 55,
    },
  },
  jetsmart: {
    name: 'JetSMART',
    type: 'lowcost',
    domestic: {
      carryOnKg: 8,   // personal item only (under seat); cabin bag is extra
      checkedKg: 0,
      excessPerKg_USD: 8,
      flatFeeAtAirport_USD: 22,
    },
    international: {
      carryOnKg: 8,
      checkedKg: 0,
      excessPerKg_USD: 10,
      flatFeeAtAirport_USD: 35,
    },
  },
  aerolineas: {
    name: 'Aerolíneas Argentinas',
    type: 'full',
    domestic: {
      carryOnKg: 8,
      checkedKg: 15,     // Economy Light 15 kg; Classic/Flex = 23 kg (user selects weight limit)
      excessPerKg_USD: 15,
      flatFeeAtAirport_USD: 80,
    },
    international: {
      carryOnKg: 8,
      checkedKg: 23,
      excessPerKg_USD: 20,
      flatFeeAtAirport_USD: 100,
    },
  },
  latam: {
    name: 'LATAM Airlines',
    type: 'full',
    domestic: {
      carryOnKg: 10,
      checkedKg: 23,
      excessPerKg_USD: 15,
      flatFeeAtAirport_USD: 80,
    },
    international: {
      carryOnKg: 10,
      checkedKg: 23,
      excessPerKg_USD: 20,
      flatFeeAtAirport_USD: 100,
    },
  },
  copa: {
    name: 'Copa Airlines',
    type: 'full',
    domestic: {
      carryOnKg: 10,
      checkedKg: 23,
      excessPerKg_USD: 15,
      flatFeeAtAirport_USD: 100,
    },
    international: {
      carryOnKg: 10,
      checkedKg: 23,
      excessPerKg_USD: 20,
      flatFeeAtAirport_USD: 100,
    },
  },
  aireuropa: {
    name: 'Air Europa',
    type: 'full',
    domestic: {
      carryOnKg: 10,
      checkedKg: 23,
      excessPerKg_USD: 18,
      flatFeeAtAirport_USD: 80,
    },
    international: {
      carryOnKg: 10,
      checkedKg: 23,
      excessPerKg_USD: 22,
      flatFeeAtAirport_USD: 120,
    },
  },
};

const MAX_KG_PER_PIECE = 32; // absolute max any airline accepts

export function maletasPesoAerolineasLowCostPremium(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const airlineKey = (i.aerolinea as string) || 'flybondi';
  const flightType = (i.tipo_vuelo as string) || 'domestic';
  const pesoMaleta = Math.max(0, Number(i.peso_maleta) || 0);
  const pesoLimiteCustom = Number(i.limite_franquicia) || 0; // user override for custom limits (0 = use default)
  const dimL = Math.max(0, Number(i.dim_largo) || 0);
  const dimA = Math.max(0, Number(i.dim_ancho) || 0);
  const dimH = Math.max(0, Number(i.dim_alto) || 0);

  const policy = POLICIES[airlineKey] || POLICIES['flybondi'];
  const rules = flightType === 'international' ? policy.international : policy.domestic;

  // Determine effective allowance
  const franquicia = pesoLimiteCustom > 0 ? pesoLimiteCustom : rules.checkedKg;
  const excessKg = Math.max(0, pesoMaleta - franquicia);
  const overMax = pesoMaleta > MAX_KG_PER_PIECE;

  // Excess fee calculation
  // Low-cost: if no bag included (franquicia=0) → charge flat airport fee for adding a piece
  // Full service: if bag included → charge per-kg for each kg over the limit
  let cargoUSD = 0;
  let scenario = '';

  if (overMax) {
    cargoUSD = 0; // cannot board — not a fee, just rejection
    scenario = 'rejected';
  } else if (franquicia === 0 && policy.type === 'lowcost') {
    // Low-cost: no bag included → flat fee to add at airport
    if (pesoMaleta > 0) {
      cargoUSD = rules.flatFeeAtAirport_USD;
      scenario = 'noinclusion';
    } else {
      scenario = 'noweight';
    }
  } else if (excessKg > 0) {
    cargoUSD = excessKg * rules.excessPerKg_USD;
    scenario = 'excess';
  } else {
    scenario = 'ok';
  }

  // Dimensional check: 158 cm lineal limit for checked bag
  const dimTotal = dimL + dimA + dimH;
  const oversized = dimTotal > 0 && dimTotal > 158;
  const oversizedFee = oversized ? 150 : 0; // approx USD 100-200, use 150 mid-point

  const cargoTotal = cargoUSD + oversizedFee;

  // Summary text
  const airlineName = policy.name;
  const flightLabel = __lang === 'en' ? (flightType === 'international' ? 'international' : 'domestic') :
    (flightType === 'international' ? 'internacional' : 'cabotaje');

  let resultado: string;
  let resumen: string;
  let insightTitle: string;
  let insightText: string;
  let tone: 'success' | 'warn' | 'error' | 'info' = 'info';

  if (__lang === 'en') {
    if (scenario === 'rejected') {
      resultado = 'NOT ALLOWED (>32 kg)';
      resumen = `${airlineName} does not accept pieces over 32 kg. Your bag weighs ${pesoMaleta} kg and will be refused at check-in.`;
      insightTitle = 'Bag refused';
      insightText = `**${pesoMaleta} kg exceeds the absolute maximum of 32 kg** that any airline accepts. You must remove items before you can board.`;
      tone = 'error';
    } else if (scenario === 'noinclusion') {
      resultado = `~USD ${cargoTotal.toFixed(0)} at airport`;
      resumen = `${airlineName} (${flightLabel}) does not include checked baggage. Adding it at the airport costs ~USD ${rules.flatFeeAtAirport_USD}. Online it's typically 40–60% cheaper.`;
      insightTitle = 'Buy online — save money';
      insightText = `**${airlineName}** doesn't include checked baggage in basic fares. Buying online costs ~**USD ${Math.round(rules.flatFeeAtAirport_USD * 0.55)}**; waiting until the airport costs ~**USD ${rules.flatFeeAtAirport_USD}**. Book in advance to save.`;
      tone = 'warn';
    } else if (scenario === 'excess') {
      resultado = `~USD ${cargoTotal.toFixed(0)} excess fee`;
      resumen = `${pesoMaleta} kg − ${franquicia} kg allowance = ${excessKg} kg over limit × USD ${rules.excessPerKg_USD}/kg = USD ${cargoUSD.toFixed(0)}` + (oversized ? ` + USD ${oversizedFee} oversized fee` : '') + '.';
      insightTitle = 'Redistribute before you go';
      insightText = `You're **${excessKg} kg over the limit** on ${airlineName}. The airport charge would be ~**USD ${cargoUSD.toFixed(0)}**. Move items to another bag or leave them behind — it's almost always cheaper than paying at the desk.`;
      tone = 'warn';
    } else if (scenario === 'ok') {
      resultado = 'No excess charge';
      resumen = `${pesoMaleta} kg is within the ${franquicia} kg allowance on ${airlineName} ${flightLabel} flights.` + (oversized ? ` Note: dimensions (${dimTotal} cm linear) exceed the 158 cm limit — oversized fee may apply (~USD ${oversizedFee}).` : '');
      insightTitle = 'You\'re good to go';
      insightText = `**${pesoMaleta} kg ≤ ${franquicia} kg** — no overweight charge on ${airlineName}.` + (oversized ? ` However your dimensions (${dimTotal} cm) exceed 158 cm — expect an oversized fee at check-in.` : ' Pack smart and double-check at the airport scale to be safe.');
      tone = oversized ? 'warn' : 'success';
    } else {
      resultado = 'Enter your bag weight';
      resumen = 'Enter the bag weight above to calculate excess fees.';
      insightTitle = 'How to use';
      insightText = 'Select your airline, flight type, and enter the actual bag weight to see if you owe excess fees.';
      tone = 'info';
    }
  } else {
    // Spanish
    if (scenario === 'rejected') {
      resultado = 'NO PERMITIDO (>32 kg)';
      resumen = `${airlineName} no acepta piezas de más de 32 kg. Tu maleta pesa ${pesoMaleta} kg y será rechazada en el check-in.`;
      insightTitle = 'Maleta rechazada';
      insightText = `**${pesoMaleta} kg supera el máximo absoluto de 32 kg** que aceptan las aerolíneas. Debés sacar elementos antes de poder embarcar.`;
      tone = 'error';
    } else if (scenario === 'noinclusion') {
      resultado = `~USD ${cargoTotal.toFixed(0)} en aeropuerto`;
      resumen = `${airlineName} (${flightLabel}) no incluye equipaje despachado. Agregarlo en el aeropuerto cuesta ~USD ${rules.flatFeeAtAirport_USD}. Comprándolo online es ~40–60% más barato.`;
      insightTitle = 'Comprá online — ahorrás plata';
      insightText = `**${airlineName}** no incluye bodega en la tarifa base. Comprando online pagás ~**USD ${Math.round(rules.flatFeeAtAirport_USD * 0.55)}**; esperando al aeropuerto podés pagar ~**USD ${rules.flatFeeAtAirport_USD}**. Cuanto antes lo comprás, más barato sale.`;
      tone = 'warn';
    } else if (scenario === 'excess') {
      resultado = `~USD ${cargoTotal.toFixed(0)} de cargo`;
      resumen = `${pesoMaleta} kg − ${franquicia} kg de franquicia = ${excessKg} kg de exceso × USD ${rules.excessPerKg_USD}/kg = USD ${cargoUSD.toFixed(0)}` + (oversized ? ` + USD ${oversizedFee} por sobredimensionado` : '') + '.';
      insightTitle = 'Redistribuí antes de ir';
      insightText = `Tenés **${excessKg} kg de exceso** en ${airlineName}. El cargo en mostrador sería ~**USD ${cargoUSD.toFixed(0)}**. Pasá cosas a otra valija o dejá algo en casa — casi siempre es más barato que pagar en el aeropuerto.`;
      tone = 'warn';
    } else if (scenario === 'ok') {
      resultado = 'Sin cargo por exceso';
      resumen = `${pesoMaleta} kg está dentro de la franquicia de ${franquicia} kg en ${airlineName} (${flightLabel}).` + (oversized ? ` Atención: las dimensiones (${dimTotal} cm lineales) superan los 158 cm — puede aplicar cargo por sobredimensionado (~USD ${oversizedFee}).` : '');
      insightTitle = 'Todo en orden';
      insightText = `**${pesoMaleta} kg ≤ ${franquicia} kg** — sin cargo por sobrepeso en ${airlineName}.` + (oversized ? ` Pero las dimensiones (${dimTotal} cm) superan los 158 cm — esperá cargo por sobredimensionado en el check-in.` : ' Pesá la maleta en casa antes de ir para evitar sorpresas.');
      tone = oversized ? 'warn' : 'success';
    } else {
      resultado = 'Ingresá el peso de tu maleta';
      resumen = 'Ingresá el peso real de la maleta para calcular el exceso.';
      insightTitle = 'Cómo usarla';
      insightText = 'Seleccioná la aerolínea, el tipo de vuelo e ingresá el peso real de la maleta para ver si tenés cargo por exceso.';
      tone = 'info';
    }
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone,
    icon: '🧳',
  };

  return { resultado, resumen, _insight };
}
