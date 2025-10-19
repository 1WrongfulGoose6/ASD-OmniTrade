jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/utils/prisma', () => ({
  prisma: {
    user: {
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/utils/auth', () => ({
  getUserSession: jest.fn(),
  applySessionCookie: jest.fn(),
  createSessionToken: jest.fn().mockReturnValue('token'),
}));

const { prisma } = require('@/utils/prisma');
const { getUserSession } = require('@/utils/auth');
const { PATCH } = require('@/app/api/admin/users/[id]/route');
const { GET } = require('@/app/api/admin/users/route');
const { POST: LOGIN_POST } = require('@/app/api/auth/login/route');
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

describe('Admin user management routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blacklists a user and prevents login (F03-API-Blacklist)', async () => {
    getUserSession.mockResolvedValue({ id: 1, role: 'ADMIN' });
    const updatedUser = { id: 5, email: 'user@example.com', blacklisted: true };
    prisma.user.update.mockResolvedValue(updatedUser);

    const patchRequest = createJsonRequest(
      'http://localhost/api/admin/users/5',
      { blacklisted: true },
      csrfOptions('PATCH')
    );

    const patchRes = await PATCH(patchRequest, { params: { id: '5' } });
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.user.blacklisted).toBe(true);

    prisma.user.findUnique.mockResolvedValue({
      id: 5,
      email: 'user@example.com',
      passwordHash: 'hash',
      blacklisted: true,
    });

    const loginReq = createJsonRequest(
      'http://localhost/api/auth/login',
      {
        email: 'user@example.com',
        password: 'Secret123!',
      },
      csrfOptions('POST')
    );

    const loginRes = await LOGIN_POST(loginReq);
    expect(loginRes.status).toBe(403);
    const loginJson = await loginRes.json();
    expect(loginJson.error).toMatch(/blacklisted/i);
  });

  it('requires authentication to list users (F03-API-UsersAuthGuard)', async () => {
    getUserSession.mockResolvedValueOnce(null);

    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/not authenticated/i);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });
});
