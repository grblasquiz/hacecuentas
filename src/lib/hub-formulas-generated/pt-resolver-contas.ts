import { energiaCineticaEc as f1 } from '../formulas/energia-cinetica-ec';
import { dilucionConcentracionC1v1C2v2 as f2 } from '../formulas/dilucion-concentracion-c1v1-c2v2';
import { distanciaCaidaLibreAltura as f3 } from '../formulas/distancia-caida-libre-altura';
import { empujeArquimedesVolumen as f4 } from '../formulas/empuje-arquimedes-volumen';
import { integralIndefinidaPolinomioCoefs as f5 } from '../formulas/integral-indefinida-polinomio-coefs';
import { mcdMcmDosNumerosEnteros as f6 } from '../formulas/mcd-mcm-dos-numeros-enteros';
import { molesMasaFormulaMolecular as f7 } from '../formulas/moles-masa-formula-molecular';
import { paralajeDistanciaEstrellaParsec as f8 } from '../formulas/paralaje-distancia-estrella-parsec';
import { compute as f9 } from '../formulas/regra-de-tres-simples-composta-direta-inversa';
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
};
