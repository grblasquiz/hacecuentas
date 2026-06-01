/** Mundial 2026: gasto en comida y bebida durante un partido en el estadio. */
export interface Inputs {
  cervezas: number;
  hotDogs: number;
  refrescos: number;
  snacks: number;
  pais: string; // 'usa' | 'mexico' | 'canada'
  zona: string; // 'popular' | 'tribuna' | 'preferencial'
}

export interface Outputs {
  totalUSD: string;
  totalConPropina: string;
  comparativaAfuera: string;
  alertaPresupuesto: string;
  recomendacion: string;
  resumen: string;
}

// Precios base USD por país.
const PRECIOS: Record<string, { cerveza: number; hotDog: number; refresco: number; snack: number; label: string }> = {
  usa: { cerveza: 16, hotDog: 10, refresco: 8, snack: 11, label: 'Estados Unidos' },
  mexico: { cerveza: 6.5, hotDog: 7.5, refresco: 3.5, snack: 4, label: 'México' },
  canada: { cerveza: 11.5, hotDog: 8.5, refresco: 6, snack: 10, label: 'Canadá' },
};

// Equivalente afuera del estadio (mismo combo).
const PRECIO_AFUERA: Record<string, { cerveza: number; hotDog: number; refresco: number; snack: number }> = {
  usa: { cerveza: 6, hotDog: 4, refresco: 3, snack: 4 },
  mexico: { cerveza: 2, hotDog: 3, refresco: 1.5, snack: 2 },
  canada: { cerveza: 4, hotDog: 4, refresco: 2.5, snack: 3.5 },
};

const FACTOR_ZONA: Record<string, number> = {
  popular: 1.0,
  tribuna: 1.0,
  preferencial: 1.30,
};

const ZONA_LABEL: Record<string, string> = {
  popular: 'Popular',
  tribuna: 'Tribuna media',
  preferencial: 'Preferencial / Club',
};

