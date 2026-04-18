export interface PanelSolarKwhDimensionarInputs { consumoMes: number; hps: number; eficiencia?: number; tipoSistema: string; }
export interface PanelSolarKwhDimensionarOutputs { kwp: string; cantidadPaneles: string; areaEstimada: string; resumen: string; }
export function panelSolarKwhDimensionar(i: PanelSolarKwhDimensionarInputs): PanelSolarKwhDimensionarOutputs {
  const kwh = Number(i.consumoMes); const hps = Number(i.hps);
  const effDefault = i.tipoSistema === 'off-grid' ? 70 : (i.tipoSistema === 'hibrido' ? 80 : 85);
  const eff = Number(i.eficiencia ?? effDefault) / 100;
  if (!kwh || !hps) throw new Error('Ingresá consumo y HPS');
  const kWp = (kwh / 30) / (hps * eff);
  const paneles = Math.ceil(kWp * 1000 / 400);
  const area = paneles * 2;
  return {
    kwp: kWp.toFixed(2) + ' kWp',
    cantidadPaneles: `${paneles} paneles de 400W`,
    areaEstimada: area + ' m²',
    resumen: `Para ${kwh} kWh/mes necesitás ${kWp.toFixed(1)} kWp (${paneles} paneles 400W, ~${area} m²). Sistema ${i.tipoSistema}.`
  };
}
