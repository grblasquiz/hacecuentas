export interface Inputs {
  total_cost: number;
  num_nights: number;
  split_method: string;
  num_travelers: number;
  traveler_1_nights: number;
  traveler_2_nights: number;
  traveler_3_nights: number;
  traveler_4_nights: number;
  traveler_5_nights: number;
  traveler_6_nights: number;
}

export interface Outputs {
  cost_per_night: number;
  even_cost_per_person: number;
  cost_per_person_per_night: number;
  custom_split_breakdown: string;
  custom_cost_per_night_unit: number;
  summary: string;
}

export function compute(i: Inputs): Outputs {
  const totalCost = Number(i.total_cost) || 0;
  const numNights = Math.max(1, Math.round(Number(i.num_nights) || 1));
  const splitMethod = i.split_method || "even";
  const numTravelers = Math.max(1, Math.round(Number(i.num_travelers) || 1));

  const defaultOutputs: Outputs = {
    cost_per_night: 0,
    even_cost_per_person: 0,
    cost_per_person_per_night: 0,
    custom_split_breakdown: "Enter a valid total cost.",
    custom_cost_per_night_unit: 0,
    summary: "Enter a valid total cost.",
  };

  if (totalCost <= 0) {
    return defaultOutputs;
  }

  // Cost per night is always calculated from total / nights
  const costPerNight = totalCost / numNights;

  if (splitMethod === "even") {
    if (numTravelers <= 0) {
      return {
        ...defaultOutputs,
        cost_per_night: costPerNight,
        summary: "Enter the number of travelers.",
        custom_split_breakdown: "N/A — using even split mode.",
      };
    }

    const evenCostPerPerson = totalCost / numTravelers;
    const costPerPersonPerNight = totalCost / (numTravelers * numNights);

    const summary =
      `Even split: $${totalCost.toFixed(2)} total over ${numNights} night${numNights !== 1 ? "s" : ""} ` +
      `among ${numTravelers} traveler${numTravelers !== 1 ? "s" : ""}. ` +
      `Each person pays $${evenCostPerPerson.toFixed(2)} ` +
      `($${costPerPersonPerNight.toFixed(2)}/person/night).`;

    return {
      cost_per_night: costPerNight,
      even_cost_per_person: evenCostPerPerson,
      cost_per_person_per_night: costPerPersonPerNight,
      custom_split_breakdown: "N/A — using even split mode.",
      custom_cost_per_night_unit: 0,
      summary,
    };
  }

  // Custom split mode — person-nights proportional split
  const travelerNightsInput: number[] = [
    Number(i.traveler_1_nights) || 0,
    Number(i.traveler_2_nights) || 0,
    Number(i.traveler_3_nights) || 0,
    Number(i.traveler_4_nights) || 0,
    Number(i.traveler_5_nights) || 0,
    Number(i.traveler_6_nights) || 0,
  ];

  // Only include travelers with nights > 0
  const activeTravelers: number[] = travelerNightsInput
    .map((n) => Math.max(0, Math.round(n)))
    .filter((n) => n > 0);

  if (activeTravelers.length === 0) {
    return {
      ...defaultOutputs,
      cost_per_night: costPerNight,
      even_cost_per_person: totalCost,
      cost_per_person_per_night: totalCost / numNights,
      custom_split_breakdown:
        "Enter at least one traveler's nights stayed (greater than 0).",
      summary: "Enter nights stayed for each traveler to calculate a custom split.",
    };
  }

  // Total person-nights across all travelers
  const totalPersonNights = activeTravelers.reduce((acc, n) => acc + n, 0);

  // Rate per person-night
  const ratePerPersonNight = totalCost / totalPersonNights;

  // Individual shares
  const shares: number[] = activeTravelers.map((n) => n * ratePerPersonNight);

  // Build breakdown text
  const breakdownLines: string[] = activeTravelers.map((n, idx) => {
    const share = shares[idx];
    return `Traveler ${idx + 1}: ${n} night${n !== 1 ? "s" : ""} → $${share.toFixed(2)}`;
  });

  const breakdownText = breakdownLines.join(" | ");

  // Validation: check if total person-nights distribution makes sense vs declared total nights
  const maxNightsPerTraveler = Math.max(...activeTravelers);
  const nightsWarning =
    maxNightsPerTraveler > numNights
      ? ` Note: At least one traveler's night count exceeds the declared total nights (${numNights}).`
      : "";

  const summary =
    `Custom split: $${totalCost.toFixed(2)} across ${activeTravelers.length} traveler${activeTravelers.length !== 1 ? "s" : ""} ` +
    `(${totalPersonNights} total person-nights). ` +
    `Rate: $${ratePerPersonNight.toFixed(2)}/person-night.` +
    nightsWarning;

  // For even comparison outputs in custom mode, use active traveler count
  const activeCount = activeTravelers.length;
  const evenCostPerPerson = totalCost / activeCount;
  const costPerPersonPerNight = totalCost / (activeCount * numNights);

  return {
    cost_per_night: costPerNight,
    even_cost_per_person: evenCostPerPerson,
    cost_per_person_per_night: costPerPersonPerNight,
    custom_split_breakdown: breakdownText,
    custom_cost_per_night_unit: ratePerPersonNight,
    summary,
  };
}
