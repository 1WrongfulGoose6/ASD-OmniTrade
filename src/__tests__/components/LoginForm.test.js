// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { useRouter } from 'next/navigation';
// import LoginForm from '@/components/LoginForm';

// jest.mock('next/navigation', () => ({
//   useRouter: jest.fn(),
// }));

// jest.mock('@/components/NavBar', () => {
//   return function MockNavBar() {
//     return <nav data-testid="navbar">NavBar</nav>;
//   };
// });

// jest.mock('@/components/WaveBackground', () => {
//   return function MockWaveBackground() {
//     return <div data-testid="wave-background">Background</div>;
//   };
// });

// global.fetch = jest.fn();

// const mockPush = jest.fn();

// describe('LoginForm', () => {
//   beforeEach(() => {
//     useRouter.mockReturnValue({
//       push: mockPush,
//     });
//     fetch.mockClear();
//     mockPush.mockClear();
//     global.alert = jest.fn();
//   });

//   test('renders login form with all required fields', () => {
//     render(<LoginForm />);
    
//     expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
//     expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
//   });

//   test('updates email and password fields when typed', () => {
//     render(<LoginForm />);
    
//     const emailInput = screen.getByLabelText(/email/i);
//     const passwordInput = screen.getByLabelText(/password/i);
    
//     fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
//     expect(emailInput.value).toBe('test@example.com');
//     expect(passwordInput.value).toBe('password123');
//   });

//   test('submits form with correct credentials', async () => {
//     const mockResponse = {
//       ok: true,
//       json: jest.fn().mockResolvedValue({ success: true })
//     };
//     fetch.mockResolvedValueOnce(mockResponse);

//     render(<LoginForm />);
    
//     const emailInput = screen.getByLabelText(/email/i);
//     const passwordInput = screen.getByLabelText(/password/i);
//     const submitButton = screen.getByRole('button', { name: /log in/i });
    
//     fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'password123' } });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
//         method: 'POST',
//         headers: { 'content-type': 'application/json' },
//         body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
//       });
//     });

//     expect(mockPush).toHaveBeenCalledWith('/confirmation?msg=Login%20successful!');
//   });

//   test('shows error message on failed login', async () => {
//     const mockResponse = {
//       ok: false,
//       json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' })
//     };
//     fetch.mockResolvedValueOnce(mockResponse);

//     render(<LoginForm />);
    
//     const emailInput = screen.getByLabelText(/email/i);
//     const passwordInput = screen.getByLabelText(/password/i);
//     const submitButton = screen.getByRole('button', { name: /log in/i });
    
//     fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(global.alert).toHaveBeenCalledWith('Invalid credentials');
//     });
//   });

//   test('handles network error gracefully', async () => {
//     fetch.mockRejectedValueOnce(new Error('Network error'));

//     render(<LoginForm />);
    
//     const emailInput = screen.getByLabelText(/email/i);
//     const passwordInput = screen.getByLabelText(/password/i);
//     const submitButton = screen.getByRole('button', { name: /log in/i });
    
//     fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'password123' } });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(global.alert).toHaveBeenCalledWith('Network error');
//     });
//   });
// });