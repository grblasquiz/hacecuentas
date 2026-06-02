/** HDD/CDD — Heating Degree Days & Cooling Degree Days.
 *  HDD = Σ max(18 − T_media_diaria, 0); CDD = Σ max(T_media_diaria − 24, 0). ASHRAE. */
export interface Inputs {
  tempMediaDiaria: number;    // °C promedio del período
  diasPeriodo: number;        // días
  baseHDD?: number;           // default 18°C
  baseCDD?: number;           // default 24°C
  consumoPorHDD?: number;     // ej. m³ gas por HDD (opcional)
  consumoPorCDD?: number;     // ej. kWh AC por CDD (opcional)
}
export interface Outputs {
  hdd: string;
  cdd: string;
  hddNumero: number;
  cddNumero: number;
  consumoCalefaccion: string;
  consumoRefrigeracion: string;
  interpretacion: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function gradosDiaHddCdd(i: Inputs): Outputs {
  const T = Number(i.tempMediaDiaria);
  const dias = Number(i.diasPeriodo);
  const baseH = Number(i.baseHDD ?? 18);
  const baseC = Number(i.baseCDD ?? 24);
  if (!Number.isFinite(T) || T < -50 || T > 60) throw new Error('Temperatura media fuera de rango.');
  if (!Number.isFinite(dias) || dias <= 0 || dias > 366) throw new Error('Días del período inválido (1-366).');
  if (baseH < 10 || baseH > 25) throw new Error('Base HDD fuera de rango (10-25 °C).');
  if (baseC < 18 || baseC > 30) throw new Error('Base CDD fuera de rango (18-30 °C).');

  const hddDia = Math.max(0, baseH - T);
  const cddDia = Math.max(0, T - baseC);
  const hdd = hddDia * dias;
  const cdd = cddDia * dias;

  const cH = Number(i.consumoPorHDD ?? 0);
  const cC = Number(i.consumoPorCDD ?? 0);
  const consumoCal = cH > 0 ? `${(hdd * cH).toFixed(1)} unidades (HDD × ${cH})` : 'No calculado';
  const consumoRef = cC > 0 ? `${(cdd * cC).toFixed(1)} unidades (CDD × ${cC})` : 'No calculado';

  let interp = '';
  if (hdd > cdd && hdd > 100) interp = 'Período dominado por calefacción — gasto térmico de invierno.';
  else if (cdd > hdd && cdd > 80) interp = 'Período dominado por refrigeración — gasto de AC de verano.';
  else if (hdd < 50 && cdd < 50) interp = 'Período templado, bajo consumo de climatización.';
  else interp = 'Período mixto o transicional; revisar mes a mes.';

  const dominante = hdd >= cdd
    ? `predomina **calefacción** (${hdd.toFixed(0)} HDD)`
    : `predomina **refrigeración** (${cdd.toFixed(0)} CDD)`;
  const _insight = {
    title: 'Demanda térmica del período',
    text: `Con T media de **${T.toFixed(1)} °C** durante ${dias} días, ${dominante}. ${interp}`,
    tone: (hdd > 100 || cdd > 80) ? 'warn' : (hdd < 50 && cdd < 50 ? 'good' : 'neutral'),
    icon: hdd >= cdd ? '🔥' : '❄️',
  };

  const totalGD = hdd + cdd;
  const _chart = totalGD > 0
    ? {
        type: 'doughnut' as const,
        slices: [
          { label: 'Calefacción (HDD)', value: Number(hdd.toFixed(1)) },
          { label: 'Refrigeración (CDD)', value: Number(cdd.toFixed(1)) },
        ],
        centerValue: totalGD.toFixed(0),
        centerLabel: 'Grados-día',
        ariaLabel: 'Reparto de la demanda térmica del período entre calefacción (HDD) y refrigeración (CDD).',
      }
    : undefined;

  return {
    hdd: `${hdd.toFixed(1)} HDD`,
    cdd: `${cdd.toFixed(1)} CDD`,
    hddNumero: Number(hdd.toFixed(2)),
    cddNumero: Number(cdd.toFixed(2)),
    consumoCalefaccion: consumoCal,
    consumoRefrigeracion: consumoRef,
    interpretacion: interp,
    mensaje: `Con T media ${T.toFixed(1)} °C por ${dias} días: ${hdd.toFixed(1)} HDD y ${cdd.toFixed(1)} CDD.`,
    _insight,
    _chart,
  };
}
