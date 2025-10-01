import React from 'react';
import { render, screen } from '@testing-library/react';
import HomeView from '../components/HomeView';

describe('HomeView', () => {
  const baseProps = { news: [] };

  it('renders without crashing', () => {
    render(<HomeView {...baseProps} />);
  });

  it('shows the "View Portfolio" link', () => {
    render(<HomeView {...baseProps} />);
    expect(
      screen.getByRole('link', { name: /View Portfolio/i })
    ).toBeInTheDocument();
  });

  it('renders the Market News section heading', () => {
    render(<HomeView {...baseProps} />);
    expect(screen.getByText(/Market News/i)).toBeInTheDocument();
  });
});
