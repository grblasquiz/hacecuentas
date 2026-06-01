/** Precio mensual coworking CABA flex vs fijo comparativa */
export interface Inputs { espacio: string; tipoPlan: string; diasPorSemana: number; meetingRoomHorasMes: number; }
export interface Outputs { precioBaseMensual: number; meetingRoomMensual: number; totalMensualArs: number; totalMensualUsd: number; explicacion: string; _chart?: any; _insight?: any; }
export function coworkingPrecioMesFlexFijoComparativa(i: Inputs): Outputs {
  const espacio = String(i.espacio || '').toLowerCase();
  const tipo = String(i.tipoPlan || '').toLowerCase();
  const dias = Number(i.diasPorSemana) || 5;
  const horasMR = Number(i.meetingRoomHorasMes) || 0;
  // Precios 2026 CABA ARS — base mes plan fijo
  const basePrecio: Record<string, number> = {
    'wework': 380000, 'areatres': 280000, 'la-maquinita': 220000, 'urbanstation': 250000,
    'huerta': 200000, 'utopicus': 320000, 'wesion': 240000, 'hub-bahrein': 180000,
  };
  const multTipo: Record<string, number> = {
    'flex-5dias': 0.7, 'flex-10dias': 0.55, 'fijo-hot-desk': 1, 'oficina-privada-2': 2.2, 'oficina-privada-4': 3.6,
  };
  const base = basePrecio[espacio] ?? 250000;
  const mult = multTipo[tipo] ?? 1;
  const factorDias = tipo.startsWith('fijo') ? 1 : Math.min(1, dias / 5);
  const precioBase = base * mult * factorDias;
  const mr = horasMR * 8500; // ARS/hora ref
  const totalArs = precioBase + mr;
  const usd = totalArs / 1250;
  // Donut sólo cuando hay ≥2 partes reales (plan base + meeting rooms contratadas)
  const chart =
    mr > 0
      ? {
          type: 'doughnut' as const,
          slices: [
            { label: 'Plan base', value: Number(precioBase.toFixed(0)) },
            { label: 'Meeting rooms', value: Number(mr.toFixed(0)) },
          ],
          prefix: '$',
          centerValue: '$' + Math.round(totalArs).toLocaleString('es-AR'),
          centerLabel: 'Total mensual',
          ariaLabel: 'Composición del costo mensual de coworking: plan base más horas de salas de reunión',
        }
      : undefined;
  const mrPct = totalArs > 0 ? Math.round((mr / totalArs) * 100) : 0;
  const esFlex = tipo.startsWith('flex');
  let insight;
  if (mr > 0 && mrPct >= 20) {
    insight = {
      title: 'Las salas pesan en la factura',
      text: `Las meeting rooms son **${mrPct}%** del total ($${Math.round(mr).toLocaleString('es-AR')}/mes). Si las usás seguido, conviene mirar un plan con horas de sala incluidas en vez de pagarlas sueltas.`,
      tone: 'warn',
      icon: '🏢',
    };
  } else if (esFlex) {
    insight = {
      title: 'Plan flex: pagás por presencia',
      text: `El plan **${tipo}** te deja el escritorio en **$${Math.round(precioBase).toLocaleString('es-AR')}/mes** (~USD ${usd.toFixed(0)}). Si vas ${dias} día(s) o menos por semana, el flex te ahorra frente al fijo; si vas casi todos los días, comparalo con el hot-desk fijo.`,
      tone: 'good',
      icon: '🏢',
    };
  } else {
    insight = {
      title: 'Plan fijo: lugar asegurado',
      text: `El plan **${tipo}** cuesta **$${Math.round(totalArs).toLocaleString('es-AR')}/mes** (~USD ${usd.toFixed(0)}) con acceso pleno. Tiene sentido si vas casi todos los días; si tu asistencia es irregular, un flex puede salir más barato.`,
      tone: 'neutral',
      icon: '🏢',
    };
  }

  return {
    precioBaseMensual: Number(precioBase.toFixed(0)),
    meetingRoomMensual: Number(mr.toFixed(0)),
    totalMensualArs: Number(totalArs.toFixed(0)),
    totalMensualUsd: Number(usd.toFixed(2)),
    explicacion: `${espacio} plan ${tipo}: $${precioBase.toLocaleString('es-AR')} ARS/mes + meeting rooms $${mr.toLocaleString('es-AR')}. Total: $${totalArs.toLocaleString('es-AR')} ARS (~USD ${usd.toFixed(0)}).`,
    _chart: chart,
    _insight: insight,
  };
}
