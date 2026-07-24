export interface SluggedCalc {
  slug: string;
}

/**
 * Builds links for country hubs that combine localized calculators with
 * Argentina-root fallbacks. Only calculators present in the localized
 * collection receive the locale prefix.
 */
export function createLocaleCalcUrl<T extends SluggedCalc>(
  localePrefix: string,
  localizedCalcs: Iterable<T>,
): (calc: SluggedCalc) => string {
  const normalizedPrefix = localePrefix.replace(/^\/+|\/+$/g, '');
  if (!normalizedPrefix) {
    throw new Error('localePrefix must not be empty');
  }

  const localizedSlugs = new Set(Array.from(localizedCalcs, (calc) => calc.slug));

  return ({ slug }: SluggedCalc): string => {
    const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
    return localizedSlugs.has(normalizedSlug)
      ? `/${normalizedPrefix}/${normalizedSlug}`
      : `/${normalizedSlug}`;
  };
}
