/** Peso ideal para niños por edad y sexo — OMS */
export interface Inputs { edadNinoAnios: number; sexoNino: string; }
export interface Outputs { pesoPromedio: string; rangoSaludable: string; evaluacion: string; }

const datosVaron: Record<number, [number, number, number]> = { // [P15, P50, P85]
  0: [2.9, 3.3, 3.9], 0.5: [6.7, 7.9, 9.2], 1: [8.6, 9.6, 10.8],
  1.5: [9.5, 10.9, 12.2], 2: [10.8, 12.2, 13.6], 3: [12.7, 14.3, 16.2],
  4: [14.4, 16.3, 18.6], 5: [16.0, 18.3, 21.0], 6: [17.8, 20.5, 23.5],
  7: [19.9, 22.9, 26.4], 8: [22.0, 25.4, 29.7], 9: [24.3, 28.1, 33.3],
  10: [26.7, 31.2, 37.5],
};
const datosMujer: Record<number, [number, number, number]> = {
  0: [2.8, 3.2, 3.7], 0.5: [6.2, 7.3, 8.6], 1: [7.9, 8.9, 10.1],
  1.5: [9.1, 10.2, 11.6], 2: [10.2, 11.5, 13.0], 3: [12.2, 13.9, 15.9],
  4: [14.0, 16.1, 18.5], 5: [15.8, 18.2, 21.2], 6: [17.5, 20.2, 23.5],
  7: [19.5, 22.4, 26.3], 8: [21.7, 25.0, 29.7], 9: [24.3, 28.2, 33.7],
  10: [27.0, 31.9, 38.5],
};

export function pesoIdealNinos(i: Inputs): Outputs {
  const edad = Number(i.edadNinoAnios);
  const sexo = String(i.sexoNino);
  if (edad < 0 || edad > 10) throw new Error('Ingresá una edad entre 0 y 10 años');

  const tabla = sexo === 'f' ? datosMujer : datosVaron;
  const edades = Object.keys(tabla).map(Number).sort((a, b) => a - b);
  let closest = edades[0];
  for (const e of edades) { if (e <= edad) closest = e; }
  const [p15, p50, p85] = tabla[closest];

  return {
    pesoPromedio: `${p50} kg (percentil 50)`,
    rangoSaludable: `${p15} kg a ${p85} kg (percentil 15 a 85)`,
    evaluacion: `El rango saludable para ${sexo === 'f' ? 'una niña' : 'un niño'} de ${edad} años es de ${p15} a ${p85} kg. El promedio es ${p50} kg.`,
  };
}
