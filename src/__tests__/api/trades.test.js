jest.mock('@/utils/prisma', () => ({
  prisma: {
    trade: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    tradeBacklog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/server/portfolio', () => ({
  getCashBalance: jest.fn(),
}));

jest.mock('@/utils/auth', () => ({
  getUserIdFromCookies: jest.fn(),
}));

const { prisma } = require('@/utils/prisma');
const { getUserIdFromCookies } = require('@/utils/auth');
const { getCashBalance } = require('@/lib/server/portfolio');
const { POST } = require('@/app/api/trades/route');
const { createJsonRequest } = require('@/test-utils/request');
const { CSRF_COOKIE_NAME } = require('@/utils/csrf');

function csrfOptions(method = 'POST') {
  const token = 'test-csrf';
  return {
    method,
    headers: { 'x-csrf-token': token },
    cookies: { [CSRF_COOKIE_NAME]: token },
  };
}

describe('POST /api/trades', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserIdFromCookies.mockResolvedValue(42);
  });

  it('allows a BUY trade when sufficient cash is available (F01-API-BuySuccess)', async () => {
    getCashBalance.mockResolvedValue({ availableCash: 1000 });
    const createdTrade = {
      id: 1,
      userId: 42,
      symbol: 'AAPL',
      side: 'BUY',
      qty: 2,
      price: 100,
      status: 'FILLED',
      createdAt: new Date().toISOString(),
    };
    prisma.trade.create.mockResolvedValue(createdTrade);
    prisma.tradeBacklog.create.mockResolvedValue({});

    const req = createJsonRequest(
      'http://localhost/api/trades',
      {
        symbol: 'aapl',
        side: 'buy',
        qty: 2,
        price: 100,
      },
      csrfOptions()
    );

    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(prisma.trade.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 42,
        symbol: 'AAPL',
        side: 'BUY',
        qty: 2,
        price: 100,
      }),
    });
    expect(prisma.tradeBacklog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 42,
          asset: 'AAPL',
          type: 'Buy',
        }),
      }),
    );
  });

  it('rejects SELL trades that exceed owned shares (F01-API-SellValidation)', async () => {
    prisma.trade.findMany.mockResolvedValue([
      { side: 'BUY', qty: 1 },
      { side: 'BUY', qty: 1 },
      { side: 'SELL', qty: 1 },
    ]);
    getCashBalance.mockResolvedValue({ availableCash: 0 });

    const req = createJsonRequest(
      'http://localhost/api/trades',
      {
        symbol: 'TSLA',
        side: 'SELL',
        qty: 5,
        price: 200,
      },
      csrfOptions()
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Not enough shares/);
    expect(prisma.trade.create).not.toHaveBeenCalled();
    expect(prisma.tradeBacklog.create).not.toHaveBeenCalled();
  });
});
