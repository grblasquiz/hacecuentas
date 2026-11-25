type HubLabels = {
  breadcrumb: string;
  anchor?: string;
};

export const hubLabels: Record<string, HubLabels> = {
  '/trabajo': { breadcrumb: 'Trabajo', anchor: 'Calculadoras de sueldo y trabajo' },
  '/impuestos': { breadcrumb: 'Impuestos', anchor: 'Calculadoras de impuestos en Argentina' },
  '/jubilacion': { breadcrumb: 'Jubilación', anchor: 'Calculadoras de jubilación' },
  '/alquiler': { breadcrumb: 'Alquiler', anchor: 'Calculadoras de alquiler' },
  '/trabajo/sueldo-bruto-y-neto': { breadcrumb: 'Calculadora de sueldo bruto a neto' },
  '/trabajo/sueldo-neto-a-bruto': { breadcrumb: 'Calculadora de sueldo neto a bruto' },
  '/trabajo/indemnizacion-por-despido': { breadcrumb: 'Calculadora de indemnización por despido' },
  '/trabajo/aguinaldo': { breadcrumb: 'Calculadora de aguinaldo' },
  '/impuestos/iva': { breadcrumb: 'Calculadora de IVA' },
  '/jubilacion/cuanto-voy-a-cobrar': { breadcrumb: 'Calculadora de jubilación ANSES' },
  '/alquiler/aumento-de-alquiler': { breadcrumb: 'Aumento de alquiler', anchor: 'Calculadora de aumento de alquiler por ICL e IPC' },
  '/alquiler/entrar-a-un-alquiler': { breadcrumb: 'Gastos para alquilar', anchor: 'Calculadora de gastos para entrar a un alquiler' },
  '/es/vivienda/comprar-o-vender-piso': { breadcrumb: 'Impuestos al comprar o vender piso' },
};

export function hubAnchor(path: string, fallback: string): string {
  return hubLabels[path]?.anchor ?? hubLabels[path]?.breadcrumb ?? fallback;
}
