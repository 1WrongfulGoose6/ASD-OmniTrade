jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

jest.mock('@/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const bcrypt = require('bcryptjs');
const { prisma } = require('@/utils/prisma');
const { POST } = require('@/app/api/auth/register/route');
const { createJsonRequest } = require('@/test-utils/request');

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user and issues a uid cookie (F02-API-Register)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    const createdUser = { id: 1, name: null, email: 'new@example.com', createdAt: new Date().toISOString() };
    prisma.user.create.mockResolvedValue(createdUser);

    const req = createJsonRequest('http://localhost/api/auth/register', { email: 'new@example.com', password: 'Secret123!' });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.user).toEqual(createdUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'new@example.com',
        passwordHash: 'hashed-password',
      }),
      select: { id: true, name: true, email: true, createdAt: true },
    });
    const uidCookie = res.cookies.get('uid');
    expect(uidCookie).toBeDefined();
    expect(uidCookie.value).toBe(String(createdUser.id));
  });

  it('rejects duplicate registrations (F02-API-RegisterConflict)', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 2 });

    const req = createJsonRequest('http://localhost/api/auth/register', { email: 'dupe@example.com', password: 'Secret123!' });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toMatch(/already registered/);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
