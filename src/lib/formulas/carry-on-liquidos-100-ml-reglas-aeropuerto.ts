export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calculadora de líquidos carry-on — Regla 3-1-1 / LAG
 * -------------------------------------------------------
 * Fuente: TSA (tsa.gov), ICAO LAG rule, PSA Argentina
 *
 * Regla 3-1-1 / LAG internacional:
 *   - Cada envase ≤ 100 ml (3.4 oz)
 *   - Todos los envases válidos caben en 1 bolsa transparente de ≤ 1.000 ml (1 litro)
 *   - Máximo 1 bolsa por pasajero
 *
 * Excepciones (sin límite de 100 ml, deben declararse en control):
 *   - Medicamentos con receta médica
 *   - Leche materna / fórmula infantil / alimentos para bebé
 *
 * La capacidad se mide por lo impreso en el ENVASE, no por lo que contiene.
 */

const BAG_LIMIT_ML = 1000; // 1 litro = capacidad máxima de la bolsa
const CONTAINER_MAX_ML = 100; // límite por envase

export function carryOnLiquidos100MlReglasAeropuerto(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  // Leer hasta 6 envases (en ml). Valor vacío / 0 = no ingresado.
  const rawEnvases: number[] = [
    Number(i.envase1) || 0,
    Number(i.envase2) || 0,
    Number(i.envase3) || 0,
    Number(i.envase4) || 0,
    Number(i.envase5) || 0,
    Number(i.envase6) || 0,
  ];

  // Solo consideramos los envases que el usuario ingresó (> 0)
  const ingresados = rawEnvases.filter(v => v > 0);

  if (ingresados.length === 0) {
    const noItems = __lang === 'en'
      ? 'Enter at least one container size (ml).'
      : 'Ingresá al menos un envase (ml).';
    return { validos: '0', rechazados: '0', bolsa_usada: '0', espacio_libre: '1000', resumen: noItems };
  }

  // Clasificar cada envase
  const validos = ingresados.filter(v => v <= CONTAINER_MAX_ML);
  const rechazados = ingresados.filter(v => v > CONTAINER_MAX_ML);

  const totalValidoMl = validos.reduce((acc, v) => acc + v, 0);
  const espacioLibreMl = Math.max(0, BAG_LIMIT_ML - totalValidoMl);
  const bolsaOk = totalValidoMl <= BAG_LIMIT_ML;
  const todoOk = rechazados.length === 0 && bolsaOk;

  // Porcentaje de bolsa usado
  const pctBolsa = Math.min(100, Math.round((totalValidoMl / BAG_LIMIT_ML) * 100));

  // Estado general
  let estado: string;
  let tono: 'success' | 'warning' | 'error';

  if (__lang === 'en') {
    if (todoOk) {
      estado = `All ${validos.length} container(s) comply ✅ — ${totalValidoMl} ml used of 1,000 ml bag.`;
      tono = 'success';
    } else if (rechazados.length > 0 && bolsaOk) {
      estado = `${rechazados.length} container(s) exceed 100 ml ❌ — must be checked or transferred to smaller bottles. Valid containers: ${totalValidoMl} ml used of 1,000 ml bag.`;
      tono = 'warning';
    } else if (rechazados.length === 0 && !bolsaOk) {
      estado = `All containers ≤ 100 ml ✅ but total volume (${totalValidoMl} ml) exceeds the 1,000 ml bag limit ❌ — remove ${totalValidoMl - BAG_LIMIT_ML} ml worth of containers.`;
      tono = 'warning';
    } else {
      estado = `${rechazados.length} container(s) exceed 100 ml ❌ AND total valid volume (${totalValidoMl} ml) exceeds 1,000 ml bag limit ❌.`;
      tono = 'error';
    }
  } else {
    if (todoOk) {
      estado = `Todos los ${validos.length} envase(s) cumplen ✅ — ${totalValidoMl} ml usados de los 1.000 ml de la bolsa.`;
      tono = 'success';
    } else if (rechazados.length > 0 && bolsaOk) {
      estado = `${rechazados.length} envase(s) superan los 100 ml ❌ — deben ir a bodega o transvase a frascos de viaje. Envases válidos: ${totalValidoMl} ml de 1.000 ml.`;
      tono = 'warning';
    } else if (rechazados.length === 0 && !bolsaOk) {
      estado = `Todos los envases son ≤ 100 ml ✅ pero el volumen total (${totalValidoMl} ml) supera el límite de la bolsa de 1.000 ml ❌ — retirá envases por ${totalValidoMl - BAG_LIMIT_ML} ml.`;
      tono = 'warning';
    } else {
      estado = `${rechazados.length} envase(s) superan los 100 ml ❌ Y el volumen válido total (${totalValidoMl} ml) supera el límite de la bolsa ❌.`;
      tono = 'error';
    }
  }

  // Insight explicativo
  let insightText: string;
  if (__lang === 'en') {
    insightText = `You entered **${ingresados.length}** container(s). **${validos.length}** pass (≤ 100 ml each) and **${rechazados.length}** are rejected (> 100 ml). The valid containers fill **${pctBolsa}%** of your 1 L zip-lock bag (${totalValidoMl} ml used, ${espacioLibreMl} ml free). Remember: security checks the **capacity printed on the label**, not how much liquid is inside. A 150 ml bottle with just a drop is still rejected.`;
  } else {
    insightText = `Ingresaste **${ingresados.length}** envase(s). **${validos.length}** pasan (≤ 100 ml c/u) y **${rechazados.length}** son rechazados (> 100 ml). Los envases válidos ocupan el **${pctBolsa}%** de la bolsa de 1 L (${totalValidoMl} ml usados, ${espacioLibreMl} ml libres). Recordá: seguridad mira la **capacidad impresa en el envase**, no cuánto líquido tiene adentro. Un frasco de 150 ml con solo una gota igual es rechazado.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Carry-on liquids check' : 'Verificación de líquidos carry-on',
    text: insightText,
    tone: tono,
    icon: '🧴',
  };

  const resumenLabel = __lang === 'en'
    ? `Valid: ${validos.length} container(s) · Rejected: ${rechazados.length} · Bag used: ${totalValidoMl}/1,000 ml (${pctBolsa}%)`
    : `Válidos: ${validos.length} envase(s) · Rechazados: ${rechazados.length} · Bolsa usada: ${totalValidoMl}/1.000 ml (${pctBolsa}%)`;

  return {
    validos: String(validos.length),
    rechazados: String(rechazados.length),
    bolsa_usada: String(totalValidoMl),
    espacio_libre: String(espacioLibreMl),
    resumen: resumenLabel,
    estado,
    _insight,
  };
}
