export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

type Franja = { hasta: number; alicuota: number };
type Config = { tipo: 'flat'; alicuota: number } | { tipo: 'franjas'; franjas: Franja[] };

const ALICUOTAS: Record<string, Config> = {
  'buenos-aires': { tipo: 'franjas', franjas: [
    { hasta: 5000000, alicuota: 0.020 },
    { hasta: 20000000, alicuota: 0.027 },
    { hasta: 50000000, alicuota: 0.036 },
    { hasta: Infinity, alicuota: 0.043 },
  ]},
  'catamarca': { tipo: 'flat', alicuota: 0.015 },
  'chaco': { tipo: 'flat', alicuota: 0.014 },
  'chubut': { tipo: 'flat', alicuota: 0.016 },
  'cordoba': { tipo: 'franjas', franjas: [
    { hasta: 10000000, alicuota: 0.020 },
    { hasta: 30000000, alicuota: 0.025 },
    { hasta: Infinity, alicuota: 0.030 },
  ]},
  'corrientes': { tipo: 'flat', alicuota: 0.015 },
  'entre-rios': { tipo: 'flat', alicuota: 0.018 },
  'formosa': { tipo: 'flat', alicuota: 0.012 },
  'jujuy': { tipo: 'flat', alicuota: 0.018 },
  'la-pampa': { tipo: 'flat', alicuota: 0.015 },
  'la-rioja': { tipo: 'flat', alicuota: 0.015 },
  'mendoza': { tipo: 'flat', alicuota: 0.020 },
  'misiones': { tipo: 'flat', alicuota: 0.016 },
  'neuquen': { tipo: 'flat', alicuota: 0.015 },
  'rio-negro': { tipo: 'flat', alicuota: 0.018 },
  'salta': { tipo: 'flat', alicuota: 0.015 },
  'san-juan': { tipo: 'flat', alicuota: 0.016 },
  'san-luis': { tipo: 'flat', alicuota: 0.014 },
  'santa-cruz': { tipo: 'flat', alicuota: 0.017 },
  'santa-fe': { tipo: 'franjas', franjas: [
    { hasta: 10000000, alicuota: 0.020 },
    { hasta: 30000000, alicuota: 0.025 },
    { hasta: Infinity, alicuota: 0.030 },
  ]},
  'santiago-del-estero': { tipo: 'flat', alicuota: 0.013 },
  'tierra-del-fuego': { tipo: 'flat', alicuota: 0.009 },
  'tucuman': { tipo: 'flat', alicuota: 0.018 },
};

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

export function valuacionFiscalAutomotorProvincia(i: Inputs): Outputs {
  const valuacionFiscal = Number(i.valuacionFiscal) || 0;
  const provincia = String(i.provincia || 'buenos-aires');
  const antiguedad = Math.max(0, Number(i.antiguedad) || 0);

  const factor = Math.max(0.40, 1 - antiguedad * 0.08);
  const valuacionDepreciada = valuacionFiscal * factor;

  const cfg = ALICUOTAS[provincia] || ALICUOTAS['buenos-aires'];
  let alicuota = 0;
  if (cfg.tipo === 'flat') {
    alicuota = cfg.alicuota;
  } else {
    for (const f of cfg.franjas) {
      if (valuacionDepreciada <= f.hasta) { alicuota = f.alicuota; break; }
    }
    if (alicuota === 0 && cfg.franjas.length) alicuota = cfg.franjas[cfg.franjas.length - 1].alicuota;
  }

  const impuestoAnual = valuacionDepreciada * alicuota;
  const impuestoMensual = impuestoAnual / 12;

  const alicPct = (alicuota * 100).toFixed(2).replace('.', ',') + '%';
  const provLabel = provincia.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const detalle = `${provLabel}: valuación ajustada por antigüedad ${fmt(valuacionDepreciada)} × alícuota ${alicPct} = impuesto anual ${fmt(impuestoAnual)} (${cfg.tipo === 'franjas' ? 'tramo según franjas' : 'alícuota flat'}).`;

  return {
    impuestoAnual: fmt(impuestoAnual),
    impuestoMensual: fmt(impuestoMensual),
    alicuotaAplicada: alicPct,
    valuacionDepreciada: fmt(valuacionDepreciada),
    detalle,
  };
}
