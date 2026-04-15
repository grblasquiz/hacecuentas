/** Tiempo de fermentación de masa según temperatura y levadura */
export interface Inputs { temperaturaAmbiente: number; cantidadLevadura: number; pesoHarina: number; }
export interface Outputs { tiempoFermentacion: number; tiempoFormateado: string; consejo: string; detalle: string; }

export function fermentacionMasa(i: Inputs): Outputs {
  const temp = Number(i.temperaturaAmbiente);
  const lev = Number(i.cantidadLevadura);
  const harina = Number(i.pesoHarina);

  if (isNaN(temp) || temp < 0 || temp > 50) throw new Error('Ingresá una temperatura entre 0 y 50°C');
  if (!lev || lev <= 0) throw new Error('Ingresá la cantidad de levadura');
  if (!harina || harina <= 0) throw new Error('Ingresá el peso de harina');

  // Porcentaje de levadura sobre harina
  const pctLev = (lev / harina) * 100;

  // Modelo simplificado: tiempo base a 25°C con 2% de levadura = 100 min
  // Ajuste por temperatura: cada grado debajo de 25 suma ~8%, cada grado arriba resta ~8%
  // Ajuste por % levadura: inversamente proporcional

  const tiempoBase = 100; // minutos a 25°C, 2% levadura
  const factorTemp = Math.pow(0.92, temp - 25); // 8% más rápido por cada grado arriba de 25
  const factorLev = 2 / pctLev; // Inversamente proporcional al % de levadura

  let tiempoMin = tiempoBase * factorTemp * factorLev;

  // Limitar a rango razonable
  if (temp <= 4) tiempoMin = Math.max(tiempoMin, 720); // mínimo 12 hs en heladera
  tiempoMin = Math.max(tiempoMin, 20); // mínimo 20 min
  tiempoMin = Math.min(tiempoMin, 2880); // máximo 48 hs

  tiempoMin = Math.round(tiempoMin);

  // Formatear
  let tiempoStr: string;
  if (tiempoMin < 60) {
    tiempoStr = `${tiempoMin} minutos`;
  } else if (tiempoMin < 1440) {
    const hs = Math.floor(tiempoMin / 60);
    const mins = tiempoMin % 60;
    tiempoStr = mins > 0 ? `${hs} h ${mins} min` : `${hs} horas`;
  } else {
    const hs = Math.round(tiempoMin / 60);
    tiempoStr = `~${hs} horas`;
  }

  // Consejo
  let consejo: string;
  if (temp < 10) {
    consejo = 'Fermentación en frío: más lenta pero desarrolla mucho más sabor. Ideal para pan artesanal y pizza napolitana.';
  } else if (temp < 20) {
    consejo = 'Temperatura fresca: fermentación moderada con buen desarrollo de sabor. Buen equilibrio tiempo/sabor.';
  } else if (temp <= 28) {
    consejo = 'Rango óptimo para fermentación estándar. Controlá que no se pase: hacé el test del dedo cada 30 minutos.';
  } else if (temp <= 35) {
    consejo = 'Temperatura alta: fermentación muy rápida. Cuidado con sobre-fermentar. Menos desarrollo de sabor.';
  } else {
    consejo = 'Temperatura demasiado alta. A partir de 38°C la fermentación es errática. A 45°C+ la levadura muere.';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    tiempoFermentacion: tiempoMin,
    tiempoFormateado: tiempoStr,
    consejo,
    detalle: `${fmt.format(harina)} g harina, ${fmt.format(lev)} g levadura fresca (${fmt.format(pctLev)}%), ${fmt.format(temp)}°C → fermentación estimada: ${tiempoStr}. ${consejo}`,
  };
}
