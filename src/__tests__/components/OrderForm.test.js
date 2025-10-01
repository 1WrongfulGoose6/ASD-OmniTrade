import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderForm from '@/components/OrderForm';

global.fetch = jest.fn();

describe('OrderForm', () => {
  beforeEach(() => {
    fetch.mockClear();
    global.alert = jest.fn();
  });

  test('renders order form with default values', () => {
    render(<OrderForm symbol="AAPL" price={150.50} />);
    
    expect(screen.getByText(/place order • aapl/i)).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.some(button => button.textContent === 'Buy')).toBe(true);
    expect(buttons.some(button => button.textContent === 'Sell')).toBe(true);
    expect(screen.getByDisplayValue('Market')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place buy order/i })).toBeInTheDocument();
  });

  test('switches between buy and sell', () => {
    render(<OrderForm symbol="AAPL" price={150.50} />);
    
    const buttons = screen.getAllByRole('button');
    const sellButton = buttons.find(button => button.textContent === 'Sell');
    fireEvent.click(sellButton);
    
    expect(screen.getByRole('button', { name: /place sell order/i })).toBeInTheDocument();
  });

  test('changes order type from market to limit', () => {
    render(<OrderForm symbol="AAPL" price={150.50} />);
    
    const orderTypeSelect = screen.getByDisplayValue('Market');
    fireEvent.change(orderTypeSelect, { target: { value: 'Limit' } });
    
    expect(screen.getByDisplayValue('Limit')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter price/i)).toBeInTheDocument();
  });

  test('updates quantity input', () => {
    render(<OrderForm symbol="AAPL" price={150.50} />);
    
    const quantityInput = screen.getByPlaceholderText(/e\.g\. 1\.5/i);
    fireEvent.change(quantityInput, { target: { value: '10' } });
    
    expect(quantityInput.value).toBe('10');
  });

  test('submits market buy order successfully', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true })
    };
    fetch.mockResolvedValueOnce(mockResponse);

    render(<OrderForm symbol="AAPL" price={150.50} />);
    
    const quantityInput = screen.getByPlaceholderText(/e\.g\. 1\.5/i);
    const submitButton = screen.getByRole('button', { name: /place buy order/i });
    
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/trades', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          symbol: 'AAPL',
          side: 'BUY',
          qty: 10,
          price: 150.50,
        }),
      });
    });

    expect(global.alert).toHaveBeenCalledWith('Trade submitted: Buy 10 AAPL @ 150.5');
  });

  test('submits limit sell order successfully', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true })
    };
    fetch.mockResolvedValueOnce(mockResponse);

    render(<OrderForm symbol="TSLA" price={200.00} />);
    
    const buttons = screen.getAllByRole('button');
    const sellButton = buttons.find(button => button.textContent === 'Sell');
    const orderTypeSelect = screen.getByDisplayValue('Market');
    const quantityInput = screen.getByPlaceholderText(/e\.g\. 1\.5/i);
    
    fireEvent.click(sellButton);
    fireEvent.change(orderTypeSelect, { target: { value: 'Limit' } });
    fireEvent.change(quantityInput, { target: { value: '5' } });
    
    const limitPriceInput = screen.getByPlaceholderText(/enter price/i);
    fireEvent.change(limitPriceInput, { target: { value: '205.00' } });
    
    const submitButton = screen.getByRole('button', { name: /place sell order/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/trades', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          symbol: 'TSLA',
          side: 'SELL',
          qty: 5,
          price: 205.00,
        }),
      });
    });
  });

  test('shows error for invalid quantity', async () => {
    render(<OrderForm symbol="AAPL" price={150.50} />);
    
    const submitButton = screen.getByRole('button', { name: /place buy order/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Enter a valid share quantity');
    });
  });

  test('shows error when order fails', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: 'Insufficient funds' })
    };
    fetch.mockResolvedValueOnce(mockResponse);

    render(<OrderForm symbol="AAPL" price={150.50} />);
    
    const quantityInput = screen.getByPlaceholderText(/e\.g\. 1\.5/i);
    const submitButton = screen.getByRole('button', { name: /place buy order/i });
    
    fireEvent.change(quantityInput, { target: { value: '1000' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Insufficient funds');
    });
  });

  test('shows login prompt for unauthorized user', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ error: 'Unauthorized' })
    };
    fetch.mockResolvedValueOnce(mockResponse);

    render(<OrderForm symbol="AAPL" price={150.50} />);
    
    const quantityInput = screen.getByPlaceholderText(/e\.g\. 1\.5/i);
    const submitButton = screen.getByRole('button', { name: /place buy order/i });
    
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Please log in to place trades.');
    });
  });
});