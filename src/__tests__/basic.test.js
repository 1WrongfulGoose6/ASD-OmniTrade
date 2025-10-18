import { render, screen } from '@testing-library/react';
import HomeView from '@/components/HomeView';

// Mock NavBar with a named component (has a displayName)
jest.mock('@/components/NavBar', () => {
  const MockNavBar = () => <nav data-testid="navbar" />;
  MockNavBar.displayName = 'MockNavBar';
  return { __esModule: true, default: MockNavBar };
});

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

describe('HomeView', () => {
  it('renders without crashing', () => {
    render(<HomeView news={sampleNews} />);
  });

  it('renders a "View Portfolio" link', () => {
    render(<HomeView news={sampleNews} />);
    expect(
      screen.getByRole('link', { name: /View Portfolio/i })
    ).toBeInTheDocument();
  });
});
