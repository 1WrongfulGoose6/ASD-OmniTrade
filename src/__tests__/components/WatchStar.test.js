import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WatchStar from '@/components/WatchStar';

global.fetch = jest.fn();

describe('WatchStar', () => {
  beforeEach(() => {
    fetch.mockClear();
    
    global.window.dispatchEvent = jest.fn();

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ items: [] })
    });
  });

  test('renders star button', () => {
    render(<WatchStar symbol="AAPL" name="Apple Inc." />);
    
    const starButton = screen.getByRole('button');
    expect(starButton).toBeInTheDocument();
  });

  test('starts with unfilled star when not in watchlist', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    });

    render(<WatchStar symbol="AAPL" name="Apple Inc." />);
    
    await waitFor(() => {
      const starIcon = screen.getByRole('button').querySelector('svg');
      expect(starIcon).toHaveClass('text-blue-600');
      expect(starIcon).toHaveAttribute('fill', 'none');
    });
  });

  test('shows filled star when symbol is in watchlist', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        items: [{ symbol: 'AAPL', name: 'Apple Inc.' }] 
      }),
    });

    render(<WatchStar symbol="AAPL" name="Apple Inc." />);
    
    await waitFor(() => {
      const starIcon = screen.getByRole('button').querySelector('svg');
      expect(starIcon).toHaveClass('text-blue-600');
      expect(starIcon).toHaveAttribute('fill', 'currentColor');
    });
  });

  test('adds symbol to watchlist when clicked and not watched', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    });
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<WatchStar symbol="AAPL" name="Apple Inc." />);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const starButton = screen.getByRole('button');
    fireEvent.click(starButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ symbol: 'AAPL', name: 'Apple Inc.' }),
      });
    });
  });

  test('removes symbol from watchlist when clicked and already watched', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        items: [{ symbol: 'AAPL', name: 'Apple Inc.' }] 
      }),
    });
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<WatchStar symbol="AAPL" name="Apple Inc." />);
    
    await waitFor(() => {
      const starIcon = screen.getByRole('button').querySelector('svg');
      expect(starIcon).toHaveClass('text-blue-600');
      expect(starIcon).toHaveAttribute('fill', 'currentColor');
    });

    const starButton = screen.getByRole('button');
    fireEvent.click(starButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ symbol: 'AAPL', name: 'Apple Inc.' }),
      });
    });
  });

  test('dispatches watchlist:changed event after toggle', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    });
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<WatchStar symbol="AAPL" name="Apple Inc." />);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const starButton = screen.getByRole('button');
    fireEvent.click(starButton);

    await waitFor(() => {
      expect(global.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'watchlist:changed'
        })
      );
    });
  });

  test('handles API errors gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    });
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<WatchStar symbol="AAPL" name="Apple Inc." />);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const starButton = screen.getByRole('button');
    fireEvent.click(starButton);

    await waitFor(() => {
      const starIcon = screen.getByRole('button').querySelector('svg');
      expect(starIcon).toHaveAttribute('fill', 'none');
    });
  });
});