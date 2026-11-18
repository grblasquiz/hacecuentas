import { CATEGORIAS, TOPES, PARAMS_FISICOS, type Cat } from './data/monotributo-2026';
/** Sólo parámetros ingresados; no certifica adhesión ni incluye alquiler/precio unitario. */
export function selectMonotributoCategory(billing:number, surface=0, energy=0):Cat|null {
 if(![billing,surface,energy].every(Number.isFinite)||billing<=0||surface<0||energy<0)throw new Error('Ingresá facturación positiva y parámetros no negativos.');
 return CATEGORIAS.find(cat=>billing<=TOPES[cat]&&surface<=PARAMS_FISICOS[cat].superficie&&energy<=PARAMS_FISICOS[cat].energia)??null;
}
