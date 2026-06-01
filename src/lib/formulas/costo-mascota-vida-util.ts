/** Costo total mascota toda su vida */
export interface Inputs { tipoMascota: string; nivelGasto: string; }
export interface Outputs { costoTotal: number; costoAnual: number; costoMensual: number; esperanzaVida: string; mensaje: string; _chart?: any; _insight?: any; }

export function costoMascotaVidaUtil(i: Inputs): Outputs {
  const tipo = String(i.tipoMascota || 'perro_mediano');
  const nivel = String(i.nivelGasto || 'medio');

  const factorNivel: Record<string, number> = { basico: 0.7, medio: 1.0, premium: 1.6 };
  const f = factorNivel[nivel] || 1.0;

  // Monthly costs in ARS (2026 estimates) and life expectancy
  interface MascotaData { alimentoMes: number; vetAnual: number; accesoriosAnual: number; emergenciasAnual: number; anos: number; nombre: string; }
  const data: Record<string, MascotaData> = {
    perro_chico: { alimentoMes: 25000, vetAnual: 80000, accesoriosAnual: 40000, emergenciasAnual: 30000, anos: 14, nombre: 'Perro chico' },
    perro_mediano: { alimentoMes: 50000, vetAnual: 100000, accesoriosAnual: 50000, emergenciasAnual: 50000, anos: 12, nombre: 'Perro mediano' },
    perro_grande: { alimentoMes: 90000, vetAnual: 120000, accesoriosAnual: 60000, emergenciasAnual: 70000, anos: 10, nombre: 'Perro grande' },
    gato: { alimentoMes: 20000, vetAnual: 70000, accesoriosAnual: 30000, emergenciasAnual: 25000, anos: 16, nombre: 'Gato' }
  };

  const d = data[tipo] || data.perro_mediano;
  const costoAnual = Math.round((d.alimentoMes * 12 + d.vetAnual + d.accesoriosAnual + d.emergenciasAnual) * f);
  const costoTotal = costoAnual * d.anos;
  const costoMensual = Math.round(costoAnual / 12);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Alimento', value: Math.round(d.alimentoMes * 12 * f) },
      { label: 'Veterinario', value: Math.round(d.vetAnual * f) },
      { label: 'Accesorios', value: Math.round(d.accesoriosAnual * f) },
      { label: 'Emergencias', value: Math.round(d.emergenciasAnual * f) },
    ],
    prefix: '$',
    centerValue: '$' + costoAnual.toLocaleString('es-AR'),
    centerLabel: 'Costo/año',
    ariaLabel: 'Composición del costo anual de la mascota por rubro',
  };

  const pctAlimento = Math.round((d.alimentoMes * 12 * f) / costoAnual * 100);

  const insight = {
    title: 'Lo que implica adoptar',
    text: `Un ${d.nombre.toLowerCase()} es un compromiso de **${d.anos} años** y **$${costoTotal.toLocaleString()}** en total, equivalente a **$${costoMensual.toLocaleString()}/mes** parejos. El **alimento** se lleva el **${pctAlimento}%**: comprar bolsas grandes o por mayor es el ahorro más fácil.`,
    tone: 'warn' as const,
    icon: '🐾',
  };

  return {
    costoTotal, costoAnual, costoMensual,
    esperanzaVida: `${d.anos} años (promedio para ${d.nombre.toLowerCase()})`,
    mensaje: `${d.nombre}: $${costoTotal.toLocaleString()} en ${d.anos} años. $${costoAnual.toLocaleString()}/año ($${costoMensual.toLocaleString()}/mes). Alimento: ~${pctAlimento}% del total.`,
    _chart: chart,
    _insight: insight
  };
}