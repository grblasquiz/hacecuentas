export interface Inputs {
  guest_count: number;
  venue_type: string;
  event_hall_cost?: number;
  food_per_person: number;
  decoration_budget: number;
  cake_cost: number;
  favor_per_person: number;
  photography_budget: number;
}

export interface Outputs {
  venue_cost: number;
  food_cost: number;
  decoration_cost: number;
  cake_cost: number;
  favor_cost: number;
  photography_cost: number;
  total_budget: number;
  cost_per_guest: number;
  venue_savings_home: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const guests = Math.max(1, Number(i.guest_count) || 1);
  const venueType = i.venue_type || 'home';
  const eventHallCost = Number(i.event_hall_cost) || 800;
  const foodPerPerson = Math.max(0, Number(i.food_per_person) || 0);
  const decorationBudget = Math.max(0, Number(i.decoration_budget) || 0);
  const cakeCostVal = Math.max(0, Number(i.cake_cost) || 0);
  const favorPerPerson = Math.max(0, Number(i.favor_per_person) || 0);
  const photographyBudget = Math.max(0, Number(i.photography_budget) || 0);

  // Venue cost calculation
  let venueCost = 0;
  if (venueType === 'restaurant') {
    venueCost = 30 * guests; // $30 per person baseline
  } else if (venueType === 'event_hall') {
    venueCost = eventHallCost;
  }
  // home: venueCost = 0

  // Food total
  const foodCost = foodPerPerson * guests;

  // Favors total
  const favorCost = favorPerPerson * guests;

  // Other flat costs
  const decorationCost = decorationBudget;
  const cakeCost = cakeCostVal;
  const photographyCost = photographyBudget;

  // Total budget
  const totalBudget = venueCost + foodCost + decorationCost + cakeCost + favorCost + photographyCost;

  // Cost per guest
  const costPerGuest = guests > 0 ? totalBudget / guests : 0;

  // Savings: home vs restaurant pricing model
  const restaurantVenueCost = 30 * guests;
  const venueSavingsHome = venueCost === 0 ? restaurantVenueCost : 0;

  const venueR = Math.round(venueCost * 100) / 100;
  const foodR = Math.round(foodCost * 100) / 100;
  const decorationR = Math.round(decorationCost * 100) / 100;
  const cakeR = Math.round(cakeCost * 100) / 100;
  const favorR = Math.round(favorCost * 100) / 100;
  const photographyR = Math.round(photographyCost * 100) / 100;
  const totalR = Math.round(totalBudget * 100) / 100;
  const perGuestR = Math.round(costPerGuest * 100) / 100;
  const savingsR = Math.round(venueSavingsHome * 100) / 100;

  // Donut slices: each cost component (summing to the total). Skip zero lines.
  const sliceDefs: { label: string; value: number }[] = [
    { label: 'Venue', value: venueR },
    { label: 'Food', value: foodR },
    { label: 'Decoration', value: decorationR },
    { label: 'Cake', value: cakeR },
    { label: 'Favors', value: favorR },
    { label: 'Photography', value: photographyR },
  ].filter((s) => s.value > 0);

  // Largest line item for the insight
  const biggest = sliceDefs.reduce(
    (a, b) => (b.value > a.value ? b : a),
    { label: '', value: 0 }
  );
  const biggestShare = totalR > 0 ? (biggest.value / totalR) * 100 : 0;

  const insightText = savingsR > 0
    ? `Your baby shower runs about **$${totalR.toLocaleString('en-US')}** (**$${perGuestR.toLocaleString('en-US')}** per guest). Hosting at home saves roughly **$${savingsR.toLocaleString('en-US')}** versus a restaurant; **${biggest.label}** is your largest line at **${biggestShare.toFixed(0)}%**.`
    : `Your baby shower totals about **$${totalR.toLocaleString('en-US')}** for ${guests} guest${guests === 1 ? '' : 's'} — **$${perGuestR.toLocaleString('en-US')}** each. **${biggest.label}** is the biggest line at **${biggestShare.toFixed(0)}%** of the budget.`;

  const _chart = sliceDefs.length >= 2
    ? {
        type: 'doughnut',
        slices: sliceDefs,
        prefix: '$',
        centerValue: `$${totalR.toLocaleString('en-US')}`,
        centerLabel: 'Total',
        ariaLabel: `Baby shower budget of $${totalR.toLocaleString('en-US')} broken down by category`,
      }
    : undefined;

  return {
    venue_cost: venueR,
    food_cost: foodR,
    decoration_cost: decorationR,
    cake_cost: cakeR,
    favor_cost: favorR,
    photography_cost: photographyR,
    total_budget: totalR,
    cost_per_guest: perGuestR,
    venue_savings_home: savingsR,
    _insight: {
      title: 'Budget breakdown',
      text: insightText,
      tone: 'neutral',
      icon: '🎉',
    },
    ...(_chart ? { _chart } : {}),
  };
}
