export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function hieloCubosNecesariosFiestaInvitados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const invitados = Math.max(0, Number(i.invitados) || 0);
  const horas = Math.max(0, Number(i.horas) || 0);
  // temp_factor: 0.5 = cold/indoor, 0.75 = mild/outdoor, 1.0 = hot summer
  const tempFactor = Number(i.temp_factor) || 0.75;
  // include_food_cooler: 1 = yes, 0 = no
  const foodCooler = Number(i.food_cooler) || 0;

  // Core formula (catering industry standard — Reddy Ice / Crystal Ice LA):
  // Ice (kg) = guests × duration_hours × temp_factor × 1.20 (melt buffer)
  const hieloBase = invitados * horas * tempFactor;
  // Extra ice for food cooler: +0.5 kg per person (USDA food safety recommendation)
  const hieloComida = foodCooler > 0 ? invitados * 0.5 : 0;
  const hieloTotal = (hieloBase + hieloComida) * 1.20;

  // Derived: bags of 5 kg (common in LatAm / Spain) and 20-lb bags (~9 kg, US)
  const bolsas5kg = Math.ceil(hieloTotal / 5);
  const bags9kg = Math.ceil(hieloTotal / 9);

  // Standard ice cube weighs ~25 g; 1 000 g / 25 g = 40 cubes per kg
  const cubos = Math.round(hieloTotal * 40);

  const hieloTotalStr = hieloTotal.toFixed(1);

  let resumen: string;
  let insight: object;

  if (__lang === 'en') {
    const tempLabel = tempFactor <= 0.5 ? 'cold/indoor' : tempFactor <= 0.75 ? 'mild/outdoor' : 'hot/summer';
    resumen = `${invitados} guests × ${horas} hr × ${tempFactor} kg/person/hr (${tempLabel}) + 20% melt buffer${foodCooler > 0 ? ' + food cooler' : ''} = ${hieloTotalStr} kg. That's about ${bags9kg} standard 20-lb bag${bags9kg !== 1 ? 's' : ''} or ~${cubos.toLocaleString()} individual ice cubes.`;
    insight = {
      title: 'Ice needed for your party',
      text: `You need roughly **${hieloTotalStr} kg** of ice${foodCooler > 0 ? ' (drinks + food cooler)' : ''}. Buy **${bags9kg} bag${bags9kg !== 1 ? 's' : ''} (20 lb each)** at the store, or **${bolsas5kg} bags of 5 kg** if that's what's available. Always buy the day of the event — ice stored in a home freezer fuses into unusable blocks.`,
      tone: 'info',
      icon: '🧊'
    };
  } else {
    const tempLabel = tempFactor <= 0.5 ? 'frío/interior' : tempFactor <= 0.75 ? 'templado/exterior' : 'caluroso/verano';
    resumen = `${invitados} invitados × ${horas} hs × ${tempFactor} kg/persona/hora (${tempLabel}) + 20% merma${foodCooler > 0 ? ' + hielera comida' : ''} = ${hieloTotalStr} kg totales. Son unas ${bolsas5kg} bolsa${bolsas5kg !== 1 ? 's' : ''} de 5 kg o ~${cubos.toLocaleString()} cubos individuales.`;
    insight = {
      title: 'Hielo necesario para tu fiesta',
      text: `Necesitás aproximadamente **${hieloTotalStr} kg** de hielo${foodCooler > 0 ? ' (bebidas + hielera de comida)' : ''}. Comprá **${bolsas5kg} bolsa${bolsas5kg !== 1 ? 's' : ''} de 5 kg** en el supermercado (o ${Math.ceil(hieloTotal / 10)} de 10 kg). Compralo el mismo día del evento — el hielo guardado en freezer se fusiona en bloques inutilizables.`,
      tone: 'info',
      icon: '🧊'
    };
  }

  return {
    resultado: hieloTotalStr,
    resumen,
    _insight: insight
  };
}
