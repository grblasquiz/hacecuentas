/** Temperatura interna de carne según tipo y punto de cocción */
export interface Inputs { tipoCarne?: string; puntoCoccion?: string; }
export interface Outputs { temperaturaObjetivo: number; tiempoDescanso: string; detalle: string; _insight?: any; _chart?: any; }

export function temperaturaCarne(i: Inputs): Outputs {
  const tipo = String(i.tipoCarne || 'vaca');
  const punto = String(i.puntoCoccion || 'medio');

  // Tabla de temperaturas [jugoso, medio, cocido]
  const tempMap: Record<string, Record<string, number>> = {
    vaca:    { jugoso: 55, medio: 63, cocido: 74 },
    cerdo:   { jugoso: 63, medio: 68, cocido: 74 },
    pollo:   { jugoso: 74, medio: 74, cocido: 82 }, // Pollo siempre mínimo 74
    cordero: { jugoso: 55, medio: 63, cocido: 74 },
    pescado: { jugoso: 52, medio: 58, cocido: 63 },
  };

  const descansoMap: Record<string, string> = {
    vaca: '5-10 minutos tapado con aluminio',
    cerdo: '10-15 minutos tapado con aluminio',
    pollo: '10-15 minutos (no cortar inmediatamente)',
    cordero: '10-15 minutos tapado con aluminio',
    pescado: '2-3 minutos (no necesita mucho descanso)',
  };

  const tipoLabel: Record<string, string> = {
    vaca: 'Vaca', cerdo: 'Cerdo', pollo: 'Pollo/Ave', cordero: 'Cordero', pescado: 'Pescado',
  };
  const puntoLabel: Record<string, string> = {
    jugoso: 'jugoso', medio: 'a punto', cocido: 'bien cocido',
  };

  const temps = tempMap[tipo] || tempMap.vaca;
  const temp = temps[punto] || temps.medio;
  const descanso = descansoMap[tipo] || '5-10 minutos';

  const sacarA = tipo === 'pollo' ? temp : Math.max(temp - 4, 45);

  let nota = '';
  if (tipo === 'pollo') {
    nota = ' IMPORTANTE: el pollo debe llegar siempre a 74°C mínimo por seguridad alimentaria.';
  }

  const esPollo = tipo === 'pollo';
  // Gauge: zonas de cocción de esta carne, marker en la temperatura objetivo
  const tJ = temps.jugoso, tM = temps.medio, tC = temps.cocido;
  const segMax = Math.max(tC + 8, temp + 4);
  return {
    temperaturaObjetivo: temp,
    tiempoDescanso: descanso,
    detalle: `${tipoLabel[tipo] || tipo} ${puntoLabel[punto] || punto}: temperatura objetivo **${temp}°C**. Sacá del fuego a ~${sacarA}°C (sube 3-5°C en reposo). Descanso: ${descanso}.${nota}`,
    _insight: {
      title: esPollo ? 'Seguridad primero' : 'Sacala antes del objetivo',
      text: esPollo
        ? `El ${(tipoLabel[tipo] || tipo).toLowerCase()} ${puntoLabel[punto] || punto} debe alcanzar **${temp}°C** en el centro: por debajo hay riesgo de salmonela. No bajes de **74°C** aunque la quieras más jugosa.`
        : `Para ${(tipoLabel[tipo] || tipo).toLowerCase()} ${puntoLabel[punto] || punto} apuntá a **${temp}°C** internos, pero sacala del fuego a **~${sacarA}°C**: durante el reposo de ${descanso.split(' ')[0]} min sigue subiendo 3-5°C por cocción residual.`,
      tone: esPollo ? 'warn' : 'good',
      icon: '🥩',
    },
    _chart: {
      type: 'scale',
      marker: temp,
      markerLabel: `${puntoLabel[punto] || punto} · ${temp}°C`,
      min: tJ - 6,
      segments: [
        { nombre: 'Jugoso', max: tJ + Math.round((tM - tJ) / 2), color: '#fca5a5', colorDark: '#ef4444' },
        { nombre: 'A punto', max: tM + Math.round((tC - tM) / 2), color: '#fcd34d', colorDark: '#f59e0b' },
        { nombre: 'Bien cocido', max: segMax, color: '#86efac', colorDark: '#22c55e' },
      ],
      ariaLabel: `Temperatura objetivo ${temp}°C para ${(tipoLabel[tipo] || tipo).toLowerCase()} ${puntoLabel[punto] || punto}.`,
    },
  };
}
