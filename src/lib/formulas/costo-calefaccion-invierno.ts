/** Gas vs eléctrico para calefacción */
export interface Inputs { horasDia: number; precioKwh: number; precioM3Gas: number; tamanoAmbiente: string; }
export interface Outputs { costoGasMes: number; costoElectricoMes: number; costoAireMes: number; recomendacion: string; _insight?: any; }

export function costoCalefaccionInvierno(i: Inputs): Outputs {
  const hs = Number(i.horasDia);
  const pkwh = Number(i.precioKwh);
  const pgas = Number(i.precioM3Gas);
  const tam = i.tamanoAmbiente || 'mediano';
  if (!hs || hs <= 0) throw new Error('Ingresá las horas de calefacción');
  if (!pkwh || pkwh <= 0) throw new Error('Ingresá el precio del kWh');
  if (!pgas || pgas <= 0) throw new Error('Ingresá el precio del m3 de gas');

  const consumos: Record<string, {gasM3h: number; elecW: number; aireW: number}> = {
    'chico': { gasM3h: 0.3, elecW: 1500, aireW: 650 },
    'mediano': { gasM3h: 0.4, elecW: 2000, aireW: 850 },
    'grande': { gasM3h: 0.6, elecW: 2500, aireW: 1200 },
  };
  const c = consumos[tam] || consumos['mediano'];

  const costoGasMes = c.gasM3h * hs * 30 * pgas;
  const costoElectricoMes = (c.elecW / 1000) * hs * 30 * pkwh;
  const costoAireMes = (c.aireW / 1000) * hs * 30 * pkwh;

  const mejor = Math.min(costoGasMes, costoElectricoMes, costoAireMes);
  let rec = 'Gas natural es la opción más económica.';
  if (mejor === costoAireMes) rec = 'Aire acondicionado inverter en modo calor es la opción más económica.';
  if (mejor === costoElectricoMes) rec = 'Calefactor eléctrico es la opción más económica (raro, revisá los precios).';

  const opciones = [
    { nombre: 'gas natural', costo: costoGasMes },
    { nombre: 'calefactor eléctrico', costo: costoElectricoMes },
    { nombre: 'aire en modo calor', costo: costoAireMes },
  ];
  const masBarata = opciones.reduce((a, b) => (b.costo < a.costo ? b : a));
  const masCara = opciones.reduce((a, b) => (b.costo > a.costo ? b : a));
  const ahorroMes = masCara.costo - masBarata.costo;
  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const _insight = {
    title: 'La opción más barata para calentar',
    text:
      `Para tu ambiente, **${masBarata.nombre}** es lo más económico: **$${fmt(masBarata.costo)}/mes**. ` +
      `Elegir bien te ahorra unos **$${fmt(ahorroMes)}/mes** frente a ${masCara.nombre}, la opción más cara.`,
    tone: 'good' as const,
    icon: '🔥',
  };

  return {
    costoGasMes: Math.round(costoGasMes),
    costoElectricoMes: Math.round(costoElectricoMes),
    costoAireMes: Math.round(costoAireMes),
    recomendacion: rec,
    _insight,
  };
}
