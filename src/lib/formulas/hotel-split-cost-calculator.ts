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
  _insight?: any;
  _chart?: any;
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
      _insight: {
        title: "Each person's share",
        text: `Split evenly, each of the **${numTravelers} traveler${numTravelers !== 1 ? "s" : ""}** pays **$${evenCostPerPerson.toFixed(2)}** for the whole stay — about **$${costPerPersonPerNight.toFixed(2)} per night** each. If people stayed different numbers of nights, switch to a custom split for a fairer share.`,
        tone: "neutral",
        icon: "🏨",
      },
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

  // Donut: each traveler's share sums to the total cost
  const _chart = {
    type: "doughnut",
    slices: activeTravelers.map((n, idx) => ({
      label: `Traveler ${idx + 1} (${n}n)`,
      value: Number(shares[idx].toFixed(2)),
    })),
    prefix: "$",
    centerValue: `$${totalCost.toFixed(2)}`,
    centerLabel: "total cost",
    ariaLabel: `Custom split of $${totalCost.toFixed(2)} across ${activeTravelers.length} travelers by nights stayed`,
  };

  const maxShare = Math.max(...shares);
  const maxIdx = shares.indexOf(maxShare);
  const _insight = nightsWarning
    ? {
        title: "Check the night counts",
        text: `At least one traveler's nights exceed the **${numNights}** total nights you entered. The split still works at **$${ratePerPersonNight.toFixed(2)} per person-night**, but double-check the numbers so nobody overpays.`,
        tone: "warn",
        icon: "⚠️",
      }
    : {
        title: "Fair split by nights stayed",
        text: `At **$${ratePerPersonNight.toFixed(2)} per person-night**, whoever stays longest pays most: Traveler ${maxIdx + 1} owes **$${maxShare.toFixed(2)}**. This is fairer than an even split when people stay different numbers of nights.`,
        tone: "neutral",
        icon: "🤝",
      };

  return {
    cost_per_night: costPerNight,
    even_cost_per_person: evenCostPerPerson,
    cost_per_person_per_night: costPerPersonPerNight,
    custom_split_breakdown: breakdownText,
    custom_cost_per_night_unit: ratePerPersonNight,
    summary,
    _insight,
    _chart,
  };
}
