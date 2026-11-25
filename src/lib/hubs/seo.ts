import { hubLabels } from './seo-labels';
import type { HubData } from './types';

const origin = 'https://hacecuentas.com';

export function hubSeoGraph(hub: HubData, currency = 'ARS') {
  const path = `/${hub.slug}`;
  const canonical = origin + path;
  const reviewer = hub.professionalReviewer;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonical + '#webpage',
        url: canonical,
        name: hub.title,
        description: hub.description,
        dateModified: hub.lastReviewed,
        author: { '@id': origin + '/autores/martin-rodriguez#person' },
        citation: hub.sources.map(source => source.url),
        ...(reviewer && {
          reviewedBy: {
            '@type': 'Person',
            name: reviewer.name,
            url: reviewer.profileUrl,
            hasCredential: {
              '@type': 'EducationalOccupationalCredential',
              name: reviewer.credential,
              identifier: reviewer.registrationNumber,
            },
          },
        }),
      },
      {
        '@type': 'WebApplication',
        name: hub.title,
        url: canonical,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: currency },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin + '/' },
          { '@type': 'ListItem', position: 2, name: hub.silo, item: origin + hub.siloHref },
          { '@type': 'ListItem', position: 3, name: hubLabels[path]?.breadcrumb ?? hub.h1, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: hub.faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };
}
