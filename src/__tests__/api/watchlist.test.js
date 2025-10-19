jest.mock('@/utils/prisma', () => ({
  prisma: {
    watchlist: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/utils/auth', () => ({
  getUserIdFromCookies: jest.fn(),
}));

jest.mock('@/lib/server/watchlist', () => ({
  getWatchlistWithQuotes: jest.fn(),
}));

const { prisma } = require('@/utils/prisma');
const { getUserIdFromCookies } = require('@/utils/auth');
const { getWatchlistWithQuotes } = require('@/lib/server/watchlist');
const { GET } = require('@/app/api/watchlist/route');

describe('GET /api/watchlist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enforces authentication (F10-API-WatchlistAuth)', async () => {
    getUserIdFromCookies.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('unauthorized');
  });

  it('returns watchlist symbols merged with quotes (F10-API-WatchlistQuotes)', async () => {
    getUserIdFromCookies.mockResolvedValue(12);
    prisma.watchlist.findMany.mockResolvedValue([
      { symbol: 'msft' },
      { symbol: 'AAPL' },
    ]);
    getWatchlistWithQuotes.mockResolvedValue([
      { symbol: 'MSFT', price: 123, change: '+1%', name: 'Microsoft' },
      { symbol: 'AAPL', price: 456, change: '-1%', name: 'Apple' },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(2);
    expect(json.items[0]).toEqual(
      expect.objectContaining({ symbol: 'MSFT', price: 123, name: 'Microsoft' }),
    );
    expect(getWatchlistWithQuotes).toHaveBeenCalledWith(12);
  });
});
