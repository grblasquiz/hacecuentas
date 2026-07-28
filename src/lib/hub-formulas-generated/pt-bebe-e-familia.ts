import { formulaInfantilBiberonEdadMlDia as f1 } from '../formulas/formula-infantil-biberon-edad-ml-dia';
import { introduccionAlimentosBlwEdadEtapa6meses as f2 } from '../formulas/introduccion-alimentos-blw-edad-etapa-6meses';
import { compute as f3 } from '../formulas/data-parto-dum-naegele-portugues';
import { compute as f4 } from '../formulas/idade-anos-meses-dias-data-nascimento';
import { compute as f5 } from '../formulas/calculadora-orcamento-presente-dia-dos-pais';
import { compute as f6 } from '../formulas/ovulacao-periodo-fertil-ciclo';
import { pañalesPorDiaMesBebeEdad as f7 } from '../formulas/pañales-por-dia-mes-bebe-edad';
import { mesadaSemanalHijoEdadSugeridaMonto as f8 } from '../formulas/mesada-semanal-hijo-edad-sugerida-monto';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
  c7: f7,
  c8: f8,
};
