import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home component', () => {
  it('renders without crashing', () => {
    render(<Home />);
    // If the home page renders without crashing, pass.
  });

  it('renders a "View Portfolio" link', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /View Portfolio/i })).toBeInTheDocument();
    // Check to see that the "View Portfolio" link is rendered
  });
});