export function mundial2026CervezaComidaEstadioPrecio(i: Inputs): Outputs {
  const cervezas = Math.max(0, Math.min(6, Math.floor(Number(i.cervezas || 0))));
  const hotDogs = Math.max(0, Math.min(3, Math.floor(Number(i.hotDogs || 0))));
  const refrescos = Math.max(0, Math.min(3, Math.floor(Number(i.refrescos || 0))));
  const snacks = Math.max(0, Math.min(3, Math.floor(Number(i.snacks || 0))));
  const paisKey = String(i.pais || 'usa').toLowerCase();
  const zonaKey = String(i.zona || 'tribuna').toLowerCase();

  const precios = PRECIOS[paisKey];
  if (!precios) throw new Error('País inválido.');
  const factorZona = FACTOR_ZONA[zonaKey];
  if (!factorZona) throw new Error('Zona inválida.');

  if (cervezas + hotDogs + refrescos + snacks === 0) {
    throw new Error('Ingresá al menos un consumo para calcular.');
  }

  // Total base.
  const subtotal = (
    cervezas * precios.cerveza +
    hotDogs * precios.hotDog +
    refrescos * precios.refresco +
    snacks * precios.snack
  ) * factorZona;

  // Propina (solo USA aplica 15% estándar).
  const propina = paisKey === 'usa' ? subtotal * 0.15 : paisKey === 'canada' ? subtotal * 0.10 : 0;
  const total = subtotal + propina;

  // Comparativa afuera.
  const afuera = PRECIO_AFUERA[paisKey];
  const totalAfuera =
    cervezas * afuera.cerveza +
    hotDogs * afuera.hotDog +
    refrescos * afuera.refresco +
    snacks * afuera.snack;
  const ahorroAfuera = total - totalAfuera;

  // Alerta de presupuesto.
  let alerta = '';
  if (total > 100) {
    alerta = `⚠️ **GASTO ALTO**: superás USD 100 por persona. Una familia de 4 sería USD ${(total * 4).toFixed(0)}. Considerá reducir cervezas o comer antes del partido.`;
  } else if (total > 80) {
    alerta = `⚠️ **GASTO ELEVADO**: USD ${total.toFixed(0)} por persona está sobre el promedio típico (USD 60-80). Familia de 4: USD ${(total * 4).toFixed(0)}.`;
  } else if (total > 50) {
    alerta = `🟡 **GASTO MODERADO**: USD ${total.toFixed(0)} está en el rango típico (USD 50-80). Familia de 4: USD ${(total * 4).toFixed(0)}.`;
  } else if (total > 25) {
    alerta = `✅ **GASTO RAZONABLE**: USD ${total.toFixed(0)}. Manejable. Familia de 4: USD ${(total * 4).toFixed(0)}.`;
  } else {
    alerta = `✅ **GASTO BAJO**: USD ${total.toFixed(0)}. Consumo mínimo. Bien controlado.`;
  }

  // Recomendación.
  let reco = '';
  if (cervezas >= 3) {
    reco = `🍺 **Las cervezas son tu mayor gasto** (USD ${(cervezas * precios.cerveza * factorZona).toFixed(0)} solo en eso). Si tomás afuera antes del partido, ahorrás fácil USD ${((cervezas * precios.cerveza * factorZona) - (cervezas * afuera.cerveza)).toFixed(0)}.`;
  } else if (hotDogs >= 2 || (hotDogs >= 1 && snacks >= 1)) {
    reco = `🌭 **Si comés antes del estadio ahorrás ~USD ${ahorroAfuera.toFixed(0)}**. La comida adentro tiene 2-3x el precio de afuera por el modelo de concesiones cautivas.`;
  } else if (paisKey === 'usa' && total < 40) {
    reco = `Consumo bajo en USA — bien controlado. Para mantener este nivel, evitá las cervezas adicionales que se acumulan rápido.`;
  } else if (paisKey === 'mexico') {
    reco = `México es la sede más amigable de bolsillo del Mundial 2026 — aprovechá los tacos y elotes locales que cuestan 1/3 del precio de USA.`;
  } else {
    reco = `Para reducir gasto: 1 cerveza menos = USD ${precios.cerveza * factorZona} ahorrados. Una comida menos = USD ${precios.hotDog * factorZona} ahorrados.`;
  }

  const propinaTxt = paisKey === 'usa'
    ? `**USD ${total.toFixed(2)}** con 15% propina (USA estándar).`
    : paisKey === 'canada'
      ? `**USD ${total.toFixed(2)}** con 10% propina (común en Canadá).`
      : `**USD ${total.toFixed(2)}** (México: propina no estándar en estadios).`;

  const compTxt = ahorroAfuera > 5
    ? `Misma comida afuera del estadio (street food / fast food ${precios.label}): **USD ${totalAfuera.toFixed(2)}**. **Comiendo antes ahorrás USD ${ahorroAfuera.toFixed(2)}** (${((ahorroAfuera / total) * 100).toFixed(0)}% menos).`
    : `Diferencia con afuera es mínima en este consumo bajo — gastá tranquilo adentro si querés.`;

  const detalle = [
    cervezas > 0 ? `${cervezas} cerveza(s) USD ${(cervezas * precios.cerveza * factorZona).toFixed(2)}` : '',
    hotDogs > 0 ? `${hotDogs} hot dog(s)/burger(s) USD ${(hotDogs * precios.hotDog * factorZona).toFixed(2)}` : '',
    refrescos > 0 ? `${refrescos} refresco(s) USD ${(refrescos * precios.refresco * factorZona).toFixed(2)}` : '',
    snacks > 0 ? `${snacks} snack(s) USD ${(snacks * precios.snack * factorZona).toFixed(2)}` : '',
  ].filter(Boolean).join(' · ');

  return {
    totalUSD: `USD ${subtotal.toFixed(0)}`,
    totalConPropina: propinaTxt,
    comparativaAfuera: compTxt,
    alertaPresupuesto: alerta,
    recomendacion: reco,
    resumen: `En un estadio del Mundial 2026 en ${precios.label}, ${cervezas} cerveza(s) + ${hotDogs} hot dog(s) + ${refrescos} refresco(s) + ${snacks} snack(s) en zona ${ZONA_LABEL[zonaKey]} = **USD ${total.toFixed(2)} por persona** (con propina si aplica). Familia de 4: USD ${(total * 4).toFixed(0)}. Desglose: ${detalle}.`,
  };
}
