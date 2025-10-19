import { getCache, setCache, fetchJsonCached } from '@/lib/mcache';

describe('mcache utilities', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores and retrieves cached values with TTL (F13-Unit-CachingLayer)', () => {
    const originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(1000);
    setCache('foo', { answer: 42 }, 10);
    expect(getCache('foo')).toEqual({ answer: 42 });

    Date.now.mockReturnValue(1010);
    expect(getCache('foo')).toEqual({ answer: 42 });

    Date.now.mockReturnValue(1021);
    expect(getCache('foo')).toBeNull();
    Date.now = originalNow;
  });

  it('fetchJsonCached caches GET responses', async () => {
    const originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(2000);
    const originalFetch = global.fetch;
    const mockFetch = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ hello: 'world' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    global.fetch = mockFetch;

    const url = 'https://example.com/api/data';
    const first = await fetchJsonCached(url, { ttlMs: 1000 });
    expect(first.fromCache).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const second = await fetchJsonCached(url, { ttlMs: 1000 });
    expect(second.fromCache).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    Date.now.mockReturnValue(4005);
    const third = await fetchJsonCached(url, { ttlMs: 1000 });
    expect(third.fromCache).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    global.fetch = originalFetch;
    Date.now = originalNow;
  });
});
