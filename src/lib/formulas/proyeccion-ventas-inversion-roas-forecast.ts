/**
 * Calculadora de proyección de ventas por inversión y ROAS (forecast)
 *   ingresos proyectados = inversion × roas
 *   ganancia = ingresos - inversion
 *   ventas estimadas = ingresos / ticket (si se carga ticket)
 *   tabla de escenarios ROAS 1× / 2× / 3× / 5×
 */

export interface ProyeccionRoasInputs {
  inversion_planeada: number; // $
  roas_esperado: number; // múltiplo (default 3)
  ticket_promedio: number; // $ (opcional)
}

export interface ProyeccionRoasOutputs {
  ingresosProyectados: number;
  ganancia: number;
  ventasEstimadas: number;
  tieneTicket: boolean;
  escenarios: Array<{ roas: number; ingresos: number; ganancia: number; ventas: number }>;
  benchmark: string;
  _insight?: any;
  _chart?: any;
}

export function proyeccionVentasInversionRoasForecast(
  inputs: ProyeccionRoasInputs
): ProyeccionRoasOutputs {
  const inversion = Number(inputs.inversion_planeada);
  const roasRaw = inputs.roas_esperado;
  const roas =
    roasRaw === '' || roasRaw === null || roasRaw === undefined
      ? 3
      : Math.max(0, Number(roasRaw) || 3);
  const ticketRaw = inputs.ticket_promedio;
  const ticket =
    ticketRaw === '' || ticketRaw === null || ticketRaw === undefined
      ? 0
      : Math.max(0, Number(ticketRaw) || 0);

  if (!inversion || inversion <= 0) throw new Error('Ingresá la inversión planeada');
  if (!roas || roas <= 0) throw new Error('Ingresá el ROAS esperado');

  const ingresosProyectados = inversion * roas;
  const ganancia = ingresosProyectados - inversion;
  const tieneTicket = ticket > 0;
  const ventasEstimadas = tieneTicket ? ingresosProyectados / ticket : 0;

  // Escenarios fijos de ROAS
  const escenariosRoas = [1, 2, 3, 5];
  const escenarios = escenariosRoas.map((r) => {
    const ing = inversion * r;
    return {
      roas: r,
      ingresos: Math.round(ing),
      ganancia: Math.round(ing - inversion),
      ventas: tieneTicket ? Math.round(ing / ticket) : 0,
    };
  });

  let benchmark = '';
  if (roas >= 5) benchmark = '🚀 ROAS muy optimista — verificá que sea sostenible al escalar';
  else if (roas >= 3) benchmark = '✅ ROAS sólido — escenario rentable y razonable';
  else if (roas >= 2) benchmark = '⚡ ROAS moderado — rentable solo si tu margen es alto';
  else if (roas >= 1) benchmark = '⚠️ ROAS de recupero — apenas cubrís la inversión';
  else benchmark = '🔴 ROAS deficitario — no recuperás ni lo invertido';

  const ingR = Math.round(ingresosProyectados);
  const ganR = Math.round(ganancia);
  const insightText = tieneTicket
    ? `Invirtiendo **$${inversion.toLocaleString('es-AR')}** con un ROAS esperado de **${roas}×**, proyectás **$${ingR.toLocaleString('es-AR')}** en ingresos (~${Math.round(ventasEstimadas).toLocaleString('es-AR')} ventas) y **$${ganR.toLocaleString('es-AR')}** de retorno bruto. Recordá que el ROAS es un supuesto: la tabla de escenarios te muestra qué pasa si la realidad queda por debajo.`
    : `Invirtiendo **$${inversion.toLocaleString('es-AR')}** con un ROAS esperado de **${roas}×**, proyectás **$${ingR.toLocaleString('es-AR')}** en ingresos y **$${ganR.toLocaleString('es-AR')}** de retorno bruto. Cargá tu ticket promedio para estimar también cuántas ventas representa.`;

  const tone = roas >= 3 ? 'good' : roas >= 1 ? 'neutral' : 'warn';
  return {
    ingresosProyectados: ingR,
    ganancia: ganR,
    ventasEstimadas: Math.round(ventasEstimadas),
    tieneTicket,
    escenarios,
    benchmark,
    _insight: {
      title: 'Forecast de la inversión',
      text: insightText,
      tone,
      icon: '🔮',
    },
    _chart: {
      type: 'bars',
      bars: escenarios.map((e) => ({
        nombre: `ROAS ${e.roas}×`,
        valor: e.ingresos,
        color: e.roas === Math.round(roas) ? '#8b5cf6' : '#60a5fa',
        colorDark: e.roas === Math.round(roas) ? '#a78bfa' : '#3b82f6',
      })),
      ariaLabel: `Ingresos proyectados según escenarios de ROAS 1×, 2×, 3× y 5×`,
    },
  };
}
