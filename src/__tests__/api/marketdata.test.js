/* eslint-env jest */
const { beforeAll, afterAll } = require('@jest/globals');
jest.mock('@/lib/mcache', () => ({
  fetchJsonCached: jest.fn(),
}));

const { fetchJsonCached } = require('@/lib/mcache');
const { createGetRequest } = require('@/test-utils/request');

describe('GET /api/marketdata', () => {
  let originalKey;
  let route;

  beforeAll(() => {
    originalKey = process.env.FINNHUB_API_KEY;
    process.env.FINNHUB_API_KEY = 'test-key';
    route = require('@/app/api/marketdata/route');
  });

  afterAll(() => {
    process.env.FINNHUB_API_KEY = originalKey;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalises provider response (F13-API-MarketDataFetch)', async () => {
    fetchJsonCached.mockResolvedValue({
      data: { c: 120.5, dp: 1.25, d: 1.5, h: 125, l: 118 },
    });
    const req = createGetRequest('http://localhost/api/marketdata?symbols=TSLA');
    const res = await route.GET(req);
    expect(res.status).toBe(200);
    const rows = await res.json();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        symbol: 'TSLA',
        price: 120.5,
        changePercent: 1.25,
        change: '+1.25%',
        high: 125,
        low: 118,
      }),
    );
  });
});
