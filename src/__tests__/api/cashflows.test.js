jest.mock('@/utils/prisma', () => ({
  prisma: {
    deposit: {
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
const { POST: depositPost } = require('@/app/api/deposit/route');
const { POST: withdrawPost } = require('@/app/api/withdraw/route');
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

describe('Cash flow routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserIdFromCookies.mockResolvedValue(99);
  });

  it('creates a positive deposit (F05-API-DepositSuccess)', async () => {
    const now = new Date().toISOString();
    prisma.deposit.create.mockResolvedValue({ id: 1, amount: 250, createdAt: now });

    const req = createJsonRequest(
      'http://localhost/api/deposit',
      { amount: 250 },
      csrfOptions()
    );

    const res = await depositPost(req);
    expect(res.status).toBe(200);
    expect(prisma.deposit.create).toHaveBeenCalledWith({
      data: { amount: 250, kind: 'DEPOSIT', userId: 99 },
    });
    const json = await res.json();
    expect(json.amount).toBe(250);
  });

  it('prevents withdrawals that exceed balance (F05-API-WithdrawInsufficient)', async () => {
    getCashBalance.mockResolvedValue({ availableCash: 100 });

    const req = createJsonRequest(
      'http://localhost/api/withdraw',
      { amount: 150 },
      csrfOptions()
    );

    const res = await withdrawPost(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Insufficient funds/);
    expect(prisma.deposit.create).not.toHaveBeenCalled();
  });

  it('records successful withdrawals as negative deposits (F05-API-WithdrawSuccess)', async () => {
    getCashBalance.mockResolvedValue({ availableCash: 500 });
    const record = { id: 10, amount: 200, kind: 'WITHDRAW', createdAt: new Date().toISOString() };
    prisma.deposit.create.mockResolvedValue(record);

    const req = createJsonRequest(
      'http://localhost/api/withdraw',
      { amount: 200 },
      csrfOptions()
    );

    const res = await withdrawPost(req);
    expect(res.status).toBe(200);
    expect(prisma.deposit.create).toHaveBeenCalledWith({
      data: { amount: 200, kind: 'WITHDRAW', userId: 99 },
    });
    const json = await res.json();
    expect(json.amount).toBe(-200);
  });

  it('rejects unauthenticated access', async () => {
    getUserIdFromCookies.mockResolvedValueOnce(null);
    const req = createJsonRequest(
      'http://localhost/api/deposit',
      { amount: 1 },
      csrfOptions()
    );
    const res = await depositPost(req);
    expect(res.status).toBe(401);
  });
});
