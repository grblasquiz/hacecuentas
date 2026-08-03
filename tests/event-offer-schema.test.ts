import { describe, expect, it } from 'vitest';
import { WORLD_CUP_EVENT } from '../src/lib/data/mundial-2026';
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
});
