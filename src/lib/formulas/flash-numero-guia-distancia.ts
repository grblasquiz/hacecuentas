/** Calculadora de Número Guía de Flash */
export interface Inputs { gn: number; apertura: number; iso: number; }
export interface Outputs { distancia: number; gnEfectivo: number; potenciaSugerida: string; mensaje: string; _insight?: any; _chart?: any; }

export function flashNumeroGuiaDistancia(i: Inputs): Outputs {
  const gn = Number(i.gn);
  const f = Number(i.apertura);
  const iso = Number(i.iso);
  if (!gn || gn <= 0) throw new Error('Ingresá el número guía');
  if (!f || f <= 0) throw new Error('Ingresá la apertura');
  if (!iso || iso <= 0) throw new Error('Ingresá el ISO');

  const gnEfectivo = gn * Math.sqrt(iso / 100);
  const distancia = gnEfectivo / f;

  let potenciaSugerida: string;
  if (distancia > 15) potenciaSugerida = 'Full power (1/1). Tu flash tiene alcance de sobra.';
  else if (distancia > 8) potenciaSugerida = '1/2 a 1/1 power. Buen alcance.';
  else if (distancia > 4) potenciaSugerida = '1/4 a 1/2 power. Distancia media.';
  else potenciaSugerida = '1/8 a 1/4 power. Alcance limitado, acercate al sujeto.';

  const dist1 = Number(distancia.toFixed(1));
  const tono = distancia > 8 ? "good" : distancia > 4 ? "neutral" : "warn";
  const insight = {
    title: distancia > 8 ? "Alcance de sobra" : distancia > 4 ? "Alcance medio" : "Alcance limitado",
    text: `A ISO ${iso} y f/${f}, tu flash ilumina bien hasta **${dist1} m** (GN efectivo **${gnEfectivo.toFixed(0)}**). ` +
      (distancia > 8
        ? `Tenés margen para bajar potencia o cerrar el diafragma sin quedarte corto.`
        : distancia > 4
        ? `Si necesitás más alcance, abrí el diafragma o subí el ISO.`
        : `Para llegar más lejos, **acercate al sujeto**, abrí la apertura o subí el ISO.`),
    tone: tono,
    icon: "📸",
  };

  return {
    distancia: dist1,
    gnEfectivo: Number(gnEfectivo.toFixed(0)),
    potenciaSugerida,
    mensaje: `Con GN ${gn} a ISO ${iso} y f/${f}: alcance máximo ${distancia.toFixed(1)} metros. GN efectivo: ${gnEfectivo.toFixed(0)}.`,
    _insight: insight,
    _chart: {
      type: "scale",
      marker: dist1,
      markerLabel: `${dist1} m`,
      min: 0,
      segments: [
        { nombre: "Limitado", max: 4, color: "#f97316", colorDark: "#fb923c" },
        { nombre: "Medio", max: 8, color: "#eab308", colorDark: "#facc15" },
        { nombre: "Bueno", max: 15, color: "#22c55e", colorDark: "#4ade80" },
        { nombre: "De sobra", max: Math.max(20, Math.ceil(dist1) + 1), color: "#16a34a", colorDark: "#22c55e" },
      ],
      ariaLabel: `Alcance del flash: ${dist1} metros, en zona ${distancia > 15 ? "de sobra" : distancia > 8 ? "buena" : distancia > 4 ? "media" : "limitada"}.`,
    },
  };
}
