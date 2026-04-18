export interface ConsumoPcComponentesWattsInputs { cpu: number; gpu?: number; ram?: number; discos?: number; ventiladores?: number; }
export interface ConsumoPcComponentesWattsOutputs { consumoTotal: string; psuRecomendado: string; resumen: string; }
export function consumoPcComponentesWatts(i: ConsumoPcComponentesWattsInputs): ConsumoPcComponentesWattsOutputs {
  const cpu = Number(i.cpu); const gpu = Number(i.gpu ?? 0);
  const ram = Number(i.ram ?? 0) * 3; const discos = Number(i.discos ?? 0) * 7;
  const fans = Number(i.ventiladores ?? 0) * 4; const mobo = 40;
  const total = cpu + gpu + ram + discos + fans + mobo;
  const psu = Math.ceil((total * 1.3) / 50) * 50;
  return { consumoTotal: total + ' W', psuRecomendado: psu + ' W (80+ Gold)',
    resumen: `Consumo total ${total} W. Fuente recomendada: ${psu} W con certificación 80+ Gold o superior.` };
}
