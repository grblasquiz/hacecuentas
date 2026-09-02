export const GANANCIAS_2026 = {
  first: [[0,2000030.09,0,.05],[2000030.09,4000060.17,100001.50,.09],[4000060.17,6000090.26,280004.21,.12],[6000090.26,9000135.40,520007.82,.15],[9000135.40,18000270.80,970014.59,.19],[18000270.80,27000406.20,2680040.32,.23],[27000406.20,40500609.30,4750071.46,.27],[40500609.30,60750913.96,8395126.30,.31],[60750913.96,Infinity,14672720.74,.35]],
  second: [[0,2168491.89,0,.05],[2168491.89,4336983.77,108424.59,.09],[4336983.77,6505475.65,303588.86,.12],[6505475.65,9758213.49,563807.89,.15],[9758213.49,19516426.99,1051718.57,.19],[19516426.99,29274640.48,2905779.13,.23],[29274640.48,43911960.73,5150168.23,.27],[43911960.73,65867941.10,9102244.70,.31],[65867941.10,Infinity,15908598.62,.35]],
} as const;

/** Deducciones personales oficiales del art. 30, por período de retención. */
export const GANANCIAS_2026_DEDUCCIONES = {
  first: {
    gni: 5_151_802.50,
    conyuge: 4_851_964.66,
    hijo: 2_446_863.48,
    hijoIncapacitado: 4_893_726.96,
    especialAutonomos: 18_031_308.76,
    especialEmpleados: 24_728_652.02,
  },
  second: {
    gni: 5_585_736.93,
    conyuge: 5_260_643.86,
    hijo: 2_652_961.90,
    hijoIncapacitado: 5_305_923.78,
    especialAutonomos: 19_550_079.27,
    especialEmpleados: 26_811_537.29,
  },
} as const;

export const GANANCIAS_2026_CURRENT_PERIOD = 'second' as const;

export const GANANCIAS_2026_META = {
  lastReviewed: '2026-08-31',
  firstPeriodSource: 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-ene-a-jun-2026.pdf',
  secondPeriodSource: 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-jul-a-dic-2026.pdf',
  deductionsSource: 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-jul-dic-2026.pdf',
};
