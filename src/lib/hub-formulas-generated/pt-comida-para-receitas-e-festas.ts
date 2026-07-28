import { boloCasamentoBr as f1 } from '../formulas/bolo-casamento-br';
import { cafeMolidoTazaMetodoPreparacion as f2 } from '../formulas/cafe-molido-taza-metodo-preparacion';
import { kilosChocolateCaseroBombonesReceta as f3 } from '../formulas/kilos-chocolate-casero-bombones-receta';
import { conversionCucharaditasGramosEspeciasSal as f4 } from '../formulas/conversion-cucharaditas-gramos-especias-sal';
import { conversionCupsGramosHarinaAzucarAceite as f5 } from '../formulas/conversion-cups-gramos-harina-azucar-aceite';
import { festaChurrascoGramasBr as f6 } from '../formulas/festa-churrasco-gramas-br';
import { porcionesTortaCumpleanosInvitadosTamano as f7 } from '../formulas/porciones-torta-cumpleanos-invitados-tamano';
import { porcionesSushiPorPersonaPromedio as f8 } from '../formulas/porciones-sushi-por-persona-promedio';
import { cantidadHamburguesasParrillaCumpleanos as f9 } from '../formulas/cantidad-hamburguesas-parrilla-cumpleanos';
import { tiemposCoccionVerdurasAlVaporHervido as f10 } from '../formulas/tiempos-coccion-verduras-al-vapor-hervido';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
  c7: f7,
  c8: f8,
  c9: f9,
  c10: f10,
};
