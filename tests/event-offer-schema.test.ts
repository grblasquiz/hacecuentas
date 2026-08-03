import { describe, expect, it } from 'vitest';
import { fixture, WORLD_CUP_EVENT, worldCupMatchEvent } from '../src/lib/data/mundial-2026';
import { eventTicketOffer } from '../src/lib/offer-schema';

describe('event ticket structured data', () => {
  it('includes an official price when the caller provides one', () => {
    expect(eventTicketOffer({
      url: 'https://example.com/tickets',
      price: 60,
      priceCurrency: 'USD',
    })).toMatchObject({
      '@type': 'Offer',
      price: 60,
      priceCurrency: 'USD',
    });
  });

  it('publishes the completed World Cup with its verified lowest ticket price', () => {
    expect(WORLD_CUP_EVENT.eventStatus).toBe('https://schema.org/EventCompleted');
    expect(WORLD_CUP_EVENT.offers).toMatchObject({
      '@type': 'Offer',
      price: 60,
      priceCurrency: 'USD',
      availability: 'https://schema.org/SoldOut',
      validFrom: '2025-09-10',
    });
  });

  it('enriches every World Cup match with all recommended Event fields', () => {
    for (const match of fixture.matches) {
      const event = worldCupMatchEvent(match, `https://hacecuentas.com/fixture-mundial-2026#partido-${match.num}`);
      expect(event).toMatchObject({
        '@type': 'SportsEvent',
        description: expect.any(String),
        image: expect.any(Array),
        performer: expect.any(Array),
        organizer: { '@type': 'Organization', name: 'FIFA' },
        location: { '@type': 'Place', address: { '@type': 'PostalAddress' } },
        offers: { '@type': 'Offer', price: 60, priceCurrency: 'USD' },
        endDate: expect.any(String),
      });
    }
  });
});
