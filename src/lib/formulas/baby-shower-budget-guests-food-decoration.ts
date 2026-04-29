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

  return {
    venue_cost: Math.round(venueCost * 100) / 100,
    food_cost: Math.round(foodCost * 100) / 100,
    decoration_cost: Math.round(decorationCost * 100) / 100,
    cake_cost: Math.round(cakeCost * 100) / 100,
    favor_cost: Math.round(favorCost * 100) / 100,
    photography_cost: Math.round(photographyCost * 100) / 100,
    total_budget: Math.round(totalBudget * 100) / 100,
    cost_per_guest: Math.round(costPerGuest * 100) / 100,
    venue_savings_home: Math.round(venueSavingsHome * 100) / 100
  };
}
