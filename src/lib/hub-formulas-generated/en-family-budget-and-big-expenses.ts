import { presupuesto503020FamiliarSueldo as f1 } from '../formulas/presupuesto-50-30-20-familiar-sueldo';
import { compute as f2 } from '../formulas/baby-shower-budget-guests-food-decoration';
import { compute as f3 } from '../formulas/back-to-school-budget-calculator';
import { discountCalculator as f4 } from '../formulas/discount-calculator';
import { itbaUtdtCostoCarreraAnualPrivada as f5 } from '../formulas/itba-utdt-costo-carrera-anual-privada';
import { cajaSeguridadBancoComparativaMensual as f6 } from '../formulas/caja-seguridad-banco-comparativa-mensual';
export const formulaMap: Record<string,(v:any)=>any> = {
  c1: f1,
  c2: f2,
  c3: f3,
  c4: f4,
  c5: f5,
  c6: f6,
};
