export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aislacionTermicaKMinimoZona(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const zonas: Record<string, string> = { 'I-II': '1.2', 'III': '1.0', 'IV-V': '0.85', 'VI': '0.74' };
  const z = String(i.zona);
  const k = zonas[z] || '1.0';
  const resumen = __lang === 'en'
    ? `Zone ${z}: max K ${k} W/m²K (IRAM 11605).`
    : `Zona ${z}: K máx ${k} W/m²K (IRAM 11605).`;
  const frio = parseFloat(k) <= 0.85;
  const insight = __lang === 'en'
    ? {
        title: 'What this K means',
        text: frio
          ? `Zone ${z} is cold: the **${k} W/m²K** ceiling is demanding — a single brick wall won't pass, you need added insulation to comply with IRAM 11605.`
          : `In zone ${z} the wall transmittance must stay at or below **${k} W/m²K**. Lower K means less heat loss and a cheaper bill.`,
        tone: frio ? 'warn' : 'neutral',
        icon: '🌡️',
      }
    : {
        title: 'Qué significa este K',
        text: frio
          ? `La zona ${z} es fría: el tope de **${k} W/m²K** es exigente — un muro de ladrillo solo no cumple, necesitás aislación agregada para pasar la IRAM 11605.`
          : `En la zona ${z} la transmitancia del muro debe quedar en **${k} W/m²K** o menos. Cuanto más bajo el K, menos calor se escapa y más barata la factura.`,
        tone: frio ? 'warn' : 'neutral',
        icon: '🌡️',
      };
  return { kMaximo: k, resumen, _insight: insight };
}
