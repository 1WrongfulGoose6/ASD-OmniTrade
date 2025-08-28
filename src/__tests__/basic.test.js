import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home component', () => {
  it('renders without crashing', () => {
    render(<Home />);
    // If the home page renders without crashing, pass.
  });

  it('displays OmniTrade text', () => {
    render(<Home />);
    expect(screen.getByText('OmniTrade')).toBeInTheDocument();
    // Check to see that the 'OmniTrade' title is rendered
  });
});
