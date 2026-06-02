export interface ConsumoPcComponentesWattsInputs { cpu: number; gpu?: number; ram?: number; discos?: number; ventiladores?: number; }
export interface ConsumoPcComponentesWattsOutputs { consumoTotal: string; psuRecomendado: string; resumen: string; _insight?: any; _chart?: any; }
export function consumoPcComponentesWatts(i: ConsumoPcComponentesWattsInputs): ConsumoPcComponentesWattsOutputs {
  const cpu = Number(i.cpu); const gpu = Number(i.gpu ?? 0);
  const ram = Number(i.ram ?? 0) * 3; const discos = Number(i.discos ?? 0) * 7;
  const fans = Number(i.ventiladores ?? 0) * 4; const mobo = 40;
  const total = cpu + gpu + ram + discos + fans + mobo;
  const psu = Math.ceil((total * 1.3) / 50) * 50;

  // Slice dominante para el insight
  const partes = [
    { label: 'CPU', value: cpu },
    { label: 'GPU', value: gpu },
    { label: 'RAM', value: ram },
    { label: 'Discos', value: discos },
    { label: 'Ventiladores', value: fans },
    { label: 'Placa madre', value: mobo },
  ];
  const slices = partes.filter(p => p.value > 0);
  const mayor = slices.reduce((a, b) => (b.value > a.value ? b : a), slices[0]);
  const pctMayor = Math.round((mayor.value / total) * 100);
  const margen = psu - total;

  return { consumoTotal: total + ' W', psuRecomendado: psu + ' W (80+ Gold)',
    resumen: `Consumo total ${total} W. Fuente recomendada: ${psu} W con certificación 80+ Gold o superior.`,
    _insight: {
      title: 'Consumo y fuente recomendada',
      text: `Tu equipo consume **${total} W** y la mayor parte la aporta la **${mayor.label} (${pctMayor}%)**. Una fuente de **${psu} W** te deja **${margen} W** de margen (30%) para picos y upgrades sin estresar la PSU.`,
      tone: 'neutral',
      icon: '🔌',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '',
      centerValue: `${total} W`,
      centerLabel: 'consumo total',
      ariaLabel: `Desglose del consumo del equipo: ${total} W repartidos entre los componentes`,
    },
  };
}
