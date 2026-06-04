export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function ayunoIntermitenteBeneficiosCalorias204(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const peso = Number(i.peso) || 0;
  const altura = Number(i.altura) || 0;
  const edad = Number(i.edad) || 0;
  const sexo = String(i.sexo || 'hombre');
  const actividad = String(i.actividad || 'sedentario');
  const objetivo = String(i.objetivo || 'mantener');
  const horarioApertura = Number(i.horario_apertura);
  const horaApertura = Number.isFinite(horarioApertura) && horarioApertura >= 0 && horarioApertura <= 23
    ? horarioApertura
    : 18;

  if (peso <= 0 || altura <= 0 || edad <= 0) {
    const msg = __lang === 'en'
      ? 'Please enter valid weight, height and age.'
      : 'Ingresá peso, altura y edad válidos.';
    return { resultado: '—', resumen: msg };
  }

  // Mifflin-St Jeor BMR (1990)
  // Men:   BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5
  // Women: BMR = 10×weight(kg) + 6.25×height(cm) − 5×age − 161
  const sexOffset = sexo === 'mujer' ? -161 : 5;
  const bmr = 10 * peso + 6.25 * altura - 5 * edad + sexOffset;

  // Activity multipliers (Harris-Benedict / standard)
  const activityFactors: Record<string, number> = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9,
  };
  const factor = activityFactors[actividad] ?? 1.2;
  const tdee = Math.round(bmr * factor);

  // Goal adjustment
  const goalFactors: Record<string, number> = {
    bajar: 0.85,    // 15% deficit
    mantener: 1.0,
    ganar: 1.1,     // 10% surplus
  };
  const goalFactor = goalFactors[objetivo] ?? 1.0;
  const caloriasObjetivo = Math.round(tdee * goalFactor);

  // Protein target: 1.8 g/kg (midpoint of ISSN 1.6–2.2 g/kg for lean mass preservation)
  const proteinaMin = Math.round(peso * 1.6);
  const proteinaMax = Math.round(peso * 2.2);

  // Window schedule: 4-hour window starting at horaApertura
  const cierreH = (horaApertura + 4) % 24;
  const formatH = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const ventana = `${formatH(horaApertura)} – ${formatH(cierreH)}`;

  // Estimated weekly fat loss/gain
  const deficit = tdee - caloriasObjetivo; // positive = deficit, negative = surplus
  // 1 kg fat ≈ 7700 kcal
  const cambioSemanalKg = (deficit * 7 / 7700);
  const signo = cambioSemanalKg > 0 ? '-' : '+';
  const cambioStr = `${signo}${Math.abs(cambioSemanalKg).toFixed(2)} kg/semana`;

  const tdeeLabel = __lang === 'en' ? 'Maintenance calories (TDEE)' : 'Calorías de mantenimiento (TDEE)';
  const objetivoLabel = __lang === 'en' ? 'Target calories for window' : 'Calorías objetivo para la ventana';
  const ventanaLabel = __lang === 'en' ? 'Eating window' : 'Ventana de alimentación';
  const proteinaLabel = __lang === 'en' ? 'Daily protein target' : 'Proteína diaria objetivo';
  const cambioLabel = __lang === 'en' ? 'Estimated weekly change' : 'Cambio estimado por semana';

  const actividadNombre: Record<string, string> = {
    sedentario: __lang === 'en' ? 'sedentary' : 'sedentario',
    ligero: __lang === 'en' ? 'light activity' : 'actividad ligera',
    moderado: __lang === 'en' ? 'moderate activity' : 'actividad moderada',
    activo: __lang === 'en' ? 'active' : 'activo',
    muy_activo: __lang === 'en' ? 'very active' : 'muy activo',
  };
  const objetivoNombre: Record<string, string> = {
    bajar: __lang === 'en' ? 'lose fat' : 'bajar grasa',
    mantener: __lang === 'en' ? 'maintain weight' : 'mantener peso',
    ganar: __lang === 'en' ? 'gain muscle' : 'ganar músculo',
  };

  const resumen = __lang === 'en'
    ? `${tdeeLabel}: ${tdee} kcal | ${objetivoLabel}: ${caloriasObjetivo} kcal | ${ventanaLabel}: ${ventana} | ${proteinaLabel}: ${proteinaMin}–${proteinaMax} g | ${cambioLabel}: ${cambioStr}`
    : `${tdeeLabel}: ${tdee} kcal | ${objetivoLabel}: ${caloriasObjetivo} kcal | ${ventanaLabel}: ${ventana} | ${proteinaLabel}: ${proteinaMin}–${proteinaMax} g | ${cambioLabel}: ${cambioStr}`;

  const insightText = __lang === 'en'
    ? `Your TDEE is **${tdee} kcal/day** (BMR ${Math.round(bmr)} kcal × activity factor ${factor}). For **${objetivoNombre[objetivo]}**, concentrate **${caloriasObjetivo} kcal** in your 4-hour window (${ventana}). Aim for **${proteinaMin}–${proteinaMax} g of protein** per day (1.6–2.2 g/kg) to preserve lean mass. Estimated weekly body weight change: **${cambioStr}**.`
    : `Tu TDEE es **${tdee} kcal/día** (TMB ${Math.round(bmr)} kcal × factor ${factor}). Para **${objetivoNombre[objetivo]}**, concentrá **${caloriasObjetivo} kcal** en tu ventana de 4 horas (${ventana}). Apuntá a **${proteinaMin}–${proteinaMax} g de proteína** diarios (1,6–2,2 g/kg) para preservar masa muscular. Cambio de peso estimado por semana: **${cambioStr}**.`;

  const toneMap: Record<string, string> = {
    bajar: 'info',
    mantener: 'neutral',
    ganar: 'success',
  };

  return {
    resultado: `${caloriasObjetivo} kcal`,
    resumen,
    _insight: {
      title: __lang === 'en' ? 'Your 20:4 Warrior Plan' : 'Tu plan Warrior 20:4',
      text: insightText,
      tone: toneMap[objetivo] ?? 'neutral',
      icon: '⏰',
    },
  };
}
