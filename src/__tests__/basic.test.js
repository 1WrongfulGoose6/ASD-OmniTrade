import React from 'react';
import { render, screen, act } from '@testing-library/react';

// Mock NavBar with a named component (has a displayName)
jest.mock('@/components/NavBar', () => {
  const MockNavBar = () => <nav data-testid="navbar" />;
  MockNavBar.displayName = 'MockNavBar';
  return { __esModule: true, default: MockNavBar };
});

const { default: HomeView } = require('../components/HomeView');

// Mock watchlist helpers used by HomeView's useEffect
// jest.mock('@/lib/watchlist', () => ({
//   readWatchlist: () => [],
//   addToWatchlist: jest.fn(),
//   removeFromWatchlist: jest.fn(),
//   isWatched: jest.fn(() => false),
// }));

// Minimal news payload
const sampleNews = [
  {
    id: 'n1',
    url: 'https://example.com/a',
    headline: 'Fed leaves rates unchanged',
    source: 'Reuters',
    datetime: 1710000000,
  },
  {
    id: 'n2',
    url: 'https://example.com/b',
    headline: 'Big Tech rallies',
    source: 'Bloomberg',
    datetime: 1710003600,
  },
  {
    id: 'n3',
    url: 'https://example.com/c',
    headline: 'Oil dips on demand worries',
    source: 'WSJ',
    datetime: 1710007200,
  },
];

const originalFetch = global.fetch;

const mockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => data,
});

beforeEach(() => {
  global.fetch = jest.fn(async (url) => {
    if (url.includes('/api/auth/me')) return mockResponse({ user: null });
    if (url.includes('/api/watchlist')) return mockResponse({ items: [] });
    if (url.includes('/api/marketdata')) return mockResponse([]);
    return mockResponse({});
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('HomeView', () => {
  it('renders without crashing', async () => {
    await act(async () => {
      render(<HomeView news={sampleNews} />);
    });
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders a "View Portfolio" link', async () => {
    await act(async () => {
      render(<HomeView news={sampleNews} />);
    });
    expect(
      screen.getByRole('link', { name: /View Portfolio/i })
    ).toBeInTheDocument();
  });
});
