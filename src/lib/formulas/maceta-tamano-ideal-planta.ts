/** Maceta: tamaño ideal por planta */
export interface Inputs { planta: string; }
export interface Outputs { diametroMin: number; profundidadMin: number; litrosMin: number; consejo: string; }

interface MacetaData { diam: number; prof: number; consejo: string; }
const PLANTAS: Record<string, MacetaData> = {
  tomate: { diam: 30, prof: 40, consejo: 'Usá tutor. Regá diario en verano. 1 planta por maceta.' },
  lechuga: { diam: 15, prof: 15, consejo: 'Podés poner 3-4 lechugas en una jardinera de 60 cm.' },
  pimiento: { diam: 30, prof: 35, consejo: 'Similar al tomate. Necesita sol pleno y buen drenaje.' },
  albahaca: { diam: 20, prof: 20, consejo: 'Maceta mediana alcanza. Podá las flores para que siga produciendo hojas.' },
  frutilla: { diam: 20, prof: 20, consejo: 'Ideal en jardineras o macetas colgantes. 1 planta cada 25 cm.' },
  limonero: { diam: 50, prof: 50, consejo: 'Maceta grande con buen drenaje. Trasplantá cada 2-3 años.' },
  rosal: { diam: 40, prof: 40, consejo: 'Necesita profundidad para la raíz pivotante. Mínimo 30 L.' },
  suculenta: { diam: 10, prof: 8, consejo: 'Maceta chica y baja. Sustrato con mucho drenaje (50% perlita).' },
  helecho: { diam: 25, prof: 20, consejo: 'Preferí macetas anchas. Le gusta humedad pero no encharcamiento.' },
  potus: { diam: 15, prof: 15, consejo: 'Se adapta a macetas chicas. Trasplantá cuando las raíces asomen.' },
  lavanda: { diam: 30, prof: 30, consejo: 'Necesita buen drenaje. No le gusta el exceso de riego.' },
  menta: { diam: 25, prof: 20, consejo: 'Siempre en maceta: en tierra invade todo. Poné sola, es muy expansiva.' },
  perejil: { diam: 15, prof: 20, consejo: 'Necesita más profundidad que ancho por su raíz pivotante.' },
  arbol_frutal: { diam: 50, prof: 50, consejo: 'Mínimo 60 L. Ideal para enanos o semi-enanos. Trasplantá cada 3 años.' },
  cactus: { diam: 12, prof: 10, consejo: 'Maceta chica y poco profunda. Sustrato 70% arena/perlita.' },
  orquidea: { diam: 12, prof: 15, consejo: 'Maceta transparente ideal. Sustrato de corteza, NO tierra.' },
};

export function macetaTamanoIdealPlanta(i: Inputs): Outputs {
  const planta = String(i.planta || 'tomate');
  const data = PLANTAS[planta];
  if (!data) throw new Error('Planta no encontrada');
  const r = data.diam / 2;
  const litros = (Math.PI * (r / 100) * (r / 100) * (data.prof / 100)) * 1000;
  return {
    diametroMin: data.diam,
    profundidadMin: data.prof,
    litrosMin: Number(litros.toFixed(1)),
    consejo: data.consejo,
  };
}
