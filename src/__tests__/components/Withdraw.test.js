import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DepositPage from '@/app/withdraw/page';
import { useRouter } from 'next/navigation';

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('DepositPage validation', () => {
  test('Display Error Message for invalid amount', async () => {
    await act(async () => {
      render(<DepositPage />);
    });

    const amountInput = screen.getByPlaceholderText(/100\.00/i);
    const form = screen.getByRole('form');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '-1' } });
      fireEvent.submit(form);
    });

    const errorMsg = await screen.findByText(
      /enter a valid amount greater than 0/i
    );
    expect(errorMsg).toBeInTheDocument();
  });

  test('Display Error Message for invalid card num', async () => {
    await act(async () => {
      render(<DepositPage />);
    });

    const input = screen.getByPlaceholderText(/1234 5678 9012 3456/i);
    const form = screen.getByRole('form');

    await act(async () => {
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.submit(form);
    });

    const errorMsg = await screen.findByText(
      /Card number must be 15 or 16 digits./i
    );
    expect(errorMsg).toBeInTheDocument();
  });

  test('Display Error Message for invalid CVV', async () => {
    await act(async () => {
      render(<DepositPage />);
    });

    const input = screen.getByPlaceholderText(/111/i);
    const form = screen.getByRole('form');

    await act(async () => {
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.submit(form);
    });

    const errorMsg = await screen.findByText(
      /CVV must be 3 or 4 digits./i
    );
    expect(errorMsg).toBeInTheDocument();
  });

  test('Display Error Message for invalid expiry date', async () => {
    await act(async () => {
      render(<DepositPage />);
    });

    const input = screen.getByPlaceholderText("MM/YY");
    const form = screen.getByRole('form');

    await act(async () => {
      fireEvent.change(input, { target: { value: '15/32' } });
      fireEvent.submit(form);
    });

    const errorMsg = await screen.findByText("Invalid month.");
    expect(errorMsg).toBeInTheDocument();
  });

});
