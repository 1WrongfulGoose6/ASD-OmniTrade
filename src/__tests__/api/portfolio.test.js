jest.mock('@/utils/prisma', () => ({
  prisma: {
    trade: {
      findMany: jest.fn(),
    },
    deposit: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/market/quotes', () => ({
  getQuotes: jest.fn(),
}));

jest.mock('@/utils/auth', () => ({
  getUserIdFromCookies: jest.fn(),
}));

const { prisma } = require('@/utils/prisma');
const { getUserIdFromCookies } = require('@/utils/auth');
const { getQuotes } = require('@/lib/market/quotes');
const { GET } = require('@/app/api/portfolio/route');

describe('GET /api/portfolio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aggregates holdings and cash correctly (F04-API-HoldingsAggregation)', async () => {
    getUserIdFromCookies.mockResolvedValue(7);
    getQuotes.mockResolvedValue([
      { symbol: 'AMD', price: 56, changePercent: 0 },
    ]);
    prisma.trade.findMany.mockResolvedValue([
      { symbol: 'amd', side: 'BUY', qty: 2, price: 50 },
      { symbol: 'AMD', side: 'BUY', qty: 3, price: 60 },
      { symbol: 'AMD', side: 'SELL', qty: 1, price: 55 },
    ]);
    prisma.deposit.findMany.mockResolvedValue([{ amount: 500, kind: 'DEPOSIT' }]);

    const res = await GET();
    expect(res.status).toBe(200);

    const payload = await res.json();
    expect(payload.holdings).toHaveLength(1);
    const holding = payload.holdings[0];
    expect(holding.symbol).toBe('AMD');
    expect(holding.shares).toBe(4);
    expect(holding.avgCost).toBeCloseTo(56);
    expect(payload.totals.cashAud).toBe(275);
    expect(payload.totals.totalValue).toBeCloseTo(224);
  });

  it('rejects unauthenticated requests (F04-API-RejectUnauthenticated)', async () => {
    getUserIdFromCookies.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('unauthorized');
  });
});
