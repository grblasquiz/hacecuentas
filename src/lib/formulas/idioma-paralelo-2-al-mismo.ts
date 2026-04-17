/** ¿Es viable aprender 2 idiomas a la vez? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  viable: string;
  minutosEfectivos: number;
  perdida: string;
  recomendacion: string;
}

export function idiomaParalelo2AlMismo(i: Inputs): Outputs {
  const horas = Number(i.horasDia) || 2;
  const sim = String(i.similitud || 'distintos');
  const nivel = String(i.nivelMasFuerte || 'a2');
  if (horas <= 0) throw new Error('Horas inválidas');

  const INT: Record<string, number> = { 'muy-similares': 0.35, similares: 0.2, distintos: 0.08 };
  const inter = INT[sim] ?? 0.2;

  const horasBrutas = horas / 2;
  const horasEfect = horasBrutas * (1 - inter);

  let viable = '';
  let rec = '';
  if (horas < 1) { viable = 'No viable'; rec = 'Muy poco tiempo. Concentrate en uno.'; }
  else if (horas < 1.5) { viable = 'Poco viable'; rec = 'Considerá uno hasta B2 antes de sumar el segundo.'; }
  else if (horas < 3) { viable = 'Viable con limitaciones'; rec = 'Avance lento. Separá franjas horarias.'; }
  else { viable = 'Viable'; rec = 'Dividí mañana/tarde y mantené consistencia.'; }

  if (nivel === 'a0') rec += ' Empezar ambos desde cero multiplica interferencia — priorizá uno los primeros 3-6 meses.';

  return {
    viable,
    minutosEfectivos: Math.round(horasEfect * 60),
    perdida: Math.round(inter * 100) + '% (interferencia entre idiomas)',
    recomendacion: rec,
  };

}
